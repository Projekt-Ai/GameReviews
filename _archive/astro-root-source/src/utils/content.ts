import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

type ContentEntryLike = {
	id: string;
	data: {
		pubDate?: Date;
		draft?: boolean;
	};
};

export type ContentVisibilityOptions = {
	includeDrafts?: boolean;
	includeFuture?: boolean;
	now?: Date;
};

export function contentVisibilityOptions(
	isDev: boolean,
	overrides: ContentVisibilityOptions = {},
): Required<ContentVisibilityOptions> {
	return {
		includeDrafts: overrides.includeDrafts ?? isDev,
		includeFuture: overrides.includeFuture ?? isDev,
		now: overrides.now ?? new Date(),
	};
}

export function isTemplateContentEntry(entry: Pick<ContentEntryLike, 'id'>) {
	return entry.id.startsWith('_');
}

export function isDraftContentEntry(entry: ContentEntryLike) {
	return Boolean(entry.data.draft);
}

export function isFutureDatedContentEntry(
	entry: ContentEntryLike,
	now: Date = new Date(),
) {
	const pubDate = entry.data.pubDate;
	if (!(pubDate instanceof Date)) return false;
	return pubDate.valueOf() > now.valueOf();
}

export function isVisibleContentEntry(
	entry: ContentEntryLike,
	options: ContentVisibilityOptions = {},
) {
	const { includeDrafts = false, includeFuture = false, now = new Date() } = options;
	if (isTemplateContentEntry(entry)) return false;
	if (!includeDrafts && isDraftContentEntry(entry)) return false;
	if (!includeFuture && isFutureDatedContentEntry(entry, now)) return false;
	return true;
}

export function sortByPubDateDesc<T extends ContentEntryLike>(entries: T[]) {
	return [...entries].sort((a, b) => (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0));
}

export function sortByPubDateAsc<T extends ContentEntryLike>(entries: T[]) {
	return [...entries].sort((a, b) => (a.data.pubDate?.valueOf() ?? 0) - (b.data.pubDate?.valueOf() ?? 0));
}

export async function getVisibleCollectionEntries<C extends CollectionKey>(
	collection: C,
	options: ContentVisibilityOptions = {},
): Promise<Array<CollectionEntry<C>>> {
	const entries = await getCollection(collection);
	return entries.filter((entry) => isVisibleContentEntry(entry, options));
}
