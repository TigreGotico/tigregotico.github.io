---
title: "Choosing a Voice-Cloning Engine"
description: "voiceclonnx runs 10 voice-conversion engines behind one API, from kNN feature-swap to AR codec-LM. This is a guide to the model families behind them, the real measured trade-off between intelligibility and speaker similarity, and how to pick an engine for a specific job."
date: 2026-08-01
lang: en
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "voice cloning"
  - "voice conversion"
  - "self-hosted"
draft: false
---

Voice conversion takes a recording and a reference speaker, and produces the same
words in the reference speaker's voice. No text is involved anywhere in the
pipeline: the input is audio, the output is audio, and the model never reads or
writes a transcript. That is what separates it from text-to-speech (TTS), which
starts from text and has no source recording to preserve. Voice conversion answers
a narrower question: given this recording, make it sound like someone else, while
keeping the words intact.

That narrower job has real uses. Dubbing a recording into a consistent voice
without hiring a second voice actor. Anonymizing a speaker in an interview or a
support call while keeping the words verbatim. Giving a TTS system's output a
single stable identity across languages, when the underlying voices for each
language were trained independently and would otherwise sound like different
people.

[`voiceclonnx`](https://github.com/TigreGotico/voiceclonnx) implements 10 of
these engines behind one Python API, all running on `onnxruntime` with no
PyTorch needed at inference time. The engines are not interchangeable. They come
from different model families, and picking one means picking a trade-off, not a
winner.

## The API, briefly

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
print(cloner.sample_rate)   # 16000
```

`clone_voice(audio, reference_voice, out_path)` takes the source recording, a
5-30 second reference clip of the target speaker, and an output path, and
returns the path to the converted WAV. Swapping engines means swapping the
`engine=` string; the call shape does not change. One engine, `rvc`, is the
exception — it takes a path to an `.onnx` voice model instead of a reference
recording, covered below. `pip install voiceclonnx` pulls in all 10 engines;
models download from Hugging Face on first use.

## Two axes, not one score

Two numbers describe how well a conversion worked, and they do not move
together.

**Word error rate (WER)** measures intelligibility: how much of the original
sentence survived, as judged by feeding the output back through a speech
recognizer and comparing to the source transcript. 0% WER means every word came
through correctly.

**Speaker similarity** measures identity: whether the output actually sounds
like the target speaker, not the original one. It is computed by extracting a
speaker embedding — a compact numeric fingerprint of a voice's timbre, the
tonal color that makes one voice sound different from another at the same pitch
and loudness — from the output and from the reference clip, then comparing them
with cosine similarity. A score of 1.0 means identical timbre; `voiceclonnx`'s
own baseline — an unconverted copy of the source scored against the target — sits
at 0.09, so anything meaningfully above that is doing real conversion work.

`voiceclonnx` publishes both numbers for every engine, measured against the same
sentence converted to two reference voices. The WER comes from `faster-whisper`;
the speaker similarity comes from a `wespeaker-resnet34` embedding model
(cross-checked against two others). Put them side by side and a pattern
appears: no engine tops both columns.

| Engine | Family | WER | Target similarity |
|---|---|---|---|
| `focalcodec` | kNN feature-swap | 15-19% | **0.61** |
| `lscodec` | Speaker-decoupled codec | ~35% | 0.54 |
| `chatterbox` | AR codec-LM | 4-8% | 0.54 |
| `knnvc` | kNN feature-swap | 12-15% | 0.49 |
| `facodec` | Factorized codec | **0%** | 0.44 |
| `openvoice` | Tone-color transfer | **0%** | 0.37 |
| `bicodec` | Semantic + global tokens | 12% | 0.29 |
| `triaan` | Triple-AAN | 4% | 0.29 |
| `cosyvoice` | Flow-matching | 8% | 0.21 |

(`rvc` converts any source to one fixed community-trained voice rather than to
an arbitrary reference clip, so it is not comparable on this table; see below.)

Read the table by row, not by looking for a single best line. `facodec` and
`openvoice` sit at 0% WER — every word survives — with moderate similarity.
`focalcodec` and `lscodec` sit at the other end: the strongest timbre transfer
in the set, bought by letting 15-35% of words come out wrong. `chatterbox` is
the one engine that does well on both axes at once (4-8% WER, 0.54 similarity),
which is a property of its architecture, covered next.

## Why the families behave differently

The engines split into distinct approaches, and the approach predicts where an
engine lands on the table above.

**kNN feature-swap** (`knnvc`, `focalcodec`). The source audio is broken into
short frames, each turned into a feature vector by a pretrained self-supervised
encoder. For every source frame, the algorithm finds the *k* nearest frames in a
pool of the target speaker's features and averages them in, replacing the
source's timbre frame by frame while leaving the underlying phonetic content
where it was extracted from the encoder's own representation. There is no
learned decoder mapping one voice to another — the swap is a nearest-neighbour
lookup — which is why timbre transfer can be aggressive (`focalcodec` reaches
0.61 similarity) at the cost of occasionally garbling frames that had a poor
match in the target pool, which shows up as WER.

**Factorized codec** (`facodec`). A neural audio codec — a model that compresses
speech into a compact token sequence and reconstructs it — trained to split
those tokens explicitly into separate content and timbre streams. Because
content is a dedicated stream, the decoder reconstructs the words with high
fidelity; only the timbre stream gets swapped for the target speaker. That
explicit separation is why `facodec` reaches 0% WER: content preservation is not
competing with anything.

**Tone-color transfer** (`openvoice`). A conversion module changes tone color
— pitch contour and timbre — after a separate encoder has fixed the linguistic
content, similar in spirit to the factorized codec approach but implemented as a
color-transfer step over a mel-spectrogram rather than discrete tokens. It also
reaches 0% WER, with somewhat lower similarity than `facodec`.

**AR codec-LM** (`chatterbox`). An autoregressive language model that predicts
codec tokens one at a time, conditioned on the target speaker's embedding,
much like a text-to-speech language model but conditioned on the source
recording's content tokens instead of text. Because it generates prosody
(rhythm, stress, intonation) as part of the same autoregressive process rather
than copying it directly from the source, it can carry speaking style along
with timbre — which is why the docs note it gives the "strongest source-to-target
shift" — and it is the only engine that scores well on both intelligibility and
similarity at once.

**Flow-matching** (`cosyvoice`). A continuous generative process that
iteratively refines noise into the target mel-spectrogram, using an ODE
(ordinary differential equation) solver stepped a configurable number of times
(`ode_steps`, default 10). Its content encoder is designed for cross-lingual
transfer, and that generality is likely why its target-similarity score is the
lowest in the set: the representation optimizes for language-independence, not
for the tightest speaker match.

**Speaker-decoupled codec** (`lscodec`). Like `facodec`, a codec trained to
separate content from speaker identity, but tuned to push similarity further at
the direct cost of the content stream's precision, landing at ~35% WER with the
second-highest similarity in the set.

**Triple-AAN and semantic-plus-global-token codecs** (`triaan`, `bicodec`) sit
in the middle on both axes: moderate WER, moderate similarity, no strong bias
either way.

**Any-to-ONE codec + vocoder** (`rvc`). Built on ContentVec (a content encoder)
feeding a VITS vocoder, trained per target voice rather than accepting an
arbitrary reference clip. `reference_voice` for this engine is a path to an
`.onnx` RVC model file or a Hugging Face repo ID, not an audio file:

```python
cloner = VoiceCloner(engine="rvc")
out = cloner.clone_voice("source.wav", "/path/to/myvoice.onnx", "out.wav")
```

Because each RVC model is trained on one target voice, it does not take a
reference clip at inference time and is not scored on the same similarity
benchmark as the any-to-any engines. Its measured 38% WER reflects one sample
community-trained model, not the architecture in general — quality depends on
how that specific model was trained. Thousands of community RVC voices exist on
Hugging Face and load directly by repo ID.

## Deciding which one to run

**Fast, general-purpose pipeline.** Start with `facodec` or `openvoice`. Both
hit 0% measured WER with moderate similarity (0.44 and 0.37), and both ship an
INT8 quantized variant with no listed quality regression — pass
`quantized=True` for a smaller, faster model.

**Maximum speaker similarity.** Use `focalcodec` (0.61 similarity, the highest
measured) if the 15-19% WER is acceptable for the use case, or `chatterbox`
(0.54 similarity, 4-8% WER) if it is not. `chatterbox` also runs at 24 kHz, the
highest output rate for any-to-any conversion in the set — `rvc` runs up to
48 kHz but only in the any-to-ONE mode above.

**Low-resource hardware.** `knnvc` at INT8 is about 123 MB on disk, the
smallest footprint in the set, with 0.49 similarity and 12-15% WER — a
reasonable trade for constrained memory. Not every engine quantizes cleanly:
`focalcodec` and `cosyvoice` are documented to degrade in INT8, so keep those
two in fp32.

**A language the engine was not trained on.** `cosyvoice`'s content encoder is
built for cross-lingual transfer, which is the documented reason to reach for
it over an engine tuned for same-language conversion, even though its measured
similarity (0.21) is the lowest of the nine directly comparable engines.

**Voice identity over exact wording.** `lscodec` gives the strongest timbre
transfer among the codec-family engines (0.54, tied with `chatterbox`) at the
cost of the highest WER in the comparable set (~35%). Pick it when the goal is
"does this sound like the target speaker" and occasional word errors in the
output are tolerable.

**A single fixed community voice rather than an arbitrary clip.** `rvc`, using
a pretrained `.onnx` voice model instead of a reference recording.

**Non-commercial constraint to check first.** `bicodec` weights are licensed CC
BY-NC-SA 4.0. Every other engine's weights are MIT, Apache-2.0, or CC BY 4.0.
Verify the license of the specific weight you deploy before shipping it
commercially.

## What it does not do well, and who it should not be used on

Every number above comes with the same caveat: the numbers describe an English
demo sentence converted between two specific reference voices. A different
language, a noisier source recording, a shorter or lower-quality reference
clip, or a source speaker whose voice sits far from anything in an engine's
training data will all move the numbers, usually for the worse. None of these
engines is a universal fix for a low-quality source recording — several of them
happily convert timbre while carrying source noise straight through, since
noise has its own acoustic signature that a content/timbre split does not
always separate cleanly.

Voice conversion also raises a real risk that its close cousin, voice cloning
for TTS, already forced this team to think about: converting a recording to
sound like a real, identifiable person is impersonation-capable technology,
whether or not that was the intent. The rule this team applies to synthetic
voices generally — obtain explicit permission before using a real person's
voice as a donor or target, and fall back to public-domain recordings or a
deliberately original voice when permission is not possible — applies here with
no exception. A reference clip of a real person is not different, from a
consent standpoint, from a full training set of their voice; it just takes far
less of it to produce a usable result, which is a reason for more caution, not
less.

Reach out through [contact](/contact) or see [what we offer](/services) if
voice conversion is part of a pipeline you are building.
