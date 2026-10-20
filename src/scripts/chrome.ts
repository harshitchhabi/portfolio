import { getPref, setPref } from '../lib/prefs';

// ---------- theme ----------

const root = document.documentElement;
const themeBtn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeLabel = document.querySelector<HTMLElement>('[data-theme-label]');

function applyTheme(t: 'light' | 'dark') {
  root.setAttribute('data-theme', t);
  if (themeLabel) themeLabel.textContent = t === 'dark' ? 'Theme: Dark' : 'Theme: Light';
  themeBtn?.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} theme`);
}

applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

themeBtn?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  setPref('theme', next);
  applyTheme(next);
});

// Follow the OS until the visitor picks a theme themselves.
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (!getPref('theme')) applyTheme(e.matches ? 'light' : 'dark');
});

// ---------- session clock (IST) ----------

const clock = document.querySelector<HTMLTimeElement>('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const tick = () => {
    const now = new Date();
    clock.textContent = fmt.format(now);
    clock.dateTime = now.toISOString();
    // Re-align to the next whole second so it never drifts.
    setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
  };
  tick();
}
