import type { ImageMetadata } from 'astro';

// Eagerly import every mirrored project image so components can resolve a
// project's `imageLocal` filename to an optimizable ImageMetadata object.
const images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/projects/*.{png,jpg,jpeg,webp,avif,svg}',
  { eager: true }
);

const byFilename = new Map<string, ImageMetadata>();
for (const path in images) {
  const filename = path.split('/').pop();
  if (filename) byFilename.set(filename, images[path].default);
}

/** Resolve a project's `imageLocal` filename to its ImageMetadata, if present. */
export function projectImage(filename?: string): ImageMetadata | undefined {
  return filename ? byFilename.get(filename) : undefined;
}
