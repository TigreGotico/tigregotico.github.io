---
title: "取り残される言語をなくす"
description: "言語検出、翻訳プラグイン、双方向翻訳機能を通じて、OpenVoiceOS における言語の壁を取り除く。"
date: 2023-10-16
updated: 2026-08-01
lang: ja
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> この記事はもともと、私の（現在は閉鎖された）個人ブログに掲載されたものです。

OpenVoiceOS（OVOS）は、コミュニティ主導のオープンソース音声アシスタントプラットフォームです。本記事では、インストール済みのスキルがネイティブに対応している言語をはるかに超えて OVOS を動作させるために私が構築した、言語検出、翻訳、双方向翻訳の各プラグインを取り上げます。


## 音声からの言語検出

OVOS は、音声が ASR による文字起こしの段階に到達する前に、その音声で話されている言語を識別します。これにより、ASR プラグインは推測に頼るのではなく正確に文字起こしを行えます。私はこのために複数のプラグインを構築しました。

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

言語検出は、OVOS の設定に列挙された言語に限定されます。その範囲外の分類は拒否されるため、家庭内の誰も話さない言語に誤って切り替わることはありません。

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### 設定

FasterWhisper の言語分類モデルのサイズは設定可能です。

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## テキストの言語翻訳

[No Language Left Behind（NLLB）](https://ai.meta.com/research/no-language-left-behind/) は、200 言語間の高品質な直接翻訳を行う Meta のオープンソースモデルです。アストゥリアス語、ルガンダ語、ウルドゥー語といった低リソース言語も含まれます。この名前が本記事のインスピレーションとなりました。

[ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) は、OVOS 内で NLLB をローカルに実行します。スキルが完全なネイティブ言語対応を獲得するには時間がかかりますが、このプラグインを使えばユーザーはもう待つ必要がありません。OVOS が受信した発話と送信する応答をリアルタイムで翻訳するため、どのスキルもこれら 200 言語のいずれでも動作します。

低スペックのハードウェア向けには、[ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) が翻訳をリモートサーバーに委譲します。公開サーバーが標準で列挙されていますが、プライバシーの観点から自己ホスティングを強く推奨します。**公開サーバーを使用するということは、あなたのすべての発話をその運営者に委ねることを意味します。**

注目すべき翻訳プラグイン:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### 設定

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## OVOS 双方向翻訳プラグイン

[OVOS 双方向翻訳プラグイン](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) は、2 つのパイプライン段階で検出と翻訳を結び付けます。**Utterance Transformer**（受信テキストを OVOS の設定言語に翻訳する）と **Dialog Transformer**（応答をユーザーの元の言語に翻訳して戻す）です。

オプションの `verify_lang` モードは、検出されたテキストの言語をセッション言語と相互チェックします。単一の OVOS インスタンスが多言語ユーザーに対応するチャットプラットフォームで有用です。`language.detection_module` に設定された[言語検出モジュール](https://openvoiceos.github.io/ovos-technical-manual/lang_support/)と、翻訳プラグイン（ローカルの場合は `ovos-translate-plugin-nllb`、リモートの場合は `ovos-translate-server-plugin`）が必要です。

### 設定

```json
"utterance_transformers": {
    "ovos-utterance-translation-plugin": {
        "bidirectional": true,
        "verify_lang": false,
        "ignore_invalid_langs": true,
        "translate_secondary_langs": true
    }
},
"dialog_transformers": {
    "ovos-dialog-translation-plugin": {}
}
```

## すべてがどのように連携するか

各コンポーネントはそれぞれ独立して有用ですが、きれいに組み合わせることもできます。

1. **音声の言語検出** — ASR プラグインにどの言語を文字起こしすべきかを伝えます。
2. **発話の翻訳** — スキルのマッチングの前に、ネイティブでない発話をアシスタントの設定言語に変換します。
3. **ダイアログの翻訳** — TTS の前に、アシスタントの応答をユーザーの言語に翻訳して戻します。

結果として、OVOS はスキル自体が翻訳を必要とすることなく、NLLB の 200 言語のいずれもエンドツーエンドで処理できます。

貢献やスキルの翻訳は [GitHub 上の OpenVoiceOS](https://github.com/OpenVoiceOS) で歓迎します。
