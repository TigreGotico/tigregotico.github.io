---
title: "Données d'entraînement TTS Miro & Dii : 40 datasets ouverts pour 20 locales"
description: "Nous avons publié 40 datasets d'entraînement synthétiques pour les voix Miro et Dii en portugais, néerlandais, allemand, français, italien, japonais, espagnol et bien d'autres. Chaque langue reçoit deux identités vocales cohérentes, construites grâce au clonage vocal."
date: 2025-06-23
lang: fr
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

## Ce que nous publions

Nous publions l'ensemble des 40 datasets d'entraînement synthétiques utilisés pour construire Miro et Dii, les identités vocales que nous avons développées en partenariat avec OpenVoiceOS. La collection couvre le portugais européen, le portugais du Brésil, le néerlandais, l'allemand, le français, l'italien, le japonais, l'espagnol, le roumain, le polonais, le suédois, le hindi, le danois, le farsi, l'anglais, le basque, et bien plus encore. Chaque dataset suit une convention de nommage cohérente : `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL`, et ainsi de suite pour chaque paire de langues.

Chaque dataset est entièrement synthétique : du texte généré associé à de l'audio synthétisé, disposé selon le format LJSpeech courant pour les données d'entraînement TTS, sans session en studio. Chacun est publié sous une licence ouverte afin que quiconque puisse réentraîner ou étendre la voix. La phonémisation a lieu au moment de l'entraînement dans phoonnx, en s'appuyant sur nos [recherches G2P pour plus de 350 langues](/fr/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## Comment l'identité vocale reste cohérente d'une langue à l'autre

Nous n'entraînons pas un unique bloc multilingue en espérant que l'accent se règle de lui-même. Chaque langue reçoit un modèle monolingue, entraîné pour sonner comme un locuteur natif de cette langue. L'identité partagée entre les modèles provient du clonage vocal : chaque modèle Miro et chaque modèle Dii est cloné à partir de la même voix source avant d'être adapté à une nouvelle langue. Le timbre et le caractère de la voix se transfèrent. L'accent, non, délibérément.

Le résultat pratique est qu'un locuteur portugais, un locuteur néerlandais et un locuteur japonais sonnent tous incontestablement comme la même personne, chacun parlant nativement.

## Pourquoi publier les données d'entraînement

Un checkpoint sans ses données d'entraînement est une boîte noire. Publier les données permet à quiconque de voir exactement ce dont le modèle a appris, d'exécuter `phoonnx_train` sur les mêmes données pour obtenir le même résultat, et de l'étendre : ajouter des phrases, affiner pour un dialecte, ou construire un nouveau locuteur par-dessus.

Cela importe surtout pour les langues à faibles ressources de cette liste. Lorsque les données d'entraînement sont ouvertes, la communauté qui parle une langue peut améliorer sa propre voix sans attendre qu'un fournisseur décide qu'elle est commercialement intéressante.

## Où tout trouver

Tous les datasets et modèles entraînés se trouvent sous [TigreGotico sur HuggingFace](https://huggingface.co/TigreGotico), avec des checkpoints de voix compatibles Piper également reproduits sous [OpenVoiceOS](https://huggingface.co/OpenVoiceOS).

Pour le framework d'inférence et d'entraînement qui consomme ces datasets, voir [phoonnx](https://github.com/TigreGotico/phoonnx).
