import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getVisibleReviews } from '../utils/reviews';

export async function GET(context) {
	const posts = await getVisibleReviews({ includeDrafts: false, includeFuture: false });
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/reviews/${post.id}/`,
		})),
	});
}
