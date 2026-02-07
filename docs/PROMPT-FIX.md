# Entity Extraction Approach: Trust the Model

## Previous Problem (Now Solved)

Small models like Liquid LFM2.5-1.2b were copying example values from the prompt instead of extracting real entities. For example:

```json
{
  "companies": ["Cursor", "FAL", "Railway"],  // ← From prompt examples
  "people": [{
    "name": "Full Name",      // ← Placeholder text
    "role": "Title/Role"      // ← Placeholder text
  }]
}
```

## Root Cause

Small language models (like `liquid/lfm2.5-1.2b`) sometimes struggle to distinguish between:
- **Example format** (how to structure the output)
- **Actual task** (what to extract from content)

When the prompt included inline examples like:
```
1. companies: Array of company names (e.g., ["Cursor", "FAL", "Railway"])
2. people: Array with roles [{"name": "Full Name", "role": "Title/Role"}]
```

The model would copy these examples verbatim instead of extracting from the actual post content.

## Solution

### 1. Improved Prompt Structure

**Before:**
```
Extract the following:
1. companies: Array of company names mentioned (e.g., ["Cursor", "FAL", "Railway"])
2. people: Array of people with their roles [{"name": "Full Name", "role": "Title/Role"}]
```

**After:**
```
Your task: Analyze the above content and extract the following information.

1. COMPANIES: List of company names mentioned in the post
2. PEOPLE: List of people mentioned with their roles/titles
   Each person object: {"name": "actual name from text", "role": "actual role from text"}

IMPORTANT RULES:
- Extract ONLY information that actually appears in the content above
- Do NOT make up or infer information
- Do NOT use placeholder text like "Full Name" or "Title/Role"
- If no information exists for a field, use empty array []
```

**Key Changes:**
- ✅ Removed inline examples with fake data
- ✅ Added explicit "ONLY from content" instruction
- ✅ Added explicit "do NOT use placeholders" warning
- ✅ Emphasized that empty arrays are acceptable
- ✅ Made the content section more prominent

### 2. Added Placeholder Detection Filter

Added post-extraction filtering to catch any placeholders that slip through:

```javascript
const placeholderPatterns = [
  /^full name$/i,
  /^company name$/i,
  /^title\/role$/i,
  /^actual name/i,
  /^actual role/i,
  /^placeholder/i,
  /^example/i
];

const isPlaceholder = (text) => {
  if (!text || typeof text !== 'string') return true;
  return placeholderPatterns.some(pattern => pattern.test(text.trim()));
};
```

This filters out:
- Names like "Full Name", "Company Name"
- Roles like "Title/Role", "Actual Role"
- Any text containing "placeholder" or "example"

### 3. Stricter Validation

Updated the normalization code to:
```javascript
companies: entities.companies.filter(c => c && !isPlaceholder(c))
people: entities.people
  .map(p => ({ name: String(p.name || ''), role: String(p.role || 'Unknown') }))
  .filter(p => p.name && !isPlaceholder(p.name) && !isPlaceholder(p.role))
```

Now filters out placeholder text at multiple levels.

## Testing

To test the fix with a small sample:

```bash
# Start LM Studio first
lms server start --port 1234

# Test with 1 post
node scripts/extract-entities.js --limit 1

# Test with 3 posts
node scripts/extract-entities.js --limit 3
```

## Expected Results

**Before fix:**
```json
{
  "companies": ["Cursor", "FAL", "Railway"],
  "people": [{"name": "Full Name", "role": "Title/Role"}]
}
```

**After fix:**
```json
{
  "companies": ["Anysphere", "OpenAI"],  // ← Real companies from post
  "people": [
    {"name": "Michael Truell", "role": "CEO"},  // ← Real people
    {"name": "Sualeh Asif", "role": "Co-founder"}
  ]
}
```

Or if no entities found:
```json
{
  "companies": [],  // ← Empty if none found
  "people": []
}
```

## Current Solution (v0.2.0+)

### Use a Capable Model + Better Prompt

Instead of filtering bad data after extraction, we now:

1. **Use capable AI models:**
   - **OpenAI gpt-4o-mini** (recommended) - Excellent quality, affordable
   - **Mistral Nemo 12B** (LM Studio) - Good quality, free

2. **Trust the model** with a much better prompt:
   - More detailed, explicit instructions
   - Clear examples of what to extract vs what NOT to extract
   - Emphasis on "ONLY from content above"
   - No inline examples that can be copied

3. **No post-extraction filtering:**
   - Only basic schema validation (data types, required fields)
   - Trust the model to extract correctly

See `EXTRACTION-CHANGES-SUMMARY.md` for full details.

## Legacy Approach: Use a Larger Model

If you must use LM Studio with a smaller model:

```bash
# Better instruction following
export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
node scripts/extract-entities.js --limit 3

# Or Llama 3.1
export LM_STUDIO_MODEL=meta-llama/llama-3.1-8b-instruct
node scripts/extract-entities.js --limit 3
```

Larger models:
- Better understand instructions vs examples
- More accurate entity extraction
- Slower processing (but higher quality)

## Files Modified

- `scripts/extract-entities.js` - Updated prompt and added placeholder filtering
- `PROMPT-FIX.md` - This documentation
