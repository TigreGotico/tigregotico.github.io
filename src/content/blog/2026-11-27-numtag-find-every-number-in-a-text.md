---
title: "numtag: Why “Duas Dúzias” Is 24, Not 2"
description: "Numbers hide in text as digits, words, ordinals, fractions and mixes such as '2 milhões e meio'. numtag finds every one, gives its exact value as a string, its kind and its position, and spells values back in words. Why it exists, how it works and what to do with it."
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

A number in a text is rarely just digits:

| Text | Value |
| :--- | :--- |
| o vigésimo terceiro lugar ("twenty-third place") | 23rd |
| tenho duas dúzias de ovos ("two dozen eggs") | 24 |
| dreihundertzweiundvierzig Bücher | 342 |
| un milione e duecentomila | 1,200,000 |
| 2 milhões e meio | 2,500,000 |

A voice assistant must read these in commands. A speech synthesiser must say them
back. A script that extracts data must find them in documents. Each job needs the
exact value, and most of them need to know where the number is in the text.

## A billion is not always a billion

A news story in Lisbon says "um bilião de euros". A story in São Paulo says "um
bilhão de reais". The two words look like the same word, and both look like the
English "billion". They are not the same number:

| Text | Language | Value |
| :--- | :--- | ---: |
| one billion dollars | en | 1,000,000,000 |
| um bilhão de reais | pt-BR | 1,000,000,000 |
| um bilião de euros | pt-PT | 1,000,000,000,000 |
| un milliard d'euros | fr-FR | 1,000,000,000 |
| un billion | fr-FR | 1,000,000,000,000 |
| eine Billion | de-DE | 1,000,000,000,000 |
| un billón | es-ES | 1,000,000,000,000 |

English and Brazilian Portuguese use the **short scale**: each new word
(billion, trillion) is a thousand times the one before it. European Portuguese,
French, German and Spanish use the **long scale**: each new word is a *million*
times the one before it, and the steps between have their own names (milliard,
Milliarde) or a phrase ("mil milhões", "mil millones"). A translator who maps
"bilião" to "billion" makes an error of a factor of 1,000.

numtag reads the word in the scale of the language tag that you give it, and it
writes values the same way:

```python
from numtag import spell

for lang in ["en", "pt-BR", "pt-PT", "fr-FR", "de-DE", "es-ES", "it-IT"]:
    print(lang, spell("1" + "0" * 9, lang)[0].text, "|", spell("1" + "0" * 12, lang)[0].text)
```

```text
en     one billion   | one trillion
pt-BR  um bilhão     | um trilhão
pt-PT  mil milhões   | um bilião
fr-FR  un milliard   | un billion
de-DE  eine Milliarde | eine Billion
es-ES  mil millones  | un billón
it-IT  un miliardo   | un bilione
```

Portugal and Brazil show the problem inside one language. They do not only count
the large numbers differently, they also spell small ones differently:

| Value | pt-PT | pt-BR |
| ---: | :--- | :--- |
| 14 | catorze | quatorze |
| 16 | dezasseis | dezesseis |
| 19 | dezanove | dezenove |
| 10^9 | mil milhões | um bilhão |
| 10^12 | um bilião | um trilhão |
| 10^30 | um quintilião | um nonilhão |

The reader accepts every spelling in both varieties: "dezesseis" in a European text
is still 16. The writer gives the form of the variety that you ask for. A Brazilian
voice says "dezesseis" and a European voice says "dezasseis".

The difference grows with the size of the number. 10^30 is "one nonillion" in
English and "um quintilião" in European Portuguese. Because numtag keeps values as
digit strings, it has no upper limit: 10^39 in Russian is "дуодециллион".

## Why we wrote our own

The usual design has one module per language, with its own reader and writer, and it
returns an `int` or a `float`. The number parser that OpenVoiceOS used was built this
way. It had three limits that we could not fix inside that design:

- **Each language had its own bugs.** The same idea was written again in each
  language, so a fix in Portuguese did nothing for Italian.
- **One value per text.** It returned one number for the whole text, with no
  position. "Set a timer for 5 minutes and call mum at 6" holds two numbers.
- **Binary floats.** A float cannot hold 0.1 exactly, so 0.1 + 0.2 is
  0.30000000000000004, and a writer reads that error aloud. A float also keeps only
  about 16 significant digits.

[**numtag**](https://github.com/TigreGotico/numtag) starts from a different design.

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

- **Test against num2words or babel.** Another library can be wrong in the same way.
  The tests compare with cited rows, not with other code.

## What you can do with it

- **Read commands.** A voice assistant reads "set a timer for twenty minutes" with
  `tag_numbers`, and it gets the value and its place in the command.
- **Speak numbers.** Skills for alerts, counting and diagnostics call `spell`
  directly. text2spoken uses `spell` to speak numbers.
- **Read dates.** chronologia finds the numbers in dates with `tag_numbers`.
- **Extract data.** Pull every quantity out of a document, with its position and an
  exact value. Prices, counts and percentages keep all their digits.
- **Clean transcripts.** Turn "twenty-one" and "21" into the same value before you
  compare two transcripts.

## Where it fails

The reader covers more languages than the writer: `spell` writes 29 lexicons (24 languages). Hindi
named fractions do not read yet. ढाई सौ ("two hundred and fifty", literally "two and a
half hundred") gives nothing. Each known defect is an open issue on GitHub and a
strict `xfail` test.

## Try it

The [numtag Space](https://huggingface.co/spaces/TigreGotico/numtag) runs in your
browser. It installs the newest alpha from PyPI and gives sample sentences for about 50
languages.
