---
title: "Graphème-vers-IPA pour 676 langues"
description: "orthography2ipa est une ressource en données pures, ancrée linguistiquement, qui associe l'orthographe à l'IPA et modélise la façon dont les phonèmes se réalisent en tant qu'allophones à travers environ 750 spécifications de langue, 676 langues et plus de 20 familles linguistiques. Un treillis de candidats, une lignée dialectale et un ensemble de spécifications validé par schéma et cité à la littérature dialectologique — sans poids entraînés, entièrement auto-hébergeable."
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

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** est un paquet Python en données pures — JSON déclaratif, logique fine et enfichable, sans poids entraînés — qui associe l'orthographe à l'IPA et modélise la façon dont ces phonèmes se réalisent en contexte. Il fournit **environ 750 spécifications de langue couvrant 676 langues** (plus 73 nœuds de clade purement classificatoires) à travers **plus de 20 familles linguistiques**. Installez-le, lisez les données, forkez les données. Rien n'est caché dans un checkpoint.

C'est la couche phonologique qui sous-tend tout ce qui vient en aval : le treillis de candidats qu'il produit est consommé par le frontend TTS arabe [arbtok](https://github.com/TigreGotico/arbtok), les stacks portugais [TugaPhone](https://github.com/TigreGotico/tugaphone) et [silabificador](https://github.com/TigreGotico/silabificador) (voir **[NLP classique pour les syllabes et les phonèmes du portugais](/fr/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), le [phonémiseur du barranquenho](/fr/blog/2025-12-12-barranquenho), le phonémiseur du mirandais, et l'ancrage phonémique du **[TTS qui tourne sur une patate](/fr/blog/2026-05-10-tts-that-runs-on-a-potato)**.

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

Chaque langue est une dataclass `LanguageSpec` figée, et elle transporte bien plus qu'une liste de phonèmes : des graphèmes (y compris digrammes et trigrammes), une carte d'allophones, des **graphèmes positionnels** pour les substitutions sensibles au contexte (début de mot, intervocalique, avant /i/), une **ascendance** pondérée à ancêtres multiples, des **règles de sandhi** entre mots, un **inventaire tonal** optionnel et la provenance — un `QualityTier` qui parcourt `stub → skeleton → research → production`, un `ScriptType` (alphabet, abjad, abugida, …) et des sources bibliographiques avec renvois aux pages.

La règle d'inclusion est stricte et mérite d'être énoncée sans détour : **seuls les mappages ancrés dans l'orthographe officielle et la grammaire documentée sont admis. Les règles arbitraires de sous-chaînes sont exclues.** Le ⟨lh⟩ portugais, le ⟨sch⟩ allemand et le ⟨th⟩ anglais y figurent parce que ce sont des unités orthographiques standard. Les heuristiques commodes-mais-inventées n'y figurent pas. Lorsqu'une spécification déclare des graphèmes mais aucune carte d'allophones explicite, une carte d'identité de base est dérivée — chaque phonème est, au minimum, sa propre réalisation de surface — de sorte que rien ne disparaisse silencieusement.

Les variétés régionales ont leurs propres spécifications, plutôt qu'un simple drapeau sur un parent. Le portugais brésilien et le portugais européen divergent systématiquement, ils constituent donc des objets `LanguageSpec` distincts, reliés par l'ascendance :

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Les arbres de dialectes restent maintenables parce que les fichiers JSON prennent en charge l'héritage `graphemes_base` / `allophones_base` : une variante déclare uniquement ce qui diffère de son parent. La lignée est pondérée et à ancêtres multiples — parent, substrat, superstrat, adstrat — ce qui est la manière honnête de modéliser des langues qui sont des produits de contact plutôt que des descendants purs.

## Profond sur le terrain, pas seulement large

Le chiffre de 676 est l'ampleur ; la profondeur est là où réside le travail. Les spécifications descendent lecte par lecte là où le fait la littérature dialectologique, et chacune est citée à cette littérature avec des renvois aux pages plutôt qu'extraite par correspondance de motifs à partir d'une charte phonémique.

La couverture **ibérique** en est l'exemple le plus clair : **plus de 100 spécifications** pour les langues de la péninsule. Toutes les langues romanes d'Espagne — castillan, catalan/valencien, galicien (à la fois les normes de la RAG et réintégrationnistes), asturien, aragonais et ses variétés de vallée (ansotano, chistabín, benasqués…), estrémègne — aux côtés du basque, des créoles ibéro-romans, et des couches historiques que la plupart des ressources ignorent entièrement : l'**arabe andalou** et le **mozarabe**. Le versant arabe porte **34 lectes dialectaux** (du najdi et du hijazi jusqu'au levantin, au maghrébin et aux variétés péninsulaires), et le versant lusophone **46 lectes du portugais et des langues du Portugal**, jusqu'au rionorais, au guadramilais et aux sous-dialectes du mirandais.

À notre connaissance, plusieurs d'entre elles constituent la **première phonologie lisible par machine** jamais publiée pour la variété — le rionorais, le guadramilais, le benasqués, l'angolar, l'arabe andalou parmi elles — et le travail en aval fournit les **premiers dictionnaires IPA** pour le **barranquenho** et le **mirandais**.

## Un treillis de candidats, pas une supposition unique

L'orthographe n'est pas un problème de segmentation propre, c'est pourquoi l'architecture phare est un **treillis de candidats**. Le `PhonetokTokenizer` effectue une tokenisation de graphèmes en **maximal-munch** — préférant avidement l'unité orthographique correspondante la plus longue — et, sur la table de graphèmes de la spécification, produit un treillis par position de candidats IPA classés plutôt qu'une sortie unique et fragile :

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

