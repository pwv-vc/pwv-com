import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_TITLE } from '../consts';

// Helper function to convert date strings to Eastern Time
const parseDateAsEastern = (dateString: string): Date => {
  // If the date string is just a date (YYYY-MM-DD), treat it as Eastern Time
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Create date in Eastern Time by adding timezone offset
    const date = new Date(dateString + 'T00:00:00');
    // Convert to Eastern Time (UTC-5 or UTC-4 depending on DST)
    // For simplicity, we'll use UTC-5 (EST) - this handles most cases correctly
    const easternOffset = -5 * 60; // -5 hours in minutes
    return new Date(
      date.getTime() + (date.getTimezoneOffset() + easternOffset) * 60000
    );
  }
  // If it's already a full datetime, use as-is
  return new Date(dateString);
};

export async function GET(context: any) {
  const allPosts = (await getCollection('posts')).sort((a, b) => {
    const dateA = parseDateAsEastern(a.data.pubDate).getTime();
    const dateB = parseDateAsEastern(b.data.pubDate).getTime();
    return dateB - dateA;
  });

  // Normalize site URL (no trailing slash)
  const siteUrl = String(context.site).replace(/\/$/, '');

  // Use the actual request URL for the self-reference link
  const selfUrl = context.url
    ? new URL(context.url.pathname, siteUrl).href
    : `${siteUrl}/rss.xml`;

  return rss({
    title: `${SITE_NAME} - ${SITE_TITLE}`,
    description: `Latest news from PWV and our founder community`,
    site: context.site,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    items: allPosts.map((post) => {
      // always use the internal post URL
      const postURL = `${siteUrl}/news/${post.id}`;

      // Create canonical URL for hero image if it exists
      const heroImageData = post.data.heroImage
        ? (() => {
            const rawSrc =
              typeof post.data.heroImage === 'object' &&
              post.data.heroImage !== null
                ? ((post.data.heroImage as any).src ?? post.data.heroImage)
                : post.data.heroImage;

            if (typeof rawSrc !== 'string') return undefined;

            // Build absolute base URL (no trailing slash)
            const base = siteUrl;

            // Ensure an absolute source URL for Netlify Images url param
            const absoluteSrc = rawSrc.startsWith('http')
              ? rawSrc
              : rawSrc.startsWith('/')
                ? `${base}${rawSrc}`
                : `${base}/${rawSrc}`;

            // Netlify Images proxy (keep as jpeg for best compatibility in RSS readers)
            const encoded = encodeURIComponent(absoluteSrc);
            const netlifyImgUrl = `${base}/.netlify/images?url=${encoded}&w=1200&h=630&fit=cover&fm=jpg`;

            return {
              url: netlifyImgUrl,
              type: 'image/jpeg',
              // Approximate length for a 1200x630 JPEG image (required by RSS spec)
              length: '150000',
            };
          })()
        : undefined;

      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: parseDateAsEastern(post.data.pubDate),
        link: postURL,
        guid: postURL,
        // Remove author field since we don't have email addresses
        // RSS 2.0 requires author to be in format: email@example.com (Name)
        categories: post.data.tags,
        customData: heroImageData
          ? `<enclosure url="${heroImageData.url}" type="${heroImageData.type}" length="${heroImageData.length}" />`
          : '',
      };
    }),
    customData: `<language>en</language>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />`,
  });
}
