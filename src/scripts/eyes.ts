// Pupils follow the cursor. One pointer listener for the whole visit; each page
// mount tells it which daemons are on screen. Updated at most once per frame.

const visible = new Set<HTMLElement>();
let mx = -1;
let my = -1;
let queued = false;
let listening = false;

function update() {
  queued = false;
  for (const d of visible) {
    const pose = d.querySelector<HTMLElement>(`[data-pose="${d.dataset.show}"]`);
    const svg = pose?.querySelector<SVGSVGElement>('.pupils');
    if (!svg) continue;
    const r = svg.getBoundingClientRect();
    const k = r.width / svg.viewBox.baseVal.width;
    svg.querySelectorAll<SVGCircleElement>('circle').forEach((c) => {
      const ex = r.left + c.cx.baseVal.value * k;
      const ey = r.top + c.cy.baseVal.value * k;
      const dx = mx - ex;
      const dy = my - ey;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Number(c.dataset.r) * 0.45 * Math.min(1, dist / 160);
      c.setAttribute('transform', `translate(${((dx / dist) * reach).toFixed(1)} ${((dy / dist) * reach).toFixed(1)})`);
    });
  }
}

/** Start tracking the daemons in `root`. Returns a cleanup for page changes. */
export function mountEyes(root: ParentNode = document) {
  if (!window.matchMedia('(pointer: fine)').matches) return () => {};
  if (!listening) {
    listening = true;
    window.addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (!queued && visible.size) {
          queued = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement);
  });
  root.querySelectorAll<HTMLElement>('[data-daemon]').forEach((d) => io.observe(d));
  return () => {
    io.disconnect();
    visible.clear();
  };
}
