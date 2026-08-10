---
title: "linguonnx：基于 ONNX 的离线翻译与语种识别"
description: "linguonnx 在 CPU 上翻译文本并识别语种，不用 torch，也不用云端。184 个 int8 翻译模型和 5 个语种识别模型，586 种可路由语言，以及一个在没有单一模型覆盖某个语对时把小模型串起来的路由器。"
date: 2026-08-10
lang: zh
author: "Casimiro Ferreira"
tags:
  - "linguonnx"
  - "translation"
  - "language identification"
  - "ONNX"
  - "self-hosted"
  - "OVOS"
draft: false
---

[**linguonnx**](https://github.com/TigreGotico/linguonnx) 是一个用于机器翻译和语
种识别的 Python 库。它跑在 `onnxruntime` 上，在 CPU 上，离线运行。它在任何环节都
不使用 torch —— 编码器-解码器的生成循环，包括束搜索和 KV 缓存，都直接写在 ONNX 图
之上。

```bash
pip install linguonnx
```

```python
from linguonnx import load_translator, load_detector

tx = load_translator()
print(tx.translate("bom dia, como estás?", src="pt", tgt="en"))
# 'Good morning, how are you?'   via opus-mt-pt-en-int8, 172 MB

det = load_detector()
print(det.detect("Egun on, zer moduz?"))    # 'eu'
```

它采用 Apache-2.0 许可，并且不会下载任何你没有要求的模型。

## 随附的内容

注册表中有 369 条翻译条目——每个模型的 fp32 和 int8——以及 10 条语种识别条目。
`load_translator()` 默认使用 int8，因此一次普通安装会在 184 个量化翻译模型和 5 个
量化分类器上做路由。它们全部是发布在 HuggingFace
[`TigreGotico/`](https://huggingface.co/TigreGotico) 下的 ONNX 转换。

在默认图上，586 种语言可以路由到。这个数字被固定在测试里，所以它要么保持为真，要
么构建会报出来。

分类器是四个 fastText 模型的 ONNX 导出：GlotLID、经典的 `lid.176`、OpenLID 和
OpenLID-v2。GlotLID 标注 2102 个*变体*，所以口语阿拉伯语会回来成为纳季德语
（`ars`），中文可能回来成为粤语。需要方言识别时这很有用，不需要时就用
`collapse_varieties=True`。

## 没有模型的语对，就是一串模型

大多数语对没有双语模型。路由器把模型看作一组能力，而不是一条固定的边，必要时把跳
数串起来：

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — 它经过了加利西亚语
```

在这套策略下，葡萄牙语到巴斯克语经过加利西亚语，走两个分别为 84 MB 和 153 MB 的
Marian 模型。中转从不沉默：`Route` 会连同译文一起返回，并说明用了哪些模型、经过了
哪些语言。

一条路线并不是关于某个语对的固定事实。它是调用方的约束在注册表上得出的结果：改动
大小预算或跳数偏好，同一个语对可能改从另一种语言中转，也可能塌缩成经由一个大型多
语模型的单跳。`Route` 会告诉你拿到的是哪一条。

排序偏好负责该语言的机构。HiTZ 训练巴斯克语，Proxecto Nós 训练加利西亚语，
Projecte AINA 训练加泰罗尼亚语，AI4Bharat 训练印度语系语对，Masakhane 训练西非语
对，TartuNLP 训练芬兰-乌戈尔语言。平手时，专家机构的模型胜过通用多语模型。

## 策略在运行时，绝不在建索引时

这是注册表的法则：它列出每一个已发布的模型，不论大小、许可或分数。过滤和排序发生
在运行时，在调用方的进程里，按调用方的规则。索引漏掉的模型根本无法被选中，所以索
引不漏掉任何东西。

调用方通过 `load_translator` 设定策略：`max_model_mb`、`oversize_fallback`、
`count_cached_as_free`、`prefer`、`max_hops`、`precision`、`model_cache_size`、
`exclude_flagged` 和 `min_chrf`。每一项也都可以按单次调用覆盖。

## 大小上限偏好小模型，而不是删掉语言

大小预算是小机器上显而易见的旋钮，而它显而易见的实现是错的。当作过滤器用时，
`max_model_mb=500` 会把 586 种可路由语言压到 249 种，因为长尾住在大的多语模型
里，任何小模型的串联都替代不了它们。

`oversize_fallback=True` 把预算变成偏好：

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 586，而不是 249
```

英语到加泰罗尼亚语留在小模型上，因为确实存在小模型。英语到楚瓦什语则升到 MADLAD，
因为注册表里只有 MADLAD 有楚瓦什语，而替代方案不是更便宜的路线，而是没有路线。
`waived_size_cap` 会说明这条路线越过了哪个上限，所以一台按 500 MB 做预算的机器会
知道自己下载了 4945 MB。

四条规则让这件事保持诚实。扩大范围的搜索只为那条返回为空的语对运行。上限一次只抬
高一个模型尺寸，所以 NLLB-200 和 MADLAD 都覆盖的语对会拿到 NLLB-200。上限约束的是
一个模型而不是一条路线，所以两跳各 237 MB 的串联由普通搜索就能找到。而这种抬高绝
不会越过下载预算。

## 可路由不等于可用

`madlad400-3b-mt` 覆盖楚瓦什语。向它请求 `en -> cv`，它用俄语回答：
`"Good day, my friend."` 回来成了 `"Добрый день, мой друг."`。路由是正确的——楚瓦
什语的标记是一个独立的 SentencePiece 片段——而模型仍然写错了语言。

因此注册表条目会带上 `language_flags`，一次一种语言，并附上背后的观察：输入、输
出、检测器的判定（`glotlid=ru`）、日期和方法。楚瓦什语可路由，且不可用，注册表把
两件事都说出来。

整模型的质量也用同样的方式记录。`quality` 字段记录对照 **人工** FLORES-200
devtest 参考的 chrF 分数，旁边写着语料、解码模式和样本量，因为一个看不到样本量的
分数没有意义。字段缺失表示未测量，这与差不是同一回事，而且不会为未测量的模型编造
数字。两项检查会打上标记：任一精度的 chrF 低于 40，以及 int8 落后 fp32 超过 2
chrF。

标记不会从注册表里移除任何东西。它给 `exclude_flagged=True` 和 `min_chrf=` 一个可
以据以行动的依据，也给人一个去读的理由：

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

一次覆盖整个注册表的扫描会把一句真实句子送进每个已注册模型，并在输出为空、输出只
有空白、或输出与输入相同时判为失败。样例句子按源语言给出并经人工核对；没有样例的
语言会被跳过，而不是用另一种语言的文本去测。

## 从 OpenVoiceOS 使用

[`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)
把这个库包装成一次安装得到的两个插件：一个语种检测插件（`opm.lang.detect`，id 为
`ovos-lang-detect-plugin-linguonnx`）和一个翻译插件（`opm.lang.translate`，id 为
`ovos-translate-plugin-linguonnx`）。两者都在首次使用时加载模型，`load_detector`
和 `load_translator` 的每一个参数都可以从 `mycroft.conf` 设置。

其余内容由库的文档给出：[routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md)
讲策略和大小预算，[models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md)
讲注册表，[licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
讲许可分级——GPL-3.0 和 CC-BY-NC-4.0 的模型就在索引里，必须按名字明确要求。
