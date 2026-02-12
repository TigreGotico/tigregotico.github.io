// Generic data loader with caching
const cache = new Map<string, any>();

export async function loadData<T>(path: string): Promise<T[]> {
  if (cache.has(path)) {
    return cache.get(path);
  }

  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  
  const data = await response.json();
  cache.set(path, data);
  return data;
}

// Type definitions
export interface ResearchPaper {
  id: string;
  title: string;
  description: string;
  filePath: string;
  fileType?: 'pdf' | 'md' | 'txt';
  buttonLabel?: string;
  date?: string;
  authors?: string[];
  tags?: string[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
}

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

export type Dataset = Resource;
export type Model = Resource;
