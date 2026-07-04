---
title: "कोई भाषा पीछे न छूटे"
description: "भाषा पहचान, अनुवाद प्लगइन और द्विदिशात्मक अनुवाद क्षमताओं के माध्यम से OpenVoiceOS में भाषा की बाधाओं को समाप्त करना।"
date: 2023-10-16
lang: hi
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> यह लेख मूल रूप से मेरे (अब बंद हो चुके) व्यक्तिगत ब्लॉग पर प्रकाशित हुआ था

OpenVoiceOS (OVOS) एक समुदाय-संचालित, ओपन-सोर्स वॉइस असिस्टेंट प्लेटफ़ॉर्म है। यह लेख उन भाषा पहचान, अनुवाद और द्विदिशात्मक अनुवाद प्लगइनों को कवर करता है जिन्हें मैंने OVOS को उन भाषाओं में काम करने योग्य बनाने के लिए बनाया था, जो इंस्टॉल की गई skills द्वारा मूल रूप से समर्थित भाषाओं से कहीं आगे हैं।


## ऑडियो से भाषा पहचान

OVOS ऑडियो में बोली जाने वाली भाषा की पहचान ASR ट्रांसक्रिप्शन चरण तक पहुँचने से पहले कर लेता है, जिससे ASR प्लगइन अनुमान लगाने के बजाय सटीक रूप से ट्रांसक्राइब कर पाता है। मैंने इसके लिए कई प्लगइन बनाए:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

भाषा पहचान आपके OVOS कॉन्फ़िग में सूचीबद्ध भाषाओं तक सीमित है — उस सेट के बाहर के वर्गीकरण अस्वीकृत कर दिए जाते हैं, ताकि आप गलती से किसी ऐसी भाषा पर स्विच न कर बैठें जिसे आपके घर में कोई नहीं बोलता।

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### कॉन्फ़िगरेशन

FasterWhisper के भाषा वर्गीकरणकर्ता मॉडल का आकार कॉन्फ़िगर करने योग्य है:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## टेक्स्ट भाषा अनुवाद

[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) Meta का ओपन-सोर्स मॉडल है, जो 200 भाषाओं के बीच उच्च-गुणवत्ता वाला प्रत्यक्ष अनुवाद प्रदान करता है — जिसमें अस्तूरियन, लुगांडा और उर्दू जैसी कम-संसाधन भाषाएँ भी शामिल हैं। इसी नाम से इस लेख को प्रेरणा मिली।

[ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) NLLB को OVOS के भीतर स्थानीय रूप से चलाता है। Skills को पूर्ण मूल-भाषा समर्थन प्राप्त करने में समय लगता है, लेकिन इस प्लगइन के साथ उपयोगकर्ताओं को अब प्रतीक्षा करने की आवश्यकता नहीं है — OVOS आने वाले वाक्यों और भेजी जाने वाली प्रतिक्रियाओं का तुरंत अनुवाद कर देता है, जिससे कोई भी skill उन 200 भाषाओं में से किसी में भी काम करती है।

कम-शक्ति वाले हार्डवेयर के लिए, [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) अनुवाद को किसी दूरस्थ सर्वर पर स्थानांतरित कर देता है। सार्वजनिक सर्वर डिफ़ॉल्ट रूप से सूचीबद्ध होते हैं; गोपनीयता के लिए स्वयं-होस्टिंग की दृढ़ता से अनुशंसा की जाती है। **किसी सार्वजनिक सर्वर का उपयोग करने का अर्थ है अपने सभी वाक्य उसके संचालक पर भरोसा करना।**

उल्लेखनीय अनुवाद प्लगइन:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### कॉन्फ़िगरेशन

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## OVOS द्विदिशात्मक अनुवाद प्लगइन

[OVOS द्विदिशात्मक अनुवाद प्लगइन](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) दो पाइपलाइन चरणों के साथ पहचान और अनुवाद को आपस में जोड़ता है: एक **Utterance Transformer** (आने वाले टेक्स्ट का OVOS की कॉन्फ़िगर की गई भाषा में अनुवाद करता है) और एक **Dialog Transformer** (प्रतिक्रिया का उपयोगकर्ता की मूल भाषा में वापस अनुवाद करता है)।

वैकल्पिक `verify_lang` मोड पहचानी गई टेक्स्ट भाषा की सत्र भाषा से क्रॉस-जाँच करता है — यह चैट प्लेटफ़ॉर्म पर उपयोगी है, जहाँ एक ही OVOS इंस्टेंस बहुभाषी उपयोगकर्ताओं की सेवा करता है। इसके लिए `language.detection_module` में कॉन्फ़िगर किए गए एक [भाषा पहचान मॉड्यूल](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) और एक अनुवाद प्लगइन (स्थानीय के लिए `ovos-translate-plugin-nllb` या दूरस्थ के लिए `ovos-translate-server-plugin`) की आवश्यकता होती है।

### कॉन्फ़िगरेशन

```json
"utterance_transformers": {
    "ovos-utterance-translation-plugin": {
        "bidirectional": true,
        "verify_lang": false,
        "ignore_invalid": true,
        "translate_secondary_langs": true
    }
},
"dialog_transformers": {
    "ovos-dialog-translation-plugin": {}
}
```

## यह सब मिलकर कैसे काम करता है

प्रत्येक घटक स्वतंत्र रूप से उपयोगी है, लेकिन वे स्वच्छ रूप से एक साथ जुड़ते हैं:

1. **ऑडियो भाषा पहचान** — ASR प्लगइन को बताती है कि किस भाषा को ट्रांसक्राइब करना है।
2. **वाक्य अनुवाद** — skill मिलान से पहले गैर-मूल वाक्यों को असिस्टेंट की कॉन्फ़िगर की गई भाषा में परिवर्तित करता है।
3. **संवाद अनुवाद** — TTS से पहले असिस्टेंट की प्रतिक्रिया का उपयोगकर्ता की भाषा में वापस अनुवाद करता है।

परिणाम: OVOS NLLB की 200 भाषाओं में से किसी को भी शुरू से अंत तक संसाधित कर सकता है, बिना इसके कि skills को स्वयं अनुवाद की आवश्यकता हो।

योगदान और skill अनुवाद [GitHub पर OpenVoiceOS](https://github.com/OpenVoiceOS) में आमंत्रित हैं।
