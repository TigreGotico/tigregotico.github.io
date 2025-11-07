export interface Project {
  name: string;
  description: string;
  url: string;
  category: string;
  tags?: string[];
}

export interface Collaboration {
  name: string;
  description: string;
  url: string;
  repositories: string[];
}

export const projectsList: Project[] = [
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
];

export const collaborationsList: Collaboration[] = [
  {
    name: 'ILENIA',
    description: 'International collaboration for multilingual speech technology and voice interfaces. ILENIA unites researchers and developers to create sophisticated speech-based solutions across multiple languages and platforms.',
    url: 'https://ilenia.ai',
    repositories: [
      'https://github.com/OpenVoiceOS/ovos-stt-plugin-nos',
      'https://github.com/OpenVoiceOS/ovos-stt-plugin-HiTZ',
      'https://github.com/OpenVoiceOS/ovos-stt-plugin-citrinet',
      'https://github.com/OpenVoiceOS/ovos-stt-plugin-nemo',
      'https://github.com/OpenVoiceOS/ovos-stt-plugin-mms',
      'https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper-zuazo',
      'https://github.com/OpenVoiceOS/ovos-stt-plugin-whisper-lm',
      'https://github.com/OpenVoiceOS/ovos-stt-plugin-wav2vec2',
      'https://github.com/OpenVoiceOS/ovos-stt-plugin-projectAINA-remote',
      'https://github.com/OpenVoiceOS/ovos-tts-plugin-nos',
      'https://github.com/OpenVoiceOS/ovos-tts-plugin-ahotts',
      'https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat',
      'https://github.com/OpenVoiceOS/ovos-tts-plugin-coqui',
      'https://github.com/OpenVoiceOS/ovos-tts-plugin-cotovia-remote',
      'https://github.com/OpenVoiceOS/ovos-dialog-normalizer-plugin',
      'https://github.com/OpenVoiceOS/ovos-skill-diagnostics',
      'https://github.com/OpenVoiceOS/ovos-skill-fuster-quotes',
      'https://github.com/OpenVoiceOS/ovos-opendata-server',
      'https://github.com/OpenVoiceOS/raspovos-audio-setup',
      'https://github.com/TigreGotico/pyAhoTTS',
    ],
  },
];
