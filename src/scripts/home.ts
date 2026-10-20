// Home page boot: pick 3D or static, and only then (after the page has painted
// and gone idle) fetch Three.js and start the floor.

import { pickMode, setMode } from '../lib/mode';
import { trackEyes } from './eyes';
import { details } from './details';
import { smooth } from './smooth';
import { titleTransitions } from './vt';
import type { Floor } from '../three/floor';

const mode = pickMode();
setMode(mode);
titleTransitions();
trackEyes();
smooth();
details();

declare global {
  interface Window {
    floor?: Floor;
  }
}

const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));

async function boot() {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas.floor');
  if (!canvas) return;
  try {
    const { startFloor } = await import('../three/floor');
    window.floor = startFloor(canvas);
    document.documentElement.dataset.floor = 'on';
    window.dispatchEvent(new CustomEvent('floor:ready'));
  } catch (err) {
    // anything goes wrong: fall back to the static drawings
    console.warn('3D floor unavailable, showing the static version', err);
    setMode('static');
  }
}

if (mode === '3d') {
  if (document.readyState === 'complete') idle(boot);
  else window.addEventListener('load', () => idle(boot), { once: true });
}

// Toggling "skip the show" pauses the floor, or brings it (back) up.
window.addEventListener('skip:change', (e) => {
  const on = (e as CustomEvent<{ on: boolean }>).detail.on;
  if (on) window.floor?.pause(true);
  else if (window.floor) window.floor.pause(false);
  else if (document.documentElement.dataset.mode === '3d') boot();
  import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.refresh());
});

// Static drawings react when the cursor comes close (Signe waves back, and so on).
if (window.matchMedia('(pointer: fine)').matches) {
  const arts = Array.from(document.querySelectorAll<HTMLElement>('[data-near-react]'));
  let queued = false;
  let px = 0;
  let py = 0;
  const check = () => {
    queued = false;
    for (const a of arts) {
      const d = a.querySelector<HTMLElement>('[data-daemon]');
      if (!d) continue;
      const r = d.getBoundingClientRect();
      const near = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2)) < r.width * 0.75;
      d.dataset.show = near ? 'react' : 'action';
    }
  };
  window.addEventListener(
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
window.addEventListener('floor:ready', () => {
  let timer = 0;
  let last = { x: 0, y: 0 };
  const arm = () => {
    window.clearTimeout(timer);
    window.floor?.creep(null);
    timer = window.setTimeout(() => window.floor?.creep(last), 6000);
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      last = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 };
      arm();
    },
    { passive: true },
  );
  window.addEventListener('scroll', arm, { passive: true });
  arm();
});
