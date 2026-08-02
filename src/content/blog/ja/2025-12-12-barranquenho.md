---
title: "バランケーニョ語で初となる音素変換器のご紹介"
description: "g2p_barranquenho は、ポルトガルのバランコスで話されるイベロ・ロマンス系接触言語バランケーニョ語のための、初となるオープンな書記素-音素変換器です。規則は同自治体が新たに公開した正書法規約から導出されており、リポジトリに収録された原典に照らして検証できます。"
date: 2025-12-12
updated: 2026-08-01
lang: ja
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) は、[バランケーニョ語](https://en.wikipedia.org/wiki/Barranquenho)のための初のオープンな書記素-音素変換器です。バランケーニョ語は、ポルトガルのバランコスで話されるイベロ・ロマンス系の接触言語であり、バランコスはスペイン国境沿いの自治体で、そこでは何世紀にもわたってポルトガル語とエストレマドゥーラ／アンダルシアのスペイン語が共存してきました。

### バランケーニョ語が音韻論的に興味深い理由

バランケーニョ語はポルトガル語の方言でもスペイン語の方言でもなく、真に独自の体系です。バランコス市議会は最近、辞書、正書法規約、基礎文法という3つの基盤的文書を公開し、これらが我々に必要な規則を提供してくれました。その発表がこちらです。["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha)。

その正書法規約から規則セットを導出しました — ただし、テキストに対して専用のパスを手作業で組む代わりに、共有エンジンである **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** の中の言語仕様 `ext-PT-x-barrancos` として存在しています。この仕様の書記素表、異音規則、アクセントモデル、語をまたぐサンディ（連音）が、バランケーニョ語のあらゆる実現形を記述します。複数文字からなる書記素は規約が文書化しているとおりにまとめられ（`tch` → /tʃ/、`ch` → /ʃ/、`nh` → /ɲ/、`lh` → /ʎ/）、鼻母音二重母音は `m`/`n` の前に現れ、`v` は常に /b/ にマッピングされ、`h` はいずれの親言語とも異なり発音される /h/ として現れます。

`g2p_barranquenho` 自体は、その仕様によって駆動される `orthography2ipa.G2P` の上に薄く被さる呼び出し側のラッパーです。テキストの正規化（大文字小文字の統一、仕様が期待する形へのトークン化）、数字の展開、安定した `phonemize`/`transcribe` インターフェースはこのラッパーが担いますが、音韻規則自体は担いません — 規則を改善するには上流（upstream）の仕様を編集する必要があり、そうすればすべてのダウンストリームの利用者がその修正を共有します。

実際には次のようになります。

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ˈũ eˈnɔɾmi ˈpas̺u ˈpaɾɐ ˈu bɐrɐ̃ˈkɛɲu ˈi ˈpaɾɐ ɐ kuˈltuɾɐ bɐrɐ̃ˈkɛɲɐ`

原典の PDF（規約、辞書、文法）はリポジトリのルートに収録されており、規則をその原典に照らして検証できます。

### 次に来るもの

G2P 変換器は、TTS および ASR の作業のための最低限の前提条件です。それがなければ、テキストで学習したモデルには原理的な音声的基盤がありません。それがあれば、バランケーニョ語の音声モデルへの道は、我々がアストゥリアス語やアラゴン語で用いたのと同じハイブリッドパイプラインをたどります — 障害となるのは音声データであって、ツールではありません。

**話されるバランケーニョ語の録音をお持ちの方、またはオープンライセンスのもとで貢献してくださる話者にアクセスできる方は、ぜひご連絡ください。** ネイティブ話者による録音は、たとえ数時間であっても、TTS モデルを実現可能にします。

→ [GitHub 上の g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)
