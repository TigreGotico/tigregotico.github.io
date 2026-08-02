---
title: "Measuring Speech Quality Without a Listening Panel"
description: "A working guide to speechonnxmetrics: what MOS, no-reference MOS predictors, intrusive signal metrics and ASR-based WER/CER actually measure, when each applies, real scores from real audio, and why a predicted MOS is evidence, not truth."
date: 2026-08-01
lang: en
author: "Casimiro Ferreira"
tags:
  - "speechonnxmetrics"
  - "TTS"
  - "ONNX"
  - "evaluation"
draft: false
---

A denoising model ships a new checkpoint. A TTS voice gets retrained on more data. A
voice-cloning pipeline swaps its vocoder. In each case, someone has to answer: is the
output better or worse than before?

"It sounds better to me" does not scale. It breaks down the moment the language isn't
one you speak, the moment there are twenty checkpoints to compare instead of two, or the
moment the change needs to be checked on every commit instead of once by hand.

The rigorous answer to "does it sound better" is a **Mean Opinion Score (MOS)**: put the
audio in front of a panel of listeners, ask each to rate it 1 to 5, and average the
scores. MOS is the standard speech-quality metric because it asks the question that
matters, would a human find this acceptable, instead of a proxy for it.

It is also expensive. Recruiting a panel, running it consistently, and repeating it for
every language, every recording condition and every model version a small team ships is
not something a listening panel can keep up with.

[`speechonnxmetrics`](https://github.com/TigreGotico/speechonnxmetrics) is a library for
approximating that judgement without a panel, on every build. It groups its metrics into
three families, and picking the right family for the situation matters more than any
individual number.

## Three families, three questions

**No-reference MOS estimators** are neural networks trained to predict what a listening
panel would say, from the audio alone. They need no clean original, only the output you
want to judge.

Use this family when there is no ground truth to compare against: scoring a TTS system's
output, or checking a real, already-degraded recording after denoising.

**Intrusive metrics** need a matching clean reference and measure the distance between
it and the degraded signal. Use this family when you manufactured the degradation
yourself and still hold the clean original: you fed a known-good recording through a
codec, a bandwidth-extension model, or a voice converter, and want to know how far the
output drifted from the source.

**ASR-based text metrics** transcribe the output with a speech recognizer and diff the
transcript against the expected text. This catches something the other two families
cannot: audio that sounds perfectly natural and clean but says the wrong words.

A no-reference MOS predictor rates naturalness, not correctness, so a fluent
mispronunciation scores fine. An intrusive metric needs a reference waveform, not a
reference sentence. Only comparing text catches a wrong word.

The library exposes these through one function:

```python
import speechonnxmetrics as s

# No-reference: only the output needed, no ground truth exists
s.score("output.wav", ["utmos"])

# Intrusive: needs a clean reference, ref= is required
s.score("degraded.wav", ["stoi", "mcd", "si_sdr"], ref="clean.wav")
```

Text metrics live in a separate module, `speechonnxmetrics.asr`, because they compare
strings, not audio. `s.score()` only dispatches metrics that take a waveform.

## No-reference MOS: reading the numbers

Four MOS estimators ship, each returning values on a 1–5 scale where higher is better,
the same scale a human panel uses:

| metric | dimensions | trained on | commercial use |
|---|---|---|---|
| `utmos` | one naturalness score | synthesized speech (VoiceMOS Challenge) | yes |
| `dnsmos` | `sig` / `bak` / `ovrl` (speech quality / background noise / overall) | ITU-T P.835 | yes |
| `dnsmos_p808` | one crowdsourced-listening MOS | ITU-T P.808 | yes |
| `sigmos` | 7 dimensions (`col`, `disc`, `loud`, `noise`, `reverb`, `sig`, `ovrl`) | ITU-T P.804 | yes |
| `nisqa` | `mos` plus `noi`/`dis`/`col`/`loud` breakdown | NISQA-v2 | **no — CC BY-NC-SA 4.0** |

`nisqa` is the one metric in the whole library with non-commercial weights. The other
four are MIT-licensed. `speechonnxmetrics` does not filter this for you. It states the
licence and leaves the choice to the caller.

Here is what real audio scores. Running the library's own bundled fixtures (a clean
recording, `source.wav`, and a neural-codec resynthesis of the same clip,
`facodec_aria.wav`) through UTMOS:

```python
>>> s.score("source.wav", ["utmos"])
{'utmos': 4.41}
>>> s.score("facodec_aria.wav", ["utmos"])
{'utmos': 3.21}
```

The clean recording lands near the top of the scale, as it should. It is real human
speech, not synthesized. The codec resynthesis drops over a full point. That gap, more
than either number alone, is the useful signal: it tells you the codec introduces
audible degradation, and it gives you a number to track as the codec is tuned.

DNSMOS on the same clean recording:

```python
>>> s.score("source.wav", ["dnsmos"])
{'dnsmos.sig': 3.45, 'dnsmos.bak': 3.60, 'dnsmos.ovrl': 2.93}
```

Three numbers, not one, and they diverge: `ovrl` sits noticeably below both `sig` and
`bak`. That divergence is informative rather than a bug. `ovrl` is P.835's rating of the
overall listening experience, and it tends to punish a recording harder than either
component score alone would suggest, especially for a real-world recording rather than
a studio one.

