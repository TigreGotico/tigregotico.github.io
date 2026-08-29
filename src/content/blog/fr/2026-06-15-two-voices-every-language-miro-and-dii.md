---
title: "Deux voix, toutes les langues : Miro & Dii"
description: "TigreGótico s'associe à OpenVoiceOS pour doter l'assistant de deux identités vocales cohérentes, Miro et Dii, qui sonnent de la même façon dans chaque langue, construites avec notre technologie de clonage vocal et le moteur phoonnx. Deux modèles de TTS pour chaque langue demandée, langues menacées comprises."
date: 2026-06-15
lang: fr
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "OVOS"
  - "voice cloning"
  - "G2P"
  - "language inclusion"
draft: false
---

> **Écoutez-les maintenant :** la [Démo des voix](../../demo) fait tourner Miro et Dii en direct dans votre
> navigateur. Choisissez une langue, tapez une phrase et écoutez. Sans installation, sans serveur.

Les gens retiennent la voix d'un assistant plus que son nom. La question centrale de notre partenariat avec [OpenVoiceOS](https://www.openvoiceos.org/) est donc pratique : à qui l'assistant devrait-il ressembler, dans chaque langue ?

La réponse est **Miro** (masculin) et **Dii** (féminin), deux identités vocales qui se maintiennent à travers toutes les langues prises en charge par OpenVoiceOS. Un utilisateur qui configure l'assistant à Lisbonne et passe ensuite à l'allemand entend le même locuteur familier dans les deux cas.

## Une identité, de nombreuses langues

La façon habituelle d'obtenir une voix multilingue consiste à entraîner un seul modèle sur de nombreuses langues à la fois. Cela fonctionne, mais tend à brouiller le résultat : les accents débordent d'une langue à l'autre et la prononciation devient approximative.

Nous construisons plutôt un modèle par langue, chacun entraîné uniquement sur cette langue. Pour que chacun de ces modèles sonne comme la même personne, nous clonons chaque modèle monolingue de Miro à partir de la même identité source, et de même pour Dii. Un auditeur obtient ainsi une prononciation de qualité native dans chaque langue, tout en reconnaissant toujours la même voix d'une langue à l'autre.

Ces modèles sont entraînés et servis avec [**phoonnx**](https://github.com/TigreGotico/phoonnx), notre framework TTS ouvert : construit sur VITS (une architecture neuronale de synthèse vocale), exporté vers ONNX, et uniquement sur CPU à l'inférence. Elles fonctionnent entièrement hors ligne, sans cloud, sans clé d'API, et sans aucune donnée qui quitte votre matériel. Au sein d'OpenVoiceOS, le plugin `ovos-tts-plugin-phoonnx` se charge de les récupérer et de les charger. Pour toute l'histoire du matériel et de l'architecture, voir [Un TTS qui tourne sur une patate](/fr/blog/2026-05-10-tts-that-runs-on-a-potato).

## La recherche en G2P qui rend cela possible

Bien parler une langue demande plus qu'une voix. Cela demande de savoir comment l'écriture est censée sonner. C'est le travail de la conversion graphème-vers-phonème (G2P) : transformer le texte écrit en la séquence de phonèmes que le modèle prononce. Chaque nouvelle langue que nous abordons a d'abord besoin de sa propre recherche en G2P, et cette recherche constitue l'essentiel du vrai travail.

phoonnx peut piloter une gamme de phonémiseurs : eSpeak, Gruut, Epitran, le [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0) basé sur des modèles, et des outils spécifiques à chaque langue là où les moteurs généraux sont insuffisants. Notre [recherche sur l'orthographe-vers-IPA](/fr/blog/2026-01-15-grapheme-to-ipa-for-350-languages) et les [phonémiseurs lusophones](/fr/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes) que nous avons construits pour la famille portugaise nourrissent le même objectif : une IPA précise pour des langues que les grands fournisseurs de TTS n'ont jamais modélisées avec soin. Quand une langue ne dispose d'aucun bon phonémiseur prêt à l'emploi, cette lacune est le projet. Nous faisons d'abord la recherche sur la correspondance graphie-son, puis la voix suit.


## Deux modèles pour chaque langue demandée

L'offre au cœur du partenariat : pour chaque langue que quelqu'un demande, nous construisons deux modèles de TTS, Miro et Dii. C'est un engagement permanent, pas une feuille de route. Demandez une langue, et le duo y arrive.

Nous voulons dire toutes les langues, pas seulement celles qui comptent le plus grand nombre de locuteurs. Les langues menacées et minoritaires, celles que le TTS grand public ignore parce que le marché est petit, sont exactement ce que nous voulons atteindre : des communautés qui n'ont jamais eu de voix synthétique à elles.

Au moment d'écrire ces lignes, la [collection de modèles TTS phoonnx](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) sur Hugging Face recense 13 langues avec au moins une voix publiée. Huit d'entre elles, le basque, l'arabe, le portugais européen, l'asturien, l'aragonais, le frison, l'occitan et l'espagnol colombien, disposent déjà à la fois de Miro et de Dii.

## Ouvert et auto-hébergé

Les voix sont gratuites et open source. Elles fonctionnent hors ligne et auto-hébergées, de sorte que rien de ce que vous dites ne quitte votre matériel. Toute la pile, le moteur, les phonémiseurs, la recherche en G2P, et les voix entraînées, est ouverte pour qu'une communauté puisse la prendre et la garder.

Si votre langue n'y figure pas encore, demandez-la.
