---
title: "Escrituras y Notaciones Fonéticas: Qué Convierte Realmente scriptconv"
description: "Un análisis en profundidad de scriptconv, la biblioteca sin dependencias que detecta sistemas de escritura y convierte entre notaciones fonéticas. Cubre IPA, ARPABET y X-SAMPA; detección de escritura ISO-15924; transliteración Buckwalter para el árabe; descomposición de hangul en jamo; y conversión de kana, con ejemplos reales, ejecutados, y límites honestos."
date: 2026-08-01
lang: es
author: "Casimiro Ferreira"
tags:
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "Linguistics"
  - "FOSS"
draft: false
---

Un diccionario de pronunciación estadounidense dice que «cat» suena como `K AE1 T`. El Alfabeto Fonético Internacional escribe el mismo sonido como `kæt`. Un sistema distinto, solo con caracteres ASCII, lo escribe como `k"{t`. Los tres describen exactamente los mismos dos fonemas — un sonido «k» seguido de una «a» breve seguida de una «t». Nada del sonido cambió. Solo cambió el alfabeto usado para escribirlo.

Esto ocurre constantemente a cualquiera que combine datos de pronunciación de más de una fuente. Un conjunto de datos de voz construido a partir de un diccionario estadounidense usa una notación. Un léxico europeo usa otra. Un motor de texto a voz espera una tercera. Antes de que esos datos puedan fusionarse, buscarse o compararse, hay que traducirlos de un alfabeto fonético a otro — el mismo trabajo que hace un traductor entre lenguas humanas, salvo que aquí las «lenguas» son formas de escribir sonido en lugar de formas de escribir palabras.

`scriptconv` es una pequeña biblioteca de Python que hace esa traducción, más un trabajo relacionado un nivel por encima: averiguar en qué sistema de escritura está un fragmento de texto antes de poder hacer nada más con él. No tiene ninguna opinión sobre lingüística — no adivina cómo se pronuncia una palabra. Solo mueve símbolos que ya representan sonidos conocidos de una notación a otra, e identifica escrituras a partir de los propios caracteres.

## Algunos términos, definidos con sencillez

- **Escritura**: un sistema de escritura — el conjunto real de caracteres, como el latino, el cirílico o el hangul. No es lo mismo que una lengua: el inglés, el francés y el vietnamita usan todos la escritura latina, y el serbio puede escribirse tanto en cirílico como en latino.
- **Ortografía**: las reglas convencionales de escritura para una lengua concreta en una escritura — mayúsculas, tildes, espaciado.
- **Fonema**: una unidad distintiva de sonido en una lengua, como el sonido «k» en «cat».
- **IPA** (Alfabeto Fonético Internacional): un alfabeto estándar para escribir sonidos con precisión, independiente de la ortografía normal de cualquier lengua.
- **Transliteración**: convertir texto de una escritura a otra mapeando caracteres, buscando preservar exactamente la grafía original en lugar de la pronunciación.
- **Romanización**: transliteración específicamente a la escritura latina.

## Por qué existen siquiera los alfabetos fonéticos solo-ASCII

El IPA necesita caracteres como `ʃ`, `ʒ`, `ə` y `ˈ` que no están en un teclado estándar. Eso fue un problema real durante décadas de informática, antes de que Unicode fuera universal y antes de que la mayoría de fuentes, terminales y formatos de archivo soportaran de forma fiable texto no ASCII. Los investigadores construyeron sustitutos solo-ASCII: ARPABET, desarrollado para el trabajo de reconocimiento de voz en inglés estadounidense, y X-SAMPA, una codificación ASCII del IPA completo desarrollada para ser segura en correo electrónico y terminales antiguas. No son curiosidades históricas. ARPABET sigue siendo la notación usada por diccionarios de pronunciación de inglés estadounidense y herramientas de voz ampliamente desplegados, y X-SAMPA sigue apareciendo en herramientas lingüísticas que necesitan texto plano. Cualquier cosa que lea esos datos tiene que ser capaz de leer ese alfabeto.

`scriptconv` ejecuta la conversión real. Esto es salida ejecutada, no una descripción:

