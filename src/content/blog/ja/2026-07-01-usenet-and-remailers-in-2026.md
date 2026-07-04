---
title: "2026 年の Usenet とリメーラー：汚染されていないタイムカプセルと、死ぬことを拒む privacy ネットワーク"
description: "Usenet は AI 以前の人間の言説の手つかずのアーカイブです — 数十年にわたるインターネットの歴史から得られる、LLM に汚染されていない学習データです。しかしそれは考古学だけではありません。cypherpunk のリメーラーネットワークは 2026 年でもまだ機能しており、真に匿名のメッセージングを提供します。私たちはその両方をお見せするために 2 つの小さなツールを作りました。"
date: 2026-07-01
lang: ja
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

オープンウェブのコーパスのほとんどは汚染されています — LLM が生成したテキストが Reddit、Stack Overflow、GitHub、ブログに漏れ込んでいます。Usenet は違います。数十年にわたるフレームウォー、技術的な Q&A、ニュースグループの議論、そのすべてが人間によって書かれ、言語モデルには一切触れられていません。そしてそれを掘り下げているうちに、まだ動いている別のものを見つけました。**cypherpunk のリメーラーネットワークは 2026 年でもまだ稼働しており**、決してやめなかった少数の暗号技術の愛好家たちによって維持されています。

私たちはその両方のために、2 つの小さな Python ツールを作りました。

-----

## タイムカプセル：AI 以前のコーパスとしての Usenet

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

## Cypherpunk たちは決して去らなかった

リメーラーネットワークはまだ稼働しています。

**Type-I リメーラー**（Cypherpunk リメーラー）：入れ子になった PGP 暗号化で包んだメッセージを送ります — 各ホップは 1 つの層を復号し、次へ転送します。外から見ると、メッセージはあなたではなくリメーラーから来たように見えます。最後のホップまでには、元の送信者は失われています。

**Type-II リメーラー**（Mixmaster）：ランダムなパディングを加え、ヘッダーを取り除き、転送する前にメッセージを保留し、複数のリメーラーを同時に連鎖させます。追跡がはるかに困難です。

どちらもまだ機能します。2026 年には **およそ半ダースのアクティブなリメーラー** があります。pinger ネットワークは、数十年間そうしてきたのと同じように、毎日の統計を `alt.privacy.anon-server.stats` に投稿します。2026 年 5 月時点で：

- **frannie** (mix@franxial.com) — 100% の稼働率
- **frell** (godot@remailer.frell.eu.org) — 100% の稼働率
- **yeahno** (mix@yeahno.net) — 100% の稼働率
- **dizum** (remailer@dizum.com) — 約 99% の稼働率
- **paranoia** (mixmaster@remailer.paranoici.org) — 約 92% の稼働率

**remailers** ライブラリは、それらの毎日の統計投稿をパースすることで、稼働中のネットワークを発見します：

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## 今日、それらを使う

### アカウントなしで Usenet を読む

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

### 匿名で投稿する

ほとんどのサーバーは投稿に無料アカウントを必要とします。**paganini.bofh.team** と **news.tcpreset.net** は、匿名の受信者のための伝統的なドロップである `alt.anonymous.messages` への投稿を含め、匿名の投稿を受け付けます。

### リメーラーチェーンを通じて匿名メッセージを送る

リメーラーは今でも 1990 年代の **DSA + ElGamal PGP キー** を使っています — 現代の Python の PGP ライブラリでは暗号化できない古い暗号です。私たちは **GnuPG** をシェル経由で呼び出します（古いコードが要になっています）：

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

### 返信を見つける：ハッシュ化された件名

`alt.anonymous.messages` で返信を待っている場合、件名が内容を明かしてしまうのは避けたいものです。リメーラープロトコルは **hSub** をサポートします。受信者は元の件名を SHA-256 でハッシュ化し、そのハッシュを件名として返信を投稿します。元の件名を知っている者だけが、その大量の投稿の中からそれを識別できます。

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

さらなるプライバシーのために、一部のメッセージは **eSub** を使用します — 受信者だけが復号できる暗号化された件名です。

-----

## なぜこれが今でも重要なのか

リメーラーネットワークは遅く、別の時代のために設計されています。しかしそれは **分散型で、所有者がおらず、閉鎖できません** — 召喚状を突きつける会社もなく、打ち切る対象のサービスもありません。1995 年に機能したのと同じ cypherpunk の設計が、今でも機能します。

Usenet はより稀な戦利品です。大規模で、出所のきれいな、人間が書いたテキストのアーカイブです。モデルを学習させているのであれ、データセットを構築しているのであれ、実際のインターネットの言説を研究しているのであれ、Usenet はそこにあります — きれいで、汚染されておらず、自由です。

**リポジトリ：**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Usenet を学習用データセットに収集し、アカウントなしで公開して読みます。
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — 稼働中のリメーラーを見つけ、匿名チェーンを構築し、Cypherpunk Type-I 経由で送信します。
