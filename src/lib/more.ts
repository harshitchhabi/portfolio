// With scrollbars hidden, a scroll box needs another hint that there's more
// below. watchMore() sets data-more on the box while it isn't scrolled to the
// end; the box's CSS draws a fade along its bottom edge from that.

export function watchMore(el: HTMLElement): void {
  const check = () => el.toggleAttribute('data-more', el.scrollHeight - el.clientHeight - el.scrollTop > 4);
  el.addEventListener('scroll', check, { passive: true });
  new ResizeObserver(check).observe(el);
  // new shell lines, the Walkman's chooser opening, search results arriving
  new MutationObserver(check).observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  check();
}
