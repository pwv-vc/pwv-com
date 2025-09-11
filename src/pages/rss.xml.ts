import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE } from '../consts';

export async function GET(context: any) {
  const allPosts = (await getCollection('library')).sort((a, b) => {
    const dateA = new Date(a.data.pubDate).getTime();
    const dateB = new Date(b.data.pubDate).getTime();
    return dateA - dateB;
  });

  return rss({
    title: `${SITE_TITLE}`,
    description: `Latest insights and thoughts`,
    site: context.site,
    items: allPosts.map((post) => {
      // Use the URL if it's an external post, otherwise use the internal library URL
      const postURL = post.data.url || `${context.site}/library/${post.id}`;

        return {
          title: post.data.title,
          description: post.data.description,
          pubDate: post.data.pubDate,
          link: postURL,
          author: post.data.author,
          categories: post.data.tags,
          customData: post.data.updatedDate
            ? `<lastBuildDate>${post.data.updatedDate.toUTCString()}</lastBuildDate>`
            : '',
        };
    }),
    customData: `<language>en</language>`,
  });
}
