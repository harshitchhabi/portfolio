// Daemons in the 3D world: drawn sprite sheets on planes that always turn to
// face the camera, with separate pupils that follow the cursor.

import { CircleGeometry, Group, Mesh, NoColorSpace, PlaneGeometry, TextureLoader, Vector3, type Camera, type ShaderMaterial, type Texture } from 'three';
import cast from '../data/characters.json';
import { spriteMaterial } from './materials';

type Id = keyof typeof cast;
const loader = new TextureLoader();
const plane = new PlaneGeometry(1, 1);
const disc = new CircleGeometry(1, 14);
const tmp = new Vector3();
const sheets = new Map<string, Texture>();
const loading = new Set<Promise<void>>();

/** Resolves once every sheet asked for so far has loaded (or failed). */
export function sheetsLoaded(): Promise<void> {
  return Promise.all(loading).then(() => undefined);
}

/** Every character texture loaded so far. */
export function allSheets(): Texture[] {
  return [...sheets.values()];
}

/** Free every character texture (the floor is going away). */
export function disposeSheets() {
  sheets.forEach((t) => t.dispose());
  sheets.clear();
  loading.clear();
}

/** One texture per character, shared by every copy of it. */
function sheet(id: string) {
  let t = sheets.get(id);
  if (!t) {
    let done = () => {};
    loading.add(new Promise<void>((res) => (done = res)));
    t = loader.load(`/characters/${id}/sheet.webp`, done, undefined, done);
    t.colorSpace = NoColorSpace; // the drawing's colours go to the screen untouched
    t.anisotropy = 4;
    sheets.set(id, t);
  }
  return t;
}

export class Sprite3D {
  readonly group = new Group();
  readonly id: Id;
  pose: string;
  private mat: ShaderMaterial;
  private body: Mesh;
  private pupils: Mesh[] = [];
  private size: number;
  /** extra vertical offset (bobbing on the beat) */
  bob = 0;

  constructor(id: Id, size: number, pose = 'idle') {
    this.id = id;
    this.size = size;
    this.pose = pose;
    const c = cast[id];
    const tex = sheet(id);
    this.mat = spriteMaterial(tex, c.sheet.cols, c.sheet.rows);
    this.body = new Mesh(plane, this.mat);
    this.body.scale.set(size, size, 1);
    this.body.position.y = size / 2;
    this.group.add(this.body);
    const pm = spriteMaterial(null);
    const most = Math.max(...Object.values(c.poses).map((p) => p.eyes.length));
    for (let i = 0; i < most; i++) {
      const p = new Mesh(disc, pm);
      p.position.z = 0.01;
      this.pupils.push(p);
      this.group.add(p);
    }
    this.setPose(pose);
  }

  setPose(pose: string) {
    const poses = cast[this.id].poses as Record<string, { row: number; eyes: { cx: number; cy: number; r: number }[] }>;
    const p = poses[pose] ?? poses.idle;
    this.pose = poses[pose] ? pose : 'idle';
    (this.mat.uniforms.uCell.value as number[])[1] = p.row;
    this.pupils.forEach((m, i) => {
      const e = p.eyes[i];
      m.visible = !!e;
      if (!e) return;
      const k = this.size / 256;
      m.userData.base = [(e.cx - 128) * k, (256 - e.cy) * k, e.r * k];
      m.scale.setScalar(e.r * k * 0.42);
    });
  }

  setFrame(f: number) {
    (this.mat.uniforms.uCell.value as number[])[0] = f;
  }

  /** Face the camera (turning around the vertical axis only) and aim the pupils. */
  update(camera: Camera, look: { x: number; y: number } | null) {
    tmp.setFromMatrixPosition(camera.matrixWorld);
    this.group.rotation.y = Math.atan2(tmp.x - this.group.position.x, tmp.z - this.group.position.z);
    this.body.position.y = this.size / 2 + this.bob;
    for (const p of this.pupils) {
      const b = p.userData.base as number[] | undefined;
      if (!b || !p.visible) continue;
      let dx = 0;
      let dy = 0;
      if (look) {
        // look is the cursor in normalised device coords; compare with the eye's
        tmp.set(b[0], b[1] + this.bob, 0);
        this.group.localToWorld(tmp);
        tmp.project(camera);
        const vx = look.x - tmp.x;
        const vy = look.y - tmp.y;
        const len = Math.hypot(vx, vy) || 1;
        const reach = Math.min(1, len * 4) * b[2] * 0.45;
        dx = (vx / len) * reach;
        dy = (vy / len) * reach;
      }
      p.position.set(b[0] + dx, b[1] + this.bob + dy, 0.01);
    }
  }
}
