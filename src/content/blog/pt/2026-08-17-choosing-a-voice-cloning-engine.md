---
title: "Escolher um Motor de Clonagem de Voz"
description: "O voiceclonnx corre 10 motores de conversão de voz por trás de uma única API, desde troca de características kNN até AR codec-LM. Isto é um guia às famílias de modelos por trás deles, ao verdadeiro compromisso medido entre inteligibilidade e semelhança de locutor, e a como escolher um motor para uma tarefa específica."
date: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "voice cloning"
  - "voice conversion"
  - "self-hosted"
draft: false
---

A conversão de voz pega numa gravação e num locutor de referência, e produz
as mesmas palavras na voz do locutor de referência. Não há texto envolvido
em lado nenhum da pipeline: a entrada é áudio, a saída é áudio, e o modelo
nunca lê nem escreve uma transcrição. É isso que a separa da conversão
texto-para-fala (TTS), que parte de texto e não tem gravação de origem a
preservar. A conversão de voz responde a uma pergunta mais restrita: dada
esta gravação, fazê-la soar como outra pessoa, mantendo as palavras
intactas.

Essa tarefa mais restrita tem usos reais. Dobrar uma gravação numa voz
consistente sem contratar um segundo ator de voz. Anonimizar um locutor
numa entrevista ou numa chamada de suporte mantendo as palavras ipsis
verbis. Dar ao resultado de um sistema de TTS uma identidade única e
estável ao longo de línguas, quando as vozes subjacentes de cada língua
foram treinadas de forma independente e de outro modo soariam como pessoas
diferentes.

