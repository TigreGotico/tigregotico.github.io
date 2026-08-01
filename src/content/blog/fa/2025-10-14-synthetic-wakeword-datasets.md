---
title: "مجموعه‌داده‌های مصنوعی Wakeword: هفت نام دستیار، یک آشکارساز"
description: "ما هفت مجموعه‌دادهٔ مصنوعی wakeword برای نام‌های رایج دستیارهای صوتی منتشر کردیم — hey_computer ، hey_mycroft ، hey_siri ، alexa ، home_assistant ، voice_assistant ، wake_up. یک آشکارساز آموزش دهید که همه‌جا کار کند."
date: 2025-10-14
lang: fa
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

هفت نام دستیار. هفت مجموعه‌داده. تمام صداها به‌طور کامل از چارچوب TTS **[phoonnx](https://github.com/TigreGotico/phoonnx)** با استفاده از صداهای Miro و Dii تولید شده‌اند — بدون هیچ ضبط انسانی، بدون هیچ فرم رضایت، بدون هیچ افشای حریم خصوصی.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

هر مجموعه‌داده یک مجموعهٔ تخت از حدود هزار کلیپ مثبت است — wakeword که با گویندگان، آهنگ‌ها و نواخت‌های گوناگون بیان شده است. نمونه‌های منفی دشوار (hard negatives) و نویز پس‌زمینه به‌صورت مجموعه‌داده‌های همراهِ جداگانه عرضه می‌شوند که در زمان آموزش با آن‌ها ترکیب می‌کنید: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en)، [not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt) و [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## چرا مصنوعی

ضبط‌های واقعی به ماه‌ها گردآوری، فرم رضایت برای هر گوینده نیاز دارند و باز هم شکاف‌های لهجه‌ای‌ای را که پیش‌بینی نکرده بودید باقی می‌گذارند. تولید مصنوعی این را وارونه می‌کند:

- **بازتولیدپذیر**: همان تنظیمات تولید، همان صداها ← همان صدا. رد ممیزی کامل، بدون باستان‌شناسی فرم‌های رضایت.
- **قابل‌بازبینی**: خط‌لولهٔ تولید همان مستندات است.
- **مقیاس‌پذیر**: تغییر آهنگ گفتار و ویژگی‌های گوینده یک تغییر پارامتر است، نه یک جلسهٔ استودیویی.

برای آشکارسازی wakeword ، ویژگی مرتبط تمایز آکوستیکی است، نه طبیعی بودن. دادهٔ مصنوعی به‌خوبی با این نیاز همخوان است.

## از این‌ها استفاده کنید

آشکارساز wakeword خودتان را برای OpenVoiceOS ، Mycroft یا هر سامانهٔ صوتی باز آموزش دهید. برای افزون‌سازی نمونه‌های منفی، مجموعه‌داده‌های کلیپ پس‌زمینهٔ خانگی و در مالکیت عمومی نیز وجود دارند: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs)، [public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs) و [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**تمام مجموعه‌داده‌های wakeword در HuggingFace ← TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
