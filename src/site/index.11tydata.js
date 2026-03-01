import path from "node:path";
import { renderImage } from "./_lib/images.js";
import { formatDate, formatGenreLine } from "./_lib/page-utils.js";

// Used when a review does not have a hero image yet.
const fallbackImage = {
  fsPath: path.resolve(process.cwd(), "src/assets/blog-placeholder-1.jpg"),
  url: "/assets/blog-placeholder-1.jpg",
};

function imageSource(post) {
  // Prefer the review's hero image; otherwise fall back to a shared placeholder.
  // Use the post hero image when available.
  if (post?.data?.heroImagePath) {
    return { fsPath: post.data.heroImagePath, url: post.data.heroImage };
  }
  return fallbackImage;
}

async function renderPostImage(post, alt, options) {
  // Small wrapper so page code can stay focused on layout/data shaping.
  return renderImage(imageSource(post), alt, options);
}

function withDerivedReviewFields(post) {
  // Normalize display-only fields the template expects.
  return {
    ...post,
    // Missing genres/release/platform lists collapse to safe empty defaults.
    genreLine: formatGenreLine(post.data.genres ?? [], post.data.release ?? ""),
    platformMeta: post.data.platforms ?? [],
  };
}

export default {
  permalink: "/",
  layout: "layouts/base.njk",
  title: "Kat's Kronicles",
  description: "Welcome to my website!",
  variantFonts: true,
  stylesheets: ["/styles/pages/home.css"],
  scripts: [{ src: "/js/home-goty-slider.js" }],
  mainClass: "home-main",
  eleventyComputed: {
    home: async (data) => {
      // Visibility is stricter for normal lists, but GOTY/boss sections allow drafts/future posts in dev.
      const visibility = data.siteContent.visibilityOptions(data.siteContent.isDev);
      const gotyVisibility = data.siteContent.visibilityOptions(data.siteContent.isDev, {
        includeDrafts: true,
        includeFuture: true,
      });
      const bossFeatureVisibility = data.siteContent.visibilityOptions(data.siteContent.isDev, {
        includeDrafts: true,
        includeFuture: true,
      });

      // Pull source collections used by different home page modules.
      const allReviews = data.siteContent.getReviews(visibility);
      const gotySourceReviews = data.siteContent.getReviews(gotyVisibility);
      const bossFeatureSourceEntries = data.siteContent.getBossFeatures(bossFeatureVisibility);

      // GOTY entries are sorted oldest->newest so the slider order is stable and intentional.
      const gotyEntries = gotySourceReviews
        .filter((post) => post.data.gotyYear !== undefined)
        // Entries without a numeric year sink to 0 (though they are already filtered above).
        .sort((a, b) => (a.data.gotyYear ?? 0) - (b.data.gotyYear ?? 0));

      // Recent list is independent from the GOTY and boss feature modules.
      const recentItems = [...allReviews]
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
        .slice(0, 4);

      // Page-specific curation choices for the home layout.
      const pinnedEntry = gotyEntries.find((post) => post.data.gotyYear === 2025);
      const slideshowEntries = gotyEntries.filter((post) => post.data.gotyYear !== 2025);
      const defaultIndex = Math.max(0, slideshowEntries.findIndex((post) => post.data.gotyYear === 2024));
      const featuredBossFeature =
        // Prefer a curated ID, otherwise fall back to the newest boss feature.
        bossFeatureSourceEntries.find((post) => post.id === "louis-metaphor-refantazio") ??
        [...bossFeatureSourceEntries].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())[0];

      // Build slider cards with responsive images.
      const slideshow = await Promise.all(
        slideshowEntries.map(async (post) => ({
          ...withDerivedReviewFields(post),
          imageHtml: await renderPostImage(post, `${post.data.title} artwork`, {
            widths: [800, 1200, 1600],
            sizes: "(max-width: 1200px) 100vw, 1200px",
            width: 1200,
            height: 675,
            // Prioritize the default slide image; defer the rest.
            loading: post.data.gotyYear === 2024 ? "eager" : "lazy",
            fetchpriority: post.data.gotyYear === 2024 ? "high" : "auto",
          }),
        })),
      );

      // Build the pinned side card (if the curated year exists).
      // Conditionally build the pinned card only when the curated pinned year exists.
      const pinned = pinnedEntry
        ? {
            ...withDerivedReviewFields(pinnedEntry),
            imageHtml: await renderPostImage(pinnedEntry, `${pinnedEntry.data.title} artwork`, {
              widths: [800, 1200, 1600],
              sizes: "(max-width: 1200px) 100vw, 1200px",
              width: 1200,
              height: 675,
              loading: "eager",
              fetchpriority: "high",
            }),
          }
        : null;

      // Build the boss feature module; fall back to a placeholder card if no entry exists yet.
      // Prefer a real boss feature, otherwise render a placeholder module.
      const featuredBoss = featuredBossFeature
        ? {
            ...featuredBossFeature,
            imageHtml: await renderPostImage(featuredBossFeature, `${featuredBossFeature.data.title} boss feature`, {
              widths: [700, 1100, 1400],
              sizes: "(max-width: 1100px) 100vw, 1100px",
              width: 1100,
              height: 619,
              loading: "eager",
              fetchpriority: "high",
            }),
          }
        : {
            imageHtml: await renderPostImage(null, "Boss Feature Thumbnail", {
              widths: [700, 1100, 1400],
              sizes: "(max-width: 1100px) 100vw, 1100px",
              width: 1100,
              height: 619,
              loading: "eager",
              fetchpriority: "high",
            }),
            data: {
              title: "Boss Feature Title",
              blurb: "",
              description: "This is a special boss feature highlighting an important topic or review in depth.",
            },
            url: "/bossfeatures/",
          };

      // Build compact recent cards with formatted dates and thumbnails.
      const recent = await Promise.all(
        recentItems.map(async (post, index) => ({
          ...post,
          recentIndex: index + 1,
          formattedDate: formatDate(post.data.pubDate),
          imageHtml: await renderPostImage(post, post.data.title, {
            widths: [560, 840, 1120],
            sizes: "(max-width: 900px) 100vw, 560px",
            width: 560,
            height: 315,
          }),
        })),
      );

      return {
        // `home` is consumed by `src/site/index.njk`.
        defaultIndex,
        slideshow,
        pinned,
        featuredBoss,
        recent,
        // Keep the template loop simple when the data file is missing/empty.
        currentlyPlaying: data.currentlyPlaying ?? [],
      };
    },
  },
};
