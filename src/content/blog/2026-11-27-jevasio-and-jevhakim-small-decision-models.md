---
title: "Jevásio and Jevhakim: Small Decision Models for Portuguese and Arabic"
description: "Jevásio (European Portuguese) and Jevhakim (Arabic) are 0.8B and 4B decision models. They read a state and a typed question, and give a probability for each option in one forward pass, with no generated text."
date: 2026-11-27
author: "Casimiro Ferreira"
tags:
  - "Jevásio"
  - "Jevhakim"
  - "NLP"
  - "Portuguese"
  - "Arabic"
  - "OVOS"
draft: false
---

Many questions inside a voice assistant are not open questions. "Which of these
four intents is this?" "Does the customer ask for a refund?" "How angry is this
text, from 0 to 1?" A chat model writes a paragraph and then a parser hopes to
find the answer in it. A decision model gives the answer directly: one
probability for each option.

**Jevásio** does this for European Portuguese, and **Jevhakim** does it for
Arabic, Modern Standard Arabic and the dialects. Both follow the Kev design
(`jaredpalmer/kev-0.8b`): a model reads a state and typed questions (`choice`,
`score` and `noul`), and gives the probabilities in one forward pass. It
generates no text.

## Try them

Each model has a demo Space:
[Jarbas/jevasio](https://huggingface.co/spaces/Jarbas/jevasio) and
[Jarbas/jevhakim](https://huggingface.co/spaces/Jarbas/jevhakim). These are real
requests through the Space API, with the options weather, timer, music and
alarm:

| Model | Request | Answer |
| :--- | :--- | :--- |
| Jevásio | "Vai chover amanhã em Lisboa?" | weather, 0.983 |
| Jevásio | "Põe um temporizador de dez minutos" | timer, 0.989 |
| Jevásio | "Acorda-me às sete da manhã" | alarm, 0.994 |
| Jevhakim | "كيف الطقس في الرياض اليوم؟" | weather, 1.0 |
| Jevhakim | "شغل لي أغنية لفيروز" | music, 1.0 |
| Jevhakim | "صحيني الساعة سبعة الصبح" | alarm, 0.982 |

A warm call takes about 250 to 320 ms. A cold start takes several seconds.

## How they were trained

Both models keep the base model `Qwen/Qwen3.5-0.8B-Base` frozen and train a
rank-16 LoRA (11.3M trainable parameters) and the Kev pointer head.

- **Jevásio-0.8B-V2** trained on 267,950 European Portuguese requests and 12,576
  English replay records, for one epoch, in 4.3 hours on one RTX 4090. Most
  labels come from the source data. One part of the data has labels from the
  AMALIA-9B model.
- **Jevhakim-0.8B** starts from Kev-0.8B and trained on 442,627 requests from 58
  sources, for two epochs, in 14.2 hours on one RTX 5090. No model wrote a
  label. 22 more sources are held out for the test.

## Results

| Model | Test set | Accuracy | Baseline |
| :--- | :--- | :--- | :--- |
| Jevásio-0.8B-V2 | pt-PT, 37,972 questions | 0.775 | 0.660 (Jevásio V1) |
| Jevhakim-0.8B | Arabic, 141,217 questions | 0.661 | 0.503 (Kev-0.8B) |

As an intent router alone, Jevásio scores 0.657 on Portuguese (Kev: 0.511), and
Jevhakim scores 0.658 on the Arabic part of MASSIVE (Kev: 0.435). These routing
scores come from our own audit. An OpenVoiceOS intent plugin that uses the
models is in development.

## Licence

The Jevásio and Jevhakim models and their datasets are CC BY-NC-SA 4.0:
**non-commercial use only**. For commercial use, Kev-0.8B is Apache-2.0.

## Limits

The answers to yes/no questions are not always well calibrated. Jevásio gives
0.514 for "asks for a refund?" on *quero trocar* ("I want an exchange"), and
Jevhakim gives 0.318 for "is the customer angry?" on a plainly angry text.
Jevásio gains little on tasks that it did not train on. Jevhakim is
overconfident on new tasks, and it has no score for each dialect yet.
