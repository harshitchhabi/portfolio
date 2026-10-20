import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const metric = z.object({ label: z.string(), value: z.string() });

const diagramNode = z.object({
  text: z.string(),
  // done = solid, wip = dashed, alert = red, best = purple
  state: z.enum(['done', 'wip', 'alert', 'best']).default('done'),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      pos: z.number().int().positive(),
      code: z.string().regex(/^[A-Z]{3}$/),
      title: z.string(),
      oneLiner: z.string(),
      type: z.enum(['Security', 'ML', 'Systems', 'Web']),
      year: z.string(),
      status: z.enum(['best', 'latest', 'wip', 'team']),
      role: z.string(),
      team: z.string(),
      stack: z.array(z.string()).min(1),
      repo: z.string().url(),
      live: z.string().url().optional(),
      metrics: z.array(metric).default([]),
      // Leave cover out to get the typographic placeholder card.
      cover: image().optional(),
      coverAlt: z.string().optional(),
      order: z.number().int(),
      // Which sector (1-3) holds the headline result. That segment goes purple.
      resultSector: z.number().int().min(1).max(3).default(3),
      diagram: z
        .object({
          sector: z.number().int().min(1).max(3).default(2),
          caption: z.string(),
          rows: z.array(
            z.object({
              label: z.string().optional(),
              nodes: z.array(diagramNode).min(1),
            }),
          ),
        })
        .optional(),
      // Dream Merchants only: one stint per sector.
      stints: z
        .array(
          z.object({
            name: z.string(),
            what: z.string(),
            stack: z.array(z.string()),
            repo: z.string().url().optional(),
            metrics: z.array(metric).default([]),
          }),
        )
        .optional(),
    }),
});

export const collections = { projects };
