---
title: "OpenVoiceOS と Home Assistant: 音声オートメーションのドリームチーム"
description: "Home Assistant はオートメーションを担い、OVOS は音声を担います。この組み合わせを機能させるのは 3 つの統合レイヤーです。HA の音声パイプライン向けの Wyoming ブリッジ、会話エージェントとしての ovos-persona-server、そして OVOS デバイスを HA のネイティブエンティティとして表示する HiveMind です。"
date: 2025-09-17
lang: ja
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> このブログはもともと [OpenVoiceOS ブログ](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)に掲載されたものです。

Home Assistant はオートメーションを担い、OVOS は音声を担います。どちらも相手になろうとはしません。この責任分担こそが、この組み合わせが機能する理由です。HA のデバイス統合とオートメーションエンジンに、OVOS の柔軟で完全にローカルな音声スタックを組み合わせるのです。

本記事では、3 つの統合レイヤーを取り上げます。HA の音声パイプライン向けの Wyoming ブリッジ、会話エージェントとしての ovos-persona-server、そして OVOS デバイスを HA のネイティブエンティティとして表示する HiveMind です。

-----

## Home Assistant に OVOS 駆動の音声を与える

Wyoming プロトコルは、外部の ASR、TTS、ウェイクワードサービス向けの HA 標準インターフェースです。私たちは、あらゆる OVOS プラグインをこのプロトコル上で公開する Wyoming ブリッジを構築しました。つまり HA は、厳選された短いリストだけでなく、OVOS エコシステムのすべてのプラグインにアクセスできるようになります。


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): 音声コマンドをテキストに変換し、Home Assistant が理解できるようにします。
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): OVOS の多彩な音声オプションを用いて、Home Assistant が応答を発話できるようにします。
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): カスタムウェイクワードを統合し、選択したトリガーフレーズを聞いたときにのみ Home Assistant のセットアップが応答するようにします。

[OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) プロジェクトは、これらのサービスをパッケージ化し、`docker compose up` 一発で使えるようにします。

### **プラグインのハイライト: ILENIA 駆動の多言語 TTS**

