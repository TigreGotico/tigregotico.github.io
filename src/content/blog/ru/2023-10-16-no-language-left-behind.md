---
title: "Ни одного языка без внимания"
description: "Устранение языковых барьеров в OpenVoiceOS с помощью определения языка, плагинов перевода и возможностей двунаправленного перевода."
date: 2023-10-16
lang: ru
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> Эта статья была первоначально опубликована в моём (ныне закрытом) личном блоге

OpenVoiceOS (OVOS) — это управляемая сообществом платформа голосового ассистента с открытым исходным кодом. В этой статье рассматриваются плагины определения языка, перевода и двунаправленного перевода, которые я создал, чтобы OVOS мог работать на языках, далеко выходящих за пределы того, что нативно поддерживают установленные навыки.


## Определение языка по аудио

OVOS определяет язык, на котором говорят в аудио, ещё до того, как оно попадает на этап транскрипции ASR, что позволяет плагину ASR транскрибировать точно, а не гадать. Для этого я создал несколько плагинов:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

Определение языка ограничено языками, перечисленными в вашей конфигурации OVOS — классификации за пределами этого набора отклоняются, поэтому вы случайно не переключитесь на язык, на котором никто в вашем доме не говорит.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### Конфигурация

Размер модели классификатора языка FasterWhisper можно настроить:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## Перевод текста между языками

[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) — это модель Meta с открытым исходным кодом для высококачественного прямого перевода между 200 языками, включая малоресурсные языки, такие как астурийский, луганда и урду. Именно это название вдохновило данную статью.

Плагин [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) запускает NLLB локально внутри OVOS. Навыки медленно обретают полную нативную поддержку языков, но с этим плагином пользователям больше не нужно ждать — OVOS переводит входящие высказывания и исходящие ответы на лету, так что любой навык работает на любом из этих 200 языков.

Для менее мощного оборудования плагин [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) переносит перевод на удалённый сервер. Публичные серверы перечислены «из коробки»; для конфиденциальности настоятельно рекомендуется собственный хостинг. **Использование публичного сервера означает доверие всех ваших высказываний его оператору.**

Заслуживающие внимания плагины перевода:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### Конфигурация

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## Плагин двунаправленного перевода OVOS

[Плагин двунаправленного перевода OVOS](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) связывает определение и перевод двумя этапами конвейера: **Utterance Transformer** (переводит входящий текст на настроенный язык OVOS) и **Dialog Transformer** (переводит ответ обратно на исходный язык пользователя).

Необязательный режим `verify_lang` перекрёстно проверяет определённый язык текста относительно языка сессии — полезно на чат-платформах, где один экземпляр OVOS обслуживает многоязычных пользователей. Требует [модуля определения языка](https://openvoiceos.github.io/ovos-technical-manual/lang_support/), настроенного в `language.detection_module`, и плагина перевода (`ovos-translate-plugin-nllb` для локального или `ovos-translate-server-plugin` для удалённого).

### Конфигурация

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

## Как всё работает вместе

Каждый компонент полезен сам по себе, но они аккуратно объединяются:

1. **Определение языка по аудио** — сообщает плагину ASR, какой язык транскрибировать.
2. **Перевод высказывания** — преобразует ненативные высказывания на настроенный язык ассистента перед сопоставлением навыков.
3. **Перевод диалога** — переводит ответ ассистента обратно на язык пользователя перед TTS.

В результате OVOS способен обрабатывать любой из 200 языков NLLB от начала до конца без необходимости перевода самих навыков.

Вклад и переводы навыков приветствуются на [OpenVoiceOS в GitHub](https://github.com/OpenVoiceOS).
