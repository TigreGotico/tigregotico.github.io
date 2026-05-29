# tigregotico.github.io — greenfield rebuild plan (agent-executable)

A clean-room rebuild where **all content lives in markdown + JSON**, the site is
**statically generated** (real HTML per route), and it deploys to **GitHub Pages**.
Written as ordered milestones a coding agent can execute, each with explicit files,
content contracts, and acceptance gates.

## Why this shape (decisions, fixed)

- **Astro 5** (SSG). Zero JS by default → static HTML per route → solves the
  CSR-SPA SEO failure of the old site. Islands only where interactivity is real.
- **Content Layer + Zod schemas** for every collection. Markdown front-matter and
  JSON are validated at build → an agent gets a precise, located error on bad
  content. This is the single most important property for "agent-maintainable".
- **Prose as markdown, not TSX.** Page copy (home/about/services/…) lives in
  markdown collections so content edits never touch components. The old site
  buried copy in `.tsx`; never again.
- **Tailwind**, hand-built ~10 primitives (no 51-file shadcn dump). Brand fonts
  + dark mode + `prefers-reduced-motion` respected from line one.
- **Deploy via GitHub Actions** (`withastro/action` → `actions/deploy-pages`),
  branch-agnostic. Keeps the org convention: work on `dev`, release to `master`,
  Pages workflow triggers on push to `master`. `base: '/'` (org root site).
- **Migrate, don't reinvent content.** The 9 blog posts are already markdown; the
  7 JSON files have real data — reshape to schemas and fill portfolio gaps
  (mediavocab, LILACS).

Alternatives considered and rejected: Next static-export (heavier, React-only),
Eleventy/Hugo (no typed data, template magic hurts agent DX), keeping the SPA.

## Assumptions (correct me if wrong)

1. New build **in this repo** (replace the SPA); old tree preserved in git history.
2. Reuse existing content (blog md + JSON), refreshed to schema.
3. Keep brand identity (Inter / Playfair / Cinzel, dark theme, privacy-first voice),
   rebuild the design cleanly. EN first; PT i18n is a later, optional milestone.

---

## Repository layout (target)

```
/
├─ astro.config.mjs            # site URL, base '/', integrations
├─ tsconfig.json               # strict
├─ package.json                # name: tigregotico-website
├─ .nvmrc                      # pinned Node LTS
├─ CONTENT.md                  # the authoring guide (agent + human contract)
├─ src/
│  ├─ content.config.ts        # ★ Zod schemas — the content contract
│  ├─ content/
│  │  ├─ blog/*.md             # posts (front-matter validated)
│  │  ├─ pages/*.md            # home, about, services, products prose
│  │  ├─ datasets/*.json       # or one collection file; see schema
│  │  ├─ models/*.json
│  │  ├─ notebooks/*.json
│  │  ├─ research/*.json
│  │  ├─ projects/*.json
│  │  ├─ collaborations/*.json
│  │  └─ featured/*.json
│  ├─ data/site.json           # nav, footer, socials, SEO defaults
│  ├─ layouts/Base.astro       # <head>, SEO, skip-link, theme
│  ├─ components/              # Seo.astro, Nav, Footer, Card, ThemeToggle…
│  │  └─ islands/              # only interactive bits (filter, carousel, toggle)
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ about.astro  services.astro  products.astro
│  │  ├─ projects.astro  resources.astro  contact.astro
│  │  ├─ blog/index.astro  blog/[...slug].astro
│  │  ├─ rss.xml.ts          # @astrojs/rss
│  │  └─ 404.astro
│  └─ styles/global.css
├─ public/                      # static assets, og images, favicon, llms.txt
└─ .github/workflows/deploy.yml
```

---

## Content contracts (the heart of it) — `src/content.config.ts`

Every collection gets a Zod schema. Agents/humans edit files; the build enforces
shape. Sketch:

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().max(160),       // also the meta description
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    cover: image().optional(),              // astro:assets → optimized
    draft: z.boolean().default(false),
  }),
});

const resource = z.object({                 // datasets + models share this
  id: z.string(), title: z.string(), description: z.string(),
  icon: z.string(), url: z.string().url(),
});
const datasets = defineCollection({ loader: file('src/content/datasets.json'), schema: resource });
const models   = defineCollection({ loader: file('src/content/models.json'),   schema: resource });

