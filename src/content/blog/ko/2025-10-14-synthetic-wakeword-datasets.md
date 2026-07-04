---
title: "합성 웨이크워드 데이터셋: 일곱 개의 비서 이름, 하나의 감지기"
description: "일반적인 음성 비서 이름을 위한 일곱 개의 합성 웨이크워드 데이터셋을 공개했습니다 — hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. 어디서나 작동하는 감지기를 학습시키세요."
date: 2025-10-14
lang: ko
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Wakewords"
  - "Speech"
  - "Synthetic"
  - "Voice"
  - "FOSS"
draft: false
---

일곱 개의 비서 이름. 일곱 개의 데이터셋. 모든 오디오는 Miro와 Dii 음성을 사용하여 **[phoonnx](https://github.com/TigreGotico/phoonnx)** TTS 프레임워크에서 전적으로 생성되었습니다 — 사람의 녹음도, 동의서도, 개인정보 노출도 없습니다.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

각 데이터셋은 약 천 개의 긍정 클립으로 이루어진 평면 집합입니다 — 다양한 화자, 속도, 운율로 발화된 웨이크워드입니다. 하드 네거티브와 배경 소음은 학습 시점에 섞어 넣는 별도의 동반 데이터셋으로 제공됩니다: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en), [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt), [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## 합성인 이유

실제 녹음은 수개월의 수집 기간, 모든 화자에 대한 동의서를 요구하며, 그러고도 예상하지 못한 억양의 공백을 남깁니다. 합성 생성은 이를 뒤집습니다:

- **재현 가능**: 동일한 생성 설정, 동일한 음성 → 동일한 오디오. 완전한 감사 추적, 동의서 고고학 불필요.
- **감사 가능**: 생성 파이프라인이 곧 문서입니다.
- **확장 가능**: 발화 속도와 화자 특성을 다양화하는 것은 스튜디오 세션이 아니라 매개변수 변경입니다.

웨이크워드 감지에서 관련된 속성은 자연스러움이 아니라 음향적 구별성입니다. 합성 데이터는 그 요구사항에 잘 맞습니다.

## 이것들을 사용하세요

OpenVoiceOS, Mycroft, 또는 어떤 오픈 음성 시스템을 위한 자신만의 웨이크워드 감지기를 학습시키세요. 네거티브 샘플 증강을 위해 가정용 및 퍼블릭 도메인 배경 클립 데이터셋도 있습니다: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs), [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs), [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**HuggingFace의 모든 웨이크워드 데이터셋 → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
