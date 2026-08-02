---
title: "Cleaning Up Bad Audio: Denoising and Bandwidth Extension in audiosronnx"
description: "audiosronnx treats denoising and bandwidth extension as two separate jobs: the real engine registry, model sizes and licenses, the rejected-models list, and how to check whether the output actually improved."
date: 2026-08-01
lang: en
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "denoising"
  - "bandwidth extension"
  - "speech"
draft: false
---

A recording can be bad in two different ways, and the fixes do not overlap.

The first way: background noise sits on top of the speech — traffic, a fan, room hum. The
signal that matters is there; something else is mixed into it. Removing that is
**denoising**.

The second way: the recording never captured the full signal in the first place. Telephone
audio is sampled at 8,000 samples per second (8 kHz); a full-quality recording is usually
48 kHz. The **sample rate** sets the highest frequency a digital signal can represent, so an
8 kHz call has no content above 4 kHz at all — not quiet, not filtered, just never recorded.
Making that audio sound full again means inventing plausible high frequencies that were
never captured. That is **bandwidth extension**.

`audiosronnx` treats these as two different problems with two different entry points,
because using the wrong one does the wrong thing. Run a bandwidth extender on a noisy
signal and it will faithfully reconstruct a high-frequency version of the noise. Denoising
has to happen first.

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _     = load_sr("lavasr").upscale(clean, rate)              # extend to 48 kHz
```

`load_denoise()` and `load_sr()` refuse each other's engines — asking `load_denoise` for a
bandwidth extender raises an error rather than silently doing the wrong job.

## Where this actually helps

The obvious guess is that cleaning audio before speech recognition must improve the
transcript. In practice that is not reliable. Modern recognizers are trained on large
amounts of noisy, narrowband, real-world speech, so a recognizer often handles a noisy
recording better than it handles the same recording after an enhancer has been through it.
Enhancement is lossy. It removes what it judges to be noise, and it can take acoustic detail
the recognizer was using along with it, or leave artifacts the recognizer has never heard in
training. Whether it helps or hurts depends on the specific model, what it was trained on,
and what is wrong with the recording. It has to be measured per model, not assumed.

The two places where these tools pay off consistently are both on the synthesis side.

The first is **training data preparation**. A text-to-speech voice inherits the character of
its training audio, including the room it was recorded in. Hiss, hum, and a low sample rate
in the corpus become hiss, hum, and a muffled quality in every sentence the finished voice
ever speaks. Cleaning a corpus before training, and lifting it to a consistent 48 kHz, is
work done once that improves every output afterward. This matters most for the languages
with no studio corpus available, where the only recordings that exist were never made for
speech synthesis.

The second is **post-processing synthesized speech**. A vocoder can leave a metallic edge or
a band-limited quality, particularly for a model trained on a small or low-rate dataset.
Running the output through a bandwidth extender lifts it without retraining anything.

A human listener is the third case, and the simplest one: a recording that a person has to
sit through benefits from being cleaner, whatever a recognizer would have made of it.

## The engine registry

`audiosronnx` ships ten denoisers and seven bandwidth extenders, all loadable by name
through `load_denoise()` / `load_sr()`, all pure ONNX with no torch at runtime.

Denoisers:

| Engine | Rate | Size | License |
|--------|------|------|---------|
| dpdfnet (default) | 8/16/48 kHz | 8.7–14.9 MB | Apache-2.0 |
| mossformer2 | 48 kHz | 229 MB | Apache-2.0 |
| frcrn | 16 kHz | 57.5 MB | Apache-2.0 |
| mpsenet | 16 kHz | 9.7 MB | MIT |
| gtcrn | 16 kHz | 0.54 MB | MIT |
| cmgan | 16 kHz | 7.8 MB | MIT |
| metadenoiser | 16 kHz | 19–34 MB | CC-BY-NC-4.0 |
| mossformergan | 16 kHz | 17.7 MB | Apache-2.0 |
| voicefixer | 44.1 kHz | 415 MB | MIT |
| deepfilternet | 48 kHz | ~2 MB | MIT |

Bandwidth extenders:

| Engine | Input | Size | License |
|--------|-------|------|---------|
| lavasr (default) | 8–48 kHz | ~52 MB | Apache-2.0 |
| novasr | 16 kHz | ~0.2 MB | Apache-2.0 |
| flowhigh | any | ~200 MB | MIT |
| hifiganbwe | any | ~4 MB | MIT |
| apbwe | any (12 kHz band) | ~120 MB | MIT |
| sidon | 16 kHz | ~410 MB | MIT |
| callenhancer | 8–16 kHz | ~3 GB / ~1.3 GB int8 | CC-BY-NC-4.0 |

The smallest model in the library, `gtcrn`, is 0.54 MB. The largest, `voicefixer`, is
415 MB — nearly 800 times bigger, and it does a different job: it is a *restoration* model
that handles noise, reverb, clipping and missing bandwidth together rather than one problem
at a time.

Most weights are MIT or Apache-2.0. Two are not: `metadenoiser` and `callenhancer` ship
under CC-BY-NC-4.0, non-commercial. That license covers the weights, not audio processed
with them, and the library states it at every point of use — `audiosronnx list` reports it
per engine. Nothing stops a caller from choosing `metadenoiser` for its time-domain
architecture, but the choice has to be made knowingly.

The registry exists because no single model wins on every recording. `dpdfnet` is the
default because it needs no extra dependencies and covers 8, 16 and 48 kHz from one model.
`mossformer2` is the best measured choice on fullband input. `mossformergan` posts the
highest published PESQ score (3.47) among the shipped denoisers. `gtcrn` is the pick when
the binding constraint is footprint, at 0.54 MB. On one test clip with broadband Gaussian
noise, denoisers recovered 3.5 to 5.9 dB of SNR at a 19 dB input SNR, rising to 7.5–13.7 dB
at a harder 5 dB input. That is a synthetic, hostile noise case: it ranks the engines
consistently but says little about babble noise or codec artifacts, which is exactly why
the registry keeps ten models rather than shipping only the winner.

`cmgan` is the clearest case of a model kept on purpose despite losing: it is dominated on
both PESQ and SNR by `gtcrn`, at fourteen times the size, and it stays anyway — so that
published results built against `cmgan` stay reproducible and a distinct architecture
remains available to compare against.

On the bandwidth-extension side, `sidon` and `callenhancer` do a different job from
`lavasr` or `novasr`: instead of adding a plausible high band on top of the existing signal,
they resynthesize speech from scratch through a neural vocoder, which can repair codec
damage a band extender cannot touch — at far higher computational cost. `callenhancer` is
trained specifically on telephony audio, which is why its weights carry the non-commercial
license.

## What did not make it in

`audiosronnx` ships an engine only when it exports to a single static ONNX graph, runs on
CPU through onnxruntime, carries a clear license, and has been validated end to end against
the original implementation — not just against the raw model, since a graph that matches
the network but not its surrounding normalization produces audio that sounds fine and is
quietly wrong.

The project's `docs/not-shipped.md` documents every candidate it evaluated and rejected,
with the specific reason, which makes it one of the more useful documents in the repository
because it shows the actual boundaries of what "pure ONNX, CPU-only" can do today rather
than asserting them.

### Iterative samplers have no static graph to export

Diffusion and flow-matching models run a network many times per utterance, with a loop
whose length is not fixed at export time. AudioSR (a roughly 6 GB latent-diffusion pipeline
with a separate VAE, LDM and vocoder) and SGMSE both fall here. SGMSE's own 2025 streaming
follow-up only reaches real time on a consumer GPU, let alone CPU.

### Location-variable convolutions look disqualifying and mostly are not

`resemble-enhance` was long rejected in this document over LVCNet, the vocoder's
location-variable convolution, on the theory that kernels predicted per position through
`unfold` and `einsum` cannot fold into a static graph. Tested directly, that turned out to
be wrong: both ops have ONNX equivalents. The actual failure is a separate, well-understood
tracing error ("ONNX export of convolution for kernel of unknown shape") already solved
elsewhere in the codebase for BigVGAN's resamplers. What still keeps `resemble-enhance` out
is scale: four networks including a CFM ODE sampler and an autoencoder, at 44.1 kHz. That is
a scope decision, not an impossibility.

### Some models have nothing trained to export

RNNoise ships as hand-written C, not a graph in a trainable framework, so porting it would
mean retraining an equivalent network from scratch. Fast-ULCNet publishes only architecture
code, no checkpoint at all.

### A restrictive license is a labelling decision, not automatic disqualification

That is exactly why `callenhancer` and `metadenoiser` ship. What *is* disqualifying is
weights published with no license at all: mdctGAN was rejected for exactly that, on top of a
`torch.fft`-based front end that does not export reliably.

### `torch.stft` called inside the model is a real structural blocker

NU-Wave2's sampler loop is not the problem; that could run in numpy outside the graph, the
same way every other engine's STFT does. What blocks it is that its `forward` method calls
`torch.stft` and `torch.istft` internally, which the library deliberately keeps out of every
graph it ships, and which is also the operator that exports least reliably in general.
Fixing it would mean splitting the model at the transform boundary, real restructuring
rather than an operator swap.

### Reproducing a model's architecture is not the same as reproducing its output

LiSenNet is 56 K parameters, under 300 KB, which would make it the smallest engine in the
library. Its publicly available ONNX port runs and produces plausible-looking attenuated
audio, but measured end to end it destroys the signal: −10.8 dB SNR at 11 dB input.
Reproducing the port's own reference implementation exactly gives the identical negative
result, which means the reference implementation itself does not match the front end its
own documentation describes. There is no correct target to validate against yet.

These rejections are rarely about size or speed. Each has a specific, narrow cause: an
unsupported operator with an exact replacement (`torch.complex` has no ONNX op, but
`atan2(im, re)` computes the same phase angle), a tensor built from an input's runtime shape
that a tracer cannot pin down, or a transform placed on the wrong side of a graph boundary.

## Confirming the output actually got better

An ONNX file that runs is not proof that a recording improved. Two different failure modes
look identical from the outside: a denoiser that mutes speech along with the noise, and a
bandwidth extender that adds a high band with the wrong harmonic content, both produce audio
that plays back without error and can even sound cleaner to a casual listen.

The sibling library `speechonnxmetrics` turns that judgment into a number instead of an
impression. It scores audio on **MOS** (Mean Opinion Score, a 1–5 rating of perceived
quality) two ways: no-reference neural predictors like DNSMOS and UTMOS, which score a
recording with no clean original to compare against, and intrusive metrics like STOI and
SI-SDR, which need the clean reference and measure how close the output actually is to it.

```python
import speechonnxmetrics as s

s.score("clean.wav", ["utmos"])
# -> {'utmos': 4.41}

s.score("denoised.wav", ["stoi", "si_sdr"], ref="clean.wav")
# -> {'stoi': 0.66, 'si_sdr': -26.9}
```

Run before and after a denoiser or extender and the shape of a real comparison falls out:
DNSMOS or UTMOS on the raw and processed audio to see whether perceived quality moved at
all, and — when a clean reference exists, which it does for synthetic noise tests but rarely
for a real phone call — SI-SDR or STOI to see whether the processed signal actually
converged toward it rather than just sounding different. That is the same discipline behind
the SNR figures in the denoiser table above: a number attached to a specific noise
condition, not an adjective. The broader family of pure-ONNX libraries this fits into,
including `speechonnxmetrics` itself, is covered in
[A Family of Pure-ONNX Speech Libraries](/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries).

Cleaning up audio for a training corpus, for a synthesized voice, or for a person who has to
listen to it is a distinct engineering problem, with its own trade-offs between models and
its own list of approaches that did not survive contact with a real signal.

Questions about applying this to a specific pipeline: [get in touch](/contact).
