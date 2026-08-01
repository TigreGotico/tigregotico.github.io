---
title: "Le dire correctement : désambiguïser les hétérophones portugais pour la TTS"
description: "De nombreux mots du portugais européen s'écrivent de la même façon mais se prononcent différemment selon le sens — et se tromper de voyelle fait dire le mauvais mot à une voix de TTS. Nous avons construit bifonia-pt-homographs, un jeu de données ouvert étiqueté par sens de 56 891 phrases sur 27 mots, et un résolveur minuscule et sans aucune dépendance qui atteint ≈94 % là où les étiqueteurs morphosyntaxiques lourds plafonnent à ≈75 %."
date: 2026-06-12
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Portuguese"
  - "TTS"
  - "Grapheme-to-Phoneme"
  - "NLP"
  - "Accessibility"
  - "FOSS"
draft: false
---

## Le dire correctement : désambiguïser les hétérophones portugais pour la TTS

Quand une voix de synthèse lit « Tenho sede », un auditeur portugais s'attend à
entendre *soif*. Mais la même orthographe exactement, `sede`, peut aussi signifier
*siège social* — et les deux se prononcent avec des voyelles différentes. Dites-le
avec la mauvaise voyelle et la voix ne sonne pas seulement bizarrement ; elle prononce
un mot différent à voix haute. Pour quelqu'un qui dépend de la TTS pour lui lire
l'écran, c'est la frontière entre l'intelligible et le déroutant.

C'est un problème de front-end — l'étape graphème vers phonème qui décide *quels sons*
un mot représente, bien avant qu'un vocodeur neuronal ne transforme ces sons en audio.
Aucune quantité de qualité de vocodeur n'y remédie. Si le front-end choisit la mauvaise
prononciation, la voix articule le mauvais mot, nettement.

### Homographes hétérophones : même orthographe, son différent, sens différent

Le portugais européen regorge de mots orthographiés à l'identique mais prononcés avec
une qualité de voyelle différente — une voyelle *ouverte* contre une voyelle *fermée*
— où le bon choix dépend du **sens**, pas seulement de la grammaire. Quelques
exemples :

- **`sede`** — *soif* (e fermé, `ˈsedɨ`) contre *siège social / siège* (e ouvert, `ˈsɛdɨ`). Les deux sont des noms.
- **`forma`** — *moule / plat de cuisson* (o fermé, `ˈfoɾmɐ`, écrit *fôrma*) contre *forme / façon* (o ouvert, `ˈfɔɾmɐ`).
- **`molho`** — *sauce* (o fermé) contre *botte / fagot* (o ouvert).
- **`corte`** — *cour royale* (o fermé) contre *une coupe* (o ouvert).

Un système de TTS naïf s'engage sur une seule prononciation par orthographe. Il lit
donc *soif* avec la voyelle de *siège social* — à chaque fois — et l'auditeur entend le
mauvais mot.

### Pourquoi « il suffit d'étiqueter la catégorie grammaticale » ne fonctionne pas

La solution évidente est de faire tourner un étiqueteur morphosyntaxique (POS) sur la
phrase et de choisir la prononciation selon la catégorie grammaticale. Cela aide pour
certaines paires, mais cela échoue *par construction* dès que deux sens partagent la
même catégorie grammaticale.

Reprenons `sede`. *Soif* et *siège social* sont **tous deux des noms**. Un étiqueteur
POS les étiquette de manière identique — il n'y a aucun signal grammatical pour les
distinguer — de sorte qu'il ne peut jamais que deviner la lecture la plus fréquente.
Nous avons mesuré exactement cela : sur notre ensemble de test, spaCy comme Stanza
obtiennent **0 %** sur le sens *soif* de `sede`. Ils choisissent toujours *siège
social*. Le même plafond structurel apparaît sur `corte` (coupe contre cour), `forma`
(moule contre forme) et `molho` (sauce contre botte) : quand le sens se scinde à
l'intérieur d'une même catégorie grammaticale, la grammaire ne peut pas le voir.

### Le jeu de données : étiqueter le sens, pas la grammaire

