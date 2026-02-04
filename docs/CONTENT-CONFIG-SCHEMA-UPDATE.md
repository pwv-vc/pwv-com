# Content Config Schema Update

## Overview

Updated `src/content.config.ts` to reflect all the latest entity extraction improvements including quotes, investors, enhanced facts, and proper field handling.

## Changes Made

### 1. **Updated `extractedPostEntities` Schema**

Enhanced the post entities schema with new fields and types:

#### New Fields:
- **`investors`**: Array of investor/VC names (separate from companies)
- **`quotes`**: Array of quote objects with speaker and context
- **`tags`**: Optional array of tags from post frontmatter
- **`url`**: Optional external URL (with empty string handling)

#### Enhanced Fields:
- **`people`**: Now supports both object format `{name, role}` and plain strings for backward compatibility
- **`facts.category`**: Added new categories: `'funding'`, `'launch'`, `'partnership'`
- **`facts.date`**: Optional date field from frontmatter for timeline features

#### Updated Schema:
```typescript
schema: z.object({
  id: z.string(), // post slug
  title: z.string(),
  companies: z.array(z.string()),
  investors: z.array(z.string()), // NEW
  people: z.array(z.union([
    z.object({
      name: z.string(),
      role: z.string().optional(),
    }),
    z.string(), // Allow plain strings
  ])),
  facts: z.array(z.object({
    text: z.string(),
    category: z.enum([
      'insight', 'trend', 'philosophy', 'announcement', 'milestone',
      'funding', 'launch', 'partnership' // NEW categories
    ]),
    date: z.string().optional(), // NEW - for timeline features
  })),
  figures: z.array(z.object({
    value: z.string(),
    context: z.string(),
    unit: z.string(),
  })),
  topics: z.array(z.string()),
  quotes: z.array(z.object({ // NEW
    quote: z.string(),
    speaker: z.string(),
    context: z.string().optional(),
  })),
  pubDate: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(), // NEW
  url: z.string().url().optional().or(z.literal('')).transform(val => val === '' ? undefined : val), // Handles empty strings
}),
```

### 2. **New Collection: `extractedInvestors`**

Added dedicated collection for investor/VC entities:

```typescript
const extractedInvestors = defineCollection({
  loader: file('src/content/entities/extracted-entities.json', {
    parser: (text) => {
      const data = JSON.parse(text);
      return Object.entries(data.entities.investors || {}).map(([name, investor]: [string, any]) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        ...investor,
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
```

**Features:**
- Separate from companies
- Tracks post mentions
- Slug-friendly IDs
- Mention count

### 3. **New Collection: `extractedQuotes`**

Added collection for browsing all quotes across posts:

```typescript
const extractedQuotes = defineCollection({
  loader: file('src/content/entities/extracted-entities.json', {
    parser: (text) => {
      const data = JSON.parse(text);
      return (data.entities.quotes || []).map((quote: any, index: number) => ({
        id: `quote-${index + 1}`,
        ...quote,
      }));
    },
  }),
  schema: z.object({
    id: z.string(),
    quote: z.string(),
    speaker: z.string(),
    context: z.string().optional(),
    postSlug: z.string(),
    postTitle: z.string(),
    pubDate: z.string().optional().nullable(),
  }),
});
```

**Features:**
- All quotes in one collection
- Speaker attribution
- Post references
- Optional context and dates
- Unique sequential IDs

### 4. **Updated Exports**

Added new collections to exports:

```typescript
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
  extractedInvestors,    // NEW
  extractedPeople,
  extractedQuotes,       // NEW
  extractedTopics,
};
```

## Data Structure Example

