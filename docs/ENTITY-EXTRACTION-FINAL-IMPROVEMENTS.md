# Entity Extraction - Final Improvements Summary

## Overview

Comprehensive improvements to the PWV entity extraction system with enhanced fact categorization, quote extraction, timing/cost tracking, and date-aware features.

## Major Enhancements

### 1. **New Entity Type: Quotes** 🎤

Added quote extraction to capture memorable statements and philosophies.

**Structure:**
```json
{
  "quote": "I invest because I want to be invested.",
  "speaker": "David Thyresson",
  "context": "On investing philosophy",
  "postSlug": "post-why-dt-invests",
  "postTitle": "From Riff to Rooftop: Why I Invest at PWV",
  "pubDate": "2025-12-02"
}
```

**Features:**
- Speaker attribution (person or company)
- Optional context for the quote
- Post reference and publication date
- Stored as flat array in `entities.quotes`
- Perfect for "quote of the day" features

**Example Quotes Extracted:**
- "I invest because I want to be invested." — David Thyresson
- "Let the Band Play" — David Thyresson
- "Investing, for me, is a creative partnership, not a transaction." — David Thyresson

### 2. **Enhanced Fact Categories** 📰

Expanded fact categories to prioritize business events:

**New Categories:**
- `funding` - Fundraising announcements
- `launch` - Product launches
- `partnership` - Strategic partnerships

**Existing Categories:**
- `insight`, `trend`, `philosophy`, `announcement`, `milestone`

**Example Facts:**
```json
{
  "text": "Aalo closed a $100M Series B financing round",
  "category": "funding",
  "date": "2025-08-19"
}
```

```json
{
  "text": "Brilliant Labs partnered with Liquid AI to bring vision-language technology to AI glasses",
  "category": "partnership",
  "date": "2025-09-15"
}
```

### 3. **Date Support in Facts** 📅

All facts now include the publication date from frontmatter:

**Benefits:**
- Timeline visualization
- Chronological sorting
- Historical context
- Event tracking

**Implementation:**
- AI receives "Published: YYYY-MM-DD" in frontmatter context
- Explicitly instructed to include date in all facts
- Date format: ISO date string (YYYY-MM-DD)

### 4. **Timing & Cost Tracking** 💰

Comprehensive metrics for every extraction:

**Per-Post Metrics:**
```
✅ Extracted: 0 companies, 1 investors, 1 people, 0 facts, 3 quotes
⏱️  Time: 2.87s [3517 tokens] ($0.0006)
```

**Cumulative Statistics:**
```
⏱️  Performance:
   Total time: 6.28s
   Avg time per post: 2.09s
   Total tokens: 6,560
   Avg tokens per post: 2,187

💰 Cost:
   Total cost: $0.0011
   Avg cost per post: $0.0004
```

**Cost Breakdown by Provider:**
- **OpenAI gpt-4o-mini**: ~$0.0003/post (~$0.02 for all 67 posts)
- **FAL AI**: ~$0.0004/post (estimated)
- **LM Studio**: $0 (local)

### 5. **Date Range Metadata** 📆

Metadata now includes corpus date range:

```json
"metadata": {
  "extractedAt": "2026-02-04T18:13:15.217Z",
  "totalPosts": 67,
  "dateRange": {
    "oldest": "2023-07-12",
    "newest": "2026-01-29"
  }
}
```

**Use Cases:**
- Show "Posts from April 2023 to January 2026"
- Incremental updates (only process newer posts)
- Timeline features
- Archive organization

### 6. **Increased Context Window** 📖

- **Before**: 3,500 characters
- **After**: 8,000 characters
- **Max tokens**: Increased to 3,000

**Benefits:**
- Full post content for longer articles
- Better context for extraction
- More accurate quote detection
- Improved entity recognition

### 7. **Specific File Processing** 🎯

New `--file` option for targeted extraction:

```bash
# Extract from specific post
node scripts/extract-entities.js --file post-why-dt-invests.md

# Test different posts
node scripts/extract-entities.js --file external-aalo-closes-100m-series-b.md
```

**Benefits:**
- Fast testing on specific posts
- Debug extraction issues
- Re-process updated posts
- Development workflow improvement

### 8. **Portfolio Company Reference Fix** 🔧

Fixed critical bug where AI was extracting all portfolio companies:

**Before:**
```json
"companies": ["Beta", "Upside Foods", "Stripe", ... 65 companies]
// Even though post didn't mention them!
```

**After:**
```json
"companies": []
// Only companies actually mentioned in content
```

**Solution:**
- Moved portfolio list to clearly labeled "REFERENCE" section
- Added explicit "DO NOT extract unless mentioned" instructions
- Visual separators to distinguish reference from content

## Terminal Commands

### New Commands:
```bash
quotes                    # Browse all quotes
discover random          # Can now show random quote
stats                    # Shows quote count
```

