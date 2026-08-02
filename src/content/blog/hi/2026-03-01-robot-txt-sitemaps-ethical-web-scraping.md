---
title: "Robots.txt, साइटमैप्स, और नैतिक वेब स्क्रैपिंग"
description: "स्क्रैपर बनाने से पहले, साइट की टोह लें। sitemapper robots.txt पढ़ता है, हर साइटमैप लाता है, और वैकल्पिक रूप से लिंक ग्राफ़ को क्रॉल करता है — ताकि आपका स्क्रैपर क्रूर बल के बजाय साइट के अपने अनुबंध से शुरू हो।"
date: 2026-03-01
updated: 2026-08-01
lang: hi
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

## क्रूर बल से नहीं, टोह लेने से शुरू करें

सबसे खराब स्क्रैपर आँख मूँदकर क्रॉल करते हैं। वे एक साइट पर प्रहार करते हैं, crawl-delay
घोषणाओं की अनदेखी करते हैं, डेटा की तलाश में हर पथ को झकझोरते हैं, और जब संरचना
एक ही क्लास नाम से बदलती है तो टूट जाते हैं। सबसे अच्छे स्क्रैपर साइट को पढ़ने से शुरू करते हैं।

हर वेबसाइट तीन जगहों पर एक अनुबंध प्रकाशित करती है: **robots.txt** (क्रॉल
नीति), **साइटमैप्स** (साइट स्वयं जिसे अनुक्रमण योग्य मानती है), और
**लिंक ग्राफ़** (पृष्ठ वास्तव में एक-दूसरे से कैसे जुड़े हैं)। इन्हें पहले पढ़ना
स्क्रैपिंग कोड की एक भी पंक्ति लिखने से पहले तीन प्रश्नों का उत्तर देता है:

1. **क्या यह साइट स्क्रैप करने योग्य है?** robots.txt क्या अनुमति देता है, और किस गति से?
2. **डेटा कहाँ है?** साइटमैप्स क्या सामने लाते हैं?
3. **साइट कैसे संरचित है?** लिंक टोपोलॉजी कैसी दिखती है?

यही वह है जो **[sitemapper](https://github.com/TigreGotico/sitemapper)** करता है।

## निष्क्रिय खोज: robots.txt + साइटमैप्स

`discover()` robots.txt और हर साइटमैप को लाता है जिसे वह पा सकता है — जिसमें
`Sitemap:` निर्देश, साइटमैप इंडेक्स जो सब-साइटमैप्स की ओर इंगित करते हैं, और gzipped
फ़ाइलें शामिल हैं — बिना एक भी HTML पृष्ठ क्रॉल किए:

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

प्रति-एजेंट विवरण तब मौजूद होता है जब आपको इसकी आवश्यकता होती है: `info.robots.groups` प्रत्येक
`User-agent` ब्लॉक को उसके `allows`, `disallows`, और `crawl_delay` के साथ, दस्तावेज़
क्रम में रखता है। यदि किसी साइट के पास बिल्कुल भी robots.txt नहीं है, तो `is_allowed()` हर चीज़ के लिए
`True` लौटाता है — नीति की अनुपस्थिति ही स्वयं में नीति है।

साइटमैप-फ़र्स्ट स्क्रैपिंग का लाभ: क्रॉलिंग द्वारा URL खोजने के बजाय
(धीमा, शोरगुल भरा, अधूरा), आप रखरखावकर्ताओं की अपनी सूची से शुरू करते हैं। आप वही स्क्रैप करते हैं
जो साइट महत्वपूर्ण घोषित करती है, उसी गति से जिसे वह स्वीकार्य घोषित करती है, अनुरोधों के एक
अंश में।

## सक्रिय खोज: लिंक ग्राफ़

कुछ साइटें कोई साइटमैप प्रकाशित नहीं करतीं। उनके लिए, `crawl()` बेस URL से एक बंधा हुआ
चौड़ाई-पहले क्रॉल चलाता है और आंतरिक पृष्ठों और बाहर जाने वाले लिंक का एक `LinkGraph`
लौटाता है:

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

यह आपको वास्तविक टोपोलॉजी बताता है — कौन से पृष्ठ किससे लिंक करते हैं — ताकि आप
तय कर सकें कि साइट एक संरचित स्क्रैपर के लायक है या नहीं। खोज और
क्रॉलिंग जानबूझकर अलग कॉल हैं: निष्क्रिय चरण कभी HTML नहीं लाता,
इसलिए आप क्रॉल करने का निर्णय लेने से पहले हमेशा विनम्रता से टोह ले सकते हैं।

## उसी लचीले ट्रांसपोर्ट पर निर्मित

साइट टोह लेना व्यर्थ है यदि टोह लेना ही बॉट-वॉल्ड हो जाए। sitemapper का
सारा HTTP [`unblock_requests`](https://github.com/TigreGotico/unblock_requests) — हमारी
**[एंटी-बॉट ट्रांसपोर्ट पोस्ट](/hi/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** का TLS-इम्पर्सोनेटिंग ट्रांसपोर्ट —
से होकर गुज़रता है, इसलिए robots.txt और साइटमैप्स Cloudflare-फ़्रंटेड साइटों पर भी वापस आते हैं। एक
FlareSolverr इंस्टेंस या Wayback Machine फ़ॉलबैक को पर्यावरण चर
(`SITEMAPPER_FLARESOLVERR_URL`, `SITEMAPPER_WAYBACK_FALLBACK=1`) से या
`Sitemapper` क्लास के माध्यम से सक्षम किया जा सकता है।

## यह क्यों मायने रखता है

**Crawl delay**: एक साइट जो `Crawl-delay: 2` घोषित करती है वह आपको बता रही है कि कितनी तेज़ी से
इसे हिट किया जाए। इसकी अनदेखी करें और आप ब्लॉक हो जाते हैं — या आप साइट को सभी के लिए
खराब कर देते हैं। इसका सम्मान करें और आपका स्क्रैपर निष्पक्ष खेलता है।

**क्रॉलिंग पर साइटमैप्स**: एक साइटमैप सूचीबद्ध करता है कि साइट क्या अनुक्रमित कराना चाहती है। आँख मूँदकर
लिंक-क्रॉलिंग वही सामग्री खोजने के लिए पाँच गुना अधिक URL छू सकती है।
जब कोई मौजूद हो तो साइटमैप से शुरू करें; यह आपके लिए तेज़ और सर्वर पर हल्का है।

**कोड से पहले दायरा**: कुछ साइटें robots.txt में स्क्रैपिंग को पूरी तरह मना करती हैं; कुछ के
पास ऐसे साइटमैप्स होते हैं जिनमें पहले से ही वह सब कुछ होता है जो आपको चाहिए। `discover()` के दस
सेकंड आपको बताते हैं कि आप कौन-सी स्थिति में हैं इससे पहले कि आप एक पार्सर में निवेश करें।

## उपकरण

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

इसे एक लाइब्रेरी के रूप में उपयोग करें, या कमांड लाइन से — `--json FILE` अन्य टूल्स के उपभोग के लिए
पूरी खोज को एक फ़ाइल में लिखता है, `--crawl` लिंक-ग्राफ़ चरण जोड़ता है:

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json out.json
```

यह मुक्त सॉफ़्टवेयर है और आपके अपने हार्डवेयर पर चलता है। हर स्क्रैपर की शुरुआत
टोह लेने से करें।
