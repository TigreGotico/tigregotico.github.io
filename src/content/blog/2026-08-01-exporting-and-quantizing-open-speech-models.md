---
title: "Exporting and Quantizing Open Speech Models So They Actually Run"
description: "A trained speech model on a research GitHub page is not a voice assistant. We convert open ASR and TTS checkpoints to ONNX, CoreML and GGUF, quantize them, and validate the output. Then we publish the results under OpenVoiceOS so every language they cover ships in a real, offline assistant."
date: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "CoreML"
  - "GGUF"
  - "ASR"
  - "OVOS"
  - "OpenVoiceOS"
  - "Quantization"
  - "Open Source"
draft: false
lang: en
---

A speech recognition model published as a research checkpoint is usually a folder of PyTorch weights, a training script, and a note that says which GPU it was trained on. That is enough to reproduce a benchmark score. It is not enough to put on a Raspberry Pi, a phone, or a laptop with no internet connection. Getting from one to the other is conversion work. It is most of what determines whether an open speech model ever reaches a real device.

We do this conversion work for a living. We take open ASR (automatic speech recognition, i.e. speech-to-text) and TTS (text-to-speech) models and turn them into files that run offline, on ordinary CPUs or on-device accelerators, with no Python training stack required at runtime. Most of the results are published under the [OpenVoiceOS organisation](https://huggingface.co/OpenVoiceOS) on Hugging Face rather than our own, and that choice is deliberate. More on why below.

## Why a checkpoint is not a deployment

A PyTorch or NeMo (NVIDIA's model-training toolkit) checkpoint expects a specific Python environment: the right library versions, usually a GPU, and the training framework itself just to run inference. That stack is large and changes constantly. It is not something you want to ship inside a voice assistant that has to boot on a small board.

Model export solves this by converting the trained network into a format meant purely for inference, with no training code, no autograd (the machinery a framework uses to compute gradients during training), and no framework lock-in. We target three such formats, each for a different deployment shape:

- **[ONNX](https://onnxruntime.ai/)** (Open Neural Network Exchange) is a portable graph format that a wide range of runtimes can execute, on CPU or GPU, on Linux, Windows, macOS, or embedded boards. It is our default target because it runs anywhere `onnxruntime` does, which is nearly everywhere.
- **CoreML** is Apple's on-device inference format. A CoreML package runs on the Neural Engine or GPU of a Mac or iPhone instead of the CPU. That matters for real-time speech recognition on Apple hardware.
- **[GGUF](https://github.com/ggml-org/llama.cpp)** is the format used by `llama.cpp` and its ecosystem, built for quantized, LLM-style models that need to run with a small memory footprint. We use it for the newer, transformer-based speech models that are architecturally closer to language models than to a classic acoustic model.

Choosing the right target is not cosmetic. A conformer-based ASR model (the architecture behind most modern speech recognizers, combining convolution and self-attention) converts cleanly to ONNX or CoreML. A Qwen3-based speech model is, under the hood, a language model, so it fits naturally into the GGUF/`llama.cpp` pipeline instead.

## What quantization costs, and what it buys

Quantization means storing a model's weights with fewer bits per number: 16-bit or 8-bit or 4-bit instead of the 32-bit floats it trained with. Smaller numbers make a smaller file and, on suitable hardware, faster inference, because there is less data to move and cheaper arithmetic to do.

We can put an exact figure on the trade for one real model. `nvidia/parakeet-tdt-0.6b-v3` is a 0.6-billion-parameter ASR model. Its CoreML mel-encoder component is 1132.5 MB at full precision. Palettized (Apple's term for this quantization step) down to 4 bits, it becomes 284.2 MB, a 3.99x reduction, matched almost exactly across its three sub-components (encoder, decoder, joint-decision network). Across the whole package, the unquantized CoreML export is about 1.14 GB, and the 4-bit version is about 293 MB. That is the difference between a model that fits comfortably on a phone and one that barely does.

The cost is accuracy. Fewer bits per weight means less precision, and past a certain point that shows up as more recognition errors. The standard way to measure that for ASR is WER (word error rate: the percentage of words the model gets wrong compared to a correct transcript). This is why we publish several quantization levels of the same model side by side, `4-bit`, `6-bit`, `8-bit` (`int8`), and `fp16`, instead of picking one and hoping it is good enough for every device. A phone and a desktop can afford different points on that curve.

## The validation problem

A conversion that silently produces worse output is more dangerous than no conversion at all, because nothing about it looks broken. It loads, it runs, and it just recognizes speech a little worse, or a lot worse in a language you personally do not speak and cannot spot-check by ear. The only way to catch that is to compare the exported model's output against the original reference implementation on real audio, for every language and every quantization level, before publishing it.

That is table stakes for any conversion we ship: run the same audio through the source model and the converted model, and confirm they agree. It is not a glamorous step, but skipping it is how a "supported language" quietly stops working.

## Why the models live under OpenVoiceOS, not under us

Model export is a company capability. Give us a checkpoint and a target device, and we get it running offline, validated, at the quantization level that fits your hardware. But the converted models we produce from open, non-commissioned checkpoints go to [OpenVoiceOS](https://huggingface.co/OpenVoiceOS), the open voice-assistant platform these models are built to run on, not to our own namespace.

The reason is straightforward. OpenVoiceOS is where the models get used. A converted model sitting in a company account is a nice artifact. The same model, published where [`ovos-stt-plugin-onnx-asr`](https://github.com/OpenVoiceOS/ovos-stt-plugin-onnx-asr), [`ovos-stt-plugin-coreml`](https://github.com/TigreGotico/ovos-stt-plugin-coreml), or [`ovos-stt-plugin-rover`](https://github.com/TigreGotico/ovos-stt-plugin-rover) can find it by name, is a language that a real assistant can now speak or understand. Publishing under the platform's own organisation turns a conversion into supported functionality instead of a research curiosity. It is how we make sure that doing this work once benefits every OpenVoiceOS installation, not just the customer who asked for it.

To be clear about attribution: we do not train these acoustic models from scratch, and we do not claim to. The underlying research belongs to the teams that trained it: NVIDIA's Parakeet and Conformer models, AI4Bharat's IndicConformer models for Indian languages, university and public-institute models such as Galicia's Proxecto Nós or the Basque HiTZ center's Conformer models, and independent efforts converting models for African and minority languages. What we add is the conversion, the quantization, the correctness check against the original, and the plugin wiring that lets an assistant load the result by name.

The scale of that conversion work, counted directly from what is published, breaks down as follows. Over ninety Parakeet ASR variants (across sizes, languages and quantization levels) are exported to ONNX and CoreML. There are more than thirty NVIDIA Conformer models, twenty-two AI4Bharat IndicConformer models covering low-resource Indian languages, and twenty-two wav2vec2 models for languages including Swedish, Icelandic, Faroese, Finnish and both written forms of Norwegian. Nine Conformer models cover Basque and Galician, and independently converted Whisper and wav2vec2 models cover African and creole languages such as Shona, Zulu, Xhosa, Malagasy, Haitian Creole and Kabyle. Counting only confirmed ASR conversions by distinct language code, that is at least 74 different languages with an offline, quantized speech recognizer available today. That count does not include the separate catalogue of TTS voices exported for languages such as Basque, Aragonese, Asturian, Galician, Occitan and Arabic.

## If your language or your device has nothing offline today

Most languages never get a commercial offline speech option, because the market for that language alone does not justify a vendor building one. The pattern above does not depend on market size: take an existing open checkpoint, convert it to a format that runs on the hardware you actually have, quantize it to fit, verify it against the original, and wire it into a plugin. It depends on there being an open checkpoint to start from, which is increasingly the normal case.

If you have a speech model that only runs on a training GPU, or a device that currently has no offline speech support in its language, [get in touch](/contact). Or see what this work looks like end to end on [our services page](/services).
