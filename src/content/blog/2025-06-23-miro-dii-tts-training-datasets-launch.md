---
title: "Miro & Dii TTS Training Data: Publishing Voice Models Across 20+ Languages"
description: "We published 40+ synthetic training datasets for Miro and Dii voices across Portuguese, Dutch, German, French, Italian, Japanese, Spanish, and more. Voice cloning at scale: every language gets two consistent identities."
date: 2025-06-23
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Voice"
  - "Datasets"
  - "Miro & Dii"
  - "Multilingual"
  - "FOSS"
draft: false
---

## Two voices, every language

Today we are publishing the training data behind **Miro and Dii** — the two voice identities we built in partnership with OpenVoiceOS. These are not multilingual models blurred across 20 languages. Each language is a **monolingual, native-quality voice** that shares timbre and character with Miro and Dii voices in every other language.

We are releasing the **synthetic training datasets** used to build these voices — 40+ datasets covering Portuguese (PT & BR), Dutch, German, French, Italian, Japanese, Spanish, Romanian, Polish, Swedish, Hindi, Danish, Farsi, English, Basque, and more.

## How this works

Voice cloning keeps identity consistent across languages:

1. **Train a source voice** in one language (e.g., Portuguese) with native pronunciation
2. **Phonemize new languages** using our **[orthography-to-IPA work](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** and language-specific phonemizers
3. **Clone the voice** into the new language, preserving Miro/Dii timbre while learning native accent
4. **Publish the training data** so the model is reproducible and auditable

The result: a Portuguese speaker, a Dutch speaker, a Japanese speaker — all unmistakably **the same person** (Miro or Dii), yet each sounding like a native.

## The datasets

All available on HuggingFace under **TigreGotico**:

- **tts-train-synthetic-miro_pt-PT** — Miro for European Portuguese
- **tts-train-synthetic-dii_pt-BR** — Dii for Brazilian Portuguese
- **tts-train-synthetic-miro_nl-NL** — Miro for Dutch
- (... and 37 more across all listed languages)

Each dataset:
- Is fully synthetic, generated from text
- Includes IPA phoneme labels
- Is released under an open license
- Can be used to retrain or extend the voice

See **[phoonnx training framework](/blog/2026-05-10-tts-that-runs-on-a-potato)** for how to use these to build your own voices.

## Why publish training data?

Transparency. A voice system locked in a checkpoint is a black box. Publish the training data and the model becomes:

- **Auditable** — you can see exactly what the voice learned
- **Reproducible** — train it yourself, get the same result
- **Extensible** — add more data, fine-tune, remix
- **Trustworthy** — no hidden biases baked into weights

This is the data future: voices built in the open, trained on datasets you can inspect, owned by communities not corporations.

[**All Miro & Dii datasets on HuggingFace**](https://huggingface.co/datasets?author=TigreGotico&tags=tts)

Miro and Dii, now for your language too.
