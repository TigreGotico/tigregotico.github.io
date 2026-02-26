// ─── GitHub-driven project loader ────────────────────────────────────────────
// Scans repos from configured GitHub orgs/users.
// If a repo has any topic from TOPIC_CATEGORY_MAP → it's included.
// First matching topic decides the category. That's it.
// ─────────────────────────────────────────────────────────────────────────────

export interface GitHubSource {
  owner: string;
  type: 'user' | 'org';
  defaultCategory: string;
}

export interface GitHubProject {
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  stars: number;
  language: string | null;
  updatedAt: string;
}

// ── Configuration ────────────────────────────────────────────────────────────

export const GITHUB_SOURCES: GitHubSource[] = [
  { owner: 'TigreGotico', type: 'user', defaultCategory: 'In-House' },
  { owner: 'OpenVoiceOS', type: 'org',  defaultCategory: 'OVOS-Utils' },
];

/**
 * topic → category.  One key per line.
 * A repo with at least one of these topics gets listed.
 * First match (iteration order) wins the category.
 */


export const TOPIC_CATEGORY_MAP: Record<string, string> = {
  'in-house':                'In-House',
  'ovos-intent':             'OVOS-Intents',
  'ovos-solver':             'OVOS-Solvers',
  'ovos-embeddings':         'OVOS-Embeddings',
  'ovos-stt':                'OVOS-STT',
  'ovos-translation':        'OVOS-Translation',
  'ovos-tts':                'OVOS-Utils',
  'ilenia':                  'ILENIA',
};


const CACHE_KEY  = 'gh-projects-v2';
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
 * Determine the category for a repo:
 * 1. Check topics against TOPIC_CATEGORY_MAP — first match wins.
 * 2. Fall back to the source's defaultCategory.
 */
function resolveCategory(topics: string[], defaultCategory: string): string {
  for (const topic of topics) {
    if (topic in TOPIC_CATEGORY_MAP) {
      return TOPIC_CATEGORY_MAP[topic];
    }
  }
  return defaultCategory;
}

/** Check if a topic is in the map. */
function isValidTag(topic: string): boolean {
  return topic in TOPIC_CATEGORY_MAP;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch projects from GitHub, filtered by TOPIC_CATEGORY_MAP keys.
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
      const matched = topics.filter(isValidTag);

      // Must have at least one valid tag
      if (matched.length === 0) continue;

      projects.push({
        name: repo.name,
        description: repo.description ?? '',
        url: repo.html_url,
        category: resolveCategory(topics, source.defaultCategory),
        tags: matched,
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
  return data.map((p) => ({
    name: p.name,
    description: p.description ?? '',
    url: p.url,
    category: p.category ?? 'Uncategorised',
    tags: p.tags ?? [],
    stars: 0,
    language: null,
    updatedAt: '',
  }));
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
