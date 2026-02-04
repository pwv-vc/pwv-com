// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

import { file, glob } from 'astro/loaders';

// Helper function to parse date strings as local dates
const parseLocalDate = (dateStr: string): Date => {
  let date: Date;

  // Handle ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    // Handle other formats by using JavaScript's built-in Date parsing
    // but ensure it's treated as local time
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }
    // Convert to local date to avoid timezone issues
    date = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  // Validate the date is valid
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return date;
};

const portfolioSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  tags: z.array(z.string()),
  slug: z.string(),
  formerly: z.string().optional(),
  acquiredBy: z.string().optional(),
});

const representativePortfolio = defineCollection({
  loader: file('src/content/portfolio/representative.json'),
  schema: portfolioSchema,
});

const rollingFundPortfolio = defineCollection({
  loader: file('src/content/portfolio/rolling-fund.json'),
  schema: portfolioSchema,
});

const fundOnePortfolio = defineCollection({
  loader: file('src/content/portfolio/fund-1.json'),
  schema: portfolioSchema,
});

const angelPortfolio = defineCollection({
  loader: file('src/content/portfolio/angel.json'),
  schema: portfolioSchema,
});

const testimonials = defineCollection({
  loader: file('src/content/testimonials/testimonials.json'),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    company: z.string(),
    quote: z.string(),
    url: z.string().url().optional(),
    avatarUrl: z.string().optional(),
    tags: z.array(z.string()),
    slug: z.string(),
    'company-slug': z.string(),
    position: z.number(),
  }),
});

const team = defineCollection({
  loader: glob({ base: './src/content/team', pattern: '**/*.json' }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    bio: z.string(),
    hoverLine: z.string(),
    isGeneralPartner: z.boolean().optional().default(false),
    slug: z.string(),
    position: z.number(),
    section: z.string(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    github: z.string().optional(),
    bluesky: z.string().optional(),
    website: z.string().optional(),
    includePosts: z.boolean().optional().default(false),
    authorName: z.string().optional(),
    // Person schema fields
    givenName: z.string().optional(),
    familyName: z.string().optional(),
    nickname: z.string().optional(),
    schemaDescription: z.string().optional(), // Enhanced description for schema
    schemaImage: z.string().optional(), // Image path for schema (e.g., '/assets/press/tom-preston-werner.jpg')
    schemaJobTitle: z.string().optional(), // Override job title for schema
    affiliation: z
      .array(
        z.object({
          '@type': z.string().optional(),
          name: z.string(),
        })
      )
      .optional(),
    knowsAbout: z.array(z.string()).optional(),
    nationality: z.string().optional(),
    alumniOf: z
      .array(
        z.object({
          '@type': z.string().optional(),
          name: z.string(),
        })
      )
      .optional(),
    homeLocation: z
      .object({
        '@type': z.string().optional(),
        name: z.string(),
      })
      .optional(),
    hasPage: z.boolean().optional().default(false),
  }),
});

const posts = defineCollection({
  // Load Markdown and MDX files in the `src/content/library/` directory.
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: z.string().optional(),
      // if a url is provided, it will be used to link to a remote resource
      url: z.string().url().optional(),
      // Transform string to Date objects using date-fns for proper parsing
      // Use helper function to create local dates and avoid timezone issues
      pubDate: z.string().transform(parseLocalDate),
      updatedDate: z.string().transform(parseLocalDate).optional(),
      // if a hero image is provided, it will be used to display an image in the library
      // if no hero image is provided, the library item will display a placeholder image
      heroImage: image().optional(),
      tags: z.array(z.string()),
      // featured post
      featured: z.boolean().optional(),
      aiGeneratedImage: z.boolean().optional().default(false),
      aiGeneratedDescription: z.boolean().optional().default(false),
    }),
});

const locationEnum = z.enum([
  'San Francisco, CA',
  'Boston, MA',
  'Austin, TX',
  'Berkeley, CA',
  'Cambridge, MA',
  'Cambridge, UK',
  'London, UK',
  'Denver, CO',
  'Colorado',
  'Berlin, DE',
  'Munich, DE',
  'Riyadh, KSA',
  'Virtual',
]);

