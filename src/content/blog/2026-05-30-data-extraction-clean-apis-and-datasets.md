---
title: "From Hard-to-Reach Web Data to Clean APIs and ML-Ready Datasets"
description: "How we turn unstructured, bot-defended public web data into typed Python client libraries and curated datasets — resilient anti-bot scraping with CloudflareSession, API reverse-engineering, one consistent typed interface over messy sources, and dataset construction with clear provenance."
date: 2026-05-30
author: "Casimiro Ferreira"
tags:
  - "Data Extraction"
  - "Web Scraping"
  - "APIs"
  - "Datasets"
  - "Python"
  - "FOSS"
draft: false
---

A great deal of valuable data lives on the public web but is effectively
unreachable. It is locked in unstructured HTML, hidden behind anti-bot defenses,
exposed only through undocumented endpoints, or sitting in formats no search
engine indexes. Getting it out — and keeping it out as sites change — is one of
our first-tier services. This is the toolchain we use, end to end: from a blocked
HTTP request to a typed Python client to a versioned, ML-ready dataset.

## The wall: bot detection

Most interesting sources put up a fight. The two obstacles are almost always the
same: someone wants to know **who** you are (IP reputation) and **what** you are
(is this a real browser, or a script?). We treat these as two orthogonal problems
and solve each with a small, composable library.

For the "what are you" problem we built
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests), a drop-in
`requests.Session` subclass. Because it only overrides `request()`, every
`.get()`/`.post()` keeps working and anything typed against `requests.Session`
accepts it unchanged:

```python
from unblock_requests import CloudflareSession

s = CloudflareSession(flaresolverr_url="http://192.168.1.116:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
```

The interesting part is the transport layer. `CloudflareSession` can clear a bot
check four different ways, picked by a `mode=` kwarg or an environment variable:

- **`curl_cffi`** (default) — Chrome TLS/JA3 impersonation. Clears the
  fingerprint check on most networks without any extra infrastructure.
- **`flaresolverr`** — proxy through a headless
  [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) instance that
  solves the JavaScript challenge for genuinely **live** data. Selected
  automatically when you give it a `flaresolverr_url`.
- **`wayback`** — read the latest Internet Archive snapshot. Stale, but needs no
  infrastructure at all and never gets blocked.
- **`requests`** — plain, no impersonation.

The clever bit is graceful degradation. Challenge detection is heuristic, and on
a blocked GET the session can fall back to the Wayback Machine automatically:

```python
CloudflareSession(flaresolverr_url="http://host:8191", wayback_fallback=True)
```

So a scraper that loses live access doesn't crash — it quietly serves the most
recent archived copy instead. That single property is the difference between a
pipeline that pages you at 3 a.m. and one that keeps producing data.

For the "who are you" problem there is the companion library,
[`anon_requests`](https://github.com/TigreGotico/anon_requests), which rotates
your IP through SOCKS/HTTP proxies or Tor. The two stack cleanly: `anon_requests`
takes a `session_factory` — any callable returning a `requests.Session` — so you
inject a `CloudflareSession` underneath the rotation and get IP rotation **and**
challenge-solving from one object. The rotated proxy even flows down into
FlareSolverr:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates IP + solves Cloudflare
```

Both are self-hostable and run entirely on your own hardware — no third-party
scraping API, no data leaving your machine.

## The shape: one clean, typed API over a messy source

A solved HTTP request is just raw HTML. The real product is a small, documented
client library that hands back **typed objects** instead of soup. The parsing
layer is deliberately independent of how the bytes were fetched, so the same
parser works whether the HTML came in live or from the archive.

Take [`pyprogarchives`](https://github.com/TigreGotico/pyprogarchives), our
client for the Prog Archives catalogue of progressive-rock bands. It scrapes the
site's HTML behind clean dataclasses — browse the A–Z index, search by name,
fetch a band's full page with genre, country, biography and a rated discography:

```python
import pyprogarchives as pa

genesis = pa.search_artists("genesis")[0]
detail = pa.fetch_artist(genesis.artist_id)
for album in detail.albums:
    print(album.year, album.avg_rating, album.title)
```

Every model exposes **canonical ids** for de-duplication and cross-referencing
(`to_external_ids_dict()` → `{'progarchives_artist': '1', ...}`). The package
stays a pure scraper; the cross-referencing resolver lives in a separate
`metadatarr` repo and auto-discovers the provider, so integration code never gets
scattered across client libraries.

Where it makes sense, clients emit a shared vocabulary rather than a
library-specific schema. Our Bandcamp client,
[`py_bandcamp`](https://github.com/TigreGotico/py_bandcamp), returns
[`mediavocab`](https://github.com/OpenVoiceOS/mediavocab) `Release` and `Entity`
objects — validated models with fields like `release.work.title`,
`release.parsed_license.is_open()`, and a normalised `external_ids` map across
every source. The win is consumer-side: one consistent typed interface instead of
bespoke scraping (and bespoke bugs) for every project that needs the data.

These clients are FOSS and reverse-engineer undocumented behaviour where there is
no public API at all — Bandcamp, for instance, offers none; the stream URL comes
out of a page attribute, and the library is honest that time-limited tokens
shouldn't be cached.

## The payoff: ML-ready datasets

Typed clients are the substrate; datasets are what we build on top. Once a source
emits clean, de-duplicated, cross-referenced records, curating them into a
structured, versioned dataset with clear provenance is the easy part. Canonical
ids make joins across sources reliable; the `is_open()` license check lets us
filter to material that is actually safe to redistribute before anything is
published.

That same extraction toolchain feeds everything downstream — media-metadata
enrichment, recommendation graphs, and training corpora for speech and language
models. When the data a model needs does not exist yet, this is how we go and
build it: resilient scraping at the bottom, a typed API in the middle, and a
clean dataset at the top, every layer self-hosted and open by default.
