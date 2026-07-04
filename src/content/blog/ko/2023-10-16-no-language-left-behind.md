---
title: "소외되는 언어 없이"
description: "언어 감지, 번역 플러그인, 양방향 번역 기능을 통해 OpenVoiceOS의 언어 장벽을 없앱니다."
date: 2023-10-16
lang: ko
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> 이 글은 원래 제 개인 블로그(현재는 없어짐)에 게시되었습니다

OpenVoiceOS(OVOS)는 커뮤니티가 주도하는 오픈 소스 음성 비서 플랫폼입니다. 이 글에서는 설치된 skill이 기본적으로 지원하는 범위를 훨씬 뛰어넘어 OVOS가 다양한 언어에서 작동하도록 제가 만든 언어 감지, 번역, 양방향 번역 플러그인을 다룹니다.


## 오디오로부터의 언어 감지

OVOS는 오디오가 ASR 전사 단계에 도달하기 전에 그 안에서 말해진 언어를 식별하여, ASR 플러그인이 추측하는 대신 정확하게 전사하도록 합니다. 저는 이를 위해 여러 플러그인을 만들었습니다:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

언어 감지는 OVOS 설정에 나열된 언어로 제한됩니다 — 그 집합을 벗어난 분류는 거부되므로, 가정 내 아무도 사용하지 않는 언어로 실수로 전환되지 않습니다.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### 설정

FasterWhisper의 언어 분류 모델 크기는 설정할 수 있습니다:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## 텍스트 언어 번역

[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/)는 200개 언어 간의 고품질 직접 번역을 위한 Meta의 오픈 소스 모델로, 아스투리아스어, 루간다어, 우르두어와 같은 저자원 언어도 포함합니다. 이 글의 제목은 그 이름에서 영감을 받았습니다.

[ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)는 OVOS 내부에서 NLLB를 로컬로 실행합니다. Skill이 완전한 기본 언어 지원을 갖추는 데는 시간이 걸리지만, 이 플러그인이 있으면 사용자는 더 이상 기다릴 필요가 없습니다 — OVOS가 들어오는 발화와 나가는 응답을 실시간으로 번역하므로, 어떤 skill이든 그 200개 언어 중 어느 것으로든 작동합니다.

성능이 낮은 하드웨어의 경우, [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)이 번역을 원격 서버로 오프로드합니다. 기본으로 공개 서버가 나열되어 있지만, 개인정보 보호를 위해 자체 호스팅을 강력히 권장합니다. **공개 서버를 사용한다는 것은 모든 발화를 그 운영자에게 맡긴다는 것을 의미합니다.**

주목할 만한 번역 플러그인:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### 설정

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## OVOS 양방향 번역 플러그인

[OVOS 양방향 번역 플러그인](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev)은 두 개의 파이프라인 단계로 감지와 번역을 연결합니다: **Utterance Transformer**(들어오는 텍스트를 OVOS의 설정된 언어로 번역)와 **Dialog Transformer**(응답을 사용자의 원래 언어로 다시 번역)입니다.

선택적 `verify_lang` 모드는 감지된 텍스트 언어를 세션 언어와 교차 검증합니다 — 단일 OVOS 인스턴스가 다국어 사용자를 서비스하는 채팅 플랫폼에서 유용합니다. `language.detection_module`에 설정된 [언어 감지 모듈](https://openvoiceos.github.io/ovos-technical-manual/lang_support/)과 번역 플러그인(로컬은 `ovos-translate-plugin-nllb`, 원격은 `ovos-translate-server-plugin`)이 필요합니다.

### 설정

```json
"utterance_transformers": {
    "ovos-utterance-translation-plugin": {
        "bidirectional": true,
        "verify_lang": false,
        "ignore_invalid": true,
        "translate_secondary_langs": true
    }
},
"dialog_transformers": {
    "ovos-dialog-translation-plugin": {}
}
```

## 함께 작동하는 방식

각 구성 요소는 독립적으로 유용하지만, 깔끔하게 조합됩니다:

1. **오디오 언어 감지** — ASR 플러그인에 어떤 언어를 전사할지 알려줍니다.
2. **발화 번역** — skill 매칭 전에 비원어 발화를 비서의 설정된 언어로 변환합니다.
3. **다이얼로그 번역** — TTS 전에 비서의 응답을 사용자의 언어로 다시 번역합니다.

그 결과: OVOS는 skill 자체에 번역이 필요 없이 NLLB의 200개 언어 중 어느 것이든 처음부터 끝까지 처리할 수 있습니다.

기여와 skill 번역은 [GitHub의 OpenVoiceOS](https://github.com/OpenVoiceOS)에서 환영합니다.
