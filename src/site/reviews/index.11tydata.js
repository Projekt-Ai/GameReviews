import path from "node:path";
import { renderImage } from "../_lib/images.js";
import { formatDate, formatMonthYear, token } from "../_lib/page-utils.js";

// Local placeholder images used for mock review cards while real content is being built out.
const placeholder1 = { fsPath: path.resolve(process.cwd(), "src/assets/blog-placeholder-1.jpg"), url: "/assets/blog-placeholder-1.jpg" };
const placeholder2 = { fsPath: path.resolve(process.cwd(), "src/assets/blog-placeholder-2.jpg"), url: "/assets/blog-placeholder-2.jpg" };
const placeholder3 = { fsPath: path.resolve(process.cwd(), "src/assets/blog-placeholder-3.jpg"), url: "/assets/blog-placeholder-3.jpg" };
const placeholder4 = { fsPath: path.resolve(process.cwd(), "src/assets/blog-placeholder-4.jpg"), url: "/assets/blog-placeholder-4.jpg" };
const placeholder5 = { fsPath: path.resolve(process.cwd(), "src/assets/blog-placeholder-5.jpg"), url: "/assets/blog-placeholder-5.jpg" };

// Mock entries let the archive layout be designed/populated before the full review backlog exists.
const mockPosts = [
  { id: "mock-ender-magnolia", mock: true, data: { title: "ENDER MAGNOLIA: Bloom in the Mist", description: "The metroidvania that finally started to click for me - mostly.", pubDate: new Date("2025-03-12"), heroImageRef: placeholder2, genres: ["Metroidvania", "Action RPG"], platforms: [{ name: "Steam", played: true }, { name: "PS5" }], blurb: "Great atmosphere, uneven momentum, but enough elegance to keep me in.", draft: false } },
  { id: "mock-rebirth", mock: true, data: { title: "Final Fantasy VII Rebirth", description: "A huge, messy, expensive game that wins on sincerity more than discipline.", pubDate: new Date("2025-01-28"), heroImageRef: placeholder4, genres: ["Action RPG", "Open World"], platforms: [{ name: "PS5", played: true }], blurb: "A slower start than expected, but the production confidence carries it.", draft: false } },
  { id: "mock-demonschool", mock: true, data: { title: "Demonschool", description: "The tactical loop is repetitive in spots, but the cast keeps it alive.", pubDate: new Date("2025-02-09"), heroImageRef: placeholder3, genres: ["Strategy RPG", "Turn-Based"], platforms: [{ name: "Steam", played: true }], draft: false } },
  { id: "mock-lies-of-p", mock: true, data: { title: "Lies of P", description: "An impressively controlled soulslike with a few mechanical habits I never loved.", pubDate: new Date("2024-10-04"), heroImageRef: placeholder1, genres: ["Soulslike", "Action RPG"], platforms: [{ name: "Steam", played: true }, { name: "PS5" }], draft: false } },
  { id: "mock-astro-bot", mock: true, data: { title: "Astro Bot", description: "A joyful platformer that understands pace better than most prestige games.", pubDate: new Date("2024-11-15"), heroImageRef: placeholder5, genres: ["Platformer", "Action Adventure"], platforms: [{ name: "PS5", played: true }], draft: false } },
  { id: "mock-p3r", mock: true, data: { title: "Persona 3 Reload", description: "Stylish and smoother to play, but still wrestling with the bones of the original.", pubDate: new Date("2024-08-21"), heroImageRef: placeholder3, genres: ["Turn-Based", "RPG"], platforms: [{ name: "Steam", played: true }, { name: "PC Game Pass", played: true }], draft: false } },
  { id: "mock-erdtree", mock: true, data: { title: "Elden Ring: Shadow of the Erdtree", description: "Brilliant highs, exhausting lows, and no interest in compromise.", pubDate: new Date("2024-06-29"), heroImageRef: placeholder4, genres: ["Action RPG", "Soulslike"], platforms: [{ name: "Steam", played: true }], draft: false } },
  { id: "mock-bg3", mock: true, data: { title: "Baldur's Gate 3", description: "Ambition in every direction, with enough friction to make the victories feel earned.", pubDate: new Date("2024-02-18"), heroImageRef: placeholder2, genres: ["CRPG", "Turn-Based"], platforms: [{ name: "PS5", played: true }, { name: "Steam" }], draft: false } },
  { id: "mock-armored-core-vi", mock: true, data: { title: "Armored Core VI: Fires of Rubicon", description: "Precision, velocity, and mission design that actually respects your time.", pubDate: new Date("2023-12-03"), heroImageRef: placeholder5, genres: ["Action", "Mech"], platforms: [{ name: "Steam", played: true }], draft: false } },
  { id: "mock-starfield", mock: true, data: { title: "Starfield", description: "A game I admire more in memory than I did while actively playing it.", pubDate: new Date("2023-10-17"), heroImageRef: placeholder1, genres: ["RPG", "Open World"], platforms: [{ name: "Xbox Series X/S", played: true }, { name: "PC Game Pass", played: true }], draft: false } },
  { id: "mock-ffxvi", mock: true, data: { title: "Final Fantasy XVI", description: "Spectacle-first storytelling with combat that takes too long to show its depth.", pubDate: new Date("2023-07-09"), heroImageRef: placeholder4, genres: ["Action RPG"], platforms: [{ name: "PS5", played: true }], draft: true } },
  { id: "mock-pikmin-4", mock: true, data: { title: "Pikmin 4", description: "A strategy game that is at its best when it lets tiny disasters spiral.", pubDate: new Date("2023-08-04"), heroImageRef: placeholder2, genres: ["Strategy", "Adventure"], platforms: [{ name: "Switch", played: true }], draft: false } },
  { id: "mock-sea-of-stars", mock: true, data: { title: "Sea of Stars", description: "Beautiful craft, sharp pacing, and a story that never fully landed for me.", pubDate: new Date("2023-09-02"), heroImageRef: placeholder3, genres: ["Turn-Based", "RPG"], platforms: [{ name: "Steam", played: true }, { name: "Switch" }], draft: false } },
  { id: "mock-triangle-strategy", mock: true, data: { title: "Triangle Strategy", description: "Long-winded, deliberate, and absolutely my kind of problem.", pubDate: new Date("2022-11-20"), heroImageRef: placeholder5, genres: ["Strategy RPG", "Turn-Based"], platforms: [{ name: "Switch", played: true }, { name: "Steam" }], draft: false } },
  { id: "mock-kirby-forgotten-land", mock: true, data: { title: "Kirby and the Forgotten Land", description: "Playful, smartly scoped, and one of the easiest recommendations on this page.", pubDate: new Date("2022-04-14"), heroImageRef: placeholder1, genres: ["Action Platformer"], platforms: [{ name: "Switch", played: true }], draft: false } },
  { id: "mock-vampire-survivors", mock: true, data: { title: "Vampire Survivors", description: "The ugliest timesink of 2022 and I mean that as a compliment.", pubDate: new Date("2022-12-01"), heroImageRef: placeholder4, genres: ["Roguelite", "Action"], platforms: [{ name: "Steam", played: true }, { name: "Xbox Series X/S" }], draft: false } },
  { id: "mock-chained-echoes", mock: true, data: { title: "Chained Echoes", description: "Ambitious indie JRPG design with systems that keep tightening as it goes.", pubDate: new Date("2022-12-18"), heroImageRef: placeholder2, genres: ["Turn-Based", "JRPG"], platforms: [{ name: "Steam", played: true }, { name: "Game Pass" }], draft: false } },
];

