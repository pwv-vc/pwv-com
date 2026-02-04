# Entity Files - What's Needed and Why

## Overview

Analysis of which entity files are necessary and why both individual post files and the aggregated file are required for the system to function correctly.

## File Structure

```
src/content/entities/
├── posts/                    # ✅ REQUIRED - Individual post entities
│   ├── post-1.json
│   ├── post-2.json
│   └── ...
└── aggregated.json           # ✅ REQUIRED - Cross-post aggregations
```

## Why Both Are Needed

### Individual Post Files (`posts/*.json`) - REQUIRED

**Purpose:** Store per-post entity data

**Used By:**
1. **Astro Content Collection** - `extractedPostEntities`
   ```typescript
   const postEntities = await getCollection('extractedPostEntities');
   // Loads individual files via glob loader
   ```

**Benefits:**
- Progressive saves during extraction
- Memory efficient
- Easy to update individual posts
- Git-friendly diffs
- Enable future incremental updates

**Schema:**
```json
{
  "slug": "post-slug",
  "title": "Post Title",
  "companies": ["Company A", "Company B"],
  "investors": ["VC Firm"],
  "people": [{"name": "John Doe", "role": "CEO"}],
  "facts": [...],
  "quotes": [...],
  "topics": [...]
}
```

### Aggregated File (`aggregated.json`) - REQUIRED

**Purpose:** Store cross-post aggregations and entity indexes

**Used By:**

1. **Terminal Interface** (`src/components/Terminal/TerminalInterface.tsx`)
   ```typescript
   import entitiesData from '../../content/entities/aggregated.json';
   // Needs full aggregated data for interactive queries
   ```

2. **Entity Utilities** (`src/lib/entities.ts`)
   ```typescript
   const data = await import('../content/entities/aggregated.json');
   // Provides search and query helpers
   ```

3. **Astro Content Collections** - 5 aggregated collections:
   - `extractedCompanies` - All companies with post references
   - `extractedInvestors` - All investors with post references
   - `extractedPeople` - All people with post references
   - `extractedTopics` - All topics with post references
   - `extractedQuotes` - All quotes with post/speaker references

**Data Structure:**
```json
{
  "posts": {
    "post-1": { /* post data */ },
    "post-2": { /* post data */ }
  },
  "entities": {
    "companies": {
      "Company A": {
        "posts": ["post-1", "post-3"],
        "mentions": 2
      }
    },
    "investors": { /* cross-post investor aggregations */ },
    "people": { /* cross-post people aggregations */ },
    "topics": { /* cross-post topic aggregations */ },
    "quotes": [
      {
        "quote": "...",
        "speaker": "...",
        "postSlug": "post-1",
        "postTitle": "...",
        "pubDate": "..."
      }
    ]
  },
  "metadata": {
    "extractedAt": "2026-02-04T...",
    "totalPosts": 67,
    "dateRange": {
      "oldest": "2023-07-12",
      "newest": "2026-01-29"
    }
  }
}
```

## Why Can't We Eliminate Aggregated File?

### Option 1: Compute Aggregations at Build Time ❌

**Pros:**
- Single source of truth (individual files)
- No redundant data

**Cons:**
- Terminal interface needs runtime data (client-side)
- Would need to ship all individual files to browser (~200KB+)
- Or compute aggregations server-side and pass as props
- Significant refactoring required
- Performance impact

### Option 2: Keep Both Files ✅ (Current Approach)

**Pros:**
- Terminal interface works with static import
- Content collections get optimized data
- No runtime aggregation needed
- Best performance
- Simple architecture

**Cons:**
- Slight data redundancy (individual files + aggregated)
- Both files need to be kept in sync

**Verdict:** Keep both files - the benefits far outweigh the minimal redundancy.

## Build Verification

### Successful Build:
```bash
pnpm run build
# [build] 251 page(s) built in 3.18s
# [build] Complete! ✅
```

### Expected Warnings:
```
[WARN] [file-loader] No items found in src/content/entities/aggregated.json
```

**These are normal** when:
- Only a few posts extracted (e.g., with `--limit 2`)
- Some entity categories are empty (e.g., no quotes)
- Collections return empty arrays (not an error)

**These warnings disappear with full extraction** when all 67 posts are processed.

## Content Collections

### Collections Using Individual Files:
```typescript
// Uses glob loader - reads posts/*.json
extractedPostEntities
```

### Collections Using Aggregated File:
```typescript
// All use file loader - read aggregated.json
extractedCompanies
extractedInvestors
extractedPeople
extractedTopics
extractedQuotes
```

## Terminal Interface Dependencies

The interactive terminal (`/explore` page) requires:

```typescript
// Direct import of aggregated data
import entitiesData from '../../content/entities/aggregated.json';

// Used for:
- "list companies" - needs all companies across posts
- "list investors" - needs all investors across posts
- "list people" - needs all people across posts
- "list topics" - needs all topics across posts
- "list quotes" - needs all quotes across posts
- "discover company X" - needs post references
- "stats" - needs mention counts
- Search and filtering
```

**Cannot work without aggregated.json** unless we:
1. Load all individual files client-side (heavy)
2. Pre-compute and pass as props (complex)
3. Create API endpoint (over-engineered)

## File Size Comparison

### Current (Both Files):
- Individual files: ~500 bytes × 67 = ~33KB
- Aggregated file: ~350KB
- **Total: ~383KB**

### Alternative (Aggregated Only):
- Single file: ~350KB
- **Total: ~350KB**

**Difference: Only 33KB (~9% increase)**

The memory efficiency and progressive saves during extraction make the 33KB overhead worthwhile.

## Best Practices

### During Development:
```bash
# Test with limited posts
node scripts/extract-entities.js --limit 5

# Warnings are normal with limited data
# Build still succeeds
```

### Production:
```bash
# Full extraction
node scripts/extract-entities.js

# All collections populated
# No warnings
# Complete aggregations
```

### Incremental Updates (Future):
```bash
# Only re-extract modified posts
# Update individual files
# Regenerate aggregated file from all individual files
```

## Summary

| File | Required? | Purpose | Size |
|------|-----------|---------|------|
| `posts/*.json` | ✅ Yes | Individual post data, progressive saves | ~33KB |
| `aggregated.json` | ✅ Yes | Cross-post aggregations, terminal UI | ~350KB |
| ~~`extracted-entities.json`~~ | ❌ No | Old single file (removed) | - |

**Both files are necessary** for the system to function correctly:
- Individual files: Enable efficient extraction and future enhancements
- Aggregated file: Required by terminal interface and aggregation collections

The current architecture is optimal for:
- ✅ Performance
- ✅ Memory efficiency
- ✅ Developer experience
- ✅ Future scalability
- ✅ User experience (interactive terminal)

**Recommendation:** Keep both files. The architecture is sound and production-ready.
