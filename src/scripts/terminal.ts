// The ~ terminal. Output is always written with textContent, never innerHTML.

interface P {
  pos: number;
  code: string;
  slug: string;
  title: string;
}

const SECURITY_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'x-frame-options',
];

const COMMANDS: Record<string, string> = {
  help: 'list commands',
  whoami: 'who I am, in three lines',
  ls: 'list projects with their codes',
  open: 'open <code>: go to a case study, e.g. open ids',
  headers: "check this site's real security headers",
  stack: 'what this site is built with',
  contact: 'how to reach me',
  clear: 'clear the screen',
};

export function terminal() {
  const root = document.querySelector<HTMLElement>('[data-terminal]');
  const out = document.querySelector<HTMLElement>('[data-terminal-out]');
  const form = document.querySelector<HTMLFormElement>('[data-terminal-form]');
  const input = document.querySelector<HTMLInputElement>('[data-terminal-input]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-terminal-close]');
  if (!root || !out || !form || !input || !closeBtn) return;

  const projects: P[] = JSON.parse(root.dataset.projects ?? '[]');
  const history: string[] = [];
  let hIndex = 0;
  let opener: HTMLElement | null = null;
  let greeted = false;

  const line = (text: string, cls = '') => {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    out.append(div);
    out.scrollTop = out.scrollHeight;
  };

  const open = () => {
    if (!root.hidden) return;
    opener = document.activeElement as HTMLElement | null;
    root.hidden = false;
    document.querySelectorAll('[data-terminal-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    if (!greeted) {
      greeted = true;
      line("pit wall terminal. type 'help'. esc to close.", 'dim');
    }
    input.focus();
  };

  const close = () => {
    if (root.hidden) return;
    root.hidden = true;
    document.querySelectorAll('[data-terminal-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    opener?.focus();
  };

  async function headers() {
    line('HEAD ' + location.href, 'dim');
    try {
      const res = await fetch(location.href, { method: 'HEAD', cache: 'no-store' });
      let pass = 0;
      for (const h of SECURITY_HEADERS) {
        const v = res.headers.get(h);
        if (v) pass += 1;
        const shown = v ? (v.length > 72 ? v.slice(0, 72) + '…' : v) : 'missing';
        line(`${v ? '✓' : '✗'} ${h.padEnd(27)} ${shown}`, v ? 'ok' : 'bad');
      }
      line(`${pass}/${SECURITY_HEADERS.length} present${pass < SECURITY_HEADERS.length ? ' (local dev servers skip these; production sets them in vercel.json)' : ''}`, 'dim');
    } catch {
      line('✗ request failed', 'bad');
    }
  }

  function run(raw: string) {
    const [cmd = '', ...args] = raw.trim().split(/\s+/);
    line('$ ' + raw, 'cmd');
    switch (cmd.toLowerCase()) {
      case '':
        return;
      case 'help':
        Object.entries(COMMANDS).forEach(([k, v]) => line(`${k.padEnd(9)} ${v}`));
        return;
      case 'whoami':
        line('Harshit Chhabi. B.Tech CSE (Information Security), VIT Vellore, 2024–2028.');
        line('I build security tools, ML systems and real-time platforms.');
        line('Technical Head at Dream Merchants. Before that, cybersecurity intern at SBI Global IT Centre.');
        return;
      case 'ls':
        projects.forEach((p) => line(`P${p.pos}  ${p.code}  ${p.title}`));
        return;
      case 'open': {
        const code = (args[0] ?? '').toUpperCase();
        const p = projects.find((x) => x.code === code || x.slug === args[0]?.toLowerCase());
        if (!p) {
          line(code ? `no project '${args[0]}'. try ls` : 'usage: open <code>', 'bad');
          return;
        }
        line(`opening ${p.code}…`, 'dim');
        window.location.href = `/projects/${p.slug}`;
        return;
      }
      case 'headers':
        void headers();
        return;
      case 'stack':
        line('Astro (static) + TypeScript');
        line('GSAP: Flip, SplitText, CustomEase');
        line('Plain CSS with custom properties. Archivo + JetBrains Mono, self-hosted');
        line('Web Audio for the beat. Native view transitions between pages');
        line('Vercel. No trackers, no third-party requests, no inline scripts');
        return;
      case 'contact':
        line('email     harshitchhabi@gmail.com');
        line('linkedin  linkedin.com/in/harshit-chhabi-6007b4368');
        line('github    github.com/harshitchhabi');
        line('resume    ' + location.origin + '/resume.pdf');
        return;
      case 'clear':
        out.replaceChildren();
        return;
      case 'box': {
        line('Box box, box box.');
        const target = document.getElementById('box-box');
        if (target) {
          close();
          target.scrollIntoView();
        } else {
          window.location.href = '/#box-box';
        }
        return;
      }
      default:
        line(`command not found: ${cmd}. try help`, 'bad');
    }
  }

  function complete() {
    const v = input.value;
    const parts = v.split(/\s+/);
    let options: string[];
    if (parts.length <= 1) {
      options = Object.keys(COMMANDS).filter((c) => c.startsWith(v.toLowerCase()));
      if (options.length === 1) input.value = options[0] + (options[0] === 'open' ? ' ' : '');
    } else if (parts[0] === 'open') {
      const pre = (parts[1] ?? '').toLowerCase();
      options = projects.map((p) => p.code.toLowerCase()).filter((c) => c.startsWith(pre));
      if (options.length === 1) input.value = `open ${options[0]}`;
    } else {
      return;
    }
    if (options.length > 1) line(options.join('  '), 'dim');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    if (v.trim()) history.push(v);
    hIndex = history.length;
    input.value = '';
    run(v);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (!history.length) return;
      e.preventDefault();
      hIndex = Math.max(0, hIndex - 1);
      input.value = history[hIndex] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      hIndex = Math.min(history.length, hIndex + 1);
      input.value = history[hIndex] ?? '';
    } else if (e.key === 'Tab' && !e.shiftKey && input.value.trim()) {
      e.preventDefault();
      complete();
    }
  });

  // Focus trap: only the input and the close button are reachable while open.
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab' && !e.defaultPrevented) {
      e.preventDefault();
      (document.activeElement === input ? closeBtn : input).focus();
    }
  });

  closeBtn.addEventListener('click', close);
  document.querySelectorAll('[data-terminal-open]').forEach((b) => {
    b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => (root.hidden ? open() : close()));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== '~' || !root.hidden) return;
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
    e.preventDefault();
    open();
  });
}
