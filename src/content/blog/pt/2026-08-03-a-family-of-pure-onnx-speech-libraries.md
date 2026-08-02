---
title: "Uma Família de Bibliotecas de Fala em ONNX Puro"
description: "A TigreGótico mantém um conjunto de bibliotecas de fala — extensão de largura de banda, clonagem de voz, embeddings de locutor, VAD, acento tónico, fonemização, TTS, e uma biblioteca de métricas para as avaliar a todas — que partilham uma regra de runtime: apenas onnxruntime e numpy, sem PyTorch, sem necessidade de GPU."
date: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "TTS"
  - "voice cloning"
  - "VAD"
  - "self-hosted"
  - "phoonnx"
draft: false
---

O ONNX é um formato de ficheiro para uma rede neuronal treinada: os pesos e o grafo de computação, congelados, sem dependência da framework que os treinou. Um modelo exportado para ONNX consegue correr através do **ONNX Runtime**, um pequeno motor de inferência que só faz uma coisa: executar esse grafo.

Não sabe como o modelo foi treinado, não suporta treino, e não precisa de PyTorch ou TensorFlow instalados.

Várias das nossas bibliotecas seguem uma regra: em tempo de execução, as únicas dependências são `onnxruntime` e `numpy`. Não "principalmente": a própria importação do pacote nunca puxa uma framework de treino.

`audiosronnx` (extensão de largura de banda e remoção de ruído), `voiceclonnx` (clonagem de voz), `speakeronnx` (embeddings de locutor), `speechonnxmetrics` (avaliação), `stressonnx` (acento tónico), `vadonnx` (deteção de atividade de voz), e `phoonnx` (fonemização e texto-para-fala) seguem-na todas, cada uma no seu próprio pacote PyPI. Mais duas, `phoonnx.js` e `precise-onnx-js`, aplicam a mesma ideia no browser com `onnxruntime-web` em vez disso.

## Porquê dar-se a este trabalho

A forma óbvia de distribuir um modelo de fala é manter a framework de treino também para a inferência. É conveniente durante o desenvolvimento. É um passivo em produção.

- **Tamanho de instalação.** Uma instalação de PyTorch + CUDA chega facilmente a vários gigabytes antes sequer de carregar um único modelo. O `onnxruntime` e o `numpy` juntos são umas dezenas de megabytes.
- **Sem CUDA para gerir.** Fazer coincidir um driver de GPU, uma versão do toolkit CUDA e um build de framework é uma fonte recorrente de avarias. O ONNX Runtime apenas-CPU evita isso por completo, e continua a correr o mesmo grafo numa GPU onde uma está disponível.
- **Corre em hardware modesto.** Um Raspberry Pi ou um portátil com dez anos consegue correr o `onnxruntime` confortavelmente. Normalmente não consegue correr uma stack completa de PyTorch a uma velocidade utilizável, ou sequer instalá-la numa placa de 32 bits ou com memória limitada.
- **Um artefacto, todas as plataformas.** O mesmo ficheiro `.onnx` corre sem modificações em Linux, macOS, Windows — e, através do `onnxruntime-web`, dentro de um separador de browser. Não há um passo de exportação separado por alvo.
- **Sem conflitos de versão treino/serviço.** Uma stack de treino fixa versões específicas de framework e de CUDA. Uma stack de serviço quer o conjunto mais pequeno e estável possível de dependências. Separá-las permite atualizar uma sem partir a outra.

## O que isso custa

A restrição é real, e não é gratuita.

### Não se pode afinar (fine-tune) em processo

Um grafo ONNX não tem otimizador, nem passagem para trás. Cada uma destas bibliotecas trata os modelos como artefactos fixos: carregam-se e correm-se. O treino ou a afinação acontecem separadamente, com a framework original, e o resultado é exportado para ONNX depois disso. O `stressonnx` e o `speechonnxmetrics` mantêm ambos um extra opcional `export` que puxa o `torch` unicamente para esse passo de conversão offline, nunca para inferência.

### Nem toda a arquitetura se exporta de forma limpa

