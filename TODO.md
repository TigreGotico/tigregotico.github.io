# tigregotico-website — Backlog

## Content gaps

- No README.md — should be created from CONTENT.md or a subset
- Blog posts: only seeded, many more repos not yet covered
- Projects/datasets/models JSON files need gap analysis against actual GitHub repos
- PT i18n is planned but not implemented (CONTENT.md milestone M8)

## Infrastructure

- CI only checks Astro types + build — no ESLint, no Lighthouse CI, no visual regression
- No unit tests or e2e tests
- No `.env.example` or documentation of env variables (currently none needed)
- No automated content update workflow (e.g. sync from GitHub repos)

## Design / UX

- Mobile nav toggle and palette selector could use better accessible labels
- No print stylesheet
- No 404 page content beyond minimal Astro default

## Deployment

- Weekly scheduled rebuild (for date-scheduled blog posts) is configured but no posts use `date` in the future yet
- When migrating to `tigregotico.github.io` root, need to: change `base` to `/`, update SEO URLs, redirect old paths
