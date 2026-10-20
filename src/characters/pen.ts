// The drawing kit every character is built with. Each shape is laid down as
//   1. a paper knock-out (so it covers whatever was drawn before it),
//   2. its riso fill, hachured and slipped a few px out of register,
//   3. its white ink outline, wobbled by Rough.js.
// The same drawing with a different seed gives the next line-boil frame.

import rough from 'roughjs';
import type { Options } from 'roughjs/bin/core';
import { letter } from './font.ts';

export const COLORS = {
  ink: '#F2EEE4',
  dim: '#9B978E',
  pink: '#FF48B0',
  green: '#00A95C',
  stamp: '#FFE800',
  paper: '#0E0E10',
} as const;

export type Ink = keyof typeof COLORS;
export type Pt = [number, number];

export interface Style {
  fill?: Ink;
  /** Rough.js fill style. Characters use hachure or zigzag; solid is for small marks. */
  style?: 'hachure' | 'zigzag' | 'cross-hatch' | 'solid' | 'dots' | 'zigzag-line';
  gap?: number;
  angle?: number;
  stroke?: Ink | 'none';
  sw?: number;
  rough?: number;
  bow?: number;
  /** Cover what was drawn before. Default true for closed shapes. */
  opaque?: boolean;
  /** Dashed outline, e.g. for parts that aren't built yet. */
  dash?: number[];
}

export interface Eye {
  cx: number;
  cy: number;
  r: number;
}

const gen = rough.generator();
// How far the riso layer slips off the ink, in drawing units.
const MISREG: Pt = [3, -2];

export class Pen {
  private out: string[] = [];
  private n = 0;
  readonly eyes: Eye[] = [];

  private frame: number;

  /** frame picks the wobble; every frame of a pose is the same drawing. */
  constructor(frame: number) {
    this.frame = frame;
  }

  private seed() {
    this.n += 1;
    return this.frame * 997 + this.n * 31 + 1;
  }

  private base(s: Style): Options {
    return {
      seed: this.seed(),
      roughness: s.rough ?? 1.5,
      bowing: s.bow ?? 1,
      strokeWidth: s.sw ?? 2.2,
      stroke: s.stroke === 'none' ? 'none' : COLORS[s.stroke ?? 'ink'],
      ...(s.dash ? { strokeLineDash: s.dash, disableMultiStroke: true } : {}),
    };
  }

  private emit(d: ReturnType<typeof gen.rectangle>, offset = false) {
    const ld = d.options.strokeLineDash;
    const dash = ld ? ` stroke-dasharray="${ld.join(' ')}"` : '';
    const body = gen
      .toPaths(d)
      .map(
        (p) =>
          `<path d="${p.d.replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1))}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${p.fill ?? 'none'}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`,
      )
      .join('');
    this.out.push(offset ? `<g transform="translate(${MISREG[0]} ${MISREG[1]})">${body}</g>` : body);
  }

  private fillOpts(s: Style): Options {
    const solid = s.style === 'solid';
    return {
      ...this.base(s),
      stroke: 'none',
      fill: COLORS[s.fill!],
      fillStyle: s.style ?? 'hachure',
      hachureGap: s.gap ?? 4.2,
      hachureAngle: s.angle ?? -41,
      fillWeight: solid ? undefined : 1.5,
      roughness: (s.rough ?? 1.5) * 0.8,
    };
  }

  /** Shared path for closed shapes: knock-out, fill, outline. */
  private closed(knock: string, make: (o: Options) => ReturnType<typeof gen.rectangle>, s: Style) {
    if (s.opaque !== false) this.out.push(knock);
    if (s.fill) this.emit(make(this.fillOpts(s)), s.fill !== 'ink' && s.style !== 'solid');
    if (s.stroke !== 'none') this.emit(make({ ...this.base(s), fill: undefined }));
  }

