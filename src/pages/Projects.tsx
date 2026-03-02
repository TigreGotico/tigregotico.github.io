import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, Github, ChevronDown, ArrowUpRight, Layers, Star, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { loadProjects, clearProjectsCache, type GitHubProject } from '@/lib/github-projects';
import { loadData, type Collaboration } from '@/lib/projects-data';

const INITIAL_CARD_COUNT = 6;
const INITIAL_REPO_COUNT = 6;

const categoryColor = (cat: string) => {
  const map: Record<string, string> = {
    'In-House':          'text-violet-500  bg-violet-500/10  border-violet-500/20',
    'OVOS-Intents':      'text-blue-500    bg-blue-500/10    border-blue-500/20',
    'OVOS-Solvers':      'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    'OVOS-Embeddings':   'text-amber-500   bg-amber-500/10   border-amber-500/20',
    'OVOS-STT':          'text-rose-500    bg-rose-500/10    border-rose-500/20',
    'OVOS-Translation':  'text-cyan-500    bg-cyan-500/10    border-cyan-500/20',
    'OVOS-Utils':        'text-orange-500  bg-orange-500/10  border-orange-500/20',
    'ILENIA':            'text-pink-500    bg-pink-500/10    border-pink-500/20',
  };
  return map[cat] ?? 'text-primary bg-primary/10 border-primary/20';
};

