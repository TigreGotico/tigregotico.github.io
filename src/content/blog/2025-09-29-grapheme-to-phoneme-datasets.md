---
title: "Grapheme-to-Phoneme Datasets: Arabic, Portuguese, Galician, and Mirandese"
description: "We published four G2P datasets with synthetic training data — showing how rule-based phonemization feeds into TTS. Arabic with diacritics, Portuguese sentences, Galician, and Mirandese."
date: 2025-09-29
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "G2P"
  - "Phonetics"
  - "Multilingual"
  - "TTS"
  - "FOSS"
draft: false
---

## Spelling-to-sound, made visible

Grapheme-to-phoneme (G2P) is the invisible layer beneath TTS. You send text; a G2P engine converts it to phonemes; a voice synthesizer turns phonemes into speech. If the G2P fails, the voice sounds wrong.

We published four **original G2P training datasets** created by TigreGotico that show exactly how we solve spelling-to-sound for different languages and scripts:

- **[arabic-mantoq-synthetic-g2p](https://huggingface.co/datasets/TigreGotico/arabic-mantoq-synthetic-g2p)** — Arabic with diacritization (short vowels, nunation, sun-letter rules)
- **[portuguese-sentences-synthetic-g2p](https://huggingface.co/datasets/TigreGotico/portuguese-sentences-synthetic-g2p)** — Portuguese at sentence level with context
- **[galician_g2p](https://huggingface.co/datasets/TigreGotico/galician_g2p)** — Galician phonemization
- **[mirandese_g2p](https://huggingface.co/datasets/TigreGotico/mirandese_g2p)** — Mirandese (endangered Iberian language)

## Why G2P matters for low-resource languages

For English or Spanish, you can license a commercial G2P system. Google, Meta, and Apple have invested millions in phonemization. But for endangered languages, you're on your own.

Mirandese has ~14,000 speakers spread across Spain and Portugal. No commercial company will build a G2P for it — the market is too small. Galician has ~3 million speakers and still struggled to find good phonemization tools. Marwari has perhaps 10,000 speakers left.

**Publishing G2P datasets for low-resource languages changes the equation:**

1. **Reproducibility** — you're not locked into a commercial vendor. Train your own G2P on our data, iterate, improve.
2. **Language preservation** — the phonology is documented explicitly. When speakers pass away, the system remains.
3. **Offline-first** — no API dependency, no cloud cost, no data leaving the community.
4. **Auditability** — see exactly how each letter sequence maps to sound. If something's wrong, fix it.
5. **Community ownership** — the data belongs to the language community, not a company.

**Real impact:** A voice assistant for Mirandese becomes possible. A TTS system for Galician becomes practical. Endangered languages get access to the same tech infrastructure that major languages take for granted.

See **[orthography2ipa](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** for how this scales to 350+ languages.

## Each dataset

**All original, all synthetic, all annotated by TigreGotico**:

```json
{
  "text": "Olá mundo",
  "ipa": "ɔˈla ˈmũdu",
  "language": "pt",
  "context": "sentence"
}
```

[**All G2P datasets on HuggingFace**](https://huggingface.co/datasets?author=TigreGotico&tags=g2p)

Endangered languages deserve better. Here is the data.
