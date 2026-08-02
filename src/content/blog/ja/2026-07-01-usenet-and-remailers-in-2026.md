---
title: "2026 年の Usenet：学習と評価のためのきれいな AI 以前のテキストコーパス"
description: "Usenet は AI 以前の人間の言説の手つかずのアーカイブです — 数十年にわたるニュースグループの投稿はすべて人間によって書かれ、言語モデルには一切触れられていません。それが言語モデルおよび音声モデルの学習と評価にとって価値あるデータとなります。私たちはそれを収集する小さな Python ツールを作りました。"
date: 2026-07-01
lang: ja
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

オープンウェブのテキストコーパスのほとんどは汚染されています。LLM が生成したテキストが Reddit、Stack Overflow、GitHub、ブログに漏れ込んでいるため、それらで学習したモデルは部分的に他のモデルから学んでいることになります。Usenet は違います。数十年にわたるフレームウォー、技術的な Q&A、ニュースグループの議論、そのすべてが人間によって書かれ、今日の言語モデルより完全に先行しています。言語モデルや音声モデルを学習または評価する誰にとっても、出所のきれいな大規模な人間著作のテキストアーカイブは、ますます見つけにくくなっているまさにその種のデータです。

-----

## AI 以前のコーパスとしての Usenet

Usenet は数百のアクティブなグループにわたって 1 日に数千の投稿を受け取ります。アーカイブを 1980 年代まで遡れば、**数百万件の記事** が手に入ります — それぞれが、人間が実際に何を大切にし、何について議論し、何を知りたがったかのシグナルであり、引用できるほど出所がきれいです。

私たちは、この収集を簡単にする **usenet** というツールを作りました：

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

ほとんどの公開サーバーはもはや `NEWNEWS`（日付による問い合わせ）をサポートしていないため、**グループ単位の閲覧が標準的なアプローチです。** 一度に 1 つのグループをスクレイピングします — 障壁ではなく、単にプロトコルの現実です。

ニュースグループを学習用データセットに変えるために、`dataset.py` は記事を JSONL に収集します：

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

1 行に 1 記事です。それを数千件 Hugging Face に送れば、引用して再公開できる **公開されていて、人間が書いた、出所のきれいなデータセット** が手に入ります。

リポジトリ：[**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## アカウントなしで Usenet を読む

ほとんどの公開ニュースサーバーは、登録なしで読むことを許可しています：

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

## なぜこれが重要なのか

Usenet は、機械生成コンテンツの時代よりも先行する、出所のきれいな大規模な人間著作テキストのアーカイブです。モデルを学習させているのであれ、データセットを構築しているのであれ、AI 生成テキストで薄められる前のインターネットの言説を研究しているのであれ、そのアーカイブは今もそこにあり、成長し続けています。

**リポジトリ：** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Usenet を学習用データセットに収集し、アカウントなしで公開して読みます。
