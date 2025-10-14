import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

const HeroSection = () => {
  const { t } = useLanguage();
  const isMobile = useMobileDetection();

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
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        style={{ objectFit: 'cover' }}
      >
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto">
          {/* Gothic ornamental element */}
          <motion.div
            className="mb-8 sm:mb-12"
            variants={itemVariants}
          >
            <motion.div
              className="w-12 sm:w-16 h-0.5 bg-white mx-auto mb-3 sm:mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scaleX: 1.2, transition: { duration: 0.3 } }}
            ></motion.div>
            <motion.div
              className="w-6 sm:w-8 h-0.5 bg-white/60 mx-auto"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scaleX: 1.3, transition: { duration: 0.3 } }}
            ></motion.div>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-white mb-6 sm:mb-8 leading-tight tracking-tight"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('hero.title')}
            <span className="block text-white/90 font-light mt-1 sm:mt-2">{t('hero.subtitle')}</span>
          </motion.h1>

          <motion.div
            className="w-16 sm:w-24 h-0.5 bg-white mx-auto mb-8 sm:mb-12"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.4 }}
          ></motion.div>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-white/80 mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed font-light tracking-wide px-4"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
            variants={buttonVariants}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-auto"
            >
              <Link to="/contact" className="block">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 text-sm sm:text-base font-medium tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-lg whitespace-nowrap"
                >
                  {isMobile ? t('hero.cta.primary.mobile') : t('hero.cta.primary')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-auto"
            >
                <Button
                variant="outline"
                size="lg"
                className="text-black hover:bg-white/10 hover:border-white/50 px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 text-sm sm:text-base font-medium tracking-wide rounded-lg whitespace-nowrap"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                {isMobile ? t('hero.cta.secondary.mobile') : t('hero.cta.secondary')}
                </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;