---
pos: 1
code: SGN
title: 'Signify: Sign Language to Text & Speech'
oneLiner: Live video in, English text and speech out, without the predictions flickering frame to frame.
type: ML
year: '2026'
status: latest
role: 'TODO(harshit): your role'
team: 'TODO(harshit): team size'
stack: [Python, PyTorch, scikit-learn, MediaPipe, OpenCV, FastAPI, Next.js]
repo: https://github.com/harshitchhabi/Signify
metrics:
  - { label: Input modes, value: '2' }
  - { label: Accuracy, value: 'TODO' }
  - { label: Signs supported, value: 'TODO' }
cover: ../../assets/projects/signify/cover.png
coverAlt: The Signify web app with the live camera and translation panels.
order: 1
---

## Problem

People who sign and people who don't usually need a third person to talk. I wanted something that runs on a normal webcam and turns signing into text and speech while you're still signing, not after you upload a clip and wait.

## Build

MediaPipe pulls 21 hand landmarks per frame and OpenCV handles the video. The landmarks, not the raw pixels, go into a gesture classifier built with PyTorch and scikit-learn (an MLP/LSTM over the landmark sequence). A FastAPI backend serves the model and a Next.js frontend handles the camera, uploads and text-to-speech.

The trade-off: a raw per-frame prediction flickers between signs while your hand moves. I put a sliding window over the last few frames and only emit the sign that wins a majority vote. That adds a few frames of delay, but the output stops jumping around, which mattered more.

The same pipeline also runs on uploaded video, so you can translate a recording.

## Result

It translates from a live camera and from uploaded video, and majority voting keeps the output stable.

- TODO(harshit): accuracy on a held-out set.
- TODO(harshit): number of signs supported.
- TODO(harshit): end-to-end latency per prediction.

Next I'd add sentence-level signs, which a per-frame landmark model can't capture.
