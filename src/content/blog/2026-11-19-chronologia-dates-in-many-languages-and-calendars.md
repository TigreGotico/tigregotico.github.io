---
title: "chronologia: From “Next Friday at 3” to 66 Million Years Ago"
description: "A voice assistant must turn 'daqui a duas semanas' or 'von Juni bis August' into a span on a calendar. chronologia does this with one engine, language data, 18 calendars and dates with no year limit. Why, how and what you can build with it."
date: 2026-11-19
authors: ["Casimiro Ferreira", "Claude"]
tags:
  - "chronologia"
  - "NLP"
  - "dates"
  - "calendars"
  - "OVOS"
draft: false
---

Say these four things to a voice assistant:

- "The meeting is on the second of May."
- "Daqui a duas semanas." ("Two weeks from now.")
- "Tenho uma reunião às três e meia." ("I have a meeting at half past three.")
- "Von Juni bis August." ("From June to August.")

Each one names a time on a calendar. A voice assistant must find it before it can set
a reminder, answer "what day is that?" or read the weather for that day. With now at
27 November 2026, 10:00:

| Sentence | Meaning |
| :--- | :--- |
| the meeting is on the second of may | 2 May 2027 |
| daqui a duas semanas | 11 December 2026, 10:00 |
| tenho uma reunião às três e meia | today, 15:30 |
| von Juni bis August | 1 June to 1 September 2027 |

These are not rare forms. They are what people say every day, in every language.

## One engine for every language

The usual way to read dates is one hand-written loop of rules per language. That
works for one language. With many languages, the same rule is written again in each
loop, and each copy has its own bugs: a fix in Portuguese does nothing for German.

