---
title: "Synthetische Stimmen von Grund auf erstellen"
description: "Eine Stimme für ein Text-to-Speech-System zu erstellen erfordert normalerweise, dass eine reale Person stundenlang Audio aufnimmt. Das ist teuer, zeitaufwendig, und in vielen Sprachen oder Akzenten existieren die Stimmen schlicht gar nicht"
date: 2025-06-26
lang: de
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Synthetic Data"
  - "Voice Cloning"
  - "OVOS"
draft: false
---

> Dieser Blogbeitrag wurde ursprünglich im [OpenVoiceOS-Blog](https://blog.openvoiceos.org/posts/2025-06-26-making-synthetic-voices-from-scratch) veröffentlicht

Eine gute Offline-TTS-Stimme für europäisches Portugiesisch existierte nicht. Studioaufnahmen sind teuer, dauern Monate, und in den meisten Sprachen der Welt haben die Aufnahmen schlicht nie stattgefunden. Also haben wir vier von Grund auf gebaut, ohne Aufnahmekabine, ohne Sprecher und ohne Cloud.

### Die dreistufige Pipeline

**1. Synthetische Sprachpaare erzeugen.** Wir verwenden eine vorhandene TTS-Stimme als Geber (jede Quelle, die verständliches Audio erzeugen kann) und lassen sie über ein großes Textkorpus laufen, um Tausende von Audio-/Text-Paaren zu produzieren. Die Geberstimme muss nicht von hoher Qualität sein. Sie muss nur kohärent genug sein, um daraus zu lernen.

**2. Voice Conversion anwenden.** Ein Voice-Conversion-Schritt verwandelt das Timbre des Gebers in eine neue Identität: anderes Geschlecht, Alter oder Charakter. Das resultierende Audio klingt nach der Zielstimme, nicht nach dem Geber.

**3. Ein kompaktes VITS-Modell trainieren.** VITS ist eine neuronale Text-to-Speech-Architektur. Das konvertierte Audio wird zum Trainingssatz für ein kleines VITS-Modell über [phoonnx_train](https://github.com/TigreGotico/phoonnx). Das fertige Modell wird nach ONNX (einem portablen Format zum Ausführen trainierter Modelle) exportiert und läuft vollständig offline, bei Bedarf auf einem Raspberry Pi.

### Ethische Leitplanken

Wenn der Geber die Stimme einer realen Person ist, holen wir zuerst eine ausdrückliche Erlaubnis ein. Wenn keine Erlaubnis möglich ist, verwenden wir gemeinfreie Aufnahmen oder erzeugen eine vollständig originale Stimme, die niemandes Identität kopiert. Der Voice-Conversion-Schritt hat außerdem eine nützliche Datenschutzeigenschaft: Die Ausgabe ist akustisch hinreichend verschieden vom Geber, sodass das Risiko der Nachahmung vernachlässigbar ist.

### Angewendet auf europäisches Portugiesisch

Europäisches Portugiesisch hatte keine hochwertige offene Offline-Stimme. Wir haben vier Stimmen produziert, einschließlich der Identitäten Miro und Dii, die nun die Standard-OVOS-Stimmen für `pt-PT` sind, und zwar mit genau dieser Pipeline. Sie laufen problemlos auf bescheidener Hardware, benötigen keine Internetverbindung, und die Trainingsdaten sind [offen veröffentlicht](https://huggingface.co/TigreGotico), sodass jeder sie reproduzieren oder erweitern kann.

Alle Modelle und Datensätze liegen unter [huggingface.co/OpenVoiceOS](https://huggingface.co/OpenVoiceOS) und [huggingface.co/TigreGotico](https://huggingface.co/TigreGotico).
