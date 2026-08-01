---
title: "Cómo Encaja la Pila de Fonología"
description: "Un recorrido arquitectónico por nuestra pila de texto a pronunciación: scriptconv para la notación, orthography2ipa como motor translingüe de grafema a IPA, frontends específicos por lengua construidos sobre él para portugués, euskera, mirandés, barranqueño y árabe, y phonematcher para la búsqueda basada en sonido. Explica por qué existen las capas, qué es un enrejado de candidatos, y salida real por dialecto."
date: 2026-08-01
lang: es
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "Linguistics"
  - "FOSS"
draft: false
---

Tomemos la palabra inglesa «read». Escrita, no te dice cómo pronunciarla. «I read the book yesterday» («leí el libro ayer») e «I read the book every day» («leo el libro cada día») usan las mismas cinco letras para dos sonidos distintos — uno rima con «red», el otro con «reed». Un lector de pantalla, un asistente de voz o un buscador que solo mire la grafía no puede acertar aquí. Necesita razonar sobre la pronunciación, no solo sobre el texto.

Ese problema de razonamiento — convertir palabras escritas en los sonidos que representan — es lo que resuelve nuestra pila de fonología. Esta entrada es un mapa de cómo encajan sus piezas, desde la notación en bruto hasta los motores de pronunciación específicos por lengua y la búsqueda basada en sonido.

## Algunos términos, explicados con sencillez

Unas palabras que aparecerán a lo largo del texto:

- **Grafema**: un símbolo escrito — una letra, o una combinación de letras como «ch».
- **Fonema**: una unidad distintiva de sonido en una lengua, como el sonido «k» en «cat».
- **IPA** (Alfabeto Fonético Internacional): un alfabeto estándar para anotar sonidos con precisión, independiente de la ortografía de cualquier lengua. «Cat» se escribe `kæt` en IPA.
- **G2P** (grafema a fonema): el problema general de convertir grafía en sonido.
- **Alófono**: una realización distinta del mismo fonema según el contexto — la «t» de «top» y la «t» de «stop» son el mismo fonema en inglés pero se pronuncian de forma ligeramente distinta.
- **Silabificación**: dividir una palabra en sílabas, p. ej. «extraordinário» en `ex-tra-or-di-ná-ri-o`.
- **Homógrafo**: dos palabras escritas igual pero con significados distintos; un **homógrafo heterofónico** (o heterófono) es un homógrafo que se pronuncia de forma distinta según el significado que se quiera dar, como «read»/«read» de arriba.
- **Morfología**: la estructura interna de las palabras — prefijos, raíces, sufijos, flexiones.
- **Etiquetado de categoría gramatical (POS)**: marcar cada palabra de una frase como sustantivo, verbo, adjetivo, etc.

## El problema central

La grafía es una codificación con pérdidas del sonido. Tres cosas distintas hacen difícil revertirla:

1. **Ambigüedad.** Las mismas letras pueden corresponder a sonidos distintos según el significado, la gramática o la pura irregularidad («read» arriba; el inglés está lleno de estos casos).
2. **Dialecto.** La misma palabra, en la misma lengua, se pronuncia de forma distinta según de dónde sea el hablante. El portugués europeo y el brasileño comparten grafía pero no vocales.
3. **Cobertura.** La mayoría de las lenguas del mundo no tienen ningún diccionario de pronunciación curado profesionalmente. Un sistema de G2P que solo funciona mediante una tabla de consulta es un sistema que solo funciona para un puñado de lenguas.

Cualquier intento serio de texto a voz, datos de entrenamiento de reconocimiento de voz o búsqueda con conciencia fonética tiene que lidiar con las tres cosas.

## Por qué la pila está organizada en capas

La pila divide el problema en capas que no necesitan conocerse entre sí:

- **Notación** — convertir entre alfabetos fonéticos y escrituras. Esto no tiene nada que ver con la fonología de ninguna lengua en particular; es traducción de símbolos.
- **Fonología** — mapear la grafía a IPA para una lengua dada, usando una especificación del sistema de sonidos de esa lengua.
- **Manejo de excepciones específico de la lengua** — las palabras irregulares, las peculiaridades dialectales, los homógrafos y la estructura morfológica que un motor general no puede inferir solo a partir de reglas ortográficas.

