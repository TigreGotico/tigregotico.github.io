---
title: "Multilingual Sentence Types Dataset: Questions, Commands, Statements Across Languages"
description: "We published sentence-types-multilingual — a dataset of 100K+ sentences across 50+ languages classified by grammatical type (question, command, statement, exclamation). Train multilingual intent detectors."
date: 2026-04-01
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

## Intent starts with sentence type

A voice assistant needs to understand **intent** — what does the user want? Is it a question ("What time is it?"), a command ("Set an alarm"), or a statement ("I like jazz")?

Sentence type is the foundation. A question has different grammar, word order, and prosody than a command. Different languages encode this differently.

We published **[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** — an **original dataset of 100,000+ sentences across 50+ languages**, each classified by type:

```json
{
  "text": "What time is it?",
  "language": "en",
  "type": "question",
  "sub_type": "yes_no_question"
}
```

## Sentence types in the dataset

Each sentence is labeled as one of:

- **Question** — yes/no, wh-, tag questions
- **Command** — imperative, requests, suggestions
- **Statement** — declarative, affirmations
- **Exclamation** — emotional emphasis, surprises

Languages covered include:

Portuguese, Brazilian Portuguese, Spanish, English, German, French, Italian, Dutch, Japanese, Arabic, Mandarin, Hindi, Russian, Polish, Swedish, Danish, and 34 more.

## Use cases

Train multilingual intent detectors:

```python
from sentence_types import load_dataset

# Train a model to classify sentence type across languages
model = train_classifier(load_dataset('sentence-types-multilingual'))

# Detect intent in any language
intent = model.classify("What time is it?", language="en")  # → "question"
```

Use for:

- Voice command systems that understand intent
- Dialogue systems that respond appropriately
- Sentiment/intent classification at scale
- Linguistic research on cross-linguistic patterns

## Why multilingual?

Sentence type encoding varies wildly across languages:

- English: questions use word order inversion ("do you like...?")
- Spanish: questions use inverted subject-verb ("¿Te gusta...?")
- Mandarin: questions use particles at sentence end ("你喜欢吗?")
- Japanese: questions use rising intonation, no grammar change

A single monolingual model fails across this diversity. A multilingual dataset shows patterns.

[**sentence-types-multilingual**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)

Intent detection for the world.
