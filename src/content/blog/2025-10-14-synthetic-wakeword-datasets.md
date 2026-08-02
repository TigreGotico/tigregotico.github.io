---
title: "Synthetic Wakeword Datasets: Seven Assistant Names, One Detector"
description: "We published seven synthetic wakeword datasets for common voice assistant names: hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Train a detector that works everywhere."
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

Seven assistant names. Seven datasets. All audio is generated entirely by the **[phoonnx](https://github.com/TigreGotico/phoonnx)** TTS framework using the Miro and Dii voices. No human recordings. No consent forms. No privacy exposure.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Each dataset is a flat set of roughly a thousand positive clips: the wakeword spoken with varied speakers, rates, and prosody. Hard negatives and background noise ship as separate companion datasets you mix in at training time: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en), [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt), and [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## Why synthetic

Real recordings take months to collect. Every speaker needs a consent form, and the result still leaves accent gaps you didn't anticipate. Synthetic generation avoids all of that.

- **Reproducible**: the same generation settings and voices produce the same audio, with a full audit trail and no consent-form archaeology.
- **Auditable**: the generation pipeline is the documentation.
- **Scalable**: varying speaking rate and speaker characteristics is a parameter change, not a studio session.

For wakeword detection, what matters is acoustic distinctiveness, not naturalness. Synthetic data fits that requirement.

## Use these

Train your own wakeword detector for OpenVoiceOS, Mycroft, or any open voice system. For negative-sample augmentation there are also household and public-domain background-clip datasets: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs), [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs), and [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**All wakeword datasets on HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
