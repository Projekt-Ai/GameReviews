// Spoiler settings for the boss features index. The page is built with every game at
// DEFAULT_SETTING, so this only re-renders games whose saved setting differs.
// Settings: 0 = hide all, 1-4 = highest level shown (Light, Mild, Heavy, Finale).
// The same storage key is read by BossFeatureLayout.astro on article pages.
(function () {
  var STORAGE_KEY = "bossSpoilerSettings";
  var DEFAULT_SETTING = 1;
  var SETTING_NAMES = ["Hide all", "Light", "Mild", "Heavy", "Finale"];

  function loadSettings() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveSettings(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {}
  }

  function settingFor(game) {
    var v = settings[game];
    return typeof v === "number" ? v : DEFAULT_SETTING;
  }

  function stateFor(level, setting) {
    if (setting === 0) return "hidden";
    if (level <= setting) return "shown";
    if (level === setting + 1) return "covered";
    return "hidden";
  }

  function setContent(card, on) {
    var content = card.querySelector("[data-spoiler-content]");
    var tpl = card.querySelector("[data-spoiler-template]");
    if (!content || !tpl) return;
    content.innerHTML = "";
    if (on) content.appendChild(tpl.content.cloneNode(true));
  }

  function setRevealed(card, on) {
    var btn = card.querySelector("[data-spoiler-reveal]");
    setContent(card, on);
    card.classList.toggle("bf-gate-revealed", on);
    if (btn) {
      btn.setAttribute("aria-expanded", on ? "true" : "false");
      btn.textContent = on ? "Hide" : "Reveal";
    }
  }

  function renderCard(card, setting) {
    var level = parseInt(card.getAttribute("data-spoiler-level"), 10);
    var state = stateFor(level, setting);
    var cover = card.querySelector("[data-spoiler-cover]");

    card.hidden = state === "hidden";
    if (!cover) return; // Light cards have no cover; their content is always in the page
    cover.hidden = state !== "covered";
    setRevealed(card, false);
    setContent(card, state === "shown");
  }

  function renderGame(game) {
    var setting = settingFor(game);
    var cards = document.querySelectorAll("[data-spoiler-card]");
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].getAttribute("data-spoiler-game") === game) renderCard(cards[i], setting);
    }
  }

  function updateCounts() {
    var cards = document.querySelectorAll("[data-spoiler-card]");
    var visible = 0;
    for (var i = 0; i < cards.length; i++) {
      if (!cards[i].hidden) visible++;
    }

    var count = document.querySelector("[data-spoiler-count]");
    if (count) count.textContent = visible + (visible === 1 ? " essay" : " essays");

    var sections = document.querySelectorAll("[data-spoiler-section]");
    for (var j = 0; j < sections.length; j++) {
      sections[j].hidden = !sections[j].querySelector("[data-spoiler-card]:not([hidden])");
    }

    var empty = document.querySelector("[data-spoiler-empty]");
    if (empty) empty.hidden = visible > 0 || cards.length === 0;
  }

  function syncPanelCard(panelCard, value) {
    panelCard.setAttribute("data-comfort", String(value));

    var levelEl = panelCard.querySelector("[data-spoiler-card-level]");
    if (levelEl) levelEl.textContent = SETTING_NAMES[value] || SETTING_NAMES[DEFAULT_SETTING];

    var bars = panelCard.querySelectorAll(".spoiler-bar");
    for (var i = 0; i < bars.length; i++) {
      bars[i].classList.toggle("active", i < value);
    }

    var options = panelCard.querySelectorAll(".spoiler-option");
    for (var k = 0; k < options.length; k++) {
      options[k].classList.toggle("active", options[k].getAttribute("data-spoiler-value") === String(value));
    }
  }

  function closeAllDropdowns() {
    var dropdowns = document.querySelectorAll(".spoiler-card-dropdown");
    for (var i = 0; i < dropdowns.length; i++) {
      dropdowns[i].hidden = true;
      dropdowns[i].parentElement.classList.remove("spoiler-card-open");
    }
  }

  var settings = loadSettings();
  var panelCards = document.querySelectorAll("[data-spoiler-select]");

  for (var p = 0; p < panelCards.length; p++) {
    var game = panelCards[p].getAttribute("data-spoiler-select");
    if (settingFor(game) !== DEFAULT_SETTING) {
      syncPanelCard(panelCards[p], settingFor(game));
      renderGame(game);
    }
  }
  updateCounts();

  for (var q = 0; q < panelCards.length; q++) {
    (function (panelCard) {
      var game = panelCard.getAttribute("data-spoiler-select");

      panelCard.addEventListener("click", function (e) {
        if (e.target.closest(".spoiler-card-dropdown")) return;
        var dropdown = panelCard.querySelector(".spoiler-card-dropdown");
        var wasOpen = !dropdown.hidden;
        closeAllDropdowns();
        if (!wasOpen) {
          dropdown.hidden = false;
          panelCard.classList.add("spoiler-card-open");
        }
      });

      var options = panelCard.querySelectorAll(".spoiler-option");
      for (var j = 0; j < options.length; j++) {
        options[j].addEventListener("click", function (e) {
          e.stopPropagation();
          var value = parseInt(this.getAttribute("data-spoiler-value"), 10);
          if (value === DEFAULT_SETTING) delete settings[game];
          else settings[game] = value;
          saveSettings(settings);
          syncPanelCard(panelCard, value);
          renderGame(game);
          updateCounts();
          closeAllDropdowns();
        });
      }
    })(panelCards[q]);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-spoiler-reveal]");
    if (btn) {
      var card = btn.closest("[data-spoiler-card]");
      setRevealed(card, btn.getAttribute("aria-expanded") !== "true");
      return;
    }
    if (!e.target.closest("[data-spoiler-select]")) closeAllDropdowns();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllDropdowns();
  });

  var resetBtn = document.querySelector("[data-spoiler-reset]");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      settings = {};
      saveSettings(settings);
      for (var i = 0; i < panelCards.length; i++) {
        syncPanelCard(panelCards[i], DEFAULT_SETTING);
        renderGame(panelCards[i].getAttribute("data-spoiler-select"));
      }
      updateCounts();
    });
  }
})();
