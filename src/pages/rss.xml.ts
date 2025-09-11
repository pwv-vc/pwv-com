import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE } from '../consts';

export async function GET(context: any) {
  const allPosts = (await getCollection('library')).sort((a, b) => {
    const dateA = new Date(a.data.pubDate).getTime();
    const dateB = new Date(b.data.pubDate).getTime();
    return dateB - dateA;
  });

  return rss({
    title: `${SITE_TITLE}`,
    description: `Latest insights and thoughts`,
    site: context.site,
    items: allPosts.map((post) => {
      // Use the URL if it's an external post, otherwise use the internal library URL
      const postURL = post.data.url || `${context.site}/library/${post.id}`;

      // Create canonical URL for hero image if it exists
      const heroImageData = post.data.heroImage
        ? (() => {
            // Handle the image object - it might have .src property or be the URL directly
            const imageSrc = typeof post.data.heroImage === 'object' && post.data.heroImage !== null
              ? (post.data.heroImage as any).src ?? post.data.heroImage
              : post.data.heroImage;

            // Ensure we have a full canonical URL
            let fullURL: string;
            if (typeof imageSrc === 'string') {
              // If it's already a full URL, use it as is
              if (imageSrc.startsWith('http')) {
                fullURL = imageSrc;
              }
              // If it's a relative path, make it absolute with the site URL
              else if (imageSrc.startsWith('/')) {
                // Ensure context.site doesn't end with slash to avoid double slashes
                const siteUrl = String(context.site).replace(/\/$/, '');
                fullURL = `${siteUrl}${imageSrc}`;
              }
              // If it's a relative path without leading slash, add it
              else {
                // Ensure context.site doesn't end with slash to avoid double slashes
                const siteUrl = String(context.site).replace(/\/$/, '');
                fullURL = `${siteUrl}/${imageSrc}`;
              }
            } else {
              return undefined;
            }

            // Determine the MIME type based on file extension
            const getMimeType = (url: string): string => {
              // Remove query parameters and get the file extension
              const urlWithoutQuery = url.split('?')[0];
              const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();
              switch (extension) {
                case 'jpg':
                case 'jpeg':
                  return 'image/jpeg';
                case 'png':
                  return 'image/png';
                case 'gif':
                  return 'image/gif';
                case 'webp':
                  return 'image/webp';
                case 'svg':
                  return 'image/svg+xml';
                default:
                  return 'image/jpeg'; // fallback
              }
            };

            return {
              url: fullURL,
              type: getMimeType(fullURL)
            };
          })()
        : undefined;

      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: postURL,
        author: post.data.author,
        categories: post.data.tags,
        customData: [
          post.data.updatedDate
            ? `<lastBuildDate>${post.data.updatedDate.toUTCString()}</lastBuildDate>`
            : '',
          heroImageData
            ? `<enclosure url="${heroImageData.url}" type="${heroImageData.type}" />`
            : ''
        ].filter(Boolean).join(''),
      };
    }),
    customData: `<language>en</language>`,
  });
}
