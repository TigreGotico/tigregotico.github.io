---
title: "Datos de Entrenamiento de TTS Miro & Dii: 40 Datasets Abiertos en 20 Locales"
description: "Hemos publicado 40 datasets de entrenamiento sintéticos para las voces Miro y Dii en portugués, neerlandés, alemán, francés, italiano, japonés, español y más. Cada idioma obtiene dos identidades de voz consistentes, construidas mediante clonación de voz."
date: 2025-06-23
lang: es
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Voice"
  - "Datasets"
  - "Miro & Dii"
  - "Multilingual"
  - "FOSS"
draft: false
---

## Qué estamos lanzando

Estamos publicando los 40 datasets de entrenamiento sintéticos utilizados para construir Miro y Dii, las identidades de voz que desarrollamos en colaboración con OpenVoiceOS. La colección abarca portugués europeo, portugués de Brasil, neerlandés, alemán, francés, italiano, japonés, español, rumano, polaco, sueco, hindi, danés, farsi, inglés, euskera y más. Cada dataset sigue una convención de nombres consistente: `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL`, y así sucesivamente para cada par de idiomas.

Cada dataset es totalmente sintético: texto generado emparejado con audio sintetizado, dispuesto en el formato LJSpeech habitual para datos de entrenamiento de TTS, sin sesiones de estudio. Cada uno se publica bajo una licencia abierta para que cualquiera pueda reentrenar o ampliar la voz. La fonemización ocurre en tiempo de entrenamiento en phoonnx, apoyándose en nuestra [investigación de G2P para más de 350 idiomas](/es/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## Cómo la identidad de la voz se mantiene consistente entre idiomas

No entrenamos un único modelo multilingüe con la esperanza de que el acento se resuelva solo. Cada idioma obtiene un modelo monolingüe, entrenado para sonar como un hablante nativo de ese idioma. La identidad compartida entre modelos proviene de la clonación de voz: cada modelo Miro y cada modelo Dii se clona a partir de la misma voz de origen antes de ser adaptado a un nuevo idioma. El timbre y el carácter de la voz se transfieren. El acento no, deliberadamente.

El resultado práctico es que un hablante de portugués, un hablante de neerlandés y un hablante de japonés suenan de forma inequívoca a la misma persona, cada uno hablando de forma nativa.

## Por qué publicar los datos de entrenamiento

Un checkpoint sin sus datos de entrenamiento es una caja negra. Publicar los datos permite a cualquiera ver exactamente de qué aprendió el modelo, ejecutar `phoonnx_train` sobre los mismos datos para obtener el mismo resultado, y ampliarlo: añadir frases, ajustarlo para un dialecto, o construir un nuevo locutor encima.

Esto importa sobre todo para los idiomas de pocos recursos de esta lista. Cuando los datos de entrenamiento son abiertos, la comunidad que habla un idioma puede mejorar su propia voz sin esperar a que un proveedor decida que es comercialmente interesante.

## Dónde encontrarlo todo

Todos los datasets y modelos entrenados residen bajo [TigreGotico en HuggingFace](https://huggingface.co/TigreGotico), con checkpoints de voz compatibles con Piper también replicados bajo [OpenVoiceOS](https://huggingface.co/OpenVoiceOS).

Para el framework de inferencia y entrenamiento que consume estos datasets, consulta [phoonnx](https://github.com/TigreGotico/phoonnx).
