# Adding Avatars and Company Logos to Explore Pages

This guide explains how to add images for people and companies that appear on the explore pages (`/explore/companies/`, `/explore/people/`, `/explore/quotes/`).

## 📸 People Avatars

### Location
Place avatar images in: `src/images/people/`

### Naming Convention
Use the person's name in lowercase with hyphens, followed by the file extension:

**Format:** `firstname-lastname.{jpeg|jpg|png}`

**Examples:**
```
tom-preston-werner.jpeg
david-thyresson.png
steve-ruiz.jpg
paul-copplestone.jpeg
pedro-pinera-buendía.jpeg  (special characters preserved)
```

### Supported Formats
- `.jpeg`
- `.jpg`
- `.png`

The system will automatically try all three formats in order until it finds a match.

### Image Specifications
- **Minimum size:** 96x96 pixels
- **Display size:** 48x48 pixels (retina-ready)
- **Shape:** Square (will be displayed as circular)
- **Format:** RGB color space
- **File size:** Keep under 50KB for optimal performance

### How It Works
The `PersonCard` component automatically generates a slug from the person's name and looks for matching images:

1. Converts name to lowercase
2. Replaces spaces with hyphens
3. Removes special characters (except hyphens)
4. Tries to load: `{slug}.jpeg`, then `.jpg`, then `.png`
5. If no image found, shows a generic 👤 icon

**Example:**
- Name in data: "Tom Preston-Werner"
- Generated slug: `tom-preston-werner`
- Looks for: `tom-preston-werner.jpeg` → `tom-preston-werner.jpg` → `tom-preston-werner.png`

### Currently Available Avatars
```
src/images/people/
├── ahmad-awais.jpeg
├── dan-farrelly.jpeg
├── jessie-frazellle.jpeg
├── matt-perrott.jpeg
├── paul-copplestone.jpeg
├── pedro-pinera-buendía.jpeg
└── ralf-schonherr.jpeg
```

---

## 🏢 Company Logos

### Location
Place company logos in: `src/images/logos/small/`

### Naming Convention
Use the company slug (lowercase, hyphens) with `.png` extension:

**Format:** `company-slug.png`

**Examples:**
```
cursor.png
liquid-ai.png
inngest.png
tldraw.png
supabase.png
weights-biases.png
```

### Supported Format
- `.png` only (for consistency with portfolio logos)

### Image Specifications
- **Minimum size:** 64x64 pixels
- **Display size:** 48x48 pixels (retina-ready)
- **Shape:** Square
- **Background:** Transparent or white
- **Format:** PNG with transparency support
- **File size:** Keep under 30KB for optimal performance

### Logo Matching Strategy
The `CompanyCard` component uses a two-step matching process:

1. **Portfolio Match (preferred):** 
   - Checks if company name matches a portfolio company
   - Uses the official portfolio slug for logo lookup
   - Ensures consistency across the site

2. **Fallback Slug:**
   - If no portfolio match, generates slug from company name
   - Converts to lowercase
   - Replaces spaces with hyphens
   - Removes special characters

3. **No Logo:**
   - If no logo file found, shows generic 🏢 icon

**Example:**
- Company: "Liquid AI"
- Portfolio slug: `liquid-ai` (from portfolio data)
- Looks for: `liquid-ai.png`

### Currently Available Logos
Over 60 company logos are available, including:
```
src/images/logos/small/
├── cursor.png
├── inngest.png
├── liquid-ai.png
├── supabase.png
├── tldraw.png
├── zed.png
└── ... and many more
```

See the full list with:
```bash
ls src/images/logos/small/
```

---

## 🎯 Quick Reference

### Adding a New Person Avatar

1. Get a square photo of the person (at least 96x96px)
2. Convert name to slug format:
   - Lowercase
   - Spaces → hyphens
   - Remove special characters
3. Save as `{slug}.jpeg`, `.jpg`, or `.png`
4. Place in `src/images/people/`
5. Rebuild site to see changes

**Example:**
```bash
# For "Nathan Sobo"
# Slug: nathan-sobo
cp ~/Downloads/nathan-photo.jpg src/images/people/nathan-sobo.jpg
```

### Adding a New Company Logo

1. Get company logo PNG (at least 64x64px, transparent background preferred)
2. Check if company is in portfolio to get official slug
3. If not in portfolio, convert company name to slug format
4. Save as `{slug}.png`
5. Place in `src/images/logos/small/`
6. Rebuild site to see changes

**Example:**
```bash
# For "Example Corp"
# Slug: example-corp
cp ~/Downloads/example-logo.png src/images/logos/small/example-corp.png
```

---

## 🔍 Troubleshooting

### Avatar Not Showing?

1. **Check the file name:**
   - Must be all lowercase
   - Spaces must be hyphens
   - Check for typos

2. **Check the file format:**
   - Must be `.jpeg`, `.jpg`, or `.png`
   - Case-sensitive on some systems

3. **Check the location:**
   - Must be in `src/images/people/`
   - Not in subdirectories

4. **Verify the person's name in the data:**
   - Check `src/content/entities/posts/*.json`
   - Match the exact name used in extraction

### Logo Not Showing?

1. **Check portfolio match:**
   - Look in portfolio collections for the official slug
   - Use that slug if company is in portfolio

2. **Check the file name:**
   - Must be all lowercase
   - Spaces must be hyphens
   - Must end in `.png`

3. **Check the location:**
   - Must be in `src/images/logos/small/`
   - Not in parent `logos/` directory

4. **Check image format:**
   - Must be PNG format
   - Transparent background recommended

---

## 📊 Image Optimization Tips

### For Best Performance:

1. **Compress images:**
   ```bash
   # Using ImageOptim, TinyPNG, or similar
   # Target: <50KB for avatars, <30KB for logos
   ```

2. **Use proper dimensions:**
   - Avatars: 96x96px or 192x192px (retina)
   - Logos: 64x64px or 128x128px (retina)

3. **Check file sizes:**
   ```bash
   # Show file sizes in KB
   ls -lh src/images/people/
   ls -lh src/images/logos/small/
   ```

4. **Use RGB color space:**
   - CMYK images may not display correctly
   - Convert to RGB before saving

---

## 🎨 Design Guidelines

### Avatars
- Professional headshots work best
- Clear face visibility
- Good lighting and contrast
- Neutral or professional backgrounds

### Logos
- Use official brand assets when possible
- Transparent backgrounds preferred
- Ensure legibility at small sizes
- Maintain proper aspect ratio

---

## 🚀 Deployment

Images are committed to the repository and deployed with the site. No additional build steps required.

After adding images:
1. Commit images to git
2. Push to repository
3. Netlify will automatically rebuild and deploy

```bash
git add src/images/people/*.{jpeg,jpg,png}
git add src/images/logos/small/*.png
git commit -m "Add avatars and logos for explore pages"
git push
```

---

## 📝 Notes

- Images are processed at build time by Astro's image optimization
- The system automatically handles retina displays
- Fallback icons (👤 and 🏢) are shown if images are missing
- No need to restart dev server when adding images (hot reload works)
