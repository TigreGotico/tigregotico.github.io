---
title: "Medir la Calidad del Habla Sin un Panel de Escucha"
description: "Una guía práctica de speechonnxmetrics: qué miden realmente el MOS, los predictores de MOS sin referencia, las métricas intrusivas de señal y el WER/CER basado en ASR, cuándo aplica cada uno, puntuaciones reales de audio real, y por qué un MOS predicho es evidencia, no verdad."
date: 2026-08-01
lang: es
author: "Casimiro Ferreira"
tags:
  - "speechonnxmetrics"
  - "TTS"
  - "ONNX"
  - "evaluation"
draft: false
---

Un modelo de eliminación de ruido publica un nuevo checkpoint. Una voz de TTS se reentrena con más datos. Un pipeline de clonación de voz cambia su vocoder. En cada caso, alguien tiene que responder: ¿la salida es mejor o peor que antes? «A mí me suena mejor» no escala. Se rompe en el momento en que la lengua no es una que hablas, en el momento en que hay veinte checkpoints que comparar en lugar de dos, o en el momento en que el cambio necesita comprobarse en cada commit en lugar de una vez a mano.

La respuesta rigurosa a «¿suena mejor?» es una **Mean Opinion Score (MOS)**: poner el audio delante de un panel de oyentes, pedir a cada uno que lo puntúe de 1 a 5, y promediar las puntuaciones. El MOS es la métrica estándar de calidad de voz porque hace la pregunta que importa, ¿lo encontraría aceptable un humano?, en lugar de un sustituto de ella.

También es caro. Reclutar un panel, ejecutarlo de forma consistente, y repetirlo para cada lengua, cada condición de grabación y cada versión de modelo que un equipo pequeño publica no es algo con lo que un panel de escucha pueda mantener el ritmo.

