// Hand-drawn cursor with a short ink trail. Off for touch, reduced motion and
// "skip the show". Keyboard focus never depends on it.

import { getStroke } from 'perfect-freehand';
import { reducedMotion } from '../lib/prefs';

const TRAIL_MS = 300;
const MAX_POINTS = 20;

function pathFrom(stroke: number[][]) {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0.toFixed(1), y0.toFixed(1), ((x0 + x1) / 2).toFixed(1), ((y0 + y1) / 2).toFixed(1));
      return acc;
    },
    ['M', ...stroke[0].map((v) => v.toFixed(1)), 'Q'],
  );
  return d.join(' ') + ' Z';
}

export function cursor() {
  const root = document.querySelector<HTMLElement>('[data-cursor-root]');
  if (!root) return;
  const html = document.documentElement;
  const allowed = () => window.matchMedia('(pointer: fine)').matches && !reducedMotion() && html.dataset.mode !== 'skip';
  if (!allowed()) return;

  const tip = root.querySelector<HTMLElement>('[data-tip]')!;
  const trail = root.querySelector<SVGPathElement>('[data-trail] path')!;
  const pts: { x: number; y: number; t: number }[] = [];
  let x = -100;
  let y = -100;
  let queued = false;

  const kindFor = (el: Element | null) => {
    if (!el) return 'probe';
    if (el.closest('input, textarea, select, [data-shell]')) return 'none';
    if (el.closest('[data-cursor="inspect"], [data-panel] a.title-link, .case-link')) return 'glass';
    if (el.closest('a, button, [role="button"], summary, label')) return 'pick';
    return 'probe';
  };

  const draw = () => {
    queued = false;
    tip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const now = performance.now();
    while (pts.length && now - pts[0].t > TRAIL_MS) pts.shift();
    trail.setAttribute('d', pts.length > 1 ? pathFrom(getStroke(pts.map((p) => [p.x, p.y]), { size: 5, thinning: 0.7, smoothing: 0.5, streamline: 0.35, last: false })) : '');
    if (pts.length) schedule();
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(draw);
    }
  };

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      pts.push({ x, y, t: performance.now() });
      if (pts.length > MAX_POINTS) pts.shift();
      root.dataset.kind = kindFor(e.target as Element);
      schedule();
    },
    { passive: true },
  );
  document.addEventListener('mouseleave', () => (root.dataset.kind = 'none'));

  // line boil for the cursor too (~10fps), unless the beat is driving it
  setInterval(() => {
    root.dataset.frame = html.dataset.frame ?? String(Math.floor(performance.now() / 100) % 3);
  }, 100);

  root.dataset.kind = 'probe';
  root.hidden = false;
  html.classList.add('has-cursor');

  // switch back to the native cursor instantly if the mode changes
  new MutationObserver(() => {
    if (!allowed()) {
      root.hidden = true;
      html.classList.remove('has-cursor');
    } else {
      root.hidden = false;
      html.classList.add('has-cursor');
    }
  }).observe(html, { attributes: true, attributeFilter: ['data-mode'] });
}
