---
title: "chronologia: From “Next Friday at 3” to 66 Million Years Ago"
description: "A voice assistant must turn 'daqui a duas semanas' or 'von Juni bis August' into a span on a calendar. The old OpenVoiceOS date parser did this with one hand-written loop per language. chronologia replaces it with one engine, language data, 18 calendars and dates with no year limit. Why, how and what you can build with it."
date: 2026-11-27
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

Each one names a time on a calendar. The assistant must find it before it can set a
reminder, answer "what day is that?" or read the weather for that day. Here is what
`ovos-date-parser` 0.29.0, the date reader of OpenVoiceOS, gives for them. The
anchor (the time "now") is 27 November 2026, 10:00:

| Sentence | ovos-date-parser 0.29.0 | chronologia |
| :--- | :--- | :--- |
| the meeting is on the second of may | 1 May 2027 | 2 May 2027 |
| daqui a duas semanas | nothing | 11 December 2026, 10:00 |
| tenho uma reunião às três e meia | nothing | today, 15:30 |
| von Juni bis August | nothing | 1 June to 1 September 2027 |

These are not rare forms. They are what people say every day.

## Why the old parser failed

`ovos-date-parser` had one hand-written function per language: a token loop of 200 to
1,000 lines that read the words one at a time. Each loop implemented the same rules
again, with its own control flow. An audit found the cost:

- The bug that reverses the direction of "N units ago" was in 20 different scanners.
  Each one needed its own fix.
- A month with a bare year ("May 2027") failed in most languages.
- Five scanners returned a different type of result from the others.
- Two languages could write dates but could not read them.

The defects multiplied: languages × features. A fix in Portuguese did nothing for
German. We needed one engine that reads data for each language, so that one fix in
the engine fixes every language. That engine is
[**chronologia**](https://github.com/TigreGotico/chronologia).

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

The old parser returned one instant. But "June" is not an instant. It is a month.
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
format cannot express yet. The repo has 62 locale folders, and there is no Python in
them. Numbers inside dates ("duas
semanas", "vinte e sete") come from [numtag](https://github.com/TigreGotico/numtag),
which reads numbers in many languages.

Some readings differ from the old parser on purpose. These differences are written
down as rulings. For example, "in two hours" said at 13:04 is 15:04, and rounding
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

## What you can build with it

- **Voice assistant skills.** The OpenVoiceOS date-time, alerts and weather skills
  use chronologia to read the dates and times in requests.
- **A drop-in for old code.** The alphas of `ovos-date-parser` (from 0.32.1a1) send
  every language to chronologia, so old code that calls `extract_datetime` gets the
  new reader with no code change.
- **Calendar tools.** Convert a date to the Hebrew or Islamic calendar, find the
  Gregorian date of a feast, or show a date in two calendars side by side.
- **History and science.** Read "the Jurassic", "44 BC" or "66 million years ago" in
  text, and get a span that you can sort and compare with modern dates.
- **Spoken output.** Give a Portuguese voice a correct sentence for any date.

## Against ovos-date-parser

The test set has 84,869 LLM-written sentences, with gold by calendar arithmetic.
It is a regression set, not held-out data. Over all rows, chronologia reads 59,020
correctly and ovos-date-parser 0.29.0 reads 33,350. The table gives the share of
correct rows for chronologia (commit `7760ee2d`, numtag 0.49.0a1) and ovos-date-parser
0.29.0:

| Language | chronologia | ovos-date-parser |
| :--- | ---: | ---: |
| pt-PT | 0.90 | 0.39 |
| pt-BR | 0.90 | 0.39 |
| es-CO | 0.77 | 0.50 |
| fr | 0.89 | 0.67 |
| it | 0.83 | 0.40 |
| de | 0.85 | 0.49 |
| nl | 0.89 | 0.36 |
| da | 0.72 | 0.42 |
| kab | 0.69 | 0.27 |
| hi | 0.70 | 0.26 |
| bn | 0.65 | 0.23 |

chronologia loses 304 of the 1,662 cells of the test set (each cell is one sentence
class in one language) to ovos-date-parser. The losses include languages without
locale data (Chinese, Japanese), false dates in text that has no date, and some
day-part and clock forms. In this run, no language wins every class. Only Russian has the "ready" mark that
chronologia publishes for each language.

## Where it fails

The biggest open defect is a false date in text that has no date. A common word can
also be a time word. "I had a bad fall" gives September to December, because "fall"
is also autumn. "May I come in" gives May. ovos-date-parser also gets the second one
wrong. Each known defect is an open issue on GitHub, and questions for native
speakers are open for Kabyle, Bengali, Marwari and Colombian Spanish.

## Try it

The [chronologia Space](https://huggingface.co/spaces/TigreGotico/chronologia) runs
the package in your browser with Pyodide. No text goes to a server.
