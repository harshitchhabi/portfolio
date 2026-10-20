import { details } from './details';
import { smooth } from './smooth';
import { trackEyes } from './eyes';
import { titleTransitions } from './vt';

titleTransitions();
smooth();
details();
trackEyes();

// the vignette daemon reacts when you come close
const v = document.querySelector<HTMLElement>('[data-near-react] [data-daemon]');
if (v && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener(
    'pointermove',
    (e) => {
      const r = v.getBoundingClientRect();
      const near = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < r.width * 0.7;
      v.dataset.show = near ? 'react' : 'idle';
    },
    { passive: true },
  );
}
