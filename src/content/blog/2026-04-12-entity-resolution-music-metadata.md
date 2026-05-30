---
title: "Entity Resolution at Scale: Deduplicating Music Metadata Across 30 Sources"
description: "When you scrape 30 music sources, you get 30 versions of the same album. metadatarr solves identity: it uses canonical IDs and cross-source signals to fuse duplicates into one record, keyless and pluggable."
date: 2026-04-12
author: "Casimiro Ferreira"
tags:
  - "Data Integration"
  - "Entity Resolution"
  - "Metadata"
  - "Deduplication"
  - "Music"
  - "FOSS"
draft: false
---

## The deduplication problem at scale

You scrape Bandcamp, SoundCloud, Prog Archives, Metal Archives, Jazz Archives, Classical Archives — 9 music sources, each with its own catalog and its own IDs.

Bandcamp calls an artist "Genesis". Prog Archives calls them `artist_id: 1`. Metal Archives calls them `band_id: 123`. They are the same entity, but three different identities.

**[metadatarr](https://github.com/TigreGotico/metadatarr)** solves this with a keyless entity resolver: it takes canonical IDs from every source, looks for signals of identity (name similarity, collaborations, related works), and fuses duplicates into one canonical record.

## How metadatarr solves identity

Here's the core problem: you have data from 30 sources, each with its own ID space. Bandcamp calls an artist `"12345"`. Prog Archives calls them `artist_id: 1`. Metal Archives calls them `band_id: 123`. They're the *same band*, but three *different identities*.

**metadatarr** solves this by discovering identity from the **data itself**, not from a master reference. Each scraper emits a `to_external_ids()` method that returns what it knows:

```python
# From Prog Archives scraper — we get a record
genesis_prog = fetch_artist("genesis")

# What does it tell us?
external_ids = genesis_prog.to_external_ids()
# {
#   'progarchives_artist': '1',
#   'name': 'Genesis',
#   'genre': 'Progressive Rock',
#   'country': 'UK',
#   'founded': 1969
# }

# From Metal Archives — we get a different record
genesis_metal = fetch_band("Genesis")
external_ids_metal = genesis_metal.to_external_ids()
# {
#   'metallum_band': '123',
#   'name': 'Genesis',
#   'genres': ['Rock', 'Progressive'],
#   'country': 'United Kingdom',
#   'formed': 1969
# }
```

**metadatarr discovers they're the same** by analyzing multiple signals:

1. **Name similarity** — both are "Genesis" (fuzzy match handles slight variations)
2. **Genre alignment** — both are Progressive Rock / Rock
3. **Country match** — both are UK/United Kingdom
4. **Timeline match** — both formed/founded 1969
5. **Shared collaborators** — if they've both worked with Pete Gabriel, that's a signal
6. **Catalog overlap** — if both have "Selling England by the Pound," that's the same work

Then it **fuses** them into one canonical record:

```python
from metadatarr import resolve_artist

# Feed it all the Genesis records from different sources
canonical = resolve_artist([genesis_prog, genesis_metal, genesis_bandcamp])

# Out comes one merged record:
print(canonical)
# {
#   'name': 'Genesis',
#   'genres': ['Progressive Rock', 'Rock'],
#   'country': 'UK',
#   'formed': 1969,
#   'external_ids': {
#     'progarchives_artist': '1',
#     'metallum_band': '123',
#     'bandcamp_artist': '456',
#     'source_count': 3
#   },
#   'confidence': 0.99  # How sure are we?
# }
```

The confidence score reflects how strongly the evidence supports the merger. A match on name + genre + country + founding year is very high. A match on only name would be lower (since "Genesis" might refer to multiple bands).

## Why "keyless"?

Most entity resolution assumes you have a master ID — a Spotify URI, an MusicBrainz MBID. You don't. Bandcamp has no public API. Metal Archives doesn't cross-reference Spotify. You have 30 sources and 30 separate ID spaces.

metadatarr doesn't require a master key. It discovers identity from the data itself: names, collaborations, works, release dates. The cross-references are emergent, not pre-baked.

## Pluggable providers

A scraper can register a provider so metadatarr knows how to resolve it:

```python
# py_bandcamp registers itself
from py_bandcamp import BandcampArtistProvider

metadatarr.register(BandcampArtistProvider())
```

When you ask metadatarr to resolve an artist, it queries all registered providers in parallel and fuses the results.

## Why this matters

With deduplicated entities, you can:

- **Build a cross-source recommendation graph** — artists who collaborate across sources
- **Detect licensing edge cases** — if the same album is CC-BY on one source but ARR on another, flag it
- **Serve one canonical record** — users query once and get 30 sources merged

See also: how this powers **[media-archivist](/blog/2026-04-25-why-we-built-media-archivist)**, our indexer and server for scraped data.

## The tool

`metadatarr` is pure Python and works with any data model that implements `to_external_ids()`:

```bash
pip install metadatarr
```

[`metadatarr` on GitHub](https://github.com/TigreGotico/metadatarr)
