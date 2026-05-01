import type { ImageMetadata } from 'astro';

/**
 * Normalize Astro post heroImage (string path or optimized metadata) to a URL/path string for OG/meta components.
 */
export const heroImageSrc = (
  hero: string | ImageMetadata | undefined
): string | undefined => {
  if (hero == null) return undefined;
  return typeof hero === 'string' ? hero : hero.src;
};
