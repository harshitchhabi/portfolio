// What each station shows besides the project facts: the daemon, the foiled
// moment, and the handwritten margin notes. Notes only say things that are true.

export interface StationExtras {
  daemon: 'signe' | 'vayu' | 'honeybot' | 'redacto' | 'lockjaw' | 'auctioneers' | 'forge' | 'tula';
  /** What happens to the Intruder here, in a few words (also used as a caption). */
  foil: string;
  notes: { text: string; arrow: 'left' | 'right' | 'down' | 'up' | 'none'; color: 'pink' | 'green' | 'ink' }[];
  doodle: 'circuit' | 'cable' | 'signal' | 'plug';
}

export const STATION: Record<string, StationExtras> = {
  signify: {
    daemon: 'signe',
    foil: 'Signe signs STOP. The Intruder reads it.',
    notes: [
      { text: 'wave at it. it waves back.', arrow: 'left', color: 'pink' },
      { text: 'majority vote over a few frames = no flicker', arrow: 'none', color: 'green' },
    ],
    doodle: 'signal',
  },
  'vayu-rakshak': {
    daemon: 'vayu',
    foil: 'Vayu sniffs the Intruder out of a smoke plume.',
    notes: [
      { text: 'satellite → fire check → ground AQI', arrow: 'right', color: 'green' },
      { text: 'built at one hackathon, extended at another', arrow: 'none', color: 'pink' },
    ],
    doodle: 'circuit',
  },
  ids: {
    daemon: 'honeybot',
    foil: 'The Intruder gets stuck in the honey.',
    notes: [
      { text: '← the bit I’m proudest of', arrow: 'none', color: 'pink' },
      { text: 'free labels… for the attacker too', arrow: 'left', color: 'green' },
    ],
    doodle: 'cable',
  },
  privacygate: {
    daemon: 'redacto',
    foil: 'Redacto blacks out the Intruder mid-sentence.',
    notes: [{ text: 'team project. I built most of it.', arrow: 'left', color: 'pink' }],
    doodle: 'plug',
  },
  'secure-file-hashing': {
    daemon: 'lockjaw',
    foil: 'The Intruder bangs on Lockjaw. Nothing. TAMPER DETECTED.',
    notes: [
      { text: 'AES for the file, RSA for the key', arrow: 'right', color: 'green' },
      { text: 'my SBI internship project', arrow: 'none', color: 'pink' },
    ],
    doodle: 'circuit',
  },
  'dream-merchants': {
    daemon: 'auctioneers',
    foil: 'The Auctioneers sell the Intruder. Going once… SOLD.',
    notes: [
      { text: 'rewrote this one from TypeScript to Go', arrow: 'left', color: 'pink' },
      { text: '~700 people, one server', arrow: 'none', color: 'green' },
    ],
    doodle: 'cable',
  },
  novacraft: {
    daemon: 'forge',
    foil: 'Forge bricks the Intruder into a wall.',
    notes: [
      { text: 'compiler, passes and an IDE. all of it mine.', arrow: 'right', color: 'pink' },
    ],
    doodle: 'signal',
  },
  mandi: {
    daemon: 'tula',
    foil: 'The Intruder tries to slip in a bad row. Tula: CHECK VIOLATED.',
    notes: [
      { text: '26.5M raw rows in, 6.78M clean ones out', arrow: 'right', color: 'green' },
      { text: 'measured my own design. it lost.', arrow: 'none', color: 'pink' },
    ],
    doodle: 'plug',
  },
};
