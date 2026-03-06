(function () {
  var buttons = document.querySelectorAll("[data-filter-btn]");
  var cards = document.querySelectorAll("[data-post-card]");
  var sections = document.querySelectorAll("[data-review-section]");
  var sortSelect = document.querySelector("[data-sort-select]");
  var column = document.querySelector("[data-reviews-column]");

  if (!buttons.length || !cards.length) return;

  var activeFilter = { type: "all", value: "" };

  function matchesFilter(card) {
    if (activeFilter.type === "all") return true;
    var value = activeFilter.value;
    if (activeFilter.type === "genre") {
      return (card.dataset.genres || "").split(",").indexOf(value) !== -1;
    }
    if (activeFilter.type === "platform") {
      return (card.dataset.platforms || "").split(",").indexOf(value) !== -1;
    }
    if (activeFilter.type === "year") {
      return card.dataset.year === value;
    }
    return true;
  }

  function applyFilter() {
    cards.forEach(function (card) {
      card.hidden = !matchesFilter(card);
    });

    sections.forEach(function (section) {
      var visibleCards = section.querySelectorAll("[data-post-card]:not([hidden])");
      section.hidden = visibleCards.length === 0;
    });
  }

  function applySort() {
    if (!sortSelect || !column) return;
    var value = sortSelect.value;

    // Collect all visible cards with their parent sections
    var allCards = Array.prototype.slice.call(cards);

    allCards.sort(function (a, b) {
      switch (value) {
        case "newest":
          return new Date(b.dataset.date) - new Date(a.dataset.date);
        case "oldest":
          return new Date(a.dataset.date) - new Date(b.dataset.date);
        case "az":
          return (a.dataset.title || "").localeCompare(b.dataset.title || "");
        case "za":
          return (b.dataset.title || "").localeCompare(a.dataset.title || "");
        default:
          return 0;
      }
    });

    // When sorting non-default or filtering, flatten into a single compact list
    if (value !== "newest" || activeFilter.type !== "all") {
      showFlatView(allCards);
    } else {
      restoreDefaultView();
    }
  }

  // Store original HTML so we can restore it
  var originalHTML = column ? column.innerHTML : "";

  function showFlatView(sortedCards) {
    if (!column) return;

    // Hide all sections
    sections.forEach(function (s) { s.hidden = true; });

    // Find or create the flat list container
    var flatList = column.querySelector("[data-flat-list]");
    if (!flatList) {
      flatList = document.createElement("div");
      flatList.setAttribute("data-flat-list", "");
      flatList.className = "compact-list";
      flatList.style.border = "1px solid rgba(196, 180, 232, 0.14)";
      flatList.style.background = "rgba(11, 7, 22, 0.3)";
      column.appendChild(flatList);
    }

    flatList.innerHTML = "";
    var count = 0;

    sortedCards.forEach(function (card) {
      if (card.hidden) return;
      count++;
      var item = document.createElement("a");
      item.href = card.getAttribute("href") || card.closest("a") && card.closest("a").href || "#";
      item.className = "compact-item";
      item.setAttribute("data-post-card", "");
      // Copy data attributes
      item.dataset.genres = card.dataset.genres || "";
      item.dataset.platforms = card.dataset.platforms || "";
      item.dataset.year = card.dataset.year || "";
      item.dataset.title = card.dataset.title || "";
      item.dataset.date = card.dataset.date || "";

      var num = document.createElement("span");
      num.className = "compact-num";
      num.textContent = String(count).padStart(2, "0");

      var main = document.createElement("div");
      main.className = "compact-main";

      var title = document.createElement("div");
      title.className = "compact-title";
      title.textContent = card.dataset.title || "";

      var sub = document.createElement("div");
      sub.className = "compact-sub";
      var genres = (card.dataset.genres || "").split(",").filter(Boolean);
      var dateStr = card.dataset.date ? new Date(card.dataset.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
      sub.textContent = (genres[0] || "Review") + " / " + dateStr;

      main.appendChild(title);
      main.appendChild(sub);
      item.appendChild(num);
      item.appendChild(main);
      flatList.appendChild(item);
    });

    flatList.hidden = count === 0;
  }

  function restoreDefaultView() {
    if (!column) return;
    var flatList = column.querySelector("[data-flat-list]");
    if (flatList) {
      flatList.remove();
    }
    // Restore sections and re-query
    sections.forEach(function (s) { s.hidden = false; });
    cards.forEach(function (card) { card.hidden = false; });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      buttons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeFilter = {
        type: btn.dataset.filterType,
        value: btn.dataset.filterValue || "",
      };

      if (activeFilter.type === "all" && sortSelect && sortSelect.value === "newest") {
        restoreDefaultView();
      } else {
        applyFilter();
        applySort();
      }
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      if (activeFilter.type === "all" && sortSelect.value === "newest") {
        restoreDefaultView();
      } else {
        applyFilter();
        applySort();
      }
    });
  }
})();