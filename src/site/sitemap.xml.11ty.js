// Generates a basic XML sitemap from static routes + visible dynamic content routes.
export default class SitemapTemplate {
  data() {
    return {
      permalink: "/sitemap.xml",
    };
  }

  render(data) {
    // Include hand-authored pages plus review/boss-feature permalink pages.
    const staticRoutes = ["/", "/about/", "/search/", "/reviews/", "/rss.xml", "/404.html"];
    const dynamicRoutes = [
      // Spread visible content URLs, defaulting each collection to an empty list if absent.
      ...(data.siteContent?.reviewsVisible ?? []).map((p) => p.url),
      ...(data.siteContent?.bossfeaturesVisible ?? []).map((p) => p.url),
    ];
    const routes = [...new Set([...staticRoutes, ...dynamicRoutes])];

    // Deduplicate and serialize to sitemap `<url>` entries.
    const urls = routes
      .map((url) => `  <url><loc>${data.build.siteUrl}${url}</loc></url>`)
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }
}