const PLATFORM_FILTER_GROUPS = ["PC", "PlayStation", "Switch", "Xbox"];

function isMockPost(post) {
  return Boolean(post.mock);
}

function getPostHref(post) {
  // Mock cards are display-only, so they intentionally do not navigate anywhere.
  return isMockPost(post) ? "" : post.url;
}

function getGenresLabel(post, count = 2) {
  // If a post has no genres, use a generic label in cards and metadata.
  return post.data.genres?.slice(0, count).join(" / ") ?? "Review";
}

function getFeaturedKicker(post) {
  // Add a GOTY suffix only for entries that define a GOTY year.
  return post.data.gotyYear ? `${getGenresLabel(post)} / ${post.data.gotyYear} GOTY` : getGenresLabel(post);
}

function getPlayedPlatforms(post, limit = 2) {
  // Default to an empty platform list so chaining stays safe.
  return (post.data.platforms ?? []).filter((platform) => platform.played).map((platform) => platform.name).slice(0, limit);
}

function getPreferredPlatform(post) {
  // Prefer a played platform, then the first declared platform, else an empty string.
  return getPlayedPlatforms(post, 1)[0] ?? post.data.platforms?.[0]?.name ?? "";
}

function classifyPlatformGroup(platformName) {
  // Normalize many platform labels down to the small set of filter buckets.
  const normalized = String(platformName).toLowerCase();
  // Match common PC storefront/platform labels.
  if (
    normalized.includes("steam") ||
    normalized.includes("gog") ||
    normalized.includes("pc game pass") ||
    normalized === "pc" ||
    normalized.startsWith("pc ")
  ) return "PC";
  // Match console families used by the filter UI.
  if (normalized.includes("playstation") || normalized.startsWith("ps")) return "PlayStation";
  if (normalized.includes("switch")) return "Switch";
  if (normalized.includes("xbox") || normalized === "game pass") return "Xbox";
  return null;
}

