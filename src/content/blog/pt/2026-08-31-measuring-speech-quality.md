---
title: "Medir a Qualidade da Fala Sem um Painel de Audição"
description: "Um guia prático ao speechonnxmetrics: o que o MOS, os preditores de MOS sem referência, as métricas intrusivas de sinal e o WER/CER baseado em ASR realmente medem, quando cada um se aplica, pontuações reais de áudio real, e porque um MOS previsto é evidência, não verdade."
date: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "speechonnxmetrics"
  - "TTS"
  - "ONNX"
  - "evaluation"
draft: false
---

Um modelo de redução de ruído distribui um novo checkpoint. Uma voz de TTS
é retreinada com mais dados. Uma pipeline de clonagem de voz troca o seu
vocoder. Em cada caso, alguém tem de responder: o resultado está melhor ou
pior do que antes? "A mim soa-me melhor" não escala. Falha assim que a
língua não é uma que se fale, assim que há vinte checkpoints para
comparar em vez de dois, ou assim que a mudança precisa de ser verificada
em cada commit em vez de uma vez à mão.

A resposta rigorosa a "soa melhor" é um **Mean Opinion Score (MOS)**:
colocar o áudio perante um painel de ouvintes, pedir a cada um que o
classifique de 1 a 5, e fazer a média das pontuações. O MOS é a métrica
padrão de qualidade de fala precisamente porque faz a pergunta que
importa — um humano acharia isto aceitável — em vez de um substituto para
ela. Também é caro. Recrutar um painel, corrê-lo de forma consistente, e
repeti-lo para cada língua, cada condição de gravação e cada versão de
modelo que uma pequena equipa distribui não é algo que um painel de
audição consiga acompanhar.

