// Lockjaw guards Secure File Hashing: a padlock with teeth, holding two keys
// labelled AES and RSA. Bang on it all you like; it prints a hash receipt.
import type { Character } from './types.ts';
import type { Pen } from './pen.ts';
import { burst, place, rounded } from './parts.ts';

// key, bow at the origin, shaft going down
function key(p: Pen, x: number, y: number, deg: number, label: string) {
  const P = (pts: [number, number][]) => place(pts, x, y, deg);
  p.poly(P([[-3.5, 10], [3.5, 10], [3.5, 66], [-3.5, 66]]), { sw: 2 });
  p.poly(P([[3.5, 50], [14, 50], [14, 56], [3.5, 56]]), { sw: 1.8 });
  p.poly(P([[3.5, 60], [11, 60], [11, 66], [3.5, 66]]), { sw: 1.8 });
  const [c] = P([[0, 0]]);
  p.circle(c[0], c[1], 26, { fill: 'green', style: 'solid', sw: 2.2 });
  p.circle(c[0], c[1], 8, { sw: 1.6 });
  // paper tag on a string
  const [t] = P([[-6, -24]]);
  p.line(c[0], c[1] - 12, t[0] + 14, t[1] + 12, { stroke: 'dim', sw: 1.2 });
  p.rect(t[0] - 4, t[1] - 4, 34, 18, { sw: 1.8 });
  p.text(label, t[0], t[1] + 1, 8, { stroke: 'ink' });
}

function lock(p: Pen, o: { mouth?: 'grin' | 'clench' | 'open' } = {}) {
  p.rect(98, 236, 24, 10, { sw: 2 });
  p.rect(134, 236, 24, 10, { sw: 2 });
  // shackle
  p.arc(128, 104, 104, 112, Math.PI, Math.PI * 2, { sw: 3 });
  p.arc(128, 104, 76, 82, Math.PI, Math.PI * 2, { sw: 2.4 });
  p.path(rounded(62, 100, 132, 138, 22), { fill: 'pink', gap: 4.6, sw: 2.8 });
  p.eye(102, 138, 14);
  p.eye(154, 138, 14);
  // keyhole forehead mark
  p.circle(128, 116, 8, { sw: 1.6 });
  const m = o.mouth ?? 'grin';
  const h = m === 'open' ? 40 : m === 'clench' ? 18 : 26;
  p.path(rounded(84, 170, 88, h, 8), { sw: 2.4 });
  const teeth = (y: number, dir: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 8; i++) pts.push([88 + i * 10, y + (i % 2 ? dir * 8 : 0)]);
    p.lines(pts, { sw: 1.8 });
  };
  teeth(172, 1);
  teeth(168 + h, -1);
}

export const lockjaw: Character = {
  id: 'lockjaw',
  name: 'Lockjaw',
  project: 'secure-file-hashing',
  look: 'Lockjaw, a pink padlock-shaped robot with a jaw full of teeth, holding two keys labelled AES and RSA',
  poses: {
    idle: {
      alt: 'holding its AES and RSA keys at its sides',
      gaze: [0, 0.4],
      draw(p) {
        lock(p);
        key(p, 34, 150, 10, 'AES');
        key(p, 222, 150, -10, 'RSA');
        p.line(62, 180, 40, 162, { sw: 2.4 });
        p.line(194, 180, 216, 162, { sw: 2.4 });
      },
    },
    react: {
      alt: 'clenching its jaw and crossing its keys like swords',
      gaze: [0.6, -0.4],
      draw(p) {
        lock(p, { mouth: 'clench' });
        key(p, 72, 64, -40, 'AES');
        key(p, 184, 64, 40, 'RSA');
        burst(p, 128, 60, 36, 48, 3, 240, 300, { stroke: 'dim' });
      },
    },
    action: {
      alt: 'printing a long hash receipt from its mouth stamped TAMPER DETECTED',
      gaze: [0, 1],
      draw(p) {
        lock(p, { mouth: 'open' });
        key(p, 34, 150, 10, 'AES');
        key(p, 222, 150, -10, 'RSA');
        p.line(62, 180, 40, 162, { sw: 2.4 });
        p.line(194, 180, 216, 162, { sw: 2.4 });
        // receipt out of the jaw, curling on the floor
        p.path('M100 196 L156 196 L156 236 Q156 252 170 252 L96 252 Q100 244 100 236 Z', { sw: 2 });
        p.text('SHA-256', 106, 202, 5.2, { stroke: 'dim', sw: 1.2 });
        p.line(106, 212, 150, 212, { stroke: 'dim', sw: 1 });
        p.text('TAMPER', 108, 218, 6, { stroke: 'stamp', sw: 1.6 });
        p.text('DETECTED', 102, 230, 5.6, { stroke: 'stamp', sw: 1.6 });
      },
    },
  },
};
