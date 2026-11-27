---
title: "numtag: Find Every Number in a Text"
description: "numtag finds each number in a text, written in digits or in words, and gives its exact value, its kind and its position. It spells values back in words. 53 languages read, 29 write, and every language is one cited JSON lexicon."
date: 2026-11-27
author: "Casimiro Ferreira"
tags:
  - "numtag"
  - "NLP"
  - "numbers"
  - "OVOS"
  - "TTS"
draft: false
---

"Faltam mil e duzentos metros." A voice assistant must know that this sentence
holds the value 1200. A TTS voice must go the other way: from `1200` to *mil e
duzentos*. [**numtag**](https://github.com/TigreGotico/numtag) does both.

```bash
uv pip install --prerelease=allow numtag
```

```python
from numtag import tag_numbers, spell

for m in tag_numbers("Il a quatre-vingt-dix-sept ans et vit au XXe siècle.", "fr-FR"):
    print(m.char_span, m.text, m.value, m.kind.name)
# (5, 26) quatre-vingt-dix-sept 97 CARDINAL
# (41, 44) XXe 20 ORDINAL
```

The outputs in this post come from numtag 0.49.1a1.

## Value, kind and position

Each mention has its character span, its value, its kind (cardinal, ordinal,
fraction and more), its written form (words, digits, Roman numerals) and a
confidence. The span lets a caller replace the number in place, or cut it out of
a command.

```python
tag_numbers("O comboio parte às vinte e três e quinze, faltam mil e duzentos metros.", "pt-PT")
# 'vinte e três' 23, 'quinze' 15, 'mil e duzentos' 1200

tag_numbers("Det koster fireogtyve kroner og en halv.", "da-DK")
# 'fireogtyve' 24 CARDINAL, 'en halv' 0.5 FRACTION

tag_numbers("Ich habe dreihundertzweiundvierzig Bücher und den dritten Platz.", "de-DE")
# 342 CARDINAL, 'dritten' 3 ORDINAL
```

German and Danish write numbers as one word, with the units before the tens:
*fireogtyve* is "four and twenty". The reader splits the compound and does the
arithmetic.

## Spelling values back

`spell` is the writer. It returns the standard form first, then the variants that
a speaker also uses:

```python
spell("1234567", "pt-PT")[0].text
# 'um milhão duzentos e trinta e quatro mil quinhentos e sessenta e sete'

spell("3/4", "fr-FR")[0].text
# 'trois quarts'

[s.text for s in spell("2.50", "ru")]
# ['две целых пятьдесят сотых', 'два запятая пять']
```

text2spoken calls `spell` when it reads a number to a voice, and chronologia
calls the reader for the numbers inside dates.

## Values are strings

A value is a canonical string: `"1200"`, `"0.5"`, `"3/4"`. It is never an `int`
or a `float`. So `"0.1"` stays `"0.1"`, with no binary rounding, and a value has
no size ceiling: the Russian scales go to 10^39. The caller converts the string
when it needs a number.

## Languages are data

Each language is one JSON lexicon, and each form in it has a cited source. One
engine reads all lexicons. No language has its own Python code. A new language is
a new data file and its tests.

The reader has 53 lexicons, from Asturian and Kabyle to Mirandese and Marwari.
The writer speaks 29 languages. The full lists are in the
[repository](https://github.com/TigreGotico/numtag).

## Limits

Some languages are much weaker than others. Bengali reads badly. Hindi named
fractions such as ढाई सौ (250) give nothing yet. A word that can be a number or
an ordinary word gets only a low confidence. Each known defect is an open issue
with a strict `xfail` test.
