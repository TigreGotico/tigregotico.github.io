---
title: "Open Common Play Templates: Query Patterns for Media Playback"
description: "TigreGotico created OCP templates for OpenVoiceOS — structured query templates for media playback requests across music, podcasts, and streaming. The schema behind 'play jazz' and 'what's playing.'"
date: 2024-10-09
author: "TigreGotico for OpenVoiceOS"
tags:
  - "Datasets"
  - "Intent"
  - "Voice"
  - "OCP"
  - "Media"
  - "FOSS"
draft: false
---

## Templates capture intent structure

A voice assistant hears: **"Play some jazz from the seventies"**

What's the intent? Decompose it:
- **Action**: play (not "search" or "queue", but actually start playing)
- **Object**: music (as opposed to "play a podcast" or "play a video")
- **Filters**: genre ("jazz"), era ("seventies")

A **template** is a structured pattern that shows how these fit together:

```
play <genre> from <era>
```

When the user speaks a new sentence matching this template, the assistant:
1. Recognizes the intent (play media)
2. Extracts the slots (jazz, seventies)
3. Routes to the right backend (music player)
4. Applies the filters (genre=jazz, era>1970, era<1980)

**TigreGotico created [OCP_templates](https://huggingface.co/datasets/OpenVoiceOS/OCP_templates)** for OpenVoiceOS — a complete catalog of media playback templates. These templates cover:
- Playback actions (play, queue, skip, pause, resume, repeat)
- Media types (music, podcasts, radio, audiobooks, live streams)
- Filters (by artist, genre, year, mood, playlist, language)
- Edge cases ("play my workout mix" vs "play track #1 from album X")

These are not rigid rules. They are exemplars: real queries annotated with their intent structure, so language models and intent classifiers can learn the patterns.

## What's in the dataset

Each template captures a media query:

```json
{
  "query": "Play some jazz from the seventies",
  "template": "play X from Y",
  "parameters": {
    "action": "play",
    "media_type": "music",
    "genre": "jazz",
    "era": "1970s"
  },
  "language": "en"
}
```

Templates cover:
- Playback commands (play, pause, skip, repeat)
- Media types (music, podcasts, radio, audiobooks)
- Queries (what's playing, who's the artist)
- Filters (by genre, artist, date, playlist, mood)

## Why this matters

OpenVoiceOS is plugin-based. Every media plugin (Spotify, Bandcamp, YouTube Music, radio tuners) implements OCP — one unified interface. But for that to work, the assistant needs to understand **what the user wants** before routing to the right plugin.

OCP_templates are the ground truth for that understanding. Train on these and your intent classifier knows:
- What counts as a media query
- How filters are expressed
- Which backends can satisfy which intents

[**OCP_templates on HuggingFace**](https://huggingface.co/datasets/OpenVoiceOS/OCP_templates)
