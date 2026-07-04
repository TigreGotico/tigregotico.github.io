---
title: "OpenVoiceOS и Home Assistant: идеальная команда голосовой автоматизации"
description: "Home Assistant отвечает за автоматизацию; OVOS отвечает за голос. Три слоя интеграции заставляют эту связку работать: мосты Wyoming для голосового конвейера HA, ovos-persona-server в роли разговорного агента и HiveMind для отображения устройств OVOS как нативных сущностей HA."
date: 2025-09-17
lang: ru
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> Эта статья была первоначально опубликована в [блоге OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)

Home Assistant отвечает за автоматизацию; OVOS отвечает за голос. Ни один из них не пытается быть другим. Именно это разделение обязанностей и делает связку работоспособной: интеграции устройств и движок автоматизации HA в паре с гибким, полностью локальным голосовым стеком OVOS.

В этой статье рассматриваются три слоя интеграции: мосты Wyoming для голосового конвейера HA, ovos-persona-server в роли разговорного агента и HiveMind для отображения устройств OVOS как нативных сущностей HA.

-----

## Дайте Home Assistant голос на базе OVOS

Протокол Wyoming — это стандартный интерфейс HA для внешних сервисов ASR, TTS и распознавания слова активации. Мы построили мосты Wyoming, которые предоставляют любой плагин OVOS по этому протоколу, — а значит, HA получает доступ к каждому плагину в экосистеме OVOS, а не только к отобранному короткому списку.


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): преобразует голосовые команды в текст, понятный Home Assistant.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): позволяет Home Assistant озвучивать ответы, используя разнообразные голосовые варианты OVOS.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): интегрирует пользовательские слова активации, позволяя вашей установке Home Assistant реагировать только когда она слышит выбранную вами триггерную фразу.

Проект [OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) упаковывает эти сервисы так, что до них — один `docker compose up`.

### **Из плагинов: многоязычный TTS на базе ILENIA**

Для нас доступность имеет ключевое значение. В том числе языковая доступность. Мы гордимся тем, что эта интеграция позволяет нам донести высококачественные, публично финансируемые голоса из таких проектов, как [**ILENIA**](https://proyectoilenia.es/), до более широкой аудитории. Пользователи Home Assistant получают естественно звучащие голоса для таких языков, как каталанский и галисийский, прямо от проектов, которые их создали.

* **Matxa TTS для каталанского:** [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) предоставляет возможности многодикторного синтеза речи для каталанского языка.
* **NosTTS для галисийского:** [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) предлагает надёжный синтез речи на галисийском.

![Логотип ILENIA](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **Настройка сервисов Wyoming в Home Assistant:**

При настройке сервисов Wyoming в Home Assistant вы обычно обращаетесь к [официальной документации Home Assistant](https://www.home-assistant.io/integrations/wyoming/). Этот процесс обычно сводится к простому вводу IP-адреса вашего Docker-контейнера (или хоста, на котором работают ваши сервисы OVOS Wyoming) в веб-интерфейс Home Assistant.

![настройка wyoming в Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![сущности wyoming в Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## Пусть OVOS станет мозгом разговора

Хотите пойти ещё дальше? Вы можете настроить OVOS как полноценного разговорного агента для Home Assistant с помощью **интеграции Ollama**.

![настройка ollama в Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


В такой конфигурации Home Assistant передаёт текст пользователя в [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/); OVOS определяет намерение и возвращает ответ, который Home Assistant озвучивает. А поскольку [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) предоставляет совместимые с Ollama конечные точки, тот же сервер подключается к любому приложению, говорящему на API Ollama или OpenAI, — не только к Home Assistant.

![чат с OVOS в Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS с Voice PE

[Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) — это выделенный аппаратный сателлит для голосового конвейера HA. Он работает со всеми описанными выше сервисами Wyoming — направьте его на любой запущенный экземпляр wyoming-ovos-stt, wyoming-ovos-tts или wyoming-ovos-wakeword.

![Настройка Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## Пригласите ваши устройства OVOS в Home Assistant с помощью HiveMind

Если у вас есть выделенные устройства OVOS, интеграция [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) заставляет их отображаться как нативные сущности в Home Assistant — единая панель управления для всего парка устройств.


### **Настройка интеграции HiveMind:**

Чтобы интегрировать ваши устройства OVOS через HiveMind, вы обычно добавляете интеграцию HiveMind в Home Assistant. Это предполагает указание параметров подключения, таких как `name` для интеграции, `access_key`, `password`, `site_id`, `host` (IP-адрес или имя хоста вашего сервера HiveMind) и `port` (по умолчанию 5678). В зависимости от вашей конфигурации у вас также могут быть опции `allow_self_signed` (самоподписанные сертификаты) или включение `legacy_audio`.

![настройка HiveMind в Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **Доступные элементы управления устройствами OVOS:**

После интеграции HiveMind предоставляет исчерпывающий набор элементов управления вашими устройствами OVOS прямо в Home Assistant. Это позволяет управлять различными аспектами вашего устройства OVOS из интерфейса Home Assistant, включая:

  * Изменение `Listening Mode` (например, слово активации, постоянное прослушивание)
  * Переключатель `Microphone Mute` (отключение микрофона)
  * Статус и управление `OCP Player`
  * Действия, такие как `Reboot Device`, `Restart OVOS` и `Shutdown Device`
  * Переключение `Sleep Mode` и `SSH Service`
  * Ручной запуск прослушивания `Start Listening` или его остановка `Stop`
  * Управление уровнем громкости

![сущности HiveMind в Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **Интеграция уведомлений:**

HiveMind также позволяет вашим устройствам OVOS выступать в роли адресатов уведомлений в Home Assistant. Это означает, что вы можете настроить автоматизации Home Assistant на отправку голосовых уведомлений напрямую на ваши устройства OVOS, позволяя им «озвучивать» оповещения, напоминания или любую другую настроенную вами информацию. Это предоставляется как сущность-уведомитель «Speak» в Home Assistant.

![сервис уведомлений HiveMind в Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **Интеграция с медиаплеером и Music Assistant:**

Устройства OVOS также отображаются как стандартные медиаплееры в Home Assistant, так что вы можете управлять воспроизведением из обычного интерфейса медиаплеера. Та же интеграция распространяется на Music Assistant: транслируйте музыку через ваши устройства OVOS, и они станут частью вашей аудиосистемы всего дома.


![плеер HiveMind в Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![плеер HiveMind в Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## Дайте OVOS ключи от королевства

Поддерживаемый сообществом [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant) даёт OVOS прямое управление сущностями Home Assistant через REST API HA. Установите его на ваше устройство OVOS, и вы сможете сказать «включи свет в гостиной» или «установи термостат на 21 градус» — полностью локально, без облака.

-----

## Правильный инструмент для каждой задачи

OVOS отвечает за голос; Home Assistant отвечает за автоматизацию. Ни один из них не идёт на компромиссы, чтобы делать работу другого, а точки интеграции достаточно чистые, чтобы каждый проект сохранял собственный цикл выпусков.

Сообщения об ошибках и PR приветствуются во всех репозиториях, указанных выше.

---

OpenVoiceOS — это проект сообщества. Если вы считаете, что голосовые ассистенты должны быть открытыми, инклюзивными и подконтрольными пользователю, [поддержите проект](https://www.openvoiceos.org/contribution) финансированием, открытыми данными или переводами.
