---
title: "NLP classique pour le portugais : syllabation et graphème-vers-phonème"
description: "Un aperçu de notre stack de NLP portugais fondée sur des règles et entièrement hors ligne — silabificador pour la syllabation et TugaPhone pour la conversion graphème-vers-phonème sensible au dialecte — et de la façon dont elles se relient au travail plus large d'orthography2ipa pour les variétés lusophones. Aucune boîte noire de deep learning : déterministe, rapide et avec peu de dépendances."
date: 2026-02-28
lang: fr
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

Tous les problèmes de langue ne nécessitent pas un milliard de paramètres. Une grande partie du traitement de texte en portugais est régie par des règles que les linguistes ont couchées sur le papier bien avant que quiconque n'entraîne un réseau de neurones — des règles sur l'endroit où les syllabes se coupent, sur la place de l'accent et sur la manière dont une graphie donnée se traduit en son. Lorsque ces règles sont explicites, le bon outil est une bibliothèque petite, déterministe et entièrement hors ligne que vous pouvez lire, auditer et exécuter partout. C'est là la philosophie de notre stack classique de NLP portugais : [silabificador](https://github.com/TigreGotico/silabificador) pour la syllabation et [TugaPhone](https://github.com/TigreGotico/tugaphone) pour la conversion graphème-vers-phonème (G2P).

### Pourquoi le classique, et pourquoi maintenant

La phonétique est l'un des domaines où les règles déterministes brillent véritablement. Les règles de frontière de la syllabation portugaise et les régularités de son orthographe sont bien documentées : un moteur de règles conçu à la main produit donc des transcriptions que vous pouvez inspecter ligne par ligne. Pas de GPU, pas de téléchargement de modèle, pas d'appel réseau. Cela compte pour la souveraineté des données : une pipeline vocale lusophone ne devrait pas avoir à envoyer son texte vers une API distante juste pour découvrir comment prononcer un mot. Cela compte aussi pour la vitesse et l'empreinte — ces bibliothèques ont peu de dépendances et tournent avec la même facilité sur un ordinateur portable, un serveur ou un appareil embarqué.

### silabificador : frontières de syllabes

`silabificador` est un syllabateur portugais léger, construit entièrement à partir de règles conçues à la main, **sans dépendances**. L'interface est aussi réduite qu'elle en a l'air :

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

Il a été ajusté et testé sur des données propres du [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org), et évalué sur le [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon) — un jeu de données ouvert de plus de 100 000 entrées issues de la même source. La segmentation syllabique est une étape fondamentale pour l'attribution de l'accent, la césure et la transcription phonémique : bien la faire, et vite, porte ses fruits partout en aval.

### TugaPhone : graphème-vers-phonème sensible au dialecte

`TugaPhone` transforme un texte portugais quelconque en IPA, et il le fait à travers les principaux dialectes lusophones : européen (`pt-PT`), brésilien (`pt-BR`), angolais (`pt-AO`), mozambicain (`pt-MZ`) et timorais (`pt-TL`). Fait crucial, il préserve la variation dialectale au lieu de tout niveler vers un unique « standard ». La même phrase ressort différemment selon l'endroit où elle est parlée :

```
Choveu muito ontem à noite.
pt-PT → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈoj·tɨ
pt-BR → ʃo·ˈvew mwˈĩ·tʊ ˈõ·tẽ ˈa nˈoj·tʃɪ
pt-AO → ʃo·ˈvew mˈũjn·tʊ ˈõ·tẽ ˈa nˈoj·tɨ
pt-MZ → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈɔj·tɨ
pt-TL → ʃo·ˈvew mˈuj·tʊ ˈõ·tẽ ˈa nˈojtʰ
```

En coulisses, TugaPhone est un **hybride** de deux techniques classiques. Il consulte d'abord un lexique phonétique curé (le même Portuguese Phonetic Lexicon ci-dessus) pour les mots connus ; pour tout ce qui ne figure pas dans le lexique — noms, néologismes, emprunts étrangers — il se rabat sur un moteur de G2P fondé sur des règles. La pipeline est explicite à chaque étape : normalisation du texte, étiquetage morphosyntaxique optionnel, consultation du lexique, recours aux règles, puis transformations spécifiques au dialecte.

Deux détails méritent d'être soulignés. La **normalisation des nombres** transforme les chiffres en leurs formes parlées en portugais, avec l'accord correct de genre et de nombre :

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
normalize_numbers("1ª vez")                # primeira vez
```

Il respecte même les conventions d'échelle — échelle longue `biliões` pour `pt-PT`, échelle courte `trilhões` pour `pt-BR`. La **désambiguïsation des homographes** utilise le contexte morphosyntaxique, de sorte que `para` en tant que préposition est traité différemment de `para` en tant que verbe. TugaPhone peut recourir à un tagger spaCy ou Brill lorsqu'il est disponible, mais il embarque aussi une solution de repli fondée sur des règles et sans dépendances, restant fidèle au principe « hors ligne d'abord ».

L'architecture est une hiérarchie propre — phrase → mot → graphème → caractère — avec des règles sensibles au contexte appliquées à chaque niveau : qualité vocalique et allophones consonantiques au niveau du caractère, digrammes comme ⟨ch⟩ et ⟨nh⟩ et diphtongues comme ⟨ai⟩ et ⟨ou⟩ au niveau du graphème, accent et syllabation au niveau du mot. TugaPhone réutilise `silabificador` pour la couche syllabique, aux côtés des bibliothèques compagnes **[Tugalex](https://github.com/TigreGotico/tugalex)** (lexique et exceptions) et **[TugaTagger](https://github.com/TigreGotico/tugatagger)** (étiquetage morphosyntaxique). De petites pièces composables — chacune utile en soi.

TugaPhone est honnête quant à ses limites : la couverture du lexique est plus clairsemée pour les dialectes africains et le timorais, les accents sous-régionaux (Porto, Minho, Braga, entre autres) sont des approximations expérimentales de traits documentés, et la prosodie au niveau de la phrase est simplifiée. Ce sont là des limitations documentées ouvertement, non des modes de défaillance cachés — exactement le type de transparence qu'un système fondé sur des règles rend possible.

### Le tableau plus large : orthography2ipa

Le portugais n'est qu'une variété parmi bien d'autres, et le même patron d'ingénierie se généralise. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) est un paquet Python de données pures comportant des correspondances graphème→IPA et d'allophones linguistiquement motivées, couvrant plus de 350 codes de langue à travers plus de 20 familles linguistiques. Il trace une distinction nette dont tout système de G2P sérieux a besoin : une **carte de graphèmes** indique quels phonèmes une graphie *peut* représenter, tandis qu'une **carte d'allophones** indique comment un phonème *se réalise* effectivement dans un contexte donné. Les variétés régionales sont modélisées comme leurs propres spécifications, reliées par une filiation pondérée à ancêtres multiples, de sorte que les arbres dialectaux héritent de leurs parents au lieu de dupliquer les données.

C'est le même instinct qui sous-tend `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ` et `pt-TL` dans TugaPhone : traiter chaque variété lusophone comme un citoyen à part entière avec ses propres règles, et non comme une déviation d'un unique accent canonique. Les données sont déclaratives et la logique est mince et enfichable — vous pouvez lire les règles, citer leurs sources et faire confiance au résultat.

### Essayez-le

Tout ce qui figure ici est open source et installable dès aujourd'hui :

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

Pour les correspondances multilingues plus larges, voyez [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Déterministe, rapide, hors ligne et conçu pour toute l'ampleur du monde lusophone.

Cette stack de phonétique portugaise s'appuie sur notre **[travail de graphème-vers-IPA pour plus de 350 langues](/fr/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, formant l'épine dorsale phonétique du **[TTS qui tourne sur une patate](/fr/blog/2026-05-10-tts-that-runs-on-a-potato)** et des **[voix multilingues Miro & Dii](/fr/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
