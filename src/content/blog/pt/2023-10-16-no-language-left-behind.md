---
title: "Nenhuma Língua Deixada para Trás"
description: "Eliminar barreiras linguísticas no OpenVoiceOS através de deteção de língua, plugins de tradução e capacidades de tradução bidirecional."
date: 2023-10-16
lang: pt
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> Este artigo foi originalmente publicado no meu blog pessoal (hoje extinto)

O OpenVoiceOS (OVOS) é uma plataforma de assistente de voz de código aberto e orientada pela comunidade. Este artigo cobre os plugins de deteção de língua, tradução e tradução bidirecional que construí para permitir que o OVOS funcione em línguas muito além daquilo que as skills instaladas suportam nativamente.


## Deteção de Língua a partir de Áudio

O OVOS identifica a língua falada no áudio antes de esta chegar à etapa de transcrição de STT, permitindo que o plugin de STT transcreva com exatidão em vez de adivinhar. Construí vários plugins para isto:

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

A deteção de língua está limitada às línguas listadas na sua configuração do OVOS — classificações fora desse conjunto são rejeitadas, para que não mude acidentalmente para uma língua que ninguém em sua casa fala.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### Configuração

O tamanho do modelo classificador de língua do FasterWhisper é configurável:

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## Tradução de Língua de Texto

O [No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) é o modelo de código aberto da Meta para tradução direta de alta qualidade entre 200 línguas — incluindo línguas de poucos recursos como o asturiano, o luganda e o urdu. Foi esse nome que inspirou este artigo.

O [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) executa o NLLB localmente dentro do OVOS. As skills são lentas a ganhar suporte nativo completo de língua, mas com este plugin os utilizadores já não precisam de esperar — o OVOS traduz os enunciados recebidos e as respostas enviadas em tempo real, para que qualquer skill funcione em qualquer uma dessas 200 línguas.

Para hardware de menor potência, o [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) delega a tradução num servidor remoto. Há servidores públicos listados de origem; o alojamento próprio é fortemente recomendado por questões de privacidade. **Usar um servidor público significa confiar todos os seus enunciados ao seu operador.**

Plugins de tradução de destaque:
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### Configuração

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## O Plugin de Tradução Bidirecional do OVOS

O [plugin de Tradução Bidirecional do OVOS](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) liga a deteção e a tradução com duas etapas de pipeline: um **Utterance Transformer** (traduz o texto recebido para a língua configurada do OVOS) e um **Dialog Transformer** (traduz a resposta de volta para a língua original do utilizador).

O modo opcional `verify_lang` verifica de forma cruzada a língua detetada do texto face à língua da sessão — útil em plataformas de chat onde uma única instância do OVOS serve utilizadores multilingues. Requer um [módulo de deteção de língua](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) configurado em `language.detection_module` e um plugin de tradução (`ovos-translate-plugin-nllb` para local ou `ovos-translate-server-plugin` para remoto).

### Configuração

```json
"utterance_transformers": {
    "ovos-utterance-translation-plugin": {
        "bidirectional": true,
        "verify_lang": false,
        "ignore_invalid": true,
        "translate_secondary_langs": true
    }
},
"dialog_transformers": {
    "ovos-dialog-translation-plugin": {}
}
```

## Como Tudo Funciona em Conjunto

Cada componente é útil de forma independente, mas compõem-se de forma limpa:

1. **Deteção de língua do áudio** — indica ao plugin de STT que língua transcrever.
2. **Tradução do enunciado** — converte enunciados não nativos para a língua configurada do assistente antes da correspondência de skills.
3. **Tradução do diálogo** — traduz a resposta do assistente de volta para a língua do utilizador antes do TTS.

O resultado: o OVOS consegue processar qualquer uma das 200 línguas do NLLB de ponta a ponta, sem que as próprias skills precisem de traduções.

Contribuições e traduções de skills são bem-vindas no [OpenVoiceOS no GitHub](https://github.com/OpenVoiceOS).
