---
title: "A Family of Pure-ONNX Speech Libraries"
description: "TigreGótico maintains a set of speech libraries — bandwidth extension, voice cloning, speaker embeddings, VAD, word stress, phonemization, TTS, and a metrics library to score them all — that share one runtime rule: only onnxruntime and numpy, no PyTorch, no GPU required."
date: 2026-08-03
lang: en
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "TTS"
  - "voice cloning"
  - "VAD"
  - "self-hosted"
  - "phoonnx"
draft: false
---

ONNX is a file format for a trained neural network: the weights and the computation
graph, frozen, with no dependency on the framework that trained it. A model exported to
ONNX can run through **ONNX Runtime**, a small inference engine that does nothing but
execute that graph. It does not know how the model was trained, does not support
training, and does not need PyTorch or TensorFlow installed.

Several of our libraries hold to one rule: at runtime, the only dependencies are
`onnxruntime` and `numpy`. Not "mostly" — the import of the package itself never
pulls in a training framework. `audiosronnx` (bandwidth extension and denoising),
`voiceclonnx` (voice cloning), `speakeronnx` (speaker embeddings), `speechonnxmetrics`
(evaluation), `stressonnx` (word stress), `vadonnx` (voice activity detection), and
`phoonnx` (phonemization and text-to-speech) all follow it, each in its own PyPI
package. Two more, `phoonnx.js` and `precise-onnx-js`, apply the same idea in the
browser with `onnxruntime-web` instead.

## Why bother

The obvious way to ship a speech model is to keep the training framework around for
inference too. It's convenient during development. It's a liability in production.

- **Install size.** A PyTorch + CUDA install runs into gigabytes before you have loaded
  a single model. `onnxruntime` and `numpy` together are a few tens of megabytes.
- **No CUDA to manage.** Matching a GPU driver, a CUDA toolkit version, and a framework
  build is a recurring source of breakage. CPU-only ONNX Runtime skips that entirely,
  and still runs the same graph on a GPU where one is available.
- **Runs on modest hardware.** A Raspberry Pi or a ten-year-old laptop can run
  `onnxruntime` comfortably. It usually cannot run a full PyTorch stack at a usable
  speed, or install it at all on a 32-bit or memory-constrained board.
- **One artifact, every platform.** The same `.onnx` file runs unmodified on Linux,
  macOS, Windows — and, through `onnxruntime-web`, inside a browser tab. There is no
  separate export step per target.
- **No training/serving version conflicts.** A training stack pins specific framework
  and CUDA versions. A serving stack wants the smallest, most stable set of
  dependencies possible. Splitting them means upgrading one without breaking the other.

## What it costs

The constraint is real, and it is not free.

**You cannot fine-tune in-process.** An ONNX graph has no optimizer, no backward pass.
Every one of these libraries treats models as fixed artifacts: you load them and run
them. Training or fine-tuning happens separately, with the original framework, and the
result gets exported to ONNX afterward. `stressonnx` and `speechonnxmetrics` both keep
an optional `export` extra that pulls in `torch` purely for that offline conversion step
— never for inference.

