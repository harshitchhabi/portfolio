// Forge guards NovaCraft: a blacksmith bot that hammers source code into
// WebAssembly bricks on a finished anvil.
import type { Character } from './types.ts';
import type { Pen } from './pen.ts';
import { burst, place, rounded, spark } from './parts.ts';

function hammer(p: Pen, x: number, y: number, deg: number) {
  const P = (pts: [number, number][]) => place(pts, x, y, deg);
  p.poly(P([[-3.5, 0], [3.5, 0], [3.5, -64], [-3.5, -64]]), { sw: 2 });
  p.poly(P([[-18, -64], [20, -64], [20, -84], [-18, -84]]), { fill: 'green', style: 'solid', sw: 2.4 });
}

// the anvil: horn, face and heel all inked in, like the finished compiler
function anvil(p: Pen) {
  p.poly([[176, 192], [176, 176], [150, 172], [146, 166], [188, 162], [200, 162], [200, 192]], { fill: 'green', gap: 4, sw: 2.6 });
  p.poly([[200, 162], [236, 162], [236, 176], [216, 180], [216, 192], [200, 192]], { fill: 'green', gap: 4, sw: 2.6 });
  p.poly([[184, 192], [216, 192], [224, 216], [176, 216]], { sw: 2.4 });
  p.poly([[168, 216], [232, 216], [236, 244], [164, 244]], { fill: 'green', style: 'zigzag', gap: 4, sw: 2.4 });
  p.text('WASM', 182, 222, 6, { stroke: 'ink', sw: 1.2 });
}

function smith(p: Pen, look: 'calm' | 'up') {
  p.rect(64, 234, 26, 11, { sw: 2 });
  p.rect(104, 234, 26, 11, { sw: 2 });
  p.path(rounded(52, 112, 92, 126, 20), { sw: 2.6 });
  p.path(rounded(64, 140, 68, 84, 8), { fill: 'pink', gap: 4.4, sw: 2.2 }); // apron
  p.rect(84, 180, 28, 20, { sw: 1.6 }); // pocket
  p.line(64, 146, 58, 126, { sw: 1.6 });
  p.line(132, 146, 138, 126, { sw: 1.6 });
  // head with goggles pushed up
  p.path(rounded(58, 30, 80, 80, 14), { sw: 2.6 });
  p.line(58, 48, 138, 48, { sw: 2 });
  p.circle(82, 44, 18, { fill: 'green', style: 'solid', sw: 1.8 });
  p.circle(114, 44, 18, { fill: 'green', style: 'solid', sw: 1.8 });
  const ey = look === 'up' ? 68 : 72;
  p.eye(82, ey, 11);
  p.eye(114, ey, 11);
  for (let i = 0; i < 4; i++) p.line(80 + i * 12, 92, 80 + i * 12, 100, { sw: 1.6 }); // grill
  p.line(76, 92, 120, 92, { sw: 1.4 });
}

export const forge: Character = {
  id: 'forge',
  name: 'Forge',
  project: 'novacraft',
  look: 'Forge, a stout blacksmith robot with goggles and a pink apron, a hammer, and a green anvil',
  poses: {
    idle: {
      alt: 'resting its hammer on its shoulder next to its anvil',
      gaze: [0.6, 0.4],
      draw(p) {
        anvil(p);
        smith(p, 'calm');
        hammer(p, 150, 150, 22);
        p.circle(150, 150, 16, { sw: 2 });
      },
    },
    react: {
      alt: 'raising its hammer high',
      gaze: [0.4, -0.8],
      draw(p) {
        anvil(p);
        hammer(p, 150, 118, 28);
        smith(p, 'up');
        p.circle(150, 118, 16, { sw: 2 });
      },
    },
    action: {
      alt: 'hammering lines of source code on the anvil into WebAssembly bricks, sparks flying',
      gaze: [1, 0.4],
      draw(p) {
        anvil(p);
        // code going in, bricks coming out
        p.text('{ X=1 }', 150, 150, 6.4, { stroke: 'dim', sw: 1.2 });
        smith(p, 'calm');
        hammer(p, 140, 132, 62);
        p.circle(140, 132, 16, { sw: 2 });
        burst(p, 198, 160, 10, 24, 5, 200, 340, { stroke: 'stamp', sw: 1.6 });
        spark(p, 172, 132, 5, { stroke: 'stamp' });
        spark(p, 226, 136, 4, { stroke: 'stamp' });
        p.rect(222, 108, 32, 18, { fill: 'pink', style: 'solid', sw: 2 });
        p.text('WASM', 224, 114, 5.2, { stroke: 'paper', sw: 1.6 });
      },
    },
  },
};
