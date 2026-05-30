---
title: "Dataset Curation at Scale: From HTML to HuggingFace"
description: "When you scrape 30 sources into one catalogue, you have raw data. Curating it into a ML-ready dataset requires: license detection, deduplication, schema validation, versioning, and publication to HuggingFace. Here is our pipeline."
date: 2026-05-05
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Curation"
  - "ML"
  - "Data Quality"
  - "HuggingFace"
  - "FOSS"
draft: false
---

## From scraped data to publishable datasets

Raw scraped data is messy:

- **Duplicates** — the same album appears in three sources under slightly different names
- **Licensing ambiguity** — which works are safe to republish?
- **Schema drift** — one source has `release_date`, another has `published_at`
- **Provenance loss** — which version is the authoritative one?

Turning this into a ML-ready dataset requires **curation**: cleaning, validation, licensing, and versioning. We did this at scale by building it into the pipeline.

## The curation pipeline: 5 steps from raw to published

Turning scraped data into a ML-ready dataset requires discipline at every stage.

### 1. License detection

Before you publish anything, ask: **can we legally do this?** Some data is open (CC-BY, public domain). Some is proprietary (all rights reserved). Some is in between.

Every **[mediavocab](https://github.com/OpenVoiceOS/mediavocab)** record carries license metadata. Our scrapers parse it from the source:

```python
# From py_bandcamp — Bandcamp tells us the license
release = fetch_album(...)

# Is this release actually open?
is_open = release.parsed_license.is_open()           # CC-BY, CC-0, etc?
allows_remix = release.parsed_license.allows_derivative()  # Can we modify?
allows_commercial = release.parsed_license.allows_commercial()  # Sell it?
```

When curating a dataset, **filter aggressively** to licenses you can republish:

```python
safe_releases = [
    r for r in releases 
    if r.parsed_license and r.parsed_license.is_open()
]

print(f"Safe to publish: {len(safe_releases)} of {len(releases)}")  
# "Safe to publish: 4,231 of 10,000"
```

The stricter your filter, the smaller your dataset — but the more defensible. You're better off publishing 4,000 items legally than 10,000 items with liability.

### 2. Deduplication

You scraped 30 sources. The same album appears in multiple sources under slightly different names. **[metadatarr](https://github.com/TigreGotico/metadatarr)** deduplicates by discovering identity:

```python
from metadatarr import deduplicate_releases

# Input: 10,000 release records (potentially many duplicates)
all_releases = [
    # Same album from Bandcamp, labeled differently
    Release(title="Never Gonna Give You Up", artist="Rick Astley", source="bandcamp"),
    # Same album from prog-archives
    Release(title="Never Gonna Give You Up", artist="Rick Astley", source="progarchives"),
    # Different album
    Release(title="Matters", artist="Thom Yorke", source="bandcamp"),
]

# Output: deduplicated records with cross-references
canonical_releases = deduplicate_releases(all_releases)
# Returns: 2 canonical records (Rick Astley + Thom Yorke)
# Rick Astley record now has: {'bandcamp': '123', 'progarchives': '456'}
```

The result: one record per unique work, with all source IDs tracked. No data loss, just clarity.

### 3. Schema validation

All your records should follow the same schema. **[mediavocab](https://github.com/OpenVoiceOS/mediavocab)** defines it:

```python
from mediavocab import Release

# Try to convert each record to the standard schema
try:
    validated = Release(**record)
except ValueError as e:
    print(f"Validation error: {e}")
    # This record doesn't fit. Skip it or fix it.
```

Schema validation catches:
- Missing required fields (missing artist name)
- Wrong types (release date as a string instead of a date)
- Invalid values (genre not in the approved list)

It's tedious but crucial. A dataset is only useful if downstream consumers can rely on the structure.

### 4. Versioning and provenance

Track which source each record came from, when it was scraped, what version of the schema:

```python
{
  "work": {"title": "...", "artists": [...]},
  "releases": [...],
  "external_ids": {
    "bandcamp": "...",
    "metallum": "..."
  },
  "scraped_at": "2026-05-05T10:00:00Z",
  "sources": ["py_bandcamp", "metallum"],
  "schema_version": "1.2"
}
```

### 5. Publication to HuggingFace

Once curated, push to HuggingFace Datasets:

```bash
huggingface-cli repo create tigregotico/music-metadata
python -m huggingface_hub upload dataset \
  local_path=./curated_dataset.jsonl \
  repo_id=tigregotico/music-metadata
```

Now your dataset is versioned, citable, and auditable.

## Why this matters

A published dataset is reusable. Someone building a recommendation engine doesn't need to re-scrape 30 sources — they use your dataset. Someone training a search model can rely on your deduplicated IDs. Someone studying music history gets provenance: "this data is from Prog Archives, licensed CC-BY, last updated 2026-05-05".

See also: how this connects **[data extraction](/blog/2026-04-05-data-extraction-clean-apis-and-datasets)** → **[entity resolution](/blog/2026-04-12-entity-resolution-music-metadata)** → **[media-archivist](/blog/2026-04-25-why-we-built-media-archivist)** → **datasets**.

It is the full pipeline: scraping → typing → deduping → serving → publishing.
