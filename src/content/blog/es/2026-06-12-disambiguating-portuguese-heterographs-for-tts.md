---
title: "Decirlo Bien: Desambiguar Heterófonos del Portugués para TTS"
description: "Muchas palabras del portugués europeo se escriben igual pero se pronuncian de forma diferente según su significado, y equivocar la vocal hace que una voz TTS diga la palabra equivocada. Construimos bifonia-pt-homographs, un conjunto de datos abierto etiquetado por significado con 56 891 frases sobre 27 palabras, y un resolutor diminuto y sin dependencias que alcanza ≈94 % donde los etiquetadores POS pesados se estancan en ≈75 %."
date: 2026-06-12
lang: es
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Portuguese"
  - "TTS"
  - "Grapheme-to-Phoneme"
  - "NLP"
  - "Accessibility"
  - "FOSS"
draft: false
---

## Decirlo Bien: Desambiguar Heterófonos del Portugués para TTS

Cuando una voz de síntesis lee "Tenho sede", un oyente portugués espera oír *sed*.
Pero exactamente la misma grafía, `sede`, puede significar también *sede* (en el
sentido de central), y las dos se pronuncian con vocales diferentes. Dilo con la
vocal equivocada y la voz no solo suena mal. Dice en voz alta una palabra
diferente. Para alguien que depende del TTS para que le lea la pantalla, esa es la
línea entre lo inteligible y lo confuso.

Este es un problema de front-end: la etapa de grafema a fonema que decide *qué
sonidos* mapea una palabra, mucho antes de que ningún vocoder neuronal convierta
esos sonidos en audio. Ninguna cantidad de calidad de vocoder lo arregla. Si el
front-end elige la pronunciación equivocada, la voz articula la palabra equivocada,
con toda nitidez.

### Homógrafos heterófonos: misma grafía, distinto sonido, distinto significado

El portugués europeo está lleno de palabras escritas de forma idéntica pero
pronunciadas con una calidad vocálica distinta, una vocal *abierta* frente a una
*cerrada*, donde la elección correcta depende del **significado**, no solo de la
gramática. Unas cuantas:

- **`sede`**: *sed* (e cerrada, `ˈsedɨ`) frente a *central/sede* (e abierta, `ˈsɛdɨ`). Ambas son sustantivos.
- **`forma`**: *molde / bandeja de horno* (o cerrada, `ˈfoɾmɐ`, escrito *fôrma*) frente a *forma / manera* (o abierta, `ˈfɔɾmɐ`).
- **`molho`**: *salsa* (o cerrada) frente a *manojo* (o abierta).
- **`corte`**: *corte real* (o cerrada) frente a *un corte* (o abierta).

Un sistema TTS ingenuo se compromete con una pronunciación por grafía. Así que lee
*sed* con la vocal de *central* cada vez, y el oyente oye la palabra equivocada.

### Por qué "basta con etiquetar la categoría gramatical" no funciona

La solución obvia es pasar un etiquetador de categorías gramaticales (POS) sobre la
frase y elegir la pronunciación según el POS. Eso ayuda con algunos pares, pero
falla *por construcción* siempre que dos significados comparten categoría
gramatical.

Tomemos `sede` de nuevo. *Sed* y *central* son **ambos sustantivos**. Un etiquetador
POS los etiqueta de forma idéntica, ya que no hay señal gramatical para distinguirlos, así
que solo puede adivinar la lectura más común. Medimos exactamente esto: en nuestro
conjunto de prueba, tanto spaCy como Stanza obtienen un **0 %** en el sentido *sed*
de `sede`. Siempre eligen *central*. El mismo techo estructural aparece en `corte`
(corte vs corte real), `forma` (molde vs forma) y `molho` (salsa vs manojo): cuando
el significado se divide dentro de una única categoría gramatical, la gramática no
puede verlo.

### El conjunto de datos: etiquetar el significado, no la gramática

