---
title: "Classical NLP for Portuguese: Syllabification and Grapheme-to-Phoneme"
description: "A look at our rule-based, fully offline Portuguese NLP stack — silabificador for syllabification and TugaPhone for dialect-aware grapheme-to-phoneme — and how they connect to the broader orthography2ipa work for Lusophone varieties. No deep-learning black boxes: deterministic, fast, and dependency-light."
date: 2026-02-28
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

Syllable breaks, stress placement, and spelling-to-sound mappings in Portuguese follow rules that linguists documented long before anyone trained a neural network. When those rules are explicit, the right tool is a small, deterministic, fully offline library that you can read, audit, and run anywhere. That is the philosophy behind our classical Portuguese NLP stack: [silabificador](https://github.com/TigreGotico/silabificador) for syllabification and [TugaPhone](https://github.com/TigreGotico/tugaphone) for grapheme-to-phoneme (G2P).

### Why classical, and why now

Phonetics is one of the areas where deterministic rules genuinely shine. The boundary rules of Portuguese syllabification and the regularities of its orthography are well documented, so a hand-crafted rule engine produces transcriptions you can inspect line by line. No GPU, no model download, no network call. That matters for data sovereignty: a Lusophone voice pipeline shouldn't have to ship its text to a remote API just to find out how to pronounce a word. It also matters for speed and footprint — these libraries are dependency-light and run on a laptop, a server, or an embedded device with equal ease.

### silabificador: syllable boundaries

`silabificador` is a lightweight Portuguese syllabifier built entirely from hand-crafted rules, with **no dependencies**. The interface is as small as it sounds:

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

It was tuned and tested against clean data from the [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org), and benchmarked on the [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon) — an open dataset of over 100,000 entries drawn from the same source. Syllable segmentation is a foundational step for stress assignment, hyphenation, and phoneme transcription, so getting it right and fast pays off everywhere downstream.

### TugaPhone: dialect-aware grapheme-to-phoneme

`TugaPhone` turns arbitrary Portuguese text into IPA, and it does so across the major Lusophone dialects: European (`pt-PT`), Brazilian (`pt-BR`), Angolan (`pt-AO`), Mozambican (`pt-MZ`), and Timorese (`pt-TL`). Crucially, it preserves dialectal variation rather than flattening everything to one "standard". The same sentence comes out differently depending on where it is spoken:

```
Choveu muito ontem à noite.
pt-PT → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈoj·tɨ
pt-BR → ʃo·ˈvew mwˈĩ·tʊ ˈõ·tẽ ˈa nˈoj·tʃɪ
pt-AO → ʃo·ˈvew mˈũjn·tʊ ˈõ·tẽ ˈa nˈoj·tɨ
pt-MZ → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈɔj·tɨ
pt-TL → ʃo·ˈvew mˈuj·tʊ ˈõ·tẽ ˈa nˈojtʰ
```

Under the hood, TugaPhone is a **hybrid** of two classical techniques. First it consults a curated phonetic lexicon (the same Portuguese Phonetic Lexicon above) for known words; for anything not in the lexicon — names, neologisms, foreign borrowings — it falls back to a rule-based G2P engine. The pipeline is explicit at every stage: text normalization, optional part-of-speech tagging, lexicon lookup, rule-based fallback, then dialect-specific transformations.

Two details are worth calling out. **Number normalization** turns digits into their spoken Portuguese forms with correct gender and number agreement:

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
normalize_numbers("1ª vez")                # primeira vez
```

It even respects scale conventions — long-scale `biliões` for `pt-PT`, short-scale `trilhões` for `pt-BR`. **Homograph disambiguation** uses part-of-speech context, so `para` as a preposition is treated differently from `para` as a verb. TugaPhone can use a spaCy or Brill tagger when available, but also ships a no-dependency rule-based fallback, staying true to the offline-first principle.

The architecture is a clean hierarchy — sentence → word → grapheme → character — with context-sensitive rules applied at each level: vowel quality and consonant allophones at the character level, digraphs like ⟨ch⟩ and ⟨nh⟩ and diphthongs like ⟨ai⟩ and ⟨ou⟩ at the grapheme level, stress and syllabification at the word level. TugaPhone reuses `silabificador` for the syllable layer, alongside companion libraries **[Tugalex](https://github.com/TigreGotico/tugalex)** (lexicon and exceptions) and **[TugaTagger](https://github.com/TigreGotico/tugatagger)** (POS tagging). Small, composable pieces — each useful on its own.

TugaPhone is honest about its edges: lexicon coverage is sparser for the African and Timorese dialects, the sub-regional accents (Porto, Minho, Braga, and others) are experimental approximations of documented features, and sentence-level prosody is simplified. These are openly documented limitations, not hidden failure modes.

### The broader picture: orthography2ipa

Portuguese is one variety among many, and the same engineering pattern generalizes. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) is a pure-data Python package of linguistically motivated grapheme→IPA and allophone mappings spanning 676 languages across 20+ language families. It draws a sharp distinction that any serious G2P system needs: a **grapheme map** says which phonemes a spelling *can* represent, while an **allophone map** says how a phoneme actually *surfaces* in a given context. Regional varieties are modeled as their own specifications linked through weighted multi-ancestor lineage, so dialect trees inherit from their parents instead of duplicating data.

That is the same instinct behind `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ`, and `pt-TL` in TugaPhone: treat each Lusophone variety as a first-class citizen with its own rules, not a deviation from a single canonical accent. The data is declarative and the logic is thin and pluggable — you can read the rules, cite their sources, and trust the output.

### Try it

Everything here is open source and installable today:

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

For the broader multilingual mappings, see [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Deterministic, fast, offline, and built for the full breadth of the Portuguese-speaking world.

This Portuguese phonetics stack builds on our **[grapheme-to-IPA work for 676 languages](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, forming the phonetic backbone for **[TTS that runs on a potato](/blog/2026-05-10-tts-that-runs-on-a-potato)** and **[Miro & Dii multilingual voices](/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
