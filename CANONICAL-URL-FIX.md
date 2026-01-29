# Canonical URL Fix - "Google chose different canonical than user"

## The Problem

Google Search Console was reporting: **"Duplicate, Google chose different canonical than user"**

This means Google found duplicate content on your site and **ignored** the canonical URLs you specified, choosing its own instead.

## Root Cause

Your site was generating canonical URLs with **localhost** instead of your production domain:

```html
<!-- WRONG - What was being generated -->
<link rel="canonical" href="http://localhost:4321/news">

<!-- CORRECT - What should be generated -->
<link rel="canonical" href="https://pwv.com/news">
```

### Why This Happened

In `astro.config.mjs`, the site configuration was:

```javascript
site: process.env.URL || process.env.DEPLOY_URL || 'http://localhost:4321'
```

When building locally or if Netlify environment variables weren't properly set, it would fall back to localhost. Google would see these localhost URLs and rightfully ignore them, choosing its own canonical URLs instead.

## The Fix

### 1. Changed Default Site URL

**File**: `astro.config.mjs`

```javascript
// BEFORE
site: process.env.URL || process.env.DEPLOY_URL || 'http://localhost:4321'

// AFTER
site: process.env.URL || process.env.DEPLOY_URL || 'https://pwv.com'
```

Now even if environment variables aren't set, the site will use the correct production URL.

### 2. Set Netlify Build Environment

**File**: `netlify.toml`

Added explicit URL in the build configuration:

```toml
[build]
  command = "pnpm run build"
  publish = "dist"

[build.environment]
  URL = "https://pwv.com"
```

This ensures Netlify always uses the correct URL during builds.

### 3. Added URL Consistency Redirects

**File**: `netlify.toml`

Added redirects to ensure all traffic uses consistent URLs:

```toml
# Force HTTPS for all traffic
[[redirects]]
  from = "http://pwv.com/*"
  to = "https://pwv.com/:splat"
  status = 301
  force = true

# Redirect www to non-www
[[redirects]]
  from = "https://www.pwv.com/*"
  to = "https://pwv.com/:splat"
  status = 301
  force = true

[[redirects]]
  from = "http://www.pwv.com/*"
  to = "https://pwv.com/:splat"
  status = 301
  force = true
```

This ensures:
- All HTTP traffic redirects to HTTPS
- All www traffic redirects to non-www
- Consistent canonical URLs across the site

## Verification

After rebuilding the site, canonical URLs now correctly use `https://pwv.com`:

```bash
# Homepage
<link rel="canonical" href="https://pwv.com/">

# News page
<link rel="canonical" href="https://pwv.com/news">

# Paginated page 2 (correctly points to page 1)
<link rel="canonical" href="https://pwv.com/news">

# Individual post
<link rel="canonical" href="https://pwv.com/news/post-slug">
```

## Why This Matters

### Impact on SEO

1. **Google trusts your canonical tags** - When you specify correct, production URLs, Google respects your preferences
2. **Consolidates ranking signals** - All SEO value goes to the correct URLs
3. **Prevents duplicate content penalties** - Google knows which version of the page is authoritative
4. **Improves indexing** - Google indexes the correct pages instead of guessing

### What Was Happening Before

1. Your site generated: `<link rel="canonical" href="http://localhost:4321/news">`
2. Google crawled: `https://pwv.com/news`
3. Google saw mismatch between canonical (localhost) and actual URL (pwv.com)
4. Google ignored your canonical tag and chose its own
5. Search Console reported: "Duplicate, Google chose different canonical than user"

### What Happens Now

1. Your site generates: `<link rel="canonical" href="https://pwv.com/news">`
2. Google crawls: `https://pwv.com/news`
3. Google sees canonical matches the actual URL
4. Google respects your canonical tag
5. No more duplicate content issues

## Related Fixes

These changes work together with other SEO fixes:

- **Trailing slash consistency** (`trailingSlash: 'never'`) - Ensures URLs are always without trailing slashes
- **Paginated canonical URLs** - Page 2+ points to page 1 as canonical
- **HTTPS enforcement** - All traffic uses secure HTTPS protocol
- **www redirect** - All traffic uses non-www version

## Testing in Production

After deploying, verify with these checks:

### 1. View Source

Visit any page on pwv.com, view source, and search for "canonical". You should see:

```html
<link rel="canonical" href="https://pwv.com/your-page">
```

Not localhost, not HTTP, not www.

### 2. Google Search Console

Monitor the "Page indexing" report:
- "Duplicate, Google chose different canonical than user" errors should decrease
- Check back in 2-4 weeks for full resolution

### 3. Using curl

```bash
# Check homepage canonical
curl -s https://pwv.com | grep -o 'rel="canonical" href="[^"]*"'
# Should output: rel="canonical" href="https://pwv.com/"

# Check news page
curl -s https://pwv.com/news | grep -o 'rel="canonical" href="[^"]*"'
# Should output: rel="canonical" href="https://pwv.com/news"
```

### 4. Browser Developer Tools

1. Open any page on pwv.com
2. Open DevTools (F12)
3. Go to Elements/Inspector tab
4. Search for "canonical"
5. Verify URL uses https://pwv.com

## Timeline for Resolution

- **Day 1**: Deploy fixes to production
- **Days 2-7**: Google recrawls your pages and sees correct canonicals
- **Weeks 2-4**: Search Console updates and errors decrease
- **Week 4+**: Issue should be fully resolved

## Rollback Plan

If issues arise:

```javascript
// In astro.config.mjs, revert to:
site: process.env.URL || process.env.DEPLOY_URL || 'http://localhost:4321'
```

And remove the `[build.environment]` section from `netlify.toml`.

However, this is **not recommended** as it will bring back the duplicate canonical issues.

## Additional Notes

### Local Development

During local development, the site will now use `https://pwv.com` as the base URL in your HTML. This is intentional and correct - it ensures your local builds match production.

If you need to test with localhost, you can temporarily set an environment variable:

```bash
URL=http://localhost:4321 pnpm run dev
```

### Deploy Previews

Netlify deploy previews will use `process.env.DEPLOY_PRIME_URL`, so they'll have their own correct URLs like:
```
https://deploy-preview-123--pwv.netlify.app
```

The code in `Layout.astro` handles this:

```javascript
const baseURL = isDeployPreview
  ? process.env.DEPLOY_PRIME_URL || Astro.site
  : Astro.site;
```

## Summary

**Root Cause**: Canonical URLs were using localhost instead of production domain

**Fix**: Changed default site URL to `https://pwv.com` and added Netlify environment configuration

**Result**: All canonical URLs now correctly use the production domain, allowing Google to respect your canonical preferences

**Impact**: Resolves "Duplicate, Google chose different canonical than user" errors in Search Console
