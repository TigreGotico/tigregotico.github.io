---
title: "Синтетические датасеты слов активации: семь имён ассистентов, один детектор"
description: "Мы опубликовали семь синтетических датасетов слов активации для распространённых имён голосовых ассистентов — hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Обучите детектор, который работает везде."
date: 2025-10-14
lang: ru
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Wakewords"
  - "Speech"
  - "Synthetic"
  - "Voice"
  - "FOSS"
draft: false
---

Семь имён ассистентов. Семь датасетов. Всё аудио полностью сгенерировано фреймворком TTS **[phoonnx](https://github.com/TigreGotico/phoonnx)** с использованием голосов Miro и Dii — без человеческих записей, без форм согласия, без раскрытия конфиденциальных данных.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Каждый датасет — это плоский набор из примерно тысячи положительных клипов: слово активации, произнесённое с разными дикторами, темпами и просодией. Сложные негативные примеры и фоновый шум поставляются как отдельные сопутствующие датасеты, которые вы подмешиваете во время обучения: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en), [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt) и [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## Почему синтетика

Реальные записи требуют месяцев сбора, форм согласия для каждого диктора и всё равно оставляют пробелы по акцентам, которых вы не ожидали. Синтетическая генерация переворачивает это:

- **Воспроизводимость**: те же настройки генерации, те же голоса → то же аудио. Полный аудиторский след, без археологии форм согласия.
- **Проверяемость**: конвейер генерации и есть документация.
- **Масштабируемость**: варьирование темпа речи и характеристик диктора — это изменение параметра, а не студийная сессия.

Для детекции слова активации важное свойство — акустическая различимость, а не естественность. Синтетические данные хорошо соответствуют этому требованию.

## Используйте их

Обучите собственный детектор слова активации для OpenVoiceOS, Mycroft или любой открытой голосовой системы. Для аугментации негативными примерами также есть датасеты бытовых и общедоступных фоновых клипов: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs), [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs) и [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**Все датасеты слов активации на HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
