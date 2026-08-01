---
title: "Usenet في 2026: مدونة نصية نظيفة وسابقة للذكاء الاصطناعي للتدريب والتقييم"
description: "Usenet أرشيف بكر لخطاب بشري سابق للذكاء الاصطناعي — عقود من منشورات مجموعات الأخبار، كلها من كتابة البشر، ولم تمسّها نماذج اللغة. هذا يجعلها بيانات تدريب وتقييم قيّمة لنماذج اللغة والكلام. بنينا أداة بايثون صغيرة لحصادها."
date: 2026-07-01
lang: ar
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

معظم مدونات النصوص المفتوحة ملوّثة: فقد تسرّب نص مُولَّد بنماذج اللغة إلى Reddit و Stack Overflow و GitHub والمدونات، فصار أي نموذج مُدرَّب عليها يتعلّم جزئيًا من نماذج أخرى. أما Usenet فمختلفة. إنها عقود من حروب اللهب، والأسئلة والأجوبة التقنية، ومشاحنات مجموعات الأخبار، كلها من كتابة البشر، وسابقة تمامًا لنماذج اللغة اليوم. وبالنسبة لأي شخص يدرّب أو يقيّم نماذج لغة وكلام، فإن أرشيفًا ضخمًا من نص بشري التأليف بأصلٍ نظيف هو بالضبط نوع البيانات الذي صار العثور عليه أصعب.

-----

## Usenet بوصفها مدونة سابقة للذكاء الاصطناعي

تتلقى Usenet آلاف المنشورات يوميًا عبر مئات المجموعات النشطة. وإذا عدت بالأرشيف إلى ثمانينيات القرن الماضي، فستحصل على **ملايين المقالات** — كل منها إشارة إلى ما اهتم به البشر فعلًا، وما تجادلوا حوله، وما أرادوا معرفته — بأصلٍ نظيف بما يكفي للاقتباس منه.

بنينا أداة اسمها **usenet** تجعل حصاد هذا أمرًا بسيطًا:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

لم تعد معظم الخوادم العامة تدعم `NEWNEWS` (الاستعلام حسب التاريخ)، لذا فإن **التصفح القائم على المجموعات هو النهج المعياري.** فأنت تكشط مجموعة واحدة في كل مرة — وليس هذا عائقًا، بل مجرد واقع البروتوكول.

ولتحويل مجموعة أخبار إلى مجموعة بيانات تدريب، يحصد `dataset.py` المقالات إلى JSONL:

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

مقال واحد في كل سطر. ادفع بضعة آلاف منها إلى Hugging Face وستحصل على **مجموعة بيانات متاحة للعموم، من تأليف البشر، ونظيفة الأصل** يمكنك الاقتباس منها وإعادة نشرها.

المستودع: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## قراءة Usenet دون حساب

معظم خوادم الأخبار العامة تتيح لك القراءة دون تسجيل:

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

## لماذا يهمّ هذا

Usenet أرشيف نظيف الأصل من نص بشري التأليف على نطاق واسع، سابق لعصر المحتوى المُولَّد آليًا. سواء كنت تدرّب نماذج، أو تبني مجموعات بيانات، أو تدرس خطاب الإنترنت قبل أن يخفّفه النص المُولَّد بالذكاء الاصطناعي، فذلك الأرشيف لا يزال موجودًا وينمو باستمرار.

**المستودع:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — احصد Usenet في مجموعات بيانات تدريب؛ اقرأها للعموم دون حساب.
