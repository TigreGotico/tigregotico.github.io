---
title: "OpenVoiceOS 与 Home Assistant：语音自动化梦之队"
description: "Home Assistant 负责自动化，OVOS 负责语音。三个集成层让这一组合得以运转：面向 HA 语音流水线的 Wyoming 桥接、作为对话代理的 ovos-persona-server，以及将 OVOS 设备呈现为原生 HA 实体的 HiveMind。"
date: 2025-09-17
lang: zh
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> 本博客最初发表于 [OpenVoiceOS 博客](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)

Home Assistant 负责自动化，OVOS 负责语音。两者都不试图成为对方。正是这种职责划分让这一组合得以运转：HA 的设备集成和自动化引擎，搭配 OVOS 灵活、完全本地的语音栈。

本文介绍三个集成层：面向 HA 语音流水线的 Wyoming 桥接、作为对话代理的 ovos-persona-server，以及将 OVOS 设备呈现为原生 HA 实体的 HiveMind。

-----

## 为 Home Assistant 赋予由 OVOS 驱动的语音

Wyoming 协议是 HA 用于对接外部 ASR、TTS 和唤醒词服务的标准接口。我们构建了 Wyoming 桥接，将任意 OVOS 插件通过该协议暴露出来——这意味着 HA 能够访问 OVOS 生态中的每一个插件，而不仅仅是经过挑选的一小部分。


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt)：将口头命令转换为文本，供 Home Assistant 理解。
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts)：让 Home Assistant 使用 OVOS 丰富多样的语音选项来朗读响应。
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword)：集成自定义唤醒词，让你的 Home Assistant 配置仅在听到你所选择的触发短语时才响应。

[OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) 项目将这些服务打包，因此只需一条 `docker compose up` 即可运行。

### **插件亮点：由 ILENIA 驱动的多语言 TTS**

对我们而言，无障碍是关键。这也包括语言无障碍。我们很自豪，这一集成让我们能够将来自 [**ILENIA**](https://proyectoilenia.es/) 等项目的高质量、由公共资金资助的语音带给更广泛的受众。Home Assistant 用户可以获得诸如加泰罗尼亚语和加利西亚语等语言的自然音色语音，直接来自构建它们的项目。

* **面向加泰罗尼亚语的 Matxa TTS：** [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) 为加泰罗尼亚语提供多说话人文本转语音能力。
* **面向加利西亚语的 NosTTS：** [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) 提供强健的加利西亚语文本转语音。

![ILENIA logo](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **在 Home Assistant 中设置 Wyoming 服务：**

在 Home Assistant 中配置 Wyoming 服务时，你通常会参考 [Home Assistant 官方文档](https://www.home-assistant.io/integrations/wyoming/)。这个过程通常只需在 Home Assistant 网页界面中输入你的 Docker 容器（或运行 OVOS Wyoming 服务的主机）的 IP 地址即可。

![wyoming setup in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![wyoming entities in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## 让 OVOS 成为对话的大脑

想要更进一步？你可以使用 **Ollama 集成**将 OVOS 设置为 Home Assistant 的一个功能完备的对话代理。

![ollama setup in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


在这种配置下，Home Assistant 将用户的文本传递给 [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/)；OVOS 理清意图并返回答案，交由 Home Assistant 朗读。而由于 [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) 暴露了兼容 Ollama 的端点，同一个服务器可以接入任何支持 Ollama 或 OpenAI API 的应用——而不仅仅是 Home Assistant。

![chat with OVOS in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS 搭配 Voice PE

[Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) 是一款面向 HA 语音流水线的专用硬件卫星设备。它可与上文所述的所有 Wyoming 服务配合使用——将其指向任何正在运行的 wyoming-ovos-stt、wyoming-ovos-tts 或 wyoming-ovos-wakeword 实例即可。

![Configuring Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## 用 HiveMind 将你的 OVOS 设备接入 Home Assistant

如果你有专用的 OVOS 设备，[HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) 集成能让它们在 Home Assistant 中显示为原生实体——为整个设备群提供一个统一的控制面板。


### **设置 HiveMind 集成：**

要通过 HiveMind 集成你的 OVOS 设备，你通常需要在 Home Assistant 中添加 HiveMind 集成。这涉及提供连接详情，例如集成的 `name`、`access_key`、`password`、`site_id`、`host`（你的 HiveMind 服务器的 IP 地址或主机名）以及 `port`（默认为 5678）。根据你的配置，你可能还有 `allow_self_signed`（允许自签名证书）或启用 `legacy_audio` 等选项。

![HiveMind setup in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **为 OVOS 设备暴露的控制项：**

集成完成后，HiveMind 会直接在 Home Assistant 中为你的 OVOS 设备暴露一整套控制项。这让你可以从 Home Assistant 界面管理 OVOS 设备的各个方面，包括：

  * 更改 `Listening Mode`（例如唤醒词、持续监听）
  * `Microphone Mute` 开关
  * `OCP Player` 状态与控制
  * 诸如 `Reboot Device`、`Restart OVOS` 和 `Shutdown Device` 等操作
  * 切换 `Sleep Mode` 和 `SSH Service`
  * 手动 `Start Listening` 或 `Stop`（停止）监听
  * 控制音量大小

![HiveMind entities in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **通知集成：**

HiveMind 还能让你的 OVOS 设备在 Home Assistant 中充当通知目标。这意味着你可以配置 Home Assistant 自动化，将口头通知直接发送到你的 OVOS 设备，让它们"朗读"警报、提醒或你配置的任何其他信息。这在 Home Assistant 中以一个 "Speak" 通知实体的形式暴露出来。

![HiveMind notify service in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **媒体播放器与 Music Assistant 集成：**

OVOS 设备在 Home Assistant 中也会显示为标准媒体播放器，因此你可以从常规的媒体播放器界面控制播放。同样的集成也延伸到 Music Assistant：通过你的 OVOS 设备流式播放音乐，它们就成为你全屋音频系统的一部分。


![HiveMind player in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![HiveMind player in Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## 把王国的钥匙交给 OVOS

由社区维护的 [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant) 让 OVOS 能够通过 HA REST API 直接控制 Home Assistant 实体。将它安装到你的 OVOS 设备上，你就可以说"打开客厅的灯"或"把恒温器设为 21 度"——完全本地，无需云。

-----

## 为每项工作选对工具

OVOS 负责语音；Home Assistant 负责自动化。两者都不为了做对方的工作而妥协，而且集成点足够干净，使得每个项目都能保持自己的发布周期。

欢迎在上文链接的各个仓库中提交 bug 报告和 PR。

---

OpenVoiceOS 是一个社区项目——如果你认为语音助手应当是开放、包容且由用户掌控的，请通过资金、开放数据或翻译[支持本项目](https://www.openvoiceos.org/contribution)。
