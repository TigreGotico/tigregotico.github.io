---
title: "2026 में Usenet और Remailers: एक स्वच्छ टाइम कैप्सूल और एक ऐसा प्राइवेसी नेटवर्क जो मरने से इनकार करता है"
description: "Usenet पूर्व-AI मानव विमर्श का एक निर्मल अभिलेख है — इंटरनेट इतिहास के दशकों का LLM-मुक्त प्रशिक्षण डेटा। पर यह केवल पुरातत्व नहीं है: cypherpunk remailer नेटवर्क 2026 में भी काम करता है, वास्तविक गुमनाम संदेश-व्यवहार प्रदान करता है। दोनों दिखाने के लिए हमने दो छोटे टूल बनाए हैं।"
date: 2026-07-01
lang: hi
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

अधिकांश खुले-वेब कॉर्पोरा दूषित हैं — LLM-निर्मित पाठ Reddit, Stack Overflow, GitHub, ब्लॉग्स में रिस चुका है। Usenet अलग है: दशकों के flame wars, तकनीकी प्रश्नोत्तर, और न्यूज़ग्रुप बहसें, सब मानव-लिखित, जिनमें से कोई भी भाषा-मॉडल से अछूता। और इसे खँगालते हुए मुझे कुछ और भी चलता हुआ मिला: **cypherpunk remailer नेटवर्क 2026 में भी काम करता है**, जिसे क्रिप्टोग्राफ़ी के प्रति उत्साही एक छोटे समूह ने संभाला हुआ है जिसने कभी हार नहीं मानी।

हमने दोनों के लिए दो छोटे Python टूल बनाए।

-----

## टाइम कैप्सूल: पूर्व-AI कॉर्पस के रूप में Usenet

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

## Cypherpunks कभी गए ही नहीं

remailer नेटवर्क अब भी चल रहा है।

**Type-I remailers** (Cypherpunk remailers): नेस्टेड PGP एन्क्रिप्शन में लिपटा एक संदेश भेजें — हर हॉप एक परत डिक्रिप्ट करता है और अगले को अग्रेषित करता है। बाहर से, संदेश remailer से आता प्रतीत होता है, आपसे नहीं। अंतिम हॉप तक मूल प्रेषक खो जाता है।

**Type-II remailers** (Mixmaster): यादृच्छिक पैडिंग जोड़ते हैं, हेडर हटाते हैं, अग्रेषित करने से पहले संदेश रोकते हैं, और एक साथ कई remailers से होकर चेन बनाते हैं। खोज निकालना कहीं अधिक कठिन।

दोनों अब भी काम करते हैं। 2026 में **करीब आधा दर्जन सक्रिय remailers** हैं। pinger नेटवर्क प्रतिदिन के आँकड़े `alt.privacy.anon-server.stats` पर पोस्ट करता है, वैसे ही जैसे दशकों से करता आया है। मई 2026 के अनुसार:

- **frannie** (mix@franxial.com) — 100% अपटाइम
- **frell** (godot@remailer.frell.eu.org) — 100% अपटाइम
- **yeahno** (mix@yeahno.net) — 100% अपटाइम
- **dizum** (remailer@dizum.com) — ~99% अपटाइम
- **paranoia** (mixmaster@remailer.paranoici.org) — ~92% अपटाइम

**remailers** लाइब्रेरी उन्हीं प्रतिदिन के आँकड़े पोस्ट को पार्स करके जीवित नेटवर्क खोजती है:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## इन्हें आज इस्तेमाल करना

### बिना किसी अकाउंट के Usenet पढ़ें

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

### गुमनाम रूप से पोस्ट करें

अधिकांश सर्वरों को पोस्ट करने के लिए एक मुफ़्त अकाउंट चाहिए। **paganini.bofh.team** और **news.tcpreset.net** गुमनाम पोस्ट स्वीकार करते हैं, जिसमें `alt.anonymous.messages` भी शामिल है — गुमनाम प्राप्तकर्ताओं के लिए पारंपरिक ड्रॉप।

### remailer चेन के ज़रिए एक गुमनाम संदेश भेजें

remailers अब भी 1990 के दशक की **DSA + ElGamal PGP कुंजियाँ** इस्तेमाल करते हैं — पुरानी क्रिप्टो जिसकी ओर आधुनिक Python PGP लाइब्रेरियाँ एन्क्रिप्ट नहीं कर सकतीं। हम **GnuPG** पर शेल-आउट करते हैं (पुराना कोड भार-वहन करता है):

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

### उत्तर खोजना: हैश किए गए विषय

अगर आप `alt.anonymous.messages` पर उत्तर की प्रतीक्षा कर रहे हैं, तो आप नहीं चाहते कि विषय सामग्री उजागर करे। remailer प्रोटोकॉल **hSub** का समर्थन करता है: प्राप्तकर्ता मूल विषय को SHA-256 से हैश करता है और उस हैश को विषय के रूप में लगाकर उत्तर पोस्ट करता है। केवल वही व्यक्ति जो मूल विषय जानता है, उसे इस बौछार में पहचान सकता है।

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

अधिक गोपनीयता के लिए, कुछ संदेश **eSub** इस्तेमाल करते हैं — एन्क्रिप्टेड विषय जिन्हें केवल प्राप्तकर्ता डिक्रिप्ट कर सकता है।

-----

## यह अब भी क्यों मायने रखता है

remailer नेटवर्क धीमा है और एक अलग युग के लिए बना है। पर यह **विकेंद्रीकृत, स्वामी-रहित, और बंद न किया जा सकने वाला** है — कोई कंपनी नहीं जिसे सम्मन भेजा जाए, कोई सेवा नहीं जिसे बंद किया जाए। वही cypherpunk डिज़ाइन जो 1995 में काम करता था, आज भी काम करता है।

Usenet दुर्लभतर इनाम है: बड़े पैमाने पर मानव-रचित पाठ का एक उद्गम-स्वच्छ अभिलेख। चाहे आप मॉडल प्रशिक्षित कर रहे हों, डेटासेट बना रहे हों, या वास्तविक इंटरनेट विमर्श का अध्ययन कर रहे हों, Usenet वहाँ है — स्वच्छ, अदूषित, मुफ़्त।

**रिपॉज़िटरीज़:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Usenet को प्रशिक्षण डेटासेट में बटोरें; बिना किसी अकाउंट के सार्वजनिक रूप से पढ़ें।
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — जीवित remailers खोजें, गुमनाम चेन बनाएँ, Cypherpunk Type-I के ज़रिए भेजें।
