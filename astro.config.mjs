// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// `BASE` is set for the project-repo deployment (served under
// /tigregotico-website/). When the repo is renamed to
// `tigregotico.github.io` at launch, change it to '/'.
const BASE = '/tigregotico-website/';

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
  site: 'https://tigregotico.github.io',
  base: BASE,
  trailingSlash: 'ignore',
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkBaseLinks],
  },
  integrations: [tailwind(), mdx(), sitemap()],
});
