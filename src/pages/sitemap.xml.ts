import { getCollection } from 'astro:content';

const formatDate = (date: Date) => date.toISOString();

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toAbsoluteUrl = (base: string, input: string) => {
  if (input.startsWith('http')) return input;
  if (input.startsWith('/')) return `${base}${input}`;
  return `${base}/${input}`;
};

const resolveHeroImage = (base: string, raw: unknown): { url: string; title?: string; caption?: string } | undefined => {
  if (!raw) return undefined;
  const rawSrc = typeof raw === 'object' && raw !== null ? (raw as any).src ?? raw : raw;
  if (typeof rawSrc !== 'string') return undefined;
  const absoluteSrc = toAbsoluteUrl(base, rawSrc);
  const encoded = encodeURIComponent(absoluteSrc);
  const netlifyImgUrl = `${base}/.netlify/images?url=${encoded}&w=1200&h=630&fit=cover&fm=jpg`;
  return { url: netlifyImgUrl };
};

export async function GET(context: any) {
  const base = String(context.site || '').replace(/\/$/, '');

  const staticRoutes: Array<{
    path: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }> = [
    { path: '/', changefreq: 'weekly', priority: 1.0 },
    { path: '/library/', changefreq: 'daily', priority: 0.8 },
  ];

  const library = await getCollection('library');
  const internalLibraryRoutes = library
    .filter((entry) => !entry.data.url)
    .map((entry) => {
      const lastmod = formatDate((entry.data.updatedDate as Date) || (entry.data.pubDate as Date));
      const changefreq: 'daily' | 'weekly' | 'monthly' = entry.data.featured ? 'weekly' : 'monthly';
      const priority = entry.data.featured ? 0.8 : 0.6;
      const image = resolveHeroImage(base, entry.data.heroImage);
      const title = entry.data.title ? escapeXml(String(entry.data.title)) : undefined;
      const caption = entry.data.description ? escapeXml(String(entry.data.description)) : undefined;
      return {
        path: `/library/${entry.id}`,
        lastmod,
        changefreq,
        priority,
        image,
        title,
        caption,
      };
    });

  const urlsXml = [
    ...staticRoutes.map(({ path, changefreq, priority }) => {
      return `<url>` +
        `<loc>${escapeXml(`${base}${path}`)}</loc>` +
        `<changefreq>${changefreq}</changefreq>` +
        `<priority>${priority.toFixed(1)}</priority>` +
        `</url>`;
    }),
    ...internalLibraryRoutes.map(({ path, lastmod, changefreq, priority, image, title, caption }) => {
      const imageXml = image
        ? `<image:image>` +
            `<image:loc>${escapeXml(image.url)}</image:loc>` +
            (title ? `<image:title>${title}</image:title>` : '') +
            (caption ? `<image:caption>${caption}</image:caption>` : '') +
          `</image:image>`
        : '';
      return `<url>` +
        `<loc>${escapeXml(`${base}${path}`)}</loc>` +
        `<lastmod>${escapeXml(lastmod)}</lastmod>` +
        `<changefreq>${changefreq}</changefreq>` +
        `<priority>${priority.toFixed(1)}</priority>` +
        imageXml +
        `</url>`;
    }),
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urlsXml}</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}


