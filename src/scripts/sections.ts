import { gsap, ENTRANCE } from '../lib/motion';
import { reducedMotion } from '../lib/prefs';

// Plays `run` once, the first time `el` is at least `threshold` in view.
function once(el: Element, threshold: number, run: () => void) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        run();
      }
    },
    { threshold },
  );
  io.observe(el);
}

// Race control: messages slide in from the left, one every ~120ms.
export function raceControl() {
  const feed = document.querySelector('[data-feed]');
  const rows = gsap.utils.toArray<HTMLElement>('[data-feed-row]');
  if (!feed || !rows.length || reducedMotion()) return;
  gsap.set(rows, { autoAlpha: 0, x: -40 });
  once(feed, 0.3, () => gsap.to(rows, { autoAlpha: 1, x: 0, duration: 0.4, ease: ENTRANCE, stagger: 0.12 }));
}

// Lineup: hairlines draw with scroll (CSS), then entries reveal row by row.
export function lineup() {
  const rows = gsap.utils.toArray<HTMLElement>('[data-lineup-row]');
  if (!rows.length || reducedMotion()) return;
  rows.forEach((row) => {
    const parts = row.querySelectorAll(':scope > :not(.rule)');
    gsap.set(parts, { autoAlpha: 0, y: 14 });
    once(row, 0.4, () => gsap.to(parts, { autoAlpha: 1, y: 0, duration: 0.45, ease: ENTRANCE, stagger: 0.06, delay: 0.1 }));
  });
}

// Box box: click the email to copy it.
export function copyEmail() {
  const link = document.querySelector<HTMLAnchorElement>('[data-copy]');
  const note = document.querySelector<HTMLElement>('[data-copied]');
  if (!link || !note || !navigator.clipboard) return;
  let t = 0;
  link.title = 'Click to copy';
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(link.dataset.copy!);
      note.textContent = 'Copied';
      window.clearTimeout(t);
      t = window.setTimeout(() => (note.textContent = ''), 2000);
    } catch {
      window.location.href = link.href; // clipboard blocked: open the mail app instead
    }
  });
}
