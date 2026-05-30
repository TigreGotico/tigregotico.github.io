---
title: "Voice Interfaces as Accessibility Tools: Building for People Who Cannot See"
description: "Voice interfaces are often sold as convenience. But for blind and vision-impaired users, they are access itself. Here is how we build them: phoonnx for synthesis, offline-first, with natural dialogue and consistent voices."
date: 2026-07-15
author: "Casimiro Ferreira"
tags:
  - "Accessibility"
  - "Blind Users"
  - "Voice"
  - "Offline"
  - "Assistants"
  - "FOSS"
draft: false
---

## Voice as the interface, not an add-on

Screen readers exist. They turn web pages into speech. But they are retrofits: take a visual interface and read it aloud. The result is slow and opaque — a blind user hears fifty menu options and has to count to reach the one they want.

A **voice interface** is different. Voice is the native interface, not a translation layer. An assistant understands what you want, speaks back naturally, and does not assume you can see.

## What accessible voice needs

Building voice interfaces for blind users is not "add a voice to your app." It is:

1. **Natural dialogue** — no robotic recitation of options
2. **Clear context** — always say what happened and what's next
3. **Offline-first** — internet access is not guaranteed; voice should work when internet is down
4. **Consistent voices** — users recognize the assistant across contexts and languages

## Our approach

We use **[phoonnx](https://github.com/TigreGotico/phoonnx)** — lightweight, offline TTS that runs on any hardware — paired with **[Miro & Dii](/blog/2026-06-15-two-voices-every-language-miro-and-dii)**, two consistent voice identities that work in every language.

For language understanding, we use our **[classical NLP stack](/blog/2026-02-10-a-lightweight-classical-nlp-toolbox)** — RAKE for intent detection, Aho-Corasick for entity tagging, templates for routing. No cloud LLM needed. Fully offline, fully auditable.

## Examples: where this matters

**Blind user reading a book**: A screenreader reads page by page. A voice interface lets them ask: "What chapter has the character named Sam?" and jumps directly.

**Blind user managing music**: They want to play something. A voice interface: "What kind of music?" → "Show me jazz artists" → "Play Miles Davis" → music starts. All audio, no visual menus.

**Blind gamer**: See **[audio-only games](/blog/2026-08-01-audio-only-games-blind-players)**.

## Why this is not a feature toggle

Accessibility for blind users is not a checkbox. It is architecture. You cannot retrofit voice onto a visual interface and call it accessible. You have to design for voice from the start.

That means:
- Voice is the primary interface, not secondary
- All essential functions are reachable by voice
- Dialogue is natural and contextual, not menu-driven
- The system works offline

See also: **[privacy-preserving voice](/blog/2026-05-20-privacy-preserving-voice)** — the same offline-first architecture that respects privacy also respects offline users.

## The tools

[`phoonnx`](https://github.com/TigreGotico/phoonnx) — offline TTS

Our **[classical NLP toolbox](/blog/2026-02-10-a-lightweight-classical-nlp-toolbox)** — intent matching and entity recognition

**[Miro & Dii](/blog/2026-06-15-two-voices-every-language-miro-and-dii)** — consistent voices for every language

Building accessible voice means all three work together. No silos. One seamless experience.
