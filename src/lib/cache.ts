/**
 * Simple in-memory cache utility for Astro content collections
 * This helps reduce repeated content fetching during build time
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ContentCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 2 * 60 * 1000; // 2 minutes for SSR (shorter TTL for more dynamic content)

  /**
   * Get cached data if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
export const contentCache = new ContentCache();

/**
 * Cache decorator for async functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : `${fn.name}-${JSON.stringify(args)}`;

    const cached = contentCache.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    contentCache.set(key, result);
    return result;
  }) as T;
}
