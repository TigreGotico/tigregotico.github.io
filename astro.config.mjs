// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

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

// `base` is set for the project-repo deployment (served under
// /tigregotico-website/). When the repo is renamed to
// `tigregotico.github.io` at launch, change `base` to '/'.
export default defineConfig({
  site: 'https://tigregotico.github.io',
  base: '/tigregotico-website/',
  trailingSlash: 'ignore',
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  integrations: [tailwind(), mdx(), sitemap()],
});
