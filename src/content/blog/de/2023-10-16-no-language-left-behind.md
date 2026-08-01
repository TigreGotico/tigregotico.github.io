---
title: "Keine Sprache zurücklassen"
description: "Beseitigung von Sprachbarrieren in OpenVoiceOS durch Spracherkennung, Übersetzungs-Plugins und bidirektionale Übersetzungsfunktionen."
date: 2023-10-16
lang: de
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> Dieser Beitrag wurde ursprünglich in meinem (mittlerweile eingestellten) persönlichen Blog veröffentlicht

OpenVoiceOS (OVOS) ist eine gemeinschaftsgetriebene, quelloffene Sprachassistenten-Plattform. Dieser Beitrag behandelt die Plugins für Spracherkennung, Übersetzung und bidirektionale Übersetzung, die ich entwickelt habe, damit OVOS in Sprachen funktioniert, die weit über das hinausgehen, was die installierten Skills nativ unterstützen.


## Spracherkennung aus Audio

OVOS erkennt die im Audio gesprochene Sprache, bevor diese den ASR-Transkriptionsschritt erreicht, sodass das ASR-Plugin präzise transkribieren kann, statt zu raten. Ich habe dafür mehrere Plugins entwickelt:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

Die Spracherkennung ist auf die in Ihrer OVOS-Konfiguration aufgeführten Sprachen beschränkt — Klassifizierungen außerhalb dieser Menge werden abgelehnt, damit Sie nicht versehentlich in eine Sprache wechseln, die niemand in Ihrem Haushalt spricht.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### Konfiguration

Die Modellgröße des Sprachklassifikators von FasterWhisper ist konfigurierbar:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## Textübersetzung

[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) ist Metas quelloffenes Modell für hochwertige direkte Übersetzung zwischen 200 Sprachen — einschließlich ressourcenarmer Sprachen wie Asturisch, Luganda und Urdu. Dieser Name hat diesen Beitrag inspiriert.

Das [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) führt NLLB lokal innerhalb von OVOS aus. Skills gewinnen nur langsam vollständige native Sprachunterstützung, aber mit diesem Plugin müssen Nutzer nicht mehr warten — OVOS übersetzt eingehende Äußerungen und ausgehende Antworten in Echtzeit, sodass jeder Skill in jeder dieser 200 Sprachen funktioniert.

Für leistungsschwächere Hardware lagert das [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) die Übersetzung an einen entfernten Server aus. Öffentliche Server sind von Haus aus aufgeführt; aus Datenschutzgründen wird das Selbst-Hosting dringend empfohlen. **Die Nutzung eines öffentlichen Servers bedeutet, dass Sie dessen Betreiber all Ihre Äußerungen anvertrauen.**

Bemerkenswerte Übersetzungs-Plugins:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### Konfiguration

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## Das bidirektionale Übersetzungs-Plugin von OVOS

Das [bidirektionale Übersetzungs-Plugin von OVOS](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) verbindet Erkennung und Übersetzung mit zwei Pipeline-Stufen: einem **Utterance Transformer** (übersetzt eingehenden Text in die konfigurierte Sprache von OVOS) und einem **Dialog Transformer** (übersetzt die Antwort zurück in die ursprüngliche Sprache des Nutzers).

Der optionale Modus `verify_lang` gleicht die erkannte Textsprache mit der Sitzungssprache ab — nützlich auf Chat-Plattformen, auf denen eine einzige OVOS-Instanz mehrsprachige Nutzer bedient. Erfordert ein in `language.detection_module` konfiguriertes [Spracherkennungsmodul](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) und ein Übersetzungs-Plugin (`ovos-translate-plugin-nllb` für lokal oder `ovos-translate-server-plugin` für entfernt).

### Konfiguration

```json
"utterance_transformers": {
    "ovos-utterance-translation-plugin": {
        "bidirectional": true,
        "verify_lang": false,
        "ignore_invalid_langs": true,
        "translate_secondary_langs": true
    }
},
"dialog_transformers": {
    "ovos-dialog-translation-plugin": {}
}
```

## Wie alles zusammenwirkt

Jede Komponente ist für sich nützlich, aber sie lassen sich sauber kombinieren:

1. **Audio-Spracherkennung** — teilt dem ASR-Plugin mit, welche Sprache es transkribieren soll.
2. **Äußerungsübersetzung** — wandelt nicht-native Äußerungen vor dem Skill-Abgleich in die konfigurierte Sprache des Assistenten um.
3. **Dialogübersetzung** — übersetzt die Antwort des Assistenten vor der TTS zurück in die Sprache des Nutzers.

Das Ergebnis: OVOS kann jede der 200 Sprachen von NLLB durchgängig verarbeiten, ohne dass die Skills selbst Übersetzungen benötigen.

Beiträge und Skill-Übersetzungen sind bei [OpenVoiceOS auf GitHub](https://github.com/OpenVoiceOS) willkommen.
