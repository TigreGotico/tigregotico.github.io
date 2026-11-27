---
title: "Exportar y Cuantizar Modelos de Voz Abiertos para que Realmente Funcionen"
description: "Un modelo de voz entrenado en una página de investigación de GitHub no es un asistente de voz. Convertimos checkpoints abiertos de ASR y TTS a ONNX, CoreML y GGUF, los cuantizamos y validamos la salida. Luego publicamos los resultados bajo OpenVoiceOS para que cada lengua que cubren llegue a un asistente real y sin conexión."
date: 2026-08-01
lang: es
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "CoreML"
  - "GGUF"
  - "ASR"
  - "OVOS"
  - "OpenVoiceOS"
  - "Quantization"
  - "Open Source"
draft: false
---

Un modelo de reconocimiento de voz publicado como checkpoint de investigación suele ser una carpeta de pesos de PyTorch, un script de entrenamiento y una nota que dice en qué GPU se entrenó. Eso basta para reproducir una puntuación de benchmark. No basta para instalarlo en una Raspberry Pi, un teléfono o un portátil sin conexión a internet. Pasar de lo uno a lo otro es trabajo de conversión, y es la mayor parte de lo que determina si un modelo de voz abierto llega alguna vez a un dispositivo real.

Hacemos este trabajo de conversión como parte de nuestro oficio: tomamos modelos abiertos de ASR (reconocimiento automático de voz, es decir, voz a texto) y TTS (texto a voz) y los convertimos en archivos que se ejecutan sin conexión, en CPUs corrientes o en aceleradores integrados en el dispositivo, sin necesitar ninguna pila de entrenamiento de Python en tiempo de ejecución. La mayoría de los resultados se publican bajo la [organización OpenVoiceOS](https://huggingface.co/OpenVoiceOS) en Hugging Face en lugar de bajo la nuestra propia, y esa elección es deliberada. Más adelante explicamos por qué.

## Por qué un checkpoint no es un despliegue

Un checkpoint de PyTorch o NeMo (el kit de herramientas de entrenamiento de modelos de NVIDIA) espera un entorno Python específico: las versiones correctas de las bibliotecas, normalmente una GPU, y el propio framework de entrenamiento solo para hacer inferencia. Esa pila es grande, cambia constantemente y no es algo que quieras enviar dentro de un asistente de voz que tiene que arrancar en una placa pequeña.

La exportación de modelos resuelve esto convirtiendo la red entrenada en un formato pensado únicamente para inferencia, sin código de entrenamiento, sin autograd (la maquinaria que usa un framework para calcular gradientes durante el entrenamiento), sin dependencia de un framework concreto. Apuntamos a tres formatos de este tipo, cada uno para una forma de despliegue distinta:

- **[ONNX](https://onnxruntime.ai/)** (Open Neural Network Exchange) es un formato de grafo portátil que una amplia gama de runtimes puede ejecutar, en CPU o GPU, en Linux, Windows, macOS o placas integradas. Es nuestro destino por defecto porque se ejecuta en cualquier sitio donde lo hace `onnxruntime`, que es prácticamente en todas partes.
- **CoreML** es el formato de inferencia en el dispositivo de Apple. Un paquete CoreML se ejecuta en el Neural Engine o la GPU de un Mac o un iPhone en lugar de en la CPU. Eso importa para el reconocimiento de voz en tiempo real en hardware Apple.
- **[GGUF](https://github.com/ggml-org/llama.cpp)** es el formato que usan `llama.cpp` y su ecosistema, construido para modelos cuantizados al estilo LLM que necesitan ejecutarse con una huella de memoria pequeña. Lo usamos para los modelos de voz más recientes basados en transformers, que arquitectónicamente están más cerca de un modelo de lenguaje que de un modelo acústico clásico.

Elegir el destino correcto no es algo cosmético. Un modelo de ASR basado en conformer (la arquitectura detrás de la mayoría de los reconocedores de voz modernos, que combina convolución y auto-atención) se convierte limpiamente a ONNX o CoreML. Un modelo de voz basado en Qwen3 es, bajo el capó, un modelo de lenguaje, así que encaja de forma natural en la pipeline GGUF/`llama.cpp` en su lugar.

## Qué cuesta la cuantización y qué compra

Cuantizar significa almacenar los pesos de un modelo con menos bits por número: 16, 8 o 4 bits en lugar de los flotantes de 32 bits con los que se entrenó. Números más pequeños producen un archivo más pequeño y, en hardware adecuado, una inferencia más rápida, porque hay menos datos que mover y una aritmética más barata que hacer.

Podemos poner una cifra exacta a ese intercambio para un modelo real. `nvidia/parakeet-tdt-0.6b-v3` es un modelo de ASR de 0,6 mil millones de parámetros. Su componente CoreML de mel-encoder pesa 1132,5 MB a precisión completa. Paletizado (el término de Apple para este paso de cuantización) a 4 bits pasa a 284,2 MB, una reducción de 3,99x, replicada casi exactamente en sus tres subcomponentes (encoder, decoder, red de decisión conjunta). En todo el paquete, la exportación CoreML sin cuantizar pesa unos 1,14 GB, y la versión de 4 bits pesa unos 293 MB. Esa es la diferencia entre un modelo que cabe cómodamente en un teléfono y uno que apenas lo hace.

El coste es la precisión. Menos bits por peso significa menos precisión, y a partir de cierto punto eso se traduce en más errores de reconocimiento. La forma estándar de medirlo para ASR es el WER (word error rate, tasa de error de palabras: el porcentaje de palabras que el modelo se equivoca en comparación con una transcripción correcta). Por eso publicamos varios niveles de cuantización del mismo modelo en paralelo, `4 bits`, `6 bits`, `8 bits` (`int8`) y `fp16`, en lugar de elegir uno y confiar en que sea suficientemente bueno para todos los dispositivos. Un teléfono y un ordenador de sobremesa pueden permitirse puntos distintos de esa curva.

## El problema de la validación

Una conversión que produce silenciosamente una salida peor es más peligrosa que ninguna conversión, porque nada en ella parece roto. Carga, se ejecuta, y simplemente reconoce el habla un poco peor, o mucho peor, en una lengua que tú personalmente no hablas y no puedes comprobar de oído. La única forma de detectarlo es comparar la salida del modelo exportado con la de la implementación de referencia original sobre audio real, para cada lengua y cada nivel de cuantización, antes de publicarlo.

Eso es un requisito mínimo para cualquier conversión que publicamos: pasar el mismo audio por el modelo original y por el modelo convertido, y confirmar que coinciden. No es un paso vistoso, pero saltárselo es cómo una «lengua soportada» deja de funcionar silenciosamente.

## Por qué los modelos viven bajo OpenVoiceOS, no bajo nosotros

La exportación de modelos es una capacidad de empresa: danos un checkpoint y un dispositivo objetivo, y lo pondremos en marcha sin conexión, validado, en el nivel de cuantización que se ajuste a tu hardware. Pero los modelos convertidos que producimos a partir de checkpoints abiertos y no encargados van a
[OpenVoiceOS](https://huggingface.co/OpenVoiceOS), la plataforma abierta de asistente de voz para la que están construidos estos modelos, no a nuestro propio espacio de nombres.

La razón es sencilla. OpenVoiceOS es donde se usan los modelos. Un modelo convertido guardado en una cuenta de empresa es un artefacto bonito. El mismo modelo, publicado donde [`ovos-stt-plugin-onnx-asr`](https://github.com/OpenVoiceOS/ovos-stt-plugin-onnx-asr),
[`ovos-stt-plugin-coreml`](https://github.com/TigreGotico/ovos-stt-plugin-coreml)
o [`ovos-stt-plugin-rover`](https://github.com/TigreGotico/ovos-stt-plugin-rover)
puede encontrarlo por su nombre, es una lengua que un asistente real ya puede hablar o entender. Publicar bajo la organización propia de la plataforma convierte una conversión en funcionalidad soportada en lugar de en una curiosidad de investigación. Es cómo nos aseguramos de que hacer este trabajo una vez beneficie a toda instalación de OpenVoiceOS, no solo al cliente que lo pidió.

Para ser claros sobre la atribución: no entrenamos estos modelos acústicos desde cero, y no pretendemos hacerlo. La investigación subyacente pertenece a los equipos que la entrenaron: los modelos Parakeet y Conformer de NVIDIA, los modelos IndicConformer de AI4Bharat para lenguas indias, modelos de universidades e institutos públicos como el Proxecto Nós de Galicia o los modelos Conformer del centro HiTZ vasco, y esfuerzos independientes que convierten modelos para lenguas africanas y minoritarias. Lo que aportamos es la conversión, la cuantización, la comprobación de corrección frente al original, y el cableado del plugin que permite a un asistente cargar el resultado por su nombre.

La escala de ese trabajo de conversión, contada directamente a partir de lo publicado, se desglosa así. Más de noventa variantes de ASR Parakeet (entre tamaños, lenguas y niveles de cuantización) están exportadas a ONNX y CoreML. Hay más de treinta modelos Conformer de NVIDIA, veintidós modelos IndicConformer de AI4Bharat que cubren lenguas indias de pocos recursos, y veintidós modelos wav2vec2 para lenguas como el sueco, el islandés, el feroés, el finés y ambas formas escritas del noruego. Nueve modelos Conformer cubren euskera y gallego, y modelos Whisper y wav2vec2 convertidos de forma independiente cubren lenguas africanas y criollas como el shona, el zulú, el xhosa, el malgache, el criollo haitiano y el cabilio. Contando solo las conversiones de ASR confirmadas por código de lengua distinto, eso supone al menos 74 lenguas diferentes con un reconocedor de voz sin conexión y cuantizado disponible hoy. Ese recuento no incluye el catálogo aparte de voces de TTS exportadas para lenguas como el euskera, el aragonés, el asturiano, el gallego, el occitano y el árabe.

## Si tu lengua o tu dispositivo no tienen hoy nada sin conexión

La mayoría de las lenguas nunca obtienen una opción comercial de voz sin conexión, porque el mercado de esa lengua por sí sola no justifica que un proveedor construya una. El patrón anterior no depende del tamaño del mercado: tomar un checkpoint abierto existente, convertirlo a un formato que se ejecute en el hardware que realmente tienes, cuantizarlo para que quepa, verificarlo frente al original y cablearlo en un plugin. Depende de que exista un checkpoint abierto del que partir, lo cual es cada vez más el caso habitual.

Si tienes un modelo de voz que solo se ejecuta en una GPU de entrenamiento, o un dispositivo que actualmente no tiene soporte de voz sin conexión en su lengua, [ponte en contacto](/es/contact). O mira cómo es este trabajo de principio a fin en [nuestra página de servicios](/es/services).
