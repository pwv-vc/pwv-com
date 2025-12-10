import type { TimelineEvent } from './types';

export const categoryStyles: Record<
  NonNullable<TimelineEvent['category']>,
  string
> = {
  announcement: 'bg-pwv-light-green text-pwv-black',
  community: 'bg-pwv-light-teal text-pwv-black',
  event: 'bg-pwv-light-yellow text-pwv-black',
  fundraise: 'bg-pwv-soft-green text-pwv-black',
  meetup: 'bg-pwv-light-periwinkle text-pwv-black',
  product_launch: 'bg-pwv-soft-teal text-pwv-black',
  travel: 'bg-pwv-light-coral text-pwv-black',
  other: 'bg-pwv-light-lavender text-pwv-black',
};

