---
title: "Dos Voces, Todas las Lenguas: Miro y Dii"
description: "TigreGótico se asocia con OpenVoiceOS para dar al asistente dos identidades de voz consistentes — Miro y Dii — que suenan igual en todas las lenguas, construidas con nuestra tecnología de clonación de voz y el motor phoonnx. Dos modelos de TTS para cada lengua que alguien solicite, lenguas en peligro incluidas."
date: 2026-06-15
lang: es
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "OVOS"
  - "voice cloning"
  - "G2P"
  - "language inclusion"
draft: false
---

> **Escúchalas ahora:** la [Demo de Voces](../../demo) ejecuta a Miro y Dii en directo en tu
> navegador — elige una lengua, escribe una frase y escucha. Sin instalación, sin servidor.

Las personas recuerdan la voz de un asistente más que su nombre. Por eso, la pregunta central de nuestra colaboración con [OpenVoiceOS](https://www.openvoiceos.org/) es práctica: ¿a quién debería sonar el asistente, en cada lengua?

La respuesta es **Miro** (masculino) y **Dii** (femenino) — dos identidades de voz que se mantienen en todas las lenguas que soporta OpenVoiceOS. Un usuario que configura el asistente en Lisboa y más tarde cambia al alemán debería oír al mismo hablante familiar. Una voz de marca, todas las lenguas, propiedad de la comunidad.

## Una identidad, muchas lenguas

La forma habitual de obtener una voz multilingüe es entrenar un único modelo con muchas lenguas a la vez. Funciona, pero tiende a difuminar el resultado: los acentos se contaminan entre lenguas, la pronunciación se vuelve aproximada y la voz pierde la nitidez de un hablante nativo.

Nosotros tomamos el camino más difícil. Para cada lengua construimos un modelo **monolingüe** — un modelo, una lengua, entrenado para hacer bien esa lengua. El truco que los une es la **clonación de voz**: cada modelo monolingüe de Miro se clona a partir de la misma identidad de origen, e igualmente para Dii. El resultado es una familia de modelos por lengua que hablan cada uno como un nativo, pero que comparten el mismo timbre, el mismo carácter, la misma esencia de Miro o de Dii. Obtienes pronunciación de calidad nativa *y* una única identidad reconocible, en lugar de sacrificar una por la otra.

Estos modelos se entrenan y sirven con [**phoonnx**](https://github.com/TigreGotico/phoonnx), nuestro marco de TTS abierto — basado en VITS, exportado a ONNX, solo CPU. Las voces se ejecutan totalmente sin conexión; sin nube, sin clave de API, sin que ningún dato salga de tu hardware. Dentro de OpenVoiceOS, el plugin `ovos-tts-plugin-phoonnx` se encarga de descargarlas y cargarlas. Para conocer toda la historia del hardware y la arquitectura, consulta [TTS que Funciona en una Patata](/es/blog/2026-05-10-tts-that-runs-on-a-potato).

## La investigación de G2P que lo hace posible

Hablar bien una lengua no depende solo de la voz — depende de saber cómo *se supone* que debe sonar la escritura. Ese es el trabajo de la conversión **grafema-a-fonema (G2P)**: convertir el texto escrito en la secuencia de fonemas que el modelo pronuncia realmente. Cada nueva lengua que abordamos viene con su propia investigación de G2P, y en esa investigación reside gran parte del trabajo real.

phoonnx es deliberadamente flexible en este punto. Puede utilizar toda una gama de fonemizadores — eSpeak, Gruut, Epitran, el [G2P basado en modelos ByT5](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0) y herramientas específicas por lengua allí donde los motores generales se quedan cortos. Esto conecta directamente con nuestro conjunto de tecnologías fonéticas más amplio: nuestra **[investigación de ortografía a IPA](/es/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** y los **[fonemizadores lusófonos](/es/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** que hemos construido para la familia portuguesa alimentan el mismo objetivo — IPA precisa para lenguas que los grandes proveedores de TTS nunca se han molestado en modelar con cuidado. Cuando una lengua no tiene un buen fonemizador disponible, esa carencia *es* el proyecto. Primero hacemos la investigación de la relación grafía-sonido, y luego llega la voz.


## Dos modelos para cada lengua solicitada

Aquí está la oferta concreta, y es el corazón de la colaboración: **para cada lengua que alguien solicite, construiremos dos modelos de TTS — Miro y Dii.** No una hoja de ruta de quizás-algún-día; un compromiso permanente. Pide una lengua, y el par universal llegará a ella.

Y hablamos de *todas* las lenguas, no solo de las cómodas y comercialmente evidentes. Las voces que faltan en el mundo rara vez son las que tienen cien millones de hablantes — son las **lenguas en peligro y minoritarias** que el TTS convencional ignora silenciosamente porque el mercado es demasiado pequeño como para molestarse. Esas son exactamente las lenguas que queremos alcanzar: comunidades que nunca han tenido una voz sintética de alta calidad que puedan llamar propia, y que no tienen ninguna razón para esperar que un proveedor de Silicon Valley se la vaya a ofrecer jamás.

Esto no es una promesa para más adelante. A fecha de hoy, la [**colección de modelos de TTS de phoonnx**](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) en Hugging Face incluye 13 lenguas con al menos una voz publicada, y 8 de ellas — euskera, árabe, portugués europeo, **asturiano**, **aragonés**, **frisón**, occitano y español colombiano — ya cuentan con Miro y Dii disponibles.

## Abierto y autoalojado

Las voces son **libres y de código abierto**, se ejecutan **sin conexión y autoalojadas** de modo que nada de lo que dices sale de tu hardware, y todo el conjunto — el motor, los fonemizadores, la investigación de G2P, las voces entrenadas — es abierto para que una comunidad pueda tomarlo y conservarlo.

Si tu lengua todavía no está en la lista, eso no es una puerta cerrada — es una petición esperando a ser formulada.
