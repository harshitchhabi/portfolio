---
pos: 3
code: IDS
title: 'AI-Powered Network Intrusion Detection & Deception System'
oneLiner: An IDS that retrains itself from a honeypot, and the attack that turns that honeypot against it.
type: Security
year: '2026'
status: best
role: Design, build, experiments and paper
team: Solo
stack: [Python, scikit-learn, XGBoost, PyTorch, FastAPI, HTMX, Chart.js, Cowrie, Docker]
repo: https://github.com/harshitchhabi/IDS
metrics:
  - { label: Lower overhead than kNN, value: '781×' }
  - { label: Datasets, value: '2' }
  - { label: Models tested, value: '4' }
  - { label: 'A1 damage recovered, ShareCap c=0.05', value: '~100%' }
order: 3
diagram:
  sector: 2
  caption: The loop, and the write channel it opens. Red is the path an attacker controls.
  rows:
    - label: HONEST LOOP
      nodes:
        - { text: TRAFFIC }
        - { text: COWRIE HONEYPOT }
        - { text: AUTO-LABEL MALICIOUS }
        - { text: RETRAIN RF / XGB }
        - { text: DETECTOR }
    - label: POISONING (A1)
      nodes:
        - { text: BENIGN-LOOKING FLOWS, state: alert }
        - { text: COWRIE HONEYPOT, state: alert }
        - { text: LABELLED MALICIOUS, state: alert }
        - { text: FPR ON REAL USERS UP, state: alert }
    - label: DEFENCE
      nodes:
        - { text: SHARECAP c=0.05, state: best }
        - { text: HONEYPOT SHARE CAPPED, state: best }
---

## Problem

Labelled attack data is the hard part of training an intrusion detector. A popular fix is to put a honeypot next to the network and label everything it sees as malicious, then keep retraining on that. Nobody legitimate talks to a decoy, so the labels are free.

The catch: the attacker decides what the decoy sees, and the labelling rule has to be public for the honeypot to work. So the honeypot is a write channel into the defender's own training set.

## Build

The system is a real loop: flow features, a random forest and XGBoost detector trained on CICIDS2017 (DDoS, port scans, brute force), a Cowrie SSH honeypot, auto-labelling, retraining, and a live dashboard in FastAPI, HTMX and Chart.js, all in a Docker testbed.

The offline simulator that produced every number shares its loop, model and defence code with the live system, so a finding there is a finding about the system.

Trade-off: my first defence, cost-of-influence weighting, matched kNN sanitising at 781× lower overhead (0.000216 vs 0.168 s per round), but it didn't beat a no-skill baseline. I kept it as a negative result instead of tuning until it looked good.

## Result

- The honest loop works: clean honeypot data improves the detector within 1–2 rounds.
- Benign-mimicry poisoning (A1) costs the attacker nothing and pushes up false positives on real users.
- Label-consistency filters fail, because the poison agrees with the defender's own labelling rule.
- ShareCap, a one-line cap on the honeypot's share of training data, recovers ~100% of A1 damage at c=0.05. No defence I tested beat it on both recovery and retention (0 of 87 cases).
- The FPR damage generalises to UNSW-NB15 and to logistic regression and an MLP.

Next: session-level effort features, which the per-flow version couldn't capture.
