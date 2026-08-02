---
title: "Scripts and Phonetic Notations: What scriptconv Actually Converts"
description: "A tour of scriptconv, the zero-dependency library that detects writing systems and converts between phonetic notations. Covers IPA, ARPABET, and X-SAMPA, ISO-15924 script detection, Buckwalter transliteration for Arabic, Hangul decomposition into jamo, and kana conversion, with real, executed examples and honest limits."
date: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "Linguistics"
  - "FOSS"
draft: false
lang: en
---

A US pronunciation dictionary says a cat sounds like `K AE1 T`. The International Phonetic Alphabet writes the same sound as `kæt`. A different ASCII-only system writes it as `k"{t`. All three describe the exact same two phonemes: a "k" sound followed by a short "a" followed by a "t". Nothing about the sound changed. Only the alphabet used to write it down changed.

This happens constantly to anyone combining pronunciation data from more than one source. A speech dataset built from a US dictionary uses one notation. A European lexicon uses another. A text-to-speech engine expects a third. Before any of that data can be merged, searched, or compared, it has to be translated from one phonetic alphabet into another. That's the same job a translator does between human languages, except here the "languages" are ways of writing sound instead of ways of writing words.

`scriptconv` is a small Python library that does this translation, plus a related job one level up: figuring out which writing system a piece of text is even in before anything else can be done with it. It has no opinion about linguistics. It does not guess how a word is pronounced. It only moves symbols that already represent known sounds from one notation to another, and it identifies scripts from the characters themselves.

## A few terms, defined plainly

- **Script**: a writing system, the actual set of characters, like Latin, Cyrillic, or Hangul. Not the same as a language: English, French, and Vietnamese all use the Latin script, and Serbian can be written in either Cyrillic or Latin.
- **Orthography**: the conventional spelling rules for writing a specific language in a script: capitalization, accent marks, spacing.
- **Phoneme**: a distinct unit of sound in a language, like the "k" sound in "cat".
- **IPA** (International Phonetic Alphabet): a standard alphabet for writing sounds precisely, independent of any language's normal spelling.
- **Transliteration**: converting text from one script to another by mapping characters, aiming to preserve the original spelling exactly rather than the pronunciation.
- **Romanization**: transliteration specifically into the Latin script.

## Why ASCII-only phonetic alphabets exist at all

IPA needs characters like `ʃ`, `ʒ`, `ə`, and `ˈ` that are not on a standard keyboard. That was a real problem for decades of computing, before Unicode was universal and before most fonts, terminals, and file formats reliably supported non-ASCII text. Researchers built ASCII-only substitutes: ARPABET, developed for American English speech-recognition work, and X-SAMPA, an ASCII encoding of the full IPA developed as email- and old-terminal-safe. These are not historical curiosities. ARPABET is still the notation used by widely-deployed US English pronunciation dictionaries and speech tools, and X-SAMPA still shows up in linguistic tooling that needs plain text. Anything reading that data has to be able to read that alphabet.

`scriptconv` runs the actual conversion. This is executed output, not a description:

```python
from scriptconv import convert, arpa_to_ipa, ipa_to_arpa

convert("K AE1 T", "arpa", "ipa")
# 'kæt'

convert("HH AH0 L OW1", "arpa", "ipa")
# 'həloʊ'

convert("kˈæt", "ipa", "x-sampa")
# 'k"{t'

arpa_to_ipa("HH AH0 L OW1", stress=True)
# 'həlˈoʊ'

ipa_to_arpa("həlˈoʊ", stress=True)
# 'HH AH0 L OW1'
```

Stress markers survive the round trip. ARPABET marks stress with a digit stuck to the vowel (`OW1`). IPA marks it with a `ˈ` placed before the stressed syllable. `arpa_to_ipa(..., stress=True)` moves that information across, and converting back reconstructs the original digits exactly.

IPA sits in the middle of all this by design. `scriptconv` treats every notation as a node in a graph and every converter as an edge, and routes conversions through IPA as a hub rather than hand-writing a converter for every pair of notations directly:

```python
from scriptconv import DEFAULT_GRAPH

[f"{e.src}->{e.dst}" for e in DEFAULT_GRAPH.route("arpa", "x-sampa")]
# ['arpa->ipa', 'ipa->x-sampa']
```

Nine notations transcode through that hub in total: ARPABET, X-SAMPA, Kirshenbaum, Lexique, Cotovía, RFE, and mantoq, plus Buckwalter, covered below.

## Detecting the script before doing anything else

Before software can decide how to process a piece of text (which direction to render it, which spellchecker to run, which font to pick), it has to know what script the text is in. That is a different question from what language it is in. Script identifies the character set. Language identifies the vocabulary and grammar. Serbian, again, can be Cyrillic or Latin. Uzbek can be too. `scriptconv` detects the script directly from the characters, and separately maps a language code to the script it is conventionally written in:

