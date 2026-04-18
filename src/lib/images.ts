// Import all images in src/images, eager so it's available at runtime
const images = import.meta.glob('../images/**/*', {
  eager: true,
  import: 'default',
}) as Record<string, any>;

// One token per Node process (each static build) so portfolio logos pick up CDN/browser updates on deploy.
const portfolioLogoCacheBust =
  process.env.NETLIFY_COMMIT_REF ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.CI_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  `b${Date.now()}`;

const withPortfolioLogoCacheBust = (src: string): string => {
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}pv=${encodeURIComponent(portfolioLogoCacheBust)}`;
};

/**
 * Resolves an image path to its actual src URL
 * @param path - Relative path to image from src/images directory (e.g., "logos/small/company.png")
 * @returns The resolved image src URL
 */
export const resolveImageSrc = (path: string): string => {
  const key = `../images/${path}`;
  const found = images[key];
  return typeof found === 'string' ? found : (found?.src ?? found);
};

/**
 * Like {@link resolveImageSrc} for paths under `src/images`, but appends a cache-busting query so
 * updated `logos/small/*.png` files are not stuck behind long-lived CDN or browser caches.
 */
export const resolvePortfolioLogoSrc = (path: string): string =>
  withPortfolioLogoCacheBust(resolveImageSrc(path));
