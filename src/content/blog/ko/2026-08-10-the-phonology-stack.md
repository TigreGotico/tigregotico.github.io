---
title: "음운론 스택이 어떻게 맞물리는가"
description: "우리의 텍스트-발음 스택 아키텍처 안내: 표기법을 위한 scriptconv, 언어 간 자소-IPA 엔진인 orthography2ipa, 포르투갈어·바스크어·미란다어·바랑케뉴어·아랍어를 위해 그 위에 구축된 언어별 프론트엔드, 그리고 소리 기반 검색을 위한 phonematcher. 각 계층이 왜 존재하는지, 후보 격자란 무엇인지, 그리고 실제 방언 출력을 보여줍니다."
date: 2026-08-01
lang: ko
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "Linguistics"
  - "FOSS"
draft: false
---

영어 단어 "read"를 예로 들어봅시다. 글로 쓰면 어떻게 발음하는지 알려주지 않습니다. "I read the book yesterday"와 "I read the book every day"는 같은 다섯 글자를 서로 다른 두 소리에 사용합니다 — 하나는 "red"와 운이 맞고, 다른 하나는 "reed"와 운이 맞습니다. 철자만 보는 화면 낭독기, 음성 비서, 검색창은 이를 제대로 처리할 수 없습니다. 텍스트만이 아니라 발음에 대해 추론해야 합니다.

그 추론 문제 — 글로 쓰인 단어를 그것이 나타내는 소리로 바꾸는 것 — 이 바로 우리의 음운론 스택이 해결하는 문제입니다. 이 글은 원시 표기법에서부터 언어별 발음 엔진과 소리 기반 검색에 이르기까지, 그 조각들이 어떻게 맞물리는지에 대한 지도입니다.

## 몇 가지 용어를 명확히 정의하기

전체에 걸쳐 등장하는 몇 가지 단어입니다:

- **자소(Grapheme)**: 문자 하나, 또는 "ch"처럼 문자들의 조합 같은 쓰인 기호.
- **음소(Phoneme)**: 한 언어에서 구별되는 소리 단위, 예를 들어 "cat"의 "k" 소리.
- **IPA**(국제음성기호): 어떤 언어의 철자와도 독립적으로 소리를 정확하게 적기 위한 표준 알파벳. "Cat"은 IPA로 `kæt`로 적습니다.
- **G2P**(자소-음소 변환): 철자를 소리로 바꾸는 일반적인 문제.
- **이음(Allophone)**: 문맥에 따라 달라지는 동일 음소의 변이형 실현 — "top"의 "t"와 "stop"의 "t"는 영어에서 같은 음소이지만 약간 다르게 발음됩니다.
- **음절 분석(Syllabification)**: 단어를 음절로 나누는 것, 예를 들어 "extraordinário"를 `ex-tra-or-di-ná-ri-o`로.
- **동철이의어(Homograph)**: 철자는 같지만 뜻이 다른 두 단어. **이철동음이의어**(또는 heterophone)는 어떤 뜻이냐에 따라 다르게 발음되는 동철이의어입니다. 위의 "read"/"read"처럼.
- **형태론(Morphology)**: 접두사, 어근, 접미사, 활용 같은 단어의 내부 구조.
- **품사(POS) 태깅**: 문장의 각 단어를 명사, 동사, 형용사 등으로 표시하는 것.

## 핵심 문제

철자는 소리의 손실 있는 인코딩입니다. 이를 되돌리기 어렵게 만드는 세 가지가 있습니다:

1. **모호성.** 같은 글자가 의미, 문법, 혹은 단순한 불규칙성에 따라 다른 소리로 매핑될 수 있습니다(위의 "read"; 영어에는 이런 경우가 가득합니다).
2. **방언.** 같은 언어의 같은 단어라도 화자가 어디 출신이냐에 따라 다르게 발음됩니다. 유럽 포르투갈어와 브라질 포르투갈어는 철자는 공유하지만 모음은 그렇지 않습니다.
3. **커버리지.** 세계 대부분의 언어에는 전문적으로 정리된 발음 사전이 아예 없습니다. 조회 테이블만으로 작동하는 G2P 시스템은 몇 안 되는 언어에서만 작동하는 시스템입니다.

