# Entity Extraction - Quick Reference

## ⚡ Quick Start (FAL - Recommended)

```bash
# 1. Get API key: fal.ai/dashboard/keys
# 2. Configure
export AI_PROVIDER=fal
export FAL_KEY=your-fal-key-here
export FAL_MODEL=meta-llama/llama-3.1-70b-instruct

# 3. Test
node scripts/extract-entities.js --limit 3

# 4. Run
node scripts/extract-entities.js
```

**Cost:** ~$0.05-0.15 for all 67 posts  
**Time:** ~2-3 minutes  
**Quality:** Excellent ⭐⭐⭐⭐⭐

## 💰 Alternative 1 (OpenAI)

```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o-mini
node scripts/extract-entities.js --limit 3
```

**Cost:** ~$0.10-0.20 for all 67 posts  
**Time:** ~2-3 minutes  
**Quality:** Excellent ⭐⭐⭐⭐⭐

## 🆓 Alternative 2 (LM Studio - Free)

```bash
# 1. Install LM Studio: lmstudio.ai
# 2. Download model: mistralai/mistral-nemo-12b
# 3. Start server: lms server start --port 1234
# 4. Run
export AI_PROVIDER=lmstudio
export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
node scripts/extract-entities.js --limit 3
```

**Cost:** Free  
**Time:** ~20-30 minutes  
**Quality:** Very Good ⭐⭐⭐⭐

## 📋 Commands

```bash
# Help
node scripts/extract-entities.js --help

# Process only new posts (smart mode - DEFAULT)
node scripts/extract-entities.js

# Test with 1 new post
node scripts/extract-entities.js --limit 1

# Test with 5 new posts
node scripts/extract-entities.js --limit 5
pnpm run extract-entities:test  # same

# Force re-extract all posts (ignores existing files)
node scripts/extract-entities.js --force

# Force re-extract first 5 posts
node scripts/extract-entities.js --limit 5 --force

# Process specific file (only if not already extracted)
node scripts/extract-entities.js --file post-slug.md

# Force re-extract specific file
node scripts/extract-entities.js --file post-slug.md --force
```

## ✅ What It Extracts

- **Companies**: Business orgs (Anysphere, Railway, OpenAI)
- **People**: Full names + roles (Tom Preston-Werner, CEO)
- **Facts**: Key insights with categories (insight/trend/announcement/etc)
- **Figures**: Numbers with context ($100M Series B funding)
- **Topics**: Main themes (AI, Developer Tools, Funding)

## 📁 Output

Creates individual files: `src/content/entities/posts/{slug}.json`

Used by:
- Astro content collections (`src/content.config.ts`)
- Terminal UI (`/explore` page - dynamically aggregated at build time)

**Optimization:** Script skips posts that already have entity files (unless `--force` is used)

## 📚 Documentation

| File | Purpose |
|------|---------|
| `FAL-EXTRACTION-GUIDE.md` | Complete FAL AnyLLM setup guide (RECOMMENDED) |
| `OPENAI-EXTRACTION-GUIDE.md` | Complete OpenAI setup guide |
| `EXTRACTION-MODEL-RECOMMENDATION.md` | LM Studio model comparison |
| `EXTRACTION-CHANGES-SUMMARY.md` | What changed (removed filters, added providers, better prompt) |
| `QUICK-START-EXTRACTION.md` | Step-by-step setup for all providers |
| `scripts/README.md` | Detailed script documentation |

## 🔧 Environment Variables

```bash
# Choose provider
AI_PROVIDER=fal  # or 'openai' or 'lmstudio'

# FAL AnyLLM
FAL_KEY=your-fal-key-here
FAL_MODEL=meta-llama/llama-3.1-70b-instruct  # or Llama-3.2-3B-Instruct, Qwen2.5-72B-Instruct

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # or gpt-4o, gpt-3.5-turbo

# LM Studio
LM_STUDIO_URL=http://localhost:1234
LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
```

## 💡 Pro Tips

1. **Smart mode saves time & money:** Default behavior skips already-extracted posts
2. **Always test first:** Use `--limit 3` before full run
3. **Check quality:** `cat src/content/entities/posts/post-slug.json`
4. **Use FAL or OpenAI:** Much easier than downloading models
5. **Use --force sparingly:** Only when you need to re-extract (prompt changes, bug fixes)
6. **Monitor costs:** [platform.openai.com/usage](https://platform.openai.com/usage) or [fal.ai/dashboard](https://fal.ai/dashboard)

## ❌ Troubleshooting

### FAL: "FAL_KEY not set"
```bash
export FAL_KEY=your-fal-key-here
# Get key at: https://fal.ai/dashboard/keys
```

### FAL: "401 Unauthorized"
- Check API key is correct
- Verify key is active at: [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)

### OpenAI: "OPENAI_API_KEY not set"
```bash
export OPENAI_API_KEY=sk-your-key-here
```

### OpenAI: "401 Unauthorized"
- Check API key is correct
- Verify billing is set up: [platform.openai.com/account/billing](https://platform.openai.com/account/billing)

### LM Studio: "Cannot connect"
```bash
# Make sure server is running
lms server start --port 1234
# Or start from LM Studio GUI: Developer tab → Start Server
```

### LM Studio: "Model not loaded"
- Open LM Studio
- Click on the model to load it
- Or set: `export LM_STUDIO_MODEL=your-loaded-model`

## 🎯 Expected Results

**Good extraction (with capable model):**
```json
{
  "people": [
    {"name": "Tom Preston-Werner", "role": "Co-founder of PWV"},
    {"name": "Michael Truell", "role": "CEO of Anysphere"}
  ],
  "companies": ["Anysphere", "Railway", "Cursor"]
}
```

**Bad extraction (too small model):**
```json
{
  "people": [
    {"name": "John Doe", "role": "CEO"},  // ❌ Fake
    {"name": "Git", "role": "project"}     // ❌ Not a person
  ]
}
```

## 🚀 Ready to Go!

**Recommended first command (FAL - best value):**
```bash
export AI_PROVIDER=fal
export FAL_KEY=your-fal-key-here
export FAL_MODEL=meta-llama/llama-3.1-70b-instruct
node scripts/extract-entities.js --limit 3
```

**Alternative (OpenAI):**
```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-your-key-here
node scripts/extract-entities.js --limit 3
```

Check output, then run without `--limit` for all posts! ✨
