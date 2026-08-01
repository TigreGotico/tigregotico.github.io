---
title: "音系技术栈是如何拼接在一起的"
description: "一次架构导览，带你了解我们的文本转发音技术栈：负责记音的 scriptconv，作为跨语言字素转 IPA 引擎的 orthography2ipa，构建在其上、面向葡萄牙语、巴斯克语、米兰达语、巴兰克诺语和阿拉伯语的语言专属前端，以及用于按发音检索的 phonematcher。展示这些层级为何存在、什么是候选词格，以及真实的方言输出。"
date: 2026-08-01
lang: zh
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "Linguistics"
  - "FOSS"
draft: false
---

以英语单词 "read" 为例。写下来，它并不能告诉你该怎么读。"I read the book yesterday" 和 "I read the book every day" 用同样五个字母表示两个不同的音——一个和 "red" 押韵，另一个和 "reed" 押韵。一个屏幕阅读器、一个语音助手，或一个只看拼写的搜索框，是无法把这个读对的。它需要对发音本身进行推理，而不只是处理文本。

这个推理问题——把书写的词语转变成它们所代表的声音——正是我们的音系技术栈要解决的。这篇文章描绘了它各个部件是如何拼接在一起的：从原始记音符号，一路到语言专属的发音引擎和按声音检索。

## 几个术语，说清楚

贯穿全文会用到的几个词：

- **字素（Grapheme）**：一个书写符号——一个字母，或像 "ch" 这样的字母组合。
- **音素（Phoneme）**：一种语言中一个独立的声音单位，比如 "cat" 中的 "k" 音。
- **IPA（国际音标）**：一套用来精确记录声音的标准字母表，独立于任何语言的拼写。"Cat" 在 IPA 中写作 `kæt`。
- **G2P（字素转音素）**：把拼写转换为声音这一通用问题。
- **音位变体（Allophone）**：同一个音素在不同语境下的变体实现——"top" 中的 "t" 和 "stop" 中的 "t" 在英语中是同一个音素，但发音略有不同。
- **音节切分（Syllabification）**：把一个词拆成音节，例如把 "extraordinário" 拆成 `ex-tra-or-di-ná-ri-o`。
- **同形词（Homograph）**：两个拼写相同但含义不同的词；一个 **异音同形词**（heterophonic homograph，或 heterophone）是一个根据所指含义不同而发音不同的同形词，就像上面的 "read"/"read"。
- **形态学（Morphology）**：词语的内部结构——前缀、词根、后缀、屈折变化。
- **词性（POS）标注**：给句子中的每个词标上名词、动词、形容词等标签。

## 核心难题

拼写是对声音的一种有损编码。三件各自独立的事让它难以还原：

1. **歧义。** 同样的字母可以根据含义、语法，或纯粹的不规则性，映射到不同的声音（上面的 "read" 即是一例；英语里这样的词比比皆是）。
2. **方言。** 同一个词，在同一种语言中，会因说话人来自何处而发音不同。欧洲葡萄牙语和巴西葡萄牙语拼写相同，但元音不同。
3. **覆盖率。** 世界上大多数语言根本没有专业整理过的发音词典。一个只靠查表工作的 G2P 系统，只能覆盖极少数语言。

任何认真对待文本转语音、语音识别训练数据，或语音感知搜索的尝试，都必须同时应对这三个问题。

## 为什么这个技术栈是分层的

这个技术栈把问题拆分成几个彼此无需了解对方的层级：

- **记音层** —— 在各种音标和文字系统之间转换。这与任何特定语言的音系毫无关系；它是符号转译。
- **音系层** —— 使用一门语言音系系统的规格，把拼写映射到 IPA。
- **语言专属的例外处理** —— 那些不规则词、方言怪癖、同形词，以及一个通用引擎无法仅凭拼写规则推断出的形态结构。

把这些层级分开，是一个设计决策，而非偶然，它带来一个直接的回报：添加一种新语言，意味着编写一份 **规格**（描述其音系系统的数据），而不是一个新程序。消费这份规格的引擎、词格搜索、分词器、距离度量——这些都无需重写。底层的记音层由每一种语言共享，包括那些音系引擎从未听说过的语言。

