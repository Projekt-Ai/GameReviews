import type { CollectionEntry } from 'astro:content';
import {
	getVisibleCollectionEntries,
	isDraftContentEntry,
	isTemplateContentEntry,
	isVisibleContentEntry,
	sortByPubDateDesc,
	type ContentVisibilityOptions,
} from './content';

export type ReviewEntry = CollectionEntry<'reviews'>;

export function isTemplateReview(post: ReviewEntry) {
	return isTemplateContentEntry(post);
}

export function isDraftReview(post: ReviewEntry) {
	return isDraftContentEntry(post);
}

export function isVisibleReview(
	post: ReviewEntry,
	includeDraftsOrOptions: boolean | ContentVisibilityOptions = false,
) {
	const options =
		typeof includeDraftsOrOptions === 'boolean'
			? { includeDrafts: includeDraftsOrOptions }
			: includeDraftsOrOptions;
	return isVisibleContentEntry(post, options);
}

export async function getVisibleReviews(options: ContentVisibilityOptions = {}) {
	const posts = await getVisibleCollectionEntries('reviews', options);
	return sortByPubDateDesc(posts);
}
