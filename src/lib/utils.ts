import clsx, { type ClassValue } from 'clsx';

/**
 * Utility function to merge class names using clsx
 * This is a common pattern for combining Tailwind classes conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
