import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export const projectHref = (p: Project) => `/projects/${p.data.slug}`;

/** "github.com/harshitchhabi/IDS" style, for mono metadata lines. */
export const shortUrl = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
