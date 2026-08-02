---
title: "Limpar Áudio Mau: Redução de Ruído e Extensão de Largura de Banda no audiosronnx"
description: "O audiosronnx trata a redução de ruído e a extensão de largura de banda como duas tarefas separadas: o registo real de motores, tamanhos e licenças de modelos, a lista de modelos rejeitados, e como verificar se o resultado realmente melhorou."
date: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "denoising"
  - "bandwidth extension"
  - "speech"
draft: false
---

Uma gravação pode ser má de duas formas diferentes, e as correções não se
sobrepõem.

A primeira forma: ruído de fundo sobrepõe-se à fala — trânsito, uma
ventoinha, o zumbido de uma sala. O sinal que importa está lá; outra coisa
está misturada com ele. Remover isso é **redução de ruído** (denoising).

A segunda forma: a gravação nunca captou o sinal completo, à partida. O
áudio de telefone é amostrado a 8000 amostras por segundo (8 kHz); uma
gravação de qualidade total é normalmente 48 kHz. A **taxa de amostragem**
define a frequência mais alta que um sinal digital consegue representar,
por isso uma chamada a 8 kHz não tem absolutamente nenhum conteúdo acima
de 4 kHz — não está silencioso, não está filtrado, simplesmente nunca foi
gravado. Fazer esse áudio soar completo outra vez significa inventar
frequências altas plausíveis que nunca foram captadas. Isso é **extensão
de largura de banda** (bandwidth extension).

