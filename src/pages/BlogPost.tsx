import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, User, Clock, ArrowLeft, Share2 } from 'lucide-react';
import 'highlight.js/styles/github.css';

interface BlogPostData {
  title: string;
  date: string;
  author: string;
  excerpt: string;
  tags: string[];
  featured: boolean;
  content: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to extract author name from author object or string
  const extractAuthorName = (author: unknown): string => {
    if (typeof author === 'string') {
      return author;
    } else if (author && typeof author === 'object' && !Array.isArray(author)) {
      const authorObj = author as { name?: string };
      return authorObj.name || 'Unknown';
    }
    return 'Unknown';
  };

  // Simple YAML frontmatter parser for browser
  const parseFrontMatter = (content: string) => {
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

  useEffect(() => {
    const loadBlogPost = async () => {
      if (!slug) {
        setError('No blog post specified');
        setLoading(false);
        return;
      }

      try {
        // Fetch the markdown file
        const response = await fetch(`/blogs/${slug}.md`);
        
        if (!response.ok) {
          console.error(`Failed to fetch blog post. Status: ${response.status}`);
          throw new Error(`Blog post not found (Status: ${response.status})`);
        }

        const markdown = await response.text();
        
        if (!markdown) {
          throw new Error('Blog post is empty');
        }

        const { frontMatter, body } = parseFrontMatter(markdown);

        if (!frontMatter.title) {
          throw new Error('Invalid blog post format: missing title');
        }

        setPost({
          title: (frontMatter.title as string) || 'Untitled',
          date: (frontMatter.date as string) || new Date().toISOString(),
          author: extractAuthorName(frontMatter.author),
          excerpt: (frontMatter.excerpt as string) || '',
          tags: (Array.isArray(frontMatter.tags) ? frontMatter.tags : []) as string[],
          featured: typeof frontMatter.featured === 'boolean' ? frontMatter.featured : false,
          content: body || ''
        });
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error('Error loading blog post:', error);
        setError(error instanceof Error ? error.message : 'Failed to load blog post');
        setLoading(false);
      }
    };

    loadBlogPost();
  }, [slug]);

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const sharePost = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Oops! Page Not Found</h1>
            <p className="text-muted-foreground text-lg mb-8">
              {error || 'The blog post you\'re looking for could not be found.'}
            </p>
            <Link to="/blog">
              <Button className="bg-primary hover:bg-primary/90">
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      
      {/* Header */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors duration-300 font-medium tracking-wide"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            
            <div className="max-w-4xl mx-auto text-center">
              {/* Gothic ornamental element */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div
                  className="w-12 sm:w-16 h-0.5 bg-primary mx-auto mb-3"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                ></motion.div>
                <motion.div
                  className="w-6 sm:w-8 h-0.5 bg-primary/60 mx-auto"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                ></motion.div>
              </motion.div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="capitalize border-border/50">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6 leading-tight tracking-tight">
                {post.title}
              </h1>

              <motion.div
                className="w-16 sm:w-24 h-0.5 bg-primary mx-auto mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              ></motion.div>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed font-light max-w-3xl mx-auto">
                {post.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{calculateReadTime(post.content)}</span>
                </div>
                <Button
                  onClick={sharePost}
                  variant="outline"
                  size="sm"
                  className="flex items-center hover:bg-accent transition-colors duration-300"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="overflow-hidden shadow-lg border-border/50 bg-white dark:bg-gray-800">
            <CardContent className="p-8 sm:p-12 lg:p-16">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-12 mb-6 first:mt-0 tracking-tight">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mt-10 mb-5 border-b border-border pb-2 tracking-tight">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground mt-8 mb-4 tracking-tight">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-muted-foreground leading-relaxed mb-5 font-light">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-2 mb-5 text-muted-foreground ml-4">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-2 mb-5 text-muted-foreground ml-4">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-muted-foreground leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground bg-accent/30 p-6 rounded-r-lg mb-6 my-6">
                        {children}
                      </blockquote>
                    ),
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      if (match) {
                        return (
                          <pre className="bg-slate-900 dark:bg-gray-950 text-slate-100 p-6 rounded-lg overflow-x-auto mb-6 my-6 border border-border/20">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      }
                      return (
                        <code className="bg-accent text-foreground px-2 py-1 rounded text-sm font-mono border border-border/30" {...props}>
                          {children}
                        </code>
                      );
                    },
                    a: ({ href, children }) => {
                      // Check if the link is to an audio file
                      if (href && /\.(mp3|wav|ogg|m4a)$/i.test(href)) {
                        return (
                          <audio
                            controls
                            className="w-full max-w-2xl mx-auto my-6 rounded-lg border border-border/30 shadow-md block"
                          >
                            <source src={href} type={`audio/${href.split('.').pop()?.toLowerCase()}`} />
                            Your browser does not support the audio element.
                          </audio>
                        );
                      }
                      return (
                        <a
                          href={href}
                          className="text-primary hover:text-primary/80 underline decoration-2 underline-offset-2 transition-colors duration-300"
                          target={href?.startsWith('http') ? '_blank' : undefined}
                          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {children}
                        </a>
                      );
                    },
                    img: ({ src, alt, width, height }) => (
                      <img
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        className="max-w-full h-auto rounded-lg border border-border/30 my-6 mx-auto shadow-md"
                      />
                    ),
                    audio: (props) => (
                      <audio
                        controls
                        className="w-full max-w-2xl mx-auto my-6 rounded-lg border border-border/30 shadow-md"
                        {...props}
                      />
                    ),
                    source: ({ src, type }) => (
                      <source src={src} type={type} />
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </article>

      {/* Related Posts / Navigation */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-border/50 shadow-lg bg-white dark:bg-gray-800">
            <CardContent className="p-8 sm:p-12 text-center">
              <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-4 tracking-tight">Want to read more?</h3>
              <p className="text-muted-foreground mb-8 font-light leading-relaxed">
                Check out our other blog posts for more insights and tutorials.
              </p>
              <Link to="/blog">
                <Button className="bg-primary hover:bg-primary/90 px-8 py-3 font-medium tracking-wide shadow-md hover:shadow-lg transition-all duration-300">
                  View All Posts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPost;
