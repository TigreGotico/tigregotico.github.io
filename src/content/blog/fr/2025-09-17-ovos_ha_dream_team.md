---
title: "OpenVoiceOS et Home Assistant : l'équipe de rêve de l'automatisation vocale"
description: "Home Assistant gère l'automatisation ; OVOS gère la voix. Trois couches d'intégration font fonctionner la combinaison : les ponts Wyoming pour le pipeline vocal de HA, ovos-persona-server comme agent conversationnel, et HiveMind pour exposer les appareils OVOS en tant qu'entités natives de HA."
date: 2025-09-17
lang: fr
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> Cet article a été initialement publié sur le [blog d'OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)

Home Assistant gère l'automatisation ; OVOS gère la voix. Aucun ne cherche à être l'autre. C'est cette répartition des responsabilités qui fait fonctionner la combinaison : les intégrations d'appareils et le moteur d'automatisation de HA associés à la stack vocale flexible et entièrement locale d'OVOS.

Cet article couvre les trois couches d'intégration : les ponts Wyoming pour le pipeline vocal de HA, ovos-persona-server comme agent conversationnel, et HiveMind pour exposer les appareils OVOS en tant qu'entités natives de HA.

-----

## Donnez à Home Assistant une voix propulsée par OVOS

Le protocole Wyoming est l'interface standard de HA pour les services externes de STT, TTS et mot d'activation. Nous avons construit des ponts Wyoming qui exposent n'importe quel plugin OVOS via ce protocole — ce qui signifie que HA obtient l'accès à tous les plugins de l'écosystème OVOS, et pas seulement à une liste restreinte et sélectionnée.


* [Wyoming OVOS STT](https://github.com/TigreGotico/wyoming-ovos-stt) : convertit les commandes vocales en texte pour que Home Assistant les comprenne.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts) : permet à Home Assistant d'énoncer les réponses en utilisant les diverses options de voix d'OVOS.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword) : intègre des mots d'activation personnalisés, permettant à votre configuration Home Assistant de répondre uniquement lorsqu'elle entend la phrase de déclenchement que vous avez choisie.

Le projet [OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) empaquette ces services de sorte qu'ils ne soient qu'à un `docker compose up` de distance.

### **Points forts des plugins : TTS multilingue propulsé par ILENIA**

Pour nous, l'accessibilité est essentielle. Cela inclut l'accessibilité linguistique. Nous sommes fiers que cette intégration nous permette d'apporter des voix de haute qualité et financées publiquement, issues de projets comme [**ILENIA**](https://proyectoilenia.es/), à un public plus large. Les utilisateurs de Home Assistant obtiennent des voix au son naturel pour des langues comme le catalan et le galicien, directement des projets qui les ont construites.

* **Matxa TTS pour le catalan :** le [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) fournit des capacités de synthèse vocale multi-locuteur pour la langue catalane.
* **NosTTS pour le galicien :** le [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) offre une synthèse vocale robuste en galicien.

![logo ILENIA](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **Configurer les services Wyoming dans Home Assistant :**

Lors de la configuration des services Wyoming dans Home Assistant, vous consulterez généralement la [documentation officielle de Home Assistant](https://www.home-assistant.io/integrations/wyoming/). Ce processus consiste généralement à simplement saisir l'adresse IP de votre conteneur Docker (ou de l'hôte qui exécute vos services OVOS Wyoming) dans l'interface web de Home Assistant.

![configuration de wyoming dans Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![entités wyoming dans Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## Laissez OVOS être le cerveau de la conversation

Vous voulez aller un pas plus loin ? Vous pouvez configurer OVOS comme un agent conversationnel à part entière pour Home Assistant en utilisant l'**intégration Ollama**.

![configuration d'ollama dans Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


Dans cette configuration, Home Assistant transmet le texte de l'utilisateur au [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/) ; OVOS détermine l'intention et renvoie la réponse pour que Home Assistant l'énonce. Et comme [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) expose des points de terminaison compatibles avec Ollama, le même serveur se branche sur n'importe quelle application qui parle les API Ollama ou OpenAI — et pas seulement Home Assistant.

![conversation avec OVOS dans Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS avec le Voice PE

La [Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) est un satellite matériel dédié au pipeline vocal de HA. Elle fonctionne avec tous les services Wyoming décrits ci-dessus — pointez-la vers n'importe quelle instance en cours d'exécution de wyoming-ovos-stt, wyoming-ovos-tts ou wyoming-ovos-wakeword.

![Configuration de la Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## Accueillez vos appareils OVOS dans Home Assistant avec HiveMind

Si vous avez des appareils OVOS dédiés, l'intégration [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) fait en sorte qu'ils apparaissent comme des entités natives dans Home Assistant — un panneau de contrôle unifié pour l'ensemble du parc.


### **Configurer l'intégration HiveMind :**

Pour intégrer vos appareils OVOS via HiveMind, vous ajouterez généralement l'intégration HiveMind dans Home Assistant. Cela implique de fournir des détails de connexion tels qu'un `name` pour l'intégration, une `access_key`, un `password`, un `site_id`, un `host` (adresse IP ou nom d'hôte de votre serveur HiveMind) et le `port` (par défaut 5678). Vous pourrez aussi avoir des options pour `allow_self_signed` (autoriser les certificats auto-signés) ou activer `legacy_audio`, selon votre configuration.

![configuration de HiveMind dans Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **Contrôles exposés pour les appareils OVOS :**

Une fois intégré, HiveMind expose un ensemble complet de contrôles pour vos appareils OVOS directement au sein de Home Assistant. Cela vous permet de gérer divers aspects de votre appareil OVOS depuis l'interface de Home Assistant, notamment :

  * Changer le `Listening Mode` (par exemple, mot d'activation, écoute permanente)
  * Basculer le `Microphone Mute`
  * L'état et les contrôles de l'`OCP Player`
  * Des actions comme `Reboot Device`, `Restart OVOS` et `Shutdown Device`
  * Basculer le `Sleep Mode` et le `SSH Service`
  * Démarrer manuellement l'écoute (`Start Listening`) ou l'arrêter (`Stop`)
  * Contrôler le niveau de volume

![entités HiveMind dans Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **Intégration des notifications :**

HiveMind permet également à vos appareils OVOS de fonctionner comme cibles de notification au sein de Home Assistant. Cela signifie que vous pouvez configurer des automatisations Home Assistant pour envoyer des notifications vocales directement à vos appareils OVOS, leur permettant d'« énoncer » des alertes, des rappels ou toute autre information que vous configurez. Ceci est exposé comme une entité notificatrice « Speak » dans Home Assistant.

![service de notification HiveMind dans Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **Intégration avec Media Player et Music Assistant :**

Les appareils OVOS apparaissent également comme des lecteurs multimédias standard dans Home Assistant, de sorte que vous pouvez contrôler la lecture depuis l'interface habituelle du lecteur multimédia. La même intégration s'étend à Music Assistant : diffusez de la musique via vos appareils OVOS et ils deviennent partie intégrante de votre système audio pour toute la maison.


![lecteur HiveMind dans Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![lecteur HiveMind dans Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## Donnez à OVOS les clés du royaume

La skill [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant), maintenue par la communauté, donne à OVOS un contrôle direct sur les entités de Home Assistant via l'API REST de HA. Installez-la sur votre appareil OVOS et vous pourrez dire « allume les lumières du salon » ou « règle le thermostat à 21 degrés » — entièrement local, sans cloud.

-----

## Le bon outil pour chaque tâche

OVOS gère la voix ; Home Assistant gère l'automatisation. Aucun ne fait de compromis pour accomplir le travail de l'autre, et les points d'intégration sont suffisamment propres pour que chaque projet conserve son propre cycle de publication.

Les rapports de bugs et les PR sont les bienvenus dans tous les dépôts liés ci-dessus.

---

OpenVoiceOS est un projet communautaire — si vous pensez que les assistants vocaux devraient être ouverts, inclusifs et contrôlés par l'utilisateur, [soutenez le projet](https://www.openvoiceos.org/contribution) avec du financement, des données ouvertes ou des traductions.
