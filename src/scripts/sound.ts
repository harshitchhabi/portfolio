import { getPref, reducedMotion, setPref } from '../lib/prefs';

// A minimal 4/4 kick with an off-beat closed hat at 128 BPM, synthesised with
// the Web Audio API: no files, nothing copyrighted. While it plays, --beat on
// <html> decays from 1 to 0 after every kick, read from the AudioContext clock.

const BPM = 128;
const SPB = 60 / BPM;
const LOOKAHEAD = 0.12; // seconds of audio scheduled ahead
const VOLUME = 0.18;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let start = 0;
let nextBeat = 0;
let timer = 0;
let raf = 0;
let playing = false;

function kick(t: number) {
  const osc = ctx!.createOscillator();
  const g = ctx!.createGain();
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(1, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
  osc.connect(g).connect(master!);
  osc.start(t);
  osc.stop(t + 0.35);
}

function hat(t: number) {
  const src = ctx!.createBufferSource();
  src.buffer = noise;
  const hp = ctx!.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7000;
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
  src.connect(hp).connect(g).connect(master!);
  src.start(t);
  src.stop(t + 0.05);
}

// Scheduling uses a short timer, but every note lands on an exact AudioContext time.
function schedule() {
  while (nextBeat < ctx!.currentTime + LOOKAHEAD) {
    kick(nextBeat);
    hat(nextBeat + SPB / 2);
    nextBeat += SPB;
  }
}

function pulse() {
  if (!ctx || !playing) return;
  const phase = (ctx.currentTime - start) / SPB;
  const frac = phase < 0 ? 1 : phase - Math.floor(phase);
  document.documentElement.style.setProperty('--beat', Math.exp(-frac * 6).toFixed(3));
  raf = requestAnimationFrame(pulse);
}

async function play() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  await ctx.resume();
  playing = true;
  start = nextBeat = ctx.currentTime + 0.05;
  schedule();
  timer = window.setInterval(schedule, 25);
  raf = requestAnimationFrame(pulse);
}

function stop() {
  playing = false;
  window.clearInterval(timer);
  cancelAnimationFrame(raf);
  document.documentElement.style.setProperty('--beat', '0');
  void ctx?.suspend();
}

export function sound() {
  const btn = document.querySelector<HTMLButtonElement>('[data-audio-toggle]');
  const label = document.querySelector<HTMLElement>('[data-audio-label]');
  if (!btn || !label) return;

  const render = () => {
    btn.setAttribute('aria-pressed', String(playing));
    label.textContent = playing ? 'on' : 'off';
  };

  if (reducedMotion() || !('AudioContext' in window)) {
    btn.disabled = true;
    btn.title = reducedMotion() ? 'Off because reduced motion is on' : 'Not supported in this browser';
    return;
  }

  btn.addEventListener('click', async () => {
    if (playing) stop();
    else await play();
    setPref('audio', playing ? 'on' : 'off');
    render();
  });

  // Never autoplays. If it was on last page, it comes back on the visitor's next click or key press.
  if (getPref('audio') === 'on') {
    label.textContent = 'resumes on click';
    const resume = async (e: Event) => {
      window.removeEventListener('pointerdown', resume, true);
      window.removeEventListener('keydown', resume, true);
      if (btn.contains(e.target as Node)) return render(); // the button's own handler decides
      await play();
      render();
    };
    window.addEventListener('pointerdown', resume, true);
    window.addEventListener('keydown', resume, true);
  }
}
