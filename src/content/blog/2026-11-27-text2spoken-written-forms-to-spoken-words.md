---
title: "text2spoken: Why a Voice Says “Pound Three Point Five Zero”"
description: "A text-to-speech voice reads characters, so '£3.50' and '12/03/2024' come out as nonsense. text2spoken finds numbers, dates, money, units and abbreviations and writes them as a speaker says them, with the correct gender and case. Why it exists, how it works and where you can use it."
date: 2026-11-27
authors: ["Casimiro Ferreira", "Claude"]
tags:
  - "text2spoken"
  - "TTS"
  - "text normalisation"
  - "phoonnx"
  - "OVOS"
draft: false
---

Give a text-to-speech voice this sentence:

> Dr Smith paid £3.50 on 21 May.

A person reads "Doctor Smith paid three pounds and fifty pence on the twenty-first of
May". The voice says something different. Before a neural voice makes a sound, a
**phonemizer** turns the text into phonemes. A phonemizer such as espeak-ng reads the
characters that it gets, in the order that it gets them. Here is what espeak-ng makes
of the raw text, glossed back into English:

> doctor Smith paid **pound three point five zero** on **twenty one** May

The currency symbol comes first because it is first on the page. "3.50" becomes a
decimal number. "21 May" loses its ordinal. It is worse with dates:

| Written | What the voice says without help |
| :--- | :--- |
| `12/03/2024` | "twelve slash zero three slash two thousand and twenty four" |
| `1/2 kg` | "one slash two K G" |
| `3,50 € 12/03/2024` (Portuguese) | "três vírgula cinquenta euro doze zero três dois mil e vinte e quatro" |

