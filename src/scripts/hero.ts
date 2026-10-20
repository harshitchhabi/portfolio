import { SplitText } from 'gsap/SplitText';
import { gsap, ENTRANCE } from '../lib/motion';
import { reducedMotion } from '../lib/prefs';

gsap.registerPlugin(SplitText);

// Hero name: characters slide up out of a clip mask. Tower: rows fill top to
// bottom like positions at session start, and the numbers tick into place.
// Initial states are set here, so with no JS everything is simply visible.

export function heroIntro() {
  if (reducedMotion()) return;

  const name = document.querySelector<HTMLElement>('[data-hero-name]');
  if (name) {
    const split = SplitText.create(name.querySelectorAll('.line'), { type: 'chars', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 110,
      duration: 0.5,
      ease: ENTRANCE,
      stagger: 0.02,
      onComplete: () => split.revert(),
    });
  }

  const rows = gsap.utils.toArray<HTMLElement>('[data-tower-row]');
  if (!rows.length) return;
  gsap.set(rows, { autoAlpha: 0, x: 16 });
  gsap.to(rows, { autoAlpha: 1, x: 0, duration: 0.35, ease: ENTRANCE, stagger: 0.06, delay: 0.15 });

  rows.forEach((row, i) => {
    const el = row.querySelector<HTMLElement>('[data-pos]');
    if (!el) return;
    const target = Number(el.dataset.pos);
    const counter = { v: 0 };
    gsap.to(counter, {
      v: target,
      duration: 0.4,
      delay: 0.15 + i * 0.06,
      ease: 'none',
      onUpdate: () => {
        el.textContent = `P${Math.round(counter.v)}`;
      },
    });
  });
}

// Hovering a tower row lights up the matching leaderboard row.
export function linkTower() {
  document.querySelectorAll<HTMLElement>('[data-tower-row]').forEach((row) => {
    const target = document.getElementById(`lb-${row.dataset.code?.toLowerCase()}`);
    if (!target) return;
    const on = () => target.classList.add('is-hot');
    const off = () => target.classList.remove('is-hot');
    row.addEventListener('pointerenter', on);
    row.addEventListener('pointerleave', off);
    row.addEventListener('focusin', on);
    row.addEventListener('focusout', off);
  });
}
