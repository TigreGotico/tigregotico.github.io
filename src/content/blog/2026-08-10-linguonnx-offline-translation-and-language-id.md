---
title: "linguonnx: Offline Translation and Language ID on ONNX"
description: "linguonnx translates text and identifies languages on the CPU, with no torch and no cloud. 184 int8 translation models and 5 language-ID models, 586 routable languages, and a router that chains small models when no single model covers a pair."
date: 2026-08-10
author: "Casimiro Ferreira"
tags:
  - "linguonnx"
  - "translation"
  - "language identification"
  - "ONNX"
  - "self-hosted"
  - "OVOS"
draft: false
---

[**linguonnx**](https://github.com/TigreGotico/linguonnx) is a Python library for
machine translation and language identification. It runs on `onnxruntime`, on the
CPU, offline. It does not use torch at any point — the encoder-decoder generation
loop, beam search and KV cache included, is written against the raw ONNX graphs.

```bash
pip install linguonnx
```

```python
from linguonnx import load_translator, load_detector

tx = load_translator()
print(tx.translate("bom dia, como estás?", src="pt", tgt="en"))
# 'Good morning, how are you?'   via opus-mt-pt-en-int8, 172 MB

det = load_detector()
print(det.detect("Egun on, zer moduz?"))    # 'eu'
```

It is Apache-2.0, and it downloads no model you did not ask for.

## What ships

The registry holds 369 translation entries — fp32 and int8 of every model — and 10
language-ID entries. `load_translator()` defaults to int8, so 184 quantised
translation models and 5 quantised classifiers are what a default install routes
over. Every one of them is an ONNX conversion published under
[`TigreGotico/`](https://huggingface.co/TigreGotico) on HuggingFace.

Over the default graph, 586 languages are routable. That number is pinned in the
test suite, so it stays true or the build says so.

The classifiers are ONNX exports of four fastText models: GlotLID, fastText's
`lid.176`, OpenLID and OpenLID-v2. GlotLID labels 2102 *varieties*, so colloquial
Arabic comes back as Najdi (`ars`) and Chinese may come back as Cantonese. That is
dialect identification when you want it, and `collapse_varieties=True` when you
do not.

## A pair with no model is a chain of models

Most language pairs have no bilingual model. The router treats a model as a set of
capabilities rather than a fixed edge, and chains hops when it has to:

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — it went through Galician
```

Under that policy Portuguese to Basque goes through Galician, over two Marian
models of 84 MB and 153 MB. The pivot is never silent: the `Route` comes back with
the translation and says which models it used and which languages it passed
through.

A route is not a fixed fact about a language pair. It is what the caller's
constraints make of the registry: change the size budget or the hop preference and
the same pair may pivot through a different language, or collapse into a single
hop through one large multilingual model. The `Route` says which one you got.

Ranking prefers the institution that owns the language. HiTZ trains Basque,
Proxecto Nós trains Galician, Projecte AINA trains Catalan, AI4Bharat trains the
Indic pairs, Masakhane trains the West-African pairs, TartuNLP trains the
Finno-Ugric ones. A model from the specialist wins a tie against a general
multilingual model.

## Policy at runtime, never at index time

This is the design law of the registry: it lists every published model, whatever
its size, its licence or its score. Filtering and ranking happen at runtime, in
the caller's process, under the caller's rules. A model that the index leaves out
cannot be opted into at all, so the index leaves nothing out.

The caller sets the policy through `load_translator`: `max_model_mb`,
`oversize_fallback`, `count_cached_as_free`, `prefer`, `max_hops`, `precision`,
`model_cache_size`, `exclude_flagged` and `min_chrf`. Every one of them also
overrides per call.

## A size cap prefers small models, it does not delete languages

A size budget is the obvious knob for a small host, and the obvious implementation
of it is wrong. Used as a filter, `max_model_mb=500` cuts 586 routable languages
down to 249, because the long tail lives inside the big multilingual models and no
chain of small models replaces them.

`oversize_fallback=True` makes the budget a preference instead:

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 586, not 249
```

English to Catalan stays on the small model, because a small model exists. English
to Chuvash escalates to MADLAD, because MADLAD is the only model in the registry
with Chuvash, and the alternative is not a cheaper route but no route.
`waived_size_cap` reports which cap the route was allowed past, so a host that
budgeted 500 MB finds out it fetched 4945 MB.

Four rules keep that honest. The wider search runs only for the pair that came
back empty. The cap rises one model size at a time, so a pair served by both
NLLB-200 and MADLAD gets NLLB-200. The cap bounds one model, not a route, so a
two-hop chain of 237 MB models is found by the ordinary capped search. And the
escalation never passes the download budget.

## Routable is not usable

`madlad400-3b-mt` covers Chuvash. Ask it for `en -> cv` and it answers in Russian:
`"Good day, my friend."` comes back as `"Добрый день, мой друг."`. The routing is
correct — the Chuvash tag is a distinct SentencePiece piece — and the model still
writes the wrong language.

So a registry entry carries `language_flags`, one language at a time, with the
observation behind it: the input, the output, the detector verdict (`glotlid=ru`),
the date and the method. Chuvash is routable and it is not usable, and the
registry says both.

Whole-model quality is recorded the same way. A `quality` field carries a chrF
score against the **human** FLORES-200 devtest reference, with the corpus, the
decode mode and the sample size beside it, because a score with no sample size next
to it means nothing. Absence of the field means unmeasured, which is not the same
state as bad, and nothing invents a number for an unmeasured model. Two checks
raise a flag: chrF below 40 in either precision, and int8 trailing fp32 by more
than 2 chrF.

A flag removes nothing from the registry. It gives `exclude_flagged=True` and
`min_chrf=` something to act on, and it gives a human a reason to read:

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

A registry-wide sweep runs one real sentence through every registered model and
fails on empty output, whitespace-only output, or output identical to the input.
The sample sentences are per source language and hand-checked; a language with no
sample is skipped rather than tested with text from another language.

## From OpenVoiceOS

[`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)
wraps the library as two plugins from one install: a language detector
(`opm.lang.detect`, id `ovos-lang-detect-plugin-linguonnx`) and a translator
(`opm.lang.translate`, id `ovos-translate-plugin-linguonnx`). Both load models on
first use, and every argument to `load_detector` and `load_translator` is reachable
from `mycroft.conf`.

The library documents the rest: [routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md)
for the policies and the size budget, [models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md)
for the registry, and [licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
for the tiers — GPL-3.0 and CC-BY-NC-4.0 models exist in the index and must be
asked for by name.