**Not every architecture exports cleanly.** Dynamic control flow, custom CUDA kernels,
or ops with no ONNX equivalent can block a straightforward export. `audiosronnx`'s
README documents this directly: it keeps a [not-shipped list](https://github.com/TigreGotico/audiosronnx)
of models it evaluated and rejected, with reasons, rather than pretending every research
model ports over.

**Preprocessing has to be reimplemented by hand.** A framework like PyTorch or Kaldi
ships fast, tested implementations of STFT (turning a waveform into a spectrogram),
mel-filterbank features, and resampling. Once the model itself no longer depends on
that framework, its preprocessing can't either — `speakeronnx` reimplements an 80-band
log-mel filterbank in pure NumPy for exactly this reason, and `audiosronnx` does the
same for STFT and resampling. It's more code to get right, and it needs its own parity
tests against the original.

## One task, several engines, one API

Trained speech models vary enormously by language, recording condition, and target
domain. A speaker-verification model trained on clean read speech may fail on phone
audio. A voice-cloning model tuned for English timbre transfer may lose intelligibility
on tonal languages. There's no single model that wins everywhere, so committing to one
up front is a guess.

Each library in this family picks a single task and wraps several independent published
models behind one interface, so switching engines is a one-line change instead of a
rewrite.

`audiosronnx` separates its two jobs — denoising and bandwidth extension (turning a
narrowband recording, like 8 kHz telephone audio, into a fuller-sounding, higher sample
rate signal) — behind two loaders, each backed by several engines:

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

`load_denoise` currently registers ten denoisers (`dpdfnet`, `mossformer2`, `frcrn`,
`mpsenet`, `gtcrn`, `cmgan`, `metadenoiser`, `mossformergan`, `voicefixer`,
`deepfilternet`), from a 0.54 MB model to a 415 MB one, under different licenses.
`load_sr` registers seven bandwidth extenders (`lavasr`, `novasr`, `flowhigh`,
`hifiganbwe`, `apbwe`, `sidon`, `callenhancer`). Dominated models — ones another engine
beats on every measured axis — stay in the registry anyway, so a published benchmark
result stays reproducible on demand.

`voiceclonnx` takes the same approach for voice cloning — converting the voice in an
existing recording to sound like a different reference speaker, without going through
text:

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

Ten engines are registered (`facodec`, `openvoice`, `chatterbox`, `triaan`, `cosyvoice`,
`bicodec`, `knnvc`, `focalcodec`, `lscodec`, `rvc`), spanning six distinct model
families — kNN feature-swap, factorized codec, flow-matching, tone-color transfer,
AR codec-LM, and speaker-decoupled codec. Behind the scenes each one ships with
published intelligibility and speaker-similarity numbers, so picking an engine is a
comparison, not a coin flip.

`vadonnx` applies the pattern to voice activity detection — deciding which parts of an
audio stream contain speech at all:

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

Six model families are registered (`silero`, `marblenet`, `pyannote`, `fsmn`,
`speechbrain`, `ten`), and a declarative `IOSignature` lets a single generic engine
drive most of them, or point at any custom `.onnx` VAD file.

`speakeronnx` extracts a **speaker embedding** — a fixed-length vector that summarizes
who is speaking, independent of what they said — and compares two embeddings by cosine
similarity to check whether two clips are the same speaker:

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

It registers nine models across four architecture families (WeSpeaker, CAM++, ERes2Net,
ReDimNet), with published embedding dimensions and licenses.

`stressonnx` picks word stress for text-to-speech front-ends — which syllable of a word
carries emphasis, information many languages don't spell out (Russian *за́мок*, castle,
versus *замо́к*, lock, share every letter). It registers a neural pipeline for Russian, a
second for Ukrainian and Belarusian, and a rule-and-vocabulary backend covering 26
languages with no neural inference at all:

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

`phoonnx` phonemizes text (turns spelled words into the sound units a TTS model
consumes) and runs text-to-speech across 17 registered synthesis engines and
voices exported from several ecosystems (native phoonnx, Piper, Mimic3, Coqui, MMS,
Transformers):

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

`phoonnx.js` carries the same tokenizer paths into the browser with
`onnxruntime-web`, and `precise-onnx-js` ports wake-word detection (MFCC feature
extraction plus an ONNX classifier, compatible with Mycroft Precise models) to
JavaScript, both without a server:

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

Weights for `audiosronnx` (18 published models) and `voiceclonnx` (10 published models)
live as separate downloads on the [TigreGótico Hugging Face
org](https://huggingface.co/TigreGotico), fetched on first use and cached locally, so
picking a different engine is a config change, not a redeployment.

## Closing the loop: judging engines instead of guessing

Registering many engines behind one API only pays off if you can tell which one is
actually better for your input. That's what `speechonnxmetrics` is for: a metrics
library built on the same `numpy` + `onnxruntime` constraint, so scoring a model costs
nothing extra to install.

It groups metrics into three kinds. **No-reference MOS** estimators — UTMOS, DNSMOS,
NISQA, SIGMOS — predict a **Mean Opinion Score**, the 1-to-5 naturalness rating a human
listener panel would give a clip, without needing a clean reference to compare against.
**Intrusive metrics** — STOI (short-time objective intelligibility), SI-SDR
(scale-invariant signal-to-distortion ratio), MCD (mel-cepstral distortion) — need a
matching clean reference and measure how close the output is to it. **ASR-based text
metrics** — WER (word error rate) and CER (character error rate) — run a speech
recognizer over the output and compare the transcript to the expected text, catching
cases where a model produces audio that sounds fine but says the wrong words.

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

This turns engine selection from a listening test into a table. `voiceclonnx`
publishes exactly that comparison for its ten cloning engines — WER against the
source transcript plus a separate speaker-similarity score for each one, so "facodec
gives 0% WER" or "lscodec trades WER for stronger timbre transfer" are measured claims,
not impressions. Multiply that across languages and recording conditions and manual
comparison stops being realistic; an objective metric is what makes a ten-engine
registry usable instead of overwhelming.

## Where this is useful

If you need offline speech processing — cleaning up a recording, cloning a voice,
detecting who is speaking, or synthesizing one — on hardware that will never see a GPU,
this is the shape to look for: a small runtime dependency, a choice of published models
instead of one fixed default, and a way to measure which one actually works for your
case. Every library above is a `pip install` away, MIT- or Apache-licensed at the code
level (individual model weights carry their own upstream licenses, documented per
engine), and runs the same on a laptop, a server, or a Raspberry Pi.

Get in touch through [/contact](/contact) or see what else we build at
[/services](/services).
