---
title: "Grapheme-to-IPA for 350+ Languages"
description: "orthography2ipa is a pure-data, linguistically grounded resource that maps spelling to IPA and models how phonemes surface as allophones across 350+ language codes and 20+ language families. A maximal-munch tokenizer, phonological and script distance metrics, dialect lineage, and a schema-validated spec set — no trained weights, fully self-hostable."
date: 2026-01-15
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** is a pure-data Python package — declarative JSON, thin pluggable logic, no trained weights — that maps spelling to IPA and models how those phonemes surface in context across **356 language specs and 20+ language families**. Install it, read the data, fork the data. Nothing is hidden in a checkpoint.

It powers everything downstream: the Portuguese-specific [silabificador](https://github.com/TigreGotico/silabificador) and [TugaPhone](https://github.com/TigreGotico/tugaphone) stacks (see **[classical NLP for Portuguese syllables and phonemes](/blog/2026-05-30-classical-nlp-for-portuguese-syllables-and-phonemes)**), the Barranquenho G2P, and the phoneme grounding for **[TTS that runs on a potato](/blog/2026-05-30-tts-that-runs-on-a-potato)**.

## Two maps, not one

The critical distinction: a **grapheme map** tells you which phonemes a spelling *can* represent. An **allophone map** tells you how a phoneme *surfaces* in context. Conflating them is the most common failure mode in G2P systems.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ɾ', 'ʔ', 't̚']  — one phoneme, five realisations
```

English ⟨th⟩ is genuinely ambiguous between /θ/ and /ð/ — that is a spelling-to-phoneme fact. English /t/ shows up as a plain stop, an aspirated stop, a flap, a glottal stop, or unreleased depending on where it lands — that is a phoneme-to-surface fact. Keeping the two separate means you can go *text → phoneme candidates* for transcription and *phoneme → surface realisation* for pronunciation modelling without one corrupting the other. For TTS that is the difference between a believable accent and a robotic one; for ASR it is the difference between a lexicon that matches what people actually say and one that matches the dictionary.

## What every language carries

Each language is a frozen `LanguageSpec` dataclass, and it carries far more than a phoneme list: graphemes (including digraphs and trigraphs), an allophone map, **positional graphemes** for context-sensitive overrides (word-initial, intervocalic, before /i/), weighted multi-ancestor **ancestry**, cross-word **sandhi rules**, an optional **tone inventory**, and provenance — a `QualityTier` running `stub → skeleton → research → production`, a `ScriptType` (alphabet, abjad, abugida, …), and bibliographic sources.

The inclusion rule is strict and worth stating plainly: **only mappings grounded in official orthography and documented grammar make it in. Arbitrary substring rules are excluded.** Portuguese ⟨lh⟩, German ⟨sch⟩, and English ⟨th⟩ are in because they are standard orthographic units. Convenient-but-invented heuristics are not. When a spec declares graphemes but no explicit allophone map, a baseline identity map is derived — every phoneme is at minimum its own surface realisation — so nothing silently disappears.

Regional varieties get their own specs rather than a flag on a parent. Brazilian and European Portuguese diverge systematically, so they are distinct `LanguageSpec` objects linked by ancestry:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Dialect trees stay maintainable because JSON files support `graphemes_base` / `allophones_base` inheritance: a variant declares only what differs from its parent. Lineage is weighted and multi-ancestor — parent, substrate, superstrate, adstrate — which is the honest way to model languages that are contact products rather than clean descendants.

## A tokenizer that admits ambiguity

Spelling is not a clean segmentation problem, so the package ships `PhonetokTokenizer`, a **maximal-munch** grapheme tokenizer with beam-search IPA expansion. It greedily prefers the longest matching orthographic unit, then explores ranked candidate transcriptions when a spelling is ambiguous:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

Rather than gambling on a single output, you get a scored beam — exactly the input a downstream lexicon, lattice, or pronunciation reranker wants.

## Measuring distance between languages

Because the data is structured rather than baked into weights, you can compare languages directly. The distance metrics span inventory, grapheme, allophone, and ancestry dimensions, plus a separate script-distance family:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Feature vectors are exposed too, so a near-identical pair like the two Portuguese standards lands at 0.04 while genuinely distant pairs separate cleanly. This is useful for transfer-learning decisions, low-resource bootstrapping, and dialectometry alike.

## The CLI

Everything above is reachable without writing Python. The `orthography2ipa` console script ships `list`, `info`, `transcribe`, and `distance`, and every subcommand takes `--json` for piping into a pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Why pure data matters

The whole spec set is schema-validated — frozen pydantic-style dataclasses, **356 specs** swept by an integrity test suite, with `SCHEMA.md` documenting the shape. Algorithmic backends, where a static table genuinely cannot express the rules, plug in through an entry-point group: the bundled Arabic G2P handles consonant mapping, harakat vowels, sun-letter assimilation, hamzat al-wasl elision, and tanwin forms.

There is no opaque model deciding how your users' languages sound. The mappings are auditable, the sources are cited, and adding a language is writing one validated JSON file. For anyone building TTS, ASR, or phonetic NLP who refuses to outsource their phonology to a black box — and who wants it running on their own hardware — that is the point. It is Apache 2.0, and it is yours to inspect, extend, and self-host.
