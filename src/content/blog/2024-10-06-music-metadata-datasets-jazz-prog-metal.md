---
title: "Music Metadata Datasets: Jazz, Prog, and Metal Archives on HuggingFace"
description: "We scraped and published six curated datasets from jazz, progressive rock, and metal music encyclopedias — canonical artist/album/track data with deduplication, licensing, and external IDs. Free for research and datasets."
date: 2024-10-06
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Music Metadata"
  - "HuggingFace"
  - "Scrapers"
  - "Archives"
  - "FOSS"
draft: false
---

## Six music encyclopedias, one canonical record

The music web is fragmented across specialized encyclopedias. Jazz Music Archives catalogs decades of discographies. Prog Archives curates progressive rock genealogies. Metal Archives documents the metal world in obsessive detail. Classical Archives holds the classical repertoire. Each is authoritative in its domain, but separate.

Today we are publishing six **original datasets extracted and curated by TigreGotico** from these public sources — each one deduplicated, schema-validated, and ready for research or ML training. We scraped, typed, and deduplicated the data ourselves using our **[data extraction pipeline](/blog/2026-04-05-data-extraction-clean-apis-and-datasets)**:

- **[jazz-music-archives](https://huggingface.co/datasets/TigreGotico/jazz-music-archives)** — Artists, discographies, genres, countries
- **[prog-archives](https://huggingface.co/datasets/TigreGotico/prog-archives)** — Progressive rock bands and rated discographies
- **[metal-archives-bands](https://huggingface.co/datasets/TigreGotico/metal-archives-bands)** — Metal band rosters, formation dates, lineups
- **[metal-archives-tracks](https://huggingface.co/datasets/TigreGotico/metal-archives-tracks)** — Metal tracks with multi-band attribution and release info
- **[classic-composers](https://huggingface.co/datasets/TigreGotico/classic-composers)** — Classical composers, works, periods, countries
- **[trance_tracks](https://huggingface.co/datasets/TigreGotico/trance_tracks)** — Trance/electronic track metadata

## Why these datasets matter

Each archive is a human-curated knowledge base: artists who spent years rating discographies, contributors who maintain genealogies, community members who document lineups and release histories. That effort is worth preserving.

These datasets are:

- **Deduplicated** — artist/work identity is canonical, with external IDs linking back to the source
- **Typed** — emitted as **[mediavocab](https://github.com/OpenVoiceOS/mediavocab)** (our shared music schema), so they integrate with other sources
- **Licensed** — all are redistribution-safe public data; we cite the original sources
- **Versioned** — on HuggingFace, immutable and citable for research

## How we built these

See our **[music database scrapers](/blog/2026-04-20-music-database-scrapers)** blog for the full story. In brief:

1. **Scraped** each archive using our **[unblock_requests](https://github.com/TigreGotico/unblock_requests)** transport (to get past bot walls)
2. **Typed** the results as **[mediavocab](https://github.com/OpenVoiceOS/mediavocab)** `Release`, `Entity`, and `Work` objects
3. **Deduplicated** cross-references using **[metadatarr](https://github.com/TigreGotico/metadatarr)** (entity resolution without a master key)
4. **Curated** the datasets: license check, schema validation, provenance tracking, versioning
5. **Published** to HuggingFace for reuse

## Use cases

- **Recommendation systems** — build cross-genre music graphs
- **Music information retrieval** — train models on curated metadata
- **Artist research** — genealogies, collaborations, and influence chains
- **Knowledge preservation** — archive human expertise before it vanishes

All six are free, open, and versioned on HuggingFace. No API key required.
