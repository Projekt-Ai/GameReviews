import { getVisibleBossFeatures, getVisibleReviews, siteConfig } from "../lib/content";

export const GET = async () => {
  const [reviews, bossfeatures] = await Promise.all([getVisibleReviews(), getVisibleBossFeatures()]);
  const staticRoutes = ["/", "/about/", "/search/", "/reviews/", "/bossfeatures/", "/rss.xml", "/404.html"];

  const toUrl = (route, lastmod) => {
    const loc = new URL(route, siteConfig.url).toString();
    const lastmodTag = lastmod ? `<lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>` : "";
    return `  <url><loc>${loc}</loc>${lastmodTag}</url>`;
  };

  const urls = [
    ...staticRoutes.map((route) => toUrl(route, null)),
    ...reviews.map((post) => toUrl(`/reviews/${post.slug}/`, post.data.updatedDate ?? post.data.pubDate)),
    ...bossfeatures.map((post) => toUrl(`/bossfeatures/${post.slug}/`, post.data.updatedDate ?? post.data.pubDate)),
  ].join("\n");

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
