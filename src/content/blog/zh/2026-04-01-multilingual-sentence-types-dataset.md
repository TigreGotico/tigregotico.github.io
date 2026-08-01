---
title: "多语言句型数据集：疑问句、命令句、陈述句"
description: "我们发布了 sentence-types-multilingual —— 涵盖七种语言、近 70,000 个句子，按语法类型（疑问句、命令句、陈述句、感叹句）分类。它是 little_questions 路由库背后的训练语料库。"
date: 2026-04-01
lang: zh
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

语音助手的路由逻辑，取决于在尝试回答任何内容之前，先弄清楚它收到的是哪种句子。疑问句需要一个答案。命令句需要被执行。陈述句可能需要确认或存储。无论用户使用哪种语言，把这个分类做对，都是其他一切工作的前提。

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** 就是这一层背后的训练语料库 —— 69,300 个已标注的句子，七种语言各 9,900 个：英语、西班牙语、法语、德语、意大利语、葡萄牙语和荷兰语。

## 这些标签在实践中意味着什么

该数据集使用一组扁平的六个标签——每行一个 `label` 列，没有类型/子类型的划分——它们直接对应 `little_questions`（消费这些数据的推理库）对话语进行路由的方式：

- **wh_question** —— 围绕一个 wh 疑问词构建的问句（what、where、who 等等）。
- **polar_question** —— 是/否问句。`little_questions` 内部的 EAT 分类法在问句标签之上又增加了 53 个细粒度的答案类型标签（人物、地点、数量、定义等等），但句型分类是第一道关卡。
- **command** —— 祈使形式。命令句不期待一个答案；它们期待一个动作。
- **request** —— 礼貌或间接的行动请求，有别于直接的祈使句。
- **statement** —— 陈述形式。对话语境中的陈述句往往带有对下游有影响的极性：一个是/否/也许分类器会在陈述句上运行，以解读对先前问题的回答。
- **exclamation** —— 带有情感标记的话语，需要与中性陈述句不同的处理方式。

```json
{
  "language": "en",
  "label": "wh_question",
  "text": "What time is it?"
}
```

## 为什么跨语言覆盖并不简单

同样的交际意图在不同的语法中会以不同的方式呈现：

- 英语通过词序倒装来标记疑问句；葡萄牙语和西班牙语则常常仅凭标点和语调来标记它们，而不改变词序。
- 德语会把动词分离到句末位置，这些方式改变了分类信号所在的位置。
- 罗曼语族对命令使用专门的祈使形态，而英语则用动词的原形来表达。

一个仅在英语上训练的模型，在其他所有语言上都会出错。跨这七种语言的平行标注数据，为按语言划分的分类器提供了它们所需的跨语言信号 —— 而随着更多语言的加入，同一套生成流水线也能扩展到这些语言。

## 下游技术栈

在这些数据上训练出的模型，随 **[little_questions](https://github.com/TigreGotico/little_questions)** 一同发布 —— 这是一个零依赖的离线库（numpy + onnxruntime），配有按语言划分的、用于句型分类的 ONNX 分类器，以及一个支持 43 种语言的是/否极性模型。英语的模型直接打包进 wheel，其他语言的模型则按需惰性下载。句型分类器以 `TigreGotico/sentence-types` 的名义发布在 HuggingFace 上；EAT 答案类型分类器则是内部训练的，并未公开发布。

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` 是 OVOS 和 LILACS 的自然语言路由层：判断一句话语是疑问句、命令句还是陈述句，是语音流水线所做的第一个分派决策。

[**HuggingFace 上的 sentence-types-multilingual**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**GitHub 上的 little_questions**](https://github.com/TigreGotico/little_questions)
