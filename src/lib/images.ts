// Import all images in src/images, eager so it's available at runtime
const images = import.meta.glob('../images/**/*', {
  eager: true,
  import: 'default',
}) as Record<string, any>;

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
