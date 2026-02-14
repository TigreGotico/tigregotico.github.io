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
  const frontMatter: Record<string, unknown> = {};
  const lines = frontMatterStr.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^(\w+):\s*(.*)?$/);
    
    if (!match) {
      i++;
      continue;
    }

    const key = match[1].trim();
    let value: unknown = match[2]?.trim() || '';

    // Check if this is a nested object (next line is indented)
    if (i + 1 < lines.length && lines[i + 1].startsWith('  ')) {
      const obj: Record<string, string> = {};
      i++;
      
      // Parse nested properties
      while (i < lines.length && lines[i].startsWith('  ')) {
        const nestedLine = lines[i].trim();
        const nestedMatch = nestedLine.match(/^(\w+):\s*(.*)$/);
        
        if (nestedMatch) {
          let nestedValue = nestedMatch[2].trim();
          // Remove quotes if present
          if ((nestedValue.startsWith('"') && nestedValue.endsWith('"')) ||
              (nestedValue.startsWith("'") && nestedValue.endsWith("'"))) {
            nestedValue = nestedValue.slice(1, -1);
          }
          obj[nestedMatch[1]] = nestedValue;
        }
        i++;
      }
      
      value = obj;
      i--; // Adjust because loop will increment
    } else {
      // Handle simple values
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
    }

    frontMatter[key] = value;
    i++;
  }

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
    const blogFiles = [
      '2023-10-16-no-language-left-behind.md',
      '2025-06-26-making-synthetic-voices-from-scratch.md',
      '2025-09-17-ovos_ha_dream_team.md',
      '2025-10-06-phoonnx.md',
      '2025-11-26-OVOS-hivemind-industry.md',
      '2025-12-09-ast.md',
      '2025-12-12-barranquenho.md',
      '2026-01-13-hivemind_agpl.md',
    ];

    const posts: BlogPostMetadata[] = [];

    for (const file of blogFiles) {
      try {
        const response = await fetch(`/blogs/${file}`);
        if (!response.ok) continue;

        const markdown = await response.text();
        const { frontMatter, body } = parseFrontMatter(markdown);

        const slug = file.replace('.md', '');

        // Extract author name from author object or string
        let authorName = 'Unknown';
        
        if (typeof frontMatter.author === 'string') {
          authorName = frontMatter.author;
        } else if (frontMatter.author && typeof frontMatter.author === 'object' && !Array.isArray(frontMatter.author)) {
          const authorObj = frontMatter.author as { name?: string };
          authorName = authorObj.name || 'Unknown';
        }
        posts.push({
          slug,
          title: (frontMatter.title as string) || 'Untitled',
          date: (frontMatter.date as string) || new Date().toISOString(),
          author: authorName,
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
