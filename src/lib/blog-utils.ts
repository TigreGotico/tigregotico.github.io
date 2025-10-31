/**
 * Utility function to parse YAML frontmatter from markdown files
 */
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
    const lineMatch = line.match(/^(\w+):\s*(.*)?$/);
    
    if (!lineMatch) {
      i++;
      continue;
    }

    const key = lineMatch[1].trim();
    let value: unknown = lineMatch[2]?.trim() || '';

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

/**
 * Fetch all blog posts from the public/blogs directory
 */
export const fetchBlogPosts = async () => {
  try {
    // Get all markdown files in the blogs directory
    const response = await fetch('/blogs/');
    const html = await response.text();
    
    // Parse HTML to extract markdown file names
    const fileNames = extractMarkdownFileNames(html);
    
    const posts = await Promise.all(
      fileNames.map(async (fileName) => {
        try {
          const fileResponse = await fetch(`/blogs/${fileName}`);
          const content = await fileResponse.text();
          const { frontMatter } = parseFrontMatter(content);
          
          const slug = fileName.replace('.md', '');
          const wordCount = content.split(/\s+/).length;
          const readTime = Math.ceil(wordCount / 200);
          
          // Extract author name from author object or string
          let authorName = 'Unknown';
          if (typeof frontMatter.author === 'string') {
            authorName = frontMatter.author;
          } else if (frontMatter.author && typeof frontMatter.author === 'object' && !Array.isArray(frontMatter.author)) {
            const authorObj = frontMatter.author as { name?: string };
            authorName = authorObj.name || 'Unknown';
          }
          
          return {
            slug,
            title: (frontMatter.title as string) || 'Untitled',
            date: (frontMatter.date as string) || new Date().toISOString(),
            author: authorName,
            excerpt: (frontMatter.excerpt as string) || '',
            tags: (Array.isArray(frontMatter.tags) ? frontMatter.tags : []) as string[],
            featured: typeof frontMatter.featured === 'boolean' ? frontMatter.featured : false,
            readTime: `${readTime} min read`
          };
        } catch (error) {
          console.error(`Error loading blog post ${fileName}:`, error);
          return null;
        }
      })
    );
    
    return posts.filter(post => post !== null);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

/**
 * Extract markdown file names from directory listing HTML
 */
const extractMarkdownFileNames = (html: string): string[] => {
  const fileNames: string[] = [];
  const regex = /href="[^"]*\.md"/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const fileName = match[0].match(/[^/"]+\.md/)?.[0];
    if (fileName) {
      fileNames.push(fileName);
    }
  }
  
  return fileNames;
};