O `audiosronnx` trata estes como dois problemas diferentes com dois pontos
de entrada diferentes, porque usar o errado faz a coisa errada. Correr um
extensor de largura de banda sobre um sinal ruidoso vai reconstruir
fielmente uma versão de alta frequência do ruído. A redução de ruído tem
de acontecer primeiro.

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _     = load_sr("lavasr").upscale(clean, rate)              # extend to 48 kHz
```

O `load_denoise()` e o `load_sr()` recusam os motores um do outro — pedir
ao `load_denoise` um extensor de largura de banda levanta um erro em vez
de fazer silenciosamente a tarefa errada.

## Onde isto ajuda de facto

A suposição óbvia é que limpar o áudio antes do reconhecimento de fala tem
de melhorar a transcrição. Na prática, isso não é fiável. Os reconhecedores
modernos são treinados com grandes quantidades de fala real, ruidosa e de
banda estreita, pelo que um reconhecedor lida muitas vezes melhor com uma
gravação ruidosa do que com essa mesma gravação depois de passar por um
melhorador. A melhoria (enhancement) é *lossy*: remove aquilo que julga ser
ruído, e nesse processo pode levar consigo detalhe acústico que o
reconhecedor estava a usar, ou deixar artefactos que o reconhecedor nunca
ouviu em treino. Se ajuda ou prejudica depende do modelo específico, do que
foi usado para o treinar, e do que está errado na gravação. Tem de ser
medido por modelo, não presumido.

Os dois lugares onde estas ferramentas compensam de forma consistente
estão ambos do lado da síntese.

O primeiro é a **preparação de dados de treino**. Uma voz de
texto-para-fala herda o carácter do áudio com que foi treinada, incluindo
a sala onde foi gravada. Chiado, zumbido e uma taxa de amostragem baixa no
corpus tornam-se chiado, zumbido e uma qualidade abafada em cada frase que
a voz acabada alguma vez disser. Limpar um corpus antes do treino, e
elevá-lo para 48 kHz de forma consistente, é trabalho feito uma vez que
melhora todos os resultados depois. Isto importa mais para as línguas sem
corpus de estúdio disponível, onde as únicas gravações que existem nunca
foram feitas a pensar em síntese de fala.

O segundo é o **pós-processamento de fala sintetizada**. Um vocoder pode
deixar um travo metálico ou uma qualidade de banda limitada, em particular
num modelo treinado com um dataset pequeno ou de taxa baixa. Correr o
resultado através de um extensor de largura de banda eleva-o sem
retreinar nada.

Um ouvinte humano é o terceiro caso, e o mais simples: uma gravação que
uma pessoa tem de aturar beneficia de ser mais limpa, seja o que for que
um reconhecedor teria feito dela.

## O registo de motores

O `audiosronnx` traz dez redutores de ruído e sete extensores de largura
de banda, todos carregáveis pelo nome através de `load_denoise()` /
`load_sr()`, todos ONNX puro sem torch em tempo de execução.

Redutores de ruído:

| Motor | Taxa | Tamanho | Licença |
|--------|------|------|---------|
| dpdfnet (por defeito) | 8/16/48 kHz | 8,7–14,9 MB | Apache-2.0 |
| mossformer2 | 48 kHz | 229 MB | Apache-2.0 |
| frcrn | 16 kHz | 57,5 MB | Apache-2.0 |
| mpsenet | 16 kHz | 9,7 MB | MIT |
| gtcrn | 16 kHz | 0,54 MB | MIT |
| cmgan | 16 kHz | 7,8 MB | MIT |
| metadenoiser | 16 kHz | 19–34 MB | CC-BY-NC-4.0 |
| mossformergan | 16 kHz | 17,7 MB | Apache-2.0 |
| voicefixer | 44,1 kHz | 415 MB | MIT |
| deepfilternet | 48 kHz | ~2 MB | MIT |

Extensores de largura de banda:

| Motor | Entrada | Tamanho | Licença |
|--------|-------|------|---------|
| lavasr (por defeito) | 8–48 kHz | ~52 MB | Apache-2.0 |
| novasr | 16 kHz | ~0,2 MB | Apache-2.0 |
| flowhigh | qualquer | ~200 MB | MIT |
| hifiganbwe | qualquer | ~4 MB | MIT |
| apbwe | qualquer (banda de 12 kHz) | ~120 MB | MIT |
| sidon | 16 kHz | ~410 MB | MIT |
| callenhancer | 8–16 kHz | ~3 GB / ~1,3 GB int8 | CC-BY-NC-4.0 |

O modelo mais pequeno da biblioteca, o `gtcrn`, tem 0,54 MB. O maior, o
`voicefixer`, tem 415 MB — quase 800 vezes maior, e faz uma tarefa
diferente: é um modelo de *restauração* que trata ruído, reverberação,
clipping e largura de banda em falta em conjunto, em vez de um problema
de cada vez.

A maioria dos pesos é MIT ou Apache-2.0. Dois não são: o `metadenoiser`
e o `callenhancer` são distribuídos sob CC-BY-NC-4.0, não-comercial. Essa
licença cobre os pesos, não o áudio processado com eles, e a biblioteca
declara-o em cada ponto de utilização — o `audiosronnx list` reporta-a
por motor. Nada impede quem chama de escolher o `metadenoiser` pela sua
arquitetura no domínio do tempo, mas a escolha tem de ser feita com
conhecimento de causa.

O registo existe porque nenhum modelo único vence em todas as gravações.
O `dpdfnet` é o predefinido porque não precisa de dependências extra e
cobre 8, 16 e 48 kHz a partir de um único modelo. O `mossformer2` é a
melhor escolha medida em entrada fullband. O `mossformergan` publica a
pontuação PESQ mais alta (3,47) entre os redutores de ruído distribuídos.
O `gtcrn` é a escolha quando a restrição vinculativa é o tamanho, com
0,54 MB. Num clipe de teste com ruído gaussiano de banda larga, os
redutores de ruído recuperaram entre 3,5 e 5,9 dB de SNR a uma SNR de
entrada de 19 dB, subindo para 7,5–13,7 dB num caso mais difícil de 5 dB
de entrada. Isso é um caso de ruído sintético e hostil: ordena os motores
de forma consistente mas diz pouco sobre ruído de conversação cruzada
(babble) ou artefactos de codec, o que é exatamente por que o registo
mantém dez modelos em vez de distribuir apenas o vencedor.

O `cmgan` é o caso mais claro de um modelo mantido de propósito apesar de
perder: é dominado tanto em PESQ como em SNR pelo `gtcrn`, a catorze
vezes o tamanho, e mantém-se na mesma — para que resultados publicados
construídos com o `cmgan` continuem reprodutíveis e uma arquitetura
distinta permaneça disponível para comparação.

No lado da extensão de largura de banda, o `sidon` e o `callenhancer`
fazem uma tarefa diferente do `lavasr` ou do `novasr`: em vez de
acrescentar uma banda alta plausível por cima do sinal existente,
ressintetizam a fala de raiz através de um vocoder neuronal, o que
consegue reparar danos de codec que um extensor de banda não consegue
tocar — a um custo computacional muito mais alto. O `callenhancer` é
treinado especificamente em áudio de telefonia, o que explica porque os
seus pesos têm a licença não-comercial.

## O que não entrou

O `audiosronnx` só distribui um motor quando este exporta para um único
grafo ONNX estático, corre em CPU através do onnxruntime, tem uma licença
clara, e foi validado de ponta a ponta face à implementação original —
não apenas face ao modelo em bruto, já que um grafo que corresponde à
rede mas não à normalização à sua volta produz áudio que soa bem e está
silenciosamente errado.

O `docs/not-shipped.md` do projeto documenta cada candidato avaliado e
rejeitado, com o motivo específico, o que o torna um dos documentos mais
úteis no repositório porque mostra as fronteiras reais do que "ONNX puro,
só CPU" consegue fazer hoje em vez de as afirmar.

### Amostradores iterativos não têm grafo estático para exportar

Modelos
de difusão e de flow-matching correm uma rede muitas vezes por enunciado,
com um ciclo cujo comprimento não é fixo em tempo de exportação. O
AudioSR (uma pipeline de difusão latente de cerca de 6 GB com um VAE, um
LDM e um vocoder separados) e o SGMSE caem ambos aqui. O próprio
seguimento em streaming de 2025 do SGMSE só atinge tempo real numa GPU de
consumo, quanto mais em CPU.

### Convoluções variáveis por localização parecem desqualificantes e maioritariamente não são

O `resemble-enhance` foi rejeitado durante
muito tempo neste documento por causa do LVCNet, a convolução variável
por localização do vocoder, com base na teoria de que kernels previstos
por posição através de `unfold` e `einsum` não conseguem ser dobrados
num grafo estático. Testado diretamente, isso revelou-se errado: ambas
as operações têm equivalentes em ONNX. A falha real é um erro de tracing
separado, bem conhecido ("ONNX export of convolution for kernel of
unknown shape"), já resolvido noutro ponto da base de código para os
resamplers do BigVGAN. O que ainda mantém o `resemble-enhance` de fora é
a escala: quatro redes incluindo um amostrador CFM de EDO e um
autocodificador, a 44,1 kHz. Isso é uma decisão de âmbito, não uma
impossibilidade.

### Alguns modelos não têm nada treinado para exportar

O RNNoise é
distribuído como C escrito à mão, não um grafo numa framework treinável,
pelo que portá-lo significaria retreinar uma rede equivalente do zero. O
Fast-ULCNet publica apenas código de arquitetura, sem checkpoint nenhum.

### Uma licença restritiva é uma decisão de rotulagem, não uma desqualificação automática

É exatamente por isso que o
`callenhancer` e o `metadenoiser` são distribuídos. O que *é*
desqualificante são pesos publicados sem licença nenhuma: o mdctGAN foi
rejeitado exatamente por isso, além de um front-end baseado em
`torch.fft` que não exporta de forma fiável.

### Chamar `torch.stft` dentro do modelo é um bloqueio estrutural real

O ciclo do amostrador do NU-Wave2 não é o problema; isso poderia correr
em numpy fora do grafo, tal como o STFT de todos os outros motores. O que
o bloqueia é que o seu método `forward` chama `torch.stft` e
`torch.istft` internamente, o que a biblioteca mantém deliberadamente
fora de todos os grafos que distribui, e que é também o operador que
exporta de forma menos fiável em geral. Corrigi-lo significaria dividir
o modelo na fronteira da transformação, uma reestruturação real em vez
de uma troca de operador.

### Reproduzir a arquitetura de um modelo não é o mesmo que reproduzir o seu resultado

O LiSenNet tem 56 mil parâmetros, menos de 300 KB, o que
o tornaria o motor mais pequeno da biblioteca. A sua portagem para ONNX publicamente
disponível corre e produz áudio atenuado com aspeto plausível, mas medido
de ponta a ponta destrói o sinal: −10,8 dB de SNR a 11 dB de entrada.
Reproduzir exatamente a implementação de referência da própria portagem
dá o mesmo resultado negativo idêntico, o que significa que a própria
implementação de referência não corresponde ao front-end que a sua
própria documentação descreve. Ainda não há um alvo correto contra o
qual validar.

Estas rejeições raramente são sobre tamanho ou velocidade. Cada uma tem uma
causa específica e restrita: um
operador não suportado com um substituto exato (`torch.complex` não tem
operação ONNX, mas `atan2(im, re)` calcula o mesmo ângulo de fase), um
tensor construído a partir da forma em tempo de execução de uma entrada
que um tracer não consegue fixar, ou uma transformação colocada do lado
errado de uma fronteira de grafo.

## Confirmar que o resultado realmente melhorou

Um ficheiro ONNX que corre não é prova de que uma gravação melhorou. Dois
modos de falha diferentes parecem idênticos vistos de fora: um redutor de
ruído que silencia a fala junto com o ruído, e um extensor de largura de
banda que acrescenta uma banda alta com o conteúdo harmónico errado,
produzem ambos áudio que reproduz sem erro e pode até soar mais limpo a
uma audição casual.

A biblioteca irmã `speechonnxmetrics` transforma esse julgamento
num número em vez de numa impressão. Pontua o áudio em **MOS** (Mean
Opinion Score, uma pontuação de 1–5 de qualidade percebida) de duas
formas: preditores neuronais sem referência como o DNSMOS e o UTMOS, que
pontuam uma gravação sem um original limpo para comparar, e métricas
intrusivas como o STOI e o SI-SDR, que precisam da referência limpa e
medem quão perto o resultado realmente está dela.

```python
import speechonnxmetrics as s