function getFilterPlatforms(post) {
  // Deduplicate normalized platform groups for filtering/stats.
  return Array.from(new Set((post.data.platforms ?? []).map((p) => classifyPlatformGroup(p.name)).filter(Boolean)));
}

function getCompactBadge(post) {
  // Badge priority: GOTY label beats draft/published state.
  if (post.data.gotyYear) return { label: `${post.data.gotyYear} GOTY`, variant: "goty" };
  if (post.data.draft) return { label: "Draft", variant: "draft" };
  return { label: "Published", variant: "pub" };
}

function postGenreTokens(post) {
  return (post.data.genres ?? []).map(token).join(",");
}

function postPlatformTokens(post) {
  return getFilterPlatforms(post).map(token).join(",");
}

function imageSource(post) {
  // Real posts use Eleventy front matter image paths; mocks can point at a placeholder ref.
  // Prefer a real hero image, then a mock placeholder reference.
  if (post.data.heroImagePath) return { fsPath: post.data.heroImagePath, url: post.data.heroImage };
  if (post.data.heroImageRef) return post.data.heroImageRef;
  return null;
}

async function renderThumb(post, width, height, sizes, className, eager = false) {
  // Render a responsive thumbnail, or a styled placeholder block if no image exists.
  const src = imageSource(post);
  // Preserve card layout when a post has no image source.
  if (!src) return `<div class="${className}" aria-hidden="true"></div>`;
  return renderImage(src, post.data.title, {
    widths: [width, Math.round(width * 1.5), width * 2],
    sizes,
    width,
    height,
    // Featured/hero contexts can request eager loading; archive cards stay lazy.
    loading: eager ? "eager" : "lazy",
    fetchpriority: eager ? "high" : "auto",
  });
}

function buildCardMeta(post) {
  // Precompute DOM dataset values used by the client-side filter/sort script.
  return {
    isMock: isMockPost(post),
    href: getPostHref(post),
    dateIso: post.data.pubDate.toISOString(),
    year: post.data.pubDate.getFullYear(),
    titleLower: post.data.title.toLowerCase(),
    genresTokens: postGenreTokens(post),
    platformsTokens: postPlatformTokens(post),
  };
}

function buildCurrentPlaying(currentlyPlaying = []) {
  // Keep sidebar data shape predictable for the template.
  return currentlyPlaying.map((game) => ({
    // Normalize missing fields to empty strings so Nunjucks conditionals stay simple.
    title: game.title,
    platform: game.platform || "",
    status: game.status || "",
    note: game.note || "",
  }));
}

