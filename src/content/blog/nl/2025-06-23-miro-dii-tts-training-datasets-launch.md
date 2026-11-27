---
title: "Miro & Dii TTS-trainingsdata: 40 open datasets in 20 locales"
description: "We publiceerden 40 synthetische trainingsdatasets voor de stemmen Miro en Dii in het Portugees, Nederlands, Duits, Frans, Italiaans, Japans, Spaans en meer. Elke taal krijgt twee consistente stemidentiteiten, gebouwd met voice cloning."
date: 2025-06-23
lang: nl
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Voice"
  - "Datasets"
  - "Miro & Dii"
  - "Multilingual"
  - "FOSS"
draft: false
---

## Wat we uitbrengen

We brengen alle 40 synthetische trainingsdatasets uit die gebruikt zijn om Miro en Dii te bouwen, de stemidentiteiten die we in samenwerking met OpenVoiceOS ontwikkelden. De collectie omvat Europees Portugees, Braziliaans Portugees, Nederlands, Duits, Frans, Italiaans, Japans, Spaans, Roemeens, Pools, Zweeds, Hindi, Deens, Farsi, Engels, Baskisch en meer. Elke dataset volgt een consistente naamgevingsconventie: `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL`, enzovoort voor elk taalpaar.

Elke dataset is volledig synthetisch: gegenereerde tekst gekoppeld aan gesynthetiseerde audio, in de LJSpeech-indeling die gangbaar is voor TTS-trainingsdata, zonder studiosessies. Elke dataset wordt uitgebracht onder een open licentie, zodat iedereen de stem opnieuw kan trainen of uitbreiden. De fonemisatie gebeurt tijdens de training in phoonnx, voortbouwend op ons [G2P-onderzoek voor meer dan 350 talen](/nl/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## Hoe de stemidentiteit consistent blijft tussen talen

We trainen geen enkel meertalig model in de hoop dat het accent zichzelf oplost. Elke taal krijgt een monolingueel model, getraind om te klinken als een moedertaalspreker van die taal. De gedeelde identiteit tussen modellen komt van voice cloning: elk Miro- en elk Dii-model wordt gekloond van dezelfde bronstem voordat het aan een nieuwe taal wordt aangepast. Het timbre en het karakter van de stem dragen over. Het accent niet, met opzet.

Het praktische resultaat is dat een Portugeessprekende, een Nederlandssprekende en een Japanssprekende allemaal onmiskenbaar naar dezelfde persoon klinken, elk native sprekend.

## Waarom de trainingsdata publiceren

Een checkpoint zonder de bijbehorende trainingsdata is een black box. Door de data te publiceren kan iedereen precies zien waarvan het model heeft geleerd, `phoonnx_train` uitvoeren op dezelfde data om hetzelfde resultaat te krijgen, en het uitbreiden: zinnen toevoegen, verfijnen voor een dialect, of een nieuwe spreker daarbovenop bouwen.

Dit is vooral van belang voor de talen met weinig hulpbronnen op deze lijst. Wanneer de trainingsdata open is, kan de gemeenschap die een taal spreekt haar eigen stem verbeteren zonder te wachten tot een leverancier besluit dat ze commercieel interessant is.

## Waar u alles vindt

Alle datasets en getrainde modellen staan onder [TigreGotico op Hugging Face](https://huggingface.co/TigreGotico), met Piper-compatibele stem-checkpoints ook gespiegeld onder [OpenVoiceOS](https://huggingface.co/OpenVoiceOS).

Voor het inferentie- en trainingsframework dat deze datasets verwerkt, zie [phoonnx](https://github.com/TigreGotico/phoonnx).
