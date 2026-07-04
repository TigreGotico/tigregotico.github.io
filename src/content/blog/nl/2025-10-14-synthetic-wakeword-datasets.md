---
title: "Synthetische Wakeword-datasets: Zeven Assistentnamen, Eén Detector"
description: "We publiceerden zeven synthetische wakeword-datasets voor gangbare namen van spraakassistenten — hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Train een detector die overal werkt."
date: 2025-10-14
lang: nl
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

Zeven assistentnamen. Zeven datasets. Alle audio is volledig gegenereerd met het TTS-framework **[phoonnx](https://github.com/TigreGotico/phoonnx)** met behulp van de stemmen Miro en Dii — geen menselijke opnames, geen toestemmingsformulieren, geen blootstelling van privacy.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Elke dataset is een platte verzameling van ongeveer duizend positieve clips — het wakeword uitgesproken met gevarieerde sprekers, snelheden en prosodie. Harde negatieven en achtergrondruis worden geleverd als aparte begeleidende datasets die u tijdens het trainen bijmengt: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en), [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt), en [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## Waarom synthetisch

Echte opnames vereisen maanden van verzameling, toestemmingsformulieren voor elke spreker, en laten toch accentlacunes achter die u niet had voorzien. Synthetische generatie keert dat om:

- **Reproduceerbaar**: dezelfde generatie-instellingen, dezelfde stemmen → dezelfde audio. Volledig auditspoor, geen archeologie van toestemmingsformulieren.
- **Controleerbaar**: de generatiepipeline is de documentatie.
- **Schaalbaar**: het variëren van de spreeksnelheid en de kenmerken van de spreker is een parameterwijziging, geen studiosessie.

Voor wakeword-detectie is de relevante eigenschap akoestische onderscheidbaarheid, niet natuurlijkheid. Synthetische data past goed bij die eis.

## Gebruik deze

Train uw eigen wakeword-detector voor OpenVoiceOS, Mycroft of elk open spraaksysteem. Voor het aanvullen van negatieve voorbeelden zijn er ook datasets met huishoudelijke en publiek domein achtergrondclips: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs), [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs), en [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**Alle wakeword-datasets op HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
