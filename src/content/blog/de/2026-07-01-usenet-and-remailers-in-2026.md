---
title: "Usenet im Jahr 2026: ein sauberer Textkorpus aus der Zeit vor der KI für Training und Evaluierung"
description: "Usenet ist ein unberührtes Archiv des menschlichen Diskurses aus der Zeit vor der KI: Jahrzehnte an Newsgroup-Beiträgen, alles von Menschen geschrieben, nichts davon von Sprachmodellen berührt. Das macht es zu wertvollen Trainings- und Evaluierungsdaten für Sprach- und Sprachmodelle. Wir haben ein kleines Python-Werkzeug gebaut, um es zu ernten."
date: 2026-07-01
lang: de
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

Die meisten Textkorpora des offenen Webs sind kontaminiert: von LLM erzeugter Text hat sich in Reddit, Stack Overflow, GitHub und Blogs eingeschlichen, sodass ein darauf trainiertes Modell teilweise von anderen Modellen lernt. Usenet ist anders. Es sind Jahrzehnte an Flame Wars, technischen Fragen und Antworten und Newsgroup-Diskussionen, alles von Menschen geschrieben, vollständig aus der Zeit vor den heutigen Sprachmodellen. Für alle, die Sprach- und Sprachmodelle trainieren oder evaluieren, ist ein großes Archiv von Menschen verfasster Texte mit sauberer Herkunft genau die Art von Daten, die immer schwerer zu finden ist.

-----

## Usenet als Korpus aus der Zeit vor der KI

Usenet erhält täglich Tausende von Beiträgen in Hunderten aktiver Gruppen. Reichen Sie im Archiv bis in die 1980er-Jahre zurück, und Sie haben **Millionen von Artikeln**, jeder ein Signal dafür, was den Menschen tatsächlich am Herzen lag, worüber sie stritten, was sie wissen wollten, mit einer Herkunft, die sauber genug ist, um zitiert zu werden.

Wir haben ein Werkzeug namens **usenet** gebaut, das diese Ernte unkompliziert macht:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

Die meisten öffentlichen Server unterstützen `NEWNEWS` (Abfrage nach Datum) nicht mehr, weshalb **das gruppenbasierte Durchstöbern der Standardansatz ist.** Sie scrapen eine Gruppe nach der anderen. Das ist keine Hürde, nur die Realität des Protokolls.

Um eine Newsgroup in einen Trainingsdatensatz zu verwandeln, sammelt `dataset.py` Artikel in JSONL:

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

Ein Artikel pro Zeile. Schieben Sie ein paar Tausend davon zu Hugging Face, und Sie haben einen **öffentlich verfügbaren, von Menschen verfassten Datensatz mit sauberer Herkunft**, den Sie zitieren und weiterveröffentlichen können.

Repo: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Usenet ohne Konto lesen

Die meisten öffentlichen News-Server erlauben das Lesen ohne Registrierung:

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

## Warum das wichtig ist

Usenet ist ein Archiv mit sauberer Herkunft von in großem Umfang von Menschen verfasstem Text, aus der Zeit vor der Ära maschinengenerierter Inhalte. Ob Sie Modelle trainieren, Datensätze aufbauen oder den Internetdiskurs studieren, bevor er von KI-generiertem Text verwässert wurde: Dieses Archiv ist noch immer da und wächst weiter.

**Repository:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet): Ernten Sie Usenet in Trainingsdatensätze, lesen Sie öffentlich ohne Konto.
