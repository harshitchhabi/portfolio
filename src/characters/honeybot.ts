// Honeybot guards the IDS: a chunky bear-bot on a honey jar labelled HONEYPOT.
// Intruders get stuck in the honey. When one slips poison into it, Honeybot
// caps how much of the jar gets eaten: the defence from the research.
import type { Character } from './types.ts';
import type { Pen } from './pen.ts';
import { burst, rounded } from './parts.ts';

function jar(p: Pen, y = 0) {
  p.path(`M70 ${150 + y} Q56 ${150 + y} 56 ${170 + y} L56 ${232 + y} Q56 ${246 + y} 72 ${246 + y} L184 ${246 + y} Q200 ${246 + y} 200 ${232 + y} L200 ${170 + y} Q200 ${150 + y} 186 ${150 + y} Z`, {
    fill: 'pink',
    gap: 4.6,
    sw: 2.6,
  });
  p.rect(80, 138 + y, 96, 14, { sw: 2 });
  p.rect(84, 178 + y, 88, 34, { sw: 2 });
  p.text('HONEYPOT', 90, 191 + y, 8.4);
  // drips over the rim
  for (const x of [64, 196]) p.path(`M${x - 6} ${158 + y} Q${x} ${150 + y} ${x + 6} ${158 + y} L${x + 3} ${176 + y} Q${x} ${182 + y} ${x - 3} ${176 + y} Z`, { fill: 'pink', style: 'solid', sw: 1.6 });
}

function bear(p: Pen, y: number, opts: { surprise?: boolean; arms?: 'rest' | 'wave' | 'press' } = {}) {
  // ears behind the head
  p.circle(98, 24 + y, 26, { sw: 2.2 });
  p.circle(158, 24 + y, 26, { sw: 2.2 });
  p.circle(98, 24 + y, 10, { fill: 'pink', style: 'solid', sw: 1.2 });
  p.circle(158, 24 + y, 10, { fill: 'pink', style: 'solid', sw: 1.2 });
  // body
  p.path(rounded(84, 70 + y, 88, 74, 18), { fill: 'green', style: 'zigzag', gap: 4.2, sw: 2.6 });
  p.path(rounded(106, 88 + y, 44, 34, 10), { sw: 1.8 }); // belly panel
  p.circle(118, 105 + y, 6, { fill: 'pink', style: 'solid', sw: 1.2 });
  p.circle(138, 105 + y, 6, { sw: 1.2 });
  // head
  p.circle(128, 46 + y, 72, { sw: 2.6 });
  p.rect(122, 6 + y, 12, 8, { sw: 1.6 }); // bolt
  const er = opts.surprise ? 12 : 10.5;
  p.eye(113, 42 + y, er);
  p.eye(143, 42 + y, er);
  p.ellipse(128, 64 + y, 30, 18, { sw: 1.8 });
  p.ellipse(128, 59 + y, 9, 5, { fill: 'ink', style: 'solid', sw: 1 });
  p.curve([[122, 68 + y], [128, 71 + y], [134, 68 + y]], { sw: 1.4 });

  const arms = opts.arms ?? 'rest';
  if (arms === 'rest') {
    p.ellipse(86, 116 + y, 22, 30, { sw: 2.2 });
    p.ellipse(170, 116 + y, 22, 30, { sw: 2.2 });
  } else if (arms === 'wave') {
    p.ellipse(86, 116 + y, 22, 30, { sw: 2.2 });
    p.path(rounded(166, 34 + y, 22, 44, 11), { sw: 2.2 });
    burst(p, 200, 30 + y, 6, 16, 3, -60, 30, { stroke: 'dim' });
  } else {
    p.path(rounded(70, 120 + y, 24, 44, 11), { sw: 2.2 });
    p.path(rounded(162, 120 + y, 24, 44, 11), { sw: 2.2 });
  }
}

export const honeybot: Character = {
  id: 'honeybot',
  name: 'Honeybot',
  project: 'ids',
  look: 'Honeybot, a chunky green bear-robot sitting on a big pink honey jar labelled HONEYPOT',
  poses: {
    idle: {
      alt: 'sitting on the honeypot, paws folded, watching',
      gaze: [0.3, 0.4],
      draw(p) {
        // legs dangle in front of the lid
        bear(p, -4);
        jar(p);
        p.ellipse(108, 156, 28, 18, { sw: 2.2 });
        p.ellipse(148, 156, 28, 18, { sw: 2.2 });
      },
    },
    react: {
      alt: 'jumping up with a paw raised, eyes wide',
      gaze: [0.8, -0.3],
      draw(p) {
        bear(p, -12, { surprise: true, arms: 'wave' });
        jar(p);
        p.ellipse(108, 152, 28, 18, { sw: 2.2 });
        p.ellipse(148, 152, 28, 18, { sw: 2.2 });
        p.text('!', 214, 18, 22, { stroke: 'pink', sw: 2.6 });
      },
    },
    action: {
      alt: 'standing behind the jar and pressing the lid down hard, a tipped-over poison bottle on the floor',
      gaze: [0, 0.8],
      draw(p) {
        bear(p, 0, { arms: 'press' });
        jar(p, 0);
        // lid slammed on
        p.rect(68, 126, 120, 16, { fill: 'green', style: 'solid', sw: 2.4 });
        burst(p, 128, 128, 74, 92, 6, 190, 350, { stroke: 'dim' });
        // knocked-over poison bottle
        p.path('M2 236 L30 224 L36 238 L8 250 Z', { sw: 2 });
        p.rect(34, 226, 10, 9, { sw: 1.6 });
        p.line(14, 233, 22, 241, { stroke: 'pink', sw: 2 });
        p.line(22, 231, 14, 243, { stroke: 'pink', sw: 2 });
      },
    },
  },
};
