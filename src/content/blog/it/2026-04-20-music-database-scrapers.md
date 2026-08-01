---
title: "Presentiamo i Nostri Scraper di Database Musicali"
description: "Una panoramica della famiglia di client Python tipizzati che manteniamo per le fonti musicali — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio e le grandi enciclopedie musicali — che emettono tutti metadati multimediali coerenti e tipizzati dietro un'unica interfaccia pulita e viaggiano sullo stesso trasporto HTTP conforme e a basso volume."
date: 2026-04-20
lang: it
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

## Un'unica interfaccia per tutto il web musicale

Il web musicale è frammentato su molti siti indipendenti. Bandcamp vi vende un FLAC e una licenza Creative Commons; SoundCloud trasmette in streaming un remix che nessun altro ospita; SomaFM gestisce una serie di canali radio sostenuti dagli ascoltatori; e diversi siti gestiti dalla comunità conservano enciclopedie curate di progressive rock, jazz, musica classica e metal. Ogni sito ha il proprio markup, le proprie stranezze, la propria idea di cosa sia persino una "traccia".

Manteniamo una famiglia di piccoli client Python open source e mirati che domano quel caos. Ognuno di essi fa, nello spirito, la stessa cosa: raggiunge una fonte musicale e vi restituisce **modelli di metadati multimediali tipizzati** — oggetti validati anziché fragili dizionari — così che il resto del vostro codice non debba mai preoccuparsi di quale sito provengano i dati. Sette dei nove sono pubblicati su PyPI; gli altri due si installano direttamente da GitHub. Parlano tutti lo stesso vocabolario.

Ecco la panoramica.

## Streaming e radio

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** fa scraping di Bandcamp: cerca tracce, album, artisti ed etichette; naviga per tag di genere; recupera raccomandazioni e artisti correlati a partire da un seme; ed estrae un URL MP3 riproducibile in streaming. Le ricerche restituiscono oggetti `Release` tipizzati che portano titolo, copertina, generi, crediti e — aspetto cruciale per chi ha a cuore il FOSS — un campo di licenza in stile SPDX con un controllo `is_open()`, così da poter distinguere una release Creative Commons da una con tutti i diritti riservati. Una conversione completa dell'album popola su richiesta la tracklist ordinata.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** è il nostro client per SoundCloud, ed è il coltellino svizzero del gruppo. Tre backend indipendenti — un backend API ricco di metadati, uno scraper HTML privo di dipendenze e un backend yt-dlp — stanno dietro un unico orchestratore che ripiega con eleganza da uno al successivo. Cerca tracce e persone, risolve URL di stream diretti (progressivi o HLS), scarica tracce e intere playlist e include persino un'applicazione da terminale, `nds`, per cercare e riprodurre dalla riga di comando. Le release tornano con codec, bitrate, generi, paese, licenza SPDX e tracklist complete dei set.

**[radiosoma](https://github.com/TigreGotico/radiosoma)** avvolge l'API pubblica dei canali di SomaFM. SomaFM è l'estremità amichevole e a API aperta dello spettro, e il client la modella in modo pulito: ogni canale è un'opera unica, e **ogni codifica di stream** — AAC a 130 kbps, MP3 a 256 kbps, HE-AAC a 64 e 32 kbps — diventa una propria `Release` di quel canale, così che un consumatore possa scegliere quella più adatta e deduplicare per identità. Il feed delle tracce recenti emerge come un ordinato programma di ciò che è stato trasmesso.

**[tunein](https://github.com/TigreGotico/tunein)** è un client non ufficiale di TuneIn per le stazioni radio lineari e IPTV di tutto il mondo. Un percorso veloce restituisce solo il payload di ricerca; una chiamata di arricchimento opzionale compila genere, lingua, paese, nominativo e slogan. Poiché TuneIn restituisce più URL di stream per stazione — bitrate, mirror e protocolli diversi — ognuno diventa una propria `Release`, lasciando di nuovo che sia il consumatore a scegliere al momento della riproduzione. Una piccola CLI vi offre output in tabella o JSON.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** dialoga con l'API pubblica di iHeartRadio — nessuna chiave, nessun account. Cerca stazioni, podcast, artisti, tracce e playlist; recupera episodi di podcast con URL di stream audio diretti; e si affida a recuperi di dettagli in parallelo, così che le ricerche di stazioni e artisti vengano eseguite in modo concorrente. Ogni modello offre gli helper `to_external_ids()` e `to_signals()` per inserirsi direttamente in una pipeline di metadati tipizzata.

## Enciclopedie e archivi musicali

La seconda metà della famiglia punta ai grandi cataloghi della comunità.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)** (Jazz Music Archives) — entrambi installabili direttamente dai rispettivi repository GitHub anziché da PyPI — e **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)** (Classical Archives) condividono una forma quasi identica: navigano l'indice A–Z, cercano per nome e recuperano una pagina completa di artista o compositore con biografia, paese e una discografia valutata dai membri. Prog e Jazz Archives fanno scraping di HTML; Classical Archives avvolge un'API JSON pubblica ed espone gli album di un compositore *e* un albero di opere appiattito ricorsivamente. Ogni modello porta l'id canonico stabile del sito tramite `to_external_ids_dict()`, che è esattamente ciò che serve per incrociare un catalogo con un altro.

