# SEO Fixes for Google Search Console Issues

This document outlines the fixes implemented to address Google Search Console indexing issues.

## Issues Identified

1. **Page with redirect (52 pages)** - External posts that redirect to original sources
2. **Alternate page with proper canonical tag** - Pagination pages causing duplicate content
3. **Not found (404)** - 404 page being indexed
4. **Excluded by 'noindex' tag** - Need to add noindex to certain pages
5. **Duplicate, Google chose different canonical than user** - Inconsistent trailing slashes

## Fixes Implemented

### 1. Added `noindex` Support to Layout Component

**File**: `src/layouts/Layout.astro`

Added a new `noindex` prop that controls the robots meta tag:
- When `noindex={true}`, sets `<meta name="robots" content="noindex,nofollow">`
- When `noindex={false}` (default), sets `<meta name="robots" content="index,follow">`

This prevents Google from indexing pages that shouldn't appear in search results.

### 2. External Posts (52 pages with redirects)

**File**: `src/pages/news/[...slug].astro`

External posts now have `noindex={true}` automatically applied when they have a `url` field. These posts:
- Still redirect users after 5 seconds (good UX)
- Are excluded from the sitemap (already configured)
- Now have noindex tag (prevents indexing)

**Why**: Google doesn't like indexing pages that immediately redirect. Since these are external content references, they shouldn't be indexed.

### 3. 404 Page

**File**: `src/pages/404.astro`

Added `noindex={true}` to prevent the 404 page from appearing in search results.

**Why**: Error pages should never be indexed.

### 4. Thank You Page

**File**: `src/pages/apply/thank-you.astro`

Added `noindex={true}` since this is a form confirmation page that redirects.

**Why**: Form confirmation pages should not be indexed as they have no valuable content for search.

### 5. Paginated News Pages

**Files**: 
- `src/pages/news/[page].astro`
- `src/pages/news/tags/[...params].astro`
- `src/pages/news/author/[...params].astro`

For pages beyond page 1:
- Added `noindex={true}` 
- Added custom canonical URL pointing to the first page

**Why**: This prevents duplicate content issues and consolidates SEO value to the main page.

### 6. Trailing Slash Configuration

**File**: `astro.config.mjs`

Added `trailingSlash: 'never'` to ensure consistent URL structure across the site.

**Why**: Prevents Google from seeing `/page` and `/page/` as different URLs (duplicate content).

### 7. Custom Canonical URL Support

**File**: `src/layouts/Layout.astro`

Added optional `canonicalURL` prop to override the default canonical URL. This is used by pagination pages to point to the first page.

**Why**: Helps consolidate SEO signals to the primary version of paginated content.

### 8. Fixed Production Canonical URLs (CRITICAL FIX)

**Files**: 
- `astro.config.mjs`
- `netlify.toml`

**Problem**: Canonical URLs were being generated with `http://localhost:4321/` instead of the production domain `https://pwv.com`. This caused Google to ignore our canonical tags and choose its own, triggering the "Duplicate, Google chose different canonical than user" error.

**Changes**:
1. Changed the default site URL from `http://localhost:4321` to `https://pwv.com` in astro.config.mjs
2. Added `URL = "https://pwv.com"` to Netlify build environment
3. Added redirects to force HTTPS and redirect www to non-www for consistency

**Result**: All canonical URLs now correctly use `https://pwv.com` as the base domain.

**Why**: Google must see consistent, production-ready canonical URLs. Using localhost or incorrect domains causes Google to ignore your canonical preferences and choose its own, leading to indexing issues and duplicate content problems.

## Summary of Changes

| Issue Type | Pages Affected | Solution |
|------------|---------------|----------|
| Page with redirect | 52 external posts | Added noindex tag |
| Not found (404) | 1 | Added noindex tag |
| Thank you page | 1 | Added noindex tag |
| Paginated pages | ~20-30 pages | Added noindex + canonical to first page |
| Trailing slashes | All pages | Set trailingSlash: 'never' |
| Duplicate content | Paginated content | Custom canonical URLs |
| **Wrong canonical URLs** | **All pages** | **Fixed site URL to use https://pwv.com** |

## Expected Results

After deploying these changes:

1. **External posts** will no longer appear in Google's index
2. **404 and thank-you pages** will be removed from the index
3. **Paginated pages** (page 2+) will not be indexed, avoiding duplicate content penalties
4. **Consistent URLs** will prevent Google from indexing both trailing slash and non-trailing slash versions
5. **Canonical tags** will guide Google to the preferred version of paginated content

## Testing

To verify the changes:

1. Build the site: `pnpm run build`
2. Check the generated HTML for:
   - `<meta name="robots" content="noindex,nofollow">` on appropriate pages
   - Canonical URLs pointing to first page for paginated content
   - Consistent URL structure (no trailing slashes)

## Next Steps

1. Deploy to production
2. Monitor Google Search Console over the next 2-4 weeks
3. Use "Request Indexing" for any pages that should be indexed
4. Check that problematic URLs are being removed from the index
5. Monitor for any new indexing issues

## Additional Recommendations

### 1. robots.txt Enhancement

Consider adding explicit disallow rules in `/public/robots.txt` for patterns that should never be indexed:

```
User-agent: *
Allow: /

# Disallow utility pages
Disallow: /404
Disallow: /apply/thank-you

# Sitemap
Sitemap: https://pwv.com/sitemap-index.xml
```

### 2. Monitor Search Console

Regular monitoring of:
- Coverage reports
- Duplicate content issues
- Crawl errors
- Index status

### 3. Consider 301 Redirects for External Posts

Instead of meta refresh redirects, you could use Netlify redirects for external posts. However, this would require:
- Listing all 52 external posts in `netlify.toml`
- Maintaining that list as new external posts are added

The current solution (noindex + meta refresh) is more maintainable.
