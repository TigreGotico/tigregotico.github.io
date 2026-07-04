---
title: "Grafema a IPA para más de 350 lenguas"
description: "orthography2ipa es un recurso de datos puros, con fundamento lingüístico, que mapea la ortografía a IPA y modela cómo los fonemas se realizan como alófonos en más de 350 códigos de lengua y más de 20 familias lingüísticas. Un tokenizador de máxima coincidencia, métricas de distancia fonológica y de escritura, linaje dialectal y un conjunto de especificaciones validado por esquema — sin pesos entrenados, totalmente autoalojable."
date: 2026-01-15
lang: es
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** es un paquete de Python de datos puros — JSON declarativo, lógica fina y conectable, sin pesos entrenados — que mapea la ortografía a IPA y modela cómo esos fonemas se realizan en contexto a lo largo de **394 especificaciones de lengua y más de 20 familias lingüísticas**. Instálelo, lea los datos, bifurque los datos. Nada está oculto en un checkpoint.

Impulsa todo lo que hay aguas abajo: las pilas específicas del portugués [silabificador](https://github.com/TigreGotico/silabificador) y [TugaPhone](https://github.com/TigreGotico/tugaphone) (véase **[NLP clásico para sílabas y fonemas del portugués](/es/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), el G2P del barranqueño, y la base fonémica para **[TTS que funciona en una patata](/es/blog/2026-05-10-tts-that-runs-on-a-potato)**.

## Dos mapas, no uno

La distinción crítica: un **mapa de grafemas** te dice qué fonemas *puede* representar una grafía. Un **mapa de alófonos** te dice cómo un fonema *se realiza* en contexto. Confundirlos es el modo de fallo más común en los sistemas de G2P.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

El ⟨th⟩ del inglés es genuinamente ambiguo entre /θ/ y /ð/ — eso es un hecho de grafía a fonema. La /t/ del inglés aparece como oclusiva simple, oclusiva aspirada, oclusiva glotal o vibrante según dónde caiga — eso es un hecho de fonema a realización. Mantener ambas cosas separadas significa que puedes ir de *texto → fonemas candidatos* para la transcripción y de *fonema → realización superficial* para el modelado de la pronunciación sin que uno corrompa al otro. Para el TTS esa es la diferencia entre un acento creíble y uno robótico; para el ASR es la diferencia entre un léxico que coincide con lo que la gente dice de verdad y uno que coincide con el diccionario.

## Qué lleva cada lengua

Cada lengua es un dataclass `LanguageSpec` congelado, y lleva mucho más que una lista de fonemas: grafemas (incluidos dígrafos y trígrafos), un mapa de alófonos, **grafemas posicionales** para anulaciones sensibles al contexto (inicial de palabra, intervocálico, ante /i/), **ascendencia** ponderada con múltiples antepasados, **reglas de sandhi** entre palabras, un **inventario tonal** opcional, y procedencia — un `QualityTier` que va de `stub → skeleton → research → production`, un `ScriptType` (alfabeto, abyad, abugida, …), y fuentes bibliográficas.

La regla de inclusión es estricta y vale la pena enunciarla con claridad: **solo entran los mapeos fundamentados en la ortografía oficial y la gramática documentada. Las reglas de subcadena arbitrarias quedan excluidas.** El ⟨lh⟩ del portugués, el ⟨sch⟩ del alemán y el ⟨th⟩ del inglés están dentro porque son unidades ortográficas estándar. Las heurísticas cómodas pero inventadas no lo están. Cuando una especificación declara grafemas pero ningún mapa de alófonos explícito, se deriva un mapa de identidad de base — cada fonema es, como mínimo, su propia realización superficial — de modo que nada desaparece en silencio.

Las variedades regionales tienen sus propias especificaciones en vez de una marca sobre un padre. El portugués brasileño y el europeo divergen de forma sistemática, así que son objetos `LanguageSpec` distintos vinculados por la ascendencia:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Los árboles dialectales se mantienen manejables porque los archivos JSON admiten herencia `graphemes_base` / `allophones_base`: una variante declara solo lo que difiere de su padre. El linaje es ponderado y de múltiples antepasados — padre, sustrato, superestrato, adstrato — que es la forma honesta de modelar lenguas que son productos de contacto en lugar de descendientes limpios.

## Un tokenizador que admite la ambigüedad

La ortografía no es un problema de segmentación limpio, así que el paquete incluye `PhonetokTokenizer`, un tokenizador de grafemas de **máxima coincidencia** con expansión a IPA mediante búsqueda en haz. Prefiere con avidez la unidad ortográfica coincidente más larga y luego explora transcripciones candidatas clasificadas cuando una grafía es ambigua:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

En lugar de apostar por una única salida, obtienes un haz puntuado — exactamente la entrada que quiere un léxico, un enrejado o un reclasificador de pronunciación aguas abajo.

## Medir la distancia entre lenguas

Como los datos están estructurados en vez de horneados en pesos, puedes comparar lenguas directamente. Las métricas de distancia abarcan las dimensiones de inventario, grafema, alófono y ascendencia, además de una familia aparte de distancia de escritura:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Los vectores de rasgos también están expuestos, de modo que un par casi idéntico como los dos estándares del portugués aterriza en 0,04 mientras que pares genuinamente distantes se separan con claridad. Esto es útil por igual para decisiones de aprendizaje por transferencia, para el arranque de lenguas de pocos recursos y para la dialectometría.

## La CLI

Todo lo anterior es accesible sin escribir Python. El script de consola `orthography2ipa` incluye `list`, `info`, `transcribe` y `distance`, y cada subcomando admite `--json` para canalizarlo hacia una pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Por qué importan los datos puros

Todo el conjunto de especificaciones está validado por esquema — dataclasses congelados al estilo pydantic, **394 especificaciones** barridas por una batería de pruebas de integridad, con `SCHEMA.md` documentando la forma. Allí donde una tabla estática genuinamente no puede expresar las reglas, la lógica específica de la lengua se conecta alrededor de los datos: los silabificadores se registran mediante un grupo de puntos de entrada, y el G2P algorítmico más pesado (como nuestro tokenizador de árabe [arbtok](https://github.com/TigreGotico/arbtok), que gestiona la asimilación de letras solares, la elisión de la hamzat al-wasl y las formas de tanwin) se construye sobre las mismas especificaciones aguas abajo.

No hay un modelo opaco decidiendo cómo suenan las lenguas de tus usuarios. Los mapeos son auditables, las fuentes están citadas, y añadir una lengua es escribir un único archivo JSON validado. Para cualquiera que construya TTS, ASR o NLP fonético y que se niegue a externalizar su fonología a una caja negra — y que quiera que funcione en su propio hardware — ese es el objetivo. Es Apache 2.0, y es tuyo para inspeccionar, extender y autoalojar.
