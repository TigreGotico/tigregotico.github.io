---
title: "Usenet in 2026: a clean, pre-AI text corpus for training and evaluation"
description: "Usenet is a pristine archive of pre-AI human discourse — decades of newsgroup posts, all human-written, none of it touched by language models. That makes it valuable training and evaluation data for language and speech models. We built a small Python tool to harvest it."
date: 2026-07-01
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

Most open-web text corpora are contaminated: LLM-generated text has leaked into Reddit, Stack Overflow, GitHub, and blogs, so a model trained on them is partly learning from other models. Usenet is different. It is decades of flame wars, technical Q&A, and newsgroup arguments, all human-written, predating today's language models entirely. For anyone training or evaluating language and speech models, a large archive of human-authored text with clean provenance is exactly the kind of data that is getting harder to find.

-----

## Usenet as a pre-AI corpus

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

## Reading Usenet with no account

Most public news servers let you read without registering:

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
    except OSError:
        continue
```

-----

## Why this matters

Usenet is a provenance-clean archive of human-authored text at scale, predating the era of machine-generated content. Whether you are training models, building datasets, or studying internet discourse before it was diluted by AI-generated text, that archive is still there and still growing.

**Repository:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — harvest Usenet into training datasets; read publicly with no account.
