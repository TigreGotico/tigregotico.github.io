---
title: "回復力ある公開データアクセスのための、組み合わせ可能でそのまま差し替えられる requests セッション"
description: "ホットパスでヘッドレスブラウザを使わずに公開 Web ページを確実に読み取るための、組み合わせ可能な 2 つの requests.Session サブクラス: TLS 互換のトランスポート、JS チャレンジ向けの FlareSolverr プロキシ、Wayback Machine へのフォールバック、そして IP を分散させるリクエスト — unblock_requests と anon_requests。"
date: 2026-03-15
lang: ja
author: "Casimiro Ferreira"
tags:
  - "HTTP"
  - "Scraping"
  - "Cloudflare"
  - "Anti-Bot"
  - "Python"
  - "Open Source"
draft: false
---

私たちの仕事の多く — メディアメタデータのクライアント、カタログのエンリッチ、
アーカイブ — は、**公開**された Web ページを確実に読み取ることに依存しています。
問題となるのはたいていデータそのものではなく、多くのボット検出インフラが
スクリプトによる攻撃を狙って調整されているせいで、行儀の良い非ブラウザクライアントも
それとして誤分類されてしまうことです。それは2つの別々の軸で起こります。

- **「お前は何者だ?」** — Cloudflare やその類は、あなたが*何を*要求するかではなく、
  通信路上でどう*見えるか*でリクエストに印を付けます。つまり TLS ハンドシェイク、
  JA3 フィンガープリント、JavaScript チャレンジを実行できるかどうか、です。素の
  `requests` のハンドシェイクはブラウザのものとはまったく異なって見えるため、
  トラフィック自体は無害であっても、スクリプトによる悪用を狙ったチェックに
  引っかかります。
- **「お前は誰だ?」** — IP レピュテーションやレート制限はフィンガープリントを完全に
  無視し、1 つのアドレスからどれだけのリクエストが来るかを数えます。これは悪用する
  クライアントと同じくらい容易に、行儀の良い単一のクライアントにも不利に働き得ます。

この 2 つの軸は直交しているため、私たちはきれいに積み重ねられる 2 つの小さな
ライブラリでそれぞれに答えます。**unblock_requests** が*お前は何者だ*に答え、
**anon_requests** が*お前は誰だ*に答えます。どちらも日常のコードにおける
`requests` セッションのそのまま差し替え可能な代替です。この記事は特にその
トランスポート層 — 通信路上のバイトの部分 — についてのものであり、その上に乗る
パースやパイプラインについてではありません。

