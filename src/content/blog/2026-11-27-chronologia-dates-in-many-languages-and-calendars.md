---
title: "chronologia: Dates in Many Languages, in 18 Calendars and the Gregorian"
description: "chronologia reads dates, times, ranges and repeats from text in many languages, and converts between 18 calendars. For Portuguese it also speaks dates and clock times. It runs in the browser in a public demo."
date: 2026-11-27
author: "Casimiro Ferreira"
tags:
  - "chronologia"
  - "NLP"
  - "dates"
  - "calendars"
  - "OVOS"
draft: false
---

"Na próxima sexta às 15h." A voice assistant must turn this into a time on a
calendar. [**chronologia**](https://github.com/TigreGotico/chronologia) does that:
it is a calendar core with a multilingual date reader on top.

```bash
uv pip install --prerelease=allow chronologia
```

```python
import datetime as dt
from chronologia import extract_timespan

anchor = dt.datetime(2026, 5, 3, 12, 0)   # a Sunday
r = extract_timespan("na próxima sexta às 15h", lang="pt-PT", anchor=anchor)
print(r.span.start, r.span.end)
# 2026-05-08T15:00:00 2026-05-08T15:01:00
```

All outputs are from chronologia 0.47.2a1, with that anchor.

## A span, not a point

The result is a span with a start and an end. "15h" is one minute. "Von Juni bis
August" is three months, from 1 June to 1 September:

```python
extract_timespan("von Juni bis August", lang="de", anchor=anchor)
# start 2026-06-01 00:00, end 2026-09-01 00:00

extract_timespan("в следующую пятницу в 15:00", lang="ru", anchor=anchor)
# start 2026-05-08 15:00
```

The text that is not a date comes back as the remainder. The reader also uses
the grammar of the sentence. In Hindi, कल means both "yesterday" and
"tomorrow", and the tense of the verb decides:

```python
r = extract_timespan("कल की दावत कैसी थी", lang="hi", anchor=anchor)
# start 2026-05-02: थी is past tense, so कल is yesterday
# r.remainder == 'की दावत कैसी थी'
```

## Repeats

"Every Monday at 8" is not one date. `extract_recurrence` returns a rule in the
iCalendar RRULE form:

```python
from chronologia import extract_recurrence
extract_recurrence("every monday at 8", lang="en", anchor=anchor).recurrence.to_string()
# FREQ=WEEKLY;BYDAY=MO;BYHOUR=8
```

## 18 calendars

The core converts between the Gregorian date and 18 other calendars, among them
the Hebrew, Islamic (civil and Umm al-Qura), Solar Hijri, Chinese, Ethiopian,
Coptic, Julian, Armenian, Bahá'í, French Republican and Mayan Long Count
calendars. The full list is in
[docs/calendars.md](https://github.com/TigreGotico/chronologia/blob/dev/docs/calendars.md).

## Speaking dates

The reader has a writer beside it. For Portuguese, `chronologia.spoken` writes
dates and clock times in words, with the differences between the European and
the Brazilian norm:

```python
from chronologia.spoken import spoken_date, spoken_time

spoken_date("pt-PT", day=3, month=5, year=2026, weekday=6)
# 'domingo três de maio de dois mil e vinte e seis'

spoken_time("pt-PT", 16)   # 'dezasseis horas'
spoken_time("pt-BR", 16)   # 'dezesseis horas'
spoken_time("pt-BR", 0)    # 'zero hora'
```

text2spoken uses these writers when a TTS voice reads a date. Only Portuguese
has writers.

## Browser demo

The [chronologia Space](https://huggingface.co/spaces/TigreGotico/chronologia)
runs the package in your browser with Pyodide. No text goes to a server.

## Limits

A doubtful reading gets a low confidence value. The reader can find a false date
in text that has none. It does not read holiday names in some languages
(Hindi, Kabyle), and a holiday name next to another date can confuse it.
Questions for native speakers are open in Kabyle, Hindi, Bengali, Marwari and
Colombian Spanish. Each known defect is an open issue on GitHub.
