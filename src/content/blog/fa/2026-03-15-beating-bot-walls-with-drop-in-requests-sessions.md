---
title: "عبور از دیوارهای ربات با نشست‌های ترکیب‌پذیر و جایگزینِ مستقیمِ requests"
description: "چگونه بدون راه‌اندازی یک مرورگر بدون‌سر در مسیر داغ، دسترسی تاب‌آور به داده‌های عمومی را حفظ می‌کنیم: جعل اثرانگشت TLS، یک پروکسی FlareSolverr برای چالش‌های JS، سازوکار پشتیبانِ Wayback Machine و چرخش IP — همه پشت دو زیرکلاسِ ترکیب‌پذیرِ requests.Session، یعنی unblock_requests و anon_requests."
date: 2026-03-15
lang: fa
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

بخش بزرگی از کار ما — کلاینت‌های فراداده‌ی رسانه، غنی‌سازی فهرست، بایگانی — به
خواندنِ قابل‌اتکای صفحه‌های **عمومی** وب وابسته است. مشکل به‌ندرت خودِ داده است؛
مشکل دیواری است که پیش روی آن قرار دارد. و آن دیوار دو پرسش جداگانه می‌پرسد:

- **«تو چه هستی؟»** — Cloudflare و همتایانش درخواست‌ها را نه به‌خاطر *آنچه*
  می‌پرسید بلکه به‌خاطر *چگونگیِ نمودِ شما روی سیم* مسدود می‌کنند: دست‌دادنِ TLS
  شما، اثرانگشت JA3 شما، و اینکه آیا می‌توانید یک چالش جاوااسکریپت را اجرا کنید.
- **«تو که هستی؟»** — اعتبار IP و محدودیت‌های نرخ، اثرانگشت شما را کاملاً نادیده
  می‌گیرند؛ آن‌ها می‌شمارند که چند درخواست از یک نشانی می‌آید.

این دو پرسش متعامد هستند، پس با دو کتابخانه‌ی کوچک که به‌تمیزی روی هم می‌نشینند به
آن‌ها پاسخ می‌دهیم: **unblock_requests** به *تو چه هستی* پاسخ می‌دهد،
**anon_requests** به *تو که هستی*. هر دو در کدِ روزمره جایگزین‌های مستقیمِ یک نشستِ
`requests` هستند. این نوشته به‌طور مشخص درباره‌ی همان لایه‌ی انتقال است — بخشِ
بایت‌ها-روی-سیم — نه تجزیه یا خط لوله‌ای که بر فراز آن قرار دارد.

## قید طراحی: شکلِ `requests` را حفظ کن

نشست‌های `unblock_requests` زیرکلاسِ `requests.Session` هستند و تنها `request()`
را بازنویسی می‌کنند — هر چیز دیگری (`.get()`، `.post()`، کوکی‌ها، سرآیندها،
معناشناسیِ مدیر زمینه) به ارث می‌رسد، پس هر چیزی که برای `requests.Session`
تایپ شده باشد آن‌ها را بدون تغییر می‌پذیرد. نشست‌های `anon_requests` به‌جای
زیرکلاس‌سازی، دربرمی‌گیرند — همان متدهای فعل و رابطِ مدیر زمینه را نمایان می‌کنند،
اما نشستِ درونی خود را در هر چرخش بازمی‌سازند:

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

این کل نگرش اخلاقی و مهندسی در یک خط است: ما مرورگری را به‌جای کاربر خودکار
نمی‌کنیم، بلکه یک *کلاینت HTTP تاب‌آور* برای داده‌ای می‌سازیم که پیشاپیش عمومی است.
هیچ مرورگر با پنجره‌ای روی صفحه‌ی کسی ظاهر نمی‌شود، و هیچ چیز در مسیر داغ به نمایشگر
نیاز ندارد.

## لایه‌ی یک: `unblock_requests` و لایه‌های انتقال آن

