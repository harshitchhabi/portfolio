// Draws the case-study diagrams as inline SVG at build time, in the site's own style:
// mono labels, 1px hairlines, status colours only where they mean something.
// Two layouts are emitted; CSS shows the horizontal one on wide screens and the
// vertical one on phones, so nothing has to scroll sideways.

export type NodeState = 'done' | 'wip' | 'alert' | 'best';
export interface DiagramRow {
  label?: string;
  nodes: { text: string; state?: NodeState }[];
}
export interface Diagram {
  caption: string;
  rows: DiagramRow[];
}

const FONT = 11;
const CHAR_W = FONT * 0.6; // JetBrains Mono advance width
const PAD_X = 14;
const BOX_H = 36;
const ARROW = 30;
const LABEL_H = 20;
const ROW_GAP = 22;

export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const boxW = (text: string) => Math.ceil(text.length * CHAR_W + PAD_X * 2);

function node(x: number, y: number, w: number, text: string, state: NodeState = 'done') {
  return (
    `<g class="dg-node dg-${state}">` +
    `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${BOX_H - 1}"/>` +
    `<text x="${x + w / 2}" y="${y + BOX_H / 2}" dominant-baseline="central" text-anchor="middle">${esc(text)}</text>` +
    `</g>`
  );
}

function arrowRight(x: number, y: number) {
  const x2 = x + ARROW - 4;
  return `<g class="dg-arrow"><line x1="${x + 4}" y1="${y}" x2="${x2 - 5}" y2="${y}"/><path d="M${x2 - 6} ${y - 4}L${x2} ${y}L${x2 - 6} ${y + 4}Z"/></g>`;
}

function arrowDown(x: number, y: number) {
  const y2 = y + ARROW - 8;
  return `<g class="dg-arrow"><line x1="${x}" y1="${y + 4}" x2="${x}" y2="${y2 - 5}"/><path d="M${x - 4} ${y2 - 6}L${x} ${y2}L${x + 4} ${y2 - 6}Z"/></g>`;
}

function summary(d: Diagram) {
  return d.rows
    .map((r) => (r.label ? `${r.label}: ` : '') + r.nodes.map((n) => n.text).join(' → '))
    .join('. ');
}

function horizontal(d: Diagram, id: string) {
  let y = 0;
  let width = 0;
  const parts: string[] = [];
  for (const row of d.rows) {
    if (row.label) {
      parts.push(`<text class="dg-label" x="0" y="${y + 12}">${esc(row.label)}</text>`);
      y += LABEL_H;
    }
    let x = 0;
    row.nodes.forEach((n, i) => {
      const w = boxW(n.text);
      parts.push(node(x, y, w, n.text, n.state));
      x += w;
      if (i < row.nodes.length - 1) {
        parts.push(arrowRight(x, y + BOX_H / 2));
        x += ARROW;
      }
    });
    width = Math.max(width, x);
    y += BOX_H + ROW_GAP;
  }
  const h = y - ROW_GAP;
  return svg(d, id, 'dg-h', width, h, parts);
}

function vertical(d: Diagram, id: string) {
  const w = Math.max(...d.rows.flatMap((r) => r.nodes.map((n) => boxW(n.text))), 200);
  let y = 0;
  const parts: string[] = [];
  for (const row of d.rows) {
    if (row.label) {
      parts.push(`<text class="dg-label" x="0" y="${y + 12}">${esc(row.label)}</text>`);
      y += LABEL_H;
    }
    row.nodes.forEach((n, i) => {
      parts.push(node(0, y, w, n.text, n.state));
      y += BOX_H;
      if (i < row.nodes.length - 1) {
        parts.push(arrowDown(w / 2, y));
        y += ARROW - 8;
      }
    });
    y += ROW_GAP;
  }
  return svg(d, id, 'dg-v', w, y - ROW_GAP, parts);
}

function svg(d: Diagram, id: string, cls: string, w: number, h: number, parts: string[]) {
  const tid = `${id}-${cls}`;
  return (
    `<svg class="dg ${cls}" viewBox="-1 -1 ${w + 2} ${h + 2}" width="${w + 2}" height="${h + 2}" role="img" aria-labelledby="${tid}">` +
    `<title id="${tid}">${esc(summary(d))}</title>` +
    parts.join('') +
    `</svg>`
  );
}

export function diagramHtml(d: Diagram, id = 'dg'): string {
  return (
    `<figure class="diagram">` +
    horizontal(d, id) +
    vertical(d, id) +
    `<figcaption class="label">${esc(d.caption)}</figcaption>` +
    `</figure>`
  );
}
