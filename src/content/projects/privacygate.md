---
order: 4
slug: privacygate
title: 'PrivacyGate: PII Detection'
daemon: Redacto
pid: 3318
oneLiner: A fail-closed filter that strips personal data from business documents before an LLM sees them.
type: Security
year: '2026'
role: Primary developer and builder
team: Team project, Optiv Consulting case study 2
stack: [Python, Microsoft Presidio, spaCy, PyMuPDF, Tesseract, Streamlit]
repo: https://github.com/Mohit-Nanda-Krishna/PrivacyGate
metrics: []
stamp: PATCHED
---

## What was wrong

This was our team's answer to Optiv Consulting's case study 2: companies want to put internal documents through LLMs, but those documents are full of names, IDs, emails and account numbers. Something has to find and remove that before anything leaves the building, and it has to fail safe.

## What I built

This is a team project. A teammate put up the first MVP; I was the primary developer from there and built most of what it is now.

The pipeline extracts text from PDF, Word and PowerPoint (with OCR for scans), detects PII with regex rules, company-specific ID patterns and Presidio/spaCy NER, classifies risk, swaps each finding for a stable token like `[PERSON_001]`, then rescans the sanitised output. If anything is left, or a step errors, the document is blocked rather than sent.

The app is a Streamlit "pre-LLM privacy firewall". You upload PDF, DOCX or PPTX files, or batch several so the same person gets the same pseudonym token across all of them. You choose between strict fail-closed (one pass, block if anything remains) and iterative auto-clean (re-run until clean). It shows exactly what a model would receive and the gate's verdict, and a local mock model call refuses to run unless the gate approved the document.

## What happened

It was our team's submission for Optiv's case study 2.

<!-- TODO(harshit): results and test numbers. -->