s.score("clean.wav", ["utmos"])
# -> {'utmos': 4.41}

s.score("denoised.wav", ["stoi", "si_sdr"], ref="clean.wav")
# -> {'stoi': 0.66, 'si_sdr': -26.9}
```

Correr antes e depois de um redutor de ruído ou extensor e a forma de uma
comparação real cai no lugar: DNSMOS ou UTMOS no áudio em bruto e
processado para ver se a qualidade percebida se moveu, e — quando existe
uma referência limpa, o que acontece em testes de ruído sintético mas
raramente numa chamada telefónica real — SI-SDR ou STOI para ver se o
sinal processado realmente convergiu para ela em vez de apenas soar
diferente. É a mesma disciplina por trás dos números de SNR na tabela de
redutores de ruído acima: um número ligado a uma condição de ruído
específica, não um adjetivo. A família mais ampla de bibliotecas de fala
em ONNX puro em que isto se encaixa, incluindo o próprio
`speechonnxmetrics`, é coberta em
[Uma Família de Bibliotecas de Fala em ONNX Puro](/pt/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries).

Limpar áudio para um corpus de treino, para uma voz sintetizada, ou para
uma pessoa que o tem de ouvir é um problema de engenharia distinto, com
os seus próprios compromissos entre modelos e a sua própria lista de
abordagens que não sobreviveram ao contacto com um sinal real.

Questões sobre aplicar isto a uma pipeline específica: [entre em
contacto](/pt/contact).
