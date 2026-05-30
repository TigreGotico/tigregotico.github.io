---
title: "OVOS STT Benchmark for Portuguese: Measuring Speech Recognition Across Dialects"
description: "TigreGotico created ovos-stt-bench-pt-PT for OpenVoiceOS — a benchmark dataset for evaluating speech recognition accuracy across Portuguese dialects and accents. Know your baseline."
date: 2026-01-11
author: "TigreGotico for OpenVoiceOS"
tags:
  - "Datasets"
  - "Benchmark"
  - "Speech Recognition"
  - "Portuguese"
  - "Evaluation"
  - "FOSS"
draft: false
---

## You can't improve what you don't measure

An STT (speech-to-text) system is only as good as its accuracy on **real data**. But what's "real"? European Portuguese? Brazilian? Accented speech? Noisy environments?

**TigreGotico created [ovos-stt-bench-pt-PT](https://huggingface.co/datasets/OpenVoiceOS/ovos-stt-bench-pt-PT)** for OpenVoiceOS — a benchmark: a standard test set for evaluating STT accuracy on Portuguese.

## Benchmark structure: real-world Portuguese speech diversity

A real benchmark doesn't test in a studio; it tests in reality. The dataset covers:

**Dialects & variation:**
- **European Portuguese (pt-PT)** — Portugal standard
- **Brazilian Portuguese (pt-BR)** — Brazil standard (different vowels, rhythm, rhythm)
- **Different speakers** — all ages, genders, regional accents (Porto accent ≠ Lisbon accent ≠ São Paulo accent)

**Recording conditions:**
- **Clean studio speech** — microphone 6 inches away, no background noise
- **Noisy environments** — traffic, crowds, machinery (the real world)
- **Far-field speech** — speaker 10+ feet away, microphone across the room (smart speaker scenario)
- **Telephony** — compressed audio from a phone call (lower quality but real)

**Content domains:**
- **Conversational speech** — natural dialogue, variable pacing
- **Read speech** — someone reading a prepared text (used in many training datasets, but unrealistic)
- **Command speech** — short, imperative utterances ("turn on the lights")

**The result:** A clip + ground truth transcription, so you can measure:
- Word Error Rate (WER) — how many words did the STT get wrong?
- Error distribution — does it fail more on Brazilian accents? Noisy environments? Far-field?
- Systematic weaknesses — "the system always mishears /s/ as /z/ in European Portuguese"

## How to use it

```python
from datasets import load_dataset

benchmark = load_dataset('OpenVoiceOS/ovos-stt-bench-pt-PT')

# Measure your STT system
wer = compute_wer(your_stt(benchmark['audio']), benchmark['transcription'])
print(f"Word error rate: {wer:.2%}")
```

Benchmark your system, compare against baselines, and track improvement over time.

## Why this matters

Voice assistants in Portuguese deserve to be measured. You should know:
- Does your STT work equally well for all accents?
- How does it degrade in noise?
- Which words does it misunderstand?

This benchmark is the standard for answering these questions.

[**ovos-stt-bench-pt-PT on HuggingFace**](https://huggingface.co/datasets/OpenVoiceOS/ovos-stt-bench-pt-PT)

Measure, then optimize.
