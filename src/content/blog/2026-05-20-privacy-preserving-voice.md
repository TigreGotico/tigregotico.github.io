---
title: "Privacy-Preserving Voice: Why Your Assistant Shouldn't Phone Home"
description: "Voice assistants that phone home are not assistants — they are wiretaps. We built phoonnx so your voice synthesis runs entirely offline, on your hardware, under your control, with no API keys and no cloud."
date: 2026-05-20
author: "Casimiro Ferreira"
tags:
  - "Privacy"
  - "Voice"
  - "TTS"
  - "Offline"
  - "Data Sovereignty"
  - "FOSS"
draft: false
---

## The privacy problem with cloud TTS

A voice assistant is intimate. It listens to your home, your family, your habits. The least it owes you is privacy.

But commercial TTS is outsourced: you send text to an API in someone else's data centre, that server synthesizes speech, and returns it. Your words left your house. They are logged, analyzed, and retained (usually in the fine print you never read).

**[phoonnx](https://github.com/TigreGotico/phoonnx)** is our answer: TTS that never leaves your hardware.

## The architecture

**phoonnx** is built on three principles:

1. **Lightweight models** — a 15.65M-parameter VITS voice runs on CPU, no GPU
2. **ONNX inference** — portable, fast C++ runtime
3. **Fully offline** — no network calls, no API keys, no cloud

```python
from phoonnx import phonemize, synthesize

# All offline, on your hardware
phonemes = phonemize("Hello world", language="en")
audio = synthesize(phonemes, voice_model="phoonnx_en_miro")

# audio is bytes; you are done
```

No server was called. No trace was left. The speech stays in your room.

## Why it's possible

Good TTS needs two things:

1. **A good acoustic model** — the VITS architecture we use is small but powerful
2. **Accurate phonemization** — knowing how text should sound

We handle #2 up front, which makes #1 tractable. See **[grapheme-to-IPA for 350+ languages](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** and **[phoonnx in detail](/blog/2026-05-10-tts-that-runs-on-a-potato)**.

Because we offload the linguistic work to the phonemizer, the model only has to learn acoustics. That is why 15.65M parameters is enough.

## Multi-language, one identity

**[Miro and Dii](/blog/2026-06-15-two-voices-every-language-miro-and-dii)** are two consistent voice identities that sound the same in every language. They run entirely offline, from your hardware, for every language you request.

That is data sovereignty: the data that represents your voice never leaves your house.

## The full stack

```
[Text]
  ↓
[Phonemizer: orthography2ipa, TugaPhone, etc.]
  ↓
[Phonemes]
  ↓
[VITS Model (15.65M parameters, ONNX)]
  ↓
[Audio waveform]
  ↓
[Your speaker]
```

Every step runs locally. No network. No company. No logs.

See also: **[voice interfaces for accessibility](/blog/2026-07-15-voice-interfaces-accessibility)**, where privacy meets inclusion.

## The tool

[`phoonnx` on GitHub](https://github.com/TigreGotico/phoonnx)

```bash
pip install phoonnx
```

Voice that is yours to keep.
