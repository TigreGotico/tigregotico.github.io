---
title: "Grafema a IPA para 807 lenguas"
description: "orthography2ipa es un recurso de datos puros, con fundamento lingüístico, que mapea la ortografía a IPA y modela cómo los fonemas se realizan como alófonos a lo largo de 896 especificaciones, 807 lenguas y más de 20 familias lingüísticas. Enrejado de candidatos, tokenizador de máxima coincidencia, métricas de distancia fonológica y de escritura, linaje dialectal, y especificaciones citadas a la literatura dialectológica — sin pesos entrenados, totalmente autoalojable."
date: 2026-01-15
lang: es
updated: 2026-08-01
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

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** es un paquete de Python de datos puros — JSON declarativo, lógica fina y conectable, sin pesos entrenados — que mapea la ortografía a IPA y modela cómo esos fonemas se realizan en contexto. Incluye **896 especificaciones de lengua que cubren 807 lenguas** (más 89 nodos de clado solo para clasificación) a lo largo de **más de 20 familias lingüísticas**. Instálelo, lea los datos, bifurque los datos. Nada está oculto en un checkpoint.

Es la capa de fonología que hay debajo de todo lo que está aguas abajo: el enrejado de candidatos que produce lo consume el frontend de TTS árabe [arbtok](https://github.com/TigreGotico/arbtok), las pilas del portugués [TugaPhone](https://github.com/TigreGotico/tugaphone) y [silabificador](https://github.com/TigreGotico/silabificador) (véase **[NLP clásico para sílabas y fonemas del portugués](/es/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), el [fonemizador del barranqueño](/es/blog/2025-12-12-barranquenho), el fonemizador del mirandés y la base fonémica para **[TTS que funciona en una patata](/es/blog/2026-05-10-tts-that-runs-on-a-potato)**.

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

Cada lengua es un dataclass `LanguageSpec` congelado, y lleva mucho más que una lista de fonemas: grafemas (incluidos dígrafos y trígrafos), un mapa de alófonos, **grafemas posicionales** para anulaciones sensibles al contexto (inicial de palabra, intervocálico, ante /i/), **ascendencia** ponderada con múltiples antepasados, **reglas de sandhi** entre palabras, un **inventario tonal** opcional, y procedencia — un `QualityTier` que va de `stub → skeleton → research → production`, un `ScriptType` (alfabeto, abyad, abugida, …), y fuentes bibliográficas con referencias de página.

La regla de inclusión es estricta y vale la pena enunciarla con claridad: **solo entran los mapeos fundamentados en la ortografía oficial y la gramática documentada. Las reglas de subcadena arbitrarias quedan excluidas.** El ⟨lh⟩ del portugués, el ⟨sch⟩ del alemán y el ⟨th⟩ del inglés están dentro porque son unidades ortográficas estándar. Las heurísticas cómodas pero inventadas no lo están. Cuando una especificación declara grafemas pero ningún mapa de alófonos explícito, se deriva un mapa de identidad de base — cada fonema es, como mínimo, su propia realización superficial — de modo que nada desaparece en silencio.

Las variedades regionales tienen sus propias especificaciones en vez de una marca sobre un padre. El portugués brasileño y el europeo divergen de forma sistemática, así que son objetos `LanguageSpec` distintos vinculados por la ascendencia:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Los árboles dialectales se mantienen manejables porque los archivos JSON admiten herencia `graphemes_base` / `allophones_base`: una variante declara solo lo que difiere de su padre. El linaje es ponderado y de múltiples antepasados — padre, sustrato, superestrato, adstrato — que es la forma honesta de modelar lenguas que son productos de contacto en lugar de descendientes limpios.

## Profundo sobre el terreno, no solo amplio

La cifra de 807 es la amplitud; la profundidad es donde está el trabajo. Las especificaciones van lecto por lecto allí donde lo hace la literatura dialectológica, y cada una se cita a esa literatura con referencias de página en vez de deducirse por coincidencia de patrones a partir de una tabla de fonemas.

La cobertura **ibérica** es el ejemplo más claro: **más de 100 especificaciones** para las lenguas de la península. Cada lengua romance de España — castellano, catalán/valenciano, gallego (tanto la norma de la RAG como la reintegracionista), asturiano, aragonés y sus variedades de valle (ansotano, chistabín, benasqués…), extremeño — junto al euskera, los criollos iberorromances y las capas históricas que la mayoría de los recursos omiten por completo: el **árabe andalusí** y el **mozárabe**. La vertiente árabe lleva **34 lectos dialectales** (del najdí y el hejazí pasando por el levantino, el magrebí y las variedades peninsulares), y la vertiente lusófona **46 lectos del portugués y de lenguas de Portugal**, hasta el rionorés, el guadramilés y los subdialectos del mirandés.

Que sepamos, varias de estas son la **primera fonología legible por máquina** jamás publicada para la variedad — es decir, una especificación estructurada y validada por esquema de grafemas y alófonos que un programa puede consultar, a diferencia de un inventario fonémico descrito solo en prosa en la literatura dialectológica — el rionorés y el guadramilés entre ellas. El trabajo aguas abajo entrega los **primeros diccionarios de IPA** para el **barranqueño** y el **mirandés**.

## Un enrejado de candidatos, no una única conjetura

La ortografía no es un problema de segmentación limpio, así que la arquitectura insignia es un **enrejado de candidatos**. El `PhonetokTokenizer` hace tokenización de grafemas de **máxima coincidencia** — prefiriendo con avidez la unidad ortográfica coincidente más larga — y, sobre la tabla de grafemas de la especificación, produce un enrejado por posición de candidatos de IPA clasificados en lugar de una única salida frágil:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

El enrejado es el contrato sobre el que construye toda la familia aguas abajo. Un motor específico de la lengua consume el enrejado compartido y añade solo la fonología que una tabla estática no puede expresar, manteniendo a todos los consumidores sobre el mismo núcleo fundamentado:

- **[arbtok](https://github.com/TigreGotico/arbtok)** construye la fonología de TTS árabe sobre el enrejado, añadiendo la asimilación de letras solares, la elisión de la hamzat al-waṣl, la geminación y el manejo de ligaduras — y una novedosa **fusión rawi-enrejado** que restaura las vocales breves ausentes del texto dialectal sin diacríticos puntuando la distribución por carácter de un ensamble *bajo la licencia del lecto solicitado*, en lugar de confiar en un generador libre.
- **[TugaPhone](https://github.com/TigreGotico/tugaphone)**, **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** (mirandés) y **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** consumen todos el mismo lattice-core para sus variedades lusófonas.

## Medir la distancia entre lenguas

Como los datos están estructurados en vez de horneados en pesos, puedes comparar lenguas directamente. Las métricas de distancia abarcan las dimensiones de inventario, grafema, alófono y ascendencia, además de una familia aparte de distancia de escritura:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.0515 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Los vectores de rasgos también están expuestos, de modo que un par casi idéntico como los dos estándares del portugués aterriza en 0,0515 mientras que pares genuinamente distantes se separan con claridad. Esto es útil por igual para decisiones de aprendizaje por transferencia, para el arranque de lenguas de pocos recursos y para la dialectometría.

## Cómo sabemos si los datos son buenos

El «oro» fiable para G2P apenas existe — la mayoría de los conjuntos de datos públicos son la propia salida de un fonemizador reutilizada como referencia, así que una tasa de error baja frente a ellos significa «coincide con esa herramienta», no «es correcto». Somos explícitos al respecto y construimos una metodología de verificación en torno a ello en vez de reportar una única cifra halagüeña.

Para las variedades que más nos importan, el oro está **redactado, no raspado**: un conjunto de oraciones fijado a un motor por lecto, juzgado en **pares ciegos**, arbitrado contra **literatura con referencia de página**, y realimentado a través de **clases de corrección** en un bucle de retroalimentación del motor — un desacuerdo entre la salida del motor y la forma corregida es una pista de un error real en la especificación. A lo largo del oro de TTS fijado a motor y las atestiguaciones de fuentes primarias hay **varios miles de filas verificadas**. El planteamiento es deliberadamente honesto sobre la procedencia: sintético y arbitrado por literatura allí donde es lo único que existe, y oro humano genuino donde lo hay — el conjunto `mirandese_g2p` en mirandés de hablantes nativos, las atestiguaciones de fuentes primarias con referencia de página y las contribuciones nativas. Las afirmaciones de precisión se hacen **solo** frente al oro humano; una puntuación perfecta frente al propio borrador del motor no significaría nada.

Las cifras, leídas como direccionales y siempre citadas a su fuente ([`docs/scoreboard.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/scoreboard.md), [`docs/benchmarks.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/benchmarks.md), y los documentos de benchmark de los repositorios aguas abajo):

- **Dialectos árabes, entrada sin diacríticos y en crudo** — el caso difícil y realista para despliegue. Sobre el oro de TTS de entrada en crudo de arbtok (33 lectos), la fusión rawi-enrejado bajo la licencia dialectal alcanza un **PER medio de 0,189**, superando al mismo ensamble ejecutado como generador libre (0,193), con el margen concentrado en los lectos que más divergen del MSA. En la mayoría de los lectos arbtok supera a espeak-ng en la entrada en crudo; sobre el propio MSA, espeak — que está ajustado al MSA — sigue ganando (espeak 0,176 vs arbtok 0,245).
- **Dialectos árabes, entrada diacritizada** — con las marcas presentes el PER de arbtok se sitúa en **0,01–0,08** por lecto, muy por debajo de la única voz MSA de espeak (p. ej. najdí 0,009 vs espeak 0,221; egipcio 0,027 vs espeak 0,287). espeak no tiene voces dialectales, así que esto es honestamente comparar peras con manzanas — pero la brecha es el punto.
- **Portugués, frente a oro humano experto** — el portugués europeo de Lisboa aterriza en **PER 0,029** (88 % de coincidencia exacta) sobre fuentes primarias con referencia de página, y el oro mirandés de hablantes nativos en **0,146**.

Cada una de esas cifras es una propiedad del estado actual de los datos, cruzada con un intervalo de confianza por bootstrap, no un trofeo de tabla de clasificación. Allí donde el intervalo es ancho o la muestra minúscula, el scoreboard lo dice.

## La CLI

Todo lo anterior es accesible sin escribir Python. El script de consola `orthography2ipa` incluye `list`, `info`, `transcribe` y `distance`, y cada subcomando admite `--json` para canalizarlo hacia una pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Por qué importan los datos puros

Todo el conjunto de especificaciones está validado por esquema — dataclasses congelados al estilo pydantic barridos por una batería de pruebas de integridad, con `SCHEMA.md` documentando la forma. Allí donde una tabla estática genuinamente no puede expresar las reglas, la lógica específica de la lengua se conecta alrededor de los datos: los silabificadores se registran mediante un grupo de puntos de entrada, y los motores más pesados se construyen sobre el enrejado compartido aguas abajo.

No hay un modelo opaco decidiendo cómo suenan las lenguas de tus usuarios. Los mapeos son auditables, las fuentes están citadas hasta la página, y añadir una lengua es escribir un único archivo JSON validado — empieza por [`docs/adding_a_language.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/adding_a_language.md) y la [guía de primeros pasos](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/getting_started.md). Para cualquiera que construya TTS, ASR o NLP fonético y que se niegue a externalizar su fonología a una caja negra — y que quiera que funcione en su propio hardware — ese es el objetivo. Es Apache 2.0, y es tuyo para inspeccionar, extender y autoalojar.