`unblock_requests` در برابر **تشخیص ربات** دفاع می‌کند. یک لایه‌ی انتقال را با
آرگومان `mode=` انتخاب می‌کنید (یا متغیر محیطی `UNBLOCK_REQUESTS_TRANSPORT` —
آرگومان‌های صریح همیشه برنده‌اند). چهار مورد اصلی:

| Mode | What it does |
|---|---|
| `curl_cffi` *(default)* | Chrome TLS/JA3 impersonation via `curl_cffi`. Clears the bot check on most networks with no extra infra. |
| `requests` | Plain `requests`, no impersonation. |
| `flaresolverr` | Proxies through a FlareSolverr headless browser that solves the JS challenge — **live** data. |
| `wayback` | Reads the latest Internet Archive snapshot — stale, but needs nothing. |

پیش‌فرض، یعنی `curl_cffi`، بردِ ارزان است. بیشتر احکامِ «تو یک ربات هستی» ناشی از
عدم‌تطابق اثرانگشت TLS‌اند: `requests` استاندارد (از راه OpenSSL) دست‌دادنی هیچ
شبیه Chrome ندارد. `curl_cffi` یک بیلد واقعی Chrome را جعل می‌کند (به‌طور پیش‌فرض
`impersonate="chrome"`)، پس دست‌دادن و JA3 هم‌تراز می‌شوند و بررسی به‌سادگی از سر
گذشته می‌شود. نه جاوااسکریپتی اجرا می‌شود و نه مرورگری راه‌اندازی.

هنگامی که سایت به یک چالش تعاملیِ واقعیِ JS تشدید می‌شود، `curl_cffi` کافی نیست —
چیزی باید چالش را اجرا کند. آنجا حالت `flaresolverr` است: یک نمونه‌ی
[FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) که خودتان میزبانی
می‌کنید، حل را در یک مرورگر بدون‌سر **بیرون از فرایند شما** انجام می‌دهد، و
`unblock_requests` تنها به آن POST می‌کند و HTML حل‌شده را از پاسخ بیرون می‌کشد.
تنظیم `flaresolverr_url` این حالت را به‌طور خودکار برمی‌گزیند:

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## افت مطبوعِ عملکرد به سوی بایگانی

زیرساخت روزهای بد دارد — FlareSolverr از دسترس خارج است، سایت غیرقابل‌دسترسی است،
چالش همین حالا حل‌نشدنی است. به‌جای شکست کل کار، نشست می‌تواند به **Wayback Machine**
پناه ببرد. تشخیص چالش اکتشافی است: یک کمک‌کارِ کوچکِ `is_challenge()` بخش نخستِ بدنه
را برای نشانه‌های آشکارِ یک صفحه‌ی میانیِ Cloudflare بو می‌کشد («just a moment»،
`challenge-platform`، `cf_chl_opt`، `cf-mitigated`). در یک GET مسدودشده، اگر
`wayback_fallback` روشن باشد، نشست تازه‌ترین snapshot را از راه API دسترس‌پذیریِ
`archive.org` می‌یابد و بایت‌های خام آن را بازمی‌گرداند (فرمِ خامِ `…id_/`، بدون
نوار ابزار یا بازنویسی پیوند). archive.org پشت Cloudflare نیست، پس `requests`
ساده به آن می‌رسد.

دو نکته‌ی پیاده‌سازیِ ارزشمند برای دانستن: در حالت‌های `wayback` و `flaresolverr`
نتیجه یک `requests.Response` *ترکیب‌شده* اما اصیل است که از HTML دریافت‌شده ساخته
شده — پس `stream=`، آداپتورهای سفارشی و تجمیعِ اتصال آنجا اعمال نمی‌شوند، حال آنکه
حالت‌های `requests`/`curl_cffi` کاملاً بومی‌اند. و سازوکار پشتیبان تنها برای GET ها
به کار می‌افتد؛ ما هرگز یک درخواستِ تغییردهنده را به‌خاموشی از یک بایگانی بازپخش
نمی‌کنیم.

