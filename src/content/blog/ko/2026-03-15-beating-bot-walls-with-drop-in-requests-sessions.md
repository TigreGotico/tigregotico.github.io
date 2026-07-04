---
title: "조합 가능하고 즉시 교체 가능한 requests 세션으로 봇 차단 벽 넘기"
description: "핫 패스에서 헤드리스 브라우저를 띄우지 않고도 공개 데이터에 대한 회복력 있는 접근을 유지하는 방법: TLS 지문 위장, JS 챌린지를 위한 FlareSolverr 프록시, Wayback Machine 대체 수단, 그리고 IP 로테이션 — 이 모든 것이 조합 가능한 두 개의 requests.Session 서브클래스, unblock_requests와 anon_requests 뒤에 자리합니다."
date: 2026-03-15
lang: ko
author: "Casimiro Ferreira"
tags:
  - "HTTP"
  - "Scraping"
  - "Cloudflare"
  - "Anti-Bot"
  - "Python"
  - "Open Source"
draft: false
---

저희 작업의 상당 부분(미디어 메타데이터 클라이언트, 카탈로그 보강, 아카이빙)은 **공개** 웹 페이지를 안정적으로 읽는 데 의존합니다. 문제는 데이터인 경우가 드뭅니다. 그 앞을 가로막는 벽이 문제입니다. 그리고 그 벽은 서로 다른 두 가지 질문을 던집니다.

- **"너는 무엇이냐?"** — Cloudflare와 같은 부류는 여러분이 *무엇을* 요청하는지가 아니라 여러분이 통신선상에서 *어떻게 보이는지*를 근거로 요청을 차단합니다. 즉 TLS 핸드셰이크, JA3 지문, JavaScript 챌린지를 실행할 수 있는지가 기준입니다.
- **"너는 누구냐?"** — IP 평판과 속도 제한은 지문은 완전히 무시합니다. 하나의 주소에서 얼마나 많은 요청이 오는지를 셉니다.

이 두 질문은 서로 직교하므로, 저희는 깔끔하게 쌓이는 두 개의 작은 라이브러리로 답합니다. **unblock_requests**는 *너는 무엇이냐*에 답하고, **anon_requests**는 *너는 누구냐*에 답합니다. 둘 다 일상 코드에서 `requests` 세션을 즉시 대체할 수 있습니다. 이 글은 특별히 그 전송 계층, 즉 통신선상의 바이트 부분에 관한 것이며, 그 위에 놓이는 파싱이나 파이프라인에 관한 것이 아닙니다.

## 설계 제약: `requests`의 형태를 유지하기

`unblock_requests` 세션은 `requests.Session`을 서브클래싱하고 `request()`만 오버라이드합니다. 나머지 모든 것(`.get()`, `.post()`, 쿠키, 헤더, context manager 의미론)은 상속되므로, `requests.Session`을 대상으로 타이핑된 어떤 코드든 이를 변경 없이 받아들입니다. `anon_requests` 세션은 서브클래싱 대신 감싸는 방식을 취합니다. 동일한 동사 메서드와 context manager 인터페이스를 노출하되, 로테이션할 때마다 내부 세션을 재구성합니다.

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

전체 윤리적·공학적 태도가 이 한 줄에 담겨 있습니다. 저희는 브라우저를 사용자처럼 자동화하는 것이 아니라, 이미 공개된 데이터를 위한 *회복력 있는 HTTP 클라이언트*를 만드는 것입니다. 누구의 화면에도 화면 있는 브라우저가 튀어나오지 않으며, 핫 패스의 어떤 것도 디스플레이를 필요로 하지 않습니다.

## 첫 번째 계층: `unblock_requests`와 그 전송 방식

`unblock_requests`는 **봇 탐지**에 대응합니다. `mode=` 키워드 인자(또는 `UNBLOCK_REQUESTS_TRANSPORT` 환경 변수 — 명시적 키워드 인자가 항상 우선)로 전송 방식을 선택합니다. 주요 네 가지는 다음과 같습니다.

| 모드 | 하는 일 |
|---|---|
| `curl_cffi` *(기본값)* | `curl_cffi`를 통한 Chrome TLS/JA3 위장. 추가 인프라 없이 대부분의 네트워크에서 봇 검사를 통과합니다. |
| `requests` | 위장 없는 순수 `requests`. |
| `flaresolverr` | JS 챌린지를 해결하는 FlareSolverr 헤드리스 브라우저를 통해 프록시 — **실시간** 데이터. |
| `wayback` | Internet Archive의 가장 최근 스냅샷을 읽음 — 오래되었지만 아무것도 필요 없음. |

기본값인 `curl_cffi`는 값싼 승리입니다. 대부분의 "너는 봇이다" 판정은 TLS 지문 불일치입니다. 기본 `requests`(OpenSSL 경유)는 Chrome과 전혀 다르게 핸드셰이크합니다. `curl_cffi`는 실제 Chrome 빌드를 위장하므로(기본값 `impersonate="chrome"`), 핸드셰이크와 JA3가 일치하고 검사는 그냥 통과합니다. JavaScript 실행도, 브라우저 실행도 없습니다.

