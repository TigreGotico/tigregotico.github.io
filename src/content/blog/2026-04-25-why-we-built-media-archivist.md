---
title: "Why We Built media-archivist: The Indexer Between Scrapers and the World"
description: "We maintain 30+ music scrapers. But scrapers alone are just data extraction. media-archivist is the server that crawls, indexes, deduplicates, and serves them as a unified catalogue—the payoff of the entire extraction pipeline."
date: 2026-04-25
author: "Casimiro Ferreira"
tags:
  - "Data Infrastructure"
  - "Indexing"
  - "Media Metadata"
  - "Deduplication"
  - "Serving"
  - "FOSS"
draft: false
---

## From scrapers to a searchable catalogue

A scraper solves one problem: get data out of a website. But data in isolation is incomplete. When you have 30 scrapers, you have 30 sources of truth, each with its own IDs, its own gaps, its own biases.

**[media-archivist](https://github.com/TigreGotico/media-archivist)** sits between the scrapers and the world. It crawls metadata from YouTube, Bandcamp, SoundCloud, the encyclopedias, and more — feeds it through **[metadatarr](https://github.com/TigreGotico/metadatarr)** for entity resolution and deduplication — then serves one canonical, deduplicated, cross-referenced catalogue over HTTP.

## What media-archivist does

1. **Crawl**: Run all 30+ scrapers on a schedule
2. **Normalize**: Convert everything to **[mediavocab](https://github.com/OpenVoiceOS/mediavocab)** — our shared media schema
3. **Deduplicate**: Use metadatarr to fuse the same artist/album across sources
4. **Index**: Store in a queryable database with canonical IDs
5. **Serve**: HTTP API for search, filtering, and access

```python
# Query the indexed catalogue
from media_archivist import Archive

archive = Archive()

# Search for an artist across all sources
genesis = archive.search_artists("Genesis")
# Returns: one canonical Genesis record with IDs from Prog Archives, Metal Archives, etc.

# Browse deduplicated releases
albums = archive.artist_releases(genesis.canonical_id)
# Returns: albums cross-referenced, deduplicated, with stream URLs from all sources
```

## Why this layer?

**Scrapers are fire-and-forget.** They extract data, emit typed objects, and exit. That is good design — each tool does one job.

But a user doesn't want 30 tools. A user wants *one searchable catalogue*. That requires:

- **Continuous crawling** — data changes, so re-scrape on schedule
- **Deduplication** — solve the "is this the same album?" problem once, globally
- **Unified serving** — one API that hides the fact that there are 30 sources behind it
- **Caching** — don't re-scrape everything every hour
- **Provenance** — track which sources agree on what, so users know confidence

That is media-archivist.

## The data flow

```
[Scrapers] → [Normalize to mediavocab] → [Entity resolution] → [Index] → [HTTP API]
py_bandcamp      ↓                          ↓
nuvem_de_som  mediavocab                 metadatarr
radiosoma     Release,                   canonical IDs
tunein        Entity,                    cross-refs
...           Work records               deduplicated
                                        records
```

See also: how it integrates **[music scrapers](/blog/2026-04-20-music-database-scrapers)**, **[entity resolution](/blog/2026-04-12-entity-resolution-music-metadata)**, and **[dataset construction](/blog/2026-05-05-dataset-curation-scale)**.

## The tool

`media-archivist` is available as a library and a self-hosted server:

```bash
pip install media-archivist
```

[`media-archivist` on GitHub](https://github.com/TigreGotico/media-archivist)

Run it on your hardware, own your catalogue.
