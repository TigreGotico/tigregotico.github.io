---
title: "text2spoken: Written Forms to Spoken Words"
description: "A TTS voice reads letters, not '12/03/2024' or '3,50 €'. text2spoken rewrites numbers, dates, times, money, units and abbreviations into the words a speaker says, in 18 languages, with cited sources for the rules."
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

All outputs are from text2spoken 0.0.2a169.

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

Eighteen languages have their own language file: Arabic, Bengali, Catalan,
German, Greek, English, Spanish, Basque, French, Hindi, Italian,
Japanese, Korean, Dutch, Portuguese (pt-PT and pt-BR), Russian, Tetun Dili and
Chinese. Any other BCP 47 tag still gets cardinals, decimals and the minus sign
from the CLDR rules.

Each rule in a language file names its source: a grammar, a dictionary or a
style guide. The test set has more than 4,000 rows, and almost all of them cite a source.
The rest are marked *silver*, because no known source states them.

## One engine for reading and speaking

text2spoken finds the written forms with its own recognizers. For most
languages, [numtag](https://github.com/TigreGotico/numtag) spells the numbers. For
Portuguese, [chronologia](https://github.com/TigreGotico/chronologia) speaks the
dates and clock times, and more languages follow. numtag and chronologia also
parse voice commands, so the forms that a parser reads and the forms that the
writer speaks come from one library. A fix in one place fixes both directions.

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
`ovos-dialog-normalizer-plugin` (from 0.1.0a1). It can also normalise
reference text before WER scoring, so that "21" and "twenty-one" count as the same
word. It replaces the older normaliser inside phoonnx. When phoonnx switched, the
two gave equal output on 8,336 inputs.

## Limits

The package is an alpha. On 0.0.2a169, Bengali digits with a classifier (`3টি`)
are not read. Russian ordinals above 10^15 stay as digits. Greek, Chinese, Korean,
Japanese, Basque and Arabic read their numbers through CLDR rules, not through
numtag.
