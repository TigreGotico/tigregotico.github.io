---
title: "文字与音标记法：scriptconv 到底在转换什么"
description: "深入剖析 scriptconv——这个零依赖库，负责检测文字系统并在各种音标记法之间转换。涵盖 IPA、ARPABET 和 X-SAMPA；ISO-15924 文字检测；阿拉伯语的 Buckwalter 转写；谚文分解为字母（jamo）；以及假名转换，配有真实、实际执行过的示例和坦诚的局限说明。"
date: 2026-08-01
lang: zh
author: "Casimiro Ferreira"
tags:
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "Linguistics"
  - "FOSS"
draft: false
---

一部美式发音词典说猫（cat）听起来像 `K AE1 T`。国际音标把同一个声音写作 `kæt`。另一套纯 ASCII 系统把它写作 `k"{t`。这三者描述的是完全同一组两个音素——一个 "k" 音，接一个短 "a" 音，再接一个 "t" 音。声音本身什么都没变。变的只是用来记录它的字母表。

任何把来自不止一个来源的发音数据组合在一起的人，都会不断遇到这种情况。一个基于美式词典构建的语音数据集用一种记法。一部欧洲词典用另一种。一个文本转语音引擎期待的是第三种。在这些数据能够被合并、检索或比较之前，必须先把它从一种音标字母表翻译成另一种——这和人类语言之间的翻译是同一件事，只不过这里的"语言"是记录声音的方式，而不是记录词语的方式。

`scriptconv` 是一个小巧的 Python 库，做的就是这种翻译，外加更上一层的一项相关工作：在对一段文本做任何处理之前，先弄清楚它究竟是用哪种文字系统写的。它对语言学没有任何主张——它不猜测一个词该怎么读。它只是把已经代表已知声音的符号，从一种记法搬到另一种记法，并直接从字符本身识别文字。

## 几个术语，说清楚

- **文字（Script）**：一套书写系统——实际的字符集合，比如拉丁字母、西里尔字母或谚文。这与语言不是一回事：英语、法语和越南语都用拉丁字母，而塞尔维亚语既可以用西里尔字母，也可以用拉丁字母书写。
- **正字法（Orthography）**：用某种文字书写一门特定语言的约定拼写规则——大小写、重音符号、空格规则。
- **音素（Phoneme）**：一种语言中一个独立的声音单位，比如 "cat" 中的 "k" 音。
- **IPA（国际音标）**：一套用来精确记录声音的标准字母表，独立于任何语言的常规拼写。
- **转写（Transliteration）**：通过映射字符把文本从一种文字转换为另一种文字，目标是精确保留原始拼写，而非发音。
- **罗马化（Romanization）**：专指转写成拉丁字母。

## 为什么纯 ASCII 的音标字母表会存在

IPA 需要像 `ʃ`、`ʒ`、`ə` 和 `ˈ` 这样标准键盘上没有的字符。在 Unicode 尚未普及、多数字体、终端和文件格式还不能可靠支持非 ASCII 文本的那几十年计算机历史里，这曾是个实实在在的问题。研究者们造出了纯 ASCII 的替代方案：为美式英语语音识别工作开发的 ARPABET，以及为邮件和老式终端安全设计、对完整 IPA 做 ASCII 编码的 X-SAMPA。这些不是历史古董。ARPABET 至今仍是广泛部署的美式英语发音词典和语音工具所用的记法，X-SAMPA 也依然出现在需要纯文本的语言学工具中。任何要读取这些数据的东西，都必须能读懂那种字母表。

`scriptconv` 执行的正是实际的转换。下面是真实执行过的输出，不是描述：

```python
from scriptconv import convert, arpa_to_ipa, ipa_to_arpa

convert("K AE1 T", "arpa", "ipa")
# 'kæt'

convert("HH AH0 L OW1", "arpa", "ipa")
# 'həloʊ'

convert("kˈæt", "ipa", "x-sampa")
# 'k"{t'

arpa_to_ipa("HH AH0 L OW1", stress=True)
# 'həlˈoʊ'

ipa_to_arpa("həlˈoʊ", stress=True)
# 'HH AH0 L OW1'
```

重音标记能在往返转换中保留下来。ARPABET 用贴在元音上的一个数字标记重音（`OW1`）；IPA 用放在重读音节前的一个 `ˈ` 标记。`arpa_to_ipa(..., stress=True)` 会把这条信息带过去，转换回来时又能精确重建出原来的数字。

IPA 之所以处在这一切的中心，是刻意的设计。`scriptconv` 把每一种记法都当作图中的一个节点，把每一个转换器都当作一条边，转换时经由 IPA 这个枢纽路由，而不是为每一对记法都手写一个转换器：

```python
from scriptconv import DEFAULT_GRAPH

[f"{e.src}->{e.dst}" for e in DEFAULT_GRAPH.route("arpa", "x-sampa")]
# ['arpa->ipa', 'ipa->x-sampa']
```

总共有九种记法通过这个枢纽转码：ARPABET、X-SAMPA、Kirshenbaum、Lexique、Cotovía、RFE 和 mantoq，外加 Buckwalter（下文详述）。

## 在做任何其他事之前先检测文字

在软件能决定如何处理一段文本之前——用哪个方向渲染、跑哪个拼写检查器、选哪种字体——它必须先知道这段文本是用什么文字写的。这与"它是哪种语言"是不同的问题。文字识别的是字符集；语言识别的是词汇和语法。塞尔维亚语，前面提过，可以是西里尔字母，也可以是拉丁字母。乌兹别克语也是如此。`scriptconv` 直接从字符本身检测文字，并单独把一个语言代码映射到它约定俗成所用的文字：

