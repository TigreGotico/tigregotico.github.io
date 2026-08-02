---
title: "Limpiando Audio Deficiente: Eliminación de Ruido y Extensión de Ancho de Banda en audiosronnx"
description: "Un análisis en profundidad de las dos tareas independientes de audiosronnx — eliminar ruido y reconstruir frecuencias altas ausentes — con el registro real de motores, tamaños y licencias de los modelos, la lista de modelos rechazados, y cómo comprobar si la salida realmente mejoró."
date: 2026-08-01
lang: es
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "denoising"
  - "bandwidth extension"
  - "speech"
draft: false
---

Una grabación puede estar mal de dos formas distintas, y las soluciones no se solapan.

La primera forma: hay ruido de fondo montado encima del habla — tráfico, un ventilador, el zumbido de una sala. La señal que importa está ahí; algo más se ha mezclado con ella. Eliminar eso es **eliminación de ruido** (denoising).

La segunda forma: la grabación nunca captó la señal completa desde un principio. El audio telefónico se muestrea a 8000 muestras por segundo (8 kHz); una grabación de calidad completa suele ser de 48 kHz. La **tasa de muestreo** fija la frecuencia más alta que una señal digital puede representar, así que una llamada a 8 kHz no tiene absolutamente ningún contenido por encima de 4 kHz — no está silenciado, no está filtrado, simplemente nunca se grabó. Hacer que ese audio vuelva a sonar pleno significa inventar frecuencias altas plausibles que nunca se captaron. Eso es **extensión de ancho de banda**.

