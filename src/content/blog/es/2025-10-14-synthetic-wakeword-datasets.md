---
title: "Datasets Sintéticos de Wakeword: Siete Nombres de Asistente, Un Detector"
description: "Hemos publicado siete datasets sintéticos de wakeword para nombres comunes de asistentes de voz: hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Entrena un detector que funciona en todas partes."
date: 2025-10-14
lang: es
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

Siete nombres de asistente. Siete datasets. Todo el audio se genera íntegramente con el framework TTS **[phoonnx](https://github.com/TigreGotico/phoonnx)** usando las voces Miro y Dii. Sin grabaciones humanas. Sin formularios de consentimiento. Sin exposición de la privacidad.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Cada dataset es un conjunto plano de aproximadamente mil clips positivos: la wakeword pronunciada con hablantes, ritmos y prosodia variados. Los negativos difíciles y el ruido de fondo se distribuyen como datasets complementarios separados que mezclas en el momento del entrenamiento: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en), [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt), y [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## Por qué sintético

Las grabaciones reales tardan meses en recopilarse. Cada hablante necesita un formulario de consentimiento, y el resultado igual deja carencias de acentos que no habías anticipado. La generación sintética evita todo eso.

- **Reproducible**: los mismos ajustes de generación y las mismas voces producen el mismo audio, con un rastro de auditoría completo y sin arqueología de formularios de consentimiento.
- **Auditable**: la pipeline de generación es la documentación.
- **Escalable**: variar el ritmo del habla y las características del hablante es un cambio de parámetro, no una sesión de estudio.

Para la detección de wakeword, lo que importa es la distintividad acústica, no la naturalidad. Los datos sintéticos encajan con ese requisito.

## Usa estos

Entrena tu propio detector de wakeword para OpenVoiceOS, Mycroft o cualquier sistema de voz abierto. Para la ampliación de muestras negativas también hay datasets de clips de fondo domésticos y de dominio público: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs), [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs), y [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**Todos los datasets de wakeword en HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
