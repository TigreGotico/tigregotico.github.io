---
title: "Waarom we data hamsteren: van gescrapete catalogi naar slimmere spraak- en taalmodellen"
description: "Schone, getypeerde, goed van herkomst voorziene data is de grondstof van elk model dat we uitbrengen. Hoe de catalogi die onze scrapers bouwen ASR-bias-vocabulaires, intent-classificatoren, synthetische NER-corpora, G2P-lexicons, TTS-stemmen, en eerlijke brandstof voor LLM's worden."
date: 2026-07-04
lang: nl
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

We schrijven veel over *hoe* we data extraheren: de
**[recon-tooling](/nl/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**,
de **[anti-bot-transporten](/nl/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**,
de **[getypeerde muziekmetadata-clients](/nl/blog/2026-04-20-music-database-scrapers)**.
Een terechte vraag is *waarom*. We zijn een spraak-AI-bedrijf. Waarom houden we
scrapers in de lucht voor muziekencyclopedieën en radiogidsen?

Het antwoord is dat **data stroomopwaarts van alles ligt wat we uitbrengen**. Een
spraakassistent is slechts zo goed als de woorden die hij verwacht te horen, de
entiteiten die hij kan herkennen, en de uitspraken die hij kent. Niets daarvan
komt uit architectuurdiagrammen. Het komt uit data, en de interessante data zit
zelden in een kant-en-klare dataset. Het ligt verspreid over het publieke web, in
catalogi die mensen decennialang hebben samengesteld.

Dit is wat er met die data gebeurt nadat we ze verzameld hebben.

## Entiteiten: het vocabulaire waarop een spraakassistent leeft

Zeg "speel Sultans of Swing van Dire Straits" tegen een assistent. Voordat een
model daarop kan handelen, moet iets weten dat *Sultans of Swing* een track is en
*Dire Straits* een artiest. Vermenigvuldig met elke artiest, elk album, elke
zender, podcast en elk genre dat een gebruiker zou kunnen noemen, en je hebt het
echte vocabulaire van een media-assistent: honderdduizenden benoemde entiteiten,
waarvan er geen enkele in een standaard NLP-trainingscorpus voorkomt.

Onze mediaclients sturen precies dit uit: getypeerde records met canonieke id's,
genormaliseerd naar het **[mediavocab](https://github.com/TigreGotico/mediavocab)**-schema.
Die entiteitcatalogi voeden rechtstreeks:

- **Zoekwoordgebaseerde intent-matching**: entiteitlijsten worden de gazetteers
  (opzoeklijsten van bekende namen) die mediaquery's aarden in OpenVoiceOS.
- **Intent-classificatoren**: onze media-intent-datasets combineren echt
  gescrapete entiteiten met sjabloon- en LLM-ondersteunde zinssynthese, wat
  uitingen oplevert zoals echte gebruikers maken, gevuld met entiteiten die
  daadwerkelijk bestaan. Zo getrainde modellen handelen de beslissing "is dit een
  afspeelverzoek, en waarvoor?" af in de OpenVoiceOS-mediapijplijn.
- **Synthetische NER-corpora**: hetzelfde recept generaliseert. Neem een
  catalogus van echte entiteiten, genereer er natuurlijke zinnen omheen, en je
  hebt een gelabelde named-entity-dataset voor een domein dat geen enkel
  academisch corpus dekt. De entiteiten zijn echt, dus de verdeling is eerlijk.
  De zinnen zijn synthetisch, dus het volume is wat je maar nodig hebt.

## Spraakherkenning biasen naar de woorden die ertoe doen

ASR voor algemene doeleinden is getraind op algemene spraak, dus transcribeert het
*Dire Straits* als "dire straights" en verhaspelt het elke Portugese dorpsnaam. De
oplossing is niet opnieuw trainen vanaf nul. Het is **biasen**: de herkenner het
vocabulaire van je domein geven.

Gescrapete catalogi zijn dat vocabulaire. Concreet:

- **Taalmodel-biasing**: n-gram- of shallow-fusion-taalmodellen (taalmodellen
  ingebed in de decodeerstap van de herkenner) getraind op
  entiteitrijke tekst duwen de decoder richting domeineigen woorden. Het taalmodel
  van een media-assistent zou getraind moeten zijn op *tracktitels en
  artiestennamen*, en dat van ons kan dat zijn, want we hebben ze: getypeerd,
  gededupliceerd, met schone herkomst.
- **Prompt-geconditioneerde herkenning**: nieuwere architecturen accepteren een
  tekstprompt of contextlijst tijdens inferentie. Door de daadwerkelijke
  bibliotheek van de gebruiker (de entiteiten die onze clients hebben
  geëxtraheerd) in de context van de herkenner te voeren, verandert een
  "onherkenbaar eigennaam" in een "bekend vocabulaire-item".
- **Fine-tune-data**: waar biasen niet genoeg is, genereren
  entiteitcatalogi plus onze [TTS-stemmen](/nl/blog/2026-05-10-tts-that-runs-on-a-potato)
  synthetische spraak voor precies de zinnen die een uitrol niet fout mag krijgen.
  Dit is de [dataset-constructiedienst](/nl/services) die we commercieel aanbieden,
  en die is gebouwd op dezelfde open pijplijn.

## Uitspraak: van gecrawlde woordenboeken naar G2P en TTS

Sommige van onze meest waardevolle crawls zijn geen entiteitcatalogi maar
**lexicons**. Het crawlen van het Infopédia-woordenboek leverde
[infopedia-pt-ipa](https://huggingface.co/datasets/TigreGotico/infopedia-pt-ipa) op,
meer dan 100.000 Europees-Portugese woord→IPA-paren (IPA is het Internationaal Fonetisch Alfabet, een standaardmanier om uitspraak te noteren). Die dataset:

- benchmarkt en stemt onze regelgebaseerde
  [Portugese G2P-stack](/nl/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes) af,
- aardt de uitspraak voor [TTS-stemmen](/nl/blog/2026-06-15-two-voices-every-language-miro-and-dii)
  zodat ze woorden zeggen zoals sprekers dat werkelijk doen,
- en zaait betekenisgelabelde bronnen zoals ons
  [Portugese heterofoonwerk](https://github.com/TigreGotico/bifonia), waar dezelfde
  spelling naar verschillende klanken mapt afhankelijk van de betekenis.

Spelling-naar-klank-data is de minst glamoureuze hoek van de spraaktechnologie, en
degene die het meest bepaalt of een stem als een moedertaalspreker klinkt. Niemand
overhandigt je deze data. Je crawlt ze, maakt ze schoon, en publiceert ze, zodat
het volgende team dat niet hoeft te doen.

## Eerlijke brandstof voor LLM's

Alles hierboven geldt ook voor grote taalmodellen, met één extra wending:
**herkomst doet er nu meer toe dan volume**. Het open web raakt steeds meer besmet
met modelgegenereerde tekst. Erop trainen of evalueren recyclet stilletjes de
modeloutput van gisteren. Daarom geven we om bronnen met schone menselijke herkomst:
decennia aan [Usenet-archieven](/nl/blog/2026-07-01-usenet-and-remailers-in-2026),
samengestelde encyclopedieën, officiële woordenboeken. Daarom vermeldt ook elke
dataset die we publiceren waar elk record vandaan kwam.

Gestructureerde catalogi voeden LLM's ook tijdens *inferentie*. Een getypeerde,
gededupliceerde entiteitopslag is precies wat een retrieval-laag of de tool-API van
een agent wil om zijn antwoorden te aarden. Schone API's over rommelige bronnen zijn
meer dan een scraping-gemak. Ze zijn hoe je een taalmodel aan feiten verbonden
houdt.

## De pijplijn, van begin tot eind

Het volledige plaatje ziet er dus zo uit:

```
recon → resilient extraction → typed clients → normalised catalogues
      → gazetteers & intent data     (NLP)
      → biasing LMs & fine-tune sets (ASR)
      → lexicons & phoneme labels    (G2P / TTS)
      → provenance-clean corpora     (LLMs, retrieval)
```

Elke fase is opensource, elke dataset is gepubliceerd waar de licentie het toelaat,
en dezelfde pijplijn die de behoeften van onze eigen modellen vervult, is
beschikbaar [als een opdracht](/nl/services) voor die van jou. De scrapers zijn geen
zijmissie. Ze zijn de groeve waaruit de hele stack is gebouwd.
