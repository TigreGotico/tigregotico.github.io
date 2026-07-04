---
title: "Robots.txt, Sitemap, 그리고 윤리적 웹 스크래핑"
description: "스크래퍼를 만들기 전에 사이트를 정찰하세요. sitemapper는 robots.txt를 읽고, 모든 sitemap을 가져오며, 선택적으로 링크 그래프를 크롤링합니다. 따라서 여러분의 스크래퍼는 무차별 대입 대신 사이트 자체의 계약에서 출발합니다."
date: 2026-03-01
lang: ko
author: "Casimiro Ferreira"
tags:
  - "Web Scraping"
  - "Sitemaps"
  - "Ethics"
  - "Robots.txt"
  - "Data Collection"
  - "FOSS"
draft: false
---

## 무차별 대입이 아니라 정찰로 시작하세요

최악의 스크래퍼는 앞을 보지 못한 채 크롤링합니다. 사이트를 두들기고, crawl-delay 선언을 무시하며, 데이터를 찾아 모든 경로를 헤집고, 클래스 이름 하나만 바뀌어도 망가집니다. 최고의 스크래퍼는 사이트를 읽는 것으로 시작합니다.

모든 웹사이트는 세 곳에 계약을 게시합니다. **robots.txt**(크롤링 정책), **sitemap**(사이트 스스로 색인할 가치가 있다고 여기는 것), 그리고 **링크 그래프**(페이지들이 실제로 어떻게 연결되어 있는지)입니다. 이것들을 먼저 읽으면 스크래핑 코드를 한 줄이라도 작성하기 전에 세 가지 질문에 답할 수 있습니다.

1. **이 사이트는 스크래핑이 가능한가?** robots.txt는 무엇을 어느 속도로 허용하는가?
2. **데이터는 어디에 있는가?** sitemap은 무엇을 드러내는가?
3. **사이트는 어떻게 구성되어 있는가?** 링크 토폴로지는 어떤 모습인가?

바로 이것이 **[sitemapper](https://github.com/TigreGotico/sitemapper)**가 하는 일입니다.

## 수동적 발견: robots.txt + sitemap

`discover()`는 `Sitemap:` 지시문, 하위 sitemap을 가리키는 sitemap 인덱스, gzip으로 압축된 파일을 포함해 찾을 수 있는 robots.txt와 모든 sitemap을 가져오며, 이때 HTML 페이지는 단 한 개도 크롤링하지 않습니다.

```python
from sitemapper import discover

info = discover("https://www.python.org")
print(info.summary())
# Base URL:         https://www.python.org
# Sitemaps found:   1
# URLs in sitemaps: 342
# Crawl-delay:      None

# What pace does the site ask for?
if info.robots.crawl_delay:
    print(f"Wait {info.robots.crawl_delay}s between requests")

# May I fetch this path?
info.robots.is_allowed("/api/users")            # True / False
info.robots.is_allowed("/admin", user_agent="MyBot/1.0")

# Every deduplicated URL the site's own sitemaps declare
for url in info.urls:
    print(url.loc, url.lastmod, url.changefreq, url.priority)
```

에이전트별 세부 정보는 필요할 때 제공됩니다. `info.robots.groups`는 각 `User-agent` 블록을 그 안의 `allows`, `disallows`, `crawl_delay`와 함께 문서 순서대로 담고 있습니다. 사이트에 robots.txt가 전혀 없으면 `is_allowed()`는 모든 것에 대해 `True`를 반환합니다. 정책의 부재 자체가 곧 정책입니다.

sitemap 우선 스크래핑의 이점은 이렇습니다. URL을 크롤링으로 발견하는(느리고, 시끄럽고, 불완전한) 대신, 유지 관리자 자신의 목록에서 출발합니다. 사이트가 중요하다고 선언한 것을, 사이트가 허용 가능하다고 선언한 속도로, 요청 수의 일부만으로 스크래핑합니다.

## 능동적 발견: 링크 그래프

일부 사이트는 sitemap을 게시하지 않습니다. 그런 경우 `crawl()`은 기준 URL에서 시작하는 제한된 너비 우선 크롤링을 실행하고, 내부 페이지와 외부로 나가는 링크로 구성된 `LinkGraph`를 반환합니다.

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

이는 실제 토폴로지, 즉 어떤 페이지가 무엇에 연결되는지를 알려주므로, 그 사이트가 애초에 구조화된 스크래퍼를 들일 가치가 있는지 판단할 수 있습니다. 발견과 크롤링은 의도적으로 분리된 호출입니다. 수동적 단계는 결코 HTML을 가져오지 않으므로, 크롤링을 결정하기 전에 언제나 예의 바르게 정찰할 수 있습니다.

## 동일한 회복력 있는 전송 계층 위에 구축

정찰 자체가 봇 차단 벽에 막힌다면 사이트 정찰은 무의미합니다. sitemapper의 모든 HTTP는 [`unblock_requests`](https://github.com/TigreGotico/unblock_requests), 즉 저희 **[안티봇 전송 계층 글](/ko/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**에서 다룬 TLS 위장 전송 계층을 거칩니다. 따라서 Cloudflare로 보호되는 사이트에서도 robots.txt와 sitemap이 되돌아옵니다. FlareSolverr 인스턴스나 Wayback Machine 대체 수단은 환경 변수(`SITEMAPPER_FLARESOLVERR_URL`, `SITEMAPPER_WAYBACK_FALLBACK=1`)나 `Sitemapper` 클래스를 통해 활성화할 수 있습니다.

## 이것이 중요한 이유

**Crawl delay**: `Crawl-delay: 2`를 선언하는 사이트는 얼마나 빠르게 접근받고 싶은지를 알려주는 것입니다. 이를 무시하면 차단당하거나, 모두를 위한 사이트 품질을 떨어뜨리게 됩니다. 이를 존중하면 스크래퍼가 공정하게 작동합니다.

**크롤링보다 sitemap**: sitemap은 사이트가 색인되기를 원하는 것을 나열합니다. 무작정 링크를 크롤링하면 같은 콘텐츠를 찾기 위해 다섯 배 많은 URL을 건드릴 수 있습니다. sitemap이 있으면 그것부터 시작하세요. 여러분에게 더 빠르고 서버에도 더 가볍습니다.

**코드보다 범위**: 어떤 사이트는 robots.txt에서 스크래핑을 아예 금지하고, 어떤 사이트는 이미 필요한 모든 것이 담긴 sitemap을 가지고 있습니다. `discover()`에 10초를 들이면, 파서에 투자하기 전에 어떤 상황인지 알 수 있습니다.

## 도구

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

라이브러리로 사용하거나 명령줄에서 사용하세요. `--json`은 다른 도구로 파이핑할 수 있도록 전체 발견 결과를 내보내고, `--crawl`은 링크 그래프 단계를 추가합니다.

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json
```

이것은 자유 소프트웨어이며 여러분 자신의 하드웨어에서 실행됩니다. 모든 스크래퍼를 정찰로 시작하세요.
