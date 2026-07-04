---
title: "合成唤醒词数据集：七个助手名字，一个检测器"
description: "我们为常见的语音助手名字发布了七个合成唤醒词数据集——hey_computer、hey_mycroft、hey_siri、alexa、home_assistant、voice_assistant、wake_up。训练一个到处都能用的检测器。"
date: 2025-10-14
lang: zh
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

七个助手名字。七个数据集。所有音频都完全由 **[phoonnx](https://github.com/TigreGotico/phoonnx)** TTS 框架使用 Miro 和 Dii 语音生成——没有真人录音，没有同意书，没有隐私暴露。

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

每个数据集都是大约一千个正样本片段的扁平集合——由不同的说话人、语速和韵律说出的唤醒词。困难负样本和背景噪声则作为独立的配套数据集提供，你可以在训练时混入：[not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en)、[not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt) 和 [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises)。

## 为什么用合成数据

真实录音需要数月的采集、每位说话人的同意书，而且仍会留下你未曾预料的口音空缺。合成生成则颠倒了这一切：

- **可复现**：相同的生成设置、相同的语音 → 相同的音频。完整的审计追踪，无需考证同意书。
- **可审计**：生成流水线本身就是文档。
- **可扩展**：改变语速和说话人特征只是一个参数变更，而不是一次录音棚录制。

对于唤醒词检测，相关的属性是声学上的可辨识度，而不是自然度。合成数据非常契合这一要求。

## 用起来

为 OpenVoiceOS、Mycroft 或任何开放的语音系统训练你自己的唤醒词检测器。对于负样本增强，还有一些家居和公有领域的背景片段数据集：[building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs)、[public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs) 和 [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs)。

[**HuggingFace 上的全部唤醒词数据集 → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
