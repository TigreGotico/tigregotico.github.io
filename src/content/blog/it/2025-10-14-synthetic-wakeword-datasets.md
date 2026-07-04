---
title: "Dataset Sintetici di Wakeword: Sette Nomi di Assistente, Un Rilevatore"
description: "Abbiamo pubblicato sette dataset sintetici di wakeword per i nomi più comuni degli assistenti vocali — hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Addestra un rilevatore che funziona ovunque."
date: 2025-10-14
lang: it
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

Sette nomi di assistente. Sette dataset. Tutto l'audio generato interamente a partire dal framework TTS **[phoonnx](https://github.com/TigreGotico/phoonnx)** usando le voci Miro e Dii — senza registrazioni umane, senza moduli di consenso, senza esposizione della privacy.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Ogni dataset è un insieme piatto di circa mille clip positivi — la wakeword pronunciata con locutori, ritmi e prosodia variati. I negativi difficili e il rumore di fondo vengono forniti come dataset complementari separati che mescoli al momento dell'addestramento: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en), [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt), e [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## Perché sintetico

Le registrazioni reali richiedono mesi di raccolta, moduli di consenso per ogni locutore e lasciano comunque lacune di accento che non avevi previsto. La generazione sintetica ribalta tutto questo:

- **Riproducibile**: le stesse impostazioni di generazione, le stesse voci → lo stesso audio. Tracciabilità completa, senza archeologia dei moduli di consenso.
- **Verificabile**: la pipeline di generazione è la documentazione.
- **Scalabile**: variare il ritmo di eloquio e le caratteristiche del locutore è una modifica di parametro, non una sessione in studio.

Per il rilevamento di wakeword la proprietà rilevante è la distintività acustica, non la naturalezza. I dati sintetici si adattano bene a questo requisito.

## Usa questi

Addestra il tuo rilevatore di wakeword per OpenVoiceOS, Mycroft o qualsiasi sistema vocale aperto. Per l'aumento dei campioni negativi ci sono anche dataset di clip di sottofondo domestici e di pubblico dominio: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs), [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs), e [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**Tutti i dataset di wakeword su HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
