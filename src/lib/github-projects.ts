// ─── GitHub-driven project loader ────────────────────────────────────────────
// Scans repos from configured GitHub orgs/users.
// If a repo has any topic from TOPIC_TO_TAG → it's included.
// All matched topics become tags on the project.
// ─────────────────────────────────────────────────────────────────────────────

export interface GitHubSource {
  owner: string;
  type: 'user' | 'org';
}

export interface GitHubProject {
  name: string;
  description: string;
  url: string;
  category: string;          // kept for compat — first ecosystem tag
  tags: string[];             // normalised display tags
  stars: number;
  language: string | null;
  updatedAt: string;
}

// ── Configuration ────────────────────────────────────────────────────────────

export const GITHUB_SOURCES: GitHubSource[] = [
  { owner: 'TigreGotico', type: 'user' },
  { owner: 'OpenVoiceOS', type: 'org' },
];

/**
 * GitHub topic → display tag name.
 * A repo with at least one of these topics gets listed.
 */
export const TOPIC_TO_TAG: Record<string, string> = {
  // Ecosystem
  openvoiceos:      'OpenVoiceOS',
  hivemind:         'HiveMind',
  ilenia:           'ILENIA',
  tigregotico:      'TigreGotico',
  'in-house':       'TigreGotico',
  // Function
  'ovos-plugin':    'Plugin',
  library:          'Library',
  'ovos-skill':     'Skill',
  framework:        'Framework',
  dataset:          'Dataset',
  tool:             'Tool',
  server:           'Server',
  // Domain
  'ovos-stt':       'Speech-to-Text',
  'ovos-tts':       'Text-to-Speech',
  nlp:              'NLP',
  'ovos-translation': 'Translation',
  phonetics:        'Phonetics',
  'ovos-embeddings': 'Embeddings',
  llm:              'LLM',
  'ovos-intent':    'Intent',
  audio:            'Audio',
  'ovos-solver':    'Solver',
  reranking:        'Reranking',
  dialog:           'Dialog',
  // Technology
  onnx:             'ONNX',
  gguf:             'GGUF',
  whisper:          'Whisper',
  chromadb:         'ChromaDB',
  qdrant:           'Qdrant',
  docker:           'Docker',
  markov:           'Markov',
  // Platform
  'raspberry-pi':   'Raspberry Pi',
  linux:            'Linux',
  macos:            'macOS',
  termux:           'Termux',
};

/** Tag groups for UI filtering. */
export const TAG_GROUPS: Record<string, string[]> = {
  Ecosystem:  ['OpenVoiceOS', 'HiveMind', 'ILENIA', 'TigreGotico'],
  Function:   ['Plugin', 'Library', 'Skill', 'Framework', 'Dataset', 'Tool', 'Server'],
  Domain:     ['Speech-to-Text', 'Text-to-Speech', 'NLP', 'Translation', 'Phonetics', 'Embeddings', 'LLM', 'Intent', 'Audio', 'Solver', 'Reranking', 'Dialog'],
  Technology: ['ONNX', 'GGUF', 'Whisper', 'ChromaDB', 'Qdrant', 'Docker', 'Markov'],
  Platform:   ['Raspberry Pi', 'Linux', 'macOS', 'Termux'],
};


const ECOSYSTEM_TAGS = new Set(TAG_GROUPS.Ecosystem);

const CACHE_KEY  = 'gh-projects-v3';
const CACHE_TTL  = 1000 * 60 * 30; // 30 minutes

interface CacheEntry {
  data: GitHubProject[];
  timestamp: number;
}

function getCached(): GitHubProject[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(data: GitHubProject[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() } satisfies CacheEntry));
  } catch {
    // localStorage unavailable or full — silently ignore
  }
}

/** Remove cached data so the next call hits the API. */
export function clearProjectsCache() {
  localStorage.removeItem(CACHE_KEY);
}

// ── GitHub API helpers ───────────────────────────────────────────────────────

async function fetchAllRepos(source: GitHubSource): Promise<any[]> {
  const all: any[] = [];
  let page = 1;
  const base =
    source.type === 'org'
      ? `https://api.github.com/orgs/${source.owner}/repos`
      : `https://api.github.com/users/${source.owner}/repos`;

  while (true) {
    const res = await fetch(`${base}?per_page=100&page=${page}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${res.statusText} (${source.owner} page ${page})`);
    }
    const repos: any[] = await res.json();
    if (!Array.isArray(repos) || repos.length === 0) break;
    all.push(...repos);
    if (repos.length < 100) break; // last page
    page++;
  }
  return all;
}

/**
 * Map all known topics to their display tags.
 * Return unique set.
 */
function resolveTagsFromTopics(topics: string[]): string[] {
  const tags = new Set<string>();
  for (const t of topics) {
    const tag = TOPIC_TO_TAG[t];
    if (tag) tags.add(tag);
  }
  return Array.from(tags);
}

/** Pick a "category" from the resolved tags — first ecosystem tag, else first tag. */
function pickCategory(tags: string[]): string {
  const eco = tags.find(t => ECOSYSTEM_TAGS.has(t));
  return eco ?? tags[0] ?? 'Uncategorised';
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch projects from GitHub, filtered by TOPIC_TO_TAG keys.
 * Results are cached in localStorage for CACHE_TTL.
 */
export async function fetchGitHubProjects(): Promise<GitHubProject[]> {
  const cached = getCached();
  if (cached) return cached;

  const projects: GitHubProject[] = [];

  // Fetch all sources in parallel
  const results = await Promise.all(
    GITHUB_SOURCES.map(async (source) => {
      const repos = await fetchAllRepos(source);
      return { source, repos };
    }),
  );

  for (const { source, repos } of results) {
    for (const repo of repos) {
      // Skip forks and archived repos
      if (repo.fork || repo.archived || repo.disabled) continue;

      const topics: string[] = (repo.topics ?? []).map((t: string) => t.toLowerCase());
      const tags = resolveTagsFromTopics(topics);

      // Must have at least one recognised tag
      if (tags.length === 0) continue;

      projects.push({
        name: repo.name,
        description: repo.description ?? '',
        url: repo.html_url,
        category: pickCategory(tags),
        tags,
        stars: repo.stargazers_count ?? 0,
        language: repo.language ?? null,
        updatedAt: repo.updated_at ?? '',
      });
    }
  }

  // Sort: most stars first, then alphabetically
  projects.sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));

  setCache(projects);
  return projects;
}

/**
 * Fallback: load the old hand-maintained JSON.
 * Shapes the data to match GitHubProject so callers don't care about the source.
 */
export async function fetchStaticProjects(): Promise<GitHubProject[]> {
  const res = await fetch('/projects/projects.json');
  if (!res.ok) return [];
  const data: any[] = await res.json();
  return data.map((p) => {
    const tags: string[] = p.tags ?? [];
    return {
      name: p.name,
      description: p.description ?? '',
      url: p.url,
      category: pickCategory(tags) || p.category || 'Uncategorised',
      tags,
      stars: 0,
      language: null,
      updatedAt: '',
    };
  });
}

/**
 * Main entry point. Tries the GitHub API; on failure falls back to static JSON.
 */
export async function loadProjects(): Promise<GitHubProject[]> {
  try {
    return await fetchGitHubProjects();
  } catch (err) {
    console.warn('[github-projects] API fetch failed, using static fallback:', err);
    return await fetchStaticProjects();
  }
}
