---
title: "Classical NLP for Portuguese: Syllabification and Grapheme-to-Phoneme"
description: "A look at our rule-based, fully offline Portuguese NLP stack: silabificador for syllabification and TugaPhone for dialect-aware grapheme-to-phoneme, and how they connect to the broader orthography2ipa work for Lusophone varieties. No deep-learning black boxes: deterministic, fast, and dependency-light."
date: 2026-02-28
updated: 2026-08-01
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

Phonetics is one of the areas where deterministic rules genuinely shine. The boundary rules of Portuguese syllabification and the regularities of its orthography are well documented, so a hand-crafted rule engine produces transcriptions you can inspect line by line. No GPU, no model download, no network call. That matters for data sovereignty: a Lusophone voice pipeline shouldn't have to ship its text to a remote API just to find out how to pronounce a word. It also matters for speed and footprint: these libraries are dependency-light and run on a laptop, a server, or an embedded device with equal ease.

### silabificador: syllable boundaries

`silabificador` is a lightweight Portuguese syllabifier built entirely from hand-crafted rules, with **no dependencies**. The interface is as small as it sounds:

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

It was tuned and tested against clean data from the [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org), and benchmarked on the [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon), an open dataset of over 100,000 entries drawn from the same source. Syllable segmentation is a foundational step for stress assignment, hyphenation, and phoneme transcription, so getting it right and fast pays off everywhere downstream.

### TugaPhone: dialect-aware grapheme-to-phoneme

`TugaPhone` turns arbitrary Portuguese text into IPA, and it does so across the major Lusophone dialects: European (`pt-PT`), Brazilian (`pt-BR`), Angolan (`pt-AO`), Mozambican (`pt-MZ`), and Timorese (`pt-TL`). Crucially, it preserves dialectal variation rather than flattening everything to one "standard". The same sentence comes out differently depending on where it is spoken:

```
Choveu muito ontem à noite.
pt-PT → ʃuˈvew ˈmũjtu ˈõtɐ̃j a ˈnojt
pt-BR → ʃoˈvew ˈmwĩtʊ ˈõtẽj a ˈnojtʃɪ
pt-AO → ʃoˈvew ˈmũjntʊ ˈõntẽj a ˈnojtɨ
pt-MZ → ʃoˈvew ˈmũjtu ˈõtẽj a ˈnɔjtɨ
pt-TL → ʃoˈvew ˈmujtʊ ˈõntɐ̃j a ˈnojtʰ
```

Under the hood, TugaPhone drives the shared `orthography2ipa` candidate-lattice engine and layers Portuguese-specific concerns on top through that engine's own extension points. It consults a curated phonetic lexicon (the same Portuguese Phonetic Lexicon above) for known words. For anything not in the lexicon (names, neologisms, foreign borrowings) the lattice generates candidates from the dialect's grapheme and allophone rules.

Two details are worth calling out. **Number normalization** turns digits into their spoken Portuguese forms with correct gender and number agreement:

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
```

It even respects scale conventions: long-scale `biliões` for `pt-PT`, short-scale `trilhões` for `pt-BR`. **Homograph disambiguation** is delegated to the [bifonia](https://github.com/TigreGotico/bifonia) library, which owns the sense-based knowledge of which heterophonic homographs exist and which reading they carry, so `para` as a preposition is treated differently from `para` as a verb, and marks the chosen reading with extra diacritics before the lattice ever sees the sentence.

TugaPhone phonemizes by driving the shared `orthography2ipa` candidate lattice: dialect selection *is* the choice of `orthography2ipa` lect spec. So dialect phenomena (betacism, Porto's rising diphthongs, Madeiran /l/ palatalisation, Azorean /u/ fronting, coda-sibilant sandhi, and more) come from the lattice itself rather than from post-hoc string edits.

TugaPhone adds only what `orthography2ipa` deliberately leaves to the caller, wired through its own extension points. Gender-aware number/ordinal expansion and bifonia's heterophone marking run as the engine's normalization stage before the lattice sees the text. The curated pronunciation lexicon from **[Tugalex](https://github.com/TigreGotico/tugalex)** is registered per lect through `orthography2ipa.register_lexicon`, so a covered word folds into the same override path as a spec's own exceptions, and the lattice only generates candidates for words the lexicon does not cover. Syllabification comes from `orthography2ipa`'s own `silabificador`-backed plugin, so stress lands on the same syllable TugaPhone would otherwise have chosen. Small, composable pieces feeding a shared engine, each useful on its own.

TugaPhone is honest about its edges: lexicon coverage is sparser for the African and Timorese dialects, the sub-regional accents (Porto, Minho, Braga, and others) are experimental approximations of documented features, and sentence-level prosody is simplified. These are openly documented limitations, not hidden failure modes.

### The broader picture: orthography2ipa

Portuguese is one variety among many, and the same engineering pattern generalizes. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) is a pure-data Python package of linguistically motivated grapheme→IPA and allophone mappings spanning 820 languages across 20+ language families. It draws a sharp distinction that any serious G2P system needs: a **grapheme map** says which phonemes a spelling *can* represent, while an **allophone map** says how a phoneme actually *surfaces* in a given context. Regional varieties are modeled as their own specifications linked through weighted multi-ancestor lineage, so dialect trees inherit from their parents instead of duplicating data.

That is the same instinct behind `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ`, and `pt-TL` in TugaPhone: treat each Lusophone variety on its own terms, with its own rules, not as a deviation from a single canonical accent. The data is declarative and the logic is thin and pluggable, so you can read the rules, cite their sources, and trust the output.

### Try it

Everything here is open source and installable today:

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

For the broader multilingual mappings, see [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Deterministic, fast, offline, and built for the full breadth of the Portuguese-speaking world.

This Portuguese phonetics stack builds on our **[grapheme-to-IPA work for 820 languages](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, forming the phonetic backbone for **[TTS that runs on a potato](/blog/2026-05-10-tts-that-runs-on-a-potato)** and **[Miro & Dii multilingual voices](/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
