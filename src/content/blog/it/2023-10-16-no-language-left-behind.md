---
title: "Nessuna Lingua Lasciata Indietro"
description: "Eliminare le barriere linguistiche in OpenVoiceOS tramite rilevamento della lingua, plugin di traduzione e capacità di traduzione bidirezionale."
date: 2023-10-16
lang: it
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> Questo articolo è stato originariamente pubblicato sul mio blog personale (oggi non più esistente)

OpenVoiceOS (OVOS) è una piattaforma di assistente vocale open source e guidata dalla comunità. Questo articolo tratta i plugin di rilevamento della lingua, di traduzione e di traduzione bidirezionale che ho costruito per permettere a OVOS di funzionare in lingue ben oltre quelle supportate nativamente dalle skill installate.


## Rilevamento della Lingua dall'Audio

OVOS identifica la lingua parlata nell'audio prima che questo raggiunga la fase di trascrizione ASR, consentendo al plugin ASR di trascrivere con precisione anziché tirare a indovinare. Ho costruito diversi plugin per questo:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

Il rilevamento della lingua è limitato alle lingue elencate nella configurazione di OVOS — le classificazioni al di fuori di quell'insieme vengono rifiutate, così da non passare accidentalmente a una lingua che nessuno in casa parla.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### Configurazione

La dimensione del modello classificatore di lingua di FasterWhisper è configurabile:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## Traduzione della Lingua del Testo

[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) è il modello open source di Meta per la traduzione diretta di alta qualità tra 200 lingue — incluse lingue a scarse risorse come l'asturiano, il luganda e l'urdu. È stato quel nome a ispirare questo articolo.

Il [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) esegue NLLB localmente all'interno di OVOS. Le skill sono lente ad acquisire il pieno supporto nativo della lingua, ma con questo plugin gli utenti non devono più aspettare — OVOS traduce al volo gli enunciati in ingresso e le risposte in uscita, così che qualsiasi skill funzioni in una qualunque di quelle 200 lingue.

Per hardware meno potente, il [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) delega la traduzione a un server remoto. Sono elencati server pubblici già di default; l'auto-hosting è fortemente raccomandato per ragioni di privacy. **Usare un server pubblico significa affidare tutti i propri enunciati al suo operatore.**

Plugin di traduzione degni di nota:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### Configurazione

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## Il Plugin di Traduzione Bidirezionale di OVOS

Il [plugin di Traduzione Bidirezionale di OVOS](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) collega rilevamento e traduzione con due fasi di pipeline: un **Utterance Transformer** (traduce il testo in ingresso nella lingua configurata di OVOS) e un **Dialog Transformer** (traduce la risposta di nuovo nella lingua originale dell'utente).

La modalità opzionale `verify_lang` verifica in modo incrociato la lingua rilevata del testo rispetto alla lingua della sessione — utile su piattaforme di chat dove una singola istanza di OVOS serve utenti multilingue. Richiede un [modulo di rilevamento della lingua](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) configurato in `language.detection_module` e un plugin di traduzione (`ovos-translate-plugin-nllb` per il locale o `ovos-translate-server-plugin` per il remoto).

### Configurazione

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

## Come Tutto Funziona Insieme

Ogni componente è utile in modo indipendente, ma si compongono in maniera pulita:

1. **Rilevamento della lingua dall'audio** — indica al plugin ASR quale lingua trascrivere.
2. **Traduzione dell'enunciato** — converte gli enunciati non nativi nella lingua configurata dell'assistente prima della corrispondenza con le skill.
3. **Traduzione del dialogo** — traduce la risposta dell'assistente di nuovo nella lingua dell'utente prima del TTS.

Il risultato: OVOS può elaborare una qualunque delle 200 lingue di NLLB da un capo all'altro, senza che le skill stesse necessitino di traduzioni.

Contributi e traduzioni di skill sono benvenuti su [OpenVoiceOS su GitHub](https://github.com/OpenVoiceOS).
