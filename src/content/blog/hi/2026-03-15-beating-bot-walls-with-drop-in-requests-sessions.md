---
title: "ड्रॉप-इन, कंपोज़ेबल requests सेशन्स से बॉट-दीवारों को मात देना"
description: "हॉट पाथ में हेडलेस ब्राउज़र चलाए बिना हम सार्वजनिक डेटा तक सुदृढ़ पहुँच कैसे बनाए रखते हैं: TLS फ़िंगरप्रिंट इम्पर्सनेशन, JS चैलेंज के लिए एक FlareSolverr प्रॉक्सी, एक Wayback Machine फ़ॉलबैक, और IP रोटेशन — सब कुछ दो कंपोज़ेबल requests.Session सबक्लासेस, unblock_requests और anon_requests, के पीछे।"
date: 2026-03-15
lang: hi
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

हमारे बहुत से काम — मीडिया-मेटाडेटा क्लाइंट्स, कैटलॉग संवर्धन, अभिलेखन —
**सार्वजनिक** वेब पेजों को भरोसेमंद ढंग से पढ़ने पर निर्भर करते हैं। समस्या शायद ही
कभी डेटा होती है; समस्या उसके सामने खड़ी दीवार होती है। और वह दीवार दो अलग-अलग सवाल
पूछती है:

- **"तुम क्या हो?"** — Cloudflare और उसके जैसे टूल्स अनुरोधों को इसलिए ब्लॉक नहीं करते
  कि आप *क्या* माँग रहे हैं, बल्कि इसलिए कि तार पर आप *कैसे* दिखते हैं: आपका TLS
  हैंडशेक, आपका JA3 फ़िंगरप्रिंट, क्या आप कोई JavaScript चैलेंज चला सकते हैं।
- **"तुम कौन हो?"** — IP प्रतिष्ठा और रेट लिमिट्स आपके फ़िंगरप्रिंट की परवाह ही नहीं
  करतीं; वे बस गिनती हैं कि एक ही पते से कितने अनुरोध आते हैं।

दोनों सवाल आपस में स्वतंत्र (ऑर्थोगोनल) हैं, इसलिए हम उनका जवाब दो छोटी लाइब्रेरियों से
देते हैं जो साफ़-सुथरे ढंग से एक-दूसरे पर टिकती हैं: **unblock_requests** *तुम क्या हो*
का जवाब देती है, **anon_requests** *तुम कौन हो* का जवाब देती है। दोनों रोज़मर्रा के कोड
में एक `requests` सेशन के लिए ड्रॉप-इन प्रतिस्थापन हैं। यह पोस्ट खासतौर पर उसी ट्रांसपोर्ट
परत के बारे में है — तार पर बहते बाइट्स वाले हिस्से के बारे में — उसके ऊपर बैठे पार्सिंग या
पाइपलाइन के बारे में नहीं।

## डिज़ाइन बंधन: `requests` का आकार बनाए रखना

`unblock_requests` सेशन्स `requests.Session` को सबक्लास करते हैं और केवल `request()` को
ओवरराइड करते हैं — बाकी सब कुछ (`.get()`, `.post()`, कुकीज़, हेडर, कॉन्टेक्स्ट-मैनेजर
सिमेंटिक्स) विरासत में मिलता है, इसलिए `requests.Session` के विरुद्ध टाइप की गई कोई भी चीज़
उन्हें बिना बदलाव स्वीकार कर लेती है। `anon_requests` सेशन्स सबक्लास करने के बजाय रैप करते
हैं — वे वही verb मेथड्स और कॉन्टेक्स्ट-मैनेजर इंटरफ़ेस उजागर करते हैं, पर हर रोटेशन पर अपने
भीतरी सेशन को दोबारा बनाते हैं:

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

पूरा नैतिक और इंजीनियरिंग रुख एक ही पंक्ति में यही है: हम किसी ब्राउज़र-को-यूज़र-की-तरह
स्वचालित नहीं कर रहे, हम पहले से सार्वजनिक डेटा के लिए एक *सुदृढ़ HTTP क्लाइंट* बना रहे
हैं। किसी की स्क्रीन पर कोई हेडेड ब्राउज़र नहीं खुलता, और हॉट पाथ में किसी भी चीज़ को डिस्प्ले
की ज़रूरत नहीं।

## परत एक: `unblock_requests` और उसके ट्रांसपोर्ट्स

