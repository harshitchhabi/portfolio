// Everything that "arrives": panels, stamps, arrows, redaction bars, tape.
// Two IntersectionObservers do the work, so nothing is measured up front:
// one sets an element's starting state as it approaches the viewport, the
// other plays its entrance once it's actually in view. Without JS, nothing
// is ever hidden.

import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ENTRANCE } from '../lib/motion';
import { reducedMotion } from '../lib/prefs';

gsap.registerPlugin(DrawSVGPlugin);

type Kind = 'panel' | 'stamp' | 'tape' | 'draw' | 'ink' | 'redact' | 'fade';
interface Job {
  kind: Kind;
  primed?: boolean;
  played?: boolean;
  tween?: gsap.core.Tween | gsap.core.Timeline;
}

const jobs = new WeakMap<Element, Job>();

function prime(el: Element, job: Job) {
  if (job.primed) return;
  job.primed = true;
  switch (job.kind) {
    case 'panel': {
      const fromRight = el.closest('.daemon-left') !== null;
      job.tween = gsap.from(el, { x: fromRight ? 70 : -70, opacity: 0, duration: 0.6, ease: ENTRANCE, paused: true });
      break;
    }
    case 'stamp':
      job.tween = gsap.from(el, { scale: 1.4, rotation: 7, opacity: 0, filter: 'blur(3px)', duration: 0.22, ease: 'power4.in', delay: 0.35, paused: true });
      break;
    case 'tape':
      job.tween = gsap.from(el, { y: -16, rotation: -8, opacity: 0, duration: 0.45, ease: ENTRANCE, delay: 0.15, paused: true });
      break;
    case 'draw':
      job.tween = gsap.from(el.querySelectorAll('path'), { drawSVG: 0, duration: 0.6, ease: 'power1.inOut', stagger: 0.06, paused: true });
      break;
    case 'ink':
      job.tween = gsap.from(el, { opacity: 0, y: 8, duration: 0.5, delay: 0.45, ease: ENTRANCE, paused: true });
      break;
    case 'fade':
      job.tween = gsap.from(el, { opacity: 0, duration: 0.4, ease: 'none', paused: true });
      break;
    case 'redact': {
      // redaction bars peel off left to right
      const lines = el.querySelectorAll<HTMLElement>(':scope > span, :scope > a');
      const tl = gsap.timeline({ paused: true });
      (lines.length ? Array.from(lines) : [el as HTMLElement]).forEach((line, i) => {
        const bar = document.createElement('span');
        bar.className = 'redact-bar';
        bar.setAttribute('aria-hidden', 'true');
        line.classList.add('has-redact');
        line.append(bar);
        tl.fromTo(bar, { scaleX: 1 }, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.55, ease: ENTRANCE, onComplete: () => bar.remove() }, 0.1 + i * 0.12);
      });
      job.tween = tl;
      break;
    }
  }
}

/** Watch the arrivals in `root`. Returns a cleanup for page changes. */
export function details(root: ParentNode = document): () => void {
  const reduced = reducedMotion();
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const job = jobs.get(e.target);
        if (job) prime(e.target, job);
        near.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px 60% 0px' },
  );
  const inView = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const job = jobs.get(e.target);
        if (!job || job.played) continue;
        prime(e.target, job);
        job.played = true;
        job.tween?.play();
        inView.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );

  const add = (sel: string, kind: Kind) =>
    root.querySelectorAll(sel).forEach((el) => {
      const k: Kind = reduced ? 'fade' : kind;
      if (reduced && !['panel', 'ink'].includes(kind)) return; // reduced motion: only simple fades
      jobs.set(el, { kind: k });
      near.observe(el);
      inView.observe(el);
    });

  add('[data-panel]', 'panel');
  add('[data-stamp]', 'stamp');
  add('[data-tape]', 'tape');
  add('svg.draw', 'draw');
  add('[data-logentry] [data-ink]', 'ink');
  add('[data-redact]', 'redact');

  return () => {
    near.disconnect();
    inView.disconnect();
  };
}
