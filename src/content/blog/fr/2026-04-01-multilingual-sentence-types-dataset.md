---
title: "Un jeu de données multilingue de types de phrases : questions, ordres, affirmations"
description: "Nous avons publié sentence-types-multilingual — près de 70 000 phrases dans sept langues, classées par type grammatical (question, ordre, affirmation, exclamation). C'est le corpus d'entraînement derrière la bibliothèque de routage little_questions."
date: 2026-04-01
updated: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

La logique de routage d'un assistant vocal dépend de sa capacité à savoir quel type de phrase il a reçu avant même d'essayer de répondre à quoi que ce soit. Une question appelle une réponse. Un ordre appelle une exécution. Une affirmation peut nécessiter un accusé de réception ou un stockage. Réussir cette classification, dans n'importe quelle langue que parle l'utilisateur, est le prérequis de tout le reste.

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** est le corpus d'entraînement derrière cette couche : 69 300 phrases annotées, 9 900 pour chacune des sept langues (anglais, espagnol, français, allemand, italien, portugais et néerlandais).

## Ce que signifient les étiquettes en pratique

Le jeu de données utilise un ensemble plat de six étiquettes : une seule colonne `label` par ligne, sans distinction type/sous-type. Ces étiquettes correspondent directement à la manière dont `little_questions` (la bibliothèque d'inférence qui consomme ces données) route les énoncés :

- **wh_question** : questions construites autour d'un mot interrogatif (quoi, où, qui, etc.).
- **polar_question** : questions oui/non. La taxonomie EAT (Expected Answer Type) au sein de `little_questions` ajoute 53 étiquettes fines de type de réponse (personne, localisation, quantité, définition, etc.) par-dessus les étiquettes de question, mais la classification du type de phrase est le premier filtre.
- **command** : formes impératives. Les ordres n'attendent pas de réponse. Ils attendent une action.
- **request** : demandes d'action polies ou indirectes, distinctes d'un impératif brut.
- **statement** : déclarative. Dans un contexte de dialogue, les affirmations portent souvent une polarité qui compte en aval. Un classificateur oui/non/peut-être est exécuté sur les affirmations pour interpréter les réponses à des questions antérieures.
- **exclamation** : énoncés marqués émotionnellement qui nécessitent un traitement différent de celui des déclaratives neutres.

```json
{
  "language": "en",
  "label": "wh_question",
  "text": "What time is it?"
}
```

## Pourquoi la couverture interlinguistique n'est pas triviale

La même intention communicative se manifeste différemment selon les grammaires :

- L'anglais marque les questions par l'inversion de l'ordre des mots. Le portugais et l'espagnol les marquent souvent par la seule ponctuation et l'intonation, laissant l'ordre des mots intact.
- L'allemand rejette les verbes en position finale de phrase de façons qui déplacent l'endroit où réside le signal de classification.
- Les langues romanes utilisent une morphologie impérative dédiée pour les ordres que l'anglais exprime avec le verbe à sa forme nue.

Un modèle entraîné uniquement sur l'anglais se trompe sur ces cas partout ailleurs. Des données parallèles et annotées dans les sept langues fournissent le signal interlinguistique dont les classificateurs par langue ont besoin. La même pipeline de génération s'étend à d'autres langues au fur et à mesure qu'elles sont ajoutées.

## La pile en aval

Les modèles entraînés sur ces données sont distribués au sein de **[little_questions](https://github.com/TigreGotico/little_questions)**, une bibliothèque hors ligne sans dépendances (numpy + onnxruntime) dotée de classificateurs ONNX par langue pour le type de phrase et d'un modèle de polarité oui/non pour 43 langues. Les modèles sont inclus dans la wheel elle-même pour l'anglais et téléchargés de façon paresseuse pour les autres langues. Les classificateurs de type de phrase sont publiés sous `TigreGotico/sentence-types` sur HuggingFace. Les classificateurs de type de réponse EAT sont entraînés en interne et ne sont pas publiés publiquement.

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` est la couche de routage en langage naturel pour OVOS et LILACS : déterminer si un énoncé est une question, un ordre ou une affirmation est la première décision de répartition que prend une pipeline vocale.

[**sentence-types-multilingual sur HuggingFace**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**little_questions sur GitHub**](https://github.com/TigreGotico/little_questions)
