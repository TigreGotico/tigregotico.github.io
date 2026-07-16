---
title: "676개 언어를 위한 자소-IPA 변환"
description: "orthography2ipa는 철자를 IPA에 매핑하고, 약 750개의 언어 사양, 676개 언어, 20개 이상의 어족에 걸쳐 음소가 이음(allophone)으로 실현되는 방식을 모델링하는 순수 데이터 기반의 언어학적 근거를 갖춘 리소스입니다. 후보 격자(lattice), 최대 일치(maximal-munch) 토크나이저, 음운론적·문자적 거리 지표, 방언 계보, 그리고 방언학 문헌에 인용된 스키마 검증 사양 집합을 제공하며, 학습된 가중치 없이 완전히 자체 호스팅이 가능합니다."
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

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)**는 순수 데이터 기반의 Python 패키지입니다 — 선언적 JSON, 얇고 플러그 가능한 로직, 학습된 가중치 없음 — 철자를 IPA에 매핑하고 그 음소들이 문맥 속에서 어떻게 실현되는지를 모델링합니다. 이 패키지는 **20개 이상의 어족**에 걸쳐 **676개 언어를 아우르는 약 750개의 언어 사양**(그리고 분류 전용 분지군 노드 73개)을 제공합니다. 설치하고, 데이터를 읽고, 데이터를 포크하십시오. 체크포인트에 숨겨진 것은 아무것도 없습니다.

