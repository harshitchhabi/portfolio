---
order: 8
slug: mandi
title: 'Mandi: a Price and Supply-Chain Database'
daemon: Tula
pid: 8086
oneLiner: Three years of real wholesale market prices in PostgreSQL, cleaned, constrained, queried and then measured.
type: Data
year: '2026'
role: Solo. Cleaning, schema, queries and experiments
team: Solo, Database Systems Lab case study, VIT
stack: [PostgreSQL, SQL, Python, pandas, NumPy, matplotlib, Docker]
repo: https://github.com/harshitchhabi/mandi-price-db
repoPrivate: true
metrics:
  - { label: 'real price rows, after cleaning', value: '6.78M' }
  - { label: tables in 3NF, value: '16' }
  - { label: 'faster: materialized view', value: '6,307×' }
stamp: VERIFIED
cover: ../../assets/projects/mandi/er.png
coverAlt: The full ER diagram, real AGMARKNET tables in blue and the synthetic supply-chain tables in orange.
shots:
  - src: ../../assets/projects/mandi/indexes.png
    alt: Experiment 1, every index tried against four queries. The right index turns 184 ms into 0.2 ms; the wrong one does nothing.
---

## What was wrong

India's wholesale markets (mandis) publish daily prices through AGMARKNET, but the raw files are messy: two sources with unrelated market and district codes, mixed units, prices where the minimum is above the maximum, and the same commodity spelled 377 ways. I wanted a database that could answer real questions about that data, and then to measure what actually makes those answers fast instead of assuming it.

## What I built

A PostgreSQL 17 database on real AGMARKNET data for six states (Uttar Pradesh, Maharashtra, Madhya Pradesh, Punjab, Haryana, Karnataka) from June 2023 to May 2026. Cleaning took 26.5 million raw rows down to 6,777,186 price observations, with a counter for every fix and two runs giving byte-identical output. The codes didn't match across sources (0 of 1,297 shared markets had the same code), so I matched markets by normalised name and gave them new IDs.

The schema is 16 tables in third normal form: the real price, arrival and geography tables, plus synthetic farmers, traders, vehicles, cold storage and sales. Two GiST exclusion constraints make it impossible to double-book a cold-storage slot or a vehicle. Then 20 queries, and six timed experiments: indexes, partitioning, a materialized view, query rewrites, the cost of the exclusion constraint, and split against merged fact tables.

## What happened

The right composite index took one market's quarter from 184 ms to 0.2 ms, a materialized view answered a repeated summary 6,307× faster, and rewriting a correlated subquery as a join made it 234× faster. A BRIN index was 1,932× smaller than the B-tree it matched.

Two results went against me, and I kept them. Monthly partitioning didn't speed up reads, because the primary key already starts with the date; it only made dropping a month 30× faster. And my own choice to split prices and arrivals into two tables made joint queries 3× slower and the database bigger. If I started again, I'd merge them.
