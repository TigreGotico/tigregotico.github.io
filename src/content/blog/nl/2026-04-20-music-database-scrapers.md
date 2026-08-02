---
title: "Wij stellen onze Muziekdatabase-Scrapers voor"
description: "Een rondleiding langs de familie getypeerde Python-clients die we onderhouden voor muziekbronnen — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio en de grote muziekencyclopedieën — die allemaal consistente, getypeerde mediametadata uitsturen achter één schone interface en op dezelfde compliante HTTP-transportlaag met laag volume draaien."
date: 2026-04-20
lang: nl
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Scrapers"
  - "Media Metadata"
  - "Music"
  - "Python"
  - "FOSS"
draft: false
---

## Eén interface voor het hele muzikale web

Het muziekweb is gefragmenteerd over veel onafhankelijke sites. Bandcamp verkoopt je een FLAC en een Creative Commons-licentie. SoundCloud streamt een remix die niemand anders host. SomaFM beheert een verzameling luisteraargesteunde radiokanalen. Een aantal door de community gerunde sites houdt zorgvuldig samengestelde encyclopedieën bij van progressieve rock, jazz, klassiek en metal. Elke site heeft zijn eigen opmaak, zijn eigen eigenaardigheden, zijn eigen idee van wat een "track" überhaupt is.

Wij onderhouden een familie van kleine, gerichte, opensource Python-clients die die chaos temmen. Ze doen in wezen allemaal hetzelfde: ze reiken in een muziekbron en geven **getypeerde mediametadata-modellen** terug, gevalideerde objecten in plaats van broze dictionaries, zodat de rest van je code zich er nooit om hoeft te bekommeren van welke site de gegevens komen. Zeven van de negen zijn op PyPI gepubliceerd. De andere twee installeer je rechtstreeks vanaf GitHub. Ze spreken allemaal hetzelfde vocabulaire.

Hier is de rondleiding.

## Streaming en radio

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** scrapet Bandcamp. Het zoekt tracks, albums, artiesten en labels, bladert op genretag, haalt aanbevelingen en verwante artiesten op vanuit een zaadje, en extraheert een streambare MP3-URL. Zoekopdrachten geven getypeerde `Release`-objecten terug met titel, artwork, genres, credits en een licentieveld in SPDX-stijl met een `is_open()`-controle, zodat je een Creative Commons-uitgave kunt onderscheiden van een met alle rechten voorbehouden. Een albumconversie met volledige getrouwheid vult op verzoek de geordende tracklist in.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** is onze SoundCloud-client. Drie onafhankelijke backends, een metadatarijke API-backend, een scraper voor HTML zonder afhankelijkheden, en een yt-dlp-backend, zitten achter één orkestrator die terugvalt van de één op de volgende. Hij zoekt tracks en personen, resolvet directe stream-URL's (progressief of HLS), downloadt tracks en hele playlists, en levert een terminalapplicatie, `nds`, om vanaf de opdrachtregel te zoeken en af te spelen. Uitgaven komen terug met codec, bitrate, genres, land, SPDX-licentie en volledige tracklists van sets.

**[radiosoma](https://github.com/TigreGotico/radiosoma)** omhult de publieke kanalen-API van SomaFM. SomaFM heeft een open API, en de client modelleert het rechtstreeks: elk kanaal is één werk, en elke streamcodering (130 kbps AAC, 256 kbps MP3, 64 en 32 kbps HE-AAC) wordt zijn eigen `Release` van dat kanaal, zodat een consument de beste keuze kan maken en op identiteit kan dedupliceren. De feed met recente tracks toont een overzicht van wat er heeft gespeeld.

**[tunein](https://github.com/TigreGotico/tunein)** is een onofficiële TuneIn-client voor de lineaire radio- en IPTV-zenders van de wereld. Een snelle route geeft alleen de zoek-payload terug. Een optionele verrijkingsoproep vult genre, taal, land, roepnaam en slogan aan. TuneIn geeft meerdere stream-URL's per zender terug (verschillende bitrates, mirrors en protocollen), dus wordt elk zijn eigen `Release`, waardoor de consument op het moment van afspelen kan kiezen. Een kleine CLI geeft je uitvoer in tabel- of JSON-vorm.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** praat met de publieke API van iHeartRadio, zonder dat er een sleutel of account nodig is. Het zoekt zenders, podcasts, artiesten, tracks en playlists, haalt podcastafleveringen op met directe audiostream-URL's, en laat zender- en artiestopzoekingen gelijktijdig lopen via parallelle detailophalingen. Elk model biedt de helpers `to_external_ids()` en `to_signals()` voor gebruik in een getypeerde metadatapijplijn.

## Muziekencyclopedieën en archieven

De tweede helft van de familie richt zich op de grote community-catalogi.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)** (Jazz Music Archives) en **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)** (Classical Archives) delen een bijna identieke vorm. Zowel pyprogarchives als pyjazzmusicarchives installeer je rechtstreeks vanaf hun GitHub-repository in plaats van via PyPI. Alle drie bladeren door de A–Z-index, zoeken op naam, en halen een volledige artiest- of componistpagina op met biografie, land en een door leden beoordeelde discografie. Prog en Jazz Archives scrapen HTML. Classical Archives omhult een publieke JSON-API en toont de albums van een componist *en* een recursief afgeplatte werkenboom. Elk model draagt de stabiele canonieke id van de site via `to_external_ids_dict()`, nuttig om de ene catalogus met de andere te kruisen.

