# Daemons

My portfolio. In Unix a daemon is a process that runs quietly in the background, keeping things safe and working. Here each project is guarded by a hand-drawn daemon on a 3D server floor at night, printed in white ink and two riso colours. A scribbly Intruder sneaks through the whole site, gets stopped at every station, and ends up in a jar at the bottom.

Astro (static) + TypeScript, Three.js for the floor, GSAP and Lenis for motion, Rough.js and perfect-freehand for everything hand-drawn. No trackers and no inline scripts or styles. Nothing is loaded from another site until a visitor presses play on the music.

## Run it

Needs Node 22.18 or newer (the build scripts are TypeScript run directly by Node).

```bash
npm install
npm run dev          # draws the characters, then http://localhost:4321
npm run build        # draws the characters, then the static site in dist/
npm run characters   # just redraw the characters
npm run feed -- cowrie.json   # turn a Cowrie log into Honeybot's log (see below)
```

`npm run dev` doesn't send the security headers; Vercel does, from `vercel.json`.

## Three ways to see the site

- **The show (3D).** A Three.js server floor behind the page, drawn through an ink shader. The camera flies down the aisle as you scroll and stops at each daemon. It loads only after the page has painted, and only when the device can handle it.
- **Static.** Under any of: no WebGL2, `prefers-reduced-motion`, Save-Data, `deviceMemory < 4`, or a touch screen narrower than 900px, the 3D never loads. Each station shows its daemon as a large drawing of the moment it foils the Intruder instead. The decision is in `src/lib/mode.ts`.
- **Skip the show.** The toggle in the nav switches to a plain list of the projects, the logbook and contact. It's remembered in `localStorage`, and `public/mode-init.js` applies it before first paint.

## Edit content

### Projects

One Markdown file per project in `src/content/projects/`. The home page stations, case-study pages, the shell's `ls`/`ps`/`open` and the plain list all come from these.

Frontmatter, checked by zod in `src/content.config.ts`:

| Field | What it does |
|---|---|
| `order` | Station number (1 to 7) |
| `slug` | URL: `/projects/<slug>` |
| `title`, `oneLiner` | Title and the one-sentence summary |
| `daemon`, `pid` | The daemon's name and its 4-digit PID label |
| `type` | `Security`, `ML`, `Systems` or `Web` |
| `year`, `role`, `team`, `stack`, `repo`, `live` | The metadata line |
| `metrics` | `[{ label, value }]`: real numbers only, drawn as hand-written numbers with a scribbled circle |
| `stamp` | `VERIFIED`, `CAUGHT`, `PATCHED`, `SOLD`, `IN PROGRESS`, `CLASSIFIED` or `0-DAY` |
| `cover`, `coverAlt` | Screenshot (see below). Leave out for the "screenshot goes here" placeholder |

The body uses three headings: `## What was wrong`, `## What I built`, `## What happened`. Keep each under about 150 words.

Per-station extras (which daemon, the foiled-moment caption, margin notes, doodle) are in `src/data/stations.ts`. The hand-drawn diagram for each case study is in `src/data/diagrams.ts`; it's drawn at build time and inserted at the end of "What I built".

### Screenshots

1. Put the image in `src/assets/projects/<slug>/`, e.g. `src/assets/projects/ids/cover.png`.
2. In the project's Markdown:
   ```yaml
   cover: ../../assets/projects/ids/cover.png
   coverAlt: The IDS dashboard while an A1 poisoning run is going.
   ```
3. Build. Astro converts it to AVIF and WebP at a few sizes with explicit width and height. On the case-study page it's pinned down with tape.

They go in `src/assets/` rather than `public/` because only files under `src/` get converted and resized.

### Logbook, contact, resume

- Logbook entries: the `entries` array at the top of `src/components/Logbook.astro`.
- Toolbox (skills): `src/data/toolbox.ts`. Each tool lists the projects that used it; add a tool only when a project shows it.
- Contact links: `src/components/Jar.astro`, the `contact` command in `src/scripts/shell.ts`, and the plain list in `src/components/SkipList.astro`.
- Resume: replace `public/resume.pdf`. Check it has no phone number on it.

## Tweak the characters

Each character is a file in `src/characters/` (`signe.ts`, `vayu.ts`, `honeybot.ts`, `redacto.ts`, `lockjaw.ts`, `auctioneers.ts`, `forge.ts`, `intruder.ts`). A character has an `idle`, `react` and `action` pose (the Intruder also has `caught`). Each pose is a `draw(p)` function using the pen in `src/characters/pen.ts`:

```ts
p.circle(128, 160, 124, { fill: 'green' });      // knock-out, riso fill (out of register), ink outline
p.eye(128, 152, 20);                              // an eye socket; the pupil is added at runtime
p.text('HONEYPOT', 90, 191, 8.4);                 // hand lettering (src/characters/font.ts)
p.rect(80, 138, 96, 14, { dash: [6, 5] });        // dashed: not built yet
```

Shared bits (gloves, speech bubbles, sparks, motion lines) are in `src/characters/parts.ts`. Colours are only `ink`, `dim`, `pink`, `green`, `stamp` and `paper`.

`npm run characters` (also run before every dev and build) renders, per character:

- `public/characters/<id>/<pose>-0|1|2.svg`: three line-boil frames. The same drawing with different Rough.js seeds; CSS cycles them at about 10 fps, or once per 8th note while the sound is on.
- `public/characters/<id>/<pose>-still.svg`: frame 0 with pupils, for plain images and the OG image.
- `public/characters/<id>/sheet.webp`: every pose and frame on one sheet, the texture for the 3D floor.
- `src/data/characters.json`: eye positions, alt text and sheet layout.

These are generated, so they're not in git. To see the whole cast with boil and cursor-tracking pupils, open `/dev/characters`. It isn't linked anywhere and is kept out of search engines.

## Honeybot's log from Cowrie

The IDS case study shows "Honeybot's log", which reads `src/data/honeybot-log.json`. Right now that's hand-written sample events, and the page says `SIMULATED · SAMPLE EVENTS`.

To swap in real, anonymised events from the IDS project's Cowrie honeypot:

```bash
npm run feed -- path/to/cowrie.json
npm run feed -- path/to/cowrie.json --out src/data/honeybot-log.json --limit 12
```

`cowrie.json` is Cowrie's JSON-lines log. The script keeps only the first two octets of IPv4 addresses (`45.83.xx.xx`), hashes IPv6 addresses, and never copies usernames, passwords, command text or download URLs. Once the file's `source` isn't `sample`, the label changes to "replayed · anonymised Cowrie log, not live". Read the output before committing it.

## Music

`music: off` in the nav opens the Walkman (`src/components/Walkman.astro`, `src/scripts/walkman.ts`). It never plays on its own; the first click starts Loser by Tame Impala on loop. **pick** lets a visitor search for a song, paste a YouTube or YouTube Music link, or play a file from their own device. Volume is a slider, and `M` mutes.

- The player is YouTube's embed from `youtube-nocookie.com`, driven by `postMessage`. No YouTube script is loaded into the page, and nothing goes to YouTube before the click.
- The Walkman sits in a `transition:persist` wrapper in `src/layouts/Base.astro`, so the song keeps going between pages. In Chrome and Edge the frame is moved, not reloaded. Other browsers reload it and pick up from the same second.
- The chosen song and the volume are remembered in `localStorage`. A local file never is; it stays in the browser as a `blob:` URL.
- YouTube's terms want the player visible and at least 200×200, which is why the cassette window shows the video.
- The beat and the music stop each other.

Search goes through `api/yt-search.ts`, a Vercel function, so the API key never reaches the browser. Set it in Vercel under Settings → Environment Variables:

```
YOUTUBE_API_KEY=<key with only the YouTube Data API v3 enabled>
```

Without it, search says it isn't set up and pasting a link still works. Restrict the key to the YouTube Data API v3 in Google Cloud.

## The shell

Press `~` (or the `~` in the nav). Commands: `help`, `whoami`, `ls`, `ps`, `open <daemon>`, `contact`, `kill intruder`, `clear`. `kill intruder` yanks the Intruder into the jar and adds one to the jar's counter for this session.

## Deploy

Vercel. `vercel.json` sets the build, clean URLs and these headers on every response:

- `Content-Security-Policy`: `default-src 'self'`, no `unsafe-inline` or `unsafe-eval`. The only other origin is `frame-src https://www.youtube-nocookie.com` for the music player, plus `media-src blob:` for a visitor's own audio file
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (camera, mic, geolocation off), `Cross-Origin-Opener-Policy`, `X-Frame-Options: DENY`

To keep the CSP strict, every script and stylesheet is its own file (`inlineStylesheets: 'never'`, `assetsInlineLimit: 0`), character textures are files built ahead of time, and nothing uses `style="…"` attributes. Astro's `transition:name` writes an inline `<style>`, so the title morph between pages sets `view-transition-name` from `src/scripts/vt.ts` instead. Use classes and Astro-bundled `<script>` tags in new components.

The site lives at `harshitchhabi.vercel.app`, set as `SITE` in `astro.config.ts`; canonical URLs, the sitemap, `robots.txt`, the OG image URL and `/.well-known/security.txt` use it. `security.txt` expires on 2027-10-20.

## Fonts

Self-hosted; the licences allow it:

- **Redaction** © 2019 MCKL Inc., SIL Open Font License 1.1 or LGPL 2.1. The degraded cut (Redaction 50) is for big display text, the clean cut for smaller headings. Via `@fontsource/redaction` and `@fontsource/redaction-50`.
- **Departure Mono** © Helena Zhang, SIL Open Font License 1.1, in `src/fonts/departure-mono/` with its licence.
- **Schibsted Grotesk** (body) and **Delicious Handrawn** (handwriting), both SIL Open Font License 1.1, via Fontsource.

The handwriting font is one variable, `--font-hand` in `src/styles/tokens.css`, so it can be swapped for a font of my own handwriting.

## Layout of the code

```
src/
  characters/        the cast, the pen they're drawn with, the lettering font
  content/projects/  one Markdown file per project
  data/              stations, diagrams, Honeybot's log
  three/             the 3D floor: layout and camera path, world, ink shader, sprites
  components/        Station, Hero, Logbook, Basement, Jar, Shell, Daemon, marks/…
  lib/               Rough.js helpers, diagrams, the Markdown plugin, mode detection
  scripts/           client code: arrivals, smooth scroll, cursor, eyes, shell, sound, walkman
api/
  yt-search.ts       song search for the Walkman (needs YOUTUBE_API_KEY)
  styles/            tokens.css (every colour), global.css
scripts/
  build-characters.ts
  cowrie-to-feed.ts
```
