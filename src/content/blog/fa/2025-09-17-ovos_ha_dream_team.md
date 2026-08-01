---
title: "OpenVoiceOS و Home Assistant: تیم رؤیایی خودکارسازی صوتی"
description: "‏Home Assistant خودکارسازی را به عهده می‌گیرد؛ OVOS صدا را. سه لایهٔ یکپارچه‌سازی این ترکیب را کارآمد می‌کنند: پل‌های Wyoming برای خط‌لولهٔ صوتی HA، ovos-persona-server به‌عنوان یک عامل گفت‌وگویی، و HiveMind برای نمایش دستگاه‌های OVOS به‌عنوان موجودیت‌های بومی HA."
date: 2025-09-17
lang: fa
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> این وبلاگ در ابتدا در [وبلاگ OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team) منتشر شد

‏Home Assistant خودکارسازی را به عهده می‌گیرد؛ OVOS صدا را. هیچ‌کدام نمی‌کوشند دیگری باشد. همین تقسیم مسئولیت است که این ترکیب را کارآمد می‌کند: یکپارچه‌سازی دستگاه‌ها و موتور خودکارسازی HA در کنار پشتهٔ صوتی انعطاف‌پذیر و کاملاً محلی OVOS.

این نوشته به سه لایهٔ یکپارچه‌سازی می‌پردازد: پل‌های Wyoming برای خط‌لولهٔ صوتی HA، ovos-persona-server به‌عنوان یک عامل گفت‌وگویی، و HiveMind برای نمایش دستگاه‌های OVOS به‌عنوان موجودیت‌های بومی HA.

-----

## به Home Assistant صدایی مبتنی بر OVOS بدهید

پروتکل Wyoming رابط استاندارد HA برای سرویس‌های خارجی ASR، TTS و wakeword است. ما پل‌های Wyoming ساختیم که هر افزونهٔ OVOS را روی آن پروتکل در دسترس می‌گذارند — یعنی HA به هر افزونه در بوم‌سازگان OVOS دسترسی پیدا می‌کند، نه فقط یک فهرست کوتاه گزیده.


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): فرمان‌های گفتاری را به متن تبدیل می‌کند تا Home Assistant آن‌ها را بفهمد.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): به Home Assistant امکان می‌دهد پاسخ‌ها را با گزینه‌های صوتی متنوع OVOS بیان کند.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): wakeword های سفارشی را یکپارچه می‌کند و به راه‌اندازی Home Assistant شما اجازه می‌دهد فقط زمانی پاسخ دهد که عبارت راه‌اندازِ انتخابی شما را بشنود.

پروژهٔ [OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) این سرویس‌ها را بسته‌بندی می‌کند تا با یک `docker compose up` در دسترس باشند.

### **نکات برجستهٔ افزونه‌ها: TTS چندزبانه با پشتیبانی ILENIA**

