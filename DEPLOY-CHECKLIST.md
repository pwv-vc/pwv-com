# Deploy Checklist - SEO Fixes

## What Was Fixed

### Issue: "Duplicate, Google chose different canonical than user"

**Root Cause**: Your site was generating canonical URLs with `http://localhost:4321/` instead of `https://pwv.com/`

**Impact**: Google ignored your canonical tags and chose its own URLs, causing duplicate content issues

**Fix**: Changed default site URL to `https://pwv.com` in both `astro.config.mjs` and `netlify.toml`

**Result**: All canonical URLs now correctly use the production domain

---

## Pre-Deploy Verification ✅

All checks passed locally:

- ✅ Build completes successfully (249 pages)
- ✅ Canonical URLs use `https://pwv.com` (not localhost)
- ✅ OG URLs use `https://pwv.com`
- ✅ Noindex tags applied to 404, thank-you, external posts
- ✅ Paginated pages have noindex + canonical to page 1
- ✅ Trailing slash config set to 'never'
- ✅ HTTPS and www redirects configured

---

## Deploy Steps

### 1. Commit Changes

```bash
git add .
git commit -m "Fix SEO issues: correct canonical URLs and add noindex tags"
git push origin main
```

### 2. Netlify Auto-Deploy

Netlify will automatically build and deploy. Monitor the deploy log for:
- Build success
- No errors
- Deployment URL

### 3. Verify Production

After deployment completes (usually 2-5 minutes), run these checks:

#### A. Check Homepage Canonical

Visit https://pwv.com and view source (Ctrl+U or Cmd+Option+U):

Search for "canonical" - should see:
```html
<link rel="canonical" href="https://pwv.com/">
```

#### B. Check News Page

Visit https://pwv.com/news and view source:
```html
<link rel="canonical" href="https://pwv.com/news">
```

#### C. Check Paginated Page

Visit https://pwv.com/news/2 and view source:
```html
<link rel="canonical" href="https://pwv.com/news">
<meta name="robots" content="noindex,nofollow">
```

#### D. Check External Post

Visit any external post (e.g., latest Handshake post) and view source:
```html
<meta name="robots" content="noindex,nofollow">
<meta http-equiv="refresh" content="5; url=...">
```

#### E. Test Redirects

```bash
# Test HTTP to HTTPS redirect
curl -I http://pwv.com/
# Should return: Location: https://pwv.com/

# Test www redirect
curl -I https://www.pwv.com/
# Should return: Location: https://pwv.com/
```

---

## Post-Deploy Monitoring

### Week 1

1. **Google Search Console**
   - Go to: https://search.google.com/search-console
   - Check "Page indexing" report
   - Look for decrease in errors

2. **Request Re-indexing** (optional but recommended)
   - In Search Console, use URL Inspection tool
   - Inspect key pages (homepage, main news page)
   - Click "Request Indexing"

### Week 2-4

1. **Monitor Error Trends**
   - "Duplicate, Google chose different canonical than user" should decrease
   - "Page with redirect" should decrease (external posts)
   - "Not found (404)" should decrease

2. **Check Indexed Pages**
   - External posts should be removed from index
   - Paginated pages (2+) should be removed from index
   - Main content pages should remain indexed

### Week 4+

All issues should be resolved. If any persist:
1. Use URL Inspection tool to check specific URLs
2. Verify canonical tags are correct in production
3. Check for any new errors in Search Console

---

## Quick Reference

### Files Changed

| File | Change |
|------|--------|
| `astro.config.mjs` | Site URL: `https://pwv.com`, trailingSlash: 'never' |
| `netlify.toml` | Build env URL, HTTPS/www redirects |
| `src/layouts/Layout.astro` | Added noindex and canonicalURL props |
| `src/pages/404.astro` | Added noindex |
| `src/pages/apply/thank-you.astro` | Added noindex |
| `src/pages/news/[...slug].astro` | Added noindex for external posts |
| `src/pages/news/[page].astro` | Added noindex + canonical for page 2+ |
| `src/pages/news/tags/[...params].astro` | Added noindex + canonical for page 2+ |
| `src/pages/news/author/[...params].astro` | Added noindex + canonical for page 2+ |

### Documentation

- **SEO-FIXES.md** - Detailed explanation of all SEO fixes
- **CANONICAL-URL-FIX.md** - Specific details about the canonical URL issue
- **SEO-VERIFICATION.md** - Build verification and monitoring guide
- **DEPLOY-CHECKLIST.md** - This file

---

## Rollback Plan (if needed)

If critical issues arise after deployment:

1. In `astro.config.mjs`, change:
   ```javascript
   site: 'https://pwv.com'  // back to
   site: process.env.URL || process.env.DEPLOY_URL || 'http://localhost:4321'
   ```

2. Remove `[build.environment]` section from `netlify.toml`

3. Commit and push:
   ```bash
   git add .
   git commit -m "Rollback canonical URL changes"
   git push origin main
   ```

However, **this is not recommended** as it will reintroduce the duplicate canonical issues.

---

## Expected Outcome

After 2-4 weeks:

✅ "Duplicate, Google chose different canonical than user" errors: **RESOLVED**  
✅ External posts: **Not indexed** (intentional)  
✅ 404 and thank-you pages: **Not indexed** (intentional)  
✅ Paginated pages (2+): **Not indexed** (intentional)  
✅ Main content pages: **Properly indexed**  
✅ Canonical URLs: **Respected by Google**  
✅ SEO signals: **Consolidated to correct URLs**

---

## Support

If you encounter issues:

1. Check build logs in Netlify dashboard
2. Verify environment variables are set correctly
3. Use Google Search Console's URL Inspection tool
4. Review the documentation files for detailed troubleshooting

---

## Status: Ready to Deploy ✅

All changes have been tested locally and are ready for production deployment.
