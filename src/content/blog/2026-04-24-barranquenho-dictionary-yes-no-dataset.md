---
title: "Barranquenho Dictionary and Yes/No Multilingual Dataset"
description: "We published the Dicionário de Barranquenho (a Portuguese-based creole with 500-1000 speakers) and a multilingual yes/no answers dataset for building answer classifiers across 50+ languages."
date: 2026-04-24
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Endangered Language"
  - "Multilingual"
  - "NLP"
  - "FOSS"
draft: false
---

## Two datasets: preservation and classification

Today we published two datasets solving different problems: one for **endangered language preservation**, one for **multilingual understanding**.

## [dicionario_barranquenho](https://huggingface.co/datasets/TigreGotico/dicionario_barranquenho)

**Mirrored & curated dataset.** **Barranquenho** is a Portuguese-based creole spoken in a single village (Barranquenho, Extremadura, Spain) by 500–1000 speakers, mostly over 50. It is critically endangered.

The **Dicionário de Barranquenho** (original linguistic work) documents the full vocabulary. We curated and published it on HuggingFace to preserve it:

```json
{
  "barranquenho": "palavra",
  "portuguese": "palavra",
  "english": "word",
  "pronunciation": "ipa",
  "usage": "context",
  "speaker": "age, gender"
}
```

Why this matters:

- **Language preservation** — documents the language before elders pass
- **Linguistic research** — creolization and language contact patterns
- **Community resource** — speakers and learners can access their language
- **Archive** — permanent record on HuggingFace with a DOI

Barranquenho will likely be spoken by fewer than 100 people in 20 years. This dataset is the insurance policy.

## [yes-no-multilingual](https://huggingface.co/datasets/TigreGotico/yes-no-multilingual)

**Original dataset.** **Yes and no are not universal.** English says "yes"/"no". Spanish says "sí"/"no". French uses "oui"/"non". Japanese uses "はい"/"いいえ" (hai/iie). Mandarin has 是/不是 (shì/búshì) for existence and 有/没有 (yǒu/méiyǒu) for possession.

We created and published **[yes-no-multilingual](https://huggingface.co/datasets/TigreGotico/yes-no-multilingual)** — 50,000+ yes/no answers across 50+ languages:

```json
{
  "question": "Do you like coffee?",
  "answer": "Yes",
  "language": "en",
  "answer_native": "yes",
  "classifier_label": "affirmative"
}
```

Use this to:

- Train multilingual answer classification
- Build dialogue systems that understand agreement/disagreement across languages
- Study how cultures encode assent and refusal
- Test NLU systems on a universal baseline

## Why both datasets today?

One is preservation. One is progress. Together they represent our philosophy:

**Endangered languages deserve modern NLP tools, not extinction.** If Barranquenho speakers had a voice assistant that understood their language, that would be incredible. If yes/no classifiers work in 50 languages, Barranquenho can be the 51st.

[**dicionario_barranquenho**](https://huggingface.co/datasets/TigreGotico/dicionario_barranquenho)
[**yes-no-multilingual**](https://huggingface.co/datasets/TigreGotico/yes-no-multilingual)

Preserve, then amplify.