**[pymetal](https://github.com/TigreGotico/pymetal)** is onze client voor Encyclopaedia Metallum, de Metal Archives, en de meest ambitieuze van het stel. De meeste scrapers platten een track af tot `(id, title, band, album)`. pymetal behoudt wat Metal Archives apart houdt: een track kan meerdere bands crediteren (splits, samenwerkingen), de bezetting van een band verandert in de tijd, en een track kan op vele uitgaven verschijnen (compilaties, heruitgaven, singles). Het modelleert elk als een aparte entiteit geïndexeerd op archief-id, zodat opnieuw scrapen idempotent is. Het endpoint-oppervlak is breed: geavanceerd zoeken op band/album/nummer, volledige uitgavepagina's met attributie per band op splits, bezettingen gepartitioneerd op status met roldatumbereiken, recensies, aanbevelingen, externe links en songteksten, allemaal als Pydantic v2-modellen die via JSON heen en weer gaan.

Naast muziek scrapet **[tutubo](https://github.com/TigreGotico/tutubo)** YouTube en YouTube Music, en dekt **[pymal](https://github.com/TigreGotico/pymal)** MyAnimeList, waarmee dezelfde getypeerde metadatapatronen worden uitgebreid naar bredere mediacategorieën. Allemaal sturen ze hetzelfde vocabulaire uit, zodat één stroomafwaartse consument alles uniform afhandelt.

## Gebouwd voor compliante toegang met laag volume

Deze clients halen alleen publieke cataloguspagina's op, met lage verzoekvolumes, en controleren de `robots.txt` van elke site voordat ze scrapen. Zie het
**[artikel over robots.txt &amp; sitemaps](/nl/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
voor hoe die verkenningsstap werkt. In de hele familie is de HTTP-laag pluggable. Standaard gebruiken de clients een transport waarvan de TLS-handshake overeenkomt met die van een echte browser (`curl_cffi` dat Chrome's TLS/JA3 nabootst), zodat een welgemanierde client niet ten onrechte als kwaadaardige automatisering wordt geclassificeerd door detectiesystemen die op scriptmatig misbruik zijn afgesteld. De encyclopedieën achter Cloudflare kunnen ook via een FlareSolverr-instantie routeren voor live gegevens, of als terugval lezen uit de Wayback Machine van het Internet Archive. De parseerlaag is onafhankelijk van hoe de HTML binnenkomt, zodat dezelfde code werkt ongeacht welk transport je kiest.

## Een multi-bron-muziekcatalogus

De echte beloning is wat er gebeurt wanneer je deze niet langer als negen aparte tools beschouwt. Ze sturen allemaal hetzelfde getypeerde metadatavocabulaire uit en tonen allemaal canonieke externe id's. Dat betekent dat je één artiest kunt uitwaaieren over Bandcamp, SoundCloud, de radiogidsen en de encyclopedieën, en de resultaten vervolgens kunt samenvouwen tot één catalogus: gededupliceerd op identiteit, licentiebewust, en klaar om een aanbevelingsengine, een mediaserver of een onderzoeksdataset te voeden.

Elk van deze clients is vrije software, zelf te hosten, en draait op je eigen hardware, zonder dat er een API-sleutel nodig is. Kies de bron die je interesseert: doe `pip install` als hij op PyPI staat, of `pip install git+https://github.com/TigreGotico/<repo>` voor pyprogarchives en pyjazzmusicarchives, die alleen op GitHub staan. Begin dan te bouwen.

Alle scrapers draaien op onze **[samenstelbare, kant-en-klare requests-sessies](/nl/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**. De streaming- en radioclients sturen het **[mediavocab](https://github.com/TigreGotico/mediavocab)**-schema rechtstreeks uit, en elke client toont canonieke externe id's, zodat muziekmetadata integreert met **[media-archivist](https://github.com/TigreGotico/media-archivist)**, onze multi-bron-indexer en dedupliceerende metadataserver.
