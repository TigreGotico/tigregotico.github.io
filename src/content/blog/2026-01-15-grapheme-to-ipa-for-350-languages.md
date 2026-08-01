---
title: "Grapheme-to-IPA for 807 Languages"
description: "orthography2ipa is a pure-data, linguistically grounded resource that maps spelling to IPA and models how phonemes surface as allophones across 896 language specs, 807 languages, and 20+ language families. A candidate lattice, a maximal-munch tokenizer, phonological and script distance metrics, dialect lineage, and a schema-validated spec set cited to the dialectological literature — no trained weights, fully self-hostable."
date: 2026-01-15
updated: 2026-08-01
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

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** is a pure-data Python package — declarative JSON, thin pluggable logic, no trained weights — that maps spelling to IPA and models how those phonemes surface in context. It ships **896 language specs covering 807 languages** (plus 89 classification-only clade nodes) across **20+ language families**. Install it, read the data, fork the data. Nothing is hidden in a checkpoint.

It is the phonology layer beneath everything downstream: the candidate lattice it produces is consumed by the Arabic TTS frontend [arbtok](https://github.com/TigreGotico/arbtok), the Portuguese [TugaPhone](https://github.com/TigreGotico/tugaphone) and [silabificador](https://github.com/TigreGotico/silabificador) stacks (see **[classical NLP for Portuguese syllables and phonemes](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), the [Barranquenho phonemizer](/blog/2025-12-12-barranquenho), the Mirandese phonemizer, and the phoneme grounding for **[TTS that runs on a potato](/blog/2026-05-10-tts-that-runs-on-a-potato)**.

## Two maps, not one

The critical distinction: a **grapheme map** tells you which phonemes a spelling *can* represent. An **allophone map** tells you how a phoneme *surfaces* in context. Conflating them is the most common failure mode in G2P systems.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

English ⟨th⟩ is genuinely ambiguous between /θ/ and /ð/ — that is a spelling-to-phoneme fact. English /t/ shows up as a plain stop, an aspirated stop, a glottal stop, or a flap depending on where it lands — that is a phoneme-to-surface fact. Keeping the two separate means you can go *text → phoneme candidates* for transcription and *phoneme → surface realisation* for pronunciation modelling without one corrupting the other. For TTS that is the difference between a believable accent and a robotic one; for ASR it is the difference between a lexicon that matches what people actually say and one that matches the dictionary.

## What every language carries

Each language is a frozen `LanguageSpec` dataclass, and it carries far more than a phoneme list: graphemes (including digraphs and trigraphs), an allophone map, **positional graphemes** for context-sensitive overrides (word-initial, intervocalic, before /i/), weighted multi-ancestor **ancestry**, cross-word **sandhi rules**, an optional **tone inventory**, and provenance — a `QualityTier` running `stub → skeleton → research → production`, a `ScriptType` (alphabet, abjad, abugida, …), and bibliographic sources with page pins.

The inclusion rule is strict and worth stating plainly: **only mappings grounded in official orthography and documented grammar make it in. Arbitrary substring rules are excluded.** Portuguese ⟨lh⟩, German ⟨sch⟩, and English ⟨th⟩ are in because they are standard orthographic units. Convenient-but-invented heuristics are not. When a spec declares graphemes but no explicit allophone map, a baseline identity map is derived — every phoneme is at minimum its own surface realisation — so nothing silently disappears.

Regional varieties get their own specs rather than a flag on a parent. Brazilian and European Portuguese diverge systematically, so they are distinct `LanguageSpec` objects linked by ancestry:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Dialect trees stay maintainable because JSON files support `graphemes_base` / `allophones_base` inheritance: a variant declares only what differs from its parent. Lineage is weighted and multi-ancestor — parent, substrate, superstrate, adstrate — which is the honest way to model languages that are contact products rather than clean descendants.

## Deep on the ground, not just wide

The 807 figure is breadth; the depth is where the work is. The specs go lect by lect where the dialectological literature does, and each one is cited to that literature with page pins rather than pattern-matched from a phoneme chart.

The **Iberian** coverage is the clearest example: **100+ specs** for the languages of the peninsula. Every Romance language of Spain — Castilian, Catalan/Valencian, Galician (both the RAG and reintegrationist norms), Asturian, Aragonese and its valley varieties (Ansotano, Chistabín, Benasqués…), Extremaduran — alongside Basque, the Ibero-Romance creoles, and the historical layers most resources skip entirely: **Andalusi Arabic** and **Mozarabic**. The Arabic side carries **34 dialect lects** (from Najdi and Hejazi through Levantine, Maghrebi and the peninsular varieties), and the Lusophone side **46 Portuguese-and-Portugal-language lects**, down to Rionorese, Guadramilese, and the Mirandese sub-dialects.

To our knowledge, several of these are the **first machine-readable phonology** ever published for the variety — meaning a structured, schema-validated grapheme/allophone spec a program can query, as opposed to a phoneme inventory described only in prose in the dialectological literature — Rionorese and Guadramilese among them. The downstream work ships the **first IPA dictionaries** for **Barranquenho** and **Mirandese**.

## A candidate lattice, not a single guess

Spelling is not a clean segmentation problem, so the flagship architecture is a **candidate lattice**. The `PhonetokTokenizer` does **maximal-munch** grapheme tokenization — greedily preferring the longest matching orthographic unit — and, over the spec's grapheme table, produces a per-position lattice of ranked IPA candidates instead of one brittle output:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

The lattice is the contract the whole downstream family builds on. A language-specific engine consumes the shared lattice and adds only the phonology a static table cannot express, keeping every consumer on the same grounded core:

- **[arbtok](https://github.com/TigreGotico/arbtok)** builds Arabic TTS phonology on the lattice, adding sun-letter assimilation, hamzat al-waṣl elision, gemination and ligature handling — and a novel **rawi-lattice fusion** that restores the missing short vowels of undiacritized dialectal text by scoring an ensemble's per-character distribution *under the requested lect's licensing*, rather than trusting a free generator.
- **[TugaPhone](https://github.com/TigreGotico/tugaphone)**, **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** (Mirandese), and **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** all consume the same lattice-core for their Lusophone varieties.

## Measuring distance between languages

Because the data is structured rather than baked into weights, you can compare languages directly. The distance metrics span inventory, grapheme, allophone, and ancestry dimensions, plus a separate script-distance family:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.0515 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Feature vectors are exposed too, so a near-identical pair like the two Portuguese standards lands at 0.0515 while genuinely distant pairs separate cleanly. This is useful for transfer-learning decisions, low-resource bootstrapping, and dialectometry alike.

## How we know the data is any good

Reliable G2P "gold" barely exists — most public datasets are a phonemizer's own output reused as a reference, so a low error rate against them means "agrees with that tool", not "correct". We are explicit about this and built a verification methodology around it rather than reporting a single flattering number.

For the varieties we care most about, gold is **authored, not scraped**: an engine-pinned sentence set per lect, judged in **blind pairs**, arbitrated against **page-pinned literature**, and folded back through **correction classes** into an engine feedback loop — a disagreement between the engine's output and the corrected form is a lead on an actual spec bug. Across the engine-pinned TTS gold and the primary-source attestations there are **several thousand verified rows**. The framing is deliberately honest about provenance: synthetic and literature-arbitrated where that is all that exists, and genuine human gold where it does — the native-speaker Mirandese `mirandese_g2p` set, page-pinned primary-source attestations, and native contributions. Accuracy claims are made **only** against human gold; a perfect score against the engine's own draft would mean nothing.

The numbers, read as directional and always cited to their source ([`docs/scoreboard.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/scoreboard.md), [`docs/benchmarks.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/benchmarks.md), and the downstream repos' benchmark docs):

- **Arabic dialects, bare undiacritized input** — the hard, deployment-realistic case. On arbtok's bare-input TTS gold (33 lects), the rawi-lattice fusion under dialect licensing reaches a **mean PER of 0.189**, beating the same ensemble run as a free generator (0.193), with the margin concentrated on the lects that diverge most from MSA. On most lects arbtok beats espeak-ng on the bare input; on MSA itself, espeak — which is MSA-tuned — still wins (espeak 0.176 vs arbtok 0.245).
- **Arabic dialects, diacritized input** — with the marks present arbtok's PER sits at **0.01–0.08** per lect, well under espeak's single MSA voice (e.g. Najdi 0.009 vs espeak 0.221; Egyptian 0.027 vs espeak 0.287). espeak has no dialect voices, so this is honestly apples-to-oranges — but the gap is the point.
- **Portuguese, against expert-human gold** — Lisbon European Portuguese lands at **PER 0.029** (88% exact-match) on page-pinned primary sources, and the native-speaker Mirandese gold at **0.146**.

Every one of those is a current-state property of the data, cross-referenced to a bootstrap confidence interval, not a leaderboard trophy. Where the interval is wide or the sample tiny, the scoreboard says so.

## The CLI

Everything above is reachable without writing Python. The `orthography2ipa` console script ships `list`, `info`, `transcribe`, and `distance`, and every subcommand takes `--json` for piping into a pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Why pure data matters

The whole spec set is schema-validated — frozen pydantic-style dataclasses swept by an integrity test suite, with `SCHEMA.md` documenting the shape. Where a static table genuinely cannot express the rules, language-specific logic plugs in around the data: syllabifiers register through an entry-point group, and the heavier engines build on the shared lattice downstream.

There is no opaque model deciding how your users' languages sound. The mappings are auditable, the sources are cited to the page, and adding a language is writing one validated JSON file — start from [`docs/adding_a_language.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/adding_a_language.md) and the [getting-started guide](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/getting_started.md). For anyone building TTS, ASR, or phonetic NLP who refuses to outsource their phonology to a black box — and who wants it running on their own hardware — that is the point. It is Apache 2.0, and it is yours to inspect, extend, and self-host.