```python
from scriptconv import convert, arpa_to_ipa, ipa_to_arpa

convert("K AE1 T", "arpa", "ipa")
# 'kæt'

convert("HH AH0 L OW1", "arpa", "ipa")
# 'həloʊ'

convert("kˈæt", "ipa", "x-sampa")
# 'k"{t'

arpa_to_ipa("HH AH0 L OW1", stress=True)
# 'həlˈoʊ'

ipa_to_arpa("həlˈoʊ", stress=True)
# 'HH AH0 L OW1'
```

Los marcadores de acento sobreviven al viaje de ida y vuelta. ARPABET marca el acento con un dígito pegado a la vocal (`OW1`); el IPA lo marca con una `ˈ` colocada antes de la sílaba acentuada. `arpa_to_ipa(..., stress=True)` traslada esa información, y convertir de vuelta reconstruye los dígitos originales exactamente.

El IPA está en el centro de todo esto por diseño. `scriptconv` trata cada notación como un nodo en un grafo y cada conversor como una arista, y enruta las conversiones a través del IPA como concentrador en lugar de escribir a mano un conversor para cada par de notaciones directamente:

```python
from scriptconv import DEFAULT_GRAPH

[f"{e.src}->{e.dst}" for e in DEFAULT_GRAPH.route("arpa", "x-sampa")]
# ['arpa->ipa', 'ipa->x-sampa']
```

Nueve notaciones se transcodifican a través de ese concentrador en total: ARPABET, X-SAMPA, Kirshenbaum, Lexique, Cotovía, RFE y mantoq, más Buckwalter, cubierto a continuación.

## Detectar la escritura antes de hacer cualquier otra cosa

Antes de que un programa pueda decidir cómo procesar un fragmento de texto — en qué dirección renderizarlo, qué corrector ortográfico ejecutar, qué fuente elegir —, tiene que saber en qué escritura está el texto. Esa es una pregunta distinta de en qué lengua está. La escritura identifica el conjunto de caracteres; la lengua identifica el vocabulario y la gramática. El serbio, de nuevo, puede ser cirílico o latino. El uzbeko también. `scriptconv` detecta la escritura directamente a partir de los caracteres, y por separado mapea un código de lengua a la escritura en la que se escribe convencionalmente:

```python
from scriptconv import detect_script, script_runs, lang_to_script, base_direction

detect_script("Здравствуйте")
# 'Cyrl'

detect_script("안녕하세요")
# 'Hang'

script_runs("привет hello")
# [('Cyrl', 'привет '), ('Latn', 'hello')]

base_direction("مرحبا hello")
# 'mixed'

lang_to_script("uzb_cyr")
# 'Cyrl'
```

`detect_script` devuelve un código ISO 15924 — el registro estándar de etiquetas de cuatro letras para escrituras (`Cyrl` para cirílico, `Hang` para hangul, `Latn` para latino, `Arab` para árabe). `script_runs` divide texto mixto en tramos contiguos por escritura, que es lo que un renderizador necesita para decidir, frase a frase, qué fuente y dirección de texto aplicar. `base_direction` informa de si una cadena mixta se lee de izquierda a derecha, de derecha a izquierda, o ambas cosas.

## Los casos difíciles: Buckwalter, hangul y kana

Tres conversiones de sistema de escritura aparecen con la frecuencia suficiente en pipelines reales como para que `scriptconv` maneje cada una directamente.

**Buckwalter**, para el árabe, es un esquema de transliteración ASCII que mapea cada letra y diacrítico árabe a un carácter ASCII específico, uno a uno, de modo que la grafía original — incluidas las marcas de vocal que la mayoría del texto nativo omite — pueda reconstruirse exactamente. Existe porque la escritura árabe resulta incómoda de manejar en pipelines y herramientas construidas alrededor de ASCII: ordenar, comparar diferencias, expresiones regulares y formatos de texto más antiguos se vuelven más fáciles una vez que el texto es ASCII de alfabeto latino, siempre que el mapeo sea exacto y reversible.

```python
from scriptconv import buckwalter_to_arabic, arabic_to_buckwalter

buckwalter_to_arabic("mrHbA")
# 'مرحبا'

arabic_to_buckwalter("مرحبا")
# 'mrHbA'

arabic_to_buckwalter("رحمٰن")
# 'rHm`n'
```

El último ejemplo incluye el alef daga, un pequeño diacrítico superíndice usado en un puñado de palabras (`رحمٰن`, *rahman*) — Buckwalter tiene un carácter ASCII específico (`` ` ``) reservado para él, distinto de un alef normal, para que la transliteración no confunda los dos.