const projects = defineCollection({
  loader: file('src/content/projects.json'),
  schema: z.object({
    name: z.string(), description: z.string(), url: z.string().url(),
    category: z.string(), tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),   // ← "featured" is a flag, not a 2nd file
  }),
});
// notebooks, research, collaborations, pages → same pattern.
```

Key schema decisions that fix old pain:
- **`featured` becomes a boolean on `projects`** — kills the featured-vs-projects
  duplication; the homepage queries `featured === true`.
- **`description` is `.max(160)`** so it doubles as the meta description.
- **Images via `image()` / `astro:assets`** → optimized, and external rot
  (the old `user-attachments` CDN links) is replaced by committed assets.
- **No hidden-post class of bug possible**: posts are auto-discovered by `glob`;
  `draft: true` is the only way to hide one, and it's explicit.

---

## Milestones (each = one draft PR off `dev`)

### M0 — Scaffold & deploy a blank page — **S**
- `npm create astro@latest` (minimal, TS strict). Add `@astrojs/sitemap`,
  `@astrojs/rss`, `@astrojs/mdx`, Tailwind via `@astrojs/tailwind`.
- `astro.config.mjs`: `site: 'https://tigregotico.github.io'`, `base: '/'`.
- `.github/workflows/deploy.yml`: build with `withastro/action`, deploy with
  `actions/deploy-pages`, trigger on push to `master`; pin Node via `.nvmrc`.
- **Accept:** a placeholder index deploys to Pages green; `astro check` passes.

### M1 — Content schemas + migrate data — **M**
- Author `src/content.config.ts` with all collection schemas above.
- Port the 7 JSON files into the schema shape; **add mediavocab + LILACS** to
  `projects.json`; set real `notebooks` dates; mark featured via the flag.
- Move the 9 blog markdown files into `src/content/blog/`, normalize front-matter
  to the schema (no registration array — `glob` discovers them).
- **Accept:** `astro check` validates every content file; a deliberately broken
  field fails the build with a located error.

### M2 — Layout, SEO, a11y foundation — **M**
- `Base.astro`: correct `<html lang>`, skip-to-content link, theme class, and a
  `<Seo>` component that emits per-page `<title>`, description, canonical,
  OpenGraph + Twitter card with **per-page `og:image`**, and JSON-LD
  (`Organization` site-wide, `BlogPosting` per post).
- `@astrojs/sitemap` + `rss.xml.ts` wired; `public/llms.txt`, `robots.txt`.
- Tailwind theme tokens; dark mode; **all motion gated on
  `prefers-reduced-motion`**.
- **Accept:** built `dist/blog/<slug>.html` contains post text *without JS*;
  social-card debugger reads per-page OG; Rich Results test passes.

### M3 — Core pages from markdown — **M**
- Build `index`, `about`, `services`, `products`, `resources`, `contact` reading
  prose from `src/content/pages/*.md` and data from collections.
- Rewrite copy to the real positioning (privacy-first voice AI / OVOS / HiveMind /
  mediavocab) — no "consulting/digital-transformation" boilerplate.
- Resolve IA: Products = offerings, Services = engagements, Projects = portfolio.
- **Accept:** every page renders statically; `grep` finds no placeholder copy;
  each page has unique title/description.

### M4 — Blog — **M**
- `blog/index.astro` (list, tag filter) + `blog/[...slug].astro` via
  `getStaticPaths`; MDX support; syntax highlighting (Shiki, build-time);
  reading-time; prev/next. `draft:true` excluded from prod.
- **Accept:** all 9 posts render with correct per-post meta; RSS lists them.

### M5 — Projects & resources interactivity (islands) — **M**
- Optional GitHub-topics live fetch at **build time** (not client) → no rate-limit
  fallback needed; static JSON is the source of truth, GitHub data is enrichment.
- One small island for client-side tag filtering / carousel, `client:visible`.
- **Accept:** projects page is static HTML, filter works, zero JS on pages that
  don't need it.

### M6 — Design & motion polish — **S/M**
- Brand fonts with `font-display: swap`; hero treatment (CSS gradient or a single
  bounded, reduced-motion-aware island — no full-screen always-on WebGL).
- Lighthouse budget: Perf ≥ 95, A11y ≥ 95, SEO 100, BP ≥ 95.
- **Accept:** Lighthouse CI meets budget on the built site.

### M7 — Quality gates & docs — **S**
- CI: `astro check` (type + content validation) + `eslint` + `build` +
  Lighthouse-CI as **required gates before deploy**.
- `CONTENT.md`: how to add a post / dataset / project / page, with the schema for
  each — the agent+human authoring contract.
- **Accept:** a schema violation or type error **fails CI**; CONTENT.md round-trips
  (follow it blind to add a post → it appears).

### M8 — (Optional) PT i18n + admin parity — **M/L**
- Astro i18n routing (`/`, `/pt/…`); translated markdown variants.
- Decide admin: with schemas + CONTENT.md an agent edits files directly, so the
  NiceGUI editor may be unnecessary; if kept, point it at the new paths and add
  filename sanitization.
- **Accept:** PT routes build and validate; nav language switch works.

---

## What makes this agent-friendly (the throughline)

- **Self-validating content** → the agent's edits are checked by `astro check`;
  errors are located and deterministic. No silent runtime breakage.
- **One contract file** (`content.config.ts`) + **one guide** (`CONTENT.md`) tell
  the agent exactly what every file must contain.
- **Auto-discovery** (glob) removes registration-array footguns.
- **Static output** removes the entire class of "is it rendered for crawlers" doubt.
- **Required CI gates** mean an agent can't merge a build that fails validation.
- **Atomic milestones**, each a draft PR with a binary acceptance check.

## Conventions
- New repo work on `dev`; release PR → `master`; Pages deploys from `master`.
- Open PRs as **draft** (CodeRabbit only on user mark-ready).
- Commit identity `JarbasAi <jarbasai@mailfence.com>`; conventional commits
  (auto-versioning); no version-file edits; no meta-commentary in copy/commits.
- Wire CI to `gh-automations` reusable workflows where they fit (`@dev`).
```
```
