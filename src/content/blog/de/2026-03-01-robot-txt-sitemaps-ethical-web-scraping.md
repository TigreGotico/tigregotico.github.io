---
title: "Robots.txt, Sitemaps und ethisches Web-Scraping"
description: "Bevor Sie einen Scraper bauen, erkunden Sie die Website. sitemapper liest robots.txt, ruft jede Sitemap ab und crawlt optional den Linkgraphen — sodass Ihr Scraper vom eigenen Vertrag der Website ausgeht statt von roher Gewalt."
date: 2026-03-01
lang: de
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

## Beginnen Sie mit Aufklärung, nicht mit roher Gewalt

Die schlechtesten Scraper crawlen blind. Sie überlasten eine Website, ignorieren
Crawl-Delay-Deklarationen, durchforsten jeden Pfad auf der Suche nach Daten und
brechen, sobald sich die Struktur um einen einzigen Klassennamen ändert. Die
besten Scraper beginnen damit, die Website zu lesen.

Jede Website veröffentlicht einen Vertrag an drei Stellen: **robots.txt**
(Crawl-Richtlinie), die **Sitemaps** (was die Website selbst für indexierungswürdig
hält) und der **Linkgraph** (wie die Seiten tatsächlich miteinander verdrahtet
sind). Diese zuerst zu lesen beantwortet drei Fragen, bevor Sie eine einzige Zeile
Scraping-Code schreiben:

1. **Ist diese Website scrapbar?** Was erlaubt robots.txt, und in welchem Tempo?
2. **Wo sind die Daten?** Was legen die Sitemaps offen?
3. **Wie ist die Website strukturiert?** Wie sieht die Link-Topologie aus?

Genau das tut **[sitemapper](https://github.com/TigreGotico/sitemapper)**.

## Passive Erkennung: robots.txt + Sitemaps

`discover()` ruft robots.txt und jede Sitemap ab, die es finden kann — einschließlich
`Sitemap:`-Direktiven, Sitemap-Indizes, die auf Unter-Sitemaps verweisen, und
gzip-komprimierter Dateien — ohne eine einzige HTML-Seite zu crawlen:

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

Das Detail je Agent ist da, wenn Sie es brauchen: `info.robots.groups` enthält jeden
`User-agent`-Block mit seinen `allows`, `disallows` und `crawl_delay`, in der
Reihenfolge des Dokuments. Wenn eine Website überhaupt keine robots.txt hat, gibt
`is_allowed()` für alles `True` zurück — das Fehlen einer Richtlinie ist selbst die
Richtlinie.

Der Vorteil von Sitemap-First-Scraping: Statt URLs durch Crawlen zu entdecken
(langsam, laut, unvollständig), gehen Sie von der eigenen Liste der Betreiber aus.
Sie scrapen, was die Website für wichtig erklärt, in dem Tempo, das sie für
akzeptabel erklärt, mit einem Bruchteil der Anfragen.

## Aktive Erkennung: der Linkgraph

Manche Websites veröffentlichen keine Sitemap. Für diese führt `crawl()` ein
begrenztes Breitensuchen-Crawling von der Basis-URL aus und gibt einen `LinkGraph`
interner Seiten und ausgehender Links zurück:

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

Das verrät Ihnen die tatsächliche Topologie — welche Seiten auf was verlinken —,
sodass Sie entscheiden können, ob die Website überhaupt einen strukturierten Scraper
wert ist. Erkennung und Crawling sind bewusst getrennte Aufrufe: Der passive Schritt
ruft niemals HTML ab, sodass Sie immer höflich vorausspähen können, bevor Sie sich
zum Crawlen entscheiden.

## Auf demselben widerstandsfähigen Transport aufgebaut

Website-Aufklärung ist sinnlos, wenn die Aufklärung selbst von einer Bot-Wand
blockiert wird. Der gesamte HTTP-Verkehr von sitemapper läuft über
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) — den
TLS-imitierenden Transport aus unserem
**[Anti-Bot-Transport-Beitrag](/de/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** —,
sodass robots.txt und Sitemaps auch auf Cloudflare-geschützten Websites
zurückkommen. Eine FlareSolverr-Instanz oder ein Wayback-Machine-Fallback kann über
Umgebungsvariablen (`SITEMAPPER_FLARESOLVERR_URL`,
`SITEMAPPER_WAYBACK_FALLBACK=1`) oder über die Klasse `Sitemapper` aktiviert werden.

## Warum das wichtig ist

**Crawl-Delay**: Eine Website, die `Crawl-delay: 2` deklariert, sagt Ihnen, wie
schnell sie angefragt werden möchte. Ignorieren Sie es, werden Sie blockiert — oder
Sie beeinträchtigen die Website für alle. Respektieren Sie es, spielt Ihr Scraper
fair.

**Sitemaps statt Crawling**: Eine Sitemap listet auf, was die Website indexiert haben
möchte. Blindes Link-Crawling kann fünfmal so viele URLs berühren, um denselben
Inhalt zu finden. Beginnen Sie mit der Sitemap, wenn eine existiert; das ist
schneller für Sie und schonender für den Server.

**Umfang vor Code**: Manche Websites verbieten das Scraping in robots.txt ganz;
manche haben Sitemaps, die bereits alles enthalten, was Sie brauchen. Zehn Sekunden
`discover()` sagen Ihnen, in welcher Situation Sie sich befinden, bevor Sie in einen
Parser investieren.

## Das Werkzeug

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

Nutzen Sie es als Bibliothek oder über die Kommandozeile — `--json` gibt die
vollständige Erkennung zum Weiterleiten an andere Werkzeuge aus, `--crawl` fügt den
Linkgraph-Schritt hinzu:

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json
```

Es ist freie Software und läuft auf Ihrer eigenen Hardware. Beginnen Sie jeden
Scraper mit Aufklärung.
