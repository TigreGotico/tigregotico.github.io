---
title: "Music Queries Templates: Synthetic Intent Data for Music Commands"
description: "TigreGotico created MusicQueries for OpenVoiceOS — synthetic intent templates for music playback requests. Train your intent classifier to understand 'play jazz' vs 'show me rock albums' across 10+ languages."
date: 2025-04-15
author: "TigreGotico for OpenVoiceOS"
tags:
  - "Datasets"
  - "Intent"
  - "Music"
  - "Multilingual"
  - "Synthetic"
  - "FOSS"
draft: false
---

## Music is the most common voice request

After weather, music is the first thing people ask a voice assistant for:
- "Play some jazz"
- "Put on my workout playlist"
- "What's this song?"
- "Show me indie rock albums"

Each of these has different intent structure, and they vary wildly across languages and accents.

**TigreGotico created [music_queries_templates](https://huggingface.co/datasets/OpenVoiceOS/music_queries_templates)** for OpenVoiceOS — a synthetic dataset of music requests annotated with intent:

```json
{
  "query": "Play some jazz from the seventies",
  "intent": "music.search",
  "slots": {
    "genre": "jazz",
    "era": "1970s",
    "action": "play"
  },
  "language": "en"
}
```

## Synthesized, not recorded

These are **synthetic queries** — procedurally generated from templates by combining:
- Actions (play, queue, search, recommend)
- Media types (songs, albums, playlists, artists)
- Filters (genre, era, mood, language, artist)

Why synthetic?
- **Fast to generate** — create thousands instantly
- **Balanced coverage** — ensure all combinations are represented
- **Easy to extend** — add new languages or filters without re-recording
- **No privacy concerns** — no real voices, all reproducible

## Use this to train

- Music intent classifiers that work across languages
- Slot-filling models (genre, artist, era)
- Dialogue systems that clarify underspecified requests
- Multi-turn conversations ("what genre?" → "how far back?" → "sort by rating?")

[**music_queries_templates on HuggingFace**](https://huggingface.co/datasets/OpenVoiceOS/music_queries_templates)
