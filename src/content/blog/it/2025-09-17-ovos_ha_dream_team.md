---
title: "OpenVoiceOS e Home Assistant: la Dream Team dell'automazione vocale"
description: "Home Assistant si occupa dell'automazione; OVOS si occupa della voce. Tre livelli di integrazione fanno funzionare la combinazione: i ponti Wyoming per la pipeline vocale di HA, ovos-persona-server come agente conversazionale e HiveMind per esporre i dispositivi OVOS come entità native di HA."
date: 2025-09-17
lang: it
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> Questo articolo è stato originariamente pubblicato sul [blog di OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)

Home Assistant si occupa dell'automazione; OVOS si occupa della voce. Nessuno dei due cerca di essere l'altro. È questa divisione delle responsabilità a far funzionare la combinazione: le integrazioni dei dispositivi e il motore di automazione di HA in coppia con lo stack vocale flessibile e completamente locale di OVOS.

Questo articolo illustra i tre livelli di integrazione: i ponti Wyoming per la pipeline vocale di HA, ovos-persona-server come agente conversazionale e HiveMind per esporre i dispositivi OVOS come entità native di HA.

-----

## Dai a Home Assistant una voce alimentata da OVOS

Il protocollo Wyoming è l'interfaccia standard di HA per i servizi esterni di ASR, TTS e parola di attivazione. Abbiamo costruito ponti Wyoming che espongono qualsiasi plugin OVOS tramite questo protocollo, il che significa che HA ottiene l'accesso a ogni plugin dell'ecosistema OVOS, non solo a una ristretta lista selezionata.


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): Converte i comandi vocali in testo affinché Home Assistant li comprenda.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): Consente a Home Assistant di pronunciare le risposte utilizzando le diverse opzioni vocali di OVOS.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): Integra parole di attivazione personalizzate, permettendo al tuo Home Assistant di rispondere solo quando sente la frase di attivazione che hai scelto.

Il progetto [OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) impacchetta questi servizi in modo che siano a un solo `docker compose up` di distanza.

### **In evidenza tra i plugin: TTS multilingue alimentato da ILENIA**

