---
title: "Usenet nel 2026: un corpus testuale pulito e pre-IA per addestramento e valutazione"
description: "Usenet è un archivio incontaminato del discorso umano pre-IA — decenni di post di newsgroup, tutti scritti da esseri umani, nessuno toccato dai modelli linguistici. Questo la rende un dato prezioso per l'addestramento e la valutazione di modelli linguistici e vocali. Abbiamo costruito un piccolo strumento Python per raccoglierla."
date: 2026-07-01
lang: it
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

La maggior parte dei corpora testuali del web aperto è contaminata: il testo generato da LLM è filtrato in Reddit, Stack Overflow, GitHub e blog, così un modello addestrato su di essi impara in parte da altri modelli. Usenet è diversa. È decenni di flame war, Q&A tecnici e discussioni di newsgroup, tutti scritti da esseri umani, precedenti del tutto ai modelli linguistici odierni. Per chiunque addestri o valuti modelli linguistici e vocali, un ampio archivio di testo scritto da esseri umani con provenienza pulita è esattamente il tipo di dato che sta diventando sempre più difficile da trovare.

-----

## Usenet come corpus pre-IA

Usenet riceve migliaia di post al giorno su centinaia di gruppi attivi. Archiviate indietro fino agli anni '80 e avete **milioni di articoli** — ognuno un segnale di ciò a cui gli esseri umani tenevano davvero, su cui discutevano, che volevano sapere — con una provenienza abbastanza pulita da poter essere citata.

Abbiamo costruito uno strumento chiamato **usenet** che rende semplice la raccolta di tutto questo:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

La maggior parte dei server pubblici non supporta più `NEWNEWS` (interrogazione per data), quindi **la navigazione per gruppo è l'approccio standard.** Si fa scraping di un gruppo alla volta — non una barriera, solo la realtà del protocollo.

Per trasformare un newsgroup in un dataset di addestramento, `dataset.py` raccoglie gli articoli in JSONL:

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

Un articolo per riga. Caricatene qualche migliaio su Hugging Face e avete un **dataset disponibile pubblicamente, scritto da esseri umani e con provenienza pulita** che potete citare e ripubblicare.

Repo: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Leggere Usenet senza account

La maggior parte dei server di news pubblici permette di leggere senza registrarsi:

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

## Perché questo conta

Usenet è un archivio con provenienza pulita di testo scritto da esseri umani su larga scala, precedente all'era dei contenuti generati da macchine. Che stiate addestrando modelli, costruendo dataset o studiando il discorso di internet prima che venisse diluito da testo generato dall'IA, quell'archivio è ancora lì e continua a crescere.

**Repository:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — raccogliete Usenet in dataset di addestramento; leggete pubblicamente senza account.
