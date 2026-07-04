---
title: "Usenet وأجهزة إعادة الإرسال في 2026: كبسولة زمنية نظيفة وشبكة خصوصية ترفض أن تموت"
description: "Usenet أرشيف بكر لخطاب بشري سابق للذكاء الاصطناعي — بيانات تدريب خالية من نماذج اللغة تمتد عبر عقود من تاريخ الإنترنت. لكنها ليست مجرد آثار: فشبكة أجهزة إعادة الإرسال السايفربانكية لا تزال تعمل في 2026، وتوفّر مراسلة مجهولة حقيقية. بنينا أداتين صغيرتين لنُريك كلتيهما."
date: 2026-07-01
lang: ar
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

معظم مدونات الويب المفتوحة ملوّثة — فقد تسرّب نص مُولَّد بنماذج اللغة إلى Reddit وStack Overflow وGitHub والمدونات. أما Usenet فمختلفة: عقود من حروب اللهب، والأسئلة والأجوبة التقنية، ومشاحنات مجموعات الأخبار، كلها من كتابة البشر، ولم يمسّها أي نموذج لغوي. وبينما كنت أنقّب فيها، وجدت شيئًا آخر لا يزال يعمل: **شبكة أجهزة إعادة الإرسال السايفربانكية لا تزال تعمل في 2026**، ويصونها فريق صغير من عشّاق التشفير الذين لم يتوقفوا يومًا.

بنينا أداتين صغيرتين بلغة Python لكلتيهما.

-----

## الكبسولة الزمنية: Usenet بوصفها مدونة سابقة للذكاء الاصطناعي

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

## السايفربانك لم يرحلوا قط

لا تزال شبكة أجهزة إعادة الإرسال تعمل.

**أجهزة إعادة الإرسال من النوع الأول** (أجهزة إعادة الإرسال السايفربانكية): أرسِل رسالة ملفوفة بتشفير PGP متداخل — تفكّ كل قفزة طبقةً واحدة وتُمرّرها إلى التالية. ومن الخارج، تبدو الرسالة قادمةً من جهاز إعادة الإرسال، لا منك. وبحلول القفزة الأخيرة، يكون المُرسِل الأصلي قد ضاع.

**أجهزة إعادة الإرسال من النوع الثاني** (Mixmaster): تضيف حشوًا عشوائيًا، وتجرّد الترويسات، وتحتجز الرسائل قبل تمريرها، وتسلسلها عبر عدة أجهزة إعادة إرسال في آنٍ واحد. وهي أصعب بكثير في التتبع.

كلاهما لا يزال يعمل. هناك **نحو ستة أجهزة إعادة إرسال نشطة** في 2026. وتنشر شبكة الـ pinger إحصاءات يومية في `alt.privacy.anon-server.stats`، كما فعلت منذ عقود. واعتبارًا من مايو 2026:

- **frannie** (mix@franxial.com) — نسبة تشغيل 100%
- **frell** (godot@remailer.frell.eu.org) — نسبة تشغيل 100%
- **yeahno** (mix@yeahno.net) — نسبة تشغيل 100%
- **dizum** (remailer@dizum.com) — نسبة تشغيل نحو 99%
- **paranoia** (mixmaster@remailer.paranoici.org) — نسبة تشغيل نحو 92%

تكتشف مكتبة **remailers** الشبكة الحية عبر تحليل منشورات الإحصاءات اليومية تلك:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## استخدامها اليوم

### قراءة Usenet دون حساب

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

### النشر بشكل مجهول

تتطلب معظم الخوادم حسابًا مجانيًا للنشر. أما **paganini.bofh.team** و**news.tcpreset.net** فتقبلان المنشورات المجهولة، بما في ذلك النشر إلى `alt.anonymous.messages` — نقطة الإسقاط التقليدية للمستلمين المجهولين.

### إرسال رسالة مجهولة عبر سلسلة أجهزة إعادة الإرسال

لا تزال أجهزة إعادة الإرسال تستخدم **مفاتيح DSA + ElGamal PGP** من تسعينيات القرن الماضي — تشفير قديم لا تستطيع مكتبات PGP الحديثة في Python التشفير له. لذا نلجأ إلى **GnuPG** (الشيفرة القديمة حاملة للعبء):

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

### العثور على الردود: العناوين المُجزّأة

إن كنت تنتظر ردًا على `alt.anonymous.messages`، فأنت لا تريد أن يكشف العنوان عن المحتوى. يدعم بروتوكول جهاز إعادة الإرسال **hSub**: يُجزّئ المستلم العنوان الأصلي باستخدام SHA-256 وينشر الرد جاعلًا التجزئة عنوانًا له. ولا يمكن إلا لمن يعرف العنوان الأصلي أن يتعرّف عليه وسط السيل.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

ولمزيد من الخصوصية، تستخدم بعض الرسائل **eSub** — عناوين مشفّرة لا يمكن أن يفك تشفيرها إلا المستلم.

-----

## لماذا لا يزال هذا مهمًا

شبكة أجهزة إعادة الإرسال بطيئة ومصمّمة لعصر مختلف. لكنها **لامركزية، بلا مالك، وغير قابلة للإغلاق** — لا شركة تُستدعى قضائيًا، ولا خدمة تُوقَف. التصميم السايفربانكي نفسه الذي نجح في 1995 لا يزال ناجحًا.

أما Usenet فهي الجائزة الأندر: أرشيف نظيف الأصل من نص بشري التأليف على نطاق واسع. سواء كنت تدرّب نماذج، أو تبني مجموعات بيانات، أو تدرس خطاب الإنترنت الفعلي، فإن Usenet موجودة هناك — نظيفة، غير ملوّثة، ومجانية.

**المستودعات:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — احصد Usenet في مجموعات بيانات تدريب؛ اقرأها للعموم دون حساب.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — اعثر على أجهزة إعادة الإرسال الحية، وابنِ سلاسل مجهولة، وأرسِل عبر النوع الأول السايفربانكي.
