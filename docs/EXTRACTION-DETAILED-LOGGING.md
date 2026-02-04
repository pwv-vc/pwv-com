# Extraction Detailed Logging

## Overview

Enhanced the entity extraction script to display the actual extracted entities (not just counts) for better visibility and debugging.

## Changes Made

### Enhanced Logging Output

Now displays the actual entity names and content after each extraction:

#### Before:
```
✅ Extracted: 1 companies, 0 investors, 1 people, 0 facts, 0 quotes
⏱️  Time: 1.39s [2149 tokens] ($0.0004)
```

#### After:
```
✅ Extracted: 1 companies, 0 investors, 1 people, 0 facts, 0 quotes
   Companies: GitButler
   People: Scott Chacon
⏱️  Time: 1.39s [2149 tokens] ($0.0004)
```

### What's Displayed

#### 1. **Companies**
Shows comma-separated list of extracted company names:
```
Companies: GitButler, Myriad, Aalo
```

#### 2. **Investors**
Shows comma-separated list of extracted VC/investor names:
```
Investors: Preston-Werner Ventures, Valor Equity Partners
```

#### 3. **People**
Shows comma-separated list of extracted people names:
```
People: Scott Chacon, Ralf Schonherr, David Thyresson
```

#### 4. **Quotes**
Shows numbered list with preview and speaker:
```
Quotes:
  1. "I invest because I want to be invested." — David Thyresson
  2. "Let the Band Play" — David Thyresson
  3. "Investing, for me, is a creative partnership, not a transact..." — David Thyresson
```

### Implementation

```javascript
// Log actual extracted entities for visibility
if (normalized.companies.length > 0) {
  console.log(`     Companies: ${normalized.companies.join(', ')}`);
}
if (normalized.investors.length > 0) {
  console.log(`     Investors: ${normalized.investors.join(', ')}`);
}
if (normalized.people.length > 0) {
  const peopleNames = normalized.people.map(p => typeof p === 'string' ? p : p.name);
  console.log(`     People: ${peopleNames.join(', ')}`);
}
if (normalized.quotes.length > 0) {
  console.log(`     Quotes:`);
  normalized.quotes.forEach((q, i) => {
    const preview = q.quote.length > 60 ? q.quote.substring(0, 60) + '...' : q.quote;
    console.log(`       ${i + 1}. "${preview}" — ${q.speaker}`);
  });
}
```

## Example Output

### Philosophy Post (with quotes):
```
[1/1] 📝 post-why-dt-invests
📄 Processing: From Riff to Rooftop: Why I Invest at PWV
  Calling OpenAI API...
  Using model: gpt-4o-mini
  ✅ Extracted: 0 companies, 1 investors, 1 people, 0 facts, 3 quotes
     Investors: Preston-Werner Ventures
     People: David Thyresson
     Quotes:
       1. "I invest because I want to be invested." — David Thyresson
       2. "Let the Band Play" — David Thyresson
       3. "Investing, for me, is a creative partnership, not a transact..." — David Thyresson
  ⏱️  Time: 3.02s [3517 tokens] ($0.0006)
```

### Company Post (with people):
```
[1/2] 📝 external-20-years-of-git-still-weird-still-wonderful
📄 Processing: 20 years of Git. Still weird, still wonderful.
  Calling OpenAI API...
  Using model: gpt-4o-mini
  ✅ Extracted: 1 companies, 0 investors, 1 people, 0 facts, 0 quotes
     Companies: GitButler
     People: Scott Chacon
  ⏱️  Time: 1.39s [2149 tokens] ($0.0004)
```

### Multiple Extractions:
```
[1/2] 📝 external-20-years-of-git-still-weird-still-wonderful
📄 Processing: 20 years of Git. Still weird, still wonderful.
  ✅ Extracted: 1 companies, 0 investors, 1 people, 0 facts, 0 quotes
     Companies: GitButler
     People: Scott Chacon
  ⏱️  Time: 1.39s [2149 tokens] ($0.0004)

[2/2] 📝 external-a-letter-from-ralf-and-jan
📄 Processing: A letter from Ralf and Jan
  ✅ Extracted: 1 companies, 0 investors, 1 people, 0 facts, 0 quotes
     Companies: Myriad
     People: Ralf Schonherr
  ⏱️  Time: 1.77s [2233 tokens] ($0.0004)
```

