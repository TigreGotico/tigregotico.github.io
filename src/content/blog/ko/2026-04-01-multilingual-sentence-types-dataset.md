---
title: "다국어 문장 유형 데이터셋: 질문, 명령, 진술"
description: "sentence-types-multilingual을 공개했습니다 — 일곱 개 언어에 걸친 약 70,000개의 문장을 문법적 유형(질문, 명령, 진술, 감탄)에 따라 분류한 데이터셋입니다. little_questions 라우팅 라이브러리를 뒷받침하는 학습 코퍼스입니다."
date: 2026-04-01
lang: ko
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

음성 비서의 라우팅 로직은 어떤 것에 답하려 시도하기 전에, 어떤 종류의 문장을 받았는지 아는 것에 달려 있습니다. 질문에는 답이 필요합니다. 명령에는 실행이 필요합니다. 진술에는 확인 응답이나 저장이 필요할 수 있습니다. 사용자가 사용하는 어떤 언어에서든 그 분류를 올바르게 하는 것은 나머지 모든 것의 전제 조건입니다.

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** 은 그 계층을 뒷받침하는 학습 코퍼스입니다 — 라벨이 부여된 69,300개의 문장으로, 일곱 개 언어(영어, 스페인어, 프랑스어, 독일어, 이탈리아어, 포르투갈어, 네덜란드어) 각각에 9,900개씩입니다.

## 라벨이 실제로 의미하는 것

이 데이터셋은 네 가지 최상위 유형을 사용하며, 이는 `little_questions`(이 데이터를 소비하는 추론 라이브러리)가 발화를 라우팅하는 방식에 직접 대응됩니다.

- **question** — 하위 유형으로 더 세분화됩니다: `yes_no_question`, `wh_question`, `tag_question`. `little_questions` 내부의 EAT 분류 체계는 53개의 세분화된 답변 유형 라벨(사람, 위치, 수량, 정의 등)을 추가하지만, 문장 유형 분류가 첫 번째 관문입니다.
- **command** — 명령형 및 요청 형태입니다. 명령은 답변을 기대하지 않습니다. 실행을 기대합니다.
- **statement** — 평서형입니다. 대화 맥락에서 진술은 종종 하류에서 중요한 극성(polarity)을 지닙니다: 이전 질문에 대한 답변을 해석하기 위해 진술에 대해 예/아니오/아마도 분류기가 실행됩니다.
- **exclamation** — 감정적으로 표시된 발화로, 중립적인 평서문과는 다른 처리가 필요합니다.

```json
{
  "text": "What time is it?",
  "language": "en",
  "type": "question",
  "sub_type": "wh_question"
}
```

## 교차 언어적 커버리지가 사소하지 않은 이유

같은 의사소통 의도가 서로 다른 문법에서 다르게 표면화됩니다:

- 영어는 어순 도치로 질문을 표시하지만, 포르투갈어와 스페인어는 어순을 그대로 둔 채 종종 구두점과 억양만으로 질문을 표시합니다.
- 독일어는 분류 신호가 위치하는 곳을 이동시키는 방식으로 동사를 문장 끝 위치로 분리합니다.
- 로망스어는 영어가 동사의 기본형으로 표현하는 명령을 위해 전용 명령형 형태론을 사용합니다.

영어로만 학습된 모델은 다른 모든 곳에서 이러한 경우를 틀립니다. 일곱 개 언어에 걸친 병렬 라벨 데이터는 언어별 분류기가 필요로 하는 교차 언어적 신호를 제공하며, 동일한 생성 파이프라인은 추가되는 언어들로 확장됩니다.

## 하류 스택

이 데이터로 학습된 모델들은 **[little_questions](https://github.com/TigreGotico/little_questions)** 안에 포함되어 배포됩니다 — 문장 유형에 대한 언어별 ONNX 분류기와 43개 언어 예/아니오 극성 모델을 갖춘, 의존성이 없는(numpy + onnxruntime) 오프라인 라이브러리입니다. 모델은 영어의 경우 휠(wheel) 안에 번들되며, 다른 언어의 경우 지연 다운로드됩니다. HuggingFace 소스는 `TigreGotico/sentence-types` 와 `TigreGotico/eat-classifiers` 입니다.

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` 는 OVOS와 LILACS를 위한 자연어 라우팅 계층입니다: 발화가 질문인지, 명령인지, 진술인지 분류하는 것은 음성 파이프라인이 내리는 첫 번째 디스패치 결정입니다.

[**HuggingFace의 sentence-types-multilingual**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**GitHub의 little_questions**](https://github.com/TigreGotico/little_questions)
