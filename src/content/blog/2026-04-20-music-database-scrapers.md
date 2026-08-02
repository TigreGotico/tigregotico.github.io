---
title: "Introducing Our Music Database Scrapers"
description: "A tour of the family of typed Python clients we maintain for music sources — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio, and the great music encyclopedias — all emitting consistent, typed media metadata behind one clean interface and riding the same compliant, low-volume HTTP transport."
date: 2026-04-20
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

## One interface for the whole musical web

The music web is fragmented across many independent sites. Bandcamp sells you a FLAC and a Creative Commons licence. SoundCloud streams a remix nobody else hosts. SomaFM runs a set of listener-supported radio channels. A number of community-run sites keep curated encyclopedias of progressive rock, jazz, classical, and metal. Each site has its own markup, its own quirks, its own idea of what a "track" even is.

We maintain a family of small, focused, open-source Python clients that tame that mess. Every one of them does the same thing in spirit: it reaches into a music source and hands back **typed media-metadata models**, validated objects instead of brittle dictionaries, so the rest of your code never has to care which site the data came from. Seven of the nine are published on PyPI. The other two install straight from GitHub. They all speak the same vocabulary.

Here's the tour.

## Streaming and radio

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** scrapes Bandcamp. It searches tracks, albums, artists, and labels, browses by genre tag, pulls recommendations and related artists from a seed, and extracts a streamable MP3 URL. Searches return typed `Release` objects carrying title, artwork, genres, credits, and an SPDX-style licence field with an `is_open()` check, so you can tell a Creative Commons release from an all-rights-reserved one. A full-fidelity album conversion populates the ordered tracklist on demand.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** is our SoundCloud client. Three independent backends, a metadata-rich API backend, a dependency-free HTML scraper, and a yt-dlp backend, sit behind one orchestrator that falls back from one to the next. It searches tracks and people, resolves direct stream URLs (progressive or HLS), downloads tracks and whole playlists, and ships a terminal app, `nds`, for searching and playing from the command line. Releases come back with codec, bitrate, genres, country, SPDX licence, and full set tracklists.

**[radiosoma](https://github.com/TigreGotico/radiosoma)** wraps the SomaFM public channels API. SomaFM has an open API, and the client models it directly: each channel is one piece of work, and each stream encoding (130 kbps AAC, 256 kbps MP3, 64 and 32 kbps HE-AAC) becomes its own `Release` of that channel, so a consumer can pick the best fit and deduplicate by identity. The recent-tracks feed shows a schedule of what's been playing.

**[tunein](https://github.com/TigreGotico/tunein)** is an unofficial TuneIn client for the world's linear radio and IPTV stations. A fast path returns just the search payload. An opt-in enrichment call fills in genre, language, country, call-sign, and slogan. TuneIn hands back multiple stream URLs per station (different bitrates, mirrors, and protocols), so each becomes its own `Release`, letting the consumer choose at playback time. A small CLI gives you table or JSON output.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** talks to the iHeartRadio public API, with no key and no account needed. It searches stations, podcasts, artists, tracks, and playlists, retrieves podcast episodes with direct audio stream URLs, and runs station and artist lookups concurrently through parallel detail fetches. Every model offers `to_external_ids()` and `to_signals()` helpers for use in a typed metadata pipeline.

## Music encyclopedias and archives

The second half of the family targets the great community catalogues.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)** (Jazz Music Archives), and **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)** (Classical Archives) share a near-identical shape. Both pyprogarchives and pyjazzmusicarchives install straight from their GitHub repos rather than PyPI. All three browse the A–Z index, search by name, and fetch a full artist or composer page with biography, country, and a member-rated discography. Prog and Jazz Archives scrape HTML. Classical Archives wraps a public JSON API and exposes a composer's albums *and* a recursively flattened works tree. Each model carries the site's stable canonical id via `to_external_ids_dict()`, useful for cross-referencing one catalogue against another.

**[pymetal](https://github.com/TigreGotico/pymetal)** is our client for Encyclopaedia Metallum, the Metal Archives, and the most ambitious of the set. Most scrapers flatten a track to `(id, title, band, album)`. pymetal keeps what Metal Archives keeps separate: a track can credit multiple bands (splits, collaborations), a band's lineup changes over time, and a track can appear on many releases (compilations, re-issues, singles). It models each as a distinct entity keyed by archive id, so re-scrapes are idempotent. The endpoint surface is broad: advanced band/album/song search, full release pages with per-band attribution on splits, lineups partitioned by status with role-date ranges, reviews, recommendations, external links, and lyrics, all as Pydantic v2 models that round-trip through JSON.

Beyond music, **[tutubo](https://github.com/TigreGotico/tutubo)** scrapes YouTube and YouTube Music, and **[pymal](https://github.com/TigreGotico/pymal)** covers MyAnimeList, extending the same typed metadata patterns across broader media categories. All emit the same vocabulary, so a single downstream consumer handles everything uniformly.

## Built for compliant, low-volume access

These clients fetch public catalogue pages only, at low request volumes, and check each site's `robots.txt` before scraping. See the
**[robots.txt &amp; sitemaps post](/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
for how that recon step works. Across the family the HTTP layer is pluggable. By default the clients use a transport whose TLS handshake matches a real browser (`curl_cffi` matching Chrome's TLS/JA3), so a well-behaved client is not misclassified as malicious automation by detection systems tuned for scripted abuse. The Cloudflare-fronted encyclopedias can also route through a FlareSolverr instance for live data, or read from the Internet Archive's Wayback Machine as a fallback. The parsing layer is independent of how the HTML arrives, so the same code works whichever transport you choose.

## A cross-source music catalogue

The real payoff is what happens when you stop thinking of these as nine separate tools. They all emit the same typed metadata vocabulary and all expose canonical external ids. That means you can fan out a single artist across Bandcamp, SoundCloud, the radio directories, and the encyclopedias, then fold the results into one catalogue: deduplicated by identity, licence-aware, and ready to feed a recommendation engine, a media server, or a research dataset.

Every one of these clients is free software, self-hostable, and runs on your own hardware, with no API key required. Pick the source you care about: `pip install` it if it's on PyPI, or `pip install git+https://github.com/TigreGotico/<repo>` for pyprogarchives and pyjazzmusicarchives, which are GitHub-only. Then start building.

All scrapers ride our **[composable, drop-in requests sessions](/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**. The streaming and radio clients emit the **[mediavocab](https://github.com/TigreGotico/mediavocab)** schema directly, and every client exposes canonical external ids, so music metadata integrates with **[media-archivist](https://github.com/TigreGotico/media-archivist)**, our cross-source indexer and deduplicating metadata server.
