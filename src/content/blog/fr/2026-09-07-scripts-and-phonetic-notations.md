---
title: "Écritures et notations phonétiques : ce que convertit réellement scriptconv"
description: "Une plongée dans scriptconv, la bibliothèque sans dépendance qui détecte les systèmes d'écriture et convertit entre notations phonétiques. Couvre l'IPA, l'ARPABET et le X-SAMPA ; la détection de script ISO-15924 ; la translittération Buckwalter pour l'arabe ; la décomposition du hangeul en jamo ; et la conversion des kana, avec de vrais exemples exécutés et des limites honnêtement énoncées."
date: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "Linguistics"
  - "FOSS"
draft: false
---

Un dictionnaire de prononciation américain dit qu'un chat (*cat*) sonne
comme `K AE1 T`. L'Alphabet Phonétique International écrit le même son
`kæt`. Un système différent, tout ASCII, l'écrit `k"{t`. Les trois décrivent
exactement les mêmes deux phonèmes — un son « k » suivi d'un « a » bref
suivi d'un « t ». Rien n'a changé dans le son. Seul l'alphabet utilisé pour
le transcrire a changé.

Cela arrive constamment à quiconque combine des données de prononciation
provenant de plus d'une source. Un jeu de données de parole construit à
partir d'un dictionnaire américain utilise une notation. Un lexique
européen en utilise une autre. Un moteur de synthèse vocale en attend une
troisième. Avant que ces données puissent être fusionnées, cherchées ou
comparées, elles doivent être traduites d'un alphabet phonétique à un
autre — le même travail qu'un traducteur fait entre langues humaines, sauf
qu'ici les « langues » sont des façons d'écrire le son plutôt que des
façons d'écrire les mots.

`scriptconv` est une petite bibliothèque Python qui fait cette traduction,
plus une tâche connexe un cran au-dessus : déterminer dans quel système
d'écriture se trouve un morceau de texte avant même de pouvoir en faire
quoi que ce soit d'autre. Elle n'a aucune opinion linguistique — elle ne
devine pas comment un mot se prononce. Elle ne fait que déplacer des
symboles qui représentent déjà des sons connus d'une notation à une autre,
et elle identifie les scripts à partir des caractères eux-mêmes.

## Quelques termes, définis simplement

- **Script** : un système d'écriture — l'ensemble réel de caractères, comme
  le latin, le cyrillique ou le hangeul. Ce n'est pas la même chose qu'une
  langue : l'anglais, le français et le vietnamien utilisent tous le script
  latin, et le serbe peut s'écrire soit en cyrillique soit en latin.
- **Orthographe** : les règles conventionnelles d'écriture d'une langue
  spécifique dans un script — majuscules, accents, espacement.
- **Phonème** : une unité de son distincte dans une langue, comme le son
  « k » dans « chat ».
- **IPA** (Alphabet Phonétique International) : un alphabet standard pour
  écrire les sons précisément, indépendamment de l'orthographe normale
  d'une langue.
- **Translittération** : convertir un texte d'un script à un autre en
  faisant correspondre les caractères, dans le but de préserver
  exactement l'orthographe originale plutôt que la prononciation.
- **Romanisation** : translittération spécifiquement vers le script latin.

## Pourquoi les alphabets phonétiques tout-ASCII existent

L'IPA a besoin de caractères comme `ʃ`, `ʒ`, `ə` et `ˈ` qui ne sont pas sur
un clavier standard. C'était un vrai problème pendant des décennies
d'informatique, avant qu'Unicode ne soit universel et avant que la plupart
des polices, terminaux et formats de fichiers ne prennent en charge de
manière fiable le texte non-ASCII. Les chercheurs ont construit des
substituts tout-ASCII : l'ARPABET, développé pour le travail de
reconnaissance vocale sur l'anglais américain, et le X-SAMPA, un encodage
ASCII de l'IPA complet développé pour être sûr par email et sur les vieux
terminaux. Ce ne sont pas des curiosités historiques. L'ARPABET est encore
la notation utilisée par des dictionnaires de prononciation et des outils
de parole en anglais américain largement déployés, et le X-SAMPA apparaît
encore dans l'outillage linguistique qui a besoin de texte brut. Tout ce
qui lit ces données doit pouvoir lire cet alphabet.

`scriptconv` réalise la conversion réelle. Ceci est une sortie exécutée,
pas une description :