function getReviewsFilterScript() {
  // Returns a self-executing script string so the filter logic is scoped to this page build.
  return `(${function initReviewsFilters() {
    const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    const resetButton = document.querySelector('[data-filter-reset="true"]');
    const sortSelect = document.querySelector('[data-sort-select]');
    const cards = Array.from(document.querySelectorAll('[data-post-card]'));
    const archiveCards = cards.filter((card) => !card.hasAttribute('data-featured-card'));
    const yearSections = Array.from(document.querySelectorAll('[data-year-section]'));
    const reviewsColumn = document.querySelector('.reviews-column');
    // Exit if the page is missing the archive/filter UI.
    if (!filterButtons.length || !reviewsColumn) return;
    // Filter state is kept entirely client-side from data-* attributes rendered into cards.
    const state = { genres: new Set(), platforms: new Set(), years: new Set(), sort: 'newest' };
    // Dataset values may be empty/missing, so default to an empty token set.
    const parseSet = (value) => new Set((value || '').split(',').filter(Boolean));
    const compareText = (a, b) => a.localeCompare(b);
    const compareDate = (a, b) => new Date(a).getTime() - new Date(b).getTime();
    const matches = (card) => {
      const year = card.dataset.year || '';
      const genres = parseSet(card.dataset.genres);
      const platforms = parseSet(card.dataset.platforms);
      // Reject cards that fail any active filter group.
      if (state.years.size && !state.years.has(year)) return false;
      if (state.genres.size && ![...state.genres].some((g) => [...genres].some((gt) => gt.includes(g)))) return false;
      if (state.platforms.size && ![...state.platforms].some((p) => platforms.has(p))) return false;
      return true;
    };
    const syncResetState = () => {
      const hasFilters = state.genres.size || state.platforms.size || state.years.size;
      resetButton?.classList.toggle('active', !hasFilters);
    };
    const sortYearSections = () => {
      // Reorder year groups and cards in-place so sorting affects the whole archive without re-rendering.
      const sortedSections = [...yearSections].sort((a, b) => {
        // Missing year values sort as 0 instead of producing `NaN`.
        const ay = Number(a.dataset.year || '0');
        const by = Number(b.dataset.year || '0');
        // Reverse the section order depending on the selected sort direction.
        return state.sort === 'oldest' ? ay - by : by - ay;
      });
      sortedSections.forEach((section) => reviewsColumn.appendChild(section));
      yearSections.forEach((section) => {
        const list = section.querySelector('.article-grid, .compact-list');
        // Skip malformed sections that do not contain a card list.
        if (!list) return;
        const sectionCards = Array.from(list.querySelectorAll('[data-post-card]'));
        sectionCards.sort((a, b) => {
          // Empty dates compare as invalid/zero-time values but still preserve deterministic ordering.
          const dateCmp = compareDate(a.dataset.date || '', b.dataset.date || '');
          // Primary sort is publish date; title is a stable tie-breaker.
          if (dateCmp !== 0) return state.sort === 'oldest' ? dateCmp : -dateCmp;
          return compareText(a.dataset.title || '', b.dataset.title || '');
        });
        sectionCards.forEach((card) => list.appendChild(card));
      });
    };
    const updateVisibility = () => {
      // Hide/show archive cards, then hide empty year sections.
      archiveCards.forEach((card) => { card.hidden = !matches(card); });
      yearSections.forEach((section) => {
        const visibleCards = Array.from(section.querySelectorAll('[data-post-card]')).filter((card) => !card.hidden);
        section.hidden = visibleCards.length === 0;
      });
    };
    const apply = () => { syncResetState(); sortYearSections(); updateVisibility(); };
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        // Reset button clears all active filters in one click.
        if (button.hasAttribute('data-filter-reset')) {
          state.genres.clear(); state.platforms.clear(); state.years.clear();
          filterButtons.forEach((btn) => { if (!btn.hasAttribute('data-filter-reset')) btn.classList.remove('active'); });
          apply(); return;
        }
        const type = button.dataset.filterType; const value = button.dataset.filterValue;
        // Ignore malformed filter buttons that lack metadata.
        if (!type || !value) return;
        // Route each filter button to the matching state bucket (genre/platform/year).
        const map = type === 'genre' ? state.genres : type === 'platform' ? state.platforms : state.years;
        // Platform filters are single-select to keep the UI compact.
        if (type === 'platform') {
          const wasActive = map.has(value);
          map.clear();
          filterButtons.forEach((btn) => { if (btn.dataset.filterType === 'platform') btn.classList.remove('active'); });
          // Clicking an inactive platform selects it; clicking again clears platform filtering.
          if (!wasActive) { map.add(value); button.classList.add('active'); }
          apply(); return;
        }
        // Genre/year filters are multi-select, so toggle the clicked value.
        if (map.has(value)) { map.delete(value); button.classList.remove('active'); } else { map.add(value); button.classList.add('active'); }
        apply();
      });
    });
    // Coerce any unexpected select value back to the default "newest" mode.
    sortSelect?.addEventListener('change', (event) => { state.sort = event.target.value === 'oldest' ? 'oldest' : 'newest'; apply(); });
    apply();
  }.toString()})();`;
}

