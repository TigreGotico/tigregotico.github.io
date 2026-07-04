---
title: "Robots.txt、サイトマップ、そして倫理的なウェブスクレイピング"
description: "スクレイパーを構築する前に、まずサイトを偵察しましょう。sitemapper は robots.txt を読み込み、すべてのサイトマップを取得し、必要に応じてリンクグラフを巡回します。これにより、スクレイパーは力任せではなく、サイト自身の契約から出発できます。"
date: 2026-03-01
lang: ja
author: "Casimiro Ferreira"
tags:
  - "Web Scraping"
  - "Sitemaps"
  - "Ethics"
  - "Robots.txt"
  - "Data Collection"
  - "FOSS"
draft: false
---

## 力任せではなく、偵察から始める

最悪のスクレイパーは、盲目的に巡回します。サイトを叩き、crawl-delay の宣言を無視し、
データを探してあらゆるパスをかき回し、たった一つのクラス名だけ構造が変わっただけで
壊れてしまいます。最良のスクレイパーは、まずサイトを読むことから始めます。

すべてのウェブサイトは、三つの場所で契約を公開しています。**robots.txt**（巡回
ポリシー）、**サイトマップ**（サイト自身がインデックスに値すると考えるもの）、そして
**リンクグラフ**（ページが実際にどのように結びついているか）です。これらをまず読む
ことで、スクレイピングのコードを一行も書く前に、三つの問いに答えられます。

1. **このサイトはスクレイピング可能か？** robots.txt は何を許可し、どのような
   ペースで許すのか？
2. **データはどこにあるか？** サイトマップは何を明らかにするのか？
3. **サイトはどう構造化されているか？** リンクのトポロジーはどのような形をして
   いるのか？

それを行うのが **[sitemapper](https://github.com/TigreGotico/sitemapper)** です。

## 受動的な発見: robots.txt + サイトマップ

`discover()` は robots.txt と、見つけられるすべてのサイトマップを取得します。
`Sitemap:` ディレクティブ、サブサイトマップを指し示すサイトマップインデックス、
gzip で圧縮されたファイルも含めて、HTML ページを一つも巡回することなく取得します。

```python
from sitemapper import discover

info = discover("https://www.python.org")
print(info.summary())
# Base URL:         https://www.python.org
# Sitemaps found:   1
# URLs in sitemaps: 342
# Crawl-delay:      None

# What pace does the site ask for?
if info.robots.crawl_delay:
    print(f"Wait {info.robots.crawl_delay}s between requests")

# May I fetch this path?
info.robots.is_allowed("/api/users")            # True / False
info.robots.is_allowed("/admin", user_agent="MyBot/1.0")

# Every deduplicated URL the site's own sitemaps declare
for url in info.urls:
    print(url.loc, url.lastmod, url.changefreq, url.priority)
```

エージェントごとの詳細も必要なときにはそろっています。`info.robots.groups` は、
各 `User-agent` ブロックを、その `allows`、`disallows`、`crawl_delay` とともに、
ドキュメント順で保持しています。もしサイトに robots.txt がまったくなければ、
`is_allowed()` はすべてに対して `True` を返します。ポリシーの不在は、それ自体が
ポリシーなのです。

サイトマップ優先のスクレイピングの見返りはこうです。巡回によって URL を発見する
（遅く、騒がしく、不完全）代わりに、メンテナー自身のリストから出発します。サイトが
重要だと宣言したものを、サイトが許容できると宣言したペースで、ごくわずかな
リクエスト数でスクレイピングできます。

## 能動的な発見: リンクグラフ

サイトマップをまったく公開していないサイトもあります。そうしたサイトのために、
`crawl()` はベース URL から制限付きの幅優先巡回を実行し、内部ページと外向きの
リンクからなる `LinkGraph` を返します。

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

これは実際のトポロジー、つまりどのページが何にリンクしているかを教えてくれるので、
そのサイトがそもそも構造化されたスクレイパーに値するかどうかを判断できます。発見と
巡回はあえて別々の呼び出しになっています。受動的なステップは決して HTML を取得
しないので、巡回するかどうかを決める前に、いつでも礼儀正しく偵察できます。

## 同じ強靭なトランスポートの上に構築

サイトの偵察も、その偵察自体がボット対策の壁に阻まれてしまっては意味がありません。
sitemapper の HTTP はすべて
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) を通ります。
これは私たちの
**[ボット対策トランスポートに関する記事](/ja/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** で
紹介した TLS なりすましトランスポートで、これによって Cloudflare で保護されたサイト
でも robots.txt とサイトマップが返ってきます。FlareSolverr インスタンスや Wayback
Machine へのフォールバックは、環境変数（`SITEMAPPER_FLARESOLVERR_URL`、
`SITEMAPPER_WAYBACK_FALLBACK=1`）または `Sitemapper` クラスを通じて有効化できます。

## なぜこれが重要なのか

**Crawl-delay**: `Crawl-delay: 2` を宣言しているサイトは、どのくらいの速さで
アクセスされたいかをあなたに伝えています。それを無視すればブロックされるか、あるいは
みんなにとってサイトを劣化させてしまいます。それを尊重すれば、あなたのスクレイパーは
フェアにふるまいます。

**巡回よりもサイトマップ**: サイトマップは、サイトがインデックスされたいものを
一覧にしています。盲目的なリンク巡回は、同じコンテンツを見つけるために五倍もの URL に
触れることがあります。サイトマップが存在するなら、そこから始めましょう。あなたにとって
より速く、サーバーにとってより軽いのです。

**コードの前にスコープを**: robots.txt で明確にスクレイピングを禁止しているサイトも
あれば、必要なものをすべて含むサイトマップをすでに持っているサイトもあります。
`discover()` の十秒が、パーサーに投資する前に、自分がどの状況にいるのかを教えて
くれます。

## ツール

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

ライブラリとして、あるいはコマンドラインから使えます。`--json` は発見結果の全体を
出力して他のツールへパイプできるようにし、`--crawl` はリンクグラフのステップを
追加します。

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json
```

これはフリーソフトウェアであり、あなた自身のハードウェア上で動作します。すべての
スクレイパーを偵察から始めましょう。
