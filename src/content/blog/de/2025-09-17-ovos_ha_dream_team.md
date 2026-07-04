---
title: "OpenVoiceOS und Home Assistant: Ein Traumteam der Sprachautomatisierung"
description: "Home Assistant übernimmt die Automatisierung; OVOS übernimmt die Sprache. Drei Integrationsebenen lassen die Kombination funktionieren: Wyoming-Brücken für die Sprachpipeline von HA, ovos-persona-server als Konversationsagent und HiveMind, um OVOS-Geräte als native HA-Entitäten sichtbar zu machen."
date: 2025-09-17
lang: de
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> Dieser Blogbeitrag wurde ursprünglich im [OpenVoiceOS-Blog](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team) veröffentlicht

Home Assistant übernimmt die Automatisierung; OVOS übernimmt die Sprache. Keines versucht, das andere zu sein. Genau diese Aufteilung der Zuständigkeiten lässt die Kombination funktionieren: die Geräteintegrationen und die Automatisierungs-Engine von HA zusammen mit dem flexiblen, vollständig lokalen Sprach-Stack von OVOS.

Dieser Beitrag behandelt die drei Integrationsebenen: Wyoming-Brücken für die Sprachpipeline von HA, ovos-persona-server als Konversationsagent und HiveMind, um OVOS-Geräte als native HA-Entitäten sichtbar zu machen.

-----

## Geben Sie Home Assistant eine von OVOS betriebene Stimme

Das Wyoming-Protokoll ist die Standardschnittstelle von HA für externe ASR-, TTS- und Wakeword-Dienste. Wir haben Wyoming-Brücken gebaut, die jedes OVOS-Plugin über dieses Protokoll bereitstellen — das bedeutet, dass HA Zugriff auf jedes Plugin im OVOS-Ökosystem erhält, nicht nur auf eine kuratierte Auswahl.


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): Wandelt gesprochene Befehle in Text um, den Home Assistant verstehen kann.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): Ermöglicht es Home Assistant, Antworten mit den vielfältigen Stimmoptionen von OVOS zu sprechen.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): Integriert benutzerdefinierte Wakewords, sodass Ihre Home-Assistant-Installation nur reagiert, wenn sie die von Ihnen gewählte Auslösephrase hört.

Das Projekt [OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) paketiert diese Dienste, sodass sie nur ein `docker compose up` entfernt sind.

### **Plugin-Highlights: Mehrsprachige TTS mit der Kraft von ILENIA**

