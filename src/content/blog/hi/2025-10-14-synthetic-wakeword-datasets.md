---
title: "सिंथेटिक वेकवर्ड डेटासेट: सात असिस्टेंट नाम, एक डिटेक्टर"
description: "हमने सामान्य वॉइस असिस्टेंट नामों के लिए सात सिंथेटिक वेकवर्ड डेटासेट प्रकाशित किए हैं — hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up। एक ऐसा डिटेक्टर प्रशिक्षित करें जो हर जगह काम करे।"
date: 2025-10-14
lang: hi
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Wakewords"
  - "Speech"
  - "Synthetic"
  - "Voice"
  - "FOSS"
draft: false
---

सात असिस्टेंट नाम। सात डेटासेट। सारा ऑडियो पूरी तरह **[phoonnx](https://github.com/TigreGotico/phoonnx)** TTS फ्रेमवर्क से Miro और Dii वॉइस का उपयोग करके तैयार किया गया — कोई मानवीय रिकॉर्डिंग नहीं, कोई सहमति फॉर्म नहीं, कोई गोपनीयता जोखिम नहीं।

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

प्रत्येक डेटासेट लगभग एक हज़ार सकारात्मक क्लिप का एक सपाट संग्रह है — विविध वक्ताओं, गति और प्रोसोडी के साथ बोली गई वेकवर्ड। कठिन नकारात्मक नमूने और पृष्ठभूमि शोर अलग साथी डेटासेट के रूप में उपलब्ध हैं जिन्हें आप प्रशिक्षण के समय मिलाते हैं: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en), [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt), और [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises)।

## सिंथेटिक क्यों

वास्तविक रिकॉर्डिंग के लिए महीनों के संग्रह, हर वक्ता के लिए सहमति फॉर्म की आवश्यकता होती है, और फिर भी उच्चारण संबंधी ऐसी कमियाँ रह जाती हैं जिनका आपने अनुमान नहीं लगाया था। सिंथेटिक जनरेशन इसे उलट देता है:

- **पुनरुत्पादनीय (Reproducible)**: समान जनरेशन सेटिंग्स, समान वॉइस → समान ऑडियो। पूर्ण ऑडिट ट्रेल, कोई सहमति-फॉर्म पुरातत्व नहीं।
- **लेखा-परीक्षा योग्य (Auditable)**: जनरेशन पाइपलाइन ही दस्तावेज़ीकरण है।
- **मापनीय (Scalable)**: बोलने की गति और वक्ता की विशेषताओं को बदलना एक पैरामीटर परिवर्तन है, न कि स्टूडियो सत्र।

वेकवर्ड डिटेक्शन के लिए प्रासंगिक गुण ध्वनिक विशिष्टता है, स्वाभाविकता नहीं। सिंथेटिक डेटा उस आवश्यकता के लिए भली-भाँति उपयुक्त है।

## इन्हें उपयोग करें

OpenVoiceOS, Mycroft, या किसी भी खुले वॉइस सिस्टम के लिए अपना खुद का वेकवर्ड डिटेक्टर प्रशिक्षित करें। नकारात्मक-नमूना संवर्धन के लिए घरेलू और सार्वजनिक-डोमेन पृष्ठभूमि-क्लिप डेटासेट भी उपलब्ध हैं: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs), [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs), और [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs)।

[**HuggingFace पर सभी वेकवर्ड डेटासेट → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
