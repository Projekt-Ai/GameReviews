import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { isVisibleReview } from '../utils/reviews';

export async function GET(context) {
	const posts = (await getCollection('reviews')).filter((post) => isVisibleReview(post, false));
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/reviews/${post.id}/`,
		})),
	});
}
