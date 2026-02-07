# Using FAL AnyLLM for Entity Extraction

FAL's AnyLLM API provides access to powerful open-source models with excellent quality and very competitive pricing.

## Why FAL AnyLLM?

✅ **Excellent Quality**: Llama 3.3 70B performs exceptionally well  
✅ **Cost-Effective**: Very affordable, often cheaper than OpenAI  
✅ **No Setup**: No local installation required  
✅ **Fast**: Quick inference with managed infrastructure  
✅ **Open Models**: Access to latest open-source LLMs  

## Cost Estimate

Using `meta-llama/llama-3.1-70b-instruct` (recommended):
- **Very cost-effective** for this task
- **67 posts**: Approximately **$0.05 - $0.15 total**
- Often cheaper than OpenAI's gpt-4o-mini

Check current pricing at: [fal.ai/models/fal-ai/any-llm](https://fal.ai/models/fal-ai/any-llm)

## Setup

### 1. Get a FAL API Key

1. Go to [fal.ai](https://fal.ai)
2. Sign in or create an account
3. Navigate to [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
4. Create a new API key
5. Copy your key

### 2. Configure Environment

```bash
# Set up your API key
export AI_PROVIDER=fal
export FAL_KEY=your-fal-key-here
export FAL_MODEL=meta-llama/llama-3.1-70b-instruct
```

Or create/update `.env` file:

```bash
AI_PROVIDER=fal
FAL_KEY=your-fal-key-here
FAL_MODEL=meta-llama/llama-3.1-70b-instruct
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

### Llama-3.1-70B-Instruct (Recommended)
```bash
export FAL_MODEL=meta-llama/llama-3.1-70b-instruct
```
- ✅ Excellent quality for entity extraction
- ✅ Cost-effective (standard pricing)
- ✅ Good balance of speed and accuracy
- **Best for**: Production extraction, regular use

### Llama-3.1-8B-Instruct (Budget)
```bash
export FAL_MODEL=meta-llama/llama-3.1-8b-instruct
```
- ✅ Very fast
- ✅ Cost-effective
- ⚠️ Smaller model, may be less accurate for complex extraction
- **Best for**: Quick tests or budget-conscious use

### Gemini-2.5-Flash (Fast & Cheap)
```bash
export FAL_MODEL=google/gemini-2.5-flash
```
- ✅ Very fast inference
- ✅ Cost-effective
- ✅ Good quality
- **Best for**: High-throughput needs

Check the full list of available models at: [fal.ai/models/fal-ai/any-llm/api](https://fal.ai/models/fal-ai/any-llm/api)

## Comparison: FAL vs OpenAI vs LM Studio

| Feature | FAL (Llama 3.1 70B) | OpenAI (gpt-4o-mini) | LM Studio (mistral-nemo-12b) |
|---------|---------------------|---------------------|------------------------------|
| **Quality** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good |
| **Setup** | ✅ API key only | ✅ API key only | ⚠️ Download model (~8GB), run server |
| **Speed** | ⚡⚡⚡ ~2-3 sec/post | ⚡⚡⚡ ~1-2 sec/post | ⚡⚡ ~2-3 sec/post |
| **Cost** | ~$0.05-0.15 for 67 posts | ~$0.10-0.20 for 67 posts | Free (but uses local resources) |
| **Consistency** | ✅ Very reliable | ✅ Very reliable | ⚠️ Can vary |
| **Offline** | ❌ Requires internet | ❌ Requires internet | ✅ Works offline |
| **Models** | Multiple open-source | OpenAI proprietary | Any local model |

## Troubleshooting

### Error: FAL_KEY not set

```bash
export FAL_KEY=your-fal-key-here
```

Get your key at: [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)

### Error: 401 Unauthorized

Your API key is invalid or expired. Check:
1. Key is correct (copy-paste carefully from dashboard)
2. Account is active
3. Key hasn't been revoked

### Error: 429 Rate Limit

You're making requests too quickly. The script already has a 1-second delay between posts, but if you hit a limit:

```bash
# Process in smaller batches
node scripts/extract-entities.js --limit 10
# Wait a minute, then continue with next batch
```

### Error: Model not found

Make sure the model name is correct:
```bash
# Correct (with namespace)
export FAL_MODEL=meta-llama/llama-3.1-70b-instruct

# Wrong (missing namespace)
export FAL_MODEL=Llama-3.3-70B-Instruct
```

Check available models at: [fal.ai/models](https://fal.ai/models)

## Usage Examples

### Basic Usage

```bash
# Set up (one time)
export AI_PROVIDER=fal
export FAL_KEY=your-key-here

# Extract from all posts
node scripts/extract-entities.js
```

### Testing Different Models

```bash
# Test with 70B model
export FAL_MODEL=meta-llama/llama-3.1-70b-instruct
node scripts/extract-entities.js --limit 3

# Compare with smaller model
export FAL_MODEL=meta-llama/Llama-3.2-3B-Instruct
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
3. **Use 70B**: `Llama-3.3-70B-Instruct` is perfect for this task
4. **Monitor Usage**: Check your FAL dashboard for usage and costs

## Alternative Providers

If you prefer different options:

### OpenAI (Alternative Cloud Option)
```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini
node scripts/extract-entities.js --limit 3
```

See `OPENAI-EXTRACTION-GUIDE.md` for details.

### LM Studio (Free, Local)
```bash
export AI_PROVIDER=lmstudio
export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
node scripts/extract-entities.js --limit 3
```

See `EXTRACTION-MODEL-RECOMMENDATION.md` for details.

## Summary

**For best results with minimal hassle and great value:**

```bash
# 1. Get API key from fal.ai/dashboard/keys
# 2. Configure
export AI_PROVIDER=fal
export FAL_KEY=your-fal-key-here
export FAL_MODEL=meta-llama/llama-3.1-70b-instruct

# 3. Test
node scripts/extract-entities.js --limit 3

# 4. Run full extraction
node scripts/extract-entities.js
```

Total time: ~3-5 minutes  
Total cost: ~$0.05-0.15  
Quality: Excellent ✨

## Why Choose FAL?

- ✅ **Cost-effective**: Often cheaper than OpenAI
- ✅ **Open models**: Access to latest open-source LLMs
- ✅ **Great quality**: Llama 3.3 70B is powerful
- ✅ **No setup**: Just an API key
- ✅ **Fast**: Managed infrastructure

Perfect balance of quality, cost, and convenience! 🚀
