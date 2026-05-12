import { getVisibleBossFeatures, getVisibleExcited, getVisibleReviews } from "../../lib/content";

export async function GET() {
  const [reviews, bossfeatures, excited] = await Promise.all([getVisibleReviews(), getVisibleBossFeatures(), getVisibleExcited()]);
  const articles = [
    ...reviews.map((post) => ({
      title: post.data.title,
      headline: post.data.headline ?? null,
      blurb: post.data.blurb ?? null,
      url: `/reviews/${post.slug}/`,
      pubDate: post.data.pubDate.toISOString(),
    })),
    ...bossfeatures.map((post) => ({
      title: post.data.title,
      headline: null,
      blurb: post.data.blurb ?? null,
      url: `/bossfeatures/${post.slug}/`,
      pubDate: post.data.pubDate.toISOString(),
    })),
    ...excited.map((post) => ({
      title: post.data.title,
      headline: post.data.headline ?? null,
      blurb: post.data.blurb ?? null,
      url: `/im-excited/${post.slug}/`,
      pubDate: post.data.pubDate.toISOString(),
    })),
  ].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return new Response(JSON.stringify(articles), {
    headers: { "Content-Type": "application/json" },
  });
}