Für uns ist Zugänglichkeit entscheidend. Dazu gehört auch sprachliche Zugänglichkeit. Wir sind stolz darauf, dass diese Integration es uns ermöglicht, hochwertige, öffentlich finanzierte Stimmen aus Projekten wie [**ILENIA**](https://proyectoilenia.es/) einem breiteren Publikum zugänglich zu machen. Home-Assistant-Nutzer erhalten natürlich klingende Stimmen für Sprachen wie Katalanisch und Galicisch, direkt von den Projekten, die sie erstellt haben.

* **Matxa TTS für Katalanisch:** Das [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) bietet Multi-Speaker-Sprachsynthese für die katalanische Sprache.
* **NosTTS für Galicisch:** Das [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) bietet robuste Sprachsynthese auf Galicisch.

![ILENIA-Logo](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **Wyoming-Dienste in Home Assistant einrichten:**

Beim Konfigurieren von Wyoming-Diensten in Home Assistant werden Sie normalerweise die [offizielle Home-Assistant-Dokumentation](https://www.home-assistant.io/integrations/wyoming/) heranziehen. Dieser Vorgang besteht in der Regel lediglich darin, die IP-Adresse Ihres Docker-Containers (oder des Hosts, auf dem Ihre OVOS-Wyoming-Dienste laufen) in die Weboberfläche von Home Assistant einzutragen.

![Wyoming-Einrichtung in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![Wyoming-Entitäten in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## Lassen Sie OVOS das Gehirn der Konversation sein

Möchten Sie einen Schritt weiter gehen? Sie können OVOS mit der **Ollama-Integration** als vollwertigen Konversationsagenten für Home Assistant einrichten.

![Ollama-Einrichtung in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


In dieser Konfiguration übergibt Home Assistant den Text des Nutzers an den [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/); OVOS ermittelt die Intention und gibt die Antwort zurück, die Home Assistant sprechen soll. Und da der [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) Ollama-kompatible Endpunkte bereitstellt, lässt sich derselbe Server an jede Anwendung anschließen, die die Ollama- oder OpenAI-APIs spricht — nicht nur an Home Assistant.

![Chat mit OVOS in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS mit der Voice PE

Die [Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) ist ein dedizierter Hardware-Satellit für die Sprachpipeline von HA. Sie funktioniert mit allen oben beschriebenen Wyoming-Diensten — richten Sie sie einfach auf eine beliebige laufende Instanz von wyoming-ovos-stt, wyoming-ovos-tts oder wyoming-ovos-wakeword.

![Konfiguration der Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## Heißen Sie Ihre OVOS-Geräte mit HiveMind in Home Assistant willkommen

Wenn Sie dedizierte OVOS-Geräte haben, sorgt die Integration [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) dafür, dass sie als native Entitäten in Home Assistant erscheinen — ein einheitliches Bedienfeld für den gesamten Geräteverbund.


### **Die HiveMind-Integration einrichten:**

Um Ihre OVOS-Geräte über HiveMind zu integrieren, fügen Sie normalerweise die HiveMind-Integration in Home Assistant hinzu. Dazu geben Sie Verbindungsdetails an wie einen `name` für die Integration, einen `access_key`, ein `password`, eine `site_id`, einen `host` (IP-Adresse oder Hostname Ihres HiveMind-Servers) und den `port` (standardmäßig 5678). Je nach Konfiguration haben Sie möglicherweise auch Optionen, um `allow_self_signed`-Zertifikate zuzulassen oder `legacy_audio` zu aktivieren.

![HiveMind-Einrichtung in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **Bereitgestellte Steuerungen für OVOS-Geräte:**

Nach der Integration stellt HiveMind einen umfassenden Satz an Steuerungen für Ihre OVOS-Geräte direkt innerhalb von Home Assistant bereit. Damit können Sie verschiedene Aspekte Ihres OVOS-Geräts über die Home-Assistant-Oberfläche verwalten, darunter:

  * Ändern des `Listening Mode` (z. B. Wakeword, dauerhaftes Zuhören)
  * Umschalten von `Microphone Mute`
  * Status und Steuerung des `OCP Player`
  * Aktionen wie `Reboot Device`, `Restart OVOS` und `Shutdown Device`
  * Umschalten von `Sleep Mode` und `SSH Service`
  * Manuelles Starten (`Start Listening`) oder Stoppen (`Stop`) des Zuhörens
  * Steuern der Lautstärke

![HiveMind-Entitäten in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **Integration von Benachrichtigungen:**

HiveMind ermöglicht es Ihren OVOS-Geräten außerdem, als Benachrichtigungsziele innerhalb von Home Assistant zu fungieren. Das bedeutet, Sie können Home-Assistant-Automatisierungen so konfigurieren, dass sie gesprochene Benachrichtigungen direkt an Ihre OVOS-Geräte senden, sodass diese Warnungen, Erinnerungen oder beliebige andere von Ihnen konfigurierte Informationen "sprechen" können. Dies wird in Home Assistant als "Speak"-Benachrichtiger-Entität bereitgestellt.

![HiveMind-Benachrichtigungsdienst in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **Integration mit Media Player und Music Assistant:**

OVOS-Geräte erscheinen auch als normale Media Player in Home Assistant, sodass Sie die Wiedergabe über die gewohnte Media-Player-Oberfläche steuern können. Dieselbe Integration erstreckt sich auf Music Assistant: Streamen Sie Musik über Ihre OVOS-Geräte, und sie werden Teil Ihres hausweiten Audiosystems.


![HiveMind-Player in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![HiveMind-Player in Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## Geben Sie OVOS die Schlüssel zum Königreich

Der von der Gemeinschaft gepflegte [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant) gibt OVOS über die HA-REST-API direkte Kontrolle über Home-Assistant-Entitäten. Installieren Sie ihn auf Ihrem OVOS-Gerät, und Sie können sagen "schalte das Wohnzimmerlicht ein" oder "stelle das Thermostat auf 21 Grad" — vollständig lokal, ohne Cloud.

-----

## Das richtige Werkzeug für jede Aufgabe

OVOS übernimmt die Sprache; Home Assistant übernimmt die Automatisierung. Keines geht Kompromisse ein, um die Aufgabe des anderen zu erledigen, und die Integrationspunkte sind sauber genug, dass jedes Projekt seinen eigenen Release-Zyklus behält.

Fehlerberichte und PRs sind in allen oben verlinkten Repositorys willkommen.

---

OpenVoiceOS ist ein Gemeinschaftsprojekt — wenn Sie der Meinung sind, dass Sprachassistenten offen, inklusiv und benutzergesteuert sein sollten, [unterstützen Sie das Projekt](https://www.openvoiceos.org/contribution) mit Finanzierung, offenen Daten oder Übersetzungen.
