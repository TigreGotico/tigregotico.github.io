---
title: "Wir stellen vor: Unsere Scraper für Musikdatenbanken"
description: "Eine Führung durch die Familie typisierter Python-Clients, die wir für Musikquellen pflegen — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio und die großen Musikenzyklopädien — die allesamt konsistente, typisierte Media-Metadaten hinter einer sauberen Schnittstelle ausgeben und auf demselben widerstandsfähigen Anti-Bot-Transport aufsetzen."
date: 2026-04-20
lang: de
author: "Casimiro Ferreira"
tags:
  - "Scrapers"
  - "Media Metadata"
  - "Music"
  - "Python"
  - "FOSS"
draft: false
---

## Eine Schnittstelle für das gesamte musikalische Web

Das Musik-Web ist herrlich fragmentiert. Bandcamp verkauft Ihnen ein FLAC und eine Creative-Commons-Lizenz; SoundCloud streamt einen Remix, den sonst niemand hostet; SomaFM betreibt eine beliebte Auswahl an hörerfinanzierten Radiokanälen; und eine stille Ecke des Internets pflegt akribisch kuratierte Enzyklopädien zu Progressive Rock, Jazz, Klassik und Metal. Jede Seite hat ihre eigene Auszeichnung, ihre eigenen Eigenheiten, ihre eigene Vorstellung davon, was ein „Track" überhaupt ist.

Wir pflegen eine Familie kleiner, fokussierter, quelloffener Python-Clients, die dieses Chaos bändigen. Jeder von ihnen tut im Grunde dasselbe: Er greift in eine Musikquelle hinein und gibt Ihnen **typisierte Media-Metadaten-Modelle** zurück — validierte Objekte statt brüchiger Dictionaries — sodass sich der Rest Ihres Codes nie darum kümmern muss, von welcher Seite die Daten stammen. Installieren Sie einen, installieren Sie alle neun; sie sprechen dasselbe Vokabular.

Hier ist die Führung.

## Streaming und Radio

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** scrapt Bandcamp: Suche nach Tracks, Alben, Künstlern und Labels; Durchstöbern nach Genre-Tag; Abrufen von Empfehlungen und verwandten Künstlern ausgehend von einem Startpunkt; und Extrahieren einer streambaren MP3-URL. Suchen liefern typisierte `Release`-Objekte, die Titel, Artwork, Genres, Credits und — entscheidend für FOSS-Bewusste — ein Lizenzfeld im SPDX-Stil mit einer `is_open()`-Prüfung tragen, sodass Sie ein Creative-Commons-Release von einem mit allen vorbehaltenen Rechten unterscheiden können. Eine vollständige Album-Konvertierung füllt die geordnete Trackliste bei Bedarf.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** ist unser SoundCloud-Client und das Schweizer Taschenmesser der Sammlung. Drei unabhängige Backends — ein metadatenreiches API-Backend, ein abhängigkeitsfreier HTML-Scraper und ein yt-dlp-Backend — sitzen hinter einem Orchestrator, der elegant von einem zum nächsten zurückfällt. Er sucht Tracks und Personen, löst direkte Stream-URLs auf (progressiv oder HLS), lädt Tracks und ganze Playlists herunter und bringt sogar eine Terminal-Anwendung, `nds`, zum Suchen und Abspielen von der Kommandozeile aus mit. Releases kommen mit Codec, Bitrate, Genres, Land, SPDX-Lizenz und vollständigen Set-Tracklisten zurück.

**[radiosoma](https://github.com/TigreGotico/radiosoma)** umschließt die öffentliche Kanal-API von SomaFM. SomaFM ist das freundliche, offene API-Ende des Spektrums, und der Client modelliert es sauber: Jeder Kanal ist ein Werk, und **jede Stream-Kodierung** — 130 kbps AAC, 256 kbps MP3, 64 und 32 kbps HE-AAC — wird zu einem eigenen `Release` dieses Kanals, sodass ein Konsument die beste Passform wählen und nach Identität deduplizieren kann. Der Feed der zuletzt gespielten Titel erscheint als ordentlicher Zeitplan dessen, was gerade lief.

**[tunein](https://github.com/TigreGotico/tunein)** ist ein inoffizieller TuneIn-Client für die linearen Radio- und IPTV-Sender der Welt. Ein schneller Pfad liefert nur die Such-Payload; ein optionaler Anreicherungsaufruf ergänzt Genre, Sprache, Land, Rufzeichen und Slogan. Da TuneIn mehrere Stream-URLs pro Sender zurückgibt — unterschiedliche Bitraten, Spiegel und Protokolle — wird jede zu einem eigenen `Release`, was es dem Konsumenten erneut überlässt, zur Wiedergabezeit zu wählen. Eine kleine CLI liefert Ihnen Tabellen- oder JSON-Ausgabe.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** spricht mit der öffentlichen iHeartRadio-API — kein Schlüssel, kein Konto. Suchen Sie Sender, Podcasts, Künstler, Tracks und Playlists; rufen Sie Podcast-Episoden mit direkten Audio-Stream-URLs ab; und verlassen Sie sich auf parallele Detail-Abrufe, sodass Sender- und Künstler-Abfragen nebenläufig laufen. Jedes Modell bietet die Helfer `to_external_ids()` und `to_signals()`, um es direkt in eine typisierte Metadaten-Pipeline einzufügen.

## Musikenzyklopädien und -archive

Die zweite Hälfte der Familie richtet sich an die großen Community-Kataloge — die Seiten, auf denen Menschen jahrelang Diskografien bewertet und über Subgenres gestritten haben.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)** (Jazz Music Archives) und **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)** (Classical Archives) teilen eine nahezu identische Form: Durchstöbern des A–Z-Index, Suche nach Name und Abruf einer vollständigen Künstler- oder Komponistenseite mit Biografie, Land und einer von den Mitgliedern bewerteten Diskografie. Prog und Jazz Archives scrapen HTML; Classical Archives umschließt eine öffentliche JSON-API und stellt die Alben eines Komponisten *und* einen rekursiv geglätteten Werkbaum bereit. Jedes Modell trägt die stabile kanonische ID der Seite über `to_external_ids_dict()`, was genau das ist, was Sie brauchen, um einen Katalog mit einem anderen abzugleichen.

