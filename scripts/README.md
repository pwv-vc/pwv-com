# Favicon Download Script

This script downloads favicons for portfolio companies using Google's favicon service and saves them to the `src/images/logos/small/` directory.

## Usage

### Using npm/pnpm script (recommended):
```bash
# Download favicons for rolling fund companies
pnpm run download-favicons rolling-fund.json

# Download favicons for representative companies
pnpm run download-favicons representative.json

# Download favicons for all companies
pnpm run download-favicons all
```

### Using Node.js directly:
```bash
# Download favicons for rolling fund companies
node scripts/download-favicons.js rolling-fund.json

# Download favicons for representative companies
node scripts/download-favicons.js representative.json

# Download favicons for all companies
node scripts/download-favicons.js all
```

## How it works

1. Parses the specified JSON file(s) from `src/content/portfolio/`
2. Extracts the `url` and `slug` from each company entry
3. Uses Google's favicon service to fetch favicons: `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url={URL}&size=64`
4. Saves each favicon as `{slug}.png` in `src/images/logos/small/`

## Features

- ✅ Downloads 64x64 PNG favicons
- ✅ Uses company slug as filename
- ✅ Handles errors gracefully
- ✅ Shows progress and success/failure status
- ✅ Adds small delays between requests to be respectful to the service
- ✅ Creates output directory if it doesn't exist
- ✅ Supports both individual files and batch processing

## Output

Favicons are saved as PNG files in `src/images/logos/small/` with filenames matching the company slugs from the JSON files.

