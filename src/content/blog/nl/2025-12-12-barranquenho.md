---
title: "Wij presenteren de eerste phonemizer voor het Barranquenho"
description: "g2p_barranquenho is de eerste open grafeem-naar-foneem-omzetter voor het Barranquenho, de Ibero-Romaanse contacttaal van Barrancos, Portugal — regels afgeleid van de onlangs door de gemeente gepubliceerde spellingsconventie, controleerbaar aan de hand van de in de repository opgenomen bronnen."
date: 2025-12-12
lang: nl
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) is de eerste open grafeem-naar-foneem-omzetter voor het [Barranquenho](https://en.wikipedia.org/wiki/Barranquenho), een Ibero-Romaanse contacttaal die gesproken wordt in Barrancos, Portugal — een gemeente aan de Spaanse grens waar het Portugees en het Extremeense/Andalusische Spaans al eeuwenlang naast elkaar bestaan.

### Wat het Barranquenho fonologisch interessant maakt

Het Barranquenho is geen dialect van het Portugees of het Spaans; het is een werkelijk apart systeem. De gemeenteraad van Barrancos heeft onlangs drie fundamentele documenten gepubliceerd — een woordenboek, een spellingsconventie en een basisgrammatica — die de regels leverden die wij nodig hadden. De aankondiging: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

Uit die spellingsconventie hebben wij de regelset afgeleid. De phonemizer voert twee doorlopen uit over de invoer in kleine letters:

1. **Digraafdoorloop** — voegt grafemen van meerdere letters samen: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/, en `qu`/`gu` vóór voorklinkers → /k//g/.
2. **Grafeemdoorloop** — brengt de overige tekens in kaart naar IPA met contextgevoelige regels: nasale tweeklanken vóór `m`/`n` (bijvoorbeeld `an` → /ɐ͂/), `e` aan het woordeinde → /ɨ/, `v` altijd → /b/, `s` stemhebbend naar /z/ behalve aan het woordbegin, `r` versus `rr` (enkelvoudige versus rollende tril), en `h` als een uitgesproken /h/ — anders dan in beide oudertalen.

Het grafeem `x` kent de meest complexe logica en valt terug op de contextuele heuristieken van het Portugees waar de Barranquenho-conventie zwijgt.

In de praktijk:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ũ ẽjoɾmj pasu paɾɐ u bɐrɐ͂keɲu j paɾɐ ɐ kultuɾɐ bɐrɐ͂keɲɐ`

De bibliotheek is één enkele functie, `phonemize(word: str) -> list[str]`, zonder runtime-afhankelijkheden — puur Python. De bron-PDF's (conventie, woordenboek, grammatica) zijn opgenomen in de hoofdmap van de repository, zodat de regels controleerbaar zijn aan de hand van hun bron.

### Wat er hierna komt

Een G2P-omzetter is de minimale voorwaarde voor werk aan TTS en ASR. Zonder deze omzetter heeft een op tekst getraind model geen principiële fonetische grondslag. Met deze omzetter volgt het pad naar een Barranquenho-stemmodel dezelfde hybride pijplijn die wij gebruikten voor het Asturisch en het Aragonees — de belemmering is de spraakdata, niet het gereedschap.

**Als u opnames van gesproken Barranquenho hebt of toegang tot sprekers die onder een open licentie willen bijdragen, neem dan contact op.** Opnames van moedertaalsprekers, zelfs enkele uren, zouden een TTS-model haalbaar maken.

→ [g2p_barranquenho op GitHub](https://github.com/TigreGotico/g2p_barranquenho)