### 记音层：scriptconv

[scriptconv](https://github.com/TigreGotico/scriptconv) 是一个零依赖的记音与文字处理核心：ISO-15924 文字检测、IPA 与 ARPABET、X-SAMPA、Lexique、Kirshenbaum、Cotovía 和 RFE 记音法之间的相互转换、阿拉伯语的 Buckwalter 转写、谚文分解为字母（jamo），以及假名处理。这些都不需要知道一个词属于哪种语言——一个 IPA 音素串转换成 ARPABET 的方式，与源语言无关：

```python
>>> import scriptconv as s
>>> s.ipa_to_arpa("kæt")
'K AE T'
>>> s.ipa_to_xsampa("kæt")
'k{t'
```

在这一层之上的每一层，都可以假定记音转换问题已经解决了。

### 引擎：orthography2ipa

[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) 是跨语言引擎。它接收一份语言规格——对该语言字素转音素规则的声明式描述——和一段文本，产出 IPA。截至撰写本文时，它包含覆盖 **807 种语言** 的规格（已安装包上的 `available_codes()` 会返回这个长度的列表；由于规格会持续新增，请把这个确切数字当作一个会变动的值）。

```python
>>> import orthography2ipa as o
>>> len(o.available_codes())
807
```

引擎本身没有内置任何语言专属的代码。一门新语言就是一个新的规格文件，按照与其他所有规格相同的模式进行校验。

## 词格：排序候选，而非单一猜测

考虑到上面的歧义问题，为每个词只给出一个固定输出，往往是错的。orthography2ipa 转而产出一个 **词格（lattice）**——一组排好序的候选发音——让更上层的模块利用引擎本身没有的语境（含义、词性、词典条目）来加以收窄。

再看一次 "read"：

```python
>>> from orthography2ipa import G2P
>>> g = G2P("en")
>>> g.transcribe("read")
'ɹiːd'
>>> g.candidates("read")
[IPAPath('ɹiːd', score=0.0), IPAPath('ɹɛd', score=1.0)]
```

在没有更多语境的情况下，引擎返回它最好的猜测（现在时，代价更低），但同时把另一个候选（过去时）连同其代价一起保留在词格中。一个知道句子是过去时的下游组件，可以选择第二个候选而不是第一个。同样的想法，在更大的规模上，被下面的 bifonia 用于葡萄牙语异音词：一个通用词格提供候选，一个更狭窄、掌握更多信息的层负责从中挑选。

## 方言是一等公民

同一种语言的两位说话人可以把同一个句子读得不一样，而一个把"葡萄牙语"当作单一固定音系系统来处理的音系技术栈，除了一种方言之外，其余每一种都会读错。orthography2ipa 直接暴露了方言处理——已安装包上的 `available_profiles()` 列出了诸如 `lisbon`、`porto`、`estremenho`、`galician` 等方言与语支档案——而构建在其之上的葡萄牙语前端 [tugaphone](https://github.com/TigreGotico/tugaphone)，能把同一个句子跨葡语诸变体进行音素转换。以下是同一个句子经过全部五种受支持方言的结果：

| 方言 | 输出 |
|---|---|
| pt-PT（葡萄牙） | `ˈbõ ˈdiɐ ˈkomu eˈʃta vɔˈse` |
| pt-BR（巴西） | `ˈbõ ˈdʒiɐ ˈkɔ̃mʊ eˈsta voˈse` |
| pt-AO（安哥拉） | `ˈbõ ˈdiɐ ˈkomʊ eˈsta vɔˈse` |
| pt-MZ（莫桑比克） | `ˈbõ ˈdiɐ ˈkomu eˈsta vɔˈse` |
| pt-TL（东帝汶） | `ˈbõ ˈdiə ˈkoɔmʊ eˈsta vɔˈse` |

（"Bom dia, como está você?" —— "早上好，你好吗？"）辅音骨架在这五者之间都保持可辨认，但两个众所周知的标记立刻把它们区分开来。在 "dia" 中，巴西葡萄牙语把 `i` 前的 `d` 变成了 `dʒ`，即英语 "jam" 开头的那个音——其余变体保留一个普通的 `d`。在 "está" 中，欧洲葡萄牙语把音节末尾的 `s` 读作 `ʃ`，即 "shoe" 里的 "sh" 音，而其他每一种变体都保留 `s`。一部按某一方言规则构建的发音词典，对其他每一种方言的听者来说，这两处都会读错。

[euskaphone](https://github.com/TigreGotico/euskaphone) 对巴斯克语诸方言做了同样的事，它直接构建在 orthography2ipa 的词格之上，而非另起一个独立引擎：

```python
>>> from euskaphone import EuskaPhonemizer
>>> EuskaPhonemizer().phonemize_sentence("Kaixo, zer moduz zaude?")
'kai̯ʃo s̻er modus̻ s̻au̯de'
```

## 语言专属前端

在共享引擎之上，坐落着一些前端，它们添加了通用规格无法提供的东西：不规则词、经过整理的词典、连音（sandhi，词语边界处的音变），以及方言专属的覆盖规则。

- **[tugaphone](https://github.com/TigreGotico/tugaphone)** —— 葡萄牙语，覆盖 pt-PT、pt-BR、pt-AO、pt-MZ 和 pt-TL，把经过整理的词典与基于规则的回退相结合（如上文所示）。
- **[euskaphone](https://github.com/TigreGotico/euskaphone)** —— 巴斯克语，支持方言，构建在同一个词格之上（如上文所示）。
- **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** —— 米兰达语，葡萄牙米兰达地区（Terra de Miranda）的阿斯图里亚斯-莱昂语，具备跨词连音、音位变体和重音处理：

  ```python
  >>> from mwl_phonemizer import phonemize
  >>> phonemize("Falo la lhéngua mirandesa.")
  'ˈfalu lɐ ˈʎɛŋɡwa miɾɐˈndez̺ɐ.'
  ```

- **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** —— 首个面向巴兰克诺语的开放 G2P，这是葡萄牙-西班牙边境巴兰科斯的伊比利亚-罗曼语接触语言。参见 **[推出首个巴兰克诺语音素转换器](/blog/2025-12-12-barranquenho)** 了解它的规则是如何从该市自身的正字法约定中推导出来的。
- **[arbtok](https://github.com/TigreGotico/arbtok)** —— 阿拉伯语，构建在 orthography2ipa 的词格之上，增加了方言感知的标注元音处理，覆盖现代标准语、古典阿拉伯语和若干地区变体。阿拉伯文书写通常省略了音素转换器所需的短元音标记，因此 arbtok 的主要工作是在把结果交给共享引擎之前把它们还原出来。它由一位非阿拉伯语母语者维护，因此请把它当作正在积极开发中的项目，而非一份完成、经母语者审阅的定本参考——它很有用，但在把它用到任何面向用户的场景之前，值得先请母语者核对一下输出。

以上每一个前端，都只是覆盖在同一个共享词格引擎和同一个共享记音层之上的一层薄薄的语言专属逻辑。它们都没有重新实现 IPA 转换或词格搜索。

## 支撑葡萄牙语的配套工具

葡萄牙语拥有最深的技术栈，因为葡萄牙语的发音依赖的不只是拼写规则：它还依赖音节结构、词类，有时甚至纯粹依赖含义。

- **[silabificador](https://github.com/TigreGotico/silabificador)** 用手工打造的规则把词拆分成音节：

  ```python
  >>> from silabificador import syllabify
  >>> syllabify("extraordinário")
  ['ex', 'tra', 'or', 'di', 'ná', 'ri', 'o']
  ```

- **[tugalex](https://github.com/TigreGotico/tugalex)** 是 tugaphone 背后的词典：真实词语的 IPA 转写、音节数据和正字法规则，这样常见词汇和不规则词汇就不必每次都从拼写重新推导。
- **[tugatagger](https://github.com/TigreGotico/tugatagger)** 把若干个词性标注后端（spaCy、Stanza、一个 Brill 风格的标注器、一个无依赖的启发式回退方案）封装在同一个接口背后，这样其他工具就能问"这个词是什么词性"，而不必绑定到某一个特定后端。
- **[tugamorph](https://github.com/TigreGotico/tugamorph)** 是一个基于规则的形态分析器：它只用 Python 标准库，把一个词切分为前缀、词根、后缀、屈折变化和附着词，并可选地借助 silabificador 和 tugatagger 提升精度。
- **[bifonia](https://github.com/TigreGotico/bifonia)** 消解欧洲葡萄牙语的异音同形词——像 "sede" 这样的词（口渴，`ˈsedɨ`，对比总部，`ˈsɛdɨ`），其正确读音取决于含义，而非语法。参见 **[说对读音：为 TTS 消歧葡萄牙语异音同形词](/blog/2026-06-12-disambiguating-portuguese-heterographs-for-tts)** 了解它是如何构建和评估的。这正是上文词格理念背后的具体案例：orthography2ipa 可以同时提供 "sede" 的两个候选读音，但只有像 bifonia 这样理解含义的层，才能在两者之间做出选择。

关于 silabificador 和 tugaphone 在日常中如何协同工作的更多内容，参见 **[面向葡萄牙语的经典 NLP：音节切分与字素到音素转换](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**；关于这一切之下更广泛的引擎，参见 **[面向 807 种语言的字素到 IPA 转换](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**。

## 基于声音的检索：phonematcher

以上一切都在把文本转换成声音。[phonematcher](https://github.com/TigreGotico/phonematcher) 则直接处理声音表示本身：它计算 IPA 符号之间的语音距离，并基于词语听起来如何、而非拼写如何，对词表做模糊检索。

```python
>>> from phonematcher.distance import phonetic_distance
>>> phonetic_distance('b', 'p')   # voiced vs. voiceless bilabial stop — very similar
0.043478260869565216
>>> phonetic_distance('p', 'k')   # bilabial vs. velar stop — less similar
0.34782608695652173
>>> phonetic_distance('a', 'k')   # vowel vs. consonant — maximally different
1.0
```

这个距离度量在两个具体场景中很有用：按听感而非精确拼写检索一份词语或名称目录（对容错的语音界面、以及跨书写系统匹配外来词都很有用），以及比较两个相关语支在音系上有多接近——与上面方言表格用肉眼所做的比较是同一类比较，只不过这里是计算出来的，而不是靠肉眼判断。phonematcher 并未发布在 PyPI 上；它需要从源码安装（针对 GitHub 检出版本执行 `pip install -e .`，外加 `rapidfuzz`）。

## 诚实地说明局限

在 807 个语言规格之间，覆盖质量天然是不均衡的：拥有成熟音系学文献和词典的语言，产出的效果要好于那些主要靠通用正字法惯例推断出来的单薄规格的语言。质量最稳定的地方，是存在一份经过整理的词典之处——由 tugalex 支撑的葡萄牙语，是这个技术栈中最强的案例；那些纯靠规格规则、没有词典支撑的语言，会在不规则词汇和外来词上出错。

有几个组件明确尚未成为完成品、经母语者审阅的参考：arbtok 由一位非阿拉伯语母语者维护，在用于任何面向用户的场景之前，应当对照母语者的判断加以核实。构建在单薄规格之上的前端，也继承了那份单薄——一个前端的好坏，取决于其底层的规格和词典。

## 如果你的语言还没有语音工具，这为什么重要

世界上大多数语言都没有商用 TTS 语音、没有商用 STT 模型，也没有专业维护的发音词典。上述分层设计意味着，弥补这一空白并不需要从零构建一个音系引擎：它需要的是为目标语言的音系系统编写一份规格，并在可能的情况下，为其不规则词汇编写一份词典。词格引擎、记音转换和检索工具都已经就绪。如果你的语言、方言或产品需要目前还不存在的发音支持，这正是我们承接的那类工作——参见 **[我们的服务](/services)** 或 **[联系我们](/contact)**。
