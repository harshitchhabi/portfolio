// Where everything sits on the server floor, and the path the camera flies.
// Units are metres. The aisle runs down -z; racks line both sides.

import { CatmullRomCurve3, Vector3 } from 'three';

export const STATION_COUNT = 8;
export const FIRST_Z = -14;
export const STEP_Z = 15;
export const FLOOR_END = -141; // where the stairwell opens
export const BASEMENT_Y = -6;
export const BASEMENT_Z = -157;

export interface Station {
  index: number;
  z: number;
  /** -1: daemon on the left of the aisle (panel on the right), 1: the other way. */
  side: -1 | 1;
  daemon: Vector3;
  /** where the Intruder gets foiled */
  foil: Vector3;
}

export const STATIONS: Station[] = Array.from({ length: STATION_COUNT }, (_, i) => {
  const z = FIRST_Z - i * STEP_Z;
  const side = (i % 2 === 0 ? -1 : 1) as -1 | 1;
  return {
    index: i,
    z,
    side,
    daemon: new Vector3(side * 2.3, 0, z),
    foil: new Vector3(side * 0.7, 0, z - 1.4),
  };
});

/**
 * Camera keyframes. Each stop is a place the camera settles; points between
 * stops are glide points. `stop` marks which HTML section owns a keyframe.
 */
interface Key {
  pos: Vector3;
  look: Vector3;
  stop?: string;
}

const keys: Key[] = [{ pos: new Vector3(0, 2.7, 7), look: new Vector3(0, 1.1, -12), stop: 'hero' }];

STATIONS.forEach((s, i) => {
  const prevZ = i === 0 ? 7 : STATIONS[i - 1].z;
  keys.push({ pos: new Vector3(-s.side * 0.4, 2.1, (prevZ + s.z) / 2 + 2), look: new Vector3(0, 1.3, s.z - 6) });
  keys.push({
    pos: new Vector3(-s.side * 0.9, 1.65, s.z + 5.2),
    look: new Vector3(s.side * 0.15, 1.25, s.z),
    stop: `station-${i + 1}`,
  });
});

const last = STATIONS[STATION_COUNT - 1].z;
keys.push({ pos: new Vector3(0, 2.2, last - 6), look: new Vector3(0, 0.4, FLOOR_END - 6) });
keys.push({ pos: new Vector3(0, 2.6, FLOOR_END + 6), look: new Vector3(0, -2.5, FLOOR_END - 8), stop: 'logbook' });
keys.push({ pos: new Vector3(0, -1.2, FLOOR_END - 4.5), look: new Vector3(0, -4.4, BASEMENT_Z) });
keys.push({ pos: new Vector3(0.6, -3.9, BASEMENT_Z + 4.2), look: new Vector3(-1.2, -4.9, BASEMENT_Z - 4), stop: 'basement' });
keys.push({ pos: new Vector3(2.4, -3.3, BASEMENT_Z + 4.6), look: new Vector3(-3, -4.7, BASEMENT_Z - 1), stop: 'contact' });

export const camPath = new CatmullRomCurve3(
  keys.map((k) => k.pos),
  false,
  'centripetal',
);
export const lookPath = new CatmullRomCurve3(
  keys.map((k) => k.look),
  false,
  'centripetal',
);

/** Stops in scroll order: section id → curve parameter (0..1). */
export const STOPS = keys
  .map((k, i) => ({ id: k.stop, u: i / (keys.length - 1) }))
  .filter((k): k is { id: string; u: number } => !!k.id);
