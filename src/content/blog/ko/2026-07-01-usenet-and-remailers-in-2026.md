---
title: "2026년의 Usenet: 학습과 평가를 위한 깨끗한 AI 이전 텍스트 코퍼스"
description: "Usenet은 AI 이전 인간 담론의 손상되지 않은 아카이브입니다 — 수십 년에 걸친 뉴스그룹 게시물로, 모두 인간이 작성했으며 어떤 언어 모델의 손도 타지 않았습니다. 그래서 언어 및 음성 모델의 학습과 평가에 가치 있는 데이터가 됩니다. 우리는 이를 수집하는 작은 Python 도구를 만들었습니다."
date: 2026-07-01
lang: ko
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

대부분의 오픈 웹 텍스트 코퍼스는 오염되어 있습니다. LLM이 생성한 텍스트가 Reddit, Stack Overflow, GitHub, 블로그로 유출되었으므로, 이를 학습한 모델은 부분적으로 다른 모델로부터 배우는 셈입니다. Usenet은 다릅니다. 수십 년의 설전, 기술적 질의응답, 뉴스그룹 논쟁이 모두 인간이 쓴 것이며, 오늘날의 언어 모델보다 전적으로 앞선 시기의 것입니다. 언어 및 음성 모델을 학습하거나 평가하는 누구에게든, 출처가 깨끗한 대규모의 인간 저작 텍스트 아카이브는 점점 찾기 어려워지는 바로 그런 종류의 데이터입니다.

-----

## AI 이전 코퍼스로서의 Usenet

Usenet은 수백 개의 활성 그룹에 걸쳐 하루에 수천 개의 게시물을 받습니다. 1980년대까지 아카이브를 거슬러 올라가면 **수백만 개의 기사**를 얻게 됩니다 — 각각은 인간이 실제로 무엇을 중요하게 여겼고, 논쟁했고, 알고 싶어 했는지에 대한 신호이며, 인용하기에 충분히 깨끗한 출처를 가지고 있습니다.

우리는 이 수집을 간단하게 만들어주는 **usenet** 이라는 도구를 만들었습니다:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

대부분의 공개 서버는 더 이상 `NEWNEWS`(날짜별 조회)를 지원하지 않으므로, **그룹 기반 브라우징이 표준 접근 방식입니다.** 한 번에 한 그룹씩 스크레이핑합니다 — 장벽이 아니라, 그저 프로토콜의 현실입니다.

뉴스그룹을 학습 데이터셋으로 바꾸기 위해, `dataset.py`는 기사를 JSONL로 수집합니다:

```
{
  "group": "comp.lang.python",
  "message_id": "<12345@example.com>",
  "subject": "Best practices for list comprehensions",
  "author": "Alice",
  "date": "1999-03-15T10:22:00Z",
  "language": "en",
  "text": "In my experience, list comprehensions are most readable when...",
}
```

한 줄에 기사 하나. 그중 몇천 개를 Hugging Face에 올리면 **공개적으로 이용 가능하고, 인간이 작성했으며, 출처가 깨끗한 데이터셋**을 얻게 되며, 이를 인용하고 다시 게시할 수 있습니다.

저장소: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## 계정 없이 Usenet 읽기

대부분의 공개 뉴스 서버는 등록 없이 읽을 수 있게 해줍니다:

```python
from usenet import UsenetServer

servers = [
    "news.neodome.net",
    "news.samoylyk.net",
    "freenews.netfront.net"
]

for server in servers:
    try:
        with UsenetServer(server) as s:
            articles = s.get_articles("alt.test", limit=5)
            print(f"Success on {server}: {len(articles)} articles")
            break
    except OSError:
        continue
```

-----

## 이것이 중요한 이유

Usenet은 기계 생성 콘텐츠 시대보다 앞선, 대규모로 출처가 깨끗한 인간 저작 텍스트 아카이브입니다. 모델을 학습시키든, 데이터셋을 구축하든, AI 생성 텍스트로 희석되기 이전의 인터넷 담론을 연구하든, 그 아카이브는 여전히 거기에 있으며 계속 자라나고 있습니다.

**저장소:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Usenet을 학습 데이터셋으로 수집; 계정 없이 공개적으로 읽기.
