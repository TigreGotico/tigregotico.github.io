---
title: "350개 이상 언어를 위한 자소-IPA 변환"
description: "orthography2ipa는 철자를 IPA에 매핑하고, 350개 이상의 언어 코드와 20개 이상의 어족에 걸쳐 음소가 이음(allophone)으로 실현되는 방식을 모델링하는 순수 데이터 기반의 언어학적 근거를 갖춘 리소스입니다. 최대 일치(maximal-munch) 토크나이저, 음운론적·문자적 거리 지표, 방언 계보, 스키마 검증된 사양 집합을 제공하며, 학습된 가중치 없이 완전히 자체 호스팅이 가능합니다."
date: 2026-01-15
lang: ko
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)**는 순수 데이터 기반의 Python 패키지입니다. 선언적 JSON, 얇고 플러그 가능한 로직, 학습된 가중치가 없으며, 철자를 IPA에 매핑하고 그 음소들이 **394개 언어 사양과 20개 이상의 어족**에 걸쳐 문맥 속에서 어떻게 실현되는지를 모델링합니다. 설치하고, 데이터를 읽고, 데이터를 포크하십시오. 체크포인트에 숨겨진 것은 아무것도 없습니다.

이 패키지는 하위의 모든 것을 구동합니다. 포르투갈어 전용 [silabificador](https://github.com/TigreGotico/silabificador)와 [TugaPhone](https://github.com/TigreGotico/tugaphone) 스택(**[포르투갈어 음절과 음소를 위한 고전 NLP](/ko/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** 참조), 바랑케뉴어 G2P, 그리고 **[감자에서도 돌아가는 TTS](/ko/blog/2026-05-10-tts-that-runs-on-a-potato)**의 음소 근거가 모두 이 패키지 위에 세워져 있습니다.

## 하나가 아닌 두 개의 맵

핵심적인 구분은 이렇습니다. **자소 맵(grapheme map)**은 어떤 철자가 *표현할 수 있는* 음소가 무엇인지 알려줍니다. **이음 맵(allophone map)**은 음소가 문맥 속에서 어떻게 *실현되는지* 알려줍니다. 이 둘을 뒤섞는 것이 G2P 시스템에서 가장 흔한 실패 유형입니다.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

영어의 ⟨th⟩는 /θ/와 /ð/ 사이에서 진정으로 중의적입니다. 이는 철자-음소 사실입니다. 영어의 /t/는 위치에 따라 평음 폐쇄음, 유기 폐쇄음, 성문 폐쇄음, 또는 탄설음으로 나타납니다. 이는 음소-실현 사실입니다. 둘을 분리해 두면, 전사를 위해 *텍스트 → 음소 후보*로, 발음 모델링을 위해 *음소 → 실현형*으로 진행하면서 어느 한쪽이 다른 쪽을 오염시키지 않게 할 수 있습니다. TTS에서 이것은 설득력 있는 억양과 로봇 같은 억양의 차이이며, ASR에서는 사람들이 실제로 말하는 것과 일치하는 발음 사전과 사전(dictionary)과만 일치하는 발음 사전의 차이입니다.

## 모든 언어가 담고 있는 것

각 언어는 고정된 `LanguageSpec` 데이터클래스이며, 음소 목록보다 훨씬 많은 것을 담고 있습니다. 자소(중자음과 삼중자음 포함), 이음 맵, 문맥 민감 재정의를 위한 **위치별 자소**(어두, 모음 사이, /i/ 앞), 가중치가 부여된 다중 조상 **계보**, 단어 간 **연성 규칙(sandhi rules)**, 선택적 **성조 목록**, 그리고 출처 정보 — `stub → skeleton → research → production`으로 이어지는 `QualityTier`, `ScriptType`(알파벳, 압자드, 아부기다 등), 그리고 서지 출처가 그것입니다.

포함 규칙은 엄격하며 분명하게 밝힐 가치가 있습니다. **공식 정서법과 문서화된 문법에 근거한 매핑만이 포함됩니다. 임의의 부분 문자열 규칙은 제외됩니다.** 포르투갈어 ⟨lh⟩, 독일어 ⟨sch⟩, 영어 ⟨th⟩는 표준 정서법 단위이기 때문에 포함됩니다. 편리하지만 임의로 만들어낸 휴리스틱은 포함되지 않습니다. 사양이 자소를 선언하지만 명시적인 이음 맵이 없을 때는 기준 항등 맵이 도출됩니다 — 모든 음소는 최소한 자기 자신의 실현형이 됩니다 — 따라서 아무것도 조용히 사라지지 않습니다.

지역 변이는 부모에 플래그를 다는 대신 각자의 사양을 갖습니다. 브라질 포르투갈어와 유럽 포르투갈어는 체계적으로 갈라지므로, 계보로 연결된 별개의 `LanguageSpec` 객체입니다.

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

JSON 파일이 `graphemes_base` / `allophones_base` 상속을 지원하기 때문에 방언 트리는 유지 관리가 가능한 상태를 유지합니다. 변이형은 부모와 다른 부분만 선언합니다. 계보는 가중치가 부여된 다중 조상 방식입니다 — 부모, 기층(substrate), 상층(superstrate), 방층(adstrate) — 이것이 깔끔한 후손이 아니라 접촉의 산물인 언어를 모델링하는 정직한 방법입니다.

## 중의성을 인정하는 토크나이저

철자는 깔끔한 분절 문제가 아니므로, 이 패키지는 빔 서치 IPA 확장을 갖춘 **최대 일치(maximal-munch)** 자소 토크나이저 `PhonetokTokenizer`를 함께 제공합니다. 이것은 가장 긴 일치 정서법 단위를 탐욕적으로 선호한 다음, 철자가 중의적일 때 순위가 매겨진 후보 전사들을 탐색합니다.

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

단일 출력에 도박을 거는 대신, 점수가 매겨진 빔을 얻습니다 — 이는 바로 하위의 발음 사전, 격자(lattice), 발음 재순위화기가 원하는 입력입니다.

## 언어 간 거리 측정

데이터가 가중치에 구워지지 않고 구조화되어 있기 때문에, 언어들을 직접 비교할 수 있습니다. 거리 지표는 음소 목록, 자소, 이음, 계보 차원에 걸쳐 있으며, 별도의 문자 거리 계열도 있습니다.

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

특성 벡터도 노출되어 있어, 두 포르투갈어 표준처럼 거의 동일한 쌍은 0.04로 나오는 반면 진정으로 멀리 떨어진 쌍은 명확하게 분리됩니다. 이는 전이 학습 결정, 저자원 부트스트래핑, 방언계측학(dialectometry) 모두에 유용합니다.

## CLI

위의 모든 것은 Python을 작성하지 않고도 접근할 수 있습니다. `orthography2ipa` 콘솔 스크립트는 `list`, `info`, `transcribe`, `distance`를 제공하며, 모든 하위 명령은 파이프라인으로 연결하기 위한 `--json`을 지원합니다.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## 순수 데이터가 중요한 이유

전체 사양 집합은 스키마 검증을 거칩니다 — 고정된 pydantic 스타일 데이터클래스, 무결성 테스트 스위트로 점검되는 **394개 사양**, 그 형태를 문서화하는 `SCHEMA.md`가 있습니다. 정적 테이블이 규칙을 진정으로 표현할 수 없는 곳에서는 언어별 로직이 데이터 주변에 플러그인됩니다. 음절 분석기는 엔트리 포인트 그룹을 통해 등록되고, 더 무거운 알고리즘 G2P(태양 문자 동화, 하므자트 알와슬 탈락, 탄윈 형태를 처리하는 우리의 아랍어 토크나이저 [arbtok](https://github.com/TigreGotico/arbtok) 등)는 동일한 사양 위에 하위에서 구축됩니다.

사용자의 언어가 어떻게 들리는지 결정하는 불투명한 모델은 없습니다. 매핑은 감사 가능하고, 출처는 인용되며, 언어를 추가하는 것은 검증된 JSON 파일 하나를 작성하는 일입니다. 자신의 음운론을 블랙박스에 아웃소싱하기를 거부하고 — 그리고 자신의 하드웨어에서 그것을 실행하고자 하는 — TTS, ASR, 음성 NLP를 구축하는 모든 사람에게, 그것이 바로 요점입니다. Apache 2.0 라이선스이며, 검토하고 확장하고 자체 호스팅할 수 있는 여러분의 것입니다.
