# Scripts

This directory contains utility scripts for the PWV website.

## fetch-external-content.js

A script to fetch content from external URLs and create library posts with proper metadata and images.

### Usage

```bash
# Using npm script
pnpm run fetch-external "https://example.com/article"

# Or directly with node
node scripts/fetch-external-content.js "https://example.com/article"
```

### What it does

1. **Fetches HTML content** from the provided URL
2. **Extracts metadata** including:
   - Title (cleaned up, removes site names and separators)
   - Description (cleaned up, removes "Read more" text)
   - Author (from meta tags or content)
   - Publication date (formatted as YYYY-MM-DD)
   - Open Graph image URL
3. **Downloads and saves images** locally in `src/images/library/external-{slug}/`
4. **Generates a markdown file** in `src/content/library/` with:
   - Proper frontmatter matching the content collection schema
   - External URL with `?ref=pwv.com` parameter
   - Tags including the site name and "external"
   - Filename prefixed with "external-"

### Example

```bash
pnpm run fetch-external "https://www.aalo.com/post/aalo-closes-100m-series-b"
```

This creates:
- `src/content/library/external-aalo-closes-100m-series-b.md`
- `src/images/library/external-aalo-closes-100m-series-b/banner_16_9-1.png` (if OG image exists)

### Requirements

- Node.js with ES modules support
- `jsdom` package (installed as dev dependency)

### Features

- **Smart metadata extraction**: Tries multiple methods to find title, description, author, and date
- **Image handling**: Downloads Open Graph images and saves them locally with proper naming
- **Clean formatting**: Removes unnecessary text from titles and descriptions
- **Error handling**: Graceful fallbacks for missing metadata
- **URL tracking**: Adds `?ref=pwv.com` to track external links

- **Favicon download**: Downloads favicons for the portfolio companies

### Usage

Favicons are fetched for portfolio companies defined in `src/content/portfolio/*.json`.

```bash
# Using npm script
pnpm run download-favicons representative.json

# Or directly with node (choose one of the files or 'all')
node scripts/download-favicons.js representative.json
node scripts/download-favicons.js rolling-fund.json
node scripts/download-favicons.js angel.json
node scripts/download-favicons.js all

# Force re-download even if files already exist
node scripts/download-favicons.js all --force
node scripts/download-favicons.js representative.json -f
```

By default, existing files in `src/images/logos/small/<slug>.png` are skipped. Use `--force` (or `-f`) to always re-download.

---

If need to download and convert svg favicons to png, use the following command:

```bash
curl -L https://www.commutatorstudios.com/favicon.svg -o /tmp/commutator-studios.svg && convert -background none -resize 64x64 /tmp/commutator-studios.svg src/images/logos/small/commutator-studios.png
```
