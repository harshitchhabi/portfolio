// The ~ shell. Output is always written with textContent, never innerHTML.

interface P {
  daemon: string;
  pid: number;
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
  ls: 'list the daemons with their PIDs',
  open: 'open <daemon>: go to its case study, e.g. open honeybot',
  headers: "check this site's real security headers",
  contact: 'how to reach me',
  clear: 'clear the screen',
};

export function shell() {
  const root = document.querySelector<HTMLElement>('[data-shell]');
  const out = document.querySelector<HTMLElement>('[data-shell-out]');
  const form = document.querySelector<HTMLFormElement>('[data-shell-form]');
  const input = document.querySelector<HTMLInputElement>('[data-shell-input]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-shell-close]');
  if (!root || !out || !form || !input || !closeBtn) return;

  const projects: P[] = JSON.parse(root.dataset.projects ?? '[]');
  const history: string[] = [];
  let hIndex = 0;
  let opener: HTMLElement | null = null;
  let greeted = false;

  const line = (text: string, cls = '', into: HTMLElement = out) => {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    into.append(div);
    out.scrollTop = out.scrollHeight;
  };

  const open = () => {
    if (!root.hidden) return;
    opener = document.activeElement as HTMLElement | null;
    root.hidden = false;
    document.querySelectorAll('[data-shell-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    if (!greeted) {
      greeted = true;
      line("daemons shell. type 'help'. esc to close.", 'dim');
    }
    input.focus();
  };

  const close = () => {
    if (root.hidden) return;
    root.hidden = true;
    document.querySelectorAll('[data-shell-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    opener?.focus();
  };

  async function headers() {
    // Reserve a spot so the answer stays under its command even if more are typed meanwhile.
    const group = document.createElement('div');
    out.append(group);
    const say = (text: string, cls = '') => line(text, cls, group);
    say('HEAD ' + location.href, 'dim');
    try {
      const res = await fetch(location.href, { method: 'HEAD', cache: 'no-store' });
      let pass = 0;
      for (const h of SECURITY_HEADERS) {
        const v = res.headers.get(h);
        if (v) pass += 1;
        const shown = v ? (v.length > 72 ? v.slice(0, 72) + '…' : v) : 'missing';
        say(`${v ? '✓' : '✗'} ${h.padEnd(27)} ${shown}`, v ? 'ok' : 'bad');
      }
      say(`${pass}/${SECURITY_HEADERS.length} present${pass < SECURITY_HEADERS.length ? ' (local dev servers skip these; production sets them in vercel.json)' : ''}`, 'dim');
    } catch {
      say('✗ request failed', 'bad');
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
        projects.forEach((p) => line(`${String(p.pid).padEnd(6)}${p.daemon.padEnd(17)}${p.title}`));
        return;
      case 'open': {
        const q = args.join(' ').toLowerCase().replace(/^the /, '');
        const p = projects.find((x) => x.daemon.toLowerCase().replace(/^the /, '') === q || x.slug === q || String(x.pid) === q);
        if (!p) {
          line(q ? `no daemon '${q}'. try ls` : 'usage: open <daemon>', 'bad');
          return;
        }
        line(`opening ${p.daemon}…`, 'dim');
        window.location.href = `/projects/${p.slug}`;
        return;
      }
      case 'headers':
        void headers();
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
      options = projects.map((p) => p.daemon.toLowerCase().replace(/^the /, '')).filter((c) => c.startsWith(pre));
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
  document.querySelectorAll('[data-shell-open]').forEach((b) => {
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
