---
title: "多言語の文タイプ・データセット：疑問文、命令文、平叙文"
description: "sentence-types-multilingual を公開しました。7言語にわたる約70,000文を、文法的なタイプ（疑問文、命令文、平叙文、感嘆文）で分類したものです。これは little_questions 経路制御ライブラリの背後にある訓練用コーパスです。"
date: 2026-04-01
updated: 2026-08-01
lang: ja
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

音声アシスタントの経路制御ロジックは、何かに答えようとする前に、どのような種類の文を受け取ったのかを知ることに依存しています。疑問文には答えが必要です。命令文には実行が必要です。平叙文には確認応答や保存が必要かもしれません。ユーザーが話すあらゆる言語で、その分類を正しく行うことが、その他すべての前提条件となります。

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** は、その層の背後にある訓練用コーパスです。ラベル付けされた69,300文からなり、英語、スペイン語、フランス語、ドイツ語、イタリア語、ポルトガル語、オランダ語の7言語それぞれに9,900文が割り当てられています。

## ラベルが実際に意味するもの

このデータセットは、1行につき1つの `label` 列のみを持つ、タイプ/サブタイプの区別のないフラットな6つのラベル集合を使用しており、それらは（このデータを利用する推論ライブラリである）`little_questions` が発話をどのように経路制御するかに直接対応します。

- **wh_question** — what、where、who などの wh 語を中心に構成される疑問文です。
- **polar_question** — yes/no 疑問文です。`little_questions` 内部の EAT 分類体系は、これらの疑問文ラベルの上に、53個の細粒度な回答タイプのラベル(人物、場所、数量、定義など)を追加しますが、文タイプの分類が最初の関門です。
- **command** — 命令形です。命令文は答えを期待しません。行動を期待します。
- **request** — 丁寧または間接的な行動の依頼で、単純な命令形とは区別されます。
- **statement** — 平叙文です。対話の文脈における平叙文は、下流で重要となる極性を帯びていることが多くあります。すなわち、先行する質問への回答を解釈するために、平叙文に対して yes/no/maybe の分類器が実行されます。
- **exclamation** — 感情的に標示された発話で、中立的な平叙文とは異なる扱いを必要とします。

```json
{
  "language": "en",
  "label": "wh_question",
  "text": "What time is it?"
}
```

## 言語横断的なカバレッジが自明でない理由

同じ伝達意図が、異なる文法では異なる形で現れます。

- 英語は語順の倒置によって疑問文を標示しますが、ポルトガル語やスペイン語では、語順を変えずに、しばしば句読点とイントネーションだけで標示します。
- ドイツ語は、分類の手がかりとなる信号が存在する位置をずらすような形で、動詞を文末の位置に分離します。
- ロマンス諸語は、英語が動詞の裸形で表現する命令に対して、専用の命令法形態論を用います。

英語だけで訓練されたモデルは、他のあらゆる言語でこれらを誤ります。7言語にわたる並行的なラベル付きデータは、言語別の分類器が必要とする言語横断的な信号を提供します。そして同じ生成パイプラインは、言語が追加されるにつれてさらなる言語へと拡張されます。

## 下流のスタック

このデータで訓練されたモデルは、**[little_questions](https://github.com/TigreGotico/little_questions)** の内部で配布されます。これは依存関係のないオフラインのライブラリ（numpy + onnxruntime）で、文タイプ用の言語別 ONNX 分類器と、43言語対応の yes/no 極性モデルを備えています。モデルは英語についてはwheel内に同梱され、その他の言語については遅延ダウンロードされます。文タイプ分類器は HuggingFace 上で `TigreGotico/sentence-types` として公開されており、EAT 回答タイプ分類器は内部で訓練されたもので、一般には公開されていません。

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` は、OVOS と LILACS のための自然言語経路制御の層です。発話が疑問文なのか、命令文なのか、平叙文なのかを分類することは、音声パイプラインが下す最初のディスパッチの判断です。

[**HuggingFace 上の sentence-types-multilingual**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**GitHub 上の little_questions**](https://github.com/TigreGotico/little_questions)
