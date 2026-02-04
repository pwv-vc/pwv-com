# Entities File Location Update

## Overview

Moved the extracted entities JSON file from `src/data/` to `src/content/entities/` to follow Astro's content collection conventions and best practices.

## Changes Made

### File Location

**Before:**
```
src/data/extracted-entities.json
```

**After:**
```
src/content/entities/extracted-entities.json
```

### Rationale

1. **Astro Content Collection Pattern**: Content collections in Astro should live under `src/content/` with their own subdirectory
2. **Consistency**: All other collections (portfolio, posts, events, etc.) are in `src/content/`
3. **Clarity**: The `entities` subfolder clearly indicates this is a content collection
4. **Best Practice**: Follows the standard Astro project structure

### Files Updated

#### 1. Extraction Script
**File:** `scripts/extract-entities.js`
```javascript
// Before
const OUTPUT_FILE = path.join(__dirname, '../src/data/extracted-entities.json');

// After
const OUTPUT_FILE = path.join(__dirname, '../src/content/entities/extracted-entities.json');
```

#### 2. Content Config
**File:** `src/content.config.ts`

Updated all 6 collection loaders:
- `extractedPostEntities`
- `extractedCompanies`
- `extractedInvestors`
- `extractedPeople`
- `extractedQuotes`
- `extractedTopics`

```typescript
// Before
loader: file('src/data/extracted-entities.json', { ... })
loader: file('src/content/extracted-entities.json', { ... }) // Some were here

// After (all unified)
loader: file('src/content/entities/extracted-entities.json', { ... })
```

#### 3. Entity Utilities
**File:** `src/lib/entities.ts`
```typescript
// Before
const data = await import('../data/extracted-entities.json');

// After
const data = await import('../content/entities/extracted-entities.json');
```

#### 4. Terminal Interface
**File:** `src/components/Terminal/TerminalInterface.tsx`
```typescript
// Before
import entitiesData from '../../data/extracted-entities.json';

// After
import entitiesData from '../../content/entities/extracted-entities.json';
```

#### 5. Documentation Files
Updated all markdown documentation files:
- `CONTENT-CONFIG-SCHEMA-UPDATE.md`
- `ENTITY-EXTRACTION-FINAL-IMPROVEMENTS.md`
- `ENTITY-EXTRACTION-IMPROVEMENTS.md`
- `EXPLORE-TERMINAL.md`
- `EXTRACTION-CHANGES-SUMMARY.md`
- `EXTRACTION-MODEL-RECOMMENDATION.md`
- `EXTRACTION-QUICK-REF.md`
- `EXTRACTION-TIMING-COST-SUMMARY.md`
- `FAL-EXTRACTION-GUIDE.md`
- `OPENAI-EXTRACTION-GUIDE.md`
- `QUICK-START-EXTRACTION.md`

## Directory Structure

### New Content Structure
```
src/content/
├── entities/
│   └── extracted-entities.json    # AI-extracted entity data
├── events/
│   └── 2025-year-in-review/
├── portfolio/
│   ├── fund-1.json
│   ├── rolling-fund.json
│   ├── angel.json
│   └── representative.json
├── posts/
│   └── *.md
├── team/
│   └── *.json
└── testimonials/
    └── testimonials.json
```

### Data Directory (now empty)
```
src/data/
└── (empty - no longer used for entities)
```

## Validation

### Build Status
✅ **Build successful**
```bash
pnpm run build
# [build] 251 page(s) built in 2.69s
# [build] Complete!
```

### Extraction Test
✅ **Extraction working**
```bash
node scripts/extract-entities.js --file post-why-dt-invests.md
# 💾 Saved to: /Users/dthyresson/projects/pwv-com/src/content/entities/extracted-entities.json
```

### Content Collections
✅ **All 6 entity collections loading correctly:**
- `extractedPostEntities` - Individual post entities
- `extractedCompanies` - Company aggregations
- `extractedInvestors` - Investor/VC aggregations
- `extractedPeople` - People aggregations
- `extractedQuotes` - All quotes with references
- `extractedTopics` - Topic aggregations

## Usage

### Extraction
```bash
# Generate entities file (automatically saves to correct location)
node scripts/extract-entities.js

# Extract specific post
node scripts/extract-entities.js --file post-why-dt-invests.md

# Extract with limit
node scripts/extract-entities.js --limit 5
```

### Accessing in Astro
```typescript
import { getCollection } from 'astro:content';

// Get all quotes
const quotes = await getCollection('extractedQuotes');

// Get all companies
const companies = await getCollection('extractedCompanies');

// Get post entities
const postEntities = await getCollection('extractedPostEntities');
```

### Importing in Components
```typescript
// Direct JSON import
import entitiesData from '../../content/entities/extracted-entities.json';

// Dynamic import
const data = await import('../content/entities/extracted-entities.json');
```

## Benefits

1. **Standards Compliance**: Follows Astro's recommended project structure
2. **Clarity**: Clear separation of content collections vs. other data
3. **Maintainability**: Easier to find and manage content-related files
4. **Consistency**: All collections in one place (`src/content/`)
5. **Future-Proof**: Ready for additional entity-related files if needed

## Migration Notes

- ✅ No breaking changes for end users
- ✅ All imports updated
- ✅ Build system working correctly
- ✅ TypeScript types unchanged
- ✅ Documentation updated
- ✅ Terminal interface working

## Related Files

- Extract script: `scripts/extract-entities.js`
- Content config: `src/content.config.ts`
- Entity utils: `src/lib/entities.ts`
- Terminal UI: `src/components/Terminal/TerminalInterface.tsx`
- Query engine: `src/components/Terminal/QueryEngine.ts`
- Type definitions: `src/components/Terminal/types.ts`

All updates complete and tested! ✅
