---
title: "NLP classique pour le portugais : syllabation et graphème-vers-phonème"
description: "Un aperçu de notre stack de NLP portugais fondée sur des règles et entièrement hors ligne — silabificador pour la syllabation et TugaPhone pour la conversion graphème-vers-phonème sensible au dialecte — et de la façon dont elles se relient au travail plus large d'orthography2ipa pour les variétés lusophones. Aucune boîte noire de deep learning : déterministe, rapide et avec peu de dépendances."
date: 2026-02-28
updated: 2026-08-01
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

Les coupures de syllabes, la place de l'accent et les correspondances graphie-son en portugais suivent des règles que les linguistes ont documentées bien avant que quiconque n'entraîne un réseau de neurones. Lorsque ces règles sont explicites, le bon outil est une bibliothèque petite, déterministe et entièrement hors ligne que vous pouvez lire, auditer et exécuter partout. C'est là la philosophie de notre stack classique de NLP portugais : [silabificador](https://github.com/TigreGotico/silabificador) pour la syllabation et [TugaPhone](https://github.com/TigreGotico/tugaphone) pour la conversion graphème-vers-phonème (G2P).

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
pt-PT → ʃuˈvew ˈmũjtu ˈõtɐ̃j a ˈnojt
pt-BR → ʃoˈvew ˈmwĩtʊ ˈõtẽj a ˈnojtʃɪ
pt-AO → ʃoˈvew ˈmũjntʊ ˈõntẽj a ˈnojtɨ
pt-MZ → ʃoˈvew ˈmũjtu ˈõtẽj a ˈnɔjtɨ
pt-TL → ʃoˈvew ˈmujtʊ ˈõntɐ̃j a ˈnojtʰ
```

En coulisses, TugaPhone pilote le moteur partagé de treillis de candidats `orthography2ipa` et superpose les préoccupations propres au portugais via les points d'extension de ce moteur. Il consulte un lexique phonétique curé (le même Portuguese Phonetic Lexicon ci-dessus) pour les mots connus ; pour tout ce qui ne figure pas dans le lexique — noms, néologismes, emprunts étrangers — le treillis génère des candidats à partir des règles de graphèmes et d'allophones du dialecte.

Deux détails méritent d'être soulignés. La **normalisation des nombres** transforme les chiffres en leurs formes parlées en portugais, avec l'accord correct de genre et de nombre :

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
```

Il respecte même les conventions d'échelle — échelle longue `biliões` pour `pt-PT`, échelle courte `trilhões` pour `pt-BR`. La **désambiguïsation des homographes** est déléguée à la bibliothèque [bifonia](https://github.com/TigreGotico/bifonia), qui porte la connaissance, fondée sur le sens, des homographes hétérophones existants et de la lecture qu'ils portent — de sorte que `para` en tant que préposition est traité différemment de `para` en tant que verbe — et marque la lecture choisie avec des diacritiques supplémentaires avant même que le treillis ne voie la phrase.

TugaPhone phonémise en pilotant le treillis de candidats partagé `orthography2ipa` : le choix du dialecte *est* le choix de la spécification de lecte `orthography2ipa`, si bien que les phénomènes dialectaux — bêtacisme, diphtongues montantes de Porto, palatalisation du /l/ madérien, antériorisation du /u/ açorien, sandhi des sibilantes en coda, et bien d'autres — proviennent du treillis lui-même plutôt que de retouches de chaîne après coup. TugaPhone n'ajoute que ce que `orthography2ipa` laisse délibérément à l'appelant, câblé via ses propres points d'extension : l'expansion des nombres/ordinaux tenant compte du genre et le marquage des hétérophones de bifonia s'exécutent comme étape de normalisation du moteur avant que le treillis ne voie le texte ; le lexique de prononciation curé de **[Tugalex](https://github.com/TigreGotico/tugalex)** est enregistré par lecte via `orthography2ipa.register_lexicon`, de sorte qu'un mot couvert emprunte le même chemin de dérogation que les exceptions propres à une spécification, et le treillis ne génère des candidats que pour les mots que le lexique ne couvre pas ; la syllabation provient du plugin `orthography2ipa` propre, adossé à `silabificador`, de sorte que l'accent tombe sur la même syllabe que TugaPhone aurait autrement choisie. De petites pièces composables alimentant un moteur partagé — chacune utile en soi.

TugaPhone est honnête quant à ses limites : la couverture du lexique est plus clairsemée pour les dialectes africains et le timorais, les accents sous-régionaux (Porto, Minho, Braga, entre autres) sont des approximations expérimentales de traits documentés, et la prosodie au niveau de la phrase est simplifiée. Ce sont là des limitations documentées ouvertement, non des modes de défaillance cachés.

### Le tableau plus large : orthography2ipa

Le portugais n'est qu'une variété parmi bien d'autres, et le même patron d'ingénierie se généralise. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) est un paquet Python de données pures comportant des correspondances graphème→IPA et d'allophones linguistiquement motivées, couvrant 820 langues à travers plus de 20 familles linguistiques. Il trace une distinction nette dont tout système de G2P sérieux a besoin : une **carte de graphèmes** indique quels phonèmes une graphie *peut* représenter, tandis qu'une **carte d'allophones** indique comment un phonème *se réalise* effectivement dans un contexte donné. Les variétés régionales sont modélisées comme leurs propres spécifications, reliées par une filiation pondérée à ancêtres multiples, de sorte que les arbres dialectaux héritent de leurs parents au lieu de dupliquer les données.

C'est le même instinct qui sous-tend `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ` et `pt-TL` dans TugaPhone : traiter chaque variété lusophone comme un citoyen à part entière avec ses propres règles, et non comme une déviation d'un unique accent canonique. Les données sont déclaratives et la logique est mince et enfichable — vous pouvez lire les règles, citer leurs sources et faire confiance au résultat.

### Essayez-le

Tout ce qui figure ici est open source et installable dès aujourd'hui :

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

Pour les correspondances multilingues plus larges, voyez [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Déterministe, rapide, hors ligne et conçu pour toute l'ampleur du monde lusophone.

Cette stack de phonétique portugaise s'appuie sur notre **[travail de graphème-vers-IPA pour 820 langues](/fr/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, formant l'épine dorsale phonétique du **[TTS qui tourne sur une patate](/fr/blog/2026-05-10-tts-that-runs-on-a-potato)** et des **[voix multilingues Miro & Dii](/fr/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
