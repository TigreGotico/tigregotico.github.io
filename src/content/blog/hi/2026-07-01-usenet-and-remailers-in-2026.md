---
title: "2026 में Usenet: प्रशिक्षण और मूल्यांकन के लिए एक स्वच्छ, पूर्व-AI टेक्स्ट कॉर्पस"
description: "Usenet पूर्व-AI मानव विमर्श का एक निर्मल अभिलेख है — दशकों की न्यूज़ग्रुप पोस्ट, सब मानव-लिखित, जिनमें से कोई भी भाषा-मॉडल से अछूता। इससे यह भाषा और स्पीच मॉडलों के लिए मूल्यवान प्रशिक्षण और मूल्यांकन डेटा बनता है। हमने इसे बटोरने के लिए एक छोटा Python टूल बनाया है।"
date: 2026-07-01
lang: hi
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

अधिकांश खुले-वेब टेक्स्ट कॉर्पोरा दूषित हैं: LLM-निर्मित पाठ Reddit, Stack Overflow, GitHub, और ब्लॉग्स में रिस चुका है, इसलिए उन पर प्रशिक्षित मॉडल आंशिक रूप से अन्य मॉडलों से सीख रहा होता है। Usenet अलग है। यह दशकों के flame wars, तकनीकी प्रश्नोत्तर, और न्यूज़ग्रुप बहसों का है, सब मानव-लिखित, आज के भाषा मॉडलों से पूरी तरह पूर्ववर्ती। भाषा और स्पीच मॉडलों को प्रशिक्षित या मूल्यांकित करने वाले किसी भी व्यक्ति के लिए, स्वच्छ उद्गम वाला मानव-रचित पाठ का एक बड़ा अभिलेख ठीक वही तरह का डेटा है जो मिलना कठिन होता जा रहा है।

-----

## पूर्व-AI कॉर्पस के रूप में Usenet

Usenet सैकड़ों सक्रिय समूहों में प्रतिदिन हज़ारों पोस्ट प्राप्त करता है। 1980 के दशक तक का अभिलेख लीजिए और आपके पास **लाखों लेख** हैं — हर एक इस बात का संकेत कि मनुष्य वास्तव में किसकी परवाह करते थे, किस पर बहस करते थे, क्या जानना चाहते थे — इतने स्वच्छ उद्गम के साथ कि उद्धृत किया जा सके।

हमने **usenet** नाम का एक टूल बनाया जो इसे बटोरना सीधा-सादा बना देता है:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

अधिकांश सार्वजनिक सर्वर अब `NEWNEWS` (तिथि के अनुसार क्वेरी) का समर्थन नहीं करते, इसलिए **समूह-आधारित ब्राउज़िंग मानक तरीक़ा है।** आप एक बार में एक समूह स्क्रेप करते हैं — यह कोई बाधा नहीं, बस प्रोटोकॉल की वास्तविकता है।

किसी न्यूज़ग्रुप को प्रशिक्षण डेटासेट में बदलने के लिए, `dataset.py` लेखों को JSONL में बटोरता है:

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

प्रति पंक्ति एक लेख। कुछ हज़ार ऐसे लेख Hugging Face पर धकेलिए और आपके पास एक **सार्वजनिक रूप से उपलब्ध, मानव-रचित, उद्गम-स्वच्छ डेटासेट** है जिसे आप उद्धृत और पुनःप्रकाशित कर सकते हैं।

Repo: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## बिना किसी अकाउंट के Usenet पढ़ना

अधिकांश सार्वजनिक न्यूज़ सर्वर बिना पंजीकरण के पढ़ने देते हैं:

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

## यह क्यों मायने रखता है

Usenet बड़े पैमाने पर मानव-रचित पाठ का एक उद्गम-स्वच्छ अभिलेख है, जो मशीन-निर्मित सामग्री के युग से पहले का है। चाहे आप मॉडल प्रशिक्षित कर रहे हों, डेटासेट बना रहे हों, या AI-निर्मित पाठ से पतला होने से पहले के इंटरनेट विमर्श का अध्ययन कर रहे हों, वह अभिलेख अब भी वहाँ है और अब भी बढ़ रहा है।

**रिपॉज़िटरी:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Usenet को प्रशिक्षण डेटासेट में बटोरें; बिना किसी अकाउंट के सार्वजनिक रूप से पढ़ें।
