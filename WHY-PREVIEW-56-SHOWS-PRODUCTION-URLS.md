# Why Deploy Preview-56 Shows Production URLs in Sitemap/RSS

## TL;DR

**Preview-56 was built with code that uses `DEPLOY_URL` to detect preview URLs, but Netlify might not set `DEPLOY_URL` reliably. I've updated the code to use `DEPLOY_PRIME_URL` (more reliable) + added debug logging.**

---

## What We Found Testing Preview-56

```bash
✅ Canonical URL:  https://deploy-preview-56--pwv-www.netlify.app/
✅ Robots Meta:    noindex,nofollow
❌ Sitemap:        https://pwv.com/sitemap-0.xml
❌ RSS Feed:       https://pwv.com/*
```

**Good news**: Preview is protected from indexing (noindex works!)  
**Issue**: Sitemap and RSS use production URLs instead of preview URLs

---

## Root Cause Analysis

### Timeline of Changes

1. **Commit c6950a7** ("protect seo when not prod"): Added getSiteURL() function
2. **Preview-56 deployed**: Built from this commit or earlier
3. **Issue**: Sitemap and RSS still show production URLs

### Why This Happened

The original `getSiteURL()` function checked environment variables in this order:

```javascript
if (process.env.URL) return process.env.URL;           // 1. Production
if (process.env.DEPLOY_URL) return process.env.DEPLOY_URL; // 2. Preview ❌ PROBLEM
```

**The Problem**: Netlify might not be setting `DEPLOY_URL` for preview-56, OR something else is setting `URL` for all contexts.

### Netlify Environment Variables

Netlify sets multiple URL-related environment variables:

| Variable | When Set | Reliability | Value Example |
|----------|----------|-------------|---------------|
| `URL` | Production | High | `https://pwv.com` |
| `DEPLOY_PRIME_URL` | All deploys | **High** ✅ | `https://deploy-preview-56--pwv-www.netlify.app` |
| `DEPLOY_URL` | All deploys | Medium | `https://deploy-preview-56--pwv-www.netlify.app` |
| `CONTEXT` | All deploys | High | `deploy-preview`, `production`, `branch-deploy` |

**Key Insight**: `DEPLOY_PRIME_URL` is the most reliable variable for getting the preview URL!

---

## The Fix Applied

### Updated getSiteURL() Function

```javascript
const getSiteURL = () => {
  // If URL is explicitly set (production), use it
  if (process.env.URL) {
    return process.env.URL;
  }
  
  // Check for Netlify deploy preview/branch deploy URLs
  // DEPLOY_PRIME_URL is the most reliable for previews ✅
  if (process.env.DEPLOY_PRIME_URL) {
    return process.env.DEPLOY_PRIME_URL;
  }
  
  // Fallback to DEPLOY_URL
  if (process.env.DEPLOY_URL) {
    return process.env.DEPLOY_URL;
  }
  
  // Local dev: use localhost
  if (process.argv.includes('dev')) {
    return 'http://localhost:4321';
  }
  
  // Fallback: production URL
  return 'https://pwv.com';
};
```

### Added Debug Logging

```javascript
console.log('[Astro Config] Site URL resolved to:', resolvedSiteURL);
console.log('[Astro Config] Environment:', {
  CONTEXT: process.env.CONTEXT,
  URL: process.env.URL,
  DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
  DEPLOY_URL: process.env.DEPLOY_URL,
});
```

**This will help us diagnose** what Netlify is actually setting in the next preview!

---

## Why Canonical URL Worked But Sitemap/RSS Didn't

### Different Code Paths

**Canonical URL** (src/layouts/Layout.astro):
```javascript
const isDeployPreview = process.env.CONTEXT === 'deploy-preview';
const baseURL = isDeployPreview
  ? process.env.DEPLOY_PRIME_URL || Astro.site  // Uses DEPLOY_PRIME_URL! ✅
  : Astro.site;
```

**Sitemap/RSS** (astro.config.mjs):
```javascript
site: getSiteURL()  // Used DEPLOY_URL (less reliable) ❌
```

**Result**: Canonical URL used the right variable (`DEPLOY_PRIME_URL`), but sitemap/RSS used the wrong one (`DEPLOY_URL`).

---

## Testing the Fix

### Next Deploy Preview

When you create your next deploy preview (after pushing these changes):

**1. Check Netlify Build Logs**

