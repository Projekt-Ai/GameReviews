function escapeXml(value) {
  // Escape XML-sensitive characters for feed-safe output.
  // Null/undefined XML fields become empty strings before escaping.
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default class RssFeed {
  data() {
    // Generate a single XML file at the site root.
    return {
      permalink: "/rss.xml",
    };
  }

  render(data) {
    // Emit RSS items for visible review entries.
    // Missing content data (e.g., during a broken build) degrades to an empty feed list.
    const items = (data.siteContent?.reviewsVisible ?? [])
      .map((post) => `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <description>${escapeXml(post.data.description)}</description>
      <link>${escapeXml(`${data.build.siteUrl}${post.url}`)}</link>
      <guid>${escapeXml(`${data.build.siteUrl}${post.url}`)}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
    </item>`)
      .join("");

    // Return the complete feed XML as a string.
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(data.site.title)}</title>
    <description>${escapeXml(data.site.description)}</description>
    <link>${escapeXml(data.build.siteUrl)}</link>${items}
  </channel>
</rss>`;
  }
}
