---
title: "不让任何语言掉队"
description: "通过语言检测、翻译插件和双向翻译能力，消除 OpenVoiceOS 中的语言障碍。"
date: 2023-10-16
lang: zh
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

> 本文最初发表于我（现已关闭的）个人博客

OpenVoiceOS（OVOS）是一个由社区驱动的开源语音助手平台。本文介绍我构建的语言检测、翻译和双向翻译插件，它们让 OVOS 能够在远超已安装 skill 原生支持范围的语言中工作。


## 从音频进行语言检测

OVOS 会在音频进入 ASR 转写步骤之前先识别出所说的语言，从而让 ASR 插件能够准确地转写，而不是靠猜测。我为此构建了多个插件：

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

语言检测被限制在你的 OVOS 配置中所列的语言范围内——超出该集合的分类会被拒绝，这样你就不会意外切换到家里没人会说的语言。

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### 配置

FasterWhisper 的语言分类器模型大小是可配置的：

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## 文本语言翻译

[No Language Left Behind（NLLB）](https://ai.meta.com/research/no-language-left-behind/)是 Meta 的开源模型，可在 200 种语言之间进行高质量的直接翻译——包括阿斯图里亚斯语、卢干达语和乌尔都语等低资源语言。正是这个名字启发了本文。

[ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) 在 OVOS 内部本地运行 NLLB。Skill 获得完整的原生语言支持进展缓慢，但有了这个插件，用户不再需要等待——OVOS 会实时翻译传入的话语和传出的响应，因此任何 skill 都能在这 200 种语言中的任意一种下工作。

对于性能较低的硬件，[ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) 会将翻译工作转移到远程服务器。开箱即用地列出了一些公共服务器；出于隐私考虑，强烈建议自行托管。**使用公共服务器意味着你要把所有话语都托付给其运营者。**

值得关注的翻译插件：
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### 配置

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## OVOS 双向翻译插件

[OVOS 双向翻译插件](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev)用两个流水线阶段将检测与翻译连接起来：一个 **Utterance Transformer**（将传入的文本翻译成 OVOS 所配置的语言）和一个 **Dialog Transformer**（将响应翻译回用户的原始语言）。

可选的 `verify_lang` 模式会将检测到的文本语言与会话语言进行交叉核对——这在单个 OVOS 实例服务于多语言用户的聊天平台上很有用。它需要在 `language.detection_module` 中配置一个[语言检测模块](https://openvoiceos.github.io/ovos-technical-manual/lang_support/)，以及一个翻译插件（本地用 `ovos-translate-plugin-nllb`，远程用 `ovos-translate-server-plugin`）。

### 配置

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

## 它们如何协同工作

每个组件都能独立发挥作用，但它们能够干净地组合起来：

1. **音频语言检测** —— 告诉 ASR 插件要转写哪种语言。
2. **话语翻译** —— 在 skill 匹配之前，将非原生话语转换为助手所配置的语言。
3. **对话翻译** —— 在 TTS 之前，将助手的响应翻译回用户的语言。

结果就是：OVOS 能够端到端地处理 NLLB 的 200 种语言中的任意一种，而无需 skill 本身提供翻译。

欢迎在 [OpenVoiceOS 的 GitHub](https://github.com/OpenVoiceOS) 上贡献代码和 skill 翻译。
