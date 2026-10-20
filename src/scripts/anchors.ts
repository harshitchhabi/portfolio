// In-site links to a spot on the home page (/#work, /#logbook, /#contact,
// /#station-1) and the case pages' back button.
//
// Left alone, the router jumps natively while Lenis is still easing toward its
// own target, so it drags the page back: links only worked the first time. Here
// every such jump goes through Lenis (or native smooth scroll without it), and
// links from other pages land on their spot once the home page has swapped in.

import type Lenis from 'lenis';
import { reducedMotion } from '../lib/prefs';

const html = document.documentElement;

/** Where a hash points, given the current mode ("work" is the plain list when skipping). */
function target(hash: string): HTMLElement | null {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return null;
  if (html.dataset.mode === 'skip' && (id === 'work' || id.startsWith('station-'))) return document.querySelector('.skip-view');
  return document.getElementById(id);
}

function navOffset(): number {
  const nav = document.querySelector<HTMLElement>('header.nav');
  return (nav?.offsetHeight ?? 52) + 8;
}

export function scrollToHash(hash: string, immediate = false): boolean {
  const el = target(hash);
  if (!el) return false;
  const y = el.getBoundingClientRect().top + window.scrollY - navOffset();
  // lenis ships its own (narrower) window.lenis type
  const lenis = window.lenis as unknown as Lenis | undefined;
  if (lenis) lenis.scrollTo(Math.max(0, y), { immediate, force: true });
  else window.scrollTo({ top: Math.max(0, y), behavior: immediate || reducedMotion() ? 'auto' : 'smooth' });
  return true;
}

export function anchors() {
  let movedInSite = false;

  document.addEventListener(
    'click',
    (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href]');
      if (!a || a.target === '_blank') return;

      // back: return to wherever you came from on this site, else the work list
      if (a.hasAttribute('data-back') && movedInSite) {
        e.preventDefault();
        history.back();
        return;
      }

      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !url.hash || url.pathname !== location.pathname) return;
      // same page: scroll here ourselves and keep the router out of it
      if (!target(url.hash)) return;
      e.preventDefault();
      e.stopPropagation();
      // replace, not push: the router keeps its own numbered history entries
      if (location.hash !== url.hash) history.replaceState(history.state, '', url.hash);
      scrollToHash(url.hash);
    },
    { capture: true },
  );

  document.addEventListener('astro:after-swap', () => (movedInSite = true));

  // arriving from another page (or a fresh load) with a hash: settle on it once
  // the layout is final, and again after the fonts land in case they moved it
  document.addEventListener('astro:page-load', () => {
    if (!location.hash) return;
    const go = () => scrollToHash(location.hash, true);
    requestAnimationFrame(go);
    void document.fonts?.ready.then(() => requestAnimationFrame(go));
  });
}
