// Decides whether this visitor gets the 3D floor or the static illustrated
// version. Runs before anything heavy loads.

import { getPref, reducedMotion } from './prefs';

export type Mode = '3d' | 'static' | 'skip';

export function pickMode(): Mode {
  if (getPref('skip-show') === 'on') return 'skip';
  if (reducedMotion()) return 'static';
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return 'static';
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return 'static';
  if (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 900) return 'static';
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return 'static';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return 'static';
  }
  return '3d';
}

export function setMode(m: Mode) {
  document.documentElement.dataset.mode = m;
}