```python
from scriptconv import detect_script, script_runs, lang_to_script, base_direction

detect_script("Здравствуйте")
# 'Cyrl'

detect_script("안녕하세요")
# 'Hang'

script_runs("привет hello")
# [('Cyrl', 'привет '), ('Latn', 'hello')]

base_direction("مرحبا hello")
# 'mixed'

lang_to_script("uzb_cyr")
# 'Cyrl'
```

`detect_script` 返回一个 ISO 15924 代码——文字系统标准的四字母标签注册表（`Cyrl` 代表西里尔字母，`Hang` 代表谚文，`Latn` 代表拉丁字母，`Arab` 代表阿拉伯字母）。`script_runs` 按文字把混合文本切分成一段段连续的区间，这正是一个渲染器需要的东西，用来逐句决定该用哪种字体和文字方向。`base_direction` 报告一个混合字符串是从左到右、从右到左，还是两者都有。

## 棘手的情形：Buckwalter、谚文和假名

有三种文字转换在真实流水线中出现得足够频繁，以至于 `scriptconv` 专门直接处理了每一种。

**Buckwalter**，面向阿拉伯语，是一套 ASCII 转写方案，把每一个阿拉伯字母和变音符号一对一地映射到一个特定的 ASCII 字符，因此原始拼写——包括多数母语文本会省略的元音标记——可以被精确重建出来。它之所以存在，是因为阿拉伯文在围绕 ASCII 构建的流水线和工具中很难处理：排序、比对差异、正则表达式，以及一些较旧的文本格式，一旦文本变成拉丁字母的 ASCII 就都变得容易了，前提是这个映射是精确且可逆的。

```python
from scriptconv import buckwalter_to_arabic, arabic_to_buckwalter

buckwalter_to_arabic("mrHbA")
# 'مرحبا'

arabic_to_buckwalter("مرحبا")
# 'mrHbA'

arabic_to_buckwalter("رحمٰن")
# 'rHm`n'
```

最后一个例子包含了短剑阿列夫（dagger alef），一个用在少数几个词中的小型上标变音符号（`رحمٰن`，*rahman*）——Buckwalter 为它保留了一个专门的 ASCII 字符（`` ` ``），与普通的阿列夫区分开来，这样转写就不会把两者混为一谈。

**谚文** 看起来像是一个个音节方块，但每个方块其实是若干单独字母（jamo）按网格排布组成的复合聚簇——就像 "H"、"A"、"N" 视觉上合并成一个字形代表 "han"，而不是从左到右分别写出来。需要单独字母的软件——用于检索、用于音系分析、用于喂给另一个系统——就得把它们重新拆开：

```python
from scriptconv.translit import decompose_hangul

decompose_hangul("한국")
# 'ㅎㅏㄴㄱㅜㄱ'

decompose_hangul("국민")
# 'ㄱㅜㄱㅁㅣㄴ'
```

最后这个例子重要的地方在于它 *没有* 做什么：국민（*gungmin*，"公民"）的实际读音带有鼻音同化，是 `[ɡuŋmin]`，但 `decompose_hangul` 返回的是书写时的字母——`ㄱㅜㄱㅁㅣㄴ`，未经同化——因为分解只是对 Unicode 码位做算术运算，而不是一条音系规则。它告诉你的是写下来的是什么，而不是听起来是什么。

**假名** 转换在日语的两套音节文字——平假名和片假名——之间移动，二者用不同的字符、在固定的码位偏移下表示相同的声音：

```python
from scriptconv import hira_to_kana, kana_to_hira

hira_to_kana("こんにちは")
# 'コンニチハ'

kana_to_hira("カタカナ")
# 'かたかな'
```

## 为什么这单独成了一个库

一个音素转换器——猜测一个书写词该怎么读的工具——需要语言学判断：重音规则、例外情况、依赖语境的发音。`scriptconv` 刻意不含任何这些。上面的每一个函数都只是一次查表或一次码位计算：同样的输入，同样的输出，没有猜测，没有语言模型，也没有任何可能在某种具体语言的实际发音上出错的东西。这正是它能被每一个需要它的音素转换器安全共享的原因，而不必让每一个音素转换器都各自重新实现一份带着各自 bug 的 ARPABET 表。[音系技术栈](/zh/blog/2026-08-10-the-phonology-stack)一文介绍了真正猜测发音的引擎——那些确实携带语言学主张的引擎——是如何构建在这一层之上、而非重复它的。

## 映射不精确的地方

在各记法之间转换并不总是无损的，`scriptconv` 把这一点记录为可查询的数据，而不是留作一个意外惊喜。每种记法都独立追踪两个属性：把它转换为 IPA 再转换回来，是否能精确复现原始符号；以及把 IPA 转换成它再转换回来，是否能复现每一个 IPA 符号。

ARPABET 在两个方向上都不行：它的音素清单是受限的、专属于英语的，所以 IPA → ARPABET → IPA 这条路径可能会丢失一些 IPA 能表达、但 ARPABET 表中没有对应符号的区别。X-SAMPA 和 Lexique 忠实覆盖了完整的 IPA 清单，但不保证从它们自己那一侧出发能干净地往返。Kirshenbaum 和 Buckwalter 从它们自己那一侧转到 IPA 能干净地往返，反过来则不行。Mantoq，哈拉比阿拉伯语音素转换器所用的音标字母表，只能单向转换成 IPA——没有反向转换器。这些都没有被埋在某个文档字符串里；这是这个库主动暴露出来的数据，方便调用方在假定一次往返转换是安全的之前先查一查。

---

如果你正在把来自多个来源的发音数据缝合在一起，或者需要在文本抵达一个音素转换器之前检测文字并做归一化处理，[联系我们](/zh/contact)，或到[服务页面](/zh/services)看看我们在这个领域还做了些什么。
