import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Mic, ExternalLink, Heart, Users, Zap, Package, FileText } from 'lucide-react';

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
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 flex items-center gap-3">
                <Mic className="w-8 h-8 text-green-500" />
                Models
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl">
                High-quality, open-source models optimized for various tasks and platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
              {/* Phoneme ONNX TTS Models */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Package className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Phoneme ONNX TTS Models</CardTitle>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">Text-to-Speech models using phoneme input with ONNX format for optimized inference.</p>
                  <Button asChild className="w-full" size="sm">
                    <a href="https://huggingface.co/collections/TigreGotico/phoonnx-tts-models" target="_blank" rel="noopener noreferrer">
                      Browse Collection <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* ONNX Models */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Package className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">ONNX Models</CardTitle>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">Optimized models in ONNX format for fast, cross-platform inference across various applications.</p>
                  <Button asChild className="w-full" size="sm">
                    <a href="https://huggingface.co/collections/TigreGotico/onnx-models" target="_blank" rel="noopener noreferrer">
                      Browse Collection <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Datasets Collections */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-500" />
                Datasets
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl">
                Comprehensive datasets for training and fine-tuning machine learning models in voice and NLP tasks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Synthetic Wakeword Datasets */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Database className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Synthetic Wakeword Datasets</CardTitle>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">Synthetically generated wakeword audio datasets for training voice activation systems.</p>
                  <Button asChild className="w-full" size="sm">
                    <a href="https://huggingface.co/collections/TigreGotico/synthetic-wakeword-datasets" target="_blank" rel="noopener noreferrer">
                      Browse Collection <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Synthetic TTS Datasets */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Database className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Synthetic TTS Datasets</CardTitle>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">High-quality synthetic text-to-speech datasets for training speech synthesis models.</p>
                  <Button asChild className="w-full" size="sm">
                    <a href="https://huggingface.co/collections/TigreGotico/synthetic-tts-datasets" target="_blank" rel="noopener noreferrer">
                      Browse Collection <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Mirandese Datasets */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Database className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Mirandese Datasets</CardTitle>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">Datasets for the Mirandese language, supporting multilingual voice assistant development.</p>
                  <Button asChild className="w-full" size="sm">
                    <a href="https://huggingface.co/collections/TigreGotico/mirandese-datasets" target="_blank" rel="noopener noreferrer">
                      Browse Collection <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Grapheme2Phoneme Datasets */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Database className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Grapheme2Phoneme Datasets</CardTitle>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">Datasets mapping graphemes to phonemes for speech synthesis and linguistic processing tasks.</p>
                  <Button asChild className="w-full" size="sm">
                    <a href="https://huggingface.co/collections/TigreGotico/grapheme2phoneme-datasets" target="_blank" rel="noopener noreferrer">
                      Browse Collection <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Research Section */}
          <motion.section
            className="mb-20"
            variants={itemVariants}
          >
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-500" />
                Research
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl">
                Academic publications and technical whitepapers documenting our research contributions to open-source voice technology.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hybrid Synthetic TTS Dataset Whitepaper */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Hybrid Synthetic TTS Dataset</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">A whitepaper detailing our methodology for creating high-quality synthetic TTS datasets using hybrid approaches.</p>
                  <Button asChild className="w-full" size="sm">
                    <a href="/whitepaper_hybrid_synthetic_tts_dataset.pdf" target="_blank" rel="noopener noreferrer">
                      Download Whitepaper <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
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