## لایه‌ی دو: `anon_requests` و چرخش IP

مشکلِ متعامد **اعتبار IP** است. حتی یک اثرانگشتِ بی‌نقص نیز اگر هر درخواست از یک
نشانی بیاید، محدودِ نرخ یا مسدود می‌شود. `anon_requests` این را با
`RotatingProxySession` (پروکسی‌های عمومیِ اسکرپ‌شده، اعتبارسنجی اختیاری،
SOCKS5/HTTP) و `RotatingTorSession` (مدارهای چرخشیِ Tor) مدیریت می‌کند. هر درخواست
از میان یک خروجیِ تازه بیرون می‌رود، و پروکسی‌های مرده هنگام شکست اتصال از چرخه
کنار گذاشته می‌شوند.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## ترکیب: چرخش **و** عبور، هم‌زمان

این دو کتابخانه به‌گونه‌ای طراحی شده‌اند که روی هم بنشینند نه آنکه هم‌پوشانی کنند.
نشست‌های `anon_requests` یک `session_factory` را می‌پذیرند — هر فراخوانی‌پذیری که یک
`requests.Session` بازگرداند، با پیش‌فرض `requests.Session`. تنظیمات چرخش و پروکسی
بر هر آنچه آن کارخانه بازمی‌گرداند اعمال می‌شوند. پس یک `CloudflareSession` را
به‌عنوان کارخانه تزریق می‌کنید و هر دو رفتار را از یک شیء می‌گیرید:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates the IP *and* solves Cloudflare
```

پروکسیِ چرخانده‌شده از میان *هر* لایه‌ی انتقال جاری می‌شود — از جمله به درون
FlareSolverr، که مرورگر بدون‌سر خود را از راه فیلد `proxy` درخواستِ حل هدایت
می‌کند. پس همان IP که چالش را حل می‌کند همان IP چرخانده‌شده‌ای است که بقیه‌ی درخواست
به کار می‌برد: هیچ شکافِ اثرانگشت/گره‌ی‌خروجی برای آنکه یک مدافع متوجه شود وجود
ندارد.

## چرا این شکل

نگه‌داشتنِ هر دغدغه به‌صورت زیرکلاسِ باریکِ خودش از `requests.Session` یعنی
فراخوان‌ها تنها آنچه را نیاز دارند برمی‌گزینند — تنها جعل TLS، کلِ پشته‌ی
چرخش‌به‌علاوه‌حل، یا هر چیزی میان این دو — با تعویض یک سازنده، نه با بازنویسی کد
HTTP خود. ابزار گران و سنگین‌وزن (یک مرورگر واقعی) *بیرون از فرایند* در FlareSolverr
می‌ماند و تنها هنگامی احضار می‌شود که یک چالش JS به‌راستی آن را طلب کند؛ حالت رایج
یک دست‌دادنِ جعل‌شده‌ی ارزان است. و هنگامی که وبِ زنده سر باز می‌زند، بایگانی پاسخ
می‌دهد.

درزِ `session_factory` جایی است که ترکیب رخ می‌دهد، و کتابخانه‌ها را مستقلاً
گسترش‌پذیر نگه می‌دارد: یک حالتِ انتقال به `unblock_requests` بیفزایید و
`anon_requests` آن را رایگان ترکیب می‌کند. دسترسی تاب‌آور به داده‌های عمومی، به‌تمیزی
انجام‌شده.

هر دو FOSS و قابل خودمیزبانی‌اند:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) و
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

این لایه‌های انتقال، همه‌ی **[اسکرپرهای پایگاه‌داده‌ی موسیقی ما](/fa/blog/2026-04-20-music-database-scrapers)** را نیرو می‌دهند. برای شناسایی سایت پیش از ساختِ هر اسکرپر، **[sitemapper](https://github.com/TigreGotico/sitemapper)** و **[نوشته‌ی robots.txt و نقشه‌های سایت](/fa/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)** را ببینید.