텍스트 음성 변환, 음성 인식 학습 데이터, 또는 음성학을 인식하는 검색을 진지하게 시도하려면 이 세 가지 모두를 다뤄야 합니다.

## 스택이 계층화된 이유

이 스택은 문제를 서로에 대해 알 필요가 없는 계층들로 나눕니다:

- **표기법** — 음성 알파벳과 문자 체계 사이의 변환. 이는 특정 언어의 음운론과는 아무 관계가 없습니다. 기호 번역일 뿐입니다.
- **음운론** — 특정 언어의 음운 체계 사양을 사용해 철자를 IPA로 매핑.
- **언어별 예외 처리** — 일반 엔진이 철자 규칙만으로는 추론할 수 없는 불규칙 단어, 방언의 특이점, 동철이의어, 형태론적 구조.

이들을 분리해 두는 것은 우연이 아니라 설계 결정이며, 직접적인 보상이 있습니다: 새 언어를 추가한다는 것은 새 프로그램이 아니라 **사양**(그 언어의 음운 체계를 기술하는 데이터)을 작성하는 것을 의미합니다. 사양을 소비하는 엔진, 격자 탐색, 토크나이저, 거리 지표 — 그 어느 것도 다시 쓰지 않습니다. 그 아래의 표기법 계층은 음운론 엔진이 한 번도 들어본 적 없는 언어를 포함해 모든 언어가 공유합니다.

### 표기법 계층: scriptconv

