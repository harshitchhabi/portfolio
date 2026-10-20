// Shared-element view transition for project titles. The case-study header
// always carries `view-transition-name: project-title`; on the home page we
// give that name to the clicked row's title just before the page swaps, and
// to the matching row when coming back.

type SwapEvent = Event & { viewTransition: ViewTransition | null; activation: { entry: { url: string } } | null };
type RevealEvent = Event & { viewTransition: ViewTransition | null };

const NAME = 'project-title';

function linkFor(url: string | undefined) {
  if (!url) return null;
  const path = new URL(url).pathname.replace(/\/$/, '');
  return document.querySelector<HTMLElement>(`a[data-vt-title][href="${path}"]`);
}

export function projectTitleTransitions() {
  window.addEventListener('pageswap', (e) => {
    const ev = e as SwapEvent;
    if (!ev.viewTransition || !ev.activation) return;
    const a = linkFor(ev.activation.entry.url);
    if (!a) return;
    a.style.viewTransitionName = NAME;
    ev.viewTransition.finished.finally(() => (a.style.viewTransitionName = ''));
  });

  window.addEventListener('pagereveal', (e) => {
    const ev = e as RevealEvent;
    const from = (window as unknown as { navigation?: { activation?: { from?: { url?: string } } } }).navigation?.activation?.from?.url;
    if (!ev.viewTransition) return;
    const a = linkFor(from);
    if (!a) return;
    a.style.viewTransitionName = NAME;
    ev.viewTransition.finished.finally(() => (a.style.viewTransitionName = ''));
  });
}
