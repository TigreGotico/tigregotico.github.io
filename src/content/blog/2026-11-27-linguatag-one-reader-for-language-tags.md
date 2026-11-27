---
title: "linguatag: One Reader for Language Tags"
description: "Every voice, model and lexicon must match the language tag of a user. linguatag reads, standardizes and matches BCP 47 tags, with regional varieties as private-use tags and a cited family tree of languages. No network, about 2 MB."
date: 2026-11-27
author: "Casimiro Ferreira"
tags:
  - "linguatag"
  - "BCP 47"
  - "NLP"
  - "OVOS"
draft: false
---

A user in Luanda asks for Portuguese. The installed voices are `pt-BR` and
`pt-PT`. Which one speaks? Every part of a voice stack asks this question: the
phonemizer, the TTS voice, the translation model and the lexicon. If each part
answers it with its own code, the parts disagree.
[**linguatag**](https://github.com/TigreGotico/linguatag) is the one shared answer.

```bash
uv pip install --prerelease=allow linguatag
```

```python
from linguatag import closest_lang

closest_lang("pt-AO", ["pt-BR", "pt-PT"])                 # 'pt-PT'
closest_lang("zh-HK-HiuMaanNeural", ["zh-CN", "zh-HK"])   # 'zh-HK'
```

A voice id reads as its tag prefix, so a voice name can go in directly. The
outputs in this post come from linguatag 0.10.5a1.

## Standard tags

Tags arrive in many shapes. linguatag turns each one into the BCP 47 form, with
the CLDR and IANA data:

```python
from linguatag import standardize_lang, with_default_region

standardize_lang("pt_br")      # 'pt-BR'
standardize_lang("iw")         # 'he'   (deprecated code)
with_default_region("pt")      # 'pt-PT'
with_default_region("zh-Hant") # 'zh-Hant-TW'
```

A bare language gets the region where the language started and is still spoken.

## Regional varieties

A region is often not enough. Porto and Lisbon speak differently. linguatag
writes such a variety (a *lect*) as a private-use tag, and it matches a lect
inside its language first:

```python
closest_lang("pt-PT-x-porto", ["pt-PT-x-lisbon", "pt-BR"])   # 'pt-PT-x-lisbon'
```

The [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) specs use
these lect tags, and so do some [phoonnx](https://github.com/TigreGotico/phoonnx)
voices (StyleTTS2, MMS).

## Distance and family

`lang_distance` says how well one language serves a speaker of another. 0 is the
same language, up to 10 is a usable fallback, and above 10 is no usable match.
100 marks a different language:

```python
from linguatag import lang_distance, ancestry_similarity

lang_distance("arz", "ar")      # 5    Egyptian Arabic falls back to Standard Arabic
lang_distance("en-AU", "en-GB") # 3
lang_distance("wuu", "zh")      # 100  Wu is not Mandarin

round(ancestry_similarity("es", "pt"), 4)   # 0.4131
round(ancestry_similarity("hi", "bn"), 4)   # 0.2365
```

`ancestry_similarity` reads a family tree of languages and lects. Each edge in
the tree cites a source: a grammar, a paper or Glottolog.

## Small and offline

The wheel holds its data and is about 2 MB. It needs no network and no heavy
dependency. Import takes about 20 ms on a laptop. orthography2ipa, phoonnx, scriptconv and
linguonnx read their tags through it.

## Limits

Only a small part of the start years in the family tree have a source. Some
regional tags, such as `ar-EG`, match the macrolanguage, not the variety. Each
known defect is an open issue on GitHub.
