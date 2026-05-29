import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../data/site';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft && data.date.valueOf() <= Date.now())).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `${base}/blog/${post.id}/`,
      categories: post.data.tags,
    })),
  });
}
