import { BlogPostMetadata } from './blogUtils';

export interface RssFeedConfig {
  siteUrl: string;
  blogUrl: string;
  title: string;
  description: string;
  language: string;
  copyright: string;
  author: string;
}

/**
 * Escape XML special characters
 */
const escapeXml = (str: string): string => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Convert markdown to plain text (basic implementation)
 */
const markdownToPlainText = (markdown: string): string => {
  if (!markdown) return '';
  
  return markdown
    // Remove frontmatter
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove headings
    .replace(/^#+\s+/gm, '')
    // Remove bold and italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Clean up whitespace
    .replace(/\n\n+/g, '\n\n')
    .trim();
};

/**
 * Generate RSS feed for blog posts
 */
export const generateRssFeed = (
  posts: (BlogPostMetadata & { content?: string })[],
  config: RssFeedConfig
): string => {
  const lastBuildDate = new Date().toUTCString();
  const lastPostDate = posts.length > 0 
    ? new Date(posts[0].date).toUTCString()
    : lastBuildDate;

  let rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(config.siteUrl)}</link>
    <atom:link href="${escapeXml(config.blogUrl)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(config.description)}</description>
    <language>${escapeXml(config.language)}</language>
    <copyright>${escapeXml(config.copyright)}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${lastPostDate}</pubDate>
`;

  // Add posts to RSS feed
  posts.forEach(post => {
    const postUrl = `${config.siteUrl}/blog/${post.slug}`;
    const postDate = new Date(post.date).toUTCString();
    
    // Convert markdown content to plain text for RSS
    const plainTextContent = post.content 
      ? markdownToPlainText(post.content)
      : post.excerpt;

    // Create a CDATA section for the content to preserve formatting
    const contentHtml = `<![CDATA[
${escapeXml(plainTextContent)}

---
Read more: <a href="${escapeXml(postUrl)}">View full article</a>
]]>`;

    rssContent += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${postDate}</pubDate>
      <author>${escapeXml(post.author)}</author>
      <description>${escapeXml(post.excerpt)}</description>
      <content:encoded>${contentHtml}</content:encoded>
      <category>${escapeXml(post.tags.join(', '))}</category>
`;

    // Add individual tags as categories
    post.tags.forEach(tag => {
      rssContent += `      <category>${escapeXml(tag)}</category>\n`;
    });

    rssContent += `    </item>\n`;
  });

  rssContent += `  </channel>
</rss>`;

  return rssContent;
};
