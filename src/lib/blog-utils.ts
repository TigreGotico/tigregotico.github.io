/**
 * Utility function to parse YAML frontmatter from markdown files
 */
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
          
          return {
            slug,
            title: (frontMatter.title as string) || 'Untitled',
            date: (frontMatter.date as string) || new Date().toISOString(),
            author: (frontMatter.author as string) || 'Unknown',
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
