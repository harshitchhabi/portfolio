// Tula guards the Mandi price database: a database cylinder on legs, carrying a
// market weighing scale (tula is Hindi for a balance). It weighs every row that
// comes in, and a row that breaks a constraint doesn't get past it.
import type { Character } from './types.ts';
import type { Pen } from './pen.ts';
import { burst, motion } from './parts.ts';

// the cylinder: three stacked discs, eyes on the top band
function drum(p: Pen, o: { squint?: boolean } = {}) {
  p.rect(94, 232, 24, 12, { sw: 2 });
  p.rect(138, 232, 24, 12, { sw: 2 });
  // body, then the rims that make it read as a stack of disks
  p.path('M76 96 L76 214 Q128 242 180 214 L180 96 Z', { fill: 'green', gap: 4.6, sw: 2.8 });
  p.ellipse(128, 96, 104, 32, { sw: 2.6 });
  p.arc(128, 136, 104, 30, 0, Math.PI, { sw: 2 });
  p.arc(128, 176, 104, 30, 0, Math.PI, { sw: 2 });
  // the top band is its face
  const ey = o.squint ? 120 : 118;
  p.eye(110, ey, o.squint ? 10 : 13);
  p.eye(146, ey, o.squint ? 10 : 13);
  p.line(118, 138, 138, 138, { sw: 2 });
  // row counter on the middle band
  p.rect(98, 164, 60, 18, { sw: 1.6 });
  p.text('6.78M', 103, 168, 8, { stroke: 'ink', sw: 1.4 });
}

// the balance: a post from the hand up to a beam, pans hanging off each end.
// tilt > 0 drops the left pan (the onion side).
function scale(p: Pen, hx: number, hy: number, tilt = 0) {
  const top = hy - 108;
  p.line(hx, hy, hx, top, { sw: 2.6 });
  p.circle(hx, top, 8, { fill: 'pink', style: 'solid', sw: 1.6 });
  const dx = 24;
  const lY = top + tilt;
  const rY = top - tilt;
  p.line(hx - dx, lY, hx + dx, rY, { sw: 2.4 });
  for (const [x, y] of [[hx - dx, lY], [hx + dx, rY]] as [number, number][]) {
    p.line(x, y, x - 10, y + 24, { stroke: 'dim', sw: 1.2 });
    p.line(x, y, x + 10, y + 24, { stroke: 'dim', sw: 1.2 });
    p.arc(x, y + 24, 24, 12, 0, Math.PI, { sw: 2 });
  }
  // an onion on the left pan, a one-quintal weight on the right
  p.circle(hx - dx, lY + 16, 15, { fill: 'pink', gap: 3.4, sw: 1.8 });
  p.line(hx - dx, lY + 9, hx - dx + 3, lY + 1, { sw: 1.6 });
  p.rect(hx + dx - 8, rY + 11, 16, 13, { sw: 1.8 });
  p.text('1Q', hx + dx - 5, rY + 14, 5.4, { stroke: 'ink', sw: 1.2 });
}

export const tula: Character = {
  id: 'tula',
  name: 'Tula',
  project: 'mandi',
  look: 'Tula, a green database-cylinder robot with eyes on its top disk and a row counter on its middle, carrying a market weighing scale with an onion on one pan',
  poses: {
    idle: {
      alt: 'holding its weighing scale level, an onion balanced against a one-quintal weight',
      gaze: [0.5, -0.3],
      draw(p) {
        drum(p);
        p.line(76, 150, 52, 186, { sw: 2.4 });
        p.line(180, 150, 220, 176, { sw: 2.4 });
        scale(p, 220, 176);
      },
    },
    react: {
      alt: 'squinting as its scale tips under the onion',
      gaze: [0.8, -0.6],
      draw(p) {
        drum(p, { squint: true });
        p.line(76, 150, 52, 186, { sw: 2.4 });
        p.line(180, 150, 220, 176, { sw: 2.4 });
        scale(p, 220, 176, 10);
        p.text('?', 148, 52, 14, { stroke: 'pink', sw: 2 });
      },
    },
    action: {
      alt: 'holding up a card that reads CHECK VIOLATED, refusing a row',
      gaze: [-0.8, 0.2],
      draw(p) {
        drum(p);
        p.line(180, 150, 220, 176, { sw: 2.4 });
        scale(p, 220, 176);
        // the card held out on the other side
        p.line(76, 140, 44, 106, { sw: 2.4 });
        p.rect(4, 44, 74, 60, { sw: 2.4 });
        p.text('CHECK', 12, 54, 9, { stroke: 'stamp', sw: 1.8 });
        p.text('VIOLATED', 9, 74, 7, { stroke: 'stamp', sw: 1.6 });
        p.line(14, 92, 66, 92, { stroke: 'dim', sw: 1 });
        burst(p, 41, 74, 46, 56, 4, 150, 230, { stroke: 'dim' });
        motion(p, 84, 64, 14, 3, 7, { stroke: 'dim' });
      },
    },
  },
};