Nous avons donc construit un jeu de données ouvert qui étiquette la chose qui compte
vraiment — le sens. **`bifonia-pt-homographs`** compte **56 891 phrases en portugais
européen** couvrant **27 homographes hétérophones**. Chaque phrase est étiquetée avec
le mot, son **sens**, sa catégorie grammaticale, sa prononciation IPA, et une forme à
diacritiques restaurés (par exemple *sêde* contre *séde*) qui rend la lecture voulue
non ambiguë sur la page.

La clé de regroupement est le sens — c'est tout l'intérêt. Un enregistrement unique
ressemble à ceci :

```json
{
  "word": "sede",
  "sense": "thirst",
  "pos": "NOUN",
  "ipa": "ˈsedɨ",
  "sentence": "Depois da corrida tinha tanta sede que bebi um litro de água."
}
```

Les prononciations ont été vérifiées par rapport au dictionnaire
[infopédia](https://www.infopedia.pt) (Porto Editora) plutôt que devinées, et les
partitions train/test sont stratifiées par `(word, meaning)` de sorte qu'un modèle en
aval — un BiLSTM, disons — voie chaque sens dans les deux moitiés. Il est publié sur
Hugging Face sous [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs).

### Jusqu'à quel point peut-on le résoudre ?

Avec des données étiquetées par sens, nous avons pu mesurer comment différentes
approches s'en tirent pour choisir le bon sens — et donc la bonne prononciation :

| Approche | Justesse |
| --- | --- |
| Toujours deviner le sens le plus fréquent | ≈53 % |
| POS spaCy → sens | ≈66 % |
| POS Stanza → sens | ≈75 % |
| Résolveur de règles + sens de `bifonia` | **≈94 %** |

Les approches fondées sur le POS plafonnent exactement où l'on s'y attend : elles
peuvent aiguiller par la grammaire mais jamais par le sens, si bien que les scissions à
l'intérieur d'une catégorie de noms restent hors de portée. Notre résolveur — la
bibliothèque [`bifonia`](https://github.com/TigreGotico/bifonia), légère et
**entièrement sans dépendances** — atteint **≈94 %**, et surtout atteint **100 %** sur
le cas `sede`/*soif* sur lequel les étiqueteurs POS obtiennent **0 %**.

Le point saillant n'est pas seulement le chiffre. C'est qu'un composant petit, rapide
et entièrement ouvert bat des étiqueteurs POS neuronaux lourds sur cette tâche — parce
qu'il résout le *sens*, pas seulement la grammaire. Pas de GPU, pas de téléchargement
de modèle, pas d'appel réseau.

### Pourquoi c'est important

Une prononciation correcte est fondamentale, pas cosmétique. Les lecteurs d'écran et
les assistants vocaux sont la manière dont les personnes aveugles et les utilisateurs
en tout-vocal lisent le monde, et un front-end qui prononce mal des mots courants
dégrade silencieusement chaque phrase qu'il touche. Corriger la désambiguïsation des
hétérophones à la source signifie que la voix dit ce que le texte veut dire.

Parce que le jeu de données est ouvert et que le résolveur est minuscule et
forkable, quiconque construit un front-end de TTS portugais peut réussir cela sans un
modèle géant — et la même approche se transpose proprement à une langue apparentée
comme le galicien, où la distinction voyelle ouverte/fermée crée le même piège. Les
données étiquetées font aussi double emploi : c'est exactement ce dont on a besoin pour
entraîner des modèles statistiques compacts, comme un classifieur par mot, pour les
équipes qui disposent du corpus et veulent un résolveur appris aux côtés du résolveur
fondé sur des règles.

### Essayez-le

Le jeu de données est sur Hugging Face à [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs), et le résolveur vit à [`bifonia`](https://github.com/TigreGotico/bifonia). Il s'insère dans le travail plus large sur la phonétique portugaise derrière **[le NLP classique pour le portugais](/fr/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** et **[la pile graphème vers IPA pour plus de 350 langues](/fr/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** — des pièces petites et déterministes qui font prononcer une langue à une voix comme ses locuteurs le font réellement.
