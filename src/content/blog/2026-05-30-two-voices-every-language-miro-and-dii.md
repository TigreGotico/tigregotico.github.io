---
title: "Two Voices, Every Language: Miro & Dii"
description: "TigreGótico is partnering with OpenVoiceOS to give the assistant two consistent voice identities — Miro and Dii — that sound the same in every language, built with our voice-cloning technology and the phoonnx engine. Two TTS models for every language someone requests, endangered tongues included."
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
> browser — pick a language, type a sentence, and listen. No install, no server.

People remember the voice of an assistant more than its name. It is what makes software feel like a presence rather than a process. So the core question of our partnership with [OpenVoiceOS](https://www.openvoiceos.org/) is a practical one: who should the assistant sound like, in every language?

The answer is **Miro** (male) and **Dii** (female) — two voice identities that carry across every language OpenVoiceOS supports. A user who configures the assistant in Lisbon and later switches to German should hear the same familiar speaker. One brand voice, every language, owned by the community.

## One identity, many languages

The usual way to get a multilingual voice is to train a single model on many languages at once. It works, but it tends to smear the result: accents bleed across languages, pronunciation gets approximate, and the voice loses the crispness of a native speaker.

We take the harder road. For every language we build a **monolingual** model — one model, one language, trained to do that language well. The trick that ties them together is **voice cloning**: each monolingual Miro model is cloned from the same source identity, and likewise for Dii. The result is a family of per-language models that each speak like a native, yet all share the same timbre, the same character, the same Miro-ness or Dii-ness. You get native-quality pronunciation *and* a single recognisable identity, instead of trading one for the other.

These models are trained and served with [**phoonnx**](https://github.com/TigreGotico/phoonnx), our open TTS framework — VITS-based, ONNX-exported, CPU-only. The voices run fully offline; no cloud, no API key, no data leaving your hardware. Inside OpenVoiceOS, the `ovos-tts-plugin-phoonnx` plugin handles fetching and loading them. For the full hardware and architecture story, see [TTS That Runs on a Potato](/blog/2026-05-30-tts-that-runs-on-a-potato).

## The G2P research that makes it possible

Speaking a language well is not only about the voice — it is about knowing how the writing is *meant* to sound. That is the job of **grapheme-to-phoneme (G2P)** conversion: turning written text into the sequence of phonemes the model actually pronounces. Every new language we take on comes with its own G2P research, and that research is where a lot of the real work lives.

phoonnx is deliberately flexible here. It can drive a whole range of phonemizers — eSpeak, Gruut, Epitran, model-based [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0), and language-specific tools where general engines fall short. This connects directly to our broader phonetics stack: our **[orthography-to-IPA research](/blog/2026-05-30-grapheme-to-ipa-for-350-languages)** and the **[Lusophone phonemizers](/blog/2026-05-30-classical-nlp-for-portuguese-syllables-and-phonemes)** we have built for the Portuguese family feed the same goal — accurate IPA for languages that the big TTS providers have never bothered to model carefully. When a language has no good off-the-shelf phonemizer, that gap *is* the project. We do the spelling-to-sound research first, then the voice follows.


## Two models for every language asked for

Here is the concrete offer, and it is the heart of the partnership: **for every language someone requests, we will build two TTS models — Miro and Dii.** Not a roadmap of someday-maybes; a standing commitment. Ask for a language, and the universal pair comes to it.

And we mean *every* language, not just the comfortable, commercially obvious ones. The voices that are missing from the world are rarely the ones with a hundred million speakers — they are the **endangered and minority languages** that mainstream TTS quietly ignores because the market is too small to bother. Those are exactly the languages we want to reach. **Frisian. Asturian. Aragonese.** Languages carried by communities who have never had a high-quality synthetic voice to call their own, and who have no reason to expect a Silicon Valley vendor to ever provide one.

A consistent voice identity matters even more here. When a minority-language community gets Miro and Dii, they get the same dignified, professional voice that a major-language user gets — not a tinny afterthought, but a first-class member of the same family. Inclusion is not a footnote in this work. It is the point.

## Open, private, and yours to keep

Everything here follows the principles that OpenVoiceOS and TigreGótico share. The voices are **free and open source**. They run **offline and self-hosted**, so what you say to your assistant stays on your hardware. The models are **small and efficient**, so privacy does not cost you a data centre. And because the whole stack — the engine, the phonemizers, the G2P research, the trained voices — is open, a community can take its language and run with it long after any single company has moved on.

You can browse the growing set of voices in the [**phoonnx TTS models collection**](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) on Hugging Face. If your language is not there yet, that is not a closed door — it is a request waiting to be made.

Two voices. Every language. The ones the rest of the industry forgot, included.
