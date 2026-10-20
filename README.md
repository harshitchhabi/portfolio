# Pit Wall

My portfolio. It's laid out like a race engineer's pit wall and a Berlin club poster, and the content is my security, ML and systems work.

Built with Astro (static), TypeScript, GSAP and plain CSS. No trackers, no third-party requests, no inline scripts.

## Run it

Needs Node 22.18 or newer.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
```

`npm run dev` and `npm run preview` don't send the security headers. Those come from `vercel.json` in production, so the terminal's `headers` command shows ✗ locally and ✓ once deployed.

## Edit content

### Projects

Each project is one Markdown file in `src/content/projects/`. The leaderboard, timing tower, terminal `ls` and case-study pages are all generated from these files.

Frontmatter (checked by zod in `src/content.config.ts`, so the build fails if something's wrong):

| Field | What it does |
|---|---|
| `pos`, `order` | Leaderboard position (`P1`…) and sort order |
| `code` | Three capital letters, e.g. `IDS`. Also used by `open <code>` in the terminal |
| `title`, `oneLiner` | Title and the one-line outcome at the top of the case study |
| `type` | `Security`, `ML`, `Systems` or `Web` (drives the filter chips) |
| `status` | `best` (purple), `latest` (green), `wip` (yellow), `team` (blue) |
| `year`, `role`, `team`, `stack`, `repo`, `live` | The mono header strip |
| `metrics` | `[{ label, value }]`. Shown as big timing readouts in the result sector |
| `resultSector` | Which sector (1–3) holds the headline result. That segment of the sector bar goes purple. Default 3 |
| `cover`, `coverAlt` | Screenshot. Leave `cover` out to get the typographic placeholder |
| `diagram` | Optional pipeline diagram, drawn as SVG at build time (see `ids.md` for an example). Node `state`: `done` (solid), `wip` (dashed yellow), `alert` (red), `best` (purple) |
| `stints` | Dream Merchants only: one mini header strip and readouts per sector |

The body is plain Markdown. Every `##` heading becomes a sector (`S1`, `S2`, `S3`), and its text goes into the sector bar. Text before the first `##` becomes an intro paragraph. Keep each sector under about 150 words.

Search for `TODO(harshit)` to find the facts still missing.

### Adding screenshots

1. Put the image in `src/assets/projects/<slug>/`, e.g. `src/assets/projects/ids/cover.png`.
2. In the project's Markdown, add:
   ```yaml
   cover: ../../assets/projects/ids/cover.png
   coverAlt: The IDS dashboard during an A1 poisoning run.
   ```
3. Build. Astro turns it into AVIF and WebP at a few widths with the right width and height, so nothing shifts while loading.

Screenshots go in `src/assets/` rather than `public/` because only files under `src/` get converted and resized.

### Lineup, Race Control, contact

- Lineup entries: the `entries` array at the top of `src/components/Lineup.astro`.
- Contact links: `src/components/BoxBox.astro`, and the `contact` command in `src/scripts/terminal.ts`.
- Resume: replace `public/resume.pdf`. Make sure the PDF has no phone number on it.

## Race Control feed from Cowrie logs

Race Control currently runs on hand-written sample events in `src/data/race-control.json`, and the section says `SIMULATED FEED · SAMPLE EVENTS`.

To swap in real, anonymised events from the IDS testbed's Cowrie honeypot:

```bash
npm run feed -- path/to/cowrie.json
# or pick the output file and how many events to keep:
npm run feed -- path/to/cowrie.json --out src/data/race-control.json --limit 12
```

`cowrie.json` is Cowrie's JSON-lines log (`var/log/cowrie/cowrie.json`). The script:

- keeps only the first two octets of IPv4 addresses (`45.83.xx.xx`) and hashes IPv6 addresses,
- never copies usernames, passwords, command text or download URLs (commands are counted, files keep a shortened SHA-256),
- groups each session into a few entries: brute force, decoy login, file download, session closed.

Once the file's `source` is no longer `sample`, the section header changes to `REPLAYED FEED · ANONYMISED COWRIE LOG`. It still isn't live, and the page doesn't claim it is. Check the output before committing it.

## Deploy

Import the repo into Vercel. `vercel.json` sets the build command, output folder, clean URLs and these headers on every response:

- `Content-Security-Policy` with `default-src 'self'` and no `unsafe-inline` for scripts or styles
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (camera, mic, geolocation off), `Cross-Origin-Opener-Policy`, `X-Frame-Options: DENY`

After the first deploy, set the real domain as `SITE` in `astro.config.ts`. Canonical URLs, the sitemap, `robots.txt`, the Open Graph image URL and `/.well-known/security.txt` all use it. `security.txt` expires on 2027-10-20, so update the date before then.

To keep the CSP strict, the build writes every script and stylesheet to its own file (`inlineStylesheets: 'never'`, `assetsInlineLimit: 0`), and the theme is set before first paint by `public/theme-init.js`, not an inline script. If you add a component, don't use `style="…"` attributes or inline `<script>` blocks; use classes and `<script>` tags that Astro bundles.

## How it's put together

```
src/
  content/projects/    one Markdown file per project
  content.config.ts    the frontmatter schema
  data/                Race Control events
  lib/
    sectors-plugin.ts  Markdown → S1/S2/S3 sectors, readouts, diagrams, stints
    diagram.ts         build-time SVG pipeline diagrams
  components/          Hero, Leaderboard, RaceControl, Lineup, BoxBox, Terminal, …
  pages/               home, case studies, 404, sitemap, robots, security.txt
  scripts/             client code: hero intro, Flip filters, terminal, audio, …
  styles/              tokens.css (every colour), global.css, case.css
scripts/cowrie-to-feed.ts
vercel.json
```

Colours only come from `src/styles/tokens.css`, and each status colour means one thing (see the legend in the footer). Motion plays once, explains something (order, state or position) and switches off under `prefers-reduced-motion`. With JavaScript off, everything is still visible.

The audio toggle makes a 128 BPM kick and hat with the Web Audio API. It's off by default and never starts on page load. If you turned it on, it picks up again on your first click or key press on the next page. It's disabled under reduced motion.
