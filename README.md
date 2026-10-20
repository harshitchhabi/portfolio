# Daemons

My portfolio, being rebuilt as "Daemons": hand-drawn daemon characters, one per project, guarding a 3D server floor at night, printed in ink and two riso colours.

Built with Astro (static) and TypeScript. Three.js, GSAP, Lenis, Rough.js and perfect-freehand arrive phase by phase. No trackers, no third-party requests, no inline scripts.

## Run it

Needs Node 22.18 or newer.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
```

## Content

Each project is one Markdown file in `src/content/projects/`. The frontmatter is checked by zod in `src/content.config.ts`: `order`, `slug`, `title`, `daemon`, `pid`, `oneLiner`, `type`, `year`, `role`, `team`, `stack`, `repo`, `live`, `metrics`, `stamp`, `cover`. The body uses three headings: What was wrong, What I built, What happened.

Search for `TODO(harshit)` to find facts still missing.

## Honeybot's log from Cowrie

```bash
npm run feed -- path/to/cowrie.json   # writes src/data/honeybot-log.json
```

IPv4 addresses keep only their first two octets, IPv6 addresses are hashed, and usernames, passwords, command text and download URLs are never copied.

## Fonts

Self-hosted, all under the SIL Open Font License 1.1:

- Redaction, © 2019 MCKL Inc. (also available under LGPL 2.1), via `@fontsource/redaction` and `@fontsource/redaction-50`
- Departure Mono, © Helena Zhang, in `src/fonts/departure-mono/`
- Schibsted Grotesk and Delicious Handrawn, via Fontsource

The handwriting font is one CSS variable, `--font-hand` in `src/styles/tokens.css`.

## Deploy

Vercel. `vercel.json` sets the security headers (strict CSP, HSTS, nosniff, referrer policy, permissions policy, COOP, frame denial) on every response.
