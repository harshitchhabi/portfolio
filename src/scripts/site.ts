// Global behaviour shared by every page.
import { getPref, setPref } from '../lib/prefs';
import { shell } from './shell';
import { sound } from './sound';

shell();
sound();

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
