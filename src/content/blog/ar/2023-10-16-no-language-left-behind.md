---
title: "لا لغة تُترك خلف الركب"
description: "إزالة الحواجز اللغوية في OpenVoiceOS من خلال كشف اللغة وإضافات الترجمة وقدرات الترجمة ثنائية الاتجاه."
date: 2023-10-16
lang: ar
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> نُشر هذا المقال في الأصل على مدونتي الشخصية (المتوقفة الآن)

إن OpenVoiceOS (OVOS) منصةُ مساعدٍ صوتيٍّ مفتوحةُ المصدر ومدفوعةٌ بالمجتمع. يتناول هذا المقال إضافات كشف اللغة والترجمة والترجمة ثنائية الاتجاه التي بنيتها لتمكين OVOS من العمل بلغات تتجاوز بكثير ما تدعمه المهارات المثبَّتة أصلًا.


## كشف اللغة من الصوت

يتعرف OVOS على اللغة المنطوقة في الصوت قبل أن تصل إلى خطوة النسخ عبر ASR، مما يتيح لإضافة ASR أن تنسخ بدقة بدلًا من التخمين. لقد بنيت عدة إضافات لهذا الغرض:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

يقتصر كشف اللغة على اللغات المدرجة في إعدادات OVOS الخاصة بك — تُرفض التصنيفات الخارجة عن تلك المجموعة، بحيث لا تنتقل عن طريق الخطأ إلى لغة لا يتحدث بها أحد في منزلك.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### الإعداد

حجم نموذج مصنِّف اللغة في FasterWhisper قابل للإعداد:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## ترجمة لغة النص

إن [No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) هو نموذج Meta المفتوح المصدر للترجمة المباشرة عالية الجودة بين 200 لغة — بما في ذلك اللغات محدودة الموارد مثل الأسترية واللوغندية والأردية. هذا الاسم هو ما ألهم هذا المقال.

يشغِّل [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) نموذج NLLB محليًّا داخل OVOS. المهارات بطيئة في اكتساب الدعم الأصلي الكامل للغة، لكن مع هذه الإضافة لم يعد على المستخدمين الانتظار — إذ يترجم OVOS المنطوقات الواردة والردود الصادرة آنيًّا، بحيث تعمل أي مهارة بأيٍّ من تلك اللغات الـ200.

للأجهزة الأقل قدرة، يفوِّض [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) الترجمة إلى خادم بعيد. تُدرَج خوادم عمومية جاهزة من البداية؛ والاستضافة الذاتية موصى بها بشدة لأسباب تتعلق بالخصوصية. **إن استخدام خادم عمومي يعني ائتمان مشغِّله على جميع منطوقاتك.**

إضافات ترجمة جديرة بالذكر:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### الإعداد

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## إضافة الترجمة ثنائية الاتجاه في OVOS

تربط [إضافة الترجمة ثنائية الاتجاه في OVOS](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) بين الكشف والترجمة عبر مرحلتين في خط المعالجة: **محوِّل المنطوق** (يترجم النص الوارد إلى اللغة المُعدَّة في OVOS) و**محوِّل الحوار** (يترجم الرد مجددًا إلى اللغة الأصلية للمستخدم).

يقوم الوضع الاختياري `verify_lang` بالتحقق المتبادل من لغة النص المكتشَفة مقابل لغة الجلسة — وهو مفيد على منصات الدردشة حيث تخدم نسخة واحدة من OVOS مستخدمين متعددي اللغات. يتطلب ذلك [وحدة كشف لغة](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) مُعدَّة في `language.detection_module` وإضافة ترجمة (`ovos-translate-plugin-nllb` للمحلي أو `ovos-translate-server-plugin` للبعيد).

### الإعداد

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

## كيف يعمل كل ذلك معًا

كل مكوِّن مفيد بشكل مستقل، لكنها تتكامل بسلاسة:

1. **كشف لغة الصوت** — يُخبر إضافة ASR بأي لغة يجب النسخ.
2. **ترجمة المنطوق** — تحوِّل المنطوقات غير الأصلية إلى اللغة المُعدَّة للمساعد قبل مطابقة المهارات.
3. **ترجمة الحوار** — تترجم رد المساعد مجددًا إلى لغة المستخدم قبل TTS.

النتيجة: يستطيع OVOS معالجة أيٍّ من لغات NLLB الـ200 من طرف إلى طرف، دون حاجة المهارات نفسها إلى ترجمات.

المساهمات وترجمات المهارات مرحَّب بها في [OpenVoiceOS على GitHub](https://github.com/OpenVoiceOS).
