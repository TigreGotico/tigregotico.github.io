---
title: "Twee stemmen, elke taal: Miro & Dii"
description: "TigreGótico werkt samen met OpenVoiceOS om de assistent twee consistente stemidentiteiten te geven, Miro en Dii, die in elke taal hetzelfde klinken, gebouwd met onze voice-cloning-technologie en de phoonnx-engine. Twee TTS-modellen voor elke taal die iemand aanvraagt, bedreigde talen inbegrepen."
date: 2026-06-15
lang: nl
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

> **Beluister ze nu:** de [Voices Demo](../../demo) draait Miro & Dii live in je
> browser. Kies een taal, typ een zin, en luister. Geen installatie, geen server.

Mensen onthouden de stem van een assistent beter dan zijn naam. Dus de kernvraag van onze samenwerking met [OpenVoiceOS](https://www.openvoiceos.org/) is een praktische: op wie moet de assistent lijken, in elke taal?

Het antwoord is **Miro** (mannelijk) en **Dii** (vrouwelijk), twee stemidentiteiten die dragen over elke taal die OpenVoiceOS ondersteunt. Een gebruiker die de assistent in Lissabon configureert en later overschakelt naar Duits, hoort in beide dezelfde vertrouwde spreker.

## Eén identiteit, vele talen

De gebruikelijke manier om een meertalige stem te krijgen is om één enkel model tegelijk op vele talen te trainen. Het werkt, maar het neigt ertoe het resultaat uit te smeren: accenten bloeden door in andere talen en de uitspraak wordt bij benadering.

In plaats daarvan bouwen we één model per taal, elk alleen getraind op die taal. Om ervoor te zorgen dat elk van die modellen klinkt als dezelfde persoon, klonen we elk eentalig Miro-model van dezelfde bronidentiteit, en evenzo voor Dii. Zo krijgt een luisteraar uitspraak van moedertaalkwaliteit in elke taal, en herkent hij toch dezelfde stem wanneer hij ertussen wisselt.

Deze modellen worden getraind en geserveerd met [**phoonnx**](https://github.com/TigreGotico/phoonnx), ons open TTS-framework: gebouwd op VITS (een neurale tekst-naar-spraakarchitectuur), geëxporteerd naar ONNX, en alleen-CPU bij inferentie. Ze draaien volledig offline, zonder cloud, zonder API-sleutel, en zonder dat gegevens je hardware verlaten. Binnen OpenVoiceOS handelt de plugin `ovos-tts-plugin-phoonnx` het ophalen en laden af. Voor het volledige verhaal over hardware en architectuur, zie [TTS die op een aardappel draait](/nl/blog/2026-05-10-tts-that-runs-on-a-potato).

## Het G2P-onderzoek dat het mogelijk maakt

Een taal goed spreken vraagt meer dan een stem. Het vraagt te weten hoe het schrift bedoeld is te klinken. Dat is de taak van grafeem-naar-foneem (G2P)-conversie: geschreven tekst omzetten in de reeks fonemen die het model uitspreekt. Elke nieuwe taal die we oppakken, heeft eerst zijn eigen G2P-onderzoek nodig, en dat onderzoek is het meeste van het echte werk.

phoonnx kan een reeks fonemizers aandrijven: eSpeak, Gruut, Epitran, de modelgebaseerde [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0), en taalspecifieke tools waar algemene engines tekortschieten. Ons [orthografie-naar-IPA-onderzoek](/nl/blog/2026-01-15-grapheme-to-ipa-for-350-languages) en de [Lusofone fonemizers](/nl/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes) die we voor de Portugese taalfamilie hebben gebouwd, voeden hetzelfde doel: accurate IPA voor talen die de grote TTS-leveranciers nooit zorgvuldig hebben gemodelleerd. Wanneer een taal geen goede kant-en-klare fonemizer heeft, is dat gat het project. We doen eerst het spelling-naar-klank-onderzoek, dan volgt de stem.


## Twee modellen voor elke gevraagde taal

Het aanbod dat het hart van de samenwerking vormt: voor elke taal die iemand aanvraagt, bouwen we twee TTS-modellen, Miro en Dii. Dit is een staande toezegging, geen roadmap. Vraag om een taal, en het paar komt ernaartoe.

We bedoelen elke taal, niet alleen die met de meeste sprekers. Bedreigde en minderheidstalen, de talen die reguliere TTS negeert omdat de markt klein is, zijn precies wat we willen bereiken: gemeenschappen die nog nooit een synthetische stem van zichzelf hebben gehad.

Op het moment van schrijven telt de [phoonnx TTS models collection](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) op Hugging Face 13 talen met minstens één uitgebrachte stem. Acht daarvan, Baskisch, Arabisch, Europees Portugees, Asturisch, Aragonees, Fries, Occitaans en Colombiaans Spaans, hebben al zowel Miro als Dii beschikbaar.

## Open en zelf-gehost

De stemmen zijn vrij en opensource. Ze draaien offline en zelf-gehost, zodat niets van wat je zegt je hardware verlaat. De hele stack, de engine, de fonemizers, het G2P-onderzoek, en de getrainde stemmen, is open, zodat een gemeenschap haar taal kan oppakken en behouden.

Als je taal er nog niet bij staat, vraag ernaar.
