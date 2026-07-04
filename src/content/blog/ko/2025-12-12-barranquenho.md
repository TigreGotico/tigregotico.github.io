---
title: "바랑케뉴어를 위한 최초의 음소화기 소개"
description: "g2p_barranquenho는 포르투갈 바랑코스의 이베로-로망스 접촉 언어인 바랑케뉴어를 위한 최초의 오픈 자소-음소 변환기입니다. 규칙은 해당 지자체가 새로 발표한 정서법 규약에서 도출되었으며, 함께 커밋된 원본 자료로 감사할 수 있습니다."
date: 2025-12-12
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

그 정서법 규약으로부터 규칙 집합을 도출했습니다. 음소화기는 소문자로 변환된 입력에 대해 두 번의 패스를 실행합니다.

1. **중자음 패스(Digraph pass)** — 여러 글자로 이루어진 자소를 축약합니다: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/, 그리고 전설 모음 앞의 `qu`/`gu` → /k//g/.
2. **자소 패스(Grapheme pass)** — 나머지 문자를 문맥 민감 규칙으로 IPA에 매핑합니다: `m`/`n` 앞의 비모음 이중모음(예: `an` → /ɐ͂/), 어말 `e` → /ɨ/, `v`는 항상 → /b/, 어두를 제외한 유성음화된 `s` → /z/, `r` 대 `rr`(탄설음 대 전동음), 그리고 두 모어 언어와 달리 발음되는 /h/로서의 `h`.

`x` 자소가 가장 복잡한 논리를 가지며, 바랑케뉴어 규약이 규정하지 않는 부분에서는 포르투갈어 문맥 휴리스틱으로 대체됩니다.

실제 예시:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ũ ẽjoɾmj pasu paɾɐ u bɐrɐ͂keɲu j paɾɐ ɐ kultuɾɐ bɐrɐ͂keɲɐ`

이 라이브러리는 단일 함수 `phonemize(word: str) -> list[str]`이며, 런타임 의존성이 없는 순수 Python입니다. 원본 PDF(규약, 사전, 문법)는 저장소 루트에 커밋되어 있어 규칙을 원본 자료에 대해 감사할 수 있습니다.

### 다음 단계

G2P 변환기는 TTS 및 ASR 작업의 최소 전제 조건입니다. 이것이 없으면 텍스트로 학습된 모델은 원칙적인 음성적 근거를 갖지 못합니다. 이것이 있으면 바랑케뉴어 음성 모델로 가는 길은 우리가 아스투리아스어와 아라곤어에 사용한 것과 동일한 하이브리드 파이프라인을 따릅니다. 걸림돌은 도구가 아니라 음성 데이터입니다.

**바랑케뉴어 구어 녹음을 보유하고 계시거나 오픈 라이선스로 기여할 의향이 있는 화자에게 접근하실 수 있다면 연락 주십시오.** 단 몇 시간 분량이라도 원어민 녹음이 있다면 TTS 모델을 실현할 수 있습니다.

→ [GitHub의 g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)
