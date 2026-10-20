// Build-time hand-drawn diagrams: Rough.js boxes and arrows with handwritten
// labels. Two layouts: a row for wide screens, a column for phones.

import { roughArrow, roughRect } from './rough';
import type { DiagramSpec, NodeState } from '../data/diagrams';

const CH = 9.2; // handwriting is narrow: px per character at 19px
const PAD = 16;
const BH = 50;
const GAP = 46;
const LABEL = 24;
const ROWGAP = 26;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const bw = (t: string) => Math.ceil(t.length * CH + PAD * 2);

function node(x: number, y: number, w: number, text: string, state: NodeState = 'done', seed: number) {
  const box = roughRect(w + 6, BH + 6, {
    seed,
    roughness: 1.6,
    strokeWidth: state === 'best' ? 2.4 : 1.6,
    ...(state === 'wip' ? { strokeLineDash: [6, 5], disableMultiStroke: true } : {}),
  });
  return (
    `<g class="dg-node dg-${state}" transform="translate(${x - 3} ${y - 3})">${box}</g>` +
    `<text class="dg-t dg-${state}" x="${x + w / 2}" y="${y + BH / 2 + 1}" text-anchor="middle" dominant-baseline="central">${esc(text)}</text>`
  );
}

function svg(cls: string, w: number, h: number, body: string, title: string) {
  return `<svg class="dg draw ${cls}" viewBox="-4 -4 ${w + 8} ${h + 8}" width="${w + 8}" height="${h + 8}" role="img" aria-label="${esc(title)}">${body}</svg>`;
}

export function diagramHtml(spec: DiagramSpec): string {
  let seed = 7;
  const summary = spec.rows.map((r) => (r.label ? `${r.label}: ` : '') + r.nodes.map((n) => n.text).join(' → ')).join('. ');

  // horizontal
  let y = 0;
  let width = 0;
  let h = '';
  for (const row of spec.rows) {
    if (row.label) {
      h += `<text class="dg-label" x="0" y="${y + 16}">${esc(row.label)}</text>`;
      y += LABEL;
    }
    let x = 0;
    row.nodes.forEach((n, i) => {
      const w = bw(n.text);
      h += node(x, y, w, n.text, n.state, seed++);
      x += w;
      if (i < row.nodes.length - 1) {
        h += `<g class="dg-arrow">${roughArrow([[x + 6, y + BH / 2 + 2], [x + GAP / 2, y + BH / 2 - 4], [x + GAP - 6, y + BH / 2]], { seed: seed++, strokeWidth: 1.5 })}</g>`;
        x += GAP;
      }
    });
    width = Math.max(width, x);
    y += BH + ROWGAP;
  }
  const horizontal = svg('dg-h', width, y - ROWGAP, h, summary);

  // vertical
  const vw = Math.max(...spec.rows.flatMap((r) => r.nodes.map((n) => bw(n.text))), 220);
  y = 0;
  let v = '';
  for (const row of spec.rows) {
    if (row.label) {
      v += `<text class="dg-label" x="0" y="${y + 16}">${esc(row.label)}</text>`;
      y += LABEL;
    }
    row.nodes.forEach((n, i) => {
      v += node(0, y, vw, n.text, n.state, seed++);
      y += BH;
      if (i < row.nodes.length - 1) {
        v += `<g class="dg-arrow">${roughArrow([[vw / 2 + 2, y + 6], [vw / 2 - 5, y + 18], [vw / 2, y + 32]], { seed: seed++, strokeWidth: 1.5 })}</g>`;
        y += 38;
      }
    });
    y += ROWGAP;
  }
  const vertical = svg('dg-v', vw, y - ROWGAP, v, summary);

  return `<figure class="diagram">${horizontal}${vertical}<figcaption class="hand">${esc(spec.caption)}</figcaption></figure>`;
}
