---
title: "制造业中的 OVOS 与 HiveMind"
description: "COALA 和 WASABI 两个欧盟项目围绕 OVOS + HiveMind 构建了一整套工业语音助手框架，将它们与自有的工具、UI 和对话引擎相集成。"
date: 2025-11-26
lang: zh
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "HiveMind"
  - "Industry"
  - "manufacturing"
draft: false
---

**[COALA](https://coala-ai.de)** 和 **[WASABI](https://wasabiproject.eu)** 两个欧盟项目在 **[OpenVoiceOS](https://openvoiceos.org)**（一个非营利的开源语音平台）和 **[HiveMind](https://jarbashivemind.github.io/HiveMind-community-docs/)** 之上构建了一整套工业语音助手框架，将它们与自有的 Android UI、NLP 引擎和 Docker 栈相集成。

我并未参与这些部署。而这正是重点所在：这套技术栈是凭借自身的优点被采用的，采用者是有着真实工业需求的团队。

---

## WASABI 公开征集

第二轮 [WASABI 公开征集](https://wasabiproject.eu/wp-content/uploads/2025/08/WASABI_Guide_for_Applicants_2nd-OC_vFIN.pdf)旨在为至少 10 个由中小企业主导的实验提供资金支持，近期已经结束。
这轮公开征集旨在支持涉及制造业中小企业的、基于 AI 的数字化辅助实验。

所有 WASABI 公开征集的实验都被要求：

* 运行 **WASABI/COALA OVOS Docker 栈**
* 通过 **HiveMind** 连接
* 开发一个包含其工业逻辑的自定义 **OVOS Skill**

WASABI 项目的以下两份文档解释了 OVOS/HiveMind 的用法：
- [交付物 D2.1](https://wasabiproject.eu/wp-content/uploads/2024/01/WASABI_D2.1_template_v0.7_FINAL.pdf)
- [交付物 D2.4](https://files.wasabiproject.eu/wp-content/uploads/2023/Docs/wp2/Deliverables/D2.4/WASABI_D2.4_Joint%20WASABI%20Demonstrator_v0.5_final.pdf)

![OVOS 与 HiveMind 在 WASABI 工业试点中](../2025-11-26-OVOS-hivemind-industry.png)

---

## 工业应用示例

### **1. 工人指导与装配支持**

诸如 **[TICONAI](https://wasabiproject.eu/ticonai-2)** 和 **[SKITE](https://wasabiproject.eu/skite-main-2)** 等实验正使用 OVOS skill 在装配组件、验证流程或免手动地提供逐步指令等复杂任务中指导工人。

### **2. 质量控制与减少错误**

诸如 **[WALLABI](https://wasabiproject.eu/wallabi)** 和 **[HUMANENERDIA](https://wasabiproject.eu/humanenerdia)** 等项目专注于为工人提供实时指令和检查清单以防止错误。语音助手帮助操作员核实设置、记住安全检查或交叉核对参数。

### **3. 预测性维护辅助**

诸如 **[GENIUS-PM](https://wasabiproject.eu/genius-pm)** 等实验使用助手让维护技术人员快速获取机器健康数据、故障说明和维修步骤——尤其是在他们双手被占用的时候。

### **4. 物流、物料搬运与仓库支持**

**[VELO](https://wasabiproject.eu/velo-2)** 和 **[AIVEA](https://wasabiproject.eu/aivea)** 使用语音帮助工人在车间来回走动时定位物品、确认库存或核对交付任务。

### **5. 入职与培训**

**[ONBOARD](https://wasabiproject.eu/onboard)** 和 **[AI-MODE](https://wasabiproject.eu/ai-mode)** 测试如何使用语音引导来指导新员工完成任务，减轻主管的负担。

### **6. 可持续性、废物追踪与资源效率**

**[VAFER](https://wasabiproject.eu/vafer)** 将语音接口与监控回收、物料再利用和资源流动的系统相集成——在工厂环境中免手动地进行报告。

所有这些都依赖 OVOS，并依赖 HiveMind 在设备、Android UI 和后端系统之间路由通信。

---

## COALA/WASABI 在 OVOS 之上构建了什么

尽管这些项目没有产出开源的工业 skill，但它们确实围绕 OVOS + HiveMind 创建了若干组件：

### **1. 基于 RASA 的领域助手（DA）**

早期的 COALA 研究开发了一个在制造业对话（关于质量检查、故障排除、机器操作）上训练的 **RASA NLP 流水线**。
在 WASABI 中，这个 RASA 引擎作为一个 **skill** 接入 OVOS，处理领域特定的对话。

### **2. COALA Android 应用**

一个面向工人的 Android 前端，通过 HiveMind 连接到 OVOS。

早期版本在此发布：
[https://github.com/BIBA-GmbH/Mycroft-Android](https://github.com/BIBA-GmbH/Mycroft-Android)

功能包括：

* 通过 Keycloak 登录
* 文本或语音聊天
* 用于指令、警告和备注的 UI
* 基于 HiveMind 的消息传递

### **3. 完整的基于 Docker 的工业栈**

两个项目都提供了一个预配置的 Docker 环境，捆绑了：

* OVOS
* HiveMind
* Keycloak（用户管理）
* RASA NLP 引擎
* COALA 连接器服务

这构成了所有 WASABI 实验都必须部署的标准工业语音助手栈。

### **4. 工业语音数据集**

COALA 发布了一个在工厂和车间录制的多语言语音数据集：
[https://zenodo.org/record/8268928](https://zenodo.org/record/8268928)

---

## 工业界为何选择 OVOS + HiveMind

其吸引力直截了当：

* **完全透明**（对受监管的行业至关重要）
* **本地/边缘部署**（无云依赖）
* **易于集成到现有设备中**
* **足够模块化，可支持自定义的专有 skill**
* **分布式语音网络**（遍布工厂的 HiveMind 卫星设备）

简而言之：这一组合灵活、厂商中立，并尊重工业数据的约束。

---

## 它为何适合工业界

那些在工厂车间真正重要的设计目标——面向受监管行业的完全透明、无云依赖的本地/边缘部署、面向专有逻辑的模块化 skill，以及 HiveMind 在一个设施内分布语音节点的能力——从一开始就已内建，而非事后加装。

OVOS 和 HiveMind 源代码：[github.com/OpenVoiceOS](https://github.com/OpenVoiceOS) · [github.com/JarbasHiveMind](https://github.com/JarbasHiveMind)
