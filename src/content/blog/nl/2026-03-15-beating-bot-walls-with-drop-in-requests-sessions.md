---
title: "Botmuren Doorbreken met Samenstelbare, Kant-en-klare requests-sessies"
description: "Hoe wij betrouwbare toegang tot publieke data behouden zonder een headless browser te starten in het kritieke pad: TLS-vingerafdrukimpersonatie, een FlareSolverr-proxy voor JS-uitdagingen, een terugval op de Wayback Machine en IP-rotatie — allemaal achter twee samenstelbare subklassen van requests.Session, unblock_requests en anon_requests."
date: 2026-03-15
lang: nl
author: "Casimiro Ferreira"
tags:
  - "HTTP"
  - "Scraping"
  - "Cloudflare"
  - "Anti-Bot"
  - "Python"
  - "Open Source"
draft: false
---

Een groot deel van ons werk — clients voor mediametadata, catalogusverrijking,
archivering — is afhankelijk van het betrouwbaar lezen van **publieke** webpagina's.
Het probleem zijn zelden de data; het is de muur ervoor. En die muur stelt twee
afzonderlijke vragen:

- **"Wat ben je?"** — Cloudflare en soortgelijke diensten blokkeren verzoeken niet om
  *wat* je vraagt, maar om *hoe* je eruitziet op de lijn: je TLS-handshake, je
  JA3-vingerafdruk, of je een JavaScript-uitdaging kunt uitvoeren.
- **"Wie ben je?"** — IP-reputatie en snelheidslimieten negeren je vingerafdruk
  volledig; ze tellen hoeveel verzoeken van één adres komen.

De twee vragen zijn orthogonaal, dus beantwoorden we ze met twee kleine bibliotheken
die netjes op elkaar stapelen: **unblock_requests** beantwoordt *wat ben je*,
**anon_requests** beantwoordt *wie ben je*. Beide zijn kant-en-klare vervangers voor
een `requests`-sessie in alledaagse code. Dit artikel gaat specifiek over die
transportlaag — het gedeelte van de bytes op de lijn — en niet over het parsen of de
pipeline die daarbovenop rust.

## De ontwerpbeperking: de vorm van `requests` behouden

`unblock_requests`-sessies vormen een subklasse van `requests.Session` en overschrijven
alleen `request()` — al het overige (`.get()`, `.post()`, cookies, headers,
context-managersemantiek) wordt geërfd, zodat alles wat getypeerd is tegen
`requests.Session` ze ongewijzigd accepteert. De `anon_requests`-sessies omhullen in
plaats van een subklasse te vormen — ze bieden dezelfde werkwoordmethoden en
context-managerinterface, maar bouwen hun interne sessie bij elke rotatie opnieuw op:

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

Daar staat, in één regel, de volledige ethische en technische houding: we
automatiseren geen browser-als-gebruiker, we bouwen een *veerkrachtige HTTP-client*
voor data die al publiek zijn. Er verschijnt geen browser met interface op iemands
scherm, en niets in het kritieke pad heeft een display nodig.

## Laag één: `unblock_requests` en zijn transporten

`unblock_requests` verdedigt tegen **botdetectie**. Je kiest een transport met het
`mode=`-argument (of de omgevingsvariabele `UNBLOCK_REQUESTS_TRANSPORT` — expliciete
argumenten winnen altijd). De vier voornaamste:

| Modus | Wat het doet |
|---|---|
| `curl_cffi` *(standaard)* | Chrome-TLS/JA3-impersonatie via `curl_cffi`. Passeert de botcontrole op de meeste netwerken zonder extra infrastructuur. |
| `requests` | Gewone `requests`, geen impersonatie. |
| `flaresolverr` | Stuurt door via een FlareSolverr headless browser die de JS-uitdaging oplost — **live** data. |
| `wayback` | Leest de meest recente snapshot van het Internet Archive — verouderd, maar heeft niets nodig. |

De standaard, `curl_cffi`, is de goedkope overwinning. De meeste "je bent een
bot"-vonnissen zijn een mismatch van de TLS-vingerafdruk: standaard `requests` (via
OpenSSL) handshaket in niets zoals Chrome. `curl_cffi` imiteert een echte
Chrome-build (`impersonate="chrome"` standaard), zodat de handshake en de JA3 op één
lijn liggen en de controle simpelweg slaagt. Geen JavaScript uitgevoerd, geen browser
gestart.

