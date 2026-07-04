import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Blog posts: markdown, auto-discovered via glob (no registration array).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(500),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      author: z.string().default('Casimiro Ferreira'),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverExternal: z.string().url().optional(),
      draft: z.boolean().default(false),
      // 'en' at the root, 'pt' for translations under src/content/blog/pt/.
      lang: z.enum(['en', 'pt', 'es', 'de', 'nl', 'fr', 'it', 'ru']).default('en'),
    }),
});

// Prose pages: markdown, one file per route (home, about, services, ...).
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(300),
    order: z.number().default(0),
  }),
});

// Datasets + models share this resource shape.
const resource = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  url: z.string().url(),
});

const datasets = defineCollection({
  loader: file('src/content/datasets.json'),
  schema: resource,
});

const models = defineCollection({
  loader: file('src/content/models.json'),
  schema: resource,
});

const notebooks = defineCollection({
  loader: file('src/content/notebooks.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    url: z.string(),
    language: z.string().default('python'),
    tags: z.array(z.string()).default([]),
    year: z.number(),
  }),
});

const research = defineCollection({
  loader: file('src/content/research.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    filePath: z.string(),
    fileType: z.string().default('pdf'),
    buttonLabel: z.string().default('Download'),
    year: z.number(),
    authors: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: file('src/content/projects.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    // Optional: "coming soon" entries have no public repo yet.
    url: z.string().url().optional(),
    category: z.union([z.string(), z.array(z.string())]),
    tags: z.array(z.string()).default([]),
    // External logo URL (stable hosts only).
    image: z.string().url().optional(),
    // Repo-local asset key resolved against src/assets/projects (kills link rot).
    imageLocal: z.string().optional(),
    // "featured" is a flag, not a second collection.
    featured: z.boolean().default(false),
    // Tease not-yet-public work: shows a "Coming soon" badge and no link.
    comingSoon: z.boolean().default(false),
    // Self-hostable (runs on your own hardware). True for our FOSS work by default.
    selfHosted: z.boolean().default(true),
  }),
});

const collaborations = defineCollection({
  loader: file('src/content/collaborations.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    url: z.string().url(),
    repositories: z.array(z.string().url()).default([]),
  }),
});

const testimonials = defineCollection({
  loader: file('src/content/testimonials.json'),
  schema: z.object({
    id: z.string(),
    org: z.string(),
    url: z.string().url().optional(),
    quote: z.string(),
    quotes: z.record(z.string(), z.string()).optional(),
    author: z.string(),
    // Marks a quote as not-yet-supplied (shows a "pending" treatment).
    placeholder: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
  pages,
  datasets,
  models,
  notebooks,
  research,
  projects,
  collaborations,
  testimonials,
};
