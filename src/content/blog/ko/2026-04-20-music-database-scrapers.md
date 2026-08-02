---
title: "우리의 음악 데이터베이스 스크래퍼를 소개합니다"
description: "우리가 유지 관리하는, 음악 소스를 위한 타입 지정 Python 클라이언트 제품군을 둘러봅니다 — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio, 그리고 위대한 음악 백과사전들 — 모두가 하나의 깔끔한 인터페이스 뒤에서 일관되고 타입이 지정된 미디어 메타데이터를 내보내며, 동일한 준법적이고 저용량인 HTTP 전송 위에서 동작합니다."
date: 2026-04-20
updated: 2026-08-01
lang: ko
author: "Casimiro Ferreira"
tags:
  - "Scrapers"
  - "Media Metadata"
  - "Music"
  - "Python"
  - "FOSS"
draft: false
---

## 음악 웹 전체를 위한 하나의 인터페이스

음악 웹은 여러 독립적인 사이트에 걸쳐 파편화되어 있습니다. Bandcamp는 FLAC와 크리에이티브 커먼즈 라이선스를 팔고, SoundCloud는 아무도 호스팅하지 않는 리믹스를 스트리밍하며, SomaFM은 청취자 후원으로 운영되는 라디오 채널 세트를 운영하고, 여러 커뮤니티 운영 사이트에서는 프로그레시브 록, 재즈, 클래식, 메탈의 큐레이션된 백과사전이 유지되고 있습니다. 각 사이트는 저마다의 마크업, 저마다의 특이함, 그리고 "트랙"이 도대체 무엇인지에 대한 저마다의 관념을 가지고 있습니다.

우리는 그 혼돈을 길들이는, 작고 집중적이며 오픈소스인 Python 클라이언트 제품군을 유지 관리합니다. 이들 모두는 본질적으로 같은 일을 합니다: 음악 소스에 손을 뻗어 **타입이 지정된 미디어 메타데이터 모델**을 돌려줍니다 — 취약한 딕셔너리가 아니라 검증된 객체를 — 그래서 나머지 코드는 데이터가 어느 사이트에서 왔는지 결코 신경 쓸 필요가 없습니다. 아홉 개 중 일곱 개는 PyPI에 공개되어 있고, 나머지 둘은 GitHub에서 직접 설치합니다. 모두 같은 어휘로 말합니다.

여기 그 안내가 있습니다.

## 스트리밍과 라디오

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)**는 Bandcamp를 스크래핑합니다: 트랙, 앨범, 아티스트, 레이블을 검색하고, 장르 태그로 탐색하며, 시드로부터 추천과 관련 아티스트를 가져오고, 스트리밍 가능한 MP3 URL을 추출합니다. 검색은 제목, 아트워크, 장르, 크레딧을 담은 타입 지정 `Release` 객체를 반환하며, 그리고 — FOSS를 지향하는 이들에게 결정적으로 — `is_open()` 확인이 딸린 SPDX 스타일 라이선스 필드를 담아 크리에이티브 커먼즈 릴리스와 모든 권리가 유보된 릴리스를 구분할 수 있게 합니다. 완전 충실도의 앨범 변환은 요청 시 정렬된 트랙리스트를 채웁니다.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)**는 우리의 SoundCloud 클라이언트이며, 이 제품군의 만능 도구입니다. 세 개의 독립적인 백엔드 — 메타데이터가 풍부한 API 백엔드, 의존성이 없는 HTML 스크래퍼, 그리고 yt-dlp 백엔드 — 가 하나의 오케스트레이터 뒤에 자리 잡아 하나에서 다음으로 우아하게 대체합니다. 트랙과 사람을 검색하고, 직접 스트림 URL(프로그레시브 또는 HLS)을 해석하며, 트랙과 전체 플레이리스트를 다운로드하고, 명령줄에서 검색하고 재생할 수 있는 터미널 앱 `nds`까지 제공합니다. 릴리스는 코덱, 비트레이트, 장르, 국가, SPDX 라이선스, 그리고 전체 세트 트랙리스트와 함께 돌아옵니다.

