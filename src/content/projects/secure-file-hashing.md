---
pos: 5
code: SFH
title: 'Secure File Hashing & Dual Encryption'
oneLiner: Every file is hashed, encrypted twice over, and re-checked for tampering on the way back out.
type: Security
year: '2025'
status: latest
role: Solo. Internship project at SBI Global IT Centre
team: Solo
stack: [Node.js, Express, MySQL, bcrypt, node-forge, Bootstrap]
repo: https://github.com/harshitchhabi/File-hash
metrics:
  - { label: File hash, value: SHA-256 }
  - { label: File cipher, value: AES-256 }
  - { label: Key wrap, value: RSA-2048 }
order: 5
diagram:
  sector: 2
  caption: Upload and download paths. The download path ends with the tamper check.
  rows:
    - label: UPLOAD
      nodes:
        - { text: FILE }
        - { text: SHA-256 HASH STORED }
        - { text: AES-256 ENCRYPT FILE }
        - { text: RSA-2048 ENCRYPT AES KEY }
        - { text: STORE }
    - label: DOWNLOAD
      nodes:
        - { text: DECRYPT AES KEY }
        - { text: DECRYPT FILE }
        - { text: RE-HASH }
        - { text: COMPARE, state: best }
---

## Problem

I built this during my internship at SBI Global IT Centre ([see the lineup](/#lineup)). In a bank, a stored file has to stay confidential and you need to know if anyone changed it. Encryption alone doesn't tell you the second thing.

## Build

On upload the server takes a SHA-256 hash of the file and stores it. The file is encrypted with AES-256 under a fresh random key and IV, and that key is encrypted with RSA-2048. On download it reverses the steps, re-hashes the decrypted file and compares it with the stored hash. A mismatch means the file was tampered with.

The trade-off: RSA alone can't encrypt a whole file efficiently and AES alone leaves you with the problem of storing the key. Hybrid encryption uses each for what it's good at: AES for bulk data, RSA for the small key.

Accounts use bcrypt-hashed passwords and server-side sessions. Express and MySQL keep a per-user file history.

## Result

A working dashboard where a signed-in user can upload, download, decrypt and delete files, with each file's history in MySQL and an integrity check on every decrypt.

What I'd change: the RSA key pair sits on disk next to the app. In a real deployment it belongs in a key management service or an HSM.
