---
title: "純粋な ONNX 音声ライブラリ群"
description: "TigreGótico は、帯域拡張、音声クローニング、話者埋め込み、VAD、単語アクセント、音素化、TTS、そしてそれらすべてを採点する指標ライブラリからなる音声ライブラリ群を維持しています — これらは一つのランタイムルールを共有します。onnxruntime と numpy だけを使い、PyTorch も GPU も不要です。"
date: 2026-08-01
lang: ja
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "TTS"
  - "voice cloning"
  - "VAD"
  - "self-hosted"
  - "phoonnx"
draft: false
---

ONNX は学習済みニューラルネットワークのためのファイル形式です。重みと計算グラフが凍結され、それを学習させたフレームワークへの依存はありません。ONNX にエクスポートされたモデルは、そのグラフを実行する以外何もしない小さな推論エンジンである **ONNX Runtime** を通じて実行できます。それはモデルがどのように学習されたかを知らず、学習をサポートせず、PyTorch や TensorFlow がインストールされている必要もありません。

私たちのいくつかのライブラリは一つのルールを守っています。実行時の依存関係は `onnxruntime` と `numpy` だけです。「おおむね」ではなく — パッケージ自体をインポートするだけでは決して学習フレームワークを引き込みません。`audiosronnx`(帯域拡張とノイズ除去)、`voiceclonnx`(音声クローニング)、`speakeronnx`(話者埋め込み)、`speechonnxmetrics`(評価)、`stressonnx`(単語アクセント)、`vadonnx`(音声区間検出)、`phoonnx`(音素化とテキスト音声変換)はすべてこれに従い、それぞれ独自の PyPI パッケージとして存在します。さらに二つ、`phoonnx.js` と `precise-onnx-js` は、代わりにブラウザで `onnxruntime-web` を使って同じ考え方を適用します。

## なぜそこまでするのか

音声モデルを出荷する明白な方法は、推論のためにも学習フレームワークをそのまま残しておくことです。開発中は便利です。プロダクションでは負債です。

- **インストールサイズ。** PyTorch + CUDA のインストールは、モデルを一つロードする前からギガバイト単位に膨れ上がります。`onnxruntime` と `numpy` を合わせても数十メガバイトです。
- **管理する CUDA がない。** GPU ドライバ、CUDA ツールキットのバージョン、フレームワークのビルドを一致させることは繰り返し発生する故障の原因です。CPU 専用の ONNX Runtime はこれを完全に回避しつつ、GPU がある場所では同じグラフを GPU で実行できます。
- **控えめなハードウェアで動く。** Raspberry Pi や 10 年前のノートパソコンでも `onnxruntime` は快適に動作します。それらはたいてい完全な PyTorch スタックを実用的な速度で実行できず、あるいは 32 ビットやメモリの制約されたボードにはそもそもインストールすらできません。
- **一つの成果物、あらゆるプラットフォーム。** 同じ `.onnx` ファイルが Linux、macOS、Windows で変更なしに動作し、`onnxruntime-web` を通じてブラウザタブの中でも動作します。対象ごとの別々のエクスポートステップは不要です。
- **学習/サービングのバージョン衝突がない。** 学習スタックは特定のフレームワークと CUDA のバージョンに固定されます。サービングスタックは可能な限り小さく安定した依存関係のセットを望みます。両者を分離すれば、一方をアップグレードしても他方を壊しません。

## その代償

この制約は現実のものであり、ただではありません。

**プロセス内での微調整はできません。** ONNX グラフにはオプティマイザも逆伝播もありません。これらのライブラリのそれぞれはモデルを固定された成果物として扱います。ロードして実行するだけです。学習や微調整は元のフレームワークで別途行われ、その結果が後で ONNX にエクスポートされます。`stressonnx` と `speechonnxmetrics` はどちらも、そのオフライン変換ステップのためだけに `torch` を引き込む任意の `export` エクストラを持っています — 推論のためでは決してありません。

