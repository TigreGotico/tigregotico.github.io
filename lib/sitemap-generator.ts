import path from "path";
import fs from "fs";

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

const SITE_URL = "https://tigregotico.github.io";

// Static pages with their change frequency and priority
const staticPages: SitemapEntry[] = [
  {
    url: "/",
    changefreq: "weekly",
    priority: 1.0,
  },
  {
    url: "/services",
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    url: "/products",
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    url: "/projects",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    url: "/resources",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    url: "/blog",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    url: "/about",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    url: "/contact",
    changefreq: "monthly",
    priority: 0.7,
  },
];

function getBlogPosts(): SitemapEntry[] {
  const blogsDir = path.resolve(__dirname, "../public/blogs");
  const entries: SitemapEntry[] = [];

  if (!fs.existsSync(blogsDir)) {
    return entries;
  }

  const files = fs.readdirSync(blogsDir).filter((f) => f.endsWith(".md"));

  files.forEach((file) => {
    try {
      const filePath = path.join(blogsDir, file);
      const stat = fs.statSync(filePath);
      const slug = file.replace(".md", "");

      entries.push({
        url: `/blog/${slug}`,
        lastmod: stat.mtime.toISOString().split("T")[0],
        changefreq: "never",
        priority: 0.7,
      });
    } catch (error) {
      console.error(`Error processing blog file ${file}:`, error);
    }
  });

  return entries;
}

export function generateSitemap(): string {
  const allEntries = [...staticPages, ...getBlogPosts()];

  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  allEntries.forEach((entry) => {
    sitemapContent += `  <url>
    <loc>${SITE_URL}${entry.url}</loc>`;

    if (entry.lastmod) {
      sitemapContent += `
    <lastmod>${entry.lastmod}</lastmod>`;
    }

    if (entry.changefreq) {
      sitemapContent += `
    <changefreq>${entry.changefreq}</changefreq>`;
    }

    if (entry.priority !== undefined) {
      sitemapContent += `
    <priority>${entry.priority}</priority>`;
    }

    sitemapContent += `
  </url>
`;
  });

  sitemapContent += `</urlset>`;

  return sitemapContent;
}

export function writeSitemap(): void {
  const publicDir = path.resolve(__dirname, "../public");
  const sitemapPath = path.join(publicDir, "sitemap.xml");

  const sitemapContent = generateSitemap();
  fs.writeFileSync(sitemapPath, sitemapContent, "utf-8");
}
