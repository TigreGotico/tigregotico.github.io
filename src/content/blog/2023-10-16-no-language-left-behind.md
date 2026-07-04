---
title: "No Language Left Behind"
description: "Eliminating language barriers in OpenVoiceOS through language detection, translation plugins, and bidirectional translation capabilities."
date: 2023-10-16
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> This post was originally posted in my (now defunct) personal blog

OpenVoiceOS (OVOS) is a community-driven, open-source voice assistant platform. This post covers the language detection, translation, and bidirectional translation plugins I built to let OVOS work in languages far beyond whatever the installed skills natively support.


## Language Detection from Audio

OVOS identifies the language spoken in audio before it hits the ASR transcription step, letting the ASR plugin transcribe accurately rather than guessing. I built several plugins for this:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

Language detection is constrained to the languages listed in your OVOS config — classifications outside that set are rejected, so you don't accidentally switch to a language nobody in your household speaks.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### Configuration

FasterWhisper's language classifier model size is configurable:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## Text Language Translation

[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) is Meta's open-source model for high-quality direct translation between 200 languages — including low-resource languages like Asturian, Luganda, and Urdu. That name inspired this post.

The [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) runs NLLB locally inside OVOS. Skills are slow to gain full native-language support, but with this plugin users no longer need to wait — OVOS translates incoming utterances and outgoing responses on the fly, so any skill works in any of those 200 languages.

For lower-powered hardware, [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) offloads translation to a remote server. Public servers are listed out of the box; self-hosting is strongly recommended for privacy. **Using a public server means trusting its operator with all your utterances.**

Translation plugins of note:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### Configuration

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## The OVOS Bidirectional Translation Plugin

The [OVOS Bidirectional Translation plugin](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) ties detection and translation together with two pipeline stages: an **Utterance Transformer** (translates incoming text into OVOS's configured language) and a **Dialog Transformer** (translates the response back into the user's original language).

Optional `verify_lang` mode cross-checks the detected text language against the session language — useful on chat platforms where a single OVOS instance serves multilingual users. Requires a [language detection module](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) configured in `language.detection_module` and a translation plugin (`ovos-translate-plugin-nllb` for local or `ovos-translate-server-plugin` for remote).

### Configuration

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

## How It Works Together

Each component is independently useful, but they compose cleanly:

1. **Audio language detection** — tells the ASR plugin which language to transcribe.
2. **Utterance translation** — converts non-native utterances into the assistant's configured language before skill matching.
3. **Dialog translation** — translates the assistant's response back to the user's language before TTS.

The result: OVOS can process any of NLLB's 200 languages end-to-end, without the skills themselves needing translations.

Contributions and skill translations are welcome at [OpenVoiceOS on GitHub](https://github.com/OpenVoiceOS).
