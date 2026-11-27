---
title: "Synthetische stemmen vanaf nul maken"
description: "Een stem creëren voor een tekst-naar-spraaksysteem vereist normaal gesproken dat een echte persoon urenlang audio opneemt. Dat is duur, tijdrovend, en in veel talen of accenten bestaan de stemmen simpelweg helemaal niet"
date: 2025-06-26
lang: nl
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Synthetic Data"
  - "Voice Cloning"
  - "OVOS"
draft: false
---

> Deze blog werd oorspronkelijk gepubliceerd op de [OpenVoiceOS-blog](https://blog.openvoiceos.org/posts/2025-06-26-making-synthetic-voices-from-scratch)

Een goede offline TTS-stem voor Europees Portugees bestond niet. Studio-opnames zijn duur, nemen maanden in beslag, en voor de meeste talen ter wereld hebben die opnames simpelweg nooit plaatsgevonden. Daarom hebben we er vier vanaf nul gebouwd, zonder opnamecabine, zonder stemacteur en zonder cloud.

### De pijplijn in drie stappen

**1. Genereer synthetische spraakparen.** We gebruiken een bestaande TTS-stem als donor (elke bron die verstaanbare audio kan produceren) en draaien die over een groot tekstcorpus om duizenden audio-/tekstparen te produceren. De donorstem hoeft niet van hoge kwaliteit te zijn. Hij hoeft alleen coherent genoeg te zijn om ervan te leren.

**2. Pas stemconversie toe.** Een stemconversiestap transformeert het timbre van de donor tot een nieuwe identiteit: een ander geslacht, andere leeftijd of ander personage. De resulterende audio klinkt als de doelstem, niet als de donor.

**3. Train een compact VITS-model.** VITS is een neurale tekst-naar-spraakarchitectuur. De geconverteerde audio wordt de trainingsset voor een klein VITS-model via [phoonnx_train](https://github.com/TigreGotico/phoonnx). Het voltooide model wordt geëxporteerd naar ONNX (een draagbare indeling voor het draaien van getrainde modellen) en draait volledig offline, desnoods op een Raspberry Pi.

### Ethische waarborgen

Als de donor de stem van een echte persoon is, verkrijgen we eerst uitdrukkelijke toestemming. Wanneer geen toestemming mogelijk is, gebruiken we opnames uit het publieke domein of genereren we een volledig originele stem die niemands identiteit kopieert. De stemconversiestap heeft ook een nuttige privacyeigenschap: de uitvoer is akoestisch voldoende verschillend van de donor dat het risico op imitatie verwaarloosbaar is.

### Toegepast op Europees Portugees

Europees Portugees had geen hoogwaardige, open offline stem. We produceerden vier stemmen, waaronder de identiteiten Miro en Dii die nu de standaard-OVOS-stemmen voor `pt-PT` zijn, met precies deze pijplijn. Ze draaien comfortabel op bescheiden hardware, vereisen geen internetverbinding, en de trainingsdata is [openlijk gepubliceerd](https://huggingface.co/TigreGotico) zodat iedereen ze kan reproduceren of uitbreiden.

Alle modellen en datasets bevinden zich op [huggingface.co/OpenVoiceOS](https://huggingface.co/OpenVoiceOS) en [huggingface.co/TigreGotico](https://huggingface.co/TigreGotico).
