---
title: "포르투갈어를 위한 고전 NLP: 음절 분석과 자소-음소 변환"
description: "규칙 기반이며 완전히 오프라인으로 동작하는 우리의 포르투갈어 NLP 스택을 살펴봅니다. 음절 분석을 위한 silabificador와 방언을 인식하는 자소-음소 변환을 위한 TugaPhone, 그리고 이들이 루소폰 변이형을 위한 더 넓은 orthography2ipa 작업과 어떻게 연결되는지를 다룹니다. 딥러닝 블랙박스 없이 결정론적이고 빠르며 의존성이 가볍습니다."
date: 2026-02-28
lang: ko
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

모든 언어 문제에 수십억 개의 매개변수가 필요한 것은 아닙니다. 포르투갈어 텍스트 처리의 상당 부분은 누군가 신경망을 학습시키기 훨씬 전에 언어학자들이 기록해 둔 규칙들에 의해 지배됩니다 — 음절이 나뉘는 지점, 강세가 놓이는 위치, 주어진 철자가 소리에 매핑되는 방식에 관한 규칙들입니다. 이러한 규칙이 명시적일 때, 올바른 도구는 읽고 감사하고 어디서나 실행할 수 있는 작고 결정론적이며 완전히 오프라인인 라이브러리입니다. 그것이 우리 고전 포르투갈어 NLP 스택의 철학입니다: 음절 분석을 위한 [silabificador](https://github.com/TigreGotico/silabificador)와 자소-음소(G2P) 변환을 위한 [TugaPhone](https://github.com/TigreGotico/tugaphone).

### 왜 고전적인 방식이며, 왜 지금인가

음성학은 결정론적 규칙이 진정으로 빛을 발하는 영역 중 하나입니다. 포르투갈어 음절 분석의 경계 규칙과 그 정서법의 규칙성은 잘 문서화되어 있어서, 손으로 만든 규칙 엔진이 한 줄씩 검토할 수 있는 전사를 생성합니다. GPU도, 모델 다운로드도, 네트워크 호출도 없습니다. 이것은 데이터 주권에 중요합니다. 루소폰 음성 파이프라인이 단어 발음을 알아내기 위해 텍스트를 원격 API로 보내야 해서는 안 됩니다. 또한 속도와 용량에도 중요합니다 — 이 라이브러리들은 의존성이 가벼워 노트북, 서버, 임베디드 장치에서 똑같이 손쉽게 실행됩니다.

### silabificador: 음절 경계

`silabificador`는 손으로 만든 규칙만으로 완전히 구축된 가벼운 포르투갈어 음절 분석기로, **의존성이 없습니다**. 인터페이스는 이름만큼이나 작습니다.

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

이는 [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org)의 깨끗한 데이터로 조정 및 테스트되었으며, 동일한 출처에서 추출한 10만 개 이상의 항목으로 이루어진 오픈 데이터셋인 [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon)으로 벤치마크되었습니다. 음절 분절은 강세 할당, 하이픈 처리, 음소 전사의 기초 단계이므로, 이를 정확하고 빠르게 처리하면 하위의 모든 곳에서 이득이 됩니다.

### TugaPhone: 방언을 인식하는 자소-음소 변환

`TugaPhone`은 임의의 포르투갈어 텍스트를 IPA로 변환하며, 주요 루소폰 방언에 걸쳐 그렇게 합니다: 유럽(`pt-PT`), 브라질(`pt-BR`), 앙골라(`pt-AO`), 모잠비크(`pt-MZ`), 동티모르(`pt-TL`). 결정적으로, 모든 것을 하나의 "표준"으로 평탄화하지 않고 방언적 변이를 보존합니다. 같은 문장이라도 어디서 말하느냐에 따라 다르게 나옵니다.

```
Choveu muito ontem à noite.
pt-PT → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈoj·tɨ
pt-BR → ʃo·ˈvew mwˈĩ·tʊ ˈõ·tẽ ˈa nˈoj·tʃɪ
pt-AO → ʃo·ˈvew mˈũjn·tʊ ˈõ·tẽ ˈa nˈoj·tɨ
pt-MZ → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈɔj·tɨ
pt-TL → ʃo·ˈvew mˈuj·tʊ ˈõ·tẽ ˈa nˈojtʰ
```

내부적으로 TugaPhone은 두 가지 고전 기법의 **하이브리드**입니다. 먼저 알려진 단어에 대해서는 선별된 발음 사전(위의 동일한 Portuguese Phonetic Lexicon)을 조회하고, 사전에 없는 것 — 이름, 신조어, 외래어 차용 — 에 대해서는 규칙 기반 G2P 엔진으로 대체합니다. 파이프라인은 모든 단계에서 명시적입니다: 텍스트 정규화, 선택적 품사 태깅, 사전 조회, 규칙 기반 대체, 그다음 방언별 변환.

두 가지 세부 사항을 짚어볼 가치가 있습니다. **숫자 정규화**는 숫자를 올바른 성과 수 일치를 갖춘 포르투갈어 구어 형태로 변환합니다.

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
normalize_numbers("1ª vez")                # primeira vez
```

심지어 자릿수 규약도 존중합니다 — `pt-PT`에는 긴 자릿수 체계의 `biliões`, `pt-BR`에는 짧은 자릿수 체계의 `trilhões`. **동철이의어 중의성 해소**는 품사 문맥을 사용하므로, 전치사로서의 `para`는 동사로서의 `para`와 다르게 처리됩니다. TugaPhone은 사용 가능할 때 spaCy나 Brill 태거를 사용할 수 있지만, 의존성 없는 규칙 기반 대체 수단도 함께 제공하여 오프라인 우선 원칙에 충실합니다.

아키텍처는 깔끔한 계층 구조입니다 — 문장 → 단어 → 자소 → 문자 — 각 수준에서 문맥 민감 규칙이 적용됩니다: 문자 수준의 모음 음질과 자음 이음, 자소 수준의 ⟨ch⟩·⟨nh⟩ 같은 중자음과 ⟨ai⟩·⟨ou⟩ 같은 이중모음, 단어 수준의 강세와 음절 분석. TugaPhone은 음절 계층에 `silabificador`를 재사용하며, 동반 라이브러리인 **[Tugalex](https://github.com/TigreGotico/tugalex)**(사전과 예외)와 **[TugaTagger](https://github.com/TigreGotico/tugatagger)**(품사 태깅)와 함께 사용됩니다. 작고 조합 가능한 조각들이며, 각각 그 자체로 유용합니다.

TugaPhone은 자신의 한계에 대해 정직합니다. 아프리카와 동티모르 방언에 대해서는 사전 커버리지가 더 희박하고, 하위 지역 억양(포르투, 미뉴, 브라가 등)은 문서화된 특징의 실험적 근사이며, 문장 수준 운율은 단순화되어 있습니다. 이는 숨겨진 실패 유형이 아니라 공개적으로 문서화된 한계입니다 — 규칙 기반 시스템이 가능하게 하는 바로 그런 종류의 투명성입니다.

### 더 넓은 그림: orthography2ipa

포르투갈어는 여러 변이형 중 하나이며, 동일한 엔지니어링 패턴이 일반화됩니다. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa)는 20개 이상의 어족에 걸친 350개 이상의 언어 코드를 아우르는, 언어학적으로 동기 부여된 자소→IPA 및 이음 매핑의 순수 데이터 기반 Python 패키지입니다. 이것은 진지한 G2P 시스템이라면 어느 것이든 필요로 하는 뚜렷한 구분을 그립니다: **자소 맵**은 어떤 철자가 *표현할 수 있는* 음소를 말하는 반면, **이음 맵**은 음소가 주어진 문맥에서 실제로 어떻게 *실현되는지*를 말합니다. 지역 변이형은 가중치가 부여된 다중 조상 계보로 연결된 각자의 사양으로 모델링되므로, 방언 트리는 데이터를 복제하는 대신 부모로부터 상속받습니다.

그것이 TugaPhone의 `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ`, `pt-TL` 뒤에 있는 동일한 직관입니다: 각 루소폰 변이형을 하나의 정전(正典) 억양에서의 일탈이 아니라 자신의 규칙을 가진 일급 시민으로 취급하는 것. 데이터는 선언적이고 로직은 얇고 플러그 가능합니다 — 규칙을 읽고, 그 출처를 인용하고, 출력을 신뢰할 수 있습니다.

### 사용해 보기

여기의 모든 것은 오픈 소스이며 오늘 바로 설치할 수 있습니다.

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

더 넓은 다국어 매핑에 대해서는 [orthography2ipa](https://github.com/TigreGotico/orthography2ipa)를 참조하십시오. 결정론적이고 빠르며 오프라인이고, 포르투갈어권 세계 전체의 폭을 위해 구축되었습니다.

이 포르투갈어 음성학 스택은 우리의 **[350개 이상 언어를 위한 자소-IPA 작업](/ko/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** 위에 세워졌으며, **[감자에서도 돌아가는 TTS](/ko/blog/2026-05-10-tts-that-runs-on-a-potato)**와 **[Miro & Dii 다국어 음성](/ko/blog/2026-06-15-two-voices-every-language-miro-and-dii)**의 음성적 근간을 이룹니다.
