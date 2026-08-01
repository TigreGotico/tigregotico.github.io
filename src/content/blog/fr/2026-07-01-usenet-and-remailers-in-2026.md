---
title: "Usenet en 2026 : un corpus de texte propre et d'avant l'IA pour l'entraînement et l'évaluation"
description: "Usenet est une archive intacte du discours humain d'avant l'IA — des décennies de messages de newsgroups, tous écrits par des humains, aucun touché par des modèles de langage. Cela en fait des données précieuses d'entraînement et d'évaluation pour les modèles de langue et de parole. Nous avons construit un petit outil Python pour la collecter."
date: 2026-07-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

La plupart des corpus de texte du web ouvert sont contaminés : du texte généré par des LLM s'est infiltré dans Reddit, Stack Overflow, GitHub et les blogs, de sorte qu'un modèle entraîné dessus apprend en partie d'autres modèles. Usenet est différent. Ce sont des décennies de guerres de flammes, de questions-réponses techniques et de disputes de newsgroups, le tout écrit par des humains, antérieur entièrement aux modèles de langage actuels. Pour quiconque entraîne ou évalue des modèles de langue et de parole, une vaste archive de texte rédigé par des humains à la provenance propre est exactement le type de données qui devient de plus en plus difficile à trouver.

-----

## Usenet comme corpus d'avant l'IA

Usenet reçoit des milliers de messages par jour à travers des centaines de groupes actifs. En remontant aux années 1980, vous obtenez des **millions d'articles** — chacun un signal de ce qui intéressait réellement les humains, de ce dont ils débattaient, de ce qu'ils voulaient savoir — avec une provenance suffisamment propre pour être citée.

Nous avons construit un outil appelé **usenet** qui rend cette collecte simple :

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

La plupart des serveurs publics ne prennent plus en charge `NEWNEWS` (interrogation par date), donc **la navigation par groupe est l'approche standard.** Vous récupérez un groupe à la fois — ce n'est pas un obstacle, juste la réalité du protocole.

Pour transformer un newsgroup en jeu de données d'entraînement, `dataset.py` collecte les articles au format JSONL :

```
{
  "group": "comp.lang.python",
  "message_id": "<12345@example.com>",
  "subject": "Best practices for list comprehensions",
  "author": "Alice",
  "date": "1999-03-15T10:22:00Z",
  "language": "en",
  "text": "In my experience, list comprehensions are most readable when...",
}
```

Un article par ligne. Poussez-en quelques milliers vers Hugging Face et vous avez un **jeu de données disponible publiquement, écrit par des humains et à la provenance propre** que vous pouvez citer et republier.

Dépôt : [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Lire Usenet sans compte

La plupart des serveurs d'actualités publics permettent de lire sans s'inscrire :

```python
from usenet import UsenetServer

servers = [
    "news.neodome.net",
    "news.samoylyk.net",
    "freenews.netfront.net"
]

for server in servers:
    try:
        with UsenetServer(server) as s:
            articles = s.get_articles("alt.test", limit=5)
            print(f"Success on {server}: {len(articles)} articles")
            break
    except OSError:
        continue
```

-----

## Pourquoi cela compte

Usenet est une archive à la provenance propre de texte écrit par des humains, à grande échelle, antérieure à l'ère du contenu généré par des machines. Que vous entraîniez des modèles, construisiez des jeux de données ou étudiiez le discours Internet avant qu'il ne soit dilué par du texte généré par l'IA, cette archive est toujours là, et continue de croître.

**Dépôt :** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — collectez Usenet en jeux de données d'entraînement ; lisez publiquement sans compte.