[`speechonnxmetrics`](https://github.com/TigreGotico/speechonnxmetrics) es una biblioteca para aproximar ese juicio sin un panel, en cada build. Agrupa sus métricas en tres familias, y elegir la familia adecuada para la situación importa más que cualquier número individual.

## Tres familias, tres preguntas

Los **estimadores de MOS sin referencia** son redes neuronales entrenadas para predecir lo que diría un panel de escucha, a partir solo del audio. No necesitan ningún original limpio, solo la salida que quieres juzgar.

Usa esta familia cuando no hay una referencia real con la que comparar: puntuar la salida de un sistema de TTS, o comprobar una grabación real, ya degradada, después de eliminar el ruido.

Las **métricas intrusivas** necesitan una referencia limpia correspondiente y miden la distancia entre ella y la señal degradada. Usa esta familia cuando tú mismo has fabricado la degradación y todavía conservas el original limpio: hiciste pasar una grabación conocida-buena por un códec, un modelo de extensión de ancho de banda o un conversor de voz, y quieres saber cuánto se ha desviado la salida de la fuente.

Las **métricas de texto basadas en ASR** transcriben la salida con un reconocedor de voz y comparan la transcripción con el texto esperado. Esto detecta algo que las otras dos familias no pueden: audio que suena perfectamente natural y limpio pero dice las palabras equivocadas. Un predictor de MOS sin referencia puntúa la naturalidad, no la corrección, así que una mala pronunciación fluida puntúa bien. Una métrica intrusiva necesita una forma de onda de referencia, no una frase de referencia. Solo comparar texto detecta una palabra equivocada.

La biblioteca expone esto a través de una función:

```python
import speechonnxmetrics as s

# Sin referencia: solo se necesita la salida, no existe verdad de referencia
s.score("output.wav", ["utmos"])

# Intrusivo: necesita una referencia limpia, ref= es obligatorio
s.score("degraded.wav", ["stoi", "mcd", "si_sdr"], ref="clean.wav")
```

Las métricas de texto viven en un módulo separado, `speechonnxmetrics.asr`, porque comparan cadenas, no audio. `s.score()` solo despacha métricas que toman una forma de onda.

## MOS sin referencia: leyendo los números

Se incluyen cuatro estimadores de MOS, cada uno devolviendo valores en una escala de 1 a 5 donde más alto es mejor, la misma escala que usa un panel humano:

| métrica | dimensiones | entrenada con | uso comercial |
|---|---|---|---|
| `utmos` | una puntuación de naturalidad | habla sintetizada (VoiceMOS Challenge) | sí |
| `dnsmos` | `sig` / `bak` / `ovrl` (calidad de la voz / ruido de fondo / global) | ITU-T P.835 | sí |
| `dnsmos_p808` | un MOS de escucha crowdsourced | ITU-T P.808 | sí |
| `sigmos` | 7 dimensiones (`col`, `disc`, `loud`, `noise`, `reverb`, `sig`, `ovrl`) | ITU-T P.804 | sí |
| `nisqa` | `mos` más el desglose `noi`/`dis`/`col`/`loud` | NISQA-v2 | **no — CC BY-NC-SA 4.0** |

`nisqa` es la única métrica de toda la biblioteca con pesos no comerciales. Las otras cuatro tienen licencia MIT. `speechonnxmetrics` no filtra esto por ti. Declara la licencia y deja la elección a quien la usa.

Esto es lo que puntúa el audio real. Ejecutando las propias fixtures incluidas en la biblioteca (una grabación limpia, `source.wav`, y una resíntesis mediante códec neuronal del mismo clip, `facodec_aria.wav`) a través de UTMOS:

```python
>>> s.score("source.wav", ["utmos"])
{'utmos': 4.41}
>>> s.score("facodec_aria.wav", ["utmos"])
{'utmos': 3.21}
```

La grabación limpia se sitúa cerca de lo alto de la escala, como debe ser. Es habla humana real, no sintetizada. La resíntesis mediante códec cae más de un punto entero. Esa diferencia, más que cualquiera de los dos números por separado, es la señal útil: te dice que el códec introduce una degradación audible, y te da un número que rastrear a medida que el códec se afina.

DNSMOS sobre la misma grabación limpia:

```python
>>> s.score("source.wav", ["dnsmos"])
{'dnsmos.sig': 3.45, 'dnsmos.bak': 3.60, 'dnsmos.ovrl': 2.93}
```

Tres números, no uno, y divergen: `ovrl` se sitúa notablemente por debajo tanto de `sig` como de `bak`. Esa divergencia es informativa, no un fallo. `ovrl` es la valoración de P.835 de la experiencia de escucha global, y tiende a penalizar una grabación con más fuerza de lo que cualquier puntuación de componente por sí sola sugeriría, especialmente para una grabación del mundo real en lugar de una de estudio. Cuando `bak` es bajo, busca ruido de fondo. Cuando `sig` es bajo, busca artefactos a nivel de voz: clipping, cortes, timbre robótico. Conviene reportar más de un predictor para el mismo clip. Están entrenados con datos distintos y discrepan de formas informativas, y una brecha amplia entre dos predictores independientes en el mismo clip es una señal para ir a escuchar.

## Métricas intrusivas: leyendo los números

Se incluyen once métricas basadas en referencia que miden la distancia respecto a un original limpio. Las que conviene conocer primero:

| métrica | rango | dirección | mide |
|---|---|---|---|
| `stoi` / `estoi` | 0–1 | más alto es mejor | inteligibilidad objetiva a corto plazo — cuánto del *contenido* sobrevive, independientemente de lo natural que suene |
| `si_sdr` / `sdr` / `snr` | dB, sin límite | más alto es mejor | relación señal-distorsión / señal-ruido |
| `mcd` | dB, sin límite | más bajo es mejor | distorsión mel-cepstral — distancia de la envolvente espectral, una métrica clásica de calidad para TTS/VC |
| `log_f0_rmse` | sin límite | más bajo es mejor | error de contorno de tono |
| `lsd` / `msd` | dB | más bajo es mejor | distancia log-espectral / mel-espectral |

Nótese que la dirección se invierte: STOI y la familia SDR suben cuando la calidad es mejor, mientras que MCD, el error de tono y la distancia espectral bajan. Confundirlos al leer una tabla es un error fácil de cometer.

Puntuando la misma resíntesis mediante códec contra su fuente limpia:

```python
>>> s.score("facodec_aria.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav")
{'stoi': 0.662, 'mcd': 10.46, 'si_sdr': -26.94}
```

Un STOI de 0,66 en una escala de 0 a 1 donde 1,0 es una coincidencia perfecta dice que la inteligibilidad sufrió un golpe real. Está bien por debajo de lo que puntuaría una grabación ligeramente procesada.

Un SI-SDR de aproximadamente −27 dB lo confirma. El SI-SDR es negativo siempre que la energía de distorsión supera a la de la señal, y un número negativo grande significa un cambio estructural fuerte, no solo ruido añadido. Un MCD de 10,46 dB es alto. Los sistemas de TTS publicados que suenan claramente sintéticos pero mantienen la consistencia del hablante suelen situarse en cifras de un solo dígito, así que 10 y pico apunta a una deriva sustancial de la envolvente espectral entre la resíntesis y el original.

## Métricas basadas en ASR: leyendo los números

Cinco métricas de texto proceden de una única alineación de Levenshtein entre una transcripción de referencia y una hipótesis (lo que realmente se transcribió del audio):

| métrica | rango | dirección | significado |
|---|---|---|---|
| `wer` | ≥ 0 (normalmente 0–1, puede superar 1) | más bajo es mejor | tasa de error de palabras: sustituciones + eliminaciones + inserciones, dividido entre el número de palabras de referencia |
| `cer` | 0–1 | más bajo es mejor | la misma idea a nivel de carácter — más permisiva con pequeñas discrepancias de ortografía/tokenización |
| `mer` | 0–1 | más bajo es mejor | tasa de error de coincidencia |
| `wil` | 0–1 | más bajo es mejor | información de palabras perdida |
| `wip` | 0–1 | más alto es mejor | información de palabras preservada (`1 − wil`) |

Un ejemplo resuelto: referencia «the quick brown fox jumps over the lazy dog» frente a hipótesis «the quick brown fox jumped over a lazy dog» (una sustitución, «jumps» → «jumped», una eliminación de «the»):

```python
>>> from speechonnxmetrics import asr
>>> from speechonnxmetrics.asr import BASIC
>>> asr.wer(reference, hypothesis, normalizer=BASIC)
0.222
>>> asr.cer(reference, hypothesis, normalizer=BASIC)
0.116
```

Un WER de 0,22 significa que aproximadamente una palabra de cada cinco está mal: perceptible, digno de escucharse. El CER es más bajo en el mismo par porque la puntuación a nivel de carácter trata una sustitución de una palabra como un puñado de ediciones de caracteres dentro de una cadena de caracteres mucho más larga, no como un token entero que falta.

CER y WER responden preguntas distintas y no son directamente comparables entre sí. Un WER por encima de aproximadamente 0,3–0,4 en habla natural suele significar que el sistema de ASR, o el audio que está transcribiendo, tiene un problema real, no un error de redondeo.

`speechonnxmetrics` nunca normaliza el texto por ti. Una comparación en bruto cuenta las mayúsculas y la puntuación como errores, que rara vez es lo que quieres cuando estás puntuando pronunciación en lugar del formato exacto de la transcripción. Pasa un normalizador explícitamente: `BASIC` pasa a minúsculas y colapsa espacios en blanco, `STRICT` además expande contracciones y elimina diacríticos, puntuación y muletillas.

## La advertencia que más importa

Cada número de MOS sin referencia de esta biblioteca es una predicción de un modelo, no la medición de un hecho. UTMOS, DNSMOS, SIGMOS y NISQA se entrenaron cada uno con un conjunto específico de datos de pruebas de escucha, en lenguas y condiciones de grabación específicas. Un predictor entrenado sobre todo con grabaciones de estudio en inglés puede juzgar mal una lengua que nunca vio en el entrenamiento, un acento que su panel de entrenamiento nunca puntuó, o una condición de grabación (audio telefónico, una sala ruidosa, un micrófono de bajos recursos) fuera de su distribución de entrenamiento. El modelo no está mintiendo. Está extrapolando, y la extrapolación a partir de entradas poco familiares es donde los predictores neuronales son menos fiables.

Trata un MOS predicho como evidencia, no como verdad de referencia. Es fiable para lo que se le da bien: detectar regresiones grandes, ordenar varios candidatos entre sí, y señalar una ejecución que necesita que un humano la escuche de verdad.

No es un sustituto de un panel de escucha real cuando una decisión tiene mucho en juego, y no debería ser la última palabra sobre una lengua o condición que el modelo subyacente no fue entrenado para juzgar. La mitigación práctica es reportar varios predictores juntos y tratar el desacuerdo entre ellos como una invitación a escuchar en lugar de ruido que promediar.

## Lo que esto hace posible

Nada de esto es útil de forma aislada. Se vuelve útil en el momento en que hay que comparar varios motores en igualdad de condiciones: qué motor de TTS, qué motor de STT, qué modelo de mejora usar por defecto.

Las [bibliotecas de voz en ONNX puro](/es/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries) que `speechonnxmetrics` fue construida para evaluar (TTS, ASR, eliminación de ruido, clonación de voz) publican comparaciones por motor producidas exactamente con las métricas de arriba: MOS sin referencia para sistemas sin verdad de referencia, métricas intrusivas donde existe una referencia limpia, WER/CER siempre que la corrección de la transcripción esté en cuestión. Eso es lo que convierte «elegimos este motor» en un número que otra persona puede comprobar.

Si tu proyecto necesita evaluar de esta forma una lengua, un motor o una condición de grabación y todavía no está cubierto, [ponte en contacto](/es/contact) o mira [nuestros servicios](/es/services).
