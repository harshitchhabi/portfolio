import { Flip } from 'gsap/Flip';
import { gsap } from '../lib/motion';
import { reducedMotion } from '../lib/prefs';

gsap.registerPlugin(Flip);

export function leaderboard() {
  const body = document.querySelector<HTMLElement>('[data-lb-body]');
  if (!body) return;
  const rows = Array.from(body.querySelectorAll<HTMLTableRowElement>('tr'));
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const status = document.querySelector<HTMLElement>('[data-filter-status]');

  // ---------- whole row is clickable; the title link stays the keyboard target ----------
  rows.forEach((row) => {
    const link = row.querySelector<HTMLAnchorElement>('a[data-vt-title]');
    row.addEventListener('click', (e) => {
      if (!link || (e.target as HTMLElement).closest('a')) return;
      if (window.getSelection()?.toString()) return; // let people select text
      link.click();
    });
  });

  // ---------- filters: rows overtake each other via Flip ----------
  let running: gsap.core.Timeline | null = null;

  const apply = (filter: string) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === filter)));
    const show = (r: HTMLTableRowElement) => filter === 'All' || r.dataset.type === filter;
    const leaving = rows.filter((r) => !r.hidden && !show(r));
    const entering = rows.filter((r) => r.hidden && show(r));
    const count = rows.filter(show).length;
    if (status) status.textContent = `Showing ${count} ${filter === 'All' ? '' : filter + ' '}project${count === 1 ? '' : 's'}`;

    running?.progress(1);

    if (reducedMotion()) {
      rows.forEach((r) => (r.hidden = !show(r)));
      return;
    }

    running = gsap.timeline();
    // Removed rows fade first, so nothing pops.
    if (leaving.length) running.to(leaving, { opacity: 0, duration: 0.2, ease: 'none' });
    running.add(() => {
      const state = Flip.getState(rows);
      rows.forEach((r) => (r.hidden = !show(r)));
      gsap.set(entering, { opacity: 0 });
      Flip.from(state, { duration: 0.55, ease: 'power3.inOut', stagger: 0.03 });
      gsap.to(entering, { opacity: 1, duration: 0.3, delay: 0.25, ease: 'none' });
      gsap.set(leaving, { clearProps: 'opacity' });
    });
  };

  chips.forEach((c) => c.addEventListener('click', () => apply(c.dataset.filter ?? 'All')));

  // ---------- cursor-following preview (mouse + wide screen only) ----------
  const preview = document.querySelector<HTMLElement>('[data-lb-preview]');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1000px)');
  if (!preview || !fine.matches) return;

  preview.classList.add('is-on');
  const items = new Map<string, HTMLElement>();
  preview.querySelectorAll<HTMLElement>('[data-preview]').forEach((el) => items.set(el.dataset.preview!, el));

  const W = 360;
  const GAP = 18;
  const pos = { x: 0, y: 0 };
  const goal = { x: 0, y: 0 };
  let row: HTMLTableRowElement | null = null;
  let raf = 0;
  const lerp = reducedMotion() ? 1 : 0.18;

  const target = (mx: number) => {
    if (!row) return;
    const r = row.getBoundingClientRect();
    const h = preview.offsetHeight;
    goal.x = Math.min(Math.max(mx + GAP, 8), window.innerWidth - W - 8);
    // Sit above the row if there's room, otherwise below. Never over the row's text.
    goal.y = r.top - h - GAP > 8 ? r.top - h - GAP : r.bottom + GAP;
    goal.y = Math.min(goal.y, window.innerHeight - h - 8);
  };

  const loop = () => {
    pos.x += (goal.x - pos.x) * lerp;
    pos.y += (goal.y - pos.y) * lerp;
    preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    if (Math.abs(goal.x - pos.x) > 0.3 || Math.abs(goal.y - pos.y) > 0.3) raf = requestAnimationFrame(loop);
    else raf = 0;
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  rows.forEach((r) => {
    r.addEventListener('pointerenter', (e) => {
      const first = !row;
      row = r;
      items.forEach((el, code) => el.classList.toggle('is-active', code === r.dataset.code));
      target(e.clientX);
      if (first) {
        pos.x = goal.x;
        pos.y = goal.y;
      }
      preview.classList.add('is-visible');
      kick();
    });
    r.addEventListener('pointermove', (e) => {
      target(e.clientX);
      kick();
    });
  });
  body.addEventListener('pointerleave', () => {
    row = null;
    preview.classList.remove('is-visible');
  });
  window.addEventListener('scroll', () => preview.classList.remove('is-visible'), { passive: true });
}
