---
title: "OpenVoiceOS e Home Assistant: A Equipa de Sonho da Automação por Voz"
description: "O Home Assistant trata da automação; o OVOS trata da voz. Três camadas de integração fazem a combinação funcionar: pontes Wyoming para a pipeline de voz do HA, o ovos-persona-server como agente conversacional e o HiveMind para expor dispositivos OVOS como entidades nativas do HA."
date: 2025-09-17
lang: pt
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> Este artigo foi originalmente publicado no [blog do OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team)

O Home Assistant trata da automação; o OVOS trata da voz. Nenhum tenta ser o outro. É essa divisão de responsabilidades que faz a combinação funcionar: as integrações de dispositivos e o motor de automação do HA em conjunto com a stack de voz flexível e totalmente local do OVOS.

Este artigo cobre as três camadas de integração: pontes Wyoming para a pipeline de voz do HA, o ovos-persona-server como agente conversacional e o HiveMind para expor dispositivos OVOS como entidades nativas do HA.

-----

## Dê ao Home Assistant uma Voz com a Potência do OVOS

O protocolo Wyoming é a interface padrão do HA para serviços externos de ASR, TTS e palavra de ativação. Construímos pontes Wyoming que expõem qualquer plugin OVOS através desse protocolo — o que significa que o HA passa a ter acesso a todos os plugins do ecossistema OVOS, e não apenas a uma lista restrita e selecionada.


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): Converte comandos falados em texto para o Home Assistant compreender.
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): Permite ao Home Assistant falar as respostas usando as diversas opções de voz do OVOS.
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): Integra palavras de ativação personalizadas, permitindo que o seu Home Assistant responda apenas quando ouve a frase de ativação que escolheu.

O projeto [OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) empacota estes serviços de forma a que fiquem a um `docker compose up` de distância.

### **Destaques de Plugins: TTS multilingue com a potência do ILENIA**

Para nós, a acessibilidade é fundamental. Isso inclui a acessibilidade linguística. Orgulhamo-nos de que esta integração nos permita levar vozes de alta qualidade e financiadas publicamente, de projetos como o [**ILENIA**](https://proyectoilenia.es/), a um público mais alargado. Os utilizadores do Home Assistant obtêm vozes com som natural para línguas como o catalão e o galego, diretamente dos projetos que as construíram.

* **Matxa TTS para catalão:** O [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) fornece capacidades de síntese de fala multi-locutor para a língua catalã.
* **NosTTS para galego:** O [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) oferece síntese de fala robusta em galego.

![logótipo ILENIA](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

### **Configurar Serviços Wyoming no Home Assistant:**

Ao configurar serviços Wyoming no Home Assistant, irá normalmente consultar a [documentação oficial do Home Assistant](https://www.home-assistant.io/integrations/wyoming/). Este processo envolve geralmente apenas introduzir o endereço IP do seu contentor Docker (ou do anfitrião que executa os seus serviços OVOS Wyoming) na interface web do Home Assistant.

![configuração do wyoming no Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_setup.png)

![entidades wyoming no Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/wyoming_menu.png)

-----

## Deixe o OVOS Ser o Cérebro da Conversa

Quer ir um passo mais além? Pode configurar o OVOS como um agente conversacional completo para o Home Assistant usando a **integração Ollama**.

![configuração do ollama no Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


Nesta configuração, o Home Assistant passa o texto do utilizador para o [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/); o OVOS determina a intenção e devolve a resposta para o Home Assistant falar. E como o [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) expõe endpoints compatíveis com o Ollama, o mesmo servidor liga-se a qualquer aplicação que fale as APIs do Ollama ou da OpenAI — e não apenas ao Home Assistant.

![conversar com o OVOS no Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS com o Voice PE

A [Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) é um satélite de hardware dedicado à pipeline de voz do HA. Funciona com todos os serviços Wyoming descritos acima — basta apontá-la para qualquer instância em execução de wyoming-ovos-stt, wyoming-ovos-tts ou wyoming-ovos-wakeword.

![Configurar a Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## Dê as Boas-Vindas aos Seus Dispositivos OVOS no Home Assistant com o HiveMind

Se tiver dispositivos OVOS dedicados, a integração [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) faz com que apareçam como entidades nativas no Home Assistant — um painel de controlo unificado para todo o conjunto de dispositivos.


### **Configurar a Integração HiveMind:**

Para integrar os seus dispositivos OVOS através do HiveMind, irá normalmente adicionar a integração HiveMind no Home Assistant. Isto implica fornecer detalhes de ligação como um `name` para a integração, uma `access_key`, `password`, `site_id`, `host` (endereço IP ou nome de anfitrião do seu servidor HiveMind) e a `port` (por predefinição, 5678). Poderá também ter opções para `allow_self_signed` (permitir certificados autoassinados) ou ativar `legacy_audio`, consoante a sua configuração.

![configuração do HiveMind no Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **Controlos Expostos para Dispositivos OVOS:**

Uma vez integrado, o HiveMind expõe um conjunto abrangente de controlos para os seus dispositivos OVOS diretamente dentro do Home Assistant. Isto permite-lhe gerir vários aspetos do seu dispositivo OVOS a partir da interface do Home Assistant, incluindo:

  * Alterar o `Listening Mode` (por exemplo, palavra de ativação, escuta permanente)
  * Alternar o `Microphone Mute`
  * Estado e controlos do `OCP Player`
  * Ações como `Reboot Device`, `Restart OVOS` e `Shutdown Device`
  * Alternar o `Sleep Mode` e o `SSH Service`
  * Iniciar manualmente a escuta (`Start Listening`) ou pará-la (`Stop`)
  * Controlar o nível de volume

![entidades HiveMind no Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **Integração de Notificações:**

O HiveMind também permite que os seus dispositivos OVOS funcionem como destinatários de notificações dentro do Home Assistant. Isto significa que pode configurar automações do Home Assistant para enviar notificações faladas diretamente para os seus dispositivos OVOS, permitindo que "falem" alertas, lembretes ou qualquer outra informação que configure. Isto é exposto como uma entidade de notificação "Speak" no Home Assistant.

![serviço de notificações HiveMind no Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **Integração com Media Player e Music Assistant:**

Os dispositivos OVOS aparecem também como leitores de multimédia normais no Home Assistant, pelo que pode controlar a reprodução a partir da interface habitual de leitor de multimédia. A mesma integração estende-se ao Music Assistant: transmita música através dos seus dispositivos OVOS e estes passam a fazer parte do seu sistema de áudio para toda a casa.


![leitor HiveMind no Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![leitor HiveMind no Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## Dê ao OVOS as Chaves do Reino

A skill [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant), mantida pela comunidade, dá ao OVOS controlo direto sobre as entidades do Home Assistant através da API REST do HA. Instale-a no seu dispositivo OVOS e poderá dizer "acende as luzes da sala" ou "coloca o termóstato a 21 graus" — totalmente local, sem cloud.

-----

## A Ferramenta Certa para Cada Tarefa

O OVOS trata da voz; o Home Assistant trata da automação. Nenhum se compromete para fazer o trabalho do outro, e os pontos de integração são suficientemente limpos para que cada projeto mantenha o seu próprio ciclo de lançamento.

Relatórios de bugs e PRs são bem-vindos em todos os repositórios ligados acima.

---

O OpenVoiceOS é um projeto comunitário — se acredita que os assistentes de voz devem ser abertos, inclusivos e controlados pelo utilizador, [apoie o projeto](https://www.openvoiceos.org/contribution) com financiamento, dados abertos ou traduções.
