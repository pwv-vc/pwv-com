# pwv.com

[pwv.com](https://pwv.com) is a website for PWV.

PWV is Tom Preston-Werner, David Price, and David Thyresson.

PWV invests in early-stage technology companies.

We are three entrepreneurs and technologists committed to a vision of a
future where technological progress and human flourishing go hand in hand.

We invest to help make this future possible.

Beyond capital, we leverage our unparalleled network and expertise to help
startups scale and achieve product-market fit.

## 🚀 Project Structure

Inside this Astro project, the important folders/files are:

```text
/
├── public/
│   ├── favicon.svg
│   ├── site.webmanifest
│   └── og-image.png
├── src/
│   ├── assets/
│   │   ├── background.svg
│   │   └── logo.svg
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── FeaturedPosts.astro
│   │   ├── PostsGrid.astro
│   │   ├── LibraryCard.astro
│   │   ├── Portfolio.astro
│   │   └── other components
│   ├── content/
│   │   ├── portfolio/
│   │   │   ├── representative.json
│   │   │   ├── rolling-fund.json
│   │   │   └── angel.json
│   │   ├── testimonials/
│   │   │   └── testimonials.json
│   │   └── library/
│   │       └── *.md / *.mdx
│   ├── images/
│   │   ├── library/<slug>/...
│   │   └── logos/small/<company>.png
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   ├── images.ts
│   │   └── library.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── library/index.astro
│   │   ├── library/[...slug].astro
│   │   ├── rss.xml.ts
│   │   └── sitemap.xml.ts
│   ├── styles/
│   │   └── global.css
│   ├── consts.ts
│   └── content.config.ts
├── scripts/
│   ├── fetch-external-content.js
│   ├── download-favicons.js
│   ├── generate-post-og-image.js
│   └── other scripts
├── astro.config.mjs
├── netlify.toml
├── package.json
└── pnpm-lock.yaml
```

### Content collections (`src/content.config.ts`)

This project uses Astro Content Collections to type-check and load content.

- Portfolio collections (`representativePortfolio`, `rollingFundPortfolio`, `angelPortfolio`)

  - Loader: single JSON file each in `src/content/portfolio/*.json`
  - Schema: `{ name: string, url: string (url), tags: string[], slug: string }`

- Testimonials (`testimonials`)

  - Loader: single JSON file `src/content/testimonials/testimonials.json`
  - Schema: `{ name, title, company, quote, url?, tags: string[], slug, company-slug }`

- Library (`library`)
  - Loader: all `*.md`/`*.mdx` files under `src/content/library/**`
  - Schema frontmatter:
    - `title: string`
    - `description: string`
    - `author?: string`
    - `url?: string` (external link; if present the card links off-site)
    - `pubDate: string` (YYYY-MM-DD; transformed to Date)
    - `updatedDate?: string` (transformed to Date)
    - `heroImage?: Image()` (local image import processed by Astro)
    - `tags: string[]`
    - `featured?: boolean`
    - `aiGeneratedImage?: boolean` (default false)
    - `aiGeneratedDescription?: boolean` (default false)

Images for library posts live in `src/images/library/<slug>/...` and can be referenced via `heroImage` using a relative path.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                           | Action                                           |
| :-------------------------------- | :----------------------------------------------- | --------------------------- |
| `pnpm install`                    | Installs dependencies                            |
| `pnpm dev`                        | Starts local dev server at `localhost:4321`      |
| `pnpm build`                      | Build your production site to `./dist/`          |
| `pnpm preview`                    | Preview your build locally, before deploying     |
| `pnpm astro ...`                  | Run CLI commands like `astro add`, `astro check` |
| `pnpm run export-favicon`         | Export the base favicon to PNG                   |
| `pnpm run downscale-favicon`      | Downscale favicon PNG variants                   |
| `pnpm run generate-favicons`      | Generate all favicon sizes                       |
| `pnpm run download-favicons [file | all] [--force]`                                  | Download portfolio favicons |
| `pnpm run fetch-external <url>`   | Create a library post from an external URL       |
| `pnpm run format`                 | Format files with Prettier                       |
| `pnpm run format:check`           | Check formatting with Prettier                   |

## 🧰 Scripts (`scripts/`)

Utilities to help manage content and assets:

- `fetch-external-content.js`: Fetch a URL and generate a library post with metadata and images.

  - Example:
    ```bash
    pnpm exec node scripts/fetch-external-content.js "https://example.com/article"
    ```
  - Creates `src/content/library/external-<slug>.md` and downloads OG images to `src/images/library/external-<slug>/`.

- `download-favicons.js`: Download small square favicons for portfolio companies defined in `src/content/portfolio/*.json`.

  - Examples:
    ```bash
    pnpm exec node scripts/download-favicons.js representative.json
    pnpm exec node scripts/download-favicons.js rolling-fund.json
    pnpm exec node scripts/download-favicons.js angel.json
    pnpm exec node scripts/download-favicons.js all --force
    ```
  - Saves to `src/images/logos/small/<slug>.png`. Use `--force`/`-f` to overwrite.

- `generate-post-og-image.js`: Create social OG images for posts when needed.

Additional helpers exist for favicon generation and downscaling.

### Environment variables for scripts

- `FAL_KEY` (optional, recommended): API key for FAL AI used by:

  - `scripts/fetch-external-content.js` (LLM description generation and image generation when no OG image exists)
  - `scripts/generate-post-og-image.js` (image generation)
  - `scripts/test-fal-connection.js` (connectivity test)

  Set via a `.env` file at the project root or your shell environment:

  ```bash
  # .env
  FAL_KEY=your_fal_api_key_here
  ```

  Without `FAL_KEY`, the scripts will still run but skip AI-powered steps.

No other scripts require API keys. Favicon-related scripts use local files and a public favicon service without auth.

## 📰 RSS feed and XML sitemap (`src/pages/`)

- **RSS**: `src/pages/rss.xml.ts` → route: `/rss.xml`

  - Uses `@astrojs/rss` and `getCollection('library')` to aggregate posts sorted by `pubDate` (desc).
  - Each item links to the external `url` if present, otherwise to the internal ` /library/<slug>` page.
  - Hero images (if present) are converted to absolute Netlify Images URLs and attached as RSS `<enclosure>` (`image/jpeg`, 1200x630).
  - Includes `categories` from `tags`, `guid` matching the link, and optional `lastBuildDate` from `updatedDate`.

- **Sitemap**: `src/pages/sitemap.xml.ts` → route: `/sitemap.xml`
  - Emits static routes: `/` (weekly, 1.0) and `/library/` (daily, 0.8).
  - Adds internal library posts only (entries without a `url`), each with:
    - `<loc>`: ` /library/<slug>` absolute URL
    - `<lastmod>`: `updatedDate` or `pubDate`
    - `<changefreq>`: `weekly` if `featured`, else `monthly`
    - `<priority>`: `0.8` if `featured`, else `0.6`
    - Optional `<image:image>` block using a Netlify Images URL for the hero image
  - Returns `application/xml` with a short cache header (`public, max-age=300`).

## ✍️ Authoring new Library posts (`src/content/library`)

You can add posts in two ways:

1. Manually create a Markdown file:

   - Create `src/content/library/<your-slug>.md`
   - Frontmatter must match the Library schema. Example:

     ```md
     ---
     title: AI Everywhere, Somewhere Here
     description: Reflections on the diffusion of AI into daily life.
     author: David Thyresson
     pubDate: 2025-09-14
     tags: ['ai', 'essay']
     featured: true
     heroImage: ../images/library/<your-slug>/banner_16_9-1.png
     ---

     Your markdown content here.
     ```

   - Place images in `src/images/library/<your-slug>/` and reference relatively in `heroImage`.
   - If linking to an external article, set `url` and omit body content as needed.

2. Use the external fetch script:

   - Run:
     ```bash
     pnpm exec node scripts/fetch-external-content.js "https://example.com/article"
     ```
   - The script extracts title/description/author/date, downloads the OG image, writes `external-<slug>.md`, and appends `?ref=pwv.com` to the external URL.

After adding content, run `pnpm dev` to sync collections and preview pages. The homepage and library views render featured and recent items automatically according to the collection data.

## 🎨 Styling with Tailwind (`src/styles/global.css`)

- Tailwind is loaded via `@import 'tailwindcss'` and the Typography plugin `@plugin "@tailwindcss/typography"`.
- A custom `@theme` defines fonts and brand color tokens (primary/secondary, backgrounds, borders, text) as CSS variables used throughout components.
- The project customizes prose headings (`.prose h1/h2/h3`) for sizes and brand color.
- Additional semantic utilities are defined under `@layer utilities` (e.g., `text-primary`, `bg-surface`, `border-default`, `ring-primary`, `fg-on-primary`). Use these in addition to standard Tailwind classes.
- Apply classes directly in `.astro` components, e.g.:
  ```html
  <div class="prose text-body">
    <h1 class="text-primary">Title</h1>
  </div>
  ```
