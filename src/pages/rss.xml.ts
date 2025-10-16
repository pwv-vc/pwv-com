import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_TITLE } from '../consts';

export async function GET(context: any) {
  const allPosts = (await getCollection('posts')).sort((a, b) => {
    const dateA = new Date(a.data.pubDate).getTime();
    const dateB = new Date(b.data.pubDate).getTime();
    return dateB - dateA;
  });

  // Get the most recent post date for channel-level lastBuildDate
  const lastBuildDate =
    allPosts.length > 0
      ? allPosts[0].data.updatedDate || allPosts[0].data.pubDate
      : new Date();

  return rss({
    title: `${SITE_NAME} - ${SITE_TITLE}`,
    description: `Latest insights and thoughts`,
    site: context.site,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    items: allPosts.map((post) => {
      // Normalize site URL (no trailing slash)
      const siteUrl = String(context.site).replace(/\/$/, '');

      // Use the URL if it's an external post, otherwise use the internal library URL
      const postURL = post.data.url || `${siteUrl}/library/${post.id}`;

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
    <atom:link href="${String(context.site).replace(/\/$/, '')}/rss.xml" rel="self" type="application/rss+xml" />`,
  });
}
