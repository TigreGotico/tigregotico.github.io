---
title: "Comment s'articule notre pile de phonologie"
description: "Une visite architecturale de notre pile texte-vers-prononciation : scriptconv pour la notation, orthography2ipa comme moteur graphème-vers-IPA multilingue, des frontends spécifiques à chaque langue construits par-dessus pour le portugais, le basque, le mirandais, le barranquenho et l'arabe, et phonematcher pour la recherche fondée sur le son. Explique pourquoi ces couches existent, ce qu'est un treillis de candidats, et donne des sorties dialectales réelles."
date: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "Linguistics"
  - "FOSS"
draft: false
---

Prenez le mot anglais « read ». Écrit, il ne vous dit pas comment le prononcer. « I read the book yesterday » et « I read the book every day » utilisent les cinq mêmes lettres pour deux sons différents — l'un rime avec « red », l'autre avec « reed ». Un lecteur d'écran, un assistant vocal ou une barre de recherche qui ne regarde que l'orthographe ne peut pas faire ça correctement. Il faut raisonner sur la prononciation, pas seulement sur le texte.

Ce problème de raisonnement — transformer des mots écrits en les sons qu'ils représentent — est ce que résout notre pile de phonologie. Cet article cartographie la façon dont ses pièces s'assemblent, de la notation brute jusqu'aux moteurs de prononciation spécifiques à chaque langue et à la recherche fondée sur le son.

## Quelques termes, définis simplement

Quelques mots qui reviennent tout au long de l'article :

- **Graphème** : un symbole écrit — une lettre, ou une combinaison de lettres comme « ch ».
- **Phonème** : une unité de son distincte dans une langue, comme le son « k » de « cat ».
- **IPA** (alphabet phonétique international) : un alphabet standard pour noter les sons avec précision, indépendamment de l'orthographe d'une langue donnée. « Cat » s'écrit `kæt` en IPA.
- **G2P** (graphème-vers-phonème) : le problème général de conversion de l'orthographe en son.
- **Allophone** : une réalisation variante du même phonème selon le contexte — le « t » de « top » et le « t » de « stop » sont le même phonème en anglais mais se prononcent légèrement différemment.
- **Syllabation** : découper un mot en syllabes, par ex. « extraordinário » en `ex-tra-or-di-ná-ri-o`.
- **Homographe** : deux mots orthographiés de la même façon mais de sens différent ; un **homographe hétérophone** (ou hétérophone) est un homographe prononcé différemment selon le sens visé, comme « read »/« read » ci-dessus.
- **Morphologie** : la structure interne des mots — préfixes, racines, suffixes, flexions.
- **Étiquetage morphosyntaxique (POS tagging)** : étiqueter chaque mot d'une phrase comme nom, verbe, adjectif, etc.

## Le problème central

L'orthographe est un encodage à perte du son. Trois choses distinctes rendent l'inversion difficile :

1. **L'ambiguïté.** Les mêmes lettres peuvent correspondre à des sons différents selon le sens, la grammaire, ou la simple irrégularité (« read » ci-dessus ; l'anglais en est plein).
2. **Le dialecte.** Le même mot, dans la même langue, se prononce différemment selon d'où vient le locuteur. Le portugais européen et le portugais brésilien partagent l'orthographe mais pas les voyelles.
3. **La couverture.** La plupart des langues du monde n'ont aucun dictionnaire de prononciation curé professionnellement. Un système G2P qui ne fonctionne que par table de correspondance est un système qui ne fonctionne que pour une poignée de langues.

Toute tentative sérieuse de synthèse vocale, de données d'entraînement pour la reconnaissance vocale, ou de recherche sensible à la phonétique doit traiter ces trois aspects.

## Pourquoi la pile est en couches

La pile découpe le problème en couches qui n'ont pas besoin de se connaître entre elles :

- **Notation** — convertir entre alphabets phonétiques et écritures. Cela n'a rien à voir avec la phonologie d'une langue en particulier ; c'est de la traduction de symboles.
- **Phonologie** — associer l'orthographe à l'IPA pour une langue donnée, à l'aide d'une spécification du système sonore de cette langue.
- **Traitement des exceptions spécifiques à la langue** — les mots irréguliers, les particularités dialectales, les homographes et la structure morphologique qu'un moteur général ne peut pas déduire des seules règles orthographiques.

Garder ces couches séparées est une décision de conception, pas un accident, et cela a un bénéfice direct : ajouter une nouvelle langue signifie écrire une **spécification** (des données décrivant son système sonore), pas un nouveau programme. Le moteur qui consomme la spécification, la recherche dans le treillis, le tokeniseur, les métriques de distance — rien de tout cela n'est réécrit. La couche de notation en dessous est partagée par toutes les langues, y compris celles dont le moteur de phonologie n'a jamais entendu parler.