## Benefits

1. **Immediate Visibility**: See what was extracted without checking the JSON file
2. **Quality Verification**: Quickly spot extraction errors or unexpected results
3. **Debugging**: Easier to identify when the AI misclassifies entities
4. **Progress Tracking**: Watch extraction quality across posts
5. **Quote Previews**: See memorable quotes as they're discovered
6. **Confidence**: Know exactly what's being captured

## Use Cases

### During Development:
```bash
# Test extraction on specific posts
node scripts/extract-entities.js --file post-why-dt-invests.md

# Watch output to verify:
# - Companies extracted correctly
# - People vs company distinction
# - Quote attribution
```

### Quality Assurance:
```bash
# Process a few posts and review
node scripts/extract-entities.js --limit 5

# Check output for:
# - Missing entities
# - Incorrect classifications
# - VCs marked as companies
```

### Full Extraction:
```bash
# Run full extraction and monitor progress
node scripts/extract-entities.js

# See all entities being captured in real-time
```

## Display Logic

- **Companies, Investors, People**: Only shown if > 0 extracted
- **Quotes**: 
  - Shows numbered list
  - Truncates long quotes at 60 characters with "..."
  - Includes speaker attribution
  - Maintains readability
- **Indentation**: Consistent 5-space indent for nested entity lists

## Related Features

Works seamlessly with:
- ✅ Progress counters (`[1/67]`)
- ✅ Timing and cost tracking
- ✅ `--limit` flag
- ✅ `--file` flag
- ✅ All AI providers (OpenAI, FAL, LM Studio)

## Performance Impact

**Negligible** - Only adds console.log statements:
- No additional API calls
- No extra processing
- No file I/O
- Minimal string concatenation

## Example Full Output

```
🚀 PWV Entity Extraction Script
🤖 AI Provider: OPENAI
📡 Model: gpt-4o-mini
🔢 Limit: Processing first 2 post(s) only

✅ Using OpenAI - will test connection on first request

🚀 Starting entity extraction from blog posts...

📋 Loading portfolio companies...
✅ Loaded 66 portfolio companies

Found 67 total posts
⚡ Processing first 2 post(s) (--limit 2)


[1/2] 📝 external-20-years-of-git-still-weird-still-wonderful
📄 Processing: 20 years of Git. Still weird, still wonderful.
  Calling OpenAI API...
  Using model: gpt-4o-mini
  ✅ Extracted: 1 companies, 0 investors, 1 people, 0 facts, 0 quotes
     Companies: GitButler
     People: Scott Chacon
  ⏱️  Time: 1.39s [2149 tokens] ($0.0004)

[2/2] 📝 external-a-letter-from-ralf-and-jan
📄 Processing: A letter from Ralf and Jan
  Calling OpenAI API...
  Using model: gpt-4o-mini
  ✅ Extracted: 1 companies, 0 investors, 1 people, 0 facts, 0 quotes
     Companies: Myriad
     People: Ralf Schonherr
  ⏱️  Time: 1.77s [2233 tokens] ($0.0004)

🔍 Validating post references...
  ✅ All post references are valid!

✅ Entity extraction complete!
📊 Results:
   Posts processed: 2
   Companies found: 2
   Investors found: 0
   People found: 2
   Topics found: 9
   Quotes found: 0

⏱️  Performance:
   Total time: 3.16s
   Avg time per post: 1.58s
   Total tokens: 4,382
   Avg tokens per post: 2,191

💰 Cost:
   Total cost: $0.0007
   Avg cost per post: $0.0004

💾 Saved to: /Users/dthyresson/projects/pwv-com/src/content/entities/extracted-entities.json
```

All improvements tested and working! ✅
