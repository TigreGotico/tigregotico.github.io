---
title: "Eligiendo un Motor de Clonación de Voz"
description: "voiceclonnx ejecuta 10 motores de conversión de voz tras una sola API, desde el intercambio de características kNN hasta el codec-LM autorregresivo. Esta es una guía de las familias de modelos que hay detrás, el compromiso real medido entre inteligibilidad y similitud de hablante, y cómo elegir un motor para un trabajo concreto."
date: 2026-08-01
lang: es
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "voice cloning"
  - "voice conversion"
  - "self-hosted"
draft: false
---

La conversión de voz toma una grabación y un hablante de referencia, y produce las mismas palabras con la voz del hablante de referencia. No interviene ningún texto en ningún punto del pipeline: la entrada es audio, la salida es audio, y el modelo nunca lee ni escribe una transcripción. Eso es lo que la separa del texto a voz (TTS), que parte de texto y no tiene ninguna grabación de origen que preservar. La conversión de voz responde a una pregunta más estrecha: dada esta grabación, haz que suene como otra persona, manteniendo intactas las palabras.

Ese trabajo más estrecho tiene usos reales. Doblar una grabación a una voz consistente sin contratar a un segundo actor de doblaje. Anonimizar a un hablante en una entrevista o una llamada de soporte manteniendo las palabras textuales. Dar a la salida de un sistema de TTS una única identidad estable entre lenguas, cuando las voces subyacentes de cada lengua se entrenaron de forma independiente y de otro modo sonarían como personas distintas.