### La couche de notation : scriptconv

[scriptconv](https://github.com/TigreGotico/scriptconv) est un noyau sans dépendance pour la notation phonétique et le traitement des écritures : détection d'écriture ISO-15924, conversions IPA vers et depuis ARPABET, X-SAMPA, Lexique, Kirshenbaum, Cotovía et la notation RFE, translittération Buckwalter pour l'arabe, décomposition du hangul en jamo, et traitement des kana. Rien de tout cela n'exige de savoir à quelle langue appartient un mot — une chaîne de phonèmes en IPA se convertit en ARPABET de la même façon quelle que soit la langue source :

```python
>>> import scriptconv as s
>>> s.ipa_to_arpa("kæt")
'K AE T'
>>> s.ipa_to_xsampa("kæt")
'k{t'
```

Chaque couche au-dessus de celle-ci peut supposer que la conversion de notation est déjà résolue.

### Le moteur : orthography2ipa

[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) est le moteur multilingue. Il prend une spécification de langue — une description déclarative des règles graphème-vers-phonème de cette langue — et un morceau de texte, et produit de l'IPA. Au moment d'écrire ces lignes, il fournit des spécifications couvrant **820 langues** (`available_codes()` sur le paquet installé renvoie une liste de cette longueur ; considérez ce chiffre exact comme une cible mouvante, puisque des spécifications sont ajoutées au fil du temps).

```python
>>> import orthography2ipa as o
>>> len(o.available_codes())
820
```

Le moteur lui-même n'embarque aucun code spécifique à une langue. Une nouvelle langue est un nouveau fichier de spécification, validé contre le même schéma que toutes les autres spécifications.

## Le treillis : des candidats classés, pas une seule supposition

Étant donné le problème d'ambiguïté ci-dessus, s'engager sur une seule sortie par mot est souvent une erreur. orthography2ipa produit à la place un **treillis** — un ensemble de prononciations candidates classées — et laisse les couches supérieures le restreindre à l'aide d'un contexte que le moteur lui-même n'a pas (le sens, la catégorie grammaticale, une entrée de lexique).

Reprenons « read » :

```python
>>> from orthography2ipa import G2P
>>> g = G2P("en")
>>> g.transcribe("read")
'ɹiːd'
>>> g.candidates("read")
[IPAPath('ɹiːd', score=0.0), IPAPath('ɹɛd', score=1.0)]
```

Sans plus de contexte, le moteur renvoie sa meilleure estimation (présent, coût plus faible) mais conserve l'alternative (passé) dans le treillis avec son coût associé. Un composant en aval qui sait que la phrase est au passé peut choisir le second candidat plutôt que le premier. C'est la même idée utilisée, à plus grande échelle, par bifonia (ci-dessous) pour les hétérophones portugais : un treillis générique fournit des candidats, une couche plus étroite et mieux informée choisit parmi eux.

## Les dialectes sont des citoyens de première classe

Deux locuteurs de la même langue peuvent prononcer la même phrase différemment, et une pile de phonologie qui traite « le portugais » comme un système sonore unique et figé se trompera pour tous les dialectes sauf un. orthography2ipa expose directement le traitement des dialectes — `available_profiles()` sur le paquet installé liste des profils de dialecte et de lecte tels que `lisbon`, `porto`, `estremenho`, `galician`, et d'autres — et [tugaphone](https://github.com/TigreGotico/tugaphone), le frontend portugais construit dessus, phonémise la même phrase à travers les variétés lusophones. Voici une phrase exécutée à travers les cinq dialectes pris en charge :

| Dialecte | Sortie |
|---|---|
| pt-PT (Portugal) | `ˈbõ ˈdiɐ ˈkomu eˈʃta vɔˈse` |
| pt-BR (Brésil) | `ˈbõ ˈdʒiɐ ˈkɔ̃mʊ eˈsta voˈse` |
| pt-AO (Angola) | `ˈbõ ˈdiɐ ˈkomʊ eˈsta vɔˈse` |
| pt-MZ (Mozambique) | `ˈbõ ˈdiɐ ˈkomu eˈsta vɔˈse` |
| pt-TL (Timor-Leste) | `ˈbõ ˈdiə ˈkoɔmʊ eˈsta vɔˈse` |

(« Bom dia, como está você? » — « Bonjour, comment allez-vous ? ») Le squelette consonantique reste reconnaissable sur les cinq, mais deux marqueurs bien connus les distinguent immédiatement. Dans « dia », le portugais brésilien transforme le `d` devant un `i` en `dʒ`, le son du début de l'anglais « jam » — les autres gardent un `d` simple. Dans « está », le portugais européen prononce le `s` en fin de syllabe comme `ʃ`, le « sh » de « shoe », tandis que toutes les autres variétés gardent `s`. Un dictionnaire de prononciation construit à partir des règles d'un seul dialecte se trompe sur ces deux points pour l'auditeur de chaque autre dialecte.

[euskaphone](https://github.com/TigreGotico/euskaphone) fait de même pour les dialectes basques, construit directement sur le treillis d'orthography2ipa plutôt que sur un moteur séparé :

```python
>>> from euskaphone import EuskaPhonemizer
>>> EuskaPhonemizer().phonemize_sentence("Kaixo, zer moduz zaude?")
'kai̯ʃo s̻er modus̻ s̻au̯de'
```

## Les frontends spécifiques à chaque langue

Au-dessus du moteur partagé se trouvent des frontends qui ajoutent ce qu'une spécification générale ne peut pas fournir : les mots irréguliers, un lexique curé, le sandhi (changements de son aux frontières des mots), et des dérogations spécifiques au dialecte.

- **[tugaphone](https://github.com/TigreGotico/tugaphone)** — portugais, à travers pt-PT, pt-BR, pt-AO, pt-MZ et pt-TL, combinant un lexique curé avec un repli fondé sur des règles (montré ci-dessus).
- **[euskaphone](https://github.com/TigreGotico/euskaphone)** — basque, sensible au dialecte, construit sur le même treillis (montré ci-dessus).
- **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** — mirandais, la langue asturléonaise de la Terra de Miranda, au Portugal, avec sandhi inter-mots, allophonie et accentuation :

  ```python
  >>> from mwl_phonemizer import phonemize
  >>> phonemize("Falo la lhéngua mirandesa.")
  'ˈfalu lɐ ˈʎɛŋɡwa miɾɐˈndez̺ɐ.'
  ```

- **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** — le premier G2P ouvert pour le barranquenho, la langue de contact ibéro-romane de Barrancos, à la frontière entre le Portugal et l'Espagne. Voir **[Présentation du premier phonémiseur pour le barranquenho](/fr/blog/2025-12-12-barranquenho)** pour la façon dont ses règles ont été dérivées de la propre convention orthographique de la municipalité.
- **[arbtok](https://github.com/TigreGotico/arbtok)** — arabe, construit sur le treillis d'orthography2ipa, ajoutant une diacritisation sensible au dialecte et couvrant l'arabe standard moderne, l'arabe classique et un certain nombre de variétés régionales. L'écriture arabe omet normalement les marques de voyelles brèves dont un phonémiseur a besoin, si bien que la tâche principale d'arbtok est de les récupérer avant de transmettre le résultat au moteur partagé. Il est maintenu par quelqu'un qui ne parle pas arabe nativement, considérez-le donc comme en développement actif plutôt que comme une référence finie et relue par un natif — utile, mais un endroit où vérifier la sortie auprès d'un locuteur natif avant de l'expédier dans quoi que ce soit destiné aux utilisateurs.

Chacun de ces frontends est une fine couche de logique spécifique à la langue par-dessus le même moteur de treillis partagé et la même couche de notation partagée en dessous. Aucun d'eux ne réimplémente la conversion IPA ou la recherche dans le treillis.

## Outils portugais complémentaires

Le portugais possède la pile la plus profonde, parce que la prononciation portugaise dépend de plus que des règles orthographiques : elle dépend de la structure syllabique, de la catégorie grammaticale, et parfois du simple sens.

- **[silabificador](https://github.com/TigreGotico/silabificador)** découpe les mots en syllabes à l'aide de règles conçues à la main :

  ```python
  >>> from silabificador import syllabify
  >>> syllabify("extraordinário")
  ['ex', 'tra', 'or', 'di', 'ná', 'ri', 'o']
  ```

- **[tugalex](https://github.com/TigreGotico/tugalex)** est le lexique derrière tugaphone : transcriptions IPA, données syllabiques et règles orthographiques pour des mots réels, de sorte que le vocabulaire courant et irrégulier n'a pas à être redérivé de l'orthographe à chaque fois.
- **[tugatagger](https://github.com/TigreGotico/tugatagger)** enveloppe plusieurs moteurs d'étiquetage morphosyntaxique (spaCy, Stanza, un tagger de style Brill, un repli heuristique sans dépendance) derrière une seule interface, de sorte que d'autres outils puissent demander « quelle est la catégorie grammaticale de ce mot » sans s'engager sur un moteur spécifique.
- **[tugamorph](https://github.com/TigreGotico/tugamorph)** est un analyseur morphologique fondé sur des règles : il segmente un mot en préfixe, racine, suffixe, flexion et clitique, en n'utilisant que la bibliothèque standard de Python, optionnellement affiné par silabificador et tugatagger.
- **[bifonia](https://github.com/TigreGotico/bifonia)** résout les homographes hétérophones du portugais européen — des mots comme « sede » (soif, `ˈsedɨ`, contre siège social, `ˈsɛdɨ`) où la prononciation correcte dépend du sens, pas de la grammaire. Voir **[Le dire correctement : désambiguïser les hétérophones portugais pour la TTS](/fr/blog/2026-06-12-disambiguating-portuguese-heterographs-for-tts)** pour la façon dont il a été construit et évalué. C'est le cas concret derrière l'idée de treillis ci-dessus : orthography2ipa peut fournir les deux lectures candidates de « sede », mais seule une couche sensible au sens comme bifonia peut choisir entre elles.

Pour en savoir plus sur la façon dont silabificador et tugaphone fonctionnent ensemble au quotidien, voir **[NLP classique pour le portugais : syllabation et graphème-vers-phonème](/fr/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, et pour le moteur plus large sous-jacent à tout cela, **[Graphème-vers-IPA pour 676 langues](/fr/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**.

## Recherche fondée sur le son : phonematcher

Tout ce qui précède transforme du texte en son. [phonematcher](https://github.com/TigreGotico/phonematcher) travaille avec les représentations sonores elles-mêmes : il calcule la distance phonétique entre symboles IPA et effectue une recherche floue sur des listes de mots fondée sur la façon dont les mots sonnent plutôt que sur leur orthographe.

```python
>>> from phonematcher.distance import phonetic_distance
>>> phonetic_distance('b', 'p')   # voiced vs. voiceless bilabial stop — very similar
0.043478260869565216
>>> phonetic_distance('p', 'k')   # bilabial vs. velar stop — less similar
0.34782608695652173
>>> phonetic_distance('a', 'k')   # vowel vs. consonant — maximally different
1.0
```

Cette métrique de distance est utile dans deux situations concrètes : rechercher dans un catalogue de mots ou de noms selon leur sonorité plutôt que leur orthographe exacte (utile pour les interfaces vocales tolérantes aux fautes de frappe et pour faire correspondre des emprunts lexicaux à travers différents systèmes d'écriture), et comparer à quel point deux lectes apparentés sont phonologiquement proches — le même type de comparaison que le tableau des dialectes ci-dessus fait à l'œil, mais calculée plutôt qu'estimée. phonematcher n'est pas sur PyPI ; il s'installe depuis les sources (`pip install -e .` sur le dépôt GitHub cloné, plus `rapidfuzz`).

## Limites honnêtes

La couverture à travers 820 spécifications de langue est inégale par construction : les langues disposant d'une littérature phonologique établie et d'un lexique produisent une meilleure sortie que les langues dotées d'une spécification mince, principalement déduite de conventions orthographiques générales. La qualité est systématiquement meilleure là où un lexique curé existe — le portugais, adossé à tugalex, est le cas le plus solide de la pile ; les langues reposant uniquement sur les règles de la spécification sans lexique géreront mal le vocabulaire irrégulier et les emprunts.

Quelques composants ne sont explicitement pas des références finies et relues par des locuteurs natifs : arbtok est maintenu par un locuteur non natif de l'arabe et devrait être vérifié auprès d'un jugement natif avant utilisation dans quoi que ce soit destiné aux utilisateurs. Les frontends construits sur des spécifications minces héritent de cette minceur — un frontend ne vaut que ce que valent la spécification et le lexique qui le sous-tendent.

## Pourquoi cela compte si votre langue n'a aucun outillage vocal

La plupart des langues du monde n'ont aucune voix TTS commerciale, aucun modèle STT commercial, et aucun dictionnaire de prononciation maintenu professionnellement. La conception en couches ci-dessus signifie que combler cette lacune n'exige pas de construire un moteur de phonologie depuis zéro : cela exige d'écrire une spécification pour le système sonore de la langue cible et, si possible, un lexique de ses mots irréguliers. Le moteur de treillis, les conversions de notation et l'outillage de recherche existent déjà. Si votre langue, votre dialecte ou votre produit a besoin d'une prise en charge de la prononciation qui n'existe pas encore, c'est le genre de travail que nous prenons en charge — voir **[nos services](/services)** ou **[contactez-nous](/contact)**.
