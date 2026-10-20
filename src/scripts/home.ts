// Home page boot: pick 3D or static, and only then (after the page has painted
// and gone idle) fetch Three.js and start the floor.

import { pickMode, setMode } from '../lib/mode';
import { trackEyes } from './eyes';
import type { Floor } from '../three/floor';

const mode = pickMode();
setMode(mode);
trackEyes();

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