**[radiosoma](https://github.com/TigreGotico/radiosoma)**는 SomaFM 공개 채널 API를 감쌉니다. SomaFM은 스펙트럼에서 친화적이고 개방형 API를 갖춘 쪽이며, 클라이언트는 이를 깔끔하게 모델링합니다: 각 채널은 하나의 작품이고, **각 스트림 인코딩** — 130 kbps AAC, 256 kbps MP3, 64 및 32 kbps HE-AAC — 은 그 채널의 자체 `Release`가 되어, 소비자가 가장 적합한 것을 고르고 정체성으로 중복 제거를 할 수 있게 합니다. 최근 트랙 피드는 무엇이 재생되고 있었는지를 깔끔하게 정리한 스케줄로 나타납니다.

**[tunein](https://github.com/TigreGotico/tunein)**는 세계의 선형 라디오 및 IPTV 방송국을 위한 비공식 TuneIn 클라이언트입니다. 빠른 경로는 검색 페이로드만 반환하고, 옵트인 방식의 보강 호출은 장르, 언어, 국가, 콜사인, 슬로건을 채웁니다. TuneIn은 방송국당 여러 개의 스트림 URL — 서로 다른 비트레이트, 미러, 프로토콜 — 을 돌려주기 때문에, 각각이 자체 `Release`가 되어 다시금 소비자가 재생 시점에 선택할 수 있게 합니다. 작은 CLI가 테이블 또는 JSON 출력을 제공합니다.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)**는 iHeartRadio 공개 API와 통신합니다 — 키도, 계정도 없이. 방송국, 팟캐스트, 아티스트, 트랙, 플레이리스트를 검색하고, 직접 오디오 스트림 URL이 딸린 팟캐스트 에피소드를 가져오며, 방송국과 아티스트 조회가 동시에 실행되도록 병렬 상세 조회에 의존합니다. 모든 모델은 타입 지정 메타데이터 파이프라인에 곧바로 끼워 넣을 수 있도록 `to_external_ids()`와 `to_signals()` 헬퍼를 제공합니다.

## 음악 백과사전과 아카이브

이 제품군의 후반부는 위대한 커뮤니티 카탈로그를 겨냥합니다.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)** (Jazz Music Archives) — 둘 다 PyPI가 아니라 각자의 GitHub 저장소에서 직접 설치합니다 — 그리고 **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)** (Classical Archives)는 거의 동일한 형태를 공유합니다: A–Z 색인을 탐색하고, 이름으로 검색하며, 전기, 국가, 회원 평점 디스코그래피가 딸린 완전한 아티스트 또는 작곡가 페이지를 가져옵니다. Prog와 Jazz Archives는 HTML을 스크래핑하고, Classical Archives는 공개 JSON API를 감싸며 작곡가의 앨범 *과* 재귀적으로 평탄화된 작품 트리를 노출합니다. 각 모델은 `to_external_ids_dict()`를 통해 사이트의 안정적인 정규 id를 담고 있는데, 이는 한 카탈로그를 다른 카탈로그와 상호 참조하는 데 필요한 바로 그것입니다.

