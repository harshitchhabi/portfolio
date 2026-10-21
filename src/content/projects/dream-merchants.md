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
cover: ../../assets/projects/dream-merchants/stockastic-explore.png
coverAlt: Stockastic mid-event, with companies across every sector trading live and the news wire that moves the market down the side.
shots:
  - src: ../../assets/projects/dream-merchants/stockastic-trade.png
    alt: A Stockastic company page, with its live price chart, open, high and low, and the trade ticket.
  - src: ../../assets/projects/dream-merchants/bricks-by-bid-login.webp
    alt: Bricks by Bid's sign-in page, block-built for the event. Each team signs in with the login its moderator hands out.
  - src: ../../assets/projects/dream-merchants/bricks-by-bid-auction.webp
    alt: The Bricks by Bid moderator console running the stage 1 materials auction, one live lot at a time.
  - src: ../../assets/projects/dream-merchants/dream-team-console.webp
    alt: The Dream Team auctioneer's console, with the current and next player, the bid controls and every team's remaining purse.
  - src: ../../assets/projects/dream-merchants/dream-team-screen.webp
    alt: The Dream Team big screen the room watches, showing the player up for auction, his rating and the current and next bid.
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

A real-time IPL-style player auction. Teams bid live on a 250-player pool with purses and squad rules enforced by the server, and an admin console runs the auction: raise or lower the bid, end bidding or mark a player unsold, with every team's remaining purse in view, while a big-screen display shows the room the player, his rating and the current and next bid. Go and PostgreSQL behind WebSockets, with a Next.js frontend, shipped in Docker behind Caddy.

### Bricks by Bid

An auction and city-building game in three stages: a materials auction, trading and building, then a city auction. Next.js and Node.js with PostgreSQL through Drizzle ORM.

## What happened

Stockastic's load test, on a laptop with the real server: 750 teams trading at six times the allowed pace gave 0 errors and 0 dropped sockets, with a 99th-percentile trade of 12 ms. 1,000 logins at the same moment took 1.2 s at worst. A hard kill mid-session loses nothing that was confirmed.

All three ran as live events at graVITas, VIT's tech fest, and all three went off successfully.
