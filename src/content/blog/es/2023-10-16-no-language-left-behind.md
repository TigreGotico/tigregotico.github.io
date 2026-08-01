---
title: "Ninguna Lengua Dejada Atrás"
description: "Eliminar las barreras lingüísticas en OpenVoiceOS mediante la detección de idioma, los plugins de traducción y las capacidades de traducción bidireccional."
date: 2023-10-16
lang: es
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

> Esta publicación se publicó originalmente en mi blog personal (hoy desaparecido)

OpenVoiceOS (OVOS) es una plataforma de asistente de voz de código abierto e impulsada por la comunidad. Esta publicación cubre los plugins de detección de idioma, traducción y traducción bidireccional que construí para permitir que OVOS funcione en idiomas mucho más allá de los que las skills instaladas admiten de forma nativa.


## Detección de Idioma a partir del Audio

OVOS identifica el idioma hablado en el audio antes de que llegue a la etapa de transcripción de ASR, permitiendo que el plugin de ASR transcriba con exactitud en lugar de adivinar. Construí varios plugins para esto:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

La detección de idioma está limitada a los idiomas listados en tu configuración de OVOS — las clasificaciones fuera de ese conjunto se rechazan, para que no cambies accidentalmente a un idioma que nadie en tu casa habla.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### Configuración

El tamaño del modelo clasificador de idioma de FasterWhisper es configurable:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## Traducción de Idioma de Texto

[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) es el modelo de código abierto de Meta para la traducción directa de alta calidad entre 200 idiomas — incluyendo idiomas de pocos recursos como el asturiano, el luganda y el urdu. Fue ese nombre el que inspiró esta publicación.

El [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) ejecuta NLLB localmente dentro de OVOS. Las skills tardan en obtener soporte nativo completo de idioma, pero con este plugin los usuarios ya no necesitan esperar — OVOS traduce los enunciados entrantes y las respuestas salientes en tiempo real, para que cualquier skill funcione en cualquiera de esos 200 idiomas.

Para hardware de menor potencia, el [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) delega la traducción a un servidor remoto. Hay servidores públicos listados de serie; el alojamiento propio se recomienda encarecidamente por motivos de privacidad. **Usar un servidor público significa confiar todos tus enunciados a su operador.**

Plugins de traducción destacados:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### Configuración

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## El Plugin de Traducción Bidireccional de OVOS

El [plugin de Traducción Bidireccional de OVOS](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) une la detección y la traducción con dos etapas de pipeline: un **Utterance Transformer** (traduce el texto entrante al idioma configurado de OVOS) y un **Dialog Transformer** (traduce la respuesta de vuelta al idioma original del usuario).

El modo opcional `verify_lang` verifica de forma cruzada el idioma detectado del texto frente al idioma de la sesión — útil en plataformas de chat donde una única instancia de OVOS sirve a usuarios multilingües. Requiere un [módulo de detección de idioma](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) configurado en `language.detection_module` y un plugin de traducción (`ovos-translate-plugin-nllb` para local o `ovos-translate-server-plugin` para remoto).

### Configuración

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

## Cómo Funciona Todo en Conjunto

Cada componente es útil de forma independiente, pero se componen de forma limpia:

1. **Detección de idioma del audio** — indica al plugin de ASR qué idioma transcribir.
2. **Traducción del enunciado** — convierte los enunciados no nativos al idioma configurado del asistente antes de la correspondencia de skills.
3. **Traducción del diálogo** — traduce la respuesta del asistente de vuelta al idioma del usuario antes del TTS.

El resultado: OVOS puede procesar cualquiera de los 200 idiomas de NLLB de principio a fin, sin que las propias skills necesiten traducciones.

Las contribuciones y traducciones de skills son bienvenidas en [OpenVoiceOS en GitHub](https://github.com/OpenVoiceOS).
