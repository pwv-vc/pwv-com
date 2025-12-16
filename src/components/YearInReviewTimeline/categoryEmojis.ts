import type { TimelineEvent } from './types';

type CategoryType = NonNullable<TimelineEvent['category']>[number];

export const categoryEmojis: Record<CategoryType, string> = {
  raise: '💰',
  seed: '🌱',
  'series-a': '🚀',
  'series-b': '📈',
  'series-c': '🎯',
  'series-d': '🏆',
  fundraise: '💰',
  product_launch: '🎉',
  meetup: '🤝',
  event: '📅',
  announcement: '📢',
  travel: '✈️',
  community: '👥',
  other: '📌',
};

// Get emoji for an event based on its categories
// Priority: raise/series > product_launch > event > announcement > other
export const getEventEmoji = (categories?: CategoryType[]): string => {
  if (!categories || categories.length === 0) {
    return categoryEmojis.other;
  }

  // Priority order for selecting emoji when multiple categories exist
  const priorityOrder: CategoryType[] = [
    'series-d',
    'series-c',
    'series-b',
    'series-a',
    'seed',
    'raise',
    'fundraise',
    'product_launch',
    'meetup',
    'event',
    'announcement',
    'travel',
    'community',
    'other',
  ];

  for (const priority of priorityOrder) {
    if (categories.includes(priority)) {
      return categoryEmojis[priority];
    }
  }

  return categoryEmojis[categories[0]];
};
