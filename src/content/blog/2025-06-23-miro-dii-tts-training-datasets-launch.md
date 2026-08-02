---
title: "Miro & Dii TTS Training Data: 40 Open Datasets Across 20 Locales"
description: "We published 40 synthetic training datasets for the Miro and Dii voices across Portuguese, Dutch, German, French, Italian, Japanese, Spanish, and more. Every language gets two consistent voice identities, built with voice cloning."
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

We are releasing all 40 synthetic training datasets used to build Miro and Dii, the voice identities we developed in partnership with OpenVoiceOS. The collection spans European Portuguese, Brazilian Portuguese, Dutch, German, French, Italian, Japanese, Spanish, Romanian, Polish, Swedish, Hindi, Danish, Farsi, English, Basque, and more. Each dataset follows a consistent naming convention: `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL`, and so on for each language pair.

Every dataset is fully synthetic: generated text paired with synthesised audio, laid out in the LJSpeech format common for TTS training data, with no studio sessions. Each is released under an open licence so anyone can retrain or extend the voice. Phonemization happens at training time in phoonnx, drawing on our [G2P research for 350+ languages](/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## How the voice identity stays consistent across languages

We do not train one multilingual model and hope the accent sorts itself out. Every language gets a monolingual model, trained to sound like a native speaker of that language. The shared identity across models comes from voice cloning: each Miro and each Dii model is cloned from the same source voice before being adapted to a new language. The timbre and character of the voice transfer. The accent does not, deliberately.

The practical result is that a Portuguese speaker, a Dutch speaker, and a Japanese speaker all sound unmistakably like the same person, each speaking natively.

## Why publish the training data

A checkpoint without its training data is a black box. Publishing the data lets anyone see exactly what the model learned from, run `phoonnx_train` on the same data to get the same result, and extend it: add sentences, fine-tune for a dialect, or build a new speaker on top.

This matters most for the low-resource languages on this list. When the training data is open, the community that speaks a language can improve its own voice without waiting for a vendor to decide it is commercially interesting.

## Where to find everything

All datasets and trained models live under [TigreGotico on HuggingFace](https://huggingface.co/TigreGotico), with Piper-compatible voice checkpoints also mirrored under [OpenVoiceOS](https://huggingface.co/OpenVoiceOS).

For the inference and training framework that consumes these datasets, see [phoonnx](https://github.com/TigreGotico/phoonnx).