export default {
  permalink: "/reviews/",
  layout: "layouts/base.njk",
  headTitle: "Reviews | Kat's Kronicles",
  title: "Reviews | Kat's Kronicles",
  description: "Welcome to my website!",
  stylesheets: ["/styles/pages/reviews-index.css"],
  mainClass: "reviews-page",
  eleventyComputed: {
    reviewsPage: async (data) => {
      // Real review content plus mock entries for layout density during development.
      const realPosts = data.siteContent.getReviews(data.siteContent.visibilityOptions(data.siteContent.isDev));
      const posts = [...realPosts, ...mockPosts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
      // The first few real posts become the featured module; everything else becomes archive sections.
      const featuredPosts = realPosts.slice(0, 3);
      const featuredIds = new Set(featuredPosts.map((post) => post.id));
      const archivePosts = posts.filter((post) => !featuredIds.has(post.id));

      const years = posts.map((post) => post.data.pubDate.getFullYear());
      // When there are no posts, keep the year range null so the header string omits it.
      const latestYear = years.length ? Math.max(...years) : null;
      const earliestYear = years.length ? Math.min(...years) : null;

      // Group archive entries by year for the large lead section + compact older sections.
      const yearMap = new Map();
      // Group archive posts by calendar year.
      for (const post of archivePosts) {
        const year = post.data.pubDate.getFullYear();
        // Initialize a new year bucket on first encounter.
        const list = yearMap.get(year) ?? [];
        list.push(post);
        yearMap.set(year, list);
      }
      const yearSections = Array.from(yearMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([year, items]) => ({ year, items }));

      const leadYearSection = yearSections[0];
      const compactYearSections = yearSections.slice(1);

      // Build sidebar stats and filter options from the same post set the page renders.
      const genreCounts = new Map();
      const platformCounts = new Map();
      // Accumulate genre/platform counts for sidebar stats + filter options.
      for (const post of posts) {
        // Count each tagged genre.
        for (const genre of post.data.genres ?? []) {
          // Missing counts default to 0 before incrementing.
          genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
        }
        // Count normalized platform groups (not raw platform labels).
        for (const platformName of getFilterPlatforms(post)) {
          // Same increment pattern for normalized platform groups.
          platformCounts.set(platformName, (platformCounts.get(platformName) ?? 0) + 1);
        }
      }
      const topGenres = Array.from(genreCounts.entries())
        // Tie-break equal counts alphabetically for stable UI ordering.
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6);
      const topPlatforms = Array.from(platformCounts.entries())
        // Same stable tie-breaker for platform counts.
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6);
      const maxGenreCount = Math.max(...topGenres.map(([, count]) => count), 1);

      const filterGenres = topGenres.slice(0, 5).map(([name]) => ({ name, value: token(name) }));
      const filterPlatforms = PLATFORM_FILTER_GROUPS.filter((name) => platformCounts.has(name)).map((name) => ({
        name,
        value: token(name),
      }));
      const filterYears = Array.from(new Set(years)).sort((a, b) => b - a).slice(0, 4).map((year) => ({
        year,
        value: String(year),
      }));

      // Featured hero card (largest top slot).
      const featuredHeroPost = featuredPosts[0];
      const featuredHero = featuredHeroPost
        ? {
            ...featuredHeroPost,
            ...buildCardMeta(featuredHeroPost),
            imageHtml: await renderThumb(
              featuredHeroPost,
              1440,
              720,
              "(max-width: 1200px) 100vw, 1440px",
              "featured-card-image-placeholder",
              true,
            ),
            featuredKicker: getFeaturedKicker(featuredHeroPost),
            // Prefer a short blurb, falling back to the full description.
            featuredSummary: featuredHeroPost.data.blurb ?? featuredHeroPost.data.description,
            playedPlatforms: getPlayedPlatforms(featuredHeroPost),
            formattedDate: formatDate(featuredHeroPost.data.pubDate),
          }
        : null;

      // Supporting featured tiles shown beneath the hero.
      const featuredTiles = await Promise.all(
        featuredPosts.slice(1).map(async (post) => ({
          ...post,
          ...buildCardMeta(post),
          imageHtml: await renderThumb(post, 720, 420, "(max-width: 900px) 100vw, 720px", "featured-card-image-placeholder"),
          featuredKicker: getFeaturedKicker(post),
          preferredPlatform: getPreferredPlatform(post),
          monthYear: formatMonthYear(post.data.pubDate),
        })),
      );

      // Lead-year cards render as image + excerpt cards.
      const leadYearCards = leadYearSection
        ? await Promise.all(
            leadYearSection.items.map(async (post) => ({
              ...post,
              ...buildCardMeta(post),
              imageHtml: await renderThumb(post, 640, 360, "(max-width: 900px) 100vw, 640px", "review-card-image-placeholder"),
              genreLabel: getGenresLabel(post, 1),
              // Grid cards use the shorter blurb when available.
              excerpt: post.data.blurb ?? post.data.description,
              formattedDate: formatDate(post.data.pubDate),
            })),
          )
        : [];

      // Older years render as compact rows with badges.
      const compactSections = compactYearSections.map((section) => ({
        year: section.year,
        items: section.items.map((post, index) => {
          const badge = getCompactBadge(post);
          return {
            ...post,
            ...buildCardMeta(post),
            compactNum: String(index + 1).padStart(2, "0"),
            genreLabel: getGenresLabel(post, 1),
            monthYear: formatMonthYear(post.data.pubDate),
            badge,
          };
        }),
      }));

      return {
        // `reviewsPage` is consumed by `src/site/reviews/index.njk`.
        header: {
          title: "Reviews",
          subtitle: "One person's experience with the games she couldn't put down - or couldn't forgive.",
          // Append a year span only when both endpoints exist.
          countText: `${posts.length} entries${latestYear && earliestYear ? ` / ${earliestYear}-${latestYear}` : ""}`,
        },
        filters: {
          genres: filterGenres,
          platforms: filterPlatforms,
          years: filterYears,
        },
        featured: {
          hero: featuredHero,
          tiles: featuredTiles,
        },
        // Expose `null` when no lead section exists so the template can skip that block.
        leadYearSection: leadYearSection ? { year: leadYearSection.year, items: leadYearCards } : null,
        compactSections,
        emptyArchive: !leadYearSection && archivePosts.length === 0,
        sidebar: {
          currentlyPlaying: buildCurrentPlaying(data.currentlyPlaying),
          topGenres: topGenres.map(([name, count]) => ({ name, count, widthPct: (count / maxGenreCount) * 100 })),
          topPlatforms: topPlatforms.map(([name, count]) => ({ name, count })),
        },
        filterScript: getReviewsFilterScript(),
      };
    },
  },
};
