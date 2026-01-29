# Deploy Preview SEO Protection

## ✅ Problem Solved: Deploy Previews Now Protected from Search Engine Indexing

### The Risk You Identified

When deploy preview URLs are shared publicly (PR comments, Slack, Twitter), search engine crawlers can:

- ❌ Find and index preview pages
- ❌ Follow sitemap to all preview pages
- ❌ Subscribe to RSS feed with preview content
- ❌ Create duplicate content issues
- ❌ Index preview content instead of production

### The Solution Implemented

**All deploy preview pages now have `noindex,nofollow` automatically applied!**

```html
<!-- Deploy Preview Pages -->
<meta name="robots" content="noindex,nofollow" />
<link rel="canonical" href="https://deploy-preview-###--pwv-www.netlify.app/" />
```

```html
<!-- Production Pages -->
<meta name="robots" content="index,follow" />
<link rel="canonical" href="https://pwv.com/" />
```

---

## How It Works

### 1. Automatic Detection in `Layout.astro`

```javascript
export const isDeployPreview = process.env.CONTEXT === 'deploy-preview';

// IMPORTANT: Prevent deploy previews from being indexed by search engines
// This protects against duplicate content issues if preview URLs are shared publicly
const shouldNoindexPreview = isDeployPreview && !noindex;

// Apply to robots meta tag
<meta
  name="robots"
  content={
    noindex || shouldNoindexPreview ? 'noindex,nofollow' : 'index,follow'
  }
/>;
```

### 2. Environment Configuration in `netlify.toml`

```toml
# Prevent deploy previews from being indexed by search engines
[context.deploy-preview.environment]
  ROBOTS = "noindex"

[context.branch-deploy.environment]
  ROBOTS = "noindex"
```

---

## What About Sitemap and RSS in Previews?

### ✅ Keep Them Enabled - Here's Why:

**Sitemap in Deploy Previews**:

- ✅ Useful for testing sitemap generation
- ✅ Useful for QA to navigate all pages
- ✅ Uses preview URLs (not production)
- ✅ Protected by noindex on every page
- ✅ Search engines respect noindex even if they find the sitemap

**RSS Feed in Deploy Previews**:

- ✅ Useful for testing feed generation
- ✅ Useful for QA to verify feed content
- ✅ Uses preview URLs (not production)
- ✅ Won't be subscribed to (preview URL not advertised)
- ✅ Even if subscribed, preview content won't be indexed (noindex)

**Alternative Approach** (Not recommended):

- Could disable sitemap/RSS generation in previews
- Would prevent testing these features
- Unnecessary since noindex provides complete protection

---

## Protection Layers

### Layer 1: HTML Meta Tags (Primary)

```html
<meta name="robots" content="noindex,nofollow" />
```

- ✅ Works for all crawlers (Google, Bing, etc.)
- ✅ Most reliable method
- ✅ Applied to every page automatically

### Layer 2: Canonical URLs

```html
<link rel="canonical" href="https://deploy-preview-###--pwv-www.netlify.app/" />
```

- ✅ Points to preview URL (not production)
- ✅ Prevents crawler confusion
- ✅ Proper SEO practice

### Layer 3: Environment Variables

```toml
[context.deploy-preview.environment]
  ROBOTS = "noindex"
```

- ✅ Available for additional logic if needed
- ✅ Documents intent in config

---

## Verification

### Test Deploy Preview Build

```bash
# Build with preview context
CONTEXT=deploy-preview DEPLOY_PRIME_URL=https://test-preview.netlify.app pnpm run build

# Check the output
grep 'name="robots"' dist/index.html
# Result: <meta name="robots" content="noindex,nofollow"> ✅
```

### Test Production Build

```bash
# Build normally (production context)
pnpm run build

# Check the output
grep 'name="robots"' dist/index.html
# Result: <meta name="robots" content="index,follow"> ✅
```

---

## Comparison Table

| Aspect              | Deploy Preview                  | Production                |
| ------------------- | ------------------------------- | ------------------------- |
| **Robots Meta**     | `noindex,nofollow`              | `index,follow`            |
| **Canonical URL**   | `https://deploy-preview-###...` | `https://pwv.com`         |
| **Sitemap**         | Present (preview URLs)          | Present (production URLs) |
| **RSS Feed**        | Present (preview URLs)          | Present (production URLs) |
| **Search Indexing** | ❌ Blocked                      | ✅ Allowed                |
| **Shareable**       | ✅ Yes (for QA/review)          | ✅ Yes (for users)        |
| **SEO Impact**      | 🛡️ Protected                    | ✅ Optimized              |

---

## Real-World Scenarios

### Scenario 1: PR Shared on Twitter

```
Developer tweets: "Check out our new feature! https://deploy-preview-123--pwv-www.netlify.app"
```

**What Happens**:

