// Home page: the 3D floor (when this device gets it), daemons reacting to the
// cursor, and the Intruder creeping toward an idle cursor. mount() runs on
// every visit to the page; the function it returns undoes all of it.

import { setMode } from '../lib/mode';
import type { Floor } from '../three/floor';

declare global {
  interface Window {
    floor?: Floor;
  }
}

const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));

export function mount(): () => void {
  const html = document.documentElement;
  const off: (() => void)[] = [];
  const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
    window.addEventListener(type, fn, opts);
    off.push(() => window.removeEventListener(type, fn, opts));
  };
  let alive = true;

  async function boot() {
    if (!alive || window.floor || html.dataset.mode !== '3d') return;
    const canvas = document.querySelector<HTMLCanvasElement>('canvas.floor');
    if (!canvas) return;
    try {
      const { startFloor } = await import('../three/floor');
      if (!alive) return;
      const floor = startFloor(canvas);
      window.floor = floor;
      // fade in only once it can draw the whole scene, not a half-loaded one
      await floor.ready;
      if (!alive || window.floor !== floor) return;
      html.dataset.floor = 'on';
      armCreep();
    } catch (err) {
      // anything goes wrong: fall back to the static drawings
      console.warn('3D floor unavailable, showing the static version', err);
      setMode('static');
    }
  }

  if (document.readyState === 'complete') idle(boot);
  else on('load', () => idle(boot), { once: true });

  // Toggling "skip the show" pauses the floor, or brings it (back) up.
  const onSkip = (e: Event) => {
    const skipping = (e as CustomEvent<{ on: boolean }>).detail.on;
    if (skipping) window.floor?.pause(true);
    else if (window.floor) window.floor.pause(false);
    else boot();
  };
  window.addEventListener('skip:change', onSkip);
  off.push(() => window.removeEventListener('skip:change', onSkip));

  // Static drawings react when the cursor comes close (Signe waves back, and so on).
  if (window.matchMedia('(pointer: fine)').matches) {
    const arts = Array.from(document.querySelectorAll<HTMLElement>('[data-near-react] [data-daemon]'));
    let queued = false;
    let px = 0;
    let py = 0;
    const check = () => {
      queued = false;
      for (const d of arts) {
        const r = d.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const near = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2)) < r.width * 0.75;
        d.dataset.show = near ? 'react' : 'action';
      }
    };
    on(
      'pointermove',
      (e) => {
        px = e.clientX;
        py = e.clientY;
        if (!queued) {
          queued = true;
          requestAnimationFrame(check);
        }
      },
      { passive: true },
    );
  }

  // Leave the cursor still for ~6s on the floor and the Intruder creeps toward it;
  // move, and it darts back behind a rack.
  let creepTimer = 0;
  let last = { x: 0, y: 0 };
  function armCreep() {
    const arm = () => {
      window.clearTimeout(creepTimer);
      window.floor?.creep(null);
      creepTimer = window.setTimeout(() => window.floor?.creep(last), 6000);
    };
    on(
      'pointermove',
      (e) => {
        last = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 };
        arm();
      },
      { passive: true },
    );
    on('scroll', arm, { passive: true });
    arm();
  }

  return () => {
    alive = false;
    window.clearTimeout(creepTimer);
    off.forEach((f) => f());
    window.floor?.dispose();
    window.floor = undefined;
    delete html.dataset.floor;
  };
}
