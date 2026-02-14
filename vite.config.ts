import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { writeSitemap } from "./lib/sitemap-generator";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  tags: string[];
  featured: boolean;
  content: string;
}

interface FrontMatter {
  [key: string]: string | boolean | string[];
}

interface ParseResult {
  frontMatter: FrontMatter;
  body: string;
}

// Plugin to serve RSS feed dynamically
const rssPlugin = () => ({
  name: "rss-plugin",
  configResolved() {
    // Generate RSS and Sitemap on server start
    generateRssFeed();
    writeSitemap();
  },
  handleHotUpdate({ file }: { file: string }) {
    // Regenerate RSS and Sitemap when blog files change
    if (file.includes("/public/blogs/")) {
      generateRssFeed();
      writeSitemap();
    }
  },
});

function generateRssFeed() {
  const blogsDir = path.resolve(__dirname, "public/blogs");
  const publicDir = path.resolve(__dirname, "public");

  if (!fs.existsSync(blogsDir)) {
    console.warn("No blogs directory found");
    return;
  }

  // Read all markdown files
  const files = fs.readdirSync(blogsDir).filter((f) => f.endsWith(".md"));

  const posts: BlogPost[] = [];

  files.forEach((file) => {
    try {
      const filePath = path.join(blogsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const { frontMatter, body } = parseFrontMatter(content);

      const slug = file.replace(".md", "");

      posts.push({
        slug,
        title: (frontMatter.title as string) || "Untitled",
        date: (frontMatter.date as string) || new Date().toISOString(),
        author: (frontMatter.author as string) || "Unknown",
        excerpt: (frontMatter.excerpt as string) || "",
        tags: Array.isArray(frontMatter.tags) ? (frontMatter.tags as string[]) : [],
        featured: typeof frontMatter.featured === "boolean" ? frontMatter.featured : false,
        content: body,
      });
    } catch (error) {
      console.error(`Error parsing blog post ${file}:`, error);
    }
  });

  // Sort by date, newest first
  posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Generate RSS feed
  const rssFeed = generateRss(posts);

  // Write to public directory
  const rssPath = path.join(publicDir, "feed.xml");
  fs.writeFileSync(rssPath, rssFeed, "utf-8");
}

function parseFrontMatter(content: string): ParseResult {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Invalid markdown format: missing frontmatter");
  }

  const [, frontMatterStr, body] = match;
  const frontMatter: FrontMatter = {};

  frontMatterStr.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length > 0) {
      let value: string | boolean | string[] = rest.join(":").trim();

      if (typeof value === "string") {
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value === "true") {
          value = true;
        } else if (value === "false") {
          value = false;
        } else if (value.startsWith("[") && value.endsWith("]")) {
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
}

function escapeXml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function markdownToPlainText(markdown: string): string {
  if (!markdown) return "";

  return markdown
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^---+$/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n\n+/g, "\n\n")
    .trim();
}

function generateRss(posts: BlogPost[]): string {
  const lastBuildDate = new Date().toUTCString();
  const lastPostDate =
    posts.length > 0
      ? new Date(posts[0].date).toUTCString()
      : lastBuildDate;

  const siteUrl = "https://tigregotico.github.io";
  const blogUrl = "https://tigregotico.github.io/feed.xml";

  let rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TigreGotico Blog</title>
    <link>${escapeXml(siteUrl)}</link>
    <atom:link href="${escapeXml(blogUrl)}" rel="self" type="application/rss+xml" />
    <description>Insights, tutorials, and thoughts on modern web development, technology trends, and best practices.</description>
    <language>en-us</language>
    <copyright>Copyright © ${new Date().getFullYear()} TigreGotico. All rights reserved.</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${lastPostDate}</pubDate>
`;

  posts.forEach((post) => {
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const postDate = new Date(post.date).toUTCString();

    const plainTextContent = post.content
      ? markdownToPlainText(post.content)
      : post.excerpt;

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
`;

    post.tags.forEach((tag: string) => {
      rssContent += `      <category>${escapeXml(tag)}</category>\n`;
    });

    rssContent += `    </item>\n`;
  });

  rssContent += `  </channel>
</rss>`;

  return rssContent;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), rssPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));