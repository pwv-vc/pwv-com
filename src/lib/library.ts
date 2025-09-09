import { getCollection } from 'astro:content';

/**
 * Get all library posts sorted by publication date (newest first)
 */
export async function getAllLibraryPosts() {
  const library = await getCollection('library');
  return library.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Get recent library posts (limited by count)
 * @param count - Number of recent posts to return (default: 6)
 */
export async function getRecentLibraryPosts(count: number = 6) {
  const allPosts = await getAllLibraryPosts();
  return allPosts.slice(0, count);
}

/**
 * Calculate reading time for content (rough estimate: 200 words per minute)
 * @param content - The content to calculate reading time for
 * @returns Estimated reading time in minutes
 */
export function getReadingTime(content: string | undefined): number {
  if (!content) return 5; // Default reading time if content is undefined
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get a single library post by slug
 * @param slug - The slug of the post to retrieve
 * @returns The library post or undefined if not found
 */
export async function getLibraryPostBySlug(slug: string) {
  const allPosts = await getAllLibraryPosts();
  return allPosts.find(post => post.id === slug);
}
