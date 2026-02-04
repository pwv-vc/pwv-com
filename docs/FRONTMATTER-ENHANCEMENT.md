# Frontmatter Enhancement for Entity Extraction

## Overview

Enhanced the extraction script to use **all available frontmatter fields** as rich context for entity extraction, dramatically improving results for external posts and link summaries.

## Problem

External posts often have minimal body content but rich frontmatter:

```yaml
---
title: 'A letter from Ralf and Jan'
description: 'I grew up in a family of lawyers...'
author: 'Ralf Schonherr'
pubDate: '2025-09-16'
url: 'https://myriad.company/blog/a-letter-from-ralf-and-jan'
tags: ['myriad', 'regulatory compliance', 'AI compliance', 'regtech']
---
```

Previously, we only used title and description, missing valuable information from:
- **Tags** (topics, company hints)
- **Author** (people extraction)
- **URL** (company names, sources)

## Solution

### 1. Pass Full Frontmatter Object

**Before:**
```javascript
extractEntitiesFromPost(slug, title, content, description)
```

**After:**
```javascript
extractEntitiesFromPost(slug, title, content, frontmatter)
```

### 2. Build Rich Context

The function now extracts and uses:

```javascript
const description = frontmatter.description || '';
const tags = frontmatter.tags || [];
const author = frontmatter.author || '';
const url = frontmatter.url || '';

// Build rich context
let contextParts = [
  `Title: ${title}`,
  `Description: ${description}`,
  `Author: ${author}`,
  `Tags: ${tags.join(', ')}`,
  `Source: ${url}`
];
```

### 3. Enhanced Prompt Instructions

Updated the prompt to explicitly use frontmatter fields:

#### Companies
```
• Look in: title, description, tags, content, source URL
• Source URLs often contain company names (e.g., "myriad.company" → extract "Myriad")
```

#### People
```
• Look in: title, author field, description, content
• The Author field is valuable - if "Author: John Smith" appears, extract that person!
```

#### Topics
```
• **IMPORTANT: Use the Tags field as primary source for topics!**
• Tags like ["myriad", "regulatory compliance", "AI compliance"] → extract as topics
• Normalize tag names (e.g., "regtech" → "Regulatory Technology")
```

### 4. Store Frontmatter in Output

Now saves useful frontmatter fields in the output:

```json
{
  "posts": {
    "external-a-letter-from-ralf-and-jan": {
      "title": "A letter from Ralf and Jan",
      "companies": ["Myriad"],
      "people": [{"name": "Ralf Schonherr", "role": "Author"}],
      "topics": ["Regulatory Compliance", "AI Compliance", "RegTech"],
      "pubDate": "2025-09-16",
      "author": "Ralf Schonherr",
      "tags": ["myriad", "regulatory compliance", "AI compliance", "regtech"],
      "url": "https://myriad.company/blog/a-letter-from-ralf-and-jan"
    }
  }
}
```

## Benefits

### 1. Better Topic Extraction
**Before:**
- Had to infer topics from sparse content
- Often missed key themes

**After:**
- Uses tags directly as topics
- Tags like `["myriad", "regulatory compliance", "AI compliance"]` → reliable topic extraction

### 2. Author Extraction
**Before:**
- `"Author: Ralf Schonherr"` → Often missed

**After:**
- Explicitly extracts author from frontmatter
- `{"name": "Ralf Schonherr", "role": "Author"}`

### 3. Company Hints from URLs
**Before:**
- URL ignored

**After:**
- `"https://myriad.company/blog/..."` → Extract "Myriad" as company
- `"https://railway.com/..."` → Extract "Railway" as company

### 4. Richer Context
**Before:**
```
Title: A letter from Ralf and Jan
Description: ...
```

**After:**
```
Title: A letter from Ralf and Jan
Description: ...
Author: Ralf Schonherr
Tags: myriad, regulatory compliance, AI compliance, regtech
Source: https://myriad.company/blog/a-letter-from-ralf-and-jan
```

## Example Improvements

