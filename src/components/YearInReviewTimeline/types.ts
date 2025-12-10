import type { CollectionEntry } from 'astro:content';

export type TimelineMetaEntry = CollectionEntry<'eventMeta'>;
export type TimelineEventEntry = CollectionEntry<'events'>;
export type TimelineEvent = TimelineEventEntry['data'];

