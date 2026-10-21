---
order: 7
slug: novacraft
title: 'NovaCraft: a language that compiles to WebAssembly'
daemon: Forge
pid: 7731
oneLiner: A small typed language with a full compiler down to WebAssembly, bounds checks it can prove away, and its own IDE.
type: Systems
year: '2026'
role: Solo. Language design, compiler and IDE
team: Solo
stack: [TypeScript, WebAssembly, wabt, Jest]
repo: https://github.com/harshitchhabi/NovaCraft
metrics:
  - { label: optimisation passes, value: '4' }
  - { label: 'checks removed, movingAvgFlag', value: '1 of 2' }
  - { label: 'faster on sumArray, 2M elements', value: '1.09×' }
stamp: VERIFIED
cover: ../../assets/projects/novacraft/cover.png
coverAlt: The NovaCraft Web IDE benchmarking sumArray with the proven bounds check removed against the fully checked build.
shots:
  - src: ../../assets/projects/novacraft/run.png
    alt: The NovaCraft Web IDE compiling and running sumArray, with tabs for every stage from tokens to WAT.
---

## What was wrong

Out-of-bounds array access is one of the oldest bugs in systems code. Checking every access is safe but slow; checking none is fast and dangerous. I wanted to write a compiler from scratch and use it to try the middle path: check everything by default, then prove which checks can go.

## What I built

NovaCraft has ints, floats, bools, arrays, functions, recursion, if and while. The compiler is TypeScript: a hand-written recursive-descent parser, semantic analysis, a three-address IR, then constant folding, dead-code elimination, common-subexpression elimination and range analysis. Linear-scan register allocation spills when it runs out of registers, and the backend emits WebAssembly text, assembled with wabt.

I also built my own IDE for NovaCraft: write a program, compile it to real WebAssembly and run it, with every stage visible (tokens, AST, IR, register allocation, WAT), a bounds and hardening view, and a benchmark that compiles the program twice, with and without the proven checks, and times them.

The trade-off is in the bounds checks. Every array access gets one by default, which is safe but costs time, and range analysis only removes a check it can prove. It keeps a check it isn't sure about, so you pay a little speed rather than risk a silent out-of-bounds read. Source positions flow through every stage, so a check that fails at runtime points at the NovaCraft line through a generated source map, not a bare Wasm trap.

## What happened

The whole pipeline compiles and runs real programs. In a moving-average anomaly detector, range analysis proves one of its two array checks safe and removes it, and keeps the one it can't prove.

In the IDE's benchmark on `sumArray` over 2,000,000 elements, removing the one proven check gave a 1.09× speedup (8.6% of the overhead gone), and both builds return the identical result.

Building that program found a real bug: an inner loop was throwing away the outer loop's proof. It has a regression test now.
