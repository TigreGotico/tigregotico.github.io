---
title: "製造業における OVOS と HiveMind"
description: "EU プロジェクト COALA と WASABI は、OVOS + HiveMind を中心に産業用音声アシスタントのフレームワーク全体を構築し、独自のツール、UI、対話エンジンと統合しました。"
date: 2025-11-26
lang: ja
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "HiveMind"
  - "Industry"
  - "manufacturing"
draft: false
---

EU プロジェクトの **[COALA](https://coala-ai.de)** と **[WASABI](https://wasabiproject.eu)** は、**[OpenVoiceOS](https://openvoiceos.org)**（非営利のオープンソース音声プラットフォーム）と **[HiveMind](https://jarbashivemind.github.io/HiveMind-community-docs/)** を基盤として、産業用音声アシスタントのフレームワーク全体を構築し、独自の Android UI、NLP エンジン、Docker スタックと統合しました。

私はこれらの導入には関わっていませんでした。それこそが要点です。このスタックは、実際の産業要件を持つチームによって、その実力そのものによって採用されているのです。

---

## WASABI オープンコール

中小企業（SME）が主導する少なくとも 10 件の実験に資金支援を提供する第 2 回 [WASABI オープンコール](https://wasabiproject.eu/wp-content/uploads/2025/08/WASABI_Guide_for_Applicants_2nd-OC_vFIN.pdf) が最近締め切られました。
このオープンコールは、製造業の中小企業が関与する AI ベースのデジタルアシスタンス実験を支援するために設計されています。

すべての WASABI オープンコール実験には、次のことが求められます：

* **WASABI/COALA OVOS Docker スタック** を実行すること
* **HiveMind** 経由で接続すること
* 産業ロジックを含むカスタム **OVOS Skill** を開発すること

OVOS/HiveMind の利用については、WASABI プロジェクトの以下の 2 つの文書で説明されています：
- [Deliverable D2.1](https://wasabiproject.eu/wp-content/uploads/2024/01/WASABI_D2.1_template_v0.7_FINAL.pdf)
- [Deliverable D2.4](https://files.wasabiproject.eu/wp-content/uploads/2023/Docs/wp2/Deliverables/D2.4/WASABI_D2.4_Joint%20WASABI%20Demonstrator_v0.5_final.pdf)

![WASABI 産業パイロットにおける OVOS と HiveMind](../2025-11-26-OVOS-hivemind-industry.png)

---

## 産業応用の例

### **1. 作業者ガイダンスと組立支援**

**[TICONAI](https://wasabiproject.eu/ticonai-2)** や **[SKITE](https://wasabiproject.eu/skite-main-2)** のような実験では、OVOS スキルを使用して、部品の組立、手順の検証、ハンズフリーでのステップバイステップの指示など、複雑なタスク中に作業者を導いています。

### **2. 品質管理とエラー削減**

**[WALLABI](https://wasabiproject.eu/wallabi)** や **[HUMANENERDIA](https://wasabiproject.eu/humanenerdia)** のようなプロジェクトは、ミスを防ぐためにリアルタイムの指示とチェックリストを作業者に提供することに注力しています。音声アシスタントは、オペレーターが設定を確認したり、安全チェックを思い出したり、パラメーターを照合したりするのを助けます。

### **3. 予知保全支援**

**[GENIUS-PM](https://wasabiproject.eu/genius-pm)** のような実験では、特に手がふさがっているときに、保全技術者が機械の健全性データ、故障の説明、修理手順に素早くアクセスできるようにアシスタントを使用しています。

### **4. 物流、資材ハンドリング、倉庫支援**

**[VELO](https://wasabiproject.eu/velo-2)** と **[AIVEA](https://wasabiproject.eu/aivea)** は、作業者が工場内を移動しながら、物品を見つけたり、在庫を確認したり、配送タスクをチェックしたりするのを助けるために音声を使用しています。

### **5. オンボーディングと研修**

**[ONBOARD](https://wasabiproject.eu/onboard)** と **[AI-MODE](https://wasabiproject.eu/ai-mode)** は、音声ガイダンスを使って新入社員をタスク全体にわたって導き、監督者の負担を軽減する方法をテストしています。

### **6. 持続可能性、廃棄物追跡、資源効率**

**[VAFER](https://wasabiproject.eu/vafer)** は、リサイクル、材料の再利用、資源フローを監視するシステムと音声インターフェースを統合します — 工場環境でのハンズフリーの報告です。

これらすべては、デバイス、Android UI、バックエンドシステム間の通信をルーティングするために OVOS と HiveMind に依存しています。

---

## COALA/WASABI が OVOS 上に構築したもの

これらのプロジェクトはオープンソースの産業用スキルを生み出しませんでしたが、OVOS + HiveMind を中心にいくつかのコンポーネントを作成しました：

### **1. RASA ベースのドメインアシスタント（DA）**

初期の COALA 研究では、製造業の会話（品質チェック、トラブルシューティング、機械操作について）で学習された **RASA NLP パイプライン** が開発されました。
WASABI では、この RASA エンジンが **skill** として OVOS に組み込まれ、ドメイン固有の対話を処理します。

### **2. COALA Android アプリ**

作業者向けの Android フロントエンドで、HiveMind を通じて OVOS に接続します。

初期バージョンはこちらで公開されています：
[https://github.com/BIBA-GmbH/Mycroft-Android](https://github.com/BIBA-GmbH/Mycroft-Android)

機能には次のものが含まれます：

* Keycloak 経由のログイン
* テキストまたは音声チャット
* 指示、警告、メモのための UI
* HiveMind ベースのメッセージング

### **3. Docker ベースの完全な産業用スタック**

両プロジェクトとも、次のものをまとめた事前設定済みの Docker 環境を提供します：

* OVOS
* HiveMind
* Keycloak（ユーザー管理）
* RASA NLP エンジン
* COALA コネクタサービス

これが、すべての WASABI 実験がデプロイしなければならない標準の産業用音声アシスタントスタックを構成します。

### **4. 産業用音声データセット**

COALA は、工場や作業場で録音された多言語音声データセットを公開しました：
[https://zenodo.org/record/8268928](https://zenodo.org/record/8268928)

---

## なぜ産業界は OVOS + HiveMind を選ぶのか

その魅力は明快です：

* **完全な透明性**（規制業界にとって極めて重要）
* **ローカル/エッジでのデプロイ**（クラウド依存なし）
* **既存の機器への統合が容易**
* **カスタムの独自スキルに十分なモジュール性**
* **分散型音声ネットワーク**（工場全体に配置された HiveMind サテライト）

要するに、この組み合わせは柔軟で、ベンダーに中立で、産業データの制約を尊重します。

---

## なぜ産業界で機能するのか

工場の現場で重要となる設計目標 — 規制業界のための完全な透明性、クラウド依存のないローカル/エッジでのデプロイ、独自ロジックのためのモジュール式スキル、そして施設全体に音声ノードを分散させる HiveMind の能力 — は、後付けではなく、最初から組み込まれていました。

OVOS と HiveMind のソースコード：[github.com/OpenVoiceOS](https://github.com/OpenVoiceOS) · [github.com/JarbasHiveMind](https://github.com/JarbasHiveMind)
