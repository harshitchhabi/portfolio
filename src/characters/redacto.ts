// Redacto guards PrivacyGate: a tall thin bot carrying a fat black marker like a
// spear. Personal data gets a black bar before anything leaves the building.
import type { Character } from './types.ts';
import type { Pen } from './pen.ts';
import { place, say } from './parts.ts';

// marker, butt at the origin, pointing up
function marker(p: Pen, x: number, y: number, deg: number) {
  const P = (pts: [number, number][]) => place(pts, x, y, deg);
  // black barrel: paper-black with a white edge and a highlight stripe
  p.poly(P([[-12, 0], [12, 0], [12, -118], [-12, -118]]), { sw: 2.6 });
  const [h1, h2] = P([[-5, -8], [-5, -78]]);
  p.line(h1[0], h1[1], h2[0], h2[1], { stroke: 'dim', sw: 1.6 });
  p.poly(P([[-13, -84], [13, -84], [13, -98], [-13, -98]]), { fill: 'pink', style: 'solid', sw: 1.8 });
  p.poly(P([[-12, -118], [12, -118], [7, -138], [-7, -138]]), { sw: 2.2 });
  p.poly(P([[-7, -138], [7, -138], [4, -150], [-5, -146]]), { fill: 'ink', style: 'solid', sw: 1.8 });
}

function bot(p: Pen, o: { squint?: boolean } = {}) {
  p.line(116, 198, 110, 240, { sw: 2.6 });
  p.line(140, 198, 146, 240, { sw: 2.6 });
  p.rect(96, 236, 22, 9, { sw: 2 });
  p.rect(138, 236, 22, 9, { sw: 2 });
  p.line(128, 84, 128, 66, { sw: 2.4 });
  p.rect(106, 82, 44, 120, { fill: 'green', angle: 50, gap: 4.6, sw: 2.6 });
  p.line(112, 120, 144, 120, { stroke: 'dim', sw: 1.4 });
  p.line(112, 160, 144, 160, { stroke: 'dim', sw: 1.4 });
  // head with a pair of antenna spikes
  p.line(112, 22, 106, 6, { sw: 2 });
  p.line(144, 22, 150, 6, { sw: 2 });
  p.rect(100, 20, 56, 48, { sw: 2.6 });
  p.eye(116, 42, 10);
  p.eye(140, 42, 10);
  if (o.squint) {
    p.line(104, 26, 124, 32, { sw: 2.4 });
    p.line(152, 26, 132, 32, { sw: 2.4 });
  }
  p.line(118, 58, 138, 58, { sw: 2 });
}

export const redacto: Character = {
  id: 'redacto',
  name: 'Redacto',
  project: 'privacygate',
  look: 'Redacto, a tall thin green robot carrying a fat black marker like a spear',
  poses: {
    idle: {
      alt: 'standing to attention with its marker upright like a spear',
      gaze: [-0.3, 0.2],
      draw(p) {
        bot(p);
        marker(p, 190, 236, 0);
        p.curve([[150, 112], [170, 124], [186, 140]], { sw: 2.4 });
        p.circle(188, 140, 14, { sw: 2 });
      },
    },
    react: {
      alt: 'raising the marker over its shoulder and narrowing its eyes',
      gaze: [0.5, -0.2],
      draw(p) {
        marker(p, 74, 196, 38);
        bot(p, { squint: true });
        p.curve([[106, 112], [92, 118], [86, 132]], { sw: 2.4 });
        p.circle(86, 136, 14, { sw: 2 });
      },
    },
    action: {
      alt: 'lunging with the marker and blacking out a speech bubble mid-sentence',
      gaze: [-1, 0],
      draw(p) {
        say(p, 'MY PIN IS 4', 2, 30, 8, 40, 96, { sw: 2.2 });
        // the marker's fresh black bar over the end of the sentence
        p.rect(60, 38, 38, 13, { fill: 'ink', style: 'solid', sw: 1.6, rough: 0.9 });
        bot(p, { squint: true });
        marker(p, 200, 190, -50);
        p.curve([[150, 112], [170, 140], [180, 168]], { sw: 2.4 });
        p.circle(182, 170, 14, { sw: 2 });
      },
    },
  },
};
