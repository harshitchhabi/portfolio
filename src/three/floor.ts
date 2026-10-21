// The server floor: renders the world through the ink pass and flies the camera
// along its path as the page scrolls. Loaded only after the page has painted.

import { Color, DepthTexture, PerspectiveCamera, Scene, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import { buildWorld } from './world';
import { shared } from './materials';
import { InkShader } from './ink-pass';
import { Sprite3D, allSheets, disposeSheets, sheetsLoaded } from './sprites';
import { getLenis } from '../scripts/smooth';
import { BASEMENT_Y, BASEMENT_Z, STATIONS, STOPS, camPath, lookPath } from './layout';

gsap.registerPlugin(ScrollTrigger);

const DAEMONS = ['signe', 'vayu', 'honeybot', 'redacto', 'lockjaw', 'auctioneers', 'forge', 'tula'] as const;
const FOIL_MS = 2000;

export interface Floor {
  /** Resolves once textures are up and shaders compiled, so it can fade in whole. */
  ready: Promise<void>;
  pause(on: boolean): void;
  /** Called when the camera settles at a station (index) or leaves (-1). */
  onSettle(cb: (stop: string | null) => void): void;
  /** Yank the Intruder off the floor (the shell's `kill intruder`). */
  removeIntruder(): void;
  /** The Intruder creeps toward this screen point (NDC), or stops when null. */
  creep(ndc: { x: number; y: number } | null): void;
  /** Stop everything and free the GPU (leaving the home page). */
  dispose(): void;
}

// Hold still near each stop, then move with a deliberate ease that brakes hard.
const hold = (t: number) => Math.min(1, Math.max(0, (t - 0.2) / 0.6));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

export function startFloor(canvas: HTMLCanvasElement): Floor {
  const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  // keep ScrollTrigger in step with the smooth scroller
  const unLenis = getLenis()?.on('scroll', ScrollTrigger.update);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 80);
  scene.add(buildWorld());

  // ---------- characters ----------
  const daemons = STATIONS.map((s, i) => {
    const d = new Sprite3D(DAEMONS[i], DAEMONS[i] === 'auctioneers' ? 2.7 : 2.3);
    d.group.position.copy(s.daemon);
    scene.add(d.group);
    return d;
  });
  const intruder = new Sprite3D('intruder', 1.5, 'react');
  intruder.group.position.set(3.2, 0, -6);
  scene.add(intruder.group);

  // the basement: everyone is at the rave
  const dancers = DAEMONS.filter((id) => id !== 'forge' && id !== 'lockjaw');
  const crowd = dancers.map((id, i) => {
    const d = new Sprite3D(id, 1.7, i % 2 ? 'react' : 'idle');
    // a loose arc on the far side of the dance floor
    const a = Math.PI + (i / (dancers.length - 1)) * Math.PI;
    d.group.position.set(Math.cos(a) * 3.4, BASEMENT_Y, BASEMENT_Z - 0.6 + Math.sin(a) * 1.8);
    scene.add(d.group);
    return d;
  });
  const dj = new Sprite3D('forge', 1.9, 'action');
  dj.group.position.set(0, BASEMENT_Y + 1.1, BASEMENT_Z - 5.6);
  const bouncer = new Sprite3D('lockjaw', 1.9, 'react');
  bouncer.group.position.set(-5, BASEMENT_Y, BASEMENT_Z + 0.4);
  scene.add(dj.group, bouncer.group);
  const everyone = [...daemons, intruder, ...crowd, dj, bouncer];

  // ---------- passes ----------
  const normalTarget = new WebGLRenderTarget(1, 1);
  normalTarget.depthTexture = new DepthTexture(1, 1);
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  renderPass.clearColor = new Color(0x000000);
  renderPass.clearAlpha = 0;
  const ink = new ShaderPass(InkShader);
  ink.uniforms.tNormal.value = normalTarget.texture;
  ink.uniforms.tDepth.value = normalTarget.depthTexture;
  ink.uniforms.uNear.value = camera.near;
  ink.uniforms.uFar.value = camera.far;
  ink.uniforms.uDpr.value = dpr;
  composer.addPass(renderPass);
  composer.addPass(ink);

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    normalTarget.setSize(Math.round(w * dpr), Math.round(h * dpr));
    camera.aspect = w / h;
    // keep the framing on narrow screens by widening the lens
    camera.fov = w / h < 1 ? 64 : 50;
    camera.updateProjectionMatrix();
    ink.uniforms.uRes.value = [w * dpr, h * dpr];
  };
  resize();
  window.addEventListener('resize', resize);
  let raf = 0;

  // ---------- scroll → camera ----------
  const stops = STOPS.map((s) => ({ ...s, el: document.getElementById(s.id) })).filter((s): s is typeof s & { el: HTMLElement } => !!s.el);
  const seg = stops.slice(1).map(() => 0);
  const triggers = stops.slice(1).map((to, k) =>
    ScrollTrigger.create({
      trigger: stops[k].el,
      start: 'center center',
      endTrigger: to.el,
      end: 'center center',
      onUpdate: (self) => (seg[k] = self.progress),
      onRefresh: (self) => (seg[k] = self.progress),
    }),
  );

  let settled: string | null = null;
  const settleCbs: ((s: string | null) => void)[] = [];
  let moveAmt = 0;

  function cameraParam() {
    let k = 0;
    while (k < seg.length && seg[k] >= 1) k++;
    if (k === seg.length) return { u: stops[stops.length - 1].u, moving: 0, at: stops[stops.length - 1].id };
    const t = hold(seg[k]);
    const u = stops[k].u + ease(t) * (stops[k + 1].u - stops[k].u);
    const at = t === 0 ? stops[k].id : t === 1 ? stops[k + 1].id : null;
    return { u, moving: Math.sin(Math.PI * t), at };
  }

  // ---------- the Intruder ----------
  let foilUntil = 0;
  let removed = false;
  let creepTo: { x: number; y: number } | null = null;
  const target = new Vector3(3.2, 0, -6);

  function arrive(stop: string | null) {
    if (stop === settled) return;
    settled = stop;
    settleCbs.forEach((cb) => cb(stop));
    daemons.forEach((d) => d.pose === 'action' && d.setPose('idle'));
    const m = stop?.match(/^station-(\d)$/);
    if (m && !removed) {
      const s = STATIONS[Number(m[1]) - 1];
      const d = daemons[s.index];
      d.setPose('action');
      intruder.setPose('action');
      intruder.group.position.copy(s.foil);
      target.copy(s.foil);
      foilUntil = performance.now() + FOIL_MS;
    }
  }

  function moveIntruder(now: number, camZ: number) {
    intruder.group.visible = !removed && settled !== 'contact';
    if (removed) return;
    if (now < foilUntil) return;
    if (foilUntil && now >= foilUntil) {
      foilUntil = 0;
      intruder.setPose('react');
      daemons.forEach((d) => d.pose === 'action' && d.setPose('idle'));
    }
    if (settled === 'basement') {
      target.set(-7.1, BASEMENT_Y, BASEMENT_Z - 0.2);
      if (intruder.pose !== 'idle') intruder.setPose('idle');
    } else if (creepTo && settled?.startsWith('station')) {
      // idle cursor: creep out toward it, low to the floor
      target.set(creepTo.x * 2.4, 0, camZ - 4.2);
      if (intruder.pose !== 'idle') intruder.setPose('idle');
    } else if (camZ > -126) {
      // peek from behind the next rack ahead
      const next = STATIONS.find((s) => s.z < camZ - 3) ?? STATIONS[STATIONS.length - 1];
      target.set(-next.side * 3.45, 0, Math.max(next.z + 4.2, camZ - 9));
      if (intruder.pose !== 'react') intruder.setPose('react');
    }
    intruder.group.position.lerp(target, 0.06);
  }

  // ---------- render loop ----------
  let paused = false;
  let look: { x: number; y: number } | null = null;
  const camPos = new Vector3();
  const camLook = new Vector3();
  let frames = 0;
  let lastFps = performance.now();

  const onMove = (e: PointerEvent) => (look = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 });
  window.addEventListener('pointermove', onMove, { passive: true });

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (paused || document.hidden) return;

    const { u, moving, at } = cameraParam();
    camPath.getPoint(u, camPos);
    lookPath.getPoint(u, camLook);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    if (moving < 0.01 && at) arrive(at);
    else if (moving > 0.05) arrive(null);

    // the print slips out of register while moving and snaps back on arrival
    moveAmt += (moving - moveAmt) * 0.18;
    ink.uniforms.uMisregister.value = 1 + 7 * moveAmt;
    ink.uniforms.uHatch.value = 1 - 0.18 * moveAmt;

    const html = document.documentElement;
    const beatFrame = html.dataset.frame;
    const boil = beatFrame !== undefined ? Number(beatFrame) : Math.floor(now / 100) % 3;
    const beat = Number(html.style.getPropertyValue('--beat')) || 0;
    const sound = beatFrame !== undefined;
    ink.uniforms.uBoil.value = boil;
    shared.uTime.value = now / 1000;
    shared.uStrobe.value = sound ? 0.25 + beat * 0.75 : 0.45;

    moveIntruder(now, camPos.z);
    for (const d of crowd) d.bob = sound ? beat * 0.14 : 0;
    dj.bob = sound ? beat * 0.08 : 0;
    for (const s of everyone) {
      s.setFrame(boil);
      s.update(camera, look);
    }

    shared.uPass.value = 1;
    renderer.setRenderTarget(normalTarget);
    renderer.clear();
    renderer.render(scene, camera);
    shared.uPass.value = 0;
    renderer.setRenderTarget(null);
    composer.render();

    frames++;
    if (now - lastFps > 1000) {
      canvas.dataset.fps = String(Math.round((frames * 1000) / (now - lastFps)));
      frames = 0;
      lastFps = now;
    }
  }
  // Don't draw anything until the drawings and shaders are ready: compiling on
  // the first frame is what made the page hitch as the floor came in.
  let disposed = false;
  const ready = (async () => {
    await sheetsLoaded();
    if (disposed) return;
    allSheets().forEach((t) => renderer.initTexture(t));
    await renderer.compileAsync(scene, camera);
    if (disposed) return;
    ScrollTrigger.refresh();
    raf = requestAnimationFrame(frame);
    // two frames on screen (still invisible) so the ink pass is compiled too
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  })();

  return {
    ready,
    pause(on) {
      paused = on;
      if (!on) ScrollTrigger.refresh();
    },
    onSettle(cb) {
      settleCbs.push(cb);
    },
    removeIntruder() {
      removed = true;
    },
    creep(ndc) {
      creepTo = ndc;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      triggers.forEach((t) => t.kill());
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      unLenis?.();
      scene.traverse((o) => {
        const m = o as unknown as { geometry?: { dispose(): void }; material?: { dispose(): void } };
        m.geometry?.dispose();
        m.material?.dispose();
      });
      disposeSheets();
      normalTarget.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
