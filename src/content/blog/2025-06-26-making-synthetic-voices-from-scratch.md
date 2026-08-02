---
title: "Making Synthetic Voices From Scratch"
description: "Creating a voice for a text-to-speech system usually requires a real person to spend hours recording audio. That’s expensive, time-consuming, and in many languages or accents, the voices just don’t exist at all"
date: 2025-06-26
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Synthetic Data"
  - "Voice Cloning"
  - "OVOS"
draft: false
---

> This blog was originally posted in the [OpenVoiceOS blog](https://blog.openvoiceos.org/posts/2025-06-26-making-synthetic-voices-from-scratch)

A good offline TTS voice for European Portuguese did not exist. Studio recording is expensive, takes months, and in most of the world’s languages the recordings have simply never happened. So we built four from scratch, with no recording booth, no voice actor, and no cloud.

### The three-step pipeline

**1. Generate synthetic speech pairs.** We use an existing TTS voice as a donor (any source that can produce intelligible audio) and run it over a large text corpus to produce thousands of audio/text pairs. The donor voice does not need to be high quality. It just needs to be coherent enough to learn from.

**2. Apply voice conversion.** A voice-conversion step transforms the donor’s timbre into a new identity: a different gender, age, or character. The resulting audio sounds like the target voice, not the donor.

**3. Train a compact VITS model.** VITS is a neural text-to-speech architecture. The converted audio becomes the training set for a small VITS model via [phoonnx_train](https://github.com/TigreGotico/phoonnx). The finished model is exported to ONNX (a portable format for running trained models) and runs entirely offline, on a Raspberry Pi if needed.

### Ethical guardrails

If the donor is a real person’s voice, we obtain explicit permission first. When no permission is possible, we use public-domain recordings or generate a fully original voice that does not copy anyone’s identity. The voice-conversion step also has a useful privacy property: the output is acoustically distinct enough from the donor that impersonation risk is negligible.

### Applied to European Portuguese

European Portuguese had no high-quality open offline voice. We produced four voices, including the Miro and Dii identities that are now the default OVOS voices for `pt-PT`, using exactly this pipeline. They run comfortably on modest hardware, require no internet connection, and the training data is [published openly](https://huggingface.co/TigreGotico) so anyone can reproduce or extend them.

All models and datasets live at [huggingface.co/OpenVoiceOS](https://huggingface.co/OpenVoiceOS) and [huggingface.co/TigreGotico](https://huggingface.co/TigreGotico).

