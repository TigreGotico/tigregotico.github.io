---
title: "Usenet & Remailers in 2026: a clean time capsule and a privacy network that refuses to die"
description: "Usenet is a pristine archive of pre-AI human discourse — LLM-free training data from decades of internet history. But it's not just archaeology: the cypherpunk remailer network still works in 2026, offering real anonymous messaging. We built two small tools to show you both."
date: 2026-05-30
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

There are two internets now: before LLMs contaminated the web, and after. If you want human-authored text, you have to dig.

I spent the last month digging. And I found something strange: **Usenet is still alive, still growing, and it's one of the last clean archives of human writing on the internet.** At the same time — and I mean *at the same time* — **the cypherpunk remailer network that most people thought died in the 1990s is still running in 2026**, operated by a stubborn handful of cryptography enthusiasts who refuse to stop.

Both are wild. Both are useful. We built two small Python tools to prove it.

-----

## The Time Capsule: Usenet as a Pre-AI Corpus

Let me be direct: **most of the open web is now poisoned.** Every search engine, every dataset, every corpus you scrape contains LLM-generated text. ChatGPT, Claude, Gemini output has leaked into Reddit, Stack Overflow, GitHub, blogs. Training a new model on "the web" in 2026 means training on the web *plus derivative garbage.*

But Usenet is different. Decades of flame wars, technical Q&A, newsgroup arguments — all of it archived, all of it human-written, all of it *predating LLMs by 30 years.* There's no bot spam, no GPT-4 copy-pasted into `comp.lang.python`. It's a time capsule.

Why does that matter? Because **a corpus that is *proven* to be human-authored is rare and valuable.** You can train on it knowing you're not poisoning your model with its own descendants. You can cite it. You can study *actual internet discourse* from before algorithms learned to write.

The sheer volume is staggering. Usenet still receives thousands of posts per day across hundreds of active groups. Archive everything back to the 1980s, and you're looking at **millions of articles in English alone** — each one a signal of what humans actually cared about, argued about, wanted to know.

We built a tool called **usenet** that makes this simple:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    # Fetch the last 100 articles from a group
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
        # Use the text for training, research, nostalgia
```

Most public servers no longer support the old `NEWNEWS` command (which let you query "everything since date X"), so **group-based browsing is how you actually read Usenet now.** It's fine. It means you scrape one group at a time, but that's not a barrier — it's just the new normal.

And if you want to turn a newsgroup into a training dataset? We have a `dataset.py` module that harvests articles into JSONL:

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

One article per line. Stack a few thousand of those, push to Hugging Face, and you have a **publicly available, human-authored, provenance-clean dataset** that you can cite and republish.

That's the first tool: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## The Cypherpunks Never Left

Now for the part that surprised me: **the remailer network is still running.**

I know what you're thinking. Didn't that die? Didn't law enforcement shut it down? Didn't everyone move to Signal?

Some of it died. The networks fragmented. But a core group of operators — actual humans, with actual servers, running in 2026 — never stopped. They're on the margins. They don't advertise. But if you know where to look, you can send anonymous messages today the same way you could in 1995.

### A Short History (the Good Parts)

In the late '80s and early '90s, before the web even existed, cypherpunks wanted to send messages without a postal address. **Type-I remailers** (also called Cypherpunk remailers) were the answer: send a message to `remixer@remailer.org`, wrapped in nested PGP encryption (like an onion), and each layer would decrypt and forward to the next hop. From the outside, it looks like the message came from the remailer, not you. By the final hop, the original sender is lost in the noise.

**Type-II remailers** (Mixmaster, invented by Ulf Möller) took it further: add random padding, strip headers, hold messages for a while before sending, and chain them through *multiple* remailers at once. Much harder to trace.

Both still work. And in 2026, there are **six to ten active remailers** — not many, but enough. The pinger network posts daily stats to `alt.privacy.anon-server.stats`, the same way it did 20 years ago. You can read them and see which operators are actually running their servers.

Here are the live ones as of May 2026:

- **frannie** (mix@franxial.com) — 100% uptime
- **frell** (godot@remailer.frell.eu.org) — 100% uptime
- **yeahno** (mix@yeahno.net) — 100% uptime
- **dizum** (remailer@dizum.com) — ~99% uptime
- **paranoia** (mixmaster@remailer.paranoici.org) — ~92% uptime
- **senshi** (senshiremailer@gmx.de) — intermittent

These are real humans, paying for real servers, running real Mixmaster daemons. No money in it. No fame. Just the principle.

The second tool we built is called **remailers**. Discovering the live network is a single call — it reads and parses those daily stats posts for you:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## Using Them Today: Reading and Sending Anonymously

### Read Usenet with No Account

You don't need to prove anything. Just connect to a public server and read:

```python
from usenet import UsenetServer

# No credentials, no account signup
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

Most servers require a free account to post. But not all. **paganini.bofh.team** and **news.tcpreset.net** accept anonymous posts, including to the `alt.anonymous.messages` group, where you can leave messages for specific recipients.

### Send an Anonymous Message via the Remailer Chain

Here's where it gets interesting. The remailers still use **DSA + ElGamal PGP keys** from the 1990s — old crypto that modern Python PGP libraries can't even encrypt to. So we shell out to **GnuPG** (the old code is load-bearing):

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

# `message` now goes to `entry` over SMTP (remailers.cypherpunk.send_chain) —
# the one piece you still bring yourself: an email sender.
```

### Finding Your Replies: Hashed Subjects

If you're waiting for a reply on `alt.anonymous.messages`, you don't want your recipient's response to have a subject line that reveals what you're talking about (e.g., `RE: Please call the FBI`). The remailer protocol supports **hashed subjects (hSub)**: the recipient hashes the original subject with SHA-256 and posts the reply with the hash in the subject. Only someone who knows the original subject can find it in the firehose.

The library handles this:

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post your message using `hsub` as the Subject line; later, scan the group
# and a message is probably yours when the hSub matches the code word:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

For even more privacy, some messages use **encrypted subjects (eSub)**, where the subject itself is encrypted and only the recipient can decrypt it.

-----

## Why This Still Matters

I'll be honest: in 2026, if you want to send truly anonymous messages, Signal is easier and probably better for most purposes. The remailer network is *slow*, *unreliable sometimes*, and *designed for a different era*.

But it's not about Signal. It's about **having options**. It's about a **privacy network that nobody owns, nobody controls, and nobody can shut down** (because it's decentralized and the operators aren't doing it for money). It's about cypherpunks proving that their 30-year-old vision *still works*.

And it's about **data.** Usenet is a priceless archive of human-authored text from the era before AI. If you're training models, building datasets, or just studying how humans actually think and argue, Usenet is there. Clean. Uncorrupted. Free.

The tools are small, simple, and open-source. Use them.

**Repositories:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Harvest Usenet into training datasets; read publicly with no account.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — Find live remailers, build anonymous chains, send via Cypherpunk Type-I.

The old internet has things to teach us. We just have to remember where to look.
