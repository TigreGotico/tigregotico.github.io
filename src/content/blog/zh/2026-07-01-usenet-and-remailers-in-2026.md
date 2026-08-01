---
title: "2026 年的 Usenet：一份用于训练与评估的干净、前 AI 文本语料"
description: "Usenet 是前 AI 时代人类话语的一份原始档案——数十年的新闻组帖子，全部由人类撰写，无一被语言模型触碰过。这让它成为语言与语音模型训练和评估中很有价值的数据。我们构建了一个小巧的 Python 工具来采集它。"
date: 2026-07-01
lang: zh
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

大多数开放网络文本语料都被污染了：LLM 生成的文本已经渗入 Reddit、Stack Overflow、GitHub 和博客，因此在它们之上训练出来的模型，有一部分其实是在向其他模型学习。Usenet 不一样。它是数十年的骂战、技术问答和新闻组争论，全部由人类撰写，完全早于当今的语言模型。对于任何在训练或评估语言与语音模型的人来说，一份来源清晰、规模庞大的人类撰写文本档案，正是如今越来越难找到的那种数据。

-----

## 作为前 AI 语料的 Usenet

Usenet 每天在数百个活跃组中收到数千篇帖子。回溯到 1980 年代的档案，你就有了 **数百万篇文章**——每一篇都是人类真正在意什么、争论什么、想知道什么的信号——其来源之清晰足以引用。

我们构建了一个名为 **usenet** 的工具，让采集这些内容变得简单直接：

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

大多数公共服务器不再支持 `NEWNEWS`（按日期查询），所以 **按组浏览是标准做法。** 你一次抓取一个组——这不是障碍，只是协议的现实。

要把一个新闻组变成训练数据集，`dataset.py` 会把文章采集成 JSONL：

```
{
  "group": "comp.lang.python",
  "message_id": "<12345@example.com>",
  "subject": "Best practices for list comprehensions",
  "author": "Alice",
  "date": "1999-03-15T10:22:00Z",
  "language": "en",
  "text": "In my experience, list comprehensions are most readable when...",
}
```

一行一篇文章。把几千篇推送到 Hugging Face，你就有了一个 **公开可用、人类撰写、来源干净的数据集**，可供引用和再发布。

仓库：[**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## 无账户阅读 Usenet

大多数公共新闻服务器允许你无需注册就能阅读：

```python
from usenet import UsenetServer

servers = [
    "news.neodome.net",
    "news.samoylyk.net",
    "freenews.netfront.net"
]

for server in servers:
    try:
        with UsenetServer(server) as s:
            articles = s.get_articles("alt.test", limit=5)
            print(f"Success on {server}: {len(articles)} articles")
            break
    except OSError:
        continue
```

-----

## 为什么这很重要

Usenet 是一份规模化、来源干净的人类撰写文本档案，早于机器生成内容的时代。无论你是在训练模型、构建数据集，还是研究被 AI 生成文本稀释之前的互联网话语，这份档案依然存在，并且仍在增长。

**仓库：** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) —— 把 Usenet 采集成训练数据集；无账户公开阅读。
