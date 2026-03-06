import rss from "@astrojs/rss";
import { getVisibleReviews, siteConfig } from "../lib/content";

export async function GET(context) {
  const reviews = await getVisibleReviews();
  return rss({
    stylesheet: "/rss-styles.xsl",
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    items: reviews.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/reviews/${post.slug}/`,
    })),
  });
}
