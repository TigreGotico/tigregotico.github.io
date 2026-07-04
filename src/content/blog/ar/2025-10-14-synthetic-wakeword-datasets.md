---
title: "مجموعات بيانات كلمات الإيقاظ الاصطناعية: سبعة أسماء لمساعدين، كاشف واحد"
description: "نشرنا سبع مجموعات بيانات اصطناعية لكلمات الإيقاظ لأسماء شائعة للمساعدين الصوتيين — hey_computer وhey_mycroft وhey_siri وalexa وhome_assistant وvoice_assistant وwake_up. درِّب كاشفًا يعمل في كل مكان."
date: 2025-10-14
lang: ar
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

سبعة أسماء لمساعدين. سبع مجموعات بيانات. كل الصوت مُولَّد بالكامل من إطار عمل التحويل من النص إلى الكلام **[phoonnx](https://github.com/TigreGotico/phoonnx)** باستخدام صوتَي Miro وDii — دون تسجيلات بشرية، ودون استمارات موافقة، ودون تعريض للخصوصية.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

كل مجموعة بيانات هي مجموعة مسطحة من نحو ألف مقطع إيجابي — كلمة الإيقاظ منطوقة بمتحدثين ومعدلات ونبرات متنوعة. تُشحن العينات السلبية الصعبة وضوضاء الخلفية كمجموعات بيانات مرافقة منفصلة تمزجها أثناء التدريب: [not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en) و[not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt) و[ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## لماذا الاصطناعي

تتطلب التسجيلات الحقيقية أشهرًا من الجمع، واستمارات موافقة لكل متحدث، ومع ذلك تترك فجوات في اللهجات لم تتوقعها. أما التوليد الاصطناعي فيعكس ذلك:

- **قابل للاستنساخ**: نفس إعدادات التوليد، ونفس الأصوات ← نفس الصوت. مسار تدقيق كامل، دون بحث أثري عن استمارات الموافقة.
- **قابل للتدقيق**: خط أنابيب التوليد هو التوثيق نفسه.
- **قابل للتوسع**: تنويع معدل الكلام وخصائص المتحدث هو تغيير في المعاملات، وليس جلسة استوديو.

بالنسبة لكشف كلمات الإيقاظ، فإن الخاصية المهمة هي التميّز الصوتي، لا الطبيعية. والبيانات الاصطناعية مناسبة تمامًا لهذا المتطلب.

## استخدم هذه

درِّب كاشف كلمات الإيقاظ الخاص بك لـ OpenVoiceOS أو Mycroft أو أي نظام صوتي مفتوح. لتعزيز العينات السلبية تتوفر أيضًا مجموعات بيانات لمقاطع خلفية منزلية ومن الملكية العامة: [building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs) و[public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs) و[FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**كل مجموعات بيانات كلمات الإيقاظ على HuggingFace ← TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
