// The Auctioneers guard Dream Merchants: three small bots, one per platform.
// A gavel bot (Dream Team), a ticker-tape screen-head (Stockastic) and a bot
// built from toy bricks (Bricks by Bid). Anything that wanders in gets sold.
import type { Character } from './types.ts';
import type { Pen } from './pen.ts';
import { burst, place, rounded, say } from './parts.ts';

function gavel(p: Pen, x: number, y: number, deg: number) {
  const P = (pts: [number, number][]) => place(pts, x, y, deg);
  p.poly(P([[-3, 0], [3, 0], [3, -44], [-3, -44]]), { sw: 1.8 });
  p.poly(P([[-16, -44], [16, -44], [16, -60], [-16, -60]]), { fill: 'pink', style: 'solid', sw: 2.2 });
}

function gavelBot(p: Pen, arm: 'down' | 'up' | 'slam') {
  p.rect(30, 236, 16, 9, { sw: 1.8 });
  p.rect(58, 236, 16, 9, { sw: 1.8 });
  if (arm === 'down') gavel(p, 76, 240, 76);
  if (arm === 'up') gavel(p, 86, 150, 20);
  p.circle(52, 202, 72, { fill: 'green', gap: 4.2, sw: 2.4 });
  p.eye(40, 194, 9);
  p.eye(64, 194, 9);
  p.curve([[44, 216], [52, 221], [60, 216]], { sw: 1.6 });
  p.path('M30 176 Q52 152 74 176', { sw: 2, opaque: false });
  if (arm === 'slam') {
    gavel(p, 74, 206, -96);
    p.rect(2, 222, 30, 14, { sw: 2 });
  }
}

function tickerBot(p: Pen, face: 'up' | 'what' | 'sold') {
  p.rect(110, 236, 14, 9, { sw: 1.8 });
  p.rect(134, 236, 14, 9, { sw: 1.8 });
  p.rect(108, 178, 42, 60, { sw: 2.4 });
  p.line(129, 178, 129, 166, { sw: 2.2 });
  // tape curling out of the head
  p.curve([[162, 132], [180, 126], [184, 146], [172, 158], [188, 174]], { stroke: 'dim', sw: 6 });
  p.curve([[162, 132], [180, 126], [184, 146], [172, 158], [188, 174]], { sw: 1.4 });
  p.path(rounded(94, 104, 70, 62, 8), { fill: 'pink', style: 'zigzag', gap: 4, sw: 2.6 });
  p.rect(100, 110, 58, 30, { sw: 1.6 });
  p.eye(116, 125, 9);
  p.eye(142, 125, 9);
  const t = face === 'up' ? '+12 +4' : face === 'what' ? '?? ??' : 'SOLD';
  p.text(t, 103, 146, 7.2, { stroke: face === 'sold' ? 'stamp' : 'ink' });
}

function brickBot(p: Pen, hop = 0) {
  const y = -hop;
  p.rect(184, 236 + y, 16, 9, { sw: 1.8 });
  p.rect(212, 236 + y, 16, 9, { sw: 1.8 });
  for (const [bx, by, c] of [[180, 204, 'green'], [180, 172, 'pink']] as [number, number, 'green' | 'pink'][]) {
    for (const sx of [190, 222]) p.rect(sx - 6, by - 6 + y, 12, 7, { sw: 1.6 });
    p.rect(bx, by + y, 52, 32, { fill: c, gap: 4, sw: 2.2 });
  }
  for (const sx of [196, 216]) p.rect(sx - 6, 130 + y, 12, 7, { sw: 1.6 });
  p.rect(186, 136 + y, 40, 36, { sw: 2.4 });
  p.eye(198, 153 + y, 8);
  p.eye(216, 153 + y, 8);
}

export const auctioneers: Character = {
  id: 'auctioneers',
  name: 'The Auctioneers',
  project: 'dream-merchants',
  look: 'The Auctioneers, three small robots: a round green one with a gavel, one with a ticker-tape screen for a head, and one built from toy bricks',
  poses: {
    idle: {
      alt: 'standing in a row, the screen-head showing prices going up',
      gaze: [0, 0.3],
      draw(p) {
        gavelBot(p, 'down');
        tickerBot(p, 'up');
        brickBot(p);
      },
    },
    react: {
      alt: 'turning to look, gavel raised, the screen-head showing question marks',
      gaze: [0.6, -0.4],
      draw(p) {
        gavelBot(p, 'up');
        tickerBot(p, 'what');
        brickBot(p, 8);
      },
    },
    action: {
      alt: 'slamming the gavel down and shouting SOLD',
      gaze: [-0.6, 0.4],
      draw(p) {
        say(p, 'SOLD!', 4, 4, 18, 52, 160, { sw: 2.6 });
        gavelBot(p, 'slam');
        tickerBot(p, 'sold');
        brickBot(p, 6);
        burst(p, 20, 226, 18, 30, 5, 180, 360, { stroke: 'dim' });
      },
    },
  },
};