[**chronologia**](https://github.com/TigreGotico/chronologia) has one engine that
reads data for each language. One fix in the engine fixes every language. The
numbers inside a date, such as "duas" in "daqui a duas semanas", come from
[numtag](/blog/2026-11-16-numtag-find-every-number-in-a-text), the number reader of the previous post.

```bash
uv pip install --prerelease=allow chronologia
```

```python
import datetime as dt
from chronologia import extract_timespan

anchor = dt.datetime(2026, 11, 27, 10, 0)
r = extract_timespan("tenho uma reunião às três e meia", "pt-PT", anchor)
# start 2026-11-27 15:30, end 15:31, remainder 'tenho uma reunião'
```

All outputs in this post are from chronologia 0.48.2a2, with that anchor.

## A phrase names a stretch of time

A simple reader returns one instant. But "June" is not an instant. It is a month.
"3 pm" is a minute. "The 1990s" is ten years. If a reader returns one instant for
"June", the caller cannot tell whether it means the first second of June or the whole
month.

chronologia returns a **half-open span**, `[start, end)`. The width of the span is the
uncertainty. "Às três e meia" is one minute wide. "Von Juni bis August" starts on 1
June and ends on 1 September, so it holds all of August. The span knows its own
resolution from its width, so no separate tag can disagree with the value.

The text that is not a date comes back as the **remainder**. "The meeting is on the
second of may" gives the span and the remainder "the meeting is". A skill can use the
remainder as the title of the reminder.

## Dates with no year limit

Python's `datetime` stops at year 1 and year 9999. That is enough for a calendar app,
but not for "the Jurassic" or "66 million years ago". chronologia has its own date
type, `AstroDate`. It acts like a `datetime`, but it has no year limit. It uses
astronomical year numbering, where 1 BC is year 0.

```python
extract_timespan("66 million years ago", "en", anchor)
# start year -65998050, end year -64998050: a span one million years wide
```

The span is one million years wide. When a span is too wide for `timedelta` (about 2.74 million years), chronologia gives a
`WideDuration` in its place.

## 18 calendars

Every calendar in chronologia converts through the Julian Day Number, a count of days
that all calendars share. There are 18 calendars, among them the Hebrew, Islamic
(civil and Umm al-Qura), Chinese, Coptic, Ethiopian, Bahá'í, French Republican and
Mayan Long Count calendars.

```python
from datetime import date
from chronologia import CALENDARS

CALENDARS["hebrew"].from_astro(date(2026, 11, 27))       # 5787-09-17
CALENDARS["umm_al_qura"].from_astro(date(2026, 11, 27))  # 1448-06-17

extract_timespan("the 15th of Ramadan 1446", "en", anchor)
# 2025-03-15
```

Each span also carries a **basis**: exact, tabulated, reconstructed or predicted. An
Islamic month that begins when people see the new moon has no exact date in the
future. chronologia gives it as a two-day span with the basis `predicted`. The Ides of
March, 44 BC, in the proleptic Julian calendar, is 13 March in the Gregorian calendar.

## Grammar, not only words

In Hindi, कल means both "yesterday" and "tomorrow". A word list cannot decide which
one. The verb decides:

```python
extract_timespan("कल की दावत कैसी थी", "hi", anchor)       # 2026-11-26
extract_timespan("कल की दावत में आना ज़रूर", "hi", anchor)  # 2026-11-28
```

In the first sentence the verb थी is a past form of होना ("to be"), so कल is
yesterday. In the second, आना is an imperative, so कल is tomorrow. If there is no
verb, or if there are verbs in both tenses, chronologia does not guess, and it
returns no date, because a native speaker of Hindi said the bare word depends on
context. The lists of past and
future verbs are data files, not code.

## Language is data

Most languages in chronologia are a JSON file, word lists and a gold test set. A few,
such as Hindi, also have a small Python hook in the engine for rules that the data
format does not express. The repo has 62 locale folders, and there is no Python in
them. Numbers inside dates ("duas
semanas", "vinte e sete") come from [numtag](https://github.com/TigreGotico/numtag),
which reads numbers in many languages.

The hard cases are written down as rulings. For example, "in two hours" said at 13:04 is 15:04, and rounding
it to 15:00 is a defect. "Next" means the first occurrence strictly after now. A
month with no day ("in March") is this month if now is in it, next year's if it has
ended, and otherwise this year's.

## Speaking dates

The reader has a writer beside it. For Portuguese, `chronologia.spoken` writes a date
or a clock time as words, in the European or the Brazilian norm:

```python
from chronologia.spoken import spoken_date
spoken_date("pt-BR", day=27, month=11, year=2026, weekday=4)
# 'sexta-feira vinte e sete de novembro de dois mil e vinte e seis'
```

[text2spoken](https://github.com/TigreGotico/text2spoken) uses this writer when a
voice reads a Portuguese date.

## Against other date libraries

We compared chronologia 0.48.6a1 with three Python packages that read dates:
[dateparser](https://pypi.org/project/dateparser/) 1.5.1,
[parsedatetime](https://pypi.org/project/parsedatetime/) 2.6 and
[dateutil](https://pypi.org/project/python-dateutil/) 4.0.0. The test set has 17,470
sentences in 12 languages. They cover weekdays, day parts, clock times, holidays,
two-part dates, inflected forms, and common words that only look like dates. A model
wrote each sentence and a second model checked it. Python computed each correct date
from a fixed anchor. These are chronologia's own regression tests, so the set favours
it.

The packages do not do the same job:

| Package | Input | Output | Positions |
| :--- | :--- | :--- | :--- |
| chronologia `extract_timespans` | a sentence | every date, as a span | yes |
| dateparser `search_dates` | a sentence | every match, as a moment | text only |
| parsedatetime `nlp` | a sentence | every match, as a moment | yes |
| dateutil `parse(fuzzy=True)` | a sentence | one moment | no |

dateutil reads only English month and weekday names, so it read no sentence of the 12
languages. The test gives each package the whole sentence and checks its first date:

<picture>
  <source srcset="/blog/chronologia/thirdparty-sentence-dark.svg" media="(prefers-color-scheme: dark)">
  <img src="/blog/chronologia/thirdparty-sentence-light.svg" alt="Bar chart of the share of sentences with the date read correctly. chronologia: pt-PT 0.96, pt-BR 0.95, es-CO 0.83, fr 0.99, it 0.93, de 0.93, nl 0.97, da 0.85, hi 0.79, bn 0.73, kab 0.52. dateparser: 0.17 to 0.38, no kab. parsedatetime: 0.10 to 0.47 in pt-PT, pt-BR, es-CO, fr, de and nl." width="900" loading="lazy">
</picture>

In the eight European languages, chronologia reads 83 to 99 % of the dates, dateparser
26 to 38 %, and parsedatetime 10 to 47 %. In Hindi and Bengali, chronologia reads
about three quarters, and dateparser about a fifth. For Kabyle, chronologia is the
only package, and it reads half. The test also has Marwari, and there chronologia
reads nothing: it has no Marwari data.

The other side matters too: a date reader must not find dates where there are none.
"Verão" is "summer", but in "eles verão o filme" it is a verb: "they will see". A bare number is
usually not a day.

<picture>
  <source srcset="/blog/chronologia/thirdparty-false-dark.svg" media="(prefers-color-scheme: dark)">
  <img src="/blog/chronologia/thirdparty-false-light.svg" alt="Bar chart of the share of sentences with no date where a package gives a date, lower is better. chronologia: pt-PT 0.24, pt-BR 0.23, es-CO 0.48, fr 0.35, it 0.20, de 0.23, nl 0.29, da 0.17, hi 0.04, bn 0.00, kab 0.06. dateparser: pt-PT 0.16, pt-BR 0.08, es-CO 0.56, fr 0.60, it 0.00, de 0.67, nl 0.15, da 0.51, hi 0.33, bn 0.20. parsedatetime: pt-PT 0.09, pt-BR 0.02, es-CO 0.25, fr 0.31, de 0.38, nl 0.29." width="900" loading="lazy">
</picture>

Here chronologia is not the best. It gives more false dates than dateparser in
Portuguese, Italian and Dutch, and more than parsedatetime in Portuguese, Spanish and
French. Most of these sentences are traps that we wrote on purpose, but each one is a
real defect.

chronologia is also the slowest: about 12 ms per sentence on one laptop core, against
1.6 ms for dateparser and 0.2 ms for parsedatetime. It reads every date in a sentence
as a span, with its grammar. For a voice command, 12 ms is small. For millions of
log lines with fixed date formats, a simpler parser is faster.

### Against the standard library

Python's `datetime` stops at year 1 and year 9999:

| Input | `datetime` | chronologia |
| :--- | :--- | :--- |
| the year 10000 | `date(10000, 1, 1)`: ValueError | +010000-01-01 |
| the year 0 | `date(0, 1, 1)`: ValueError | 0000-01-01 |
| "44 a.C." (44 BC) | no year before 1 | year -43, in astronomical numbering |
| "27 de junho de 2017" | `strptime(..., "%d de %B de %Y")`: ValueError in the default locale | 27 June 2017 |
| "amanhã às cinco da tarde" | `fromisoformat`: ValueError | 2017-06-28 17:00 |

## What you can build with it

- **Voice assistant skills.** The OpenVoiceOS date-time, alerts and weather skills
  use chronologia to read the dates and times in requests.
- **Calendar tools.** Convert a date to the Hebrew or Islamic calendar, find the
  Gregorian date of a feast, or show a date in two calendars side by side.
- **History and science.** Read "the Jurassic", "44 BC" or "66 million years ago" in
  text, and get a span that you can sort and compare with modern dates.
- **Spoken output.** Give a Portuguese voice a correct sentence for any date.

## Where it fails

The biggest open defect is a false date in text that has no date. A common word can
also be a time word. "I had a bad fall" gives September to December, because "fall"
is also autumn. "May I come in" gives May.

## Try it

The [chronologia Space](https://huggingface.co/spaces/TigreGotico/chronologia) runs
the package in your browser with Pyodide. No text goes to a server.
