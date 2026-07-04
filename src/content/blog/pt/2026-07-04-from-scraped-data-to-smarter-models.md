---
title: "Porque Acumulamos Dados: De Catálogos Extraídos a Modelos de Fala e Linguagem Mais Inteligentes"
description: "Dados limpos, tipados e com boa proveniência são a matéria-prima de todos os modelos que disponibilizamos. Como os catálogos que os nossos scrapers constroem se tornam vocabulários de biasing para ASR, classificadores de intenção, corpora sintéticos de NER, léxicos de G2P, vozes de TTS — e combustível honesto para LLMs."
date: 2026-07-04
lang: pt
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Data Collection"
  - "ASR"
  - "NLP"
  - "TTS"
  - "LLM"
  - "FOSS"
draft: false
---

Escrevemos muito sobre *como* extraímos dados — as
**[ferramentas de reconhecimento](/pt/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**,
os **[transportes anti-bot](/pt/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**,
os **[clientes tipados de metadados musicais](/pt/blog/2026-04-20-music-database-scrapers)**.
Uma pergunta justa é *porquê*. Somos uma empresa de IA de voz; o que fazemos
nós a manter scrapers para enciclopédias de música e diretórios de rádio?

A resposta é que **os dados estão a montante de tudo o que disponibilizamos**. Um
assistente de voz é apenas tão bom quanto as palavras que espera ouvir, as entidades
que consegue reconhecer e as pronúncias que conhece. Nada disso vem de diagramas de
arquitetura. Vem dos dados — e os dados interessantes raramente estão à espera num
dataset pronto a usar. Estão espalhados pela web pública, em catálogos que os humanos
passaram décadas a curar.

Eis o que acontece a esses dados depois de os recolhermos.

## Entidades: o vocabulário de que um assistente de voz vive

Diga "toca Sultans of Swing dos Dire Straits" a um assistente. Antes de qualquer
modelo poder agir sobre isso, algo tem de saber que *Sultans of Swing* é uma
faixa e que *Dire Straits* é um artista. Multiplique por cada artista, álbum,
estação, podcast e género que um utilizador possa nomear, e tem o verdadeiro
vocabulário de um assistente de media — centenas de milhares de entidades nomeadas,
nenhuma das quais aparece num corpus de treino de NLP convencional.

Os nossos clientes de media emitem exatamente isto: registos tipados com ids
canónicos, normalizados no esquema
**[mediavocab](https://github.com/TigreGotico/mediavocab)**.
Esses catálogos de entidades alimentam diretamente:

- **Correspondência de intenção baseada em palavras-chave** — as listas de entidades
  tornam-se os gazetteers que ancoram as consultas de media no OpenVoiceOS.
- **Classificadores de intenção** — os nossos datasets de intenção de media combinam
  entidades reais extraídas com síntese de frases por templates e assistida por LLM,
  produzindo enunciados como os que os utilizadores reais fazem, povoados com entidades
  que existem de facto. Os modelos treinados dessa forma tratam da decisão "isto é um
  pedido de reprodução, e de quê?" no pipeline de media do OpenVoiceOS.
- **Corpora sintéticos de NER** — a mesma receita generaliza-se: pegue num catálogo de
  entidades reais, gere frases naturais em torno delas, e tem um dataset de entidades
  nomeadas etiquetado para um domínio que nenhum corpus académico cobre.
  As entidades são reais, portanto a distribuição é honesta; as frases são sintéticas,
  portanto o volume é o que precisar.

## Enviesar o reconhecimento de fala para as palavras que importam

O ASR de uso geral é treinado com fala geral, por isso transcreve *Dire
Straits* como "dire straights" e destrói todos os nomes de aldeias portuguesas. A
correção não é retreinar de raiz — é **biasing**: dar ao reconhecedor
o vocabulário do seu domínio.

Os catálogos extraídos são esse vocabulário. Concretamente:

- **Biasing por modelo de linguagem** — os LMs n-gram ou de shallow fusion treinados
  com texto rico em entidades empurram o descodificador para palavras do domínio. O LM
  de um assistente de media deve ser treinado com *títulos de faixas e nomes de artistas*,
  e o nosso pode sê-lo, porque os temos — tipados, sem duplicados e com proveniência limpa.
- **Reconhecimento condicionado por prompt** — as arquiteturas mais recentes aceitam um
  prompt de texto ou uma lista de contexto no momento da inferência. Alimentar a
  biblioteca real do utilizador — as entidades que os nossos clientes extraíram — no
  contexto do reconhecedor transforma "nome próprio irreconhecível" em "item de
  vocabulário conhecido".
- **Dados de fine-tuning** — onde o biasing não chega, os catálogos de entidades mais as
  nossas [vozes de TTS](/pt/blog/2026-05-10-tts-that-runs-on-a-potato) geram
  fala sintética para as frases exatas que uma implementação não pode errar.
  Este é o [serviço de construção de datasets](/pt/services) que oferecemos comercialmente,
  e é construído sobre o mesmo pipeline aberto.

## Pronúncia: de dicionários rastreados a G2P e TTS

Alguns dos nossos crawls mais valiosos não são catálogos de entidades, mas **léxicos**.
Rastrear o dicionário Infopédia produziu
[infopedia-pt-ipa](https://huggingface.co/datasets/TigreGotico/infopedia-pt-ipa),
mais de 100.000 pares palavra→IPA de português europeu. Esse dataset:

- avalia e afina a nossa
  [stack de G2P para português](/pt/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes) baseada em regras,
- ancora a pronúncia das [vozes de TTS](/pt/blog/2026-06-15-two-voices-every-language-miro-and-dii)
  para que digam as palavras como os falantes de facto dizem,
- e serve de semente a recursos etiquetados por significado como o nosso
  [trabalho sobre heterófonos do português](https://github.com/TigreGotico/bifonia), onde
  a mesma grafia corresponde a sons diferentes consoante o sentido.

Os dados de grafia-para-som são o canto menos glamoroso da tecnologia de fala e o
que mais decide se uma voz soa nativa. Ninguém lhe entrega estes dados.
Rastreia-os, limpa-os e publica-os — para que a próxima equipa não tenha de
o fazer.

## Combustível honesto para LLMs

Tudo o que está acima também se aplica aos grandes modelos de linguagem, com uma
reviravolta adicional: **a proveniência importa agora mais do que o volume**. A web
aberta está cada vez mais contaminada com texto gerado por modelos; treinar ou avaliar
sobre ela recicla discretamente as saídas dos modelos de ontem. É por isso que nos
importamos com fontes de proveniência humana limpa — décadas de
[arquivos de Usenet](/pt/blog/2026-07-01-usenet-and-remailers-in-2026), enciclopédias
curadas, dicionários oficiais — e porque cada dataset que publicamos indica
de onde veio cada registo.

Os catálogos estruturados também alimentam os LLMs no momento da *inferência*: um
repositório de entidades tipado e sem duplicados é exatamente o que uma camada de
retrieval ou a API de ferramenta de um agente quer para ancorar as suas respostas. APIs
limpas sobre fontes desordenadas não são apenas uma conveniência de scraping — são a
forma de manter um modelo de linguagem agarrado aos factos.

## O pipeline, de ponta a ponta

Portanto, o quadro completo tem este aspeto:

```
recon → resilient extraction → typed clients → normalised catalogues
      → gazetteers & intent data     (NLP)
      → biasing LMs & fine-tune sets (ASR)
      → lexicons & phoneme labels    (G2P / TTS)
      → provenance-clean corpora     (LLMs, retrieval)
```

Cada etapa é de código aberto, cada dataset é publicado onde o licenciamento o permite,
e o mesmo pipeline que satisfaz as necessidades dos nossos próprios modelos está disponível
[como um projeto](/pt/services) para os seus. Os scrapers não são uma missão secundária.
São a pedreira de onde toda a stack é construída.
