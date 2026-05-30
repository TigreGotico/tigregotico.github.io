---
title: "Portuguese Orthography & Variation: AO1990, Homographs, and Archaisms"
description: "We published three datasets documenting Portuguese language variation — the AO1990 orthographic agreement across dialects, heterophonic homographs (words spelled the same but pronounced differently), and archaisms (historical words)."
date: 2026-02-25
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Portuguese"
  - "Orthography"
  - "Linguistics"
  - "Language"
  - "FOSS"
draft: false
---

## Portuguese orthography is messier than it looks

Portuguese spelling seems standardized, but it's full of variation and historical quirks:

**Orthographic variation:** The 1990 Orthographic Agreement (AO90) standardized spelling across Portugal, Brazil, Angola, Mozambique, and other Lusophone countries. But implementation was inconsistent — some words have optional diacritics, some have optional silent letters. A Brazilian publisher might use "favor" while a Portuguese one uses "favor" (with accent). Both are "correct" under AO90.

**Dialect divergence:** The same word spelled identically sounds completely different across dialects. "Para" (for/stop) has two pronunciations depending on dialect and part-of-speech. "Cento" (100) is pronounced differently in European vs Brazilian Portuguese.

**Historical depth:** Old words from the 16th-19th centuries still appear in literature, newspapers, and formal writing. These archaic forms don't appear in modern spell-checkers. A student reading a 1700s poem encounters "paysa" (now "paisagem") and is confused.

**We documented all three layers of variation** to help NLP systems understand Portuguese in the wild:

## [AO1990_pt-PT](https://huggingface.co/datasets/TigreGotico/AO1990_pt-PT) and [AO1990_pt-BR](https://huggingface.co/datasets/TigreGotico/AO1990_pt-BR)

The **Orthographic Agreement of 1990** standardized spelling across Portugal and Brazil (and Angola, Mozambique, Cape Verde, Guinea-Bissau, São Tomé and Príncipe, and Timor). But it introduced variation:

- Words with optional diacritics (is it "cafe" or "café"?)
- Silent letters that may or may not appear
- Regional spellings that persist alongside the standard

These datasets document the agreement's application across dialects:

```json
{
  "word": "...",
  "pt-PT": "...",
  "pt-BR": "...",
  "standard": "AO1990",
  "notes": "..."
}
```

Use this for:
- Building spell-checkers that respect dialectal variation
- Training text normalization models
- Studying language standardization
- NLP pipelines that handle multiple orthographies

## [heterophonic_homographs_pt](https://huggingface.co/datasets/TigreGotico/heterophonic_homographs_pt)

**Heterophonic homographs** are words spelled identically but pronounced differently. English example: "read" (present tense: /riːd/, past tense: /rɛd/). Portuguese has many:

```json
{
  "word": "para",
  "pronunciation_1": "ˈpa.ɾə",  // (preposition: "for")
  "pronunciation_2": "pɐˈɾa",   // (verb: "stops")
  "context_needed": true,
  "language": "pt"
}
```

Use this for:
- Training pronunciation models that handle ambiguity
- Building TTS systems that read aloud correctly
- ASR systems that disambiguate homophones
- Linguistic research on homography

## [archaisms_pt](https://huggingface.co/datasets/TigreGotico/archaisms_pt)

**Archaisms** are old words that have fallen out of standard use but still appear in literature, poetry, and historical texts. Portuguese is rich with them:

```json
{
  "word": "...",
  "archaic_meaning": "...",
  "modern_equivalent": "...",
  "period": "16th-19th century",
  "examples": "..."
}
```

Use this for:
- Training models to understand historical Portuguese texts
- Literary text analysis
- Language evolution research
- Building lemmatizers that handle antiquated forms

## Why document variation?

Modern NLP often assumes one standard spelling and pronunciation. Real language is messier:

- Dialects diverge
- Orthography reforms create dual standards
- Historical words linger in texts
- Homophones require context

Documenting this variation builds better language systems.

[**AO1990_pt-PT**](https://huggingface.co/datasets/TigreGotico/AO1990_pt-PT)
[**AO1990_pt-BR**](https://huggingface.co/datasets/TigreGotico/AO1990_pt-BR)
[**heterophonic_homographs_pt**](https://huggingface.co/datasets/TigreGotico/heterophonic_homographs_pt)
[**archaisms_pt**](https://huggingface.co/datasets/TigreGotico/archaisms_pt)

Portuguese in its full complexity.
