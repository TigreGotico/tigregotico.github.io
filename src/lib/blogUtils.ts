// Utility function to extract frontmatter and metadata from markdown files
export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  tags: string[];
  featured: boolean;
  readTime: string;
}

// Simple YAML frontmatter parser for browser
export const parseFrontMatter = (content: string) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid markdown format: missing frontmatter');
  }

  const [, frontMatterStr, body] = match;
  const frontMatter: Record<string, string | boolean | string[]> = {};

  frontMatterStr.split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length > 0) {
      let value: string | boolean | string[] = rest.join(':').trim();

      // Handle different value types
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

// Calculate read time based on word count
export const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

// Load all blog posts from the public/blogs directory
export const loadBlogPosts = async (): Promise<BlogPostMetadata[]> => {
  try {
    // List of known blog posts - in production, you might list files dynamically
    const blogFiles = [
      'getting-started-with-react.md',
      'wakehubert-wake-word-model.md',
      'web-development-trends-2024.md',
      'building-scalable-apis-nodejs-express.md'
    ];

    const posts: BlogPostMetadata[] = [];

    for (const file of blogFiles) {
      try {
        const response = await fetch(`/blogs/${file}`);
        if (!response.ok) continue;

        const markdown = await response.text();
        const { frontMatter, body } = parseFrontMatter(markdown);

        const slug = file.replace('.md', '');

        posts.push({
          slug,
          title: (frontMatter.title as string) || 'Untitled',
          date: (frontMatter.date as string) || new Date().toISOString(),
          author: (frontMatter.author as string) || 'Unknown',
          excerpt: (frontMatter.excerpt as string) || '',
          tags: (Array.isArray(frontMatter.tags) ? frontMatter.tags : []) as string[],
          featured: typeof frontMatter.featured === 'boolean' ? frontMatter.featured : false,
          readTime: calculateReadTime(body)
        });
      } catch (error) {
        console.error(`Error loading blog post ${file}:`, error);
      }
    }

    // Sort by date, newest first
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
};
