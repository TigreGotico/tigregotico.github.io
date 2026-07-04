---
title: "감자에서도 돌아가는 TTS 모델"
description: "phoonnx는 저사양 하드웨어에서 편안하게 실행되도록 만들어진, VITS 기반 텍스트 음성 변환을 위한 연구 프레임워크입니다. GPU도, 클라우드도, API 키도 없습니다 — 약 1,565만 개의 파라미터를 가진 ONNX 음성과 CPU 하나면 됩니다. 좋은 음성이 얼마나 작을 수 있는지, 그리고 우리가 그것을 어떻게 훈련하는지 소개합니다."
date: 2026-05-10
lang: ko
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "ONNX"
  - "VITS"
  - "self-hosted"
  - "OVOS"
draft: false
---

좋은 텍스트 음성 변환에는 강력한 GPU, 두둑한 클라우드 청구서, 그리고 신용카드가 붙어 있는 API 키가 필요하다는 뿌리 깊은 신화가 있습니다. 그렇지 않습니다. 자연스러운 다국어 음성은 서버라고 부르기 민망할 정도의 것 — "혹시 몰라서" 서랍에 넣어 두는 종류의 보드 — 에 들어갈 수 있습니다. 감자 한 알에 말이죠.

[**phoonnx**](https://github.com/TigreGotico/phoonnx)는 바로 그 목표를 위한 우리의 연구 프레임워크입니다: **완전히 오프라인으로, CPU에서, 저렴한 하드웨어에서** 실행되고, 우리가 처음부터 *직접 훈련*할 수도 있는 작은 VITS 기반 음성입니다.

## 얼마나 작은 게 작은 걸까?

손짓으로 얼버무리는 대신 실제 숫자를 대봅시다. 우리는 프로덕션 phoonnx 음성 — 바스크어 "Miro" 음성(`OpenVoiceOS/phoonnx_eu-ES_miro_espeak`) — 을 Hugging Face에서 곧바로 가져와 ONNX 그래프의 가중치를 세어 보았습니다:

```python
import onnx, numpy as np
m = onnx.load("miro_eu-ES.onnx")
print(sum(int(np.prod(i.dims)) for i in m.graph.initializer))
# 15650459
```

**약 1,565만 개의 파라미터.** 그것이 음성 전체입니다 — 인코더, 디코더, 전부 — 63 MB 파일 안에 들어 있습니다. 같은 릴리스의 여성 "Dii" 음성도 *정확히 같은* 숫자로 셈이 되는데, 표준 phoonnx VITS 아키텍처를 공유하기 때문입니다. 개성은 추가 용량이 아니라 가중치에 담겨 있습니다.

비교하자면: "작은" 현대 언어 모델의 단일 레이어 하나가 이 음성 합성기 전체보다 더 많은 파라미터를 담을 수 있습니다. 1,550만은 대략 휴대폰 스냅사진 한 장의 무게이며, 그것이 유창하게 말을 합니다.

## 왜 VITS이고, 왜 ONNX인가

[VITS](https://arxiv.org/abs/2106.06103)는 모든 phoonnx 음성의 근간입니다. 이것은 종단 간(end-to-end) 아키텍처입니다 — 텍스트(정확히는 음소)가 들어가고 파형이 나오며 — 별도로 돌봐야 할 보코더도, 한 번에 한 샘플씩 기어가는 자기회귀 루프도 없습니다. 바로 그 종단 간 설계가 감자에서 실행 가능하게 만드는 핵심입니다: 한 번의 순전파, 병렬 합성, 끝.

우리는 엣지에 PyTorch를 배포하지 않습니다. 훈련된 음성은 **ONNX**로 내보내지고 **CPU**에서 [`onnxruntime`](https://onnxruntime.ai/)을 통해 실행됩니다 — CUDA도, GPU도, 드라이버 룰렛도 없이. `onnxruntime`은 조밀하고 이식성 있는 C++ 엔진이며, 1,500만 파라미터 그래프는 Raspberry Pi급 코어가 실시간보다 빠르게 처리하는 범위 안에 충분히 들어옵니다. 그 결과는 인터넷이 끊겼을 때, 클라우드 공급자에 장애가 났을 때, 또는 애초에 집안 오디오가 집 밖으로 나가는 것을 결코 원치 않았을 때에도 계속 말을 하는 음성 비서입니다. **여기서 데이터 주권은 기능 토글이 아닙니다. 아키텍처 그 자체입니다.**

## 음소, 지능이 숨어 있는 곳

작은 음향 모델이 작아도 되는 이유는 phoonnx가 어려운 언어학적 작업을 *앞단에서*, 음소화기(phonemizer)에서 처리하기 때문입니다. 음소화기(자소-음소 변환, 곧 G2P)는 쓰인 텍스트를 모델이 실제로 발음하는 소리 단위의 시퀀스로 변환합니다 — 그래서 VITS 네트워크는 철자를 배울 필요 없이 소리만 배우면 됩니다.

우리의 음소 작업은 **[350개 이상 언어를 위한 자소-IPA 변환](/ko/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**과 **[고전 포르투갈어 음성학](/ko/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**에 기반을 두고 있으며, 이는 몇 주에 걸친 전문가 주석 작업 없이도 저자원 언어를 위한 음성을 훈련하는 것을 가능하게 합니다.

phoonnx는 의도적으로 음소화기에 구애받지 않으며 작은 군대만큼의 음소화기를 묶어 제공합니다: `espeak-ng`, [gruut](https://github.com/rhasspy/gruut), [epitran](https://github.com/dmort27/epitran), [misaki](https://github.com/hexgrad/misaki), [transphone](https://github.com/xinjli/transphone)(Glottolog에 목록화된 수천 개의 언어에 손을 뻗습니다), 그리고 아랍어를 위한 [mantoq](https://github.com/mush42/mantoq), 갈리시아어를 위한 **[cotovia](https://github.com/TigreGotico/pycotovia)**, 일본어를 위한 OpenJTalk, 한국어를 위한 KoG2P 같은 전문가들이 있습니다. 이들은 IPA, ARPA, Pinyin, Hangul, Buckwalter를 내보냅니다 — 언어가 필요로 하는 무엇이든. 심지어 ByT5 위에 구축되어 다른 모든 것과 마찬가지로 ONNX로 내보내진, 모델 기반 다국어 G2P도 있습니다.

철자법을 음소화기에 떠넘기는 것이야말로, 1,500만 파라미터 모델이 글로 쓰인 것을 한 번도 본 적 없는 저자원 언어에서도 좋게 들리게 하는 비결입니다.

## 실행만이 아니라 음성을 *만들기* 위한 프레임워크

이것이 가장 중요한 부분이자 간과되는 부분입니다: phoonnx는 추론 툴킷만이 아닙니다. 동반 프레임워크 [**`phoonnx_train`**](https://github.com/TigreGotico/phoonnx)은 우리가 애초에 음성을 *만드는* 방법입니다.

`phoonnx_train`은 전체 파이프라인을 다룹니다:

- LJSpeech 스타일 데이터셋을 음소화된 훈련 데이터로 **전처리**.
- 적당한 GPU 시간에 VITS 생성기(그 약 1,565만 파라미터)를 **훈련** — 이들은 작은 모델이므로, 대규모 음성 시스템에 비해 훈련이 저렴하고 빠릅니다.
- 완성된 체크포인트를 단일 스크립트로 ONNX로 **내보내기**, 디바이스의 `onnxruntime`에 곧바로 떨어뜨릴 준비가 된 상태로.

레시피가 공개되어 있고 모델이 작기 때문에, *어떤* 개방형 오프라인 옵션도 없는 언어를 위한 완전히 새로운 음성을 만드는 것은 연구비 규모의 프로젝트가 아니라 주말 규모의 프로젝트입니다. 그것이 우리가 소외된 언어들 — 바스크어, 미란다어, 유럽 포르투갈어 등 — 을 위한 공백을, 어느 공급업체가 그 언어를 상업적으로 흥미롭다고 결정하기를 기다리는 대신 채워 온 방식입니다.

## 이미 여러분의 비서에 연결됨

이 모든 것을 손으로 붙일 필요는 없습니다. phoonnx는 여러분을 위해 음성을 가져오고 로드하는 네이티브 OpenVoiceOS 플러그인 `ovos-tts-plugin-phoonnx`를 제공합니다:

```json
"tts": {
  "module": "ovos-tts-plugin-phoonnx",
  "ovos-tts-plugin-phoonnx": {
    "voice": "OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone"
  }
}
```

`voice`를 빼면 여러분의 언어와 일치하는 첫 번째 모델을 선택합니다. 비서 바깥에서 음성을 관리하려면, 언어 목록을 보고, 음성을 둘러보고, 모델을 미리 다운로드하는 CLI `phoonnx-voices`가 있습니다:

```bash
phoonnx-voices list-voices --lang pt-PT
phoonnx-voices download OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone
```

그리고 phoonnx는 순수한 VITS-over-ONNX로 말하기 때문에, 그 추론 엔진은 Piper, Mimic3, Coqui, MMS로 훈련된 음성도 실행합니다 — 통틀어 **천 개가 넘는 언어와 음성**을. 하나의 작은 런타임, 거대한 카탈로그, 그 어느 것도 본사에 연락하지 않습니다.

## 요점

여러분을 존중하는 음성 기술은 *여러분이 있는 곳* — 여러분의 하드웨어에서, 여러분의 통제 아래, 원한다면 네트워크 케이블을 뽑은 채로 — 실행되어야 합니다. phoonnx는 그곳에 도달하는 길이 더 큰 모델이 아니라, 작게 만든 올바른 아키텍처라는 우리의 베팅입니다: 근간을 위한 VITS, 언어학적 부담을 짊어질 영리한 음소화기, 이식성을 위한 ONNX, 그리고 누구나 카탈로그를 키울 수 있는 개방형 훈련 프레임워크.

1,550만 파라미터. GPU 없음. 클라우드 없음. 변명 없음. 감자에서 돌아간다면, 어디서든 돌아갑니다.
