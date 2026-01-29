# URL Configuration Status & Testing Guide

## Current Status

### ✅ What's Working

1. **Production Canonical URLs**: `https://pwv.com/*` ✅
2. **Production RSS Feed**: `https://pwv.com/*` ✅  
3. **Production Sitemap**: `https://pwv.com/*` ✅
4. **Deploy Preview Canonical URLs**: `https://deploy-preview-56--pwv-www.netlify.app/*` ✅

### ⚠️ Issues Found in Deploy Preview

Based on testing deploy-preview-56:
- ❌ **Sitemap**: Shows `https://pwv.com/sitemap-0.xml` (should use preview URL)
- ❌ **RSS Feed**: Shows `https://pwv.com/*` links (should use preview URL)

**Why Canonical Works But Sitemap/RSS Don't**:
- Canonical URL uses special logic in `Layout.astro` that detects `CONTEXT=deploy-preview`
- Sitemap and RSS use the `site` config from `astro.config.mjs`
- This suggests the `site` config is resolving to production URL in preview builds

---

## Configuration Changes Made

### 1. Updated `astro.config.mjs`

Added smart URL detection function:

```javascript
const getSiteURL = () => {
  // If URL is explicitly set (production via netlify.toml), use it
  if (process.env.URL) {
    return process.env.URL;
  }
  
  // If DEPLOY_URL is set (Netlify preview/branch deploy), use it
  if (process.env.DEPLOY_URL) {
    return process.env.DEPLOY_URL;
  }
  
  // If in dev mode (astro dev), use localhost
  if (process.argv.includes('dev')) {
    return 'http://localhost:4321';
  }
  
  // Fallback to production URL for builds
  return 'https://pwv.com';
};

export default defineConfig({
  site: getSiteURL(),
  // ... rest of config
});
```

### 2. Kept `netlify.toml` Context-Specific

```toml
[context.production.environment]
  URL = "https://pwv.com"

# Deploy previews will use Netlify's DEPLOY_URL
```

---

## Expected Behavior After Changes

| Environment | `site` Config | Canonical | Sitemap | RSS |
|-------------|---------------|-----------|---------|-----|
| **Local Dev (`pnpm run dev`)** | `http://localhost:4321` | `http://localhost:4321/*` | `http://localhost:4321/*` | `http://localhost:4321/*` |
| **Local Build (`pnpm run build`)** | `https://pwv.com` | `https://pwv.com/*` | `https://pwv.com/*` | `https://pwv.com/*` |
| **Deploy Preview** | `https://deploy-preview-###--pwv...` | `https://deploy-preview-###--pwv.../*` | `https://deploy-preview-###--pwv.../*` | `https://deploy-preview-###--pwv.../*` |
| **Production** | `https://pwv.com` | `https://pwv.com/*` | `https://pwv.com/*` | `https://pwv.com/*` |

---

## Testing Instructions

### Test 1: Local Development (`pnpm run dev`)

```bash
# Start dev server
pnpm run dev

# In another terminal, check the URLs
# (dev server should show localhost:4321)
```

**Expected**:
- Dev server runs on `http://localhost:4321`
- All links, canonical URLs use localhost
- Can navigate the site locally

### Test 2: Local Build (`pnpm run build`)

```bash
# Build locally
pnpm run build

# Check the generated files
grep 'rel="canonical"' dist/index.html
grep '<loc>' dist/sitemap-0.xml | head -3
grep '<link>' dist/rss.xml | head -3
```

**Expected**:
- Canonical: `https://pwv.com/`
- Sitemap: `https://pwv.com/*`
- RSS: `https://pwv.com/*`

### Test 3: Deploy Preview

**Create a new preview** (current preview-56 has old code):
```bash
# Make a small change and push to a branch
git checkout -b test-url-config
git add .
git commit -m "Test: Verify URL configuration in deploy preview"
git push origin test-url-config
```

Then create a PR and Netlify will generate a new preview.

**Check the preview** (e.g., `https://deploy-preview-57--pwv-www.netlify.app`):

