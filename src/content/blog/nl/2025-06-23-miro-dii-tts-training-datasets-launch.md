---
title: "Miro & Dii TTS-trainingsdata: 40 open datasets in 20 locales"
description: "We publiceerden 40 synthetische trainingsdatasets voor de stemmen Miro en Dii in het Portugees, Nederlands, Duits, Frans, Italiaans, Japans, Spaans en meer. Voice cloning op schaal: elke taal krijgt twee consistente identiteiten."
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

Alle **40 synthetische trainingsdatasets** die gebruikt zijn om Miro en Dii te bouwen — de stemidentiteiten die we in samenwerking met OpenVoiceOS ontwikkelden. De collectie omvat Europees Portugees, Braziliaans Portugees, Nederlands, Duits, Frans, Italiaans, Japans, Spaans, Roemeens, Pools, Zweeds, Hindi, Deens, Farsi, Engels, Baskisch en meer. Elke dataset volgt een consistente naamgevingsconventie: `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL`, enzovoort voor elk taalpaar.

Elke dataset is volledig synthetisch — gegenereerde tekst gekoppeld aan gesynthetiseerde audio in LJSpeech-indeling, zonder studiosessies — en wordt uitgebracht onder een open licentie, zodat iedereen de stem opnieuw kan trainen of uitbreiden. De fonemisatie gebeurt tijdens de training in phoonnx, voortbouwend op ons [G2P-onderzoek voor meer dan 350 talen](/nl/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## Hoe de stemidentiteit consistent blijft tussen talen

We trainen geen enkele meertalige blob in de hoop dat het accent zichzelf oplost. Elke taal krijgt een **monolingueel model** — getraind om te klinken als een moedertaalspreker van die taal. De gedeelde identiteit tussen modellen komt van **voice cloning**: elk Miro- en elk Dii-model wordt gekloond van dezelfde bronstem voordat het aan een nieuwe taal wordt aangepast. Het timbre, het karakter, de herkenbare kwaliteit van de stem — dat draagt over. Het accent niet, met opzet.

Het praktische gevolg: een Portugeessprekende, een Nederlandssprekende, een Japanssprekende — allemaal onmiskenbaar **dezelfde persoon**, elk native klinkend.

## Waarom de trainingsdata publiceren

Een checkpoint zonder de bijbehorende trainingsdata is een black box. Publicatie ervan maakt de stem **auditeerbaar** (u kunt precies zien waarvan ze heeft geleerd), **reproduceerbaar** (voer `phoonnx_train` uit op dezelfde data en u krijgt hetzelfde resultaat) en **uitbreidbaar** (voeg zinnen toe, verfijn voor een dialect, bouw een nieuwe spreker daarbovenop).

Dit is vooral van belang voor de talen met weinig hulpbronnen op deze lijst. Wanneer de trainingsdata open is, kan de gemeenschap die een taal spreekt haar eigen stem verbeteren — zonder te wachten tot een leverancier besluit dat ze commercieel interessant is.

## Waar u alles vindt

Alle datasets en getrainde modellen staan onder [**TigreGotico op Hugging Face**](https://huggingface.co/TigreGotico), met Piper-compatibele stem-checkpoints ook gespiegeld onder [OpenVoiceOS](https://huggingface.co/OpenVoiceOS).

Voor het inferentie- en trainingsframework dat deze datasets verwerkt, zie [**phoonnx**](https://github.com/TigreGotico/phoonnx).