私たちにとって、アクセシビリティは鍵です。それには言語のアクセシビリティも含まれます。この統合により、[**ILENIA**](https://proyectoilenia.es/) のようなプロジェクトが公的資金で開発した高品質な音声を、より幅広い層に届けられることを誇りに思います。Home Assistant のユーザーは、カタルーニャ語やガリシア語などの言語について、それらを構築したプロジェクトから直接、自然に聞こえる音声を利用できます。

* **カタルーニャ語向け Matxa TTS:** [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) は、カタルーニャ語のマルチスピーカー対応のテキスト読み上げ機能を提供します。
* **ガリシア語向け NosTTS:** [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) は、ガリシア語の堅牢なテキスト読み上げを提供します。

![ILENIA ロゴ](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **Home Assistant での Wyoming サービスのセットアップ:**

Home Assistant で Wyoming サービスを設定する際は、通常、[Home Assistant 公式ドキュメント](https://www.home-assistant.io/integrations/wyoming/)を参照します。このプロセスでは通常、Docker コンテナ（または OVOS Wyoming サービスを実行しているホスト）の IP アドレスを Home Assistant のウェブインターフェースに入力するだけです。

![Home Assistant での Wyoming セットアップ](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![Home Assistant での Wyoming エンティティ](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## OVOS を会話の頭脳にする

さらに一歩進めたいですか？ **Ollama 統合**を使って、OVOS を Home Assistant の本格的な会話エージェントとしてセットアップできます。

![Home Assistant での Ollama セットアップ](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


このセットアップでは、Home Assistant がユーザーのテキストを [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/) に渡します。OVOS がインテントを判定し、Home Assistant が発話するための答えを返します。そして [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) は Ollama 互換のエンドポイントを公開しているため、同じサーバーは Home Assistant だけでなく、Ollama または OpenAI API を扱うあらゆるアプリに接続できます。

![Home Assistant での OVOS とのチャット](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## Voice PE で OVOS を使う

[Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) は、HA の音声パイプライン専用のハードウェアサテライトです。上記のすべての Wyoming サービスと連携します。実行中の任意の wyoming-ovos-stt、wyoming-ovos-tts、または wyoming-ovos-wakeword インスタンスに向けるだけです。

![Home Assistant Voice Preview Edition の設定](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## HiveMind で OVOS デバイスを Home Assistant に迎え入れる

専用の OVOS デバイスをお持ちの場合、[HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) 統合により、それらが Home Assistant のネイティブエンティティとして表示されます。フリート全体を統一されたコントロールパネル 1 つで管理できます。


### **HiveMind 統合のセットアップ:**

OVOS デバイスを HiveMind 経由で統合するには、通常、Home Assistant に HiveMind 統合を追加します。これには、統合の `name`、`access_key`、`password`、`site_id`、`host`（HiveMind サーバーの IP アドレスまたはホスト名）、`port`（デフォルトは 5678）などの接続情報の入力が含まれます。セットアップによっては、自己署名証明書を許可する `allow_self_signed` や、`legacy_audio` を有効にするオプションもあります。

![Home Assistant での HiveMind セットアップ](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **OVOS デバイス向けに公開されるコントロール:**

統合されると、HiveMind は OVOS デバイス向けの包括的なコントロール一式を Home Assistant 内に直接公開します。これにより、Home Assistant の UI から OVOS デバイスのさまざまな側面を管理できます。たとえば次のとおりです。

  * `Listening Mode` の変更（例: ウェイクワード、常時リスニング）
  * `Microphone Mute` の切り替え
  * `OCP Player` のステータスとコントロール
  * `Reboot Device`、`Restart OVOS`、`Shutdown Device` などのアクション
  * `Sleep Mode` と `SSH Service` の切り替え
  * `Start Listening` の手動実行、または `Stop` によるリスニングの停止
  * 音量レベルの制御

![Home Assistant での HiveMind エンティティ](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **通知の統合:**

HiveMind は、OVOS デバイスを Home Assistant 内の通知ターゲットとして機能させることもできます。つまり、Home Assistant のオートメーションを設定して、音声通知を OVOS デバイスに直接送信し、アラート、リマインダー、あるいは設定した任意の情報を「発話」させることができます。これは Home Assistant では "Speak" 通知エンティティとして公開されます。

![Home Assistant での HiveMind 通知サービス](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **メディアプレーヤーと Music Assistant の統合:**

OVOS デバイスは、Home Assistant では標準的なメディアプレーヤーとしても表示されるため、通常のメディアプレーヤーインターフェースから再生を制御できます。同じ統合は Music Assistant にも拡張されます。OVOS デバイスを通じて音楽をストリーミングすれば、それらは家全体のオーディオシステムの一部となります。


![Home Assistant での HiveMind プレーヤー](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![Music Assistant での HiveMind プレーヤー](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## OVOS に王国の鍵を渡す

コミュニティが保守する [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant) は、HA REST API を介して OVOS に Home Assistant エンティティの直接制御を与えます。OVOS デバイスにインストールすれば、「リビングの照明をつけて」や「サーモスタットを 21 度に設定して」と話しかけられます。完全にローカルで、クラウドは不要です。

-----

## 各仕事に適したツール

OVOS は音声を担い、Home Assistant はオートメーションを担います。どちらも相手の仕事をするために妥協することはなく、統合ポイントは十分にクリーンなため、各プロジェクトはそれぞれ独自のリリースサイクルを維持できます。

上記でリンクした各リポジトリでのバグ報告と PR を歓迎します。

---

OpenVoiceOS はコミュニティプロジェクトです。音声アシスタントはオープンで、包摂的で、ユーザーが制御できるべきだと信じるなら、資金、オープンデータ、または翻訳で[プロジェクトを支援してください](https://www.openvoiceos.org/contribution)。
