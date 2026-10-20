// Renders every character in src/characters into hand-drawn SVGs:
//
//   public/characters/<id>/<pose>-<0|1|2>.svg   three line-boil frames, pupils left out
//   public/characters/<id>/<pose>-still.svg     frame 0 with pupils, for plain <img> use
//   public/characters/<id>/sheet.webp           every pose × frame, a texture for the 3D floor
//   src/data/characters.json                    eyes, alt text and sheet layout
//
// Same shapes every frame, different Rough.js seeds, so the lines "boil".
// Run: node scripts/build-characters.ts   (also runs before dev and build)

import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { CAST } from '../src/characters/index.ts';
import { Pen } from '../src/characters/pen.ts';
import type { PoseName } from '../src/characters/types.ts';

const SIZE = 256;
const FRAMES = 3;
const SHEET_PX = 256; // pixels per cell in the texture

const manifest: Record<string, unknown> = {};

for (const c of CAST) {
  const dir = `public/characters/${c.id}`;
  mkdirSync(dir, { recursive: true });
  const order = Object.keys(c.poses) as PoseName[];
  const cells: string[] = [];
  const poses: Record<string, unknown> = {};

  order.forEach((name, row) => {
    const pose = c.poses[name]!;
    for (let f = 0; f < FRAMES; f++) {
      const pen = new Pen(f);
      pose.draw(pen);
      writeFileSync(`${dir}/${name}-${f}.svg`, pen.svg(SIZE, SIZE));
      cells.push(pen.group(f * SIZE, row * SIZE));
      if (f === 0) {
        writeFileSync(`${dir}/${name}-still.svg`, pen.svg(SIZE, SIZE, { gaze: pose.gaze }));
        poses[name] = { alt: `${c.look}, ${pose.alt}.`, gaze: pose.gaze, eyes: pen.eyes, row };
      }
    }
  });

  const w = FRAMES * SIZE;
  const h = order.length * SIZE;
  const k = SHEET_PX / SIZE;
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * k}" height="${h * k}" viewBox="0 0 ${w} ${h}">${cells.join('')}</svg>`;
  await sharp(Buffer.from(sheet)).webp({ quality: 70, alphaQuality: 80, effort: 5 }).toFile(`${dir}/sheet.webp`);
  manifest[c.id] = { name: c.name, project: c.project, look: c.look, size: SIZE, frames: FRAMES, poses, sheet: { cols: FRAMES, rows: order.length, px: SHEET_PX } };
}

mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/characters.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`drew ${CAST.length} characters`);
