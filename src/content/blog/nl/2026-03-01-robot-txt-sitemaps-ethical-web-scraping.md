---
title: "Robots.txt, sitemaps en ethisch webscrapen"
description: "Voordat u een scraper bouwt, verken eerst de site. sitemapper leest robots.txt, haalt elke sitemap op en doorloopt optioneel de linkgraaf — zodat uw scraper vertrekt vanuit het eigen contract van de site in plaats van bruut geweld."
date: 2026-03-01
lang: nl
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

## Begin met verkenning, niet met bruut geweld

De slechtste scrapers crawlen blind. Ze bestoken een site, negeren
crawl-delay-declaraties, doorkruisen elk pad op zoek naar data en breken zodra
de structuur verandert door één enkele classnaam. De beste scrapers beginnen met
het lezen van de site.

Elke website publiceert een contract op drie plaatsen: **robots.txt**
(crawlbeleid), de **sitemaps** (wat de site zelf de moeite van het indexeren
waard acht) en de **linkgraaf** (hoe pagina's daadwerkelijk met elkaar verbonden
zijn). Dit eerst lezen beantwoordt drie vragen voordat u ook maar één regel
scrapingcode schrijft:

1. **Is deze site scrapebaar?** Wat staat robots.txt toe, en in welk tempo?
2. **Waar staat de data?** Wat brengen de sitemaps naar boven?
3. **Hoe is de site gestructureerd?** Hoe ziet de linktopologie eruit?

Dat is wat **[sitemapper](https://github.com/TigreGotico/sitemapper)** doet.

## Passieve ontdekking: robots.txt + sitemaps

`discover()` haalt robots.txt op en elke sitemap die het kan vinden — inclusief
`Sitemap:`-directives, sitemap-indexen die naar sub-sitemaps verwijzen en met
gzip gecomprimeerde bestanden — zonder ook maar één HTML-pagina te crawlen:

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

Het detail per agent is aanwezig wanneer u het nodig hebt: `info.robots.groups`
bevat elk `User-agent`-blok met zijn `allows`, `disallows` en `crawl_delay`, in
documentvolgorde. Als een site helemaal geen robots.txt heeft, geeft
`is_allowed()` voor alles `True` terug — de afwezigheid van een beleid is zelf
het beleid.

De opbrengst van sitemap-gedreven scrapen: in plaats van URL's te ontdekken door
te crawlen (traag, luidruchtig, onvolledig), vertrekt u vanuit de eigen lijst
van de beheerders. U scrapet wat de site belangrijk verklaart, in het tempo dat
zij aanvaardbaar acht, in een fractie van de verzoeken.

## Actieve ontdekking: de linkgraaf

Sommige sites publiceren geen sitemap. Voor die sites voert `crawl()` een
begrensde breedte-eerst-crawl uit vanaf de basis-URL en geeft het een
`LinkGraph` terug van interne pagina's en uitgaande links:

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

Dit vertelt u de werkelijke topologie — welke pagina's naar wat verwijzen —
zodat u kunt beslissen of de site überhaupt een gestructureerde scraper
rechtvaardigt. Ontdekking en crawling zijn bewust afzonderlijke aanroepen: de
passieve stap haalt nooit HTML op, zodat u altijd beleefd kunt verkennen voordat
u besluit te crawlen.

## Gebouwd op hetzelfde veerkrachtige transport

Siteverkenning is zinloos als de verkenning zelf door bot-muren wordt geblokkeerd.
Al het HTTP-verkeer van sitemapper loopt via
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) — het
TLS-impersonerende transport uit onze
**[post over anti-bot-transport](/nl/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** —
zodat robots.txt en sitemaps ook op door Cloudflare afgeschermde sites
terugkomen. Een FlareSolverr-instantie of een terugval op de Wayback Machine kan
worden ingeschakeld met omgevingsvariabelen (`SITEMAPPER_FLARESOLVERR_URL`,
`SITEMAPPER_WAYBACK_FALLBACK=1`) of via de `Sitemapper`-klasse.

## Waarom dit belangrijk is

**Crawl-delay**: een site die `Crawl-delay: 2` declareert, vertelt u hoe snel ze
benaderd wil worden. Negeer het en u wordt geblokkeerd — of u degradeert de site
voor iedereen. Respecteer het en uw scraper speelt eerlijk.

**Sitemaps boven crawlen**: een sitemap somt op wat de site geïndexeerd wil zien.
Blind links crawlen kan vijf keer zoveel URL's aanraken om dezelfde inhoud te
vinden. Begin bij de sitemap wanneer die er is; het is sneller voor u en lichter
voor de server.

**Bereik vóór code**: sommige sites verbieden scrapen ronduit in robots.txt;
andere hebben sitemaps die al alles bevatten wat u nodig hebt. Tien seconden
`discover()` vertellen u in welke situatie u zich bevindt voordat u in een
parser investeert.

## Het gereedschap

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

Gebruik het als bibliotheek, of vanaf de commandoregel — `--json FILE` schrijft de
volledige ontdekking naar een bestand voor andere tools om te gebruiken, `--crawl` voegt
de linkgraaf-stap toe:

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json out.json
```

Het is vrije software en draait op uw eigen hardware. Begin elke scraper met
verkenning.
