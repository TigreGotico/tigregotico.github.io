---
title: "Usenet و ری‌میلرها در ۲۰۲۶: یک کپسول زمانی دست‌نخورده و شبکه‌ای برای حریم خصوصی که از مردن سر باز می‌زند"
description: "Usenet یک آرشیو بکر از گفتمان انسانی پیش از عصر هوش مصنوعی است — داده‌های آموزشی عاری از LLM برخاسته از چند دهه تاریخ اینترنت. اما این فقط باستان‌شناسی نیست: شبکه ری‌میلرهای cypherpunk هنوز در سال ۲۰۲۶ کار می‌کند و پیام‌رسانی ناشناس واقعی ارائه می‌دهد. ما دو ابزار کوچک ساختیم تا هر دو را به شما نشان دهیم."
date: 2026-07-01
lang: fa
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

بیشتر پیکره‌های وب باز آلوده شده‌اند — متن تولیدشده توسط LLM به Reddit، Stack Overflow، GitHub و وبلاگ‌ها نشت کرده است. Usenet متفاوت است: دهه‌ها جنگ‌ لفظی، پرسش‌ و پاسخ فنی و مباحثات newsgroup، همه نوشته‌ی انسان، بدون آنکه هیچ‌کدام دست‌خوش مدل‌های زبانی شده باشد. و در حین کاوش در آن، چیز دیگری هم یافتم که هنوز در حال کار است: **شبکه ری‌میلرهای cypherpunk همچنان در سال ۲۰۲۶ فعال است**، و توسط گروه کوچکی از علاقه‌مندان به رمزنگاری که هرگز دست نکشیدند نگهداری می‌شود.

ما برای هر دو، دو ابزار کوچک Python ساختیم.

-----

## کپسول زمانی: Usenet به‌مثابه پیکره‌ای پیش از عصر هوش مصنوعی

Usenet روزانه هزاران پست در صدها گروه فعال دریافت می‌کند. در آرشیو تا دهه ۱۹۸۰ به عقب بروید و **میلیون‌ها مقاله** خواهید داشت — هر یک نشانه‌ای از آنچه انسان‌ها واقعاً به آن اهمیت می‌دادند، درباره‌اش بحث می‌کردند و می‌خواستند بدانند — با منشأیی به‌قدر کافی پاک برای استناد.

ما ابزاری به نام **usenet** ساختیم که برداشت این داده‌ها را ساده می‌کند:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

بیشتر سرورهای عمومی دیگر از `NEWNEWS` (پرس‌وجو بر اساس تاریخ) پشتیبانی نمی‌کنند، بنابراین **مرور بر پایه گروه، رویکرد استاندارد است.** هر بار یک گروه را scrape می‌کنید — این مانع نیست، صرفاً واقعیت پروتکل است.

برای تبدیل یک newsgroup به یک دیتاست آموزشی، `dataset.py` مقاله‌ها را در قالب JSONL برداشت می‌کند:

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

هر مقاله در یک خط. چند هزار مورد از این‌ها را به Hugging Face بفرستید و یک **دیتاست در دسترس عموم، نوشته‌شده توسط انسان و با منشأ پاک** خواهید داشت که می‌توانید به آن استناد کنید و بازنشرش دهید.

مخزن: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Cypherpunkها هرگز نرفتند

شبکه ری‌میلرها همچنان در حال کار است.

**ری‌میلرهای نوع اول** (ری‌میلرهای Cypherpunk): پیامی را می‌فرستند که در لایه‌های تودرتوی رمزنگاری PGP پیچیده شده — هر پرش یک لایه را رمزگشایی می‌کند و به پرش بعدی می‌فرستد. از بیرون، پیام به نظر می‌رسد که از ری‌میلر آمده، نه از شما. تا پرش پایانی، فرستنده اصلی گم شده است.

**ری‌میلرهای نوع دوم** (Mixmaster): بالشتک تصادفی اضافه می‌کنند، سرآیندها را حذف می‌کنند، پیام‌ها را پیش از ارسال نگه می‌دارند و هم‌زمان از میان چندین ری‌میلر زنجیر می‌کنند. ردیابی‌شان بسیار دشوارتر است.

