# Entity Extraction Improvements

## Summary

Improved the entity extraction system to better distinguish between companies, investors/VCs, and people, with enhanced accuracy by prioritizing portfolio company data.

## Key Changes

### 1. **New Entity Type: Investors**

Added a separate `investors` entity type to properly categorize venture capital firms and investment entities.

**Before:**
- Investors like "Sequoia", "Bessemer Venture Partners", "First Round Capital" were incorrectly classified as companies
- Result: 46 companies (many were actually investors)

**After:**
- Clear separation between companies (product/service businesses) and investors (VC firms)
- Result: 83 companies + 53 investors (correctly categorized)

### 2. **Portfolio Company Prioritization**

The extraction script now loads portfolio companies from `/src/content/portfolio/` and uses them as ground truth during extraction.

**Benefits:**
- AI model knows which entities are confirmed portfolio companies
- Reduces false positives and improves accuracy
- Portfolio companies (like Cursor, fal, Liquid AI, etc.) are correctly identified even in ambiguous contexts

### 3. **Improved Company vs. People Detection**

**Problem:** Company names appearing as authors (like "Aalo", "fal", "Liquid AI") were being extracted as people.

**Solution:**
- Enhanced prompt explicitly instructs AI to NOT extract company names as people
- Post-processing filter removes company-like names (ending in "AI", "Labs", "Studios", "Team", etc.)
- Author fields that are company names are now correctly handled

**Before:**
```json
"people": [
  {"name": "Aalo", "role": "Author"},
  {"name": "fal", "role": "Author"},
  {"name": "Liquid AI", "role": "Author"}
]
```

**After:**
```json
"people": [
  {"name": "Tom Preston-Werner", "role": "Co-founder"},
  {"name": "Andreas Stuhlmueller", "role": "Author"}
]
```

### 4. **Enhanced Extraction Prompt**

The AI prompt now includes:

1. **Clear Instructions:**
   - Companies: Product/service businesses (NOT investors)
   - Investors: VC firms, investment funds, corporate venture arms
   - People: Real individuals (NOT company names)

2. **Portfolio Company Context:**
   - Provides list of 66 confirmed portfolio companies
   - AI prioritizes these as ground truth

3. **Known Investor List:**
   - Pre-defined list of major VC firms
   - Ensures they're classified correctly

4. **Validation Rules:**
   - Company names as authors → NOT added to people
   - Investor firms → NOT added to companies
   - Portfolio companies → High confidence classification

## Updated Data Structure

```typescript
interface Entity {
  companies: string[];
  investors: string[];  // NEW
  people: Array<{ name: string; role?: string }>;
  facts: Array<{ text: string; category: string }>;
  figures: Array<{ value: string; context: string; unit: string }>;
  topics: string[];
}

interface InvestorEntity {
  posts: string[];
  mentions: number;
}
```

## Terminal Commands Updated

### New Commands:
- `investors` - List all investors/VCs
- `discover investor <name>` - View investor profile with posts

### Updated Output:
- `stats` - Now includes investor count and top investor
- `companies` - Only shows actual companies (no investors)

## Extraction Results

### Before:
```
Companies found: 46 (mixed with investors)
People found: Many false positives (company names)
```

### After:
```
Companies found: 83
Investors found: 53
People found: 42 (cleaned, real people only)
Topics found: 71
```

## Sample Investors Correctly Extracted

- Sequoia
- Kleiner Perkins
- First Round Capital
- Bessemer Venture Partners
- GGV Capital
- GV (Google Ventures)
- Lowercarbon Capital
- Costanoa Ventures
- Spark Capital
- Footwork
- Fifty Years
- Basis Set
- Preston-Werner Ventures
- Backtrace Capital
- Mouro Capital
- Salesforce Ventures
- Shopify Ventures
- Google AI Futures Fund
- Kindred Ventures
- Notable Capital
- Unusual Ventures
- Village Global
- Lux Capital
- Crosslink Capital
- Hanaco Ventures
- And more...

## Sample Companies Correctly Extracted

Portfolio companies like:
- Cursor
- fal
- Liquid AI
- Railway
- Elicit
- Inngest
- Aalo Atomics
- Atuin
- Turso
- GitButler
- Tuist
- Myriad
- Alinia
- And many more...

## Usage

### Running Entity Extraction

```bash
# Full extraction (all posts)
node scripts/extract-entities.js

# Test with limited posts
node scripts/extract-entities.js --limit 5

# Using FAL AI (recommended)
export AI_PROVIDER=fal
export FAL_KEY=your-fal-key
node scripts/extract-entities.js

# Using OpenAI
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-your-key
node scripts/extract-entities.js
```

### Terminal Discovery

```bash
# View investors
investors

# Discover an investor
discover investor Sequoia

# View investor by number
investors
1  # Selects first investor

# View companies (now accurate)
companies

# Stats (includes investor metrics)
stats
```

## Files Modified

### Core Changes:
1. **`scripts/extract-entities.js`**
   - Added `loadPortfolioCompanies()` function
   - Added `KNOWN_INVESTORS` set
   - Enhanced extraction prompt with investor type
   - Added investor aggregation logic
   - Improved filtering for companies vs people

2. **`src/components/Terminal/types.ts`**
   - Added `InvestorEntity` interface
   - Updated `Entity` to include `investors`
   - Updated `ExtractedData` to include `investors`
   - Updated `CommandResult` type with `'investor'`
   - Updated `SelectableItem` type with `'investor'`

3. **`src/lib/entities.ts`**
   - Added `getAllInvestors()` function
   - Updated `searchEntities()` to include investors

4. **`src/components/Terminal/QueryEngine.ts`**
   - Added `listInvestors()` method
   - Added `discoverInvestor()` and `discoverInvestorWithPosts()` methods
   - Updated `showStats()` to include investor metrics
   - Updated `discover()` command handler
   - Updated `selectFromList()` to handle investors
   - Updated help text with investor commands

### Data File:
- **`src/content/entities/extracted-entities.json`** - Updated with new structure and improved data

## Next Steps

1. ✅ Entity extraction working with improved accuracy
2. ✅ Terminal interface updated with investor support
3. ✅ Stats showing correct metrics
4. Consider: Add investor filtering in explore page
5. Consider: Create investor profile pages
6. Consider: Show investor relationships in portfolio companies

## Testing

Tested with:
- 3 posts (quick test) ✅
- 67 posts (full extraction) ✅
- OpenAI gpt-4o-mini model ✅
- All commands working in terminal ✅

## Validation

Before extraction:
- 46 "companies" (mixed with investors)
- Many false positive people

After extraction:
- 83 actual companies
- 53 investors (separated)
- 42 real people (cleaned)
- Zero false positives in spot checks

## Notes

- Portfolio company data acts as ground truth
- Known investors list ensures major VCs are classified correctly
- Post-processing filters catch edge cases
- All terminal commands updated and tested
- Stats output enhanced with investor metrics