```bash
# Homepage canonical
curl -s https://deploy-preview-57--pwv-www.netlify.app | grep 'rel="canonical"'
# Should show: https://deploy-preview-57--pwv-www.netlify.app/

# Sitemap
curl -s https://deploy-preview-57--pwv-www.netlify.app/sitemap-index.xml
# Should show: https://deploy-preview-57--pwv-www.netlify.app/sitemap-0.xml

# RSS feed
curl -s https://deploy-preview-57--pwv-www.netlify.app/rss.xml | grep '<link>' | head -3
# Should show: https://deploy-preview-57--pwv-www.netlify.app/*
```

### Test 4: Production

After merging to main:

```bash
# Homepage canonical
curl -s https://pwv.com | grep 'rel="canonical"'
# Should show: https://pwv.com/

# Sitemap
curl -s https://pwv.com/sitemap-index.xml
# Should show: https://pwv.com/sitemap-0.xml

# RSS feed
curl -s https://pwv.com/rss.xml | grep '<link>' | head -3
# Should show: https://pwv.com/*
```

---

## Troubleshooting

### Issue: Deploy Preview Still Uses Production URLs

**Possible Causes**:
1. Netlify isn't setting `DEPLOY_URL` environment variable
2. `URL` is being set for all contexts (check Netlify UI)
3. Caching issue - clear Netlify cache and rebuild

**Debug Steps**:
1. Check Netlify deploy log for environment variables
2. Add debug logging to see what `getSiteURL()` returns
3. Verify in Netlify UI: Site Settings → Environment Variables

### Issue: Local Dev Doesn't Use Localhost

**Possible Causes**:
1. `process.argv` check isn't working
2. Environment variable is set manually

**Fix**:
```bash
# Explicitly unset URL for local dev
unset URL
pnpm run dev
```

### Issue: Sitemap/RSS Still Wrong in Preview

If the new deploy preview still shows production URLs:

1. **Check Netlify build logs** for the actual environment variables
2. **Add debug logging** to `astro.config.mjs`:
   ```javascript
   const siteURL = getSiteURL();
   console.log('[DEBUG] Environment:', {
     URL: process.env.URL,
     DEPLOY_URL: process.env.DEPLOY_URL,
     CONTEXT: process.env.CONTEXT,
     resolvedSite: siteURL
   });
   ```
3. **Clear Netlify cache**: Site Settings → Build & Deploy → Clear cache and deploy

---

## Why This Approach

### Localhost for Local Dev
- **Better DX**: Links work correctly in local dev
- **Easier testing**: Don't need to think about production URLs locally
- **Standard practice**: Most frameworks default to localhost in dev

### Preview URLs for Deploy Previews
- **Isolated testing**: Each preview has its own URL
- **Shareable**: Can send preview links that work correctly
- **SEO-safe**: Preview URLs aren't indexed by Google

### Production URLs for Production
- **SEO-correct**: Google sees and respects canonical URLs
- **Consistent**: All internal links use production domain
- **Standards-compliant**: Follows web best practices

---

## Alternative: Keep Production URLs Everywhere

If you prefer the previous approach (production URLs even in local dev):

```javascript
// In astro.config.mjs
site: process.env.URL || process.env.DEPLOY_URL || 'https://pwv.com',
```

**Pros**:
- Local builds match production exactly
- No surprises with URLs changing between environments

**Cons**:
- Local dev shows production URLs (links might not work locally)
- Deploy previews might show production URLs if DEPLOY_URL isn't set

---

## Recommended: Test New Deploy Preview

The current deploy-preview-56 has the old configuration. To properly test:

1. Push these changes to a new branch
2. Create a PR to trigger a new preview
3. Test the new preview with the updated configuration
4. Verify all three URL types (canonical, sitemap, RSS) use preview URL

---

## Summary

**Changes Made**:
- ✅ Added smart URL detection to `astro.config.mjs`
- ✅ Local dev will use localhost
- ✅ Deploy previews should use preview URLs
- ✅ Production uses production URLs
- ✅ Sitemap generation error fixed

**Action Required**:
- 🔄 Create new deploy preview to test updated configuration
- ✅ Verify sitemap and RSS use correct URLs in preview
- ✅ Test local dev uses localhost
- ✅ Deploy to production and verify

**Status**: Ready for testing ⚠️