Mantener esto separado es una decisión de diseño, no un accidente, y tiene una recompensa directa: añadir una nueva lengua significa escribir una **especificación** (datos que describen su sistema de sonidos), no un nuevo programa. El motor que consume la especificación, la búsqueda en el enrejado, el tokenizador, las métricas de distancia — nada de eso se reescribe. La capa de notación de debajo la comparten todas las lenguas, incluidas aquellas de las que el motor de fonología nunca ha oído hablar.

### La capa de notación: scriptconv

[scriptconv](https://github.com/TigreGotico/scriptconv) es un núcleo sin dependencias para la notación fonética y el manejo de escrituras: detección de escritura ISO-15924, conversiones de IPA hacia y desde ARPABET, X-SAMPA, Lexique, Kirshenbaum, notación Cotovía y RFE, transliteración Buckwalter para el árabe, descomposición de hangul en jamo, y manejo de kana. Nada de esto requiere saber a qué lengua pertenece una palabra — una cadena de fonemas en IPA se convierte a ARPABET de la misma forma sin importar la lengua de origen:

```python
>>> import scriptconv as s
>>> s.ipa_to_arpa("kæt")
'K AE T'
>>> s.ipa_to_xsampa("kæt")
'k{t'
```

Todas las capas por encima de esta pueden asumir que la conversión de notación ya está resuelta.

### El motor: orthography2ipa

[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) es el motor translingüe. Toma una especificación de lengua — una descripción declarativa de las reglas de grafema a fonema de esa lengua — y un fragmento de texto, y produce IPA. A fecha de esta publicación incluye especificaciones que cubren **807 lenguas** (`available_codes()` en el paquete instalado devuelve una lista de esa longitud; trata la cifra exacta como un objetivo móvil, ya que se añaden especificaciones con el tiempo).

```python
>>> import orthography2ipa as o
>>> len(o.available_codes())
807
```

El propio motor no tiene ningún código específico de lengua incorporado. Una nueva lengua es un nuevo archivo de especificación, comprobado contra el mismo esquema que cualquier otra especificación.

## El enrejado: candidatos clasificados, no una única conjetura

Dado el problema de ambigüedad anterior, comprometerse con una única salida por palabra suele ser un error. orthography2ipa en su lugar produce un **enrejado** — un conjunto de pronunciaciones candidatas clasificadas — y deja que las capas superiores lo reduzcan usando contexto que el propio motor no tiene (significado, categoría gramatical, una entrada de léxico).

Volvamos a «read»:

```python
>>> from orthography2ipa import G2P
>>> g = G2P("en")
>>> g.transcribe("read")
'ɹiːd'
>>> g.candidates("read")
[IPAPath('ɹiːd', score=0.0), IPAPath('ɹɛd', score=1.0)]
```

Sin más contexto el motor devuelve su mejor conjetura (presente, coste más bajo) pero mantiene la alternativa (pasado) en el enrejado con su coste asociado. Un componente aguas abajo que sepa que la frase está en pasado puede elegir el segundo candidato en lugar del primero. Es la misma idea que usa, a mayor escala, bifonia (más abajo) para los heterófonos del portugués: un enrejado de propósito general aporta los candidatos, una capa más estrecha y mejor informada elige entre ellos.

## Los dialectos son ciudadanos de primera clase

Dos hablantes de la misma lengua pueden pronunciar la misma frase de forma distinta, y una pila de fonología que trate «el portugués» como un único sistema de sonidos fijo acertará con un dialecto y se equivocará con todos los demás. orthography2ipa expone el manejo de dialectos directamente — `available_profiles()` en el paquete instalado lista perfiles de dialecto y lecto como `lisbon`, `porto`, `estremenho`, `galician`, entre otros — y [tugaphone](https://github.com/TigreGotico/tugaphone), el frontend de portugués construido sobre él, fonemiza la misma frase a través de las variedades lusófonas. Aquí tienes una frase pasada por los cinco dialectos soportados:

| Dialecto | Salida |
|---|---|
| pt-PT (Portugal) | `ˈbõ ˈdiɐ ˈkomu eˈʃta vɔˈse` |
| pt-BR (Brasil) | `ˈbõ ˈdʒiɐ ˈkɔ̃mʊ eˈsta voˈse` |
| pt-AO (Angola) | `ˈbõ ˈdiɐ ˈkomʊ eˈsta vɔˈse` |
| pt-MZ (Mozambique) | `ˈbõ ˈdiɐ ˈkomu eˈsta vɔˈse` |
| pt-TL (Timor-Leste) | `ˈbõ ˈdiə ˈkoɔmʊ eˈsta vɔˈse` |

(«Bom dia, como está você?» — «Buenos días, ¿cómo está usted?») El esqueleto consonántico se mantiene reconocible en las cinco variedades, pero dos marcadores bien conocidos las separan de inmediato. En «dia», el portugués brasileño convierte la `d` ante `i` en `dʒ`, el sonido al principio del inglés «jam» — las demás mantienen una `d` simple. En «está», el portugués europeo pronuncia la `s` al final de sílaba como `ʃ`, la «sh» de «shoe», mientras que el resto de variedades mantiene `s`. Un diccionario de pronunciación construido a partir de las reglas de un único dialecto se equivoca en ambos casos para el oyente de cualquier otro dialecto.

[euskaphone](https://github.com/TigreGotico/euskaphone) hace lo mismo para los dialectos del euskera, construido directamente sobre el enrejado de orthography2ipa en lugar de sobre un motor aparte:

```python
>>> from euskaphone import EuskaPhonemizer
>>> EuskaPhonemizer().phonemize_sentence("Kaixo, zer moduz zaude?")
'kai̯ʃo s̻er modus̻ s̻au̯de'
```

## Los frontends específicos por lengua

Sobre el motor compartido se sitúan frontends que añaden lo que una especificación general no puede: palabras irregulares, un léxico curado, sandhi (cambios de sonido en las fronteras entre palabras) y anulaciones específicas de dialecto.

- **[tugaphone](https://github.com/TigreGotico/tugaphone)** — portugués, a través de pt-PT, pt-BR, pt-AO, pt-MZ y pt-TL, combinando un léxico curado con un respaldo basado en reglas (mostrado arriba).
- **[euskaphone](https://github.com/TigreGotico/euskaphone)** — euskera, con conciencia dialectal, construido sobre el mismo enrejado (mostrado arriba).
- **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** — mirandés, la lengua asturleonesa de la Terra de Miranda, Portugal, con sandhi entre palabras, alofonía y acentuación:

  ```python
  >>> from mwl_phonemizer import phonemize
  >>> phonemize("Falo la lhéngua mirandesa.")
  'ˈfalu lɐ ˈʎɛŋɡwa miɾɐˈndez̺ɐ.'
  ```

- **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** — el primer G2P abierto para el barranqueño, la lengua de contacto iberorrománica de Barrancos, en la frontera entre Portugal y España. Véase **[Presentamos el primer fonemizador para el barranqueño](/es/blog/2025-12-12-barranquenho)** para saber cómo se derivaron sus reglas de la propia convención ortográfica del municipio.
- **[arbtok](https://github.com/TigreGotico/arbtok)** — árabe, construido sobre el enrejado de orthography2ipa, añadiendo diacritización con conciencia dialectal y cubriendo el árabe estándar moderno, el clásico y varias variedades regionales. La escritura árabe normalmente omite las marcas de vocales breves que un fonemizador necesita, así que el trabajo principal de arbtok es recuperarlas antes de pasar el resultado al motor compartido. Lo mantiene alguien que no habla árabe nativamente, así que trátalo como en desarrollo activo en lugar de como una referencia terminada y revisada por nativos — útil, pero el lugar donde conviene comprobar la salida con un hablante nativo antes de publicarla en algo de cara al usuario.

Cada uno de estos frontends es una fina capa de lógica específica de lengua sobre el mismo motor de enrejado compartido y la misma capa de notación compartida debajo. Ninguno reimplementa la conversión a IPA ni la búsqueda en el enrejado.

## Herramientas de apoyo para el portugués

El portugués tiene la pila más profunda, porque su pronunciación depende de más que reglas ortográficas: depende de la estructura silábica, la categoría gramatical y, a veces, el puro significado.

- **[silabificador](https://github.com/TigreGotico/silabificador)** divide las palabras en sílabas usando reglas hechas a mano:

  ```python
  >>> from silabificador import syllabify
  >>> syllabify("extraordinário")
  ['ex', 'tra', 'or', 'di', 'ná', 'ri', 'o']
  ```

- **[tugalex](https://github.com/TigreGotico/tugalex)** es el léxico detrás de tugaphone: transcripciones IPA, datos silábicos y reglas ortográficas para palabras reales, de modo que el vocabulario común e irregular no tiene que re-derivarse de la grafía cada vez.
- **[tugatagger](https://github.com/TigreGotico/tugatagger)** envuelve varios backends de etiquetado POS (spaCy, Stanza, un etiquetador al estilo Brill, un respaldo heurístico sin dependencias) tras una sola interfaz, de modo que otras herramientas puedan preguntar «qué categoría gramatical tiene esta palabra» sin comprometerse con un backend concreto.
- **[tugamorph](https://github.com/TigreGotico/tugamorph)** es un analizador morfológico basado en reglas: segmenta una palabra en prefijo, raíz, sufijo, flexión y clítico, usando solo la biblioteca estándar de Python, opcionalmente afinado con silabificador y tugatagger.
- **[bifonia](https://github.com/TigreGotico/bifonia)** resuelve los homógrafos heterofónicos del portugués europeo — palabras como «sede» (sed, `ˈsedɨ`, frente a sede de una organización, `ˈsɛdɨ`) donde la pronunciación correcta depende del significado, no de la gramática. Véase **[Diciéndolo Bien: Desambiguando Heterófonos del Portugués para TTS](/es/blog/2026-06-12-disambiguating-portuguese-heterographs-for-tts)** para saber cómo se construyó y evaluó. Este es el caso concreto detrás de la idea del enrejado de arriba: orthography2ipa puede aportar las dos lecturas candidatas de «sede», pero solo una capa consciente del significado como bifonia puede elegir entre ellas.

Para más sobre cómo trabajan juntos silabificador y tugaphone en el día a día, véase **[NLP clásico para el portugués: silabificación y grafema a fonema](/es/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, y para el motor más amplio que subyace a todo esto, **[Grafema a IPA para 676 lenguas](/es/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**.

## Búsqueda basada en sonido: phonematcher

Todo lo anterior convierte texto en sonido. [phonematcher](https://github.com/TigreGotico/phonematcher) trabaja con las propias representaciones de sonido: calcula la distancia fonética entre símbolos IPA y hace búsqueda difusa sobre listas de palabras basándose en cómo suenan las palabras en lugar de cómo se escriben.

```python
>>> from phonematcher.distance import phonetic_distance
>>> phonetic_distance('b', 'p')   # voiced vs. voiceless bilabial stop — very similar
0.043478260869565216
>>> phonetic_distance('p', 'k')   # bilabial vs. velar stop — less similar
0.34782608695652173
>>> phonetic_distance('a', 'k')   # vowel vs. consonant — maximally different
1.0
```

Esa métrica de distancia es útil en dos situaciones concretas: buscar en un catálogo de palabras o nombres por cómo suena algo en lugar de por su grafía exacta (útil para interfaces de voz tolerantes a erratas y para emparejar préstamos lingüísticos entre sistemas de escritura), y comparar cuán cercanos fonológicamente son dos lectos relacionados — el mismo tipo de comparación que la tabla de dialectos de arriba hace a ojo, pero calculada en lugar de estimada visualmente. phonematcher no está en PyPI; se instala desde el código fuente (`pip install -e .` contra el checkout de GitHub, más `rapidfuzz`).

## Límites honestos

La cobertura entre las 807 especificaciones de lengua es desigual por construcción: las lenguas con una literatura fonológica establecida y un léxico producen mejor salida que las lenguas con una especificación escueta inferida sobre todo a partir de convenciones ortográficas generales. La calidad es sistemáticamente mejor donde existe un léxico curado — el portugués, respaldado por tugalex, es el caso más fuerte de la pila; las lenguas que dependen únicamente de reglas de especificación sin léxico manejarán mal el vocabulario irregular y los préstamos.

Algunos componentes explícitamente no son referencias terminadas y revisadas por nativos: arbtok lo mantiene alguien que no es hablante nativo de árabe y debería comprobarse con el juicio de un nativo antes de usarlo en algo de cara al usuario. Los frontends construidos sobre especificaciones escuetas heredan esa escasez — un frontend es tan bueno como la especificación y el léxico que tiene debajo.

## Por qué importa esto si tu lengua no tiene herramientas de voz

La mayoría de las lenguas del mundo no tienen ninguna voz de TTS comercial, ningún modelo de STT comercial, y ningún diccionario de pronunciación mantenido profesionalmente. El diseño en capas de arriba significa que cubrir ese hueco no requiere construir un motor de fonología desde cero: requiere escribir una especificación del sistema de sonidos de la lengua objetivo y, cuando sea posible, un léxico de sus palabras irregulares. El motor de enrejado, las conversiones de notación y las herramientas de búsqueda ya están ahí. Si tu lengua, dialecto o producto necesita soporte de pronunciación que todavía no existe, ese es el tipo de trabajo que asumimos — véase **[nuestros servicios](/services)** o **[ponte en contacto](/contact)**.
