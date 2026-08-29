---
title: "Des modèles de TTS qui tournent sur une patate"
description: "phoonnx est un cadriciel de recherche pour la synthèse vocale basée sur VITS, conçu pour tourner confortablement sur du matériel bas de gamme. Pas de GPU, pas de cloud, pas de clé d'API : juste une voix ONNX d'environ 15,65 millions de paramètres et un CPU. Voici à quel point une bonne voix peut être petite, et comment nous les entraînons."
date: 2026-05-10
lang: fr
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "ONNX"
  - "VITS"
  - "self-hosted"
  - "OVOS"
draft: false
---

Une bonne synthèse vocale n'exige ni GPU ni abonnement cloud. Une voix naturelle et
multilingue peut tenir dans quelque chose
que vous auriez honte d'appeler un serveur : le genre de carte que vous gardez dans un
tiroir « au cas où ». Une patate.

[**phoonnx**](https://github.com/TigreGotico/phoonnx) est notre cadriciel de recherche
pour exactement cette cible : de petites voix basées sur VITS qui tournent
**entièrement hors ligne, sur CPU, sur du matériel bon marché**, et que nous pouvons
aussi *entraîner nous-mêmes* à partir de zéro.

## À quel point « petit » est-il petit ?

Mettons-y un vrai chiffre au lieu de faire de grands gestes. Nous avons récupéré une
voix phoonnx de production, la voix basque « Miro »
(`OpenVoiceOS/phoonnx_eu-ES_miro_espeak`), directement depuis Hugging Face et compté
les poids dans le graphe ONNX :

```python
import onnx, numpy as np
m = onnx.load("miro_eu-ES.onnx")
print(sum(int(np.prod(i.dims)) for i in m.graph.initializer))
# 15650459
```

**~15,65 millions de paramètres.** Voilà la voix entière : encodeur, décodeur, et
tout le reste, dans un fichier de 63 Mo. La voix féminine « Dii » de la même publication
compte *exactement le même* nombre, parce qu'elles partagent l'architecture VITS
standard de phoonnx. La personnalité réside dans les poids, pas dans une capacité
supplémentaire.

Pour situer : une seule couche d'un « petit » modèle de langue moderne peut porter
plus de paramètres que ce synthétiseur vocal tout entier, et il parle tout de même
couramment.

## Pourquoi VITS, et pourquoi ONNX

[VITS](https://arxiv.org/abs/2106.06103) est l'ossature de chaque voix phoonnx. C'est
une architecture de bout en bout : du texte (enfin, des phonèmes) en entrée, une forme
d'onde en sortie, sans vocodeur séparé à surveiller ni boucle autorégressive qui
avance échantillon par échantillon. Cette conception de bout en bout est précisément
ce qui la rend viable sur une patate : une seule passe avant, synthèse parallèle,
terminé.

Nous n'expédions pas PyTorch jusqu'à la périphérie. Les voix entraînées sont exportées
en **ONNX** et exécutées via [`onnxruntime`](https://onnxruntime.ai/) sur le **CPU**,
sans CUDA, sans GPU, sans roulette russe des pilotes. `onnxruntime` est un moteur
C++ compact et portable, et un graphe de 15 millions de paramètres est largement à la
portée de ce qu'un cœur de la classe Raspberry Pi mâche plus vite que le temps réel.

Le résultat est un assistant vocal qui continue de parler quand votre internet est en
panne, quand le fournisseur cloud a une interruption, ou quand vous n'avez tout
simplement jamais voulu que l'audio de votre maison quitte la maison en premier lieu.

## Les phonèmes, là où se cache l'intelligence

Un tout petit modèle acoustique peut se permettre d'être minuscule parce que phoonnx
fait le dur travail linguistique *en amont*, dans le phonémiseur. Un phonémiseur
(graphème vers phonème, ou G2P) convertit le texte écrit en la séquence d'unités
sonores que le modèle prononce réellement, de sorte que le réseau VITS n'ait jamais à
apprendre l'orthographe, seulement le son.

Notre travail sur les phonèmes s'appuie sur **[le graphème vers IPA pour plus de 350 langues](/fr/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** et sur **[la phonétique classique du portugais](/fr/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, ce qui permet d'entraîner des voix pour des langues à faibles ressources sans des semaines d'annotation experte.

phoonnx est délibérément agnostique quant au phonémiseur et en embarque une petite
armée : `espeak-ng`, [gruut](https://github.com/rhasspy/gruut),
[epitran](https://github.com/dmort27/epitran),
[misaki](https://github.com/hexgrad/misaki),
[transphone](https://github.com/xinjli/transphone) (qui puise dans les milliers de
langues cataloguées dans Glottolog), ainsi que des spécialistes comme
[mantoq](https://github.com/mush42/mantoq) pour l'arabe,
**[cotovia](https://github.com/TigreGotico/pycotovia)** pour le galicien, OpenJTalk
pour le japonais, et KoG2P pour le coréen.

Ils émettent de l'IPA, de l'ARPA, du
Pinyin, du Hangul, du Buckwalter : ce dont la langue a besoin. Il y a même un G2P
multilingue basé sur un modèle construit sur ByT5, exporté en ONNX comme tout le
reste.

Déléguer l'orthographe au phonémiseur est l'astuce qui permet à un modèle de 15
millions de paramètres de bien sonner dans une langue à faibles ressources qu'il n'a
jamais vue écrite.

## Un cadriciel pour *construire* des voix, pas seulement les exécuter

phoonnx n'est pas
seulement une boîte à outils d'inférence. Le cadriciel compagnon
[**`phoonnx_train`**](https://github.com/TigreGotico/phoonnx) est la façon dont nous
*fabriquons* les voix en premier lieu.

`phoonnx_train` couvre toute la pipeline :

- **Le prétraitement** d'un jeu de données de style LJSpeech en données d'entraînement
  phonémisées.
- **L'entraînement** du générateur VITS (ces ~15,65 M de paramètres) sur un seul GPU
  grand public ou milieu de gamme. Un modèle de cette taille ne nécessite pas de
  cluster d'entraînement.
- **L'exportation** du point de contrôle terminé en ONNX avec un seul script, prêt à
  être déposé directement dans `onnxruntime` sur un appareil.

Parce que la recette est ouverte et que les modèles sont petits, construire une voix
toute neuve pour une langue qui n'a *aucune* option ouverte hors ligne est un projet à
l'échelle d'un week-end, pas d'une bourse de recherche. C'est ainsi que nous comblons
les lacunes pour des langues mal desservies, notamment le basque, le mirandais, le
portugais européen et plus encore, plutôt que d'attendre qu'un fournisseur décide
qu'une langue est commercialement intéressante.

## Déjà câblé dans votre assistant

Vous n'avez pas à assembler tout cela à la main. phoonnx embarque un greffon natif
OpenVoiceOS, `ovos-tts-plugin-phoonnx`, qui récupère et charge les voix pour vous :

```json
"tts": {
  "module": "ovos-tts-plugin-phoonnx",
  "ovos-tts-plugin-phoonnx": {
    "voice": "OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone"
  }
}
```

Omettez le `voice` et il choisit le premier modèle qui correspond à votre langue. Pour
gérer les voix en dehors d'un assistant, il y a une CLI, `phoonnx-voices`, pour lister
les langues, parcourir les voix et pré-télécharger les modèles :

```bash
phoonnx-voices list-voices --lang pt-PT
phoonnx-voices download OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone
```

Et parce que phoonnx parle du VITS-sur-ONNX ordinaire, son moteur d'inférence exécute
aussi des voix entraînées par Piper, Mimic3, Coqui et MMS : **plus de mille langues et
voix** au total. Un petit moteur d'exécution, et un catalogue énorme, et rien de tout
cela ne téléphone à la maison.

## L'essentiel

Une technologie vocale qui vous respecte doit tourner *là où vous êtes*, sur votre
matériel, sous votre contrôle, avec le câble réseau débranché si vous le souhaitez.
phoonnx est notre pari que le chemin pour y arriver ne passe pas par des modèles plus
gros, mais par la bonne architecture rendue petite : VITS pour l'ossature, des
phonémiseurs astucieux pour porter la charge linguistique, ONNX pour la portabilité,
et un cadriciel d'entraînement ouvert pour que quiconque puisse faire grandir le
catalogue.

Quinze millions et demi de paramètres, tournant sur CPU, entraînés sur du matériel que
tout le monde peut posséder : voilà la pipeline d'entraînement derrière chaque voix
phoonnx.
