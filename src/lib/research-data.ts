export interface ResearchPaper {
  id: string;
  title: string;
  description: string;
  filePath: string;
  date?: string;
  authors?: string[];
  tags?: string[];
}

export const researchPapers: ResearchPaper[] = [
  {
    id: "hybrid-synthetic-tts",
    title: "Hybrid Synthetic TTS Dataset",
    description: "A whitepaper detailing our methodology for creating high-quality synthetic TTS datasets using hybrid approaches.",
    filePath: "/whitepaper_hybrid_synthetic_tts_dataset.pdf",
    date: "2025",
    authors: ["Casimiro Ferreira"],
    tags: ["TTS", "Synthetic Data", "Speech Synthesis"]
  }
];
