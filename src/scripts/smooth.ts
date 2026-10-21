// Smooth scrolling that stays native underneath: the scrollbar, keyboard and
// anchor links (scripts/anchors.ts) all keep working. When the 3D floor loads it hooks ScrollTrigger
// into this same Lenis instance (getLenis()) so they agree. Not on window:
// Lenis types window.lenis as its own version info.

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { reducedMotion } from '../lib/prefs';

let instance: Lenis | null = null;

/** The page's smooth scroller, or null when scrolling is native (reduced motion, skip mode). */
export const getLenis = () => instance;

export function smooth() {
  if (reducedMotion() || document.documentElement.dataset.mode === 'skip') return null;
  const lenis = new Lenis({ lerp: 0.12 });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  instance = lenis;
  return lenis;
}
