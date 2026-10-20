// Everything that "arrives": panels, stamps, arrows, redaction bars, tape.
// Initial hidden states are set here by GSAP, so without JS nothing is hidden.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ENTRANCE } from '../lib/motion';
import { reducedMotion } from '../lib/prefs';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const at = (el: Element, start = 'top 78%') => ({ trigger: el, start, once: true });

export function details(root: ParentNode = document) {
  const q = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

  if (reducedMotion()) {
    // no movement: things simply fade in
    q<HTMLElement>('[data-panel], .art, [data-logentry]').forEach((el) =>
      gsap.from(el, { opacity: 0, duration: 0.4, ease: 'none', scrollTrigger: at(el, 'top 90%') }),
    );
    return;
  }

  // panels slide in from their side of the floor
  q<HTMLElement>('[data-panel]').forEach((el) => {
    const fromRight = el.closest('.daemon-left') !== null;
    gsap.from(el, { x: fromRight ? 70 : -70, opacity: 0, duration: 0.6, ease: ENTRANCE, scrollTrigger: at(el) });
  });

  // stamps thunk down: big, slightly turned and blurry, then pressed flat
  q<HTMLElement>('[data-stamp]').forEach((el) => {
    gsap.from(el, {
      scale: 1.4,
      rotation: 7,
      opacity: 0,
      filter: 'blur(3px)',
      duration: 0.22,
      ease: 'power4.in',
      delay: 0.35,
      scrollTrigger: at(el, 'top 85%'),
    });
  });

  // tape drops in with a little rotation settle
  q<SVGElement>('[data-tape]').forEach((el) => {
    gsap.from(el, { y: -16, rotation: -8, opacity: 0, duration: 0.45, ease: ENTRANCE, delay: 0.15, scrollTrigger: at(el, 'top 85%') });
  });

  // arrows, scribbled circles and underlines draw themselves
  q<SVGSVGElement>('svg.draw').forEach((svg) => {
    gsap.from(svg.querySelectorAll('path'), {
      drawSVG: 0,
      duration: 0.6,
      ease: 'power1.inOut',
      stagger: 0.06,
      scrollTrigger: at(svg, 'top 88%'),
    });
  });

  // headlines: redaction bars peel off left to right
  q<HTMLElement>('[data-redact]').forEach((h) => {
    const lines = h.querySelectorAll<HTMLElement>(':scope > span, :scope > a');
    (lines.length ? Array.from(lines) : [h]).forEach((line, i) => {
      const bar = document.createElement('span');
      bar.className = 'redact-bar';
      bar.setAttribute('aria-hidden', 'true');
      line.classList.add('has-redact');
      line.append(bar);
      gsap.fromTo(
        bar,
        { scaleX: 1 },
        {
          scaleX: 0,
          transformOrigin: '100% 50%',
          duration: 0.55,
          delay: 0.1 + i * 0.12,
          ease: ENTRANCE,
          scrollTrigger: at(h, 'top 85%'),
          onComplete: () => bar.remove(),
        },
      );
    });
  });
}