**すべてのアーキテクチャがきれいにエクスポートされるわけではありません。** 動的な制御フロー、カスタム CUDA カーネル、あるいは ONNX に相当するものがない演算は、単純なエクスポートを妨げることがあります。`audiosronnx` の README はこれを直接文書化しています。すべての研究モデルが移植できると装う代わりに、評価して却下したモデルの[未出荷リスト](https://github.com/TigreGotico/audiosronnx)を理由とともに保持しています。

**前処理は手作業で再実装しなければなりません。** PyTorch や Kaldi のようなフレームワークは、STFT(波形をスペクトログラムに変える処理)、メルフィルタバンク特徴量、リサンプリングの高速でテスト済みの実装を提供します。モデル自体がそのフレームワークに依存しなくなれば、その前処理も同様に依存できません — `speakeronnx` はまさにこの理由で 80 バンドのログメルフィルタバンクを純粋な NumPy で再実装しており、`audiosronnx` は STFT とリサンプリングについて同じことをしています。正しく行うにはより多くのコードが必要で、元に対する独自の等価性テストも必要です。

## 一つのタスク、複数のエンジン、一つの API

学習済み音声モデルは、言語、録音条件、対象ドメインによって大きく異なります。クリーンな朗読音声で学習された話者検証モデルは、電話音声では失敗するかもしれません。英語の音色転写に調整された音声クローニングモデルは、声調言語では明瞭度を失うかもしれません。どこでも勝つ単一のモデルは存在しないため、あらかじめ一つに決め打ちするのは賭けです。

この一族の各ライブラリは一つのタスクを選び、複数の独立して公開されたモデルを一つのインターフェースの背後にラップするため、エンジンの切り替えは書き直しではなく一行の変更で済みます。

`audiosronnx` は、ノイズ除去と帯域拡張(8 kHz の電話音声のような狭帯域録音を、より豊かに聞こえる高いサンプルレートの信号に変える処理)という二つの仕事を、それぞれ複数のエンジンに支えられた二つのローダーの背後に分離します。

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

`load_denoise` は現在、0.54 MB から 415 MB までのモデルを、異なるライセンスの下で十のノイズ除去器(`dpdfnet`、`mossformer2`、`frcrn`、`mpsenet`、`gtcrn`、`cmgan`、`metadenoiser`、`mossformergan`、`voicefixer`、`deepfilternet`)として登録しています。`load_sr` は七つの帯域拡張器(`lavasr`、`novasr`、`flowhigh`、`hifiganbwe`、`apbwe`、`sidon`、`callenhancer`)を登録しています。他のエンジンが測定されたあらゆる軸で上回る劣ったモデルであっても、レジストリには残されます。それにより、公開されたベンチマーク結果はいつでも再現可能なままです。

`voiceclonnx` は音声クローニング — テキストを介さずに、既存の録音の声を別の参照話者のように聞こえるように変換すること — に同じアプローチを取ります。

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

十のエンジン(`facodec`、`openvoice`、`chatterbox`、`triaan`、`cosyvoice`、`bicodec`、`knnvc`、`focalcodec`、`lscodec`、`rvc`)が登録されており、kNN 特徴交換、因数分解コーデック、フローマッチング、音色転写、AR コーデック LM、話者分離コーデックという六つの異なるモデル系統にまたがっています。それぞれの背後には公開された明瞭度と話者類似度の数値があるため、エンジンを選ぶことはコイントスではなく比較になります。

`vadonnx` は同じパターンを音声区間検出 — オーディオストリームのどの部分に音声があるかを判断する作業 — に適用します。

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

六つのモデル系統(`silero`、`marblenet`、`pyannote`、`fsmn`、`speechbrain`、`ten`)が登録されており、宣言的な `IOSignature` によって一つの汎用エンジンがそれらのほとんどを駆動でき、あるいは任意のカスタム `.onnx` VAD ファイルを指すこともできます。

`speakeronnx` は、誰が話したかを何を話したかとは無関係に要約する固定長ベクトルである**話者埋め込み**を抽出し、コサイン類似度で二つの埋め込みを比較して二つのクリップが同一話者かどうかを確認します。

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

四つのアーキテクチャ系統(WeSpeaker、CAM++、ERes2Net、ReDimNet)にわたって九つのモデルを、公開された埋め込み次元とライセンスとともに登録しています。

`stressonnx` はテキスト音声変換のフロントエンドのために単語アクセント — 単語のどの音節が強勢を受けるか、多くの言語が綴りで示さない情報(ロシア語の *за́мок*(城)と *замо́к*(錠)はすべての文字を共有します) — を選びます。ロシア語のための一つの神経パイプライン、ウクライナ語とベラルーシ語のためのもう一つ、そして神経推論をまったく使わずに 26 言語をカバーするルールと語彙のバックエンドを登録しています。

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

`phoonnx` はテキストを音素化し(綴られた単語を TTS モデルが消費する音の単位に変え)、複数のエコシステム(ネイティブの phoonnx、Piper、Mimic3、Coqui、MMS、Transformers)からエクスポートされた 17 の登録済み合成エンジンと音声にわたってテキスト音声変換を実行します。

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

`phoonnx.js` は同じトークナイザーの経路を `onnxruntime-web` でブラウザに持ち込み、`precise-onnx-js` はウェイクワード検出(MFCC 特徴抽出と ONNX 分類器、Mycroft Precise モデルと互換)を JavaScript に移植します。どちらもサーバーなしで動作します。

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

`audiosronnx`(公開モデル 18 個)と `voiceclonnx`(公開モデル 10 個)の重みは、[TigreGótico の Hugging Face 組織](https://huggingface.co/TigreGotico)に別々のダウンロードとして存在し、初回使用時に取得されてローカルにキャッシュされるため、別のエンジンを選ぶことは再デプロイではなく設定変更です。

## 輪を閉じる: 推測ではなくエンジンを採点する

一つの API の背後に多くのエンジンを登録することは、あなたの入力に対してどれが実際に優れているかを判断できて初めて報われます。それが `speechonnxmetrics` の存在理由です。同じ `numpy` + `onnxruntime` の制約の上に構築された指標ライブラリであり、モデルを採点するのに追加のインストールコストはかかりません。

これは指標を三種類にまとめます。**参照なし MOS** 推定器 — UTMOS、DNSMOS、NISQA、SIGMOS — は、比較するクリーンな参照を必要とせずに、人間の聴取パネルがクリップに与えるであろう 1 から 5 の**平均オピニオンスコア**を予測します。**侵襲的な指標** — STOI(短時間客観的明瞭度)、SI-SDR(スケール不変信号対歪み比)、MCD(メルケプストラム歪み) — は一致するクリーンな参照を必要とし、出力がそれにどれだけ近いかを測定します。**ASR ベースのテキスト指標** — WER(単語誤り率)と CER(文字誤り率) — は出力に音声認識器をかけ、その書き起こしを期待されるテキストと比較することで、モデルが自然に聞こえるが間違った言葉を話す場合を捉えます。

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

これはエンジン選択を聴取テストから表へと変えます。`voiceclonnx` は自身の十のクローニングエンジンについて、まさにその比較を公開しています。元の書き起こしに対する WER と、それぞれの別個の話者類似度スコアです。そのため「facodec は WER 0% を出す」や「lscodec は WER を犠牲にしてより強い音色転写を得る」といった主張は、印象ではなく測定された事実です。これを言語と録音条件にわたって掛け合わせると、手作業での比較は現実的ではなくなります。客観的な指標こそが、十のエンジンからなるレジストリを圧倒的ではなく使いやすいものにするものです。

## これが役立つ場面

オフラインの音声処理が必要な場合 — 録音のクリーンアップ、音声のクローニング、誰が話しているかの検出、あるいは合成を、GPU をまったく見ることのないハードウェアで行う必要がある場合 — 探すべき形はこうです。小さなランタイム依存、固定された既定値ではなく公開されたモデルからの選択肢、そしてどれが実際に自分のケースで機能するかを測る方法です。上記のライブラリはすべて `pip install` 一つで手に入り、コードレベルでは MIT または Apache ライセンスであり(個々のモデルの重みはエンジンごとに文書化された独自の上流ライセンスを持ちます)、ノートパソコン、サーバー、Raspberry Pi で同じように動作します。

[/contact](/ja/contact) からお問い合わせいただくか、[/services](/ja/services) で私たちが作っている他のものをご覧ください。