1. ✅ People can click and view the preview
2. ✅ Googlebot might crawl the URL
3. ✅ **Googlebot sees `noindex,nofollow` and doesn't index**
4. ✅ No duplicate content issues
5. ✅ Production pages remain authoritative

### Scenario 2: PR Comment with Sitemap Link

```
Netlify bot posts: Deploy Preview: https://deploy-preview-123--pwv-www.netlify.app
                    Sitemap: https://deploy-preview-123--pwv-www.netlify.app/sitemap-index.xml
```

**What Happens**:

1. ✅ QA can test the sitemap
2. ✅ If crawler finds sitemap, it sees preview URLs
3. ✅ Crawler visits pages, sees `noindex,nofollow`
4. ✅ **Crawler doesn't index any pages**
5. ✅ No SEO impact

### Scenario 3: Accidental RSS Subscription

```
Someone accidentally subscribes to preview RSS feed
```

**What Happens**:

1. ✅ Feed reader gets preview content
2. ✅ Links point to preview pages
3. ✅ If crawler follows links, sees `noindex,nofollow`
4. ✅ **Content not indexed**
5. ✅ Minimal impact (preview will be deleted soon anyway)

---

## Why This Approach is Best

### ✅ Advantages

1. **Complete Protection**: Every preview page has noindex
2. **Zero Configuration**: Works automatically via CONTEXT env var
3. **No Breaking Changes**: Sitemap and RSS still work for testing
4. **SEO-Safe**: Google respects noindex tags
5. **Developer-Friendly**: Previews are still shareable for review

### ❌ Alternative Approaches (Not Recommended)

**Disable Sitemap/RSS in Previews**:

- ❌ Can't test sitemap generation
- ❌ Can't test RSS feed
- ❌ More complex conditional logic
- ❌ Unnecessary (noindex is sufficient)

**Password-Protect Previews**:

- ❌ Inconvenient for reviewers
- ❌ Requires authentication flow
- ❌ Breaks automatic preview links
- ❌ Overkill for SEO concerns

**Use robots.txt**:

- ❌ robots.txt not effective for previews (shared subdomain)
- ❌ Less reliable than meta tags
- ❌ Not crawler-specific

---

## Industry Best Practices

### What Others Do

**Vercel**: Doesn't automatically add noindex to previews

- Requires manual configuration
- Many sites accidentally index previews

**Netlify**: Doesn't automatically add noindex to previews

- Requires manual configuration (like we've done)
- Our implementation follows their recommendations

**Next.js on Vercel**: Recommends checking VERCEL_ENV

```javascript
// Next.js example
const robotsConfig = {
  index: process.env.VERCEL_ENV === 'production',
};
```

**Our Approach**: Similar to Next.js best practice

```javascript
// Our implementation
const shouldNoindexPreview = isDeployPreview && !noindex;
```

---

## Testing Checklist

### ✅ Before Deploy

- [x] Build with `CONTEXT=deploy-preview` environment variable
- [x] Verify `noindex,nofollow` in generated HTML
- [x] Verify canonical uses preview URL
- [x] Verify sitemap uses preview URLs
- [x] Verify RSS feed uses preview URLs

### ✅ After First Preview Deploy

- [ ] Create a PR to generate new preview
- [ ] View source on preview homepage
- [ ] Confirm: `<meta name="robots" content="noindex,nofollow">`
- [ ] Confirm: Canonical uses preview URL
- [ ] Test: Sitemap accessible and uses preview URLs
- [ ] Test: RSS feed accessible and uses preview URLs

### ✅ After Production Deploy

- [ ] View source on production homepage
- [ ] Confirm: `<meta name="robots" content="index,follow">`
- [ ] Confirm: Canonical uses `https://pwv.com`
- [ ] Test: Sitemap uses production URLs
- [ ] Test: RSS feed uses production URLs

---

## Monitoring

### Google Search Console

After deploying, monitor for:

- ✅ No deploy preview URLs appearing in index
- ✅ No "duplicate content" warnings for previews
- ✅ Production URLs properly indexed

### What to Do if Preview Gets Indexed

If somehow a preview URL gets indexed (unlikely):

1. **Don't panic**: Preview will be deleted soon anyway
2. **Check meta tags**: Verify noindex is present
3. **Request removal**: Use Google Search Console URL Removal tool
4. **Review sharing**: Check if preview was shared without noindex

---

## Summary

### ✅ What's Protected

- All deploy preview pages have `noindex,nofollow`
- Sitemap exists but pages won't be indexed
- RSS feed exists but content won't be indexed
- Canonical URLs point to preview domain (not production)

### ✅ What's Not Affected

- Production pages: Still indexed normally
- Preview functionality: Still works for QA/review
- Testing: Sitemap and RSS still testable

### ✅ Bottom Line

**Deploy previews are now completely protected from search engine indexing while remaining fully functional for testing and review.**

No configuration needed - it just works! 🎉
