---
title: "2026 年的 Usenet 与 Remailer：一个干净的时间胶囊，以及一个拒绝消亡的隐私网络"
description: "Usenet 是前 AI 时代人类话语的一份原始档案——来自数十年互联网历史、不含 LLM 的训练数据。但它不只是考古：赛博朋克式的 remailer 网络在 2026 年仍然运作，提供真正的匿名消息传递。我们构建了两个小工具，带你领略这两者。"
date: 2026-07-01
lang: zh
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

大多数开放网络语料都被污染了——LLM 生成的文本已经渗入 Reddit、Stack Overflow、GitHub、博客。Usenet 不一样：数十年的骂战、技术问答和新闻组争论，全部由人类撰写，无一被语言模型触碰过。而在深挖它的过程中，我发现还有别的东西仍在运行：**赛博朋克式的 remailer 网络在 2026 年仍在运作**，由一小群从未停下的密码学爱好者维护着。

我们为这两者各构建了一个小巧的 Python 工具。

-----

## 时间胶囊：作为前 AI 语料的 Usenet

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

## 赛博朋克从未离开

remailer 网络仍在运行。

**I 型 remailer**（Cypherpunk remailer）：发送一条包裹在嵌套 PGP 加密中的消息——每一跳解密一层，然后转发给下一跳。从外部看，消息看起来来自 remailer，而不是你。到了最后一跳，原始发送者已经丢失。

**II 型 remailer**（Mixmaster）：加入随机填充、剥除头部、在转发前扣留消息，并同时链式经过多个 remailer。要追踪难得多。

两者都仍然管用。2026 年大约有 **半打活跃的 remailer**。pinger 网络每天把统计数据发布到 `alt.privacy.anon-server.stats`，几十年来一直如此。截至 2026 年 5 月：

- **frannie**（mix@franxial.com）—— 100% 正常运行时间
- **frell**（godot@remailer.frell.eu.org）—— 100% 正常运行时间
- **yeahno**（mix@yeahno.net）—— 100% 正常运行时间
- **dizum**（remailer@dizum.com）—— 约 99% 正常运行时间
- **paranoia**（mixmaster@remailer.paranoici.org）—— 约 92% 正常运行时间

**remailers** 库通过解析那些每日统计帖来发现活跃的网络：

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## 今天就用起来

### 无账户阅读 Usenet

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

### 匿名发帖

大多数服务器要求一个免费账户才能发帖。**paganini.bofh.team** 和 **news.tcpreset.net** 接受匿名发帖，包括发往 `alt.anonymous.messages`——匿名收件人的传统投递点。

### 经由 remailer 链发送匿名消息

remailer 仍然使用 1990 年代的 **DSA + ElGamal PGP 密钥**——现代 Python PGP 库无法向其加密的老旧密码学。我们外壳调用 **GnuPG**（那些老代码是承重的）：

```python
from remailers.network import fetch_live_remailers, fetch_keyring_blob
from remailers.gpg import GPGKeyring
from remailers.cypherpunk import build_chain

remailers = fetch_live_remailers()

# the published keyring is full of DSA/ElGamal keys -> use the GnuPG backend
with GPGKeyring(fetch_keyring_blob()) as gpg:
    have = set(gpg.recipients())
    chain = [r for r in remailers
             if r.is_cpunk and r.accepts_pgp and r.address in have][:3]

    # nest a PGP layer per hop; the exit posts to a newsgroup
    message, entry = build_chain(
        hops=[(r.address, r.address) for r in chain],
        anon_post_to="alt.anonymous.messages",
        body="Hello from the shadows",
        encrypt=gpg.encrypt,
    )

# `message` goes to `entry` over SMTP (remailers.cypherpunk.send_chain) —
# the one piece you bring yourself: an email sender.
```

### 寻找回复：哈希主题

如果你在 `alt.anonymous.messages` 上等待回复，你不会希望主题泄露内容。remailer 协议支持 **hSub**：接收方用 SHA-256 对原始主题做哈希，并把哈希作为主题来发布回复。只有知道原始主题的人才能在信息洪流中辨认出它。

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

为了更高的隐私，有些消息使用 **eSub**——只有接收方能解密的加密主题。

-----

## 为什么这仍然重要

remailer 网络很慢，是为一个不同的时代设计的。但它是 **去中心化的、无主的、无法被关停的**——没有公司可以传唤，没有服务可以停办。1995 年管用的那套赛博朋克设计，如今依然管用。

Usenet 则是更稀有的珍宝：一份规模化、来源干净、人类撰写文本的档案。无论你是在训练模型、构建数据集，还是研究真实的互联网话语，Usenet 就在那里——干净、未被污染、自由。

**仓库：**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) —— 把 Usenet 采集成训练数据集；无账户公开阅读。
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) —— 找到活跃的 remailer，构建匿名链，经由 Cypherpunk I 型发送。
