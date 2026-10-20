---
order: 3
slug: ids
title: 'AI-Powered Network Intrusion Detection & Deception System'
daemon: Honeybot
pid: 4012
oneLiner: An IDS that retrains itself from a honeypot, and the attack that turns that honeypot against it.
type: Security
year: '2026'
role: Design, build, experiments and paper
team: Solo
stack: [Python, scikit-learn, XGBoost, PyTorch, FastAPI, HTMX, Chart.js, Cowrie, Docker]
repo: https://github.com/harshitchhabi/IDS
metrics:
  - { label: cheaper than kNN, value: '781×' }
  - { label: datasets, value: '2' }
  - { label: models, value: '4' }
stamp: CAUGHT
---

## What was wrong

Labelled attack data is the hard part of training an intrusion detector. A popular fix is to put a honeypot next to the network and label everything it sees as malicious, then keep retraining on that. Nobody legitimate talks to a decoy, so the labels are free.

The catch: the attacker decides what the decoy sees, and the labelling rule has to be public for the honeypot to work. So the honeypot is a write channel into the defender's own training set.

## What I built

The system is a real loop: flow features, a random forest and XGBoost detector trained on CICIDS2017 (DDoS, port scans, brute force), a Cowrie SSH honeypot, auto-labelling, retraining, and a live dashboard in FastAPI, HTMX and Chart.js, all in a Docker testbed.

The offline simulator that produced every number shares its loop, model and defence code with the live system, so a finding there is a finding about the system.

Trade-off: my first defence, cost-of-influence weighting, matched kNN sanitising at 781× lower overhead (0.000216 vs 0.168 s per round), but it didn't beat a no-skill baseline. I kept it as a negative result instead of tuning until it looked good.

## What happened

- The honest loop works: clean honeypot data improves the detector within 1–2 rounds.
- Benign-mimicry poisoning (A1) costs the attacker nothing and pushes up false positives on real users.
- Label-consistency filters fail, because the poison agrees with the defender's own labelling rule.
- ShareCap, a one-line cap on the honeypot's share of training data, recovers ~100% of A1 damage at c=0.05. No defence I tested beat it on both recovery and retention (0 of 87 cases).
- The FPR damage generalises to UNSW-NB15 and to logistic regression and an MLP.

Next: session-level effort features, which the per-flow version couldn't capture.
