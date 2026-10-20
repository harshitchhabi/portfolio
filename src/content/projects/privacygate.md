---
pos: 4
code: PVG
title: 'PrivacyGate: PII Detection'
oneLiner: A fail-closed filter that strips personal data from business documents before an LLM sees them.
type: Security
year: '2026'
status: team
role: 'Contributor. TODO(harshit): confirm exactly what you built'
team: Team project, Optiv Consulting case study 2
stack: [Python, Microsoft Presidio, spaCy, PyMuPDF, Tesseract, Streamlit]
repo: https://github.com/Mohit-Nanda-Krishna/PrivacyGate
metrics:
  - { label: Formats, value: 'PDF · DOCX · PPTX' }
order: 4
---

## Problem

This was our team's answer to Optiv Consulting's case study 2: companies want to put internal documents through LLMs, but those documents are full of names, IDs, emails and account numbers. Something has to find and remove that before anything leaves the building, and it has to fail safe.

## Build

This is a team project. A teammate built the first MVP and I joined to build on top of it.

The pipeline extracts text from PDF, Word and PowerPoint (with OCR for scans), detects PII with regex rules, company-specific ID patterns and Presidio/spaCy NER, classifies risk, swaps each finding for a stable token like `[PERSON_001]`, then rescans the sanitised output. If anything is left, or a step errors, the document is blocked rather than sent.

TODO(harshit): list the parts you built and the decisions you made.

## Result

TODO(harshit): results, test numbers and what you'd do next.
