---
title: "从零开始制作合成语音"
description: "为文本转语音系统创建一个语音通常需要一个真人花费数小时来录制音频。这既昂贵又耗时，而且在许多语言或口音中，这些语音根本就不存在"
date: 2025-06-26
lang: zh
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Synthetic Data"
  - "Voice Cloning"
  - "OVOS"
draft: false
---

> 本博客最初发表于 [OpenVoiceOS 博客](https://blog.openvoiceos.org/posts/2025-06-26-making-synthetic-voices-from-scratch)

一个优秀的欧洲葡萄牙语离线 TTS 语音此前并不存在。录音棚录制昂贵，需要数月时间，而在世界上大多数语言中，这样的录音根本从未发生过。于是我们从零开始构建了四个语音——没有录音室，没有配音演员，没有云。

### 三步流水线

**1. 生成合成语音对。** 我们使用一个现有的 TTS 语音作为供体——任何能够产生可理解音频的来源——并让它在一个大型文本语料库上运行，从而生成数千个音频/文本对。供体语音不需要高质量。它只需要足够连贯，能从中学习即可。

**2. 应用语音转换。** 一个语音转换步骤会将供体的音色转换为一个新的身份——不同的性别、年龄或性格。生成的音频听起来像目标语音，而不是供体。这就是一个新个性诞生的地方。

**3. 训练一个紧凑的 VITS 模型。** 转换后的音频通过 [phoonnx_train](https://github.com/TigreGotico/phoonnx) 成为一个小型 VITS 架构模型的训练集。完成的模型被导出为 ONNX，并完全离线运行——必要时甚至能在树莓派上运行。

### 伦理护栏

如果供体是某个真人的声音，我们会先获得明确许可。当无法获得许可时，我们会使用公有领域的录音，或生成一个不复制任何人身份的完全原创语音。语音转换步骤还有一个有用的隐私特性：其输出在声学上与供体足够不同，因此冒充风险微乎其微。

### 应用于欧洲葡萄牙语

欧洲葡萄牙语此前没有高质量的开放离线语音。我们使用的正是这条流水线，制作了四个语音——包括如今成为 OVOS `pt-PT` 默认语音的 Miro 和 Dii 身份。它们能在普通硬件上流畅运行，无需网络连接，而且训练数据已[公开发布](https://huggingface.co/TigreGotico)，因此任何人都可以复现或扩展它们。

所有模型和数据集都存放在 [huggingface.co/OpenVoiceOS](https://huggingface.co/OpenVoiceOS) 和 [huggingface.co/TigreGotico](https://huggingface.co/TigreGotico)。
