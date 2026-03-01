import { bossTagClassMap, countThreadComments, renderPostHeroImage } from "../_lib/page-utils.js";

// Generates one page per visible boss feature post.
export default {
  pagination: {
    data: "siteContent.bossfeaturesVisible",
    size: 1,
    alias: "post",
  },
  permalink: (data) => data.post.url,
  layout: "layouts/boss-feature-post.njk",
  eleventyComputed: {
    // Map front matter/content fields into the boss-feature layout API.
    title: (data) => data.post.data.title,
    headTitle: (data) => `${data.post.data.title} - ${data.post.data.game} | ${data.site.title}`,
    description: (data) => data.post.data.description,
    // Provide a fallback image for social previews when no boss-feature hero image exists.
    imageUrl: (data) => data.post.data.heroImage || "/assets/blog-placeholder-1.jpg",
    variantFonts: true,
    pubDate: (data) => data.post.data.pubDate,
    comments: (data) => Boolean(data.post.data.comments),
    threadId: (data) => `bossfeatures/${data.post.id}`,
    commentTotalCount: (data) => countThreadComments(data.commentSeeds, `bossfeatures/${data.post.id}`),
    game: (data) => data.post.data.game,
    bossType: (data) => data.post.data.bossType,
    attempts: (data) => data.post.data.attempts,
    verdict: (data) => data.post.data.verdict,
    verdictTone: (data) => data.post.data.verdictTone,
    // Build a CSS modifier class only when the post defines a verdict tone.
    verdictToneClass: (data) => (data.post.data.verdictTone ? `bf-verdict-${data.post.data.verdictTone}` : ""),
    verdictText: (data) => data.post.data.verdictText,
    spoilerLevel: (data) => data.post.data.spoilerLevel,
    hoursIn: (data) => data.post.data.hoursIn,
    chapter: (data) => data.post.data.chapter,
    blurb: (data) => data.post.data.blurb,
    // Normalize missing tags to an empty array for simpler template loops.
    tags: (data) => data.post.data.tags || [],
    tagClasses: () => bossTagClassMap,
    // Responsive hero image rendered at build time.
    heroImageHtml: async (data) =>
      renderPostHeroImage(data.post, {
        alt: `${data.post.data.title} encounter`,
        imageOptions: {
          widths: [960, 1440, 1920],
          sizes: "100vw",
          width: 1920,
          height: 1080,
          loading: "eager",
          fetchpriority: "high",
        },
      }),
  },
};
