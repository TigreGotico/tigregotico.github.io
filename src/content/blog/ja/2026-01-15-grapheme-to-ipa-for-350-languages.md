---
title: "350以上の言語に対応するグラフェムからIPAへの変換"
description: "orthography2ipa は、純粋なデータで構成され言語学的な裏付けを持つリソースであり、綴りをIPAに対応づけ、350以上の言語コードと20以上の語族にわたって音素が異音としてどのように表出するかをモデル化します。maximal-munch トークナイザー、音韻的距離および文字体系距離の指標、方言系統、そしてスキーマ検証済みの仕様セット — 訓練済みの重みは一切なく、完全にセルフホスト可能です。"
date: 2026-01-15
lang: ja
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** は、純粋なデータで構成された Python パッケージです。宣言的な JSON、薄くプラグ可能なロジックからなり、訓練済みの重みは一切ありません。綴りを IPA に対応づけ、それらの音素が文脈の中でどのように表出するかを **394 の言語仕様と 20 以上の語族**にわたってモデル化します。インストールし、データを読み、データを fork してください。checkpoint の中に隠されているものは何もありません。

これは下流のすべてを支えています。ポルトガル語に特化した [silabificador](https://github.com/TigreGotico/silabificador) と [TugaPhone](https://github.com/TigreGotico/tugaphone) のスタック（**[ポルトガル語の音節と音素のための古典的NLP](/ja/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** を参照）、バランケーニョ語の G2P、そして **[ジャガイモでも動くTTS](/ja/blog/2026-05-10-tts-that-runs-on-a-potato)** の音素的基盤です。

## 1つではなく2つのマップ

決定的な区別があります。**グラフェムマップ**は、ある綴りがどの音素を表し*得る*かを教えてくれます。**異音マップ**は、ある音素が文脈の中でどのように*表出する*かを教えてくれます。この2つを混同することが、G2P システムにおける最も一般的な失敗モードです。

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

英語の ⟨th⟩ は /θ/ と /ð/ の間で本当に曖昧です。これは綴りから音素への事実です。英語の /t/ は、それがどこに位置するかに応じて、単純な閉鎖音、有気閉鎖音、声門閉鎖音、あるいは弾き音として現れます。これは音素から表出への事実です。この2つを分けておくことで、転写のためには*テキスト → 音素候補*へ、発音モデリングのためには*音素 → 表面的表出*へと進むことができ、一方が他方を汚染することがありません。TTS にとってそれは、信じられるアクセントとロボット的なアクセントの違いです。ASR にとってそれは、人々が実際に話す内容に一致する語彙集と、辞書に一致する語彙集との違いです。

## 各言語が持つもの

各言語は凍結された `LanguageSpec` データクラスであり、音素のリストよりもはるかに多くのものを持っています。グラフェム（二重字や三重字を含む）、異音マップ、文脈依存の上書きのための**位置的グラフェム**（語頭、母音間、/i/ の前）、重み付きで複数の祖先を持つ**系統**、語をまたぐ**サンディ規則**、任意の**声調目録**、そして来歴です。来歴には、`stub → skeleton → research → production` と進む `QualityTier`、`ScriptType`（アルファベット、アブジャド、アブギダ、…）、そして書誌的な出典が含まれます。

包含のルールは厳格であり、はっきりと述べる価値があります。**公式な正書法と文書化された文法に裏付けられた対応づけのみが採用されます。恣意的な部分文字列規則は除外されます。** ポルトガル語の ⟨lh⟩、ドイツ語の ⟨sch⟩、英語の ⟨th⟩ が含まれているのは、それらが標準的な正書法上の単位だからです。便利ではあるが捏造された発見的手法は含まれません。ある仕様がグラフェムを宣言していながら明示的な異音マップを持たない場合、基準となる恒等マップが導出されます。すべての音素は少なくともそれ自身の表面的表出となるため、何も静かに消えることはありません。

地域的な変種は、親に対するフラグではなく、それぞれ独自の仕様を持ちます。ブラジルのポルトガル語とヨーロッパのポルトガル語は体系的に分岐するため、系統によって結びつけられた別個の `LanguageSpec` オブジェクトです。

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

方言ツリーが保守可能であり続けるのは、JSON ファイルが `graphemes_base` / `allophones_base` の継承をサポートするからです。変種は親と異なる点だけを宣言します。系統は重み付きで複数の祖先を持ちます — 親、基層、上層、傍層 — これは、純粋な子孫ではなく接触の産物である言語をモデル化する誠実な方法です。

## 曖昧さを認めるトークナイザー

綴りはきれいな分割問題ではないため、このパッケージには `PhonetokTokenizer` が付属します。これは beam-search による IPA 展開を備えた **maximal-munch** グラフェムトークナイザーです。最も長く一致する正書法上の単位を貪欲に優先し、綴りが曖昧な場合には順位付けされた候補転写を探索します。

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

単一の出力に賭けるのではなく、スコア付きの beam が得られます。これはまさに、下流の語彙集、ラティス、あるいは発音の再ランク付け器が求める入力です。

## 言語間の距離を測定する

データが重みに焼き込まれるのではなく構造化されているため、言語を直接比較できます。距離の指標は目録、グラフェム、異音、系統の各次元にわたり、さらに別個の文字体系距離のファミリーも備えています。

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

特徴ベクトルも公開されているため、2つのポルトガル語標準のようなほぼ同一のペアは 0.04 に落ち着き、一方で本当に距離のあるペアははっきりと分離します。これは転移学習の判断、低リソース言語のブートストラップ、方言計量学のいずれにも役立ちます。

## CLI

上記のすべては Python を書かずに到達できます。`orthography2ipa` コンソールスクリプトには `list`、`info`、`transcribe`、`distance` が付属し、各サブコマンドはパイプラインへ流すための `--json` を受け付けます。

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## なぜ純粋なデータが重要なのか

仕様セット全体がスキーマ検証済みです。pydantic 風の凍結されたデータクラスからなり、**394 の仕様**が整合性テストスイートによって走査され、`SCHEMA.md` がその形を文書化しています。静的なテーブルでは規則を本当に表現できない場合には、言語固有のロジックがデータの周囲にプラグインされます。音節分割器はエントリーポイントグループを通じて登録され、より重いアルゴリズム的な G2P（太陽文字の同化、hamzat al-wasl の脱落、tanwin の形式を扱う私たちのアラビア語トークナイザー [arbtok](https://github.com/TigreGotico/arbtok) のようなもの）は、同じ仕様の上に下流で構築されます。

ユーザーの言語がどう聞こえるかを決める不透明なモデルは存在しません。対応づけは監査可能であり、出典は引用されており、言語を追加することは検証済みの JSON ファイルを1つ書くことです。TTS、ASR、あるいは音声学的 NLP を構築していて、自らの音韻論をブラックボックスに外注することを拒む人 — そしてそれを自分自身のハードウェア上で動かしたい人 — にとって、それがこの取り組みの要点です。これは Apache 2.0 であり、あなたが検査し、拡張し、セルフホストするためのものです。
