# URL Configuration Test Results

## Deploy Preview Check (deploy-preview-56)

### ✅ Working Correctly:
- **Canonical URL**: `https://deploy-preview-56--pwv-www.netlify.app/`
  - This works because Layout.astro detects `CONTEXT=deploy-preview`

### ❌ Issues Found:
- **Sitemap**: Using `https://pwv.com/sitemap-0.xml` (should use preview URL)
- **RSS Feed**: Using `https://pwv.com/` (should use preview URL)

## Root Cause

The sitemap and RSS feed use the `site` config from `astro.config.mjs`, which resolves to:
```javascript
site: process.env.URL || process.env.DEPLOY_URL || fallback
```

**Problem**: Something is setting `URL` for all contexts, not just production, OR `DEPLOY_URL` isn't being set correctly in deploy previews.

## Solution Applied

Updated `astro.config.mjs` with smarter URL detection:
1. Use `URL` if explicitly set (production)
2. Use `DEPLOY_URL` if set (Netlify previews)
3. Use `localhost:4321` if running `astro dev`
4. Fallback to production URL

## Testing Required

1. **Local Dev**: Should use `http://localhost:4321`
2. **Deploy Preview**: Should use `https://deploy-preview-###--pwv.netlify.app`
3. **Production**: Should use `https://pwv.com`
