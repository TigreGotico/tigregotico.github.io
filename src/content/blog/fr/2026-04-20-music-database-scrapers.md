---
title: "Nous vous présentons nos scrapers de bases de données musicales"
description: "Une visite guidée de la famille de clients Python typés que nous maintenons pour les sources musicales — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio, et les grandes encyclopédies musicales — tous produisant des métadonnées média cohérentes et typées derrière une interface propre et unique, et roulant sur le même transport HTTP conforme et à faible volume."
date: 2026-04-20
updated: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Scrapers"
  - "Media Metadata"
  - "Music"
  - "Python"
  - "FOSS"
draft: false
---

## Une seule interface pour tout le web musical

Le web musical est fragmenté à travers de nombreux sites indépendants. Bandcamp vous vend un FLAC et une licence Creative Commons ; SoundCloud diffuse un remix que personne d'autre n'héberge ; SomaFM anime un ensemble de chaînes de radio financées par les auditeurs ; et un certain nombre de sites gérés par des communautés tiennent à jour des encyclopédies organisées de rock progressif, de jazz, de musique classique et de metal. Chaque site a son propre balisage, ses propres bizarreries, sa propre idée de ce qu'est même une « piste ».

Nous maintenons une famille de petits clients Python ciblés et open source qui domptent ce désordre. Chacun d'eux fait, dans l'esprit, la même chose : il puise dans une source musicale et vous renvoie des **modèles de métadonnées média typés** — des objets validés plutôt que des dictionnaires fragiles — afin que le reste de votre code n'ait jamais à se soucier du site d'où proviennent les données. Sept des neuf sont publiés sur PyPI ; les deux autres s'installent directement depuis GitHub. Ils parlent tous le même vocabulaire.

Voici la visite guidée.

## Streaming et radio

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** scrape Bandcamp : rechercher des pistes, des albums, des artistes et des labels ; parcourir par étiquette de genre ; obtenir des recommandations et des artistes connexes à partir d'une graine ; et extraire une URL MP3 diffusable. Les recherches renvoient des objets `Release` typés portant titre, pochette, genres, crédits et — crucialement pour les adeptes du FOSS — un champ de licence de style SPDX avec une vérification `is_open()` afin que vous puissiez distinguer une publication Creative Commons d'une publication tous droits réservés. Une conversion d'album en pleine fidélité remplit la liste de pistes ordonnée à la demande.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** est notre client SoundCloud, et c'est le couteau suisse du lot. Trois backends indépendants — un backend API riche en métadonnées, un scraper HTML sans dépendances, et un backend yt-dlp — se tiennent derrière un orchestrateur qui bascule gracieusement de l'un à l'autre. Il recherche des pistes et des personnes, résout des URL de flux directes (progressif ou HLS), télécharge des pistes et des playlists entières, et embarque même une application de terminal, `nds`, pour rechercher et jouer depuis la ligne de commande. Les publications reviennent avec codec, débit, genres, pays, licence SPDX et listes de pistes complètes des sets.

