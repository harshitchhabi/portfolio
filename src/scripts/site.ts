// Global behaviour shared by every page.
import { getPref, setPref } from '../lib/prefs';
import { pickMode, setMode } from '../lib/mode';
import { shell } from './shell';
import { sound } from './sound';
import { caught } from './jar';

shell();
sound();

// "Skip the show": a plain, fast view for people in a hurry. Remembered.
const html = document.documentElement;
const skipBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-skip-toggle]'));
const renderSkip = () => {
  const on = html.dataset.mode === 'skip';
  skipBtns.forEach((b) => b.setAttribute('aria-pressed', String(on)));
};
if (getPref('skip-show') === 'on') setMode('skip');
renderSkip();
skipBtns.forEach((b) =>
  b.addEventListener('click', () => {
    const on = html.dataset.mode !== 'skip';
    setPref('skip-show', on ? 'on' : 'off');
    setMode(on ? 'skip' : pickMode());
    renderSkip();
    window.scrollTo({ top: 0 });
    window.dispatchEvent(new CustomEvent('skip:change', { detail: { on } }));
  }),
);

// the custom cursor isn't needed for first paint
const later = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 300));
later(() => import('./cursor').then((m) => m.cursor()));

caught();

// Click the email to copy it, with a handwritten "copied!".
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const note = btn.parentElement?.querySelector<HTMLElement>('[data-copied]');
  let t = 0;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy!);
      if (note) note.textContent = 'copied!';
    } catch {
      window.location.href = `mailto:${btn.dataset.copy}`;
      return;
    }
    window.clearTimeout(t);
    t = window.setTimeout(() => note && (note.textContent = ''), 1800);
  });
});
