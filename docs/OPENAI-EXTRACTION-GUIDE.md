# Using OpenAI for Entity Extraction

This guide explains how to use OpenAI's API (instead of LM Studio) for extracting entities from blog posts.

## Why OpenAI?

✅ **Better Quality**: More accurate extraction, fewer mistakes  
✅ **No Setup**: No need to download models or run local servers  
✅ **Cost-Effective**: `gpt-4o-mini` is very affordable for this task  
✅ **Reliable**: Consistent results, no placeholder names or confusion  

## Cost Estimate

Using `gpt-4o-mini` (recommended):
- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens
- **Typical post**: ~500-1000 input tokens, ~200 output tokens
- **67 posts**: Approximately **$0.10 - $0.20 total**

Very affordable for high-quality extraction!

## Setup

### 1. Get an OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy your key (starts with `sk-`)

### 2. Configure Environment

```bash
# Set up your API key
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-your-api-key-here
export OPENAI_MODEL=gpt-4o-mini
```

Or create a `.env` file:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 3. Test with a Few Posts

```bash
# Quick test with 3 posts
node scripts/extract-entities.js --limit 3
```

### 4. Check the Output Quality

```bash
# Look at the extracted entities
cat src/content/entities/extracted-entities.json | grep -A 10 '"people"'
```

You should see:
- ✅ Real, full names (e.g., "Michael Truell", "Sam Altman")
- ✅ Accurate company names
- ✅ Proper roles and titles
- ❌ NO fake names like "John Doe"
- ❌ NO confusion between projects and companies

### 5. Run Full Extraction

If the quality looks good:

```bash
# Process all 67 posts (~2-3 minutes)
node scripts/extract-entities.js
```

## Model Options

### gpt-4o-mini (Recommended)
```bash
export OPENAI_MODEL=gpt-4o-mini
```
- ✅ Excellent quality for entity extraction
- ✅ Very cost-effective (~$0.15/M input)
- ✅ Fast responses (~1-2 seconds per post)
- **Best for**: Production extraction, regular use

### gpt-4o (Premium)
```bash
export OPENAI_MODEL=gpt-4o
```
- ✅ Best possible quality
- ⚠️ More expensive (~$2.50/M input)
- ✅ Slightly better at edge cases
- **Best for**: When you need absolute best quality

### gpt-3.5-turbo (Budget)
```bash
export OPENAI_MODEL=gpt-3.5-turbo
```
- ⚠️ Lower quality (may still make mistakes)
- ✅ Cheapest option (~$0.50/M input)
- ✅ Very fast
- **Best for**: Quick testing only

## Comparison: OpenAI vs LM Studio

| Feature | OpenAI (gpt-4o-mini) | LM Studio (mistral-nemo-12b) |
|---------|---------------------|------------------------------|
| **Quality** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good |
| **Setup** | ✅ None (API key only) | ⚠️ Download model (~8GB), run server |
| **Speed** | ⚡⚡⚡ ~1-2 sec/post | ⚡⚡ ~2-3 sec/post |
| **Cost** | ~$0.10-0.20 for 67 posts | Free (but uses local resources) |
| **Consistency** | ✅ Very reliable | ⚠️ Can vary |
| **Offline** | ❌ Requires internet | ✅ Works offline |

## Troubleshooting

### Error: OPENAI_API_KEY not set

```bash
export OPENAI_API_KEY=sk-your-key-here
```

Make sure your key starts with `sk-`

### Error: 401 Unauthorized

Your API key is invalid or expired. Check:
1. Key is correct (copy-paste carefully)
2. Account has billing set up ([platform.openai.com/account/billing](https://platform.openai.com/account/billing))

### Error: 429 Rate Limit

You're making requests too quickly. The script already has a 1-second delay between posts, but if you hit a limit:

```bash
# Process in smaller batches
node scripts/extract-entities.js --limit 10
# Wait a minute, then continue with next batch
```

### Error: Insufficient Quota

Add credits to your OpenAI account:
1. Go to [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. Add a payment method
3. Add credits (even $5 is more than enough for this task)

## Usage Examples

### Basic Usage

```bash
# Set up (one time)
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...

# Extract from all posts
node scripts/extract-entities.js
```

### Testing Different Models

```bash
# Test with mini model
export OPENAI_MODEL=gpt-4o-mini
node scripts/extract-entities.js --limit 3

# Compare with premium model
export OPENAI_MODEL=gpt-4o
node scripts/extract-entities.js --limit 3
```

### NPM Scripts

```bash
# Quick test (5 posts)
pnpm run extract-entities:test

# Full extraction
pnpm run extract-entities
```

## Best Practices

1. **Start Small**: Always test with `--limit 3` first
2. **Check Quality**: Review the output before processing all posts
3. **Use Mini**: `gpt-4o-mini` is perfect for this task, no need for gpt-4o
4. **Monitor Costs**: Check usage at [platform.openai.com/usage](https://platform.openai.com/usage)

## Alternative: Continue with LM Studio

If you prefer to use LM Studio (free, offline):

```bash
export AI_PROVIDER=lmstudio
export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
node scripts/extract-entities.js --limit 3
```

See `EXTRACTION-MODEL-RECOMMENDATION.md` for LM Studio setup guide.

## Summary

**For best results with minimal hassle:**

```bash
# 1. Get API key from platform.openai.com
# 2. Configure
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o-mini

# 3. Test
node scripts/extract-entities.js --limit 3

# 4. Run full extraction
node scripts/extract-entities.js
```

Total time: ~5 minutes  
Total cost: ~$0.15  
Quality: Excellent ✨
