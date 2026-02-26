import type { CollectionEntry } from 'astro:content';
import {
	getVisibleCollectionEntries,
	isDraftContentEntry,
	isTemplateContentEntry,
	isVisibleContentEntry,
	sortByPubDateDesc,
	type ContentVisibilityOptions,
} from './content';

export type BossFeatureEntry = CollectionEntry<'bossfeatures'>;

export function isTemplateBossFeature(post: BossFeatureEntry) {
	return isTemplateContentEntry(post);
}

export function isDraftBossFeature(post: BossFeatureEntry) {
	return isDraftContentEntry(post);
}

export function isVisibleBossFeature(
	post: BossFeatureEntry,
	includeDraftsOrOptions: boolean | ContentVisibilityOptions = false,
) {
	const options =
		typeof includeDraftsOrOptions === 'boolean'
			? { includeDrafts: includeDraftsOrOptions }
			: includeDraftsOrOptions;
	return isVisibleContentEntry(post, options);
}

export async function getVisibleBossFeatures(options: ContentVisibilityOptions = {}) {
	const posts = await getVisibleCollectionEntries('bossfeatures', options);
	return sortByPubDateDesc(posts);
}
