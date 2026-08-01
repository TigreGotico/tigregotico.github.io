---
title: "面向 820 种语言的字素到 IPA 转换"
description: "orthography2ipa 是一个纯数据、以语言学为根基的资源，它将拼写映射到 IPA，并在 909 个语言规范、820 种语言和 20+ 个语系上建模音素如何以音位变体的形式在语境中显现。它包含一个候选词格（lattice）、一个最大匹配（maximal-munch）分词器、音系与文字距离度量、方言谱系，以及一套经模式校验、引用至方言学文献的规范集——没有训练权重，完全可自托管。"
date: 2026-01-15
lang: zh
updated: 2026-08-01
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

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** 是一个纯数据的 Python 包——声明式 JSON、轻薄可插拔的逻辑、没有训练权重——它将拼写映射到 IPA，并建模这些音素如何在语境中显现。它包含 **覆盖 820 种语言的 909 个语言规范**（外加 89 个仅用于分类的支系节点），横跨 **20+ 个语系**。安装它、读取数据、fork 数据。没有任何东西藏在检查点里。

它是下游一切之下的音系层：它产出的候选词格被阿拉伯语 TTS 前端 [arbtok](https://github.com/TigreGotico/arbtok)、葡萄牙语的 [TugaPhone](https://github.com/TigreGotico/tugaphone) 和 [silabificador](https://github.com/TigreGotico/silabificador) 技术栈（见 **[面向葡萄牙语音节与音素的经典 NLP](/zh/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**）、[Barranquenho 音素转换器](/zh/blog/2025-12-12-barranquenho)、米兰达语音素转换器，以及 **[能在土豆上运行的 TTS](/zh/blog/2026-05-10-tts-that-runs-on-a-potato)** 的音素基础所消费。

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

每种语言都是一个冻结的 `LanguageSpec` 数据类，它携带的远不止一份音素列表：字素（包括二合字母和三合字母）、一张音位变体映射、用于语境敏感覆盖（词首、元音间、/i/ 之前）的 **位置字素（positional graphemes）**、带权重的多祖先 **谱系（ancestry）**、跨词的 **连音规则（sandhi rules）**、一份可选的 **声调库存（tone inventory）**，以及来源信息——一个沿 `stub → skeleton → research → production` 递进的 `QualityTier`、一个 `ScriptType`（字母文字、辅音音素文字、元音附标文字，……），以及带页码定位的参考文献来源。

纳入规则严格，值得直白地说明：**只有以官方正字法和有据可查的语法为根基的映射才会被纳入。任意的子串规则被排除在外。** 葡萄牙语的 ⟨lh⟩、德语的 ⟨sch⟩ 和英语的 ⟨th⟩ 被纳入，是因为它们是标准的正字法单位。方便但杜撰的启发式规则则不然。当某个规范声明了字素却没有明确的音位变体映射时，会推导出一张基线恒等映射——每个音素至少是它自身的表层显现——这样就不会有任何东西悄然消失。

地区变体拥有各自独立的规范，而不是在父规范上加一个标志位。巴西葡萄牙语和欧洲葡萄牙语存在系统性分化，因此它们是通过谱系相连的、彼此不同的 `LanguageSpec` 对象：

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

方言树之所以保持可维护，是因为 JSON 文件支持 `graphemes_base` / `allophones_base` 继承：一个变体只声明它与父项不同之处。谱系是带权重且多祖先的——父语、底层语（substrate）、上层语（superstrate）、旁层语（adstrate）——这是对那些属于接触产物、而非纯粹后裔的语言进行建模的诚实方式。

## 不只是广，还要深入实地

820 这个数字代表广度；深度才是工作的所在。规范会在方言学文献深入之处逐个方言（lect）地深入，而每一个都引用至那份文献并带有页码定位，而非从一张音素表中模式匹配得来。

**伊比利亚** 的覆盖是最清晰的例子：为半岛上的语言提供了 **100+ 个规范**。西班牙的每一种罗曼语——卡斯蒂利亚语、加泰罗尼亚语/瓦伦西亚语、加利西亚语（RAG 规范与再融合派规范两者）、阿斯图里亚斯语、阿拉贡语及其河谷变体（Ansotano、Chistabín、Benasqués……）、埃斯特雷马杜拉语——外加巴斯克语、伊比利亚-罗曼克里奥尔语，以及大多数资源完全跳过的历史层次：**安达卢西阿拉伯语（Andalusi Arabic）** 和 **莫扎拉布语（Mozarabic）**。阿拉伯语一侧携带 **34 个方言变体**（从内志语和希贾兹语，到黎凡特语、马格里布语以及半岛各变体），卢西塔诺（葡萄牙语系）一侧则有 **46 个葡萄牙语及葡萄牙境内语言的方言**，细至 Rionorese、Guadramilese，以及米兰达语的各子方言。

据我们所知，其中若干是有史以来为该变体发布的 **首个机读音系**——即一份结构化、经模式校验、可供程序查询的字素/音位变体规范，而非仅在方言学文献中以散文描述的音素清单——Rionorese 和 Guadramilese 即在其列。下游工作则发布了 **Barranquenho** 和 **米兰达语** 的 **首批 IPA 词典**。

## 一个候选词格，而非单一猜测

拼写并不是一个干净的切分问题，因此其旗舰架构是一个 **候选词格（candidate lattice）**。`PhonetokTokenizer` 执行 **最大匹配（maximal-munch）** 的字素分词——贪婪地优先匹配最长的正字法单位——并在规范的字素表之上，为每个位置产出一个排序后的 IPA 候选词格，而不是一个脆弱的单一输出：

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

这个词格是整个下游家族赖以构建的契约。一个语言专属的引擎消费这套共享词格，只添加静态表格无法表达的音系，从而让每个消费者都停留在同一套有根基的核心之上：

- **[arbtok](https://github.com/TigreGotico/arbtok)** 在这套词格之上构建阿拉伯语 TTS 音系，添加太阳字母同化、hamzat al-waṣl 的省略、gemination（重叠辅音）与连字处理——以及一种新颖的 **rawi-词格融合（rawi-lattice fusion）**，它通过 *在所请求方言的许可（licensing）下* 对一个集成模型的逐字符分布进行评分，来还原未标注元音符号的方言文本中缺失的短元音，而不是信任一个自由生成器。
- **[TugaPhone](https://github.com/TigreGotico/tugaphone)**、**[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)**（米兰达语）和 **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** 都为其卢西塔诺变体消费同一套 lattice-core。

## 度量语言之间的距离

由于数据是结构化的，而非烘焙进权重，你可以直接比较语言。距离度量涵盖库存、字素、音位变体和谱系等维度，外加一个独立的文字距离系列：

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.0515 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

特征向量也被暴露出来，因此像两套葡萄牙语标准这样几乎完全相同的一对落在 0.0515，而真正相距甚远的一对则清晰分离。这对迁移学习决策、低资源引导（bootstrapping）以及方言计量学（dialectometry）都同样有用。

## 我们如何知道这份数据靠谱

可靠的 G2P“黄金标准”几乎不存在——大多数公开数据集是某个音素转换器自身输出被重新拿来当作参照，因此对它们取得低错误率仅意味着“与那个工具一致”，而非“正确”。我们对此直言不讳，并围绕它构建了一套验证方法论，而不是报告一个孤立的、讨好的数字。

对于我们最看重的那些变体，黄金标准是 **人工撰写的，而非抓取的**：每个方言一套引擎锚定（engine-pinned）的句子集，在 **盲配对（blind pairs）** 中评判，对照 **带页码定位的文献** 仲裁，并通过 **修正类（correction classes）** 反馈回一个引擎反馈回路——引擎输出与修正形式之间的一处分歧，就是一条指向真实规范 bug 的线索。在引擎锚定的 TTS 黄金标准与一手文献佐证之间，共有 **数千行经过验证的数据**。这一框定刻意对来源保持诚实：在只有这些的地方是合成与文献仲裁的，而在有真正人工黄金标准的地方就是人工黄金标准——母语者撰写的米兰达语 `mirandese_g2p` 集、带页码定位的一手文献佐证，以及母语者贡献。准确性主张 **只** 对照人工黄金标准做出；对照引擎自身草稿取得的满分毫无意义。

这些数字，应被当作方向性的，且始终引用至其来源（[`docs/scoreboard.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/scoreboard.md)、[`docs/benchmarks.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/benchmarks.md)，以及下游各仓库的基准文档）：

- **阿拉伯语方言，裸露的未标注元音输入**——这是艰难的、贴近部署现实的情形。在 arbtok 的裸输入 TTS 黄金标准上（33 个方言），方言许可下的 rawi-词格融合达到 **0.189 的平均 PER**，胜过同一集成模型作为自由生成器运行的结果（0.193），其优势集中在与 MSA（现代标准阿拉伯语）分化最大的那些方言上。在大多数方言上 arbtok 在裸输入上胜过 espeak-ng；而在 MSA 本身上，针对 MSA 调优的 espeak 仍然胜出（espeak 0.176 对 arbtok 0.245）。
- **阿拉伯语方言，带标注元音输入**——有元音标记在场时 arbtok 的 PER 每方言落在 **0.01–0.08**，远低于 espeak 的单一 MSA 嗓音（例如内志语 0.009 对 espeak 0.221；埃及语 0.027 对 espeak 0.287）。espeak 没有方言嗓音，所以这坦白说是苹果比橘子——但差距本身正是重点。
- **葡萄牙语，对照专家人工黄金标准**——里斯本欧洲葡萄牙语在带页码定位的一手文献上落在 **PER 0.029**（88% 精确匹配），母语者撰写的米兰达语黄金标准则为 **0.146**。

以上每一项都是数据当前状态的属性，交叉参照到一个自举置信区间（bootstrap confidence interval），而不是一座排行榜奖杯。在区间宽或样本小之处，记分板会如实说明。

## 命令行工具

以上所有内容无需编写 Python 即可访问。`orthography2ipa` 控制台脚本提供 `list`、`info`、`transcribe` 和 `distance`，且每个子命令都接受 `--json`，以便管道传入流水线。

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## 为什么纯数据很重要

整套规范集都经过模式校验——冻结的 pydantic 风格数据类、由一套完整性测试套件扫查，并由 `SCHEMA.md` 记录其结构。在静态表格确实无法表达规则之处，语言专属逻辑会围绕数据插入：音节切分器通过一个入口点（entry-point）组注册，而更重的引擎则在下游基于这套共享词格构建。

没有一个不透明的模型在决定你用户的语言听起来如何。映射是可审计的，来源被引用至页码，而添加一种语言就是编写一个经校验的 JSON 文件——从 [`docs/adding_a_language.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/adding_a_language.md) 和 [快速上手指南](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/getting_started.md) 开始。对于任何构建 TTS、ASR 或语音 NLP，并拒绝将自己的音系外包给黑箱的人——以及希望它运行在自己硬件上的人——这正是关键所在。它采用 Apache 2.0 许可，可供你检查、扩展和自托管。