**Hangul** parece bloques silábicos, pero cada bloque es un cúmulo compuesto de letras individuales (jamo) dispuestas en una cuadrícula — la forma en que «H», «A», «N» se combinan visualmente en un solo glifo para «han» en lugar de escribirse de izquierda a derecha. El software que necesita las letras individuales — para búsqueda, para análisis fonológico, para alimentar a otro sistema — tiene que volver a separarlas:

```python
from scriptconv.translit import decompose_hangul

decompose_hangul("한국")
# 'ㅎㅏㄴㄱㅜㄱ'

decompose_hangul("국민")
# 'ㄱㅜㄱㅁㅣㄴ'
```

Ese último ejemplo importa por lo que *no* hace: 국민 (*gungmin*, «ciudadano») se pronuncia con asimilación nasal, `[ɡuŋmin]`, pero `decompose_hangul` devuelve las letras tal como están escritas — `ㄱㅜㄱㅁㅣㄴ`, sin asimilar — porque la descomposición es aritmética sobre el punto de código Unicode, no una regla fonológica. Te dice qué se escribió, no a qué suena.

**La conversión de kana** se mueve entre los dos silabarios del japonés, hiragana y katakana, que representan los mismos sonidos con caracteres distintos a un desplazamiento de punto de código fijo:

```python
from scriptconv import hira_to_kana, kana_to_hira

hira_to_kana("こんにちは")
# 'コンニチハ'

kana_to_hira("カタカナ")
# 'かたかな'
```

## Por qué esto vive en su propia biblioteca

Un fonemizador — una herramienta que adivina cómo se pronuncia una palabra escrita — necesita juicio lingüístico: reglas de acentuación, excepciones, pronunciación dependiente del contexto. `scriptconv` deliberadamente no tiene nada de eso. Cada función de arriba es una consulta de tabla o un cálculo de punto de código: misma entrada, misma salida, sin adivinar, sin modelo de lenguaje, nada que pueda estar equivocado sobre cómo suena realmente una lengua concreta. Eso es lo que hace seguro compartirla entre todos los fonemizadores que la necesitan, en lugar de que cada fonemizador reimplemente su propia tabla ARPABET con sus propios errores. La entrada [la pila de fonología](/es/blog/2026-08-10-the-phonology-stack) cubre cómo los motores reales de adivinación de pronunciación — los que sí llevan opiniones lingüísticas — se construyen sobre esta capa en lugar de duplicarla.

## Dónde el mapeo no es exacto

Convertir entre notaciones no siempre carece de pérdidas, y `scriptconv` registra esto como datos consultables en lugar de dejarlo como sorpresa. Cada notación tiene dos propiedades rastreadas de forma independiente: si convertirla a IPA y de vuelta reproduce los símbolos originales exactamente, y si el IPA convertido a ella y de vuelta reproduce cada símbolo IPA.

ARPABET falla en ambas direcciones: tiene un inventario de fonemas restringido, específico del inglés, así que ir de IPA → ARPABET → IPA puede perder distinciones que el IPA puede hacer y para las que la tabla de ARPABET no tiene símbolo. X-SAMPA y Lexique cubren el inventario completo del IPA fielmente pero no está garantizado que hagan un viaje de ida y vuelta limpio empezando por su propio lado. Kirshenbaum y Buckwalter hacen un viaje de ida y vuelta limpio desde su propio lado hacia el IPA pero no al revés. Mantoq, el alfabeto fonético del fonemizador del árabe halabí, solo convierte en una dirección, hacia el IPA — no hay conversor de vuelta. Nada de esto está enterrado en algún docstring; son datos que la biblioteca expone para que quien la use pueda comprobar antes de asumir que un viaje de ida y vuelta es seguro.

---

Si estás uniendo datos de pronunciación de múltiples fuentes, o necesitas detectar escrituras y normalizar texto antes de que llegue a un fonemizador, [ponte en contacto](/contact) o mira qué más construimos en este ámbito en la [página de servicios](/services).