```python
from scriptconv import convert, arpa_to_ipa, ipa_to_arpa

convert("K AE1 T", "arpa", "ipa")
# 'kæt'

convert("HH AH0 L OW1", "arpa", "ipa")
# 'həloʊ'

convert("kˈæt", "ipa", "x-sampa")
# 'k"{t'

arpa_to_ipa("HH AH0 L OW1", stress=True)
# 'həlˈoʊ'

ipa_to_arpa("həlˈoʊ", stress=True)
# 'HH AH0 L OW1'
```

Les marqueurs d'accent survivent à l'aller-retour. L'ARPABET marque
l'accent avec un chiffre collé à la voyelle (`OW1`) ; l'IPA le marque avec
un `ˈ` placé avant la syllabe accentuée. `arpa_to_ipa(..., stress=True)`
transporte cette information, et la conversion inverse reconstruit
exactement les chiffres originaux.

L'IPA se situe au milieu de tout cela par conception. `scriptconv` traite
chaque notation comme un nœud dans un graphe et chaque convertisseur comme
une arête, et fait passer les conversions par l'IPA comme un hub plutôt
que d'écrire à la main un convertisseur pour chaque paire de notations
directement :

```python
from scriptconv import DEFAULT_GRAPH

[f"{e.src}->{e.dst}" for e in DEFAULT_GRAPH.route("arpa", "x-sampa")]
# ['arpa->ipa', 'ipa->x-sampa']
```

Neuf notations transcodent au total à travers ce hub : ARPABET, X-SAMPA,
Kirshenbaum, Lexique, Cotovía, RFE et mantoq, plus Buckwalter, couvert
ci-dessous.

## Détecter le script avant de faire quoi que ce soit d'autre

Avant qu'un logiciel puisse décider comment traiter un morceau de texte —
dans quelle direction le rendre, quel correcteur orthographique lancer,
quelle police choisir — il doit savoir dans quel script se trouve ce
texte. C'est une question différente de dans quelle langue il est. Le
script identifie le jeu de caractères ; la langue identifie le vocabulaire
et la grammaire. Le serbe, encore, peut être cyrillique ou latin.
L'ouzbek aussi. `scriptconv` détecte le script directement à partir des
caractères, et fait séparément correspondre un code de langue au script
dans lequel elle s'écrit conventionnellement :

```python
from scriptconv import detect_script, script_runs, lang_to_script, base_direction

detect_script("Здравствуйте")
# 'Cyrl'

detect_script("안녕하세요")
# 'Hang'

script_runs("привет hello")
# [('Cyrl', 'привет '), ('Latn', 'hello')]

base_direction("مرحبا hello")
# 'mixed'

lang_to_script("uzb_cyr")
# 'Cyrl'
```

`detect_script` retourne un code ISO 15924 — le registre de balises
standard à quatre lettres pour les scripts (`Cyrl` pour le cyrillique,
`Hang` pour le hangeul, `Latn` pour le latin, `Arab` pour l'arabe).
`script_runs` découpe un texte mixte en segments contigus par script, ce
dont un moteur de rendu a besoin pour décider, phrase par phrase, quelle
police et quelle direction de texte appliquer. `base_direction` rapporte si
une chaîne mixte se lit de gauche à droite, de droite à gauche, ou les
deux.

## Les cas difficiles : Buckwalter, le hangeul et les kana

Trois conversions de systèmes d'écriture reviennent assez souvent dans de
vrais pipelines pour que `scriptconv` traite chacune directement.

**Buckwalter**, pour l'arabe, est un schéma de translittération ASCII qui
fait correspondre chaque lettre et diacritique arabes à un caractère ASCII
spécifique, un-à-un, si bien que l'orthographe originale — y compris les
marques de voyelle que le texte natif omet le plus souvent — peut être
reconstruite exactement. Il existe parce que le script arabe est
malcommode à manier dans des pipelines et des outils construits autour de
l'ASCII : le tri, le diff, les expressions régulières et les formats de
texte plus anciens sont tous plus faciles dès que le texte est en ASCII
alphabet latin, à condition que la correspondance soit exacte et
réversible.

```python
from scriptconv import buckwalter_to_arabic, arabic_to_buckwalter

buckwalter_to_arabic("mrHbA")
# 'مرحبا'

arabic_to_buckwalter("مرحبا")
# 'mrHbA'

arabic_to_buckwalter("رحمٰن")
# 'rHm`n'
```

Le dernier exemple inclut l'alif poignard, un petit diacritique en exposant
utilisé dans une poignée de mots (`رحمٰن`, *rahman*) — Buckwalter a un
caractère ASCII spécifique (`` ` ``) réservé pour lui, distinct d'un alif
ordinaire, pour que la translittération ne confonde pas les deux.