const Projects = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<GitHubProject[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'projects' | 'collaborations'>('collaborations');
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [expandedCollabs, setExpandedCollabs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isFromGitHub, setIsFromGitHub] = useState(false);

  const fetchProjects = useCallback(async (bustCache = false) => {
    setLoading(true);
    try {
      if (bustCache) clearProjectsCache();
      const data = await loadProjects();
      setProjects(data);
      // If first item has stars info, it came from the API
      setIsFromGitHub(data.length > 0 && data[0].stars !== undefined && data[0].stars > 0 || data.some(p => p.stars > 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    loadData<Collaboration>('/projects/collaborations.json')
      .then(setCollaborations)
      .catch(console.error);
  }, [fetchProjects]);

  // Reset expansion when filter changes
  useEffect(() => { setShowAllProjects(false); }, [selectedCategory]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map(p => p.category)))],
    [projects],
  );

  const filteredProjects = useMemo(
    () => selectedCategory === 'All' ? projects : projects.filter(p => p.category === selectedCategory),
    [selectedCategory, projects],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: projects.length };
    projects.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [projects]);

  const initialProjects  = filteredProjects.slice(0, INITIAL_CARD_COUNT);
  const remainingProjects = filteredProjects.slice(INITIAL_CARD_COUNT);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="w-16 h-0.5 bg-primary mx-auto mb-4" />
              <div className="w-8  h-0.5 bg-primary/60 mx-auto" />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 tracking-tight">
              {t('nav.projects') || 'Our Projects'}
            </h1>
            <div className="w-24 h-0.5 bg-primary mx-auto mb-8" />
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              {t('projects.page.subtitle') || 'Explore our open-source projects and collaborations'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Tab switcher ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-4">
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mx-auto">
          {(['projects', 'collaborations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-background shadow-sm rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">
                {tab === 'projects'
                  ? `All Projects${loading && projects.length === 0 ? '' : ` (${projects.length})`}`
                  : 'Collaborations'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <section className="py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <AnimatePresence mode="wait">

            {/* ── PROJECTS TAB ── */}
            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category filter pills + refresh */}
                <div className="flex flex-wrap gap-2 justify-center mb-12 items-center">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                        selectedCategory === cat
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {cat}
                      <span className={`ml-1.5 text-xs tabular-nums ${selectedCategory === cat ? 'opacity-70' : 'opacity-40'}`}>
                        {categoryCounts[cat] ?? 0}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => fetchProjects(true)}
                    disabled={loading}
                    title="Refresh from GitHub"
                    className="ml-2 p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200 disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Loading skeleton */}
                {loading && projects.length === 0 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-48 bg-card border border-border rounded-xl p-6 animate-pulse">
                        <div className="h-5 w-20 bg-muted rounded-full mb-4" />
                        <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                        <div className="h-3 w-full bg-muted rounded mb-1" />
                        <div className="h-3 w-5/6 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Initial cards grid */}
                {!(loading && projects.length === 0) && (
                <motion.div
                  key={selectedCategory}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {initialProjects.map((project, i) => (
                    <motion.a
                      key={`${project.category}-${project.name}`}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      whileHover={{ y: -3 }}
                    >
                      <div className="h-full bg-card border border-border rounded-xl p-6 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColor(project.category)}`}>
                            {project.category}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {project.stars > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="w-3 h-3" />
                                {project.stars}
                              </span>
                            )}
                            <Github className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>

                        <h3 className="text-base font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-grow mb-4">
                          {project.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {project.tags.slice(0, 4).map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                              {project.tags.length > 4 && (
                                <span className="text-xs px-2 py-0.5 text-muted-foreground/50">+{project.tags.length - 4}</span>
                              )}
                            </div>
                          )}
                          {project.language && (
                            <span className="text-xs text-muted-foreground/60 ml-auto shrink-0">{project.language}</span>
                          )}
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
                )}

                {/* ── Expand / collapse remaining ── */}
                {remainingProjects.length > 0 && (
                  <div className="mt-8">
                    {/* divider + toggle button */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-border" />
                      <button
                        onClick={() => setShowAllProjects(v => !v)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-full hover:border-primary/50 transition-all duration-200"
                      >
                        {showAllProjects ? 'Show less' : `${remainingProjects.length} more projects`}
                        <motion.span animate={{ rotate: showAllProjects ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4" />
                        </motion.span>
                      </button>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Compact list */}
                    <AnimatePresence>
                      {showAllProjects && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border/60">
                            {remainingProjects.map((project, i) => (
                              <motion.a
                                key={`${project.category}-${project.name}-list`}
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 px-5 py-4 bg-card hover:bg-muted/40 transition-all duration-200 group"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.22, delay: i * 0.035 }}
                              >
                                {/* Number */}
                                <span className="text-xs font-mono text-muted-foreground/50 w-7 shrink-0 text-right tabular-nums">
                                  {String(INITIAL_CARD_COUNT + i + 1).padStart(2, '0')}
                                </span>

                                {/* Name + description */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                      {project.name}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${categoryColor(project.category)}`}>
                                      {project.category}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                                </div>

                                {/* Stars + Tags (hidden on smaller screens) */}
                                {project.stars > 0 && (
                                  <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground/50 shrink-0">
                                    <Star className="w-3 h-3" />
                                    {project.stars}
                                  </span>
                                )}
                                {project.tags && (
                                  <div className="hidden lg:flex gap-1.5 shrink-0">
                                    {project.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground/70">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                              </motion.a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── COLLABORATIONS TAB ── */}
            {activeTab === 'collaborations' && (
              <motion.div
                key="collaborations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
              >
                {collaborations.map((collab) => {
                  const isExpanded = expandedCollabs[collab.name] ?? false;
                  const visibleRepos = isExpanded ? collab.repositories : collab.repositories.slice(0, INITIAL_REPO_COUNT);
                  const hiddenCount  = collab.repositories.length - INITIAL_REPO_COUNT;

                  return (
                    <div key={collab.name} className="border border-border rounded-2xl overflow-hidden">
                      {/* Header card */}
                      <div className="p-8 bg-card">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Layers className="w-4 h-4 text-primary" />
                              </div>
                              <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight">
                                {collab.name}
                              </h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed max-w-2xl">
                              {collab.description}
                            </p>
                          </div>
                          <a
                            href={collab.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0 self-start"
                          >
                            Visit {collab.name}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      {/* Repo list */}
                      <div className="border-t border-border">
                        <div className="px-8 py-3 bg-muted/30 flex items-center justify-between">
                          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            {collab.repositories.length} repositories
                          </span>
                          <Github className="w-4 h-4 text-muted-foreground/60" />
                        </div>

                        <div className="divide-y divide-border/50">
                          {visibleRepos.map((repo, ri) => {
                            const slug  = repo.replace('https://github.com/', '');
                            const slash = slug.indexOf('/');
                            const owner = slug.slice(0, slash);
                            const name  = slug.slice(slash + 1);
                            return (
                              <a
                                key={repo}
                                href={repo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 px-8 py-3.5 hover:bg-muted/40 transition-colors group"
                              >
                                <span className="text-xs font-mono text-muted-foreground/40 w-5 shrink-0 tabular-nums">
                                  {String(ri + 1).padStart(2, '0')}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs text-muted-foreground/50">{owner}/</span>
                                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{name}</span>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                              </a>
                            );
                          })}
                        </div>

                        {hiddenCount > 0 && (
                          <div className="px-8 py-4 border-t border-border/50">
                            <button
                              onClick={() => setExpandedCollabs(prev => ({ ...prev, [collab.name]: !isExpanded }))}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                              <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="w-4 h-4" />
                              </motion.span>
                              {isExpanded ? 'Show fewer repositories' : `Show ${hiddenCount} more repositories`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA ── */}
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
