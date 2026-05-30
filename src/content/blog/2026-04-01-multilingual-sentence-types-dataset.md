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

A voice assistant's routing logic depends on knowing what kind of sentence it received before it tries to answer anything. A question needs an answer. A command needs execution. A statement might need acknowledgment or storage. Getting that classification right, in any language the user speaks, is the prerequisite for everything else.

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** is the training corpus behind that layer — 100,000+ labeled sentences across 50+ languages.

## What the labels mean in practice

The dataset uses four top-level types, which map directly to how `little_questions` (the inference library that consumes this data) routes utterances:

- **question** — further split by sub-type: `yes_no_question`, `wh_question`, `tag_question`. The EAT taxonomy inside `little_questions` adds 53 fine-grained answer-type labels (person, location, quantity, definition, and so on), but sentence-type classification is the first gate.
- **command** — imperative and request forms. Commands don't expect an answer; they expect an action.
- **statement** — declarative. Statements in a dialogue context often carry polarity that matters downstream: a yes/no/maybe classifier runs on statements to interpret answers to prior questions.
- **exclamation** — emotionally marked utterances that need different handling than neutral declaratives.

```json
{
  "text": "What time is it?",
  "language": "en",
  "type": "question",
  "sub_type": "yes_no_question"
}
```

## Why cross-linguistic coverage is non-trivial

The same communicative intent surfaces differently in different grammars:

- English and Spanish mark questions with word-order inversion and punctuation.
- Mandarin uses sentence-final particles ("你喜欢吗?").
- Japanese uses rising intonation; the grammar doesn't change.
- Many languages use dedicated imperative morphology for commands that English expresses with bare infinitives.

A model trained only on English gets these wrong everywhere else. The multilingual dataset provides the cross-lingual signal a single-model classifier needs to generalize.

## The downstream stack

The models trained on this data ship inside **[little_questions](https://github.com/TigreGotico/little_questions)** — a zero-dependency offline library (numpy + onnxruntime) with per-language ONNX classifiers for sentence type and a 43-language yes/no polarity model. Models are bundled in-wheel for English and lazy-downloaded for other languages. The HuggingFace sources are `TigreGotico/sentence-types` and `TigreGotico/eat-classifiers`.

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` is the natural-language routing layer for OVOS and LILACS: classifying whether an utterance is a question, command, or statement is the first dispatch decision a voice pipeline makes.

[**sentence-types-multilingual on HuggingFace**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**little_questions on GitHub**](https://github.com/TigreGotico/little_questions)