사이트가 실제 대화형 JS 챌린지로 수위를 높이면 `curl_cffi`만으로는 충분하지 않습니다. 무언가가 챌린지를 실행해야 합니다. 그것이 `flaresolverr` 모드입니다. 여러분이 직접 자체 호스팅하는 [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) 인스턴스가 **여러분의 프로세스 밖에서** 헤드리스 브라우저로 해결을 수행하고, `unblock_requests`는 그저 그곳으로 POST를 보내 해결된 HTML을 응답에서 꺼냅니다. `flaresolverr_url`을 설정하면 이 모드가 자동으로 선택됩니다.

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## 아카이브로의 우아한 성능 저하

인프라에도 안 좋은 날이 있습니다. FlareSolverr가 다운되거나, 사이트에 접근할 수 없거나, 지금 당장은 챌린지를 풀 수 없을 수 있습니다. 작업 전체를 실패시키는 대신, 세션은 **Wayback Machine**으로 대체할 수 있습니다. 챌린지 탐지는 휴리스틱입니다. 작은 `is_challenge()` 헬퍼가 본문의 앞부분을 훑어 Cloudflare 인터스티셜의 전형적인 표식("just a moment", `challenge-platform`, `cf_chl_opt`, `cf-mitigated`)을 찾습니다. GET이 차단되었을 때 `wayback_fallback`이 켜져 있으면, 세션은 `archive.org`의 가용성 API를 통해 가장 최근 스냅샷을 해석하고 그 원시 바이트를 반환합니다(툴바나 링크 재작성이 없는 `…id_/` 원시 형태). archive.org는 Cloudflare 게이트가 걸려 있지 않으므로 순수 `requests`로도 도달합니다.

알아둘 만한 구현상의 두 가지 참고 사항이 있습니다. `wayback`과 `flaresolverr` 모드에서 결과는 가져온 HTML로부터 구성된, *합성되었지만* 진짜인 `requests.Response`입니다. 따라서 `stream=`, 커스텀 어댑터, 커넥션 풀링은 그곳에서 적용되지 않는 반면, `requests`/`curl_cffi` 모드는 완전히 네이티브입니다. 그리고 이 대체는 GET에만 발동합니다. 저희는 변형을 일으키는 요청을 아카이브에서 조용히 재생하는 일이 결코 없습니다.

## 두 번째 계층: `anon_requests`와 IP 로테이션

직교하는 문제는 **IP 평판**입니다. 완벽한 지문이라도 모든 요청이 하나의 주소에서 오면 속도 제한이나 차단을 당합니다. `anon_requests`는 `RotatingProxySession`(스크래핑한 공개 프록시, 선택적 검증, SOCKS5/HTTP)과 `RotatingTorSession`(로테이션되는 Tor 회로)으로 이를 처리합니다. 각 요청은 새로운 출구를 통해 나가며, 죽은 프록시는 연결 실패 시 로테이션으로 제거됩니다.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## 조합: 로테이션 **그리고** 우회를 한 번에

이 두 라이브러리는 겹치는 대신 쌓이도록 설계되었습니다. `anon_requests` 세션은 `session_factory`를 받습니다. 이는 `requests.Session`을 반환하는 임의의 callable이며, 기본값은 `requests.Session`입니다. 로테이션과 프록시 설정은 그 factory가 반환하는 무엇에든 적용됩니다. 따라서 `CloudflareSession`을 factory로 주입하면 하나의 객체에서 두 가지 동작을 모두 얻습니다.

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates the IP *and* solves Cloudflare
```

로테이션된 프록시는 *모든* 전송 방식을 통해 흐르며, 여기에는 FlareSolverr 내부로도 들어갑니다. FlareSolverr는 해결 요청의 `proxy` 필드를 통해 헤드리스 브라우저를 구동합니다. 따라서 챌린지를 해결하는 IP는 요청의 나머지가 사용하는 것과 동일한 로테이션된 IP입니다. 방어자가 알아챌 수 있는 지문/출구 노드 분리가 없습니다.

## 왜 이런 형태인가

각 관심사를 그 자체의 얇은 `requests.Session` 서브클래스로 유지한다는 것은, 호출자가 HTTP 코드를 다시 작성하는 대신 생성자만 교체함으로써 필요한 것(TLS 위장만, 로테이션과 해결을 모두 포함한 완전한 스택, 또는 그 사이의 무엇이든)만 선택한다는 뜻입니다. 값비싸고 무거운 도구(진짜 브라우저)는 FlareSolverr 안에서 *프로세스 밖에* 머물며 JS 챌린지가 진정으로 요구할 때만 호출됩니다. 일반적인 경우는 값싼 위장 핸드셰이크입니다. 그리고 실시간 웹이 거부하면 아카이브가 답합니다.

`session_factory` 이음새는 조합이 일어나는 지점이며, 라이브러리들을 독립적으로 확장 가능하게 유지합니다. `unblock_requests`에 전송 모드를 추가하면 `anon_requests`가 그것을 공짜로 조합합니다. 공개 데이터에 대한 회복력 있는 접근을, 깔끔하게 해냅니다.

둘 다 FOSS이며 자체 호스팅이 가능합니다.
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests)와
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

이 전송 계층들은 저희의 모든 **[음악 데이터베이스 스크래퍼](/ko/blog/2026-04-20-music-database-scrapers)**를 구동합니다. 스크래퍼를 만들기 전의 사이트 정찰에 대해서는 **[sitemapper](https://github.com/TigreGotico/sitemapper)**와 **[robots.txt 및 sitemap 글](/ko/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**을 참고하세요.
