---
title: "Why We Hoard Data: From Scraped Catalogues to Smarter Speech and Language Models"
description: "Clean, typed, well-provenanced data is the raw material of every model we ship. How the catalogues our scrapers build become ASR biasing vocabularies, intent classifiers, synthetic NER corpora, G2P lexicons, TTS voices — and honest fuel for LLMs."
date: 2026-07-04
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Data Collection"
  - "ASR"
  - "NLP"
  - "TTS"
  - "LLM"
  - "FOSS"
draft: false
---

We write a lot about *how* we extract data — the
**[recon tooling](/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**,
the **[anti-bot transports](/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**,
the **[typed music-metadata clients](/blog/2026-04-20-music-database-scrapers)**.
A fair question is *why*. We are a voice-AI company; what are we doing
maintaining scrapers for music encyclopedias and radio directories?

The answer is that **data is upstream of everything we ship**. A voice
assistant is only as good as the words it expects to hear, the entities it can
recognise, and the pronunciations it knows. None of that comes from
architecture diagrams. It comes from data — and the interesting data is
rarely sitting in a ready-made dataset. It is spread across the public web, in
catalogues that humans spent decades curating.

Here is what happens to that data after we collect it.

## Entities: the vocabulary a voice assistant lives on

Say "play Sultans of Swing by Dire Straits" to an assistant. Before any
model can act on that, something has to know that *Sultans of Swing* is a
track and *Dire Straits* is an artist. Multiply by every artist, album,
station, podcast, and genre a user might name, and you have the real
vocabulary of a media assistant — hundreds of thousands of named entities,
none of which appear in a standard NLP training corpus.

Our media clients emit exactly this: typed records with canonical ids,
normalised into the **[mediavocab](https://github.com/TigreGotico/mediavocab)**
schema. Those entity catalogues feed directly into:

- **Keyword-based intent matching** — entity lists become the gazetteers that
  ground media queries in OpenVoiceOS.
- **Intent classifiers** — our media-intent datasets combine real scraped
  entities with template and LLM-assisted sentence synthesis, producing
  utterances like real users make, populated with entities that actually
  exist. Models trained that way handle the "is this a play request, and for
  what?" decision in the OpenVoiceOS media pipeline.
- **Synthetic NER corpora** — the same recipe generalises: take a catalogue of
  real entities, generate natural sentences around them, and you have a
  labelled named-entity dataset for a domain that no academic corpus covers.
  The entities are real, so the distribution is honest; the sentences are
  synthetic, so the volume is whatever you need.

## Biasing speech recognition toward the words that matter

General-purpose ASR is trained on general speech, so it transcribes *Dire
Straits* as "dire straights" and mangles every Portuguese village name. The
fix is not retraining from scratch — it is **biasing**: giving the recogniser
the vocabulary of your domain.

Scraped catalogues are that vocabulary. Concretely:

- **Language-model biasing** — n-gram or shallow-fusion LMs trained on
  entity-rich text nudge the decoder toward in-domain words. A media
  assistant's LM should be trained on *track titles and artist names*, and
  ours can be, because we have them — typed, deduplicated, provenance-clean.
- **Prompt-conditioned recognition** — newer architectures accept a text
  prompt or context list at inference time. Feeding the user's actual
  library — the entities our clients extracted — into the recogniser's
  context turns "unrecognisable proper noun" into "known vocabulary item".
- **Fine-tuning data** — where biasing is not enough, entity catalogues plus
  our [TTS voices](/blog/2026-05-10-tts-that-runs-on-a-potato) generate
  synthetic speech for the exact phrases a deployment must not get wrong.
  This is the [dataset-construction service](/services) we offer commercially,
  and it is built on the same open pipeline.

## Pronunciation: from crawled dictionaries to G2P and TTS

Some of our most valuable crawls are not entity catalogues but **lexicons**.
Crawling the Infopédia dictionary produced
[infopedia-pt-ipa](https://huggingface.co/datasets/TigreGotico/infopedia-pt-ipa),
over 100,000 European Portuguese word→IPA pairs. That dataset:

- benchmarks and tunes our rule-based
  [Portuguese G2P stack](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes),
- grounds pronunciation for [TTS voices](/blog/2026-06-15-two-voices-every-language-miro-and-dii)
  so they say words the way speakers actually do,
- and seeds meaning-labelled resources like our
  [Portuguese heterophone work](https://github.com/TigreGotico/bifonia), where
  the same spelling maps to different sounds depending on sense.

Spelling-to-sound data is the least glamorous corner of speech tech and the
one that most decides whether a voice sounds native. Nobody hands you this
data. You crawl it, clean it, and publish it — so the next team does not have
to.

## Honest fuel for LLMs

Everything above also applies to large language models, with one extra twist:
**provenance now matters more than volume**. The open web is increasingly
contaminated with model-generated text; training or evaluating on it quietly
recycles yesterday's model outputs. That is why we care about sources with
clean human provenance — decades of
[Usenet archives](/blog/2026-07-01-usenet-and-remailers-in-2026), curated
encyclopedias, official dictionaries — and why every dataset we publish states
where each record came from.

Structured catalogues also feed LLMs at *inference* time: a typed,
deduplicated entity store is exactly what a retrieval layer or an agent's tool
API wants to ground its answers in. Clean APIs over messy sources are not just
a scraping convenience — they are how you keep a language model attached to
facts.

## The pipeline, end to end

So the full picture looks like this:

```
recon → resilient extraction → typed clients → normalised catalogues
      → gazetteers & intent data     (NLP)
      → biasing LMs & fine-tune sets (ASR)
      → lexicons & phoneme labels    (G2P / TTS)
      → provenance-clean corpora     (LLMs, retrieval)
```

Each stage is open source, each dataset is published where licensing allows,
and the same pipeline that fills our own models' needs is available
[as an engagement](/services) for yours. The scrapers are not a side quest.
They are the quarry the whole stack is built from.
