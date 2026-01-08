import clsx, { type ClassValue } from 'clsx';

/**
 * Utility function to merge class names using clsx
 * This is a common pattern for combining Tailwind classes conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Convert a company name to a slug for portfolio links
 * This matches the slug format used in the portfolio collections
 */
export function companyNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Generate a portfolio link for a company name
 * Returns the portfolio page URL with a tag filter for the company
 */
export function getCompanyPortfolioLink(companyName: string): string {
  const slug = companyNameToSlug(companyName);
  return `/portfolio?company=${slug}`;
}
