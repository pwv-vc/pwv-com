import type { CollectionEntry } from 'astro:content';

export type TimelineEntry = CollectionEntry<'events'>;
export type TimelineEvent = TimelineEntry['data']['events'][number];