**[pymetal](https://github.com/TigreGotico/pymetal)**은 Encyclopaedia Metallum, 곧 Metal Archives를 위한 우리의 클라이언트이며 — 이 세트 중 가장 야심 찬 것입니다. 대부분의 스크래퍼는 트랙을 `(id, title, band, album)`으로 평탄화합니다. pymetal은 Metal Archives가 분리해 두는 것을 잃기를 거부합니다: 한 트랙이 **여러 밴드**(스플릿, 협업)를 크레딧할 수 있고, 밴드의 **라인업은 시간에 걸쳐 나뉘며**, 한 트랙이 **여러 릴리스**(컴필레이션, 재발매, 싱글)에 등장할 수 있습니다. 각각을 아카이브 id로 키가 지정된 일급 엔티티로 모델링하여, 재스크래핑이 멱등적이도록 합니다. 엔드포인트 표면은 넓습니다 — 고급 밴드/앨범/곡 검색, 스플릿에서 밴드별 귀속이 딸린 완전한 릴리스 페이지, 역할-날짜 범위와 함께 상태별로 분할된 라인업, 리뷰, 추천, 외부 링크, 가사 — 이 모든 것이 JSON을 통해 왕복하는 Pydantic v2 모델로 되어 있습니다.

음악을 넘어, **[tutubo](https://github.com/TigreGotico/tutubo)**는 YouTube와 YouTube Music을 스크래핑하고, **[pymal](https://github.com/TigreGotico/pymal)**은 MyAnimeList를 다룹니다 — 동일한 타입 지정 메타데이터 패턴을 더 넓은 미디어 범주로 확장합니다. 모두가 같은 어휘를 내보내므로 단일 다운스트림 소비자가 모든 것을 균일하게 처리합니다.

## 준법적이고 저용량인 접근을 위해 만들어짐

이 클라이언트들은 공개 카탈로그 페이지만을, 낮은 요청량으로 가져오며, 스크래핑에 앞서 각 사이트의 `robots.txt`를 확인합니다 — 그 정찰 단계가 어떻게 동작하는지는 **[robots.txt 및 sitemap 글](/ko/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**을 참고하세요. 이 제품군 전반에서 HTTP 계층은 **플러그형**입니다: 기본적으로 클라이언트는 실제 브라우저와 TLS 핸드셰이크가 일치하는 전송(Chrome의 TLS/JA3와 일치하는 `curl_cffi`)을 사용하여, 스크립트 남용을 겨냥해 조정된 탐지 시스템이 잘 동작하는 클라이언트를 악성 자동화로 오분류하지 않도록 합니다. Cloudflare로 가려진 백과사전들은 추가로 실시간 데이터를 위해 FlareSolverr 인스턴스를 경유하거나, 대체 수단으로 Internet Archive의 Wayback Machine에서 읽을 수 있습니다. 파싱 계층은 HTML이 어떻게 도착하는지와 의도적으로 독립적이므로, 어떤 전송을 선택하든 동일한 코드가 동작합니다.

## 다중 소스 음악 카탈로그

진정한 보상은 이것들을 아홉 개의 별개 도구로 생각하기를 멈출 때 나옵니다. 모두가 같은 타입 지정 메타데이터 어휘를 내보내고 모두가 정규 외부 id를 노출하기 때문에, 단일 아티스트를 Bandcamp, SoundCloud, 라디오 디렉터리, 백과사전에 걸쳐 펼친 다음, 그 결과를 하나의 일관된 카탈로그로 접을 수 있습니다 — 정체성으로 중복 제거되고, 라이선스를 인식하며, 추천 엔진이나 미디어 서버, 또는 연구 데이터셋에 공급할 준비가 된 채로.

이 클라이언트들 하나하나는 자유 소프트웨어이며, 자체 호스팅 가능하고, API 키 없이 자신의 하드웨어에서 실행됩니다. 관심 있는 소스를 고르세요: PyPI에 있다면 `pip install` 하고, GitHub 전용인 pyprogarchives와 pyjazzmusicarchives라면 `pip install git+https://github.com/TigreGotico/<repo>` — 그리고 만들기를 시작하세요.

모든 스크래퍼는 우리의 **[조합 가능하고 즉시 교체 가능한 requests 세션](/ko/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** 위에서 동작합니다. 스트리밍 및 라디오 클라이언트는 **[mediavocab](https://github.com/TigreGotico/mediavocab)** 스키마를 직접 내보내고, 모든 클라이언트가 정규 외부 id를 노출하므로, 음악 메타데이터는 우리의 다중 소스 인덱서이자 중복 제거 메타데이터 서버인 **[media-archivist](https://github.com/TigreGotico/media-archivist)**와 통합됩니다.
