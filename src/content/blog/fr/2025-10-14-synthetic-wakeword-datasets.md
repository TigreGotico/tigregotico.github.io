---
title: "Jeux de données de wakeword synthétiques : sept noms d'assistant, un seul détecteur"
description: "Nous avons publié sept jeux de données de wakeword synthétiques pour des noms d'assistant vocal courants : hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Entraînez un détecteur qui fonctionne partout."
date: 2025-10-14
lang: fr
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

Sept noms d'assistant. Sept jeux de données. Tout l'audio est généré entièrement par
la framework TTS **[phoonnx](https://github.com/TigreGotico/phoonnx)** en
utilisant les voix Miro et Dii. Aucun enregistrement humain. Aucun formulaire de
consentement. Aucune exposition de la vie privée.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Chaque jeu de données est un ensemble plat d'environ un millier de clips positifs : le
wakeword prononcé avec des locuteurs, des débits et une prosodie variés. Les négatifs
difficiles et le bruit de fond sont fournis dans des jeux de données compagnons
séparés que vous mélangez au moment de l'entraînement :
[not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en),
[not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt),
et [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## Pourquoi le synthétique

Les enregistrements réels prennent des mois à collecter. Chaque locuteur a besoin
d'un formulaire de consentement, et le résultat laisse malgré tout des lacunes
d'accent que vous n'aviez pas anticipées. La génération synthétique évite tout
cela.

- **Reproductible** : les mêmes paramètres de génération et les mêmes voix
  produisent le même audio, avec une piste d'audit complète et sans archéologie
  de formulaires de consentement.
- **Auditable** : le pipeline de génération est la documentation.
- **Extensible** : faire varier le débit de parole et les caractéristiques du locuteur
  est un changement de paramètre, non une session de studio.

Pour la détection de wakeword, ce qui compte est la distinctivité acoustique,
non le naturel. Les données synthétiques correspondent à cette exigence.

## Utilisez-les

Entraînez votre propre détecteur de wakeword pour OpenVoiceOS, Mycroft, ou tout
système de voix ouvert. Pour l'augmentation d'échantillons négatifs, il existe aussi
des jeux de données de clips de fond domestiques et du domaine public :
[building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs),
[public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs),
et [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**Tous les jeux de données de wakeword sur HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
