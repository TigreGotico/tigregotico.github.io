---
title: "Présentation du premier phonémiseur pour le barranquenho"
description: "g2p_barranquenho est le premier convertisseur graphème-phonème ouvert pour le barranquenho, la langue de contact ibéro-romane de Barrancos, au Portugal — des règles dérivées de la convention orthographique récemment publiée par la municipalité, vérifiables au regard des sources incluses dans le dépôt."
date: 2025-12-12
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) est le premier convertisseur graphème-phonème ouvert pour le [barranquenho](https://en.wikipedia.org/wiki/Barranquenho), une langue de contact ibéro-romane parlée à Barrancos, au Portugal — une municipalité située à la frontière espagnole où le portugais et l'espagnol d'Estrémadure/d'Andalousie coexistent depuis des siècles.

### Ce qui rend le barranquenho phonologiquement intéressant

Le barranquenho n'est un dialecte ni du portugais ni de l'espagnol ; c'est un système véritablement distinct. La municipalité de Barrancos a récemment publié trois documents fondateurs — un dictionnaire, une convention orthographique et une grammaire de base — qui ont fourni les règles dont nous avions besoin. L'annonce : ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

À partir de cette convention orthographique, nous avons dérivé l'ensemble de règles. Le phonémiseur effectue deux passes sur l'entrée mise en minuscules :

1. **Passe des digraphes** — regroupe les graphèmes de plusieurs lettres : `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/, et `qu`/`gu` devant les voyelles antérieures → /k//g/.
2. **Passe des graphèmes** — associe les caractères restants à l'IPA avec des règles sensibles au contexte : diphtongues nasales devant `m`/`n` (par exemple, `an` → /ɐ͂/), `e` en fin de mot → /ɨ/, `v` toujours → /b/, `s` sonorisé en /z/ sauf en début de mot, `r` vs `rr` (battue simple vs roulée), et `h` prononcé comme /h/ — contrairement à l'une ou l'autre des langues mères.

Le graphème `x` possède la logique la plus complexe, se rabattant sur les heuristiques contextuelles du portugais là où la convention barranquenha reste muette.

En pratique :

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ũ ẽjoɾmj pasu paɾɐ u bɐrɐ͂keɲu j paɾɐ ɐ kultuɾɐ bɐrɐ͂keɲɐ`

La bibliothèque est une fonction unique, `phonemize(word: str) -> list[str]`, sans dépendances à l'exécution — du Python pur. Les PDF sources (convention, dictionnaire, grammaire) sont inclus à la racine du dépôt afin que les règles soient vérifiables au regard de leur source.

### Ce qui vient ensuite

Un convertisseur G2P est le prérequis minimal pour tout travail de TTS et d'ASR. Sans lui, un modèle entraîné sur du texte n'a aucun ancrage phonétique rigoureux. Avec lui, le chemin vers un modèle de voix barranquenha suit le même pipeline hybride que celui que nous avons utilisé pour l'asturien et l'aragonais — l'obstacle, ce sont les données de parole, pas l'outillage.

**Si vous disposez d'enregistrements de barranquenho parlé ou si vous avez accès à des locuteurs disposés à contribuer sous une licence ouverte, contactez-nous.** Des enregistrements de locuteurs natifs, même quelques heures, rendraient un modèle de TTS viable.

→ [g2p_barranquenho sur GitHub](https://github.com/TigreGotico/g2p_barranquenho)
