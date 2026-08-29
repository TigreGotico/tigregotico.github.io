---
title: "Présentation du premier phonémiseur pour le barranquenho"
description: "g2p_barranquenho est le premier convertisseur graphème-phonème ouvert pour le barranquenho, la langue de contact ibéro-romane de Barrancos, au Portugal — des règles dérivées de la convention orthographique récemment publiée par la municipalité, vérifiables au regard des sources incluses dans le dépôt."
date: 2025-12-12
updated: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) est le premier convertisseur graphème-phonème ouvert pour le [barranquenho](https://en.wikipedia.org/wiki/Barranquenho), une langue de contact ibéro-romane parlée à Barrancos, au Portugal, une municipalité située à la frontière espagnole où le portugais et l'espagnol d'Estrémadure/d'Andalousie coexistent depuis des siècles.

### Ce qui rend le barranquenho phonologiquement intéressant

Le barranquenho n'est un dialecte ni du portugais ni de l'espagnol. C'est un système linguistique distinct. La municipalité de Barrancos a récemment publié trois documents fondateurs : un dictionnaire, une convention orthographique et une grammaire de base. Ils nous ont donné les règles dont nous avions besoin. Lisez l'annonce : ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

Nous avons dérivé l'ensemble de règles de cette convention orthographique. Plutôt que d'implémenter une passe artisanale sur mesure pour le texte, les règles vivent sous forme de spécification linguistique, `ext-PT-x-barrancos`, dans le moteur partagé **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)**. La table de graphèmes, les règles d'allophones, le modèle d'accentuation et le sandhi inter-mots de cette spécification décrivent chaque réalisation du barranquenho. Les graphèmes multi-lettres se regroupent comme la convention le documente : `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/. Les diphtongues nasales apparaissent devant `m`/`n`. `v` s'associe toujours à /b/, et `h` se réalise en un /h/ prononcé, contrairement à l'une ou l'autre des langues mères.

`g2p_barranquenho` lui-même est une fine enveloppe côté appelant autour de `orthography2ipa.G2P`, pilotée par cette spécification. Il gère la normalisation du texte (mise en minuscules, tokenisation dans les formes attendues par la spécification), l'expansion des nombres et une interface stable `phonemize`/`transcribe`, mais pas les règles phonologiques. Améliorer une règle signifie modifier la spécification en amont, de sorte que chaque consommateur en aval bénéficie du même correctif.

En pratique :

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ˈũ eˈnɔɾmi ˈpas̺u ˈpaɾɐ ˈu bɐrɐ̃ˈkɛɲu ˈi ˈpaɾɐ ɐ kuˈltuɾɐ bɐrɐ̃ˈkɛɲɐ`

Les PDF sources (convention, dictionnaire, grammaire) sont inclus à la racine du dépôt afin que les règles soient vérifiables au regard de leur source.

### Ce qui vient ensuite

Un convertisseur G2P est le prérequis minimal pour tout travail de TTS et d'ASR. Sans lui, un modèle entraîné sur du texte n'a aucun ancrage phonétique rigoureux. Avec lui, le chemin vers un modèle de voix barranquenha suit le même pipeline hybride que celui que nous avons utilisé pour l'asturien et l'aragonais. L'obstacle, ce sont les données de parole, pas l'outillage.

**Si vous disposez d'enregistrements de barranquenho parlé ou si vous avez accès à des locuteurs disposés à contribuer sous une licence ouverte, contactez-nous.** Des enregistrements de locuteurs natifs, même quelques heures, rendraient un modèle de TTS viable.

→ [g2p_barranquenho sur GitHub](https://github.com/TigreGotico/g2p_barranquenho)
