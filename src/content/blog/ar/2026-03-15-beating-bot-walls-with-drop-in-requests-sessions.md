---
title: "تجاوز جدران مكافحة الروبوتات بجلسات requests قابلة للتركيب وجاهزة للاستخدام"
description: "كيف نحافظ على وصول مرن إلى البيانات العامة دون تشغيل متصفح بلا واجهة في المسار الحرج: انتحال بصمة TLS، ووكيل FlareSolverr لتحديات JavaScript، والرجوع إلى Wayback Machine، وتدوير عناوين IP — كل ذلك خلف فئتين فرعيتين قابلتين للتركيب من requests.Session، هما unblock_requests و anon_requests."
date: 2026-03-15
lang: ar
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

يعتمد جزء كبير من عملنا — عملاء بيانات الوسائط الوصفية، وإثراء الفهارس،
والأرشفة — على قراءة صفحات الويب **العامة** بشكل موثوق. نادرًا ما تكون المشكلة في
البيانات؛ بل في الجدار الذي أمامها. والجدار يطرح سؤالين منفصلين:

- **"ماذا تكون؟"** — تحظر Cloudflare وأمثالها الطلبات لا بناءً على *ما* تطلبه، بل
  بناءً على *كيف* تبدو على السلك: مصافحة TLS الخاصة بك، وبصمة JA3، وما إذا كنت
  قادرًا على تشغيل تحدٍّ من JavaScript.
- **"من تكون؟"** — تتجاهل سمعة عنوان IP وحدود المعدل بصمتك تمامًا؛ فهي تعد كم عدد
  الطلبات القادمة من عنوان واحد.

السؤالان متعامدان، لذا نجيب عنهما بمكتبتين صغيرتين تتراكمان بشكل نظيف:
**unblock_requests** يجيب عن *ماذا تكون*، و**anon_requests** يجيب عن *من تكون*.
كلتاهما بديلان مباشران لجلسة `requests` في الشيفرة اليومية. يتناول هذا المقال طبقة
النقل تلك تحديدًا — جزء البايتات على السلك — وليس التحليل أو خط الأنابيب الذي يقع
فوقها.

## قيد التصميم: الحفاظ على شكل `requests`

تُشتَقّ جلسات `unblock_requests` من `requests.Session` وتتجاوز فقط `request()` —
أما كل شيء آخر (`.get()`، `.post()`، ملفات تعريف الارتباط، الترويسات، دلالات مدير
السياق) فهو موروث، لذا فإن أي شيء مكتوب بالاعتماد على `requests.Session` يقبلها دون
تغيير. أما جلسات `anon_requests` فتغلِّف بدلًا من أن تشتق — إذ تكشف عن نفس أساليب
الأفعال وواجهة مدير السياق نفسها، لكنها تعيد بناء جلستها الداخلية عند كل تدوير:

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

هنا، في سطر واحد، يكمن الموقف الأخلاقي والهندسي بأكمله: نحن لا نُؤتمِت متصفحًا
بوصفه مستخدمًا، بل نبني *عميل HTTP مرنًا* لبيانات هي بالفعل عامة. لا يظهر أي متصفح
بواجهة على شاشة أحد، ولا يحتاج أي شيء في المسار الحرج إلى شاشة عرض.

## الطبقة الأولى: `unblock_requests` ووسائل النقل الخاصة به

يدافع `unblock_requests` ضد **كشف الروبوتات**. تختار وسيلة نقل عبر الوسيط
`mode=` (أو متغير البيئة `UNBLOCK_REQUESTS_TRANSPORT` — الوسائط الصريحة تفوز
دائمًا). الوسائل الأربع الرئيسية:

| الوضع | ما الذي يفعله |
|---|---|
| `curl_cffi` *(الافتراضي)* | انتحال TLS/JA3 الخاص بـ Chrome عبر `curl_cffi`. يتجاوز فحص الروبوتات في معظم الشبكات دون بنية تحتية إضافية. |
| `requests` | `requests` بسيط، بلا انتحال. |
| `flaresolverr` | يمرر عبر متصفح FlareSolverr بلا واجهة يحل تحدي JavaScript — بيانات **حيّة**. |
| `wayback` | يقرأ أحدث لقطة من Internet Archive — قديمة، لكنها لا تتطلب شيئًا. |

الافتراضي، `curl_cffi`، هو المكسب الرخيص. معظم أحكام "أنت روبوت" هي عدم تطابق في
بصمة TLS: فـ `requests` القياسي (عبر OpenSSL) يجري مصافحة لا تشبه Chrome في شيء.
ينتحل `curl_cffi` نسخة Chrome حقيقية (`impersonate="chrome"` افتراضيًا)، فتتوافق
المصافحة وبصمة JA3 ويمر الفحص ببساطة. لا يُنفَّذ أي JavaScript، ولا يُطلَق أي متصفح.

عندما يتصعّد موقع إلى تحدٍّ تفاعلي حقيقي من JavaScript، لا يكفي `curl_cffi` —
فلا بد لشيء ما أن يشغّل التحدي. هنا يأتي وضع `flaresolverr`: نسخة من
[FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) تستضيفها بنفسك تتولى
الحل في متصفح بلا واجهة **خارج عمليتك**، ويكتفي `unblock_requests` بإجراء POST
إليها واستخراج الـ HTML المحلول من الاستجابة. يؤدي تعيين `flaresolverr_url` إلى
اختيار هذا الوضع تلقائيًا:

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## التدهور الرشيق نحو الأرشيف