const events = defineCollection({
  loader: glob({ base: './src/content/events/2025-year-in-review/events', pattern: '**/*.json' }),
  schema: z.object({
    id: z.string(),
    date: z.string().transform(parseLocalDate),
    title: z.string(),
    category: z.array(z.string()),
    company: z.string().optional(),
    companies: z.array(z.string()).optional(),
    description: z.string(),
    link: z.string().url().optional(),
    links: z.array(z.object({
      url: z.string().url(),
      label: z.string(),
    })).optional(),
    location: locationEnum.optional(),
    emoji: z.string().optional(),
    time: z.string().optional(),
    logo: z.string().optional(),
    media: z.array(z.object({
      type: z.enum(['image', 'video', 'spotify']),
      src: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
    })).optional(),
  }),
});

const eventMeta = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/index.json' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    description: z.string(),
    intro: z.string().optional(),
  }),
});

const yearInReviewStats = defineCollection({
  loader: file('src/content/events/2025-year-in-review/stats.json'),
  schema: z.object({
    id: z.string(),
    key: z.string(),
    value: z.union([z.number(), z.string()]),
    caption: z.string(),
    color: z.string(),
    position: z.number(),
  }),
});

// Extracted Entities Collections
// These are generated by scripts/extract-entities.js and provide AI-extracted data from blog posts

const extractedPostEntities = defineCollection({
  loader: file('src/data/extracted-entities.json', {
    parser: (text) => {
      const data = JSON.parse(text);
      // Transform posts object into array for collection
      return Object.entries(data.posts).map(([slug, post]: [string, any]) => ({
        id: slug,
        ...post,
      }));
    },
  }),
  schema: z.object({
    id: z.string(), // post slug
    title: z.string(),
    companies: z.array(z.string()),
    people: z.array(z.object({
      name: z.string(),
      role: z.string(),
    })),
    facts: z.array(z.object({
      text: z.string(),
      category: z.enum(['insight', 'trend', 'philosophy', 'announcement', 'milestone']),
    })),
    figures: z.array(z.object({
      value: z.string(),
      context: z.string(),
      unit: z.string(),
    })),
    topics: z.array(z.string()),
    pubDate: z.string().optional(),
    author: z.string().optional(),
  }),
});

const extractedCompanies = defineCollection({
  loader: file('src/data/extracted-entities.json', {
    parser: (text) => {
      const data = JSON.parse(text);
      // Transform companies object into array for collection
      return Object.entries(data.entities.companies).map(([name, company]: [string, any]) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), // Create slug-friendly ID
        name,
        ...company,
      }));
    },
  }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    posts: z.array(z.string()), // Array of post slugs
    mentions: z.number(),
    description: z.string().optional(),
  }),
});

const extractedPeople = defineCollection({
  loader: file('src/data/extracted-entities.json', {
    parser: (text) => {
      const data = JSON.parse(text);
      // Transform people object into array for collection
      return Object.entries(data.entities.people).map(([name, person]: [string, any]) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), // Create slug-friendly ID
        name,
        ...person,
      }));
    },
  }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    posts: z.array(z.string()), // Array of post slugs
    mentions: z.number(),
    role: z.string().optional(),
  }),
});

const extractedTopics = defineCollection({
  loader: file('src/data/extracted-entities.json', {
    parser: (text) => {
      const data = JSON.parse(text);
      // Transform topics object into array for collection
      return Object.entries(data.entities.topics).map(([name, topic]: [string, any]) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), // Create slug-friendly ID
        name,
        ...topic,
      }));
    },
  }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    posts: z.array(z.string()), // Array of post slugs
    mentions: z.number(),
  }),
});

export const collections = {
  representativePortfolio,
  rollingFundPortfolio,
  fundOnePortfolio,
  angelPortfolio,
  testimonials,
  team,
  posts,
  events,
  eventMeta,
  yearInReviewStats,
  extractedPostEntities,
  extractedCompanies,
  extractedPeople,
  extractedTopics,
};
