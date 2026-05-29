// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// `base` is set for the project-repo deployment (served under
// /tigregotico-website/). When the repo is renamed to
// `tigregotico.github.io` at launch, change `base` to '/'.
export default defineConfig({
  site: 'https://tigregotico.github.io',
  base: '/tigregotico-website/',
  trailingSlash: 'ignore',
  integrations: [tailwind(), mdx(), sitemap()],
});