이 패키지는 하위의 모든 것 아래에 놓인 음운론 계층입니다. 이것이 만들어내는 후보 격자는 아랍어 TTS 프론트엔드 [arbtok](https://github.com/TigreGotico/arbtok), 포르투갈어 [TugaPhone](https://github.com/TigreGotico/tugaphone)과 [silabificador](https://github.com/TigreGotico/silabificador) 스택(**[포르투갈어 음절과 음소를 위한 고전 NLP](/ko/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** 참조), [바랑케뉴어 음소화기](/ko/blog/2025-12-12-barranquenho), 미란다어 음소화기, 그리고 **[감자에서도 돌아가는 TTS](/ko/blog/2026-05-10-tts-that-runs-on-a-potato)**의 음소 근거가 소비합니다.

## 하나가 아닌 두 개의 맵

핵심적인 구분은 이렇습니다. **자소 맵(grapheme map)**은 어떤 철자가 *표현할 수 있는* 음소가 무엇인지 알려줍니다. **이음 맵(allophone map)**은 음소가 문맥 속에서 어떻게 *실현되는지* 알려줍니다. 이 둘을 뒤섞는 것이 G2P 시스템에서 가장 흔한 실패 유형입니다.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

영어의 ⟨th⟩는 /θ/와 /ð/ 사이에서 진정으로 중의적입니다 — 이는 철자-음소 사실입니다. 영어의 /t/는 위치에 따라 평음 폐쇄음, 유기 폐쇄음, 성문 폐쇄음, 또는 탄설음으로 나타납니다 — 이는 음소-실현 사실입니다. 둘을 분리해 두면, 전사를 위해 *텍스트 → 음소 후보*로, 발음 모델링을 위해 *음소 → 실현형*으로 진행하면서 어느 한쪽이 다른 쪽을 오염시키지 않게 할 수 있습니다. TTS에서 이것은 설득력 있는 억양과 로봇 같은 억양의 차이이며, ASR에서는 사람들이 실제로 말하는 것과 일치하는 발음 사전과 사전(dictionary)과만 일치하는 발음 사전의 차이입니다.

## 모든 언어가 담고 있는 것

각 언어는 고정된 `LanguageSpec` 데이터클래스이며, 음소 목록보다 훨씬 많은 것을 담고 있습니다. 자소(중자음과 삼중자음 포함), 이음 맵, 문맥 민감 재정의를 위한 **위치별 자소**(어두, 모음 사이, /i/ 앞), 가중치가 부여된 다중 조상 **계보**, 단어 간 **연성 규칙(sandhi rules)**, 선택적 **성조 목록**, 그리고 출처 정보 — `stub → skeleton → research → production`으로 이어지는 `QualityTier`, `ScriptType`(알파벳, 압자드, 아부기다 등), 그리고 페이지가 고정된 서지 출처가 그것입니다.

포함 규칙은 엄격하며 분명하게 밝힐 가치가 있습니다. **공식 정서법과 문서화된 문법에 근거한 매핑만이 포함됩니다. 임의의 부분 문자열 규칙은 제외됩니다.** 포르투갈어 ⟨lh⟩, 독일어 ⟨sch⟩, 영어 ⟨th⟩는 표준 정서법 단위이기 때문에 포함됩니다. 편리하지만 임의로 만들어낸 휴리스틱은 포함되지 않습니다. 사양이 자소를 선언하지만 명시적인 이음 맵이 없을 때는 기준 항등 맵이 도출됩니다 — 모든 음소는 최소한 자기 자신의 실현형이 됩니다 — 따라서 아무것도 조용히 사라지지 않습니다.

지역 변이는 부모에 플래그를 다는 대신 각자의 사양을 갖습니다. 브라질 포르투갈어와 유럽 포르투갈어는 체계적으로 갈라지므로, 계보로 연결된 별개의 `LanguageSpec` 객체입니다.

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

JSON 파일이 `graphemes_base` / `allophones_base` 상속을 지원하기 때문에 방언 트리는 유지 관리가 가능한 상태를 유지합니다. 변이형은 부모와 다른 부분만 선언합니다. 계보는 가중치가 부여된 다중 조상 방식입니다 — 부모, 기층(substrate), 상층(superstrate), 방층(adstrate) — 이것이 깔끔한 후손이 아니라 접촉의 산물인 언어를 모델링하는 정직한 방법입니다.

## 넓기만 한 것이 아니라 깊게

676이라는 숫자는 너비입니다. 작업의 무게는 깊이에 있습니다. 사양은 방언학 문헌이 다루는 만큼 방언별로 파고들며, 각각은 음소 표에서 패턴 매칭한 것이 아니라 그 문헌에 페이지를 고정해 인용됩니다.

**이베리아** 지역 커버리지가 가장 명확한 예입니다. 반도의 언어들을 위한 **100개 이상의 사양**이 있습니다. 스페인의 모든 로망스어 — 카스티야어, 카탈루냐어/발렌시아어, 갈리시아어(RAG 규범과 재통합주의 규범 모두), 아스투리아스어, 아라곤어와 그 계곡 변이들(안소타노어, 치스타빈어, 베나스케스어 등), 엑스트레마두라어 — 와 함께 바스크어, 이베리아-로망스 크레올, 그리고 대부분의 리소스가 통째로 건너뛰는 역사적 층위인 **안달루시 아랍어**와 **모사라베어**를 다룹니다. 아랍어 쪽은 **34개 방언 방언형**(나즈드어와 헤자즈어에서 레반트어, 마그레브어, 반도 변이들까지)을, 루소폰 쪽은 리오노레스어, 과드라밀레스어, 그리고 미란다어 하위 방언들까지 이르는 **46개 포르투갈어 및 포르투갈-언어 방언형**을 담고 있습니다.

우리가 아는 한, 이들 중 여럿은 해당 변이형에 대해 지금까지 발표된 **최초의 기계 판독 가능 음운론**입니다 — 리오노레스어, 과드라밀레스어, 베나스케스어, 앙골라르어, 안달루시 아랍어가 그중에 있습니다 — 그리고 하위 작업은 **바랑케뉴어**와 **미란다어**에 대한 **최초의 IPA 사전**을 제공합니다.

## 단일 추측이 아닌 후보 격자

철자는 깔끔한 분절 문제가 아니므로, 대표 아키텍처는 **후보 격자(candidate lattice)**입니다. `PhonetokTokenizer`는 **최대 일치(maximal-munch)** 자소 토큰화를 수행하여 — 가장 긴 일치 정서법 단위를 탐욕적으로 선호합니다 — 사양의 자소 표를 바탕으로, 하나의 취약한 출력 대신 위치별로 순위가 매겨진 IPA 후보들의 격자를 만들어냅니다.

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

이 격자는 하위 계열 전체가 그 위에 구축되는 계약입니다. 언어별 엔진은 공유 격자를 소비하고 정적 테이블이 표현할 수 없는 음운론만을 추가하여, 모든 소비자를 동일한 근거 있는 코어 위에 유지합니다.

- **[arbtok](https://github.com/TigreGotico/arbtok)**는 이 격자 위에 아랍어 TTS 음운론을 구축하며, 태양 문자 동화, 하므자트 알와슬 탈락, 중복자음화, 합자 처리를 추가합니다 — 그리고 자유 생성기를 신뢰하는 대신 앙상블의 문자별 분포를 *요청된 방언형의 허용 규칙 아래에서* 채점하여 비분음 방언 텍스트의 사라진 단모음을 복원하는 새로운 **rawi-lattice fusion**을 추가합니다.
- **[TugaPhone](https://github.com/TigreGotico/tugaphone)**, **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)**(미란다어), **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)**는 모두 자신들의 루소폰 변이형을 위해 동일한 lattice-core를 소비합니다.

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

## 데이터가 좋은지 우리는 어떻게 아는가

신뢰할 수 있는 G2P "골드"는 거의 존재하지 않습니다 — 대부분의 공개 데이터셋은 어떤 음소화기 자신의 출력을 참조로 재활용한 것이라, 그에 대한 낮은 오류율은 "정확함"이 아니라 "그 도구에 동의함"을 의미합니다. 우리는 이 점에 대해 명확하며, 단 하나의 그럴듯한 숫자를 보고하는 대신 그것을 중심으로 검증 방법론을 구축했습니다.

우리가 가장 중시하는 변이형들에 대해, 골드는 **긁어온 것이 아니라 저작된 것**입니다. 방언형별 엔진 고정 문장 집합을, **맹검 쌍(blind pairs)**으로 심사하고, **페이지 고정 문헌**에 대조해 중재하며, **교정 클래스(correction classes)**를 거쳐 엔진 피드백 루프로 되먹입니다 — 엔진의 출력과 교정된 형태 사이의 불일치는 실제 사양 버그로 이어지는 단서입니다. 엔진 고정 TTS 골드와 1차 출처 실증 자료 전반에 걸쳐 **수천 개의 검증된 행**이 있습니다. 이 틀은 출처에 관해 의도적으로 정직합니다. 그것이 존재하는 전부일 때는 합성이자 문헌 중재이고, 존재할 때는 진정한 인간 골드입니다 — 원어민 미란다어 `mirandese_g2p` 집합, 페이지 고정 1차 출처 실증 자료, 그리고 원어민 기여가 그것입니다. 정확도 주장은 **오직** 인간 골드에 대해서만 이루어집니다. 엔진 자신의 초안에 대한 완벽한 점수는 아무 의미도 없을 것입니다.

이 숫자들은 방향성 있는 것으로 읽어야 하며 항상 출처에 인용됩니다([`docs/scoreboard.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/scoreboard.md), [`docs/benchmarks.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/benchmarks.md), 그리고 하위 저장소들의 벤치마크 문서).

- **아랍어 방언, 순수 비분음 입력** — 어렵고 배포 현실적인 경우입니다. arbtok의 순수 입력 TTS 골드(33개 방언형)에서 방언 허용 규칙 아래의 rawi-lattice fusion은 **평균 PER 0.189**에 도달하여, 동일 앙상블을 자유 생성기로 실행한 것(0.193)을 능가하며, 그 격차는 MSA에서 가장 크게 벗어나는 방언형들에 집중됩니다. 대부분의 방언형에서 arbtok은 순수 입력에 대해 espeak-ng를 능가합니다. MSA 자체에서는 MSA에 맞춰진 espeak가 여전히 이깁니다(espeak 0.176 대 arbtok 0.245).
- **아랍어 방언, 분음 입력** — 분음 부호가 있을 때 arbtok의 PER은 방언형당 **0.01–0.08**에 놓이며, espeak의 단일 MSA 음성보다 훨씬 낮습니다(예: 나즈드어 0.009 대 espeak 0.221; 이집트어 0.027 대 espeak 0.287). espeak에는 방언 음성이 없으므로 이것은 솔직히 사과와 오렌지를 비교하는 격입니다 — 그러나 그 격차가 요점입니다.
- **포르투갈어, 전문가-인간 골드 대비** — 리스본 유럽 포르투갈어는 페이지 고정 1차 출처에서 **PER 0.029**(88% 정확 일치)에 도달하고, 원어민 미란다어 골드는 **0.146**에 도달합니다.

이들 각각은 리더보드 트로피가 아니라, 부트스트랩 신뢰 구간에 상호 참조된 데이터의 현재 상태 속성입니다. 구간이 넓거나 표본이 극히 작은 경우, 스코어보드는 그렇게 명시합니다.

## CLI

위의 모든 것은 Python을 작성하지 않고도 접근할 수 있습니다. `orthography2ipa` 콘솔 스크립트는 `list`, `info`, `transcribe`, `distance`를 제공하며, 모든 하위 명령은 파이프라인으로 연결하기 위한 `--json`을 지원합니다.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## 순수 데이터가 중요한 이유

전체 사양 집합은 스키마 검증을 거칩니다 — 무결성 테스트 스위트로 점검되는 고정된 pydantic 스타일 데이터클래스, 그 형태를 문서화하는 `SCHEMA.md`가 있습니다. 정적 테이블이 규칙을 진정으로 표현할 수 없는 곳에서는 언어별 로직이 데이터 주변에 플러그인됩니다. 음절 분석기는 엔트리 포인트 그룹을 통해 등록되고, 더 무거운 엔진들은 하위에서 공유 격자 위에 구축됩니다.

사용자의 언어가 어떻게 들리는지 결정하는 불투명한 모델은 없습니다. 매핑은 감사 가능하고, 출처는 페이지 단위로 인용되며, 언어를 추가하는 것은 검증된 JSON 파일 하나를 작성하는 일입니다 — [`docs/adding_a_language.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/adding_a_language.md)와 [시작 안내서](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/getting_started.md)에서 출발하십시오. 자신의 음운론을 블랙박스에 아웃소싱하기를 거부하고 — 그리고 자신의 하드웨어에서 그것을 실행하고자 하는 — TTS, ASR, 음성 NLP를 구축하는 모든 사람에게, 그것이 바로 요점입니다. Apache 2.0 라이선스이며, 검토하고 확장하고 자체 호스팅할 수 있는 여러분의 것입니다.
