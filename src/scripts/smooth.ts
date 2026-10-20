// Smooth scrolling that stays native underneath: the scrollbar, keyboard and
// anchor links (scripts/anchors.ts) all keep working. When the 3D floor loads it hooks ScrollTrigger
// into this same Lenis instance (window.lenis) so they agree.

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { reducedMotion } from '../lib/prefs';

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

export function smooth() {
  if (reducedMotion() || document.documentElement.dataset.mode === 'skip') return null;
  const lenis = new Lenis({ lerp: 0.12 });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
  return lenis;
}
