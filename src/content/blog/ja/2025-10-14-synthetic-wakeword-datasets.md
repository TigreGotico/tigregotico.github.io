---
title: "合成ウェイクワードデータセット: 7 つのアシスタント名、1 つの検出器"
description: "一般的な音声アシスタント名（hey_computer、hey_mycroft、hey_siri、alexa、home_assistant、voice_assistant、wake_up）向けに 7 つの合成ウェイクワードデータセットを公開しました。どこでも動作する検出器を学習しましょう。"
date: 2025-10-14
lang: ja
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

7 つのアシスタント名。7 つのデータセット。すべての音声は、Miro と Dii の音声を用いて **[phoonnx](https://github.com/TigreGotico/phoonnx)** TTS フレームワークから完全に生成されたものです。人間による収録も、同意書も、プライバシーの露出もありません。

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

各データセットは、およそ 1,000 個のポジティブクリップからなるフラットな集合です。すなわち、さまざまな話者、話速、韻律で発話されたウェイクワードです。ハードネガティブと背景ノイズは、学習時に混合する別の付随データセットとして提供されます。[not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en)、[not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt)、[ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises) です。

## なぜ合成なのか

実際の録音には数か月の収集期間が必要で、話者ごとに同意書が要り、それでも予期しないアクセントのギャップが残ります。合成生成はこれを逆転させます。

- **再現可能**: 同じ生成設定、同じ音声 → 同じ音声。完全な監査証跡があり、同意書の発掘作業は不要です。
- **監査可能**: 生成パイプラインそのものがドキュメントとなります。
- **スケーラブル**: 話速や話者の特性を変えることは、スタジオセッションではなくパラメータの変更にすぎません。

ウェイクワード検出において重要な性質は、自然さではなく音響的な識別性です。合成データはその要件によく適合します。

## これらを使う

OpenVoiceOS、Mycroft、あるいは任意のオープンな音声システム向けに、独自のウェイクワード検出器を学習しましょう。ネガティブサンプルの拡張用には、家庭内やパブリックドメインの背景クリップデータセットもあります。[building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs)、[public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs)、[FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs) です。

[**HuggingFace 上のすべてのウェイクワードデータセット → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