[`voiceclonnx`](https://github.com/TigreGotico/voiceclonnx) implementa 10 de estos motores tras una sola API de Python, todos ejecutándose en `onnxruntime` sin necesitar PyTorch en tiempo de inferencia. Los motores no son intercambiables. Vienen de familias de modelos distintas, y elegir uno significa elegir un compromiso, no un ganador.

## La API, brevemente

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
print(cloner.sample_rate)   # 16000
```

`clone_voice(audio, reference_voice, out_path)` toma la grabación de origen, un clip de referencia de 5 a 30 segundos del hablante objetivo, y una ruta de salida, y devuelve la ruta al WAV convertido. Cambiar de motor significa cambiar la cadena `engine=`; la forma de la llamada no cambia. Un motor, `rvc`, es la excepción — toma una ruta a un modelo de voz `.onnx` en lugar de una grabación de referencia, cubierto más abajo. `pip install voiceclonnx` trae los 10 motores; los modelos se descargan de Hugging Face en el primer uso.

## Dos ejes, no una puntuación

Dos números describen lo bien que funcionó una conversión, y no se mueven juntos.

**La tasa de error de palabras (WER)** mide la inteligibilidad: cuánto de la frase original sobrevivió, según se juzga pasando la salida de nuevo por un reconocedor de voz y comparando con la transcripción de origen. 0% de WER significa que todas las palabras se transmitieron correctamente.

**La similitud de hablante** mide la identidad: si la salida realmente suena como el hablante objetivo, no como el original. Se calcula extrayendo un embedding de hablante — una huella numérica compacta del timbre de una voz, el color tonal que hace que una voz suene distinta de otra al mismo tono y volumen — de la salida y del clip de referencia, y comparándolos con similitud coseno. Una puntuación de 1,0 significa timbre idéntico; la línea base propia de `voiceclonnx` — una copia sin convertir del origen puntuada contra el objetivo — se sitúa en 0,09, así que cualquier cosa significativamente por encima de eso está haciendo un trabajo de conversión real.

`voiceclonnx` publica ambos números para cada motor, medidos sobre la misma frase convertida a dos voces de referencia. El WER viene de `faster-whisper`; la similitud de hablante viene de un modelo de embedding `wespeaker-resnet34` (contrastado con otros dos). Ponlos uno junto al otro y aparece un patrón: ningún motor encabeza las dos columnas.

| Motor | Familia | WER | Similitud con el objetivo |
|---|---|---|---|
| `focalcodec` | Intercambio de características kNN | 15-19% | **0,61** |
| `lscodec` | Codec con hablante desacoplado | ~35% | 0,54 |
| `chatterbox` | Codec-LM autorregresivo | 4-8% | 0,54 |
| `knnvc` | Intercambio de características kNN | 12-15% | 0,49 |
| `facodec` | Codec factorizado | **0%** | 0,44 |
| `openvoice` | Transferencia de color tonal | **0%** | 0,37 |
| `bicodec` | Tokens semánticos + globales | 12% | 0,29 |
| `triaan` | Triple-AAN | 4% | 0,29 |
| `cosyvoice` | Flow-matching | 8% | 0,21 |

(`rvc` convierte cualquier origen a una única voz fija entrenada por la comunidad en lugar de a un clip de referencia arbitrario, así que no es comparable en esta tabla; ver más abajo.)

Lee la tabla por filas, no buscando una única línea mejor. `facodec` y `openvoice` se sitúan en 0% de WER — todas las palabras sobreviven — con similitud moderada. `focalcodec` y `lscodec` se sitúan en el otro extremo: la transferencia de timbre más fuerte del conjunto, comprada dejando que un 15-35% de las palabras salgan mal. `chatterbox` es el único motor que rinde bien en ambos ejes a la vez (4-8% de WER, 0,54 de similitud), lo cual es una propiedad de su arquitectura, cubierta a continuación.

## Por qué las familias se comportan de forma distinta

Los motores se dividen en enfoques distintos, y el enfoque predice dónde se sitúa un motor en la tabla de arriba.

**Intercambio de características kNN** (`knnvc`, `focalcodec`). El audio de origen se divide en fotogramas cortos, cada uno convertido en un vector de características por un codificador autosupervisado preentrenado. Para cada fotograma de origen, el algoritmo encuentra los *k* fotogramas más cercanos en un conjunto de características del hablante objetivo y los promedia, reemplazando el fotograma de timbre del origen mientras deja el contenido fonético subyacente donde fue extraído de la propia representación del codificador. No hay un decodificador aprendido que mapee una voz a otra — el intercambio es una búsqueda de vecino más cercano — razón por la cual la transferencia de timbre puede ser agresiva (`focalcodec` alcanza 0,61 de similitud) a costa de a veces distorsionar fotogramas que tenían una mala coincidencia en el conjunto objetivo, lo que se refleja en el WER.

**Codec factorizado** (`facodec`). Un códec de audio neuronal — un modelo que comprime el habla en una secuencia compacta de tokens y la reconstruye — entrenado para dividir esos tokens explícitamente en flujos separados de contenido y timbre. Como el contenido es un flujo dedicado, el decodificador reconstruye las palabras con alta fidelidad; solo el flujo de timbre se intercambia por el del hablante objetivo. Esa separación explícita es por qué `facodec` alcanza 0% de WER: la preservación del contenido no compite con nada.

**Transferencia de color tonal** (`openvoice`). Un módulo de conversión cambia el color tonal — el contorno de tono y el timbre — después de que un codificador separado haya fijado el contenido lingüístico, similar en espíritu al enfoque del codec factorizado pero implementado como un paso de transferencia de color sobre un espectrograma mel en lugar de tokens discretos. También alcanza 0% de WER, con una similitud algo menor que `facodec`.

**Codec-LM autorregresivo** (`chatterbox`). Un modelo de lenguaje autorregresivo que predice tokens de códec de uno en uno, condicionado al embedding del hablante objetivo, de forma muy parecida a un modelo de lenguaje de texto a voz pero condicionado a los tokens de contenido de la grabación de origen en lugar de a texto. Como genera la prosodia (ritmo, acento, entonación) como parte del mismo proceso autorregresivo en lugar de copiarla directamente del origen, puede llevar el estilo de habla junto con el timbre — razón por la que la documentación señala que da el «cambio de origen a objetivo más fuerte» — y es el único motor que puntúa bien tanto en inteligibilidad como en similitud a la vez.

**Flow-matching** (`cosyvoice`). Un proceso generativo continuo que refina iterativamente ruido hasta el espectrograma mel objetivo, usando un solucionador de EDO (ecuación diferencial ordinaria) ejecutado un número configurable de pasos (`ode_steps`, por defecto 10). Su codificador de contenido está diseñado para transferencia entre lenguas, y esa generalidad es probablemente la razón por la que su puntuación de similitud con el objetivo es la más baja del conjunto: la representación optimiza para la independencia de la lengua, no para la coincidencia de hablante más ajustada.

**Codec con hablante desacoplado** (`lscodec`). Como `facodec`, un codec entrenado para separar el contenido de la identidad del hablante, pero ajustado para empujar más la similitud a costa directa de la precisión del flujo de contenido, situándose en ~35% de WER con la segunda similitud más alta del conjunto.

**Codecs de Triple-AAN y de tokens semánticos-más-globales** (`triaan`, `bicodec`) se sitúan en el medio en ambos ejes: WER moderado, similitud moderada, sin un sesgo fuerte en ninguna dirección.

**Codec de cualquiera-a-UNO más vocoder** (`rvc`). Construido sobre ContentVec (un codificador de contenido) alimentando un vocoder VITS, entrenado por voz objetivo en lugar de aceptar un clip de referencia arbitrario. `reference_voice` para este motor es una ruta a un archivo de modelo RVC `.onnx` o un ID de repositorio de Hugging Face, no un archivo de audio:

```python
cloner = VoiceCloner(engine="rvc")
out = cloner.clone_voice("source.wav", "/path/to/myvoice.onnx", "out.wav")
```

Como cada modelo RVC se entrena con una única voz objetivo, no toma un clip de referencia en tiempo de inferencia y no se puntúa con el mismo benchmark de similitud que los motores de cualquiera-a-cualquiera. Su 38% de WER medido refleja un modelo de muestra entrenado por la comunidad, no la arquitectura en general — la calidad depende de cómo se entrenó ese modelo concreto. Existen miles de voces RVC comunitarias en Hugging Face y se cargan directamente por ID de repositorio.

## Decidir cuál ejecutar

**Pipeline rápido y de propósito general.** Empieza con `facodec` u `openvoice`. Ambos alcanzan 0% de WER medido con similitud moderada (0,44 y 0,37), y ambos incluyen una variante cuantizada INT8 sin ninguna regresión de calidad documentada — pasa `quantized=True` para un modelo más pequeño y rápido.

**Máxima similitud de hablante.** Usa `focalcodec` (0,61 de similitud, la más alta medida) si el 15-19% de WER es aceptable para el caso de uso, o `chatterbox` (0,54 de similitud, 4-8% de WER) si no lo es. `chatterbox` también funciona a 24 kHz, la tasa de salida más alta para conversión de cualquiera-a-cualquiera del conjunto — `rvc` llega hasta 48 kHz pero solo en el modo cualquiera-a-UNO de arriba.

**Hardware de bajos recursos.** `knnvc` en INT8 pesa unos 123 MB en disco, la huella más pequeña del conjunto, con 0,49 de similitud y 12-15% de WER — un compromiso razonable para memoria limitada. No todos los motores se cuantizan limpiamente: `focalcodec` y `cosyvoice` están documentados como degradados en INT8, así que mantén esos dos en fp32.

**Una lengua con la que el motor no fue entrenado.** El codificador de contenido de `cosyvoice` está construido para transferencia entre lenguas, que es la razón documentada para recurrir a él en lugar de a un motor ajustado para conversión en la misma lengua, aunque su similitud medida (0,21) sea la más baja de los nueve motores directamente comparables.

**Identidad de voz por encima de la exactitud literal de las palabras.** `lscodec` da la transferencia de timbre más fuerte entre los motores de la familia codec (0,54, empatado con `chatterbox`) a costa del WER más alto del conjunto comparable (~35%). Elígelo cuando el objetivo sea «¿suena esto como el hablante objetivo?» y los errores de palabra ocasionales en la salida sean tolerables.

**Una única voz fija de la comunidad en lugar de un clip arbitrario.** `rvc`, usando un modelo de voz `.onnx` preentrenado en lugar de una grabación de referencia.

**Restricción no comercial que hay que comprobar primero.** Los pesos de `bicodec` tienen licencia CC BY-NC-SA 4.0. Los pesos de todos los demás motores son MIT, Apache-2.0 o CC BY 4.0. Verifica la licencia del peso concreto que despliegues antes de usarlo comercialmente.

## Lo que no hace bien, y en quién no debería usarse

Cada número de arriba viene con la misma advertencia: los números describen una frase de demostración en inglés convertida entre dos voces de referencia concretas. Una lengua distinta, una grabación de origen más ruidosa, un clip de referencia más corto o de menor calidad, o un hablante de origen cuya voz esté lejos de cualquier cosa en los datos de entrenamiento de un motor moverán todos los números, normalmente para peor. Ninguno de estos motores es un arreglo universal para una grabación de origen de baja calidad — varios de ellos convierten el timbre alegremente mientras dejan pasar el ruido de origen sin cambios, ya que el ruido tiene su propia firma acústica que una separación de contenido/timbre no siempre separa limpiamente.

La conversión de voz también plantea un riesgo real en el que ya obligó a pensar a su prima cercana, la clonación de voz para TTS: convertir una grabación para que suene como una persona real e identificable es una tecnología capaz de suplantación, sea o no esa la intención. La regla que este equipo aplica a las voces sintéticas en general — obtener permiso explícito antes de usar la voz de una persona real como donante u objetivo, y recurrir a grabaciones de dominio público o a una voz deliberadamente original cuando el permiso no es posible — se aplica aquí sin excepción. Un clip de referencia de una persona real no es distinto, desde el punto de vista del consentimiento, de un conjunto de entrenamiento completo de su voz; simplemente hace falta mucho menos de él para producir un resultado utilizable, lo cual es motivo para más precaución, no menos.

Ponte en contacto a través de [contact](/es/contact) o mira [lo que ofrecemos](/es/services) si la conversión de voz forma parte de un pipeline que estás construyendo.
