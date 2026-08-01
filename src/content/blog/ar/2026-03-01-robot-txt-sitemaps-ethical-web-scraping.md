---
title: "ملف Robots.txt وخرائط المواقع وكشط الويب الأخلاقي"
description: "قبل أن تبني أداة كشط، استكشف الموقع. تقرأ أداة sitemapper ملف robots.txt، وتجلب كل خرائط الموقع، وتزحف اختياريًا عبر رسم الروابط البياني — بحيث تنطلق أداة الكشط لديك من عقد الموقع نفسه بدلًا من القوة الغاشمة."
date: 2026-03-01
updated: 2026-08-01
lang: ar
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

## ابدأ بالاستطلاع، لا بالقوة الغاشمة

أسوأ أدوات الكشط تزحف بشكل أعمى. فهي تُثقل كاهل الموقع، وتتجاهل إعلانات
crawl-delay، وتخبط في كل مسار بحثًا عن البيانات، وتتعطل عندما تتغير البنية بمجرد
اسم فئة واحدة. أما أفضل أدوات الكشط فتبدأ بقراءة الموقع.

كل موقع ويب ينشر عقدًا في ثلاثة مواضع: **robots.txt** (سياسة الزحف)،
و**خرائط الموقع** (ما يعتبره الموقع نفسه جديرًا بالفهرسة)،
و**رسم الروابط البياني** (كيف تترابط الصفحات فعليًا فيما بينها). إن قراءة هذه
أولًا تجيب عن ثلاثة أسئلة قبل أن تكتب سطرًا واحدًا من شيفرة الكشط:

1. **هل هذا الموقع قابل للكشط؟** ماذا يسمح به robots.txt، وبأي وتيرة؟
2. **أين توجد البيانات؟** ماذا تكشف خرائط الموقع؟
3. **كيف يُبنى الموقع؟** كيف تبدو طوبولوجيا الروابط؟

هذا ما تفعله **[sitemapper](https://github.com/TigreGotico/sitemapper)**.

## الاكتشاف السلبي: robots.txt + خرائط الموقع

تجلب `discover()` ملف robots.txt وكل خريطة موقع يمكنها العثور عليها — بما في ذلك
توجيهات `Sitemap:`، وفهارس خرائط الموقع التي تشير إلى خرائط فرعية، والملفات
المضغوطة بصيغة gzip — دون الزحف إلى صفحة HTML واحدة:

```python
from sitemapper import discover

info = discover("https://www.python.org")
print(info.summary())
# Base URL:       https://www.python.org
# Blocked:        False
# Sitemaps found: 1
# URLs in sitemaps: 342
# Crawl-delay:    None
# Sitemap directives in robots.txt: 1

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

التفاصيل الخاصة بكل وكيل متوفرة عند الحاجة إليها: يحتوي `info.robots.groups` على
كل كتلة `User-agent` مع ما فيها من `allows` و`disallows` و`crawl_delay`، بترتيب
ورودها في المستند. وإذا لم يكن للموقع ملف robots.txt على الإطلاق، تُرجع
`is_allowed()` القيمة `True` لكل شيء — فغياب السياسة هو بذاته السياسة.

مكسب الكشط المعتمد على خرائط الموقع أولًا: بدلًا من اكتشاف الروابط عبر الزحف
(البطيء والصاخب وغير المكتمل)، تنطلق من قائمة القائمين على الموقع أنفسهم. فتكشط ما
يعلن الموقع أنه مهم، بالوتيرة التي يعلن أنها مقبولة، وبجزء يسير من الطلبات.

## الاكتشاف النشط: رسم الروابط البياني

بعض المواقع لا تنشر خريطة موقع. ولتلك المواقع، تُنفّذ `crawl()` زحفًا محدودًا
بالعرض أولًا انطلاقًا من الرابط الأساسي، وتُرجع `LinkGraph` للصفحات الداخلية
والروابط الصادرة:

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

هذا يخبرك بالطوبولوجيا الفعلية — أي صفحة ترتبط بماذا — حتى تتمكن من تقرير ما إذا
كان الموقع يستحق أداة كشط منظمة أصلًا. والاكتشاف والزحف استدعاءان منفصلان عمدًا:
فالخطوة السلبية لا تجلب HTML أبدًا، لذا يمكنك دائمًا الاستطلاع بأدب قبل أن تقرر
الزحف.

## مبني على النقل المرن ذاته

استطلاع الموقع لا طائل منه إذا حُجب الاستطلاع نفسه بجدران مكافحة الروبوتات. كل
حركة HTTP في sitemapper تمر عبر
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) — طبقة النقل
المنتحِلة لهوية TLS من
**[مقالنا حول نقل مكافحة الروبوتات](/ar/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** —
بحيث يعود robots.txt وخرائط الموقع حتى على المواقع المحمية بـ Cloudflare. ويمكن
تفعيل نسخة FlareSolverr أو الرجوع إلى Wayback Machine عبر متغيرات البيئة
(`SITEMAPPER_FLARESOLVERR_URL`، `SITEMAPPER_WAYBACK_FALLBACK=1`) أو عبر الصنف
`Sitemapper`.

## لماذا يهم هذا

**تأخير الزحف (Crawl-delay)**: الموقع الذي يعلن `Crawl-delay: 2` يخبرك بالسرعة
التي يريد أن يُطلب بها. تجاهلها تُحظر — أو تُدهور الموقع للجميع. احترمها فتلعب أداة
الكشط لديك بنزاهة.

**خرائط الموقع بدل الزحف**: خريطة الموقع تسرد ما يريد الموقع فهرسته. أما الزحف
الأعمى عبر الروابط فقد يلمس خمسة أضعاف عدد الروابط للعثور على المحتوى ذاته. ابدأ من
خريطة الموقع حين توجد؛ فهي أسرع لك وأخف على الخادم.

**النطاق قبل الشيفرة**: بعض المواقع تحظر الكشط صراحةً في robots.txt؛ وبعضها لديه
خرائط موقع تحتوي بالفعل على كل ما تحتاجه. عشر ثوانٍ من `discover()` تخبرك بأي وضع
أنت فيه قبل أن تستثمر في محلل.

## الأداة

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

استخدمها كمكتبة، أو من سطر الأوامر — تكتب `--json FILE` الاكتشاف الكامل إلى
ملف لتستهلكه أدوات أخرى، وتضيف `--crawl` خطوة رسم الروابط البياني:

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json out.json
```

إنها برمجية حرة وتعمل على عتادك الخاص. ابدأ كل أداة كشط بالاستطلاع.
