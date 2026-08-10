---
title: "linguonnx: Traducción e Identificación de Idioma sin Conexión en ONNX"
description: "linguonnx traduce texto e identifica idiomas en la CPU, sin torch y sin nube. 184 modelos de traducción int8 y 5 modelos de identificación de idioma, 586 idiomas alcanzables, y un enrutador que encadena modelos pequeños cuando ningún modelo cubre un par."
date: 2026-08-10
lang: es
author: "Casimiro Ferreira"
tags:
  - "linguonnx"
  - "translation"
  - "language identification"
  - "ONNX"
  - "self-hosted"
  - "OVOS"
draft: false
---

[**linguonnx**](https://github.com/TigreGotico/linguonnx) es una biblioteca de
Python para traducción automática e identificación de idioma. Se ejecuta sobre
`onnxruntime`, en la CPU, sin conexión. No usa torch en ningún momento: el bucle
de generación encoder-decoder, con búsqueda en haz y caché KV incluidas, está
escrito directamente sobre los grafos ONNX.

```bash
pip install linguonnx
```

```python
from linguonnx import load_translator, load_detector

tx = load_translator()
print(tx.translate("bom dia, como estás?", src="pt", tgt="en"))
# 'Good morning, how are you?'   via opus-mt-pt-en-int8, 172 MB

det = load_detector()
print(det.detect("Egun on, zer moduz?"))    # 'eu'
```

Es Apache-2.0 y no descarga ningún modelo que no hayas pedido.

## Qué incluye

El registro tiene 369 entradas de traducción —fp32 e int8 de cada modelo— y 10
entradas de identificación de idioma. `load_translator()` usa int8 por defecto,
así que una instalación normal enruta sobre 184 modelos de traducción
cuantizados y 5 clasificadores cuantizados. Todos son conversiones ONNX
publicadas en [`TigreGotico/`](https://huggingface.co/TigreGotico) en
HuggingFace.

Sobre el grafo por defecto, 586 idiomas son alcanzables. Ese número está fijado
en las pruebas, así que sigue siendo cierto o la compilación lo dice.

Los clasificadores son exportaciones ONNX de cuatro modelos fastText: GlotLID,
el clásico `lid.176`, OpenLID y OpenLID-v2. GlotLID etiqueta 2102 *variedades*,
por lo que el árabe coloquial vuelve como najdí (`ars`) y el chino puede volver
como cantonés. Eso es identificación de dialecto cuando la quieres, y
`collapse_varieties=True` cuando no.

## Un par sin modelo es una cadena de modelos

La mayoría de los pares de idiomas no tiene modelo bilingüe. El enrutador trata
cada modelo como un conjunto de capacidades y no como una arista fija, y encadena
saltos cuando hace falta:

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — pasó por el gallego
```

Con esa política, portugués a euskera pasa por el gallego, sobre dos modelos
Marian de 84 MB y 153 MB. El pivote nunca es silencioso: la `Route` llega con la
traducción y dice qué modelos usó y por qué idiomas pasó.

Una ruta no es un hecho fijo sobre un par de idiomas. Es lo que las restricciones
de quien llama hacen del registro: cambia el presupuesto de tamaño o la
preferencia de saltos y el mismo par puede pivotar por otro idioma, o reducirse a
un solo salto por un gran modelo multilingüe. La `Route` dice cuál te tocó.

La ordenación prefiere a la institución que cuida el idioma. HiTZ entrena
euskera, Proxecto Nós entrena gallego, Projecte AINA entrena catalán, AI4Bharat
entrena los pares índicos, Masakhane entrena los pares de África Occidental,
TartuNLP entrena los fino-ugrios. Un modelo del especialista gana el desempate
frente a un modelo multilingüe general.

## Política en ejecución, nunca en el índice

Esta es la ley del registro: lista todos los modelos publicados, sea cual sea su
tamaño, su licencia o su puntuación. El filtrado y la ordenación ocurren en
tiempo de ejecución, en el proceso de quien llama y con sus reglas. Un modelo que
el índice deja fuera no se puede elegir de ninguna manera, así que el índice no
deja nada fuera.

Quien llama fija la política en `load_translator`: `max_model_mb`,
`oversize_fallback`, `count_cached_as_free`, `prefer`, `max_hops`, `precision`,
`model_cache_size`, `exclude_flagged` y `min_chrf`. Todos ellos también se
sobrescriben llamada a llamada.

## Un límite de tamaño prefiere modelos pequeños, no borra idiomas

Un presupuesto de tamaño es el mando obvio para una máquina pequeña, y la
implementación obvia es errónea. Usado como filtro, `max_model_mb=500` reduce los
586 idiomas alcanzables a 249, porque la cola larga vive dentro de los grandes
modelos multilingües y ninguna cadena de modelos pequeños los sustituye.

`oversize_fallback=True` convierte el presupuesto en una preferencia:

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 586, no 249
```

Inglés a catalán se queda en el modelo pequeño, porque existe un modelo pequeño.
Inglés a chuvasio escala a MADLAD, porque MADLAD es el único modelo del registro
con chuvasio, y la alternativa no es una ruta más barata sino ninguna ruta.
`waived_size_cap` dice qué límite superó la ruta, así que una máquina que
presupuestó 500 MB se entera de que descargó 4945 MB.

Cuatro reglas mantienen esto honesto. La búsqueda ampliada solo corre para el par
que salió vacío. El límite sube de un tamaño de modelo cada vez, así que un par
servido por NLLB-200 y por MADLAD recibe NLLB-200. El límite acota un modelo, no
una ruta, así que una cadena de dos saltos de modelos de 237 MB la encuentra la
búsqueda normal. Y la escalada nunca pasa del presupuesto de descarga.

## Alcanzable no es utilizable

`madlad400-3b-mt` cubre el chuvasio. Pídele `en -> cv` y responde en ruso:
`"Good day, my friend."` vuelve como `"Добрый день, мой друг."`. El enrutado es
correcto —la etiqueta del chuvasio es una pieza SentencePiece distinta— y aun así
el modelo escribe el idioma equivocado.

Por eso una entrada del registro lleva `language_flags`, un idioma cada vez, con
la observación detrás: la entrada, la salida, el veredicto del detector
(`glotlid=ru`), la fecha y el método. El chuvasio es alcanzable y no es
utilizable, y el registro dice ambas cosas.

La calidad de modelo completo se registra igual. Un campo `quality` lleva una
puntuación chrF contra la referencia **humana** de FLORES-200 devtest, con el
corpus, el modo de decodificación y el tamaño de muestra al lado, porque una
puntuación sin tamaño de muestra al lado no significa nada. La ausencia del campo
significa no medido, que no es lo mismo que malo, y nada inventa un número para
un modelo no medido. Dos comprobaciones levantan una marca: chrF por debajo de 40
en cualquiera de las precisiones, e int8 quedándose más de 2 chrF por detrás de
fp32.

Una marca no elimina nada del registro. Le da a `exclude_flagged=True` y a
`min_chrf=` algo sobre lo que actuar, y le da a una persona una razón para leer:

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

Un barrido de todo el registro pasa una frase real por cada modelo registrado y
falla ante salida vacía, salida de solo espacios o salida idéntica a la entrada.
Las frases de muestra son por idioma de origen y están revisadas a mano; un
idioma sin muestra se salta en vez de probarse con texto de otro idioma.

## Desde OpenVoiceOS

[`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)
envuelve la biblioteca en dos plugins con una sola instalación: un detector de
idioma (`opm.lang.detect`, id `ovos-lang-detect-plugin-linguonnx`) y un traductor
(`opm.lang.translate`, id `ovos-translate-plugin-linguonnx`). Ambos cargan los
modelos en el primer uso, y todos los argumentos de `load_detector` y
`load_translator` son accesibles desde `mycroft.conf`.

La biblioteca documenta el resto: [routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md)
para las políticas y el presupuesto de tamaño, [models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md)
para el registro, y [licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
para los niveles de licencia: los modelos GPL-3.0 y CC-BY-NC-4.0 existen en el
índice y hay que pedirlos por su nombre.
