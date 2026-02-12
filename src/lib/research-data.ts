export interface ResearchPaper {
  id: string;
  title: string;
  description: string;
  filePath: string;
  fileType?: 'pdf' | 'md' | 'txt'; // Optional, will be auto-detected if not provided
  buttonLabel?: string; // Optional, custom download button text
  date?: string;
  authors?: string[];
  tags?: string[];
}

let cachedResearchPapers: ResearchPaper[] | null = null;

export async function getResearchPapers(): Promise<ResearchPaper[]> {
  if (cachedResearchPapers) {
    return cachedResearchPapers;
  }

  const response = await fetch('/research/research-data.json');
  if (!response.ok) {
    throw new Error('Failed to load research data');
  }
  
  const data: ResearchPaper[] = await response.json();
  cachedResearchPapers = data;
  return data;
}

// For backward compatibility, export empty array (components should use getResearchPapers())
export const researchPapers: ResearchPaper[] = [];
