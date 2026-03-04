import { getVisibleReviews, siteConfig } from "../lib/content";

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET = async () => {
  const reviews = await getVisibleReviews();
  const items = reviews
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <description>${escapeXml(post.data.description)}</description>
      <link>${escapeXml(new URL(`/reviews/${post.slug}/`, siteConfig.url).toString())}</link>
      <guid>${escapeXml(new URL(`/reviews/${post.slug}/`, siteConfig.url).toString())}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
    </item>`,
    )
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${escapeXml(siteConfig.url)}</link>${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
