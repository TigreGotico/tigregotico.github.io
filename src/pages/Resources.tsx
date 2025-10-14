import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Mic, ExternalLink, Heart, Users, Zap } from 'lucide-react';

const Resources = () => {
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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />
      
      <motion.main
        className="pt-32 pb-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            className="text-center mb-20"
            variants={itemVariants}
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 tracking-tight">
              {t('resources.title')}
            </h1>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
                {t('resources.subtitle')}
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{t('resources.foss')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{t('resources.community')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>{t('resources.innovation')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Published Datasets Section */}
          <motion.section
            className="mb-20"
            variants={itemVariants}
          >
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                {t('resources.datasets.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl">
                {t('resources.datasets.description')}
              </p>
            </div>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Database className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {t('resources.datasets.huggingface.title')}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {t('resources.datasets.huggingface.subtitle')}
                      </CardDescription>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('resources.datasets.huggingface.description')}
                </p>
                <Button
                  asChild
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  <a
                    href="https://huggingface.co/TigreGotico/datasets"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>{t('resources.datasets.browse')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.section>

          {/* Published Models Section */}
          <motion.section
            variants={itemVariants}
          >
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                {t('resources.models.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl">
                {t('resources.models.description')}
              </p>
            </div>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Mic className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {t('resources.models.huggingface.title')}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {t('resources.models.huggingface.subtitle')}
                      </CardDescription>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t('resources.models.huggingface.description')}
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('resources.models.features.title')}
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t('resources.models.features.piper')}</li>
                    <li>• {t('resources.models.features.ovos')}</li>
                    <li>• {t('resources.models.features.voices')}</li>
                    <li>• {t('resources.models.features.quality')}</li>
                  </ul>
                </div>
                <Button
                  asChild
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  <a
                    href="https://huggingface.co/TigreGotico/models"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{t('resources.models.browse')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.section>

          {/* Call to Action */}
          <motion.section
            className="mt-20 text-center"
            variants={itemVariants}
          >
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                {t('resources.cta.title')}
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('resources.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="min-w-48">
                  <a href="/contact">
                    {t('resources.cta.contact')}
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-w-48">
                  <a href="/services">
                    {t('resources.cta.services')}
                  </a>
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
};

export default Resources;