**[pymetal](https://github.com/TigreGotico/pymetal)** è il nostro client per l'Encyclopaedia Metallum, il Metal Archives — e il più ambizioso del gruppo. La maggior parte degli scraper appiattisce una traccia a `(id, title, band, album)`. pymetal si rifiuta di perdere ciò che Metal Archives tiene separato: una traccia può accreditare **più band** (split, collaborazioni), la **formazione di una band è suddivisa nel tempo**, e una traccia può **apparire su molte release** (compilation, ristampe, singoli). Modella ciascuno come entità di prima classe indicizzata dall'id d'archivio, così che i re-scraping siano idempotenti. La superficie di endpoint è ampia — ricerca avanzata di band/album/canzoni, pagine complete di release con attribuzione per band negli split, formazioni partizionate per status con intervalli di date dei ruoli, recensioni, raccomandazioni, link esterni e testi — il tutto come modelli Pydantic v2 che fanno il round-trip attraverso JSON.

Oltre alla musica, **[tutubo](https://github.com/TigreGotico/tutubo)** fa scraping di YouTube e YouTube Music, e **[pymal](https://github.com/TigreGotico/pymal)** copre MyAnimeList — estendendo gli stessi pattern di metadati tipizzati a categorie multimediali più ampie. Tutti emettono lo stesso vocabolario, così un unico consumatore a valle gestisce tutto in modo uniforme.

## Costruiti per un accesso conforme e a basso volume

Questi client recuperano solo pagine di catalogo pubbliche, a bassi volumi di richiesta, e controllano il `robots.txt` di ciascun sito prima di fare scraping — vedi il
**[articolo su robots.txt e sitemap](/it/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
per come funziona quel passo di ricognizione. In tutta la famiglia il livello HTTP è **collegabile a moduli**: per impostazione predefinita i client usano un trasporto il cui handshake TLS corrisponde a quello di un vero browser (`curl_cffi` che imita TLS/JA3 di Chrome), così che un client ben educato non venga classificato erroneamente come automazione malevola da sistemi di rilevazione calibrati per l'abuso automatizzato. Le enciclopedie protette da Cloudflare possono inoltre passare attraverso un'istanza FlareSolverr per i dati in tempo reale, o leggere dalla Wayback Machine dell'Internet Archive come ripiego. Il livello di parsing è deliberatamente indipendente da come arriva l'HTML, così lo stesso codice funziona qualunque trasporto scegliate.

## Un catalogo musicale multi-fonte

Il vero premio è ciò che accade quando smettete di pensare a questi come nove strumenti separati. Poiché emettono tutti lo stesso vocabolario di metadati tipizzati ed espongono tutti id esterni canonici, potete distribuire un singolo artista su Bandcamp, SoundCloud, le directory radio e le enciclopedie, poi fondere i risultati in un unico catalogo coerente — deduplicato per identità, consapevole delle licenze e pronto ad alimentare un motore di raccomandazione, un media server o un dataset di ricerca.

Ognuno di questi client è software libero, auto-ospitabile e gira sul vostro hardware, senza bisogno di alcuna chiave API. Scegliete la fonte che vi interessa: `pip install` se è su PyPI, oppure `pip install git+https://github.com/TigreGotico/<repo>` per pyprogarchives e pyjazzmusicarchives, che sono solo su GitHub — e cominciate a costruire.

Tutti gli scraper viaggiano sulle nostre **[sessioni requests componibili e pronte all'uso](/it/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**. I client di streaming e radio emettono direttamente lo schema **[mediavocab](https://github.com/TigreGotico/mediavocab)**, e ogni client espone id esterni canonici, così che i metadati musicali si integrino con **[media-archivist](https://github.com/TigreGotico/media-archivist)**, il nostro indicizzatore multi-fonte e server di metadati deduplicante.
