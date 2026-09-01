# pwv-com (PWV site) conventions

- Blog posts live in `src/content/posts/` as `post-<slug>.mdx`; syndicated external posts use an `external-` prefix. Confidence: 0.9
- Per-post images go in `src/images/posts/<post-slug>/`, referenced from frontmatter via relative paths like `../../images/posts/<slug>/<file>`; posts use a single hero image (frontmatter `heroImage`) rather than inline body images. Confidence: 0.9
- Post frontmatter schema (`src/content.config.ts`): `title`, `description`, `author`, `pubDate`, `updatedDate`, `heroImage`, `tags`, `featured`, `aiGeneratedImage`, `aiGeneratedDescription`. Confidence: 0.9
- Tom Preston-Werner author example: `src/content/posts/post-announcing-pwv-fund-i.mdx` — declarative opener, short punchy paragraphs, bold key phrases, bold closing aphorism. Confidence: 0.9
- Verify new posts with `pnpm build` and `pnpm exec prettier --check` before handing off; commit on a branch like `dt-post-<slug>` per normal PR flow. Confidence: 0.85
- Skip `scripts/generate-post-og-image.js` (fal.ai AI image generator) when a real photo is available. Confidence: 0.6
