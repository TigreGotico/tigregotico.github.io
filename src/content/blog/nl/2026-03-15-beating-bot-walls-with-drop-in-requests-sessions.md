---
title: "Samenstelbare, kant-en-klare requests-sessies voor veerkrachtige toegang tot publieke data"
description: "Twee samenstelbare subklassen van requests.Session voor het betrouwbaar lezen van publieke webpagina's zonder headless browser in het kritieke pad: TLS-compatibel transport, een FlareSolverr-proxy voor JS-uitdagingen, een terugval op de Wayback Machine en IP-gediversifieerde verzoeken: unblock_requests en anon_requests."
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

Een groot deel van ons werk (clients voor mediametadata, catalogusverrijking,
archivering) is afhankelijk van het betrouwbaar lezen van **publieke** webpagina's.
Het probleem zijn zelden de data. Het is dat veel bot-detectie-infrastructuur is
afgesteld tegen scriptmatige aanvallen en elke welgemanierde niet-browserclient
daardoor ten onrechte als zodanig classificeert. Dat speelt op twee afzonderlijke
assen:

- **"Wat ben je?"** Cloudflare en soortgelijke diensten markeren verzoeken niet om
  *wat* je vraagt, maar om *hoe* je eruitziet op de lijn: je TLS-handshake, je
  JA3-vingerafdruk (een hash van hoe je TLS-handshake is opgebouwd, die verschilt
  tussen een browser en een gewone HTTP-bibliotheek, ook al vragen beide dezelfde
  pagina op), of je een JavaScript-uitdaging kunt uitvoeren. Een gewone
  `requests`-handshake lijkt in niets op die van een browser, dus wordt hij
  opgevangen door controles die op scriptmatig misbruik gericht zijn, zelfs
  wanneer het verkeer zelf onschuldig is.
- **"Wie ben je?"** IP-reputatie en snelheidslimieten negeren je vingerafdruk
  volledig. Ze tellen hoeveel verzoeken van één adres komen, wat een enkele
  welgemanierde client net zo goed kan treffen als een client die misbruik maakt.

De twee assen zijn orthogonaal, dus beantwoorden we ze met twee kleine bibliotheken
die netjes op elkaar stapelen: **unblock_requests** beantwoordt *wat ben je*,
**anon_requests** beantwoordt *wie ben je*. Beide zijn kant-en-klare vervangers voor
een `requests`-sessie in alledaagse code. Dit artikel gaat specifiek over die
transportlaag, het gedeelte van de bytes op de lijn, en niet over het parsen of de
pipeline die daarbovenop rust.

**Bereik, ondubbelzinnig gesteld:** deze transporten zijn alleen voor publieke,
niet-geauthenticeerde pagina's. Ze respecteren `robots.txt` en elke gedeclareerde
crawl-delay (zie ons **[artikel over robots.txt &amp; sitemaps](/nl/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
voor hoe wij dat controleren voordat we een scraper schrijven), en elke client die
erop wordt gebouwd, houdt zich aan lage verzoekvolumes, zodat een doelserver nooit
merkbare belasting van ons ziet. Dat is geen achteraf toegevoegde disclaimer. Het is
een echte technische beperking op hoe deze sessies worden gebruikt, want een
veerkrachtige client die ook onbeleefd is, ondermijnt zijn eigen doel.

## De ontwerpbeperking: de vorm van `requests` behouden

`unblock_requests`-sessies vormen een subklasse van `requests.Session` en overschrijven
alleen `request()`. Al het overige (`.get()`, `.post()`, cookies, headers,
context-managersemantiek) wordt geërfd, zodat alles wat getypeerd is tegen
`requests.Session` ze ongewijzigd accepteert. De `anon_requests`-sessies omhullen in
plaats van een subklasse te vormen. Ze bieden dezelfde werkwoordmethoden en
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

`unblock_requests` maakt een gewone Python-client interoperabel met **botdetectiecontroles
die zijn afgesteld op browsers**. Je kiest een transport met het
`mode=`-argument (of de omgevingsvariabele `UNBLOCK_REQUESTS_TRANSPORT`; expliciete
argumenten winnen altijd). De vier voornaamste:

| Modus | Wat het doet |
|---|---|
| `curl_cffi` *(standaard)* | Chrome-TLS/JA3-impersonatie via `curl_cffi`. Slaagt als een browservormige handshake op de meeste netwerken zonder extra infrastructuur. |
| `requests` | Gewone `requests`, geen impersonatie. |
| `flaresolverr` | Stuurt door via een FlareSolverr headless browser die de JS-uitdaging oplost: **live** data. |
| `wayback` | Leest de meest recente snapshot van het Internet Archive: verouderd, maar heeft niets nodig. |

De standaard, `curl_cffi`, is de goedkope overwinning. De meeste "je bent een
bot"-vonnissen zijn een mismatch van de TLS-vingerafdruk: standaard `requests` (via
OpenSSL) handshaket in niets zoals Chrome. `curl_cffi` imiteert een echte
Chrome-build (`impersonate="chrome"` standaard), zodat de handshake en de JA3 op één
lijn liggen en de controle simpelweg slaagt. Geen JavaScript uitgevoerd, geen browser
gestart.

