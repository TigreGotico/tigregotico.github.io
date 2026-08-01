---
title: "OpenVoiceOS و Home Assistant: فريق الأحلام لأتمتة الصوت"
description: "يتولى Home Assistant الأتمتة، ويتولى OVOS الصوت. ثلاث طبقات للتكامل تجعل هذا الاقتران ناجحًا: جسور Wyoming لخط أنابيب الصوت في HA ، و ovos-persona-server كوكيل محادثة، و HiveMind لإظهار أجهزة OVOS ككيانات أصلية في HA."
date: 2025-09-17
lang: ar
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> نُشرت هذه التدوينة في الأصل على [مدونة OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)

يتولى Home Assistant الأتمتة، ويتولى OVOS الصوت. ولا يحاول أيٌّ منهما أن يكون الآخر. هذا التقسيم في المسؤوليات هو سبب نجاح هذا الاقتران: تكاملات الأجهزة ومحرك الأتمتة في HA مقترنَين بحزمة OVOS الصوتية المرنة والمحلية بالكامل.

تتناول هذه التدوينة طبقات التكامل الثلاث: جسور Wyoming لخط أنابيب الصوت في HA ، و ovos-persona-server كوكيل محادثة، و HiveMind لإظهار أجهزة OVOS ككيانات أصلية في HA.

-----

## امنح Home Assistant صوتًا مدعومًا من OVOS

بروتوكول Wyoming هو الواجهة القياسية في HA لخدمات ASR و TTS وكلمة التنبيه الخارجية. لقد بنينا جسور Wyoming التي تكشف أي إضافة OVOS عبر هذا البروتوكول — ما يعني أن HA يكتسب الوصول إلى كل إضافة في منظومة OVOS ، وليس مجرد قائمة مختارة محدودة.


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): تحويل الأوامر المنطوقة إلى نص ليفهمه Home Assistant.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): تمكين Home Assistant من نطق الردود باستخدام خيارات الصوت المتنوعة في OVOS.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): دمج كلمات تنبيه مخصصة، ما يتيح لإعداد Home Assistant الخاص بك الاستجابة فقط عندما يسمع عبارة التنبيه التي اخترتها.

يقوم مشروع [OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) بتحزيم هذه الخدمات بحيث تصبح على بُعد أمر `docker compose up` واحد.

### **أبرز الإضافات: TTS متعدد اللغات مدعوم من ILENIA**

