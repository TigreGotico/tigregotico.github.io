---
title: "A Multilingual Sentence-Types Dataset: Questions, Commands, Statements"
description: "We published sentence-types-multilingual — nearly 70,000 sentences across seven languages, classified by grammatical type (question, command, statement, exclamation). It is the training corpus behind the little_questions routing library."
date: 2026-04-01
updated: 2026-08-01
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

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** is the training corpus behind that layer — 69,300 labeled sentences, 9,900 for each of seven languages: English, Spanish, French, German, Italian, Portuguese, and Dutch.

## What the labels mean in practice

The dataset uses a flat set of six labels — one `label` column per row, no type/sub-type split — which map directly to how `little_questions` (the inference library that consumes this data) routes utterances:

- **wh_question** — questions built around a wh-word (what, where, who, and so on).
- **polar_question** — yes/no questions. The EAT taxonomy inside `little_questions` adds 53 fine-grained answer-type labels (person, location, quantity, definition, and so on) on top of the question labels, but sentence-type classification is the first gate.
- **command** — imperative forms. Commands don't expect an answer; they expect an action.
- **request** — polite or indirect asks for action, distinct from a bare imperative.
- **statement** — declarative. Statements in a dialogue context often carry polarity that matters downstream: a yes/no/maybe classifier runs on statements to interpret answers to prior questions.
- **exclamation** — emotionally marked utterances that need different handling than neutral declaratives.

```json
{
  "language": "en",
  "label": "wh_question",
  "text": "What time is it?"
}
```

## Why cross-linguistic coverage is non-trivial

The same communicative intent surfaces differently in different grammars:

- English marks questions with word-order inversion; Portuguese and Spanish often mark them with punctuation and intonation alone, leaving word order untouched.
- German separates verbs to sentence-final position in ways that shift where the classifying signal lives.
- Romance languages use dedicated imperative morphology for commands that English expresses with the bare verb.

A model trained only on English gets these wrong everywhere else. Parallel labeled data across the seven languages provides the cross-lingual signal per-language classifiers need — and the same generation pipeline extends to further languages as they are added.

## The downstream stack

The models trained on this data ship inside **[little_questions](https://github.com/TigreGotico/little_questions)** — a zero-dependency offline library (numpy + onnxruntime) with per-language ONNX classifiers for sentence type and a 43-language yes/no polarity model. Models are bundled in-wheel for English and lazy-downloaded for other languages. The sentence-type classifiers are published as `TigreGotico/sentence-types` on HuggingFace; the EAT answer-type classifiers are trained internally and not publicly released.

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` is the natural-language routing layer for OVOS and LILACS: classifying whether an utterance is a question, command, or statement is the first dispatch decision a voice pipeline makes.

[**sentence-types-multilingual on HuggingFace**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**little_questions on GitHub**](https://github.com/TigreGotico/little_questions)
