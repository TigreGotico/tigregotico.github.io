---
title: "Miro-&-Dii-TTS-Trainingsdaten: 40 offene Datensätze in 20 Locales"
description: "Wir haben 40 synthetische Trainingsdatensätze für die Stimmen Miro und Dii in Portugiesisch, Niederländisch, Deutsch, Französisch, Italienisch, Japanisch, Spanisch und mehr veröffentlicht. Jede Sprache erhält zwei konsistente Stimmidentitäten, erstellt mittels Voice Cloning."
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

Wir veröffentlichen alle 40 synthetischen Trainingsdatensätze, die zum Aufbau von Miro und Dii verwendet wurden, den Stimmidentitäten, die wir in Partnerschaft mit OpenVoiceOS entwickelt haben. Die Sammlung umfasst europäisches Portugiesisch, brasilianisches Portugiesisch, Niederländisch, Deutsch, Französisch, Italienisch, Japanisch, Spanisch, Rumänisch, Polnisch, Schwedisch, Hindi, Dänisch, Farsi, Englisch, Baskisch und mehr. Jeder Datensatz folgt einer einheitlichen Namenskonvention: `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL` und so weiter für jedes Sprachpaar.

Jeder Datensatz ist vollständig synthetisch: generierter Text gepaart mit synthetisiertem Audio, angelegt im LJSpeech-Format, das für TTS-Trainingsdaten üblich ist, ohne Studiositzungen. Jeder wird unter einer offenen Lizenz veröffentlicht, sodass jeder die Stimme neu trainieren oder erweitern kann. Die Phonemisierung erfolgt zur Trainingszeit in phoonnx und stützt sich auf unsere [G2P-Forschung für über 350 Sprachen](/de/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## Wie die Stimmidentität sprachübergreifend konsistent bleibt

Wir trainieren nicht ein einziges mehrsprachiges Modell und hoffen, dass sich der Akzent von selbst regelt. Jede Sprache erhält ein monolinguales Modell, trainiert, um wie ein Muttersprachler dieser Sprache zu klingen. Die geteilte Identität über die Modelle hinweg entsteht durch Voice Cloning: Jedes Miro- und jedes Dii-Modell wird aus derselben Ausgangsstimme geklont, bevor es an eine neue Sprache angepasst wird. Das Timbre und der Charakter der Stimme übertragen sich. Der Akzent nicht, und zwar absichtlich.

Das praktische Ergebnis: Ein Portugiesischsprecher, ein Niederländischsprecher und ein Japanischsprecher klingen alle unverkennbar wie dieselbe Person, jeder muttersprachlich.

## Warum die Trainingsdaten veröffentlichen

Ein Checkpoint ohne seine Trainingsdaten ist eine Blackbox. Die Veröffentlichung der Daten lässt jeden genau sehen, woraus das Modell gelernt hat, erlaubt es, `phoonnx_train` auf denselben Daten auszuführen und dasselbe Ergebnis zu erhalten, und macht es erweiterbar: Sätze hinzufügen, für einen Dialekt feinabstimmen oder einen neuen Sprecher darauf aufbauen.

Das ist vor allem für die ressourcenarmen Sprachen auf dieser Liste von Bedeutung. Wenn die Trainingsdaten offen sind, kann die Gemeinschaft, die eine Sprache spricht, ihre eigene Stimme verbessern, ohne darauf zu warten, dass ein Anbieter sie für kommerziell interessant befindet.

## Wo Sie alles finden

Alle Datensätze und trainierten Modelle liegen unter [TigreGotico auf HuggingFace](https://huggingface.co/TigreGotico), wobei Piper-kompatible Stimm-Checkpoints auch unter [OpenVoiceOS](https://huggingface.co/OpenVoiceOS) gespiegelt werden.

Für das Inferenz- und Trainings-Framework, das diese Datensätze verwendet, siehe [phoonnx](https://github.com/TigreGotico/phoonnx).