Le treillis est le contrat sur lequel toute la famille en aval se construit. Un moteur spécifique à une langue consomme le treillis partagé et n'ajoute que la phonologie qu'une table statique ne peut exprimer, maintenant chaque consommateur sur le même noyau ancré :

- **[arbtok](https://github.com/TigreGotico/arbtok)** construit la phonologie du TTS arabe sur le treillis, ajoutant l'assimilation des lettres solaires, l'élision de la hamzat al-waṣl, la gémination et le traitement des ligatures — ainsi qu'une nouvelle **fusion rawi-treillis** qui restaure les voyelles brèves manquantes du texte dialectal non diacrité en scorant la distribution par caractère d'un ensemble *sous les licences du lecte demandé*, plutôt que de faire confiance à un générateur libre.
- **[TugaPhone](https://github.com/TigreGotico/tugaphone)**, **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** (mirandais) et **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** consomment tous le même lattice-core pour leurs variétés lusophones.

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

## Comment nous savons que les données valent quelque chose

Un « gold » G2P fiable existe à peine — la plupart des jeux de données publics sont la propre sortie d'un phonémiseur réutilisée comme référence, si bien qu'un faible taux d'erreur face à eux signifie « en accord avec cet outil », et non « correct ». Nous sommes explicites à ce sujet et avons construit une méthodologie de vérification autour de cela plutôt que de rapporter un seul chiffre flatteur.

Pour les variétés qui nous tiennent le plus à cœur, le gold est **rédigé, non extrait** : un ensemble de phrases épinglé à un moteur par lecte, jugé en **paires aveugles**, arbitré contre une **littérature avec renvois aux pages**, et réinjecté à travers des **classes de correction** dans une boucle de rétroaction du moteur — un désaccord entre la sortie du moteur et la forme corrigée est une piste vers un véritable bug de spécification. À travers le gold TTS épinglé au moteur et les attestations de sources primaires, il y a **plusieurs milliers de lignes vérifiées**. Le cadrage est délibérément honnête quant à la provenance : synthétique et arbitré par la littérature là où c'est tout ce qui existe, et véritable gold humain là où il existe — l'ensemble mirandais `mirandese_g2p` de locuteurs natifs, les attestations de sources primaires avec renvois aux pages, et les contributions natives. Les affirmations d'exactitude ne sont faites **que** face au gold humain ; un score parfait face au propre brouillon du moteur ne signifierait rien.

Les chiffres, à lire comme directionnels et toujours cités à leur source ([`docs/scoreboard.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/scoreboard.md), [`docs/benchmarks.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/benchmarks.md), et les documents de benchmark des dépôts en aval) :

- **Dialectes arabes, entrée nue non diacritée** — le cas difficile et réaliste en déploiement. Sur le gold TTS à entrée nue d'arbtok (33 lectes), la fusion rawi-treillis sous licence dialectale atteint un **PER moyen de 0,189**, battant le même ensemble exécuté comme générateur libre (0,193), la marge se concentrant sur les lectes qui divergent le plus du MSA. Sur la plupart des lectes, arbtok bat espeak-ng sur l'entrée nue ; sur le MSA lui-même, espeak — qui est calibré pour le MSA — l'emporte encore (espeak 0,176 vs arbtok 0,245).
- **Dialectes arabes, entrée diacritée** — avec les marques présentes, le PER d'arbtok se situe à **0,01–0,08** par lecte, bien en dessous de la voix MSA unique d'espeak (p. ex. najdi 0,009 vs espeak 0,221 ; égyptien 0,027 vs espeak 0,287). espeak n'a pas de voix dialectales, c'est donc honnêtement une comparaison entre choses de nature différente — mais l'écart est précisément le point.
- **Portugais, face au gold humain expert** — le portugais européen de Lisbonne atteint un **PER de 0,029** (88 % de correspondance exacte) sur des sources primaires avec renvois aux pages, et le gold mirandais de locuteurs natifs à **0,146**.

Chacun de ces chiffres est une propriété de l'état actuel des données, recoupée avec un intervalle de confiance bootstrap, et non un trophée de classement. Là où l'intervalle est large ou l'échantillon minuscule, le scoreboard le dit.

## La CLI

Tout ce qui précède est accessible sans écrire de Python. Le script de console `orthography2ipa` fournit `list`, `info`, `transcribe` et `distance`, et chaque sous-commande accepte `--json` pour l'acheminer dans une pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Pourquoi les données pures importent

L'ensemble complet des spécifications est validé par schéma — des dataclasses figées de style pydantic, balayées par une suite de tests d'intégrité, avec le `SCHEMA.md` qui en documente la forme. Là où une table statique ne peut véritablement pas exprimer les règles, une logique spécifique à la langue s'insère autour des données : les syllabifieurs s'enregistrent via un groupe d'entry-points, et les moteurs plus lourds se construisent sur le treillis partagé en aval.

Aucun modèle opaque ne décide de la façon dont sonnent les langues de vos utilisateurs. Les mappages sont auditables, les sources sont citées à la page, et ajouter une langue revient à écrire un unique fichier JSON validé — commencez par [`docs/adding_a_language.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/adding_a_language.md) et le [guide de démarrage](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/getting_started.md). Pour quiconque construit du TTS, de l'ASR ou du NLP phonétique et refuse d'externaliser sa phonologie vers une boîte noire — et qui veut la faire tourner sur son propre matériel — c'est là tout l'intérêt. C'est de l'Apache 2.0, et c'est à vous de l'inspecter, de l'étendre et de l'auto-héberger.
</content>
</invoke>
