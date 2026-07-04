---
title: "能在土豆上运行的 TTS 模型"
description: "phoonnx 是一个基于 VITS 的文本转语音研究框架，专为在低端硬件上舒适运行而打造。不需要 GPU，不需要云，不需要 API 密钥——只需一个约 1565 万参数的 ONNX 声音和一颗 CPU。这里将展示一个优秀的声音可以有多小，以及我们如何训练它们。"
date: 2026-05-10
lang: zh
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "ONNX"
  - "VITS"
  - "self-hosted"
  - "OVOS"
draft: false
---

有一个顽固的迷思，认为好的文本转语音需要一块强悍的 GPU、一张厚厚的云账单，以及一个绑着你信用卡的 API 密钥。其实并非如此。一个自然、多语言的声音，可以塞进一个你都不好意思称之为服务器的东西里——就是那种你"以防万一"塞在抽屉里的板子。一颗土豆。

[**phoonnx**](https://github.com/TigreGotico/phoonnx) 正是我们面向这一目标的研究框架：小巧的、基于 VITS 的声音，**完全离线、在 CPU 上、在廉价硬件上运行**，并且我们还能 *亲手从零训练* 它们。

## 到底有多小？

我们不空谈，给它标个实实在在的数字。我们把一个生产用的 phoonnx 声音——巴斯克语的 "Miro" 声音（`OpenVoiceOS/phoonnx_eu-ES_miro_espeak`）——直接从 Hugging Face 上取下来，数了数 ONNX 图里的权重：

```python
import onnx, numpy as np
m = onnx.load("miro_eu-ES.onnx")
print(sum(int(np.prod(i.dims)) for i in m.graph.initializer))
# 15650459
```

**约 1565 万参数。** 这就是整个声音——编码器、解码器、全部——装在一个 63 MB 的文件里。同一发行版中的女声 "Dii" 数出来是 *完全相同* 的数字，因为它们共享标准的 phoonnx VITS 架构；个性存在于权重之中，而非额外的容量里。

作个对比：一个"小型"现代语言模型的单个层，携带的参数就可能比这整个语音合成器还多。一千五百五十万，大约相当于一张手机快照的重量，而它却能流利地说话。

## 为什么选 VITS，为什么选 ONNX

[VITS](https://arxiv.org/abs/2106.06103) 是每一个 phoonnx 声音的骨架。它是一个端到端架构——文本（好吧，是音素）进，波形出——没有需要单独照看的声码器，也没有一次只爬一个采样点的自回归循环。正是这种端到端设计，让它在土豆上变得可行：一次前向传递，并行合成，完事。

我们不会把 PyTorch 部署到边缘。训练好的声音会被导出为 **ONNX**，并通过 [`onnxruntime`](https://onnxruntime.ai/) 在 **CPU** 上运行——不需要 CUDA，不需要 GPU，也不用为驱动碰运气。`onnxruntime` 是一个紧凑、可移植的 C++ 引擎，而一个一千五百万参数的图，完全在树莓派级别的核心能以快于实时的速度消化的范围之内。结果是一个语音助手，在你的网络断掉时、在云服务商发生故障时、或者在你一开始就压根不想让家中音频离开屋子时，都能继续说话。**在这里，数据主权不是一个功能开关；它就是架构本身。**

## 智慧藏在音素里

一个微小的声学模型之所以能承受得起自身的微小，是因为 phoonnx 把繁重的语言学工作 *提前* 做了，就在音素化器里。一个音素化器（字素转音素，即 G2P）把书面文本转换成模型实际发出的声音单元序列——这样 VITS 网络就永远不必学习拼写，只需学习声音。

我们的音素工作植根于 **[350 多种语言的字素转 IPA](/zh/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** 以及 **[经典葡萄牙语语音学](/zh/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**，它们使得为低资源语言训练声音成为可能，而无需数周的专家标注。

phoonnx 刻意做到与音素化器无关，并捆绑了一小支它们组成的军队：`espeak-ng`、[gruut](https://github.com/rhasspy/gruut)、[epitran](https://github.com/dmort27/epitran)、[misaki](https://github.com/hexgrad/misaki)、[transphone](https://github.com/xinjli/transphone)（它触及 Glottolog 编目的数千种语言），外加一些专家工具，例如面向阿拉伯语的 [mantoq](https://github.com/mush42/mantoq)、面向加利西亚语的 **[cotovia](https://github.com/TigreGotico/pycotovia)**、面向日语的 OpenJTalk，以及面向韩语的 KoG2P。它们输出 IPA、ARPA、拼音、谚文、Buckwalter——语言需要什么就输出什么。甚至还有一个基于模型的多语言 G2P，构建在 ByT5 之上，像其他一切一样导出为 ONNX。

把正字法卸载给音素化器，正是让一个一千五百万参数的模型在一种它从未见过书面形式的低资源语言中也能发音优美的窍门。

## 一个用来*构建*声音的框架，而不只是运行它们

这是最重要、也最常被忽视的部分：phoonnx 不只是一个推理工具包。配套框架 [**`phoonnx_train`**](https://github.com/TigreGotico/phoonnx) 才是我们最初 *制造* 这些声音的方式。

`phoonnx_train` 覆盖完整的流程：

- **预处理**，把一个 LJSpeech 风格的数据集变成音素化的训练数据。
- **训练** VITS 生成器（那约 1565 万参数），只需不多的 GPU 时间——这些是小模型，因此相较于大型语音系统，训练既便宜又快。
- **导出** 完成的检查点为 ONNX，只需一个脚本，随时可直接投入设备上的 `onnxruntime`。

因为配方是开放的、模型是小的，为一种 *没有任何* 开放离线选项的语言构建一个全新的声音，是一个周末规模的项目，而非一个研究经费规模的项目。这就是我们一直以来填补服务不足语言空白的方式——巴斯克语、米兰德语、欧洲葡萄牙语等等——而不是坐等某个供应商决定某种语言在商业上值得一做。

## 已经连进你的助手里

你不必手工把这一切粘合起来。phoonnx 附带一个原生的 OpenVoiceOS 插件 `ovos-tts-plugin-phoonnx`，它会为你获取并加载声音：

```json
"tts": {
  "module": "ovos-tts-plugin-phoonnx",
  "ovos-tts-plugin-phoonnx": {
    "voice": "OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone"
  }
}
```

留空 `voice`，它就会挑选第一个匹配你语言的模型。至于在助手之外管理声音，有一个 CLI `phoonnx-voices`，可用来列出语言、浏览声音并预下载模型：

```bash
phoonnx-voices list-voices --lang pt-PT
phoonnx-voices download OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone
```

而且，因为 phoonnx 说的是纯粹的 VITS-over-ONNX，它的推理引擎也能运行由 Piper、Mimic3、Coqui 和 MMS 训练的声音——总共 **一千多种语言和声音**。一个小巧的运行时，一个庞大的目录，且没有任何一部分会向外回传。

## 要点所在

尊重你的语音技术，必须运行在 *你所在之处*——在你的硬件上，由你掌控，如果你愿意的话甚至可以拔掉网线。phoonnx 是我们的赌注：通往那里的路不是更大的模型，而是把正确的架构做小：用 VITS 作骨架，用聪明的音素化器承担语言学负担，用 ONNX 实现可移植性，再加上一个开放的训练框架，让任何人都能壮大这个目录。

一千五百五十万参数。没有 GPU。没有云。没有借口。如果它能在土豆上运行，它就能在任何地方运行。