Wanneer een site escaleert naar een echte interactieve JS-uitdaging, is `curl_cffi`
niet voldoende. Iets moet de uitdaging uitvoeren. Dat is de `flaresolverr`-modus: een
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

Infrastructuur heeft slechte dagen: FlareSolverr ligt eruit, de site is
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
opgebouwd uit de opgehaalde HTML, zodat `stream=`, aangepaste adapters en connection
pooling daar niet van toepassing zijn, terwijl de modi `requests`/`curl_cffi` volledig
native zijn. En de terugval treedt alleen op bij GET's. We spelen nooit stilzwijgend
een muterend verzoek opnieuw af vanuit een archief.

## Laag twee: `anon_requests` en IP-rotatie

Het orthogonale probleem is **IP-reputatie**. Zelfs een perfect browservormige
handshake kan een snelheidslimiet krijgen als elk verzoek van één adres komt.
Volumegebaseerde heuristieken kijken naar het adres, niet naar de vingerafdruk.
`anon_requests` spreidt de belasting over adressen met `RotatingProxySession`
(gescrapete publieke proxy's, optionele validatie, SOCKS5/HTTP) en
`RotatingTorSession` (roterende Tor-circuits), zodat een client met laag volume
nooit wordt aangezien voor een client die een site vanaf één IP bestookt. Elk
verzoek gaat uit via een verse exit, en dode proxy's worden bij een
verbindingsfout weggeroteerd.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## De compositie: gespreide belasting **en** een compatibele handshake tegelijk

Deze twee bibliotheken zijn ontworpen om te stapelen in plaats van te overlappen. De
`anon_requests`-sessies accepteren een `session_factory`, elke callable die een
`requests.Session` retourneert, standaard `requests.Session`. De rotatie- en
proxy-instellingen worden toegepast op wat die factory ook retourneert. Zo injecteer je
een `CloudflareSession` als factory en krijg je beide gedragingen uit één object:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # spreads load across IPs *and* uses a browser-compatible handshake
```

De geroteerde proxy stroomt door *elk* transport, ook naar binnen in FlareSolverr,
dat zijn headless browser aandrijft via het `proxy`-veld van het oplosverzoek. Zo
blijft het hele verzoek (handshake, uitdaging-oplossing en exit-IP) end-to-end
consistent, wat correct gedrag is voor een client die niet probeert eruit te
zien als meer dan één bezoeker.

## Waarom deze vorm

Elk aandachtspunt in zijn eigen dunne subklasse van `requests.Session` houden betekent
dat aanroepers alleen kiezen wat ze nodig hebben (alleen TLS-impersonatie, de
volledige stack van rotatie-plus-oplossing, of iets daartussenin) door een
constructor te verwisselen, niet door hun HTTP-code te herschrijven. Het dure,
zwaargewicht instrument (een echte browser) blijft *buiten het proces* in FlareSolverr
en wordt alleen opgeroepen wanneer een JS-uitdaging het werkelijk vereist. Het gewone
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
