import { getVisibleBossFeatures, getVisibleReviews, siteConfig } from "../lib/content";

export const GET = async () => {
  const [reviews, bossfeatures] = await Promise.all([getVisibleReviews(), getVisibleBossFeatures()]);
  const staticRoutes = ["/", "/about/", "/search/", "/reviews/", "/bossfeatures/", "/rss.xml", "/404.html"];
  const dynamicRoutes = [
    ...reviews.map((post) => `/reviews/${post.slug}/`),
    ...bossfeatures.map((post) => `/bossfeatures/${post.slug}/`),
  ];
  const routes = [...new Set([...staticRoutes, ...dynamicRoutes])];
  const urls = routes.map((route) => `  <url><loc>${new URL(route, siteConfig.url).toString()}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
