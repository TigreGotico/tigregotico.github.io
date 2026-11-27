---
title: "numtag: Why “Duas Dúzias” Is 24, Not 2"
description: "The old OpenVoiceOS number parser read 'o vigésimo terceiro lugar' as 0.05 and 'un milione e duecentomila' as 1000000.2. numtag finds every number in a text, in digits or words, with its exact value as a string, its kind and its position, and spells values back. Why it exists, how it works and what to do with it."
date: 2026-11-27
authors: ["Casimiro Ferreira", "Claude"]
tags:
  - "numtag"
  - "NLP"
  - "numbers"
  - "OVOS"
  - "TTS"
draft: false
---

Here are four sentences and what `ovos-number-parser` 0.5.1 made of them. It was the
number reader of OpenVoiceOS:

| Text | ovos-number-parser 0.5.1 | Correct |
| :--- | :--- | :--- |
| o vigésimo terceiro lugar ("twenty-third place") | `0.05` | 23rd |
| tenho duas dúzias de ovos ("two dozen eggs") | `2` | 24 |
| dreihundertzweiundvierzig Bücher | `None` | 342 |
| un milione e duecentomila | `1000000.2` | 1,200,000 |

It also wrote numbers, and the writer had its own defects. In European Portuguese,
10^30 came out as "um bilião sextiliões". The correct word is "um quintilião". In
English, 0.1 + 0.2 came out as "zero point three zero zero", because the computer
added two floats and got 0.30000000000000004.

In a random sample of 50 cases per language where the old parser's number writer and
numtag disagreed, the old writer was wrong in 40 Romanian and 45 Galician cases, and
numtag in none. Most were ordinals that lost the hundreds.

## Why the old parser failed

`ovos-number-parser` had one Python module per language. Each module had its own
reader and its own writer, and each one returned an `int` or a `float`. The same idea
was written again in each language, so each language had different bugs. A fix in
Portuguese did nothing for Italian.

The design had two more problems:

- **One value per text.** `extract_number` returned one number for the whole text,
  with no position. A skill could not replace a number in place, or cut it out of a
  command. "Set a timer for 5 minutes and call mum at 6" holds two numbers, and the
  old reader gave one.
- **Binary floats.** A float cannot hold 0.1 exactly. Each sum adds a small error, and
  a number writer then reads that error aloud. A float keeps only about 16
  significant digits, so very large numbers lost digits.

[**numtag**](https://github.com/TigreGotico/numtag) replaces it.

```bash
uv pip install --prerelease=allow numtag
```

## Every number, with its place in the text

```python
from numtag import tag_numbers

text = "Chegou em vigésimo terceiro lugar, com 2 milhões e meio de votos e um quarto dos lugares."
for m in tag_numbers(text, "pt-PT"):
    print(m.text, m.char_span, m.value, m.kind)
```

```text
vigésimo terceiro  (10, 27)  '23'       ORDINAL
2 milhões e meio   (39, 55)  '2500000'  CARDINAL
um quarto          (67, 76)  '0.25'     FRACTION
```

Each mention has its text, its character span, its value, its kind (cardinal,
ordinal or fraction), its form (digits or words) and a confidence. "2 milhões e meio"
mixes digits and words, and it is still one number. All outputs are from numtag
0.50.0a1.

The span matters. [chronologia](https://github.com/TigreGotico/chronologia), the date
reader, uses it to find the numbers inside "daqui a duas semanas" or "vinte e sete de
novembro". [text2spoken](https://github.com/TigreGotico/text2spoken) calls `spell` to say
each number in words.

## Values are strings

numtag gives each value as a digit string: `"1200000"`, `"0.25"`, `"3/4"`. It never
converts to a float, so no binary rounding enters. A string also has no ceiling.

```python
from numtag import spell

spell("0.3", "en")[0].text            # 'zero point three'
spell("1" + "0" * 30, "pt-PT")[0].text  # 'um quintilião'
spell("1" + "0" * 39, "ru")[0].text     # 'дуодециллион'
```

If a caller needs a number, it converts the string itself: `int(m.value)` or
`Decimal(m.value)`. That choice belongs to the caller, not to the parser.

## Ambiguity is real

Numbers hide in ordinary words. In Portuguese, "segundo" is "second", but it is also
"according to":

```python
tag_numbers("segundo o jornal choveu", "pt-PT")
# []    "according to the newspaper, it rained"
```

numtag gives nothing here, and that is the correct answer. A number reader that sees
a number in every "segundo" breaks every sentence that cites a source.

Some rules looked correct and were dropped before they merged. One rule made "só um"
("just one") a sure count of 1. Then "É só um exemplo" ("it is just an example") became
a certain 1, so the rule was removed. A Kabyle rule for fractions ("N seg M") also read
"one of the three" as a fraction, so it was removed too. Both now have tests that
must stay negative.

## Language is data

In numtag, each language is one JSON lexicon: its number words, its scale words, its
ordinals and its fractions. One engine reads all of them, and one writer speaks them.
No language has its own Python code.

Each form in a lexicon cites a source: a grammar, a dictionary or a native speaker.
A form that only follows a pattern, with no source that shows it, is marked SILVER.
The reader accepts every spelling that people write. The writer gives the standard
spelling first, and the variants after it. Kabyle shows why both matter. A native
speaker writes 100 as "mya". The 1982 dictionary by Dallet writes "meyya". numtag
reads both, writes "mya", and lists "meyya" as a variant.

When a defect has no fix yet, it becomes a strict `xfail` test that names it. The
test starts to fail when somebody fixes the defect, and then the test changes into a
normal test.

### What we did not do

- **Use the old parser as the truth.** Its output is a regression baseline, not
  gold. Where it disagrees with a cited source, the source wins.
- **Test against num2words or babel.** Another library can be wrong in the same way.
  The tests compare with cited rows, not with other code.

## What you can do with it

- **Read commands.** `ovos-number-parser` itself reads 42 languages through
  numtag. Every OVOS skill that calls `extract_number` uses numtag with no change.
- **Speak numbers.** Skills for alerts, counting and diagnostics call `spell`
  directly. text2spoken uses `spell` to speak numbers.
- **Read dates.** chronologia finds the numbers in dates with `tag_numbers`.
- **Extract data.** Pull every quantity out of a document, with its position and an
  exact value. Prices, counts and percentages keep all their digits.
- **Clean transcripts.** Turn "twenty-one" and "21" into the same value before you
  compare two transcripts.

## Where it fails

The reader covers more languages than the writer: `spell` writes 29 languages. Hindi
named fractions do not read yet. ढाई सौ ("two hundred and fifty", literally "two and a
half hundred") gives nothing. Each known defect is an open issue on GitHub and a
strict `xfail` test.

## Try it

The [numtag Space](https://huggingface.co/spaces/TigreGotico/numtag) runs in your
browser. It installs the newest alpha from PyPI and gives sample sentences for each of
52 languages.
