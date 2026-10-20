// Global behaviour shared by every page.
import { getPref, setPref } from '../lib/prefs';
import { shell } from './shell';
import { sound } from './sound';

shell();
sound();

// the custom cursor isn't needed for first paint
const later = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 300));
later(() => import('./cursor').then((m) => m.cursor()));

// "Skip the show": a plain, fast view for people in a hurry. Remembered.
const skipBtn = document.querySelector<HTMLButtonElement>('[data-skip-toggle]');
const applySkip = (on: boolean) => {
  document.documentElement.toggleAttribute('data-skip', on);
  skipBtn?.setAttribute('aria-pressed', String(on));
};
applySkip(getPref('skip-show') === 'on');
skipBtn?.addEventListener('click', () => {
  const on = !document.documentElement.hasAttribute('data-skip');
  setPref('skip-show', on ? 'on' : 'off');
  applySkip(on);
});
