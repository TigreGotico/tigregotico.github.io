---
title: "Wir stellen vor: Unsere Scraper für Musikdatenbanken"
description: "Eine Führung durch die Familie typisierter Python-Clients, die wir für Musikquellen pflegen — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio und die großen Musikenzyklopädien — die allesamt konsistente, typisierte Media-Metadaten hinter einer sauberen Schnittstelle ausgeben und auf demselben regelkonformen HTTP-Transport mit niedrigem Volumen aufsetzen."
date: 2026-04-20
lang: de
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

## Eine Schnittstelle für das gesamte musikalische Web

Das Musik-Web ist über viele unabhängige Seiten hinweg fragmentiert. Bandcamp verkauft Ihnen ein FLAC und eine Creative-Commons-Lizenz. SoundCloud streamt einen Remix, den sonst niemand hostet. SomaFM betreibt eine Auswahl an hörerfinanzierten Radiokanälen. Eine Reihe von Community-betriebenen Seiten pflegt kuratierte Enzyklopädien zu Progressive Rock, Jazz, Klassik und Metal. Jede Seite hat ihre eigene Auszeichnung, ihre eigenen Eigenheiten, ihre eigene Vorstellung davon, was ein „Track" überhaupt ist.

Wir pflegen eine Familie kleiner, fokussierter, quelloffener Python-Clients, die dieses Chaos bändigen. Jeder von ihnen tut im Grunde dasselbe: Er greift in eine Musikquelle hinein und gibt **typisierte Media-Metadaten-Modelle** zurück, validierte Objekte statt brüchiger Dictionaries, sodass sich der Rest Ihres Codes nie darum kümmern muss, von welcher Seite die Daten stammen. Sieben der neun sind auf PyPI veröffentlicht. Die anderen beiden installieren direkt von GitHub. Alle sprechen dasselbe Vokabular.

Hier ist die Führung.

## Streaming und Radio

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** scrapt Bandcamp. Es durchsucht Tracks, Alben, Künstler und Labels, durchstöbert nach Genre-Tag, ruft Empfehlungen und verwandte Künstler ausgehend von einem Startpunkt ab und extrahiert eine streambare MP3-URL. Suchen liefern typisierte `Release`-Objekte, die Titel, Artwork, Genres, Credits und ein Lizenzfeld im SPDX-Stil mit einer `is_open()`-Prüfung tragen, sodass Sie ein Creative-Commons-Release von einem mit allen vorbehaltenen Rechten unterscheiden können. Eine vollständige Album-Konvertierung füllt die geordnete Trackliste bei Bedarf.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** ist unser SoundCloud-Client. Drei unabhängige Backends, ein metadatenreiches API-Backend, ein abhängigkeitsfreier HTML-Scraper und ein yt-dlp-Backend, sitzen hinter einem Orchestrator, der von einem zum nächsten zurückfällt. Er sucht Tracks und Personen, löst direkte Stream-URLs auf (progressiv oder HLS), lädt Tracks und ganze Playlists herunter und bringt eine Terminal-Anwendung, `nds`, zum Suchen und Abspielen von der Kommandozeile aus mit. Releases kommen mit Codec, Bitrate, Genres, Land, SPDX-Lizenz und vollständigen Set-Tracklisten zurück.

**[radiosoma](https://github.com/TigreGotico/radiosoma)** umschließt die öffentliche Kanal-API von SomaFM. SomaFM hat eine offene API, und der Client modelliert sie direkt: Jeder Kanal ist ein Werk, und jede Stream-Kodierung (130 kbps AAC, 256 kbps MP3, 64 und 32 kbps HE-AAC) wird zu einem eigenen `Release` dieses Kanals, sodass ein Konsument die beste Passform wählen und nach Identität deduplizieren kann. Der Feed der zuletzt gespielten Titel zeigt einen Zeitplan dessen, was gerade lief.

**[tunein](https://github.com/TigreGotico/tunein)** ist ein inoffizieller TuneIn-Client für die linearen Radio- und IPTV-Sender der Welt. Ein schneller Pfad liefert nur die Such-Payload. Ein optionaler Anreicherungsaufruf ergänzt Genre, Sprache, Land, Rufzeichen und Slogan. TuneIn gibt mehrere Stream-URLs pro Sender zurück (unterschiedliche Bitraten, Spiegel und Protokolle), sodass jede zu einem eigenen `Release` wird, was es dem Konsumenten überlässt, zur Wiedergabezeit zu wählen. Eine kleine CLI liefert Ihnen Tabellen- oder JSON-Ausgabe.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** spricht mit der öffentlichen iHeartRadio-API, ohne Schlüssel und ohne Konto. Es durchsucht Sender, Podcasts, Künstler, Tracks und Playlists, ruft Podcast-Episoden mit direkten Audio-Stream-URLs ab und führt Sender- und Künstler-Abfragen über parallele Detail-Abrufe nebenläufig aus. Jedes Modell bietet die Helfer `to_external_ids()` und `to_signals()` für den Einsatz in einer typisierten Metadaten-Pipeline.

## Musikenzyklopädien und -archive

Die zweite Hälfte der Familie richtet sich an die großen Community-Kataloge.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)** (Jazz Music Archives) und **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)** (Classical Archives) teilen eine nahezu identische Form. Sowohl pyprogarchives als auch pyjazzmusicarchives installieren direkt aus ihren GitHub-Repositorys statt von PyPI. Alle drei durchstöbern den A–Z-Index, suchen nach Name und rufen eine vollständige Künstler- oder Komponistenseite mit Biografie, Land und einer von den Mitgliedern bewerteten Diskografie ab. Prog und Jazz Archives scrapen HTML. Classical Archives umschließt eine öffentliche JSON-API und stellt die Alben eines Komponisten *und* einen rekursiv geglätteten Werkbaum bereit. Jedes Modell trägt die stabile kanonische ID der Seite über `to_external_ids_dict()`, nützlich, um einen Katalog mit einem anderen abzugleichen.

