---
title: "Dos Voces, Todas las Lenguas: Miro y Dii"
description: "TigreGótico se asocia con OpenVoiceOS para dar al asistente dos identidades de voz consistentes, Miro y Dii, que suenan igual en todas las lenguas, construidas con nuestra tecnología de clonación de voz y el motor phoonnx. Dos modelos de TTS para cada lengua que alguien solicite, lenguas en peligro incluidas."
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
> navegador. Elige una lengua, escribe una frase y escucha. Sin instalación, sin servidor.

Las personas recuerdan la voz de un asistente más que su nombre. Por eso, la pregunta central de nuestra colaboración con [OpenVoiceOS](https://www.openvoiceos.org/) es práctica: ¿a quién debería sonar el asistente, en cada lengua?

La respuesta es **Miro** (masculino) y **Dii** (femenino), dos identidades de voz que se mantienen en todas las lenguas que soporta OpenVoiceOS. Un usuario que configura el asistente en Lisboa y más tarde cambia al alemán oye al mismo hablante familiar en ambas.

## Una identidad, muchas lenguas

La forma habitual de obtener una voz multilingüe es entrenar un único modelo con muchas lenguas a la vez. Funciona, pero tiende a difuminar el resultado: los acentos se contaminan entre lenguas y la pronunciación se vuelve aproximada.

En su lugar, construimos un modelo por lengua, cada uno entrenado solo con esa lengua. Para que todos esos modelos suenen a la misma persona, clonamos cada modelo monolingüe de Miro a partir de la misma identidad de origen, e igualmente para Dii. Así, un oyente obtiene pronunciación de calidad nativa en cada lengua, y sigue reconociendo la misma voz al pasar de una a otra.

Estos modelos se entrenan y sirven con [**phoonnx**](https://github.com/TigreGotico/phoonnx), nuestro marco de TTS abierto: construido sobre VITS (una arquitectura neuronal de texto a voz), exportado a ONNX, y solo CPU en inferencia. Se ejecutan totalmente sin conexión, sin nube, sin clave de API y sin que ningún dato salga de tu hardware. Dentro de OpenVoiceOS, el plugin `ovos-tts-plugin-phoonnx` se encarga de descargarlas y cargarlas. Para conocer toda la historia del hardware y la arquitectura, consulta [TTS que Funciona en una Patata](/es/blog/2026-05-10-tts-that-runs-on-a-potato).

## La investigación de G2P que lo hace posible

Hablar bien una lengua requiere más que una voz. Requiere saber cómo se supone que debe sonar la escritura. Ese es el trabajo de la conversión grafema-a-fonema (G2P): convertir el texto escrito en la secuencia de fonemas que el modelo pronuncia. Cada nueva lengua que abordamos necesita primero su propia investigación de G2P, y esa investigación es la mayor parte del trabajo real.

phoonnx puede utilizar toda una gama de fonemizadores: eSpeak, Gruut, Epitran, el [G2P basado en modelos ByT5](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0), y herramientas específicas por lengua allí donde los motores generales se quedan cortos. Nuestra [investigación de ortografía a IPA](/es/blog/2026-01-15-grapheme-to-ipa-for-350-languages) y los [fonemizadores lusófonos](/es/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes) que hemos construido para la familia portuguesa alimentan el mismo objetivo: IPA precisa para lenguas que los grandes proveedores de TTS nunca han modelado con cuidado. Cuando una lengua no tiene un buen fonemizador disponible, esa carencia es el proyecto. Primero hacemos la investigación de la relación grafía-sonido, y luego llega la voz.


## Dos modelos para cada lengua solicitada

La oferta que está en el corazón de la colaboración: para cada lengua que alguien solicite, construimos dos modelos de TTS, Miro y Dii. Es un compromiso permanente, no una hoja de ruta. Pide una lengua, y el par llegará a ella.

Hablamos de todas las lenguas, no solo de las que tienen más hablantes. Las lenguas en peligro y minoritarias, las que el TTS convencional ignora porque el mercado es pequeño, son exactamente lo que queremos alcanzar: comunidades que nunca han tenido una voz sintética propia.

A fecha de hoy, la [colección de modelos de TTS de phoonnx](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) en Hugging Face incluye 13 lenguas con al menos una voz publicada. Ocho de ellas, euskera, árabe, portugués europeo, asturiano, aragonés, frisón, occitano y español colombiano, ya cuentan con Miro y Dii disponibles.

## Abierto y autoalojado

Las voces son libres y de código abierto. Se ejecutan sin conexión y autoalojadas, de modo que nada de lo que dices sale de tu hardware. Todo el conjunto, el motor, los fonemizadores, la investigación de G2P y las voces entrenadas, es abierto para que una comunidad pueda tomarlo y conservarlo.

Si tu lengua todavía no está en la lista, pídela.
