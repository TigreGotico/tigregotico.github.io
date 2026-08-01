---
title: "Saying It Right: Disambiguating Portuguese Heterophones for TTS"
description: "Many European Portuguese words are spelled the same but pronounced differently depending on meaning — and getting the vowel wrong makes a TTS voice say the wrong word. We built bifonia-pt-homographs, an open meaning-labelled dataset of 56,891 sentences over 27 words, and a tiny zero-dependency resolver that hits ≈94% where heavyweight POS taggers plateau at ≈75%."
date: 2026-06-12
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Portuguese"
  - "TTS"
  - "Grapheme-to-Phoneme"
  - "NLP"
  - "Accessibility"
  - "FOSS"
draft: false
---

## Saying It Right: Disambiguating Portuguese Heterophones for TTS

When a text-to-speech voice reads "Tenho sede", a Portuguese listener expects to hear *thirst*. But the very same spelling, `sede`, can also mean *headquarters* — and the two are pronounced with different vowels. Say it with the wrong vowel and the voice doesn't just sound off; it says a different word out loud. For someone relying on TTS to read the screen for them, that is the line between intelligible and confusing.

This is a front-end problem — the grapheme-to-phoneme stage that decides *which sounds* a word maps to, long before any neural vocoder turns those sounds into audio. No amount of vocoder quality fixes it. If the front-end picks the wrong pronunciation, the voice articulates the wrong word, crisply.

### Heterophonic homographs: same spelling, different sound, different meaning

European Portuguese is full of words spelled identically but pronounced with a different vowel quality — an *open* vowel versus a *closed* one — where the correct choice depends on **meaning**, not just grammar. A few:

- **`sede`** — *thirst* (closed e, `ˈsedɨ`) vs *headquarters/seat* (open e, `ˈsɛdɨ`). Both are nouns.
- **`forma`** — *mould / baking tin* (closed o, `ˈfoɾmɐ`, written *fôrma*) vs *shape / way* (open o, `ˈfɔɾmɐ`).
- **`molho`** — *sauce* (closed o) vs *bundle* (open o).
- **`corte`** — *royal court* (closed o) vs *a cut* (open o).

A naive TTS system commits to one pronunciation per spelling. So it reads *thirst* with the *headquarters* vowel — every time — and the listener hears the wrong word.

### Why "just tag the part of speech" doesn't work

The obvious fix is to run a part-of-speech (POS) tagger over the sentence and pick the pronunciation by POS. That helps for some pairs, but it fails *by construction* whenever two meanings share a part of speech.

Take `sede` again. *Thirst* and *headquarters* are **both nouns**. A POS tagger labels them identically — there is no grammatical signal to tell them apart — so it can only ever guess the more common reading. We measured exactly this: on our test set, both spaCy and Stanza score **0%** on the *thirst* sense of `sede`. They always pick *headquarters*. The same structural ceiling shows up on `corte` (cut vs court), `forma` (mould vs shape), and `molho` (sauce vs bundle): when meaning splits within a single part of speech, grammar can't see it.

### The dataset: labelling meaning, not grammar

So we built an open dataset that labels the thing that actually matters — meaning. **`bifonia-pt-homographs`** is **56,891 European Portuguese sentences** covering **27 heterophonic homographs**. Every sentence is labelled with the word, its **meaning** (sense), its part of speech, its IPA pronunciation, and a diacritic-restored form (for example *sêde* vs *séde*) that makes the intended reading unambiguous on the page.

The bucket key is meaning — that is the whole point. A single record looks like this:

```json
{
  "word": "sede",
  "sense": "thirst",
  "pos": "NOUN",
  "ipa": "ˈsedɨ",
  "sentence": "Depois da corrida tinha tanta sede que bebi um litro de água."
}
```

Pronunciations were verified against the [infopédia](https://www.infopedia.pt) dictionary (Porto Editora) rather than guessed, and the train/test splits are stratified per `(word, meaning)` so a downstream model — a BiLSTM, say — sees every sense in both halves. It's published on Hugging Face as [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs).

### How well can it be solved?

With meaning-labelled data, we could measure how different approaches do at picking the correct meaning — and therefore the correct pronunciation:

| Approach | Accuracy |
| --- | --- |
| Always guess the most common sense | ≈53% |
| spaCy POS → meaning | ≈66% |
| Stanza POS → meaning | ≈75% |
| `bifonia` rule + meaning resolver | **≈94%** |

The POS-based approaches plateau exactly where you'd expect: they can route by grammar but never by meaning, so the within-noun splits are out of reach. Our resolver — the [`bifonia`](https://github.com/TigreGotico/bifonia) library, lightweight and **fully dependency-free** — reaches **≈94%**, and crucially hits **100%** on the `sede`/*thirst* case the POS taggers get **0%** on.

The headline isn't just the number. It's that a small, fast, fully open component beats heavyweight neural POS taggers on this task — because it resolves *meaning*, not just grammar. No GPU, no model download, no network call.

### Why it matters

Correct pronunciation is foundational, not cosmetic. Screen readers and voice assistants are how blind and voice-only users read the world, and a front-end that mispronounces common words quietly degrades every sentence it touches. Fixing heterophone disambiguation at the source means the voice says what the text means.

Because the dataset is open and the resolver is tiny and forkable, anyone building a Portuguese TTS front-end can get this right without a giant model — and the same approach ports cleanly to a related language like Galician, where the open/closed vowel distinction creates the same trap. The labelled data also does double duty: it's exactly what you need to train compact statistical models, like a per-word classifier, for teams that have the corpus and want a learned resolver alongside the rule-based one.

### Try it

The dataset is on Hugging Face at [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs), and the resolver lives at [`bifonia`](https://github.com/TigreGotico/bifonia). It slots into the broader Portuguese phonetics work behind **[Classical NLP for Portuguese](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** and the **[grapheme-to-IPA stack for 350+ languages](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** — small, deterministic pieces that make a voice pronounce a language the way its speakers actually do.