`unblock_requests` **बॉट डिटेक्शन** के विरुद्ध बचाव करती है। आप `mode=` kwarg (या
`UNBLOCK_REQUESTS_TRANSPORT` env वेरिएबल — स्पष्ट kwargs हमेशा जीतते हैं) से एक ट्रांसपोर्ट
चुनते हैं। मुख्य चार:

| Mode | यह क्या करता है |
|---|---|
| `curl_cffi` *(डिफ़ॉल्ट)* | `curl_cffi` के ज़रिए Chrome TLS/JA3 इम्पर्सनेशन। बिना किसी अतिरिक्त इन्फ़्रा के अधिकांश नेटवर्कों पर बॉट जाँच पार कर लेता है। |
| `requests` | सादा `requests`, कोई इम्पर्सनेशन नहीं। |
| `flaresolverr` | एक FlareSolverr हेडलेस ब्राउज़र के ज़रिए प्रॉक्सी करता है जो JS चैलेंज हल करता है — **लाइव** डेटा। |
| `wayback` | नवीनतम Internet Archive स्नैपशॉट पढ़ता है — पुराना, पर कुछ नहीं चाहिए। |

डिफ़ॉल्ट, `curl_cffi`, सस्ती जीत है। अधिकांश "आप एक बॉट हैं" वाले फ़ैसले एक TLS-फ़िंगरप्रिंट
बेमेल होते हैं: स्टॉक `requests` (OpenSSL के ज़रिए) का हैंडशेक Chrome से बिलकुल नहीं मिलता।
`curl_cffi` एक असली Chrome बिल्ड की नकल करता है (डिफ़ॉल्ट रूप से `impersonate="chrome"`),
इसलिए हैंडशेक और JA3 आपस में मेल खाते हैं और जाँच बस पास हो जाती है। कोई JavaScript नहीं
चला, कोई ब्राउज़र लॉन्च नहीं हुआ।

जब कोई साइट सचमुच के इंटरैक्टिव JS चैलेंज तक बढ़ती है, तो `curl_cffi` काफ़ी नहीं — किसी को
चैलेंज चलाना ही होगा। यही `flaresolverr` मोड है: आपकी स्वयं-होस्ट की गई एक
[FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) इंस्टेंस एक हेडलेस ब्राउज़र
में **आपकी प्रोसेस के बाहर** हल करती है, और `unblock_requests` बस उसे POST करती है और
प्रतिक्रिया से हल किया गया HTML उठा लेती है। `flaresolverr_url` सेट करना यह मोड अपने-आप
चुन लेता है:

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## अभिलेख की ओर सुगम अवनति (graceful degradation)

इन्फ़्रास्ट्रक्चर के बुरे दिन भी आते हैं — FlareSolverr बंद है, साइट तक नहीं पहुँचा जा सकता,
चैलेंज अभी हल नहीं हो सकता। पूरे काम को विफल करने के बजाय, सेशन **Wayback Machine** पर
फ़ॉलबैक कर सकता है। चैलेंज डिटेक्शन ह्यूरिस्टिक है: एक छोटा `is_challenge()` हेल्पर बॉडी के
पहले हिस्से में Cloudflare इंटरस्टिशियल के जाने-पहचाने संकेत सूँघता है ("just a moment",
`challenge-platform`, `cf_chl_opt`, `cf-mitigated`)। किसी ब्लॉक हो चुके GET पर, अगर
`wayback_fallback` चालू है, तो सेशन `archive.org` के availability API के ज़रिए नवीनतम
स्नैपशॉट सुलझाता है और उसके कच्चे बाइट्स लौटाता है (`…id_/` कच्चा रूप, बिना टूलबार या लिंक
पुनर्लेखन के)। archive.org Cloudflare-गेटेड नहीं है, इसलिए सादा `requests` उस तक पहुँच
जाता है।

दो जानने योग्य कार्यान्वयन-टिप्पणियाँ: `wayback` और `flaresolverr` मोड में परिणाम एक
*संश्लेषित* पर असली `requests.Response` होता है जो लाए गए HTML से बना होता है — इसलिए
`stream=`, कस्टम अडैप्टर और कनेक्शन पूलिंग वहाँ लागू नहीं होते, जबकि `requests`/`curl_cffi`
मोड पूरी तरह मूल (नेटिव) हैं। और फ़ॉलबैक सिर्फ़ GETs के लिए चलता है; हम किसी अभिलेख से किसी
म्यूटेटिंग अनुरोध को कभी चुपचाप दोबारा नहीं चलाते।