للبنية التحتية أيام سيئة — فـ FlareSolverr معطل، والموقع غير قابل للوصول، والتحدي
غير قابل للحل في هذه اللحظة. فبدلًا من إفشال المهمة كلها، يمكن للجلسة أن ترجع إلى
**Wayback Machine**. كشف التحديات استدلالي: أداة مساعدة صغيرة `is_challenge()`
تشمّ الجزء الأول من الجسم بحثًا عن العلامات الدالة على صفحة اعتراضية من Cloudflare
("just a moment"، و`challenge-platform`، و`cf_chl_opt`، و`cf-mitigated`). عند
حدوث GET محظور، إذا كان `wayback_fallback` مفعّلًا، تحل الجلسة أحدث لقطة عبر واجهة
برمجة توفّر `archive.org` وتُرجع بايتاتها الخام (الصيغة الخام `…id_/`، دون شريط
أدوات أو إعادة كتابة للروابط). موقع archive.org ليس محميًا بـ Cloudflare، لذا
يصل إليه `requests` البسيط.

ملاحظتان تنفيذيتان جديرتان بالمعرفة: في وضعي `wayback` و`flaresolverr` تكون
النتيجة `requests.Response` *مُصطنَعة* لكنها حقيقية مبنية من الـ HTML المُجلَب —
لذا لا تنطبق هناك `stream=` أو المحوّلات المخصصة أو تجميع الاتصالات، بينما وضعا
`requests`/`curl_cffi` أصيلان تمامًا. كما أن الرجوع لا ينطلق إلا مع طلبات GET؛
فنحن لا نعيد أبدًا وبصمت تشغيل طلب مُعدِّل من أرشيف.

## الطبقة الثانية: `anon_requests` وتدوير عناوين IP

المشكلة المتعامدة هي **سمعة عنوان IP**. حتى البصمة المثالية تتعرض لتقييد المعدل أو
الحظر إذا جاءت كل الطلبات من عنوان واحد. يعالج `anon_requests` ذلك عبر
`RotatingProxySession` (وكلاء عامون مُستخرَجون، تحقق اختياري، SOCKS5/HTTP)
و`RotatingTorSession` (دوائر Tor دوّارة). يخرج كل طلب عبر مخرج جديد، وتُزال
الوكلاء الميتة بالتدوير عند فشل الاتصال.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## التركيب: التدوير **و** التجاوز في آنٍ واحد

صُمّمت هاتان المكتبتان لتتراكما لا لتتداخلا. تقبل جلسات `anon_requests` وسيط
`session_factory` — أي عنصر قابل للاستدعاء يُرجع `requests.Session`، بقيمة
افتراضية `requests.Session`. وتُطبَّق إعدادات التدوير والوكيل على أي شيء تُرجعه
تلك المصنعية. فتحقن `CloudflareSession` بوصفها المصنعية وتحصل على كلا السلوكين من
كائن واحد:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates the IP *and* solves Cloudflare
```

يتدفق الوكيل المُدوَّر عبر *كل* وسائل النقل — بما في ذلك إلى داخل FlareSolverr،
الذي يقود متصفحه بلا واجهة عبر حقل `proxy` في طلب الحل. وهكذا فإن عنوان IP الذي
يحل التحدي هو نفسه عنوان IP المُدوَّر الذي يستخدمه بقية الطلب: دون انفصال بين
البصمة وعقدة المخرج يمكن لمدافعٍ أن يلاحظه.

## لماذا هذا الشكل

الإبقاء على كل شأن في فئته الفرعية الرفيعة الخاصة به من `requests.Session` يعني أن
المستدعي يختار فقط ما يحتاجه — انتحال TLS وحده، أو الحزمة الكاملة للتدوير مع الحل،
أو أي شيء بينهما — عبر تبديل مُنشئ، لا عبر إعادة كتابة شيفرة HTTP الخاصة به. أما
الأداة الباهظة والثقيلة (متصفح حقيقي) فتبقى *خارج العملية* في FlareSolverr ولا
تُستدعى إلا حين يتطلبها تحدي JavaScript فعلًا؛ والحالة الشائعة هي مصافحة منتحَلة
رخيصة. وحين يرفض الويب الحي، يجيب الأرشيف.

نقطة التمفصل `session_factory` هي حيث يحدث التركيب، وهي ما يبقي المكتبتين قابلتين
للتوسيع بشكل مستقل: أضِف وضع نقل إلى `unblock_requests` فيركّبه `anon_requests`
مجانًا. وصول مرن إلى البيانات العامة، مُنجَز بشكل نظيف.

كلتاهما برمجيات حرة مفتوحة المصدر وقابلة للاستضافة الذاتية:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) و
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

تُشغّل وسائل النقل هذه جميع **[كاشطات قواعد بيانات الموسيقى](/ar/blog/2026-04-20-music-database-scrapers)** لدينا. لاستطلاع موقع قبل بناء أي كاشطة، انظر **[sitemapper](https://github.com/TigreGotico/sitemapper)** و**[مقالة robots.txt وخرائط المواقع](/ar/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**.
