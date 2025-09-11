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
      const heroImageURL = post.data.heroImage
        ? (() => {
            // Handle the image object - it might have .src property or be the URL directly
            const imageSrc = typeof post.data.heroImage === 'object' && post.data.heroImage !== null
              ? (post.data.heroImage as any).src ?? post.data.heroImage
              : post.data.heroImage;

            // Ensure we have a full canonical URL
            if (typeof imageSrc === 'string') {
              // If it's already a full URL, use it as is
              if (imageSrc.startsWith('http')) {
                return imageSrc;
              }
              // If it's a relative path, make it absolute with the site URL
              if (imageSrc.startsWith('/')) {
                return `${context.site}${imageSrc}`;
              }
              // If it's a relative path without leading slash, add it
              return `${context.site}/${imageSrc}`;
            }

            return imageSrc;
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
          heroImageURL
            ? `<enclosure url="${heroImageURL}" type="image/jpeg" />`
            : ''
        ].filter(Boolean).join(''),
      };
    }),
    customData: `<language>en</language>`,
  });
}