### Post: "A letter from Ralf and Jan"

**Before (minimal extraction):**
```json
{
  "companies": [],
  "people": [],
  "topics": []
}
```

**After (using frontmatter):**
```json
{
  "companies": ["Myriad"],
  "people": [
    {"name": "Ralf Schonherr", "role": "Author"},
    {"name": "Ralf", "role": "Author"},
    {"name": "Jan", "role": "Author"}
  ],
  "topics": ["Regulatory Compliance", "AI Compliance", "RegTech", "Legal Technology"],
  "tags": ["myriad", "regulatory compliance", "AI compliance", "regtech"],
  "url": "https://myriad.company/blog/a-letter-from-ralf-and-jan"
}
```

### Post: "Aalo Closes $100M Series B"

**Before:**
```json
{
  "companies": ["Aalo"],
  "figures": [],
  "topics": []
}
```

**After (with tags like ["aalo", "funding", "series-b"]):**
```json
{
  "companies": ["Aalo"],
  "figures": [{"value": "100M", "context": "Series B funding", "unit": "USD"}],
  "topics": ["Funding", "Series B", "Venture Capital"],
  "tags": ["aalo", "funding", "series-b"],
  "url": "https://aalo.com/blog/series-b-announcement"
}
```

## Implementation Details

### Context Building Strategy

1. **For posts with substantial content:**
   - Prepend frontmatter context to content
   - Model sees both context and full text

2. **For posts with minimal content (<100 chars):**
   - Use frontmatter as primary content
   - Includes: title, description, author, tags, URL

3. **Content limit increased:**
   - From 3000 → 3500 characters
   - Accommodates richer frontmatter context

### Frontmatter Fields Used

| Field | Usage | Example |
|-------|-------|---------|
| `title` | Primary extraction target | "Aalo Closes $100M Series B" |
| `description` | Rich context about post | Long form description |
| `author` | Extract as person | "Ralf Schonherr" → Person |
| `tags` | Primary source for topics | ["AI", "funding"] → Topics |
| `url` | Company hints, source attribution | "myriad.company" → Myriad |
| `pubDate` | Temporal context, metadata | "2025-09-16" |

### Output Schema

All posts now include:
```typescript
{
  title: string;
  companies: string[];
  people: {name: string, role: string}[];
  facts: {text: string, category: string}[];
  figures: {value: string, context: string, unit: string}[];
  topics: string[];
  pubDate?: string;
  author?: string;
  tags?: string[];  // NEW
  url?: string;      // NEW
}
```

## Impact on External Posts

External posts (posts with minimal body content but rich frontmatter) will see the most dramatic improvement:

**Typical external post structure:**
```yaml
---
title: 'Company X raises $YM'
description: 'Company X announced...'
author: 'Jane Doe'
tags: ['company-x', 'funding', 'series-a']
url: 'https://company-x.com/blog/announcement'
---

# (minimal or no body content)
```

**Expected extraction improvement:**
- ✅ Company from title and URL
- ✅ Author as person
- ✅ Funding figure from title
- ✅ Topics from tags
- ✅ Announcement fact from description
- ✅ Source URL preserved

## Testing

Test the enhancement:

```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...
node scripts/extract-entities.js --limit 5
```

Look for:
- More topics extracted (from tags)
- Authors extracted as people
- Companies extracted from URLs
- Richer overall extraction

## Files Modified

1. **`scripts/extract-entities.js`**
   - Updated `extractEntitiesFromPost()` signature
   - Added frontmatter context building
   - Enhanced prompt with frontmatter instructions
   - Saved tags and URL in output

## Summary

By using **all available frontmatter fields**, we've transformed the extraction from focusing only on body content to leveraging the full richness of metadata. This is especially valuable for:

- 📝 External posts (link summaries)
- 🏷️ Tag-based topic extraction
- 👤 Author attribution
- 🏢 Company hints from URLs
- 📊 More complete entity graphs

Perfect for a real-world content site where posts vary from full articles to external link summaries! 🎯
