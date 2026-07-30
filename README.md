# tigregotico-website

The [TigreGótico](https://tigregotico.github.io/tigregotico-website/) company
website. It is a static Astro 5 site with zero client-side JavaScript on
regular pages, self-hosted fonts, and no third-party requests.

## Stack

- **[Astro 5](https://astro.build)** static output, content collections with
  Zod-validated schemas (`src/content.config.ts`)
- **Tailwind CSS** with CSS custom properties powering four color palettes
  (tiger, hivemind, noir, slop) and dark mode
- **[phoonnx.js](https://github.com/TigreGotico/phoonnx.js)** +
  `onnxruntime-web` for the in-browser text-to-speech demo (`/demo` is the
  only page that ships JS)

## Develop

```sh
npm install
npm run dev      # local dev server
npm run check    # astro type check
npm run build    # static build into dist/
```

## Content

All copy and data live in `src/content/`: markdown for blog posts and prose
pages, JSON for projects, datasets, models, and testimonials. **See
[CONTENT.md](CONTENT.md)** for schemas and how to add each kind of entry.
Internal links in markdown are written root-relative (`/blog/...`) and get the
deployment base path prefixed at build time.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds the site and deploys
it to GitHub Pages on push to `dev` or `master`. A weekly rebuild also runs
so date-scheduled blog posts publish on time. The site is served under
`/tigregotico-website/`. The `BASE` constant in `astro.config.mjs` documents
the plan to move the site to the domain root.

## License

Apache-2.0
