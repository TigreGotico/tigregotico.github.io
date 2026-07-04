---
title: "Introducing the First Phonemizer for Barranquenho"
description: "g2p_barranquenho is the first open grapheme-to-phoneme converter for Barranquenho, the Ibero-Romance contact language of Barrancos, Portugal — rules derived from the municipality's newly published orthographic convention, auditable against the committed sources."
date: 2025-12-12
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) is the first open Grapheme-to-Phoneme converter for [Barranquenho](https://en.wikipedia.org/wiki/Barranquenho), an Ibero-Romance contact language spoken in Barrancos, Portugal — a municipality on the Spanish border where Portuguese and Extremaduran/Andalusian Spanish have coexisted for centuries.

### What makes Barranquenho phonologically interesting

Barranquenho isn't a dialect of either Portuguese or Spanish; it's a genuinely distinct system. The Barrancos Municipal Council recently published three foundational documents — a dictionary, an orthographic convention, and a basic grammar — which provided the rules we needed. The announcement: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

From that orthographic convention we derived the rule set. The phonemizer runs two passes over lowercased input:

1. **Digraph pass** — collapses multi-letter graphemes: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/, and `qu`/`gu` before front vowels → /k//g/.
2. **Grapheme pass** — maps remaining characters to IPA with context-sensitive rules: nasal diphthongs before `m`/`n` (e.g. `an` → /ɐ͂/), word-final `e` → /ɨ/, `v` always → /b/, `s` voiced to /z/ except word-initial, `r` vs `rr` (tap vs trill), and `h` as a pronounced /h/ — unlike either parent language.

The `x` grapheme has the most complex logic, falling back to Portuguese contextual heuristics where Barranquenho convention is silent.

In practice:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ũ ẽjoɾmj pasu paɾɐ u bɐrɐ͂keɲu j paɾɐ ɐ kultuɾɐ bɐrɐ͂keɲɐ`

The library is a single function, `phonemize(word: str) -> list[str]`, with no runtime dependencies — pure Python. The source PDFs (convention, dictionary, grammar) are committed to the repo root so the rules are auditable against their source.

### What comes next

A G2P converter is the minimum prerequisite for TTS and ASR work. Without it, a model trained on text has no principled phonetic grounding. With it, the path to a Barranquenho voice model follows the same hybrid pipeline we used for Asturian and Aragonese — the blocker is speech data, not the tooling.

**If you have recordings of spoken Barranquenho or access to speakers willing to contribute under an open license, get in touch.** Native speaker recordings, even a few hours, would make a TTS model viable.

→ [g2p_barranquenho on GitHub](https://github.com/TigreGotico/g2p_barranquenho)