When `bak` is low, look for background noise. When `sig` is low, look for voice-level
artifacts: clipping, dropouts, robotic timbre. Report more than one predictor for the
same clip. They are trained on different data and disagree in informative ways, and a
wide gap between two independent predictors on the same clip is a cue to go and listen.

## Intrusive metrics: reading the numbers

Eleven reference-based metrics measure distance from a clean original. The ones worth
knowing first:

| metric | range | direction | measures |
|---|---|---|---|
| `stoi` / `estoi` | 0–1 | higher is better | short-time objective intelligibility — how much of the *content* survives, independent of how natural it sounds |
| `si_sdr` / `sdr` / `snr` | dB, unbounded | higher is better | signal-to-distortion / signal-to-noise ratio |
| `mcd` | dB, unbounded | lower is better | mel-cepstral distortion — spectral-envelope distance, a classic TTS/VC quality metric |
| `log_f0_rmse` | unbounded | lower is better | pitch-contour error |
| `lsd` / `msd` | dB | lower is better | log-spectral / mel-spectral distance |

Note the direction flips: STOI and the SDR family go up when quality is better, while
MCD, pitch error and spectral distance go down. Mixing them up when reading a table is
an easy mistake.

Scoring the same codec resynthesis against its clean source:

```python
>>> s.score("facodec_aria.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav")
{'stoi': 0.662, 'mcd': 10.46, 'si_sdr': -26.94}
```

STOI of 0.66 on a 0–1 scale where 1.0 is a perfect match says intelligibility took a
real hit. This is well below what a lightly-processed recording would score.

An SI-SDR of roughly −27 dB confirms it. SI-SDR is negative whenever the distortion
energy outweighs the signal, and a large negative number means heavy structural change,
not just added noise. MCD of 10.46 dB is high. Published TTS systems that sound clearly
synthetic but still speaker-consistent typically land in single digits, so 10+ points to
substantial spectral-envelope drift between the resynthesis and the original.

## ASR-based metrics: reading the numbers

Five text metrics come from one Levenshtein alignment between a reference transcript
and a hypothesis (what the audio was actually transcribed as):

| metric | range | direction | meaning |
|---|---|---|---|
| `wer` | ≥ 0 (usually 0–1, can exceed 1) | lower is better | word error rate: substitutions + deletions + insertions, divided by reference word count |
| `cer` | 0–1 | lower is better | same idea at the character level — more forgiving of minor spelling/tokenization mismatches |
| `mer` | 0–1 | lower is better | match error rate |
| `wil` | 0–1 | lower is better | word information lost |
| `wip` | 0–1 | higher is better | word information preserved (`1 − wil`) |

A worked example: reference "the quick brown fox jumps over the lazy dog" against
hypothesis "the quick brown fox jumped over a lazy dog" (one substitution, "jumps" →
"jumped", one deletion of "the"):

```python
>>> from speechonnxmetrics import asr
>>> from speechonnxmetrics.asr import BASIC
>>> asr.wer(reference, hypothesis, normalizer=BASIC)
0.222
>>> asr.cer(reference, hypothesis, normalizer=BASIC)
0.116
```

A WER of 0.22 means roughly one word in five is wrong: noticeable, worth listening to.
CER is lower on the same pair because character-level scoring treats a one-word
substitution as a handful of character edits inside a much longer character string, not
a whole missing token.

CER and WER answer different questions and are not directly comparable to each other.
WER above roughly 0.3–0.4 on natural speech usually means the ASR system, or the audio
it's transcribing, has a real problem, not a rounding error.

`speechonnxmetrics` never normalizes text on your behalf. A raw comparison counts case
and punctuation as errors, which is rarely what you want when scoring pronunciation
rather than exact transcription formatting. Pass a normalizer explicitly: `BASIC`
lowercases and collapses whitespace, `STRICT` also expands contractions and strips
diacritics, punctuation and filler words.

## The caveat that matters most

Every no-reference MOS number in this library is a prediction from a model, not a
measurement of a fact. UTMOS, DNSMOS, SIGMOS and NISQA were each trained on a specific
set of listening-test data, in specific languages and recording conditions.

A predictor trained mostly on English studio recordings can misjudge a language it never
saw in training, an accent its training panel never rated, or a recording condition
(telephone audio, a noisy room, a low-resource microphone) outside its training
distribution. The model is not lying. It is extrapolating, and extrapolation from
unfamiliar inputs is where neural predictors are least reliable.

Treat a predicted MOS as evidence, not as ground truth. It is trustworthy for what it is
good at: catching large regressions, ranking several candidates against each other, and
flagging a run that needs a human to actually listen.

It is not a substitute for a real listening panel when a decision is high-stakes, and it
should not be the last word on a language or condition the underlying model wasn't
trained to judge. The practical mitigation is to report several predictors together and
treat disagreement between them as a prompt to listen rather than noise to average away.

## What this makes possible

None of this is useful in isolation. It becomes useful the moment several engines need
to be compared on the same footing: which TTS engine, which STT engine, which
enhancement model to default to.

The [pure-ONNX speech
libraries](/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries) that
`speechonnxmetrics` was built to evaluate (TTS, ASR, denoising, voice cloning) publish
per-engine comparisons produced with exactly the metrics above: no-reference MOS for
systems with no ground truth, intrusive metrics where a clean reference exists, WER/CER
wherever correctness of the transcript is in question. That is what turns "we picked
this engine" into a number someone else can check.

If your project needs a language, an engine or a recording condition evaluated this way
and it isn't covered yet, [get in touch](/contact) or look at [our
services](/services).
