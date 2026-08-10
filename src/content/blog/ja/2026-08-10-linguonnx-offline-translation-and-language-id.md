---
title: "linguonnx: ONNX によるオフライン翻訳と言語識別"
description: "linguonnx は CPU 上でテキストを翻訳し、言語を識別します。torch も不要、クラウドも不要。184 個の int8 翻訳モデルと 5 個の言語識別モデル、586 のルーティング可能な言語、そして単一のモデルが言語ペアを覆えないときに小さなモデルを連結するルーターを備えます。"
date: 2026-08-10
lang: ja
author: "Casimiro Ferreira"
tags:
  - "linguonnx"
  - "translation"
  - "language identification"
  - "ONNX"
  - "self-hosted"
  - "OVOS"
draft: false
---

[**linguonnx**](https://github.com/TigreGotico/linguonnx) は、機械翻訳と言語識別
のための Python ライブラリです。`onnxruntime` の上で、CPU で、オフラインで動作し
ます。torch はどの段階でも使いません。エンコーダ・デコーダの生成ループは、ビーム
サーチと KV キャッシュを含めて、ONNX グラフに対して直接書かれています。

```bash
pip install linguonnx
```

```python
from linguonnx import load_translator, load_detector

tx = load_translator()
print(tx.translate("bom dia, como estás?", src="pt", tgt="en"))
# 'Good morning, how are you?'   via opus-mt-pt-en-int8, 172 MB

det = load_detector()
print(det.detect("Egun on, zer moduz?"))    # 'eu'
```

ライセンスは Apache-2.0 で、要求していないモデルは一切ダウンロードしません。

## 同梱されるもの

レジストリには翻訳エントリが 369 件（各モデルの fp32 と int8）と、言語識別エント
リが 10 件あります。`load_translator()` は既定で int8 を選ぶので、通常のインス
トールは量子化された 184 個の翻訳モデルと 5 個の分類器の上でルーティングします。
すべて HuggingFace の [`TigreGotico/`](https://huggingface.co/TigreGotico) に公開
された ONNX 変換です。

既定のグラフ上で、586 の言語にルーティングできます。この数値はテストに固定されて
いるので、真であり続けるか、ビルドが知らせるかのどちらかです。

分類器は 4 つの fastText モデルの ONNX エクスポートです。GlotLID、従来からの
`lid.176`、OpenLID、OpenLID-v2 です。GlotLID は 2102 の*変種*にラベルを付けるの
で、口語アラビア語はナジュド方言（`ars`）として返り、中国語は広東語として返ること
があります。方言識別が欲しいときはそれが役に立ち、欲しくないときは
`collapse_varieties=True` を使います。

## モデルのないペアは、モデルの連鎖になる

ほとんどの言語ペアには二言語モデルがありません。ルーターはモデルを固定された辺で
はなく能力の集合として扱い、必要なときにホップを連結します。

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — ガリシア語を経由した
```

この方針のもとでは、ポルトガル語からバスク語へはガリシア語を経由し、84 MB と
153 MB の 2 つの Marian モデルを通ります。中継は決して黙っていません。`Route` は
訳文とともに返り、どのモデルを使い、どの言語を経由したかを示します。

経路は言語ペアについての固定した事実ではありません。呼び出し側の制約がレジストリ
から作り出すものです。サイズ予算やホップの好みを変えれば、同じペアが別の言語を経
由することもあり、大きな多言語モデル 1 つによる単一ホップに縮むこともあります。
どれになったかは `Route` が示します。

順位付けは、その言語を担う機関を優先します。バスク語は HiTZ、ガリシア語は
Proxecto Nós、カタルーニャ語は Projecte AINA、インド系のペアは AI4Bharat、西アフ
リカのペアは Masakhane、フィン・ウゴル語は TartuNLP が訓練しています。同点なら、
専門機関のモデルが汎用の多言語モデルに勝ちます。

## 方針は実行時に、索引作成時には決して

これがレジストリの原則です。サイズもライセンスもスコアも問わず、公開されたモデル
をすべて列挙します。絞り込みと順位付けは実行時に、呼び出し側のプロセスで、呼び出
し側の規則で行われます。索引が落としたモデルはそもそも選べないので、索引は何も落
としません。

呼び出し側は `load_translator` で方針を決めます。`max_model_mb`、
`oversize_fallback`、`count_cached_as_free`、`prefer`、`max_hops`、`precision`、
`model_cache_size`、`exclude_flagged`、`min_chrf` です。いずれも呼び出しごとに上
書きできます。

## サイズ上限は小さなモデルを優先し、言語を消さない

サイズ予算は小さな機械にとって当たり前のつまみで、その当たり前の実装は誤りです。
フィルタとして使うと、`max_model_mb=500` は 586 のルーティング可能な言語を 249 に
減らします。ロングテールは大きな多言語モデルの中に住んでいて、小さなモデルの連鎖
では代われないからです。

`oversize_fallback=True` は予算を「好み」に変えます。

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 249 ではなく 586
```

英語からカタルーニャ語は小さなモデルのままです。小さなモデルが存在するからです。
英語からチュヴァシ語は MADLAD まで引き上げられます。レジストリでチュヴァシ語を持
つのは MADLAD だけであり、代わりの選択肢は安い経路ではなく「経路なし」だからで
す。`waived_size_cap` はどの上限を越えたかを示すので、500 MB を見込んだ機械は
4945 MB を取得したことを知ります。

4 つの規則がこれを誠実に保ちます。広げた探索は、空で返ったペアについてだけ走りま
す。上限はモデル 1 サイズずつ上がるので、NLLB-200 と MADLAD の両方が覆うペアには
NLLB-200 が割り当てられます。上限が縛るのは 1 つのモデルであって経路ではないの
で、237 MB のモデル 2 ホップの連鎖は通常の探索が見つけます。そして引き上げはダウ
ンロード予算を越えません。

## ルーティングできることと、使えることは違う

`madlad400-3b-mt` はチュヴァシ語を覆います。`en -> cv` を頼むとロシア語で答えま
す。`"Good day, my friend."` は `"Добрый день, мой друг."` として返ります。ルー
ティングは正しく（チュヴァシ語のタグは独立した SentencePiece の断片です）、それで
もモデルは違う言語を書きます。

そのためレジストリのエントリは `language_flags` を、1 言語ずつ、根拠となる観測と
ともに持ちます。入力、出力、検出器の判定（`glotlid=ru`）、日付、方法です。チュ
ヴァシ語はルーティングでき、かつ使えません。レジストリはその両方を述べます。

モデル全体の品質も同じやり方で記録します。`quality` フィールドは、**人手による**
FLORES-200 devtest 参照に対する chrF スコアを、コーパス、デコード方式、標本数とと
もに持ちます。標本数が見えないスコアには意味がないからです。フィールドがないこと
は「未測定」を意味し、それは「悪い」とは別の状態です。未測定のモデルに数値をでっ
ち上げるものは何もありません。2 つの検査が旗を立てます。どちらかの精度で chrF が
40 未満であること、そして int8 が fp32 に 2 chrF を超えて劣ることです。

旗はレジストリから何も取り除きません。`exclude_flagged=True` と `min_chrf=` に判
断材料を与え、人には読む理由を与えます。

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

レジストリ全体を走査する検査は、登録済みのすべてのモデルに実際の 1 文を通し、空の
出力、空白だけの出力、入力と同一の出力で失敗します。標本文は原言語ごとに用意さ
れ、人手で確認されています。標本のない言語は、別の言語の文で試す代わりに飛ばされ
ます。

## OpenVoiceOS から使う

[`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)
は、1 回のインストールでライブラリを 2 つのプラグインとして提供します。言語検出
（`opm.lang.detect`、id は `ovos-lang-detect-plugin-linguonnx`）と翻訳
（`opm.lang.translate`、id は `ovos-translate-plugin-linguonnx`）です。どちらも初
回使用時にモデルを読み込み、`load_detector` と `load_translator` の引数はすべて
`mycroft.conf` から設定できます。

残りはライブラリが文書化しています。方針とサイズ予算は
[routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md)、レ
ジストリは [models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md)、
ライセンス段階は [licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
です。GPL-3.0 と CC-BY-NC-4.0 のモデルは索引に存在し、名指しで要求する必要があり
ます。