**[radiosoma](https://github.com/TigreGotico/radiosoma)** enveloppe l'API publique des chaînes de SomaFM. SomaFM est l'extrémité conviviale et à API ouverte du spectre, et le client la modélise proprement : chaque chaîne est une œuvre, et **chaque encodage de flux** — AAC à 130 kbps, MP3 à 256 kbps, HE-AAC à 64 et 32 kbps — devient son propre `Release` de cette chaîne, de sorte qu'un consommateur puisse choisir le meilleur ajustement et dédupliquer par identité. Le flux des pistes récentes apparaît comme un planning bien rangé de ce qui a été diffusé.

**[tunein](https://github.com/TigreGotico/tunein)** est un client TuneIn non officiel pour les stations de radio linéaire et IPTV du monde entier. Un chemin rapide ne renvoie que la charge utile de recherche ; un appel d'enrichissement optionnel remplit genre, langue, pays, indicatif d'appel et slogan. Comme TuneIn renvoie plusieurs URL de flux par station — différents débits, miroirs et protocoles — chacune devient son propre `Release`, laissant là encore le consommateur choisir au moment de la lecture. Une petite CLI vous offre une sortie en tableau ou en JSON.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** dialogue avec l'API publique d'iHeartRadio — sans clé, sans compte. Recherchez des stations, des podcasts, des artistes, des pistes et des playlists ; récupérez des épisodes de podcast avec des URL de flux audio directes ; et comptez sur des récupérations de détails en parallèle pour que les recherches de station et d'artiste s'exécutent simultanément. Chaque modèle offre les auxiliaires `to_external_ids()` et `to_signals()` pour s'insérer directement dans une pipeline de métadonnées typée.

## Encyclopédies et archives musicales

La seconde moitié de la famille vise les grands catalogues communautaires.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)** (Jazz Music Archives) — les deux s'installent directement depuis leurs dépôts GitHub plutôt que depuis PyPI — et **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)** (Classical Archives) partagent une forme quasi identique : parcourir l'index A–Z, rechercher par nom, et récupérer une page complète d'artiste ou de compositeur avec biographie, pays et une discographie notée par les membres. Prog et Jazz Archives scrapent du HTML ; Classical Archives enveloppe une API JSON publique et expose les albums d'un compositeur *et* un arbre d'œuvres aplati récursivement. Chaque modèle porte l'id canonique stable du site via `to_external_ids_dict()`, ce qui est exactement ce dont vous avez besoin pour croiser un catalogue avec un autre.

**[pymetal](https://github.com/TigreGotico/pymetal)** est notre client pour l'Encyclopaedia Metallum, les Metal Archives — et le plus ambitieux de l'ensemble. La plupart des scrapers aplatissent une piste en `(id, title, band, album)`. pymetal refuse de perdre ce que les Metal Archives gardent séparé : une piste peut créditer **plusieurs groupes** (splits, collaborations), la **formation d'un groupe est découpée dans le temps**, et une piste peut **apparaître sur de nombreuses publications** (compilations, rééditions, singles). Il modélise chacun comme une entité de première classe indexée par l'id d'archive, de sorte que les re-scrapes soient idempotents. La surface des endpoints est vaste — recherche avancée de groupe/album/chanson, pages complètes de publication avec attribution par groupe sur les splits, formations partitionnées par statut avec plages de dates de rôle, critiques, recommandations, liens externes et paroles — le tout sous forme de modèles Pydantic v2 qui font un aller-retour à travers JSON.

Au-delà de la musique, **[tutubo](https://github.com/TigreGotico/tutubo)** scrape YouTube et YouTube Music, et **[pymal](https://github.com/TigreGotico/pymal)** couvre MyAnimeList — étendant les mêmes patrons de métadonnées typées à des catégories de média plus larges. Tous émettent le même vocabulaire pour qu'un unique consommateur en aval gère tout de manière uniforme.

## Conçus pour un accès conforme, à faible volume

Ces clients ne récupèrent que des pages de catalogue publiques, à faible volume de requêtes, et vérifient le `robots.txt` de chaque site avant de scraper — voir l'
**[article sur robots.txt et les sitemaps](/fr/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
pour la façon dont fonctionne cette étape de reconnaissance. À travers toute la famille, la couche HTTP est **enfichable** : par défaut, les clients utilisent un transport dont le handshake TLS correspond à celui d'un vrai navigateur (`curl_cffi` reproduisant les empreintes TLS/JA3 de Chrome), de sorte qu'un client bien élevé ne soit pas classé à tort comme automatisation malveillante par des systèmes de détection calibrés pour l'abus scripté. Les encyclopédies protégées par Cloudflare peuvent en outre passer par une instance FlareSolverr pour des données en direct, ou lire depuis la Wayback Machine d'Internet Archive comme repli. La couche d'analyse est délibérément indépendante de la façon dont le HTML arrive, si bien que le même code fonctionne quel que soit le transport que vous choisissez.

## Un catalogue musical multi-sources

Le véritable gain, c'est ce qui se produit quand vous cessez de penser à cela comme à neuf outils séparés. Comme ils émettent tous le même vocabulaire de métadonnées typé et exposent tous des ids externes canoniques, vous pouvez déployer un seul artiste à travers Bandcamp, SoundCloud, les annuaires radio et les encyclopédies, puis replier les résultats dans un catalogue cohérent — dédupliqué par identité, conscient des licences, et prêt à alimenter un moteur de recommandation, un serveur multimédia, ou un jeu de données de recherche.

Chacun de ces clients est un logiciel libre, auto-hébergeable, et tourne sur votre propre matériel, sans clé d'API requise. Choisissez la source qui vous intéresse : `pip install` si elle est sur PyPI, ou `pip install git+https://github.com/TigreGotico/<repo>` pour pyprogarchives et pyjazzmusicarchives, qui sont uniquement sur GitHub — et commencez à construire.

Tous les scrapers roulent sur nos **[sessions requests composables et prêtes à l'emploi](/fr/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**. Les clients de streaming et de radio émettent directement le schéma **[mediavocab](https://github.com/TigreGotico/mediavocab)**, et chaque client expose des ids externes canoniques, de sorte que les métadonnées musicales s'intègrent avec **[media-archivist](https://github.com/TigreGotico/media-archivist)**, notre indexeur multi-sources et serveur de métadonnées dédupliquant.
