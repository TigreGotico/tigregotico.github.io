---
title: "linguonnx: Tradução e Identificação de Língua Offline em ONNX"
description: "O linguonnx traduz texto e identifica línguas no CPU, sem torch e sem nuvem. 184 modelos de tradução int8 e 5 modelos de identificação de língua, 586 línguas alcançáveis, e um encaminhador que encadeia modelos pequenos quando nenhum modelo cobre um par."
date: 2026-08-10
lang: pt
author: "Casimiro Ferreira"
tags:
  - "linguonnx"
  - "translation"
  - "language identification"
  - "ONNX"
  - "self-hosted"
  - "OVOS"
draft: false
---

O [**linguonnx**](https://github.com/TigreGotico/linguonnx) é uma biblioteca
Python para tradução automática e identificação de língua. Corre sobre
`onnxruntime`, no CPU, offline. Não usa torch em momento algum — o ciclo de
geração encoder-decoder, incluindo a beam search e a cache KV, está escrito
directamente sobre os grafos ONNX.

```bash
pip install linguonnx
```

```python
from linguonnx import load_translator, load_detector

tx = load_translator()
print(tx.translate("bom dia, como estás?", src="pt", tgt="en"))
# 'Good morning, how are you?'   via opus-mt-pt-en-int8, 172 MB

det = load_detector()
print(det.detect("Egun on, zer moduz?"))    # 'eu'
```

É Apache-2.0 e não descarrega nenhum modelo que não tenhas pedido.

## O que vem incluído

O registo tem 369 entradas de tradução — fp32 e int8 de cada modelo — e 10
entradas de identificação de língua. O `load_translator()` usa int8 por
omissão, portanto uma instalação padrão encaminha sobre 184 modelos de tradução
quantizados e 5 classificadores quantizados. Todos são conversões ONNX
publicadas em [`TigreGotico/`](https://huggingface.co/TigreGotico) no
HuggingFace.

No grafo por omissão, 586 línguas são alcançáveis. Esse número está fixado nos
testes, por isso mantém-se verdadeiro ou a build avisa.

Os classificadores são exportações ONNX de quatro modelos fastText: GlotLID,
o clássico `lid.176`, OpenLID e OpenLID-v2. O GlotLID etiqueta 2102
*variedades*, por isso árabe coloquial volta como Najdi (`ars`) e chinês pode
voltar como cantonês. Isso é identificação de dialecto quando a queres, e
`collapse_varieties=True` quando não a queres.

## Um par sem modelo é uma cadeia de modelos

A maioria dos pares de línguas não tem modelo bilingue. O encaminhador trata
cada modelo como um conjunto de capacidades e não como uma aresta fixa, e
encadeia saltos quando é preciso:

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — passou pelo galego
```

Com essa política, português para basco passa pelo galego, sobre dois modelos
Marian de 84 MB e 153 MB. O pivô nunca é silencioso: a `Route` vem com a tradução
e diz que modelos usou e por que línguas passou.

Uma rota não é um facto fixo sobre um par de línguas. É o que as restrições de
quem chama fazem do registo: muda o orçamento de tamanho ou a preferência de
saltos e o mesmo par pode passar por outra língua, ou reduzir-se a um único salto
por um grande modelo multilingue. A `Route` diz qual delas calhou.

A ordenação prefere a instituição que trata da língua. O HiTZ treina basco, o
Proxecto Nós treina galego, o Projecte AINA treina catalão, o AI4Bharat treina
os pares índicos, o Masakhane treina os pares da África Ocidental, o TartuNLP
treina os fino-úgricos. Um modelo do especialista ganha o desempate contra um
modelo multilingue geral.

## Política em execução, nunca na indexação

Esta é a lei do registo: lista todos os modelos publicados, seja qual for o
tamanho, a licença ou a pontuação. A filtragem e a ordenação acontecem em
execução, no processo de quem chama, com as regras de quem chama. Um modelo que
o índice deixe de fora não pode sequer ser escolhido, por isso o índice não
deixa nada de fora.

Quem chama define a política no `load_translator`: `max_model_mb`,
`oversize_fallback`, `count_cached_as_free`, `prefer`, `max_hops`, `precision`,
`model_cache_size`, `exclude_flagged` e `min_chrf`. Todos eles também se
sobrepõem chamada a chamada.

## Um limite de tamanho prefere modelos pequenos, não apaga línguas

Um orçamento de tamanho é o botão óbvio para uma máquina pequena, e a
implementação óbvia está errada. Usado como filtro, `max_model_mb=500` reduz as
586 línguas alcançáveis a 249, porque a cauda longa vive dentro dos grandes
modelos multilingues e nenhuma cadeia de modelos pequenos os substitui.

`oversize_fallback=True` transforma o orçamento numa preferência:

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 586, e não 249
```

Inglês para catalão fica no modelo pequeno, porque existe um modelo pequeno.
Inglês para chuvache sobe para o MADLAD, porque o MADLAD é o único modelo do
registo com chuvache, e a alternativa não é uma rota mais barata mas nenhuma
rota. O `waived_size_cap` diz que limite a rota ultrapassou, por isso uma
máquina que orçamentou 500 MB fica a saber que descarregou 4945 MB.

Quatro regras mantêm isto honesto. A procura alargada corre só para o par que
veio vazio. O limite sobe um tamanho de modelo de cada vez, por isso um par
servido pelo NLLB-200 e pelo MADLAD fica com o NLLB-200. O limite delimita um
modelo e não uma rota, por isso uma cadeia de dois saltos de modelos de 237 MB é
encontrada pela procura normal. E a subida nunca passa o orçamento de
descarregamento.

## Alcançável não é utilizável

O `madlad400-3b-mt` cobre chuvache. Pede-lhe `en -> cv` e responde em russo:
`"Good day, my friend."` volta como `"Добрый день, мой друг."`. O
encaminhamento está correcto — a etiqueta do chuvache é uma peça SentencePiece
distinta — e o modelo escreve na língua errada à mesma.

Por isso uma entrada do registo leva `language_flags`, uma língua de cada vez,
com a observação por trás: a entrada, a saída, o veredicto do detector
(`glotlid=ru`), a data e o método. O chuvache é alcançável e não é utilizável, e
o registo diz as duas coisas.

A qualidade de modelo inteiro é registada da mesma maneira. Um campo `quality`
leva uma pontuação chrF contra a referência **humana** do FLORES-200 devtest,
com o corpus, o modo de descodificação e o tamanho da amostra ao lado, porque
uma pontuação sem tamanho de amostra ao lado não significa nada. A ausência do
campo significa não medido, que não é o mesmo estado que mau, e nada inventa um
número para um modelo não medido. Duas verificações levantam uma marca: chrF
abaixo de 40 em qualquer das precisões, e int8 a ficar mais de 2 chrF atrás de
fp32.

Uma marca não remove nada do registo. Dá ao `exclude_flagged=True` e ao
`min_chrf=` algo sobre que agir, e dá a um humano uma razão para ler:

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

Uma varredura sobre todo o registo passa uma frase real por cada modelo
registado e falha em saída vazia, saída só com espaços, ou saída igual à
entrada. As frases de amostra são por língua de origem e verificadas à mão; uma
língua sem amostra é saltada em vez de testada com texto de outra língua.

## A partir do OpenVoiceOS

O [`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)
embrulha a biblioteca em dois plugins numa só instalação: um detector de língua
(`opm.lang.detect`, id `ovos-lang-detect-plugin-linguonnx`) e um tradutor
(`opm.lang.translate`, id `ovos-translate-plugin-linguonnx`). Ambos carregam
modelos no primeiro uso, e todos os argumentos de `load_detector` e
`load_translator` são acessíveis a partir do `mycroft.conf`.

A biblioteca documenta o resto: [routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md)
para as políticas e o orçamento de tamanho, [models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md)
para o registo, e [licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
para os níveis de licença — modelos GPL-3.0 e CC-BY-NC-4.0 existem no índice e
têm de ser pedidos pelo nome.
