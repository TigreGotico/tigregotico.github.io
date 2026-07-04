---
title: "Geen Taal Achtergelaten"
description: "Taalbarrières in OpenVoiceOS wegnemen via taaldetectie, vertaalplugins en bidirectionele vertaalmogelijkheden."
date: 2023-10-16
lang: nl
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> Dit artikel werd oorspronkelijk gepubliceerd op mijn (inmiddels opgeheven) persoonlijke blog

OpenVoiceOS (OVOS) is een door de gemeenschap gedreven, opensource spraakassistentplatform. Dit artikel behandelt de plugins voor taaldetectie, vertaling en bidirectionele vertaling die ik heb gebouwd om OVOS te laten werken in talen die veel verder reiken dan wat de geïnstalleerde skills native ondersteunen.


## Taaldetectie op basis van audio

OVOS identificeert de taal die in de audio wordt gesproken voordat deze bij de STT-transcriptiestap aankomt, zodat de STT-plugin nauwkeurig kan transcriberen in plaats van te gokken. Ik heb hiervoor verschillende plugins gebouwd:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

Taaldetectie is beperkt tot de talen die in uw OVOS-configuratie zijn opgenomen — classificaties buiten die set worden geweigerd, zodat u niet per ongeluk overschakelt naar een taal die niemand in uw huishouden spreekt.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### Configuratie

De modelgrootte van de taalclassificator van FasterWhisper is configureerbaar:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## Tekstvertaling van talen

[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) is Meta's opensourcemodel voor directe vertaling van hoge kwaliteit tussen 200 talen — inclusief talen met weinig hulpbronnen zoals het Asturisch, Luganda en Urdu. Die naam inspireerde dit artikel.

De [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) voert NLLB lokaal uit binnen OVOS. Skills zijn traag om volledige native taalondersteuning te verwerven, maar met deze plugin hoeven gebruikers niet langer te wachten — OVOS vertaalt inkomende uitingen en uitgaande antwoorden in realtime, zodat elke skill werkt in elk van die 200 talen.

Voor hardware met minder vermogen delegeert de [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) de vertaling naar een externe server. Publieke servers zijn standaard opgenomen; zelf hosten wordt sterk aanbevolen voor de privacy. **Een publieke server gebruiken betekent dat u de beheerder ervan al uw uitingen toevertrouwt.**

Noemenswaardige vertaalplugins:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### Configuratie

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## De OVOS-plugin voor bidirectionele vertaling

De [OVOS-plugin voor bidirectionele vertaling](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) verbindt detectie en vertaling met twee pipeline-stappen: een **Utterance Transformer** (vertaalt inkomende tekst naar de geconfigureerde taal van OVOS) en een **Dialog Transformer** (vertaalt het antwoord terug naar de oorspronkelijke taal van de gebruiker).

De optionele modus `verify_lang` controleert de gedetecteerde taal van de tekst kruislings tegen de taal van de sessie — nuttig op chatplatforms waar één enkele OVOS-instantie meertalige gebruikers bedient. Vereist een [taaldetectiemodule](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) geconfigureerd in `language.detection_module` en een vertaalplugin (`ovos-translate-plugin-nllb` voor lokaal of `ovos-translate-server-plugin` voor extern).

### Configuratie

```json
"utterance_transformers": {
    "ovos-utterance-translation-plugin": {
        "bidirectional": true,
        "verify_lang": false,
        "ignore_invalid": true,
        "translate_secondary_langs": true
    }
},
"dialog_transformers": {
    "ovos-dialog-translation-plugin": {}
}
```

## Hoe alles samenwerkt

Elke component is op zichzelf nuttig, maar ze laten zich schoon samenstellen:

1. **Audiotaaldetectie** — vertelt de STT-plugin welke taal te transcriberen.
2. **Uitingsvertaling** — zet niet-native uitingen om naar de geconfigureerde taal van de assistent vóór de skill-matching.
3. **Dialoogvertaling** — vertaalt het antwoord van de assistent terug naar de taal van de gebruiker vóór de TTS.

Het resultaat: OVOS kan elk van de 200 talen van NLLB van begin tot eind verwerken, zonder dat de skills zelf vertalingen nodig hebben.

Bijdragen en skill-vertalingen zijn welkom bij [OpenVoiceOS op GitHub](https://github.com/OpenVoiceOS).