**[pymetal](https://github.com/TigreGotico/pymetal)** ist unser Client für die Encyclopaedia Metallum, die Metal Archives, und der ambitionierteste der Sammlung. Die meisten Scraper flachen einen Track zu `(id, title, band, album)` ab. pymetal behält, was die Metal Archives getrennt halten: Ein Track kann mehrere Bands (Splits, Kollaborationen) crediten, das Line-up einer Band ändert sich über die Zeit, und ein Track kann auf vielen Releases erscheinen (Kompilationen, Neuauflagen, Singles). Es modelliert jedes davon als eigenständige Entität, indiziert nach Archiv-ID, sodass erneute Scrapes idempotent sind. Die Endpoint-Oberfläche ist breit: erweiterte Band-/Album-/Song-Suche, vollständige Release-Seiten mit bandbezogener Zuordnung bei Splits, nach Status partitionierte Line-ups mit Rollen-Datumsbereichen, Rezensionen, Empfehlungen, externe Links und Songtexte, alles als Pydantic-v2-Modelle, die per JSON hin- und zurückgehen.

Über die Musik hinaus scrapt **[tutubo](https://github.com/TigreGotico/tutubo)** YouTube und YouTube Music, und **[pymal](https://github.com/TigreGotico/pymal)** deckt MyAnimeList ab, womit dieselben typisierten Metadaten-Muster auf breitere Medienkategorien ausgeweitet werden. Alle geben dasselbe Vokabular aus, sodass ein einziger nachgelagerter Konsument alles einheitlich verarbeitet.

## Gebaut für regelkonformen Zugriff mit niedrigem Volumen

Diese Clients rufen ausschließlich öffentliche Katalogseiten ab, mit niedrigem Anfragevolumen, und prüfen die `robots.txt` jeder Seite vor dem Scrapen. Siehe den
**[Beitrag zu robots.txt &amp; Sitemaps](/de/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
für die Funktionsweise dieses Aufklärungsschritts. In der gesamten Familie ist die HTTP-Schicht einsteckbar. Standardmäßig verwenden die Clients einen Transport, dessen TLS-Handshake dem eines echten Browsers entspricht (`curl_cffi`, das Chromes TLS/JA3 nachbildet), sodass ein wohlverhaltener Client von Erkennungssystemen, die auf skriptgesteuerten Missbrauch abgestimmt sind, nicht als bösartige Automatisierung fehlklassifiziert wird. Die von Cloudflare abgeschirmten Enzyklopädien können außerdem über eine FlareSolverr-Instanz für Live-Daten geleitet werden oder als Fallback aus der Wayback Machine des Internet Archive lesen. Die Parsing-Schicht ist unabhängig davon, wie das HTML ankommt, sodass derselbe Code funktioniert, welchen Transport Sie auch wählen.

## Ein quellenübergreifender Musikkatalog

Der wahre Gewinn ist das, was passiert, wenn Sie aufhören, diese als neun separate Werkzeuge zu betrachten. Sie alle geben dasselbe typisierte Metadaten-Vokabular aus und stellen alle kanonische externe IDs bereit. Das heißt, Sie können einen einzelnen Künstler über Bandcamp, SoundCloud, die Radioverzeichnisse und die Enzyklopädien hinweg auffächern und die Ergebnisse anschließend zu einem Katalog zusammenführen: nach Identität dedupliziert, lizenzbewusst und bereit, eine Empfehlungs-Engine, einen Media-Server oder ein Forschungsdatenset zu speisen.

Jeder dieser Clients ist freie Software, selbst hostbar und läuft auf Ihrer eigenen Hardware, ohne dass ein API-Schlüssel erforderlich ist. Wählen Sie die Quelle, die Ihnen am Herzen liegt: `pip install`, falls sie auf PyPI ist, oder `pip install git+https://github.com/TigreGotico/<repo>` für pyprogarchives und pyjazzmusicarchives, die nur über GitHub verfügbar sind. Dann legen Sie los.

Alle Scraper setzen auf unsere **[kombinierbaren, direkt einsetzbaren requests-Sessions](/de/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** auf. Die Streaming- und Radio-Clients geben das **[mediavocab](https://github.com/TigreGotico/mediavocab)**-Schema direkt aus, und jeder Client stellt kanonische externe IDs bereit, sodass sich Musik-Metadaten mit **[media-archivist](https://github.com/TigreGotico/media-archivist)**, unserem quellenübergreifenden Indexer und deduplizierenden Metadaten-Server, integrieren lassen.