  rect(x: number, y: number, w: number, h: number, s: Style = {}) {
    this.closed(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${COLORS.paper}"/>`, (o) => gen.rectangle(x, y, w, h, o), s);
    return this;
  }

  ellipse(cx: number, cy: number, w: number, h: number, s: Style = {}) {
    this.closed(
      `<ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="${COLORS.paper}"/>`,
      (o) => gen.ellipse(cx, cy, w, h, o),
      s,
    );
    return this;
  }

  circle(cx: number, cy: number, d: number, s: Style = {}) {
    return this.ellipse(cx, cy, d, d, s);
  }

  poly(pts: Pt[], s: Style = {}) {
    this.closed(
      `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${COLORS.paper}"/>`,
      (o) => gen.polygon(pts, o),
      s,
    );
    return this;
  }

  /** Any closed SVG path, e.g. a rounded body. */
  path(d: string, s: Style = {}) {
    this.closed(`<path d="${d}" fill="${COLORS.paper}"/>`, (o) => gen.path(d, o), s);
    return this;
  }

  /** Open line work: no knock-out, no fill. */
  line(x1: number, y1: number, x2: number, y2: number, s: Style = {}) {
    this.emit(gen.line(x1, y1, x2, y2, this.base(s)));
    return this;
  }

  lines(pts: Pt[], s: Style = {}) {
    this.emit(gen.linearPath(pts, this.base(s)));
    return this;
  }

  curve(pts: Pt[], s: Style = {}) {
    this.emit(gen.curve(pts, this.base(s)));
    return this;
  }

  arc(cx: number, cy: number, w: number, h: number, start: number, stop: number, s: Style = {}) {
    this.emit(gen.arc(cx, cy, w, h, start, stop, false, this.base(s)));
    return this;
  }

  /** Hand-lettered capitals. */
  text(str: string, x: number, y: number, size: number, s: Style = {}) {
    for (const stroke of letter(str, x, y, size)) {
      this.emit(gen.linearPath(stroke, { ...this.base({ sw: 1.8, rough: 0.7, ...s }), bowing: 0.4 }));
    }
    return this;
  }

  /** An eye socket. The pupil is drawn at runtime so it can follow the cursor. */
  eye(cx: number, cy: number, r: number, s: Style = {}) {
    this.circle(cx, cy, r * 2, { sw: 2.4, rough: 1, ...s });
    this.eyes.push({ cx, cy, r });
    return this;
  }

  /** A tangle of pen loops inside an ellipse: the Intruder is made of these. */
  scribble(cx: number, cy: number, rx: number, ry: number, loops: number, s: Style = {}) {
    let r = this.frame * 7919 + this.n * 104729 + 17;
    const rand = () => {
      r = (r * 16807) % 2147483647;
      return r / 2147483647;
    };
    const pts: Pt[] = [];
    for (let i = 0; i < loops; i++) {
      const a = rand() * Math.PI * 2;
      const k = Math.sqrt(rand()) * 0.95;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    this.emit(gen.curve(pts, { ...this.base({ sw: 1.6, rough: 1.2, ...s }), curveTightness: -0.4 }));
    this.n += 1;
    return this;
  }

  /** Raw, already-built SVG (used for small fixed marks). */
  raw(svg: string) {
    this.out.push(svg);
    return this;
  }

  svg(w: number, h: number, pupils?: { gaze: Pt }) {
    const dots = pupils
      ? this.eyes
          .map(
            (e) =>
              `<circle cx="${(e.cx + pupils.gaze[0] * e.r * 0.42).toFixed(1)}" cy="${(e.cy + pupils.gaze[1] * e.r * 0.42).toFixed(1)}" r="${(e.r * 0.42).toFixed(1)}" fill="${COLORS.ink}"/>`,
          )
          .join('')
      : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${this.out.join('')}${dots}</svg>`;
  }

  /** The drawing as an SVG group, for packing into sprite sheets. */
  group(x: number, y: number) {
    return `<g transform="translate(${x} ${y})">${this.out.join('')}</g>`;
  }
}
