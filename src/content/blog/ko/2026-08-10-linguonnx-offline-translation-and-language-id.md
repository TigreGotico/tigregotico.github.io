---
title: "linguonnx: ONNX 기반 오프라인 번역과 언어 식별"
description: "linguonnx는 CPU에서 텍스트를 번역하고 언어를 식별합니다. torch도 클라우드도 쓰지 않습니다. int8 번역 모델 184개와 언어 식별 모델 5개, 라우팅 가능한 언어 586개, 그리고 한 모델이 언어쌍을 덮지 못할 때 작은 모델들을 이어 붙이는 라우터를 갖췄습니다."
date: 2026-08-10
lang: ko
author: "Casimiro Ferreira"
tags:
  - "linguonnx"
  - "translation"
  - "language identification"
  - "ONNX"
  - "self-hosted"
  - "OVOS"
draft: false
---

[**linguonnx**](https://github.com/TigreGotico/linguonnx)는 기계 번역과 언어 식별
을 위한 파이썬 라이브러리입니다. `onnxruntime` 위에서, CPU에서, 오프라인으로 동
작합니다. 어느 단계에서도 torch를 쓰지 않습니다. 인코더-디코더 생성 루프는 빔 서
치와 KV 캐시까지 포함해 ONNX 그래프 위에 직접 작성되어 있습니다.

```bash
pip install linguonnx
```

```python
from linguonnx import load_translator, load_detector

tx = load_translator()
print(tx.translate("bom dia, como estás?", src="pt", tgt="en"))
# 'Good morning, how are you?'   via opus-mt-pt-en-int8, 172 MB

det = load_detector()
print(det.detect("Egun on, zer moduz?"))    # 'eu'
```

라이선스는 Apache-2.0이며, 요청하지 않은 모델은 내려받지 않습니다.

## 무엇이 들어 있나

레지스트리에는 번역 항목 369개(모델마다 fp32와 int8)와 언어 식별 항목 10개가 있습
니다. `load_translator()`는 기본값으로 int8을 쓰므로, 기본 설치는 양자화된 번역 모
델 184개와 양자화된 분류기 5개 위에서 라우팅합니다. 모두 HuggingFace의
[`TigreGotico/`](https://huggingface.co/TigreGotico) 아래에 공개된 ONNX 변환본입
니다.

기본 그래프에서 586개 언어로 라우팅할 수 있습니다. 이 숫자는 테스트에 고정되어 있
어서, 참으로 남아 있거나 빌드가 알려 줍니다.

분류기는 네 개 fastText 모델의 ONNX 내보내기입니다. GlotLID, 오래된 `lid.176`,
OpenLID, OpenLID-v2입니다. GlotLID는 2102개의 *변종*에 라벨을 붙이므로, 구어체 아
랍어는 나즈디(`ars`)로 돌아오고 중국어는 광둥어로 돌아올 수 있습니다. 방언 식별이
필요할 때는 그것이 쓸모 있고, 필요 없을 때는 `collapse_varieties=True`가 있습니다.

## 모델이 없는 언어쌍은 모델의 사슬이다

대부분의 언어쌍에는 이중 언어 모델이 없습니다. 라우터는 모델을 고정된 간선이 아니
라 능력의 묶음으로 보고, 필요하면 홉을 이어 붙입니다.

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — 갈리시아어를 거쳤다
```

이 정책에서 포르투갈어에서 바스크어로는 갈리시아어를 거치며, 84 MB와 153 MB짜리
Marian 모델 두 개를 지납니다. 중간 언어는 결코 숨지 않습니다. `Route`는 번역문과
함께 돌아오고, 어떤 모델을 썼고 어떤 언어를 지났는지 말합니다.

경로는 언어쌍에 대한 고정된 사실이 아닙니다. 호출자의 제약이 레지스트리에서 만들
어 내는 결과입니다. 크기 예산이나 홉 선호를 바꾸면 같은 언어쌍이 다른 언어를 거칠
수도 있고, 큰 다국어 모델 하나를 지나는 단일 홉으로 줄어들 수도 있습니다. 어느 쪽
인지는 `Route`가 알려 줍니다.

순위는 그 언어를 맡은 기관을 우선합니다. HiTZ는 바스크어를, Proxecto Nós는 갈리시
아어를, Projecte AINA는 카탈루냐어를, AI4Bharat는 인도계 언어쌍을, Masakhane는 서
아프리카 언어쌍을, TartuNLP는 핀우그리아 언어를 학습시킵니다. 동점이면 전문 기관의
모델이 일반 다국어 모델을 이깁니다.

## 정책은 실행 시점에, 색인 시점에는 결코 아니다

이것이 레지스트리의 원칙입니다. 크기, 라이선스, 점수와 무관하게 공개된 모든 모델을
나열합니다. 걸러내기와 순위 매기기는 실행 시점에, 호출자의 프로세스에서, 호출자의
규칙으로 일어납니다. 색인이 빼놓은 모델은 아예 선택할 수 없으므로, 색인은 아무것도
빼놓지 않습니다.

호출자는 `load_translator`로 정책을 정합니다. `max_model_mb`,
`oversize_fallback`, `count_cached_as_free`, `prefer`, `max_hops`, `precision`,
`model_cache_size`, `exclude_flagged`, `min_chrf`입니다. 모두 호출마다 덮어쓸 수도
있습니다.

## 크기 상한은 작은 모델을 선호하며, 언어를 지우지 않는다

크기 예산은 작은 기기에서 떠오르는 손잡이이고, 떠오르는 대로 구현하면 틀립니다.
필터로 쓰면 `max_model_mb=500`은 라우팅 가능한 586개 언어를 249개로 줄입니다. 긴
꼬리는 큰 다국어 모델 안에 살고, 작은 모델의 사슬로는 대체되지 않기 때문입니다.

`oversize_fallback=True`는 예산을 선호로 바꿉니다.

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 249가 아니라 586
```

영어에서 카탈루냐어는 작은 모델에 남습니다. 작은 모델이 있기 때문입니다. 영어에서
추바시어는 MADLAD까지 올라갑니다. 레지스트리에서 추바시어를 가진 모델은 MADLAD뿐이
고, 대안은 더 싼 경로가 아니라 경로 없음이기 때문입니다. `waived_size_cap`은 경로
가 어떤 상한을 넘었는지 알려 주므로, 500 MB를 잡아 둔 기기는 자신이 4945 MB를 받았
다는 사실을 알게 됩니다.

네 가지 규칙이 이를 정직하게 지킵니다. 넓힌 탐색은 비어서 돌아온 언어쌍에 대해서만
돕니다. 상한은 한 번에 모델 하나 크기만큼 올라가므로, NLLB-200과 MADLAD가 모두 덮
는 언어쌍은 NLLB-200을 받습니다. 상한은 경로가 아니라 모델 하나를 묶으므로, 237 MB
모델 두 홉의 사슬은 보통 탐색이 찾아냅니다. 그리고 이 상승은 내려받기 예산을 결코
넘지 않습니다.

## 라우팅 가능함은 쓸 수 있음이 아니다

`madlad400-3b-mt`는 추바시어를 덮습니다. `en -> cv`를 요청하면 러시아어로 답합니
다. `"Good day, my friend."`가 `"Добрый день, мой друг."`로 돌아옵니다. 라우팅은
옳습니다. 추바시어 태그는 별개의 SentencePiece 조각입니다. 그런데도 모델은 다른 언
어로 씁니다.

그래서 레지스트리 항목은 `language_flags`를 한 번에 한 언어씩, 근거가 된 관찰과 함
께 담습니다. 입력, 출력, 검출기의 판정(`glotlid=ru`), 날짜, 방법입니다. 추바시어는
라우팅 가능하고 쓸 수 없으며, 레지스트리는 그 둘을 모두 말합니다.

모델 전체의 품질도 같은 방식으로 기록합니다. `quality` 필드는 **사람이 만든**
FLORES-200 devtest 참조에 대한 chrF 점수를 코퍼스, 디코딩 방식, 표본 크기와 함께
담습니다. 표본 크기가 보이지 않는 점수는 아무 뜻이 없기 때문입니다. 필드가 없다는
것은 측정하지 않았다는 뜻이며, 이는 나쁘다는 것과 다른 상태입니다. 측정하지 않은
모델에 숫자를 지어내는 일은 없습니다. 두 검사가 표시를 답니다. 두 정밀도 중 하나에
서 chrF가 40 미만인 경우, 그리고 int8이 fp32보다 2 chrF 넘게 뒤진 경우입니다.

표시는 레지스트리에서 아무것도 없애지 않습니다. `exclude_flagged=True`와
`min_chrf=`에 판단 근거를 주고, 사람에게는 읽어 볼 이유를 줍니다.

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

레지스트리 전체를 훑는 검사는 등록된 모든 모델에 실제 문장 하나를 통과시키고, 빈
출력, 공백뿐인 출력, 입력과 똑같은 출력에서 실패합니다. 표본 문장은 원본 언어마다
준비되어 있고 사람이 확인했습니다. 표본이 없는 언어는 다른 언어의 문장으로 시험하
는 대신 건너뜁니다.

## OpenVoiceOS에서 쓰기

[`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)는
설치 한 번으로 라이브러리를 두 개의 플러그인으로 제공합니다. 언어 검출
(`opm.lang.detect`, id `ovos-lang-detect-plugin-linguonnx`)과 번역
(`opm.lang.translate`, id `ovos-translate-plugin-linguonnx`)입니다. 둘 다 첫 사용
때 모델을 불러오며, `load_detector`와 `load_translator`의 모든 인자를
`mycroft.conf`에서 설정할 수 있습니다.

나머지는 라이브러리 문서에 있습니다. 정책과 크기 예산은
[routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md), 레지
스트리는 [models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md),
라이선스 등급은 [licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
입니다. GPL-3.0과 CC-BY-NC-4.0 모델은 색인에 있으며 이름을 지정해 요청해야 합니다.
