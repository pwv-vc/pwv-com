import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_TITLE } from '../consts';

export async function GET(context: any) {
  const allPosts = (await getCollection('posts')).sort((a, b) => {
    const dateA = new Date(a.data.pubDate).getTime();
    const dateB = new Date(b.data.pubDate).getTime();
    return dateB - dateA;
  });

  // Use the actual build time for channel-level lastBuildDate
  const lastBuildDate = new Date();

  // Normalize site URL (no trailing slash)
  const siteUrl = String(context.site).replace(/\/$/, '');

  // Use the actual request URL for the self-reference link
  const selfUrl = context.url
    ? new URL(context.url.pathname, siteUrl).href
    : `${siteUrl}/rss.xml`;

  return rss({
    title: `${SITE_NAME} - ${SITE_TITLE}`,
    description: `Latest insights and thoughts`,
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
        pubDate: post.data.pubDate,
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
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />`,
  });
}
