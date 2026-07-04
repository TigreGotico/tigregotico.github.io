---
title: "Graphème-vers-IPA pour plus de 350 langues"
description: "orthography2ipa est une ressource en données pures, ancrée linguistiquement, qui associe l'orthographe à l'IPA et modélise la façon dont les phonèmes se réalisent en tant qu'allophones à travers plus de 350 codes de langue et plus de 20 familles linguistiques. Un tokeniseur maximal-munch, des métriques de distance phonologique et scripturale, une lignée dialectale et un ensemble de spécifications validé par schéma — sans poids entraînés, entièrement auto-hébergeable."
date: 2026-01-15
lang: fr
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** est un paquet Python en données pures — JSON déclaratif, logique fine et enfichable, sans poids entraînés — qui associe l'orthographe à l'IPA et modélise la façon dont ces phonèmes se réalisent en contexte à travers **394 spécifications de langue et plus de 20 familles linguistiques**. Installez-le, lisez les données, forkez les données. Rien n'est caché dans un checkpoint.

Il alimente tout ce qui vient en aval : les stacks spécifiques au portugais [silabificador](https://github.com/TigreGotico/silabificador) et [TugaPhone](https://github.com/TigreGotico/tugaphone) (voir **[NLP classique pour les syllabes et les phonèmes du portugais](/fr/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), le G2P du barranquenho et l'ancrage phonémique du **[TTS qui tourne sur une patate](/fr/blog/2026-05-10-tts-that-runs-on-a-potato)**.

## Deux cartes, pas une

La distinction cruciale : une **carte de graphèmes** vous dit quels phonèmes une orthographe *peut* représenter. Une **carte d'allophones** vous dit comment un phonème *se réalise* en contexte. Confondre les deux est le mode de défaillance le plus courant des systèmes de G2P.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

Le ⟨th⟩ anglais est véritablement ambigu entre /θ/ et /ð/ — c'est un fait d'orthographe-vers-phonème. Le /t/ anglais apparaît comme une occlusive simple, une occlusive aspirée, une occlusive glottale ou un battement selon l'endroit où il tombe — c'est un fait de phonème-vers-réalisation. Garder les deux séparés signifie que vous pouvez aller de *texte → candidats phonèmes* pour la transcription et de *phonème → réalisation de surface* pour la modélisation de la prononciation, sans que l'un corrompe l'autre. Pour le TTS, c'est la différence entre un accent crédible et un accent robotique ; pour l'ASR, c'est la différence entre un lexique qui correspond à ce que les gens disent réellement et un qui correspond au dictionnaire.

## Ce que chaque langue transporte

Chaque langue est une dataclass `LanguageSpec` figée, et elle transporte bien plus qu'une liste de phonèmes : des graphèmes (y compris digrammes et trigrammes), une carte d'allophones, des **graphèmes positionnels** pour les substitutions sensibles au contexte (début de mot, intervocalique, avant /i/), une **ascendance** pondérée à ancêtres multiples, des **règles de sandhi** entre mots, un **inventaire tonal** optionnel et la provenance — un `QualityTier` qui parcourt `stub → skeleton → research → production`, un `ScriptType` (alphabet, abjad, abugida, …) et des sources bibliographiques.

La règle d'inclusion est stricte et mérite d'être énoncée sans détour : **seuls les mappages ancrés dans l'orthographe officielle et la grammaire documentée sont admis. Les règles arbitraires de sous-chaînes sont exclues.** Le ⟨lh⟩ portugais, le ⟨sch⟩ allemand et le ⟨th⟩ anglais y figurent parce que ce sont des unités orthographiques standard. Les heuristiques commodes-mais-inventées n'y figurent pas. Lorsqu'une spécification déclare des graphèmes mais aucune carte d'allophones explicite, une carte d'identité de base est dérivée — chaque phonème est, au minimum, sa propre réalisation de surface — de sorte que rien ne disparaisse silencieusement.

Les variétés régionales ont leurs propres spécifications, plutôt qu'un simple drapeau sur un parent. Le portugais brésilien et le portugais européen divergent systématiquement, ils constituent donc des objets `LanguageSpec` distincts, reliés par l'ascendance :

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Les arbres de dialectes restent maintenables parce que les fichiers JSON prennent en charge l'héritage `graphemes_base` / `allophones_base` : une variante déclare uniquement ce qui diffère de son parent. La lignée est pondérée et à ancêtres multiples — parent, substrat, superstrat, adstrat — ce qui est la manière honnête de modéliser des langues qui sont des produits de contact plutôt que des descendants purs.

## Un tokeniseur qui admet l'ambiguïté

L'orthographe n'est pas un problème de segmentation propre, c'est pourquoi le paquet fournit le `PhonetokTokenizer`, un tokeniseur de graphèmes **maximal-munch** avec expansion IPA par beam-search. Il préfère avidement l'unité orthographique correspondante la plus longue, puis explore des transcriptions candidates classées lorsqu'une orthographe est ambiguë :

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

Plutôt que de parier sur une sortie unique, vous obtenez un faisceau (beam) scoré — exactement l'entrée que veut un lexique, un treillis (lattice) ou un reranker de prononciation en aval.

## Mesurer la distance entre les langues

Comme les données sont structurées plutôt que cuites dans des poids, vous pouvez comparer les langues directement. Les métriques de distance couvrent les dimensions inventaire, graphème, allophone et ascendance, plus une famille de distance scripturale distincte :

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Les vecteurs de caractéristiques sont également exposés, si bien qu'une paire quasi identique comme les deux standards portugais se situe à 0,04, tandis que les paires véritablement distantes se séparent nettement. C'est utile aussi bien pour les décisions de transfer learning que pour le bootstrapping de langues à faibles ressources et la dialectométrie.

## La CLI

Tout ce qui précède est accessible sans écrire de Python. Le script de console `orthography2ipa` fournit `list`, `info`, `transcribe` et `distance`, et chaque sous-commande accepte `--json` pour l'acheminer dans une pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Pourquoi les données pures importent

L'ensemble complet des spécifications est validé par schéma — des dataclasses figées de style pydantic, **394 spécifications** balayées par une suite de tests d'intégrité, avec le `SCHEMA.md` qui en documente la forme. Là où une table statique ne peut véritablement pas exprimer les règles, une logique spécifique à la langue s'insère autour des données : les syllabifieurs s'enregistrent via un groupe d'entry-points, et le G2P algorithmique plus lourd (comme notre tokeniseur d'arabe [arbtok](https://github.com/TigreGotico/arbtok), qui gère l'assimilation des lettres solaires, l'élision de la hamzat al-wasl et les formes de tanwin) s'appuie sur les mêmes spécifications en aval.

Aucun modèle opaque ne décide de la façon dont sonnent les langues de vos utilisateurs. Les mappages sont auditables, les sources sont citées, et ajouter une langue revient à écrire un unique fichier JSON validé. Pour quiconque construit du TTS, de l'ASR ou du NLP phonétique et refuse d'externaliser sa phonologie vers une boîte noire — et qui veut la faire tourner sur son propre matériel — c'est là tout l'intérêt. C'est de l'Apache 2.0, et c'est à vous de l'inspecter, de l'étendre et de l'auto-héberger.
