---
title: "TTS Models That Run on a Potato"
description: "phoonnx is a research framework for VITS-based text-to-speech built to run comfortably on low-end hardware. No GPU, no cloud, no API key: just a ~15.65 million-parameter ONNX voice and a CPU. Here is how small a good voice can be, and how we train them."
date: 2026-05-10
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "ONNX"
  - "VITS"
  - "self-hosted"
  - "OVOS"
draft: false
---

Good text-to-speech does not require a GPU or a cloud subscription. A natural,
multilingual voice can fit in something you would be embarrassed to call a server:
the kind of board you keep in a drawer "just in case". A potato.

[**phoonnx**](https://github.com/TigreGotico/phoonnx) is our research framework for
exactly that target: small VITS-based voices that run **fully offline, on CPU,
on cheap hardware**, and that we can also *train ourselves* from scratch.

## How small is small?

Let's put a real number on it instead of hand-waving. We pulled a production
phoonnx voice, the Basque "Miro" voice
(`OpenVoiceOS/phoonnx_eu-ES_miro_espeak`), straight off Hugging Face and counted
the weights in the ONNX graph:

```python
import onnx, numpy as np
m = onnx.load("miro_eu-ES.onnx")
print(sum(int(np.prod(i.dims)) for i in m.graph.initializer))
# 15650459
```

**~15.65 million parameters.** That is the whole voice: encoder, decoder,
and everything else, in a 63 MB file. The female "Dii" voice from the same release counts
to the *exact same* number, because they share the standard phoonnx VITS
architecture. The personality lives in the weights, not in extra capacity.

For perspective: a single layer of a "small" modern language model can carry more
parameters than this entire speech synthesizer, and it still speaks fluently.

## Why VITS, and why ONNX

[VITS](https://arxiv.org/abs/2106.06103) is the backbone of every phoonnx voice. It
is an end-to-end architecture: text (well, phonemes) in, waveform out, with no
separate vocoder to babysit and no autoregressive loop that crawls one sample at a
time. That end-to-end design is precisely what makes it tractable on a potato: one
forward pass, parallel synthesis, done.

We do not ship PyTorch to the edge. Trained voices are exported to **ONNX** and run
through [`onnxruntime`](https://onnxruntime.ai/) on the **CPU**, with no CUDA, no GPU, no
driver roulette. `onnxruntime` is a tight, portable C++ engine, and a 15-million-
parameter graph is well within what a Raspberry-Pi-class core chews through faster
than real time.

The result is a voice assistant that keeps talking when your internet
is down, when the cloud provider has an outage, or when you simply never wanted your
home audio leaving the house in the first place.

## Phonemes are where the smarts hide

A tiny acoustic model can afford to be tiny because phoonnx does the hard linguistic
work *up front*, in the phonemizer. A phonemizer (grapheme-to-phoneme, or G2P)
converts written text into the sequence of sound units the model actually speaks, so
the VITS network never has to learn spelling, just sound.

Our phoneme work is grounded in **[grapheme-to-IPA for 350+ languages](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** and **[classical Portuguese phonetics](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, which make it possible to train voices for low-resource languages without weeks of expert annotation.

phoonnx is deliberately phonemizer-agnostic and bundles a small army of them:
`espeak-ng`, [gruut](https://github.com/rhasspy/gruut),
[epitran](https://github.com/dmort27/epitran),
[misaki](https://github.com/hexgrad/misaki),
[transphone](https://github.com/xinjli/transphone) (which reaches into the thousands
of languages catalogued in Glottolog), plus specialists like
[mantoq](https://github.com/mush42/mantoq) for Arabic,
**[cotovia](https://github.com/TigreGotico/pycotovia)** for Galician, OpenJTalk for
Japanese, and KoG2P for Korean.

They emit IPA, ARPA, Pinyin, Hangul, Buckwalter: whatever the language needs. There is even a model-based multilingual G2P built on
ByT5, exported to ONNX like everything else.

Offloading the orthography to the phonemizer is the trick that lets a 15-million-
parameter model sound good in a low-resource language it has never seen written down.

## A framework for *building* voices, not just running them

phoonnx is not
only an inference toolkit. The companion framework
[**`phoonnx_train`**](https://github.com/TigreGotico/phoonnx) is how we *make* the
voices in the first place.

`phoonnx_train` covers the full pipeline:

- **Preprocessing** an LJSpeech-style dataset into phonemized training data.
- **Training** the VITS generator (those ~15.65M parameters) on a single consumer
  or mid-range GPU. A model this small does not require a training cluster.
- **Exporting** the finished checkpoint to ONNX with a single script, ready to drop
  straight into `onnxruntime` on a device.

Because the recipe is open and the models are small, building a brand-new voice for a
language that has *no* open offline option is a weekend-scale project, not a
research-grant-scale one. That is how we have been filling gaps for under-served
languages, including Basque, Mirandese, European Portuguese, and more, rather than waiting for
a vendor to decide a language is commercially interesting.

## Already wired into your assistant

You do not have to glue any of this together by hand. phoonnx ships a native
OpenVoiceOS plugin, `ovos-tts-plugin-phoonnx`, that fetches and loads voices for you:

```json
"tts": {
  "module": "ovos-tts-plugin-phoonnx",
  "ovos-tts-plugin-phoonnx": {
    "voice": "OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone"
  }
}
```

Leave the `voice` out and it picks the first model that matches your language. For
managing voices outside an assistant there is a CLI, `phoonnx-voices`, to list
languages, browse voices, and pre-download models:

```bash
phoonnx-voices list-voices --lang pt-PT
phoonnx-voices download OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone
```

And because phoonnx speaks plain VITS-over-ONNX, its inference engine also runs voices
trained by Piper, Mimic3, Coqui, and MMS: **over a thousand languages and voices**
in total. One small runtime, and an enormous catalogue, none of it phoning home.

## The point

Voice technology that respects you has to run *where you are*, on your hardware, under
your control, with the network cable unplugged if you like. phoonnx is our bet that the
way to get there is not bigger models, but the right architecture made small: VITS for
the backbone, clever phonemizers to carry the linguistic load, ONNX for portability,
and an open training framework so anyone can grow the catalogue.

Fifteen and a half million parameters, running on CPU, trained on hardware anyone
can own: that is the training pipeline behind every phoonnx voice.

