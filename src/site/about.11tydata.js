import { renderAssetImageFromSrc } from "./_lib/page-utils.js";

// Treat the About page like a review-post layout so it reuses typography/hero styling.
export default {
  permalink: "/about/",
  layout: "layouts/review-post.njk",
  title: "About Me",
  description: "Lorem ipsum dolor sit amet",
  pubDate: new Date("2021-08-08"),
  reviewTheme: "default",
  feature: false,
  comments: false,
  eleventyComputed: {
    // Social/OG image path used by the shared head partial.
    imageUrl: () => "/assets/blog-placeholder-about.jpg",
    // Render a responsive hero image from a local asset.
    heroImageHtml: async () =>
      renderAssetImageFromSrc("src/assets/blog-placeholder-about.jpg", "", {
        widths: [720, 1020, 1440],
        sizes: "(max-width: 1020px) 100vw, 1020px",
        width: 1020,
        height: 510,
        loading: "eager",
        fetchpriority: "high",
      }),
  },
};
