---
order: 4
slug: privacygate
title: 'PrivacyGate: PII Detection'
daemon: Redacto
pid: 3318
oneLiner: A fail-closed filter that strips personal data from business documents before an LLM sees them.
type: Security
year: '2026'
role: 'Contributor. TODO(harshit): confirm exactly what you built'
team: Team project, Optiv Consulting case study 2
stack: [Python, Microsoft Presidio, spaCy, PyMuPDF, Tesseract, Streamlit]
repo: https://github.com/Mohit-Nanda-Krishna/PrivacyGate
metrics: []
stamp: PATCHED
---

## What was wrong

This was our team's answer to Optiv Consulting's case study 2: companies want to put internal documents through LLMs, but those documents are full of names, IDs, emails and account numbers. Something has to find and remove that before anything leaves the building, and it has to fail safe.

## What I built

This is a team project. A teammate built the first MVP and I joined to build on top of it.

The pipeline extracts text from PDF, Word and PowerPoint (with OCR for scans), detects PII with regex rules, company-specific ID patterns and Presidio/spaCy NER, classifies risk, swaps each finding for a stable token like `[PERSON_001]`, then rescans the sanitised output. If anything is left, or a step errors, the document is blocked rather than sent.

TODO(harshit): list the parts you built and the decisions you made.

## What happened

TODO(harshit): results, test numbers and what you'd do next.
