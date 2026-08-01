---
title: "Una Familia de Bibliotecas de Voz en ONNX Puro"
description: "TigreGótico mantiene un conjunto de bibliotecas de voz — extensión de ancho de banda, clonación de voz, embeddings de hablante, VAD, acentuación de palabras, fonemización, TTS y una biblioteca de métricas para puntuarlas todas — que comparten una regla en tiempo de ejecución: solo onnxruntime y numpy, sin PyTorch, sin GPU necesaria."
date: 2026-08-01
lang: es
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

ONNX es un formato de archivo para una red neuronal entrenada: los pesos y el grafo de cómputo, congelados, sin dependencia del framework que la entrenó. Un modelo exportado a ONNX puede ejecutarse a través de **ONNX Runtime**, un pequeño motor de inferencia que no hace nada más que ejecutar ese grafo. No sabe cómo se entrenó el modelo, no soporta entrenamiento, y no necesita PyTorch ni TensorFlow instalados.

Varias de nuestras bibliotecas se ciñen a una regla: en tiempo de ejecución, las únicas dependencias son `onnxruntime` y `numpy`. No «casi siempre» — el propio import del paquete nunca trae consigo un framework de entrenamiento. `audiosronnx` (extensión de ancho de banda y eliminación de ruido), `voiceclonnx` (clonación de voz), `speakeronnx` (embeddings de hablante), `speechonnxmetrics` (evaluación), `stressonnx` (acentuación de palabras), `vadonnx` (detección de actividad de voz) y `phoonnx` (fonemización y texto a voz) siguen todas esta regla, cada una en su propio paquete de PyPI. Otras dos, `phoonnx.js` y `precise-onnx-js`, aplican la misma idea en el navegador con `onnxruntime-web` en su lugar.

## Por qué molestarse

La forma obvia de distribuir un modelo de voz es mantener también el framework de entrenamiento para la inferencia. Es cómodo durante el desarrollo. Es una carga en producción.

- **Tamaño de instalación.** Una instalación de PyTorch + CUDA alcanza varios gigabytes antes de haber cargado un solo modelo. `onnxruntime` y `numpy` juntos son unas pocas decenas de megabytes.
- **Sin CUDA que gestionar.** Hacer coincidir un controlador de GPU, una versión del toolkit de CUDA y una compilación del framework es una fuente recurrente de roturas. ONNX Runtime solo-CPU se salta todo eso por completo, y sigue ejecutando el mismo grafo en una GPU cuando hay una disponible.
- **Funciona en hardware modesto.** Una Raspberry Pi o un portátil de diez años puede ejecutar `onnxruntime` cómodamente. Normalmente no puede ejecutar una pila completa de PyTorch a una velocidad utilizable, ni instalarla siquiera en una placa de 32 bits o con memoria limitada.
- **Un artefacto, todas las plataformas.** El mismo archivo `.onnx` se ejecuta sin modificar en Linux, macOS, Windows — y, a través de `onnxruntime-web`, dentro de una pestaña del navegador. No hay un paso de exportación separado por destino.
- **Sin conflictos de versión entre entrenamiento y servicio.** Una pila de entrenamiento fija versiones concretas de framework y CUDA. Una pila de servicio quiere el conjunto de dependencias más pequeño y estable posible. Separarlas significa poder actualizar una sin romper la otra.

## Qué cuesta

La restricción es real, y no es gratis.

**No puedes hacer fine-tuning en el propio proceso.** Un grafo ONNX no tiene optimizador, no tiene pasada hacia atrás. Cada una de estas bibliotecas trata los modelos como artefactos fijos: los cargas y los ejecutas. El entrenamiento o el ajuste fino ocurre por separado, con el framework original, y el resultado se exporta a ONNX después. `stressonnx` y `speechonnxmetrics` mantienen ambos un extra opcional `export` que trae `torch` únicamente para ese paso de conversión sin conexión — nunca para inferencia.

