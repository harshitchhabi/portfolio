// Sätteri hast plugin. Turns a case study's Markdown into sectors: every `##` heading starts a
// <section class="sector"> (S1, S2, S3). Frontmatter decides what gets added:
// the diagram goes at the end of its sector, timing readouts go into the result
// sector, and on the Dream Merchants page each sector gets its stint strip.

import { diagramHtml, esc, type Diagram } from './diagram';

interface Metric {
  label: string;
  value: string;
}
interface Stint {
  name: string;
  what: string;
  stack: string[];
  repo?: string;
  metrics?: Metric[];
}
interface Frontmatter {
  metrics?: Metric[];
  resultSector?: number;
  diagram?: Diagram & { sector?: number };
  stints?: Stint[];
}

interface SectorCtx {
  data: unknown;
  removeChildAt(node: unknown, index: number): void;
  appendChild(node: unknown, child: unknown[]): void;
}

type Node = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: Node[]; value?: string };

const raw = (value: string): Node => ({ type: 'raw', value });
const el = (tagName: string, className: string[], children: Node[], extra: Record<string, unknown> = {}): Node => ({
  type: 'element',
  tagName,
  properties: { className, ...extra },
  children,
});

export function readoutsHtml(metrics: Metric[]): string {
  if (!metrics.length) return '';
  const items = metrics
    .map((m) => {
      const todo = /TODO/.test(m.value) ? ' is-todo' : '';
      return `<div class="readout${todo}"><dt class="label">${esc(m.label)}</dt><dd class="readout-value">${esc(m.value)}</dd></div>`;
    })
    .join('');
  return `<dl class="readouts">${items}</dl>`;
}

function stintHtml(s: Stint, n: number): string {
  const repo = s.repo ? `<a href="${esc(s.repo)}" rel="noopener">REPO ↗</a>` : '';
  return (
    `<div class="strip stint-strip"><span>STINT ${n}</span><span>${esc(s.what)}</span>` +
    `<span>${esc(s.stack.join(' / '))}</span>${repo}</div>` +
    readoutsHtml(s.metrics ?? [])
  );
}

export const sectorsPlugin = {
  name: 'sectors',
  after(root: { children: Node[] }, ctx: SectorCtx) {
    const fm = (ctx.data as { astro?: { frontmatter?: Frontmatter } }).astro?.frontmatter ?? {};
    const out: Node[] = [];
    let body: Node[] | null = null;
    let n = 0;
    const sectors: Node[][] = [];
    const sections: Node[] = [];

    for (const child of root.children) {
      if (child.type === 'element' && child.tagName === 'h2') {
        n += 1;
        const heading: Node = { ...child, properties: { ...child.properties, className: ['sector-title'] } };
        body = [];
        sectors.push(body);
        const head: Node[] = [heading];
        const stint = fm.stints?.[n - 1];
        if (stint) head.push(raw(stintHtml(stint, n)));
        const section = el('section', ['sector'], [el('div', ['sector-head'], head), el('div', ['sector-body', 'prose'], body)], {
          id: `s${n}`,
          dataSector: String(n),
        });
        sections.push(section);
        out.push(section);
        continue;
      }
      if (body) body.push(child);
      else out.push(child);
    }

    // Anything before the first heading is an intro paragraph.
    const firstSector = out.indexOf(sections[0]);
    if (firstSector > 0) {
      const intro = out.splice(0, firstSector);
      out.unshift(el('div', ['intro', 'prose'], intro));
    }

    const resultIdx = (fm.resultSector ?? 3) - 1;
    if (!fm.stints && fm.metrics?.length && sectors[resultIdx]) {
      sectors[resultIdx].push(raw(readoutsHtml(fm.metrics)));
    }
    if (fm.diagram) {
      const idx = (fm.diagram.sector ?? 2) - 1;
      // The figure sits after the sector body, full width.
      sections[idx]?.children?.push(raw(diagramHtml(fm.diagram, `dg${idx + 1}`)));
    }
    if (sections[resultIdx]) {
      sections[resultIdx].properties = { ...sections[resultIdx].properties, dataResult: '' };
    }

    for (let i = root.children.length - 1; i >= 0; i--) ctx.removeChildAt(root, i);
    ctx.appendChild(root, out);
  },
};