Wanneer een site escaleert naar een echte interactieve JS-uitdaging, is `curl_cffi`
niet voldoende — iets moet de uitdaging uitvoeren. Dat is de `flaresolverr`-modus: een
[FlareSolverr](https://github.com/FlareSolverr/FlareSolverr)-instantie die je zelf
host, doet het oplossen in een headless browser **buiten je proces**, en
`unblock_requests` POST't er slechts naartoe en haalt de opgeloste HTML uit het
antwoord. Het instellen van `flaresolverr_url` selecteert deze modus automatisch:

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## Sierlijke degradatie naar het archief

Infrastructuur heeft slechte dagen — FlareSolverr ligt eruit, de site is
onbereikbaar, de uitdaging is op dit moment onoplosbaar. In plaats van de hele taak te
laten mislukken, kan de sessie terugvallen op de **Wayback Machine**.
Uitdagingsdetectie is heuristisch: een klein hulpmiddel `is_challenge()` snuffelt aan
het eerste deel van de body op zoek naar de verraderlijke markeringen van een
Cloudflare-tussenscherm ("just a moment", `challenge-platform`, `cf_chl_opt`,
`cf-mitigated`). Bij een geblokkeerde GET, als `wayback_fallback` aanstaat, lost de
sessie de meest recente snapshot op via de beschikbaarheids-API van `archive.org` en
retourneert de ruwe bytes ervan (de ruwe vorm `…id_/`, zonder werkbalk of
herschrijving van links). archive.org is niet Cloudflare-afgeschermd, dus gewone
`requests` bereikt het.

Twee implementatienotities die het waard zijn te kennen: in de modi `wayback` en
`flaresolverr` is het resultaat een *gesynthetiseerde* maar echte `requests.Response`,
opgebouwd uit de opgehaalde HTML — zodat `stream=`, aangepaste adapters en connection
pooling daar niet van toepassing zijn, terwijl de modi `requests`/`curl_cffi` volledig
native zijn. En de terugval treedt alleen op bij GET's; we spelen nooit stilzwijgend
een muterend verzoek opnieuw af vanuit een archief.

## Laag twee: `anon_requests` en IP-rotatie

Het orthogonale probleem is **IP-reputatie**. Zelfs een perfecte vingerafdruk krijgt
een snelheidslimiet of een verbod als elk verzoek van één adres komt.
`anon_requests` handelt dat af met `RotatingProxySession` (gescrapete publieke
proxy's, optionele validatie, SOCKS5/HTTP) en `RotatingTorSession` (roterende
Tor-circuits). Elk verzoek gaat uit via een verse exit, en dode proxy's worden bij een
verbindingsfout weggeroteerd.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## De compositie: rotatie **en** omzeiling tegelijk

Deze twee bibliotheken zijn ontworpen om te stapelen in plaats van te overlappen. De
`anon_requests`-sessies accepteren een `session_factory` — elke callable die een
`requests.Session` retourneert, standaard `requests.Session`. De rotatie- en
proxy-instellingen worden toegepast op wat die factory ook retourneert. Zo injecteer je
een `CloudflareSession` als factory en krijg je beide gedragingen uit één object:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates the IP *and* solves Cloudflare
```

De geroteerde proxy stroomt door *elk* transport — ook naar binnen in FlareSolverr,
dat zijn headless browser aandrijft via het `proxy`-veld van het oplosverzoek. Zo is
het IP dat de uitdaging oplost hetzelfde geroteerde IP dat de rest van het verzoek
gebruikt: geen scheiding tussen vingerafdruk en exitnode die een verdediger zou kunnen
opmerken.

## Waarom deze vorm

Elk aandachtspunt in zijn eigen dunne subklasse van `requests.Session` houden betekent
dat aanroepers alleen kiezen wat ze nodig hebben — alleen TLS-impersonatie, de
volledige stack van rotatie-plus-oplossing, of iets daartussenin — door een
constructor te verwisselen, niet door hun HTTP-code te herschrijven. Het dure,
zwaargewicht instrument (een echte browser) blijft *buiten het proces* in FlareSolverr
en wordt alleen opgeroepen wanneer een JS-uitdaging het werkelijk vereist; het gewone
geval is een goedkope, geïmiteerde handshake. En wanneer het live web weigert,
antwoordt het archief.

De naad van de `session_factory` is waar de compositie plaatsvindt, en het is wat de
bibliotheken onafhankelijk uitbreidbaar houdt: voeg een transportmodus toe aan
`unblock_requests` en `anon_requests` stelt hem gratis samen. Veerkrachtige toegang tot
publieke data, netjes gedaan.

Beide zijn FOSS en zelf-hostbaar:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) en
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

Deze transporten drijven al onze **[muziekdatabase-scrapers](/nl/blog/2026-04-20-music-database-scrapers)** aan. Voor siteverkenning voordat je een scraper bouwt, zie **[sitemapper](https://github.com/TigreGotico/sitemapper)** en het **[artikel over robots.txt &amp; sitemaps](/nl/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**.
