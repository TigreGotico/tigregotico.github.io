---
title: "Multilingual Search-Term Extraction Dataset: Mining Intent Across 50+ Languages"
description: "We published search-term-extraction — a dataset of 100K+ queries in 50+ languages with extracted search terms. Train models to extract intent from voice queries and search inputs."
date: 2026-05-30
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Search"
  - "Information Extraction"
  - "FOSS"
draft: false
---

## The search-term extraction problem

A user speaks to a voice assistant: **"Find me some jazz from the 1970s in my collection"**

What does the system actually need to do?

1. **Understand the intent**: Find ≠ Play ≠ Recommend. This is a search, not playback.
2. **Extract the search term**: "jazz" is the core query
3. **Parse the filters**: "1970s" (decade), "my collection" (scope to personal library)
4. **Route to the right backend**: Music search plugin, not a general knowledge engine

A voice interface can't send raw speech to a search engine. It needs to **extract** the actionable parts first. That's **search-term extraction** — the bridge between what a user *says* and what a system *does*.

Common examples:
- "Show me hotels in Paris under $100 a night" → search: "hotels", filters: location="Paris", price="<100", currency="USD"
- "What are reviews for that pizza place we went to?" → search: "pizza place reviews", filters: time="past", location="where we went"
- "Find all emails from my boss this week" → search: "emails", filters: from="boss", date_range="this week"

We published **[search-term-extraction](https://huggingface.co/datasets/TigreGotico/search-term-extraction)** — an **original dataset of 100,000+ queries across 50+ languages** with extracted search terms, entities, and intent:

```json
{
  "query": "Find me some jazz from the 1970s in my collection",
  "language": "en",
  "search_terms": ["jazz"],
  "filters": ["1970s", "my collection"],
  "action": "find",
  "target": "music"
}
```

## Why this matters

Voice assistants, search interfaces, and dialogue systems all need to extract actionable terms from messy natural language. A user's words are not a structured query — they are hints and requests that need parsing.

This dataset shows the patterns across languages:

- **English**: "jazz from the seventies" → term: "jazz", filter: "1970s"
- **Spanish**: "jazz de los setenta" → same extraction
- **Portuguese**: "jazz dos anos setenta" → same extraction
- **German**: "Jazz aus den Siebzigern" → same extraction

Each language encodes entities and intent differently, but the underlying structure is similar.

## Train on this to build

- **Music search interfaces** — "play me some X by Y from the Z era"
- **E-commerce queries** — "find blue shoes under $50"
- **News search** — "show me recent articles about X in country Y"
- **Voice command parsing** — any query that needs slotting

## Multilingual at scale

English-only search extraction is solved. But **50+ languages in one dataset** lets you:

- Build systems that work globally
- Study cross-linguistic patterns
- Train polyglot models
- Understand how intent is encoded across cultures

[**search-term-extraction**](https://huggingface.co/datasets/TigreGotico/search-term-extraction)

Intent extraction for the world.