بالنسبة إلينا، إمكانية الوصول أمر أساسي. وهذا يشمل إمكانية الوصول اللغوي. نحن فخورون بأن هذا التكامل يتيح لنا تقديم أصوات عالية الجودة ومموَّلة من الجهات العامة من مشاريع مثل [**ILENIA**](https://proyectoilenia.es/) إلى جمهور أوسع. يحصل مستخدمو Home Assistant على أصوات طبيعية للغات مثل الكتالانية والغاليسية، مباشرةً من المشاريع التي أنشأتها.

* **Matxa TTS للكتالانية:** توفر [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) إمكانات تحويل النص إلى كلام متعددة المتحدثين للغة الكتالانية.
* **NosTTS للغاليسية:** تقدم [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) تحويلًا قويًا للنص إلى كلام بالغاليسية.

![شعار ILENIA](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **إعداد خدمات Wyoming في Home Assistant:**

عند تكوين خدمات Wyoming في Home Assistant ، ستراجع عادةً [الوثائق الرسمية لـ Home Assistant](https://www.home-assistant.io/integrations/wyoming/). تتضمن هذه العملية عادةً مجرد إدخال عنوان IP الخاص بحاوية Docker (أو المضيف الذي يشغّل خدمات OVOS Wyoming) في واجهة الويب الخاصة بـ Home Assistant.

![إعداد wyoming في Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![كيانات wyoming في Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## دع OVOS يكون عقل المحادثة

هل تريد الذهاب أبعد من ذلك خطوة؟ يمكنك إعداد OVOS كوكيل محادثة كامل الميزات لـ Home Assistant باستخدام **تكامل Ollama**.

![إعداد ollama في Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


في هذا الإعداد، يمرر Home Assistant نص المستخدم إلى [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/)؛ يستنتج OVOS النية ويعيد الإجابة لينطقها Home Assistant. ولأن [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) يكشف نقاط نهاية متوافقة مع Ollama ، يمكن توصيل الخادم نفسه بأي تطبيق يتحدث واجهات Ollama أو OpenAI البرمجية — وليس فقط Home Assistant.

![الدردشة مع OVOS في Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS مع Voice PE

إن [Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) هو قمر صناعي عتادي مخصص لخط أنابيب الصوت في HA. وهو يعمل مع جميع خدمات Wyoming الموصوفة أعلاه — وجّهه إلى أي مثيل قيد التشغيل من wyoming-ovos-stt أو wyoming-ovos-tts أو wyoming-ovos-wakeword.

![تكوين Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## رحّب بأجهزة OVOS الخاصة بك في Home Assistant عبر HiveMind

إذا كانت لديك أجهزة OVOS مخصصة، فإن تكامل [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) يجعلها تظهر ككيانات أصلية في Home Assistant — لوحة تحكم موحّدة للأسطول بأكمله.


### **إعداد تكامل HiveMind:**

لدمج أجهزة OVOS الخاصة بك عبر HiveMind ، ستضيف عادةً تكامل HiveMind في Home Assistant. يتضمن ذلك تقديم تفاصيل الاتصال مثل `name` للتكامل، و `access_key`، و `password`، و `site_id`، و `host` (عنوان IP أو اسم مضيف خادم HiveMind الخاص بك)، و `port` (القيمة الافتراضية 5678). قد تكون لديك أيضًا خيارات لـ `allow_self_signed` للشهادات أو تمكين `legacy_audio` بحسب إعدادك.

![إعداد HiveMind في Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **عناصر التحكم المكشوفة لأجهزة OVOS:**

بمجرد التكامل، يكشف HiveMind مجموعة شاملة من عناصر التحكم في أجهزة OVOS الخاصة بك مباشرةً داخل Home Assistant. يتيح لك ذلك إدارة جوانب مختلفة من جهاز OVOS الخاص بك من واجهة Home Assistant ، بما في ذلك:

  * تغيير `Listening Mode` (مثل كلمة التنبيه، أو الاستماع الدائم)
  * مفتاح `Microphone Mute`
  * حالة وعناصر تحكم `OCP Player`
  * إجراءات مثل `Reboot Device` و `Restart OVOS` و `Shutdown Device`
  * تبديل `Sleep Mode` و `SSH Service`
  * `Start Listening` أو `Stop` للاستماع يدويًا
  * التحكم في مستوى الصوت

![كيانات HiveMind في Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **تكامل الإشعارات:**

يتيح HiveMind أيضًا لأجهزة OVOS الخاصة بك العمل كأهداف للإشعارات داخل Home Assistant. هذا يعني أنه يمكنك تكوين أتمتات Home Assistant لإرسال إشعارات منطوقة مباشرةً إلى أجهزة OVOS الخاصة بك، ما يتيح لها "نطق" التنبيهات أو التذكيرات أو أي معلومات أخرى تقوم بتكوينها. يُكشف هذا ككيان مُشعِر "Speak" في Home Assistant.

![خدمة إشعارات HiveMind في Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **تكامل مشغّل الوسائط و Music Assistant:**

تظهر أجهزة OVOS أيضًا كمشغّلات وسائط قياسية في Home Assistant ، فيمكنك التحكم في التشغيل من واجهة مشغّل الوسائط المعتادة. ويمتد التكامل نفسه إلى Music Assistant: يمكنك بث الموسيقى عبر أجهزة OVOS الخاصة بك فتصبح جزءًا من نظام الصوت المنزلي بأكمله.


![مشغّل HiveMind في Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![مشغّل HiveMind في Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## امنح OVOS مفاتيح المملكة

تمنح [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant) التي تصونها المجتمع OVOS تحكمًا مباشرًا في كيانات Home Assistant عبر واجهة HA REST البرمجية. ثبّتها على جهاز OVOS الخاص بك ويمكنك أن تقول "أشعل أضواء غرفة المعيشة" أو "اضبط منظّم الحرارة على 21 درجة" — محليًا بالكامل، دون سحابة.

-----

## الأداة المناسبة لكل مهمة

يتولى OVOS الصوت؛ ويتولى Home Assistant الأتمتة. ولا يتنازل أيٌّ منهما ليؤدي عمل الآخر، ونقاط التكامل نظيفة بما يكفي ليحتفظ كل مشروع بدورة إصداراته الخاصة.

تقارير الأخطاء وطلبات السحب مرحّب بها عبر المستودعات المرتبطة أعلاه.

---

OpenVoiceOS هو مشروع مجتمعي — إذا كنت تؤمن بأن المساعدات الصوتية يجب أن تكون مفتوحة وشاملة ويتحكم بها المستخدم، [ادعم المشروع](https://www.openvoiceos.org/contribution) بالتمويل أو البيانات المفتوحة أو الترجمات.
