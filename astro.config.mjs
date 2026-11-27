// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// `BASE` is '/' because this repo is the org root site
// (tigregotico.pt), served from the domain root.
const BASE = '/';

// Compute a word count per markdown doc, exposed via remarkPluginFrontmatter.
function remarkReadingTime() {
  return function (/** @type {any} */ tree, /** @type {any} */ file) {
    let text = '';
    /** @param {any} node */
    const visit = (node) => {
      if (node.value) text += node.value + ' ';
      if (node.children) node.children.forEach(visit);
    };
    visit(tree);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    file.data.astro.frontmatter.words = words;
  };
}

// Rewrite root-relative markdown links/images (e.g. `/blog/foo`) to include
// the configured base, so content authored with clean absolute paths works
// under the project-page deployment and keeps working after a move to root.
function remarkBaseLinks() {
  const base = BASE.replace(/\/$/, '');
  return function (/** @type {any} */ tree) {
    /** @param {any} node */
    const visit = (node) => {
      if (
        (node.type === 'link' || node.type === 'image' || node.type === 'definition') &&
        typeof node.url === 'string' &&
        node.url.startsWith('/') &&
        !node.url.startsWith('//') &&
        base &&
        !node.url.startsWith(base + '/')
      ) {
        node.url = base + node.url;
      }
      if (node.children) node.children.forEach(visit);
    };
    visit(tree);
  };
}

export default defineConfig({
  site: 'https://tigregotico.pt',
  base: BASE,
  trailingSlash: 'ignore',
  redirects: {
    '/games': '/projects',
    '/pt/games': '/pt/projects',
    '/es/games': '/es/projects',
    '/de/games': '/de/projects',
    '/nl/games': '/nl/projects',
    '/fr/games': '/fr/projects',
    '/it/games': '/it/projects',
    '/ru/games': '/ru/projects',
    '/ar/games': '/ar/projects',
    '/fa/games': '/fa/projects',
    '/hi/games': '/hi/projects',
    '/zh/games': '/zh/projects',
    '/ko/games': '/ko/projects',
    '/ja/games': '/ja/projects',
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkReadingTime, remarkBaseLinks],
    }),
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
