---
title: "Un dataset multilingüe de tipos de oración: preguntas, órdenes, afirmaciones"
description: "Publicamos sentence-types-multilingual — casi 70.000 oraciones en siete lenguas, clasificadas por tipo gramatical (pregunta, orden, afirmación, exclamación). Es el corpus de entrenamiento tras la biblioteca de enrutamiento little_questions."
date: 2026-04-01
lang: es
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

La lógica de enrutamiento de un asistente de voz depende de saber qué tipo de oración recibió antes de intentar responder a nada. Una pregunta necesita una respuesta. Una orden necesita ejecución. Una afirmación puede necesitar reconocimiento o almacenamiento. Acertar con esa clasificación, en cualquier lengua que hable el usuario, es el requisito previo para todo lo demás.

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** es el corpus de entrenamiento tras esa capa — 69.300 oraciones etiquetadas, 9.900 para cada una de las siete lenguas: inglés, español, francés, alemán, italiano, portugués y neerlandés.

## Qué significan las etiquetas en la práctica

El dataset usa un conjunto plano de seis etiquetas — una columna `label` por fila, sin división tipo/subtipo — que se corresponden directamente con cómo `little_questions` (la biblioteca de inferencia que consume estos datos) enruta las locuciones:

- **wh_question** — preguntas construidas en torno a una palabra interrogativa (qué, dónde, quién, etc.).
- **polar_question** — preguntas de sí/no. La taxonomía EAT dentro de `little_questions` añade 53 etiquetas de tipo de respuesta de grano fino (persona, ubicación, cantidad, definición, etc.) sobre las etiquetas de pregunta, pero la clasificación por tipo de oración es la primera puerta.
- **command** — formas imperativas. Las órdenes no esperan una respuesta; esperan una acción.
- **request** — peticiones de acción corteses o indirectas, distintas de un imperativo directo.
- **statement** — declarativa. Las afirmaciones en un contexto de diálogo a menudo llevan una polaridad que importa aguas abajo: un clasificador de sí/no/quizás se ejecuta sobre las afirmaciones para interpretar respuestas a preguntas previas.
- **exclamation** — locuciones marcadas emocionalmente que necesitan un tratamiento distinto al de las declarativas neutras.

```json
{
  "language": "en",
  "label": "wh_question",
  "text": "What time is it?"
}
```

## Por qué la cobertura translingüística no es trivial

La misma intención comunicativa se realiza de forma distinta en distintas gramáticas:

- El inglés marca las preguntas con inversión del orden de palabras; el portugués y el español a menudo las marcan solo con puntuación y entonación, dejando el orden de palabras intacto.
- El alemán separa los verbos hacia la posición final de la oración de maneras que desplazan dónde vive la señal clasificadora.
- Las lenguas románicas usan morfología imperativa dedicada para las órdenes que el inglés expresa con el verbo desnudo.

Un modelo entrenado solo en inglés se equivoca en todo lo demás. Los datos paralelos etiquetados a través de las siete lenguas proporcionan la señal translingüística que necesitan los clasificadores por lengua — y la misma pipeline de generación se extiende a más lenguas a medida que se añaden.

## La pila aguas abajo

Los modelos entrenados con estos datos se distribuyen dentro de **[little_questions](https://github.com/TigreGotico/little_questions)** — una biblioteca sin conexión y sin dependencias (numpy + onnxruntime) con clasificadores ONNX por lengua para el tipo de oración y un modelo de polaridad sí/no de 43 lenguas. Los modelos vienen empaquetados en el propio wheel para el inglés y se descargan de forma perezosa para las demás lenguas. Los clasificadores de tipo de oración se publican como `TigreGotico/sentence-types` en HuggingFace; los clasificadores de tipo de respuesta EAT se entrenan internamente y no se publican.

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` es la capa de enrutamiento de lenguaje natural para OVOS y LILACS: clasificar si una locución es una pregunta, una orden o una afirmación es la primera decisión de despacho que toma una pipeline de voz.

[**sentence-types-multilingual en HuggingFace**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**little_questions en GitHub**](https://github.com/TigreGotico/little_questions)
