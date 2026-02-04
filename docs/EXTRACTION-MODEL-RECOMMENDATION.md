# Model Recommendation for Entity Extraction

## The Problem

The default `liquid/lfm2.5-1.2b` model is **too small** (1.2 billion parameters) to reliably extract entities from blog posts. Common issues:

### ❌ Problems with Small Models:

1. **Extracts placeholder/fake names**: "John Doe", "Jane Smith"
2. **Confuses projects with people**: Lists "Git" as a person
3. **Uses generic roles**: "company founder", "project mentioned"
4. **Incomplete names**: Just "Ralf" or "Jan" without last names
5. **Copies examples**: May still repeat example data from prompt

### Example of Bad Output:
```json
{
  "people": [
    {"name": "Git", "role": "project mentioned"},  // ❌ Git is not a person
    {"name": "John Doe", "role": "CEO"},           // ❌ Fake placeholder
    {"name": "Ralf", "role": "author"}             // ❌ Incomplete name
  ]
}
```

## ✅ Recommended Models

### Best Choice: Mistral Nemo (12B)
```bash
export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
node scripts/extract-entities.js --limit 3
```

**Pros:**
- ✅ Excellent instruction following
- ✅ Accurately distinguishes people from projects
- ✅ Extracts full names and real roles
- ✅ Good balance of speed vs quality
- ~2-3 seconds per post

**Expected output quality:**
```json
{
  "people": [
    {"name": "Michael Truell", "role": "CEO of Anysphere"},
    {"name": "Sualeh Asif", "role": "Co-founder"}
  ]
}
```

### Alternative: Llama 3.1 (8B)
```bash
export LM_STUDIO_MODEL=meta-llama/llama-3.1-8b-instruct
node scripts/extract-entities.js --limit 3
```

**Pros:**
- ✅ Good quality extraction
- ✅ Faster than Mistral Nemo
- ✅ Better than 1.2B models
- ~1-2 seconds per post

### For Speed: Phi-3 (3.8B)
```bash
export LM_STUDIO_MODEL=microsoft/phi-3-mini-128k-instruct
node scripts/extract-entities.js --limit 5
```

**Pros:**
- ✅ Much faster than larger models
- ✅ Better than 1.2B models
- ⚠️ May still make some mistakes
- ~0.5-1 second per post

## How to Switch Models

1. **Download in LM Studio:**
   - Open LM Studio
   - Go to "Search" tab
   - Search for `mistralai/mistral-nemo` (or other model)
   - Download the model

2. **Load the model:**
   - Click on the model to load it
   - Wait for it to load into memory

3. **Set environment variable:**
   ```bash
   export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
   ```

4. **Test with a few posts:**
   ```bash
   node scripts/extract-entities.js --limit 3
   ```

5. **Run full extraction if quality is good:**
   ```bash
   node scripts/extract-entities.js
   ```

## Quality Comparison

| Model | Size | Speed | Quality | Fake Names | Project/Person Confusion |
|-------|------|-------|---------|------------|-------------------------|
| liquid/lfm2.5 | 1.2B | ⚡⚡⚡ Fast | ⭐ Poor | ❌ Common | ❌ Common |
| phi-3-mini | 3.8B | ⚡⚡ Medium | ⭐⭐ OK | ⚠️ Sometimes | ⚠️ Sometimes |
| llama-3.1-8b | 8B | ⚡ Slower | ⭐⭐⭐ Good | ✅ Rare | ✅ Rare |
| mistral-nemo | 12B | 🐌 Slowest | ⭐⭐⭐⭐ Excellent | ✅ Never | ✅ Never |

## Time Estimates (67 posts)

- **liquid/lfm2.5-1.2b**: ~5-10 minutes (but poor quality)
- **phi-3-mini**: ~10-15 minutes (acceptable quality)
- **llama-3.1-8b**: ~15-20 minutes (good quality)
- **mistral-nemo-12b**: ~20-30 minutes (excellent quality)

## Recommendation

### For Production Data:
**Use `mistralai/mistral-nemo-12b`**

The extra 10-15 minutes is worth it for:
- ✅ No fake placeholder names
- ✅ Accurate people extraction
- ✅ No confusion between projects and companies
- ✅ Complete names with proper roles
- ✅ Reliable, production-ready data

### For Quick Testing:
**Use `liquid/lfm2.5-1.2b` with `--limit 1`**

Good for verifying:
- ✅ LM Studio is running
- ✅ Script works
- ✅ Basic structure is correct

Then switch to a better model for actual extraction.

## Example Workflow

```bash
# 1. Quick connection test (use fast model)
export LM_STUDIO_MODEL=liquid/lfm2.5-1.2b
node scripts/extract-entities.js --limit 1

# 2. If that works, switch to quality model
export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b

# 3. Test with 3 posts to verify quality
node scripts/extract-entities.js --limit 3

# 4. Check the output quality
cat src/content/entities/extracted-entities.json | grep -A 10 '"people"'

# 5. If output looks good, run full extraction
node scripts/extract-entities.js
```

## Troubleshooting

**Model won't load:**
- Check available RAM (12B models need ~8-12GB)
- Try a smaller model like `llama-3.1-8b`
- Close other applications

**Still getting bad results:**
- Make sure you've set the environment variable
- Verify in the script output which model is being used
- Try regenerating from scratch: delete `extracted-entities.json` first

**Out of memory errors:**
- Use `phi-3-mini` or `llama-3.1-8b` instead
- Or use `--limit` to process in batches
