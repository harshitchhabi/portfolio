import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Status = Project['data']['status'];

export const statusLabel: Record<Status, string> = {
  best: 'Session best',
  latest: 'Personal best',
  wip: 'In progress',
  team: 'In pit',
};

export const statusClass = (s: Status) => `st-${s}`;

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.pos - b.data.pos);
}

export const projectHref = (p: Project) => `/projects/${p.id}`;

/** "github.com/harshitchhabi/IDS" style, for mono header strips. */
export const shortUrl = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
