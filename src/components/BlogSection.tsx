import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, User, Clock, ArrowRight } from 'lucide-react';
import { loadBlogPosts, type BlogPostMetadata } from '@/lib/blogUtils';

type BlogPost = BlogPostMetadata;

const BlogSection = () => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const allPosts = await loadBlogPosts();
        // Sort by date (newest first) and get the first 3 posts
        const sorted = allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setFeaturedPosts(sorted.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error('Error loading blog posts:', error);
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16 sm:mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="w-16 h-0.5 bg-primary mx-auto mb-4"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            ></motion.div>
            <motion.div
              className="w-8 h-0.5 bg-primary/60 mx-auto"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            ></motion.div>
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 tracking-tight"
            variants={itemVariants}
          >
            Latest from Our Blog
          </motion.h2>
          <motion.div
            className="w-24 h-0.5 bg-primary mx-auto mb-8"
            variants={itemVariants}
          ></motion.div>
          <motion.p
            className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light"
            variants={itemVariants}
          >
            Insights, tutorials, and thoughts on modern web development, technology trends, and best practices.
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {featuredPosts.map((post) => (
                <motion.div
                  key={post.slug}
                  variants={itemVariants}
                >
                  <Link to={`/blog/${post.slug}`} className="group h-full block">
                    <Card className="h-full group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 flex flex-col bg-card">
                      <CardHeader>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 gap-4">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            <span>{new Date(post.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight leading-tight mb-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3 text-muted-foreground font-light">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-between">
                        <div className="flex flex-wrap gap-2 mb-6">
                          {post.tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag} 
                              className="text-xs font-medium capitalize px-2.5 py-1 bg-primary/10 text-primary rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-light">{post.author}</span>
                          </div>
                          <div className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                            Read
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <Link to="/blog">
                <Button className="bg-primary hover:bg-primary/90 px-8 py-3 rounded-lg font-medium transition-transform hover:scale-105 active:scale-95">
                  View All Posts
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
