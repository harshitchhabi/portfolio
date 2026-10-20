// Case-study page: the vignette daemon reacts when the cursor comes close.

export function mount(): () => void {
  const v = document.querySelector<HTMLElement>('[data-near-react] [data-daemon]');
  if (!v || !window.matchMedia('(pointer: fine)').matches) return () => {};
  const move = (e: PointerEvent) => {
    const r = v.getBoundingClientRect();
    const near = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < r.width * 0.7;
    v.dataset.show = near ? 'react' : 'idle';
  };
  window.addEventListener('pointermove', move, { passive: true });
  return () => window.removeEventListener('pointermove', move);
}
