---
title: "Our Data Pipeline End-to-End: Scraping → Typing → Deduping → Serving"
description: "How we turn raw public web data into ML-ready datasets and live search services. The full journey: from sitemapper reconnaissance through phoonnx voice synthesis."
date: 2026-08-10
author: "Casimiro Ferreira"
tags:
  - "Data Pipeline"
  - "Architecture"
  - "Web Scraping"
  - "Data Engineering"
  - "Datasets"
  - "FOSS"
draft: false
---

## The full stack

Our data pipeline is not a single tool. It is a sequence of composable libraries, each solving one problem. Here is the journey from raw HTML to usable data:

### Stage 1: Reconnaissance

Before you scrape, scout the site.

**[sitemapper](https://github.com/TigreGotico/sitemapper)** reads robots.txt, parses sitemaps, and discovers the link graph. It respects crawl-delay declarations and tells you if the site is even scrapable.

```python
from sitemapper import discover

results = discover("https://example.com")
print(results.robots_txt.crawl_delay)  # Honor this
print(results.sitemaps)  # Official URLs
```

See: **[Robot.txt and ethical scraping](/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**.

### Stage 2: Resilient transport

Two problems arrive at the transport layer: bot detection and IP reputation.

**[unblock_requests](https://github.com/TigreGotico/unblock_requests)** handles bot walls with TLS impersonation, FlareSolverr proxying, and Wayback fallback.

**[anon_requests](https://github.com/TigreGotico/anon_requests)** rotates your IP through proxies or Tor.

They stack: inject unblock_requests into anon_requests and get both behaviors from one object.

See: **[Building composable HTTP transports](/blog/2026-03-20-building-composable-http-transports)** and **[beating bot walls](/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**.

### Stage 3: Typed extraction

Every scraper emits typed objects (Pydantic dataclasses) instead of raw dicts. This enforces schema at extraction time, not downstream.

```python
from py_bandcamp import search_artists, fetch_artist

artists = search_artists("genesis")
detail = fetch_artist(artists[0].artist_id)

# detail is a typed dataclass with .to_external_ids()
```

**[mediavocab](https://github.com/OpenVoiceOS/mediavocab)** — our shared media schema — makes every source speak the same vocabulary: `Release`, `Entity`, `Work`.

See: **[data extraction & datasets](/blog/2026-04-05-data-extraction-clean-apis-and-datasets)**.

### Stage 4: Entity resolution

When you scrape 30 sources, you get 30 versions of the same entity. **[metadatarr](https://github.com/TigreGotico/metadatarr)** deduplicates by discovering identity from the data: name similarity, shared collaborators, work overlap.

```python
from metadatarr import resolve_artist

canonical = resolve_artist([genesis_from_source1, genesis_from_source2])
# {
#   'name': 'Genesis',
#   'external_ids': {'source1': '1', 'source2': '123', ...},
#   'confidence': 0.95
# }
```

See: **[entity resolution at scale](/blog/2026-04-12-entity-resolution-music-metadata)**.

### Stage 5: Indexing and serving

**[media-archivist](https://github.com/TigreGotico/media-archivist)** crawls all sources on schedule, deduplicates through metadatarr, and serves a live, queryable catalogue:

```python
from media_archivist import Archive

archive = Archive()
genesis = archive.search_artists("Genesis")[0]

# One canonical record with cross-references
print(genesis.external_ids)  # All source IDs
print(genesis.releases)  # Deduplicated albums
```

See: **[Why we built media-archivist](/blog/2026-04-25-why-we-built-media-archivist)**.

### Stage 6: Dataset curation

Once indexed, curate for publication. Filter to open licenses, validate schema, add provenance, version, and push to HuggingFace.

```bash
python curate.py --license open --output /tmp/curated.jsonl
huggingface-cli repo create tigregotico/music-metadata
huggingface-cli upload-files ...
```

See: **[dataset curation at scale](/blog/2026-05-05-dataset-curation-scale)**.

## Why this shape

Each stage is **composable**. You can:
- Use `sitemapper` with any scraper
- Use `unblock_requests` with any HTTP client
- Use `mediavocab` with any data source
- Use `metadatarr` on any typed records
- Use `media-archivist` on any mediavocab data

You do not have to use all six. But when you do, they stack cleanly. No monoliths. No lock-in. Just a chain of small tools that each solve one problem well.

## The payoff

What comes out the other end:

- **Live services** — search, recommendations, cross-references
- **Versioned datasets** — citable, reproducible, ML-ready
- **Deduped catalogs** — one identity across 30 sources
- **Privacy-preserving** — all on your hardware, no APIs to third parties
- **Open** — every tool is FOSS; you own your data

The pipeline is not a secret. Every tool is published. You can run it yourself, modify it, remix it.

That is the point: your data, on your hardware, under your control.
