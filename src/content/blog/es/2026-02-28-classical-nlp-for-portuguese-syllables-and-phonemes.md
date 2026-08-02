---
title: "NLP clásico para el portugués: silabificación y grafema a fonema"
description: "Un vistazo a nuestra pila de NLP para el portugués, basada en reglas y totalmente sin conexión: silabificador para la silabificación y TugaPhone para el grafema a fonema con conciencia dialectal, y cómo se conectan con el trabajo más amplio de orthography2ipa para las variedades lusófonas. Sin cajas negras de aprendizaje profundo: determinista, rápido y con pocas dependencias."
date: 2026-02-28
lang: es
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

Dónde se dividen las sílabas, dónde recae el acento y cómo una grafía se corresponde con un sonido en portugués sigue reglas que los lingüistas documentaron mucho antes de que nadie entrenara una red neuronal. Cuando esas reglas son explícitas, la herramienta adecuada es una biblioteca pequeña, determinista y totalmente sin conexión que puedes leer, auditar y ejecutar en cualquier parte. Esa es la filosofía tras nuestra pila de NLP clásico para el portugués: [silabificador](https://github.com/TigreGotico/silabificador) para la silabificación y [TugaPhone](https://github.com/TigreGotico/tugaphone) para el grafema a fonema (G2P).

### Por qué clásico, y por qué ahora

La fonética es una de las áreas donde las reglas deterministas brillan de verdad. Las reglas de frontera de la silabificación del portugués y las regularidades de su ortografía están bien documentadas, así que un motor de reglas hecho a mano produce transcripciones que puedes inspeccionar línea a línea. Sin GPU, sin descarga de modelo, sin llamada de red. Eso importa para la soberanía de los datos: una pipeline de voz lusófona no debería tener que enviar su texto a una API remota solo para averiguar cómo pronunciar una palabra. También importa para la velocidad y la huella: estas bibliotecas tienen pocas dependencias y funcionan con igual soltura en un portátil, un servidor o un dispositivo integrado.

### silabificador: fronteras de sílaba

`silabificador` es un silabificador ligero del portugués construido enteramente a partir de reglas hechas a mano, **sin dependencias**. La interfaz es tan pequeña como suena:

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

Se ajustó y probó contra datos limpios del [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org), y se evaluó sobre el [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon), un dataset abierto de más de 100.000 entradas extraídas de la misma fuente. La segmentación silábica es un paso fundacional para la asignación del acento, la separación silábica y la transcripción fonémica, así que hacerlo bien y rápido rinde en todo lo que viene después.

### TugaPhone: grafema a fonema con conciencia dialectal

`TugaPhone` convierte texto arbitrario en portugués a IPA, y lo hace a través de los principales dialectos lusófonos: europeo (`pt-PT`), brasileño (`pt-BR`), angoleño (`pt-AO`), mozambiqueño (`pt-MZ`) y timorense (`pt-TL`). Fundamentalmente, preserva la variación dialectal en lugar de aplanarlo todo a un único "estándar". La misma frase sale distinta según dónde se hable:

```
Choveu muito ontem à noite.
pt-PT → ʃuˈvew ˈmũjtu ˈõtɐ̃j a ˈnojt
pt-BR → ʃoˈvew ˈmwĩtʊ ˈõtẽj a ˈnojtʃɪ
pt-AO → ʃoˈvew ˈmũjntʊ ˈõntẽj a ˈnojtɨ
pt-MZ → ʃoˈvew ˈmũjtu ˈõtẽj a ˈnɔjtɨ
pt-TL → ʃoˈvew ˈmujtʊ ˈõntɐ̃j a ˈnojtʰ
```

Bajo el capó, TugaPhone impulsa el motor compartido de enrejado de candidatos `orthography2ipa` y añade encima las particularidades del portugués a través de los propios puntos de extensión de ese motor. Consulta un léxico fonético curado (el mismo Portuguese Phonetic Lexicon anterior) para las palabras conocidas. Para cualquier cosa que no esté en el léxico (nombres, neologismos, préstamos extranjeros) el enrejado genera candidatos a partir de las reglas de grafemas y alófonos del dialecto.

Merece la pena destacar dos detalles. La **normalización de números** convierte los dígitos en sus formas habladas en portugués con concordancia correcta de género y número:

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
```

Incluso respeta las convenciones de escala: escala larga `biliões` para `pt-PT`, escala corta `trilhões` para `pt-BR`. La **desambiguación de homógrafos** se delega a la biblioteca [bifonia](https://github.com/TigreGotico/bifonia), que posee el conocimiento basado en sentidos de qué homógrafos heterofónicos existen y qué lectura llevan, de modo que `para` como preposición se trata de forma distinta que `para` como verbo, y marca la lectura elegida con diacríticos adicionales antes de que el enrejado vea siquiera la frase.

TugaPhone fonemiza impulsando el enrejado de candidatos compartido `orthography2ipa`: la elección de dialecto *es* la elección de especificación de lecto de `orthography2ipa`. Así que los fenómenos dialectales (el betacismo, los diptongos ascendentes de Oporto, la palatalización de /l/ de Madeira, el adelantamiento de /u/ de las Azores, el sandhi de sibilante en coda, y más) provienen del propio enrejado en lugar de ediciones de cadena posteriores.

TugaPhone añade solo lo que `orthography2ipa` deliberadamente deja al llamante, conectado a través de sus propios puntos de extensión. La expansión de números/ordinales con concordancia de género y el marcado de heterófonos de bifonia se ejecutan como la etapa de normalización del motor antes de que el enrejado vea el texto. El léxico de pronunciación curado de **[Tugalex](https://github.com/TigreGotico/tugalex)** se registra por lecto mediante `orthography2ipa.register_lexicon`, de modo que una palabra cubierta entra en la misma vía de anulación que las propias excepciones de una especificación, y el enrejado solo genera candidatos para las palabras que el léxico no cubre. La silabificación proviene del propio plugin de `orthography2ipa` respaldado por `silabificador`, de modo que el acento recae en la misma sílaba que TugaPhone habría elegido de todos modos. Piezas pequeñas y componibles que alimentan un motor compartido, cada una útil por sí sola.

TugaPhone es honesto sobre sus límites: la cobertura del léxico es más escasa para los dialectos africanos y el timorense, los acentos subregionales (Oporto, Miño, Braga y otros) son aproximaciones experimentales de rasgos documentados, y la prosodia a nivel de frase está simplificada. Son limitaciones documentadas abiertamente, no modos de fallo ocultos.

### El panorama más amplio: orthography2ipa

El portugués es una variedad entre muchas, y el mismo patrón de ingeniería generaliza. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) es un paquete de Python de datos puros con mapeos de grafema→IPA y alófonos con motivación lingüística que abarca 820 lenguas en más de 20 familias lingüísticas. Traza una distinción clara que cualquier sistema serio de G2P necesita: un **mapa de grafemas** dice qué fonemas *puede* representar una grafía, mientras que un **mapa de alófonos** dice cómo un fonema realmente *se realiza* en un contexto dado. Las variedades regionales se modelan como sus propias especificaciones vinculadas mediante un linaje ponderado de múltiples antepasados, de modo que los árboles dialectales heredan de sus padres en vez de duplicar datos.

Ese es el mismo instinto tras `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ` y `pt-TL` en TugaPhone: tratar cada variedad lusófona en sus propios términos, con sus propias reglas, no como una desviación de un único acento canónico. Los datos son declarativos y la lógica es fina y conectable, así que puedes leer las reglas, citar sus fuentes y confiar en la salida.

### Pruébalo

Todo lo de aquí es de código abierto e instalable hoy mismo:

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

Para los mapeos multilingües más amplios, véase [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Determinista, rápido, sin conexión, y construido para toda la amplitud del mundo de habla portuguesa.

Esta pila de fonética del portugués se construye sobre nuestro **[trabajo de grafema a IPA para 820 lenguas](/es/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, y forma la columna vertebral fonética de **[TTS que funciona en una patata](/es/blog/2026-05-10-tts-that-runs-on-a-potato)** y de las **[voces multilingües Miro y Dii](/es/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
