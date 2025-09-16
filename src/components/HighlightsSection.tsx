import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink } from 'lucide-react';

const HighlightsSection = () => {
  const { t } = useLanguage();

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: {
      y: -5,
      transition: { duration: 0.2 },
    },
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
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
              whileHover={{ scaleX: 1.2, transition: { duration: 0.3 } }}
            ></motion.div>
            <motion.div
              className="w-8 h-0.5 bg-primary/60 mx-auto"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scaleX: 1.3, transition: { duration: 0.3 } }}
            ></motion.div>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-8 tracking-tight"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('projects.title')}
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
            {t('projects.subtitle')}
          </motion.p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          className="grid md:grid-cols-1 gap-12 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            className="group"
            variants={cardVariants}
            whileHover="hover"
            transition={{ duration: 0.4 }}
          >
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <motion.h3
                className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-6 tracking-tight"
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {t('projects.ilenia.headline')}
              </motion.h3>

              <motion.div
                className="w-16 h-0.5 bg-primary mb-6"
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.4 }}
              ></motion.div>

              <motion.p
                className="text-muted-foreground leading-relaxed font-light tracking-wide mb-8"
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {t('projects.ilenia.introduction')}
              </motion.p>

              <motion.a
                href={t('projects.ilenia.link')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('projects.ilenia.link')}
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HighlightsSection;