Per noi, l'accessibilità è fondamentale. Ciò include l'accessibilità linguistica. Siamo orgogliosi che questa integrazione ci consenta di portare voci di alta qualità e finanziate con fondi pubblici, da progetti come [**ILENIA**](https://proyectoilenia.es/), a un pubblico più ampio. Gli utenti di Home Assistant ottengono voci dal suono naturale per lingue come il catalano e il galiziano, direttamente dai progetti che le hanno costruite.

* **Matxa TTS per il catalano:** Il plugin [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) fornisce capacità di sintesi vocale multi-speaker per la lingua catalana.
* **NosTTS per il galiziano:** Il plugin [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) offre una sintesi vocale robusta in galiziano.

![logo ILENIA](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **Configurare i servizi Wyoming in Home Assistant:**

Quando configuri i servizi Wyoming in Home Assistant, di norma farai riferimento alla [documentazione ufficiale di Home Assistant](https://www.home-assistant.io/integrations/wyoming/). Questo processo di solito richiede semplicemente di inserire l'indirizzo IP del tuo container Docker (o dell'host che esegue i tuoi servizi OVOS Wyoming) nell'interfaccia web di Home Assistant.

![configurazione di wyoming in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![entità wyoming in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## Lascia che OVOS sia il cervello della conversazione

Vuoi fare un passo in più? Puoi configurare OVOS come agente conversazionale a tutti gli effetti per Home Assistant utilizzando l'**integrazione Ollama**.

![configurazione di ollama in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


In questa configurazione, Home Assistant passa il testo dell'utente a [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/); OVOS determina l'intento e restituisce la risposta affinché Home Assistant la pronunci. E poiché [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) espone endpoint compatibili con Ollama, lo stesso server si collega a qualsiasi applicazione che parli le API di Ollama o di OpenAI, e non solo a Home Assistant.

![conversazione con OVOS in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS con la Voice PE

La [Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) è un satellite hardware dedicato alla pipeline vocale di HA. Funziona con tutti i servizi Wyoming descritti sopra: basta puntarla verso una qualsiasi istanza attiva di wyoming-ovos-stt, wyoming-ovos-tts o wyoming-ovos-wakeword.

![Configurazione della Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## Dai il benvenuto ai tuoi dispositivi OVOS in Home Assistant con HiveMind

Se hai dispositivi OVOS dedicati, l'integrazione [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) fa sì che compaiano come entità native in Home Assistant: un pannello di controllo unificato per l'intero parco dispositivi.


### **Configurare l'integrazione HiveMind:**

Per integrare i tuoi dispositivi OVOS tramite HiveMind, di norma aggiungerai l'integrazione HiveMind in Home Assistant. Ciò comporta la fornitura di dettagli di connessione come un `name` per l'integrazione, una `access_key`, `password`, `site_id`, `host` (indirizzo IP o hostname del tuo server HiveMind) e la `port` (predefinita a 5678). Potresti anche avere opzioni per `allow_self_signed` (consentire certificati autofirmati) o abilitare `legacy_audio`, a seconda della tua configurazione.

![configurazione di HiveMind in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **Controlli esposti per i dispositivi OVOS:**

Una volta integrato, HiveMind espone un insieme completo di controlli per i tuoi dispositivi OVOS direttamente all'interno di Home Assistant. Ciò ti consente di gestire vari aspetti del tuo dispositivo OVOS dall'interfaccia di Home Assistant, tra cui:

  * Modificare la `Listening Mode` (ad esempio, parola di attivazione, ascolto permanente)
  * Attivare/disattivare il `Microphone Mute`
  * Stato e controlli dell'`OCP Player`
  * Azioni come `Reboot Device`, `Restart OVOS` e `Shutdown Device`
  * Attivare/disattivare la `Sleep Mode` e l'`SSH Service`
  * Avviare manualmente l'ascolto (`Start Listening`) o fermarlo (`Stop`)
  * Controllare il livello del volume

![entità HiveMind in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **Integrazione delle notifiche:**

HiveMind consente inoltre ai tuoi dispositivi OVOS di funzionare come destinatari di notifiche all'interno di Home Assistant. Ciò significa che puoi configurare le automazioni di Home Assistant per inviare notifiche vocali direttamente ai tuoi dispositivi OVOS, permettendo loro di "pronunciare" avvisi, promemoria o qualsiasi altra informazione che configuri. Questo è esposto come entità di notifica "Speak" in Home Assistant.

![servizio di notifica HiveMind in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **Integrazione con Media Player e Music Assistant:**

I dispositivi OVOS compaiono anche come normali lettori multimediali in Home Assistant, così puoi controllare la riproduzione dalla consueta interfaccia del lettore multimediale. La stessa integrazione si estende a Music Assistant: trasmetti musica attraverso i tuoi dispositivi OVOS ed essi diventano parte del tuo sistema audio per tutta la casa.


![lettore HiveMind in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![lettore HiveMind in Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## Dai a OVOS le chiavi del regno

La skill [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant), mantenuta dalla comunità, dà a OVOS il controllo diretto sulle entità di Home Assistant tramite l'API REST di HA. Installala sul tuo dispositivo OVOS e potrai dire "accendi le luci del soggiorno" o "imposta il termostato a 21 gradi", tutto in locale, senza cloud.

-----

## Lo strumento giusto per ogni compito

OVOS si occupa della voce; Home Assistant si occupa dell'automazione. Nessuno dei due scende a compromessi per svolgere il lavoro dell'altro, e i punti di integrazione sono abbastanza puliti da consentire a ciascun progetto di mantenere il proprio ciclo di rilascio.

Segnalazioni di bug e PR sono benvenute in tutti i repository collegati sopra.

---

OpenVoiceOS è un progetto comunitario: se ritieni che gli assistenti vocali debbano essere aperti, inclusivi e controllati dall'utente, [sostieni il progetto](https://www.openvoiceos.org/contribution) con finanziamenti, dati aperti o traduzioni.
