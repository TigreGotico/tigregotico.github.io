import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Escape XML special characters
 */
const escapeXml = (str) => {
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
const markdownToPlainText = (markdown) => {
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
const generateRssFeed = (posts, config) => {
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
${plainTextContent}

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

// Parse YAML frontmatter
const parseFrontMatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid markdown format: missing frontmatter');
  }

  const [, frontMatterStr, body] = match;
  const frontMatter = {};

  frontMatterStr.split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length > 0) {
      let value = rest.join(':').trim();

      if (typeof value === 'string') {
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Keep as string if JSON parse fails
          }
        }
      }

      frontMatter[key.trim()] = value;
    }
  });

  return { frontMatter, body };
};

// Calculate read time
const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

// Main function to generate RSS feed
const generateRssFeedFile = async () => {
  try {
    const blogsDir = path.join(__dirname, 'public', 'blogs');
    const distDir = path.join(__dirname, 'dist');
    const publicDir = path.join(__dirname, 'public');

    // List of known blog posts
    const blogFiles = [
      'getting-started-with-react.md',
      'wakehubert-wake-word-model.md',
      'web-development-trends-2024.md',
      'building-scalable-apis-nodejs-express.md'
    ];

    const posts = [];

    for (const file of blogFiles) {
      const filePath = path.join(blogsDir, file);
      
      // Try both dist and public directories
      let markdown = null;
      
      try {
        if (fs.existsSync(filePath)) {
          markdown = fs.readFileSync(filePath, 'utf-8');
        }
      } catch (error) {
        // File doesn't exist, skip it
        continue;
      }

      if (!markdown) continue;

      try {
        const { frontMatter, body } = parseFrontMatter(markdown);

        const slug = file.replace('.md', '');

        posts.push({
          slug,
          title: frontMatter.title || 'Untitled',
          date: frontMatter.date || new Date().toISOString(),
          author: frontMatter.author || 'Unknown',
          excerpt: frontMatter.excerpt || '',
          tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : [],
          featured: typeof frontMatter.featured === 'boolean' ? frontMatter.featured : false,
          readTime: calculateReadTime(body),
          content: body
        });
      } catch (error) {
        console.error(`Error parsing blog post ${file}:`, error.message);
      }
    }

    // Sort by date, newest first
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (posts.length === 0) {
      return;
    }

    // Generate RSS feed
    const rssFeed = generateRssFeed(posts, {
      siteUrl: 'https://tigregotico.github.io',
      blogUrl: 'https://tigregotico.github.io/rss.xml',
      title: 'TigreGotico Blog',
      description: 'Insights, tutorials, and thoughts on modern web development, technology trends, and best practices.',
      language: 'en-us',
      copyright: `Copyright © ${new Date().getFullYear()} TigreGotico. All rights reserved.`,
      author: 'TigreGotico Team'
    });

    // Write RSS feed to both dist and public directories
    const rssPath = path.join(publicDir, 'rss.xml');
    fs.mkdirSync(path.dirname(rssPath), { recursive: true });
    fs.writeFileSync(rssPath, rssFeed, 'utf-8');

    // Also write to dist if it exists
    if (fs.existsSync(distDir)) {
      const distRssPath = path.join(distDir, 'rss.xml');
      fs.mkdirSync(path.dirname(distRssPath), { recursive: true });
      fs.writeFileSync(distRssPath, rssFeed, 'utf-8');
    }

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    process.exit(1);
  }
};

generateRssFeedFile();
