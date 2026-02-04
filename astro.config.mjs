import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Cache for posts collection to avoid refetching in serialize
let postsCache = null;
const getPostsCache = async () => {
  if (!postsCache) {
    const { getCollection } = await import('astro:content');
    postsCache = await getCollection('posts');
  }
  return postsCache;
};

// Cache for team collection to avoid refetching in serialize
let teamCache = null;
const getTeamCache = async () => {
  if (!teamCache) {
    const { getCollection } = await import('astro:content');
    teamCache = await getCollection('team');
  }
  return teamCache;
};

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: process.env.URL || process.env.DEPLOY_URL || 'http://localhost:4321',
  trailingSlash: 'always', // Ensure all URLs have trailing slashes to match Netlify behavior
  integrations: [
    mdx(),
    react(),
    sitemap({
      async serialize(item) {
        // Exclude external posts (those that redirect to external URLs)
        // These are posts with a URL field that redirect after 5 seconds
        const postSlugMatch = item.url.match(/\/news\/([^/]+)$/);
        if (postSlugMatch) {
          const posts = await getPostsCache();
          const post = posts.find((p) => p.id === postSlugMatch[1]);

          if (post?.data.url) {
            // External post - exclude from sitemap
            return undefined;
          }

          if (post) {
            // Internal post - set proper metadata
            // Published articles rarely change after being published
            item.lastmod = (
              post.data.updatedDate || post.data.pubDate
            ).toISOString();
            item.changefreq = 'yearly';
            item.priority = post.data.featured ? 0.8 : 0.6;
            return item;
          }
        }

        // Handle team member pages
        const teamSlugMatch = item.url.match(/\/team\/([^/]+)$/);
        if (teamSlugMatch) {
          const teamMembers = await getTeamCache();
          const teamMember = teamMembers.find(
            (m) => m.data.slug === teamSlugMatch[1] && m.data.hasPage === true
          );

          if (teamMember) {
            // Team member pages may be updated weekly
            item.changefreq = 'weekly';
            item.priority = 0.7;
            return item;
          }
        }

        // Set default changefreq and priority based on URL patterns
        if (item.url.endsWith('/')) {
          // Homepage and main sections
          if (item.url.endsWith('/news/')) {
            item.changefreq = 'daily';
            item.priority = 1.0;
          } else if (item.url.endsWith('/portfolio/')) {
            item.changefreq = 'daily';
            item.priority = 0.7;
          } else if (item.url.endsWith('/about/')) {
            item.changefreq = 'weekly';
            item.priority = 0.7;
          } else if (item.url.endsWith('/apply/')) {
            item.changefreq = 'monthly';
            item.priority = 0.6;
          } else if (item.url.endsWith('/explore/')) {
            // Explore terminal page
            item.changefreq = 'weekly';
            item.priority = 0.7;
          } else if (item.url.endsWith('/explore/companies/')) {
            // Explore companies page - updates when new posts mention companies
            item.changefreq = 'daily';
            item.priority = 0.7;
          } else if (item.url.endsWith('/explore/people/')) {
            // Explore people page - updates when new posts mention people
            item.changefreq = 'daily';
            item.priority = 0.7;
          } else if (item.url.endsWith('/explore/quotes/')) {
            // Explore quotes page - updates when new posts add quotes
            item.changefreq = 'daily';
            item.priority = 0.7;
          } else if (item.url.match(/\/$/)) {
            // Homepage
            item.changefreq = 'daily';
            item.priority = 1.0;
          }
        } else if (
          item.url.includes('/news/tags/') ||
          item.url.includes('/news/author/')
        ) {
          // Tag and author pages
          item.changefreq = 'daily';
          item.priority = 0.6;
        } else if (item.url.includes('/portfolio/tags/')) {
          // Portfolio tag pages
          item.changefreq = 'weekly';
          item.priority = 0.6;
        } else if (item.url.includes('/news/')) {
          // Individual news posts (fallback for ones not caught above)
          // Published articles rarely change after being published
          item.changefreq = 'yearly';
          item.priority = 0.6;
        }

        return item;
      },
      filter(page) {
        // Exclude paginated pages (page > 1)
        if (
          /\/news\/tags\/[^/]+\/\d+/.test(page) ||
          /\/news\/author\/[^/]+\/\d+/.test(page)
        ) {
          return false;
        }

        // Exclude RSS pages
        if (page.includes('/rss') || page.includes('/rss.xml')) {
          return false;
        }

        // Exclude 404 page
        if (page.includes('/404')) {
          return false;
        }

        // Exclude thank-you page
        if (page.includes('/apply/thank-you')) {
          return false;
        }

        return true;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
