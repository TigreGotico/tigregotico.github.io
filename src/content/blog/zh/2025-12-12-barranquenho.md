---
title: "推出首个巴兰克诺语音素转换器"
description: "g2p_barranquenho 是首个面向巴兰克诺语的开放字素转音素转换器。巴兰克诺语是葡萄牙巴兰科斯的伊比利亚-罗曼语接触语言——其规则源自该市新近发布的正字法约定，可对照仓库中所收录的源文件进行审核。"
date: 2025-12-12
lang: zh
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) 是首个面向 [巴兰克诺语](https://en.wikipedia.org/wiki/Barranquenho) 的开放字素转音素转换器。巴兰克诺语是一种伊比利亚-罗曼语接触语言，通行于葡萄牙的巴兰科斯——这是西班牙边境上的一个市镇，几个世纪以来葡萄牙语与埃斯特雷马杜拉/安达卢西亚西班牙语在此共存。

### 巴兰克诺语在音系上的有趣之处

巴兰克诺语既不是葡萄牙语的方言，也不是西班牙语的方言；它是一个真正独立的系统。巴兰科斯市议会最近发布了三份奠基性文献——一部词典、一份正字法约定和一部基础语法——为我们提供了所需的规则。相关公告：["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha)。

我们从那份正字法约定中推导出了规则集。该音素转换器会对小写化的输入执行两轮处理：

1. **二合字母轮次** — 合并多字母字素：`tch` → /tʃ/、`ch` → /ʃ/、`nh` → /ɲ/、`lh` → /ʎ/，以及前元音之前的 `qu`/`gu` → /k//g/。
2. **字素轮次** — 用上下文敏感的规则将其余字符映射到 IPA：`m`/`n` 之前的鼻化双元音（例如 `an` → /ɐ͂/）、词尾 `e` → /ɨ/、`v` 一律 → /b/、除词首外 `s` 浊化为 /z/、`r` 与 `rr`（单闪音 vs 颤音），以及作为实际发音 /h/ 的 `h`——这与任何一种母语都不同。

字素 `x` 的逻辑最为复杂，在巴兰克诺语约定未作规定之处会回退到葡萄牙语的上下文启发式规则。

实际运行中：

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ũ ẽjoɾmj pasu paɾɐ u bɐrɐ͂keɲu j paɾɐ ɐ kultuɾɐ bɐrɐ͂keɲɐ`

这个库是单个函数 `phonemize(word: str) -> list[str]`，运行时无任何依赖——纯 Python。源 PDF 文件（约定、词典、语法）都收录在仓库根目录中，因此规则可对照其来源进行审核。

### 接下来是什么

G2P 转换器是 TTS 和 ASR 工作的最低前提。没有它，在文本上训练的模型就缺乏有原则的语音基础。有了它，通往巴兰克诺语语音模型的路径就沿用我们为阿斯图里亚斯语和阿拉贡语所采用的同一条混合流程——瓶颈在于语音数据，而非工具。

**如果你有巴兰克诺语口语的录音，或能联系到愿意在开放许可下贡献的说话人，请与我们联系。** 母语者的录音，哪怕只有几个小时，也能让 TTS 模型变得可行。

→ [GitHub 上的 g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)
