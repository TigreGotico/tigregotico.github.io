import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { loadData, type Project, type Collaboration } from '@/lib/projects-data';

const Projects = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    Promise.all([
      loadData<Project>('/projects/projects.json'),
      loadData<Collaboration>('/projects/collaborations.json')
    ]).then(([projectsData, collaborationsData]) => {
      setProjects(projectsData);
      setCollaborations(collaborationsData);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const categories = ['All', 'In-House', 'OVOS-Intents', 'OVOS-Solvers', 'OVOS-Embeddings', 'OVOS-STT', 'OVOS-Translation', 'OVOS-Utils', 'ILENIA'];

  const filteredProjects = useMemo(
    () => selectedCategory === 'All' 
      ? projects 
      : projects.filter((project) => project.category === selectedCategory),
    [selectedCategory, projects]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="w-16 h-0.5 bg-primary mx-auto mb-4"></div>
              <div className="w-8 h-0.5 bg-primary/60 mx-auto"></div>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 tracking-tight">
              {t('nav.projects') || 'Our Projects'}
            </h1>

            <div className="w-24 h-0.5 bg-primary mx-auto mb-8"></div>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              {t('projects.page.subtitle') || 'Explore our open-source projects and collaborations'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="grid w-fit grid-cols-2 bg-muted">
                <TabsTrigger value="collaborations" className="font-medium">
                  Featured Collaborations
                </TabsTrigger>
                <TabsTrigger value="projects" className="font-medium">
                  All Projects
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Featured Collaborations Tab */}
            <TabsContent value="collaborations" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {collaborations.map((collab, index) => (
                  <div key={collab.name} className="space-y-8 mb-16">
                    {/* Collaboration Header */}
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 tracking-tight">
                        {collab.name}
                      </h2>
                      <div className="w-16 h-0.5 bg-primary mx-auto mb-6"></div>
                      <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                        {collab.description}
                      </p>
                      <motion.a
                        href={collab.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all mt-6"
                        whileHover={{ x: 4 }}
                      >
                        Visit {collab.name}
                        <ExternalLink className="w-4 h-4" />
                      </motion.a>
                    </div>

                    {/* Repositories Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {collab.repositories.map((repo, repoIndex) => (
                        <motion.a
                          key={repo}
                          href={repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: repoIndex * 0.05 }}
                          whileHover={{ y: -4 }}
                        >
                          <div className="h-full bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors mb-1 font-mono">
                                  {repo.replace('https://github.com/', '')}
                                </h3>
                              </div>
                              <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                            </div>

                            <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all mt-auto">
                              View on GitHub
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category Filter */}
                <div className="flex flex-wrap gap-3 justify-center mb-12">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-muted dark:bg-gray-700 text-muted-foreground hover:bg-muted/80 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Projects Grid */}
                <motion.div
                  key={selectedCategory}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredProjects.map((project, index) => (
                    <motion.a
                      key={`${project.category}-${project.name}`}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="h-full bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-serif font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight flex-1 pr-2">
                            {project.name}
                          </h3>
                          <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4 flex-grow">
                          {project.description}
                        </p>

                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                          View Repository
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
              {t('contact.title')}
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed font-light">
              {t('contact.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-transform hover:scale-105 active:scale-95"
                onClick={() => window.location.href = '/contact'}
              >
                {t('contact.title')}
              </Button>
              <Button
                variant="outline"
                className="px-8 py-3 rounded-lg font-medium transition-transform hover:scale-105 active:scale-95"
                onClick={() => window.location.href = '/services'}
              >
                {t('nav.services')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
