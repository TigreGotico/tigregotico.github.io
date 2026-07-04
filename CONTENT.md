# Authoring guide

All site content lives in markdown and JSON under `src/content/`. Every file is
validated against a Zod schema in `src/content.config.ts` at build time, so a
malformed entry fails `astro check` and `npm run build` with a located error.

Workflow for any change:

```bash
npm run dev      # live preview at localhost
npx astro check  # validate content + types (must report 0 errors)
npm run build    # produce the static site in dist/
```

Conventions: page copy is markdown, never embedded in components. Internal
navigation links are added in `.astro` pages (so the base path is applied), not
in markdown prose. Descriptions double as meta descriptions — keep them concise.

---

## Add a blog post

Create `src/content/blog/<YYYY-MM-DD>-<slug>.md`. The URL slug comes from the
filename. Posts are auto-discovered — no registration list.

```yaml
---
title: "Your Post Title"
description: "One or two sentences; used on the blog list and as the meta description."
date: 2025-01-31
updated: 2025-02-02        # optional
author: "Casimiro Ferreira" # optional, defaults to Casimiro Ferreira
tags:
  - "OVOS"
  - "TTS"
cover: ./my-cover.png        # optional, repo-local image (optimized via astro:assets)
coverExternal: "https://..." # optional, external cover URL (use only if no local file)
draft: false                 # true hides the post from the build
---

Markdown body. Headings, lists, code blocks, and links all render with the
site's prose styles. Reading time is computed automatically.
```

Schema fields: `title` (string), `description` (string ≤ 500), `date` (date),
`updated` (date, optional), `author` (string), `tags` (string[]),
`cover` (local image, optional), `coverExternal` (URL, optional),
`draft` (boolean).

---

## Add a project

Append an object to the array in `src/content/projects.json`.

```json
{
  "id": "my-project",
  "name": "My Project",
  "description": "What it does, in one line.",
  "url": "https://github.com/TigreGotico/my-project",
  "category": "In-House",
  "tags": ["NLP", "Tooling"],
  "imageLocal": "my-project.png",
  "featured": false
}
```

Schema fields: `id`, `name`, `description`, `url` (must be a valid URL),
`category` (string — groups the project on the Projects page), `tags` (string[]),
`featured` (boolean — `true` surfaces it on the home page and the Projects
highlights), and one optional image:

- `imageLocal` — filename of an image committed to `src/assets/projects/`. Use
  this for anything that could rot (user-attachment URLs, non-default branches).
  It is optimized via `astro:assets`.
- `image` — an external logo URL. Only use stable hosts (e.g. `*.github.io`,
  `raw` URLs on a default branch).

`category` may be a single string or an array of strings; a project appears in
every category it lists. Categories in current use include `OpenVoiceOS`,
`HiveMind`, `TTS`, `NLP`, `Portuguese`, `Media`, `Music`, `Games`, `Tools`,
`Machine Learning`, and `Wake-words` — check `src/content/projects.json` for
the full set before inventing a new one.

---

## Add a dataset or model

Both use the same shape. Append to `src/content/datasets.json` or
`src/content/models.json`.

```json
{
  "id": "my-dataset",
  "title": "My Dataset",
  "description": "What it contains and what it is for.",
  "icon": "Database",
  "url": "https://huggingface.co/collections/TigreGotico/..."
}
```

Schema fields: `id`, `title`, `description`, `icon`, `url` (valid URL).

---

## Add a notebook

Append to `src/content/notebooks.json`.

```json
{
  "id": "my-notebook",
  "title": "My Notebook",
  "description": "What the notebook demonstrates.",
  "url": "/notebooks/my-notebook.ipynb",
  "language": "python",
  "tags": ["NLP", "ONNX"],
  "year": 2025
}
```

`url` may be an external URL or a path to a file in `public/` (a leading slash is
optional — the base path is applied for you). Schema fields: `id`, `title`,
`description`, `url`, `language` (default `python`), `tags` (string[]),
`year` (number).

---

## Add a research item

Append to `src/content/research.json`. Place the file under `public/research/`.

```json
{
  "id": "my-paper",
  "title": "My Whitepaper",
  "description": "Abstract in a sentence or two.",
  "filePath": "research/my-paper.pdf",
  "fileType": "pdf",
  "buttonLabel": "Download Whitepaper",
  "year": 2025,
  "authors": ["Casimiro Ferreira"],
  "tags": ["TTS"]
}
```

Schema fields: `id`, `title`, `description`, `filePath` (path under `public/`),
`fileType` (default `pdf`), `buttonLabel` (default `Download`), `year`,
`authors` (string[]), `tags` (string[]).

---

## Add a collaboration

Append to `src/content/collaborations.json`.

```json
{
  "id": "my-collab",
  "name": "Collaboration Name",
  "description": "What the collaboration is about.",
  "url": "https://example.org",
  "repositories": ["https://github.com/Org/repo"]
}
```

Schema fields: `id`, `name`, `description`, `url` (valid URL),
`repositories` (array of URLs).

---

## Edit a prose page

Page copy lives in `src/content/pages/*.md` (`home`, `about`, `services`,
`games`, `contact`, `privacy`). Edit the markdown body to change a page's
text; edit the front-matter `description` to change its meta description.

```yaml
---
title: "Page Title"
description: "Meta description (≤ 300 chars)."
order: 0
---

Markdown body.
```

Schema fields: `title`, `description` (string ≤ 300), `order` (number).

To add or reorder navigation, edit `nav` in `src/data/site.ts`. Site-wide values
(name, email, social links, default OG image) also live there.
