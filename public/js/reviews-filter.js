(function () {
  var buttons = document.querySelectorAll("[data-filter-btn]");
  var cards = document.querySelectorAll("[data-post-card]");
  var sections = document.querySelectorAll("[data-review-section]");
  var sortSelect = document.querySelector("[data-sort-select]");

  if (!buttons.length || !cards.length) return;

  // Collect all review data up-front from the DOM (before any JS mutation)
  var allReviews = [];
  var seenHrefs = {};
  Array.prototype.forEach.call(cards, function (card) {
    var href = card.getAttribute("href") || "";
    if (seenHrefs[href]) return;
    seenHrefs[href] = true;
    allReviews.push({
      href: href,
      title: card.dataset.title || "",
      date: card.dataset.date || "",
      genres: (card.dataset.genres || "").split(",").filter(Boolean),
      platforms: (card.dataset.platforms || "").split(",").filter(Boolean),
      year: card.dataset.year || "",
      blurb: card.dataset.blurb || "",
      heroImage: card.dataset.heroImage || "",
    });
  });
  // Sort newest-first as default
  allReviews.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

  // Multi-select active filters: OR within a type, AND across types
  var activeFilters = { genre: [], platform: [], year: [] };

  function matchesFilters(card) {
    var genres = (card.dataset.genres || "").split(",").filter(Boolean);
    var platforms = (card.dataset.platforms || "").split(",").filter(Boolean);
    var year = card.dataset.year || "";

    if (activeFilters.genre.length > 0) {
      var hasGenre = activeFilters.genre.some(function (g) { return genres.indexOf(g) !== -1; });
      if (!hasGenre) return false;
    }
    if (activeFilters.platform.length > 0) {
      var hasPlatform = activeFilters.platform.some(function (p) { return platforms.indexOf(p) !== -1; });
      if (!hasPlatform) return false;
    }
    if (activeFilters.year.length > 0) {
      if (activeFilters.year.indexOf(year) === -1) return false;
    }
    return true;
  }

  function matchesFiltersData(review) {
    if (activeFilters.genre.length > 0) {
      var hasGenre = activeFilters.genre.some(function (g) { return review.genres.indexOf(g) !== -1; });
      if (!hasGenre) return false;
    }
    if (activeFilters.platform.length > 0) {
      var hasPlatform = activeFilters.platform.some(function (p) { return review.platforms.indexOf(p) !== -1; });
      if (!hasPlatform) return false;
    }
    if (activeFilters.year.length > 0) {
      if (activeFilters.year.indexOf(review.year) === -1) return false;
    }
    return true;
  }

  function isFiltered() {
    return activeFilters.genre.length > 0 || activeFilters.platform.length > 0 || activeFilters.year.length > 0;
  }

  // ---- Featured reassignment ----

  var featuredSection = document.querySelector(".featured[data-review-section]");
  var heroCard = featuredSection ? featuredSection.querySelector(".featured-card-hero") : null;
  var tileCards = featuredSection ? Array.prototype.slice.call(featuredSection.querySelectorAll(".featured-card-tile")) : [];

  function getImgEl(cardEl) {
    return cardEl ? cardEl.querySelector("img") : null;
  }

  function updateFeaturedCard(cardEl, review, isHero) {
    if (!cardEl || !review) return;

    cardEl.setAttribute("href", review.href);
    cardEl.dataset.genres = review.genres.join(",");
    cardEl.dataset.platforms = review.platforms.join(",");
    cardEl.dataset.year = review.year;
    cardEl.dataset.title = review.title;
    cardEl.dataset.date = review.date;

    var titleEl = cardEl.querySelector(".featured-title");
    if (titleEl) titleEl.textContent = review.title;

    var dateEl = cardEl.querySelector(".featured-date");
    if (dateEl) {
      var d = new Date(review.date);
      if (isHero) {
        var timeEl = dateEl.querySelector("time");
        if (timeEl) {
          timeEl.setAttribute("datetime", review.date);
          timeEl.textContent = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        }
      } else {
        dateEl.textContent = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    }

    if (isHero) {
      var summaryEl = cardEl.querySelector(".featured-summary");
      if (summaryEl) summaryEl.textContent = review.blurb;
    }

    var imgEl = getImgEl(cardEl);
    if (imgEl && review.heroImage) {
      imgEl.src = review.heroImage;
      imgEl.alt = review.title;
    }
  }

  function rebuildFeatured(matchingReviews) {
    if (!featuredSection) return;

    var slots = [heroCard].concat(tileCards).filter(Boolean);
    var used = {};

    for (var i = 0; i < slots.length; i++) {
      var review = matchingReviews[i] || null;
      if (review) {
        used[review.href] = true;
        updateFeaturedCard(slots[i], review, i === 0);
        slots[i].hidden = false;
      } else {
        slots[i].hidden = true;
      }
    }

    // Show/hide featured section itself
    var hasVisible = slots.some(function (s) { return !s.hidden; });
    featuredSection.hidden = !hasVisible;

    return used;
  }

  // ---- Grid span fix ----

  function fixGridSpans(section) {
    var gridCards = Array.prototype.slice.call(section.querySelectorAll(".article-card-grid"));
    var visible = gridCards.filter(function (c) { return !c.hidden; });
    gridCards.forEach(function (c) { c.style.gridColumn = ""; });
    if (visible.length % 2 !== 0) {
      visible[visible.length - 1].style.gridColumn = "span 2";
    }
  }

  // ---- Sort helper ----

  function getSortedReviews() {
    var value = sortSelect ? sortSelect.value : "newest";
    var sorted = allReviews.slice();
    sorted.sort(function (a, b) {
      switch (value) {
        case "newest": return new Date(b.date) - new Date(a.date);
        case "oldest": return new Date(a.date) - new Date(b.date);
        case "az": return a.title.localeCompare(b.title);
        case "za": return b.title.localeCompare(a.title);
        default: return 0;
      }
    });
    return sorted;
  }

  // ---- Main apply function ----

  function apply() {
    var sortedReviews = getSortedReviews();
    var filtered = sortedReviews.filter(matchesFiltersData);

    // Rebuild featured with top 3 matching
    var inFeatured = rebuildFeatured(filtered.slice(0, 3));

    // Hide/show cards in below sections (excluding featured cards)
    Array.prototype.forEach.call(cards, function (card) {
      var href = card.getAttribute("href") || "";
      var isFeaturedCard = card.classList.contains("featured-card");
      if (isFeaturedCard) return; // featured section handles itself

      var matches = matchesFilters(card);
      var isDuplicate = inFeatured && inFeatured[href];
      card.hidden = !matches || isDuplicate;
    });

    // Show/hide non-featured sections
    Array.prototype.forEach.call(sections, function (section) {
      if (section === featuredSection) return;
      var visibleCards = section.querySelectorAll("[data-post-card]:not([hidden])");
      section.hidden = visibleCards.length === 0;
      fixGridSpans(section);
    });
  }

  function reset() {
    // Restore featured to original first 3 reviews
    rebuildFeatured(allReviews.slice(0, 3));

    Array.prototype.forEach.call(cards, function (card) {
      card.hidden = false;
      card.style.gridColumn = "";
    });
    Array.prototype.forEach.call(sections, function (section) {
      section.hidden = false;
    });
  }

  // ---- Button click handler ----

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var type = btn.dataset.filterType;
      var value = btn.dataset.filterValue || "";

      if (type === "all") {
        // Clear all filters
        activeFilters = { genre: [], platform: [], year: [] };
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        reset();
        return;
      }

      // Toggle this filter value in the array
      var list = activeFilters[type];
      if (!list) { activeFilters[type] = [value]; }
      else {
        var idx = list.indexOf(value);
        if (idx === -1) { list.push(value); }
        else { list.splice(idx, 1); }
      }

      // Update button active states
      btn.classList.toggle("active", activeFilters[type].indexOf(value) !== -1);

      // If all filters cleared, also re-activate "All" button
      if (!isFiltered()) {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        var allBtn = document.querySelector("[data-filter-btn][data-filter-type='all']");
        if (allBtn) allBtn.classList.add("active");
        reset();
      } else {
        // Deactivate "All" button
        var allBtn = document.querySelector("[data-filter-btn][data-filter-type='all']");
        if (allBtn) allBtn.classList.remove("active");
        apply();
      }
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      if (isFiltered()) {
        apply();
      } else {
        // Re-sort featured when no filters active
        rebuildFeatured(getSortedReviews().slice(0, 3));
      }
    });
  }
})();
