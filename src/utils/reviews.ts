import type { CollectionEntry } from 'astro:content';

type ReviewEntry = CollectionEntry<'reviews'>;

export function isTemplateReview(post: ReviewEntry) {
	return post.id.startsWith('_');
}

export function isDraftReview(post: ReviewEntry) {
	return Boolean(post.data.draft);
}

export function isVisibleReview(post: ReviewEntry, includeDrafts = false) {
	if (isTemplateReview(post)) return false;
	if (!includeDrafts && isDraftReview(post)) return false;
	return true;
}

