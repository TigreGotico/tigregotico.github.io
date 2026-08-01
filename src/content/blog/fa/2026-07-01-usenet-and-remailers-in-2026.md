---
title: "Usenet در ۲۰۲۶: پیکره‌ای پاک و پیش از عصر هوش مصنوعی برای آموزش و ارزیابی"
description: "Usenet یک آرشیو بکر از گفتمان انسانی پیش از عصر هوش مصنوعی است — چند دهه پست newsgroup، همه نوشته‌ی انسان، بدون آنکه هیچ‌کدام دست‌خوش مدل‌های زبانی شده باشد. همین امر آن را به داده‌ی آموزشی و ارزیابیِ باارزشی برای مدل‌های زبانی و گفتاری تبدیل می‌کند. ما یک ابزار کوچک Python برای برداشت آن ساختیم."
date: 2026-07-01
lang: fa
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

بیشتر پیکره‌های متنیِ وب باز آلوده‌اند: متن تولیدشده توسط LLM به Reddit، Stack Overflow، GitHub و وبلاگ‌ها نشت کرده است، پس مدلی که روی آن‌ها آموزش می‌بیند بخشی از یادگیری‌اش را از مدل‌های دیگر می‌گیرد. Usenet متفاوت است. دهه‌ها جنگ‌ لفظی، پرسش‌ و پاسخ فنی و مباحثات newsgroup است، همه نوشته‌ی انسان، که به‌طور کامل پیش از مدل‌های زبانی امروز قرار دارد. برای هرکسی که مدل‌های زبانی و گفتاری را آموزش می‌دهد یا ارزیابی می‌کند، یک آرشیو بزرگ از متنِ نوشته‌شده توسط انسان با منشأیی پاک، دقیقاً همان نوع داده‌ای است که پیدا کردنش روزبه‌روز سخت‌تر می‌شود.

-----

## Usenet به‌مثابه پیکره‌ای پیش از عصر هوش مصنوعی

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

## خواندن Usenet بدون حساب کاربری

بیشتر سرورهای خبریِ عمومی به شما اجازه می‌دهند بدون ثبت‌نام بخوانید:

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

## چرا این اهمیت دارد

Usenet آرشیوی با منشأ پاک از متن نوشته‌شده توسط انسان در مقیاس بزرگ است، که پیش از عصر محتوای تولیدشده توسط ماشین قرار دارد. چه در حال آموزش مدل‌ها باشید، چه ساخت دیتاست، یا مطالعه گفتمان اینترنتی پیش از آنکه با متنِ تولیدشده توسط هوش مصنوعی رقیق شود، آن آرشیو هنوز آنجاست و همچنان در حال رشد.

**مخزن:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — برداشت Usenet برای دیتاست‌های آموزشی؛ خواندن عمومی بدون حساب کاربری.
