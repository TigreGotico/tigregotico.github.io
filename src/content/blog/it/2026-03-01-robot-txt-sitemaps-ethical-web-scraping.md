---
title: "Robots.txt, Sitemap e Scraping Web Etico"
description: "Prima di costruire uno scraper, esplora il sito. sitemapper legge il robots.txt, recupera tutte le sitemap e, opzionalmente, percorre il grafo dei collegamenti — così che il tuo scraper parta dal contratto stesso del sito anziché dalla forza bruta."
date: 2026-03-01
lang: it
updated: 2026-08-01
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

## Inizia dalla ricognizione, non dalla forza bruta

I peggiori scraper esplorano alla cieca. Martellano un sito, ignorano le
dichiarazioni di crawl-delay, percorrono ogni percorso in cerca di dati e si
rompono quando la struttura cambia per il nome di una singola classe. I migliori
scraper iniziano leggendo il sito.

Ogni sito web pubblica un contratto in tre luoghi: **robots.txt** (politica di
scansione), le **sitemap** (ciò che il sito stesso considera degno di
indicizzazione) e il **grafo dei collegamenti** (come le pagine sono
effettivamente collegate tra loro). Leggere questi elementi per primi risponde a
tre domande prima di scrivere una singola riga di codice di scraping:

1. **Questo sito è scrapabile?** Cosa consente il robots.txt, e a che ritmo?
2. **Dove sono i dati?** Cosa espongono le sitemap?
3. **Come è strutturato il sito?** Qual è la topologia dei collegamenti?

È questo che fa **[sitemapper](https://github.com/TigreGotico/sitemapper)**.

## Scoperta passiva: robots.txt + sitemap

`discover()` recupera il robots.txt e tutte le sitemap che riesce a trovare —
incluse le direttive `Sitemap:`, gli indici di sitemap che puntano a
sotto-sitemap e i file compressi con gzip — senza esplorare una singola pagina
HTML:

```python
from sitemapper import discover

info = discover("https://www.python.org")
print(info.summary())
# Base URL:       https://www.python.org
# Blocked:        False
# Sitemaps found: 1
# URLs in sitemaps: 342
# Crawl-delay:    None
# Sitemap directives in robots.txt: 1

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

Il dettaglio per agente è lì quando ne hai bisogno: `info.robots.groups`
contiene ogni blocco `User-agent` con i suoi `allows`, `disallows` e
`crawl_delay`, nell'ordine del documento. Se un sito non ha alcun robots.txt,
`is_allowed()` restituisce `True` per tutto — l'assenza di una politica è, essa
stessa, la politica.

Il vantaggio dello scraping guidato dalle sitemap: anziché scoprire gli URL
tramite l'esplorazione (lenta, rumorosa, incompleta), parti dall'elenco stesso
dei manutentori. Fai scraping di ciò che il sito dichiara importante, al ritmo
che dichiara accettabile, in una frazione delle richieste.

## Scoperta attiva: il grafo dei collegamenti

Alcuni siti non pubblicano alcuna sitemap. Per quelli, `crawl()` esegue
un'esplorazione in ampiezza, limitata, a partire dall'URL di base, e restituisce
un `LinkGraph` delle pagine interne e dei collegamenti in uscita:

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

Questo ti dice la topologia reale — quali pagine collegano cosa — così da poter
decidere se il sito giustifichi affatto uno scraper strutturato. Scoperta ed
esplorazione sono chiamate deliberatamente separate: il passo passivo non
recupera mai HTML, perciò puoi sempre fare la ricognizione in modo educato prima
di decidere di esplorare.

## Basato sullo stesso trasporto resiliente

La ricognizione di un sito è inutile se la ricognizione stessa viene bloccata
dai muri anti-bot. Tutto l'HTTP di sitemapper passa attraverso
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) — il
trasporto con impersonificazione TLS del nostro
**[articolo sul trasporto anti-bot](/it/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** —
così che il robots.txt e le sitemap arrivino anche su siti protetti da
Cloudflare. Un'istanza FlareSolverr o un ripiego sulla Wayback Machine possono
essere abilitati con variabili d'ambiente (`SITEMAPPER_FLARESOLVERR_URL`,
`SITEMAPPER_WAYBACK_FALLBACK=1`) o tramite la classe `Sitemapper`.

## Perché questo conta

**Crawl-delay**: un sito che dichiara `Crawl-delay: 2` ti sta dicendo a che
velocità vuole essere interrogato. Ignoralo e vieni bloccato — oppure degradi il
sito per tutti. Rispettalo e il tuo scraper gioca lealmente.

**Sitemap anziché esplorazione**: una sitemap elenca ciò che il sito vuole
indicizzato. L'esplorazione cieca dei collegamenti può toccare cinque volte più
URL per trovare lo stesso contenuto. Parti dalla sitemap quando ne esiste una; è
più veloce per te e più leggera per il server.

**Ambito prima del codice**: alcuni siti vietano lo scraping in modo esplicito
nel robots.txt; altri hanno sitemap che contengono già tutto ciò di cui hai
bisogno. Dieci secondi di `discover()` ti dicono in quale situazione ti trovi
prima di investire in un parser.

## Lo strumento

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

Usalo come libreria, o dalla riga di comando — `--json FILE` scrive la scoperta
completa su un file per il consumo da parte di altri strumenti, `--crawl` aggiunge il passo del
grafo dei collegamenti:

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json out.json
```

È software libero e gira sul tuo hardware. Inizia ogni scraper con la
ricognizione.
