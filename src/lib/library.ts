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

/**
 * Get next and previous posts for navigation
 * @param currentSlug - The slug of the current post
 * @returns Object containing next and previous posts
 * Note: Posts are sorted newest first, so:
 * - previousPost = newer post (index - 1)
 * - nextPost = older post (index + 1)
 */
export async function getPostNavigation(currentSlug: string) {
  const allPosts = await getAllLibraryPosts();
  const currentIndex = allPosts.findIndex(post => post.id === currentSlug);

  if (currentIndex === -1) {
    return { nextPost: undefined, previousPost: undefined };
  }

  return {
    previousPost: currentIndex > 0 ? allPosts[currentIndex - 1] : undefined,
    nextPost: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined
  };
}

/**
 * Get external library posts (posts with a URL field)
 * @returns Array of external library posts sorted by publication date (newest first)
 */
export async function getExternalLibraryPosts() {
  const allPosts = await getAllLibraryPosts();
  return allPosts.filter(post => post.data.url);
}

/**
 * Get non-external library posts (posts without a URL field)
 * @returns Array of non-external library posts sorted by publication date (newest first)
 */
export async function getNonExternalLibraryPosts() {
  const allPosts = await getAllLibraryPosts();
  return allPosts.filter(post => !post.data.url);
}
