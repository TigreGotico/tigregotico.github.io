import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';

interface Project {
  name: string;
  description: string;
  url: string;
  category: string;
  tags?: string[];
}

const Projects = () => {
  const { t } = useLanguage();

  const projects = useMemo(() => [
    // In-House Projects
    {
      name: 'phonNX',
      description: 'Phoneme-to-text and text-to-phoneme conversion using ONNX models',
      url: 'https://github.com/TigreGotico/phoonnx',
      category: 'In-House',
      tags: ['Phonetics', 'ONNX', 'NLP'],
    },
    {
      name: 'Chatterbox ONNX',
      description: 'ONNX-based inference engine for conversational AI',
      url: 'https://github.com/TigreGotico/chatterbox-onnx',
      category: 'In-House',
      tags: ['ONNX', 'AI', 'Inference'],
    },
    {
      name: 'Synthetic Dataset Generator',
      description: 'Generate synthetic datasets for machine learning training',
      url: 'https://github.com/TigreGotico/synthetic_dataset_generator',
      category: 'In-House',
      tags: ['Dataset', 'ML', 'Synthetic Data'],
    },
    {
      name: 'TugaPhone',
      description: 'Portuguese phoneme dataset and processing tools',
      url: 'https://github.com/TigreGotico/tugaphone',
      category: 'In-House',
      tags: ['Portuguese', 'Phonetics', 'Dataset'],
    },
    {
      name: 'RAKE Keywords',
      description: 'Rapid Automatic Keyword Extraction implementation',
      url: 'https://github.com/TigreGotico/RAKEkeywords',
      category: 'In-House',
      tags: ['NLP', 'Keywords', 'Extraction'],
    },
    {
      name: 'Ahocorasick NER',
      description: 'Named Entity Recognition using Aho-Corasick algorithm',
      url: 'https://github.com/TigreGotico/ahocorasick-ner',
      category: 'In-House',
      tags: ['NER', 'NLP', 'Named Entities'],
    },
    {
      name: 'KW Template Matcher',
      description: 'Keyword template matching engine for intent recognition',
      url: 'https://github.com/TigreGotico/kw-template-matcher',
      category: 'In-House',
      tags: ['Intent', 'Matching', 'NLP'],
    },
    {
      name: 'MarkovJSON',
      description: 'Markov chain text generation from JSON data',
      url: 'https://github.com/TigreGotico/markovjson',
      category: 'In-House',
      tags: ['Markov', 'Generation', 'JSON'],
    },
    {
      name: 'Silabificador',
      description: 'Portuguese text syllabification tool',
      url: 'https://github.com/TigreGotico/silabificador',
      category: 'In-House',
      tags: ['Portuguese', 'Syllables', 'Text Processing'],
    },
    {
      name: 'pyFrotz',
      description: 'Python wrapper for interactive fiction engine',
      url: 'https://github.com/TigreGotico/pyFrotz',
      category: 'In-House',
      tags: ['Interactive Fiction', 'Python', 'Games'],
    },

    // OpenVoiceOS Intents
    {
      name: 'OVOS M2V Pipeline',
      description: 'Markup-to-Voice pipeline for OpenVoiceOS intent handling',
      url: 'https://github.com/TigreGotico/ovos-m2v-pipeline',
      category: 'OVOS-Intents',
      tags: ['Intent', 'OVOS', 'Pipeline'],
    },

    // OpenVoiceOS Solvers
    {
      name: 'OVOS FlashRank Reranker Plugin',
      description: 'Fast semantic reranking plugin for OVOS query results',
      url: 'https://github.com/TigreGotico/ovos-flashrank-reranker-plugin',
      category: 'OVOS-Solvers',
      tags: ['Reranking', 'Solver', 'OVOS'],
    },
    {
      name: 'OVOS BM25 Solver Plugin',
      description: 'BM25 retrieval-based solver for OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-solver-BM25-plugin',
      category: 'OVOS-Solvers',
      tags: ['BM25', 'Solver', 'OVOS'],
    },
    {
      name: 'OVOS GGUF Solver Plugin',
      description: 'Local LLM solver using GGUF models in OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-solver-gguf-plugin',
      category: 'OVOS-Solvers',
      tags: ['LLM', 'GGUF', 'Solver', 'OVOS'],
    },
    {
      name: 'OVOS MoS',
      description: 'Mixture of Specialists framework for OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-MoS',
      category: 'OVOS-Solvers',
      tags: ['Expert System', 'OVOS', 'Framework'],
    },

    // OpenVoiceOS Embeddings
    {
      name: 'OVOS ChromaDB Embeddings Plugin',
      description: 'ChromaDB vector embeddings plugin for OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-chromadb-embeddings-plugin',
      category: 'OVOS-Embeddings',
      tags: ['Embeddings', 'ChromaDB', 'OVOS'],
    },
    {
      name: 'OVOS GGUF Embeddings Plugin',
      description: 'Local GGUF embeddings plugin for OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-gguf-embeddings-plugin',
      category: 'OVOS-Embeddings',
      tags: ['Embeddings', 'GGUF', 'OVOS'],
    },
    {
      name: 'OVOS Qdrant Embeddings Plugin',
      description: 'Qdrant vector database embeddings plugin for OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-qdrant-embeddings-plugin',
      category: 'OVOS-Embeddings',
      tags: ['Embeddings', 'Qdrant', 'OVOS'],
    },

    // OpenVoiceOS Speech-to-Text
    {
      name: 'OVOS Transcription Validator Plugin',
      description: 'Validate and filter STT transcriptions in OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-transcription-validator-plugin',
      category: 'OVOS-STT',
      tags: ['STT', 'Validation', 'OVOS'],
    },
    {
      name: 'OVOS STT Plugin - MyNorthAI',
      description: 'MyNorthAI Speech-to-Text plugin for OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-stt-plugin-MyNorthAI',
      category: 'OVOS-STT',
      tags: ['STT', 'Speech-to-Text', 'OVOS'],
    },

    // OpenVoiceOS Translation
    {
      name: 'OVOS GGUF Translate Plugin',
      description: 'Local translation using GGUF models in OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-gguf-translate-plugin',
      category: 'OVOS-Translation',
      tags: ['Translation', 'GGUF', 'OVOS'],
    },

    // OpenVoiceOS Utilities
    {
      name: 'OVOscope',
      description: 'Debugging and inspection tool for OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovoscope',
      category: 'OVOS-Utils',
      tags: ['Debug', 'Tool', 'OVOS'],
    },
    {
      name: 'OVOS Simple Listener',
      description: 'Minimal audio listening component for OpenVoiceOS',
      url: 'https://github.com/TigreGotico/ovos-simple-listener',
      category: 'OVOS-Utils',
      tags: ['Audio', 'Listener', 'OVOS'],
    },
    {
      name: 'OVOS Wyoming Docker',
      description: 'Docker setup for OpenVoiceOS with Wyoming services',
      url: 'https://github.com/TigreGotico/ovos-wyoming-docker',
      category: 'OVOS-Utils',
      tags: ['Docker', 'Wyoming', 'OVOS'],
    },

    // ILENIA Collaboration Projects
    {
      name: 'OVOS STT Plugin - NOS',
      description: 'Speech-to-Text plugin for OpenVoiceOS using NOS models',
      url: 'https://github.com/OpenVoiceOS/ovos-stt-plugin-nos',
      category: 'ILENIA',
      tags: ['STT', 'Speech-to-Text', 'Multilingual'],
    },
    {
      name: 'OVOS STT Plugin - HiTZ',
      description: 'Speech-to-Text plugin for OpenVoiceOS using HiTZ models',
      url: 'https://github.com/OpenVoiceOS/ovos-stt-plugin-HiTZ',
      category: 'ILENIA',
      tags: ['STT', 'Speech-to-Text', 'Basque'],
    },
    {
      name: 'OVOS STT Plugin - Citrinet',
      description: 'Speech-to-Text plugin for OpenVoiceOS using Citrinet models',
      url: 'https://github.com/OpenVoiceOS/ovos-stt-plugin-citrinet',
      category: 'ILENIA',
      tags: ['STT', 'Speech-to-Text'],
    },
    {
      name: 'OVOS STT Plugin - Nemo',
      description: 'Speech-to-Text plugin for OpenVoiceOS using NVIDIA Nemo models',
      url: 'https://github.com/OpenVoiceOS/ovos-stt-plugin-nemo',
      category: 'ILENIA',
      tags: ['STT', 'Speech-to-Text'],
    },
    {
      name: 'OVOS STT Plugin - MMS',
      description: 'Speech-to-Text plugin for OpenVoiceOS using Massive Multilingual Speech models',
      url: 'https://github.com/OpenVoiceOS/ovos-stt-plugin-mms',
      category: 'ILENIA',
      tags: ['STT', 'Speech-to-Text', 'Multilingual'],
    },
    {
      name: 'OVOS STT Plugin - Faster Whisper (Zuazo)',
      description: 'High-performance Whisper-based Speech-to-Text plugin for OpenVoiceOS',
      url: 'https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper-zuazo',
      category: 'ILENIA',
      tags: ['STT', 'Speech-to-Text', 'Whisper'],
    },
    {
      name: 'OVOS STT Plugin - Whisper LM',
      description: 'Language Model enhanced Whisper plugin for OpenVoiceOS',
      url: 'https://github.com/OpenVoiceOS/ovos-stt-plugin-whisper-lm',
      category: 'ILENIA',
      tags: ['STT', 'Speech-to-Text', 'Whisper'],
    },
    {
      name: 'OVOS STT Plugin - Wav2Vec2',
      description: 'Speech-to-Text plugin for OpenVoiceOS using Wav2Vec2 models',
      url: 'https://github.com/OpenVoiceOS/ovos-stt-plugin-wav2vec2',
      category: 'ILENIA',
      tags: ['STT', 'Speech-to-Text'],
    },
    {
      name: 'OVOS STT Plugin - Project AINA Remote',
      description: 'Speech-to-Text plugin for OpenVoiceOS using Project AINA remote models',
      url: 'https://github.com/OpenVoiceOS/ovos-stt-plugin-projectAINA-remote',
      category: 'ILENIA',
      tags: ['STT', 'Speech-to-Text'],
    },
    {
      name: 'OVOS TTS Plugin - NOS',
      description: 'Text-to-Speech plugin for OpenVoiceOS using NOS voices',
      url: 'https://github.com/OpenVoiceOS/ovos-tts-plugin-nos',
      category: 'ILENIA',
      tags: ['TTS', 'Text-to-Speech', 'Multilingual'],
    },
    {
      name: 'OVOS TTS Plugin - AhoTTS',
      description: 'Text-to-Speech plugin for OpenVoiceOS using AhoTTS',
      url: 'https://github.com/OpenVoiceOS/ovos-tts-plugin-ahotts',
      category: 'ILENIA',
      tags: ['TTS', 'Text-to-Speech'],
    },
    {
      name: 'OVOS TTS Plugin - Matxa Multispeaker Catalan',
      description: 'Text-to-Speech plugin for OpenVoiceOS with Catalan multispeaker support',
      url: 'https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat',
      category: 'ILENIA',
      tags: ['TTS', 'Text-to-Speech', 'Catalan'],
    },
    {
      name: 'OVOS TTS Plugin - Coqui',
      description: 'Text-to-Speech plugin for OpenVoiceOS using Coqui TTS',
      url: 'https://github.com/OpenVoiceOS/ovos-tts-plugin-coqui',
      category: 'ILENIA',
      tags: ['TTS', 'Text-to-Speech'],
    },
    {
      name: 'OVOS TTS Plugin - Cotovia Remote',
      description: 'Text-to-Speech plugin for OpenVoiceOS using Cotovia remote models',
      url: 'https://github.com/OpenVoiceOS/ovos-tts-plugin-cotovia-remote',
      category: 'ILENIA',
      tags: ['TTS', 'Text-to-Speech'],
    },
    {
      name: 'OVOS Dialog Normalizer Plugin',
      description: 'Dialog normalization plugin for OpenVoiceOS',
      url: 'https://github.com/OpenVoiceOS/ovos-dialog-normalizer-plugin',
      category: 'ILENIA',
      tags: ['Dialog', 'NLU'],
    },
    {
      name: 'OVOS Skill Diagnostics',
      description: 'Diagnostic skill for OpenVoiceOS',
      url: 'https://github.com/OpenVoiceOS/ovos-skill-diagnostics',
      category: 'ILENIA',
      tags: ['Skill', 'Diagnostics'],
    },
    {
      name: 'OVOS Skill Fuster Quotes',
      description: 'Quotes skill for OpenVoiceOS featuring Fuster quotes',
      url: 'https://github.com/OpenVoiceOS/ovos-skill-fuster-quotes',
      category: 'ILENIA',
      tags: ['Skill', 'Entertainment'],
    },
    {
      name: 'OVOS OpenData Server',
      description: 'Open data server for OpenVoiceOS projects',
      url: 'https://github.com/OpenVoiceOS/ovos-opendata-server',
      category: 'ILENIA',
      tags: ['Server', 'Data'],
    },
    {
      name: 'RaspOVOS Audio Setup',
      description: 'Audio configuration and setup utilities for Raspberry Pi + OpenVoiceOS',
      url: 'https://github.com/OpenVoiceOS/raspovos-audio-setup',
      category: 'ILENIA',
      tags: ['Audio', 'Raspberry Pi', 'Setup'],
    },
    {
      name: 'pyAhoTTS',
      description: 'Python library for AhoTTS Text-to-Speech synthesis',
      url: 'https://github.com/TigreGotico/pyAhoTTS',
      category: 'ILENIA',
      tags: ['TTS', 'Python', 'Library'],
    },
  ], []);

  const categories = ['All', 'In-House', 'OVOS-Intents', 'OVOS-Solvers', 'OVOS-Embeddings', 'OVOS-STT', 'OVOS-Translation', 'OVOS-Utils', 'ILENIA'];
  const [selectedCategory, setSelectedCategory] = useState('All');

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
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-16">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Section Header - Only show for ILENIA */}
          {selectedCategory === 'ILENIA' && (
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 tracking-tight">
                {t('projects.ilenia.headline')}
              </h2>
              <div className="w-16 h-0.5 bg-primary mx-auto mb-8"></div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                {t('projects.ilenia.introduction')}
              </p>
            </div>
          )}

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
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-transform hover:scale-105 active:scale-95"
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
