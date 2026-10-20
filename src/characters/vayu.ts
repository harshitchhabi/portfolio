// Vayu guards Vayu Rakshak: a kite-shaped drone with a long sniffing nose and a
// little satellite dish. It reads the sky for formaldehyde and smells out fires.
import type { Character } from './types.ts';
import type { Pen, Pt } from './pen.ts';
import { burst, place, smooth } from './parts.ts';

function drone(p: Pen, tilt = 0, sniff = false) {
  const C: Pt = [118, 118];
  const T = (pts: Pt[]) => place(pts, C[0], C[1], tilt);
  const at = (x: number, y: number) => T([[x, y]])[0];

  // tail with two bows, drawn first so the body sits on it
  const tail = T([[0, 66], [-10, 92], [8, 112], [-6, 132]]);
  p.curve(tail, { sw: 1.8 });
  for (const [x, y] of [tail[1], tail[2]]) {
    p.poly([[x - 9, y - 6], [x + 9, y + 6], [x + 9, y - 6], [x - 9, y + 6]], { fill: 'green', style: 'solid', sw: 1.6 });
  }
  // rotors
  for (const sx of [-72, 72]) {
    const [rx, ry] = at(sx, -6);
    p.line(rx, ry, rx, ry - 16, { sw: 2 });
    p.ellipse(rx, ry - 19, 46, 9, { sw: 1.8 });
  }
  // dish on a stick
  const [dx, dy] = at(0, -66);
  p.line(dx, dy, dx, dy - 16, { sw: 2 });
  p.path(`M${dx - 22} ${dy - 30} Q${dx} ${dy - 4} ${dx + 22} ${dy - 30} Z`, { fill: 'green', style: 'hachure', gap: 3.4 });
  p.line(dx, dy - 17, dx + 9, dy - 40, { sw: 1.6 });
  p.circle(dx + 10, dy - 42, 6, { fill: 'ink', style: 'solid', sw: 1.4 });

  // kite body and spars
  p.poly(T([[0, -68], [72, -2], [0, 68], [-72, -2]]), { fill: 'pink', gap: 4.4, sw: 2.6 });
  const s1 = T([[0, -60], [0, 60]]);
  const s2 = T([[-62, -2], [62, -2]]);
  p.line(s1[0][0], s1[0][1], s1[1][0], s1[1][1], { stroke: 'dim', sw: 1.4 });
  p.line(s2[0][0], s2[0][1], s2[1][0], s2[1][1], { stroke: 'dim', sw: 1.4 });

  // long sniffing nose
  p.path(smooth(T([[18, 10], [60, 18], [104, 30], [112, 36], [104, 40], [58, 34], [16, 28]])), { sw: 2.4 });
  const [nx, ny] = at(108, 36);
  p.circle(nx, ny, 6, { fill: 'ink', style: 'solid', sw: 1 });
  if (sniff) {
    for (let i = 0; i < 3; i++) {
      const [sx, sy] = at(122 + i * 9, 26 + i * 8);
      p.curve([[sx, sy], [sx + 4, sy - 4], [sx + 8, sy], [sx + 12, sy - 4]], { stroke: 'dim', sw: 1.6 });
    }
  }
  const [e1x, e1y] = at(-20, -14);
  const [e2x, e2y] = at(14, -14);
  p.eye(e1x, e1y, 14);
  p.eye(e2x, e2y, 14);
}

function pin(p: Pen, x: number, y: number, k = 1) {
  p.path(`M${x} ${y} C${x - 14 * k} ${y - 16 * k} ${x - 12 * k} ${y - 34 * k} ${x} ${y - 34 * k} C${x + 12 * k} ${y - 34 * k} ${x + 14 * k} ${y - 16 * k} ${x} ${y} Z`, {
    fill: 'pink',
    style: 'solid',
    sw: 2,
  });
  p.circle(x, y - 22 * k, 8 * k, { sw: 1.6 });
}

export const vayu: Character = {
  id: 'vayu',
  name: 'Vayu',
  project: 'vayu-rakshak',
  look: 'Vayu, a pink kite-shaped drone with two rotors, a long sniffing nose and a small satellite dish on top',
  poses: {
    idle: {
      alt: 'hovering, nose out, listening to the satellite',
      gaze: [0.4, 0.3],
      draw(p) {
        drone(p);
        p.curve([[60, 238], [118, 242], [176, 237]], { stroke: 'dim', sw: 1.4, rough: 2 });
      },
    },
    react: {
      alt: 'tilting and sniffing the air',
      gaze: [0.9, 0.2],
      draw(p) {
        drone(p, -12, true);
        p.curve([[60, 238], [118, 242], [176, 237]], { stroke: 'dim', sw: 1.4, rough: 2 });
      },
    },
    action: {
      alt: 'dropping red hotspot pins on a sketched map and sniffing out someone hiding in a smoke plume',
      gaze: [0.6, 0.8],
      draw(p) {
        // a scrap of map: two state outlines with a border between them
        p.path('M8 206 L54 192 L92 200 L132 188 L170 198 L248 194 L250 252 L6 252 Z', { stroke: 'dim', sw: 1.4, opaque: false });
        p.curve([[96, 200], [104, 224], [92, 252]], { stroke: 'dim', sw: 1.2, dash: [4, 4] });
        drone(p, 8, true);
        pin(p, 52, 236, 0.9);
        pin(p, 84, 244, 0.7);
        pin(p, 138, 242, 0.8);
        // smoke plume with a pair of eyes in it
        for (const [x, y, d] of [[206, 210, 40], [226, 194, 34], [234, 222, 32], [214, 232, 30]] as [number, number, number][]) {
          p.circle(x, y, d, { stroke: 'dim', sw: 1.6, fill: 'green', style: 'dots', gap: 5 });
        }
        p.circle(214, 214, 7, { sw: 1.4 });
        p.circle(228, 214, 7, { sw: 1.4 });
        burst(p, 220, 170, 10, 20, 3, 230, 310);
      },
    },
  },
};
