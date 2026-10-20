---
order: 5
slug: secure-file-hashing
title: 'Secure File Hashing & Dual Encryption'
daemon: Lockjaw
pid: 5560
oneLiner: Every file is hashed, encrypted twice over, and re-checked for tampering on the way back out.
type: Security
year: '2025'
role: Solo. Internship project at SBI Global IT Centre
team: Solo
stack: [Node.js, Express, MySQL, bcrypt, node-forge, Bootstrap]
repo: https://github.com/harshitchhabi/File-hash
metrics:
  - { label: file hash, value: SHA-256 }
  - { label: file cipher, value: AES-256 }
  - { label: key wrap, value: RSA-2048 }
stamp: VERIFIED
---

## What was wrong

I built this during my internship at SBI Global IT Centre ([see the logbook](/#logbook)). In a bank, a stored file has to stay confidential and you need to know if anyone changed it. Encryption alone doesn't tell you the second thing.

## What I built

On upload the server takes a SHA-256 hash of the file and stores it. The file is encrypted with AES-256 under a fresh random key and IV, and that key is encrypted with RSA-2048. On download it reverses the steps, re-hashes the decrypted file and compares it with the stored hash. A mismatch means the file was tampered with.

The trade-off: RSA alone can't encrypt a whole file efficiently and AES alone leaves you with the problem of storing the key. Hybrid encryption uses each for what it's good at: AES for bulk data, RSA for the small key.

Accounts use bcrypt-hashed passwords and server-side sessions. Express and MySQL keep a per-user file history.

## What happened

A working dashboard where a signed-in user can upload, download, decrypt and delete files, with each file's history in MySQL and an integrity check on every decrypt.

What I'd change: the RSA key pair sits on disk next to the app. In a real deployment it belongs in a key management service or an HSM.
