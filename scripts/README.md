# Scripts Documentation

## extract-entities.js

Extracts structured entity data (companies, people, topics, facts, figures) from blog posts using AI via LM Studio's local server.

### Prerequisites

1. **Install LM Studio**: Download from [lmstudio.ai](https://lmstudio.ai)
2. **Start the server**: 
   ```bash
   lms server start --port 1234
   ```
3. **Load a model**: Download and load `liquid/lfm2.5-1.2b` (or another model) in LM Studio

### Usage

```bash
# Process all posts (default)
node scripts/extract-entities.js

# Process only first 5 posts (for quick testing)
node scripts/extract-entities.js --limit 5

# Process just 1 post (fastest test)
node scripts/extract-entities.js --limit 1

# Show help
node scripts/extract-entities.js --help

# Custom configuration with environment variables
export LM_STUDIO_URL=http://localhost:1234
export LM_STUDIO_MODEL=liquid/lfm2.5-1.2b
export LM_API_TOKEN=your_token_here  # Optional, if auth enabled
node scripts/extract-entities.js --limit 10
```

### How It Works

1. **Tests LM Studio connection** and checks if model is loaded
2. **Reads all posts** from `src/content/posts/`
3. **Generates slugs** from filenames (without extension)
   - Example: `external-liquid-ai-introducing-liquid-nanos-frontiergrade-performance-on-everyday-devices.md`
   - Becomes: `external-liquid-ai-introducing-liquid-nanos-frontiergrade-performance-on-everyday-devices`
4. **Extracts entities** using local LM Studio model (default: liquid/lfm2.5-1.2b)
5. **Validates** all post references to ensure they exist
6. **Saves results** to `src/data/extracted-entities.json`

### Important Notes

- **Full slugs**: The script uses the complete filename as the slug (minus extension)
- **Trailing slashes**: Astro's `trailingSlash: 'always'` config automatically adds `/` to URLs
- **Post URLs**: 
  - Slug: `post-example`
  - URL: `/news/post-example/` (with trailing slash)
- **Validation**: The script now validates all post references to catch mismatches

### Output Format

The script generates data that matches the Astro content collection schema in `src/content.config.ts`:

```json
{
  "posts": {
    "full-post-slug": {
      "title": "Post Title",
      "companies": ["Company Name"],
      "people": [
        {
          "name": "Person Name",
          "role": "Their Title/Role"
        }
      ],
      "facts": [
        {
          "text": "Key insight or fact",
          "category": "insight|trend|philosophy|announcement|milestone"
        }
      ],
      "figures": [
        {
          "value": "100M",
          "context": "Series B funding",
          "unit": "USD"
        }
      ],
      "topics": ["AI", "Developer Tools"]
    }
  },
  "entities": {
    "companies": {
      "Company Name": {
        "posts": ["full-post-slug"],
        "mentions": 1,
        "description": "Auto-generated description"
      }
    },
    "people": {
      "Person Name": {
        "posts": ["full-post-slug"],
        "mentions": 1,
        "role": "Their Title/Role"
      }
    },
    "topics": {
      "Topic Name": {
        "posts": ["full-post-slug"],
        "mentions": 1
      }
    }
  }
}
```

### Schema Validation

The script automatically validates and normalizes extracted data:
- **fact.category** must be one of: `insight`, `trend`, `philosophy`, `announcement`, `milestone`
- **people** must have both `name` and `role` (defaults to "Unknown" if missing)
- All arrays are validated and empty values are filtered out
- Invalid data types are coerced to match schema requirements

### Troubleshooting

**Cannot connect to LM Studio:**
```bash
# Make sure LM Studio server is running
lms server start --port 1234

# Or start from LM Studio GUI: Developer tab → Start Server
```

**Model not loaded:**
- Open LM Studio
- Go to "Search" and download `liquid/lfm2.5-1.2b`
- Load the model before running the script
- Or use a different model: `export LM_STUDIO_MODEL=your-model-name`

**Invalid post references warning:**
- Check that the slug in entities data matches the actual filename
- Ensure no slugs are truncated or shortened
- Run the script again to regenerate with validation

**Slow extraction:**
- The script includes a 1-second delay between posts
- First run with a small model like `liquid/lfm2.5-1.2b` (fast)
- For better quality, use larger models like `mistral-nemo` or `llama-3`

**Connection refused:**
- Check the port: LM Studio default is `1234`
- Verify URL: `export LM_STUDIO_URL=http://localhost:1234`
- Check firewall settings

**Model copying example/placeholder data:**

If your output contains placeholder values like:
```json
{
  "companies": ["Cursor", "FAL", "Railway"],
  "people": [{"name": "Full Name", "role": "Title/Role"}]
}
```

The model is copying examples from the prompt instead of extracting real data.

Solutions:
1. **Use a larger model** (recommended):
   ```bash
   export LM_STUDIO_MODEL=mistralai/mistral-nemo-12b
   node scripts/extract-entities.js --limit 5
   ```
   Larger models better distinguish instructions from examples.

2. **The prompt has been updated** (v0.1.4+) to explicitly prevent this
3. **Automatic filtering** removes obvious placeholders like "Full Name", "Company Name"

See `PROMPT-FIX.md` for detailed explanation and more solutions.
