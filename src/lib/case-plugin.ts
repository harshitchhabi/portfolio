// Sätteri hast plugin for case studies: every ## heading gets a hand-drawn
// underline, and the project's diagram goes in at the end of "What I built".

import { DIAGRAMS } from '../data/diagrams';
import { diagramHtml } from './diagram';
import { roughLine } from './rough';

type Node = { type: string; tagName?: string; children?: Node[]; value?: string; properties?: Record<string, unknown> };
interface Ctx {
  data: unknown;
  textContent(node: unknown): string;
  insertBefore(node: unknown, n: unknown): void;
  insertAfter(node: unknown, n: unknown): void;
  appendChild(node: unknown, n: unknown): void;
}

export const casePlugin = {
  name: 'case-study',
  after(root: { children: Node[] }, ctx: Ctx) {
    const fm = (ctx.data as { astro?: { frontmatter?: { slug?: string } } }).astro?.frontmatter;
    const heads = root.children.filter((c) => c.type === 'element' && c.tagName === 'h2');
    heads.forEach((h, i) => {
      const line = roughLine(2, 6, 238, 4 + (i % 2) * 3, { seed: 200 + i * 7, strokeWidth: 2, roughness: 1.8 });
      ctx.insertAfter(h, { type: 'raw', value: `<svg class="h-line draw" viewBox="0 0 240 12" width="240" height="12" aria-hidden="true">${line}</svg>` });
    });
    const spec = fm?.slug ? DIAGRAMS[fm.slug] : undefined;
    if (!spec) return;
    const happened = heads.find((h) => /what happened/i.test(ctx.textContent(h)));
    const raw = { type: 'raw', value: diagramHtml(spec) };
    if (happened) ctx.insertBefore(happened, raw);
    else ctx.appendChild(root, raw);
  },
};
