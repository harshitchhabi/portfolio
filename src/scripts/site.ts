// Everything that lives for the whole visit, plus the page lifecycle.
// Navigation happens in-page (Astro's ClientRouter) so the music keeps going:
// global things start once here; page things mount on every astro:page-load and
// are cleaned up before the next swap.

import { getPref, setPref } from '../lib/prefs';
import { pickMode, setMode, type Mode } from '../lib/mode';
import { shell } from './shell';
import { sound } from './sound';
import { caught } from './jar';
import { smooth } from './smooth';
import { details } from './details';
import { mountEyes } from './eyes';
import { titleTransitions } from './vt';

const html = document.documentElement;

// ---------- once per visit ----------
let mode: Mode = pickMode();
setMode(mode);
shell();
sound();
smooth();
titleTransitions();

const later = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : window.setTimeout(fn, 300));
later(() => import('./cursor').then((m) => m.cursor()));
later(() => import('./walkman').then((m) => m.walkman()));

// Music only ever starts from a click on the nav's music button (or the Walkman's play).
document.addEventListener('click', (e) => {
  if ((e.target as Element).closest?.('[data-music-toggle]')) void import('./walkman').then((m) => m.toggleMusic());
});

// "Skip the show": a plain, fast view for people in a hurry. Remembered.
const skipBtns = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[data-skip-toggle]'));
const renderSkip = () => {
  const on = mode === 'skip';
  skipBtns().forEach((b) => {
    b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? 'resume the show' : 'skip the show';
  });
};
document.addEventListener('click', (e) => {
  if (!(e.target as Element).closest?.('[data-skip-toggle]')) return;
  const on = mode !== 'skip';
  setPref('skip-show', on ? 'on' : 'off');
  mode = on ? 'skip' : pickMode();
  setMode(mode);
  renderSkip();
  window.scrollTo({ top: 0 });
  window.dispatchEvent(new CustomEvent('skip:change', { detail: { on } }));
});
if (getPref('skip-show') === 'on') mode = 'skip';

// Astro resets <html> attributes on every swap; put ours back.
document.addEventListener('astro:after-swap', () => setMode(mode));

// ---------- every page ----------
let cleanups: (() => void)[] = [];
let token = 0;

function bindCopy(): () => void {
  const timers: number[] = [];
  const handler = async (e: Event) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-copy]');
    if (!btn) return;
    const note = btn.parentElement?.querySelector<HTMLElement>('[data-copied]');
    try {
      await navigator.clipboard.writeText(btn.dataset.copy!);
      if (note) note.textContent = 'copied!';
    } catch {
      window.location.href = `mailto:${btn.dataset.copy}`;
      return;
    }
    timers.push(window.setTimeout(() => note && (note.textContent = ''), 1800));
  };
  document.addEventListener('click', handler);
  return () => {
    document.removeEventListener('click', handler);
    timers.forEach((t) => window.clearTimeout(t));
  };
}

async function mountPage() {
  const mine = ++token;
  renderSkip();
  caught();
  window.lenis?.resize();
  cleanups.push(details(), mountEyes(), bindCopy());
  const page = document.querySelector<HTMLElement>('main[data-page]')?.dataset.page;
  const mod = page === 'home' ? await import('./home') : page === 'case' ? await import('./case') : null;
  if (mod && mine === token) cleanups.push(mod.mount());
}

function unmountPage() {
  token++;
  cleanups.forEach((f) => f());
  cleanups = [];
}

document.addEventListener('astro:page-load', mountPage);
document.addEventListener('astro:before-swap', unmountPage);
