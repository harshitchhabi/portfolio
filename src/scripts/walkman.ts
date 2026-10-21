// The Walkman: background music that only ever starts on a click.
//   - default station: "Loser" by Tame Impala, on loop
//   - visitors can search, paste a YouTube link, or play a file from their device
//   - volume slider; M mutes
//   - the station and volume are remembered; a visitor's own file never is
// YouTube's player is driven with postMessage (no YouTube script on the page),
// through the privacy-enhanced youtube-nocookie.com domain.

import { watchMore } from '../lib/more';
import { getPref, setPref } from '../lib/prefs';

const YT = 'https://www.youtube-nocookie.com';
const LOSER = { kind: 'yt', id: 'MX7FSAnRPug', title: 'Loser · Tame Impala' } as const;
// Tame Impala's official upload, used if the default track can't play somewhere
const LOSER_FALLBACK = { kind: 'yt', id: 's3a4OQR-10M', title: 'Loser · Tame Impala' } as const;

type YtStation = { kind: 'yt'; id: string; title: string };
type FileStation = { kind: 'file'; title: string; url: string };
type Station = YtStation | FileStation;

/** Pull an 11-character video id out of any YouTube or YouTube Music link. */
export function videoId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`);
    if (!/(^|\.)youtube\.com$|(^|\.)youtube-nocookie\.com$|^youtu\.be$/.test(u.hostname)) return null;
    const v = u.searchParams.get('v');
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const m = u.pathname.match(/^\/(?:embed\/|shorts\/|live\/|v\/)?([\w-]{11})(?:[/?]|$)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function savedStation(): YtStation {
  try {
    const s = JSON.parse(getPref('music-station') ?? 'null') as YtStation | null;
    if (s && s.kind === 'yt' && /^[\w-]{11}$/.test(s.id)) return { kind: 'yt', id: s.id, title: String(s.title).slice(0, 120) };
  } catch {
    /* fall through to the default */
  }
  return { ...LOSER };
}

let toggleFn: (() => void) | null = null;

/** The nav's music button: open the Walkman and play, or pause. */
export function toggleMusic() {
  walkman();
  toggleFn?.();
}

export function walkman() {
  const root = document.querySelector<HTMLElement>('[data-walkman]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = '1';
  watchMore(root);

  const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const win = $<HTMLElement>('[data-tape-window]');
  const label = $<HTMLElement>('[data-tape-label]');
  const playBtn = $<HTMLButtonElement>('[data-w-play]');
  const muteBtn = $<HTMLButtonElement>('[data-w-mute]');
  const ejectBtn = $<HTMLButtonElement>('[data-w-eject]');
  const vol = $<HTMLInputElement>('[data-w-volume]');
  const chooser = $<HTMLElement>('[data-w-chooser]');
  const results = $<HTMLOListElement>('[data-w-results]');
  const status = $<HTMLElement>('[data-w-status]');
  const audio = $<HTMLAudioElement>('[data-w-audio]');
  const navBtns = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[data-music-toggle]'));

  let station: Station = savedStation();
  let iframe: HTMLIFrameElement | null = null;
  let playing = false;
  let muted = false;
  let volume = Number(getPref('music-volume') ?? '40');
  if (!Number.isFinite(volume) || volume < 0 || volume > 100) volume = 40;
  vol.value = String(volume);
  let lastTime = 0;
  let wantPlay = false;
  let triedFallback = false;

  const say = (msg: string) => (status.textContent = msg);

  const render = () => {
    root.dataset.state = playing ? 'playing' : 'paused';
    playBtn.textContent = playing ? '❚❚ pause' : '▶ play';
    playBtn.setAttribute('aria-pressed', String(playing));
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteBtn.textContent = muted ? 'unmute' : 'mute';
    label.textContent = station.title;
    navBtns().forEach((b) => {
      b.setAttribute('aria-pressed', String(playing));
      const l = b.querySelector('[data-music-label]');
      if (l) l.textContent = playing ? 'on' : 'off';
    });
  };

  // ---------- YouTube, via postMessage ----------
  const yt = (func: string, args: unknown[] = []) => iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), YT);

  function loadYt(s: YtStation, startAt = 0) {
    audio.pause();
    audio.removeAttribute('src');
    win.querySelector('.window-idle')?.remove();
    iframe?.remove();
    iframe = document.createElement('iframe');
    const p = new URLSearchParams({
      enablejsapi: '1',
      autoplay: '1', // only ever loaded right after a click
      loop: '1',
      playlist: s.id, // makes loop work for a single video
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      origin: location.origin,
      ...(startAt > 1 ? { start: String(Math.floor(startAt)) } : {}),
    });
    iframe.src = `${YT}/embed/${s.id}?${p}`;
    iframe.title = `YouTube player: ${s.title}`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.addEventListener('load', onFrameLoad);
    win.append(iframe);
  }

  function onFrameLoad() {
    // ask the player to report its state, then set our volume
    iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'walkman', channel: 'widget' }), YT);
    applyVolume();
    // if the browser reloaded the frame while changing page, carry on where it was
    if (wantPlay && lastTime > 1) {
      yt('seekTo', [lastTime, true]);
      yt('playVideo');
    }
  }

  window.addEventListener('message', (e) => {
    if (e.origin !== YT || !iframe || e.source !== iframe.contentWindow) return;
    let data: { event?: string; info?: { playerState?: number; currentTime?: number; videoData?: { title?: string } } | number };
    try {
      data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    } catch {
      return;
    }
    if (data.event === 'onReady') applyVolume();
    if (data.event === 'onError') {
      // the default can't play here (region, embedding): try the official upload once
      if (station.kind === 'yt' && station.id === LOSER.id && !triedFallback) {
        triedFallback = true;
        station = { ...LOSER_FALLBACK };
        loadYt(station);
      } else {
        say("that one won't play here. try another.");
      }
      return;
    }
    if (data.event === 'infoDelivery' && data.info && typeof data.info === 'object') {
      const info = data.info;
      if (typeof info.currentTime === 'number') lastTime = info.currentTime;
      if (typeof info.playerState === 'number') {
        playing = info.playerState === 1 || info.playerState === 3;
        if (info.playerState === 1) say('');
        render();
      }
      const t = info.videoData?.title;
      if (t && station.kind === 'yt' && station.title === 'a song from YouTube') {
        station = { ...station, title: t.slice(0, 120) };
        remember();
        render();
      }
    }
  });

  // ---------- local files: played in the browser, never uploaded or remembered ----------
  function loadFile(file: File) {
    iframe?.remove();
    iframe = null;
    if (station.kind === 'file') URL.revokeObjectURL(station.url);
    station = { kind: 'file', title: file.name.replace(/\.[^.]+$/, '').slice(0, 120), url: URL.createObjectURL(file) };
    audio.src = station.url;
    applyVolume();
    void audio.play().catch(() => say("couldn't play that file"));
  }
  audio.addEventListener('play', () => {
    playing = true;
    render();
  });
  audio.addEventListener('pause', () => {
    playing = false;
    render();
  });

  // ---------- controls ----------
  function applyVolume() {
    if (station.kind === 'file') {
      audio.volume = volume / 100;
      audio.muted = muted;
    } else {
      yt('setVolume', [volume]);
      yt(muted ? 'mute' : 'unMute');
    }
  }

  function remember() {
    if (station.kind === 'yt') setPref('music-station', JSON.stringify(station));
  }

  // Tucked away, the player slides off the edge and leaves a tab; the music
  // keeps going. It tucks itself once you scroll on, so it never sits over
  // what you came to read.
  const body = $<HTMLElement>('.wm-body');
  let anchor = 0;
  const tuck = (on: boolean) => {
    const hadFocus = body.contains(document.activeElement);
    root.toggleAttribute('data-tucked', on);
    body.inert = on;
    if (on && hadFocus) $<HTMLButtonElement>('[data-w-untuck]').focus({ preventScroll: true });
    anchor = window.scrollY;
  };

  const open = () => {
    if (root.hidden) {
      root.hidden = false;
      tuck(false);
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (root.hidden || root.hasAttribute('data-tucked') || !chooser.hidden) return;
      if (Math.abs(window.scrollY - anchor) > 160) tuck(true);
    },
    { passive: true },
  );
  document.addEventListener('astro:after-swap', () => !root.hidden && !root.hasAttribute('data-tucked') && tuck(true));

  function play() {
    open();
    wantPlay = true;
    window.dispatchEvent(new CustomEvent('music:play'));
    if (station.kind === 'file') void audio.play();
    else if (!iframe) loadYt(station);
    else yt('playVideo');
    playing = true;
    render();
  }

  function pause() {
    wantPlay = false;
    if (station.kind === 'file') audio.pause();
    else yt('pauseVideo');
    playing = false;
    render();
  }

  function choose(s: YtStation) {
    station = s;
    triedFallback = s.id !== LOSER.id;
    lastTime = 0;
    remember();
    wantPlay = true;
    window.dispatchEvent(new CustomEvent('music:play'));
    loadYt(s);
    playing = true;
    render();
  }

  function toggleMute() {
    muted = !muted;
    applyVolume();
    render();
    say(muted ? 'muted (M)' : '');
  }

  playBtn.addEventListener('click', () => (playing ? pause() : play()));
  muteBtn.addEventListener('click', toggleMute);
  vol.addEventListener('input', () => {
    volume = Number(vol.value);
    setPref('music-volume', String(volume));
    if (muted && volume > 0) muted = false;
    applyVolume();
    render();
  });
  ejectBtn.addEventListener('click', () => {
    chooser.hidden = !chooser.hidden;
    ejectBtn.setAttribute('aria-expanded', String(!chooser.hidden));
    if (!chooser.hidden) $<HTMLInputElement>('[data-w-q]').focus();
  });
  $<HTMLButtonElement>('[data-w-close]').addEventListener('click', () => {
    pause();
    iframe?.remove();
    iframe = null;
    root.hidden = true;
    render();
  });
  $<HTMLButtonElement>('[data-w-tuck]').addEventListener('click', () => tuck(true));
  $<HTMLButtonElement>('[data-w-untuck]').addEventListener('click', () => {
    tuck(false);
    playBtn.focus({ preventScroll: true });
  });
  $<HTMLButtonElement>('[data-w-loser]').addEventListener('click', () => choose({ ...LOSER }));

  $<HTMLFormElement>('[data-w-paste]').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $<HTMLInputElement>('[data-w-url]');
    const id = videoId(input.value);
    if (!id) return say("that doesn't look like a YouTube link");
    input.value = '';
    choose({ kind: 'yt', id, title: 'a song from YouTube' });
  });

  $<HTMLInputElement>('[data-w-file]').addEventListener('change', (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    if (!f.type.startsWith('audio/')) return say('pick an audio file');
    wantPlay = true;
    window.dispatchEvent(new CustomEvent('music:play'));
    loadFile(f);
    render();
  });

  $<HTMLFormElement>('[data-w-search]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $<HTMLInputElement>('[data-w-q]').value.trim();
    if (q.length < 2) return;
    say('looking…');
    results.replaceChildren();
    try {
      const r = await fetch(`/api/yt-search?q=${encodeURIComponent(q)}`);
      const body = (await r.json()) as { results?: { id: string; title: string; channel: string }[]; error?: string };
      if (!r.ok || !body.results) return say(body.error ? `${body.error}. paste a link instead.` : 'search failed. paste a link instead.');
      if (!body.results.length) return say('nothing found');
      say('');
      for (const item of body.results) {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = item.title;
        const ch = document.createElement('span');
        ch.className = 'ch';
        ch.textContent = item.channel;
        b.append(ch);
        b.addEventListener('click', () => choose({ kind: 'yt', id: item.id, title: item.title.slice(0, 120) }));
        li.append(b);
        results.append(li);
      }
    } catch {
      say("search isn't reachable here. paste a link instead.");
    }
  });

  toggleFn = () => (playing ? pause() : play());

  // M mutes, unless you're typing
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'm' || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (root.hidden) return;
    e.preventDefault();
    toggleMute();
  });

  // the 128 BPM beat and the music don't play over each other
  window.addEventListener('beat:play', () => playing && pause());

  render();
}
