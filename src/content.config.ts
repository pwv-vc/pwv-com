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

export const collections = {
  representativePortfolio,
  rollingFundPortfolio,
  fundOnePortfolio,
  angelPortfolio,
  testimonials,
  team,
  posts,
};
