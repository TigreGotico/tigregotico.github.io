---
title: "Miro-&-Dii-TTS-Trainingsdaten: 40 offene Datensätze in 20 Locales"
description: "Wir haben 40 synthetische Trainingsdatensätze für die Stimmen Miro und Dii in Portugiesisch, Niederländisch, Deutsch, Französisch, Italienisch, Japanisch, Spanisch und mehr veröffentlicht. Voice Cloning im großen Maßstab: Jede Sprache erhält zwei konsistente Identitäten."
date: 2025-06-23
lang: de
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Voice"
  - "Datasets"
  - "Miro & Dii"
  - "Multilingual"
  - "FOSS"
draft: false
---

## Was wir veröffentlichen

Alle **40 synthetischen Trainingsdatensätze**, die zum Aufbau von Miro und Dii verwendet wurden — die Stimmidentitäten, die wir in Partnerschaft mit OpenVoiceOS entwickelt haben. Die Sammlung umfasst europäisches Portugiesisch, brasilianisches Portugiesisch, Niederländisch, Deutsch, Französisch, Italienisch, Japanisch, Spanisch, Rumänisch, Polnisch, Schwedisch, Hindi, Dänisch, Farsi, Englisch, Baskisch und mehr. Jeder Datensatz folgt einer einheitlichen Namenskonvention: `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL` und so weiter für jedes Sprachpaar.

Jeder Datensatz ist vollständig synthetisch — generierter Text gepaart mit synthetisiertem Audio im LJSpeech-Layout, ohne Studiositzungen — und wird unter einer offenen Lizenz veröffentlicht, sodass jeder die Stimme neu trainieren oder erweitern kann. Die Phonemisierung erfolgt zur Trainingszeit in phoonnx und stützt sich auf unsere [G2P-Forschung für über 350 Sprachen](/de/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## Wie die Stimmidentität sprachübergreifend konsistent bleibt

Wir trainieren nicht einen einzigen mehrsprachigen Block und hoffen, dass sich der Akzent von selbst regelt. Jede Sprache erhält ein **monolinguales Modell** — trainiert, um wie ein Muttersprachler dieser Sprache zu klingen. Die geteilte Identität über die Modelle hinweg entsteht durch **Voice Cloning**: Jedes Miro- und jedes Dii-Modell wird aus derselben Ausgangsstimme geklont, bevor es an eine neue Sprache angepasst wird. Das Timbre, der Charakter, die wiedererkennbare Qualität der Stimme — das überträgt sich. Der Akzent nicht, und zwar absichtlich.

Die praktische Konsequenz: ein Portugiesischsprecher, ein Niederländischsprecher, ein Japanischsprecher — alle unverkennbar **dieselbe Person**, jeder muttersprachlich klingend.

## Warum die Trainingsdaten veröffentlichen

Ein Checkpoint ohne seine Trainingsdaten ist eine Blackbox. Die Veröffentlichung macht die Stimme **überprüfbar** (Sie können genau sehen, woraus sie gelernt hat), **reproduzierbar** (führen Sie `phoonnx_train` auf denselben Daten aus und erhalten Sie dasselbe Ergebnis) und **erweiterbar** (Sätze hinzufügen, für einen Dialekt feinabstimmen, einen neuen Sprecher darauf aufbauen).

Das ist vor allem für die ressourcenarmen Sprachen auf dieser Liste von Bedeutung. Wenn die Trainingsdaten offen sind, kann die Gemeinschaft, die eine Sprache spricht, ihre eigene Stimme verbessern — ohne darauf zu warten, dass ein Anbieter sie für kommerziell interessant befindet.

## Wo Sie alles finden

Alle Datensätze und trainierten Modelle liegen unter [**TigreGotico auf HuggingFace**](https://huggingface.co/TigreGotico), wobei Piper-kompatible Stimm-Checkpoints auch unter [OpenVoiceOS](https://huggingface.co/OpenVoiceOS) gespiegelt werden.

Für das Inferenz- und Trainings-Framework, das diese Datensätze verwendet, siehe [**phoonnx**](https://github.com/TigreGotico/phoonnx).
