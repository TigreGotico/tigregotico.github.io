# tigregotico.github.io — Agent Onboarding

Company website for TigreGótico Lda. Astro 5 SSG with Tailwind CSS, deployed to GitHub Pages. Content-driven: markdown + JSON validated against Zod schemas at build time.

## Quick start

```bash
npm install
npm run dev       # local dev at localhost:4321 (or astro port)
npx astro check   # type + content validation (must pass 0 errors)
npm run build     # static site → dist/
npm run preview   # preview the built site
```

## Test / lint / typecheck

- `npx astro check` — validates TypeScript + all content collections against Zod schemas.
- `npm run build` — fails if any content file violates its schema.
- No unit or e2e tests exist yet.
- No ESLint/Prettier config (Astro check covers the baseline).

## Layout

```
├── astro.config.mjs          # site/base config, remark plugins, integrations
├── CONTENT.md                # authoring guide for content editors (agents + humans)
├── src/
│   ├── content.config.ts     # ★ Zod schemas for every collection
│   ├── content/              # markdown (blog, pages) + JSON (projects, datasets…)
│   ├── components/           # .astro components (Hero, Seo, ThemeToggle…)
│   ├── layouts/Base.astro    # single layout: head, nav, footer, theme
│   ├── pages/                # route pages (index, about, blog/*, projects…)
│   ├── data/site.ts          # nav, socials, SEO defaults
│   ├── lib/                  # utility modules (projectImages.ts)
│   ├── assets/               # project cover images (optimized via astro:assets)
│   └── styles/global.css     # Tailwind + design system (themes, prose, animations)
├── public/                   # static files (favicon, llms.txt, research PDFs)
└── .github/workflows/
    ├── ci.yml                # PR check: astro check + build
    └── deploy.yml            # push to master/dev → GitHub Pages
```

## Conventions

- **Branch model:** work on `dev`, release PR to `master`. Pages deploys from both (dev = staging, master = prod).
- **Content:** all page copy in `src/content/` — never embed prose in components. Blog posts via markdown files, data via JSON.
- **Styling:** Tailwind utility classes + CSS custom properties for theming (4 color palettes: tiger, hivemind, noir, slop). Dark mode via `.dark` class.
- **Images:** use `image()` from `astro:assets` for local images (optimized); `coverExternal` string URL as fallback.
- **No README.md exists** — CONTENT.md serves as the content authoring contract.
- **Node 20** (`.nvmrc`). Commit identity: `JarbasAi <jarbasai@mailfence.com>`.

## Gotchas

- `base: '/'` in `astro.config.mjs` — the site is served at the org root (`tigregotico.github.io`).
- `featured` is a boolean flag on projects, not a separate collection. Homepage queries `featured === true`.
- Draft posts: set `draft: true` in frontmatter to exclude from production.
- `astro check` requires valid content; a deliberate schema violation fails the build with a located error.
- Nav links computed via `navLink()` helper to apply base path correctly.
