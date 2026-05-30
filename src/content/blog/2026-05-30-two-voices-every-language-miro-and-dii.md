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

A voice assistant is, before anything else, a voice. It is the part people remember, the part they trust or distrust, the part that makes a piece of software feel like a presence in the room rather than a process on a disk. So when we talk about a partnership with [OpenVoiceOS](https://www.openvoiceos.org/), we are really talking about something quite intimate: who the assistant *is* when it speaks.

Together with OpenVoiceOS, we are giving the platform two consistent voice identities — **Miro**, a male voice, and **Dii**, a female voice. The promise behind them is simple to state and hard to deliver: Miro and Dii should sound like the *same person* no matter which language the assistant is configured for. A user who sets up OpenVoiceOS in Lisbon, switches their device to German on a trip, and later helps a relative configure it in Spanish should hear one familiar voice throughout. A universal brand voice — recognisable everywhere, owned by everyone.

## One identity, many languages

The usual way to get a multilingual voice is to train a single model on many languages at once. It works, but it tends to smear the result: accents bleed across languages, pronunciation gets approximate, and the voice loses the crispness of a native speaker.

We take the harder road. For every language we build a **monolingual** model — one model, one language, trained to do that language well. The trick that ties them together is **voice cloning**: each monolingual Miro model is cloned from the same source identity, and likewise for Dii. The result is a family of per-language models that each speak like a native, yet all share the same timbre, the same character, the same Miro-ness or Dii-ness. You get native-quality pronunciation *and* a single recognisable identity, instead of trading one for the other.

These models are trained and served with [**phoonnx**](https://github.com/TigreGotico/phoonnx), our open Text-to-Speech framework. phoonnx is built on the [VITS architecture](https://arxiv.org/abs/2106.06103) and runs inference through ONNX, which means the voices are **fully offline** — no cloud, no API key, no round-trip to someone else's server. They are also small. A phoonnx VITS voice weighs in at roughly **15.65M parameters** (measured), light enough to run comfortably on the kind of modest hardware that a self-hosted assistant actually lives on. Inside OpenVoiceOS, the [`ovos-tts-plugin-phoonnx`](https://github.com/TigreGotico/phoonnx) plugin wires these voices in directly and handles fetching and loading the models for you.

## The G2P research that makes it possible

Speaking a language well is not only about the voice — it is about knowing how the writing is *meant* to sound. That is the job of **grapheme-to-phoneme (G2P)** conversion: turning written text into the sequence of phonemes the model actually pronounces. Every new language we take on comes with its own G2P research, and that research is where a lot of the real work lives.

phoonnx is deliberately flexible here. It can drive a whole range of phonemizers — eSpeak, Gruut, Epitran, model-based [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0), and language-specific tools where general engines fall short. This connects directly to our broader phonetics stack: our **[orthography-to-IPA research](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** and the **[Lusophone phonemizers](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** we have built for the Portuguese family feed the same goal — accurate IPA for languages that the big TTS providers have never bothered to model carefully. When a language has no good off-the-shelf phonemizer, that gap *is* the project. We do the spelling-to-sound research first, then the voice follows.

Miro and Dii voices are built on **[phoonnx](/blog/2026-05-10-tts-that-runs-on-a-potato)**, our offline TTS engine, making them available everywhere — without cloud, API keys, or infrastructure costs.

## Two models for every language asked for

Here is the concrete offer, and it is the heart of the partnership: **for every language someone requests, we will build two TTS models — Miro and Dii.** Not a roadmap of someday-maybes; a standing commitment. Ask for a language, and the universal pair comes to it.

And we mean *every* language, not just the comfortable, commercially obvious ones. The voices that are missing from the world are rarely the ones with a hundred million speakers — they are the **endangered and minority languages** that mainstream TTS quietly ignores because the market is too small to bother. Those are exactly the languages we want to reach. **Frisian. Asturian. Aragonese.** Languages carried by communities who have never had a high-quality synthetic voice to call their own, and who have no reason to expect a Silicon Valley vendor to ever provide one.

A consistent voice identity matters even more here. When a minority-language community gets Miro and Dii, they get the same dignified, professional voice that a major-language user gets — not a tinny afterthought, but a first-class member of the same family. Inclusion is not a footnote in this work. It is the point.

## Open, private, and yours to keep

Everything here follows the principles that OpenVoiceOS and TigreGótico share. The voices are **free and open source**. They run **offline and self-hosted**, so what you say to your assistant stays on your hardware. The models are **small and efficient**, so privacy does not cost you a data centre. And because the whole stack — the engine, the phonemizers, the G2P research, the trained voices — is open, a community can take its language and run with it long after any single company has moved on.

You can browse the growing set of voices in the [**phoonnx TTS models collection**](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) on Hugging Face. If your language is not there yet, that is not a closed door — it is a request waiting to be made.

Two voices. Every language. The ones the rest of the industry forgot, included.
