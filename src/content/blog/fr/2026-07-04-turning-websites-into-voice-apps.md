---
title: "Si tout le monde lance une app, nous lancerons la voix : transformer les sites web en applications vocales"
description: "Chaque site qui compte a fini enveloppé dans une app mobile. Nous proposons le mouvement inverse pour l'ère de la voix et de la ligne de commande : une API propre plus une skill vocale par site, pour que le web devienne navigable à l'oreille et au clavier. Un site à la fois, tout cela finit par former un navigateur vocal."
date: 2026-07-04
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Voice"
  - "Accessibility"
  - "OpenVoiceOS"
  - "Web Automation"
  - "CLI"
  - "FOSS"
draft: false
---

À un moment donné au cours des quinze dernières années, le web a discrètement
décidé que chaque site important avait aussi besoin d'une app mobile. Non pas
parce que le HTML avait cessé de fonctionner — mais parce qu'une app est une
*surface contrôlée* : un ensemble curé d'actions, sans chrome que vous n'avez pas
choisi, une interface conçue pour une seule façon d'interagir.

Nous pensons que le même mouvement attend d'être accompli pour un autre ensemble
d'utilisateurs et un autre ensemble d'interfaces. Si tout le monde transforme
son site en app Android, **nous pouvons transformer les sites en applications
vocales** — et en applications en ligne de commande, et en flux natifs pour
lecteurs d'écran. La même idée, dans la direction opposée : envelopper un site
dans une surface conçue pour la façon dont *vous* voulez interagir avec lui, sauf
que la surface est votre voix et votre terminal au lieu d'un écran tactile.

## Le web est à peine utilisable à l'oreille

Pour un utilisateur voyant équipé d'une souris, un site moderne convient. Pour
quelqu'un qui navigue à la voix, ou à travers un lecteur d'écran, ou depuis un
terminal, la majeure partie du web est un environnement hostile : des murs de
défilement infini, des bannières de cookies, des pop-ups, des menus qui exigent
un pointeur, du contenu enfoui sous trois couches de fatras interactif.
L'information est là-dedans. L'en extraire, sans les mains, est une misère.

La réponse habituelle est « les sites devraient être plus accessibles », et ils
le devraient. Mais nous n'allons pas réparer le web entier en demandant
gentiment. Ce que nous *pouvons* faire, c'est prendre les sites qui comptent et
construire une interface parlée et propre pour chacun d'eux — à la manière des
magasins d'apps pour le tactile, mais pour la voix et la ligne de commande, et de
façon ouverte.

## Deux couches : une API propre, puis une skill vocale

Chacune de ces applications vocales est constituée de deux pièces empilées, et
nous construisons déjà les deux.

