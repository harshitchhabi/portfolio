---
pos: 6
code: DMC
title: 'Dream Merchants: Event Platforms'
oneLiner: Three live-event platforms for my college club, built to survive hundreds of people hitting them at once.
type: Systems
year: '2026'
status: latest
role: Technical Head, Dream Merchants Club, VIT Vellore
team: Club tech team
stack: [Go, TypeScript, Next.js, React, PostgreSQL, WebSockets, Docker, Caddy, AWS]
repo: https://github.com/harshitchhabi/Stockastic
metrics:
  - { label: Platforms, value: '3' }
  - { label: Stockastic participants, value: '~700' }
order: 6
resultSector: 1
stints:
  - name: Stockastic
    what: Live stock-market simulation
    stack: [Go, React, PostgreSQL, WebSockets, AWS]
    repo: https://github.com/harshitchhabi/Stockastic
    metrics:
      - { label: 'Errors at 750 teams, 6× pace', value: '0' }
      - { label: 'p99 trade, 750 teams', value: '12 ms' }
      - { label: '1,000 logins at once, worst', value: '1.2 s' }
  - name: Dream Team
    what: Real-time IPL-style player auction
    stack: [Go, Next.js, PostgreSQL, WebSockets, Docker, Caddy]
    repo: https://github.com/harshitchhabi/test_dream_team
    metrics:
      - { label: Player pool, value: '250' }
  - name: Bricks by Bid
    what: Auction and city-building game
    stack: [Next.js, Node.js, PostgreSQL, Drizzle ORM]
    repo: https://github.com/harshitchhabi/test_BBB
    metrics:
      - { label: Stages, value: '3' }
---

I'm the Technical Head of the Dream Merchants Club at VIT Vellore (2026 to now). The club runs live events, and I build and host the platforms they run on, including the AWS setup. Each one has a hard deadline: the event starts at a fixed time and everyone logs in at once.

## Stockastic

A live stock-market simulation for about 700 participants, in teams. Prices come from a scenario the organisers write; teams buy and sell at the current price, two trades a minute.

The first backend was TypeScript and it lagged once a few hundred people were trading at once, so I rewrote it in Go. It's now one Go binary that serves the app, the API and the WebSocket feed, and writes every trade to disk before confirming it. A hard crash loses nothing that was acknowledged.

The trade-off: one server, on purpose. A single writer is far simpler to keep correct than a cluster, and the load tests showed one machine had plenty of headroom. Login is the real bottleneck, because bcrypt is slow by design.

## Dream Team

A real-time IPL-style player auction. Teams bid live on a 250-player pool with purses and squad rules enforced by the server, and an admin console runs the auction. Go and PostgreSQL behind WebSockets, with a Next.js frontend, shipped in Docker behind Caddy.

TODO(harshit): number of teams and how the event went.

## Bricks by Bid

An auction and city-building game in three stages: a materials auction, trading and building, then a city auction. Next.js and Node.js with PostgreSQL through Drizzle ORM.

TODO(harshit): number of participants and what you'd change.
