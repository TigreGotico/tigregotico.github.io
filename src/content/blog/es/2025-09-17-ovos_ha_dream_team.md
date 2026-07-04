---
title: "OpenVoiceOS y Home Assistant: El Equipo de Ensueño de la Automatización por Voz"
description: "Home Assistant se encarga de la automatización; OVOS se encarga de la voz. Tres capas de integración hacen que la combinación funcione: puentes Wyoming para la canalización de voz de HA, ovos-persona-server como agente conversacional y HiveMind para exponer los dispositivos OVOS como entidades nativas de HA."
date: 2025-09-17
lang: es
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> Este artículo se publicó originalmente en el [blog de OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)

Home Assistant se encarga de la automatización; OVOS se encarga de la voz. Ninguno intenta ser el otro. Es esa división de responsabilidades la que hace que la combinación funcione: las integraciones de dispositivos y el motor de automatización de HA junto con la pila de voz flexible y totalmente local de OVOS.

Este artículo cubre las tres capas de integración: puentes Wyoming para la canalización de voz de HA, ovos-persona-server como agente conversacional y HiveMind para exponer los dispositivos OVOS como entidades nativas de HA.

-----

## Dale a Home Assistant una Voz con la Potencia de OVOS

El protocolo Wyoming es la interfaz estándar de HA para servicios externos de ASR, TTS y palabra de activación. Hemos construido puentes Wyoming que exponen cualquier plugin OVOS a través de ese protocolo, lo que significa que HA obtiene acceso a todos los plugins del ecosistema OVOS, y no solo a una lista restringida y seleccionada.


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): Convierte los comandos hablados en texto para que Home Assistant los entienda.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): Permite que Home Assistant hable las respuestas usando las diversas opciones de voz de OVOS.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): Integra palabras de activación personalizadas, permitiendo que tu configuración de Home Assistant responda solo cuando oye la frase de activación que hayas elegido.

El proyecto [OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) empaqueta estos servicios de forma que quedan a un `docker compose up` de distancia.

### **Plugins Destacados: TTS multilingüe con la potencia de ILENIA**

