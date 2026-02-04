# Quick Start: Entity Extraction

## Choose Your AI Provider

### Option 1: FAL AnyLLM (RECOMMENDED - Best Value)

```bash
# 1. Get API key from fal.ai/dashboard/keys
# 2. Set up environment
export AI_PROVIDER=fal
export FAL_KEY=your-fal-key-here
export FAL_MODEL=meta-llama/llama-3.1-70b-instruct

# 3. Test with 3 posts
node scripts/extract-entities.js --limit 3
```

**Why FAL?**
- ✅ No setup, no downloads
- ✅ Excellent quality (Llama 3.3 70B)
- ✅ Very affordable (~$0.05-0.15 for all 67 posts)
- ✅ Fast and reliable
- ✅ Access to latest open-source models

See `FAL-EXTRACTION-GUIDE.md` for full details.

### Option 2: OpenAI (Alternative Cloud)

```bash
# 1. Get API key from platform.openai.com
# 2. Set up environment
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o-mini

# 3. Test with 3 posts
node scripts/extract-entities.js --limit 3
```

**Why OpenAI?**
- ✅ No setup, no downloads
- ✅ Excellent quality (no fake names)
- ✅ Very affordable (~$0.10-0.20 for all 67 posts)
- ✅ Fast and reliable

See `OPENAI-EXTRACTION-GUIDE.md` for full details.

### Option 3: LM Studio (Free, Local)

1. **Install LM Studio**: Download from [lmstudio.ai](https://lmstudio.ai)
2. **Download a capable model**: `mistralai/mistral-nemo-12b` (~8GB)
3. **Start the server**: 
   ```bash
   lms server start --port 1234
   ```
4. **Run extraction**:
   ```bash
   export AI_PROVIDER=lmstudio
   export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
   node scripts/extract-entities.js --limit 3
   ```

See `EXTRACTION-MODEL-RECOMMENDATION.md` for model details.

## Quick Test (Recommended First Run)

Test with just 1 post to make sure everything works:

```bash
# Process just the first post (fastest test ~10 seconds)
node scripts/extract-entities.js --limit 1
```

Expected output:
```
🚀 PWV Entity Extraction Script
📍 LM Studio URL: http://localhost:1234
🤖 Model: liquid/lfm2.5-1.2b
🔢 Limit: Processing first 1 post(s) only

🔍 Testing LM Studio connection...
✅ Connected! Found 7 model(s) loaded

🚀 Starting entity extraction from blog posts...

Found 67 total posts
⚡ Processing first 1 post(s) (--limit 1)

  📝 Slug: external-20-years-of-git-still-weird-still-wonderful

📄 Processing: 20 years of Git. Still weird, still wonderful.
  Calling LM Studio API at http://localhost:1234...
  Using model: liquid/lfm2.5-1.2b
  ✅ Extracted: 2 companies, 1 people, 3 facts
```

## Test with a Few Posts

```bash
# Process 5 posts (~1-2 minutes)
node scripts/extract-entities.js --limit 5

# Or use the npm script
pnpm run extract-entities:test
```

## Full Extraction

Once you've verified it works with a small number:

```bash
# Process all posts (~20-30 minutes for 67 posts)
node scripts/extract-entities.js

# Or use the npm script
pnpm run extract-entities
```

## Common Options

```bash
# Show help
node scripts/extract-entities.js --help

# Test with different limits
node scripts/extract-entities.js --limit 10   # 10 posts
node scripts/extract-entities.js --limit 20   # 20 posts

# Use a different model
export LM_STUDIO_MODEL=liquid/lfm2-1.2b
node scripts/extract-entities.js --limit 5
```

## Troubleshooting

### Connection Refused
```bash
# Make sure LM Studio server is running
lms server start --port 1234
```

### Model Not Loaded
Open LM Studio and load a model:
1. Go to "Search"
2. Download `liquid/lfm2.5-1.2b`
3. Click to load it

### Slow Extraction
The `liquid/lfm2.5-1.2b` model is fast but processes ~1 post per second. For 67 posts:
- **With --limit 1**: ~10 seconds
- **With --limit 5**: ~1 minute
- **All posts**: ~20-30 minutes

### Better Quality Results
Use a larger model for better extraction quality:
```bash
export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
node scripts/extract-entities.js --limit 5
```

Larger models are slower but extract more details.

## Output

The script creates/updates: `src/content/entities/extracted-entities.json`

This file is used by:
- Astro content collections (`src/content.config.ts`)
- Helper functions (`src/lib/extracted-entities.ts`)
- The terminal exploration UI (`/explore`)

## Next Steps

After extraction:
1. **Check the output**: Look at `src/content/entities/extracted-entities.json`
2. **Build the site**: `pnpm run build`
3. **Test the terminal**: Visit `/explore` page
4. **Query entities**: Use helper functions in your pages

See `EXTRACTED-ENTITIES-USAGE.md` for how to use the data in your pages.
