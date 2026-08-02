---
title: "ポルトガル語のための古典的NLP: 音節分割と書記素から音素への変換"
description: "ルールベースで完全にオフラインで動作する当社のポルトガル語NLPスタック — 音節分割を行う silabificador と、方言を考慮した書記素から音素への変換を行う TugaPhone — を紹介し、それらがルソフォン諸変種を対象とするより広範な orthography2ipa の取り組みとどのように結びつくかを解説します。ディープラーニングのブラックボックスはありません。決定論的で、高速、依存関係も最小限です。"
date: 2026-02-28
updated: 2026-08-01
lang: ja
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

ポルトガル語において音節がどこで区切られるか、アクセントがどこに置かれるか、そして綴りがどのように音へと対応づけられるかは、誰かがニューラルネットワークを訓練するはるか以前に言語学者が書き留めたルールに従います。それらのルールが明示的である場合、適切なツールとは、読んで、監査し、どこででも実行できる、小さく決定論的で完全にオフラインなライブラリです。それが当社の古典的なポルトガル語NLPスタックの背後にある哲学です。音節分割のための [silabificador](https://github.com/TigreGotico/silabificador) と、書記素から音素への変換 (G2P) のための [TugaPhone](https://github.com/TigreGotico/tugaphone) です。

### なぜ古典的手法か、そしてなぜ今か

音声学は、決定論的ルールが真価を発揮する分野のひとつです。ポルトガル語の音節分割の境界ルールとその正書法の規則性はよく文書化されているため、手作りのルールエンジンは一行ずつ検証できる転写を生成します。GPUも、モデルのダウンロードも、ネットワーク呼び出しも不要です。これはデータ主権にとって重要です。ルソフォンの音声パイプラインが、ある単語をどう発音するかを知るためだけに、そのテキストをリモートAPIに送信しなければならないなどということはあってはなりません。また、速度とフットプリントの点でも重要です。これらのライブラリは依存関係が少なく、ノートパソコンでも、サーバーでも、組み込みデバイスでも同じように容易に動作します。

### silabificador: 音節の境界

`silabificador` は、完全に手作りのルールから構築された軽量なポルトガル語音節分割器で、**依存関係はありません**。インターフェースは見た目どおりに小さなものです。

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

これは [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org) のクリーンなデータを用いて調整・テストされ、[Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon) — 同じソースから引き出された10万件を超えるエントリからなるオープンなデータセット — で評価されました。音節分割はアクセント付与、ハイフネーション、音素転写のための基礎的なステップであるため、それを正確かつ高速に行うことは下流のあらゆる処理で報われます。

### TugaPhone: 方言を考慮した書記素から音素への変換

`TugaPhone` は任意のポルトガル語テキストをIPAへと変換し、それを主要なルソフォン方言 — ヨーロッパ (`pt-PT`)、ブラジル (`pt-BR`)、アンゴラ (`pt-AO`)、モザンビーク (`pt-MZ`)、東ティモール (`pt-TL`) — にわたって行います。重要なのは、すべてを単一の「標準」へと平坦化するのではなく、方言の変異を保持することです。同じ文でも、それが話される場所に応じて異なる形で出力されます。

```
Choveu muito ontem à noite.
pt-PT → ʃuˈvew ˈmũjtu ˈõtɐ̃j a ˈnojt
pt-BR → ʃoˈvew ˈmwĩtʊ ˈõtẽj a ˈnojtʃɪ
pt-AO → ʃoˈvew ˈmũjntʊ ˈõntẽj a ˈnojtɨ
pt-MZ → ʃoˈvew ˈmũjtu ˈõtẽj a ˈnɔjtɨ
pt-TL → ʃoˈvew ˈmujtʊ ˈõntɐ̃j a ˈnojtʰ
```

内部的には、TugaPhone は共有される `orthography2ipa` 候補ラティスエンジンを駆動し、そのエンジン自身の拡張ポイントを通じてポルトガル語固有の関心事をその上に重ねます。既知の単語についてはキュレーションされた音声辞書(上記と同じ Portuguese Phonetic Lexicon)を参照し、辞書にないもの — 名前、新語、外来語 — についてはラティスが方言の書記素規則と異音規則から候補を生成します。

特に触れておくべき詳細が2つあります。**数値正規化**は、数字を正しい性と数の一致を伴ったポルトガル語の話し言葉の形へと変換します。

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
```

さらに、スケールの慣習にも従います — `pt-PT` では長スケールの `biliões`、`pt-BR` では短スケールの `trilhões` です。**同綴異義語の曖昧性解消**は [bifonia](https://github.com/TigreGotico/bifonia) ライブラリに委譲されます。このライブラリは、どの異音同綴語が存在し、どちらの読みを持つかについての意味論的知識を所有しています — そのため前置詞としての `para` は動詞としての `para` とは異なる扱いを受けます — そしてラティスが文を目にする前に、選ばれた読みを追加の分音記号で印付けます。

TugaPhone は共有される `orthography2ipa` 候補ラティスを駆動することで音素化を行います。方言の選択とは、まさに `orthography2ipa` の方言仕様の選択*であり*、そのため両唇音化、ポルトの上昇二重母音、マデイラの /l/ の口蓋化、アゾレスの /u/ の前舌化、語末摩擦音のサンディなどの方言現象は、後付けの文字列編集ではなくラティス自体から生じます。TugaPhone が加えるのは、`orthography2ipa` が意図的に呼び出し側に委ねている部分だけであり、それ自身の拡張ポイントを通じて接続されます。性を考慮した数詞・序数詞の展開と bifonia の異音同綴語の印付けは、ラティスがテキストを目にする前のエンジンの正規化段階として実行されます。**[Tugalex](https://github.com/TigreGotico/tugalex)** のキュレーションされた発音辞書は `orthography2ipa.register_lexicon` を通じて方言ごとに登録されるため、カバーされている単語は仕様自身の例外と同じ上書き経路に折り込まれ、ラティスは辞書がカバーしない単語についてのみ候補を生成します。音節分割は `orthography2ipa` 自身の `silabificador` を裏付けとするプラグインから得られるため、アクセントは TugaPhone がそれ以外の場合に選んだであろうのと同じ音節に落ち着きます。小さく組み合わせ可能な部品が共有エンジンに供給される形です — それぞれが単独でも有用です。

TugaPhone はその限界について正直です。辞書のカバレッジはアフリカと東ティモールの方言についてはより疎であり、サブ地域のアクセント(Porto、Minho、Braga など)は文書化された特徴の実験的な近似であり、文レベルの韻律は簡略化されています。これらは隠された失敗モードではなく、公然と文書化された制限です。

### より広い視野: orthography2ipa

ポルトガル語は多くの変種のひとつにすぎず、同じエンジニアリングパターンが一般化します。[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) は、言語学的に動機づけられた書記素→IPAおよび異音のマッピングからなる純粋データのPythonパッケージで、20以上の語族にわたる820の言語を網羅しています。これは、まともなG2Pシステムが必要とする明確な区別を描き出します。**書記素マップ**はある綴りがどの音素を表し*得る*かを示し、**異音マップ**はある音素が特定の文脈で実際にどう*実現される*かを示します。地域変種はそれ自身の仕様としてモデル化され、重み付けされた複数祖先の系統を通じてリンクされているため、方言の木はデータを複製する代わりに親から継承します。

これは TugaPhone における `pt-PT`、`pt-BR`、`pt-AO`、`pt-MZ`、`pt-TL` の背後にあるのと同じ発想です。各ルソフォン変種を、単一の正典的なアクセントからの逸脱としてではなく、それ自身のルールを持つ一級の存在として扱うのです。データは宣言的であり、ロジックは薄くプラグ可能です — ルールを読み、その出典を引用し、出力を信頼できます。

### 試してみる

ここで紹介したものはすべてオープンソースであり、今日インストールできます。

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

より広範な多言語マッピングについては、[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) をご覧ください。決定論的で、高速で、オフラインで、ポルトガル語圏の全幅にわたって構築されています。

このポルトガル語音声学スタックは、当社の **[820の言語のための書記素からIPAへの取り組み](/ja/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** の上に築かれており、**[じゃがいもでも動くTTS](/ja/blog/2026-05-10-tts-that-runs-on-a-potato)** と **[Miro & Dii の多言語ボイス](/ja/blog/2026-06-15-two-voices-every-language-miro-and-dii)** の音声学的な背骨を形成しています。
