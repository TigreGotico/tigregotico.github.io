---
title: "바랑케뉴어를 위한 최초의 음소화기 소개"
description: "g2p_barranquenho는 포르투갈 바랑코스의 이베로-로망스 접촉 언어인 바랑케뉴어를 위한 최초의 오픈 자소-음소 변환기입니다. 규칙은 해당 지자체가 새로 발표한 정서법 규약에서 도출되었으며, 함께 커밋된 원본 자료로 감사할 수 있습니다."
date: 2025-12-12
updated: 2026-08-01
lang: ko
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)는 [바랑케뉴어](https://en.wikipedia.org/wiki/Barranquenho)를 위한 최초의 오픈 자소-음소(Grapheme-to-Phoneme) 변환기입니다. 바랑케뉴어는 포르투갈 바랑코스에서 사용되는 이베로-로망스 접촉 언어로, 이 지역은 포르투갈어와 엑스트레마두라/안달루시아 스페인어가 수 세기 동안 공존해 온 스페인 국경의 지자체입니다.

### 바랑케뉴어가 음운론적으로 흥미로운 이유

바랑케뉴어는 포르투갈어나 스페인어의 방언이 아니라, 진정으로 독립적인 체계입니다. 바랑코스 시의회는 최근 사전, 정서법 규약, 기초 문법이라는 세 가지 기초 문헌을 발표했으며, 이 문헌들이 우리에게 필요한 규칙을 제공했습니다. 발표 내용은 다음과 같습니다: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

그 정서법 규약으로부터 규칙 집합을 도출했습니다 — 하지만 텍스트에 대해 직접 짠 전용 패스를 만드는 대신, 공유 **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** 엔진 안의 언어 스펙 `ext-PT-x-barrancos`로 존재합니다. 이 스펙의 자소 표, 이음 규칙, 강세 모델, 단어 경계 연성(sandhi)은 바랑케뉴어의 모든 실현형을 기술합니다: 여러 글자로 이루어진 자소는 규약이 문서화한 대로 축약되며(`tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/), 비모음 이중모음은 `m`/`n` 앞에서 나타나고, `v`는 항상 /b/로 매핑되며, `h`는 두 모어 언어와 달리 발음되는 /h/로 나타납니다.

`g2p_barranquenho` 자체는 그 스펙에 의해 구동되는 `orthography2ipa.G2P` 위의 얇은 호출부 래퍼입니다: 텍스트 정규화(대소문자 통합, 스펙이 기대하는 형태로의 토큰화), 숫자 확장, 안정적인 `phonemize`/`transcribe` 인터페이스는 이 래퍼가 담당하지만 음운 규칙 자체는 담당하지 않습니다 — 규칙을 개선하려면 상위(upstream)의 스펙을 편집해야 하며, 그렇게 하면 모든 다운스트림 소비자가 그 수정을 공유합니다.

실제 예시:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ˈũ eˈnɔɾmi ˈpas̺u ˈpaɾɐ ˈu bɐrɐ̃ˈkɛɲu ˈi ˈpaɾɐ ɐ kuˈltuɾɐ bɐrɐ̃ˈkɛɲɐ`

원본 PDF(규약, 사전, 문법)는 저장소 루트에 커밋되어 있어 규칙을 원본 자료에 대해 감사할 수 있습니다.

### 다음 단계

G2P 변환기는 TTS 및 ASR 작업의 최소 전제 조건입니다. 이것이 없으면 텍스트로 학습된 모델은 원칙적인 음성적 근거를 갖지 못합니다. 이것이 있으면 바랑케뉴어 음성 모델로 가는 길은 우리가 아스투리아스어와 아라곤어에 사용한 것과 동일한 하이브리드 파이프라인을 따릅니다. 걸림돌은 도구가 아니라 음성 데이터입니다.

**바랑케뉴어 구어 녹음을 보유하고 계시거나 오픈 라이선스로 기여할 의향이 있는 화자에게 접근하실 수 있다면 연락 주십시오.** 단 몇 시간 분량이라도 원어민 녹음이 있다면 TTS 모델을 실현할 수 있습니다.

→ [GitHub의 g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)
