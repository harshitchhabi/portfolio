// Builds the server floor out of primitives: racks, cables, a raised floor,
// station props, the stairwell and the basement. Repeated parts are instanced
// so the whole scene stays well under 50k triangles.

import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type Material,
} from 'three';
import { FILL, inkMaterial } from './materials';
import { BASEMENT_Y, BASEMENT_Z, FLOOR_END, STATIONS } from './layout';

const box = new BoxGeometry(1, 1, 1);
const m4 = new Matrix4();

function mesh(geo: BoxGeometry | CylinderGeometry | SphereGeometry | TorusGeometry | PlaneGeometry | TubeGeometry, mat: Material, x = 0, y = 0, z = 0) {
  const m = new Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

function cube(mat: Material, w: number, h: number, d: number, x: number, y: number, z: number) {
  const m = mesh(box, mat, x, y, z);
  m.scale.set(w, h, d);
  return m;
}

/** Is z inside a station's clearing on this side of the aisle? */
const clearing = (z: number, side: number) => STATIONS.some((s) => s.side === side && Math.abs(z - s.z) < 3.2);

export function buildWorld() {
  const world = new Group();
  const plain = inkMaterial(FILL.none, 0.9);
  const dark = inkMaterial(FILL.none, 0.35);
  const pink = inkMaterial(FILL.pink, 0.9);
  const green = inkMaterial(FILL.green, 0.9);

  // ---------- raised floor ----------
  const floorLen = 7 - FLOOR_END;
  const floor = mesh(new PlaneGeometry(14, floorLen), inkMaterial(FILL.floor, 1), 0, 0, 7 - floorLen / 2);
  floor.rotation.x = -Math.PI / 2;
  world.add(floor);

  // ---------- racks along both sides ----------
  const rackSpots: { x: number; z: number }[] = [];
  for (const side of [-1, 1]) {
    for (let z = 2; z > FLOOR_END + 4; z -= 1.15) {
      if (clearing(z, side)) continue;
      rackSpots.push({ x: side * 4.1, z });
      if (Math.abs(Math.sin(z * 1.7)) > 0.35) rackSpots.push({ x: side * 5.6, z: z - 0.4 });
    }
  }
  const racks = new InstancedMesh(box, plain, rackSpots.length);
  const slots = new InstancedMesh(box, dark, rackSpots.length * 7);
  const leds = new InstancedMesh(box, inkMaterial(FILL.ledPink), rackSpots.length * 3);
  const ledsG = new InstancedMesh(box, inkMaterial(FILL.ledGreen), rackSpots.length * 3);
  let si = 0;
  let li = 0;
  rackSpots.forEach((r, i) => {
    const h = 2.3 + (Math.abs(Math.sin(r.z * 3.1)) > 0.8 ? 0.4 : 0);
    m4.makeScale(0.95, h, 1.05).setPosition(r.x, h / 2, r.z);
    racks.setMatrixAt(i, m4);
    const face = r.x - Math.sign(r.x) * 0.53; // the side facing the aisle
    for (let k = 0; k < 7; k++) {
      m4.makeScale(0.06, 0.16, 0.86).setPosition(face, 0.35 + k * 0.27, r.z);
      slots.setMatrixAt(si++, m4);
    }
    for (let k = 0; k < 3; k++) {
      m4.makeScale(0.07, 0.05, 0.05).setPosition(face - Math.sign(r.x) * 0.02, 0.45 + k * 0.62, r.z + 0.32);
      leds.setMatrixAt(li, m4);
      m4.makeScale(0.07, 0.05, 0.05).setPosition(face - Math.sign(r.x) * 0.02, 0.6 + k * 0.62, r.z + 0.22);
      ledsG.setMatrixAt(li++, m4);
    }
  });
  world.add(racks, slots, leds, ledsG);

  // ---------- cable bundles hanging between racks across the aisle ----------
  const cableMat = inkMaterial(FILL.none, 0.5);
  for (let z = -4; z > FLOOR_END + 6; z -= 6.5) {
    for (let k = 0; k < 3; k++) {
      const sag = 0.25 + k * 0.12;
      const y = 3.15 + k * 0.06;
      const curve = new CatmullRomCurve3([
        new Vector3(-4.1, y, z + k * 0.12),
        new Vector3(-1.5, y - sag * 0.8, z + k * 0.12),
        new Vector3(1.5, y - sag, z + k * 0.12),
        new Vector3(4.1, y, z + k * 0.12),
      ]);
      world.add(mesh(new TubeGeometry(curve, 18, 0.035 + k * 0.012, 4), k === 1 ? pink : cableMat));
    }
  }
  // overhead cable trays along the aisle
  for (const x of [-2.6, 2.6]) world.add(cube(plain, 0.5, 0.08, -FLOOR_END + 4, x, 3.25, FLOOR_END / 2));

  // ---------- station props ----------
  STATIONS.forEach((s, i) => world.add(prop(i, s.side, s.z, { plain, dark, pink, green })));

  // ---------- stairwell down to the basement ----------
  for (let k = 0; k < 14; k++) {
    world.add(cube(k % 2 ? plain : dark, 3.2, 0.42, 0.8, 0, -k * 0.43 - 0.21, FLOOR_END - 0.4 - k * 0.8));
  }
  world.add(cube(plain, 0.12, 1.1, 11.5, -1.75, -2.6, FLOOR_END - 5.6)); // handrails
  world.add(cube(plain, 0.12, 1.1, 11.5, 1.75, -2.6, FLOOR_END - 5.6));

  world.add(basement({ plain, dark, pink, green }));
  return world;
}

type Mats = { plain: Material; dark: Material; pink: Material; green: Material };

function prop(i: number, side: number, z: number, m: Mats) {
  const g = new Group();
  const x = side * 3.6;
  switch (i) {
    case 0: {
      // Signify: camera on a tripod pointed at a big screen
      g.add(cube(m.green, 0.5, 0.35, 0.35, x, 1.5, z + 1.6));
      g.add(mesh(new CylinderGeometry(0.12, 0.14, 0.25, 10), m.plain, x - side * 0.3, 1.5, z + 1.6).rotateZ(Math.PI / 2));
      for (const a of [0, 2.1, 4.2]) {
        const leg = cube(m.plain, 0.04, 1.4, 0.04, x + Math.cos(a) * 0.25, 0.68, z + 1.6 + Math.sin(a) * 0.25);
        leg.rotation.set(Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25);
        g.add(leg);
      }
      g.add(cube(m.plain, 0.1, 1.3, 2.0, side * 4.4, 1.6, z - 1.4));
      g.add(cube(m.pink, 0.04, 1.0, 1.7, side * 4.33, 1.6, z - 1.4));
      break;
    }
    case 1: {
      // Vayu Rakshak: a dish on a pole and a map table
      g.add(mesh(new CylinderGeometry(0.06, 0.06, 2.4, 8), m.plain, x, 1.2, z - 1.2));
      const dish = mesh(new SphereGeometry(0.9, 14, 6, 0, Math.PI * 2, 0, 0.9), m.green, x, 2.5, z - 1.2);
      dish.rotation.set(-0.7, 0, side * 0.4);
      g.add(dish);
      g.add(cube(m.plain, 2.0, 0.08, 1.2, x - side * 0.3, 0.85, z + 1.5));
      g.add(cube(m.pink, 1.7, 0.02, 0.9, x - side * 0.3, 0.9, z + 1.5));
      for (const [dx, dz] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]) g.add(cube(m.plain, 0.06, 0.85, 0.06, x - side * 0.3 + dx, 0.42, z + 1.5 + dz));
      break;
    }
    case 2: {
      // IDS: a glass honeypot jar and a crate of captured traffic
      g.add(mesh(new CylinderGeometry(0.7, 0.75, 1.5, 16, 1, true), m.plain, x, 0.75, z - 1.3));
      g.add(mesh(new CylinderGeometry(0.62, 0.62, 0.9, 16), m.pink, x, 0.48, z - 1.3));
      g.add(mesh(new CylinderGeometry(0.78, 0.78, 0.18, 16), m.green, x, 1.6, z - 1.3));
      g.add(cube(m.plain, 1.1, 0.8, 1.1, x - side * 0.2, 0.4, z + 1.7));
      g.add(cube(m.dark, 1.12, 0.06, 1.12, x - side * 0.2, 0.6, z + 1.7));
      break;
    }
    case 3: {
      // PrivacyGate: a gate and stacks of documents waiting to go through
      g.add(cube(m.plain, 0.15, 2.2, 0.15, side * 1.0, 1.1, z - 2.2));
      g.add(cube(m.plain, 0.15, 2.2, 0.15, side * 3.4, 1.1, z - 2.2));
      g.add(cube(m.green, 2.5, 0.18, 0.12, side * 2.2, 1.9, z - 2.2));
      for (let k = 0; k < 4; k++) g.add(cube(k % 2 ? m.plain : m.pink, 0.7, 0.06, 0.9, x + 0.1 * k, 0.03 + k * 0.07, z + 1.6));
      g.add(cube(m.plain, 0.7, 0.5, 0.9, x - side * 0.9, 0.25, z + 1.4));
      break;
    }
    case 4: {
      // Secure File Hashing: a vault door and a safe
      const door = mesh(new CylinderGeometry(1.1, 1.1, 0.2, 20), m.plain, side * 4.3, 1.3, z - 1.2);
      door.rotation.z = Math.PI / 2;
      g.add(door);
      const wheel = mesh(new TorusGeometry(0.45, 0.06, 6, 16), m.pink, side * 4.15, 1.3, z - 1.2);
      wheel.rotation.y = Math.PI / 2;
      g.add(wheel);
      g.add(cube(m.green, 0.9, 1.0, 0.9, x - side * 0.4, 0.5, z + 1.6));
      g.add(cube(m.dark, 0.5, 0.5, 0.05, x - side * 0.4, 0.55, z + 1.13));
      break;
    }
    case 5: {
      // Dream Merchants: an auction podium and crates of lots
      g.add(cube(m.pink, 1.0, 1.1, 0.7, x - side * 0.3, 0.55, z - 1.6));
      g.add(cube(m.plain, 1.2, 0.08, 0.9, x - side * 0.3, 1.14, z - 1.6));
      for (let k = 0; k < 3; k++) g.add(cube(k === 1 ? m.green : m.plain, 0.7, 0.7, 0.7, x + (k - 1) * 0.8, 0.35 + (k === 1 ? 0.7 : 0), z + 1.7 - (k === 1 ? 0.3 : 0)));
      break;
    }
    default: {
      // NovaCraft: a furnace and a stack of half-made bricks
      g.add(cube(m.plain, 1.5, 1.8, 1.2, side * 4.3, 0.9, z - 1.2));
      g.add(cube(m.pink, 0.05, 0.6, 0.8, side * 4.3 - side * 0.76, 0.7, z - 1.2));
      for (let k = 0; k < 5; k++) g.add(cube(k < 3 ? m.green : m.plain, 0.5, 0.25, 0.25, x - side * 0.2 + (k % 3) * 0.52 - 0.5, 0.125 + Math.floor(k / 3) * 0.26, z + 1.6));
    }
  }
  return g;
}

