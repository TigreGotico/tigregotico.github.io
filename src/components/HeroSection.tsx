import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
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

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-subtle"></div>

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto">
          {/* Gothic ornamental element */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <motion.div
              className="w-16 h-0.5 bg-primary mx-auto mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scaleX: 1.2, transition: { duration: 0.3 } }}
            ></motion.div>
            <motion.div
              className="w-8 h-0.5 bg-primary/60 mx-auto"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scaleX: 1.3, transition: { duration: 0.3 } }}
            ></motion.div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground mb-8 leading-tight tracking-tight"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('hero.title')}
            <span className="block text-foreground/80 font-light mt-2">{t('hero.subtitle')}</span>
          </motion.h1>

          <motion.div
            className="w-24 h-0.5 bg-primary mx-auto mb-12"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.4 }}
          ></motion.div>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            variants={buttonVariants}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/contact">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-base font-medium tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  {t('hero.cta.primary')}
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="bg-white/80 text-foreground border-primary/30 hover:bg-white/90 backdrop-blur-sm px-12 py-6 text-base font-medium tracking-wide transition-all duration-300 hover:shadow-lg"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('hero.cta.secondary')}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;