**Couche un — un client typé qui transforme un site en API.** C'est exactement
notre [travail de scraping et de rétro-ingénierie d'API](/fr/blog/2026-04-20-music-database-scrapers) :
atteindre un site qui n'a aucune interface publique utilisable et renvoyer des
objets structurés et typés au lieu de HTML fragile — des verbes, pas du scraping :

```python
from py_bandcamp import BandCamp

for release in BandCamp.search_albums("king gizzard"):
    artist = release.work.credits[0].entity.name if release.work.credits else ""
    print(release.work.title, artist, release.uri)
```

Les outils de reconnaissance et de
[transport anti-bot](/fr/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)
en dessous maintiennent cet accès en état de marche à mesure que le site change.
Ce client est déjà utile en soi : pour un utilisateur de terminal, l'API *est* la
version accessible du site web — notre client SoundCloud embarque même `nds`, une
application en ligne de commande pour chercher et lire de la musique sans le
moindre navigateur en vue. Une fois qu'un site est une API, il cesse d'être un
artefact visuel et devient quelque chose qu'une machine — ou un pipeline vocal —
peut piloter.

**Couche deux — un plugin OVOS qui parle cette API.** Par-dessus le client repose
un plugin [OpenVoiceOS](https://openvoiceos.org) qui associe les intentions
parlées à des appels d'API et narre les résultats avec nos
[voix TTS hors ligne](/fr/blog/2026-06-15-two-voices-every-language-miro-and-dii).
Ce n'est délibérément *pas* une skill sur mesure par site — cette voie mène à des
dizaines de skills isolées que personne ne peut maintenir. Pour tout ce qui a une
forme média, c'est un plugin fournisseur
[OCP](https://openvoiceos.github.io/ovos-technical-manual/) : un petit adaptateur
qui expose la surface de recherche-et-lecture d'un site à tout le framework Open
Common Play, de sorte que « chercher », « lire », « suivant » et « reprendre »
fonctionnent déjà de la même manière que pour toute autre source. Le site
s'insère dans une interface vocale uniforme au lieu d'inventer la sienne.

Le résultat : « Joue le canal Groove Salad de SomaFM. » « Cherche sur Bandcamp de
l'ambient Creative Commons. » Le site web, transformé en quelque chose que vous
pouvez utiliser sans le regarder — et sans une nouvelle grammaire à apprendre
pour chaque site.

## À l'ère des LLM, une API typée est une interface en langage naturel qui ne demande qu'à naître

Il y a une deuxième raison pour laquelle cette forme importe plus aujourd'hui
qu'elle ne l'aurait fait il y a cinq ans. Un client propre et typé est exactement
ce dont un grand modèle de langage a besoin pour devenir un *front-end en langage
naturel* d'un site web.

Donnez à un LLM un ensemble documenté de fonctions — `search_albums`,
`get_recommendations`, `stream_url` — et il traduira volontiers « trouve-moi
quelque chose comme Naxatras mais en plus lourd » en les bons appels, les
enchaînera et vous restituera le résultat à voix haute. L'API structurée est la
partie difficile ; l'interface conversationnelle par-dessus est de plus en plus
quelque chose que le modèle se contente de *fournir*, du moment que les outils
qu'on lui remet sont bien typés et honnêtes quant à ce qu'ils renvoient. Un HTML
désordonné ne donne rien au LLM à quoi se raccrocher. Un client typé lui donne
une surface de contrôle.

C'est pourquoi nos clients de site web embarquent un **`SKILL.md`** — une
description en langage clair de ce que fait l'API, de ses verbes, de ses types de
retour et d'exemples d'appels, écrite pour être lue par un agent. Pointez un
assistant piloté par LLM vers lui et le client devient un outil que le modèle
peut utiliser immédiatement : pas de code de colle, pas d'intégration sur mesure,
juste « voici ce que ce site sait faire, en mots ». Un seul document transforme
un scraper en quelque chose qu'un modèle de langage peut opérer en votre nom.

Ce sont les mêmes données structurées qui servent trois front-ends à la fois :
une **CLI** pour les utilisateurs de terminal, un **plugin OCP/voix** pour un
usage sans les mains, et un **outil LLM** pour un contrôle en langage naturel.
Construisez l'API une fois ; portez-la de trois façons.

## Pourquoi cela importe le plus pour ceux qui ne peuvent pas voir l'écran

Pour les utilisateurs aveugles et malvoyants, ce n'est pas une fonctionnalité de
confort — c'est la différence entre l'accès et l'exclusion. Un lecteur d'écran ne
peut lire que ce qu'une page expose proprement, et la plupart des pages ne le
font pas. Une application vocale dédiée saute la page entièrement : elle va aux
données structurées et parle *cela*, dans un flux conçu pour l'écoute dès la
première ligne de code.

C'est le même principe qui sous-tend nos
[jeux audio-first](/fr/games) — construits pour les oreilles, pas pour les yeux,
avec les joueurs aveugles comme public principal plutôt que comme une réflexion
après coup. Les applications vocales pour sites web étendent ce principe des jeux
au reste du web.

## Un site à la fois — mais la direction est un navigateur vocal

Voici la partie honnête : il n'y a pas de raccourci universel. On ne peut pas
rendre « le web » utilisable à la voix d'un seul coup, parce que chaque site est
son propre enchevêtrement. Cela doit se faire **site par site** — un client, une
skill, un ensemble d'intentions soigneusement cartographié à la fois. Cela
ressemble à une limitation, et à court terme ç'en est une.

Mais regardez vers quoi pointe l'accumulation. Chaque site que nous enveloppons
est un coin de plus du web désormais accessible à la voix et à la ligne de
commande. Assemblez-en suffisamment — un vocabulaire de métadonnées commun, une
couche vocale partagée, un ensemble cohérent d'intentions « chercher / ouvrir /
lire / jouer / suivant » — et vous ne regardez plus un tas de skills séparées.
Vous regardez les prémices d'un **navigateur vocal** : une façon de parcourir le
web en parlant, où les sites individuels ne sont que des destinations qui savent
déjà comment répondre.

Le pari de l'ère mobile était qu'un site qui vaut la peine d'être utilisé vaut
une app. Le nôtre est qu'un site qui vaut la peine d'être utilisé vaut une
*voix*. Nous les construisons un à la fois, de façon ouverte, et chacun d'eux
rend le web un peu plus navigable pour les personnes que le web visuel a laissées
de côté.

Vous voulez qu'un site précis soit transformé en application vocale ou en ligne
de commande — pour l'accessibilité, pour votre produit, ou simplement parce qu'il
devrait exister ? [Discutons-en.](/fr/services)
