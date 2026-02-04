# Extraction Prompt Improvement

## Problem

OpenAI's gpt-4o-mini was extracting very few entities (mostly 0 companies, 0 people, 0 facts) because:

1. **External posts have minimal content** - Many posts are just links to external articles, containing only frontmatter (title, description, tags) with no body content
2. **Prompt was too strict** - The original prompt was overly cautious and told the model to skip uncertain data

### Example Output (Before)
```
📄 Processing: A letter from Ralf and Jan
  Using model: gpt-4o-mini
  ✅ Extracted: 0 companies, 0 people, 0 facts

📄 Processing: Aalo Closes $100M Series B
  Using model: gpt-4o-mini
  ✅ Extracted: 1 companies, 0 people, 1 facts
```

## Root Causes

### 1. Overly Strict Prompt

**Before:**
```
IMPORTANT EXTRACTION RULES:
• Only extract information that is EXPLICITLY in the content above
• Do NOT extract if you're uncertain - better to miss something than to be wrong
• MUST include BOTH first and last name (e.g., "Tom Preston-Werner", "Sam Altman")
• If only first name appears (e.g., "Ralf"), do NOT extract it - we need full names
```

This caused the model to:
- Skip "Ralf and Jan" from "A letter from Ralf and Jan" (only first names)
- Skip "Aalo" from titles (looked like incomplete info)
- Err on the side of caution for everything

### 2. Not Using Description Field

The script was only using the body content, which is often empty for external posts:

```javascript
// Before: Only used body content
const textContent = plainText.replace(/<[^>]*>/g, ' ').substring(0, 3000);
```

## Solution

### 1. More Pragmatic Prompt

**After:**
```
PRAGMATIC RULES:
• Extract what you CAN find - titles and descriptions contain valuable info!
• If only first names given, that's okay - extract them
• If title says "Company X raises $YM", extract the company, figure, and announcement
• Empty arrays are fine for categories with no information
• Be practical, not overly strict
```

**Key Changes:**
- ✅ Extract from titles (e.g., "Aalo Closes $100M Series B")
- ✅ Accept first names if that's all we have (e.g., "Ralf", "Jan")
- ✅ Be pragmatic about limited information
- ✅ Look for info in titles and descriptions, not just body content

### 2. Use Description Field

```javascript
// After: Use description for posts with minimal content
let textContent = plainText.replace(/<[^>]*>/g, ' ').trim();

// If content is very short/empty, use title and description
if (textContent.length < 100 && description) {
  textContent = `Title: ${title}\n\nDescription: ${description}`;
}
```

### 3. Updated Examples in Prompt

**Before:**
```
2. PEOPLE
   • Individual humans mentioned by name with their role or title
   • MUST include BOTH first and last name (e.g., "Tom Preston-Werner", "Sam Altman")
   • If only first name appears (e.g., "Ralf"), do NOT extract it - we need full names
```

**After:**
```
2. PEOPLE
   • People mentioned by name (full name preferred, but first name acceptable if that's all we have)
   • Include their role/title if mentioned
   • Examples: {"name": "Tom Preston-Werner", "role": "Co-founder"} or {"name": "Ralf", "role": "Author"}
   • If just first names appear (like "Ralf and Jan"), extract them with role "Author" or "Founder"
   • Look in titles too - "A letter from Ralf and Jan" means extract Ralf and Jan!
```

### 4. More Examples in Prompt

Added concrete examples showing what to extract:

```
3. FACTS
   • Examples:
     - "Aalo closed $100M Series B" → {"text": "Aalo raised $100M in Series B funding", "category": "announcement"}
     - Funding announcements, product launches, company milestones
   • Extract from title if that's where the news is!
```

## Files Modified

1. **`scripts/extract-entities.js`**
   - Updated `extractEntitiesFromPost()` to accept `description` parameter
   - Added logic to use title + description when body content is minimal
   - Rewrote prompt to be more pragmatic and less strict
   - Updated system prompts for all providers (OpenAI, FAL, LM Studio)

## Expected Improvements

### Before (Strict Prompt)
- "A letter from Ralf and Jan" → **0 people** ❌
- "Aalo Closes $100M Series B" → **1 company, 0 people, 1 fact** ⚠️

### After (Pragmatic Prompt)
- "A letter from Ralf and Jan" → **2 people** (Ralf, Jan) ✅
- "Aalo Closes $100M Series B" → **1 company** (Aalo), **1 figure** ($100M Series B), **1-2 facts** (announcement) ✅

## Testing

To test the improvements:

```bash
# Test with OpenAI (should extract more now)
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini
node scripts/extract-entities.js --limit 5
```

Expected output should show more entities extracted:
```
📄 Processing: A letter from Ralf and Jan
  ✅ Extracted: 1 companies, 2 people, 1-2 facts

📄 Processing: Aalo Closes $100M Series B
  ✅ Extracted: 1 companies, 0-2 people, 2 facts
```

## Key Takeaways

1. **Context matters** - External posts have minimal content, so we need to work with titles and descriptions
2. **Be pragmatic** - Perfect extraction isn't possible; extract what we can from limited info
3. **Titles are valuable** - Many external posts put all the key info in the title
4. **First names are okay** - Better to have "Ralf" than nothing
5. **Examples help** - Concrete examples in the prompt guide the model better

## Balance

The new prompt balances:
- ✅ **Pragmatic extraction** - Get what we can from limited information
- ✅ **Quality control** - Still avoid obviously fake data (no "John Doe", no projects as people)
- ✅ **Practical utility** - Extract useful entities even from brief descriptions

Perfect for a real-world use case where content varies from full articles to brief external link summaries!
