// Search page metadata plus a serialized client-side index of visible content.
export default {
  permalink: "/search/",
  layout: "layouts/base.njk",
  headTitle: "Search | Kat's Kronicles",
  title: "Search | Kat's Kronicles",
  description: "Search all content",
  variantFonts: true,
  stylesheets: ["/styles/pages/search.css"],
  mainClass: "search-page",
  eleventyComputed: {
    searchIndex: (data) => {
      // Use the same visibility rules as the rest of the site.
      const reviews = data.siteContent.getReviews(data.siteContent.visibilityOptions(data.siteContent.isDev));
      const bossFeatures = data.siteContent.getBossFeatures(data.siteContent.visibilityOptions(data.siteContent.isDev));
      // Flatten reviews + boss features into one searchable array and sort newest first.
      return [
        ...reviews.map((post) => ({
          title: post.data.title,
          description: post.data.description,
          // Normalize optional blurbs so the client-side search script can access the field safely.
          blurb: post.data.blurb ?? "",
          url: post.url,
          type: "Review",
          date: post.data.pubDate.toISOString(),
        })),
        ...bossFeatures.map((post) => ({
          title: post.data.title,
          description: post.data.description,
          // Same normalization for boss feature entries.
          blurb: post.data.blurb ?? "",
          url: post.url,
          type: "Boss Feature",
          date: post.data.pubDate.toISOString(),
        })),
      ].sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf());
    },
  },
};
