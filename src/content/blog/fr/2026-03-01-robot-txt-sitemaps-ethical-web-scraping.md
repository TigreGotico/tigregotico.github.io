---
title: "Robots.txt, sitemaps et scraping web éthique"
description: "Avant de construire un scraper, faites la reconnaissance du site. sitemapper lit le robots.txt, récupère tous les sitemaps et, en option, parcourt le graphe de liens — pour que votre scraper parte du propre contrat du site plutôt que de la force brute."
date: 2026-03-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Web Scraping"
  - "Sitemaps"
  - "Ethics"
  - "Robots.txt"
  - "Data Collection"
  - "FOSS"
draft: false
---

## Commencez par la reconnaissance, pas par la force brute

Les pires scrapers explorent à l'aveugle. Ils martèlent un site, ignorent les
déclarations de crawl-delay, parcourent tous les chemins à la recherche de
données et se cassent dès que la structure change ne serait-ce que par le nom
d'une seule classe. Les meilleurs scrapers commencent par lire le site.

Chaque site web publie un contrat en trois endroits : le **robots.txt**
(politique d'exploration), les **sitemaps** (ce que le site lui-même considère
digne d'être indexé) et le **graphe de liens** (comment les pages sont
réellement reliées entre elles). Lire cela d'abord répond à trois questions
avant d'écrire une seule ligne de code de scraping :

1. **Ce site peut-il être scrapé ?** Qu'autorise le robots.txt, et à quel rythme ?
2. **Où sont les données ?** Que révèlent les sitemaps ?
3. **Comment le site est-il structuré ?** À quoi ressemble la topologie des liens ?

C'est ce que fait **[sitemapper](https://github.com/TigreGotico/sitemapper)**.

## Découverte passive : robots.txt + sitemaps

`discover()` récupère le robots.txt et tous les sitemaps qu'il peut trouver — y
compris les directives `Sitemap:`, les index de sitemaps qui pointent vers des
sous-sitemaps et les fichiers compressés en gzip — sans explorer une seule page
HTML :

```python
from sitemapper import discover

info = discover("https://www.python.org")
print(info.summary())
# Base URL:         https://www.python.org
# Sitemaps found:   1
# URLs in sitemaps: 342
# Crawl-delay:      None

# What pace does the site ask for?
if info.robots.crawl_delay:
    print(f"Wait {info.robots.crawl_delay}s between requests")

# May I fetch this path?
info.robots.is_allowed("/api/users")            # True / False
info.robots.is_allowed("/admin", user_agent="MyBot/1.0")

# Every deduplicated URL the site's own sitemaps declare
for url in info.urls:
    print(url.loc, url.lastmod, url.changefreq, url.priority)
```

Le détail par agent est là quand vous en avez besoin : `info.robots.groups`
contient chaque bloc `User-agent` avec ses `allows`, `disallows` et
`crawl_delay`, dans l'ordre du document. Si un site n'a pas de robots.txt du
tout, `is_allowed()` renvoie `True` pour tout — l'absence de politique est,
elle-même, la politique.

Le bénéfice du scraping orienté sitemaps : au lieu de découvrir les URL par
l'exploration (lente, bruyante, incomplète), vous partez de la propre liste des
mainteneurs. Vous scrapez ce que le site déclare important, au rythme qu'il
déclare acceptable, en une fraction des requêtes.

## Découverte active : le graphe de liens

Certains sites ne publient aucun sitemap. Pour ceux-là, `crawl()` exécute une
exploration en largeur, bornée, à partir de l'URL de base, et renvoie un
`LinkGraph` des pages internes et des liens sortants :

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

Cela vous indique la topologie réelle — quelles pages renvoient vers quoi — pour
que vous puissiez décider si le site justifie ne serait-ce qu'un scraper
structuré. La découverte et l'exploration sont des appels délibérément séparés :
l'étape passive ne récupère jamais de HTML, vous pouvez donc toujours faire la
reconnaissance poliment avant de décider d'explorer.

## Bâti sur le même transport résilient

La reconnaissance d'un site est inutile si la reconnaissance elle-même est
bloquée par des murs anti-bot. Tout le HTTP de sitemapper passe par
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) — le
transport avec usurpation TLS de notre
**[article sur le transport anti-bot](/fr/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** —
si bien que le robots.txt et les sitemaps reviennent même sur les sites
protégés par Cloudflare. Une instance FlareSolverr ou un recours à la Wayback
Machine peuvent être activés avec des variables d'environnement
(`SITEMAPPER_FLARESOLVERR_URL`, `SITEMAPPER_WAYBACK_FALLBACK=1`) ou via la
classe `Sitemapper`.

## Pourquoi c'est important

**Crawl-delay** : un site qui déclare `Crawl-delay: 2` vous indique à quelle
vitesse il veut être sollicité. Ignorez-le et vous êtes bloqué — ou vous
dégradez le site pour tout le monde. Respectez-le et votre scraper joue franc
jeu.

**Sitemaps plutôt qu'exploration** : un sitemap liste ce que le site veut voir
indexé. L'exploration aveugle des liens peut toucher cinq fois plus d'URL pour
trouver le même contenu. Commencez par le sitemap quand il en existe un ; c'est
plus rapide pour vous et plus léger pour le serveur.

**La portée avant le code** : certains sites interdisent le scraping de façon
explicite dans le robots.txt ; d'autres ont des sitemaps qui contiennent déjà
tout ce dont vous avez besoin. Dix secondes de `discover()` vous disent dans
quelle situation vous êtes avant d'investir dans un parser.

## L'outil

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

Utilisez-le comme bibliothèque, ou depuis la ligne de commande — `--json` émet
la découverte complète pour l'acheminer vers d'autres outils, `--crawl` ajoute
l'étape du graphe de liens :

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json
```

C'est un logiciel libre qui tourne sur votre propre matériel. Commencez chaque
scraper par la reconnaissance.