function basement(m: Mats) {
  const g = new Group();
  const y = BASEMENT_Y;
  const z = BASEMENT_Z;
  // room shell
  const wall = inkMaterial(FILL.none, 0.6);
  const floor = mesh(new PlaneGeometry(16, 22), inkMaterial(FILL.floor, 0.8), 0, y, z + 2);
  floor.rotation.x = -Math.PI / 2;
  g.add(floor);
  g.add(cube(wall, 16, 6, 0.3, 0, y + 3, z - 8.5)); // back wall
  g.add(cube(wall, 0.3, 6, 22, -8, y + 3, z + 2));
  g.add(cube(wall, 0.3, 6, 22, 8, y + 3, z + 2));
  // dance floor tiles that light up with the beat
  const tPink = inkMaterial(FILL.strobePink);
  const tGreen = inkMaterial(FILL.strobeGreen);
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 1; j++) g.add(cube((i + j) % 2 === 0 ? tPink : tGreen, 1.15, 0.04, 1.15, i * 1.2, y + 0.02, z + 1 + j * 1.2));
  }
  // strobe panels on the walls
  for (let i = -3; i <= 3; i++) g.add(cube(i % 2 ? tPink : tGreen, 1.2, 0.8, 0.05, i * 2, y + 4.4, z - 8.3));
  for (const sx of [-7.8, 7.8]) for (let k = 0; k < 4; k++) g.add(cube(k % 2 ? tPink : tGreen, 0.05, 0.7, 1.4, sx, y + 3.8, z - 4 + k * 3));
  // DJ booth with speakers
  g.add(cube(m.plain, 3.0, 1.1, 1.0, 0, y + 0.55, z - 5));
  g.add(cube(m.pink, 3.05, 0.12, 1.05, 0, y + 1.12, z - 5));
  for (const sx of [-2.6, 2.6]) {
    g.add(cube(m.dark, 1.0, 2.2, 0.9, sx, y + 1.1, z - 5.4));
    g.add(mesh(new CylinderGeometry(0.32, 0.32, 0.05, 14), m.plain, sx, y + 1.5, z - 4.93).rotateX(Math.PI / 2));
    g.add(mesh(new CylinderGeometry(0.2, 0.2, 0.05, 12), m.plain, sx, y + 0.6, z - 4.93).rotateX(Math.PI / 2));
  }
  // a side door on the left wall, with the bouncer's rope in front of it
  g.add(cube(m.plain, 0.2, 2.6, 0.2, -7.6, y + 1.3, z - 1.3));
  g.add(cube(m.plain, 0.2, 2.6, 0.2, -7.6, y + 1.3, z + 1.3));
  g.add(cube(m.plain, 0.2, 0.2, 2.8, -7.6, y + 2.7, z));
  g.add(cube(m.dark, 0.05, 2.5, 2.4, -7.82, y + 1.25, z));
  for (const sz of [z - 1.1, z + 1.1]) g.add(mesh(new CylinderGeometry(0.06, 0.08, 0.9, 8), m.plain, -5.8, y + 0.45, sz));
  const rope = new CatmullRomCurve3([new Vector3(-5.8, y + 0.85, z - 1.1), new Vector3(-5.8, y + 0.6, z), new Vector3(-5.8, y + 0.85, z + 1.1)]);
  g.add(mesh(new TubeGeometry(rope, 10, 0.04, 4), m.pink));
  return g;
}
