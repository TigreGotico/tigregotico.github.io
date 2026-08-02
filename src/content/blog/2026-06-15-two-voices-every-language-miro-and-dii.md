---
title: "Two Voices, Every Language: Miro & Dii"
description: "TigreGótico is partnering with OpenVoiceOS to give the assistant two consistent voice identities, Miro and Dii, that sound the same in every language, built with our voice-cloning technology and the phoonnx engine. Two TTS models for every language someone requests, endangered tongues included."
date: 2026-06-15
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "OVOS"
  - "voice cloning"
  - "G2P"
  - "language inclusion"
draft: false
---

> **Hear them now:** the [Voices Demo](../../demo) runs Miro & Dii live in your
> browser. Pick a language, type a sentence, and listen. No install, no server.

People remember the voice of an assistant more than its name. So the core question of our partnership with [OpenVoiceOS](https://www.openvoiceos.org/) is a practical one: who should the assistant sound like, in every language?

The answer is **Miro** (male) and **Dii** (female), two voice identities that carry across every language OpenVoiceOS supports. A user who configures the assistant in Lisbon and later switches to German hears the same familiar speaker in both.

## One identity, many languages

The usual way to get a multilingual voice is to train a single model on many languages at once. It works, but it tends to smear the result: accents bleed across languages and pronunciation gets approximate.

We build one model per language instead, each trained only on that language. To keep every one of those models sounding like the same person, we clone each monolingual Miro model from the same source identity, and likewise for Dii. So a listener gets native-quality pronunciation in each language, and still recognizes the same voice moving between them.

These models are trained and served with [**phoonnx**](https://github.com/TigreGotico/phoonnx), our open TTS framework: built on VITS (a neural text-to-speech architecture), exported to ONNX, and CPU-only at inference. They run fully offline, with no cloud, no API key, and no data leaving your hardware. Inside OpenVoiceOS, the `ovos-tts-plugin-phoonnx` plugin handles fetching and loading them. For the full hardware and architecture story, see [TTS That Runs on a Potato](/blog/2026-05-10-tts-that-runs-on-a-potato).

## The G2P research that makes it possible

Speaking a language well takes more than a voice. It takes knowing how the writing is meant to sound. That is the job of grapheme-to-phoneme (G2P) conversion: turning written text into the sequence of phonemes the model pronounces. Every new language we take on needs its own G2P research first, and that research is most of the real work.

phoonnx can drive a range of phonemizers: eSpeak, Gruut, Epitran, the model-based [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0), and language-specific tools where general engines fall short. Our [orthography-to-IPA research](/blog/2026-01-15-grapheme-to-ipa-for-350-languages) and the [Lusophone phonemizers](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes) we built for the Portuguese family feed the same goal: accurate IPA for languages the big TTS providers have never modeled carefully. When a language has no good off-the-shelf phonemizer, that gap is the project. We do the spelling-to-sound research first, then the voice follows.

## Two models for every language asked for

The offer at the heart of the partnership: for every language someone requests, we build two TTS models, Miro and Dii. This is a standing commitment, not a roadmap. Ask for a language, and the pair comes to it.

We mean every language, not only the ones with the largest speaker counts. Endangered and minority languages, the ones mainstream TTS ignores because the market is small, are exactly what we want to reach: communities who have never had a synthetic voice of their own.

As of this writing, the [phoonnx TTS models collection](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) on Hugging Face lists 13 languages with at least one shipped voice. Eight of those, Basque, Arabic, European Portuguese, Asturian, Aragonese, Frisian, Occitan, and Colombian Spanish, already have both Miro and Dii available.

## Open and self-hosted

The voices are free and open source. They run offline and self-hosted, so nothing you say leaves your hardware. The whole stack, engine, phonemizers, G2P research, and trained voices, is open for a community to take and keep.

If your language is not on the list yet, ask for it.
