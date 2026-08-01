---
title: "Modelos de TTS Que Correm numa Batata"
description: "O phoonnx é um framework de investigação para síntese de fala baseada em VITS, construído para correr confortavelmente em hardware modesto. Sem GPU, sem nuvem, sem chave de API — apenas uma voz ONNX de ~15,65 milhões de parâmetros e um CPU. Aqui fica quão pequena pode ser uma boa voz, e como as treinamos."
date: 2026-05-10
lang: pt
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "ONNX"
  - "VITS"
  - "self-hosted"
  - "OVOS"
draft: false
---

Uma boa síntese de fala não requer uma GPU nem uma subscrição de nuvem. Uma voz natural e multilingue cabe em algo que terias
vergonha de chamar servidor — o tipo de placa que guardas numa gaveta "só por
precaução". Uma batata.

O [**phoonnx**](https://github.com/TigreGotico/phoonnx) é o nosso framework de
investigação para exatamente esse alvo: vozes pequenas baseadas em VITS que correm
**totalmente offline, em CPU, em hardware barato**, e que também conseguimos
*treinar nós próprios* de raiz.

## Quão pequeno é pequeno?

Ponhamos um número real em vez de andar às voltas. Fomos buscar uma voz phoonnx de
produção — a voz basca "Miro" (`OpenVoiceOS/phoonnx_eu-ES_miro_espeak`) —
diretamente ao Hugging Face e contámos os pesos no grafo ONNX:

```python
import onnx, numpy as np
m = onnx.load("miro_eu-ES.onnx")
print(sum(int(np.prod(i.dims)) for i in m.graph.initializer))
# 15650459
```

**~15,65 milhões de parâmetros.** É a voz inteira — encoder, decoder, tudo — num
ficheiro de 63 MB. A voz feminina "Dii" do mesmo lançamento chega ao *exato mesmo*
número, porque partilham a arquitetura VITS padrão do phoonnx; a personalidade vive
nos pesos, não em capacidade extra.

Para pôr em perspetiva: uma única camada de um modelo de linguagem moderno
"pequeno" pode carregar mais parâmetros do que este sintetizador de fala inteiro,
e ainda assim fala com fluência.

## Porquê VITS, e porquê ONNX

O [VITS](https://arxiv.org/abs/2106.06103) é a espinha dorsal de todas as vozes
phoonnx. É uma arquitetura ponta a ponta — texto (bem, fonemas) à entrada, forma de
onda à saída — sem vocoder separado para vigiar e sem laço autorregressivo que
rasteja uma amostra de cada vez. Esse design ponta a ponta é precisamente o que o
torna tratável numa batata: uma passagem em frente, síntese paralela, feito.

Não enviamos PyTorch para o edge. As vozes treinadas são exportadas para **ONNX** e
correm através do [`onnxruntime`](https://onnxruntime.ai/) no **CPU** — sem CUDA,
sem GPU, sem roleta de drivers. O `onnxruntime` é um motor C++ compacto e portável, e
um grafo de 15 milhões de parâmetros está bem dentro do que um núcleo à altura de um
Raspberry Pi mastiga mais depressa do que em tempo real. O resultado é um assistente
de voz que continua a falar quando a tua internet vai abaixo, quando o fornecedor de
nuvem tem uma falha, ou quando simplesmente nunca quiseste que o áudio da tua casa
saísse de casa.

## Os fonemas são onde se esconde a inteligência

Um modelo acústico minúsculo pode dar-se ao luxo de ser minúsculo porque o phoonnx
faz o trabalho linguístico pesado *à cabeça*, no phonemizer. Um phonemizer
(grafema-para-fonema, ou G2P) converte texto escrito na sequência de unidades de som
que o modelo de facto fala — para que a rede VITS nunca tenha de aprender ortografia,
apenas som.

O nosso trabalho com fonemas assenta em **[grafema-para-IPA para mais de 350 línguas](/pt/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** e em **[fonética clássica do português](/pt/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, que tornam possível treinar vozes para línguas de poucos recursos sem semanas de anotação especializada.

O phoonnx é deliberadamente agnóstico quanto ao phonemizer e traz consigo um pequeno
exército deles: `espeak-ng`, [gruut](https://github.com/rhasspy/gruut),
[epitran](https://github.com/dmort27/epitran),
[misaki](https://github.com/hexgrad/misaki),
[transphone](https://github.com/xinjli/transphone) (que alcança os milhares de
línguas catalogadas no Glottolog), além de especialistas como
[mantoq](https://github.com/mush42/mantoq) para árabe,
**[cotovia](https://github.com/TigreGotico/pycotovia)** para galego, OpenJTalk para
japonês, e KoG2P para coreano. Emitem IPA, ARPA, Pinyin, Hangul, Buckwalter — o que
quer que a língua precise. Há até um G2P multilingue baseado em modelo, construído
sobre ByT5, exportado para ONNX como tudo o resto.

Descarregar a ortografia para o phonemizer é o truque que permite a um modelo de 15
milhões de parâmetros soar bem numa língua de poucos recursos que nunca viu escrita.

## Um framework para *construir* vozes, não só para as correr

O phoonnx não é
apenas um toolkit de inferência. O framework companheiro
[**`phoonnx_train`**](https://github.com/TigreGotico/phoonnx) é a forma como
*fazemos* as vozes em primeiro lugar.

O `phoonnx_train` cobre o pipeline completo:

- **Pré-processamento** de um dataset ao estilo LJSpeech em dados de treino
  fonemizados.
- **Treino** do gerador VITS (aqueles ~15,65M de parâmetros) numa única GPU de
  consumo ou de gama média — um modelo desta dimensão não precisa de um
  cluster de treino.
- **Exportação** do checkpoint acabado para ONNX com um único script, pronto a
  colocar diretamente no `onnxruntime` num dispositivo.

Como a receita é aberta e os modelos são pequenos, construir uma voz nova de raiz
para uma língua que *não tem* opção offline aberta é um projeto à escala de um fim de
semana, não à escala de uma bolsa de investigação. É assim que temos vindo a
preencher lacunas para línguas mal servidas — basco, mirandês, português europeu e
mais — em vez de esperar que um fornecedor decida que uma língua é comercialmente
interessante.

## Já ligado ao teu assistente

Não tens de colar nada disto à mão. O phoonnx traz um plugin nativo do OpenVoiceOS,
`ovos-tts-plugin-phoonnx`, que vai buscar e carrega vozes por ti:

```json
"tts": {
  "module": "ovos-tts-plugin-phoonnx",
  "ovos-tts-plugin-phoonnx": {
    "voice": "OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone"
  }
}
```

Deixa a `voice` de fora e ele escolhe o primeiro modelo que corresponde à tua
língua. Para gerir vozes fora de um assistente há uma CLI, `phoonnx-voices`, para
listar línguas, navegar por vozes e pré-descarregar modelos:

```bash
phoonnx-voices list-voices --lang pt-PT
phoonnx-voices download OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone
```

E porque o phoonnx fala VITS-sobre-ONNX simples, o seu motor de inferência também
corre vozes treinadas com Piper, Mimic3, Coqui e MMS — **mais de mil línguas e
vozes** no total. Um pequeno runtime, um catálogo enorme, e nada disso a ligar para
casa.

## O ponto

A tecnologia de voz que te respeita tem de correr *onde tu estás* — no teu hardware,
sob o teu controlo, com o cabo de rede desligado se quiseres. O phoonnx é a nossa
aposta de que o caminho para lá chegar não são modelos maiores, mas a arquitetura
certa feita pequena: VITS para a espinha dorsal, phonemizers inteligentes para
carregar a carga linguística, ONNX para portabilidade, e um framework de treino
aberto para que qualquer pessoa possa fazer crescer o catálogo.

Quinze milhões e meio de parâmetros, a correr em CPU, treinados em hardware que
qualquer pessoa pode ter: é essa a pipeline de treino por trás de todas as vozes
phoonnx.
