---
title: "Pourquoi nous accumulons les données : des catalogues extraits aux modèles de parole et de langage plus intelligents"
description: "Des données propres, typées et à la provenance bien établie sont la matière première de chaque modèle que nous livrons. Comment les catalogues que construisent nos scrapers deviennent des vocabulaires de biasing pour l'ASR, des classificateurs d'intention, des corpus NER synthétiques, des lexiques G2P, des voix TTS — et un carburant honnête pour les LLM."
date: 2026-07-04
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Data Collection"
  - "ASR"
  - "NLP"
  - "TTS"
  - "LLM"
  - "FOSS"
draft: false
---

Nous écrivons beaucoup sur *comment* nous extrayons les données — les
**[outils de reconnaissance](/fr/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**,
les **[transports anti-bot](/fr/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**,
les **[clients typés de métadonnées musicales](/fr/blog/2026-04-20-music-database-scrapers)**.
Une question légitime est *pourquoi*. Nous sommes une entreprise d'IA vocale ;
que faisons-nous à maintenir des scrapers pour des encyclopédies musicales et
des annuaires de radios ?

La réponse est que **les données sont en amont de tout ce que nous livrons**. Un
assistant vocal ne vaut que par les mots qu'il s'attend à entendre, les entités
qu'il sait reconnaître et les prononciations qu'il connaît. Rien de tout cela ne
provient de diagrammes d'architecture. Cela vient des données — et les données
intéressantes se trouvent rarement dans un jeu de données prêt à l'emploi. Elles
sont dispersées à travers le web public, dans des catalogues que des humains ont
passé des décennies à curer.

Voici ce qu'il advient de ces données une fois que nous les avons recueillies.

## Entités : le vocabulaire dont vit un assistant vocal

Dites « joue Sultans of Swing de Dire Straits » à un assistant. Avant qu'un
modèle puisse agir là-dessus, quelque chose doit savoir que *Sultans of Swing*
est un morceau et que *Dire Straits* est un artiste. Multipliez cela par chaque
artiste, album, station, podcast et genre qu'un utilisateur peut nommer, et vous
obtenez le véritable vocabulaire d'un assistant média — des centaines de
milliers d'entités nommées, dont aucune n'apparaît dans un corpus d'entraînement
NLP standard.

Nos clients média produisent exactement cela : des enregistrements typés avec
des identifiants canoniques, normalisés dans le schéma
**[mediavocab](https://github.com/TigreGotico/mediavocab)**.
Ces catalogues d'entités alimentent directement :

- **La correspondance d'intention par mots-clés** — les listes d'entités
  deviennent les gazetteers qui ancrent les requêtes média dans OpenVoiceOS.
- **Les classificateurs d'intention** — nos jeux de données d'intention média
  combinent des entités réelles extraites avec de la synthèse de phrases par
  templates et assistée par LLM, produisant des énoncés semblables à ceux que
  font les vrais utilisateurs, peuplés d'entités qui existent réellement. Les
  modèles ainsi entraînés gèrent la décision « est-ce une demande de lecture, et
  pour quoi ? » dans le pipeline média d'OpenVoiceOS.
- **Les corpus NER synthétiques** — la même recette se généralise : prenez un
  catalogue d'entités réelles, générez des phrases naturelles autour d'elles, et
  vous avez un jeu de données d'entités nommées étiqueté pour un domaine
  qu'aucun corpus académique ne couvre. Les entités sont réelles, donc la
  distribution est honnête ; les phrases sont synthétiques, donc le volume est
  celui dont vous avez besoin.

## Orienter la reconnaissance vocale vers les mots qui comptent

L'ASR à usage général est entraîné sur de la parole générale, il transcrit donc
*Dire Straits* en « dire straights » et massacre chaque nom de village
portugais. La solution n'est pas de réentraîner à partir de zéro — c'est le
**biasing** : donner au reconnaisseur le vocabulaire de votre domaine.

Les catalogues extraits sont ce vocabulaire. Concrètement :

- **Biasing par modèle de langage** — des LM n-gram ou à shallow fusion
  entraînés sur du texte riche en entités poussent le décodeur vers les mots du
  domaine. Le LM d'un assistant média devrait être entraîné sur des *titres de
  morceaux et des noms d'artistes*, et le nôtre peut l'être, parce que nous les
  avons — typés, dédupliqués, à la provenance propre.
- **Reconnaissance conditionnée par prompt** — les architectures plus récentes
  acceptent un prompt textuel ou une liste de contexte au moment de l'inférence.
  Alimenter la bibliothèque réelle de l'utilisateur — les entités que nos
  clients ont extraites — dans le contexte du reconnaisseur transforme un « nom
  propre méconnaissable » en « élément de vocabulaire connu ».
- **Données de fine-tuning** — là où le biasing ne suffit pas, les catalogues
  d'entités plus nos [voix TTS](/fr/blog/2026-05-10-tts-that-runs-on-a-potato)
  génèrent de la parole synthétique pour les phrases exactes qu'un déploiement
  ne doit surtout pas rater. C'est le
  [service de construction de jeux de données](/fr/services) que nous proposons
  commercialement, et il est construit sur le même pipeline ouvert.

## Prononciation : des dictionnaires crawlés au G2P et au TTS

Certains de nos crawls les plus précieux ne sont pas des catalogues d'entités
mais des **lexiques**. Crawler le dictionnaire Infopédia a produit
[infopedia-pt-ipa](https://huggingface.co/datasets/TigreGotico/infopedia-pt-ipa),
plus de 100 000 paires mot→IPA en portugais européen. Ce jeu de données :

- évalue et affine notre
  [stack G2P pour le portugais](/fr/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)
  fondée sur des règles,
- ancre la prononciation des [voix TTS](/fr/blog/2026-06-15-two-voices-every-language-miro-and-dii)
  afin qu'elles disent les mots comme les locuteurs le font réellement,
- et sert de germe à des ressources étiquetées par le sens comme notre
  [travail sur les hétérophones du portugais](https://github.com/TigreGotico/bifonia), où
  la même orthographe correspond à des sons différents selon le sens.

Les données d'orthographe-vers-son sont le recoin le moins glamour de la
technologie de la parole et celui qui décide le plus si une voix sonne native.
Personne ne vous remet ces données. Vous les crawlez, les nettoyez et les
publiez — pour que la prochaine équipe n'ait pas à le faire.

## Un carburant honnête pour les LLM

Tout ce qui précède s'applique aussi aux grands modèles de langage, avec une
torsion supplémentaire : **la provenance compte désormais plus que le volume**.
Le web ouvert est de plus en plus contaminé par du texte généré par des
modèles ; s'entraîner ou évaluer dessus recycle discrètement les sorties des
modèles d'hier. C'est pourquoi nous nous soucions des sources à la provenance
humaine propre — des décennies d'
[archives Usenet](/fr/blog/2026-07-01-usenet-and-remailers-in-2026), des
encyclopédies curées, des dictionnaires officiels — et pourquoi chaque jeu de
données que nous publions indique d'où provient chaque enregistrement.

Les catalogues structurés alimentent aussi les LLM au moment de l'*inférence* :
un dépôt d'entités typé et dédupliqué est exactement ce qu'une couche de
retrieval ou l'API d'outils d'un agent veut pour ancrer ses réponses. Des API
propres au-dessus de sources désordonnées ne sont pas qu'une commodité de
scraping — c'est la façon de garder un modèle de langage arrimé aux faits.

## Le pipeline, de bout en bout

Voici donc à quoi ressemble le tableau complet :

```
recon → resilient extraction → typed clients → normalised catalogues
      → gazetteers & intent data     (NLP)
      → biasing LMs & fine-tune sets (ASR)
      → lexicons & phoneme labels    (G2P / TTS)
      → provenance-clean corpora     (LLMs, retrieval)
```

Chaque étape est open source, chaque jeu de données est publié là où la licence
le permet, et le même pipeline qui répond aux besoins de nos propres modèles est
disponible [sous forme de prestation](/fr/services) pour les vôtres. Les
scrapers ne sont pas une quête annexe. Ils sont la carrière d'où toute la stack
est extraite.
