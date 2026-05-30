---
title: "Synthetic Wakeword Datasets: Seven Assistant Names, One Detector"
description: "We published seven synthetic wakeword datasets for common voice assistant names — hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Train a detector that works everywhere."
date: 2025-10-14
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Wakewords"
  - "Speech"
  - "Synthetic"
  - "Voice"
  - "FOSS"
draft: false
---

Seven assistant names. Seven datasets. All audio generated entirely from the **[phoonnx](https://github.com/TigreGotico/phoonnx)** TTS framework using Miro and Dii voices — no human recordings, no consent forms, no privacy exposure.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Each dataset includes positive examples (the wakeword spoken multiple ways), hard negatives (similar-sounding phrases), and metadata (speaker, accent, noise level).

## Why synthetic

Real recordings require months of collection, consent forms for every speaker, and still leave accent gaps you didn't anticipate. Synthetic generation inverts that:

- **Reproducible**: same seed, same speaker profile, same wakeword → identical audio. No randomness, full audit trail.
- **Auditable**: the generation script is the documentation.
- **Scalable**: varying speaking rate, noise floor, and speaker characteristics is a parameter change, not a studio session.

For wakeword detection the relevant property is acoustic distinctiveness, not naturalness. Synthetic data is well-matched to that requirement.

## Use these

Train your own wakeword detector for OpenVoiceOS, Mycroft, or any open voice system. The datasets also include `wake_word_noise` and household / public-domain background clips (`building_106_kitchen_3secs`, `public_domain_sounds_3secs`, `FMA_3secs`) for negative-sample augmentation.

[**All wakeword datasets on HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