```python
from scriptconv import detect_script, script_runs, lang_to_script, base_direction

detect_script("Здравствуйте")
# 'Cyrl'

detect_script("안녕하세요")
# 'Hang'

script_runs("привет hello")
# [('Cyrl', 'привет '), ('Latn', 'hello')]

base_direction("مرحبا hello")
# 'mixed'

lang_to_script("uzb_cyr")
# 'Cyrl'
```

`detect_script` returns an ISO 15924 code, the standard four-letter tag registry for scripts (`Cyrl` for Cyrillic, `Hang` for Hangul, `Latn` for Latin, `Arab` for Arabic). `script_runs` splits mixed text into contiguous stretches by script, which is what a renderer needs to decide, sentence by sentence, which font and text direction to apply. `base_direction` reports whether a mixed string reads left-to-right, right-to-left, or both.

## The hard cases: Buckwalter, Hangul, and kana

Three writing-system conversions come up often enough in real pipelines that `scriptconv` handles each one directly.

**Buckwalter**, for Arabic, is an ASCII transliteration scheme that maps every Arabic letter and diacritic to a specific ASCII character, one-to-one, so the original spelling (including vowel marks most native text omits) can be reconstructed exactly. It exists because Arabic script is awkward to handle in pipelines and tools built around ASCII: sorting, diffing, regular expressions, and older text formats all get easier once the text is Latin-alphabet ASCII, provided the mapping is exact and reversible.

```python
from scriptconv import buckwalter_to_arabic, arabic_to_buckwalter

buckwalter_to_arabic("mrHbA")
# 'مرحبا'

arabic_to_buckwalter("مرحبا")
# 'mrHbA'

arabic_to_buckwalter("رحمٰن")
# 'rHm`n'
```

The last example includes the dagger alef, a small superscript diacritic used in a handful of words (`رحمٰن`, *rahman*). Buckwalter has a specific ASCII character (`` ` ``) reserved for it, distinct from a regular alef, so the transliteration doesn't collapse the two.

**Hangul** looks like syllable blocks, but each block is a composed cluster of individual letters (jamo) laid out in a grid, the way "H", "A", "N" combine visually into one glyph for "han" rather than being written left to right. Software that needs the individual letters (for search, for phonological analysis, for feeding a different system) has to pull them back apart:

```python
from scriptconv.translit import decompose_hangul

decompose_hangul("한국")
# 'ㅎㅏㄴㄱㅜㄱ'

decompose_hangul("국민")
# 'ㄱㅜㄱㅁㅣㄴ'
```

That last one matters for what it does *not* do: 국민 (*gungmin*, "citizen") is pronounced with nasal assimilation, `[ɡuŋmin]`, but `decompose_hangul` returns the letters as written, `ㄱㅜㄱㅁㅣㄴ`, unassimilated, because decomposition is arithmetic on the Unicode codepoint, not a phonological rule. It tells you what was written, not what it sounds like.

**Kana** conversion moves between Japanese's two syllabaries, hiragana and katakana, which represent the same sounds with different characters at a fixed codepoint offset:

```python
from scriptconv import hira_to_kana, kana_to_hira

hira_to_kana("こんにちは")
# 'コンニチハ'

kana_to_hira("カタカナ")
# 'かたかな'
```

## Why this lives in its own library

A phonemizer (a tool that guesses how a written word is pronounced) needs linguistic judgment: stress rules, exceptions, context-dependent pronunciation. `scriptconv` deliberately has none of that. Every function above is a table lookup or a codepoint calculation: same input, same output, no guessing, no language model, nothing that could be wrong about how a specific language actually sounds. That is what makes it safe to share across every phonemizer that needs it, instead of every phonemizer reimplementing its own ARPABET table with its own bugs. The [phonology stack](/blog/2026-08-10-the-phonology-stack) post covers how the actual pronunciation-guessing engines (the ones that do carry linguistic opinions) are built on top of this layer rather than duplicating it.

## Where the mapping is not exact

Converting between notations is not always lossless, and `scriptconv` records this as queryable data rather than leaving it as a surprise. Each notation has two independently tracked properties: whether converting it to IPA and back reproduces the original symbols exactly, and whether IPA converted into it and back reproduces every IPA symbol.

ARPABET fails both directions: it has a restricted, English-specific phoneme inventory, so going IPA → ARPABET → IPA can lose distinctions IPA can make that ARPABET's table has no symbol for. X-SAMPA and Lexique cover the full IPA inventory faithfully but are not guaranteed to round-trip cleanly starting from their own side. Kirshenbaum and Buckwalter round-trip cleanly from their own side into IPA but not the reverse. Mantoq, the phonetic alphabet of the Halabi Arabic phonetiser, only converts one way, into IPA. There is no converter back. None of this is buried in a docstring somewhere. It is data the library exposes so a caller can check before assuming a round trip is safe.

---

If you are stitching together pronunciation data from multiple sources, or need to detect scripts and normalize text before it reaches a phonemizer, [get in touch](/contact) or see what else we build in this space on the [services page](/services).
