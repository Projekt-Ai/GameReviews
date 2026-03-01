import { countThreadComments, renderPostHeroImage } from "../_lib/page-utils.js";

// Generates one page per visible review post.
export default {
  pagination: {
    data: "siteContent.reviewsVisible",
    size: 1,
    alias: "post",
  },
  permalink: (data) => data.post.url,
  layout: "layouts/review-post.njk",
  eleventyComputed: {
    // Map review front matter/content into the shared review post layout API.
    title: (data) => data.post.data.title,
    description: (data) => data.post.data.description,
    // Fallback image keeps OG tags valid when a review lacks a hero image.
    imageUrl: (data) => data.post.data.heroImage || "/assets/blog-placeholder-1.jpg",
    pubDate: (data) => data.post.data.pubDate,
    updatedDate: (data) => data.post.data.updatedDate,
    // Reviews without a custom theme use the default visual treatment.
    reviewTheme: (data) => data.post.data.theme || "default",
    feature: (data) => Boolean(data.post.data.feature),
    comments: (data) => Boolean(data.post.data.comments),
    threadId: (data) => `reviews/${data.post.id}`,
    commentTotalCount: (data) => countThreadComments(data.commentSeeds, `reviews/${data.post.id}`),
    // Only the E33 theme enables the extra variant font load in the shared head partial.
    variantFonts: (data) => (data.post.data.theme || "default") === "e33",
    // Build-time responsive hero image for the review page header.
    heroImageHtml: async (data) =>
      renderPostHeroImage(data.post, {
        alt: "",
        imageOptions: {
          widths: [720, 1020, 1440],
          sizes: "(max-width: 1020px) 100vw, 1020px",
          width: 1020,
          height: 510,
          loading: "eager",
          fetchpriority: "high",
        },
      }),
  },
};
