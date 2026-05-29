---
title: "A Lightweight Classical NLP Toolbox"
description: "Four small, fast, dependency-light, fully-offline NLP libraries — RAKE keyword extraction, Aho-Corasick NER, keyword/template intent matching, and Markov-chain text generation. Classical algorithms that stay transparent, deterministic, and instant, and compose cleanly over Portuguese and multilingual text."
date: 2026-05-30
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "FOSS"
  - "Self-Hosted"
  - "Classical Algorithms"
draft: false
---

## Not everything needs a transformer

A large language model is a remarkable hammer, but a lot of text problems are not nails. When you need to pull the salient phrases out of a document, tag known entities, route a phrase to an action, or generate text in a controllable way, a classical algorithm often wins on the axes that actually matter in production: it is **transparent** (you can read why it did what it did), **deterministic** (the same input gives the same output), **instant** (microseconds, not seconds), and it runs **fully offline** with no GPU and no cloud round-trip.

We maintain four small libraries in this spirit. Each is permissively licensed, installs from PyPI, and is light enough to drop into an edge device or a CI job. They also compose well, and they behave correctly on Portuguese and other Lusophone text.

## RAKE — Rapid Automatic Keyword Extraction

[`RAKEkeywords`](https://github.com/TigreGotico/RAKEkeywords) implements the RAKE algorithm (Rose, Engel, Cramer and Cowley, 2010): it splits a document on stopwords and punctuation into candidate phrases, then scores each phrase by word frequency and degree. No training, no model file — you call `extract_keywords` and get ranked phrases back.

```python
from RAKEkeywords import Rake

rake = Rake()
keywords = rake.extract_keywords(
    "O assistente de voz livre e de código aberto funciona "
    "sem ligação à internet e respeita a privacidade do utilizador"
)
# -> ranked (phrase, score) pairs, multi-word phrases scored highest
```

The output is a list of `(phrase, score)` tuples ordered by relevance, with multi-word phrases naturally floating to the top because their scores accumulate across constituent words. It is ideal for document tagging, search indexing, or feeding candidate slots into the matcher below.

## Aho-Corasick NER — gazetteer-based entity recognition

[`ahocorasick-ner`](https://github.com/TigreGotico/ahocorasick-ner) is rule-based Named Entity Recognition built on the [Aho-Corasick](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm) automaton. You give it vocabularies (gazetteers) of known terms per label; it builds a finite-state machine that matches all of them in a single pass over the text. With 100k+ known phrases it still tags documents in milliseconds.

```python
from ahocorasick_ner import AhocorasickNER

ner = AhocorasickNER()
ner.add_word("cidade", "Lisboa")
ner.add_word("cidade", "Porto")
ner.add_word("pais", "Portugal")
ner.fit()

for entity in ner.tag("Viajei do Porto para Lisboa, e depois saí de Portugal."):
    print(entity)
# {'start': 8, 'end': 13, 'word': 'Porto', 'label': 'cidade'}
# {'start': 21, 'end': 27, 'word': 'Lisboa', 'label': 'cidade'}
# ...
```

Matching is word-boundary-aware with greedy longest-match, and can be case-sensitive or insensitive. There are **three backends** behind one identical `add_word` / `fit` / `tag` / `save` / `load` API: `pyahocorasick` (a C extension, fastest, the default), a **pure-numpy** backend with no C dependency for portability, and an **ONNX** backend for edge or WASM deployment. The trade-off is honest and documented: it is exact matching only, with no fuzzy tolerance and no nested/overlapping entities, so every entity must be known in advance. For domains with a finite, curated vocabulary — place names, product catalogues, media titles — that is exactly what you want.

## Keyword/template matching — rule-based intent NLU

[`kw-template-matcher`](https://github.com/TigreGotico/kw-template-matcher) covers the other half of light NLU: turning a phrase into a structured intent with extracted slots. You write templates with a small grammar — optional phrases in `[brackets]`, alternatives in `(this|that)`, and named slots in `{braces}` — and the library expands and matches them, with fuzzy scoring via `rapidfuzz` and slot parsing via `simplematch`.

```python
from kw_template_matcher import TemplateMatcher

matcher = TemplateMatcher()
matcher.add_templates([
    "[olá,] (chamo-me|o meu nome é) {nome}",
    "conta-me uma [{tipo}] piada",
])

for match in matcher.match("olá, o meu nome é Ana"):
    print(match)  # captures {nome}: "Ana"
```

There is also a standalone `expand_slots` helper that materialises every concrete sentence a template can produce given candidate slot values — handy for generating training data or sanity-checking grammar coverage. Because it is pure rules, it is fully inspectable: when an intent matches, you can see exactly which template and which slot values produced it.

## MarkovJson — controllable text generation

[`markovjson`](https://github.com/TigreGotico/markovjson) rounds out the toolbox with Markov-chain models and JSON persistence. Tokenization is flexible: `MarkovCharJson` works at the character level, `MarkovWordJson` at the word level, and `MarkovNLPJson` adds Part-of-Speech-aware tokenization. The model **order** is configurable to trade off coherence against variety.

Beyond generation, it carries a few analytical tools: a `MarkovTopic` class that trains on labelled data and predicts the topic of new text, a state-removal scoring heuristic for spotting the tokens that most shape a model, and reverse modeling for predicting how a sequence began rather than how it continues. Models serialize to plain JSON, so they are portable, diff-able, and trivial to ship.

## Why classical, and why together

These libraries share a philosophy. They are tiny and have few dependencies, so they install fast and audit easily. They run entirely on your own hardware with no API key and no network — which matters for privacy, for cost, and for the many places where there simply is no reliable connection. And their behaviour is legible: a RAKE score, an Aho-Corasick match span, a matched template, a Markov transition table are all things a human can read and reason about.

They also chain naturally. RAKE surfaces candidate phrases from raw text; those phrases seed gazetteers for the Aho-Corasick tagger; tagged spans fill slots that the template matcher routes to actions; MarkovJson generates or classifies on top. Each piece does one job, in microseconds, offline, in any language — Portuguese included. Reach for the transformer when the problem genuinely needs one. For everything else, the classics still earn their keep.