O [`speechonnxmetrics`](https://github.com/TigreGotico/speechonnxmetrics)
é uma biblioteca para aproximar esse julgamento sem um painel, em cada
build. Agrupa as suas métricas em três famílias, e escolher a família
certa para a situação importa mais do que qualquer número individual.

## Três famílias, três perguntas

Os **estimadores de MOS sem referência** são redes neuronais treinadas
para prever o que um painel de audição diria, apenas a partir do áudio.
Não precisam de um original limpo — só do resultado que se quer julgar.
Use-se esta família quando não há verdade fundamental (ground truth) para
comparar: pontuar o resultado de um sistema de TTS, ou verificar uma
gravação real, já degradada, depois da redução de ruído.

As **métricas intrusivas** precisam de uma referência limpa correspondente
e medem a distância entre ela e o sinal degradado. Use-se esta família
quando se fabricou a degradação e ainda se detém o original limpo:
passou-se uma gravação conhecida como boa por um codec, um modelo de
extensão de largura de banda, ou um conversor de voz, e quer saber-se
quanto o resultado se afastou da origem.

As **métricas de texto baseadas em ASR** transcrevem o resultado com um
reconhecedor de fala e comparam a transcrição com o texto esperado. Isto
apanha algo que as outras duas famílias não conseguem: áudio que soa
perfeitamente natural e limpo mas diz as palavras erradas. Um preditor de
MOS sem referência pontua a naturalidade, não a correção — uma
pronúncia errada mas fluente pontua bem. Uma métrica intrusiva precisa de
uma forma de onda de referência, não de uma frase de referência. Só
comparar texto apanha uma palavra errada.

A biblioteca expõe isto através de uma única função:

```python
import speechonnxmetrics as s

# No-reference: only the output needed, no ground truth exists
s.score("output.wav", ["utmos"])

# Intrusive: needs a clean reference, ref= is required
s.score("degraded.wav", ["stoi", "mcd", "si_sdr"], ref="clean.wav")
```

As métricas de texto vivem num módulo separado, `speechonnxmetrics.asr`,
porque comparam strings, não áudio — o `s.score()` só despacha métricas
que recebem uma forma de onda.

## MOS sem referência: lendo os números

Distribuem-se quatro estimadores de MOS, cada um devolvendo valores numa
escala de 1–5 em que mais alto é melhor — a mesma escala que um painel
humano usa:

| métrica | dimensões | treinado em | uso comercial |
|---|---|---|---|
| `utmos` | uma pontuação de naturalidade | fala sintetizada (VoiceMOS Challenge) | sim |
| `dnsmos` | `sig` / `bak` / `ovrl` (qualidade da fala / ruído de fundo / geral) | ITU-T P.835 | sim |
| `dnsmos_p808` | um MOS de audição colaborativa (crowdsourced) | ITU-T P.808 | sim |
| `sigmos` | 7 dimensões (`col`, `disc`, `loud`, `noise`, `reverb`, `sig`, `ovrl`) | ITU-T P.804 | sim |
| `nisqa` | `mos` mais a decomposição `noi`/`dis`/`col`/`loud` | NISQA-v2 | **não — CC BY-NC-SA 4.0** |

O `nisqa` é a única métrica em toda a biblioteca com pesos não-comerciais.
As outras quatro são licenciadas sob MIT. O `speechonnxmetrics` não
filtra isto por si; declara a licença e deixa a escolha a quem chama.

Eis o que áudio real pontua. A correr as próprias fixtures da biblioteca
— uma gravação limpa (`source.wav`) e uma ressíntese em codec neuronal do
mesmo clipe (`facodec_aria.wav`) — através do UTMOS:

```python
>>> s.score("source.wav", ["utmos"])
{'utmos': 4.41}
>>> s.score("facodec_aria.wav", ["utmos"])
{'utmos': 3.21}
```

A gravação limpa fica perto do topo da escala, como devia — é fala humana
real, não sintetizada. A ressíntese em codec desce mais de um ponto
inteiro. Essa diferença, mais do que qualquer um dos números isoladamente,
é o sinal útil: diz que o codec introduz degradação audível, e dá um
número para acompanhar à medida que o codec é afinado.

O DNSMOS na mesma gravação limpa:

```python
>>> s.score("source.wav", ["dnsmos"])
{'dnsmos.sig': 3.45, 'dnsmos.bak': 3.60, 'dnsmos.ovrl': 2.93}
```

Três números, não um, e divergem — o `ovrl` situa-se visivelmente abaixo
tanto de `sig` como de `bak`. Essa divergência é informativa em vez de
ser um erro: o `ovrl` é a classificação da P.835 para a experiência geral
de audição, e tende a penalizar uma gravação com mais força do que
qualquer componente isolada sugeriria, especialmente para uma gravação do
mundo real em vez de uma de estúdio. Quando o `bak` está baixo,
procure-se ruído de fundo. Quando o `sig` está baixo, procurem-se
artefactos ao nível da voz — clipping, quebras, timbre robótico. Reportar
mais do que um preditor para o mesmo clipe: são treinados em dados
diferentes e discordam de formas informativas, e um fosso largo entre
dois preditores independentes no mesmo clipe é um sinal para ir ouvir.

## Métricas intrusivas: lendo os números

Onze métricas baseadas em referência medem a distância a um original
limpo. As que vale a pena conhecer primeiro:

| métrica | intervalo | direção | mede |
|---|---|---|---|
| `stoi` / `estoi` | 0–1 | mais alto é melhor | inteligibilidade objetiva de curto prazo — quanto do *conteúdo* sobrevive, independentemente de quão natural soa |
| `si_sdr` / `sdr` / `snr` | dB, sem limite | mais alto é melhor | razão sinal-distorção / sinal-ruído |
| `mcd` | dB, sem limite | mais baixo é melhor | distorção mel-cepstral — distância do envelope espectral, uma métrica clássica de qualidade em TTS/VC |
| `log_f0_rmse` | sem limite | mais baixo é melhor | erro do contorno de altura (pitch) |
| `lsd` / `msd` | dB | mais baixo é melhor | distância log-espectral / mel-espectral |

Note-se que a direção se inverte: o STOI e a família SDR sobem quando a
qualidade é melhor; o MCD, o erro de altura e a distância espectral
descem. Confundir isto ao ler uma tabela é um erro fácil.

Pontuando a mesma ressíntese em codec face à sua origem limpa:

```python
>>> s.score("facodec_aria.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav")
{'stoi': 0.662, 'mcd': 10.46, 'si_sdr': -26.94}
```

Um STOI de 0.66 numa escala de 0–1 em que 1.0 é uma correspondência
perfeita diz que a inteligibilidade sofreu um golpe real — isto está bem
abaixo do que uma gravação ligeiramente processada pontuaria. Um SI-SDR
de aproximadamente −27 dB confirma-o: o SI-SDR é negativo sempre que a
energia de distorção supera o sinal, e um número negativo grande
significa mudança estrutural pesada, não apenas ruído acrescentado. Um
MCD de 10,46 dB é alto; sistemas de TTS publicados que soam claramente
sintéticos mas ainda consistentes com o locutor costumam ficar na casa
das unidades, por isso 10+ aponta para uma deriva espectral substancial
entre a ressíntese e o original.

## Métricas baseadas em ASR: lendo os números

Cinco métricas de texto vêm de um único alinhamento de Levenshtein entre
uma transcrição de referência e uma hipótese (aquilo em que o áudio foi
efetivamente transcrito):

| métrica | intervalo | direção | significado |
|---|---|---|---|
| `wer` | ≥ 0 (normalmente 0–1, pode exceder 1) | mais baixo é melhor | taxa de erro por palavra: substituições + eliminações + inserções, a dividir pela contagem de palavras de referência |
| `cer` | 0–1 | mais baixo é melhor | a mesma ideia ao nível do carácter — mais tolerante a pequenas diferenças de ortografia/tokenização |
| `mer` | 0–1 | mais baixo é melhor | taxa de erro de correspondência (match error rate) |
| `wil` | 0–1 | mais baixo é melhor | informação de palavra perdida (word information lost) |
| `wip` | 0–1 | mais alto é melhor | informação de palavra preservada (word information preserved, `1 − wil`) |

Um exemplo trabalhado: referência "the quick brown fox jumps over the
lazy dog" face à hipótese "the quick brown fox jumped over a lazy dog"
(uma substituição, "jumps" → "jumped", uma eliminação de "the"):

```python
>>> from speechonnxmetrics import asr
>>> from speechonnxmetrics.asr import BASIC
>>> asr.wer(reference, hypothesis, normalizer=BASIC)
0.222
>>> asr.cer(reference, hypothesis, normalizer=BASIC)
0.116
```

Um WER de 0,22 significa que aproximadamente uma palavra em cinco está
errada — percetível, vale a pena ouvir. O CER é mais baixo no mesmo par
porque a pontuação ao nível do carácter trata uma substituição de uma
palavra como um punhado de edições de caracteres dentro de uma string de
caracteres muito mais longa, não como um token inteiro em falta; o CER e
o WER respondem a perguntas diferentes e não são diretamente comparáveis
entre si. Um WER acima de aproximadamente 0,3–0,4 em fala natural
normalmente significa que o sistema de ASR, ou o áudio que está a
transcrever, tem um problema real, não um erro de arredondamento.

O `speechonnxmetrics` nunca normaliza texto em nome do utilizador — uma
comparação em bruto conta maiúsculas/minúsculas e pontuação como erros, o
que raramente é o que se quer quando se está a pontuar a pronúncia em vez
da formatação exata da transcrição. Passe-se um normalizador
explicitamente: o `BASIC` põe em minúsculas e colapsa espaços em branco,
o `STRICT` também expande contrações e remove diacríticos, pontuação e
palavras de preenchimento.

## A ressalva mais importante

Todo o número de MOS sem referência nesta biblioteca é uma previsão de um
modelo, não a medição de um facto. O UTMOS, o DNSMOS, o SIGMOS e o NISQA
foram cada um treinados num conjunto específico de dados de testes de
audição, em línguas e condições de gravação específicas. Um preditor
treinado maioritariamente em gravações de estúdio em inglês pode julgar
mal uma língua que nunca viu em treino, um sotaque que o seu painel de
treino nunca classificou, ou uma condição de gravação — áudio telefónico,
uma sala ruidosa, um microfone de baixa qualidade — fora da sua
distribuição de treino. O modelo não está a mentir; está a extrapolar, e
extrapolar a partir de entradas desconhecidas é onde os preditores
neuronais são menos fiáveis.

Trate-se um MOS previsto como evidência, não como verdade fundamental. É
fiável naquilo em que é bom: apanhar grandes regressões, ordenar vários
candidatos entre si, e sinalizar uma execução que precisa de ser
efetivamente ouvida por um humano. Não é um substituto para um painel de
audição real quando uma decisão tem custos altos, e não deve ser a
última palavra sobre uma língua ou condição para a qual o modelo
subjacente não foi treinado a julgar. Reportar vários preditores em
conjunto, e tratar a discordância entre eles como um convite a ouvir em
vez de ruído a promediar, é a mitigação prática.

## Porque é isto que torna uma comparação utilizável

Nada disto é útil isoladamente. Torna-se útil no momento em que vários
motores precisam de ser comparados em pé de igualdade — que motor de TTS,
que motor de STT, que modelo de melhoria usar por defeito. As
[bibliotecas de fala em ONNX puro](/pt/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries)
que o `speechonnxmetrics` foi construído para avaliar — TTS, ASR, redução
de ruído, clonagem de voz — publicam comparações por motor produzidas
exatamente com as métricas acima: MOS sem referência para sistemas sem
verdade fundamental, métricas intrusivas onde existe uma referência
limpa, WER/CER sempre que a correção da transcrição está em causa. É
isso que transforma "escolhemos este motor" num número que outra pessoa
consegue verificar.

Se o seu projeto precisa de uma língua, um motor ou uma condição de
gravação avaliados desta forma e isso ainda não está coberto, [entre em
contacto](/pt/contact) ou veja [os nossos serviços](/pt/services).
