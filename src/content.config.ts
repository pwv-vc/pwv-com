// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

import { file } from 'astro/loaders';

const portfolioSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  tags: z.array(z.string()),
  slug: z.string(),
});

const representativePortfolio = defineCollection({
  loader: file('src/content/portfolio/rolling-fund.json'),
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
  }),
});

export const collections = {
  representativePortfolio,
  rollingFundPortfolio,
  angelPortfolio,
  testimonials,
};