### Quote Display:
```
╔══════════════════════════════════════════════════════════════╗
║                      QUOTE OF THE DAY                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  "I invest because I want to be invested."                   ║
║                                                              ║
║  — David Thyresson                                           ║
║  Context: On investing philosophy                            ║
║  Date: 2025-12-02                                            ║
║                                                              ║
║  From: From Riff to Rooftop: Why I Invest at PWV             ║
╚══════════════════════════════════════════════════════════════╝
```

## Complete Entity Schema

```typescript
interface Entity {
  companies: string[];
  investors: string[];
  people: Array<{ name: string; role?: string }>;
  facts: Array<{
    text: string;
    category: 'insight' | 'trend' | 'philosophy' | 'announcement' | 
              'milestone' | 'funding' | 'launch' | 'partnership';
    date?: string;
  }>;
  figures: Array<{
    value: string;
    context: string;
    unit: string;
  }>;
  topics: string[];
  quotes: Array<{
    quote: string;
    speaker: string;
    context?: string;
  }>;
}

interface QuoteEntity {
  quote: string;
  speaker: string;
  context?: string;
  postSlug: string;
  postTitle: string;
  pubDate?: string;
}
```

## Extraction Improvements

### Prompt Enhancements:

1. **Facts Section:**
   - Prioritizes fundraising, launches, partnerships
   - Emphasizes title/description extraction
   - Requires date field using frontmatter pubDate
   - New categories: funding, launch, partnership

2. **Quotes Section:**
   - Extracts memorable statements
   - Captures speaker attribution
   - Optional context
   - Direct quotes and key philosophies

3. **Context Building:**
   - Added "Published: DATE" to frontmatter context
   - Portfolio companies as reference (not extraction list)
   - Increased to 8,000 character limit

## Usage Examples

### Extract with Timing:
```bash
node scripts/extract-entities.js --limit 5
```

Output:
```
✅ Extracted: 1 companies, 0 investors, 1 people, 1 facts, 0 quotes
⏱️  Time: 2.44s [2178 tokens] ($0.0004)
```

### Extract Specific Post:
```bash
node scripts/extract-entities.js --file post-why-dt-invests.md
```

### View Results:
```bash
# Check quotes
cat src/content/entities/extracted-entities.json | jq '.entities.quotes'

# Check metadata with date range
cat src/content/entities/extracted-entities.json | jq '.metadata'

# Check specific post facts
cat src/content/entities/extracted-entities.json | jq '.posts["external-aalo-closes-100m-series-b"].facts'
```

## Files Modified

1. **scripts/extract-entities.js**
   - Added quote extraction
   - Enhanced fact categories (funding, launch, partnership)
   - Added timing and cost tracking
   - Increased context limit to 8,000 chars
   - Added --file option
   - Added date range to metadata
   - Fixed portfolio company reference bug

2. **src/components/Terminal/types.ts**
   - Added QuoteEntity interface
   - Updated Entity with quotes array
   - Enhanced fact categories
   - Added dateRange to metadata

3. **src/components/Terminal/QueryEngine.ts**
   - Added listQuotes() method
   - Added quote case to discoverRandom()
   - Updated stats to include quote count
   - Updated help text

## Sample Extraction Results

### Philosophy Post (post-why-dt-invests.md):
- Companies: 0 ✅ (was 65 - bug fixed!)
- Investors: 1 (Preston-Werner Ventures)
- People: 1 (David Thyresson)
- Facts: 0
- Quotes: 3 ✅ (new feature!)

### Funding Post (external-aalo-closes-100m-series-b.md):
- Companies: 1 (Aalo)
- Investors: 1 (Valor Equity Partners)
- People: 0
- Facts: 1 (category: "funding", date: "2025-08-19") ✅
- Quotes: 0

### Partnership Post (external-brilliant-labs-partners...):
- Companies: 2 (Brilliant Labs, Liquid AI)
- Investors: 0
- People: 0
- Facts: 2 (categories: "partnership", "launch", both dated) ✅
- Quotes: 0

## Performance Metrics

**Average per post (gpt-4o-mini):**
- Time: ~2.5 seconds
- Tokens: ~2,000
- Cost: ~$0.0003

**Full extraction (67 posts):**
- Time: ~3 minutes
- Tokens: ~134,000
- Cost: ~$0.02

## Next Steps

1. ✅ Quote extraction working
2. ✅ Fact categories enhanced (funding, launch, partnership)
3. ✅ Dates in facts from frontmatter
4. ✅ Timing and cost tracking
5. ✅ Date range in metadata
6. ✅ --file option for testing
7. Consider: Quote browsing UI in terminal
8. Consider: Timeline view by date
9. Consider: Filter facts by category
10. Consider: Speaker-based quote search

## Testing Checklist

- ✅ Quote extraction from philosophy posts
- ✅ Funding fact with date
- ✅ Partnership fact with date
- ✅ Launch fact with date
- ✅ Portfolio company bug fixed
- ✅ Timing and cost displayed
- ✅ Date range in metadata
- ✅ --file option working
- ✅ TypeScript types updated
- ✅ Terminal commands ready

All improvements tested and working! 🎉
