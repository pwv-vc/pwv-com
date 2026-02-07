# Explore Page Dynamic Aggregation Fix

## Overview

Fixed the `explore.astro` page to dynamically aggregate entity data from individual post files instead of trying to load non-existent aggregated collections (`extractedCompanies`, `extractedInvestors`, `extractedPeople`, `extractedTopics`, `extractedQuotes`).

## Problem

The `explore.astro` page was trying to load entity collections that were removed in the previous refactoring:

```typescript
// ❌ These collections don't exist anymore
const companies = await getCollection('extractedCompanies');
const investors = await getCollection('extractedInvestors');
const people = await getCollection('extractedPeople');
const topics = await getCollection('extractedTopics');
const quotes = await getCollection('extractedQuotes');
```

This caused build warnings:
```
The collection "extractedQuotes" does not exist or is empty.
The collection "extractedCompanies" does not exist or is empty.
... etc
```

## Solution

Updated `src/pages/explore.astro` to dynamically aggregate entities from individual post files at build time.

### Key Changes

1. **Load only individual post files**:
   ```typescript
   const postEntities = await getCollection('extractedPostEntities');
   ```

2. **Create aggregation maps**:
   ```typescript
   const companiesMap = new Map<string, { posts: string[], mentions: number }>();
   const investorsMap = new Map<string, { posts: string[], mentions: number }>();
   const peopleMap = new Map<string, { posts: string[], mentions: number, role?: string }>();
   const topicsMap = new Map<string, { posts: string[], mentions: number }>();
   const quotesArray: Array<{ ... }> = [];
   ```

3. **Iterate through posts to aggregate**:
   ```typescript
   for (const post of postEntities) {
     const { slug, title, companies, investors, people, topics, quotes, pubDate } = post.data;
     
     // Aggregate each entity type
     companies.forEach(company => {
       if (!companiesMap.has(company)) {
         companiesMap.set(company, { posts: [], mentions: 0 });
       }
       const companyData = companiesMap.get(company)!;
       companyData.posts.push(slug);
       companyData.mentions += 1;
     });
     // ... repeat for investors, people, topics, quotes
   }
   ```

4. **Build final data structure**:
   ```typescript
   const entitiesData = {
     posts: Object.fromEntries(
       postEntities.map(post => [post.id, post.data])
     ),
     entities: {
       companies: Object.fromEntries(companiesMap),
       investors: Object.fromEntries(investorsMap),
       people: Object.fromEntries(peopleMap),
       topics: Object.fromEntries(topicsMap),
       quotes: quotesArray,
     },
     metadata: {
       extractedAt: new Date().toISOString(),
       totalPosts: postEntities.length,
     }
   };
   ```

## Benefits

### 1. **Single Source of Truth** ✅
- Entity data comes only from individual post files (`src/content/entities/posts/*.json`)
- No redundant aggregated collections to maintain
- No sync issues between multiple data sources

### 2. **Clean Build** ✅
- No warnings about missing collections
- All data computed at build time
- Type-safe aggregation with TypeScript

### 3. **Maintainability** ✅
- Clear data flow: individual files → dynamic aggregation → terminal interface
- Easy to understand and modify
- Follows Astro best practices

### 4. **Performance** ✅
- Build-time aggregation (not runtime)
- Data passed as props to React component
- No client-side data loading

## Data Flow

```
Individual Post Files (src/content/entities/posts/*.json)
  ↓
getCollection('extractedPostEntities')
  ↓
Dynamic Aggregation in explore.astro
  ↓
entitiesData object
  ↓
Props to <TerminalInterface>
  ↓
QueryEngine for terminal commands
```

## Aggregation Logic

### Companies, Investors, Topics
- Simple frequency counting
- Track which posts mention each entity
- Count total mentions

### People
- Handle both string and object formats:
  - `"John Doe"` (string)
  - `{"name": "John Doe", "role": "CEO"}` (object)
- Preserve role information when available
- Track posts and mentions

### Quotes
- Collect all quotes from all posts
- Enrich with post metadata:
  - `postSlug`: Post identifier
  - `postTitle`: Post title
  - `pubDate`: Publication date
- Maintain quote, speaker, and optional context

## Validation

### Build Success ✅
```bash
pnpm run build
# [build] 251 page(s) built in 2.94s
# [build] Complete!
```

### No Warnings ✅
```bash
# No "does not exist or is empty" warnings
# Clean build output
```

### Data Structure ✅
- All entity types properly aggregated
- Terminal interface receives correct data format
- TypeScript types validated

## Files Modified

1. **`src/pages/explore.astro`**
   - Removed `getCollection` calls for aggregated collections
   - Added dynamic aggregation logic
   - Maintained same output data structure for terminal interface

## Related Documentation

- [ENTITIES-SINGLE-SOURCE-OF-TRUTH.md](./ENTITIES-SINGLE-SOURCE-OF-TRUTH.md) - Overall architecture
- [ENTITIES-INDIVIDUAL-FILES.md](./ENTITIES-INDIVIDUAL-FILES.md) - Individual file structure
- [CONTENT-CONFIG-SCHEMA-UPDATE.md](./CONTENT-CONFIG-SCHEMA-UPDATE.md) - Content collection schemas

## Future Improvements

### Potential Optimizations:
1. **Cache aggregation results**:
   - Use Astro's static data endpoints
   - Generate JSON at build time for client use

2. **Add aggregation utilities**:
   - Extract aggregation logic to `src/lib/aggregate-entities.ts`
   - Reuse in other pages if needed

3. **Add aggregation tests**:
   - Verify entity counts
   - Check data structure integrity
   - Validate TypeScript types

## Summary

The `explore.astro` page now dynamically aggregates entity data from individual post files at build time, eliminating the need for separate aggregated collections. This provides:

✅ **Single source of truth** - Only `src/content/entities/posts/*.json` files  
✅ **Clean builds** - No collection warnings  
✅ **Type safety** - Full TypeScript validation  
✅ **Maintainability** - Clear, simple data flow  
✅ **Performance** - Build-time aggregation

The terminal interface works perfectly with the dynamically aggregated data! 🎉

---

**Date**: February 4, 2026  
**Status**: ✅ Implemented and verified
