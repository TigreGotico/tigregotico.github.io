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

## What we are releasing

The **synthetic training datasets** used to build Miro and Dii — the voice identities we developed in partnership with OpenVoiceOS. The collection spans European Portuguese, Brazilian Portuguese, Dutch, German, French, Italian, Japanese, Spanish, Romanian, Polish, Swedish, Hindi, Danish, Farsi, English, Basque, and more. Each dataset follows a consistent naming convention: `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL`, and so on for each language pair.

Every dataset is fully synthetic — generated text paired with synthesised audio, no studio sessions — includes IPA phoneme labels derived from our [G2P research for 350+ languages](/blog/2026-01-15-grapheme-to-ipa-for-350-languages), and is released under an open licence so anyone can retrain or extend the voice.

## How the voice identity stays consistent across languages

We do not train one multilingual blob and hope the accent sorts itself out. Every language gets a **monolingual model** — trained to sound like a native speaker of that language. The shared identity across models comes from **voice cloning**: each Miro and each Dii model is cloned from the same source voice before being adapted to a new language. The timbre, the character, the recognisable quality of the voice — that transfers. The accent does not, deliberately.

The practical upshot: a Portuguese speaker, a Dutch speaker, a Japanese speaker — all unmistakably **the same person**, each sounding native.

## Why publish the training data

A checkpoint without its training data is a black box. Publishing it makes the voice **auditable** (you can see exactly what it learned from), **reproducible** (run `phoonnx_train` on the same data, get the same result), and **extensible** (add sentences, fine-tune for a dialect, build a new speaker on top).

This matters most for the low-resource languages on this list. When the training data is open, the community that speaks a language can improve its own voice — without waiting for a vendor to decide it is commercially interesting.

## Where to find everything

All datasets and trained models live under [**TigreGotico on HuggingFace**](https://huggingface.co/TigreGotico), with Piper-compatible voice checkpoints also mirrored under [OpenVoiceOS](https://huggingface.co/OpenVoiceOS).

For the inference and training framework that consumes these datasets, see [**phoonnx**](https://github.com/TigreGotico/phoonnx).
