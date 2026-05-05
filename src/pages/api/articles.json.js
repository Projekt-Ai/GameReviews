import { getVisibleReviews } from "../../lib/content";

export async function GET() {
  const reviews = await getVisibleReviews();
  const articles = reviews.map((post) => ({
    title: post.data.title,
    headline: post.data.headline ?? null,
    blurb: post.data.blurb ?? null,
    url: `/reviews/${post.slug}/`,
    pubDate: post.data.pubDate.toISOString(),
  }));
  return new Response(JSON.stringify(articles), {
    headers: { "Content-Type": "application/json" },
  });
}
