---
title: "Données d'entraînement TTS Miro & Dii : 40 datasets ouverts pour 20 locales"
description: "Nous avons publié 40 datasets d'entraînement synthétiques pour les voix Miro et Dii en portugais, néerlandais, allemand, français, italien, japonais, espagnol et bien d'autres. Le clonage vocal à grande échelle : chaque langue reçoit deux identités cohérentes."
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

L'ensemble des **40 datasets d'entraînement synthétiques** utilisés pour construire Miro et Dii — les identités vocales que nous avons développées en partenariat avec OpenVoiceOS. La collection couvre le portugais européen, le portugais du Brésil, le néerlandais, l'allemand, le français, l'italien, le japonais, l'espagnol, le roumain, le polonais, le suédois, le hindi, le danois, le farsi, l'anglais, le basque, et bien plus encore. Chaque dataset suit une convention de nommage cohérente : `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL`, et ainsi de suite pour chaque paire de langues.

Chaque dataset est entièrement synthétique — du texte généré associé à de l'audio synthétisé au format LJSpeech, sans session en studio — et il est publié sous une licence ouverte afin que quiconque puisse réentraîner ou étendre la voix. La phonémisation a lieu au moment de l'entraînement dans phoonnx, en s'appuyant sur nos [recherches G2P pour plus de 350 langues](/fr/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## Comment l'identité vocale reste cohérente d'une langue à l'autre

Nous n'entraînons pas un unique bloc multilingue en espérant que l'accent se règle de lui-même. Chaque langue reçoit un **modèle monolingue** — entraîné pour sonner comme un locuteur natif de cette langue. L'identité partagée entre les modèles provient du **clonage vocal** : chaque modèle Miro et chaque modèle Dii est cloné à partir de la même voix source avant d'être adapté à une nouvelle langue. Le timbre, le caractère, la qualité reconnaissable de la voix — cela se transfère. L'accent, non, délibérément.

La conséquence pratique : un locuteur portugais, un locuteur néerlandais, un locuteur japonais — tous incontestablement **la même personne**, chacun sonnant natif.

## Pourquoi publier les données d'entraînement

Un checkpoint sans ses données d'entraînement est une boîte noire. Le publier rend la voix **auditable** (vous pouvez voir exactement ce dont elle a appris), **reproductible** (exécutez `phoonnx_train` sur les mêmes données, obtenez le même résultat) et **extensible** (ajoutez des phrases, affinez pour un dialecte, construisez un nouveau locuteur par-dessus).

Cela importe surtout pour les langues à faibles ressources de cette liste. Lorsque les données d'entraînement sont ouvertes, la communauté qui parle une langue peut améliorer sa propre voix — sans attendre qu'un fournisseur décide qu'elle est commercialement intéressante.

## Où tout trouver

Tous les datasets et modèles entraînés se trouvent sous [**TigreGotico sur HuggingFace**](https://huggingface.co/TigreGotico), avec des checkpoints de voix compatibles Piper également reproduits sous [OpenVoiceOS](https://huggingface.co/OpenVoiceOS).

Pour le framework d'inférence et d'entraînement qui consomme ces datasets, voir [**phoonnx**](https://github.com/TigreGotico/phoonnx).
