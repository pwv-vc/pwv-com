# Final URL Configuration Status

## ✅ Current Status Summary

### What Works Now

1. **Local Build (`pnpm run build`)** - ✅ VERIFIED

   - Canonical: `https://pwv.com/`
   - Sitemap: `https://pwv.com/*`
   - RSS: `https://pwv.com/*`
   - Status: **Perfect for deploying to production**

2. **Production (https://pwv.com)** - ✅ WORKING

   - Canonical: `https://pwv.com/*`
   - Sitemap: `https://pwv.com/*`
   - RSS: `https://pwv.com/*`
   - Status: **Working correctly**

3. **Local Dev (`pnpm run dev`)** - ✅ CONFIGURED
   - Will use: `http://localhost:4321`
   - Status: **Ready to test** (configured to detect `dev` command)

### What Needs Testing

4. **Deploy Preview** - ⚠️ NEEDS NEW PREVIEW
   - Current preview-56 has OLD code
   - Old preview shows:
     - ✅ Canonical: `https://deploy-preview-56--pwv-www.netlify.app/` (works due to Layout.astro)
     - ❌ Sitemap: `https://pwv.com/*` (wrong - old code)
     - ❌ RSS: `https://pwv.com/*` (wrong - old code)
   - **After deploying new code**, should show:
     - ✅ Canonical: `https://deploy-preview-###--pwv-www.netlify.app/`
     - ✅ Sitemap: `https://deploy-preview-###--pwv-www.netlify.app/*`
     - ✅ RSS: `https://deploy-preview-###--pwv-www.netlify.app/*`

---

## Configuration Details

### URL Resolution Logic (`astro.config.mjs`)

```javascript
const getSiteURL = () => {
  // 1. Production: Use explicit URL from netlify.toml
  if (process.env.URL) {
    return process.env.URL; // → "https://pwv.com"
  }

  // 2. Deploy Preview: Use Netlify's DEPLOY_URL
  if (process.env.DEPLOY_URL) {
    return process.env.DEPLOY_URL; // → "https://deploy-preview-###--pwv-www.netlify.app"
  }

  // 3. Local Dev: Use localhost
  if (process.argv.includes('dev')) {
    return 'http://localhost:4321';
  }

  // 4. Fallback: Production URL
  return 'https://pwv.com';
};
```

### Netlify Configuration (`netlify.toml`)

```toml
# Only set URL for production builds
[context.production.environment]
  URL = "https://pwv.com"

# Deploy previews automatically get DEPLOY_URL from Netlify
# Branch deploys automatically get DEPLOY_URL from Netlify
```

---

## Testing Checklist

### ✅ Test 1: Local Build

```bash
pnpm run build
grep 'rel="canonical"' dist/index.html
# Result: https://pwv.com/ ✅
```

### 🔄 Test 2: Local Dev (Manual Test Required)

```bash
pnpm run dev
# Visit http://localhost:4321 in browser
# Check canonical URL in page source
# Expected: http://localhost:4321/
```

### 🔄 Test 3: New Deploy Preview (Requires Deploy)

```bash
# Push to branch to create new preview
git checkout -b test-url-config
git add .
git commit -m "Fix: URL configuration for all environments"
git push origin test-url-config
```

Then test the new preview:

```bash
# Check canonical
curl -s https://deploy-preview-###--pwv-www.netlify.app | grep 'rel="canonical"'
# Expected: https://deploy-preview-###--pwv-www.netlify.app/

# Check sitemap
curl -s https://deploy-preview-###--pwv-www.netlify.app/sitemap-index.xml
# Expected: https://deploy-preview-###--pwv-www.netlify.app/sitemap-0.xml

# Check RSS
curl -s https://deploy-preview-###--pwv-www.netlify.app/rss.xml | grep '<link>' | head -3
# Expected: https://deploy-preview-###--pwv-www.netlify.app/*
```

### ✅ Test 4: Production (After Merge)

```bash
# Already working, but verify after deploy:
curl -s https://pwv.com | grep 'rel="canonical"'
curl -s https://pwv.com/sitemap-index.xml
curl -s https://pwv.com/rss.xml | grep '<link>' | head -3
```

---

## Explanation for User

### Local Dev (localhost)

**Q: Why use localhost for `pnpm run dev`?**

A: When you're developing locally, links should work on your local machine. Using `http://localhost:4321` means:

- ✅ Links work when you click them
- ✅ Standard developer experience
- ✅ No confusion about which environment you're in

**Q: What about local builds (`pnpm run build`)?**

A: Local builds use production URLs (`https://pwv.com`) because:

- ✅ You can test the exact HTML that will go to production
- ✅ Canonical URLs are correct for SEO testing
- ✅ Build output is production-ready

### Deploy Previews

**Q: Will deploy previews work?**

A: Yes! Deploy previews will use their preview URL because:

- ✅ Netlify sets `DEPLOY_URL` automatically
- ✅ Our config detects and uses it
- ✅ Each preview is isolated with its own URL

**Note**: Current preview-56 has old code, so it shows production URLs in sitemap/RSS. A new preview with updated code will work correctly.

### Production

**Q: Will production break?**

A: No! Production will work perfectly because:

- ✅ Netlify sets `URL="https://pwv.com"` for production
- ✅ Our config prioritizes this explicit setting
- ✅ Already verified working in production

---

## Summary Table

| Environment        | Command          | URL Used                        | Canonical   | Sitemap     | RSS         | Status        |
| ------------------ | ---------------- | ------------------------------- | ----------- | ----------- | ----------- | ------------- |
| **Local Dev**      | `pnpm run dev`   | `http://localhost:4321`         | localhost   | localhost   | localhost   | ✅ Configured |
| **Local Build**    | `pnpm run build` | `https://pwv.com`               | pwv.com     | pwv.com     | pwv.com     | ✅ Verified   |
| **Deploy Preview** | Netlify build    | `https://deploy-preview-###...` | preview URL | preview URL | preview URL | 🔄 Needs test |
| **Production**     | Netlify build    | `https://pwv.com`               | pwv.com     | pwv.com     | pwv.com     | ✅ Working    |

---

## Next Steps

1. **✅ Commit these changes**

   ```bash
   git add .
   git commit -m "Fix: URL configuration for all environments (localhost, preview, prod)"
   ```

2. **🔄 Test local dev** (optional)

   ```bash
   pnpm run dev
   # Visit http://localhost:4321 and check URLs in source
   ```

3. **🔄 Create deploy preview to test**

   ```bash
   git push origin [your-branch-name]
   # Or create PR to trigger Netlify preview
   ```

4. **✅ Deploy to production**
   ```bash
   git push origin main
   # Or merge PR to deploy
   ```

---

## Confidence Level

| Item                | Confidence | Reason                                     |
| ------------------- | ---------- | ------------------------------------------ |
| Local build URLs    | ✅ 100%    | Verified working                           |
| Production URLs     | ✅ 100%    | Already working in production              |
| Local dev URLs      | ✅ 95%     | Logic is sound, needs manual test          |
| Deploy preview URLs | ✅ 90%     | Logic is correct, old preview had old code |

---

## If Deploy Preview Still Shows Production URLs

If you create a new preview and it STILL shows production URLs in sitemap/RSS:

1. **Check Netlify build logs** for environment variables:

   - Look for `URL=...`
   - Look for `DEPLOY_URL=...`
   - Look for `CONTEXT=...`

2. **Add debug output** to `astro.config.mjs`:

   ```javascript
   const siteURL = getSiteURL();
   console.log('[BUILD DEBUG] Site URL:', siteURL);
   console.log('[BUILD DEBUG] URL env:', process.env.URL);
   console.log('[BUILD DEBUG] DEPLOY_URL env:', process.env.DEPLOY_URL);
   ```

3. **Check Netlify environment variables** in UI:
   - Site Settings → Environment Variables
   - Make sure `URL` is only set for production context

---

## Bottom Line

✅ **Local builds**: Production URLs (verified working)
✅ **Production**: Production URLs (verified working)
🔄 **Local dev**: Localhost (configured, needs manual test)
🔄 **Deploy preview**: Preview URLs (configured, needs new preview to test)

**Ready to deploy!** The old deploy-preview-56 has old code, so you'll see the full fix when you create a new preview with the updated configuration.
