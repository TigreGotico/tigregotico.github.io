---
title: "Synthetische Wakeword-Datensätze: Sieben Assistentennamen, ein Detektor"
description: "Wir haben sieben synthetische Wakeword-Datensätze für gängige Sprachassistentennamen veröffentlicht: hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Trainieren Sie einen Detektor, der überall funktioniert."
date: 2025-10-14
lang: de
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Wakewords"
  - "Speech"
  - "Synthetic"
  - "Voice"
  - "FOSS"
draft: false
---

Sieben Assistentennamen. Sieben Datensätze. Sämtliches Audio wird vollständig vom TTS-Framework **[phoonnx](https://github.com/TigreGotico/phoonnx)** mit den Stimmen Miro und Dii erzeugt. Keine menschlichen Aufnahmen. Keine Einwilligungsformulare. Keine Preisgabe der Privatsphäre.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Jeder Datensatz ist eine flache Menge von etwa tausend positiven Clips: das Wakeword gesprochen mit variierten Sprechern, Geschwindigkeiten und Prosodie. Harte Negativbeispiele und Hintergrundgeräusche werden als separate Begleitdatensätze geliefert, die Sie zur Trainingszeit einmischen: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en), [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt) und [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## Warum synthetisch

Echte Aufnahmen benötigen Monate zur Erfassung. Jeder Sprecher braucht ein Einwilligungsformular, und das Ergebnis hinterlässt dennoch Akzentlücken, die Sie nicht vorhergesehen haben. Die synthetische Erzeugung vermeidet all das.

- **Reproduzierbar**: dieselben Erzeugungseinstellungen und Stimmen erzeugen dasselbe Audio, mit vollständigem Prüfpfad und ohne Archäologie von Einwilligungsformularen.
- **Überprüfbar**: die Erzeugungspipeline ist die Dokumentation.
- **Skalierbar**: Sprechgeschwindigkeit und Sprechermerkmale zu variieren ist eine Parameteränderung, keine Studiositzung.

Für die Wakeword-Erkennung zählt die akustische Unterscheidbarkeit, nicht die Natürlichkeit. Synthetische Daten erfüllen genau diese Anforderung.

## Nutzen Sie diese

Trainieren Sie Ihren eigenen Wakeword-Detektor für OpenVoiceOS, Mycroft oder jedes offene Sprachsystem. Für die Anreicherung mit Negativbeispielen gibt es auch Datensätze mit häuslichen und gemeinfreien Hintergrund-Clips: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs), [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs) und [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**Alle Wakeword-Datensätze auf HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
