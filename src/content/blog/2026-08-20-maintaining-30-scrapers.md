---
title: "Maintaining 30+ Scrapers as One Family: Typing, Testing, Releasing"
description: "Scraper maintenance at scale is a nightmare unless you have discipline. We maintain 30+ music and media clients with one test suite, one CI/CD pattern, and one shared vocabulary. Here is how."
date: 2026-08-20
author: "Casimiro Ferreira"
tags:
  - "Open Source"
  - "Testing"
  - "CI/CD"
  - "Maintenance"
  - "Web Scrapers"
  - "FOSS"
draft: false
---

## The scraper maintenance nightmare

Build one scraper and it's a joy. Build ten and you have a pattern to follow. Build thirty and you're in hell unless you solve the **meta-problem** first.

When you have 30 scrapers, each with its own:
- **Parsing logic** (sites change their HTML; your selectors break)
- **Dependencies** (each depends on libraries; versions drift independently)
- **Release cycle** (you need to cut 30 releases when bugs are found)
- **Test suite** (which ones pass? which ones are broken and nobody noticed?)

You end up with:
- Some repos that haven't been touched in 6 months (stale parsers)
- Some with CI failures nobody's paying attention to (bitrotting tests)
- Some that ship without being tested (regression waiting to happen)
- One person drowning trying to keep the lights on

The solution: **don't treat 30 scrapers as 30 projects. Treat them as one family with 30 variants.**

## The family architecture: shared patterns

Maintenance at scale is only possible with discipline. We use three shared layers.

### 1. One contract: mediavocab schema

**Every scraper speaks the same language.** Whether it's scraping Bandcamp, Metal Archives, MyAnimeList, or a music encyclopedia, it emits **[mediavocab](https://github.com/OpenVoiceOS/mediavocab)** objects: `Release`, `Entity`, `Work`.

```python
# py_bandcamp emits mediavocab
from py_bandcamp import fetch_album
album = fetch_album("https://...")
assert isinstance(album, mediavocab.Release)  # Always

# pymetal emits the same
from pymetal import fetch_band
band = fetch_band("...")
assert isinstance(band, mediavocab.Entity)  # Same schema, different source

# A consumer doesn't care which scraper provided it
def show_artist(entity):
    print(f"{entity.name} from {entity.country}")
    
show_artist(album.artist)    # Works
show_artist(band)             # Works
show_artist(anime.creator)    # Works — all follow the same interface
```

The payoff: a downstream consumer — a deduplicator, an indexer, a recommender — writes code **once** and it works with data from **any** source. No per-scraper glue code. One contract, 30 implementations.

### 2. One test suite pattern

Every scraper ships `tests/test_<source>.py` with the same structure:

```python
# tests/test_bandcamp.py
def test_search():
    results = search_artists("genesis")
    assert len(results) > 0
    assert isinstance(results[0], mediavocab.Entity)

def test_fetch_detail():
    artist = fetch_artist(KNOWN_ARTIST_ID)
    assert artist.name
    assert artist.to_external_ids()
```

Naming is consistent. Assertions are predictable. CI runs `pytest` on all 30 repos in parallel.

### 3. One CI/CD pattern (gh-automations)

All 30 scrapers use the same GitHub Actions workflows from **gh-automations** (referenced at `@dev` branch):

```yaml
# All 30 repos have this
uses: OpenVoiceOS/gh-automations/.github/workflows/test.yml@dev
uses: OpenVoiceOS/gh-automations/.github/workflows/release.yml@dev
```

When we improve CI, all 30 repos get the improvement automatically. No copy-pasting. One change, 30 repos updated.

### 4. One provider pattern (metadatarr)

Each scraper registers a **[metadatarr](https://github.com/TigreGotico/metadatarr)** provider so it can be discovered:

```python
# In py_bandcamp/py_bandcamp/__init__.py
from metadatarr import register_provider

register_provider(BandcampEntityProvider())
```

When metadatarr needs to resolve identity, it queries all registered providers. No central registry. Each scraper knows how to help.

## The payoff

With these patterns in place:

- **30 releases at once** — one CI job cuts versions for all repos
- **Consistent APIs** — all scrapers share `.search()`, `.fetch_*()`, `.to_external_ids()`
- **One test run** — failure in any repo is visible
- **Upgradeable at scale** — update the CI once, 30 repos get the update
- **Discoverable** — metadatarr finds them automatically

## How we discovered these patterns

We did not design this top-down. We built the first scraper, then the second, and noticed duplication. We refactored the common bits into:

1. **mediavocab** (shared schema)
2. **metadatarr** (shared identity)
3. **gh-automations** (shared CI/CD)

Once those three existed, adding the 4th, 5th, and 30th scraper became routine. Each new scraper is a shallow copy of the last, tweaked for the specific source.

See also: **[data pipeline end-to-end](/blog/2026-08-10-data-pipeline-end-to-end)** — the full architecture these scrapers feed into.

## The lesson

If you are building multiple tools that solve similar problems:

1. **Extract the contract** (our: mediavocab)
2. **Build the registry** (our: metadatarr)
3. **Standardize the plumbing** (our: gh-automations)
4. **Add each new tool as a shallow variation**, not a full rewrite

The 30th scraper should take one afternoon, not two weeks. If it is taking two weeks, your abstraction layer is leaking.

All tools are open:

- [mediavocab](https://github.com/OpenVoiceOS/mediavocab) — schema
- [metadatarr](https://github.com/TigreGotico/metadatarr) — identity
- [gh-automations](https://github.com/OpenVoiceOS/gh-automations) — CI/CD

Use them for your own scraper family, if you have one.
