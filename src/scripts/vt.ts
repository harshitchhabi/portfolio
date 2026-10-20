// The station title morphs into the case-study header. The header's title
// always carries view-transition-name: project-title (global.css). On the way
// in, the clicked station title gets that name just before the swap; on the
// way back, the matching station title gets it in the new page. Set from
// script, because Astro's transition:name writes inline styles the CSP blocks.

const NAME = 'project-title';
const slugOf = (url: URL | string) => new URL(url, location.href).pathname.match(/^\/projects\/([a-z0-9-]+)/)?.[1];
const titleFor = (slug: string | undefined) => (slug ? document.querySelector<HTMLElement>(`a[data-vt-title="${slug}"]`) : null);

let named: HTMLElement | null = null;
let fromUrl = '';
const clear = () => {
  if (named) named.style.viewTransitionName = '';
  named = null;
};

export function titleTransitions() {
  document.addEventListener('astro:before-preparation', (e) => {
    clear();
    fromUrl = location.href;
    const a = titleFor(slugOf((e as Event & { to: URL }).to));
    if (a) {
      a.style.viewTransitionName = NAME;
      named = a;
    }
  });
  document.addEventListener('astro:after-swap', () => {
    const a = titleFor(fromUrl ? slugOf(fromUrl) : undefined);
    if (a) {
      a.style.viewTransitionName = NAME;
      named = a;
    }
  });
  document.addEventListener('astro:page-load', () => requestAnimationFrame(clear));
}
