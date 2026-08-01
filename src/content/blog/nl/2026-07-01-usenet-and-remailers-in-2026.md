---
title: "Usenet in 2026: een schoon, pre-AI-tekstcorpus voor training en evaluatie"
description: "Usenet is een ongerept archief van menselijke discussie van vóór de AI — decennia aan nieuwsgroepposts, allemaal door mensen geschreven, niets ervan aangeraakt door taalmodellen. Dat maakt het waardevolle trainings- en evaluatiedata voor taal- en spraakmodellen. We bouwden een kleine Python-tool om het te oogsten."
date: 2026-07-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

De meeste open-web-tekstcorpora zijn besmet: LLM-gegenereerde tekst is doorgelekt naar Reddit, Stack Overflow, GitHub en blogs, dus een model dat erop wordt getraind, leert deels van andere modellen. Usenet is anders. Het zijn decennia aan flame wars, technische vraag-en-antwoord en nieuwsgroepdiscussies, allemaal door mensen geschreven, van vóór de huidige taalmodellen. Voor iedereen die taal- en spraakmodellen traint of evalueert, is een groot archief van door mensen geschreven tekst met een schone herkomst precies het soort data dat steeds moeilijker te vinden is.

-----

## Usenet als een corpus van vóór de AI

Usenet ontvangt duizenden posts per dag verspreid over honderden actieve groepen. Archiveer terug tot in de jaren 80 en je hebt **miljoenen artikelen** — elk een signaal van wat mensen werkelijk belangrijk vonden, waarover ze ruzieden, wat ze wilden weten — met een herkomst schoon genoeg om te citeren.

We bouwden een tool genaamd **usenet** die het oogsten hiervan eenvoudig maakt:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

De meeste publieke servers ondersteunen `NEWNEWS` (opvragen op datum) niet meer, dus **op groepen gebaseerd bladeren is de standaardaanpak.** Je scrapet één groep tegelijk — geen barrière, gewoon de realiteit van het protocol.

Om een nieuwsgroep in een trainingsdataset te veranderen, oogst `dataset.py` artikelen naar JSONL:

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

Eén artikel per regel. Duw er een paar duizend van naar Hugging Face en je hebt een **publiek beschikbare, door mensen geschreven dataset met een schone herkomst** die je kunt citeren en herpubliceren.

Repo: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Usenet lezen zonder account

De meeste publieke nieuwsservers laten je lezen zonder registratie:

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

## Waarom dit belangrijk is

Usenet is een archief met schone herkomst van door mensen geschreven tekst op schaal, van vóór het tijdperk van machinaal gegenereerde content. Of je nu modellen traint, datasets bouwt, of internetdiscours bestudeert van vóór het verwaterd raakte door AI-gegenereerde tekst, dat archief is er nog steeds en groeit nog steeds.

**Repository:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — oogst Usenet naar trainingsdatasets; lees publiek zonder account.