`audiosronnx` trata esto como dos problemas distintos con dos puntos de entrada distintos, porque usar el equivocado hace la cosa equivocada. Ejecuta un extensor de ancho de banda sobre una señal ruidosa y reconstruirá fielmente una versión en alta frecuencia del ruido. La eliminación de ruido tiene que ocurrir primero.

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _     = load_sr("lavasr").upscale(clean, rate)              # extend to 48 kHz
```

`load_denoise()` y `load_sr()` rechazan los motores del otro — pedirle a `load_denoise` un extensor de ancho de banda lanza un error en lugar de hacer silenciosamente el trabajo equivocado.

## Por qué esto va antes del reconocimiento

El reconocimiento de voz y la identificación de hablantes suelen entrenarse con audio comparativamente limpio. Dale a un reconocedor habla telefónica a 8 kHz, o habla con un ventilador de fondo, y la tasa de error de palabras sube — no porque el modelo sea malo, sino porque la entrada ya no se parece a lo que se usó en su entrenamiento. Lo mismo se aplica a los embeddings de hablante usados para identificación o diarización: el ruido y el ancho de banda ausente distorsionan el detalle acústico exacto del que dependen esos embeddings.

Eso convierte la limpieza en una etapa del pipeline que va *antes* del reconocimiento, no en una alternativa a él. Un pipeline real para una llamada telefónica ruidosa a 8 kHz es así: eliminar ruido, luego extender a 48 kHz, luego ejecutar reconocimiento o identificación de hablante sobre el resultado. Cambiar a un reconocedor mejor sin arreglar antes la entrada gasta el esfuerzo en el lugar equivocado — el modelo se degrada sobre la misma señal dañada por muy bueno que sea.

## El registro de motores

`audiosronnx` incluye diez eliminadores de ruido y siete extensores de ancho de banda, todos cargables por nombre a través de `load_denoise()` / `load_sr()`, todos ONNX puro sin torch en tiempo de ejecución.

Eliminadores de ruido:

| Motor | Tasa | Tamaño | Licencia |
|--------|------|------|---------|
| dpdfnet (por defecto) | 8/16/48 kHz | 8,7–14,9 MB | Apache-2.0 |
| mossformer2 | 48 kHz | 229 MB | Apache-2.0 |
| frcrn | 16 kHz | 57,5 MB | Apache-2.0 |
| mpsenet | 16 kHz | 9,7 MB | MIT |
| gtcrn | 16 kHz | 0,54 MB | MIT |
| cmgan | 16 kHz | 7,8 MB | MIT |
| metadenoiser | 16 kHz | 19–34 MB | CC-BY-NC-4.0 |
| mossformergan | 16 kHz | 17,7 MB | Apache-2.0 |
| voicefixer | 44,1 kHz | 415 MB | MIT |
| deepfilternet | 48 kHz | ~2 MB | MIT |

Extensores de ancho de banda:

| Motor | Entrada | Tamaño | Licencia |
|--------|-------|------|---------|
| lavasr (por defecto) | 8–48 kHz | ~52 MB | Apache-2.0 |
| novasr | 16 kHz | ~0,2 MB | Apache-2.0 |
| flowhigh | cualquiera | ~200 MB | MIT |
| hifiganbwe | cualquiera | ~4 MB | MIT |
| apbwe | cualquiera (banda de 12 kHz) | ~120 MB | MIT |
| sidon | 16 kHz | ~410 MB | MIT |
| callenhancer | 8–16 kHz | ~3 GB / ~1,3 GB int8 | CC-BY-NC-4.0 |

El modelo más pequeño de la biblioteca, `gtcrn`, pesa 0,54 MB. El más grande, `voicefixer`, pesa 415 MB — casi 800 veces más grande, y hace un trabajo distinto: es un modelo de *restauración* que trata a la vez el ruido, la reverberación, el clipping y el ancho de banda ausente en lugar de un problema cada vez.

La mayoría de los pesos son MIT o Apache-2.0. Dos no lo son: `metadenoiser` y `callenhancer` se distribuyen bajo CC-BY-NC-4.0, no comercial. Esa licencia cubre los pesos, no el audio procesado con ellos, y la biblioteca lo declara en cada punto de uso — `audiosronnx list` lo reporta por motor. Nada impide que quien la use elija `metadenoiser` por su arquitectura en el dominio temporal, pero la elección debe hacerse con conocimiento de causa.

El registro existe porque ningún modelo único gana en todas las grabaciones. `dpdfnet` es el valor por defecto porque no necesita dependencias adicionales y cubre 8, 16 y 48 kHz desde un solo modelo. `mossformer2` es la mejor elección medida sobre entrada de banda completa. `mossformergan` publica la puntuación PESQ más alta (3,47) entre los eliminadores de ruido incluidos. `gtcrn` es la elección cuando la restricción determinante es el tamaño, con 0,54 MB. En un clip de prueba con ruido gaussiano de banda ancha, los eliminadores de ruido recuperaron de 3,5 a 5,9 dB de SNR con un SNR de entrada de 19 dB, subiendo a 7,5–13,7 dB con un caso más difícil de 5 dB de entrada. Ese es un caso de ruido sintético y hostil: ordena los motores de forma consistente pero dice poco sobre ruido de fondo tipo babble o artefactos de códec, que es exactamente por qué el registro mantiene diez modelos en lugar de publicar solo el ganador.

`cmgan` es el caso más claro de un modelo mantenido a propósito a pesar de perder: está dominado tanto en PESQ como en SNR por `gtcrn`, que pesa catorce veces menos, y se queda de todos modos — para que los resultados publicados construidos contra `cmgan` sigan siendo reproducibles y una arquitectura distinta siga disponible para comparar.

En el lado de la extensión de ancho de banda, `sidon` y `callenhancer` hacen un trabajo distinto de `lavasr` o `novasr`: en lugar de añadir una banda alta plausible encima de la señal existente, resintetizan el habla desde cero a través de un vocoder neuronal, lo que puede reparar daño de códec que un extensor de banda no puede tocar — a un coste computacional mucho mayor. `callenhancer` está entrenado específicamente en audio de telefonía, razón por la cual sus pesos llevan la licencia no comercial.

## Lo que no llegó a entrar

`audiosronnx` incluye un motor solo cuando se exporta a un único grafo ONNX estático, se ejecuta en CPU a través de onnxruntime, tiene una licencia clara, y se ha validado de extremo a extremo contra la implementación original — no solo contra el modelo en bruto, ya que un grafo que coincide con la red pero no con su normalización circundante produce audio que suena bien y está silenciosamente equivocado.

El archivo `docs/not-shipped.md` del proyecto documenta cada candidato que evaluó y rechazó, con el motivo específico, lo que lo convierte en uno de los documentos más útiles del repositorio porque muestra los límites reales de lo que «ONNX puro, solo CPU» puede hacer hoy en lugar de simplemente afirmarlos.

**Los muestreadores iterativos no tienen un grafo estático que exportar.** Los modelos de difusión y de flow-matching ejecutan una red muchas veces por enunciado, con un bucle cuya longitud no está fijada en el momento de la exportación. AudioSR (un pipeline de difusión latente de unos 6 GB, con un VAE, un LDM y un vocoder separados) y SGMSE caen ambos aquí — el propio seguimiento en streaming de 2025 de SGMSE solo alcanza tiempo real en una GPU de consumo, y ni hablar de CPU.

**Las convoluciones dependientes de la posición parecen descalificantes y en su mayor parte no lo son.** `resemble-enhance` estuvo rechazado durante mucho tiempo en este documento por LVCNet, la convolución dependiente de la posición del vocoder, con la teoría de que los kernels predichos por posición mediante `unfold` y `einsum` no pueden entrar en un grafo estático. Probado directamente, resultó ser falso — ambas operaciones tienen equivalentes ONNX. El fallo real es un error de trazado distinto, ya bien entendido («exportación ONNX de convolución para un kernel de forma desconocida»), ya resuelto en otra parte del código para los remuestreadores de BigVGAN. Lo que sigue dejando fuera a `resemble-enhance` es la escala: cuatro redes incluyendo un muestreador de EDO de CFM y un autocodificador, a 44,1 kHz — una decisión de alcance, no una imposibilidad.

**Algunos modelos no tienen nada entrenado que exportar.** RNNoise se distribuye como C escrito a mano, no como un grafo en un framework entrenable — portarlo significaría reentrenar una red equivalente desde cero. Fast-ULCNet solo publica el código de la arquitectura, sin ningún checkpoint.

**Una licencia restrictiva es una decisión de etiquetado, no una descalificación automática** — precisamente por eso `callenhancer` y `metadenoiser` sí se incluyen. Lo que *sí* descalifica son pesos publicados sin ninguna licencia: mdctGAN fue rechazado exactamente por eso, además de tener un front-end basado en `torch.fft` que no se exporta de forma fiable.

**Que `torch.stft` se llame dentro del modelo es un bloqueo estructural real.** El bucle del muestreador de NU-Wave2 no es el problema — eso podría ejecutarse en numpy fuera del grafo, igual que el STFT de cualquier otro motor. Lo que lo bloquea es que su método `forward` llama internamente a `torch.stft` y `torch.istft`, algo que la biblioteca mantiene deliberadamente fuera de todos los grafos que publica, y que además es el operador que peor se exporta en general. Arreglarlo significaría dividir el modelo en la frontera de la transformada, una reestructuración real en lugar de un simple cambio de operador.

**Reproducir la arquitectura de un modelo no es lo mismo que reproducir su salida.** LiSenNet tiene 56 K parámetros, menos de 300 KB — sería el motor más pequeño de la biblioteca. Su puerto a ONNX públicamente disponible se ejecuta y produce audio atenuado de aspecto plausible, pero medido de extremo a extremo destruye la señal: −10,8 dB de SNR con 11 dB de entrada. Reproducir exactamente la propia implementación de referencia del puerto da el mismo resultado negativo, lo que significa que la propia implementación de referencia no coincide con el front-end que su propia documentación describe — todavía no hay un objetivo correcto contra el que validar.

El patrón en todos estos casos es que los fallos interesantes rara vez son «el modelo es demasiado grande» o «la difusión es lenta». Son específicos: un operador no soportado con un reemplazo exacto (`torch.complex` no tiene operador ONNX, pero `atan2(im, re)` calcula el mismo ángulo de fase), un tensor construido a partir de la forma en tiempo de ejecución de una entrada que un trazador no puede fijar, o una transformada colocada en el lado equivocado de una frontera del grafo.

## Confirmar que la salida realmente mejoró

Un archivo ONNX que se ejecuta no es prueba de que una grabación mejoró. Dos modos de fallo distintos parecen idénticos desde fuera: un eliminador de ruido que silencia el habla junto con el ruido, y un extensor de ancho de banda que añade una banda alta con el contenido armónico equivocado, ambos producen audio que se reproduce sin errores e incluso puede sonar más limpio a una escucha casual.

La biblioteca hermana `speechonnxmetrics` existe para convertir ese juicio en algo medible en lugar de impresionista. Puntúa el audio en **MOS** (Mean Opinion Score, una valoración de 1 a 5 de la calidad percibida) de dos formas: predictores neuronales sin referencia como DNSMOS y UTMOS, que puntúan una grabación sin ningún original limpio con el que comparar, y métricas intrusivas como STOI y SI-SDR, que necesitan la referencia limpia y miden cuán cerca está realmente la salida de ella.

```python
import speechonnxmetrics as s