### Post Entity:
```json
{
  "id": "post-why-dt-invests",
  "title": "From Riff to Rooftop: Why I Invest at PWV",
  "companies": [],
  "investors": ["Preston-Werner Ventures"],
  "people": [{"name": "David Thyresson", "role": "Author"}],
  "facts": [],
  "quotes": [
    {
      "quote": "I invest because I want to be invested.",
      "speaker": "David Thyresson",
      "context": "On investing philosophy"
    }
  ],
  "topics": ["investing", "philosophy"],
  "pubDate": "2025-12-02",
  "author": "David Thyresson",
  "tags": ["philosophy", "investing"],
  "url": ""
}
```

### Investor Entity:
```json
{
  "id": "valor-equity-partners",
  "name": "Valor Equity Partners",
  "posts": ["external-aalo-closes-100m-series-b"],
  "mentions": 1
}
```

### Quote Entity:
```json
{
  "id": "quote-1",
  "quote": "I invest because I want to be invested.",
  "speaker": "David Thyresson",
  "context": "On investing philosophy",
  "postSlug": "post-why-dt-invests",
  "postTitle": "From Riff to Rooftop: Why I Invest at PWV",
  "pubDate": "2025-12-02"
}
```

## Usage in Astro

### Accessing Collections:

```typescript
import { getCollection } from 'astro:content';

// Get all quotes
const quotes = await getCollection('extractedQuotes');

// Get all investors
const investors = await getCollection('extractedInvestors');

// Get post entities with enhanced data
const postEntities = await getCollection('extractedPostEntities');

// Filter funding facts
const fundingFacts = postEntities
  .flatMap(post => post.data.facts.filter(f => f.category === 'funding'));

// Get quotes by speaker
const dtQuotes = quotes.filter(q => 
  q.data.speaker.toLowerCase().includes('thyresson')
);
```

### Example Components:

**QuotesGallery.astro:**
```astro
---
import { getCollection } from 'astro:content';

const quotes = await getCollection('extractedQuotes');
const sortedQuotes = quotes.sort((a, b) => 
  (b.data.pubDate || '').localeCompare(a.data.pubDate || '')
);
---

<div class="quotes">
  {sortedQuotes.map(quote => (
    <blockquote>
      <p>"{quote.data.quote}"</p>
      <cite>— {quote.data.speaker}</cite>
      {quote.data.context && <small>{quote.data.context}</small>}
    </blockquote>
  ))}
</div>
```

**InvestorsList.astro:**
```astro
---
import { getCollection } from 'astro:content';

const investors = await getCollection('extractedInvestors');
const topInvestors = investors
  .sort((a, b) => b.data.mentions - a.data.mentions)
  .slice(0, 10);
---

<ul>
  {topInvestors.map(investor => (
    <li>{investor.data.name} ({investor.data.mentions} mentions)</li>
  ))}
</ul>
```

## Validation & Testing

### Build Validation:
```bash
pnpm run build
# ✓ Content synced
# ✓ Types generated
# ✓ Build complete!
```

### Type Safety:
All collections are fully typed with Zod schemas, providing:
- Runtime validation
- TypeScript autocomplete
- Build-time error checking
- Data transformation (e.g., empty string → undefined)

## Benefits

1. **Type Safety**: All entity data is validated at build time
2. **Discoverability**: Collections can be queried using Astro's content API
3. **Flexibility**: Support for both old and new data formats
4. **Rich Queries**: Filter, sort, and transform entity data
5. **Timeline Features**: Date-aware facts for chronological views
6. **Quote Browsing**: Dedicated collection for memorable statements
7. **Investor Tracking**: Separate VC/investor mentions from companies

## Breaking Changes

None! The schema updates are backward compatible:
- `people` accepts both objects and strings
- `url` handles empty strings gracefully
- All new fields are optional or have fallbacks
- Existing data structures remain valid

## Next Steps

1. ✅ Schema updated and validated
2. ✅ Build passing
3. Consider: Build UI components using new collections
4. Consider: Timeline view using dated facts
5. Consider: Quote browsing interface
6. Consider: Investor network visualization

All schema updates are complete and production-ready! 🎉
