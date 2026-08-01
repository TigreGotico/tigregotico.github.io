---
title: "Introducing Our Music Database Scrapers"
description: "A tour of the family of typed Python clients we maintain for music sources — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio, and the great music encyclopedias — all emitting consistent, typed media metadata behind one clean interface and riding the same compliant, low-volume HTTP transport."
date: 2026-04-20
author: "Casimiro Ferreira"
tags:
  - "Scrapers"
  - "Media Metadata"
  - "Music"
  - "Python"
  - "FOSS"
draft: false
---

## One interface for the whole musical web

The music web is fragmented across many independent sites. Bandcamp sells you a FLAC and a Creative Commons licence; SoundCloud streams a remix nobody else hosts; SomaFM runs a set of listener-supported radio channels; and a number of community-run sites keep curated encyclopedias of progressive rock, jazz, classical, and metal. Each site has its own markup, its own quirks, its own idea of what a "track" even is.

We maintain a family of small, focused, open-source Python clients that tame that mess. Every one of them does the same thing in spirit: it reaches into a music source and hands you back **typed media-metadata models** — validated objects instead of brittle dictionaries — so the rest of your code never has to care which site the data came from. Install one, install all nine; they speak the same vocabulary.

Here's the tour.

## Streaming and radio

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** scrapes Bandcamp: search tracks, albums, artists, and labels; browse by genre tag; pull recommendations and related artists from a seed; and extract a streamable MP3 URL. Searches return typed `Release` objects carrying title, artwork, genres, credits, and — crucially for the FOSS-minded — an SPDX-style licence field with an `is_open()` check so you can tell a Creative Commons release from an all-rights-reserved one. A full-fidelity album conversion populates the ordered tracklist on demand.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** is our SoundCloud client, and it's the swiss-army knife of the bunch. Three independent backends — a metadata-rich API backend, a dependency-free HTML scraper, and a yt-dlp backend — sit behind one orchestrator that falls back gracefully from one to the next. It searches tracks and people, resolves direct stream URLs (progressive or HLS), downloads tracks and whole playlists, and even ships a terminal app, `nds`, for searching and playing from the command line. Releases come back with codec, bitrate, genres, country, SPDX licence, and full set tracklists.

**[radiosoma](https://github.com/TigreGotico/radiosoma)** wraps the SomaFM public channels API. SomaFM is the friendly, open-API end of the spectrum, and the client models it cleanly: each channel is one piece of work, and **each stream encoding** — 130 kbps AAC, 256 kbps MP3, 64 and 32 kbps HE-AAC — becomes its own `Release` of that channel, so a consumer can pick the best fit and deduplicate by identity. The recent-tracks feed surfaces as a tidy schedule of what's been playing.

**[tunein](https://github.com/TigreGotico/tunein)** is an unofficial TuneIn client for the world's linear radio and IPTV stations. A fast path returns just the search payload; an opt-in enrichment call fills in genre, language, country, call-sign, and slogan. Because TuneIn hands back multiple stream URLs per station — different bitrates, mirrors, and protocols — each becomes its own `Release`, again letting the consumer choose at playback time. A small CLI gives you table or JSON output.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** talks to the iHeartRadio public API — no key, no account. Search stations, podcasts, artists, tracks, and playlists; retrieve podcast episodes with direct audio stream URLs; and rely on parallel detail fetches so station and artist lookups run concurrently. Every model offers `to_external_ids()` and `to_signals()` helpers for slotting straight into a typed metadata pipeline.

## Music encyclopedias and archives

The second half of the family targets the great community catalogues.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)** (Jazz Music Archives), and **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)** (Classical Archives) share a near-identical shape: browse the A–Z index, search by name, and fetch a full artist or composer page with biography, country, and a member-rated discography. Prog and Jazz Archives scrape HTML; Classical Archives wraps a public JSON API and exposes a composer's albums *and* a recursively flattened works tree. Each model carries the site's stable canonical id via `to_external_ids_dict()`, which is exactly what you need to cross-reference one catalogue against another.

**[pymetal](https://github.com/TigreGotico/pymetal)** is our client for Encyclopaedia Metallum, the Metal Archives — and the most ambitious of the set. Most scrapers flatten a track to `(id, title, band, album)`. pymetal refuses to lose what Metal Archives keeps separate: a track can credit **multiple bands** (splits, collaborations), a band's **lineup is sliced over time**, and a track can **appear on many releases** (compilations, re-issues, singles). It models each as a first-class entity keyed by archive id, so re-scrapes are idempotent. The endpoint surface is broad — advanced band/album/song search, full release pages with per-band attribution on splits, lineups partitioned by status with role-date ranges, reviews, recommendations, external links, and lyrics — all as Pydantic v2 models that round-trip through JSON.

Beyond music, **[tutubo](https://github.com/TigreGotico/tutubo)** scrapes YouTube and YouTube Music, and **[pymal](https://github.com/TigreGotico/pymal)** covers MyAnimeList — extending the same typed metadata patterns across broader media categories. All emit the same vocabulary so a single downstream consumer handles everything uniformly.

## Built for compliant, low-volume access

These clients fetch public catalogue pages only, at low request volumes, and check each site's `robots.txt` before scraping — see the
**[robots.txt &amp; sitemaps post](/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
for how that recon step works. Across the family the HTTP layer is **pluggable**: by default the clients use a transport whose TLS handshake matches a real browser (`curl_cffi` matching Chrome's TLS/JA3), so a well-behaved client is not misclassified as malicious automation by detection systems tuned for scripted abuse. The Cloudflare-fronted encyclopedias can additionally route through a FlareSolverr instance for live data, or read from the Internet Archive's Wayback Machine as a fallback. The parsing layer is deliberately independent of how the HTML arrives, so the same code works whichever transport you choose.

## A cross-source music catalogue

The real payoff is what happens when you stop thinking of these as nine separate tools. Because they all emit the same typed metadata vocabulary and all expose canonical external ids, you can fan out a single artist across Bandcamp, SoundCloud, the radio directories, and the encyclopedias, then fold the results into one coherent catalogue — deduplicated by identity, licence-aware, and ready to feed a recommendation engine, a media server, or a research dataset.

Every one of these clients is free software, self-hostable, and runs on your own hardware, with no API key required. Pick the source you care about, `pip install`, and start building.

All scrapers ride our **[composable, drop-in requests sessions](/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**. The streaming and radio clients emit the **[mediavocab](https://github.com/TigreGotico/mediavocab)** schema directly, and every client exposes canonical external ids, so music metadata integrates with **[media-archivist](https://github.com/TigreGotico/media-archivist)**, our cross-source indexer and deduplicating metadata server.