[scriptconv](https://github.com/TigreGotico/scriptconv)는 음성 표기법과 문자 체계 처리를 위한 의존성 없는 핵심입니다: ISO-15924 문자 체계 감지, ARPABET·X-SAMPA·Lexique·Kirshenbaum·Cotovía·RFE 표기법과 IPA 사이의 변환, 아랍어를 위한 Buckwalter 음역, 자모로의 한글 분해, 가나 처리. 이 중 어느 것도 단어가 어떤 언어에 속하는지 알아야 할 필요가 없습니다 — IPA의 음소 문자열은 출처 언어와 무관하게 동일한 방식으로 ARPABET으로 변환됩니다:

```python
>>> import scriptconv as s
>>> s.ipa_to_arpa("kæt")
'K AE T'
>>> s.ipa_to_xsampa("kæt")
'k{t'
```

이 계층 위의 모든 계층은 표기법 변환이 이미 해결되어 있다고 가정할 수 있습니다.

### 엔진: orthography2ipa

[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)는 언어 간 엔진입니다. 언어 사양 — 그 언어의 자소-음소 규칙에 대한 선언적 기술 — 과 텍스트 조각을 받아 IPA를 만들어냅니다. 이 글을 쓰는 시점에 **820개 언어**를 아우르는 사양을 제공합니다(설치된 패키지의 `available_codes()`는 그 길이의 목록을 반환합니다. 사양이 시간이 지남에 따라 추가되므로 정확한 수치는 계속 변한다고 보십시오).

```python
>>> import orthography2ipa as o
>>> len(o.available_codes())
820
```

엔진 자체에는 언어별 코드가 내장되어 있지 않습니다. 새 언어는 다른 모든 사양과 동일한 스키마에 맞춰 검증되는 새 사양 파일일 뿐입니다.

## 격자: 하나의 추측이 아니라 순위가 매겨진 후보들

위의 모호성 문제를 감안하면, 단어당 하나의 출력에 전념하는 것은 종종 틀립니다. orthography2ipa는 대신 **격자** — 순위가 매겨진 후보 발음의 집합 — 를 만들어내고, 엔진 자체에는 없는 문맥(의미, 품사, 사전 항목)을 사용해 상위 계층이 이를 좁히도록 합니다.

다시 "read"를 봅시다:

```python
>>> from orthography2ipa import G2P
>>> g = G2P("en")
>>> g.transcribe("read")
'ɹiːd'
>>> g.candidates("read")
[IPAPath('ɹiːd', score=0.0), IPAPath('ɹɛd', score=1.0)]
```

더 많은 문맥이 없으면 엔진은 최선의 추측(현재 시제, 더 낮은 비용)을 반환하지만, 대안(과거 시제)도 그 비용과 함께 격자에 남겨 둡니다. 문장이 과거 시제임을 아는 하류 구성 요소는 첫 번째 대신 두 번째 후보를 고를 수 있습니다. 이는 (아래의) bifonia가 포르투갈어 이철동음이의어에 대해 더 큰 규모로 사용하는 것과 같은 발상입니다: 범용 격자가 후보를 제공하고, 더 좁고 더 잘 아는 계층이 그중에서 선택합니다.

## 방언은 일급 시민입니다

같은 언어를 쓰는 두 화자가 같은 문장을 다르게 발음할 수 있으며, "포르투갈어"를 하나의 고정된 소리 체계로 취급하는 음운론 스택은 하나를 제외한 모든 방언을 틀리게 됩니다. orthography2ipa는 방언 처리를 직접 노출합니다 — 설치된 패키지의 `available_profiles()`는 `lisbon`, `porto`, `estremenho`, `galician` 등의 방언 및 lect 프로필을 나열합니다 — 그리고 그 위에 구축된 포르투갈어 프론트엔드인 [tugaphone](https://github.com/TigreGotico/tugaphone)은 같은 문장을 루소폰 변이형 전반에 걸쳐 음소화합니다. 다음은 지원되는 다섯 방언 모두를 거친 한 문장입니다:

| 방언 | 출력 |
|---|---|
| pt-PT (포르투갈) | `ˈbõ ˈdiɐ ˈkomu eˈʃta vɔˈse` |
| pt-BR (브라질) | `ˈbõ ˈdʒiɐ ˈkɔ̃mʊ eˈsta voˈse` |
| pt-AO (앙골라) | `ˈbõ ˈdiɐ ˈkomʊ eˈsta vɔˈse` |
| pt-MZ (모잠비크) | `ˈbõ ˈdiɐ ˈkomu eˈsta vɔˈse` |
| pt-TL (동티모르) | `ˈbõ ˈdiə ˈkoɔmʊ eˈsta vɔˈse` |

("Bom dia, como está você?" — "안녕하세요, 어떻게 지내세요?") 자음 골격은 다섯 방언 모두에서 알아볼 수 있게 남아 있지만, 두 가지 잘 알려진 표지가 즉시 이들을 구별해 줍니다. "dia"에서 브라질 포르투갈어는 `i` 앞의 `d`를 영어 "jam"의 첫소리인 `dʒ`로 바꾸는 반면, 다른 방언들은 그냥 `d`를 유지합니다. "está"에서 유럽 포르투갈어는 음절 끝의 `s`를 "shoe"의 "sh" 소리인 `ʃ`로 발음하는 반면, 다른 모든 변이형은 `s`를 유지합니다. 한 방언의 규칙으로 만든 발음 사전은 다른 모든 방언의 청자에게 이 두 가지를 모두 틀리게 됩니다.

[euskaphone](https://github.com/TigreGotico/euskaphone)은 별도의 엔진이 아니라 orthography2ipa 격자 위에 직접 구축되어, 바스크어 방언에 대해 같은 일을 합니다:

```python
>>> from euskaphone import EuskaPhonemizer
>>> EuskaPhonemizer().phonemize_sentence("Kaixo, zer moduz zaude?")
'kai̯ʃo s̻er modus̻ s̻au̯de'
```

## 언어별 프론트엔드

공유 엔진 위에는 일반 사양이 다룰 수 없는 것 — 불규칙 단어, 정선된 사전, 연성(단어 경계에서의 소리 변화), 방언별 재정의 — 을 더하는 프론트엔드가 있습니다.

- **[tugaphone](https://github.com/TigreGotico/tugaphone)** — 포르투갈어, pt-PT·pt-BR·pt-AO·pt-MZ·pt-TL 전반에 걸쳐, 정선된 사전과 규칙 기반 대체를 결합합니다(위에서 확인).
- **[euskaphone](https://github.com/TigreGotico/euskaphone)** — 바스크어, 방언을 인식하며, 같은 격자 위에 구축됩니다(위에서 확인).
- **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** — 포르투갈 미란다 지방의 아스투르레온어인 미란다어, 단어 경계 연성, 이음, 강세를 포함합니다:

  ```python
  >>> from mwl_phonemizer import phonemize
  >>> phonemize("Falo la lhéngua mirandesa.")
  'ˈfalu lɐ ˈʎɛŋɡwa miɾɐˈndez̺ɐ.'
  ```

- **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** — 포르투갈-스페인 국경의 바랑코스 지역의 이베로-로망스 접촉 언어인 바랑케뉴어를 위한 최초의 오픈 G2P입니다. 그 규칙이 지자체 자체의 정서법 규약에서 어떻게 도출되었는지는 **[바랑케뉴어를 위한 최초의 음소화기 소개](/ko/blog/2025-12-12-barranquenho)**를 참고하세요.
- **[arbtok](https://github.com/TigreGotico/arbtok)** — 아랍어, orthography2ipa의 격자 위에 구축되어 방언을 인식하는 분음 부호 복원을 더하고, 현대 표준 아랍어, 고전 아랍어, 여러 지역 변이형을 다룹니다. 아랍어 문자는 대개 음소화기가 필요로 하는 단모음 표시를 생략하므로, arbtok의 주된 역할은 공유 엔진에 결과를 넘기기 전에 이를 복원하는 것입니다. 이는 아랍어를 모국어로 하지 않는 사람이 유지 관리하므로, 완성되어 원어민 검토를 마친 참조물이 아니라 활발히 개발 중인 것으로 취급하십시오 — 유용하지만, 사용자에게 노출되는 어떤 것에 배포하기 전에 원어민에 대해 출력을 다시 확인해야 할 지점입니다.

이 프론트엔드들 하나하나는 그 아래의 동일한 공유 격자 엔진과 동일한 공유 표기법 계층 위에 놓인 언어별 로직의 얇은 층입니다. 어느 것도 IPA 변환이나 격자 탐색을 다시 구현하지 않습니다.

## 포르투갈어를 지원하는 도구들

포르투갈어는 가장 깊은 스택을 갖고 있습니다. 포르투갈어 발음은 철자 규칙 이상의 것 — 음절 구조, 품사, 때로는 단순한 의미 — 에 의존하기 때문입니다.

- **[silabificador](https://github.com/TigreGotico/silabificador)**는 손으로 만든 규칙을 사용해 단어를 음절로 나눕니다:

  ```python
  >>> from silabificador import syllabify
  >>> syllabify("extraordinário")
  ['ex', 'tra', 'or', 'di', 'ná', 'ri', 'o']
  ```

- **[tugalex](https://github.com/TigreGotico/tugalex)**는 tugaphone 뒤에 있는 사전입니다: 실제 단어에 대한 IPA 전사, 음절 데이터, 정서법 규칙으로, 흔한 어휘와 불규칙 어휘를 매번 철자에서 다시 도출하지 않아도 되게 합니다.
- **[tugatagger](https://github.com/TigreGotico/tugatagger)**는 여러 품사 태깅 백엔드(spaCy, Stanza, Brill 스타일 태거, 의존성 없는 휴리스틱 대체)를 하나의 인터페이스 뒤에 감싸서, 다른 도구들이 특정 백엔드에 얽매이지 않고 "이 단어의 품사가 무엇인가"를 물을 수 있게 합니다.
- **[tugamorph](https://github.com/TigreGotico/tugamorph)**는 규칙 기반 형태 분석기입니다: Python 표준 라이브러리만 사용해 단어를 접두사, 어근, 접미사, 활용, 접어로 분절하며, 선택적으로 silabificador와 tugatagger로 정밀도를 높입니다.
- **[bifonia](https://github.com/TigreGotico/bifonia)**는 유럽 포르투갈어의 이철동음이의어 — "sede"(갈증, `ˈsedɨ` 대 본부, `ˈsɛdɨ`)처럼 올바른 발음이 문법이 아니라 의미에 좌우되는 단어들 — 를 해소합니다. 그것이 어떻게 만들어지고 평가되었는지는 **[제대로 말하기: TTS를 위한 포르투갈어 이철동음이의어 해소](/ko/blog/2026-06-12-disambiguating-portuguese-heterographs-for-tts)**를 참고하세요. 이는 위의 격자 발상 뒤에 있는 구체적인 사례입니다: orthography2ipa는 "sede"의 두 후보 발음을 모두 제공할 수 있지만, bifonia 같은 의미를 아는 계층만이 그중에서 선택할 수 있습니다.

silabificador와 tugaphone이 매일 어떻게 함께 작동하는지에 대해서는 **[포르투갈어를 위한 고전 NLP: 음절 분석과 자소-음소 변환](/ko/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**을, 그리고 이 모든 것 아래에 있는 더 넓은 엔진에 대해서는 **[820개 언어를 위한 자소-IPA 변환](/ko/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**을 참고하세요.

## 소리 기반 검색: phonematcher

위의 모든 것은 텍스트를 소리로 바꿉니다. [phonematcher](https://github.com/TigreGotico/phonematcher)는 소리 표현 그 자체를 다룹니다: IPA 기호 사이의 음성적 거리를 계산하고, 철자가 아니라 소리가 어떻게 들리는지에 기반해 단어 목록에 대한 퍼지 검색을 수행합니다.

```python
>>> from phonematcher.distance import phonetic_distance
>>> phonetic_distance('b', 'p')   # voiced vs. voiceless bilabial stop — very similar
0.043478260869565216
>>> phonetic_distance('p', 'k')   # bilabial vs. velar stop — less similar
0.34782608695652173
>>> phonetic_distance('a', 'k')   # vowel vs. consonant — maximally different
1.0
```

그 거리 지표는 두 가지 구체적인 상황에서 유용합니다: 정확한 철자가 아니라 소리로 단어나 이름의 카탈로그를 검색하는 것(오타에 관대한 음성 인터페이스와 문자 체계를 넘나드는 외래어 매칭에 유용합니다), 그리고 서로 관련된 두 lect가 음운론적으로 얼마나 가까운지 비교하는 것 — 위의 방언 표가 눈으로 하는 것과 같은 종류의 비교이지만, 눈대중이 아니라 계산된 것입니다. phonematcher는 PyPI에 없습니다. 소스에서 설치합니다(GitHub 체크아웃에 대해 `pip install -e .`, 그리고 `rapidfuzz`).

## 정직한 한계

820개 언어 사양에 걸친 커버리지는 구조상 고르지 않습니다: 확립된 음운론 문헌과 사전을 갖춘 언어는 대체로 일반적인 정서법 관례에서 추론한 얕은 사양만 있는 언어보다 더 나은 출력을 냅니다. 품질은 정선된 사전이 존재하는 곳에서 일관되게 가장 좋습니다 — tugalex의 뒷받침을 받는 포르투갈어가 이 스택에서 가장 강한 사례입니다. 사전 없이 순전히 사양 규칙에만 의존하는 언어는 불규칙 어휘와 외래어를 잘못 처리합니다.

몇몇 구성 요소는 명시적으로 완성되지 않은, 원어민 검토를 거치지 않은 참조물입니다: arbtok은 아랍어를 모국어로 하지 않는 사람이 유지 관리하므로 사용자에게 노출되는 어떤 것에 쓰기 전에 원어민의 판단에 대해 확인해야 합니다. 얕은 사양 위에 구축된 프론트엔드는 그 얕음을 그대로 물려받습니다 — 프론트엔드는 그 아래의 사양과 사전만큼만 좋습니다.

## 여러분의 언어에 음성 도구가 없다면 이것이 중요한 이유

세계 대부분의 언어에는 상업적 TTS 음성도, 상업적 STT 모델도, 전문적으로 유지 관리되는 발음 사전도 없습니다. 위의 계층화된 설계는 그 공백을 메우기 위해 음운론 엔진을 처음부터 만들 필요가 없다는 것을 의미합니다: 대상 언어의 소리 체계에 대한 사양과, 가능하다면 그 불규칙 단어들의 사전을 작성하기만 하면 됩니다. 격자 엔진, 표기법 변환, 검색 도구는 이미 거기에 있습니다. 여러분의 언어, 방언, 또는 제품에 아직 존재하지 않는 발음 지원이 필요하다면, 그것이 바로 저희가 맡는 종류의 작업입니다 — **[저희 서비스](/ko/services)**를 확인하시거나 **[문의해 주세요](/ko/contact)**.
