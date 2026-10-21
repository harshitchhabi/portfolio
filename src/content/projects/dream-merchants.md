---
order: 6
slug: dream-merchants
title: 'Dream Merchants: Event Platforms'
daemon: The Auctioneers
pid: 6128
oneLiner: Three live-event platforms for my college club, built to survive hundreds of people hitting them at once.
type: Systems
year: '2026'
role: Technical Head, Dream Merchants Club, VIT Vellore
team: Club tech team
stack: [Go, TypeScript, Next.js, React, PostgreSQL, WebSockets, Docker, Caddy, AWS]
repo: https://github.com/harshitchhabi/Stockastic
platforms:
  - { name: Stockastic, what: live stock-market simulation, repo: https://github.com/harshitchhabi/Stockastic }
  - { name: Dream Team, what: real-time IPL-style player auction, repo: https://github.com/harshitchhabi/test_dream_team }
  - { name: Bricks by Bid, what: auction and city-building game, repo: https://github.com/harshitchhabi/test_BBB }
metrics:
  - { label: platforms, value: '3' }
  - { label: Stockastic participants, value: '~700' }
  - { label: 'Stockastic errors at 750 teams, 6× pace', value: '0' }
stamp: SOLD
---

I'm the Technical Head of the Dream Merchants Club at VIT Vellore (2026 to now). The club runs live events, and I build and host the platforms they run on, including the AWS setup.

## What was wrong

Every event has a hard deadline: it starts at a fixed time and everyone logs in at once. If the platform lags or drops a trade mid-event, there's no second take. Off-the-shelf tools didn't fit the club's rules, so each event needed its own platform.

## What I built

### Stockastic

A live stock-market simulation for about 700 participants, in teams. Prices come from a scenario the organisers write; teams buy and sell at the current price, two trades a minute.

It plays like a real trading app: 150 companies across 15 sectors with live prices and charts, a watchlist, holdings, funds and live standings. A news wire drops headlines (a GST cut, an oil spike, a rumour about a bank) that the organisers use to move the market, and an organiser console runs the event phase by phase.

The first backend was TypeScript and it lagged once a few hundred people were trading at once, so I rewrote it in Go. It's now one Go binary that serves the app, the API and the WebSocket feed, and writes every trade to disk before confirming it.

The trade-off: one server, on purpose. A single writer is far simpler to keep correct than a cluster, and the load tests showed one machine had plenty of headroom. Login is the real bottleneck, because bcrypt is slow by design.

### Dream Team

A real-time IPL-style player auction. Teams bid live on a 250-player pool with purses and squad rules enforced by the server, and an admin console runs the auction. Go and PostgreSQL behind WebSockets, with a Next.js frontend, shipped in Docker behind Caddy.

### Bricks by Bid

An auction and city-building game in three stages: a materials auction, trading and building, then a city auction. Next.js and Node.js with PostgreSQL through Drizzle ORM.

## What happened

Stockastic's load test, on a laptop with the real server: 750 teams trading at six times the allowed pace gave 0 errors and 0 dropped sockets, with a 99th-percentile trade of 12 ms. 1,000 logins at the same moment took 1.2 s at worst. A hard kill mid-session loses nothing that was confirmed.

All three ran as live events at graVITas, VIT's tech fest, and all three went off successfully.
