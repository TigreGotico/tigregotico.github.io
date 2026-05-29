// Build-time GitHub star fetcher.
//
// Resolves `stargazers_count` for projects whose `url` points at a concrete
// `owner/repo`. Org-only URLs (e.g. https://github.com/OpenVoiceOS) and entries
// without a URL are skipped. Results are memoized per `owner/repo` so multiple
// pages share the same fetches within a single build.
//
// This must never break the build: every fetch is guarded, and any failure
// (non-ok response, rate limit, network error) simply omits that id from the
// result. Pages render with no star metric in that case.

interface RepoLike {
  id: string;
  url?: string;
}

const REPO_URL = /github\.com\/([^/]+)\/([^/?#]+)/i;

// Memoized per owner/repo for the lifetime of the build process.
const starCache = new Map<string, number | null>();

function parseRepo(url?: string): string | null {
  if (!url) return null;
  const m = REPO_URL.exec(url);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/i, '');
  if (!owner || !repo) return null;
  return `${owner}/${repo}`;
}

function token(): string | undefined {
  return process.env.GITHUB_TOKEN ?? import.meta.env.GITHUB_TOKEN;
}

async function fetchStars(slug: string): Promise<number | null> {
  if (starCache.has(slug)) return starCache.get(slug)!;

  let result: number | null = null;
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tigregotico-website',
    };
    const tok = token();
    if (tok) headers.Authorization = `Bearer ${tok}`;

    const res = await fetch(`https://api.github.com/repos/${slug}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.stargazers_count === 'number') {
        result = data.stargazers_count;
      }
    }
  } catch {
    // Swallow: degrade gracefully to "no stars".
    result = null;
  }

  starCache.set(slug, result);
  return result;
}

/**
 * Resolve star counts for the given items, keyed by item id.
 * Only ids whose fetch succeeded with a numeric count are present.
 */
export async function loadStars(
  items: RepoLike[]
): Promise<Record<string, number>> {
  const out: Record<string, number> = {};

  await Promise.all(
    items.map(async (item) => {
      const slug = parseRepo(item.url);
      if (!slug) return;
      try {
        const stars = await fetchStars(slug);
        if (typeof stars === 'number') out[item.id] = stars;
      } catch {
        // Never throw out of the loop.
      }
    })
  );

  return out;
}
