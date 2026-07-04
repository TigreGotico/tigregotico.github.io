---
title: "Dados de Treino de TTS Miro & Dii: 40 Datasets Abertos em 20 Locales"
description: "Publicámos 40 datasets de treino sintéticos para as vozes Miro e Dii em português, neerlandês, alemão, francês, italiano, japonês, espanhol e mais. Clonagem de voz à escala: cada língua ganha duas identidades consistentes."
date: 2025-06-23
lang: pt
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Voice"
  - "Datasets"
  - "Miro & Dii"
  - "Multilingual"
  - "FOSS"
draft: false
---

## O que estamos a lançar

Todos os **40 datasets de treino sintéticos** usados para construir o Miro e a Dii —
as identidades de voz que desenvolvemos em parceria com o OpenVoiceOS. A coleção
abrange português europeu, português do Brasil, neerlandês, alemão, francês,
italiano, japonês, espanhol, romeno, polaco, sueco, hindi, dinamarquês, farsi,
inglês, basco, e mais. Cada dataset segue uma convenção de nomes consistente:
`tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`,
`tts-train-synthetic-miro_nl-NL`, e assim por diante para cada par de línguas.

Cada dataset é totalmente sintético — texto gerado emparelhado com áudio sintetizado
em layout LJSpeech, sem sessões de estúdio — e é lançado sob uma licença aberta para
que qualquer pessoa possa retreinar ou estender a voz. A fonemização acontece em
tempo de treino no phoonnx, apoiando-se na nossa [investigação de G2P para mais de
350 línguas](/pt/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## Como a identidade da voz se mantém consistente entre línguas

Não treinamos um bloco multilingue único na esperança de que o sotaque se resolva
sozinho. Cada língua ganha um **modelo monolingue** — treinado para soar como um
falante nativo dessa língua. A identidade partilhada entre modelos vem da **clonagem
de voz**: cada modelo Miro e cada modelo Dii é clonado a partir da mesma voz de
origem antes de ser adaptado a uma nova língua. O timbre, o carácter, a qualidade
reconhecível da voz — isso transfere-se. O sotaque não, deliberadamente.

A consequência prática: um falante de português, um falante de neerlandês, um
falante de japonês — todos inequivocamente **a mesma pessoa**, cada um soando nativo.

## Porquê publicar os dados de treino

Um checkpoint sem os seus dados de treino é uma caixa negra. Publicá-los torna a voz
**auditável** (podes ver exatamente com o que aprendeu), **reproduzível** (corre o
`phoonnx_train` sobre os mesmos dados, obténs o mesmo resultado) e **extensível**
(acrescenta frases, afina para um dialeto, constrói um novo locutor por cima).

Isto importa sobretudo para as línguas de poucos recursos desta lista. Quando os
dados de treino são abertos, a comunidade que fala uma língua pode melhorar a sua
própria voz — sem esperar que um fornecedor decida que ela é comercialmente
interessante.

## Onde encontrar tudo

Todos os datasets e modelos treinados vivem sob [**TigreGotico no
HuggingFace**](https://huggingface.co/TigreGotico), com checkpoints de voz
compatíveis com Piper também espelhados sob
[OpenVoiceOS](https://huggingface.co/OpenVoiceOS).

Para o framework de inferência e treino que consome estes datasets, vê o
[**phoonnx**](https://github.com/TigreGotico/phoonnx).