The voice model can be perfect and still say the wrong words. The defect is in the
text, before the voice starts. The fix is called **text normalisation**: rewrite
each written form as the words that a speaker says. That is the job of
[**text2spoken**](https://github.com/TigreGotico/text2spoken).

```bash
uv pip install --prerelease=allow "text2spoken[pt]"
```

The `pt` extra installs [tugalex](https://github.com/TigreGotico/tugalex), the
Portuguese lexicon that gives the gender of each noun. Without it, Portuguese numbers
do not agree with the noun: "Comprei 2 maçãs" becomes "Comprei dois maçãs".

## The same sentences, after text2spoken

```text
en-GB  Dr Smith paid £3.50 for 2 tickets on 21 May.
       Doctor Smith paid three pounds and fifty pence for two tickets on the twenty-first of May.

pt-PT  A reunião é a 12/03/2024 às 14h30 e custa 3,50 €.
       A reunião é a doze de março de dois mil e vinte e quatro às catorze horas
       e trinta minutos e custa três euros e cinquenta cêntimos.

de-DE  Am 3. Mai kostet es 25 €.
       Am dritten Mai kostet es fünfundzwanzig Euro.

en-GB  St. Patrick's Day, 3rd floor, 5km
       St. Patrick's Day, third floor, five kilometres
```

In the last line, "5km" has no space, but it is still five kilometres, and "3rd"
is "third". All outputs are from text2spoken 0.0.2a172.

## The hard part: a number is not one word

In English, "2" is "two" before any noun. In most other languages it is not.

```text
pt-PT  Comprei 2 maçãs e 1 laranja.
       Comprei duas maçãs e uma laranja.

fr-FR  Il a 21 pages et 1 minute de retard.
       Il a vingt et une pages et une minute de retard.

ru-RU  о 3 квинтиллионах книг
       о трёх квинтиллионах книг
```

"Maçã" (apple) is feminine, so 2 is *duas*, not *dois*. "Page" is feminine in
French, so 21 is *vingt et une*. In Russian, the preposition *о* ("about") puts the
noun in the prepositional case, and the number must follow: *трёх*, not *три*. A
phonemizer that reads the raw digit gets each of these wrong.

So text2spoken does not convert a number alone. It reads the word after the number,
looks up its gender and case in the language file, and asks the number writer for
the form that agrees with it.

The older tools in OpenVoiceOS did not do this correctly. With the same inputs,
`ovos-number-parser` returned *один* for a feminine 1 in Russian (correct: *одна*)
and *un* in French (correct: *une*). In Hindi, it picked the gender of an ordinal
from the length of an internal rule name, so a masculine "second" came out
feminine. `pronounce_number(1.2345, "en")` rounded the number to "one point two
three five". `ovos-date-parser` wrote the German year 2024 as "zwei tausend vier und
zwanzig", in four words.

## How it works

text2spoken works in two steps: **find**, then **speak**.

1. **Find.** Recognizers mark the spans in the text that are not words: numbers,
   dates, clock times, money, units, abbreviations and emoji.
2. **Speak.** A speller writes each span in words, with the gender and case of the
   noun beside it.

text2spoken does not contain its own number or date writers. Numbers come from
[numtag](https://github.com/TigreGotico/numtag), and Portuguese dates and clock
times come from [chronologia](https://github.com/TigreGotico/chronologia). The
same libraries also *read* numbers and dates in voice commands. Thus a fix to
"doze de março" in the reader is also the fix for the voice. Each engine reads
every form that people write and speaks the standard one.

Each language is one data file: its abbreviations, its units, the gender and case
of its nouns, and the libraries that write it. The test suite has 4,484 rows. Each
row cites a grammar, a dictionary or a style guide. 139 rows have no source that
states the rule. They are marked *silver*, so nobody mistakes them for checked facts.
Native speakers review languages that we do not speak, for example Danish and
Kabyle.

A form that text2spoken cannot read stays as written. It does not guess. For
example, `1/2` in British English and the Bengali counted form `3টি` stay as
written. A wrong word is worse than a raw character, because the listener cannot
tell that it is wrong.

### What we did not build

The big normalisers for speech, for example the FST grammars of
[NeMo](https://github.com/NVIDIA/NeMo-text-processing) and Sparrowhawk, compile
their rules with Pynini. That is a heavy build. A language file in plain Python data
is easier to extend, and the library installs with `uv pip` and nothing else. We
also did not build on `ovos-number-parser` and `ovos-date-parser`, for the reasons
above.

## Keep the cache honest

A voice system caches audio. If the sentence "3,50 €" was synthesised yesterday,
the cache plays the same audio today. But if a new version of numtag changes how
"3,50 €" is spoken, the old audio is wrong.

text2spoken gives each language a **revision**: the exact versions of the libraries
that speak it. phoonnx and scriptconv put this revision in their cache keys. When a
writer changes, the key changes, and the old audio is not used.

## What you can do with it

### Give a voice correct input

[phoonnx](https://github.com/TigreGotico/phoonnx) sends every input through
text2spoken before the phonemizer. When the switch was made, 8,336 test inputs
gave the same output as the old phoonnx normaliser. The old normaliser was then
deprecated. If you train or run a phoonnx voice, text2spoken is already in front of
it.

### Make an assistant say its replies correctly

In OpenVoiceOS, a skill writes a reply such as "O alarme toca às 7h30". The
`ovos-dialog-normalizer-plugin` (from 0.1.0a1) sends each reply through
text2spoken before the TTS, so the assistant says "às sete horas e trinta minutos".

### Clean data for TTS and ASR

To train a voice, the transcripts must hold the words that the speaker said. To
score a speech recogniser, "21" and "twenty-one" must count as the same word. Send
both sides through text2spoken and compare words with words.

### Put it in front of a phonemizer

The `normalize` extra of
[scriptconv](https://github.com/TigreGotico/scriptconv) runs text2spoken before
each phonemizer, with the revision in the cache key.

## Use it

```python
from text2spoken import normalize

normalize("Comprei 2 maçãs e 1 laranja.", "pt-PT")
# 'Comprei duas maçãs e uma laranja.'
```

text2spoken has 18 language files. The rules for each language, the sources and
the known gaps are in the
[documentation](https://github.com/TigreGotico/text2spoken/tree/dev/docs). Each
known defect is an open issue on GitHub.
