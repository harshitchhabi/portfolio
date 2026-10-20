// The Intruder: a scribbly gremlin of tangled pen lines in a hoodie, with a
// glitchy outline and a lockpick. It sneaks between the stations and gets
// stopped at every one, and ends the night in a jar.
import type { Character } from './types.ts';
import type { Pen } from './pen.ts';
import { burst, smooth, spark } from './parts.ts';

function hood(p: Pen, x: number, y: number, k = 1, sad = false) {
  const H = (pts: [number, number][]) => pts.map(([a, b]) => [x + a * k, y + b * k] as [number, number]);
  const outline = H([[-40, 30], [-46, -6], [-30, -40], [0, -52], [30, -40], [46, -6], [40, 30], [0, 40]]);
  // glitch: the same outline, slipped and in pink
  p.raw(`<g transform="translate(${-5 * k} ${3 * k})">`);
  p.path(smooth(outline), { stroke: 'pink', sw: 1.8, opaque: false, rough: 2.2 });
  p.raw('</g>');
  p.path(smooth(outline), { sw: 2.6 });
  // the dark opening of the hood, where the eyes are
  p.path(smooth(H([[-26, 16], [-30, -10], [-16, -28], [0, -32], [16, -28], [30, -10], [26, 16], [0, 22]])), { sw: 1.8 });
  p.scribble(x, y + 30 * k, 32 * k, 10 * k, 10, { stroke: 'dim', sw: 1.2 }); // drawstrings and mess
  p.eye(x - 11 * k, y - 6 * k, 8 * k);
  p.eye(x + 11 * k, y - 6 * k, 8 * k);
  if (sad) {
    p.line(x - 20 * k, y - 18 * k, x - 6 * k, y - 14 * k, { sw: 1.8 });
    p.line(x + 20 * k, y - 18 * k, x + 6 * k, y - 14 * k, { sw: 1.8 });
  }
}

function tangle(p: Pen, x: number, y: number, rx: number, ry: number) {
  p.scribble(x, y, rx, ry, 34, { sw: 1.5 });
  p.scribble(x + 2, y - 2, rx * 0.8, ry * 0.85, 22, { stroke: 'dim', sw: 1.2 });
}

function lockpick(p: Pen, x1: number, y1: number, x2: number, y2: number) {
  p.line(x1, y1, x2, y2, { stroke: 'stamp', sw: 2 });
  p.lines(
    [
      [x2, y2],
      [x2 + 6, y2 - 2],
      [x2 + 8, y2 + 4],
    ],
    { stroke: 'stamp', sw: 2 },
  );
}

export const intruder: Character = {
  id: 'intruder',
  name: 'The Intruder',
  project: '',
  look: 'The Intruder, a scribbly gremlin made of tangled pen lines, wearing a hoodie with a glitchy pink outline',
  poses: {
    idle: {
      alt: 'tiptoeing along with a lockpick out',
      gaze: [0.8, 0.2],
      draw(p) {
        // tiptoe legs
        p.curve([[110, 190], [100, 214], [92, 240]], { sw: 2 });
        p.curve([[142, 190], [156, 212], [170, 236]], { sw: 2 });
        p.line(86, 242, 98, 238, { sw: 2.2 });
        p.line(166, 238, 178, 234, { sw: 2.2 });
        tangle(p, 126, 168, 46, 40);
        p.curve([[160, 150], [184, 146], [200, 136]], { sw: 1.8 });
        lockpick(p, 198, 136, 236, 124);
        hood(p, 120, 104);
        p.text('SHH', 30, 70, 9, { stroke: 'dim', sw: 1.4 });
      },
    },
    react: {
      alt: 'peeking out from behind a server rack, eyes wide',
      gaze: [-0.9, 0],
      draw(p) {
        p.curve([[120, 196], [116, 222], [112, 244]], { sw: 2 });
        tangle(p, 132, 172, 40, 40);
        hood(p, 126, 110, 1.05);
        // the rack it's hiding behind
        p.rect(150, 6, 104, 246, { fill: 'green', style: 'hachure', gap: 6, angle: 0, sw: 2.6 });
        for (let y = 26; y < 240; y += 26) p.line(160, y, 244, y, { stroke: 'dim', sw: 1.2 });
        for (let y = 36; y < 240; y += 52) p.circle(238, y, 5, { fill: 'pink', style: 'solid', sw: 1 });
        p.curve([[150, 150], [142, 146], [138, 154]], { sw: 2 }); // fingers on the edge
      },
    },
    action: {
      alt: 'foiled: flailing, lockpick flying out of its hand, seeing stars',
      gaze: [0.3, -0.9],
      draw(p) {
        p.curve([[110, 196], [92, 214], [76, 230]], { sw: 2 });
        p.curve([[144, 196], [164, 216], [182, 228]], { sw: 2 });
        p.curve([[92, 150], [66, 128], [52, 100]], { sw: 1.8 });
        p.curve([[160, 150], [188, 126], [200, 96]], { sw: 1.8 });
        tangle(p, 126, 172, 44, 40);
        hood(p, 126, 108);
        lockpick(p, 214, 40, 238, 22);
        burst(p, 226, 32, 14, 22, 4, 0, 360, { stroke: 'dim' });
        spark(p, 92, 46, 6, { stroke: 'stamp' });
        spark(p, 156, 34, 5, { stroke: 'stamp' });
        spark(p, 124, 22, 4, { stroke: 'stamp' });
        p.arc(126, 54, 90, 26, 0, Math.PI * 2, { stroke: 'dim', sw: 1.4 });
      },
    },
    caught: {
      alt: 'sitting curled up and sulking, caught',
      gaze: [0, 0.7],
      draw(p) {
        tangle(p, 128, 196, 48, 36);
        p.ellipse(100, 236, 30, 12, { sw: 2 });
        p.ellipse(156, 236, 30, 12, { sw: 2 });
        hood(p, 128, 150, 1, true);
        p.text('...', 168, 104, 9, { stroke: 'dim' });
      },
    },
  },
};
