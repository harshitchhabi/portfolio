// The station title morphs into the case-study header (shared-element view
// transition). The header always carries view-transition-name: project-title;
// on the home page that name is given to the clicked title just before the
// page swaps, and to the matching title when coming back.

type SwapEvent = Event & { viewTransition: ViewTransition | null; activation: { entry: { url: string } } | null };
type RevealEvent = Event & { viewTransition: ViewTransition | null };

const NAME = 'project-title';

function titleFor(url: string | undefined) {
  if (!url) return null;
  const m = new URL(url).pathname.match(/^\/projects\/([a-z0-9-]+)/);
  return m ? document.querySelector<HTMLElement>(`a[data-vt-title="${m[1]}"]`) : null;
}

export function titleTransitions() {
  window.addEventListener('pageswap', (e) => {
    const ev = e as SwapEvent;
    if (!ev.viewTransition || !ev.activation) return;
    const a = titleFor(ev.activation.entry.url);
    if (!a) return;
    a.style.viewTransitionName = NAME;
    ev.viewTransition.finished.finally(() => (a.style.viewTransitionName = ''));
  });
  window.addEventListener('pagereveal', (e) => {
    const ev = e as RevealEvent;
    const from = (window as unknown as { navigation?: { activation?: { from?: { url?: string } } } }).navigation?.activation?.from?.url;
    if (!ev.viewTransition) return;
    const a = titleFor(from);
    if (!a) return;
    a.style.viewTransitionName = NAME;
    ev.viewTransition.finished.finally(() => (a.style.viewTransitionName = ''));
  });
}
