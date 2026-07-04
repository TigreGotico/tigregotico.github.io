---
title: "Deux voix, toutes les langues : Miro & Dii"
description: "TigreGótico s'associe à OpenVoiceOS pour doter l'assistant de deux identités vocales cohérentes — Miro et Dii — qui sonnent de la même façon dans chaque langue, construites avec notre technologie de clonage vocal et le moteur phoonnx. Deux modèles de TTS pour chaque langue demandée, langues menacées comprises."
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
> navigateur — choisissez une langue, tapez une phrase et écoutez. Sans installation, sans serveur.

Les gens retiennent la voix d'un assistant plus que son nom. C'est ce qui fait qu'un logiciel ressemble à une présence plutôt qu'à un processus. La question centrale de notre partenariat avec [OpenVoiceOS](https://www.openvoiceos.org/) est donc pratique : à qui l'assistant devrait-il ressembler, dans chaque langue ?

La réponse est **Miro** (masculin) et **Dii** (féminin) — deux identités vocales qui se maintiennent à travers toutes les langues prises en charge par OpenVoiceOS. Un utilisateur qui configure l'assistant à Lisbonne et passe ensuite à l'allemand devrait entendre le même locuteur familier. Une voix de marque, toutes les langues, propriété de la communauté.

## Une identité, de nombreuses langues

La façon habituelle d'obtenir une voix multilingue consiste à entraîner un seul modèle sur de nombreuses langues à la fois. Cela fonctionne, mais tend à brouiller le résultat : les accents débordent d'une langue à l'autre, la prononciation devient approximative et la voix perd la netteté d'un locuteur natif.

Nous empruntons le chemin le plus difficile. Pour chaque langue, nous construisons un modèle **monolingue** — un modèle, une langue, entraîné pour bien parler cette langue. L'astuce qui les relie est le **clonage vocal** : chaque modèle monolingue de Miro est cloné à partir de la même identité source, et de même pour Dii. Le résultat est une famille de modèles, un par langue, qui parlent chacun comme un natif tout en partageant le même timbre, le même caractère, la même Miro-itude ou Dii-itude. Vous obtenez une prononciation de qualité native *et* une identité unique reconnaissable, au lieu de sacrifier l'une pour l'autre.

Ces modèles sont entraînés et servis avec [**phoonnx**](https://github.com/TigreGotico/phoonnx), notre framework TTS ouvert — basé sur VITS, exporté vers ONNX, uniquement sur CPU. Les voix fonctionnent entièrement hors ligne ; pas de cloud, pas de clé d'API, aucune donnée qui quitte votre matériel. Au sein d'OpenVoiceOS, le plugin `ovos-tts-plugin-phoonnx` se charge de les récupérer et de les charger. Pour toute l'histoire du matériel et de l'architecture, voir [Un TTS qui tourne sur une patate](/fr/blog/2026-05-10-tts-that-runs-on-a-potato).

## La recherche en G2P qui rend cela possible

Bien parler une langue ne concerne pas seulement la voix — il s'agit de savoir comment l'écriture est *censée* sonner. C'est le travail de la conversion **graphème-vers-phonème (G2P)** : transformer le texte écrit en la séquence de phonèmes que le modèle prononce réellement. Chaque nouvelle langue que nous abordons s'accompagne de sa propre recherche en G2P, et c'est dans cette recherche que réside une grande partie du vrai travail.

phoonnx est délibérément flexible ici. Il peut piloter toute une gamme de phonémiseurs — eSpeak, Gruut, Epitran, le [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0) basé sur des modèles, et des outils spécifiques à chaque langue là où les moteurs généraux sont insuffisants. Cela se rattache directement à notre pile phonétique plus large : notre **[recherche sur l'orthographe-vers-IPA](/fr/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** et les **[phonémiseurs lusophones](/fr/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** que nous avons construits pour la famille portugaise nourrissent le même objectif — une IPA précise pour des langues que les grands fournisseurs de TTS ne se sont jamais donné la peine de modéliser avec soin. Quand une langue ne dispose d'aucun bon phonémiseur prêt à l'emploi, cette lacune *est* le projet. Nous faisons d'abord la recherche sur la correspondance graphie-son, puis la voix suit.


## Deux modèles pour chaque langue demandée

Voici l'offre concrète, et c'est le cœur du partenariat : **pour chaque langue que quelqu'un demande, nous construirons deux modèles de TTS — Miro et Dii.** Pas une feuille de route de peut-être-un-jour ; un engagement permanent. Demandez une langue, et le duo universel y arrive.

Et nous voulons dire *toutes* les langues, pas seulement les langues confortables et commercialement évidentes. Les voix qui manquent au monde sont rarement celles qui comptent cent millions de locuteurs — ce sont les **langues menacées et minoritaires** que le TTS grand public ignore discrètement parce que le marché est trop petit pour qu'on s'en soucie. Ce sont exactement les langues que nous voulons atteindre. **Le frison. L'asturien. L'aragonais.** Des langues portées par des communautés qui n'ont jamais eu de voix synthétique de haute qualité à appeler la leur, et qui n'ont aucune raison de s'attendre à ce qu'un fournisseur de la Silicon Valley la leur fournisse un jour.

Une identité vocale cohérente compte encore plus ici. Quand une communauté de langue minoritaire reçoit Miro et Dii, elle reçoit la même voix digne et professionnelle qu'un utilisateur d'une langue majoritaire — pas une pensée après coup au son métallique, mais un membre à part entière de la même famille. L'inclusion n'est pas une note de bas de page dans ce travail. C'est l'objectif.

## Ouvert, privé et à vous pour toujours

Tout ici suit les principes que partagent OpenVoiceOS et TigreGótico. Les voix sont **gratuites et open source**. Elles fonctionnent **hors ligne et auto-hébergées**, de sorte que ce que vous dites à votre assistant reste sur votre matériel. Les modèles sont **petits et efficaces**, de sorte que la confidentialité ne vous coûte pas un centre de données. Et parce que toute la pile — le moteur, les phonémiseurs, la recherche en G2P, les voix entraînées — est ouverte, une communauté peut prendre sa langue et la faire vivre longtemps après qu'une entreprise isolée soit passée à autre chose.

Vous pouvez parcourir l'ensemble croissant de voix dans la [**collection de modèles TTS phoonnx**](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) sur Hugging Face. Si votre langue n'y figure pas encore, ce n'est pas une porte fermée — c'est une demande qui attend d'être faite.

Deux voix. Toutes les langues. Celles que le reste de l'industrie a oubliées, comprises.
