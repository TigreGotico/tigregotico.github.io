---
title: "Choisir un moteur de clonage vocal"
description: "voiceclonnx fait tourner 10 moteurs de conversion vocale derrière une seule API, du feature-swap kNN au codec-LM autorégressif. Voici un guide des familles de modèles derrière eux, le vrai compromis mesuré entre intelligibilité et similarité de locuteur, et comment choisir un moteur pour une tâche précise."
date: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "voice cloning"
  - "voice conversion"
  - "self-hosted"
draft: false
---

La conversion vocale prend un enregistrement et un locuteur de référence, et
produit les mêmes mots dans la voix du locuteur de référence. Aucun texte
n'intervient nulle part dans le pipeline : l'entrée est de l'audio, la sortie
est de l'audio, et le modèle ne lit ni n'écrit jamais de transcription. C'est
ce qui la distingue de la synthèse vocale (TTS), qui part du texte et n'a
aucun enregistrement source à préserver. La conversion vocale répond à une
question plus étroite : étant donné cet enregistrement, faites-le sonner
comme quelqu'un d'autre, tout en gardant les mots intacts.

Cette tâche plus étroite a des usages réels. Doubler un enregistrement dans
une voix cohérente sans engager un second comédien de doublage. Anonymiser
un locuteur dans une interview ou un appel de support tout en gardant les
mots verbatim. Donner à la sortie d'un système TTS une identité unique et
stable à travers les langues, quand les voix sous-jacentes pour chaque
langue ont été entraînées indépendamment et sonneraient sinon comme des
personnes différentes.