s.score("clean.wav", ["utmos"])
# -> {'utmos': 4.41}

s.score("denoised.wav", ["stoi", "si_sdr"], ref="clean.wav")
# -> {'stoi': 0.66, 'si_sdr': -26.9}
```

Ejecutarlo antes y después de un eliminador de ruido o extensor y la forma de una comparación real se hace evidente: DNSMOS o UTMOS sobre el audio en bruto y procesado para ver si la calidad percibida se movió en absoluto, y — cuando existe una referencia limpia, que existe para pruebas de ruido sintético pero rara vez para una llamada telefónica real — SI-SDR o STOI para ver si la señal procesada realmente convergió hacia ella en lugar de simplemente sonar distinta. Esa es la misma disciplina detrás de las cifras de SNR en la tabla de eliminadores de ruido de arriba: un número asociado a una condición de ruido específica, no un adjetivo. La familia más amplia de bibliotecas de ONNX puro en la que encaja esto, incluida la propia `speechonnxmetrics`, se cubre en
[Una Familia de Bibliotecas de Voz en ONNX Puro](/es/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries).

Limpiar el audio antes de que llegue a un reconocedor, a un sistema de identificación de hablante o a un oyente humano es una pieza de ingeniería en sí misma, con su propio registro de compromisos y su propia lista de enfoques que se probaron y no sobrevivieron al contacto con una señal real.

Preguntas sobre cómo aplicar esto a un pipeline concreto: [ponte en contacto](/es/contact).
