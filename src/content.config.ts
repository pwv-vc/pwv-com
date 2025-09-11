// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

import { file, glob } from 'astro/loaders';

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
    tags: z.array(z.string()),
    slug: z.string(),
    'company-slug': z.string(),
  }),
});

const library = defineCollection({
  // Load Markdown and MDX files in the `src/content/library/` directory.
  loader: glob({ base: './src/content/library', pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: z.string().optional(),
      // if a url is provided, it will be used to link to a remote resource
      url: z.string().url().optional(),
      // Transform string to Date objects
      pubDate: z.string().transform((str) => new Date(str)),
      updatedDate: z
        .string()
        .transform((str) => new Date(str))
        .optional(),
      // if a hero image is provided, it will be used to display an image in the library
      // if no hero image is provided, the library item will display a placeholder image
      heroImage: image().optional(),
      tags: z.array(z.string()),
      // featured post
      featured: z.boolean().optional(),
    }),
});

export const collections = {
  representativePortfolio,
  rollingFundPortfolio,
  angelPortfolio,
  testimonials,
  library,
};