**[pymetal](https://github.com/TigreGotico/pymetal)** ist unser Client für die Encyclopaedia Metallum, die Metal Archives — und der ambitionierteste der Sammlung. Die meisten Scraper flachen einen Track zu `(id, title, band, album)` ab. pymetal weigert sich, das zu verlieren, was die Metal Archives getrennt halten: Ein Track kann **mehrere Bands** (Splits, Kollaborationen) crediten, das **Line-up einer Band ist über die Zeit hinweg unterteilt**, und ein Track kann **auf vielen Releases erscheinen** (Kompilationen, Neuauflagen, Singles). Es modelliert jedes davon als erstklassige Entität, indiziert nach Archiv-ID, sodass erneute Scrapes idempotent sind. Die Endpoint-Oberfläche ist breit — erweiterte Band-/Album-/Song-Suche, vollständige Release-Seiten mit bandbezogener Zuordnung bei Splits, nach Status partitionierte Line-ups mit Rollen-Datumsbereichen, Rezensionen, Empfehlungen, externe Links und Songtexte — alles als Pydantic-v2-Modelle, die per JSON hin- und zurückgehen.

Über die Musik hinaus scrapt **[tutubo](https://github.com/TigreGotico/tutubo)** YouTube und YouTube Music, und **[pymal](https://github.com/TigreGotico/pymal)** deckt MyAnimeList ab — womit dieselben typisierten Metadaten-Muster auf breitere Medienkategorien ausgeweitet werden. Alle geben dasselbe Vokabular aus, sodass ein einziger nachgelagerter Konsument alles einheitlich verarbeitet.

## Gebaut, um das moderne Web zu überleben

Ein Scraper, der beim ersten Mal kaputtgeht, wenn eine Seite eine Bot-Mauer errichtet, ist wertlos. In der gesamten Familie ist die HTTP-Schicht **einsteckbar**, und wo Seiten aktiv gegen Bots verteidigt werden, greifen die Clients standardmäßig auf einen browserimitierenden Transport zurück — `curl_cffi`, das echte Chrome-TLS/JA3-Fingerabdrücke nachbildet —, um Challenges zu überwinden, die das gewöhnliche `requests` ablehnen. Die von Cloudflare abgeschirmten Enzyklopädien können zusätzlich über eine FlareSolverr-Instanz für Live-Daten geleitet werden oder aus der Wayback Machine des Internet Archive lesen, wenn Sie einfach nur *irgendetwas* brauchen. Die Parsing-Schicht ist bewusst unabhängig davon, wie das HTML ankommt, sodass derselbe Code funktioniert, welchen Transport Sie auch wählen.

## Ein quellenübergreifender Musikkatalog

Der wahre Gewinn ist das, was passiert, wenn Sie aufhören, diese als neun separate Werkzeuge zu betrachten. Da sie alle dasselbe typisierte Metadaten-Vokabular ausgeben und alle kanonische externe IDs bereitstellen, können Sie einen einzelnen Künstler über Bandcamp, SoundCloud, die Radioverzeichnisse und die Enzyklopädien hinweg auffächern und die Ergebnisse anschließend zu einem kohärenten Katalog zusammenführen — nach Identität dedupliziert, lizenzbewusst und bereit, eine Empfehlungs-Engine, einen Media-Server oder ein Forschungsdatenset zu speisen.

Jeder dieser Clients ist freie Software, selbst hostbar und läuft auf Ihrer eigenen Hardware, ohne dass Sie um API-Schlüssel betteln müssen. Wählen Sie die Quelle, die Ihnen am Herzen liegt, `pip install` und legen Sie los.

Alle Scraper setzen auf unseren **[Anti-Bot-Transportschichten](/de/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** auf. Die Streaming- und Radio-Clients geben das **[mediavocab](https://github.com/TigreGotico/mediavocab)**-Schema direkt aus, und jeder Client stellt kanonische externe IDs bereit, sodass sich Musik-Metadaten mit **[media-archivist](https://github.com/TigreGotico/media-archivist)**, unserem quellenübergreifenden Indexer und deduplizierenden Metadaten-Server, integrieren lassen.
