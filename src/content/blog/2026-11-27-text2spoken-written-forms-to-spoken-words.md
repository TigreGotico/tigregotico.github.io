---
title: "text2spoken: Written Forms to Spoken Words"
description: "A TTS voice reads letters, not '12/03/2024' or '3,50 €'. text2spoken rewrites numbers, dates, times, money, units and abbreviations into the words a speaker says, in 19 languages, with a cited source for each rule."
date: 2026-11-27
author: "Casimiro Ferreira"
tags:
  - "text2spoken"
  - "TTS"
  - "text normalisation"
  - "phoonnx"
  - "OVOS"
draft: false
---

A phonemizer reads letters. Give it `12/03/2024` or `3,50 €` and it reads
slashes and digits, or it reads nothing. A person reads "the twelfth of March"
and "three euros fifty". The step between the two is text normalisation, and
[**text2spoken**](https://github.com/TigreGotico/text2spoken) does that step.

```bash
uv pip install --prerelease=allow text2spoken
```

```python
from text2spoken import normalize

normalize("A reunião é a 12/03/2024 às 14h30 e custa 3,50 €.", "pt-PT")
# 'A reunião é a doze de março de dois mil e vinte e quatro às catorze horas
#  e trinta minutos e custa três euros e cinquenta cêntimos.'

normalize("Dr Smith paid £3.50 for 2 tickets on 21 May.", "en-GB")
# 'Doctor Smith paid three pounds and fifty pence for two tickets on the
#  twenty-first of May.'
```

The outputs in this post come from text2spoken 0.0.2a169.

## Grammar, not only digits

A number in words must agree with the words around it. French counts pages in
the feminine and Russian puts the number in the case of its noun:

```python
normalize("Il a 21 pages et 1 minute de retard.", "fr-FR")
# 'Il a vingt et une pages et une minute de retard.'

normalize("Am 3. Mai kostet es 25 €.", "de-DE")
# 'Am dritten Mai kostet es fünfundzwanzig Euro.'

normalize("о 3 квинтиллионах книг", "ru-RU")
# 'о трёх квинтиллионах книг'
```

"21 pages" is *vingt et une*, not *vingt et un*. "3. Mai" after *am* is the
dative ordinal *dritten*. "3" before a prepositional plural is *трёх*.

## Every rule has a source

Nineteen languages have their own language file: Arabic, Bengali, Catalan,
Danish, German, Greek, English, Spanish, Basque, French, Hindi, Italian,
Japanese, Korean, Dutch, Portuguese (pt-PT and pt-BR), Russian, Tetum Dili and
Chinese. Any other BCP 47 tag still gets cardinals, decimals and the minus sign
from the CLDR rules.

Each rule in a language file names its source: a grammar, a dictionary or a
style guide. The test set has 4,286 rows. 4,149 of them cite a source. The other
137 are marked *silver*, because no source we found states them.

## One engine for reading and speaking

text2spoken does not parse numbers or dates itself.
[numtag](https://github.com/TigreGotico/numtag) finds and spells the numbers, and
[chronologia](https://github.com/TigreGotico/chronologia) reads and speaks the
dates and clock times. The parser that understands "doze de março" in a voice
command is the same code that writes it for the voice. A fix in one place fixes
both directions.

The rule is "parse every form, speak the canonical one". The reader accepts every
spelling that a speaker uses. The writer gives the one preferred form.

## Safe to cache

TTS output is often cached. A cache key needs to change when the text that the
voice reads changes. `revision(lang)` returns the exact versions of the libraries
behind the output of a language, so an upgrade invalidates the cache, and nothing
else does.

A form that text2spoken cannot read stays as written. It never guesses.

## Where it runs

[phoonnx](https://github.com/TigreGotico/phoonnx) voices and the scriptconv
phonemizers call it before phonemization. OpenVoiceOS uses it through
`ovos-dialog-normalizer-plugin`. It also normalises reference text before WER
scoring, so that "21" and "twenty-one" count as the same word. On 8,336 inputs,
its output is equal to the output of the older normaliser inside phoonnx, which it
replaces.

## Limits

The package is an alpha. Bengali digits with a classifier (`3টি`) are not read
yet. Russian ordinals above 10^15 stay as digits. Greek, Chinese, Korean,
Japanese, Basque and Arabic read their numbers through CLDR rules, not yet through
numtag.
