---
title: "Criar Vozes Sintéticas do Zero"
description: "Criar uma voz para um sistema de texto-para-fala normalmente exige que uma pessoa real passe horas a gravar áudio. Isso é caro, moroso, e em muitas línguas ou sotaques as vozes simplesmente não existem de todo"
date: 2025-06-26
lang: pt
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Synthetic Data"
  - "Voice Cloning"
  - "OVOS"
draft: false
---

> Este blog foi originalmente publicado no [blog do OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-06-26-making-synthetic-voices-from-scratch)

Uma boa voz TTS offline para português europeu não existia. A gravação de estúdio
é cara, leva meses, e na maior parte das línguas do mundo as gravações
simplesmente nunca aconteceram. Por isso construímos quatro do zero — sem cabine
de gravação, sem ator de voz, sem nuvem.

### A pipeline de três passos

**1. Gerar pares de fala sintéticos.** Usamos uma voz TTS existente como dadora —
qualquer fonte que consiga produzir áudio inteligível — e corremo-la sobre um
grande corpus de texto para produzir milhares de pares de áudio/texto. A voz
dadora não precisa de ser de alta qualidade. Só precisa de ser suficientemente
coerente para se aprender a partir dela.

**2. Aplicar conversão de voz.** Um passo de conversão de voz transforma o timbre
da dadora numa nova identidade — género, idade ou personagem diferentes. O áudio
resultante soa como a voz alvo, não como a dadora. É aqui que nasce uma nova
personalidade.

**3. Treinar um modelo VITS compacto.** O áudio convertido torna-se o conjunto de
treino para um pequeno modelo de arquitetura VITS via
[phoonnx_train](https://github.com/TigreGotico/phoonnx). O modelo terminado é
exportado para ONNX e corre inteiramente offline — num Raspberry Pi se for
necessário.

### Salvaguardas éticas

Se a dadora é a voz de uma pessoa real, obtemos permissão explícita primeiro.
Quando nenhuma permissão é possível, usamos gravações de domínio público ou geramos
uma voz totalmente original que não copia a identidade de ninguém. O passo de
conversão de voz tem também uma propriedade útil de privacidade: a saída é
acusticamente distinta o suficiente da dadora para que o risco de personificação
seja negligenciável.

### Aplicado ao português europeu

O português europeu não tinha nenhuma voz offline aberta de alta qualidade.
Produzimos quatro vozes — incluindo as identidades Miro e Dii que são agora as
vozes OVOS por defeito para `pt-PT` — usando exatamente esta pipeline. Correm
confortavelmente em hardware modesto, não exigem ligação à internet, e os dados de
treino estão [publicados abertamente](https://huggingface.co/TigreGotico) para que
qualquer pessoa os possa reproduzir ou estender.

Todos os modelos e datasets vivem em
[huggingface.co/OpenVoiceOS](https://huggingface.co/OpenVoiceOS) e
[huggingface.co/TigreGotico](https://huggingface.co/TigreGotico).
