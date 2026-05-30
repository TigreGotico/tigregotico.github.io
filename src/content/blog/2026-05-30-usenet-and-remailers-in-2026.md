---
title: "Usenet & Remailers in 2026: a clean time capsule and a privacy network that refuses to die"
description: "Usenet is a pristine archive of pre-AI human discourse — LLM-free training data from decades of internet history. But it's not just archaeology: the cypherpunk remailer network still works in 2026, offering real anonymous messaging. We built two small tools to show you both."
date: 2026-07-01
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

Most open-web corpora are contaminated — LLM-generated text has leaked into Reddit, Stack Overflow, GitHub, blogs. Usenet is different: decades of flame wars, technical Q&A, and newsgroup arguments, all human-written, none of it touched by language models. And while digging into it, I found something else still running: **the cypherpunk remailer network still operates in 2026**, maintained by a small group of cryptography enthusiasts who never stopped.

We built two small Python tools for both.

-----

## The Time Capsule: Usenet as a Pre-AI Corpus

Usenet receives thousands of posts per day across hundreds of active groups. Archive back to the 1980s and you have **millions of articles** — each a signal of what humans actually cared about, argued about, wanted to know — with provenance clean enough to cite.

We built a tool called **usenet** that makes harvesting this straightforward:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

Most public servers no longer support `NEWNEWS` (query by date), so **group-based browsing is the standard approach.** You scrape one group at a time — not a barrier, just the protocol reality.

To turn a newsgroup into a training dataset, `dataset.py` harvests articles into JSONL:

```
{
  "group": "comp.lang.python",
  "message_id": "<12345@example.com>",
  "subject": "Best practices for list comprehensions",
  "author": "Alice",
  "date": "1999-03-15T10:22:00Z",
  "language": "en",
  "text": "In my experience, list comprehensions are most readable when...",
}
```

One article per line. Push a few thousand of those to Hugging Face and you have a **publicly available, human-authored, provenance-clean dataset** you can cite and republish.

Repo: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## The Cypherpunks Never Left

The remailer network is still running.

**Type-I remailers** (Cypherpunk remailers): send a message wrapped in nested PGP encryption — each hop decrypts one layer and forwards to the next. From outside, the message appears to come from the remailer, not you. By the final hop, the original sender is lost.

**Type-II remailers** (Mixmaster): add random padding, strip headers, hold messages before forwarding, and chain through multiple remailers simultaneously. Much harder to trace.

Both still work. There are **six to ten active remailers** in 2026. The pinger network posts daily stats to `alt.privacy.anon-server.stats`, same as it has for decades. As of May 2026:

- **frannie** (mix@franxial.com) — 100% uptime
- **frell** (godot@remailer.frell.eu.org) — 100% uptime
- **yeahno** (mix@yeahno.net) — 100% uptime
- **dizum** (remailer@dizum.com) — ~99% uptime
- **paranoia** (mixmaster@remailer.paranoici.org) — ~92% uptime
- **senshi** (senshiremailer@gmx.de) — intermittent

The **remailers** library discovers the live network by parsing those daily stats posts:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## Using Them Today

### Read Usenet with No Account

```python
from usenet import UsenetServer

servers = [
    "news.neodome.net",
    "news.samoylyk.net",
    "freenews.netfront.net"
]

for server in servers:
    try:
        with UsenetServer(server) as s:
            articles = s.get_articles("alt.test", limit=5)
            print(f"Success on {server}: {len(articles)} articles")
            break
    except:
        continue
```

### Post Anonymously

Most servers require a free account to post. **paganini.bofh.team** and **news.tcpreset.net** accept anonymous posts, including to `alt.anonymous.messages` — the traditional drop for anonymous recipients.

### Send an Anonymous Message via the Remailer Chain

The remailers still use **DSA + ElGamal PGP keys** from the 1990s — old crypto that modern Python PGP libraries can't encrypt to. We shell out to **GnuPG** (the old code is load-bearing):

```python
from remailers.network import fetch_live_remailers, fetch_keyring_blob
from remailers.gpg import GPGKeyring
from remailers.cypherpunk import build_chain

remailers = fetch_live_remailers()

# the published keyring is full of DSA/ElGamal keys -> use the GnuPG backend
with GPGKeyring(fetch_keyring_blob()) as gpg:
    have = set(gpg.recipients())
    chain = [r for r in remailers
             if r.is_cpunk and r.accepts_pgp and r.address in have][:3]

    # nest a PGP layer per hop; the exit posts to a newsgroup
    message, entry = build_chain(
        hops=[(r.address, r.address) for r in chain],
        anon_post_to="alt.anonymous.messages",
        body="Hello from the shadows",
        encrypt=gpg.encrypt,
    )

# `message` goes to `entry` over SMTP (remailers.cypherpunk.send_chain) —
# the one piece you bring yourself: an email sender.
```

### Finding Replies: Hashed Subjects

If waiting for a reply on `alt.anonymous.messages`, you don't want the subject to reveal content. The remailer protocol supports **hSub**: the recipient hashes the original subject with SHA-256 and posts the reply with the hash as the subject. Only someone who knows the original subject can identify it in the firehose.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

For more privacy, some messages use **eSub** — encrypted subjects that only the recipient can decrypt.

-----

## Why This Still Matters

The remailer network is slow and designed for a different era. But it is **decentralized, ownerless, and unshuttable** — no company to subpoena, no service to discontinue. The same cypherpunk design that worked in 1995 still works.

Usenet is the rarer prize: a provenance-clean archive of human-authored text at scale. Whether you are training models, building datasets, or studying actual internet discourse, Usenet is there — clean, uncorrupted, free.

**Repositories:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Harvest Usenet into training datasets; read publicly with no account.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — Find live remailers, build anonymous chains, send via Cypherpunk Type-I.