## परत दो: `anon_requests` और IP रोटेशन

इससे स्वतंत्र समस्या है **IP प्रतिष्ठा**। बिलकुल सटीक फ़िंगरप्रिंट भी रेट-लिमिट या बैन हो
जाता है अगर हर अनुरोध एक ही पते से आए। `anon_requests` इसे `RotatingProxySession`
(स्क्रेप किए गए सार्वजनिक प्रॉक्सी, वैकल्पिक सत्यापन, SOCKS5/HTTP) और `RotatingTorSession`
(घूमते Tor सर्किट) से संभालती है। हर अनुरोध एक नए एग्ज़िट से बाहर जाता है, और कनेक्शन विफलता
पर मरे हुए प्रॉक्सी हटा दिए जाते हैं।

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## संयोजन: रोटेशन **और** बायपास, दोनों एक साथ

ये दोनों लाइब्रेरियाँ आपस में ओवरलैप करने के बजाय एक-दूसरे पर टिकने के लिए बनाई गई हैं।
`anon_requests` सेशन्स एक `session_factory` स्वीकार करते हैं — कोई भी callable जो एक
`requests.Session` लौटाए, जिसका डिफ़ॉल्ट `requests.Session` है। रोटेशन और प्रॉक्सी सेटिंग्स
उस फ़ैक्टरी के लौटाए गए किसी भी परिणाम पर लागू होती हैं। तो आप फ़ैक्टरी के रूप में एक
`CloudflareSession` इंजेक्ट करते हैं और एक ही ऑब्जेक्ट से दोनों व्यवहार पा जाते हैं:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates the IP *and* solves Cloudflare
```

घूमता हुआ प्रॉक्सी *हर* ट्रांसपोर्ट से होकर बहता है — जिसमें FlareSolverr भी शामिल है, जो
solve अनुरोध के `proxy` फ़ील्ड के ज़रिए अपने हेडलेस ब्राउज़र को चलाता है। तो जो IP चैलेंज हल
करता है वही घूमता हुआ IP शेष अनुरोध भी इस्तेमाल करता है: किसी बचावकर्ता के देखने के लिए कोई
फ़िंगरप्रिंट/एग्ज़िट-नोड विभाजन नहीं।

## यही आकार क्यों

हर चिंता को उसका अपना पतला `requests.Session` सबक्लास रखने का मतलब है कि कॉलर सिर्फ़ वही
चुनते हैं जो उन्हें चाहिए — अकेला TLS इम्पर्सनेशन, पूरा रोटेशन-और-solve स्टैक, या बीच का कुछ
भी — और यह एक कंस्ट्रक्टर बदलकर होता है, अपना HTTP कोड दोबारा लिखकर नहीं। महँगा, भारी टूल
(एक असली ब्राउज़र) FlareSolverr में *प्रोसेस के बाहर* रहता है और तभी बुलाया जाता है जब कोई
JS चैलेंज सचमुच उसकी माँग करे; आम स्थिति एक सस्ता इम्पर्सनेटेड हैंडशेक है। और जब लाइव वेब मना
कर दे, तो अभिलेख जवाब देता है।

`session_factory` वाला जोड़ ही वह जगह है जहाँ संयोजन होता है, और यह लाइब्रेरियों को स्वतंत्र
रूप से विस्तार-योग्य रखता है: `unblock_requests` में एक ट्रांसपोर्ट मोड जोड़िए और
`anon_requests` उसे मुफ़्त में कंपोज़ कर लेती है। सार्वजनिक डेटा तक सुदृढ़ पहुँच, साफ़-सुथरे
ढंग से।

दोनों FOSS और स्वयं-होस्ट-योग्य हैं:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) और
[`anon_requests`](https://github.com/TigreGotico/anon_requests)।

ये ट्रांसपोर्ट हमारे सभी **[म्यूज़िक डेटाबेस स्क्रेपर्स](/hi/blog/2026-04-20-music-database-scrapers)** को शक्ति देते हैं। कोई भी स्क्रेपर बनाने से पहले साइट रेकी के लिए, देखें **[sitemapper](https://github.com/TigreGotico/sitemapper)** और **[robots.txt और sitemaps वाली पोस्ट](/hi/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**।