**範囲を明確にしておきます。** これらのトランスポートは公開されている、認証不要の
ページのみを対象とします。`robots.txt` と宣言された crawl-delay を尊重します —
スクレイパーを書く前にそれをどう確認するかは私たちの
**[robots.txt とサイトマップに関する記事](/ja/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
をご覧ください — そして、この上に構築されるすべてのクライアントは低いリクエスト量に
抑えられているため、対象のオリジンが私たちから意味のある負荷を受けることは決して
ありません。これは後から付け加えた免責事項ではなく、これらのセッションがどう
使われるかについての実質的なエンジニアリング上の制約です。回復力がありながら
配慮に欠けるクライアントは、それ自身の目的を裏切ることになるからです。

## 設計上の制約: `requests` の形を保つ

`unblock_requests` のセッションは `requests.Session` をサブクラス化し、
`request()` だけをオーバーライドします — それ以外のすべて(`.get()`、`.post()`、
Cookie、ヘッダー、コンテキストマネージャのセマンティクス)は継承されるため、
`requests.Session` に対して型付けされたものは一切変更なしにこれらを受け入れます。
`anon_requests` のセッションはサブクラス化ではなくラップします — 同じ動詞メソッドと
コンテキストマネージャのインターフェースを公開しますが、ローテーションのたびに
内部セッションを再構築します。

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

倫理面とエンジニアリング面の姿勢がすべて 1 行に表れています。私たちは
ブラウザをユーザーとして自動操作しているのではなく、すでに公開されている
データのために*回復力ある HTTP クライアント*を作っているのです。画面付きの
ブラウザが誰かの画面にポップアップすることはなく、ホットパスにディスプレイは
一切必要ありません。

## 第 1 層: `unblock_requests` とそのトランスポート

`unblock_requests` は、素の Python クライアントを**ブラウザ向けに調整された
ボット検出チェック**と相互運用可能にします。トランスポートは
`mode=` キーワード引数(または環境変数 `UNBLOCK_REQUESTS_TRANSPORT` — 明示的な
キーワード引数が常に優先されます)で選びます。主要な 4 つは次のとおりです。

| モード | 何をするか |
|---|---|
| `curl_cffi` *(デフォルト)* | `curl_cffi` による Chrome の TLS/JA3 なりすまし。追加のインフラなしで、ほとんどのネットワークでブラウザ形のハンドシェイクとして通過します。 |
| `requests` | 素の `requests`、なりすましなし。 |
| `flaresolverr` | JS チャレンジを解く FlareSolverr ヘッドレスブラウザ経由でプロキシします — **ライブ**データ。 |
| `wayback` | Internet Archive の最新スナップショットを読みます — 古いデータですが、何も必要としません。 |

デフォルトの `curl_cffi` は手軽な勝ち筋です。「お前はボットだ」という判定の
大半は TLS フィンガープリントの不一致です。素の `requests`(OpenSSL 経由)は
Chrome とはまったく似ていないハンドシェイクを行います。`curl_cffi` は実際の
Chrome ビルドになりすます(デフォルトで `impersonate="chrome"`)ため、
ハンドシェイクと JA3 が一致し、チェックは単純に通ります。JavaScript は実行されず、
ブラウザも起動されません。

サイトが本物のインタラクティブな JS チャレンジにエスカレートすると、`curl_cffi`
では不十分です — 何かがチャレンジを実行しなければなりません。そこで登場するのが
`flaresolverr` モードです。自分でホストする
[FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) インスタンスが
ヘッドレスブラウザで**あなたのプロセスの外で**解決を行い、`unblock_requests` は
そこに POST して、解決済みの HTML をレスポンスから取り出すだけです。
`flaresolverr_url` を設定すると、このモードが自動的に選択されます。

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## アーカイブへの緩やかな縮退(グレースフルデグラデーション)

インフラには調子の悪い日があります — FlareSolverr がダウンしている、サイトに
到達できない、チャレンジが今この瞬間には解けない。ジョブ全体を失敗させる代わりに、
セッションは **Wayback Machine** にフォールバックできます。チャレンジの検出は
ヒューリスティックです。小さな `is_challenge()` ヘルパーが本文の先頭部分を嗅ぎ回り、
Cloudflare のインタースティシャルを示す典型的なマーカー("just a moment"、
`challenge-platform`、`cf_chl_opt`、`cf-mitigated`)を探します。ブロックされた
GET に対して `wayback_fallback` が有効であれば、セッションは `archive.org` の
可用性 API 経由で最新のスナップショットを解決し、その生バイトを返します
(ツールバーやリンクの書き換えのない `…id_/` 生形式)。archive.org は Cloudflare
でゲートされていないため、素の `requests` でも到達できます。

知っておく価値のある実装上の注意点が 2 つあります。`wayback` および
`flaresolverr` モードでは、結果は取得した HTML から構築された*合成*ではあるが
本物の `requests.Response` です — そのため `stream=`、カスタムアダプター、
コネクションプーリングはそこでは適用されません。一方 `requests`/`curl_cffi`
モードは完全にネイティブです。そして、フォールバックが発動するのは GET に対して
のみです。私たちがミューテーションを伴うリクエストをアーカイブから黙って
再実行することは決してありません。

## 第 2 層: `anon_requests` と IP ローテーション

直交するもう 1 つの問題が **IP レピュテーション**です。完璧にブラウザ形の
ハンドシェイクであっても、すべてのリクエストが 1 つのアドレスから来れば、
レート制限を受けることがあります — 物量ベースのヒューリスティックはフィンガー
プリントではなくアドレスを見るからです。`anon_requests` は `RotatingProxySession`
(スクレイプした公開プロキシ、任意のバリデーション、SOCKS5/HTTP)と
`RotatingTorSession`(ローテーションする Tor 回路)で複数のアドレスに負荷を
分散させ、リクエスト量の少ないクライアントが単一の IP からサイトを叩いている
クライアントと誤認されないようにします。各リクエストは新しい出口を通って外に
出て行き、死んだプロキシは接続失敗時にローテーションで外されます。

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## 組み合わせ: 分散された負荷**と**互換性のあるハンドシェイクを同時に

この 2 つのライブラリは、重複させるのではなく積み重ねるように設計されています。
`anon_requests` のセッションは `session_factory` を受け付けます — これは
`requests.Session` を返す任意の callable で、デフォルトは `requests.Session` です。
ローテーションとプロキシの設定は、そのファクトリが返すものに対して適用されます。
そのため、`CloudflareSession` をファクトリとして注入すれば、1 つのオブジェクトから
両方の振る舞いが得られます。

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # spreads load across IPs *and* uses a browser-compatible handshake
```

ローテーションされたプロキシは*すべての*トランスポートを流れます — FlareSolverr の
内部にまで及び、FlareSolverr は解決リクエストの `proxy` フィールドを通じて
ヘッドレスブラウザを駆動します。つまり、ハンドシェイク、チャレンジの解決、出口 IP を
含むリクエスト全体が最初から最後まで一貫しており、これは1人以上の訪問者に見せかけ
ようとしないクライアントにとって、ただ単に正しい振る舞いです。

## なぜこの形なのか

それぞれの関心事を独自の薄い `requests.Session` サブクラスとして保つということは、
呼び出し側が必要なものだけを選べる — TLS なりすましだけ、ローテーションと解決を
合わせた完全なスタック、あるいはその中間の何か — ということを意味し、それを
コンストラクタの差し替えで実現します。HTTP コードを書き直す必要はありません。
高価で重量級のツール(本物のブラウザ)は FlareSolverr の中で*プロセスの外*に
留まり、JS チャレンジが本当にそれを要求するときにだけ呼び出されます。よくある
ケースは安価な、なりすましハンドシェイクです。そしてライブの Web が拒否したとき、
アーカイブが答えてくれます。

`session_factory` という継ぎ目こそが組み合わせの起こる場所であり、これが
ライブラリを独立して拡張可能に保ちます。`unblock_requests` にトランスポート
モードを追加すれば、`anon_requests` はそれをタダで組み合わせます。公開データへの
回復力あるアクセスを、きれいに実現しています。

どちらも FOSS でセルフホスト可能です:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) と
[`anon_requests`](https://github.com/TigreGotico/anon_requests)。

これらのトランスポートは、私たちの**[音楽データベーススクレイパー](/ja/blog/2026-04-20-music-database-scrapers)**のすべてを支えています。スクレイパーを構築する前のサイト調査については、**[sitemapper](https://github.com/TigreGotico/sitemapper)** と **[robots.txt とサイトマップに関する記事](/ja/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**をご覧ください。
