---
title: "OpenVoiceOS en Home Assistant: een droomteam voor spraakautomatisering"
description: "Home Assistant verzorgt de automatisering; OVOS verzorgt de spraak. Drie integratielagen maken de combinatie mogelijk: Wyoming-bruggen voor de spraakpijplijn van HA, ovos-persona-server als conversationele agent, en HiveMind om OVOS-apparaten als native HA-entiteiten weer te geven."
date: 2025-09-17
lang: nl
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> Deze blog werd oorspronkelijk gepubliceerd op de [OpenVoiceOS-blog](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)

Home Assistant verzorgt de automatisering; OVOS verzorgt de spraak. Geen van beide probeert het andere te zijn. Juist die verdeling van verantwoordelijkheden zorgt ervoor dat de combinatie werkt: de apparaatintegraties en automatiseringsengine van HA gekoppeld aan de flexibele, volledig lokale spraakstack van OVOS.

Dit artikel behandelt de drie integratielagen: Wyoming-bruggen voor de spraakpijplijn van HA, ovos-persona-server als conversationele agent, en HiveMind om OVOS-apparaten als native HA-entiteiten weer te geven.

-----

## Wyoming-bruggen: OVOS-spraakplugins in Home Assistant

Het Wyoming-protocol is de standaardinterface van HA voor externe ASR-, TTS- en wakeword-diensten. We hebben Wyoming-bruggen gebouwd die elke OVOS-plugin via dat protocol beschikbaar maken — wat betekent dat HA toegang krijgt tot elke plugin in het OVOS-ecosysteem, en niet slechts tot een zorgvuldig samengestelde selectie.


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): Zet gesproken opdrachten om in tekst zodat Home Assistant ze kan begrijpen.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): Stelt Home Assistant in staat antwoorden uit te spreken met de uiteenlopende stemopties van OVOS.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): Integreert aangepaste wakewords, zodat uw Home Assistant-opstelling alleen reageert wanneer ze de door u gekozen triggerzin hoort.

Het project [OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) verpakt deze diensten zodat ze slechts één `docker compose up` verwijderd zijn.

### Meertalige TTS van publiek gefinancierde taalprojecten

