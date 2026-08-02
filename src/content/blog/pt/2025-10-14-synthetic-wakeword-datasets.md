---
title: "Datasets Sintéticos de Wakeword: Sete Nomes de Assistente, Um Detetor"
description: "Publicámos sete datasets sintéticos de wakeword para nomes comuns de assistentes de voz: hey_computer, hey_mycroft, hey_siri, alexa, home_assistant, voice_assistant, wake_up. Treina um detetor que funciona em todo o lado."
date: 2025-10-14
lang: pt
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

Sete nomes de assistente. Sete datasets. Todo o áudio é gerado inteiramente pela
framework TTS **[phoonnx](https://github.com/TigreGotico/phoonnx)** usando as
vozes Miro e Dii. Sem gravações humanas. Sem formulários de consentimento. Sem
exposição de privacidade.

- **[hey_computer](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_computer)**
- **[hey_mycroft](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_mycroft)**
- **[hey_siri](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_siri)**
- **[alexa](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa)**
- **[home_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant)**
- **[voice_assistant](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-voice_assistant)**
- **[wake_up](https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up)**

Cada dataset é um conjunto plano de cerca de mil clips positivos: a wakeword dita
com locutores, ritmos e prosódia variados. Os negativos difíceis e o ruído de
fundo vêm como datasets companheiros separados que misturas no momento do treino:
[not-wake-words-speech-en](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en),
[not-wake-words-speech-pt](https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-pt),
e [ambient_noises](https://huggingface.co/datasets/TigreGotico/ambient_noises).

## Porquê sintético

As gravações reais levam meses a recolher. Cada locutor precisa de um formulário
de consentimento, e o resultado continua a deixar lacunas de sotaque que não
antecipaste. A geração sintética evita tudo isso.

- **Reproduzível**: as mesmas definições de geração e as mesmas vozes produzem o
  mesmo áudio, com rasto de auditoria completo e sem arqueologia de formulários
  de consentimento.
- **Auditável**: a pipeline de geração é a documentação.
- **Escalável**: variar o ritmo de fala e as características do locutor é uma
  mudança de parâmetro, não uma sessão de estúdio.

Para a deteção de wakeword, o que importa é a distintividade acústica, não a
naturalidade. Os dados sintéticos encaixam nesse requisito.

## Usa estes

Treina o teu próprio detetor de wakeword para OpenVoiceOS, Mycroft, ou qualquer
sistema de voz aberto. Para aumento de amostras negativas há também datasets de
clips de fundo domésticos e de domínio público:
[building_106_kitchen_3secs](https://huggingface.co/datasets/TigreGotico/building_106_kitchen_3secs),
[public_domain_sounds_3secs](https://huggingface.co/datasets/TigreGotico/public_domain_sounds_3secs),
e [FMA_3secs](https://huggingface.co/datasets/TigreGotico/FMA_3secs).

[**Todos os datasets de wakeword no HuggingFace → TigreGotico**](https://huggingface.co/datasets?author=TigreGotico&tags=wakeword)
