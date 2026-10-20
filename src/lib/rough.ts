// Build-time Rough.js: turns shapes into hand-drawn SVG markup during the
// Astro build, so wobbly borders and marks cost nothing at runtime.

import rough from 'roughjs';
import type { Options } from 'roughjs/bin/core';

const gen = rough.generator();

// White gel-pen defaults. currentColor, so CSS decides the ink (pink, green, …).
const INK: Options = { roughness: 1.4, bowing: 1, stroke: 'currentColor', strokeWidth: 1.4 };

type Drawable = ReturnType<typeof gen.rectangle>;

function paths(d: Drawable): string {
  return gen
    .toPaths(d)
    .map((p) => {
      const fill = p.fill && p.fill !== 'none' ? p.fill : 'none';
      return `<path d="${p.d.replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1))}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join('');
}

export const roughRect = (w: number, h: number, o: Options = {}) =>
  paths(gen.rectangle(3, 3, w - 6, h - 6, { ...INK, ...o }));

/** A rectangle at (x, y), unlike roughRect which fills its own box. */
export const roughBox = (x: number, y: number, w: number, h: number, o: Options = {}) =>
  paths(gen.rectangle(x, y, w, h, { ...INK, ...o }));

export const roughLine = (x1: number, y1: number, x2: number, y2: number, o: Options = {}) =>
  paths(gen.line(x1, y1, x2, y2, { ...INK, ...o }));

export const roughCircle = (cx: number, cy: number, d: number, o: Options = {}) =>
  paths(gen.circle(cx, cy, d, { ...INK, ...o }));

export const roughEllipse = (cx: number, cy: number, w: number, h: number, o: Options = {}) =>
  paths(gen.ellipse(cx, cy, w, h, { ...INK, ...o }));

export const roughCurve = (pts: [number, number][], o: Options = {}) => paths(gen.curve(pts, { ...INK, ...o }));

/** A hand-drawn arrow along a gentle curve, with a two-stroke head. */
export function roughArrow(pts: [number, number][], o: Options = {}) {
  const [x1, y1] = pts[pts.length - 2];
  const [x2, y2] = pts[pts.length - 1];
  const a = Math.atan2(y2 - y1, x2 - x1);
  const len = 11;
  const head = (da: number): [number, number] => [x2 - len * Math.cos(a + da), y2 - len * Math.sin(a + da)];
  const [hx1, hy1] = head(0.5);
  const [hx2, hy2] = head(-0.5);
  return roughCurve(pts, o) + roughLine(x2, y2, hx1, hy1, o) + roughLine(x2, y2, hx2, hy2, o);
}
