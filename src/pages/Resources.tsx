import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ExternalLink, Heart, Users, Zap, Package, FileText, Calendar, User, BookOpen, Code, Download } from 'lucide-react';
import { loadData, type ResearchPaper, type Dataset, type Model, type Notebook } from '@/lib/data-loader';
import { downloadFile } from '@/lib/pdf-converter';
import { useEffect, useState } from 'react';
import { NotebookPreviewModal } from '@/components/NotebookPreviewModal';
import { saveAs } from 'file-saver';

const Resources = () => {
  const { t } = useLanguage();
  const [data, setData] = useState({ models: [] as Model[], datasets: [] as Dataset[], research: [] as ResearchPaper[], notebooks: [] as Notebook[] });
  const [loading, setLoading] = useState(true);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openNotebookPreview = (notebook: Notebook) => {
    console.log('openNotebookPreview called with:', notebook);
    setSelectedNotebook(notebook);
    setIsDialogOpen(true);
    console.log('Dialog should open now, isDialogOpen set to true');
  };

  const handleNotebookDownload = async (notebook: Notebook) => {
    try {
      const response = await fetch(notebook.url);
      const blob = await response.blob();
      const filename = notebook.url.split('/').pop() || `${notebook.id}.ipynb`;
      console.log('Downloading notebook as:', filename);
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error downloading notebook:', error);
    }
  };

  useEffect(() => {
    Promise.all([
      loadData<Model>('/models/models.json'),
      loadData<Dataset>('/datasets/datasets.json'),
      loadData<ResearchPaper>('/research/research-data.json'),
      loadData<Notebook>('/notebooks/notebooks.json')
    ]).then(([models, datasets, research, notebooks]) => {
      setData({ models, datasets, research, notebooks });
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleDownload = (paper: ResearchPaper) => (e: React.MouseEvent) => {
    e.preventDefault();
    downloadFile(paper.filePath, paper.title);
  };

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
                <Package className="w-8 h-8 text-green-500" />
                Models
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl">
                High-quality, open-source models optimized for various tasks and platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
              {loading ? <div className="col-span-2 text-center py-8 text-muted-foreground">Loading...</div> :
                data.models.map(({ id, title, description, url }) => (
                  <Card key={id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-500/10 rounded-lg"><Package className="w-5 h-5 text-green-500" /></div>
                          <CardTitle className="text-lg">{title}</CardTitle>
                        </div>
                        <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4">{description}</p>
                      <Button asChild className="w-full" size="sm">
                        <a href={url} target="_blank" rel="noopener noreferrer">Browse Collection <ExternalLink className="w-3 h-3 ml-2" /></a>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              }
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
              {loading ? <div className="col-span-2 text-center py-8 text-muted-foreground">Loading...</div> :
                data.datasets.map(({ id, title, description, url }) => (
                  <Card key={id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg"><Database className="w-5 h-5 text-blue-500" /></div>
                          <CardTitle className="text-lg">{title}</CardTitle>
                        </div>
                        <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4">{description}</p>
                      <Button asChild className="w-full" size="sm">
                        <a href={url} target="_blank" rel="noopener noreferrer">Browse Collection <ExternalLink className="w-3 h-3 ml-2" /></a>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              }
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
              {loading ? <div className="col-span-2 text-center py-8 text-muted-foreground">Loading...</div> :
                data.research.map((paper) => (
                  <Card key={paper.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg"><FileText className="w-5 h-5 text-purple-500" /></div>
                          <CardTitle className="text-lg">{paper.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{paper.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {paper.date && <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"><Calendar className="w-3 h-3" /> {paper.date}</span>}
                        {paper.authors?.map((author) => <span key={author} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"><User className="w-3 h-3" /> {author}</span>)}
                        {paper.tags?.map((tag) => <span key={tag} className="text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">{tag}</span>)}
                      </div>
                      <Button className="w-full" size="sm" onClick={handleDownload(paper)}>
                        {paper.buttonLabel || 'Download'} <FileText className="w-3 h-3 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </motion.section>

          {/* Notebooks Section */}
          <motion.section
            className="mb-20"
            variants={itemVariants}
          >
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-orange-500" />
                Notebooks
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl">
                Interactive Jupyter notebooks demonstrating practical implementations of voice technology, machine learning, and NLP techniques.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? <div className="col-span-2 text-center py-8 text-muted-foreground">Loading...</div> :
                data.notebooks.map((notebook) => (
                  <Card key={notebook.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-500/10 rounded-lg"><BookOpen className="w-5 h-5 text-orange-500" /></div>
                          <CardTitle className="text-lg">{notebook.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{notebook.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {notebook.date && <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"><Calendar className="w-3 h-3" /> {notebook.date}</span>}
                        {notebook.language && <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded font-mono">{notebook.language}</span>}
                        {notebook.tags?.map((tag) => <span key={tag} className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">{tag}</span>)}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => {
                            console.log('Preview button clicked for:', notebook.title);
                            openNotebookPreview(notebook);
                          }}
                        >
                          Preview Notebook <Code className="w-3 h-3 ml-2" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleNotebookDownload(notebook)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>

            {/* Notebook Preview Modal */}
            <NotebookPreviewModal
              isOpen={isDialogOpen}
              onOpenChange={(open) => {
                console.log('NotebookPreviewModal onOpenChange:', open);
                setIsDialogOpen(open);
              }}
              title={selectedNotebook?.title || ''}
              notebookUrl={selectedNotebook?.url || ''}
            />
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
