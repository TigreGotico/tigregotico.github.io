import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadData } from '@/lib/data-loader';
import ProjectCarousel from './ProjectCarousel';

interface FeaturedProject {
  name: string;
  description: string;
  image: string;
  github: string;
}

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData<FeaturedProject>('/featured-projects/featured-projects.json')
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return null;
  }

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            className="mb-8"
            variants={itemVariants}
            transition={{ duration: 0.6 }}
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
            className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-8 tracking-tight"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Featured Projects
          </motion.h2>

          <motion.div
            className="w-24 h-0.5 bg-primary mx-auto mb-8"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.4 }}
          ></motion.div>

          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Explore our flagship open-source repositories
          </motion.p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <ProjectCarousel projects={projects} autoplay={true} autoplaySpeed={5000} />
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
