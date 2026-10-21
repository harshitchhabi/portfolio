// Hand-drawn diagrams for each case study's "What I built" section.
// state: done (ink), wip (dashed: not built yet), alert (pink: the attacker's path), best (green: the result)

export type NodeState = 'done' | 'wip' | 'alert' | 'best';
export interface DiagramSpec {
  caption: string;
  rows: { label?: string; nodes: { text: string; state?: NodeState }[] }[];
}

export const DIAGRAMS: Record<string, DiagramSpec> = {
  signify: {
    caption: 'fig. a · one frame at a time, then a vote',
    rows: [
      {
        nodes: [
          { text: 'webcam or video' },
          { text: 'MediaPipe hand landmarks' },
          { text: 'gesture classifier' },
          { text: 'majority vote over a window' },
          { text: 'text + speech', state: 'best' },
        ],
      },
    ],
  },
  'vayu-rakshak': {
    caption: 'fig. a · each stage only passes on what the next one can check',
    rows: [
      {
        nodes: [
          { text: 'Sentinel-5P HCHO' },
          { text: 'hotspot detection' },
          { text: 'FIRMS fire cross-check' },
          { text: 'AQI correlation', state: 'best' },
        ],
      },
    ],
  },
  ids: {
    caption: 'fig. a · the loop, and the write channel it opens (pink is the attacker’s path)',
    rows: [
      {
        label: 'honest loop',
        nodes: [{ text: 'traffic' }, { text: 'Cowrie honeypot' }, { text: 'auto-label malicious' }, { text: 'retrain RF / XGBoost' }, { text: 'detector' }],
      },
      {
        label: 'poisoning (A1)',
        nodes: [
          { text: 'benign-looking flows', state: 'alert' },
          { text: 'honeypot', state: 'alert' },
          { text: 'labelled malicious', state: 'alert' },
          { text: 'false positives on real users', state: 'alert' },
        ],
      },
      { label: 'defence', nodes: [{ text: 'ShareCap c = 0.05', state: 'best' }, { text: 'honeypot share capped', state: 'best' }] },
    ],
  },
  privacygate: {
    caption: 'fig. a · fail closed: anything left over blocks the document',
    rows: [
      {
        nodes: [
          { text: 'PDF · DOCX · PPTX' },
          { text: 'extract text (+ OCR)' },
          { text: 'detect PII' },
          { text: 'swap for tokens' },
          { text: 'rescan' },
          { text: 'approved or blocked', state: 'best' },
        ],
      },
    ],
  },
  'secure-file-hashing': {
    caption: 'fig. a · the download path ends with the tamper check',
    rows: [
      {
        label: 'upload',
        nodes: [{ text: 'file' }, { text: 'SHA-256 hash stored' }, { text: 'AES-256 encrypt file' }, { text: 'RSA-2048 encrypt AES key' }, { text: 'store' }],
      },
      {
        label: 'download',
        nodes: [{ text: 'decrypt AES key' }, { text: 'decrypt file' }, { text: 're-hash' }, { text: 'compare', state: 'best' }],
      },
    ],
  },
  'dream-merchants': {
    caption: 'fig. a · Stockastic after the rewrite: one server, nothing confirmed before it is on disk',
    rows: [
      {
        nodes: [
          { text: 'browsers (WebSocket)' },
          { text: 'one Go binary' },
          { text: 'write to disk' },
          { text: 'then confirm the trade', state: 'best' },
        ],
      },
    ],
  },
  novacraft: {
    caption: 'fig. a · the compiler stage by stage, with my own IDE on top',
    rows: [
      { label: 'front', nodes: [{ text: 'lexer' }, { text: 'parser' }, { text: 'semantic analysis' }, { text: 'three-address IR' }] },
      { label: 'back', nodes: [{ text: 'fold + DCE' }, { text: 'range analysis' }, { text: 'linear-scan regalloc' }, { text: 'WAT codegen' }] },
      { label: 'tools', nodes: [{ text: 'NovaCraft IDE', state: 'best' }] },
    ],
  },
  mandi: {
    caption: 'fig. a · from two messy CSV files to six measured experiments',
    rows: [
      {
        label: 'data',
        nodes: [{ text: 'AGMARKNET CSVs (26.5M rows)' }, { text: 'clean + match markets' }, { text: '6.78M price rows' }],
      },
      {
        label: 'database',
        nodes: [{ text: '16 tables, 3NF' }, { text: 'GiST: no double booking' }, { text: '20 queries' }, { text: '6 experiments', state: 'best' }],
      },
    ],
  },
};
