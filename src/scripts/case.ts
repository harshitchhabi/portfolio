import { projectTitleTransitions } from './vt';

projectTitleTransitions();

// Sector bar fallback for browsers without CSS scroll-driven animations:
// same fill rule (a sector starts when its top reaches mid-screen and is
// complete when its bottom does), driven by a scroll listener.
if (!CSS.supports('animation-timeline: view()')) {
  const segs = Array.from(document.querySelectorAll<HTMLElement>('[data-seg]'));
  const sectors = segs.map((s) => document.getElementById(`s${s.dataset.seg}`));
  let queued = false;

  const update = () => {
    queued = false;
    const mid = window.innerHeight / 2;
    segs.forEach((seg, i) => {
      const el = sectors[i];
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      seg.style.setProperty('--p', p.toFixed(3));
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}
