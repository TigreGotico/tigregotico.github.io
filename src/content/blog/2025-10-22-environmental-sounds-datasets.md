---
title: "Environmental Sounds Datasets: Ambient Noises and ESC-50"
description: "We published two environmental sound datasets — ambient noise recordings for speech enhancement and ESC-50 for sound classification. Build assistants that understand their acoustic environment."
date: 2025-10-22
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Audio"
  - "Sound"
  - "Environmental"
  - "Speech"
  - "FOSS"
draft: false
---

## Assistants need to hear the world

A voice assistant listens to more than just the user's voice. It hears:

- Background noise (traffic, wind, machinery)
- Environmental sounds (doors, footsteps, water)
- Music and speech from other sources

Understanding these is crucial for:

- **Speech enhancement** — suppress background noise so the user is heard
- **Context awareness** — "I hear a dog barking, my user might be outside"
- **Environmental classification** — "the user is in a kitchen" (sound of pots, water, appliances)

We published two datasets for this:

## [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises)

**Original dataset.** Diverse background sounds useful for training noise suppression:

- Traffic (cars, trucks, buses)
- Weather (wind, rain, thunder)
- Indoor (HVAC, appliances, keyboards)
- Nature (birds, insects, water)
- Human (crowds, footsteps, breathing)

Use this to:
- Train a noise-robust speech recognizer
- Build background suppression for voice calls
- Test speech quality under realistic conditions

## [ESC-50](https://huggingface.co/datasets/TigreGotico/ESC-50)

**Mirrored dataset.** A classic environmental sound classification dataset originally published elsewhere: 2,000 labeled environmental audio clips across 50 classes. We archived it on HuggingFace for accessibility.

Categories include:

- Animal sounds (barking, meowing, insects)
- Human sounds (footsteps, coughing, laughing)
- Nature (rain, wind, waves)
- Tools (chainsaw, drill, saw)
- Urban (siren, car horn, construction)

Use this to:
- Train an audio classifier
- Understand what sounds mean in context
- Build location/activity inference

## Why voice assistants need environmental sound understanding

A voice assistant that hears only speech is operating blind. It can respond to what you say, but it can't understand its environment. Compare:

**Speech-only assistant:**
- User asks: "What should I wear?"
- Assistant: "70 degrees and sunny"
- Assistant doesn't know: Is the user indoors or outside? Is that wind noise? Are they actually outside right now?

**Speech + sound-aware assistant:**
- Hears rain in the background → "Bring an umbrella"
- Hears traffic noise → "You're outside, let me turn down the music when I respond"
- Hears beeping microwave → "Your food is ready"
- Hears a smoke alarm → emergency alert

Understanding environmental sound means understanding **context**. Is the user in a kitchen (cooking)? A car (driving)? A gym (exercising)? A library (quiet mode needed)?

**These two datasets are the foundation:**
- `ambient_noises` trains noise-robust speech recognition (so background doesn't drown out the user)
- `ESC-50` trains environmental classification (so the assistant understands what's happening around it)

Together, they make voice assistants context-aware, not just voice-aware.

[**ambient_noises**](https://huggingface.co/datasets/TigreGotico/ambient_noises)
[**ESC-50**](https://huggingface.co/datasets/TigreGotico/ESC-50)

Assistants that listen to the world.
