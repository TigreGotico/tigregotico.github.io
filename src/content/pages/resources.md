---
title: "Resources"
description: "Free and open datasets, models, notebooks, and research from TigreGótico — TTS, wake-word detection, phonemization, and natural language understanding."
order: 4
---

Here you'll find a collection of **124+ datasets and models** we've published, all available for free and open use on [Hugging Face](https://huggingface.co/TigreGotico). We are committed to contributing to the FOSS AI community and hope these resources prove valuable for your projects.

## Featured Datasets by Category

### Speech & Text-to-Speech (TTS)

- **[miro-dii-tts-training-datasets](https://huggingface.co/datasets/TigreGotico/miro-dii-tts-training-datasets)** — 40+ TTS training datasets across 20+ languages. The data behind our Miro & Dii voices featured in OpenVoiceOS.
- **[phoonnx](https://huggingface.co/spaces/TigreGotico/phoonnx)** — ONNX text-to-speech models (Miro & Dii voices). Ready to run on your device; no cloud required.

### Phonetics & Phonemization

- **[portuguese-phonetic-lexicon](https://huggingface.co/datasets/TigreGotico/portuguese-phonetic-lexicon)** — 100K+ Portuguese words with IPA across pt-PT, pt-BR, pt-AO, pt-MZ, pt-TL variants.
- **[grapheme-to-phoneme-datasets](https://huggingface.co/collections/TigreGotico/grapheme-to-phoneme-6721c14e0abb1a5adb58b91c)** — G2P training data for Arabic, Portuguese, Galician, Mirandese — building phonemization for under-resourced languages.

### Intent Recognition & Natural Language Understanding

- **[ovos-common-query-intents](https://huggingface.co/datasets/OpenVoiceOS/ovos-common-query-intents)** — General knowledge queries for OVOS voice assistants.
- **[ovos-weather-intents](https://huggingface.co/datasets/OpenVoiceOS/ovos-weather-intents)** — Weather-related intent training data; train classifiers to handle weather queries.
- **[intents-for-eval](https://huggingface.co/datasets/OpenVoiceOS/intents-for-eval)** — Standardized intent classification benchmark for testing OVOS and other NLU systems.

### Music & Media Metadata

- **[jazz-music-archives](https://huggingface.co/datasets/TigreGotico/jazz-music-archives)** — Jazz metadata: artists, albums, tracks, styles.
- **[prog-archives](https://huggingface.co/datasets/TigreGotico/prog-archives)** — Progressive rock catalog with detailed metadata.
- **[metal-archives-bands](https://huggingface.co/datasets/TigreGotico/metal-archives-bands)** — Metal bands, lineups, discographies.

### Multilingual & Cross-Linguistic Data

- **[multilingual-sentence-types](https://huggingface.co/datasets/TigreGotico/multilingual-sentence-types)** — 100K+ sentences across 50+ languages with linguistic annotations.
- **[search-term-extraction](https://huggingface.co/datasets/TigreGotico/search-term-extraction)** — 100K+ multilingual search queries with extracted terms and intent labels.

### Portuguese Language & Orthography

- **[AO1990_pt-PT](https://huggingface.co/datasets/TigreGotico/AO1990_pt-PT) & [AO1990_pt-BR](https://huggingface.co/datasets/TigreGotico/AO1990_pt-BR)** — Orthographic agreement variants across Portuguese dialects.
- **[heterophonic-homographs-pt](https://huggingface.co/datasets/TigreGotico/heterophonic_homographs_pt)** — Words spelled identically but pronounced differently in Portuguese.

**[Browse all 124+ TigreGotico datasets on Hugging Face →](https://huggingface.co/TigreGotico)**

## Published Models

We share models trained on our datasets, particularly **Text-to-Speech (TTS)** models:

- **Miro & Dii voices** — Available for 20+ languages through phoonnx. Compatible with OpenVoiceOS, Home Assistant, and other systems. Fast, private, on-device synthesis.
- **OVOS default voices** — One male and one female voice per language, maintained as part of the OpenVoiceOS project.

All models are open source, fully offline, and run on consumer hardware.

## Code Examples

### Load a dataset in Python:

```python
from datasets import load_dataset

# Portuguese phonetic lexicon
phon = load_dataset('TigreGotico/portuguese-phonetic-lexicon')

# Intent training data for OVOS
weather = load_dataset('OpenVoiceOS/ovos-weather-intents')

# Multilingual search queries
search = load_dataset('TigreGotico/search-term-extraction')
```

### Use a TTS model:

```python
from phoonnx import synthesize

# Synthesize Portuguese with Miro voice
audio = synthesize("Olá, mundo!", language='pt-PT', speaker='miro')
```

## Research & Notebooks

We maintain a collection of [machine learning notebooks](https://github.com/TigreGotico/ml-notebooks) demonstrating dataset usage, model training, and evaluation techniques.

## Need Custom Resources?

Looking for custom datasets or models for your specific use case? [Get in touch](/contact) — our team can help you create tailored solutions that meet your exact requirements.
