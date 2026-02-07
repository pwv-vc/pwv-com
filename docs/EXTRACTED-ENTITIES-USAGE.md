# Extracted Entities Collections

## Overview

The extracted entities data is now available as Astro content collections, making it queryable and type-safe throughout your site.

## Collections

### 1. `extractedPostEntities`

Per-post extracted data (companies, people, facts, figures, topics)

### 2. `extractedCompanies`

Aggregated company data with mention counts

### 3. `extractedPeople`

Aggregated people data with roles and mention counts

### 4. `extractedTopics`

Aggregated topic data with mention counts

## Usage Examples

### In Astro Pages

```astro
---
import {
  getExtractedCompanies,
  getExtractedPeople,
} from '@/lib/extracted-entities';

// Get all companies, sorted by mentions
const companies = await getExtractedCompanies();

// Get all people
const people = await getExtractedPeople();

// Get a specific company
import { getExtractedCompany } from '@/lib/extracted-entities';
const cursor = await getExtractedCompany('Cursor');
---

<h1>Top Companies</h1>
<ul>
  {
    companies.slice(0, 10).map((company) => (
      <li>
        {company.data.name} - {company.data.mentions} mentions
        {company.data.description && <p>{company.data.description}</p>}
      </li>
    ))
  }
</ul>
```

### Get Entities for a Specific Post

```astro
---
import { getExtractedPostEntity } from '@/lib/extracted-entities';

const postSlug = 'post-seeing-the-big-picture';
const entities = await getExtractedPostEntity(postSlug);
---

{
  entities && (
    <div>
      <h2>Mentioned in this post:</h2>
      <p>Companies: {entities.data.companies.join(', ')}</p>
      <p>People: {entities.data.people.map((p) => p.name).join(', ')}</p>
      <p>Topics: {entities.data.topics.join(', ')}</p>
    </div>
  )
}
```

### Get Related Posts

```astro
---
import {
  getPostsForCompany,
  getPostsForPerson,
} from '@/lib/extracted-entities';
import { getCollection } from 'astro:content';

// Get all posts mentioning FAL
const falPostSlugs = await getPostsForCompany('FAL');
const posts = await getCollection('posts');
const falPosts = posts.filter((post) => falPostSlugs.includes(post.id));
---

<h2>Posts about FAL</h2>
<ul>
  {
    falPosts.map((post) => (
      <li>
        <a href={`/news/${post.id}/`}>{post.data.title}</a>
      </li>
    ))
  }
</ul>
```

### Get All Facts by Category

```astro
---
import { getAllFacts } from '@/lib/extracted-entities';

// Get all philosophy insights
const philosophyFacts = await getAllFacts('philosophy');

// Get all announcements
const announcements = await getAllFacts('announcement');
---

<h2>Key Philosophies</h2>
<ul>
  {
    philosophyFacts.map((fact) => (
      <li>
        <p>{fact.text}</p>
        <small>
          From: <a href={`/news/${fact.postSlug}/`}>{fact.postTitle}</a>
        </small>
      </li>
    ))
  }
</ul>
```

### Search Entities

```astro
---
import { searchEntities } from '@/lib/extracted-entities';

const searchTerm = 'AI';
const results = await searchEntities(searchTerm);
---

<h2>Search Results for "{searchTerm}"</h2>

<h3>Companies ({results.companies.length})</h3>
<ul>
  {results.companies.map((company) => <li>{company.data.name}</li>)}
</ul>

<h3>People ({results.people.length})</h3>
<ul>
  {
    results.people.map((person) => (
      <li>
        {person.data.name} - {person.data.role}
      </li>
    ))
  }
</ul>

<h3>Topics ({results.topics.length})</h3>
<ul>
  {results.topics.map((topic) => <li>{topic.data.name}</li>)}
</ul>
```

### Display Key Figures

```astro
---
import { getAllFigures } from '@/lib/extracted-entities';

// Get all funding figures
const figures = await getAllFigures();
const fundingFigures = figures.filter(
  (f) =>
    f.context.toLowerCase().includes('funding') ||
    f.context.toLowerCase().includes('series')
);
---

<h2>Recent Funding Rounds</h2>
<ul>
  {
    fundingFigures.map((figure) => (
      <li>
        <strong>
          {figure.value} {figure.unit}
        </strong>{' '}
        - {figure.context}
        <br />
        <small>
          From: <a href={`/news/${figure.postSlug}/`}>{figure.postTitle}</a>
        </small>
      </li>
    ))
  }
</ul>
```

## Type Safety

All collections are fully typed using Zod schemas:

```typescript
import type { CollectionEntry } from 'astro:content';

type Company = CollectionEntry<'extractedCompanies'>;
type Person = CollectionEntry<'extractedPeople'>;
type Topic = CollectionEntry<'extractedTopics'>;
type PostEntity = CollectionEntry<'extractedPostEntities'>;
```

Or use the exported types:

```typescript
import type {
  ExtractedCompany,
  ExtractedPerson,
  ExtractedTopic,
  ExtractedPostEntity,
} from '@/lib/extracted-entities';
```

## Schema Definitions

### ExtractedPostEntities

```typescript
{
  id: string;              // post slug
  title: string;
  companies: string[];
  people: Array<{
    name: string;
    role: string;
  }>;
  facts: Array<{
    text: string;
    category: 'insight' | 'trend' | 'philosophy' | 'announcement' | 'milestone';
  }>;
  figures: Array<{
    value: string;         // e.g., "100M"
    context: string;       // e.g., "Series B funding"
    unit: string;          // e.g., "USD"
  }>;
  topics: string[];
  pubDate?: string;
  author?: string;
}
```

### ExtractedCompanies

```typescript
{
  id: string;              // slug-ified name
  name: string;            // Display name
  posts: string[];         // Array of post slugs
  mentions: number;
  description?: string;
}
```

### ExtractedPeople

```typescript
{
  id: string;              // slug-ified name
  name: string;            // Display name
  posts: string[];         // Array of post slugs
  mentions: number;
  role?: string;
}
```

### ExtractedTopics

```typescript
{
  id: string;              // slug-ified name
  name: string;            // Display name
  posts: string[];         // Array of post slugs
  mentions: number;
}
```

## Regenerating Data

To update the extracted entities:

```bash
# Make sure LM Studio is running with a model loaded
lms server start --port 1234

# Run the extraction script
node scripts/extract-entities.js
```

The data will be automatically picked up by Astro's content collections on the next build.

## Future Use Cases

- **Company pages**: `/companies/[company]` showing all mentions
- **People pages**: `/people/[person]` showing contributions
- **Topic pages**: `/topics/[topic]` showing related posts
- **Statistics page**: Aggregate all figures and facts
- **Related posts widget**: Show related posts based on shared entities
- **Search enhancement**: Use entities for better search results
- **Post metadata**: Show extracted entities on post pages
