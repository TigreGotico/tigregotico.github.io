---
title: "面向 350+ 种语言的字素到 IPA 转换"
description: "orthography2ipa 是一个纯数据、以语言学为根基的资源，它将拼写映射到 IPA，并在 350+ 个语言代码和 20+ 个语系上建模音素如何以音位变体的形式在语境中显现。它包含一个最大匹配（maximal-munch）分词器、音系与文字距离度量、方言谱系，以及一套经模式校验的规范集——没有训练权重，完全可自托管。"
date: 2026-01-15
lang: zh
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** 是一个纯数据的 Python 包——声明式 JSON、轻薄可插拔的逻辑、没有训练权重——它将拼写映射到 IPA，并在 **394 个语言规范和 20+ 个语系** 上建模这些音素如何在语境中显现。安装它、读取数据、fork 数据。没有任何东西藏在检查点里。

它驱动着下游的一切：葡萄牙语专用的 [silabificador](https://github.com/TigreGotico/silabificador) 和 [TugaPhone](https://github.com/TigreGotico/tugaphone) 技术栈（见 **[面向葡萄牙语音节与音素的经典 NLP](/zh/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**）、Barranquenho 的 G2P，以及 **[能在土豆上运行的 TTS](/zh/blog/2026-05-10-tts-that-runs-on-a-potato)** 的音素基础。

## 两张映射，而非一张

关键区别在于：**字素映射（grapheme map）** 告诉你某个拼写*可能*表示哪些音素。**音位变体映射（allophone map）** 告诉你某个音素在语境中如何*显现*。将两者混为一谈，是 G2P 系统中最常见的失败模式。

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

英语的 ⟨th⟩ 在 /θ/ 和 /ð/ 之间确实存在歧义——这是一个拼写到音素的事实。英语的 /t/ 会根据它所处的位置而表现为一个普通塞音、一个送气塞音、一个喉塞音或一个闪音——这是一个音素到显现的事实。将两者分开意味着你可以为转写走*文本 → 候选音素*的路径，为发音建模走*音素 → 表层显现*的路径，而不会让其中一方污染另一方。对 TTS 而言，这是可信口音与机械口音之间的差别；对 ASR 而言，这是一部匹配人们实际发音的词典与一部只匹配字典的词典之间的差别。

## 每种语言携带的内容

每种语言都是一个冻结的 `LanguageSpec` 数据类，它携带的远不止一份音素列表：字素（包括二合字母和三合字母）、一张音位变体映射、用于语境敏感覆盖（词首、元音间、/i/ 之前）的 **位置字素（positional graphemes）**、带权重的多祖先 **谱系（ancestry）**、跨词的 **连音规则（sandhi rules）**、一份可选的 **声调库存（tone inventory）**，以及来源信息——一个沿 `stub → skeleton → research → production` 递进的 `QualityTier`、一个 `ScriptType`（字母文字、辅音音素文字、元音附标文字，……），以及参考文献来源。

纳入规则严格，值得直白地说明：**只有以官方正字法和有据可查的语法为根基的映射才会被纳入。任意的子串规则被排除在外。** 葡萄牙语的 ⟨lh⟩、德语的 ⟨sch⟩ 和英语的 ⟨th⟩ 被纳入，是因为它们是标准的正字法单位。方便但杜撰的启发式规则则不然。当某个规范声明了字素却没有明确的音位变体映射时，会推导出一张基线恒等映射——每个音素至少是它自身的表层显现——这样就不会有任何东西悄然消失。

地区变体拥有各自独立的规范，而不是在父规范上加一个标志位。巴西葡萄牙语和欧洲葡萄牙语存在系统性分化，因此它们是通过谱系相连的、彼此不同的 `LanguageSpec` 对象：

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

方言树之所以保持可维护，是因为 JSON 文件支持 `graphemes_base` / `allophones_base` 继承：一个变体只声明它与父项不同之处。谱系是带权重且多祖先的——父语、底层语（substrate）、上层语（superstrate）、旁层语（adstrate）——这是对那些属于接触产物、而非纯粹后裔的语言进行建模的诚实方式。

## 一个承认歧义的分词器

拼写并不是一个干净的切分问题，因此该包附带了 `PhonetokTokenizer`，一个采用 **最大匹配（maximal-munch）** 的字素分词器，配有束搜索（beam-search）IPA 展开。它贪婪地优先匹配最长的正字法单位，然后在拼写存在歧义时探索排序后的候选转写：

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

与其在单一输出上下注，你得到的是一个带评分的束——这正是下游词典、词格（lattice）或发音重排序器所需要的输入。

## 度量语言之间的距离

由于数据是结构化的，而非烘焙进权重，你可以直接比较语言。距离度量涵盖库存、字素、音位变体和谱系等维度，外加一个独立的文字距离系列：

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

特征向量也被暴露出来，因此像两套葡萄牙语标准这样几乎完全相同的一对落在 0.04，而真正相距甚远的一对则清晰分离。这对迁移学习决策、低资源引导（bootstrapping）以及方言计量学（dialectometry）都同样有用。

## 命令行工具

以上所有内容无需编写 Python 即可访问。`orthography2ipa` 控制台脚本提供 `list`、`info`、`transcribe` 和 `distance`，且每个子命令都接受 `--json`，以便管道传入流水线。

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## 为什么纯数据很重要

整套规范集都经过模式校验——冻结的 pydantic 风格数据类、由一套完整性测试套件扫查的 **394 个规范**，并由 `SCHEMA.md` 记录其结构。在静态表格确实无法表达规则之处，语言专属逻辑会围绕数据插入：音节切分器通过一个入口点（entry-point）组注册，而更重的算法式 G2P（如我们的阿拉伯语分词器 [arbtok](https://github.com/TigreGotico/arbtok)，它处理太阳字母同化、hamzat al-wasl 的省略以及 tanwin 形式）则在下游基于同一套规范构建。

没有一个不透明的模型在决定你用户的语言听起来如何。映射是可审计的，来源是被引用的，而添加一种语言就是编写一个经校验的 JSON 文件。对于任何构建 TTS、ASR 或语音 NLP，并拒绝将自己的音系外包给黑箱的人——以及希望它运行在自己硬件上的人——这正是关键所在。它采用 Apache 2.0 许可，可供你检查、扩展和自托管。