**No todas las arquitecturas se exportan limpiamente.** El flujo de control dinámico, los kernels CUDA personalizados o las operaciones sin equivalente ONNX pueden bloquear una exportación directa. El README de `audiosronnx` lo documenta directamente: mantiene una [lista de no publicados](https://github.com/TigreGotico/audiosronnx) de modelos que evaluó y rechazó, con motivos, en lugar de fingir que todo modelo de investigación se porta sin problemas.

**El preprocesamiento hay que reimplementarlo a mano.** Un framework como PyTorch o Kaldi incluye implementaciones rápidas y probadas de STFT (convertir una forma de onda en un espectrograma), características de banco de filtros mel y remuestreo. Una vez que el propio modelo ya no depende de ese framework, su preprocesamiento tampoco puede depender de él — `speakeronnx` reimplementa un banco de filtros log-mel de 80 bandas en NumPy puro exactamente por esta razón, y `audiosronnx` hace lo mismo para STFT y remuestreo. Es más código que hay que hacer bien, y necesita sus propias pruebas de paridad frente al original.

## Una tarea, varios motores, una API

Los modelos de voz entrenados varían enormemente según la lengua, la condición de grabación y el dominio objetivo. Un modelo de verificación de hablante entrenado con habla leída limpia puede fallar en audio telefónico. Un modelo de clonación de voz ajustado para transferencia de timbre en inglés puede perder inteligibilidad en lenguas tonales. No hay un único modelo que gane en todo, así que comprometerse con uno de antemano es una apuesta.

Cada biblioteca de esta familia elige una única tarea y envuelve varios modelos publicados de forma independiente tras una sola interfaz, de modo que cambiar de motor es un cambio de una línea en lugar de una reescritura.

`audiosronnx` separa sus dos funciones — eliminación de ruido y extensión de ancho de banda (convertir una grabación de banda estrecha, como audio telefónico de 8 kHz, en una señal de sonido más pleno y tasa de muestreo más alta) — tras dos cargadores, cada uno respaldado por varios motores:

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

`load_denoise` registra actualmente diez eliminadores de ruido (`dpdfnet`, `mossformer2`, `frcrn`, `mpsenet`, `gtcrn`, `cmgan`, `metadenoiser`, `mossformergan`, `voicefixer`, `deepfilternet`), desde un modelo de 0,54 MB hasta uno de 415 MB, bajo licencias distintas. `load_sr` registra siete extensores de ancho de banda (`lavasr`, `novasr`, `flowhigh`, `hifiganbwe`, `apbwe`, `sidon`, `callenhancer`). Los modelos dominados — aquellos a los que otro motor supera en todos los ejes medidos — se quedan igualmente en el registro, para que un resultado de benchmark publicado siga siendo reproducible bajo demanda.

`voiceclonnx` adopta el mismo enfoque para la clonación de voz — convertir la voz de una grabación existente para que suene como un hablante de referencia distinto, sin pasar por el texto:

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

Hay diez motores registrados (`facodec`, `openvoice`, `chatterbox`, `triaan`, `cosyvoice`, `bicodec`, `knnvc`, `focalcodec`, `lscodec`, `rvc`), que abarcan seis familias de modelos distintas — intercambio de características kNN, codec factorizado, flow-matching, transferencia de tono de color, AR codec-LM y codec desacoplado de hablante. Detrás de cada uno hay cifras publicadas de inteligibilidad y similitud de hablante, de modo que elegir un motor es una comparación, no una moneda al aire.

`vadonnx` aplica el patrón a la detección de actividad de voz — decidir qué partes de un flujo de audio contienen habla siquiera:

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

Hay seis familias de modelos registradas (`silero`, `marblenet`, `pyannote`, `fsmn`, `speechbrain`, `ten`), y una `IOSignature` declarativa permite que un único motor genérico impulse la mayoría de ellas, o apunte a cualquier archivo `.onnx` de VAD personalizado.

`speakeronnx` extrae un **embedding de hablante** — un vector de longitud fija que resume quién habla, independientemente de lo que dijo — y compara dos embeddings por similitud coseno para comprobar si dos clips son del mismo hablante:

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

Registra nueve modelos en cuatro familias de arquitectura (WeSpeaker, CAM++, ERes2Net, ReDimNet), con dimensiones de embedding y licencias publicadas.

`stressonnx` elige la acentuación de palabras para los frontends de texto a voz — qué sílaba de una palabra lleva el énfasis, información que muchas lenguas no deletrean (el ruso *за́мок*, castillo, frente a *замо́к*, cerradura, comparten todas las letras). Registra una pipeline neuronal para el ruso, una segunda para el ucraniano y el bielorruso, y un backend de reglas y vocabulario que cubre 26 lenguas sin ninguna inferencia neuronal:

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

`phoonnx` fonemiza texto (convierte palabras escritas en las unidades de sonido que consume un modelo de TTS) y ejecuta texto a voz a través de 17 motores de síntesis registrados y voces exportadas desde varios ecosistemas (phoonnx nativo, Piper, Mimic3, Coqui, MMS, Transformers):

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

`phoonnx.js` traslada las mismas rutas de tokenización al navegador con `onnxruntime-web`, y `precise-onnx-js` porta la detección de palabra de activación (extracción de características MFCC más un clasificador ONNX, compatible con los modelos Mycroft Precise) a JavaScript, ambos sin servidor:

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

Los pesos de `audiosronnx` (18 modelos publicados) y `voiceclonnx` (10 modelos publicados) viven como descargas separadas en la [organización de Hugging Face de TigreGótico](https://huggingface.co/TigreGotico), obtenidos en el primer uso y guardados en caché localmente, de modo que elegir un motor distinto es un cambio de configuración, no un nuevo despliegue.

## Cerrando el círculo: juzgar motores en lugar de adivinar

Registrar muchos motores tras una sola API solo compensa si puedes saber cuál es realmente mejor para tu entrada. Para eso está `speechonnxmetrics`: una biblioteca de métricas construida sobre la misma restricción `numpy` + `onnxruntime`, de modo que puntuar un modelo no cuesta nada adicional instalar.

Agrupa las métricas en tres tipos. Los estimadores de **MOS sin referencia** — UTMOS, DNSMOS, NISQA, SIGMOS — predicen una **Mean Opinion Score**, la valoración de naturalidad de 1 a 5 que daría un panel de oyentes humanos a un clip, sin necesitar una referencia limpia con la que comparar. Las **métricas intrusivas** — STOI (inteligibilidad objetiva a corto plazo), SI-SDR (relación señal-distorsión invariante a escala), MCD (distorsión mel-cepstral) — necesitan una referencia limpia correspondiente y miden cuán cerca está la salida de ella. Las **métricas de texto basadas en ASR** — WER (tasa de error de palabras) y CER (tasa de error de caracteres) — ejecutan un reconocedor de voz sobre la salida y comparan la transcripción con el texto esperado, detectando casos en los que un modelo produce un audio que suena bien pero dice las palabras equivocadas.

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

Esto convierte la elección de motor de una prueba de escucha en una tabla. `voiceclonnx` publica exactamente esa comparación para sus diez motores de clonación — WER frente a la transcripción de origen más una puntuación de similitud de hablante independiente para cada uno, de modo que «facodec da 0% de WER» o «lscodec cambia WER por una transferencia de timbre más fuerte» son afirmaciones medidas, no impresiones. Multiplica eso por lenguas y condiciones de grabación y la comparación manual deja de ser realista; una métrica objetiva es lo que hace que un registro de diez motores sea utilizable en lugar de abrumador.

## Dónde resulta útil

Si necesitas procesamiento de voz sin conexión — limpiar una grabación, clonar una voz, detectar quién habla o sintetizar una — en hardware que nunca verá una GPU, esta es la forma que hay que buscar: una dependencia de runtime pequeña, una elección entre modelos publicados en lugar de un único valor por defecto fijo, y una forma de medir cuál funciona realmente para tu caso. Cada biblioteca anterior está a un `pip install` de distancia, con licencia MIT o Apache a nivel de código (los pesos de cada modelo individual llevan sus propias licencias de origen, documentadas por motor), y funciona igual en un portátil, un servidor o una Raspberry Pi.

Ponte en contacto a través de [/contact](/contact) o mira qué más construimos en
[/services](/services).
