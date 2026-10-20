// Signe guards Signify: a small round bot with a camera-lens eye and two
// oversized gloves. It reads hands, so it talks with its own.
import type { Character } from './types.ts';
import type { Pen } from './pen.ts';
import { burst, ground, glove, motion, say } from './parts.ts';

function body(p: Pen, lean = 0) {
  ground(p, 78, 182);
  p.ellipse(104, 230, 34, 16, { fill: 'pink', style: 'zigzag', gap: 3.4 });
  p.ellipse(152, 230, 34, 16, { fill: 'pink', style: 'zigzag', gap: 3.4 });
  // antenna
  p.curve([[128 + lean, 106], [124 + lean, 86], [134 + lean, 70]], { sw: 2 });
  p.circle(135 + lean, 66, 13, { fill: 'pink', style: 'solid' });
  p.circle(128 + lean, 160, 124, { fill: 'green', gap: 4.6 });
  // lens housing, aperture blades, then the eye itself
  p.circle(128 + lean, 152, 74, { sw: 2.4 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    p.line(128 + lean + Math.cos(a) * 24, 152 + Math.sin(a) * 24, 128 + lean + Math.cos(a + 0.6) * 35, 152 + Math.sin(a + 0.6) * 35, { sw: 1.4 });
  }
  p.eye(128 + lean, 152, 20);
  p.circle(164 + lean, 122, 9, { sw: 1.8 }); // flash
  p.curve([[114 + lean, 199], [128 + lean, 205], [142 + lean, 199]], { sw: 2 });
}

export const signe: Character = {
  id: 'signe',
  name: 'Signe',
  project: 'signify',
  look: 'Signe, a small round green robot with one big camera-lens eye and two oversized white gloves',
  poses: {
    idle: {
      alt: 'resting its big gloved hands at its sides',
      gaze: [0.2, 0.1],
      draw(p) {
        p.curve([[76, 168], [62, 182], [58, 196]], { sw: 2.4 });
        p.curve([[180, 168], [194, 182], [198, 196]], { sw: 2.4 });
        body(p);
        glove(p, 58, 196, 195, 0.9);
        glove(p, 198, 196, 165, 0.9, true);
      },
    },
    react: {
      alt: 'waving one big glove at you',
      gaze: [0.6, -0.4],
      draw(p) {
        p.curve([[76, 168], [62, 182], [58, 196]], { sw: 2.4 });
        p.curve([[182, 150], [200, 130], [206, 108]], { sw: 2.4 });
        body(p, -4);
        glove(p, 58, 196, 195, 0.9);
        glove(p, 206, 110, 18, 1, true);
        p.arc(214, 52, 70, 50, Math.PI * 1.15, Math.PI * 1.55, { stroke: 'dim', sw: 1.6 });
        p.arc(214, 52, 92, 70, Math.PI * 1.2, Math.PI * 1.5, { stroke: 'dim', sw: 1.6 });
      },
    },
    action: {
      alt: 'holding up a glove to sign STOP, with the word popping out of a speech bubble',
      gaze: [-0.7, -0.5],
      draw(p) {
        p.curve([[76, 168], [62, 182], [58, 196]], { sw: 2.4 });
        p.curve([[180, 150], [198, 132], [204, 112]], { sw: 2.4 });
        body(p, 4);
        glove(p, 58, 196, 195, 0.9);
        glove(p, 204, 116, -4, 1.25, true);
        burst(p, 210, 40, 34, 44, 5, 200, 340, { stroke: 'dim' });
        say(p, 'STOP', 6, 8, 18, 92, 98, { sw: 2.4 });
        motion(p, 6, 90, 34, 2);
      },
    },
  },
};
