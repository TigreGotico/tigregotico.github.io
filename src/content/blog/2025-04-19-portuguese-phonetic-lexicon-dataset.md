---
title: "Portuguese Phonetic Lexicon: 100K Words with IPA and Dialect Variants"
description: "We curated and published the Portuguese Phonetic Lexicon — 100,000+ words with IPA transcriptions across European, Brazilian, and other Lusophone dialects. Grounded in official sources, auditable, and ready for speech research."
date: 2025-04-19
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Phonetics"
  - "Portuguese"
  - "Lusophone"
  - "IPA"
  - "FOSS"
draft: false
---

## A phonetic foundation for Lusophone speech

Building pronunciation systems for Portuguese is hard because Portuguese is not one language — it is a family. European Portuguese /ʃ/ becomes Brazilian /ʃ/ or /s/. Word-final /ɐ̃/ in Portugal becomes /ũ/ in Brazil and /ɔ̃/ in Angola. A single lexicon for "Portuguese" is a lie.

**Original dataset.** The **[Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon)** is TigreGotico's curated research dataset. It solves this with 100,000+ words, each with **IPA transcriptions for multiple dialects hand-verified against official sources**:

- **pt-PT** — European Portuguese (Portugal)
- **pt-BR** — Brazilian Portuguese
- **pt-AO** — Angolan Portuguese
- **pt-MZ** — Mozambican Portuguese
- **pt-TL** — Timorese Portuguese

Every word is hand-verified against official sources: the Portal da Língua Portuguesa, Instituto Camões resources, and linguistic references.

## Why this matters

A speech system (TTS or ASR) is only as good as its pronunciation dictionary. Commercial systems collapse Lusophone into "Portuguese" and use a single phoneme set. Users in Brazil hear Portugal's accents. Users in Angola are invisible.

This lexicon is the foundation for:

- **TTS that sounds native** — Miro and Dii voices rely on accurate phoneme data per dialect
- **ASR that understands all Lusophones** — speech recognition can respect regional variation
- **Linguistic research** — studying dialectal phonology across the Portuguese-speaking world
- **Language preservation** — endangered Lusophone varieties get documented

See our **[TugaPhone and silabificador](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** work, which builds on this lexicon.

## The dataset

100,000+ entries, each with:

```json
{
  "word": "computador",
  "pt-PT": "ˌkɔ̃pu tɐ ˈdoɾ",
  "pt-BR": "ˌkɔ̃pu tɐ ˈdoɾ",
  "pt-AO": "ˌkɔ̃pu tɐ ˈdoɾ",
  "language": "pt",
  "source": "Portal da Língua Portuguesa"
}
```

All auditable, all citable, all yours to fork.

[**Portuguese Phonetic Lexicon on HuggingFace**](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon)
