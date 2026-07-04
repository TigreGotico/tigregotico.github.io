---
title: "Usenet и ремейлеры в 2026: чистая капсула времени и сеть приватности, которая отказывается умирать"
description: "Usenet — это первозданный архив до-ИИ человеческого дискурса, обучающие данные без LLM из десятилетий истории интернета. Но это не только археология: киберпанковская сеть ремейлеров всё ещё работает в 2026, предлагая настоящую анонимную переписку. Мы построили два небольших инструмента, чтобы показать вам и то, и другое."
date: 2026-07-01
lang: ru
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

Большинство корпусов открытого веба заражены — сгенерированный LLM текст просочился в Reddit, Stack Overflow, GitHub, блоги. Usenet отличается: десятилетия флеймов, технических вопросов-ответов и споров в новостных группах, все написанные людьми, ничего не тронутого языковыми моделями. И, копаясь в нём, я нашёл кое-что ещё, всё ещё работающее: **киберпанковская сеть ремейлеров всё ещё функционирует в 2026**, поддерживаемая небольшой группой энтузиастов криптографии, которые так и не остановились.

Мы построили два небольших Python-инструмента для обоих.

-----

## Капсула времени: Usenet как до-ИИ корпус

Usenet получает тысячи постов в день по сотням активных групп. Архивируйте назад до 1980-х, и у вас есть **миллионы статей** — каждая сигнал того, что людей на самом деле волновало, о чём они спорили, что хотели узнать — с провенансом, достаточно чистым, чтобы цитировать.

Мы построили инструмент под названием **usenet**, который делает сбор этого простым:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

Большинство публичных серверов больше не поддерживают `NEWNEWS` (запрос по дате), так что **просмотр на основе групп — это стандартный подход.** Вы скрейпите по одной группе за раз — не барьер, просто реальность протокола.

Чтобы превратить новостную группу в обучающий датасет, `dataset.py` собирает статьи в JSONL:

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

Одна статья на строку. Отправьте пару тысяч таких на Hugging Face, и у вас есть **публично доступный, написанный людьми, с чистым провенансом датасет**, который вы можете цитировать и переопубликовывать.

Репозиторий: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Киберпанки никогда не уходили

Сеть ремейлеров всё ещё работает.

**Ремейлеры Type-I** (киберпанковские ремейлеры): отправляют сообщение, обёрнутое во вложенное PGP-шифрование — каждый переход расшифровывает один слой и пересылает следующему. Снаружи сообщение кажется исходящим от ремейлера, а не от вас. К финальному переходу исходный отправитель потерян.

**Ремейлеры Type-II** (Mixmaster): добавляют случайную набивку, срезают заголовки, задерживают сообщения перед пересылкой и цепляются через несколько ремейлеров одновременно. Гораздо труднее отследить.

Оба всё ещё работают. В 2026 году есть **примерно полдюжины активных ремейлеров**. Пинг-сеть постит ежедневную статистику в `alt.privacy.anon-server.stats`, так же, как и десятилетиями. По состоянию на май 2026:

- **frannie** (mix@franxial.com) — 100% аптайм
- **frell** (godot@remailer.frell.eu.org) — 100% аптайм
- **yeahno** (mix@yeahno.net) — 100% аптайм
- **dizum** (remailer@dizum.com) — ~99% аптайм
- **paranoia** (mixmaster@remailer.paranoici.org) — ~92% аптайм

Библиотека **remailers** обнаруживает живую сеть, парся эти ежедневные посты статистики:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## Как использовать их сегодня

### Читайте Usenet без аккаунта

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

### Постите анонимно

Большинство серверов требуют бесплатный аккаунт для постинга. **paganini.bofh.team** и **news.tcpreset.net** принимают анонимные посты, включая в `alt.anonymous.messages` — традиционный сброс для анонимных получателей.

### Отправьте анонимное сообщение через цепочку ремейлеров

Ремейлеры всё ещё используют **PGP-ключи DSA + ElGamal** из 1990-х — старую криптографию, к которой современные Python-библиотеки PGP не могут шифровать. Мы вызываем внешний **GnuPG** (старый код несущий):

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

### Поиск ответов: хешированные темы

Если вы ждёте ответа в `alt.anonymous.messages`, вы не хотите, чтобы тема раскрывала содержание. Протокол ремейлеров поддерживает **hSub**: получатель хеширует исходную тему с SHA-256 и постит ответ с хешем в качестве темы. Только тот, кто знает исходную тему, может опознать её в потоке.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

Для большей приватности некоторые сообщения используют **eSub** — зашифрованные темы, которые может расшифровать только получатель.

-----

## Почему это по-прежнему важно

Сеть ремейлеров медленна и спроектирована для другой эпохи. Но она **децентрализована, безвладельна и незакрываема** — нет компании, которую можно вызвать в суд, нет сервиса, который можно прекратить. Тот же киберпанковский дизайн, который работал в 1995, всё ещё работает.

Usenet — более редкий приз: архив с чистым провенансом человеческого текста в масштабе. Обучаете ли вы модели, строите датасеты или изучаете реальный интернет-дискурс — Usenet там, чистый, неиспорченный, свободный.

**Репозитории:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Собирайте Usenet в обучающие датасеты; читайте публично без аккаунта.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — Находите живые ремейлеры, стройте анонимные цепочки, отправляйте через Cypherpunk Type-I.
