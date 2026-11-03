(function () {
  var STORAGE_KEY = "bossSpoilerThresholds";
  var MILD = 2;
  var LEVEL_NAMES = { "-1": "None", "1": "Light", "2": "Mild", "3": "Heavy", "4": "Finale" };

  function loadThresholds() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveThresholds(t) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
    } catch (e) {}
  }

  function applyAll(thresholds) {
    var cards = document.querySelectorAll("[data-spoiler-card]");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var game = card.getAttribute("data-spoiler-game");
      var level = parseInt(card.getAttribute("data-spoiler-level"), 10);
      var threshold = thresholds[game];
      var hasSelection = threshold !== undefined && threshold !== -1;
      var targets = card.querySelectorAll("[data-spoiler-target]");

      if (level < MILD) {
        card.classList.remove("spoiler-hidden");
        for (var j = 0; j < targets.length; j++) {
          targets[j].classList.remove("spoiler");
        }
        continue;
      }

      if (!hasSelection) {
        card.classList.add("spoiler-hidden");
        for (var j = 0; j < targets.length; j++) {
          targets[j].classList.remove("spoiler");
        }
        continue;
      }

      if (level > threshold) {
        card.classList.add("spoiler-hidden");
        for (var j = 0; j < targets.length; j++) {
          targets[j].classList.remove("spoiler");
        }
        continue;
      }

      card.classList.remove("spoiler-hidden");
      var shouldBlur = level === threshold;
      for (var j = 0; j < targets.length; j++) {
        if (shouldBlur) {
          targets[j].classList.add("spoiler");
        } else {
          targets[j].classList.remove("spoiler");
        }
      }
    }
  }

  var BAR_COUNTS = { "-1": 0, "1": 1, "2": 2, "3": 3, "4": 4 };

  function syncCard(cardEl, value) {
    cardEl.setAttribute("data-comfort", String(value));

    var levelEl = cardEl.querySelector("[data-spoiler-card-level]");
    if (levelEl) levelEl.textContent = LEVEL_NAMES[String(value)] || "None";

    var bars = cardEl.querySelectorAll(".spoiler-bar");
    var activeBars = BAR_COUNTS[String(value)] || 0;
    for (var i = 0; i < bars.length; i++) {
      if (i < activeBars) {
        bars[i].classList.add("active");
      } else {
        bars[i].classList.remove("active");
      }
    }

    var options = cardEl.querySelectorAll(".spoiler-option");
    for (var i = 0; i < options.length; i++) {
      var optVal = options[i].getAttribute("data-spoiler-value");
      if (optVal === String(value)) {
        options[i].classList.add("active");
      } else {
        options[i].classList.remove("active");
      }
    }
  }

  function closeAllDropdowns() {
    var dropdowns = document.querySelectorAll(".spoiler-card-dropdown");
    for (var i = 0; i < dropdowns.length; i++) {
      dropdowns[i].hidden = true;
      dropdowns[i].parentElement.classList.remove("spoiler-card-open");
    }
  }

  var thresholds = loadThresholds();
  var gameCards = document.querySelectorAll("[data-spoiler-select]");

  for (var i = 0; i < gameCards.length; i++) {
    var card = gameCards[i];
    var game = card.getAttribute("data-spoiler-select");
    var stored = thresholds[game];
    syncCard(card, stored !== undefined ? stored : -1);
  }

  applyAll(thresholds);

  for (var i = 0; i < gameCards.length; i++) {
    (function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest(".spoiler-card-dropdown")) return;
        var dropdown = card.querySelector(".spoiler-card-dropdown");
        var isOpen = !dropdown.hidden;
        closeAllDropdowns();
        if (!isOpen) {
          dropdown.hidden = false;
          card.classList.add("spoiler-card-open");
        }
      });

      var options = card.querySelectorAll(".spoiler-option");
      for (var j = 0; j < options.length; j++) {
        options[j].addEventListener("click", function (e) {
          e.stopPropagation();
          var game = card.getAttribute("data-spoiler-select");
          var val = parseInt(this.getAttribute("data-spoiler-value"), 10);
          if (val === -1) {
            delete thresholds[game];
          } else {
            thresholds[game] = val;
          }
          saveThresholds(thresholds);
          syncCard(card, val);
          applyAll(thresholds);
          closeAllDropdowns();
        });
      }
    })(gameCards[i]);
  }

  var resetBtn = document.querySelector("[data-spoiler-reset]");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      thresholds = {};
      saveThresholds(thresholds);
      for (var i = 0; i < gameCards.length; i++) {
        syncCard(gameCards[i], -1);
      }
      applyAll(thresholds);
    });
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-spoiler-select]")) {
      closeAllDropdowns();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllDropdowns();
  });
})();
