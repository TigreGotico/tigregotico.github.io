---
title: "OpenVoiceOS와 Home Assistant: 음성 자동화 드림팀"
description: "Home Assistant는 자동화를 담당하고, OVOS는 음성을 담당합니다. 세 가지 통합 계층이 이 조합을 작동하게 합니다: HA의 음성 파이프라인을 위한 Wyoming 브리지, 대화형 에이전트로서의 ovos-persona-server, 그리고 OVOS 기기를 네이티브 HA 엔티티로 노출하는 HiveMind."
date: 2025-09-17
lang: ko
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> 이 글은 원래 [OpenVoiceOS 블로그](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)에 게시되었습니다

Home Assistant는 자동화를 담당하고, OVOS는 음성을 담당합니다. 어느 쪽도 상대방이 되려고 하지 않습니다. 이러한 책임의 분담이 바로 이 조합이 작동하는 이유입니다: HA의 기기 통합 및 자동화 엔진이 OVOS의 유연하고 완전히 로컬인 음성 스택과 짝을 이룹니다.

이 글에서는 세 가지 통합 계층을 다룹니다: HA의 음성 파이프라인을 위한 Wyoming 브리지, 대화형 에이전트로서의 ovos-persona-server, 그리고 OVOS 기기를 네이티브 HA 엔티티로 노출하는 HiveMind입니다.

-----

## Wyoming 브리지: Home Assistant 안의 OVOS 음성 플러그인

Wyoming 프로토콜은 외부 ASR, TTS, 웨이크워드 서비스를 위한 HA의 표준 인터페이스입니다. 저희는 이 프로토콜을 통해 모든 OVOS 플러그인을 노출하는 Wyoming 브리지를 만들었습니다 — 즉, HA는 엄선된 짧은 목록뿐 아니라 OVOS 생태계의 모든 플러그인에 접근할 수 있게 됩니다.


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): 음성 명령을 Home Assistant가 이해할 수 있도록 텍스트로 변환합니다.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): Home Assistant가 OVOS의 다양한 음성 옵션을 사용하여 응답을 말할 수 있게 합니다.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): 사용자 지정 웨이크워드를 통합하여, Home Assistant 설정이 선택한 트리거 문구를 들었을 때만 응답하도록 합니다.

[OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) 프로젝트는 이러한 서비스를 패키징하여 `docker compose up` 한 번으로 사용할 수 있게 합니다.

### 공적 자금 지원 언어 프로젝트의 다국어 TTS