**Le hangeul** ressemble à des blocs syllabiques, mais chaque bloc est un
regroupement composé de lettres individuelles (jamo) disposées en grille —
la manière dont « H », « A », « N » se combinent visuellement en un seul
glyphe pour « han » plutôt que d'être écrites de gauche à droite. Les
logiciels qui ont besoin des lettres individuelles — pour la recherche,
pour l'analyse phonologique, pour alimenter un système différent — doivent
les séparer à nouveau :

```python
from scriptconv.translit import decompose_hangul

decompose_hangul("한국")
# 'ㅎㅏㄴㄱㅜㄱ'

decompose_hangul("국민")
# 'ㄱㅜㄱㅁㅣㄴ'
```

Ce dernier exemple compte pour ce qu'il *ne fait pas* : 국민 (*gungmin*,
« citoyen ») se prononce avec une assimilation nasale, `[ɡuŋmin]`, mais
`decompose_hangul` retourne les lettres telles qu'écrites — `ㄱㅜㄱㅁㅣㄴ`,
non assimilées — parce que la décomposition est une arithmétique sur le
point de code Unicode, pas une règle phonologique. Elle vous dit ce qui a
été écrit, pas comment ça sonne.

**La conversion des kana** déplace entre les deux syllabaires du japonais,
hiragana et katakana, qui représentent les mêmes sons avec des caractères
différents à un décalage de point de code fixe :

```python
from scriptconv import hira_to_kana, kana_to_hira

hira_to_kana("こんにちは")
# 'コンニチハ'

kana_to_hira("カタカナ")
# 'かたかな'
```

## Pourquoi cela vit dans sa propre bibliothèque

Un phonémiseur — un outil qui devine comment un mot écrit se prononce — a
besoin de jugement linguistique : règles d'accentuation, exceptions,
prononciation dépendante du contexte. `scriptconv` n'a délibérément rien de
tout cela. Chaque fonction ci-dessus est une recherche dans une table ou un
calcul de point de code : même entrée, même sortie, aucune supposition,
aucun modèle de langage, rien qui pourrait se tromper sur la manière dont
une langue spécifique sonne réellement. C'est ce qui la rend sûre à
partager entre chaque phonémiseur qui en a besoin, plutôt que chaque
phonémiseur réimplémentant sa propre table ARPABET avec ses propres bugs.
L'article sur la [stack de phonologie](/blog/2026-08-10-the-phonology-stack)
couvre comment les vrais moteurs de devinette de prononciation — ceux qui
portent effectivement des opinions linguistiques — sont construits par-dessus
cette couche plutôt que de la dupliquer.

## Là où la correspondance n'est pas exacte

Convertir entre notations n'est pas toujours sans perte, et `scriptconv`
enregistre cela comme donnée interrogeable plutôt que de le laisser comme
surprise. Chaque notation a deux propriétés suivies indépendamment : si la
convertir vers l'IPA puis revenir reproduit exactement les symboles
originaux, et si l'IPA convertie vers elle puis ramenée reproduit chaque
symbole IPA.

L'ARPABET échoue dans les deux sens : il a un inventaire de phonèmes
restreint et spécifique à l'anglais, donc aller IPA → ARPABET → IPA peut
perdre des distinctions que l'IPA peut faire mais pour lesquelles la table
de l'ARPABET n'a pas de symbole. Le X-SAMPA et le Lexique couvrent
fidèlement l'inventaire IPA complet mais ne sont pas garantis de faire
l'aller-retour proprement depuis leur propre côté. Kirshenbaum et
Buckwalter font l'aller-retour proprement depuis leur propre côté vers
l'IPA mais pas l'inverse. Mantoq, l'alphabet phonétique du phonétiseur
arabe Halabi, ne convertit que dans un sens, vers l'IPA — il n'y a pas de
convertisseur retour. Rien de tout cela n'est enfoui dans une docstring
quelque part ; ce sont des données que la bibliothèque expose pour qu'un
appelant puisse vérifier avant de supposer qu'un aller-retour est sûr.

---

Si vous assemblez des données de prononciation provenant de plusieurs
sources, ou avez besoin de détecter des scripts et normaliser du texte
avant qu'il n'atteigne un phonémiseur, [contactez-nous](/contact) ou voyez
ce que nous construisons d'autre dans ce domaine sur la
[page services](/services).