Así que construimos un conjunto de datos abierto que etiqueta lo que realmente
importa: el significado. **`bifonia-pt-homographs`** son **56 891 frases del
portugués europeo** que cubren **27 homógrafos heterófonos**. Cada frase está
etiquetada con la palabra, su **significado** (sentido), su categoría gramatical, su
pronunciación IPA, y una forma con diacríticos restaurados (por ejemplo *sêde* vs
*séde*) que hace inequívoca la lectura pretendida sobre el papel.

La clave de agrupación es el significado. Ese es el objetivo central. Un único
registro tiene este aspecto:

```json
{
  "word": "sede",
  "sense": "thirst",
  "pos": "NOUN",
  "ipa": "ˈsedɨ",
  "sentence": "Depois da corrida tinha tanta sede que bebi um litro de água."
}
```

Las pronunciaciones se verificaron con el diccionario [infopédia](https://www.infopedia.pt)
(Porto Editora) en lugar de adivinarse, y las particiones de entrenamiento y prueba
están estratificadas por `(word, meaning)`, para que un modelo posterior (un BiLSTM,
por ejemplo) vea cada sentido en ambas mitades. Está publicado en Hugging Face como
[`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs).

### ¿Cómo de bien se puede resolver?

Con datos etiquetados por significado, pudimos medir cómo se desempeñan distintos
enfoques al elegir el significado correcto, y por tanto la pronunciación correcta:

| Enfoque | Precisión |
| --- | --- |
| Adivinar siempre el sentido más común | ≈53 % |
| spaCy POS → significado | ≈66 % |
| Stanza POS → significado | ≈75 % |
| Resolutor de reglas + significado de `bifonia` | **≈94 %** |

Los enfoques basados en POS se estancan justo donde cabría esperar: pueden enrutar
por gramática pero nunca por significado, así que las divisiones dentro de un
sustantivo quedan fuera de su alcance. Nuestro resolutor, la biblioteca
[`bifonia`](https://github.com/TigreGotico/bifonia), es ligera y **totalmente libre de
dependencias**. Alcanza el **≈94 %**, y logra el **100 %** en el
caso `sede`/*sed* en el que los etiquetadores POS obtienen un **0 %**.

El número importa menos que la razón detrás de él: un componente pequeño, rápido y totalmente
abierto supera a etiquetadores POS neuronales pesados en esta tarea porque resuelve
el *significado*, no solo la gramática. Sin GPU, sin descarga de modelo, sin llamada
de red.

### Por qué importa

La pronunciación correcta es fundamental, no cosmética. Los lectores de pantalla y
los asistentes de voz son la forma en que los usuarios ciegos y de solo voz leen el
mundo, y un front-end que pronuncia mal palabras comunes degrada silenciosamente
cada frase que toca. Arreglar la desambiguación de heterófonos en el origen
significa que la voz dice lo que el texto quiere decir.

Como el conjunto de datos es abierto y el resolutor es diminuto y bifurcable,
cualquiera que construya un front-end de TTS para portugués puede hacer esto bien
sin un modelo gigantesco. El mismo enfoque se traslada limpiamente a una lengua
emparentada como el gallego, donde la distinción de vocal abierta/cerrada crea la
misma trampa. Los datos etiquetados también cumplen una doble función: son
exactamente lo que se necesita para entrenar modelos estadísticos compactos, como un
clasificador por palabra, para equipos que tienen el corpus y quieren un resolutor
aprendido junto al basado en reglas.

### Pruébalo

El conjunto de datos está en Hugging Face en
[`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs),
y el resolutor vive en [`bifonia`](https://github.com/TigreGotico/bifonia). Se
integra en el trabajo más amplio de fonética del portugués que hay detrás de **[NLP
clásico para portugués](/es/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**
y del **[stack de grafema a IPA para más de 350 lenguas](/es/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**:
piezas pequeñas y deterministas que hacen que una voz pronuncie una lengua como
realmente lo hacen sus hablantes.
