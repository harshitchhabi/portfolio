// Smooth scrolling that stays native underneath: the scrollbar, keyboard and
// anchor links all keep working. Lenis drives ScrollTrigger so they agree.

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from '../lib/prefs';

gsap.registerPlugin(ScrollTrigger);

export function smooth() {
  if (reducedMotion() || document.documentElement.dataset.mode === 'skip') return null;
  const lenis = new Lenis({ lerp: 0.12, anchors: { offset: -60 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
