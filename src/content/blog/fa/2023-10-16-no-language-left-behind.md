---
title: "هیچ زبانی جا نمی‌ماند"
description: "از میان برداشتن موانع زبانی در OpenVoiceOS از طریق تشخیص زبان، افزونه‌های ترجمه و قابلیت‌های ترجمهٔ دوسویه."
date: 2023-10-16
updated: 2026-08-01
lang: fa
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> این نوشته در ابتدا در وبلاگ شخصی من (که اکنون از میان رفته است) منتشر شد

‏OpenVoiceOS (OVOS) یک بستر دستیار صوتی متن‌باز و جامعه‌محور است. این نوشته به افزونه‌های تشخیص زبان، ترجمه و ترجمهٔ دوسویه‌ای می‌پردازد که ساختم تا OVOS بتواند در زبان‌هایی بسیار فراتر از آنچه skill های نصب‌شده به‌صورت بومی پشتیبانی می‌کنند کار کند.


## تشخیص زبان از روی صدا

‏OVOS زبانِ گفته‌شده در صدا را پیش از رسیدن به مرحلهٔ رونویسی ASR شناسایی می‌کند و این امکان را می‌دهد که افزونهٔ ASR به‌جای حدس زدن، با دقت رونویسی کند. من چند افزونه برای این کار ساختم:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

تشخیص زبان به زبان‌های فهرست‌شده در پیکربندی OVOS شما محدود است — طبقه‌بندی‌های خارج از این مجموعه رد می‌شوند تا به‌طور تصادفی به زبانی که هیچ‌کس در خانهٔ شما صحبت نمی‌کند سوئیچ نکنید.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### پیکربندی

اندازهٔ مدلِ طبقه‌بندی‌کنندهٔ زبانِ FasterWhisper قابل پیکربندی است:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## ترجمهٔ زبانِ متن

‏[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) مدل متن‌باز Meta برای ترجمهٔ مستقیم و باکیفیت میان ۲۰۰ زبان است — از جمله زبان‌های کم‌منبع مانند آستوریایی، لوگاندایی و اردو. همین نام الهام‌بخش این نوشته بود.

‏[ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) مدل NLLB را به‌صورت محلی درون OVOS اجرا می‌کند. skill ها به‌کندی پشتیبانی کامل بومی از زبان‌ها را به دست می‌آورند، اما با این افزونه کاربران دیگر نیازی به انتظار ندارند — OVOS گفته‌های ورودی و پاسخ‌های خروجی را در لحظه ترجمه می‌کند، تا هر skill در هر یک از آن ۲۰۰ زبان کار کند.

برای سخت‌افزارهای کم‌توان‌تر، [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) کار ترجمه را به یک سرور راه دور واگذار می‌کند. سرورهای عمومی از پیش فهرست شده‌اند؛ میزبانی شخصی به‌شدت به دلایل حریم خصوصی توصیه می‌شود. **استفاده از یک سرور عمومی یعنی سپردن تمام گفته‌هایتان به اعتماد گردانندهٔ آن.**

افزونه‌های ترجمهٔ شایان توجه:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### پیکربندی

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## افزونهٔ ترجمهٔ دوسویهٔ OVOS

‏[افزونهٔ ترجمهٔ دوسویهٔ OVOS](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) تشخیص و ترجمه را با دو مرحلهٔ pipeline به هم پیوند می‌دهد: یک **Utterance Transformer** (متن ورودی را به زبان پیکربندی‌شدهٔ OVOS ترجمه می‌کند) و یک **Dialog Transformer** (پاسخ را دوباره به زبان اصلی کاربر ترجمه می‌کند).

حالت اختیاری `verify_lang` زبانِ متنِ تشخیص‌داده‌شده را با زبان جلسه به‌صورت متقابل بررسی می‌کند — که در بسترهای چت که یک نمونهٔ واحد OVOS به کاربران چندزبانه خدمت می‌رساند مفید است. به یک [ماژول تشخیص زبان](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) پیکربندی‌شده در `language.detection_module` و یک افزونهٔ ترجمه (`ovos-translate-plugin-nllb` برای محلی یا `ovos-translate-server-plugin` برای راه دور) نیاز دارد.

### پیکربندی

```json
"utterance_transformers": {
    "ovos-utterance-translation-plugin": {
        "bidirectional": true,
        "verify_lang": false,
        "ignore_invalid_langs": true,
        "translate_secondary_langs": true
    }
},
"dialog_transformers": {
    "ovos-dialog-translation-plugin": {}
}
```

## چگونه همه با هم کار می‌کنند

هر مؤلفه به‌تنهایی مفید است، اما به‌خوبی با هم ترکیب می‌شوند:

1. **تشخیص زبانِ صدا** — به افزونهٔ ASR می‌گوید کدام زبان را رونویسی کند.
2. **ترجمهٔ گفته** — گفته‌های غیربومی را پیش از تطبیق با skill ها به زبان پیکربندی‌شدهٔ دستیار تبدیل می‌کند.
3. **ترجمهٔ گفت‌وگو** — پاسخ دستیار را پیش از TTS دوباره به زبان کاربر ترجمه می‌کند.

نتیجه: OVOS می‌تواند هر یک از ۲۰۰ زبان NLLB را به‌صورت سرتاسری پردازش کند، بدون آنکه خودِ skill ها به ترجمه نیاز داشته باشند.

مشارکت‌ها و ترجمهٔ skill ها در [OpenVoiceOS در GitHub](https://github.com/OpenVoiceOS) خوش‌آمد است.
