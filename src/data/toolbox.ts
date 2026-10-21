// The Toolbox: what I build with, grouped, and where each tool was used.
// Only tools a project here actually shows. `used` names project slugs;
// 'site' is this portfolio and 'sbi' the internship in the logbook.

export type Use = 'signify' | 'vayu-rakshak' | 'ids' | 'privacygate' | 'secure-file-hashing' | 'dream-merchants' | 'novacraft' | 'mandi' | 'site' | 'sbi';

export interface Tool {
  name: string;
  used: Use[];
}

export interface Shelf {
  name: string;
  tools: Tool[];
}

export const USES: Record<Use, { label: string; href: string }> = {
  signify: { label: 'Signify', href: '/projects/signify' },
  'vayu-rakshak': { label: 'Vayu Rakshak', href: '/projects/vayu-rakshak' },
  ids: { label: 'IDS', href: '/projects/ids' },
  privacygate: { label: 'PrivacyGate', href: '/projects/privacygate' },
  'secure-file-hashing': { label: 'File Hashing', href: '/projects/secure-file-hashing' },
  'dream-merchants': { label: 'Dream Merchants', href: '/projects/dream-merchants' },
  novacraft: { label: 'NovaCraft', href: '/projects/novacraft' },
  mandi: { label: 'Mandi', href: '/projects/mandi' },
  site: { label: 'this site', href: '/' },
  sbi: { label: 'SBI internship', href: '/#logbook' },
};

export const SHELVES: Shelf[] = [
  {
    name: 'languages',
    tools: [
      { name: 'Python', used: ['signify', 'vayu-rakshak', 'ids', 'privacygate', 'mandi'] },
      { name: 'TypeScript', used: ['dream-merchants', 'novacraft', 'site'] },
      { name: 'Go', used: ['dream-merchants'] },
      { name: 'JavaScript', used: ['secure-file-hashing', 'dream-merchants'] },
      { name: 'SQL', used: ['mandi', 'secure-file-hashing', 'dream-merchants'] },
    ],
  },
  {
    name: 'ML & vision',
    tools: [
      { name: 'PyTorch', used: ['signify', 'ids'] },
      { name: 'scikit-learn', used: ['signify', 'vayu-rakshak', 'ids'] },
      { name: 'XGBoost', used: ['vayu-rakshak', 'ids'] },
      { name: 'MediaPipe', used: ['signify'] },
      { name: 'OpenCV', used: ['signify'] },
      { name: 'spaCy', used: ['privacygate'] },
      { name: 'Presidio', used: ['privacygate'] },
    ],
  },
  {
    name: 'web & backend',
    tools: [
      { name: 'Next.js', used: ['signify', 'dream-merchants'] },
      { name: 'React', used: ['dream-merchants'] },
      { name: 'Node.js', used: ['secure-file-hashing', 'dream-merchants'] },
      { name: 'Express', used: ['secure-file-hashing'] },
      { name: 'FastAPI', used: ['signify', 'ids'] },
      { name: 'Astro', used: ['site'] },
      { name: 'Streamlit', used: ['vayu-rakshak', 'privacygate'] },
      { name: 'HTMX', used: ['ids'] },
    ],
  },
  {
    name: 'data',
    tools: [
      { name: 'PostgreSQL', used: ['mandi', 'dream-merchants'] },
      { name: 'MySQL', used: ['secure-file-hashing'] },
      { name: 'Drizzle ORM', used: ['dream-merchants'] },
      { name: 'SQLite', used: ['ids'] },
      { name: 'pandas', used: ['mandi'] },
      { name: 'Google Earth Engine', used: ['vayu-rakshak'] },
    ],
  },
  {
    name: 'deployment',
    tools: [
      { name: 'Docker', used: ['dream-merchants', 'mandi'] },
      { name: 'Caddy', used: ['dream-merchants'] },
      { name: 'AWS', used: ['dream-merchants'] },
      { name: 'Vercel', used: ['site'] },
    ],
  },
  {
    name: 'security',
    tools: [
      { name: 'VAPT', used: ['sbi'] },
      { name: 'AES/RSA hybrid encryption', used: ['secure-file-hashing'] },
      { name: 'bcrypt', used: ['secure-file-hashing', 'dream-merchants'] },
      { name: 'Cowrie honeypots', used: ['ids'] },
    ],
  },
  {
    name: 'also',
    tools: [
      { name: 'WebAssembly', used: ['novacraft'] },
      { name: 'Git', used: [] },
      { name: 'Jest', used: ['novacraft'] },
      { name: 'uv', used: ['ids', 'privacygate'] },
    ],
  },
];