برای ما، دسترس‌پذیری کلیدی است. این شامل دسترس‌پذیری زبانی هم می‌شود. ما مفتخریم که این یکپارچه‌سازی به ما امکان می‌دهد صداهای باکیفیت و بودجهٔ عمومی از پروژه‌هایی مانند [**ILENIA**](https://proyectoilenia.es/) را به مخاطبان گسترده‌تری برسانیم. کاربران Home Assistant صداهایی طبیعی برای زبان‌هایی مانند کاتالان و گالیسیایی، مستقیماً از پروژه‌هایی که آن‌ها را ساخته‌اند، به دست می‌آورند.

* **Matxa TTS برای کاتالان:** افزونهٔ [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) قابلیت تبدیل متن به گفتار چندگوینده را برای زبان کاتالان فراهم می‌کند.
* **NosTTS برای گالیسیایی:** افزونهٔ [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) تبدیل متن به گفتار استوار را در زبان گالیسیایی ارائه می‌دهد.

![لوگوی ILENIA](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **راه‌اندازی سرویس‌های Wyoming در Home Assistant:**

هنگام پیکربندی سرویس‌های Wyoming در Home Assistant، معمولاً به [مستندات رسمی Home Assistant](https://www.home-assistant.io/integrations/wyoming/) مراجعه می‌کنید. این فرایند معمولاً تنها شامل وارد کردن نشانی IP کانتینر Docker شما (یا میزبانی که سرویس‌های OVOS Wyoming شما را اجرا می‌کند) در واسط وب Home Assistant است.

![راه‌اندازی wyoming در Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![موجودیت‌های wyoming در Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## بگذارید OVOS مغز گفت‌وگو باشد

می‌خواهید یک گام فراتر بروید؟ می‌توانید OVOS را با استفاده از **یکپارچه‌سازی Ollama** به‌عنوان یک عامل گفت‌وگویی تمام‌عیار برای Home Assistant راه‌اندازی کنید.

![راه‌اندازی ollama در Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


در این راه‌اندازی، Home Assistant متن کاربر را به [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/) می‌سپارد؛ OVOS نیت را تشخیص می‌دهد و پاسخ را برمی‌گرداند تا Home Assistant آن را بیان کند. و از آنجا که [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) نقاط پایانی سازگار با Ollama را در دسترس می‌گذارد، همان سرور به هر برنامه‌ای که با API‌های Ollama یا OpenAI صحبت می‌کند وصل می‌شود — نه فقط Home Assistant.

![گفت‌وگو با OVOS در Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS همراه با Voice PE

‏[Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) یک ماهوارهٔ سخت‌افزاری اختصاصی برای خط‌لولهٔ صوتی HA است. این دستگاه با تمام سرویس‌های Wyoming که در بالا توضیح داده شد کار می‌کند — آن را به هر نمونهٔ در حال اجرای wyoming-ovos-stt، wyoming-ovos-tts یا wyoming-ovos-wakeword متصل کنید.

![پیکربندی Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## دستگاه‌های OVOS خود را با HiveMind به Home Assistant خوش‌آمد بگویید

اگر دستگاه‌های اختصاصی OVOS دارید، یکپارچه‌سازی [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) آن‌ها را به‌صورت موجودیت‌های بومی در Home Assistant نمایان می‌کند — یک پنل کنترل یکپارچه برای کل مجموعه.


### **راه‌اندازی یکپارچه‌سازی HiveMind:**

برای یکپارچه‌سازی دستگاه‌های OVOS از طریق HiveMind، معمولاً یکپارچه‌سازی HiveMind را در Home Assistant اضافه می‌کنید. این کار شامل ارائهٔ جزئیات اتصال مانند یک `name` برای یکپارچه‌سازی، یک `access_key`، `password`، `site_id`، `host` (نشانی IP یا نام میزبانِ سرور HiveMind شما) و `port` (که به‌طور پیش‌فرض 5678 است) می‌شود. بسته به راه‌اندازی‌تان ممکن است گزینه‌هایی نیز برای `allow_self_signed` گواهی‌ها یا فعال‌سازی `legacy_audio` داشته باشید.

![راه‌اندازی HiveMind در Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **کنترل‌های در دسترس برای دستگاه‌های OVOS:**

پس از یکپارچه‌سازی، HiveMind مجموعه‌ای جامع از کنترل‌ها را برای دستگاه‌های OVOS شما مستقیماً درون Home Assistant در دسترس می‌گذارد. این به شما امکان می‌دهد جنبه‌های گوناگون دستگاه OVOS خود را از واسط Home Assistant مدیریت کنید، از جمله:

  * تغییر `Listening Mode` (مثلاً wakeword، شنیدنِ همیشگی)
  * ضامن `Microphone Mute`
  * وضعیت و کنترل‌های `OCP Player`
  * اقدام‌هایی مانند `Reboot Device`، `Restart OVOS` و `Shutdown Device`
  * تغییر `Sleep Mode` و `SSH Service`
  * شروع دستی `Start Listening` یا `Stop` شنیدن
  * کنترل سطح صدا

![موجودیت‌های HiveMind در Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **یکپارچه‌سازی اعلان‌ها:**

‏HiveMind همچنین به دستگاه‌های OVOS شما امکان می‌دهد به‌عنوان مقصد اعلان‌ها درون Home Assistant عمل کنند. این یعنی می‌توانید خودکارسازی‌های Home Assistant را طوری پیکربندی کنید که اعلان‌های گفتاری را مستقیماً به دستگاه‌های OVOS شما بفرستند و به آن‌ها اجازه دهند هشدارها، یادآوری‌ها یا هر اطلاعات دیگری را که پیکربندی می‌کنید «بیان» کنند. این قابلیت به‌صورت یک موجودیت اعلان‌کنندهٔ «Speak» در Home Assistant در دسترس گذاشته می‌شود.

![سرویس اعلان HiveMind در Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **یکپارچه‌سازی Media Player و Music Assistant:**

دستگاه‌های OVOS همچنین به‌عنوان پخش‌کننده‌های رسانه‌ای استاندارد در Home Assistant نمایان می‌شوند، بنابراین می‌توانید پخش را از واسط معمول پخش‌کنندهٔ رسانه کنترل کنید. همین یکپارچه‌سازی به Music Assistant نیز گسترش می‌یابد: موسیقی را از طریق دستگاه‌های OVOS خود پخش کنید و آن‌ها بخشی از سامانهٔ صوتی سراسری خانهٔ شما می‌شوند.


![پخش‌کنندهٔ HiveMind در Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![پخش‌کنندهٔ HiveMind در Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## کلیدهای پادشاهی را به OVOS بسپارید

‏[skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant) که توسط جامعه نگهداری می‌شود، به OVOS کنترل مستقیم بر موجودیت‌های Home Assistant از طریق HA REST API می‌دهد. آن را روی دستگاه OVOS خود نصب کنید و می‌توانید بگویید «چراغ‌های اتاق نشیمن را روشن کن» یا «ترموستات را روی ۲۱ درجه تنظیم کن» — کاملاً محلی، بدون ابر.

-----

## ابزار درست برای هر کار

‏OVOS صدا را به عهده می‌گیرد؛ Home Assistant خودکارسازی را. هیچ‌کدام برای انجام کارِ دیگری مصالحه نمی‌کند و نقاط یکپارچه‌سازی به‌قدر کافی تمیز هستند که هر پروژه چرخهٔ انتشار خودش را حفظ کند.

گزارش اشکال‌ها و PR ها در تمام مخزن‌های پیوندشده در بالا خوش‌آمد است.

---

‏OpenVoiceOS یک پروژهٔ جامعه‌محور است — اگر باور دارید دستیارهای صوتی باید باز، فراگیر و در کنترل کاربر باشند، از این پروژه با کمک مالی، دادهٔ باز یا ترجمه [پشتیبانی کنید](https://www.openvoiceos.org/contribution).
