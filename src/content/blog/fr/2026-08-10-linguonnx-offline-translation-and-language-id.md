---
title: "linguonnx : traduction et identification de langue hors ligne sur ONNX"
description: "linguonnx traduit du texte et identifie des langues sur le CPU, sans torch et sans cloud. 184 modèles de traduction int8 et 5 modèles d'identification de langue, 586 langues atteignables, et un routeur qui enchaîne de petits modèles quand aucun modèle ne couvre une paire."
date: 2026-08-10
lang: fr
author: "Casimiro Ferreira"
tags:
  - "linguonnx"
  - "translation"
  - "language identification"
  - "ONNX"
  - "self-hosted"
  - "OVOS"
draft: false
---

[**linguonnx**](https://github.com/TigreGotico/linguonnx) est une bibliothèque
Python de traduction automatique et d'identification de langue. Elle tourne sur
`onnxruntime`, sur le CPU, hors ligne. Elle n'utilise torch à aucun moment : la
boucle de génération encodeur-décodeur, recherche en faisceau et cache KV
comprises, est écrite directement sur les graphes ONNX.

```bash
pip install linguonnx
```

```python
from linguonnx import load_translator, load_detector

tx = load_translator()
print(tx.translate("bom dia, como estás?", src="pt", tgt="en"))
# 'Good morning, how are you?'   via opus-mt-pt-en-int8, 172 MB

det = load_detector()
print(det.detect("Egun on, zer moduz?"))    # 'eu'
```

Elle est sous Apache-2.0 et ne télécharge aucun modèle que vous n'avez pas
demandé.

## Ce qui est livré

Le registre contient 369 entrées de traduction — fp32 et int8 de chaque modèle —
et 10 entrées d'identification de langue. `load_translator()` utilise int8 par
défaut, donc une installation standard route sur 184 modèles de traduction
quantifiés et 5 classifieurs quantifiés. Ce sont tous des conversions ONNX
publiées sous [`TigreGotico/`](https://huggingface.co/TigreGotico) sur
HuggingFace.

Sur le graphe par défaut, 586 langues sont atteignables. Ce nombre est figé dans
les tests, donc il reste vrai ou la compilation le signale.

Les classifieurs sont des exports ONNX de quatre modèles fastText : GlotLID, le
classique `lid.176`, OpenLID et OpenLID-v2. GlotLID étiquette 2102 *variétés*,
donc l'arabe familier revient en najdi (`ars`) et le chinois peut revenir en
cantonais. C'est de l'identification de dialecte quand vous la voulez, et
`collapse_varieties=True` quand vous n'en voulez pas.

## Une paire sans modèle est une chaîne de modèles

La plupart des paires de langues n'ont pas de modèle bilingue. Le routeur traite
un modèle comme un ensemble de capacités et non comme une arête fixe, et enchaîne
les sauts quand il le faut :

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — il est passé par le galicien
```

Sous cette politique, le portugais vers le basque passe par le galicien, sur deux
modèles Marian de 84 Mo et 153 Mo. Le pivot n'est jamais silencieux : la `Route`
arrive avec la traduction et dit quels modèles elle a utilisés et par quelles
langues elle est passée.

Une route n'est pas un fait figé sur une paire de langues. C'est ce que les
contraintes de l'appelant font du registre : changez le budget de taille ou la
préférence de sauts et la même paire peut pivoter par une autre langue, ou se
réduire à un seul saut par un grand modèle multilingue. La `Route` dit laquelle
vous avez obtenue.

Le classement préfère l'institution qui s'occupe de la langue. HiTZ entraîne le
basque, Proxecto Nós le galicien, Projecte AINA le catalan, AI4Bharat les paires
indiennes, Masakhane les paires ouest-africaines, TartuNLP les langues
finno-ougriennes. Un modèle du spécialiste gagne l'égalité contre un modèle
multilingue général.

## La politique à l'exécution, jamais à l'indexation

C'est la loi du registre : il liste tous les modèles publiés, quelles que soient
leur taille, leur licence ou leur note. Le filtrage et le classement se font à
l'exécution, dans le processus appelant, sous ses règles. Un modèle absent de
l'index ne peut pas être choisi du tout, donc l'index n'exclut rien.

L'appelant fixe la politique via `load_translator` : `max_model_mb`,
`oversize_fallback`, `count_cached_as_free`, `prefer`, `max_hops`, `precision`,
`model_cache_size`, `exclude_flagged` et `min_chrf`. Chacun se redéfinit aussi
appel par appel.

## Un plafond de taille préfère les petits modèles, il n'efface pas des langues

Un budget de taille est le bouton évident pour une petite machine, et son
implémentation évidente est fausse. Utilisé comme filtre, `max_model_mb=500`
réduit les 586 langues atteignables à 249, car la longue traîne vit dans les
grands modèles multilingues et aucune chaîne de petits modèles ne les remplace.

`oversize_fallback=True` transforme le budget en préférence :

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 586, et non 249
```

L'anglais vers le catalan reste sur le petit modèle, car un petit modèle existe.
L'anglais vers le tchouvache monte jusqu'à MADLAD, car MADLAD est le seul modèle
du registre qui a le tchouvache, et l'alternative n'est pas une route moins chère
mais aucune route. `waived_size_cap` dit quel plafond la route a dépassé, donc une
machine qui a budgété 500 Mo apprend qu'elle a téléchargé 4945 Mo.

Quatre règles gardent cela honnête. La recherche élargie ne tourne que pour la
paire restée vide. Le plafond monte d'une taille de modèle à la fois, donc une
paire servie par NLLB-200 et par MADLAD reçoit NLLB-200. Le plafond borne un
modèle, pas une route, donc une chaîne de deux sauts de modèles de 237 Mo est
trouvée par la recherche normale. Et l'escalade ne dépasse jamais le budget de
téléchargement.

## Atteignable n'est pas utilisable

`madlad400-3b-mt` couvre le tchouvache. Demandez-lui `en -> cv` et il répond en
russe : `"Good day, my friend."` revient en `"Добрый день, мой друг."`. Le
routage est correct — l'étiquette du tchouvache est une pièce SentencePiece
distincte — et le modèle écrit quand même la mauvaise langue.

Une entrée du registre porte donc `language_flags`, une langue à la fois, avec
l'observation derrière : l'entrée, la sortie, le verdict du détecteur
(`glotlid=ru`), la date et la méthode. Le tchouvache est atteignable et n'est pas
utilisable, et le registre dit les deux.

La qualité d'un modèle entier est notée de la même façon. Un champ `quality`
porte un score chrF contre la référence **humaine** FLORES-200 devtest, avec le
corpus, le mode de décodage et la taille d'échantillon à côté, car un score sans
taille d'échantillon à côté ne veut rien dire. L'absence du champ signifie non
mesuré, ce qui n'est pas la même chose que mauvais, et rien n'invente un nombre
pour un modèle non mesuré. Deux contrôles lèvent un drapeau : chrF sous 40 dans
l'une ou l'autre précision, et int8 en retard de plus de 2 chrF sur fp32.

Un drapeau n'enlève rien du registre. Il donne à `exclude_flagged=True` et à
`min_chrf=` matière à agir, et il donne à un humain une raison de lire :

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

Un balayage de tout le registre passe une phrase réelle dans chaque modèle
enregistré et échoue sur une sortie vide, une sortie faite seulement d'espaces,
ou une sortie identique à l'entrée. Les phrases d'exemple sont par langue source
et vérifiées à la main ; une langue sans exemple est sautée plutôt que testée
avec le texte d'une autre langue.

## Depuis OpenVoiceOS

[`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)
emballe la bibliothèque en deux plugins avec une seule installation : un
détecteur de langue (`opm.lang.detect`, id `ovos-lang-detect-plugin-linguonnx`)
et un traducteur (`opm.lang.translate`, id `ovos-translate-plugin-linguonnx`).
Les deux chargent leurs modèles au premier usage, et chaque argument de
`load_detector` et `load_translator` est accessible depuis `mycroft.conf`.

La bibliothèque documente le reste : [routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md)
pour les politiques et le budget de taille, [models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md)
pour le registre, et [licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
pour les niveaux de licence — les modèles GPL-3.0 et CC-BY-NC-4.0 existent dans
l'index et doivent être demandés par leur nom.