Toegankelijkheid omvat ook talige toegankelijkheid. Deze integratie brengt hoogwaardige, publiek gefinancierde stemmen van projecten als **[ILENIA](https://proyectoilenia.es/demostradores-2025/prototipo-ovos/)** bij een breder publiek. Home Assistant-gebruikers krijgen natuurlijk klinkende stemmen voor talen als het Catalaans en het Galicisch, rechtstreeks van de projecten die ze hebben gebouwd.

* **Matxa TTS voor Catalaans:** De [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) biedt tekst-naar-spraakmogelijkheden met meerdere sprekers voor de Catalaanse taal.
* **NosTTS voor Galicisch:** De [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) biedt robuuste tekst-naar-spraak in het Galicisch.

![ILENIA-logo](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

-----

## OVOS gebruiken als conversationele agent voor Home Assistant

Wilt u nog een stap verder gaan? U kunt OVOS instellen als een volwaardige conversationele agent voor Home Assistant met de **Ollama-integratie**.

![ollama-configuratie in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


In deze opstelling geeft Home Assistant de tekst van de gebruiker door aan de [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/); OVOS bepaalt de intentie en geeft het antwoord terug zodat Home Assistant het kan uitspreken. En omdat de [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) Ollama-compatibele endpoints beschikbaar maakt, sluit dezelfde server aan op elke applicatie die de Ollama- of OpenAI-API's spreekt — en niet alleen op Home Assistant.

![chatten met OVOS in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS met de Voice PE

De [Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) is een toegewijde hardwaresatelliet voor de spraakpijplijn van HA. Ze werkt met alle hierboven beschreven Wyoming-diensten — richt ze op elke draaiende instantie van wyoming-ovos-stt, wyoming-ovos-tts of wyoming-ovos-wakeword.

![De Home Assistant Voice Preview Edition configureren](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## OVOS-apparaten weergeven als Home Assistant-entiteiten met HiveMind

Als u toegewijde OVOS-apparaten hebt, zorgt de integratie [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) ervoor dat ze als native entiteiten in Home Assistant verschijnen — één verenigd bedieningspaneel voor het hele geheel.


### **De HiveMind-integratie instellen:**

Om uw OVOS-apparaten via HiveMind te integreren, voegt u doorgaans de HiveMind-integratie toe in Home Assistant. Dit houdt in dat u verbindingsgegevens opgeeft zoals een `name` voor de integratie, een `access_key`, `password`, `site_id`, `host` (IP-adres of hostnaam van uw HiveMind-server) en de `port` (standaard 5678). Mogelijk hebt u ook opties om `allow_self_signed`-certificaten toe te staan of `legacy_audio` in te schakelen, afhankelijk van uw opstelling.

![HiveMind-configuratie in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **Blootgestelde bedieningselementen voor OVOS-apparaten:**

Eenmaal geïntegreerd biedt HiveMind een uitgebreide set bedieningselementen voor uw OVOS-apparaten rechtstreeks binnen Home Assistant. Hiermee kunt u vanuit de Home Assistant-interface diverse aspecten van uw OVOS-apparaat beheren, waaronder:

  * De `Listening Mode` wijzigen (bijvoorbeeld wakeword, permanent luisteren)
  * De `Microphone Mute` in- of uitschakelen
  * Status en bediening van de `OCP Player`
  * Acties zoals `Reboot Device`, `Restart OVOS` en `Shutdown Device`
  * De `Sleep Mode` en de `SSH Service` in- of uitschakelen
  * Handmatig luisteren starten (`Start Listening`) of stoppen (`Stop`)
  * Het volumeniveau regelen

![HiveMind-entiteiten in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **Integratie van notificaties:**

HiveMind stelt uw OVOS-apparaten ook in staat om als notificatiebestemmingen binnen Home Assistant te functioneren. Dit betekent dat u Home Assistant-automatiseringen kunt configureren om gesproken notificaties rechtstreeks naar uw OVOS-apparaten te sturen, zodat ze waarschuwingen, herinneringen of andere door u geconfigureerde informatie kunnen "uitspreken". Dit wordt beschikbaar gemaakt als een "Speak"-notificatie-entiteit in Home Assistant.

![HiveMind-notificatiedienst in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **Integratie met Media Player en Music Assistant:**

OVOS-apparaten verschijnen ook als standaard mediaspelers in Home Assistant, zodat u de weergave kunt bedienen vanuit de gebruikelijke mediaspeler-interface. Dezelfde integratie strekt zich uit tot Music Assistant: stream muziek via uw OVOS-apparaten en ze worden onderdeel van uw audiosysteem voor het hele huis.


![HiveMind-speler in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![HiveMind-speler in Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## Home Assistant-entiteiten aansturen vanuit OVOS

De door de gemeenschap onderhouden [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant) geeft OVOS directe controle over Home Assistant-entiteiten via de HA REST-API. Installeer ze op uw OVOS-apparaat en u kunt zeggen "doe de lichten in de woonkamer aan" of "zet de thermostaat op 21 graden" — volledig lokaal, zonder cloud.

-----

## Wat nog ruw is

De Wyoming-bruggen en de HiveMind-integratie zijn hier het meest volwassen; het pad van de persona-server als conversationele agent is nieuwer en het eerste dat u moet proberen als u wilt zien wat het plafond is van wat OVOS + HA samen kunnen. Bugrapporten en PR's zijn welkom in alle hierboven gelinkte repositories.

---

OpenVoiceOS is een gemeenschapsproject — als u van mening bent dat spraakassistenten open, inclusief en door de gebruiker beheerd moeten zijn, [steun het project](https://www.openvoiceos.org/contribution) met financiering, open data of vertalingen.
