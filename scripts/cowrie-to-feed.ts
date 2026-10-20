// Converts Cowrie honeypot logs (JSON lines) into the Race Control feed format
// in src/data/race-control.json.
//
//   node scripts/cowrie-to-feed.ts path/to/cowrie.json [--out src/data/race-control.json] [--limit 12]
//
// Privacy rules, applied before anything is written:
//   - IPv4 addresses keep their first two octets only (45.83.xx.xx).
//   - IPv6 addresses become a short hash.
//   - Usernames, passwords and command text are never copied. Commands are counted.
//   - File downloads keep only a shortened SHA-256, never the URL.
//
// Needs Node 22.18+ (runs TypeScript directly). No dependencies.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

type Kind = 'incident' | 'investigation' | 'decision' | 'resolved';
interface FeedEvent {
  time: string;
  kind: Kind;
  message: string;
  outcome: 'NOTED' | 'BLOCKED' | 'RESOLVED';
}
interface CowrieLine {
  eventid?: string;
  timestamp?: string;
  src_ip?: string;
  session?: string;
  shasum?: string;
  version?: string;
}

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const flag = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
if (!input) {
  console.error('usage: node scripts/cowrie-to-feed.ts <cowrie.json> [--out file] [--limit n]');
  process.exit(1);
}
const out = flag('out', 'src/data/race-control.json');
const limit = Number(flag('limit', '12'));

export function anonymiseIp(ip: string | undefined): string {
  if (!ip) return 'unknown';
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (v4) return `${v4[1]}.${v4[2]}.xx.xx`;
  return `v6:${createHash('sha256').update(ip).digest('hex').slice(0, 8)}`;
}

const hhmmss = (ts: string | undefined) => (ts ? new Date(ts).toISOString().slice(11, 19) : '--:--:--');
const n = (x: number) => x.toLocaleString('en-US');

const lines: CowrieLine[] = readFileSync(input, 'utf8')
  .split('\n')
  .filter((l) => l.trim())
  .flatMap((l) => {
    try {
      return [JSON.parse(l) as CowrieLine];
    } catch {
      return [];
    }
  });

// Group by session so one attacker's run becomes a few readable entries.
const sessions = new Map<string, CowrieLine[]>();
for (const l of lines) {
  const key = l.session ?? `${l.src_ip}-${l.timestamp}`;
  if (!sessions.has(key)) sessions.set(key, []);
  sessions.get(key)!.push(l);
}

const events: (FeedEvent & { at: number })[] = [];
const push = (l: CowrieLine, e: FeedEvent) => events.push({ ...e, at: Date.parse(l.timestamp ?? '') || 0 });

for (const evs of sessions.values()) {
  const first = evs[0];
  const src = anonymiseIp(first.src_ip);
  const failed = evs.filter((e) => e.eventid === 'cowrie.login.failed');
  const success = evs.find((e) => e.eventid === 'cowrie.login.success');
  const commands = evs.filter((e) => e.eventid === 'cowrie.command.input');
  const downloads = evs.filter((e) => e.eventid === 'cowrie.session.file_download');
  const closed = evs.find((e) => e.eventid === 'cowrie.session.closed');
  const version = evs.find((e) => e.eventid === 'cowrie.client.version');

  if (failed.length >= 5) {
    push(failed[0], {
      time: hhmmss(failed[0].timestamp),
      kind: 'incident',
      message: `SSH BRUTE FORCE · ${n(failed.length)} ATTEMPTS · src ${src}`,
      outcome: 'NOTED',
    });
  } else if (version && !success) {
    push(version, { time: hhmmss(version.timestamp), kind: 'investigation', message: `SSH PROBE · src ${src}`, outcome: 'NOTED' });
  }
  if (success) {
    push(success, {
      time: hhmmss(success.timestamp),
      kind: 'incident',
      message: `LOGIN ACCEPTED (DECOY) · src ${src} · ${n(commands.length)} COMMANDS`,
      outcome: 'NOTED',
    });
  }
  for (const d of downloads) {
    const sha = d.shasum ? `${d.shasum.slice(0, 4)}…${d.shasum.slice(-2)}` : 'unknown';
    push(d, { time: hhmmss(d.timestamp), kind: 'investigation', message: `FILE DOWNLOAD · SHA-256 ${sha}`, outcome: 'NOTED' });
  }
  if (closed && (success || failed.length >= 5)) {
    push(closed, { time: hhmmss(closed.timestamp), kind: 'resolved', message: `SESSION CLOSED · src ${src}`, outcome: 'RESOLVED' });
  }
}

const feed = events
  .sort((a, b) => b.at - a.at)
  .slice(0, limit)
  .map(({ at: _at, ...e }) => e);

writeFileSync(
  out,
  JSON.stringify({ source: 'cowrie', note: `Generated from ${lines.length} Cowrie log lines. IPs truncated, credentials and commands dropped.`, events: feed }, null, 2) + '\n',
);
console.log(`wrote ${feed.length} events to ${out}`);