O [`voiceclonnx`](https://github.com/TigreGotico/voiceclonnx) implementa 10
destes motores por trás de uma única API em Python, todos a correr sobre
`onnxruntime` sem necessidade de PyTorch em tempo de inferência. Os motores
não são intermutáveis. Vêm de famílias de modelos diferentes, e escolher um
significa escolher um compromisso, não um vencedor.

## A API, resumidamente

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
print(cloner.sample_rate)   # 16000
```

`clone_voice(audio, reference_voice, out_path)` recebe a gravação de
origem, um clipe de referência de 5-30 segundos do locutor-alvo, e um
caminho de saída, e devolve o caminho para o WAV convertido. Trocar de
motor significa trocar a string `engine=`; a forma da chamada não muda.
Um motor, o `rvc`, é a exceção — recebe um caminho para um modelo de voz
`.onnx` em vez de uma gravação de referência, coberto abaixo.
`pip install voiceclonnx` traz os 10 motores; os modelos são descarregados
do Hugging Face na primeira utilização.

## Dois eixos, não uma única pontuação

Dois números descrevem quão bem uma conversão funcionou, e não se movem
juntos.

A **taxa de erro por palavra** (WER, word error rate) mede a
inteligibilidade: quanto da frase original sobreviveu, julgado passando o
resultado de novo por um reconhecedor de fala e comparando com a
transcrição de origem. 0% de WER significa que todas as palavras passaram
corretamente.

A **semelhança de locutor** mede identidade: se o resultado realmente soa
como o locutor-alvo, e não como o original. É calculada extraindo um
embedding de locutor (uma impressão digital numérica compacta do timbre
de uma voz, a cor tonal que faz uma voz soar diferente de outra à mesma
altura e volume) do resultado e do clipe de referência, e comparando-os
por semelhança de cosseno.

Uma pontuação de 1.0 significa timbre idêntico. A própria referência do
`voiceclonnx`, uma cópia não convertida da origem pontuada face ao alvo,
situa-se em 0.09, pelo que qualquer coisa significativamente acima disso
está a fazer trabalho de conversão real.

O `voiceclonnx` publica ambos os números para cada motor, medidos face à
mesma frase convertida para duas vozes de referência. O WER vem do
`faster-whisper`; a semelhança de locutor vem de um modelo de embedding
`wespeaker-resnet34` (verificado de forma cruzada face a outros dois).
Colocando-os lado a lado surge um padrão: nenhum motor lidera as duas
colunas.

| Motor | Família | WER | Semelhança com o alvo |
|---|---|---|---|
| `focalcodec` | Troca de características kNN | 15-19% | **0.61** |
| `lscodec` | Codec desacoplado de locutor | ~35% | 0.54 |
| `chatterbox` | AR codec-LM | 4-8% | 0.54 |
| `knnvc` | Troca de características kNN | 12-15% | 0.49 |
| `facodec` | Codec fatorizado | **0%** | 0.44 |
| `openvoice` | Transferência de tom-cor | **0%** | 0.37 |
| `bicodec` | Tokens semânticos + globais | 12% | 0.29 |
| `triaan` | Triple-AAN | 4% | 0.29 |
| `cosyvoice` | Flow-matching | 8% | 0.21 |

(O `rvc` converte qualquer origem numa única voz fixa treinada pela
comunidade em vez de num clipe de referência arbitrário, pelo que não é
comparável nesta tabela; ver abaixo.)

Leia-se a tabela por linha, não à procura de uma única melhor linha. O
`facodec` e o `openvoice` situam-se em 0% de WER — todas as palavras
sobrevivem — com semelhança moderada. O `focalcodec` e o `lscodec` ficam
no extremo oposto: a transferência de timbre mais forte do conjunto,
paga com 15-35% das palavras a saírem erradas. O `chatterbox` é o único
motor que se sai bem nos dois eixos ao mesmo tempo (4-8% de WER, 0.54 de
semelhança), o que é uma propriedade da sua arquitetura, coberta a seguir.

## Porque é que as famílias se comportam de forma diferente

Os motores dividem-se em abordagens distintas, e a abordagem prevê onde um
motor cai na tabela acima.

### Troca de características kNN (`knnvc`, `focalcodec`)

O áudio de origem é dividido em quadros curtos, cada um transformado num
vetor de características por um codificador auto-supervisionado
pré-treinado. Para cada quadro de origem, o algoritmo encontra os *k*
quadros mais próximos numa reserva de características do locutor-alvo e
faz a média deles, substituindo o timbre da origem quadro a quadro
enquanto mantém o conteúdo fonético subjacente onde foi extraído da
própria representação do codificador. Não há um descodificador aprendido
a mapear uma voz para outra; a troca é uma pesquisa por vizinhos mais
próximos, o que explica porque a transferência de timbre pode ser
agressiva (o `focalcodec` atinge 0.61 de semelhança) ao custo de por
vezes distorcer quadros que tiveram uma correspondência fraca na
reserva-alvo, o que aparece como WER.

### Codec fatorizado (`facodec`)

Um codec de áudio neuronal (um modelo que comprime a fala numa sequência
de tokens compacta e a reconstrói) treinado para dividir explicitamente
esses tokens em fluxos separados de conteúdo e timbre. Como o conteúdo é
um fluxo dedicado, o descodificador reconstrói as palavras com alta
fidelidade; só o fluxo de timbre é trocado pelo do locutor-alvo. Essa
separação explícita é o motivo pelo qual o `facodec` atinge 0% de WER: a
preservação do conteúdo não está a competir com nada.

### Transferência de tom-cor (`openvoice`)

Um módulo de conversão muda a cor tonal (contorno de altura e timbre)
depois de um codificador separado ter fixado o conteúdo linguístico,
semelhante em espírito à abordagem do codec fatorizado mas implementado
como um passo de transferência de cor sobre um mel-espetrograma em vez de
tokens discretos. Também atinge 0% de WER, com semelhança algo mais baixa
do que o `facodec`.

### AR codec-LM (`chatterbox`)

Um modelo de linguagem autorregressivo que prevê tokens de codec um a um,
condicionado pelo embedding do locutor-alvo, à semelhança de um modelo de
linguagem de texto-para-fala mas condicionado pelos tokens de conteúdo da
gravação de origem em vez de texto. Por gerar a prosódia (ritmo, ênfase,
entoação) como parte do mesmo processo autorregressivo em vez de a copiar
diretamente da origem, consegue transportar o estilo de fala junto com o
timbre. É por isso que a documentação regista a "mudança fonte-para-alvo
mais forte", e é o único motor que pontua bem em inteligibilidade e
semelhança ao mesmo tempo.

### Flow-matching (`cosyvoice`)

Um processo generativo contínuo que refina iterativamente ruído no
mel-espetrograma alvo, usando um resolvedor de EDO (equação diferencial
ordinária) com um número configurável de passos (`ode_steps`, por defeito
10). O seu codificador de conteúdo é concebido para transferência entre
línguas, e essa generalidade é provavelmente o motivo pelo qual a sua
pontuação de semelhança com o alvo é a mais baixa do conjunto: a
representação otimiza para independência de língua, não para a
correspondência de locutor mais apertada.

### Codec desacoplado de locutor (`lscodec`)

Tal como o `facodec`, um codec treinado para separar conteúdo de
identidade de locutor, mas afinado para empurrar a semelhança ainda mais
longe ao custo direto da precisão do fluxo de conteúdo, ficando em ~35%
de WER com a segunda maior semelhança do conjunto.

### Codecs Triple-AAN e semântico-mais-tokens-globais (`triaan`, `bicodec`)

Estes ficam no meio nos dois eixos: WER moderado, semelhança moderada,
sem viés forte para nenhum dos lados.

### Codec any-to-ONE + vocoder (`rvc`)

Construído sobre o ContentVec (um codificador de conteúdo) alimentando um
vocoder VITS, treinado por voz-alvo em vez de aceitar um clipe de
referência arbitrário. O `reference_voice` para este motor é um caminho
para um ficheiro de modelo RVC `.onnx` ou um ID de repositório do Hugging
Face, não um ficheiro de áudio:

```python
cloner = VoiceCloner(engine="rvc")
out = cloner.clone_voice("source.wav", "/path/to/myvoice.onnx", "out.wav")
```

Como cada modelo RVC é treinado numa única voz-alvo, não recebe um clipe
de referência em tempo de inferência e não é pontuado no mesmo benchmark
de semelhança que os motores any-to-any. O seu WER medido de 38% reflete
um único modelo de exemplo treinado pela comunidade, não a arquitetura em
geral — a qualidade depende de como esse modelo específico foi treinado.
Existem milhares de vozes RVC da comunidade no Hugging Face e carregam
diretamente pelo ID do repositório.

## Decidir qual correr

Para uma pipeline rápida e de uso geral, comece com o `facodec` ou o
`openvoice`. Ambos atingem 0% de WER medido com semelhança moderada (0.44
e 0.37), e ambos trazem uma variante quantizada INT8 sem regressão de
qualidade listada. Passe `quantized=True` para um modelo mais pequeno e
mais rápido.

Para semelhança de locutor máxima, use o `focalcodec` (0.61 de
semelhança, a mais alta medida) se os 15-19% de WER forem aceitáveis para
o caso de uso, ou o `chatterbox` (0.54 de semelhança, 4-8% de WER) se não
forem. O `chatterbox` também corre a 24 kHz, a taxa de saída mais alta
para conversão any-to-any no conjunto. O `rvc` chega a 48 kHz mas só no
modo any-to-ONE acima.

Para hardware de baixos recursos, o `knnvc` em INT8 ocupa cerca de 123 MB
em disco, o menor no conjunto, com 0.49 de semelhança e 12-15% de WER: um
compromisso razoável para memória limitada. Nem todos os motores
quantizam de forma limpa. O `focalcodec` e o `cosyvoice` estão
documentados como degradando-se em INT8, por isso mantenha-se esses dois
em fp32.

Para uma língua para a qual o motor não foi treinado, o codificador de
conteúdo do `cosyvoice` é construído para transferência entre línguas, o
que é a razão documentada para o preferir a um motor afinado para
conversão na mesma língua, mesmo que a sua semelhança medida (0.21) seja
a mais baixa dos nove motores diretamente comparáveis.

Quando a identidade de voz importa mais do que a redação exata, o
`lscodec` dá a transferência de timbre mais forte entre os motores da
família codec (0.54, empatado com o `chatterbox`) ao custo do WER mais
alto do conjunto comparável (~35%). Escolha-o quando o objetivo for "isto
soa como o locutor-alvo" e erros de palavra ocasionais no resultado forem
toleráveis.

Para uma única voz fixa da comunidade em vez de um clipe arbitrário, use
o `rvc` com um modelo de voz `.onnx` pré-treinado em vez de uma gravação
de referência.

Uma restrição de licenciamento a verificar primeiro: os pesos do
`bicodec` são licenciados sob CC BY-NC-SA 4.0. Os pesos de todos os
outros motores são MIT, Apache-2.0, ou CC BY 4.0. Verifique a licença do
peso específico que implementar antes de o distribuir comercialmente.

## O que não faz bem, e em quem não deve ser usado

Todos os números acima vêm com a mesma ressalva: os números descrevem uma
frase de demonstração em inglês convertida entre duas vozes de referência
específicas. Uma língua diferente, uma gravação de origem mais ruidosa,
um clipe de referência mais curto ou de qualidade inferior, ou um locutor
de origem cuja voz esteja longe de qualquer coisa nos dados de treino de
um motor, vão todos mover os números, geralmente para pior. Nenhum destes
motores é uma correção universal para uma gravação de origem de baixa
qualidade — vários deles convertem alegremente o timbre enquanto
transportam diretamente o ruído da origem, já que o ruído tem a sua
própria assinatura acústica que uma separação de conteúdo/timbre nem
sempre separa de forma limpa.

A conversão de voz também levanta um risco real que a sua prima próxima,
a clonagem de voz para TTS, já obrigou esta equipa a pensar sobre:
converter uma gravação para soar como uma pessoa real e identificável é
tecnologia capaz de personificação, quer essa fosse a intenção ou não. A
regra que esta equipa aplica a vozes sintéticas em geral — obter
permissão explícita antes de usar a voz de uma pessoa real como dadora ou
alvo, e recorrer a gravações de domínio público ou a uma voz
deliberadamente original quando a permissão não for possível — aplica-se
aqui sem exceção. Um clipe de referência de uma pessoa real não é
diferente, do ponto de vista do consentimento, de um conjunto de treino
completo da sua voz; apenas exige muito menos disso para produzir um
resultado utilizável, o que é motivo para mais cautela, não menos.

Entre em contacto através de [contact](/pt/contact) ou veja
[o que oferecemos](/pt/services) se a conversão de voz fizer parte de uma
pipeline que esteja a construir.