접근성에는 언어 접근성도 포함됩니다. 이 통합을 통해 [**ILENIA**](https://proyectoilenia.es/demostradores-2025/prototipo-ovos/)와 같은 프로젝트의 고품질 공적 자금 지원 음성을 더 많은 사용자에게 제공할 수 있습니다. Home Assistant 사용자는 카탈루냐어와 갈리시아어 같은 언어에 대해 자연스러운 음성을, 그것을 만든 프로젝트로부터 바로 얻을 수 있습니다.

* **카탈루냐어용 Matxa TTS:** [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat)는 카탈루냐어를 위한 다중 화자 음성 합성 기능을 제공합니다.
* **갈리시아어용 NosTTS:** [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos)는 갈리시아어로 견고한 음성 합성을 제공합니다.

![ILENIA 로고](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

-----

## Home Assistant용 대화형 에이전트로서의 OVOS

한 걸음 더 나아가고 싶으신가요? **Ollama 통합**을 사용하여 OVOS를 Home Assistant의 본격적인 대화형 에이전트로 설정할 수 있습니다.

![Home Assistant의 Ollama 설정](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


이 설정에서 Home Assistant는 사용자의 텍스트를 [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/)에 전달합니다; OVOS는 의도를 파악하고 Home Assistant가 말할 답변을 반환합니다. 그리고 [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server)가 Ollama 호환 엔드포인트를 노출하기 때문에, 동일한 서버는 Home Assistant뿐 아니라 Ollama 또는 OpenAI API를 사용하는 모든 앱에 연결됩니다.

![Home Assistant에서 OVOS와 채팅](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## Voice PE와 함께하는 OVOS

[Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe)은 HA의 음성 파이프라인을 위한 전용 하드웨어 새틀라이트입니다. 위에서 설명한 모든 Wyoming 서비스와 함께 작동합니다 — 실행 중인 wyoming-ovos-stt, wyoming-ovos-tts, wyoming-ovos-wakeword 인스턴스 중 아무 것이나 가리키면 됩니다.

![Home Assistant Voice Preview Edition 구성](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## HiveMind로 OVOS 기기를 Home Assistant 엔티티로 노출하기

전용 OVOS 기기가 있다면, [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) 통합이 이를 Home Assistant의 네이티브 엔티티로 표시되게 합니다 — 전체 기기를 위한 하나의 통합 제어판입니다.


### **HiveMind 통합 설정하기:**

HiveMind를 통해 OVOS 기기를 통합하려면 일반적으로 Home Assistant에서 HiveMind 통합을 추가합니다. 여기에는 통합을 위한 `name`, `access_key`, `password`, `site_id`, `host`(HiveMind 서버의 IP 주소 또는 호스트명), 그리고 `port`(기본값 5678)와 같은 연결 정보를 제공하는 것이 포함됩니다. 설정에 따라 `allow_self_signed` 인증서를 허용하거나 `legacy_audio`를 활성화하는 옵션도 있을 수 있습니다.

![Home Assistant의 HiveMind 설정](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **OVOS 기기에 노출되는 제어 기능:**

통합되면, HiveMind는 Home Assistant 내에서 OVOS 기기에 대한 포괄적인 제어 기능 세트를 노출합니다. 이를 통해 Home Assistant UI에서 OVOS 기기의 다양한 측면을 관리할 수 있습니다:

  * `Listening Mode` 변경 (예: 웨이크워드, 항상 청취)
  * `Microphone Mute` 토글
  * `OCP Player` 상태 및 제어
  * `Reboot Device`, `Restart OVOS`, `Shutdown Device`와 같은 동작
  * `Sleep Mode` 및 `SSH Service` 토글
  * 수동으로 `Start Listening` 또는 `Stop` 청취
  * 볼륨 레벨 제어

![Home Assistant의 HiveMind 엔티티](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **알림 통합:**

HiveMind는 또한 OVOS 기기가 Home Assistant 내에서 알림 대상으로 기능하도록 합니다. 즉, Home Assistant 자동화를 구성하여 OVOS 기기에 직접 음성 알림을 보낼 수 있으며, 기기가 경고, 알림, 또는 구성한 다른 정보를 "말하게" 할 수 있습니다. 이는 Home Assistant에서 "Speak" 알림 엔티티로 노출됩니다.

![Home Assistant의 HiveMind 알림 서비스](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **미디어 플레이어 및 Music Assistant 통합:**

OVOS 기기는 또한 Home Assistant에서 표준 미디어 플레이어로 표시되므로, 일반 미디어 플레이어 인터페이스에서 재생을 제어할 수 있습니다. 동일한 통합은 Music Assistant로 확장됩니다: OVOS 기기를 통해 음악을 스트리밍하면 이들은 전체 가정 오디오 시스템의 일부가 됩니다.


![Home Assistant의 HiveMind 플레이어](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![Music Assistant의 HiveMind 플레이어](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## OVOS에서 Home Assistant 엔티티 제어하기

커뮤니티가 유지 관리하는 [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant)는 HA REST API를 통해 OVOS에 Home Assistant 엔티티에 대한 직접 제어 권한을 부여합니다. OVOS 기기에 설치하면 "거실 조명 켜줘" 또는 "온도 조절기를 21도로 설정해"라고 말할 수 있습니다 — 완전히 로컬이며 클라우드가 없습니다.

-----

## 아직 거친 부분

여기서 Wyoming 브리지와 HiveMind 통합이 가장 성숙한 부분입니다. 대화형 에이전트로서의 persona-server 경로는 더 새로우며, OVOS와 HA가 함께 무엇까지 할 수 있는지 그 한계를 보고 싶다면 가장 먼저 시도해 볼 만합니다. 버그 리포트와 PR은 위에 링크된 저장소 전반에서 환영합니다.

---

OpenVoiceOS는 커뮤니티 프로젝트입니다 — 음성 비서가 개방적이고, 포용적이며, 사용자가 제어할 수 있어야 한다고 믿으신다면, 자금, 오픈 데이터, 또는 번역으로 [프로젝트를 지원](https://www.openvoiceos.org/contribution)해 주세요.
