---
title: "2026년의 Usenet & 리메일러: 깨끗한 타임캡슐과 죽기를 거부하는 프라이버시 네트워크"
description: "Usenet은 AI 이전 인간 담론의 손상되지 않은 아카이브입니다 — 수십 년의 인터넷 역사에서 나온 LLM 없는 학습 데이터입니다. 하지만 단순한 고고학이 아닙니다: 사이퍼펑크 리메일러 네트워크는 2026년에도 여전히 작동하며, 진정한 익명 메시징을 제공합니다. 우리는 두 가지 모두를 보여주기 위해 두 개의 작은 도구를 만들었습니다."
date: 2026-07-01
lang: ko
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

대부분의 오픈 웹 코퍼스는 오염되어 있습니다 — LLM이 생성한 텍스트가 Reddit, Stack Overflow, GitHub, 블로그로 유출되었습니다. Usenet은 다릅니다: 수십 년의 설전, 기술적 질의응답, 뉴스그룹 논쟁이 모두 인간이 쓴 것이며, 그 어떤 것도 언어 모델에 손대지 않았습니다. 그리고 그것을 파고들던 중, 저는 아직도 돌아가고 있는 또 다른 것을 발견했습니다: **사이퍼펑크 리메일러 네트워크는 2026년에도 여전히 운영되고 있으며**, 결코 멈추지 않은 소수의 암호학 애호가 그룹이 유지하고 있습니다.

우리는 둘 다를 위해 두 개의 작은 파이썬 도구를 만들었습니다.

-----

## 타임캡슐: AI 이전 코퍼스로서의 Usenet

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

## 사이퍼펑크는 결코 떠나지 않았다

리메일러 네트워크는 여전히 돌아가고 있습니다.

**타입 I 리메일러**(사이퍼펑크 리메일러): 중첩된 PGP 암호화로 감싼 메시지를 보냅니다 — 각 홉(hop)은 한 겹을 복호화하고 다음으로 전달합니다. 바깥에서 보면 메시지는 당신이 아니라 리메일러에서 온 것처럼 보입니다. 마지막 홉에 이르면 원래 발신자는 사라집니다.

**타입 II 리메일러**(Mixmaster): 무작위 패딩을 추가하고, 헤더를 제거하고, 전달하기 전에 메시지를 보류하며, 여러 리메일러를 동시에 사슬처럼 엮습니다. 추적하기가 훨씬 더 어렵습니다.

둘 다 여전히 작동합니다. 2026년에는 **대략 대여섯 개의 활성 리메일러**가 있습니다. 핑거(pinger) 네트워크는 수십 년 동안 그래왔듯이 `alt.privacy.anon-server.stats`에 매일 통계를 게시합니다. 2026년 5월 기준:

- **frannie** (mix@franxial.com) — 100% 가동 시간
- **frell** (godot@remailer.frell.eu.org) — 100% 가동 시간
- **yeahno** (mix@yeahno.net) — 100% 가동 시간
- **dizum** (remailer@dizum.com) — 약 99% 가동 시간
- **paranoia** (mixmaster@remailer.paranoici.org) — 약 92% 가동 시간

**remailers** 라이브러리는 그 매일의 통계 게시물을 파싱하여 활성 네트워크를 발견합니다:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## 오늘 그것들을 사용하기

### 계정 없이 Usenet 읽기

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

### 익명으로 게시하기

대부분의 서버는 게시하려면 무료 계정을 요구합니다. **paganini.bofh.team** 과 **news.tcpreset.net** 은 `alt.anonymous.messages`를 포함하여 익명 게시를 허용합니다 — 익명 수신자를 위한 전통적인 전달 지점입니다.

### 리메일러 사슬을 통해 익명 메시지 보내기

리메일러는 여전히 1990년대의 **DSA + ElGamal PGP 키**를 사용합니다 — 현대 파이썬 PGP 라이브러리로는 암호화할 수 없는 오래된 암호 방식입니다. 우리는 **GnuPG** 로 셸 아웃합니다(그 오래된 코드가 핵심적인 역할을 합니다):

```python
from remailers.network import fetch_live_remailers, fetch_keyring_blob
from remailers.gpg import GPGKeyring
from remailers.cypherpunk import build_chain

remailers = fetch_live_remailers()

# the published keyring is full of DSA/ElGamal keys -> use the GnuPG backend
with GPGKeyring(fetch_keyring_blob()) as gpg:
    have = set(gpg.recipients())
    chain = [r for r in remailers
             if r.is_cpunk and r.accepts_pgp and r.address in have][:3]

    # nest a PGP layer per hop; the exit posts to a newsgroup
    message, entry = build_chain(
        hops=[(r.address, r.address) for r in chain],
        anon_post_to="alt.anonymous.messages",
        body="Hello from the shadows",
        encrypt=gpg.encrypt,
    )

# `message` goes to `entry` over SMTP (remailers.cypherpunk.send_chain) —
# the one piece you bring yourself: an email sender.
```

### 답장 찾기: 해시된 제목

`alt.anonymous.messages`에서 답장을 기다리고 있다면, 제목이 내용을 드러내는 것을 원치 않을 것입니다. 리메일러 프로토콜은 **hSub**를 지원합니다: 수신자는 원래 제목을 SHA-256으로 해시하고 그 해시를 제목으로 하여 답장을 게시합니다. 원래 제목을 아는 사람만이 그 쏟아지는 흐름 속에서 그것을 식별할 수 있습니다.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

더 강한 프라이버시를 위해, 일부 메시지는 **eSub** — 수신자만이 복호화할 수 있는 암호화된 제목 — 를 사용합니다.

-----

## 이것이 여전히 중요한 이유

리메일러 네트워크는 느리고 다른 시대를 위해 설계되었습니다. 하지만 그것은 **탈중앙화되어 있고, 소유자가 없으며, 폐쇄할 수 없습니다** — 소환할 회사도, 중단할 서비스도 없습니다. 1995년에 작동했던 그 동일한 사이퍼펑크 설계가 여전히 작동합니다.

Usenet은 더 희귀한 보물입니다: 대규모로 인간이 작성한 텍스트의, 출처가 깨끗한 아카이브입니다. 모델을 학습시키든, 데이터셋을 구축하든, 실제 인터넷 담론을 연구하든, Usenet은 거기에 있습니다 — 깨끗하고, 오염되지 않았으며, 자유롭게.

**저장소:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Usenet을 학습 데이터셋으로 수집; 계정 없이 공개적으로 읽기.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — 활성 리메일러 찾기, 익명 사슬 구축, Cypherpunk 타입 I을 통해 전송.