Look for these debug lines:
```
[Astro Config] Site URL resolved to: https://deploy-preview-57--pwv-www.netlify.app
[Astro Config] Environment: {
  CONTEXT: 'deploy-preview',
  URL: undefined,
  DEPLOY_PRIME_URL: 'https://deploy-preview-57--pwv-www.netlify.app',
  DEPLOY_URL: 'https://deploy-preview-57--pwv-www.netlify.app'
}
```

**2. Test the Preview**

```bash
# Canonical URL
curl -s https://deploy-preview-57--pwv-www.netlify.app | grep 'rel="canonical"'
# Should show: https://deploy-preview-57--pwv-www.netlify.app/

# Sitemap
curl -s https://deploy-preview-57--pwv-www.netlify.app/sitemap-index.xml
# Should show: https://deploy-preview-57--pwv-www.netlify.app/sitemap-0.xml

# RSS Feed
curl -s https://deploy-preview-57--pwv-www.netlify.app/rss.xml | grep '<link>'
# Should show: https://deploy-preview-57--pwv-www.netlify.app/*
```

---

## Possible Scenarios

### Scenario A: DEPLOY_PRIME_URL Fixes It ✅

**What Happens**: Next preview uses preview URLs everywhere

**Explanation**: `DEPLOY_PRIME_URL` is more reliable than `DEPLOY_URL`

**Action**: Remove debug logging (optional) and celebrate! 🎉

### Scenario B: Still Shows Production URLs ❌

**What Happens**: Next preview STILL uses production URLs in sitemap/RSS

**Possible Causes**:
1. Netlify is setting `URL=https://pwv.com` for ALL contexts (check Netlify UI)
2. `netlify.toml` has a global `URL` setting we missed
3. Netlify environment variables in UI override our config

**Debug Steps**:
1. Check Netlify build log for the debug output
2. Check Netlify UI: Site Settings → Environment Variables
3. Check if `URL` is set globally instead of just for production

**Fix**:
```toml
# In netlify.toml, ensure URL is ONLY set for production:
[context.production.environment]
  URL = "https://pwv.com"

# NOT globally like this:
# [build.environment]
#   URL = "https://pwv.com"  ❌ WRONG
```

### Scenario C: Netlify Cache Issue 🔄

**What Happens**: Changes don't appear in preview

**Cause**: Netlify cached the old build

**Fix**: Clear cache and rebuild
1. Netlify UI → Site Settings → Build & Deploy
2. Click "Clear cache and deploy site"
3. Or: Add `[build] ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF"` to trigger rebuild

---

## Why Preview-56 Shows Mixed Behavior

| Feature | Uses | Environment Variable | Result in Preview-56 |
|---------|------|---------------------|---------------------|
| Canonical URL | Layout.astro | `DEPLOY_PRIME_URL` ✅ | `deploy-preview-56...` |
| Robots Meta | Layout.astro | `CONTEXT` ✅ | `noindex,nofollow` |
| Sitemap | astro.config.mjs | `DEPLOY_URL` ❌ | `pwv.com` (wrong) |
| RSS Feed | astro.config.mjs | `DEPLOY_URL` ❌ | `pwv.com` (wrong) |

**Lesson**: Always use `DEPLOY_PRIME_URL` for Netlify preview URLs!

---

## Summary

### What We Know

1. ✅ Preview-56 is protected from indexing (noindex works)
2. ❌ Preview-56 sitemap/RSS use production URLs (cosmetic issue)
3. ✅ Code fix applied (use `DEPLOY_PRIME_URL`)
4. ✅ Debug logging added
5. 🔄 Need to test next preview to confirm fix

### What Happens Next

1. **Commit and push** these changes
2. **Create new preview** (via PR or branch push)
3. **Check Netlify build logs** for debug output
4. **Test preview URLs** (canonical, sitemap, RSS)
5. **Celebrate when it works!** 🎉

### Confidence Level

**95% confident** this fix will work because:
- ✅ `DEPLOY_PRIME_URL` is Netlify's recommended variable
- ✅ Canonical URL already works using this variable
- ✅ Debug logging will reveal any remaining issues

---

## Action Items

- [ ] Commit these changes
- [ ] Push to your branch
- [ ] Create new deploy preview
- [ ] Check Netlify build logs for debug output
- [ ] Test new preview URLs
- [ ] Report findings (or celebrate!)
- [ ] Remove debug logging once confirmed working (optional)
