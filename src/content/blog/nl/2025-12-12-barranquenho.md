---
title: "Wij presenteren de eerste phonemizer voor het Barranquenho"
description: "g2p_barranquenho is de eerste open grafeem-naar-foneem-omzetter voor het Barranquenho, de Ibero-Romaanse contacttaal van Barrancos, Portugal — regels afgeleid van de onlangs door de gemeente gepubliceerde spellingsconventie, controleerbaar aan de hand van de in de repository opgenomen bronnen."
date: 2025-12-12
lang: nl
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) is de eerste open grafeem-naar-foneem-omzetter voor het [Barranquenho](https://en.wikipedia.org/wiki/Barranquenho). Het Barranquenho is een Ibero-Romaanse contacttaal die gesproken wordt in Barrancos, Portugal, een gemeente aan de Spaanse grens waar het Portugees en het Extremeense/Andalusische Spaans al eeuwenlang naast elkaar bestaan.

### Wat het Barranquenho fonologisch interessant maakt

Het Barranquenho is geen dialect van het Portugees of het Spaans. Het is een apart taalsysteem. De gemeenteraad van Barrancos heeft onlangs drie fundamentele documenten gepubliceerd: een woordenboek, een spellingsconventie en een basisgrammatica. Deze leverden de regels die wij nodig hadden. Lees de aankondiging: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

Wij hebben de regelset uit die spellingsconventie afgeleid. In plaats van zelf een op maat gemaakte doorloop over de tekst te bouwen, leven de regels als een taalspecificatie, `ext-PT-x-barrancos`, in de gedeelde **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)**-engine. De grafeemtabel, allofoonregels, klemtoonmodel en woordoverschrijdende sandhi van die spec beschrijven elke Barranquenho-realisatie. Grafemen van meerdere letters vloeien samen zoals de conventie het documenteert: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/. Nasale tweeklanken verschijnen vóór `m`/`n`. `v` mapt altijd naar /b/, en `h` verschijnt als een uitgesproken /h/, anders dan in beide oudertalen.

`g2p_barranquenho` zelf is een dunne aanroeper-zijdige wrapper rond `orthography2ipa.G2P`, aangestuurd door die spec. Het beheert tekstnormalisatie (hoofdlettervouwing, tokenisatie in de vormen die de spec verwacht), getalexpansie en een stabiel `phonemize`/`transcribe`-oppervlak, maar niet de fonologische regels. Een regel verbeteren betekent de spec stroomopwaarts bewerken, zodat elke afnemer stroomafwaarts de fix deelt.

In de praktijk:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ˈũ eˈnɔɾmi ˈpas̺u ˈpaɾɐ ˈu bɐrɐ̃ˈkɛɲu ˈi ˈpaɾɐ ɐ kuˈltuɾɐ bɐrɐ̃ˈkɛɲɐ`

De bron-PDF's (conventie, woordenboek, grammatica) zijn opgenomen in de hoofdmap van de repository, zodat de regels controleerbaar zijn aan de hand van hun bron.

### Wat er hierna komt

Een G2P-omzetter is de minimale voorwaarde voor werk aan TTS en ASR. Zonder deze omzetter heeft een op tekst getraind model geen principiële fonetische grondslag. Met deze omzetter volgt het pad naar een Barranquenho-stemmodel dezelfde hybride pijplijn die wij gebruikten voor het Asturisch en het Aragonees. De belemmering is de spraakdata, niet het gereedschap.

**Als u opnames van gesproken Barranquenho hebt of toegang tot sprekers die onder een open licentie willen bijdragen, neem dan contact op.** Opnames van moedertaalsprekers, zelfs enkele uren, zouden een TTS-model haalbaar maken.

→ [g2p_barranquenho op GitHub](https://github.com/TigreGotico/g2p_barranquenho)
