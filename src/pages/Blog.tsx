import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, Clock } from 'lucide-react';
import { loadBlogPosts, type BlogPostMetadata } from '@/lib/blogUtils';

type BlogPost = BlogPostMetadata;

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const loadedPosts = await loadBlogPosts();
        setPosts(loadedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error loading blog posts:', error);
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const filteredPosts = selectedTag 
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  const featuredPost = posts.find(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gradient-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Gothic ornamental element */}
            <motion.div
              className="mb-8 sm:mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="w-12 sm:w-16 h-0.5 bg-primary mx-auto mb-3 sm:mb-4"
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

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 sm:mb-8 tracking-tight">
              Our Blog
            </h1>

            <motion.div
              className="w-16 sm:w-24 h-0.5 bg-primary mx-auto mb-6 sm:mb-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            ></motion.div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              Insights, tutorials, and thoughts on modern web development, technology trends, and best practices.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Tags Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 sm:mb-16"
        >
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-6 tracking-tight">Filter by Topic</h2>
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={() => setSelectedTag(null)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-300 tracking-wide ${
                selectedTag === null
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-white text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              All Posts
            </motion.button>
            {allTags.map(tag => (
              <motion.button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-300 capitalize tracking-wide ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-white text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && !selectedTag && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 sm:mb-20"
          >
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-8 tracking-tight">Featured Post</h2>
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-border/50">
              <CardHeader className="bg-gradient-primary text-white relative">
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Featured
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {new Date(featuredPost.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold leading-tight tracking-tight">
                  {featuredPost.title}
                </CardTitle>
                <CardDescription className="text-white/90 text-base sm:text-lg leading-relaxed font-light mt-4">
                  {featuredPost.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredPost.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="capitalize border-border/50">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium tracking-wide shadow-md hover:shadow-lg"
                >
                  Read Full Article
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Regular Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-8 sm:mb-12 tracking-tight">
            {selectedTag ? `Posts tagged with "${selectedTag}"` : 'Latest Posts'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {post.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-serif leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed font-light">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs capitalize border-border/50">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs border-border/50">
                          +{post.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        {post.author}
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-primary hover:text-primary/80 font-medium text-sm tracking-wide transition-colors duration-300"
                      >
                        Read More →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16 sm:py-20"
          >
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-4 tracking-tight">
              No posts found
            </h3>
            <p className="text-muted-foreground font-light leading-relaxed">
              Try selecting a different tag or check back later for new content.
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
