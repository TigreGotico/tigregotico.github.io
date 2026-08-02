---
title: "Introducing the First Phonemizer for Barranquenho"
description: "g2p_barranquenho is the first open grapheme-to-phoneme converter for Barranquenho, the Ibero-Romance contact language of Barrancos, Portugal — rules derived from the municipality's newly published orthographic convention, auditable against the committed sources."
date: 2025-12-12
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) is the first open Grapheme-to-Phoneme converter for [Barranquenho](https://en.wikipedia.org/wiki/Barranquenho). Barranquenho is an Ibero-Romance contact language spoken in Barrancos, Portugal, a municipality on the Spanish border where Portuguese and Extremaduran/Andalusian Spanish have coexisted for centuries.

### What makes Barranquenho phonologically interesting

Barranquenho isn't a dialect of Portuguese or Spanish. It's a distinct linguistic system. The Barrancos Municipal Council recently published three foundational documents: a dictionary, an orthographic convention, and a basic grammar. These gave us the rules we needed. Read the announcement: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

We derived the rule set from that orthographic convention. Rather than hand-rolling a bespoke pass over the text, the rules live as a language spec, `ext-PT-x-barrancos`, in the shared **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** engine. That spec's grapheme table, allophone rules, stress model, and cross-word sandhi describe every Barranquenho realisation. Multi-letter graphemes collapse the way the convention documents: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/. Nasal diphthongs appear before `m`/`n`. `v` always maps to /b/, and `h` surfaces as a pronounced /h/, unlike in either parent language.

`g2p_barranquenho` itself is a thin caller-side wrapper around `orthography2ipa.G2P`, driven by that spec. It owns text normalisation (case-folding, tokenisation into the shapes the spec expects), number expansion, and a stable `phonemize`/`transcribe` surface, but not the phonological rules. Improving a rule means editing the spec upstream, so every downstream consumer shares the fix.

In practice:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ˈũ eˈnɔɾmi ˈpas̺u ˈpaɾɐ ˈu bɐrɐ̃ˈkɛɲu ˈi ˈpaɾɐ ɐ kuˈltuɾɐ bɐrɐ̃ˈkɛɲɐ`

The source PDFs (convention, dictionary, grammar) are committed to the repo root so the rules are auditable against their source.

### What comes next

A G2P converter is the minimum prerequisite for TTS and ASR work. Without it, a model trained on text has no principled phonetic grounding. With it, the path to a Barranquenho voice model follows the same hybrid pipeline we used for Asturian and Aragonese. The blocker is speech data, not the tooling.

**If you have recordings of spoken Barranquenho or access to speakers willing to contribute under an open license, get in touch.** Native speaker recordings, even a few hours, would make a TTS model viable.

→ [g2p_barranquenho on GitHub](https://github.com/TigreGotico/g2p_barranquenho)