[`voiceclonnx`](https://github.com/TigreGotico/voiceclonnx) implémente 10 de
ces moteurs derrière une seule API Python, tous tournant sur `onnxruntime`
sans besoin de PyTorch à l'inférence. Les moteurs ne sont pas
interchangeables. Ils viennent de familles de modèles différentes, et en
choisir un revient à choisir un compromis, pas un gagnant.

## L'API, brièvement

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
print(cloner.sample_rate)   # 16000
```

`clone_voice(audio, reference_voice, out_path)` prend l'enregistrement
source, un clip de référence de 5 à 30 secondes du locuteur cible, et un
chemin de sortie, et retourne le chemin du WAV converti. Changer de moteur
revient à changer la chaîne `engine=` ; la forme de l'appel ne change pas.
Un moteur, `rvc`, fait exception — il prend un chemin vers un modèle vocal
`.onnx` plutôt qu'un enregistrement de référence, couvert plus bas.
`pip install voiceclonnx` récupère les 10 moteurs ; les modèles se
téléchargent depuis Hugging Face au premier usage.

## Deux axes, pas un seul score

Deux nombres décrivent la qualité d'une conversion, et ils ne bougent pas
ensemble.

**Le taux d'erreur au mot (WER)** mesure l'intelligibilité : quelle
proportion de la phrase originale a survécu, jugée en repassant la sortie
dans un système de reconnaissance vocale et en la comparant à la
transcription source. 0 % de WER signifie que chaque mot est passé
correctement.

**La similarité de locuteur** mesure l'identité : si la sortie sonne
réellement comme le locuteur cible, et non l'original. Elle est calculée en
extrayant un *embedding* de locuteur — une empreinte numérique compacte du
timbre d'une voix, la couleur tonale qui fait sonner une voix différemment
d'une autre à hauteur et volume égaux — de la sortie et du clip de
référence, puis en les comparant par similarité cosinus. Un score de 1,0
signifie un timbre identique ; la propre référence de base de
`voiceclonnx` — une copie non convertie de la source notée contre la cible
— se situe à 0,09, donc tout ce qui est significativement au-dessus fait un
vrai travail de conversion.

`voiceclonnx` publie les deux nombres pour chaque moteur, mesurés sur la
même phrase convertie vers deux voix de référence. Le WER vient de
`faster-whisper` ; la similarité de locuteur vient d'un modèle d'embedding
`wespeaker-resnet34` (recoupé avec deux autres). Mettez-les côte à côte et
un motif apparaît : aucun moteur ne domine les deux colonnes.

| Moteur | Famille | WER | Similarité cible |
|---|---|---|---|
| `focalcodec` | Feature-swap kNN | 15-19% | **0.61** |
| `lscodec` | Codec découplé du locuteur | ~35% | 0.54 |
| `chatterbox` | Codec-LM autorégressif | 4-8% | 0.54 |
| `knnvc` | Feature-swap kNN | 12-15% | 0.49 |
| `facodec` | Codec factorisé | **0%** | 0.44 |
| `openvoice` | Transfert de couleur tonale | **0%** | 0.37 |
| `bicodec` | Tokens sémantiques + globaux | 12% | 0.29 |
| `triaan` | Triple-AAN | 4% | 0.29 |
| `cosyvoice` | Flow-matching | 8% | 0.21 |

(`rvc` convertit toute source vers une voix fixe entraînée par la
communauté plutôt que vers un clip de référence arbitraire, il n'est donc
pas comparable dans ce tableau ; voir plus bas.)

Lisez le tableau ligne par ligne, sans chercher une seule meilleure ligne.
`facodec` et `openvoice` se situent à 0 % de WER — chaque mot survit — avec
une similarité modérée. `focalcodec` et `lscodec` se situent à l'autre
extrémité : le transfert de timbre le plus fort de l'ensemble, acheté en
laissant 15-35 % des mots sortir faux. `chatterbox` est le seul moteur qui
réussit bien sur les deux axes à la fois (4-8 % de WER, 0,54 de similarité),
ce qui est une propriété de son architecture, couverte ensuite.

## Pourquoi les familles se comportent différemment

Les moteurs se répartissent en approches distinctes, et l'approche prédit
où un moteur se situe dans le tableau ci-dessus.

**Feature-swap kNN** (`knnvc`, `focalcodec`). L'audio source est découpé en
courtes trames, chacune transformée en vecteur de caractéristiques par un
encodeur auto-supervisé préentraîné. Pour chaque trame source, l'algorithme
trouve les *k* trames les plus proches dans un réservoir de caractéristiques
du locuteur cible et les moyenne, remplaçant le timbre de la source trame
par trame tout en laissant le contenu phonétique sous-jacent là où il a été
extrait de la propre représentation de l'encodeur. Il n'y a pas de décodeur
appris faisant correspondre une voix à une autre — l'échange est une
recherche du plus proche voisin — ce qui explique pourquoi le transfert de
timbre peut être agressif (`focalcodec` atteint 0,61 de similarité) au prix
de trames occasionnellement corrompues quand la correspondance était
mauvaise dans le réservoir cible, ce qui se traduit en WER.

**Codec factorisé** (`facodec`). Un codec audio neuronal — un modèle qui
compresse la parole en une séquence de tokens compacte et la reconstruit —
entraîné à séparer explicitement ces tokens en flux de contenu et de timbre
distincts. Comme le contenu est un flux dédié, le décodeur reconstruit les
mots avec une haute fidélité ; seul le flux de timbre est échangé pour le
locuteur cible. Cette séparation explicite explique pourquoi `facodec`
atteint 0 % de WER : la préservation du contenu ne rivalise avec rien.

**Transfert de couleur tonale** (`openvoice`). Un module de conversion
change la couleur tonale — contour de hauteur et timbre — après qu'un
encodeur séparé a fixé le contenu linguistique, dans un esprit similaire à
l'approche du codec factorisé mais implémenté comme une étape de transfert
de couleur sur un mel-spectrogramme plutôt que sur des tokens discrets. Il
atteint lui aussi 0 % de WER, avec une similarité un peu plus faible que
`facodec`.

**Codec-LM autorégressif** (`chatterbox`). Un modèle de langage
autorégressif qui prédit les tokens de codec un à la fois, conditionné sur
l'embedding du locuteur cible, un peu comme un modèle de langage
texte-vers-parole mais conditionné sur les tokens de contenu de
l'enregistrement source plutôt que sur du texte. Parce qu'il génère la
prosodie (rythme, accent, intonation) dans le cadre du même processus
autorégressif plutôt qu'en la copiant directement depuis la source, il peut
transporter le style de parole avec le timbre — ce qui explique pourquoi la
documentation note qu'il donne le « changement source-vers-cible le plus
fort » — et c'est le seul moteur qui réussisse bien à la fois en
intelligibilité et en similarité.

**Flow-matching** (`cosyvoice`). Un processus génératif continu qui
raffine itérativement du bruit vers le mel-spectrogramme cible, en
utilisant un solveur d'EDO (équation différentielle ordinaire) exécuté un
nombre configurable de fois (`ode_steps`, 10 par défaut). Son encodeur de
contenu est conçu pour le transfert translinguistique, et cette généralité
explique probablement pourquoi son score de similarité cible est le plus
bas de l'ensemble : la représentation optimise pour l'indépendance à la
langue, pas pour la correspondance de locuteur la plus étroite.

**Codec découplé du locuteur** (`lscodec`). Comme `facodec`, un codec
entraîné à séparer le contenu de l'identité du locuteur, mais réglé pour
pousser plus loin la similarité, au prix direct de la précision du flux de
contenu, atterrissant à ~35 % de WER avec la deuxième plus haute similarité
de l'ensemble.

**Codecs Triple-AAN et sémantique-plus-tokens-globaux** (`triaan`,
`bicodec`) se situent au milieu sur les deux axes : WER modéré, similarité
modérée, aucun biais fort dans un sens ou l'autre.

**Codec any-to-ONE + vocodeur** (`rvc`). Construit sur ContentVec (un
encodeur de contenu) alimentant un vocodeur VITS, entraîné par voix cible
plutôt qu'accepter un clip de référence arbitraire. `reference_voice` pour
ce moteur est un chemin vers un fichier de modèle RVC `.onnx` ou un
identifiant de dépôt Hugging Face, pas un fichier audio :

```python
cloner = VoiceCloner(engine="rvc")
out = cloner.clone_voice("source.wav", "/path/to/myvoice.onnx", "out.wav")
```

Parce que chaque modèle RVC est entraîné sur une seule voix cible, il ne
prend pas de clip de référence à l'inférence et n'est pas noté sur le même
banc de similarité que les moteurs any-to-any. Son WER mesuré de 38 %
reflète un modèle échantillon entraîné par la communauté, pas
l'architecture en général — la qualité dépend de la manière dont ce modèle
spécifique a été entraîné. Des milliers de voix RVC communautaires existent
sur Hugging Face et se chargent directement par identifiant de dépôt.

## Décider lequel faire tourner

**Pipeline rapide et généraliste.** Commencez par `facodec` ou `openvoice`.
Les deux atteignent 0 % de WER mesuré avec une similarité modérée (0,44 et
0,37), et les deux livrent une variante quantifiée INT8 sans régression de
qualité listée — passez `quantized=True` pour un modèle plus petit et plus
rapide.

**Similarité de locuteur maximale.** Utilisez `focalcodec` (0,61 de
similarité, la plus haute mesurée) si le WER de 15-19 % est acceptable pour
le cas d'usage, ou `chatterbox` (0,54 de similarité, 4-8 % de WER) sinon.
`chatterbox` tourne aussi à 24 kHz, le taux de sortie le plus élevé pour la
conversion any-to-any de l'ensemble — `rvc` monte jusqu'à 48 kHz mais
seulement en mode any-to-ONE ci-dessus.

**Matériel à ressources limitées.** `knnvc` en INT8 pèse environ 123 Mo sur
disque, la plus petite empreinte de l'ensemble, avec 0,49 de similarité et
12-15 % de WER — un compromis raisonnable pour une mémoire contrainte. Tous
les moteurs ne se quantifient pas proprement : `focalcodec` et `cosyvoice`
sont documentés comme se dégradant en INT8, donc gardez ces deux-là en
fp32.

**Une langue sur laquelle le moteur n'a pas été entraîné.** L'encodeur de
contenu de `cosyvoice` est conçu pour le transfert translinguistique, ce
qui est la raison documentée de le préférer à un moteur réglé pour la
conversion intra-langue, même si sa similarité mesurée (0,21) est la plus
basse des neuf moteurs directement comparables.

**Identité vocale plutôt que formulation exacte.** `lscodec` offre le
transfert de timbre le plus fort parmi les moteurs de la famille codec
(0,54, à égalité avec `chatterbox`) au prix du WER le plus élevé de
l'ensemble comparable (~35 %). Choisissez-le quand l'objectif est « est-ce
que ça sonne comme le locuteur cible » et que des erreurs de mots
occasionnelles dans la sortie sont tolérables.

**Une seule voix communautaire fixe plutôt qu'un clip arbitraire.** `rvc`,
utilisant un modèle vocal `.onnx` préentraîné plutôt qu'un enregistrement de
référence.

**Contrainte non commerciale à vérifier d'abord.** Les poids de `bicodec`
sont sous licence CC BY-NC-SA 4.0. Les poids de tous les autres moteurs sont
MIT, Apache-2.0 ou CC BY 4.0. Vérifiez la licence du poids spécifique que
vous déployez avant de l'expédier commercialement.

## Ce qu'il ne fait pas bien, et sur qui il ne faut pas l'utiliser

Chaque nombre ci-dessus vient avec la même mise en garde : les nombres
décrivent une phrase de démonstration en anglais convertie entre deux voix
de référence spécifiques. Une langue différente, un enregistrement source
plus bruité, un clip de référence plus court ou de moindre qualité, ou un
locuteur source dont la voix est loin de tout ce qui figure dans les
données d'entraînement d'un moteur, feront tous bouger les nombres,
généralement en pire. Aucun de ces moteurs n'est un remède universel à un
enregistrement source de mauvaise qualité — plusieurs d'entre eux convertissent
volontiers le timbre tout en laissant passer directement le bruit source,
puisque le bruit a sa propre signature acoustique qu'une séparation
contenu/timbre ne sépare pas toujours proprement.

La conversion vocale soulève aussi un risque réel que sa proche cousine, le
clonage vocal pour la TTS, a déjà obligé cette équipe à prendre en compte :
convertir un enregistrement pour qu'il sonne comme une personne réelle et
identifiable est une technologie capable d'usurpation d'identité, que ce
soit ou non l'intention. La règle que cette équipe applique aux voix
synthétiques en général — obtenir une permission explicite avant d'utiliser
la voix d'une personne réelle comme donneuse ou cible, et se rabattre sur
des enregistrements du domaine public ou une voix délibérément originale
quand la permission n'est pas possible — s'applique ici sans exception. Un
clip de référence d'une personne réelle n'est pas différent, du point de
vue du consentement, d'un jeu d'entraînement complet de sa voix ; il en
faut simplement beaucoup moins pour produire un résultat utilisable, ce qui
est une raison d'être plus prudent, pas moins.

Contactez-nous via [contact](/fr/contact) ou consultez
[ce que nous proposons](/fr/services) si la conversion vocale fait partie
d'un pipeline que vous construisez.
