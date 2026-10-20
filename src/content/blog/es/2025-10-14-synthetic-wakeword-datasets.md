---
title: "Datasets Sintéticos de Wakeword: Siete Nombres de Asistente, Un Detector"
description: "Hemos publicado siete datasets sintéticos de wakeword para nombres comunes de asistentes de voz — hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Entrena un detector que funciona en todas partes."
date: 2025-10-14
updated: 2026-10-20
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

Siete nombres de asistente. Siete datasets. Todo el audio es sintético: motores de texto a voz como edge-tts, Piper, Google TTS, Amazon Polly y OmniVoice, seguidos de conversión de voz para simular más hablantes. Los motores usados figuran en la ficha de cada dataset — sin grabaciones humanas, sin formularios de consentimiento, sin exposición de la privacidad.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Cada dataset es un conjunto plano de clips positivos, desde unos 1300 (hey_siri) hasta unos 27 800 (hey_mycroft) — la wakeword pronunciada con hablantes, ritmos y prosodia variados. Los negativos difíciles y el ruido de fondo se distribuyen como datasets complementarios separados que mezclas en el momento del entrenamiento: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en), [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt), y [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## Por qué sintético

Las grabaciones reales requieren meses de recopilación, formularios de consentimiento para cada hablante y, aun así, dejan carencias de acentos que no habías anticipado. La generación sintética invierte eso:

- **Reproducible**: los mismos ajustes de generación, las mismas voces → el mismo audio. Rastro de auditoría completo, sin arqueología de formularios de consentimiento.
- **Auditable**: la pipeline de generación es la documentación.
- **Escalable**: variar el ritmo del habla y las características del hablante es un cambio de parámetro, no una sesión de estudio.

Para la detección de wakeword la propiedad relevante es la distintividad acústica, no la naturalidad. Los datos sintéticos se ajustan bien a ese requisito.

## Usa estos

Entrena tu propio detector de wakeword para OpenVoiceOS, Mycroft o cualquier sistema de voz abierto. Para la ampliación de muestras negativas también hay datasets de clips de fondo domésticos y de dominio público: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs), [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs), y [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**Todos los datasets de wakeword en HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&search=synthetic-wakeword)
