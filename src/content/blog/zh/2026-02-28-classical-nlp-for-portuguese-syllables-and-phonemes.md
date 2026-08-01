---
title: "面向葡萄牙语的经典 NLP：音节切分与字素到音素转换"
description: "介绍我们基于规则、完全离线的葡萄牙语 NLP 技术栈 —— 用于音节切分的 silabificador 和支持方言的字素到音素转换工具 TugaPhone —— 以及它们如何与面向葡语各变体的更广泛的 orthography2ipa 工作相衔接。没有深度学习黑箱：确定性、快速、依赖极少。"
date: 2026-02-28
lang: zh
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

葡萄牙语中音节在何处断开、重音落在何处，以及某种拼写如何对应到某个读音，都遵循语言学家早在有人训练神经网络之前就已写下的规则。当这些规则是明确的时候，正确的工具就是一个小巧、确定性、完全离线的库，你可以阅读它、审计它，并在任何地方运行它。这正是我们经典葡萄牙语 NLP 技术栈背后的理念：用于音节切分的 [silabificador](https://github.com/TigreGotico/silabificador) 和用于字素到音素转换（G2P）的 [TugaPhone](https://github.com/TigreGotico/tugaphone)。

### 为何选择经典方法，又为何是现在

语音学正是确定性规则真正大放异彩的领域之一。葡萄牙语音节切分的边界规则以及其正字法的规律性都有完备的文献记载，因此一个手工打造的规则引擎所产生的转写结果可以逐行加以检查。无需 GPU，无需下载模型，无需网络调用。这对数据主权很重要：一条葡语语音流水线不应该仅仅为了搞清楚一个词怎么读，就得把文本发送到远程 API。这对速度和占用空间也很重要 —— 这些库依赖极少，无论是在笔记本电脑、服务器还是嵌入式设备上都能同样轻松地运行。

### silabificador：音节边界

`silabificador` 是一个轻量级的葡萄牙语音节切分器，完全由手工打造的规则构建而成，**没有任何依赖**。其接口正如听上去那样简洁：

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

它使用来自 [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org) 的干净数据进行调优和测试，并在 [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon) 上进行了基准测试 —— 这是一个源自同一来源、包含超过 10 万条目的开放数据集。音节切分是重音标注、断字和音素转写的基础步骤，因此把它做对、做快，会在下游的方方面面带来回报。

### TugaPhone：支持方言的字素到音素转换

`TugaPhone` 能将任意葡萄牙语文本转换为 IPA，并且能够覆盖各主要葡语方言：欧洲葡语（`pt-PT`）、巴西葡语（`pt-BR`）、安哥拉葡语（`pt-AO`）、莫桑比克葡语（`pt-MZ`）和东帝汶葡语（`pt-TL`）。关键在于，它保留了方言的差异，而不是把一切都拉平为单一的"标准"。同一个句子会因说话的地区不同而产生不同的结果：

```
Choveu muito ontem à noite.
pt-PT → ʃuˈvew ˈmũjtu ˈõtɐ̃j a ˈnojt
pt-BR → ʃoˈvew ˈmwĩtʊ ˈõtẽj a ˈnojtʃɪ
pt-AO → ʃoˈvew ˈmũjntʊ ˈõntẽj a ˈnojtɨ
pt-MZ → ʃoˈvew ˈmũjtu ˈõtẽj a ˈnɔjtɨ
pt-TL → ʃoˈvew ˈmujtʊ ˈõntɐ̃j a ˈnojtʰ
```

在底层，TugaPhone 驱动共享的 `orthography2ipa` 候选词格引擎，并通过该引擎自身的扩展点在其上叠加葡萄牙语特有的处理。它查询一部经过整理的语音词典（即上文提到的同一部 Portuguese Phonetic Lexicon）来处理已知词；对于任何不在词典中的词 —— 人名、新词、外来借词 —— 词格会依据该方言的字素和音位变体规则生成候选。

有两处细节值得特别说明。**数字规范化**会将数字转换成其葡萄牙语口语形式，并保持正确的性和数的一致：

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
```

它甚至遵循计数进制的惯例 —— `pt-PT` 采用长制的 `biliões`，`pt-BR` 采用短制的 `trilhões`。**同形词消歧**被委托给 **[bifonia](https://github.com/TigreGotico/bifonia)** 库，该库掌握哪些异音同形词存在、各自对应哪种读音的知识——因此作为介词的 `para` 与作为动词的 `para` 会被区别对待——并在词格处理句子之前，用额外的变音符号标记出所选定的读音。

TugaPhone 通过驱动共享的 `orthography2ipa` 候选词格来完成音素转换：方言的选择*即是*对某个 `orthography2ipa` 方言规格的选择，因此各种方言现象——软颚化（betacism）、波尔图上升双元音、马德拉群岛 /l/ 腭化、亚速尔群岛 /u/ 前化、尾辅音连读等——都来自词格本身，而非事后的字符串修补。TugaPhone 只添加 `orthography2ipa` 刻意留给调用方的部分，并通过其自身的扩展点接入：性别感知的数字/序数词展开和 bifonia 的异音标记，作为引擎的规范化阶段在词格处理文本之前运行；来自 **[Tugalex](https://github.com/TigreGotico/tugalex)** 的经过整理的发音词典，按方言通过 `orthography2ipa.register_lexicon` 注册，因此一个被词典覆盖的词会走与规格自身例外相同的覆盖路径，词格只为词典未覆盖的词生成候选；音节切分来自 `orthography2ipa` 自身、由 `silabificador` 驱动的插件，因此重音会落在与 TugaPhone 本应选择的同一个音节上。这些都是喂给一个共享引擎的小巧、可组合的部件 —— 每一个本身都能独立发挥作用。

TugaPhone 对自己的短板毫不掩饰：对于非洲和东帝汶方言，词典覆盖较为稀疏；次区域口音（波尔图、米尼奥、布拉加等）是对已记载特征的实验性近似；句子层级的韵律则被简化处理。这些都是被公开记录的局限，而非隐藏的失效模式。

### 更宏观的图景：orthography2ipa

葡萄牙语只是众多语言变体之一，而同样的工程模式可以推广。[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) 是一个纯数据的 Python 包，包含有语言学依据的字素→IPA 及音位变体映射，覆盖 20 多个语系中的 807 种语言。它划出了任何严肃的 G2P 系统都需要的一个清晰界限：**字素映射**说明某种拼写*能够*代表哪些音素，而**音位变体映射**则说明某个音素在给定上下文中实际是如何*呈现*出来的。区域变体被建模为各自独立的规范，通过带权重的多祖先谱系相互关联，因此方言树是从其父级继承数据，而不是重复地复制数据。

这与 TugaPhone 中 `pt-PT`、`pt-BR`、`pt-AO`、`pt-MZ` 和 `pt-TL` 背后的直觉如出一辙：将每一种葡语变体都视为拥有自身规则的一等公民，而不是对某个唯一标准口音的偏离。数据是声明式的，逻辑则轻薄而可插拔 —— 你可以阅读这些规则、引用其来源，并信任其输出。

### 试用一下

这里的一切都是开源的，今天就可以安装：

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

若想了解更广泛的多语言映射，请参阅 [orthography2ipa](https://github.com/TigreGotico/orthography2ipa)。确定性、快速、离线，并为整个葡语世界的广度而打造。

这套葡萄牙语语音学技术栈建立在我们的 **[面向 807 种语言的字素到 IPA 工作](/zh/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** 之上，为 **[能在土豆上运行的 TTS](/zh/blog/2026-05-10-tts-that-runs-on-a-potato)** 和 **[Miro 与 Dii 多语言语音](/zh/blog/2026-06-15-two-voices-every-language-miro-and-dii)** 构成了语音学的骨干。