Fluxo de controlo dinâmico, kernels CUDA personalizados, ou operações sem equivalente ONNX podem bloquear uma exportação direta. O README do `audiosronnx` documenta isto diretamente: mantém uma [lista de não incluídos](https://github.com/TigreGotico/audiosronnx) de modelos que avaliou e rejeitou, com as razões, em vez de fingir que todos os modelos de investigação se transportam sem problemas.

### O pré-processamento tem de ser reimplementado à mão

Uma framework como o PyTorch ou o Kaldi traz implementações rápidas e testadas de STFT (transformar uma forma de onda num espetrograma), características de banco de filtros mel, e reamostragem. Assim que o próprio modelo deixa de depender dessa framework, o seu pré-processamento também não pode depender.

O `speakeronnx` reimplementa um banco de filtros log-mel de 80 bandas em NumPy puro exatamente por esta razão, e o `audiosronnx` faz o mesmo para STFT e reamostragem. É mais código para acertar, e precisa dos seus próprios testes de paridade face ao original.

## Uma tarefa, vários motores, uma API

Os modelos de fala treinados variam enormemente consoante a língua, a condição de gravação e o domínio-alvo. Um modelo de verificação de locutor treinado em fala lida limpa pode falhar em áudio de telefone. Um modelo de clonagem de voz afinado para transferência de timbre em inglês pode perder inteligibilidade em línguas tonais.

Não há um único modelo que ganhe em todo o lado, por isso comprometer-se com um à partida é um palpite.

Cada biblioteca desta família escolhe uma única tarefa e envolve vários modelos publicados independentes por trás de uma interface, para que trocar de motor seja uma alteração de uma linha em vez de uma reescrita.

O `audiosronnx` separa as suas duas tarefas — remoção de ruído e extensão de largura de banda (transformar uma gravação de banda estreita, como áudio telefónico a 8 kHz, num sinal de som mais completo e taxa de amostragem mais alta) — por trás de dois carregadores, cada um apoiado em vários motores:

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

O `load_denoise` regista atualmente dez removedores de ruído (`dpdfnet`, `mossformer2`, `frcrn`, `mpsenet`, `gtcrn`, `cmgan`, `metadenoiser`, `mossformergan`, `voicefixer`, `deepfilternet`), desde um modelo de 0,54 MB até um de 415 MB, sob licenças diferentes. O `load_sr` regista sete extensores de largura de banda (`lavasr`, `novasr`, `flowhigh`, `hifiganbwe`, `apbwe`, `sidon`, `callenhancer`).

Modelos dominados, os que outro motor supera em todos os eixos medidos, permanecem no registo de qualquer forma, para que um resultado de benchmark publicado se mantenha reproduzível a pedido.

O `voiceclonnx` segue a mesma abordagem para clonagem de voz — converter a voz numa gravação existente para soar como um locutor de referência diferente, sem passar por texto:

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

Estão registados dez motores (`facodec`, `openvoice`, `chatterbox`, `triaan`, `cosyvoice`, `bicodec`, `knnvc`, `focalcodec`, `lscodec`, `rvc`), abrangendo seis famílias de modelos distintas: troca de características kNN, codec fatorizado, flow-matching, transferência de tom-cor, AR codec-LM, e codec desacoplado de locutor.

Cada um vem com números publicados de inteligibilidade e semelhança de locutor, pelo que escolher um motor é uma comparação, não um lançamento de moeda ao ar.

O `vadonnx` aplica o padrão à deteção de atividade de voz — decidir que partes de um fluxo de áudio contêm fala:

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

Estão registadas seis famílias de modelos (`silero`, `marblenet`, `pyannote`, `fsmn`, `speechbrain`, `ten`), e uma `IOSignature` declarativa permite que um único motor genérico conduza a maioria delas, ou aponte para qualquer ficheiro `.onnx` de VAD personalizado.

O `speakeronnx` extrai um **embedding de locutor** — um vetor de comprimento fixo que resume quem está a falar, independentemente do que disse — e compara dois embeddings por semelhança de cosseno para verificar se dois clipes são do mesmo locutor:

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

Regista nove modelos em quatro famílias de arquitetura (WeSpeaker, CAM++, ERes2Net, ReDimNet), com dimensões de embedding e licenças publicadas.

O `stressonnx` escolhe o acento tónico para front-ends de texto-para-fala — que sílaba de uma palavra carrega a ênfase, informação que muitas línguas não soletram (russo *за́мок*, castelo, versus *замо́к*, fechadura, partilham todas as letras). Regista uma pipeline neuronal para russo, uma segunda para ucraniano e bielorrusso, e um motor de regras e vocabulário cobrindo 26 línguas sem qualquer inferência neuronal:

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

O `phoonnx` fonemiza texto (transforma palavras escritas nas unidades de som que um modelo de TTS consome) e corre texto-para-fala através de 17 motores de síntese registados e vozes exportadas de vários ecossistemas (phoonnx nativo, Piper, Mimic3, Coqui, MMS, Transformers):

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

O `phoonnx.js` transporta os mesmos caminhos de tokenização para o browser com `onnxruntime-web`, e o `precise-onnx-js` porta a deteção de palavra de ativação (extração de características MFCC mais um classificador ONNX, compatível com modelos Mycroft Precise) para JavaScript, ambos sem servidor:

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

Os pesos do `audiosronnx` (18 modelos publicados) e do `voiceclonnx` (10 modelos publicados) vivem como downloads separados na [organização Hugging Face da TigreGótico](https://huggingface.co/TigreGotico), obtidos na primeira utilização e colocados em cache localmente, pelo que escolher um motor diferente é uma alteração de configuração, não uma reimplantação.

## Medir qual motor realmente vence

Registar muitos motores por trás de uma API só compensa se se conseguir dizer qual é realmente melhor para a sua entrada. É para isso que serve o `speechonnxmetrics`: uma biblioteca de métricas construída sobre a mesma restrição `numpy` + `onnxruntime`, pelo que pontuar um modelo não custa nada extra a instalar.

Agrupa as métricas em três tipos. Os estimadores de **MOS sem referência** (UTMOS, DNSMOS, NISQA, SIGMOS) preveem um **Mean Opinion Score**, a pontuação de naturalidade de 1 a 5 que um painel humano de ouvintes daria a um clipe, sem precisar de uma referência limpa para comparar.

As **métricas intrusivas** (STOI, inteligibilidade objetiva de curto prazo; SI-SDR, razão sinal-distorção invariante à escala; MCD, distorção mel-cepstral) precisam de uma referência limpa correspondente e medem quão perto o resultado está dela. As **métricas de texto baseadas em ASR**, WER (taxa de erro por palavra) e CER (taxa de erro por carácter), correm um reconhecedor de fala sobre o resultado e comparam a transcrição com o texto esperado, apanhando casos em que um modelo produz áudio que soa bem mas diz as palavras erradas.

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

Isto transforma a escolha de motor de um teste de audição numa tabela. O `voiceclonnx` publica exatamente essa comparação para os seus dez motores de clonagem: WER face à transcrição de origem mais uma pontuação separada de semelhança de locutor para cada um, pelo que "o facodec dá 0% de WER" ou "o lscodec troca WER por uma transferência de timbre mais forte" são afirmações medidas, não impressões.

Multiplique isso por línguas e condições de gravação e a comparação manual deixa de ser realista. Uma métrica objetiva é o que mantém um registo de dez motores gerível.

## Onde isto é útil

Se precisar de processamento de fala offline (limpar uma gravação, clonar uma voz, detetar quem está a falar, ou sintetizar uma) em hardware que nunca verá uma GPU, esta é a forma a procurar: uma pequena dependência de runtime, uma escolha de modelos publicados em vez de um único valor por defeito fixo, e uma forma de medir qual funciona realmente para o seu caso.

Cada biblioteca acima está a um `pip install` de distância, licenciada como MIT ou Apache ao nível do código (os pesos de cada modelo individual carregam as suas próprias licenças a montante, documentadas por motor), e corre da mesma forma num portátil, num servidor ou num Raspberry Pi.

Entre em contacto através de [/contact](/pt/contact) ou veja o que mais construímos em [/services](/pt/services).
