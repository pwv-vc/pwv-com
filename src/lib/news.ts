import { getCollection } from 'astro:content';
import { contentCache, cached } from './cache';

/**
 * Get all posts sorted by publication date (newest first)
 * Uses advanced caching to improve performance
 */
export const getAllPosts = cached(
  async () => {
    const library = await getCollection('posts');
    return library.sort(
      (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
    );
  },
  () => 'all-posts'
);

/**
 * Clear the posts cache (useful for development or when content changes)
 */
export function clearPostsCache() {
  contentCache.delete('all-posts');
}

/**
 * Get recent posts (limited by count)
 * @param count - Number of recent posts to return (default: 6)
 */
export async function getRecentPosts(count: number = 6) {
  const allPosts = await getAllPosts();
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
 * Get a single  post by slug
 * @param slug - The slug of the post to retrieve
 * @returns The  post or undefined if not found
 */
export async function getPostBySlug(slug: string) {
  const allPosts = await getAllPosts();
  return allPosts.find((post) => post.id === slug);
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
  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex((post) => post.id === currentSlug);

  if (currentIndex === -1) {
    return { nextPost: undefined, previousPost: undefined };
  }

  return {
    previousPost: currentIndex > 0 ? allPosts[currentIndex - 1] : undefined,
    nextPost:
      currentIndex < allPosts.length - 1
        ? allPosts[currentIndex + 1]
        : undefined,
  };
}

/**
 * Get external library posts (posts with a URL field)
 * @returns Array of external library posts sorted by publication date (newest first)
 */
export const getExternalPosts = cached(
  async () => {
    const allPosts = await getAllPosts();
    return allPosts.filter((post) => post.data.url);
  },
  () => 'external-posts'
);

/**
 * Get non-external library posts (posts without a URL field)
 * @returns Array of non-external library posts sorted by publication date (newest first)
 */
export const getNonExternalPosts = cached(
  async () => {
    const allPosts = await getAllPosts();
    return allPosts.filter((post) => !post.data.url);
  },
  () => 'non-external-posts'
);

/**
 * Get featured library posts (posts with featured: true)
 * @returns Array of featured library posts sorted by publication date (newest first)
 */
export const getFeaturedPosts = cached(
  async () => {
    const allPosts = await getAllPosts();
    return allPosts.filter((post) => post.data.featured === true);
  },
  () => 'featured-posts'
);

/**
 * Get paginated library posts
 * @param page - Page number (1-based)
 * @param pageSize - Number of posts per page
 * @param filter - Filter type: 'all', 'community', or 'pwv'
 * @returns Object containing posts, pagination info, and total count
 */
export async function getPaginatedPosts(
  page: number = 1,
  pageSize: number = 12,
  filter: 'all' | 'community' | 'pwv' = 'all'
) {
  let posts: any[];

  switch (filter) {
    case 'community':
      posts = await getExternalPosts();
      break;
    case 'pwv':
      posts = await getNonExternalPosts();
      break;
    default:
      posts = await getAllPosts();
  }

  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    pagination: {
      currentPage: page,
      totalPages,
      pageSize,
      totalPosts,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    },
  };
}
