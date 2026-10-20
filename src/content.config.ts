import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const STAMPS = ['VERIFIED', 'CAUGHT', 'PATCHED', 'SOLD', 'IN PROGRESS', 'CLASSIFIED', '0-DAY'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      order: z.number().int().positive(),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      title: z.string(),
      daemon: z.string(),
      pid: z.number().int().min(1000).max(9999),
      oneLiner: z.string(),
      type: z.enum(['Security', 'ML', 'Systems', 'Web']),
      year: z.string(),
      role: z.string(),
      team: z.string(),
      stack: z.array(z.string()).min(1),
      repo: z.string().url(),
      live: z.string().url().optional(),
      // A project made of several builds (the club's event platforms): each gets its own line and repo.
      platforms: z.array(z.object({ name: z.string(), what: z.string(), repo: z.string().url() })).default([]),
      // Only real numbers. Anything unknown stays a TODO in the body, not here.
      metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      stamp: z.enum(STAMPS),
      // Leave out to get the "screenshot goes here" placeholder.
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

export const collections = { projects };