هر دو هنوز کار می‌کنند. در سال ۲۰۲۶ **حدود نیم‌دوجین ری‌میلر فعال** وجود دارد. شبکه pinger آمار روزانه را در `alt.privacy.anon-server.stats` منتشر می‌کند، درست همان‌طور که دهه‌هاست انجام می‌دهد. تا مه ۲۰۲۶:

- **frannie** (mix@franxial.com) — ۱۰۰٪ آپ‌تایم
- **frell** (godot@remailer.frell.eu.org) — ۱۰۰٪ آپ‌تایم
- **yeahno** (mix@yeahno.net) — ۱۰۰٪ آپ‌تایم
- **dizum** (remailer@dizum.com) — ~۹۹٪ آپ‌تایم
- **paranoia** (mixmaster@remailer.paranoici.org) — ~۹۲٪ آپ‌تایم

کتابخانه **remailers** با تجزیه (parsing) همان پست‌های آمار روزانه، شبکه فعال را کشف می‌کند:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## استفاده از آن‌ها امروز

### خواندن Usenet بدون حساب کاربری

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

### انتشار به‌صورت ناشناس

بیشتر سرورها برای انتشار به یک حساب کاربری رایگان نیاز دارند. **paganini.bofh.team** و **news.tcpreset.net** پست‌های ناشناس را می‌پذیرند، از جمله در `alt.anonymous.messages` — نقطه تحویل سنتی برای گیرندگان ناشناس.

### ارسال یک پیام ناشناس از طریق زنجیره ری‌میلرها

ری‌میلرها هنوز از **کلیدهای PGP نوع DSA + ElGamal** دهه ۱۹۹۰ استفاده می‌کنند — رمزنگاری قدیمی‌ای که کتابخانه‌های مدرن PGP در Python نمی‌توانند برای آن رمزگذاری کنند. ما به **GnuPG** از طریق shell متوسل می‌شویم (کد قدیمی، ستون‌فقرات ماجراست):

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

### یافتن پاسخ‌ها: موضوعات هش‌شده

اگر منتظر پاسخی در `alt.anonymous.messages` هستید، نمی‌خواهید موضوع، محتوا را فاش کند. پروتکل ری‌میلر از **hSub** پشتیبانی می‌کند: گیرنده موضوع اصلی را با SHA-256 هش می‌کند و پاسخ را با آن هش به‌عنوان موضوع منتشر می‌کند. تنها کسی که موضوع اصلی را می‌داند می‌تواند آن را در میان سیل پیام‌ها شناسایی کند.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

برای حریم خصوصی بیشتر، برخی پیام‌ها از **eSub** استفاده می‌کنند — موضوعات رمزگذاری‌شده‌ای که تنها گیرنده می‌تواند آن‌ها را رمزگشایی کند.

-----

## چرا این هنوز اهمیت دارد

شبکه ری‌میلرها کند است و برای دورانی دیگر طراحی شده. اما **غیرمتمرکز، بدون مالک و غیرقابل‌تعطیلی** است — نه شرکتی برای احضار قضایی، نه سرویسی برای متوقف‌ کردن. همان طرح cypherpunk که در سال ۱۹۹۵ کار می‌کرد هنوز کار می‌کند.

Usenet جایزه نادرتری است: آرشیوی با منشأ پاک از متن نوشته‌شده توسط انسان، در مقیاس بزرگ. چه در حال آموزش مدل‌ها باشید، چه ساخت دیتاست، یا مطالعه گفتمان واقعی اینترنت، Usenet آنجاست — پاک، دست‌نخورده، آزاد.

**مخازن:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — برداشت Usenet برای دیتاست‌های آموزشی؛ خواندن عمومی بدون حساب کاربری.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — یافتن ری‌میلرهای فعال، ساخت زنجیره‌های ناشناس، ارسال از طریق Cypherpunk نوع اول.
