// Reusable bits of character anatomy and comic marks.

import type { Pen, Pt, Style } from './pen.ts';
import { textWidth } from './font.ts';

/** Move, rotate (degrees, 0 = as drawn), scale and optionally mirror local points. */
export function place(pts: Pt[], x: number, y: number, deg = 0, k = 1, flip = false): Pt[] {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([px, py]) => {
    const lx = (flip ? -px : px) * k;
    const ly = py * k;
    return [x + lx * c - ly * s, y + lx * s + ly * c];
  });
}

/** A closed, smooth outline through the points (Catmull-Rom as cubic Béziers). */
export function smooth(pts: Pt[]): string {
  const n = pts.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
}

/** A rounded rectangle path. */
export function rounded(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
}

// Cartoon glove, wrist at the origin, fingers up.
const GLOVE: Pt[] = [
  [-15, 0], [-21, -14], [-31, -22], [-37, -31], [-31, -38], [-21, -31],
  [-20, -47], [-15, -56], [-8, -55], [-5, -46],
  [-3, -54], [3, -61], [9, -58], [9, -48],
  [12, -50], [18, -53], [23, -48], [22, -38],
  [24, -22], [17, -8], [15, 0],
];
const CUFF: Pt[] = [[-18, -2], [18, -2], [20, 12], [-20, 12]];

export function glove(p: Pen, x: number, y: number, deg: number, k = 1, flip = false) {
  p.poly(place(CUFF, x, y, deg, k, flip), { fill: 'pink', style: 'zigzag', gap: 3.6 });
  p.path(smooth(place(GLOVE, x, y, deg, k, flip)), { sw: 2.6 });
  const [a, b] = place([[-8, -40], [-8, -28]], x, y, deg, k, flip);
  const [c, d] = place([[3, -43], [3, -31]], x, y, deg, k, flip);
  p.line(a[0], a[1], b[0], b[1], { sw: 1.6 });
  p.line(c[0], c[1], d[0], d[1], { sw: 1.6 });
}

/** Comic speech bubble with a tail pointing at (tx, ty). */
export function bubble(p: Pen, x: number, y: number, w: number, h: number, tx: number, ty: number, s: Style = {}) {
  const bx = Math.min(Math.max(tx, x + 18), x + w - 18);
  const by = ty > y + h / 2 ? y + h - 2 : y + 2;
  p.poly(
    [
      [bx - 10, by],
      [tx, ty],
      [bx + 10, by],
    ],
    { sw: 2, ...s },
  );
  p.ellipse(x + w / 2, y + h / 2, w, h, { sw: 2, ...s });
}

/** A bubble sized to fit hand-lettered text. */
export function say(p: Pen, text: string, x: number, y: number, size: number, tx: number, ty: number, s: Style = {}) {
  const w = textWidth(text, size) + size * 2.4;
  const h = size * 3;
  bubble(p, x, y, w, h, tx, ty, s);
  p.text(text, x + size * 1.2, y + h / 2 - size / 2, size, { stroke: s.stroke === 'none' ? 'ink' : (s.stroke ?? 'ink') });
  return { w, h };
}

/** Short strokes radiating from a point: movement, impact, attention. */
export function burst(p: Pen, cx: number, cy: number, r1: number, r2: number, n: number, from = 0, to = 360, s: Style = {}) {
  for (let i = 0; i < n; i++) {
    const a = ((from + ((to - from) * (i + 0.5)) / n) * Math.PI) / 180;
    p.line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, { sw: 1.8, ...s });
  }
}

/** Little four-point sparks. */
export function spark(p: Pen, x: number, y: number, r: number, s: Style = {}) {
  p.line(x - r, y, x + r, y, { sw: 1.8, rough: 0.6, ...s });
  p.line(x, y - r, x, y + r, { sw: 1.8, rough: 0.6, ...s });
}

/** A scrubby pencil line for the ground under the feet. */
export function ground(p: Pen, x1: number, x2: number, y = 246) {
  p.curve(
    [
      [x1, y],
      [(x1 + x2) / 2, y + 1.5],
      [x2, y - 0.5],
    ],
    { stroke: 'dim', sw: 1.6, rough: 2 },
  );
}

/** Wiggly lines that say "this moved". */
export function motion(p: Pen, x: number, y: number, len: number, n: number, gap = 7, s: Style = {}) {
  for (let i = 0; i < n; i++) p.line(x, y + i * gap, x + len - i * 4, y + i * gap, { stroke: 'dim', sw: 1.6, ...s });
}