Para nosotros, la accesibilidad es fundamental. Eso incluye la accesibilidad lingüística. Nos enorgullece que esta integración nos permita llevar voces de alta calidad y financiadas con fondos públicos, procedentes de proyectos como [**ILENIA**](https://proyectoilenia.es/), a un público más amplio. Los usuarios de Home Assistant obtienen voces de sonido natural para lenguas como el catalán y el gallego, directamente de los proyectos que las construyeron.

* **Matxa TTS para catalán:** El [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) proporciona capacidades de síntesis de voz multilocutor para la lengua catalana.
* **NosTTS para gallego:** El [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) ofrece una síntesis de voz robusta en gallego.

![logotipo de ILENIA](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **Configurar Servicios Wyoming en Home Assistant:**

Al configurar servicios Wyoming en Home Assistant, normalmente consultarás la [documentación oficial de Home Assistant](https://www.home-assistant.io/integrations/wyoming/). Este proceso suele consistir simplemente en introducir la dirección IP de tu contenedor Docker (o del anfitrión que ejecuta tus servicios OVOS Wyoming) en la interfaz web de Home Assistant.

![configuración de wyoming en Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![entidades wyoming en Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## Deja que OVOS Sea el Cerebro de la Conversación

¿Quieres ir un paso más allá? Puedes configurar OVOS como un agente conversacional completo para Home Assistant usando la **integración Ollama**.

![configuración de ollama en Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


En esta configuración, Home Assistant pasa el texto del usuario al [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/); OVOS determina la intención y devuelve la respuesta para que Home Assistant la hable. Y como el [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) expone endpoints compatibles con Ollama, el mismo servidor se conecta a cualquier aplicación que hable las APIs de Ollama o de OpenAI, y no solo a Home Assistant.

![conversar con OVOS en Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS con el Voice PE

La [Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) es un satélite de hardware dedicado a la canalización de voz de HA. Funciona con todos los servicios Wyoming descritos anteriormente: basta con apuntarla a cualquier instancia en ejecución de wyoming-ovos-stt, wyoming-ovos-tts o wyoming-ovos-wakeword.

![Configurar la Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## Da la Bienvenida a Tus Dispositivos OVOS en Home Assistant con HiveMind

Si tienes dispositivos OVOS dedicados, la integración [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) hace que aparezcan como entidades nativas en Home Assistant: un panel de control unificado para todo el conjunto de dispositivos.


### **Configurar la Integración HiveMind:**

Para integrar tus dispositivos OVOS a través de HiveMind, normalmente añadirás la integración HiveMind en Home Assistant. Esto implica proporcionar detalles de conexión como un `name` para la integración, una `access_key`, `password`, `site_id`, `host` (dirección IP o nombre de anfitrión de tu servidor HiveMind) y el `port` (5678 por defecto). También puedes tener opciones para `allow_self_signed` (permitir certificados autofirmados) o activar `legacy_audio`, según tu configuración.

![configuración de HiveMind en Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **Controles Expuestos para Dispositivos OVOS:**

Una vez integrado, HiveMind expone un conjunto completo de controles para tus dispositivos OVOS directamente dentro de Home Assistant. Esto te permite gestionar diversos aspectos de tu dispositivo OVOS desde la interfaz de Home Assistant, incluyendo:

  * Cambiar el `Listening Mode` (por ejemplo, palabra de activación, escucha permanente)
  * Alternar el `Microphone Mute`
  * Estado y controles del `OCP Player`
  * Acciones como `Reboot Device`, `Restart OVOS` y `Shutdown Device`
  * Alternar el `Sleep Mode` y el `SSH Service`
  * Iniciar manualmente la escucha (`Start Listening`) o detenerla (`Stop`)
  * Controlar el nivel de volumen

![entidades HiveMind en Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **Integración de Notificaciones:**

HiveMind también permite que tus dispositivos OVOS funcionen como destinatarios de notificaciones dentro de Home Assistant. Esto significa que puedes configurar automatizaciones de Home Assistant para enviar notificaciones habladas directamente a tus dispositivos OVOS, permitiendo que "hablen" alertas, recordatorios o cualquier otra información que configures. Esto se expone como una entidad de notificación "Speak" en Home Assistant.

![servicio de notificaciones HiveMind en Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **Integración con Media Player y Music Assistant:**

Los dispositivos OVOS también aparecen como reproductores multimedia normales en Home Assistant, por lo que puedes controlar la reproducción desde la interfaz habitual de reproductor multimedia. La misma integración se extiende a Music Assistant: transmite música a través de tus dispositivos OVOS y estos pasan a formar parte de tu sistema de audio para toda la casa.


![reproductor HiveMind en Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![reproductor HiveMind en Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## Dale a OVOS las Llaves del Reino

La skill [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant), mantenida por la comunidad, da a OVOS control directo sobre las entidades de Home Assistant a través de la API REST de HA. Instálala en tu dispositivo OVOS y podrás decir "enciende las luces del salón" o "pon el termostato a 21 grados", totalmente local, sin nube.

-----

## La Herramienta Adecuada para Cada Tarea

OVOS se encarga de la voz; Home Assistant se encarga de la automatización. Ninguno se compromete para hacer el trabajo del otro, y los puntos de integración son lo bastante limpios como para que cada proyecto mantenga su propio ciclo de lanzamiento.

Los informes de errores y los PR son bienvenidos en todos los repositorios enlazados anteriormente.

---

OpenVoiceOS es un proyecto comunitario: si crees que los asistentes de voz deben ser abiertos, inclusivos y controlados por el usuario, [apoya el proyecto](https://www.openvoiceos.org/contribution) con financiación, datos abiertos o traducciones.
