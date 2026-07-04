---
title: "NLP clásico para el portugués: silabificación y grafema a fonema"
description: "Un vistazo a nuestra pila de NLP para el portugués, basada en reglas y totalmente sin conexión — silabificador para la silabificación y TugaPhone para el grafema a fonema con conciencia dialectal — y cómo se conectan con el trabajo más amplio de orthography2ipa para las variedades lusófonas. Sin cajas negras de aprendizaje profundo: determinista, rápido y con pocas dependencias."
date: 2026-02-28
lang: es
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

No todo problema lingüístico necesita mil millones de parámetros. Buena parte del procesamiento de texto en portugués se rige por reglas que los lingüistas escribieron mucho antes de que nadie entrenara una red neuronal — reglas sobre dónde se dividen las sílabas, dónde recae el acento, y cómo una grafía dada se corresponde con un sonido. Cuando esas reglas son explícitas, la herramienta adecuada es una biblioteca pequeña, determinista y totalmente sin conexión que puedes leer, auditar y ejecutar en cualquier parte. Esa es la filosofía tras nuestra pila de NLP clásico para el portugués: [silabificador](https://github.com/TigreGotico/silabificador) para la silabificación y [TugaPhone](https://github.com/TigreGotico/tugaphone) para el grafema a fonema (G2P).

### Por qué clásico, y por qué ahora

La fonética es una de las áreas donde las reglas deterministas brillan de verdad. Las reglas de frontera de la silabificación del portugués y las regularidades de su ortografía están bien documentadas, así que un motor de reglas hecho a mano produce transcripciones que puedes inspeccionar línea a línea. Sin GPU, sin descarga de modelo, sin llamada de red. Eso importa para la soberanía de los datos: una pipeline de voz lusófona no debería tener que enviar su texto a una API remota solo para averiguar cómo pronunciar una palabra. También importa para la velocidad y la huella — estas bibliotecas tienen pocas dependencias y funcionan con igual soltura en un portátil, un servidor o un dispositivo integrado.

### silabificador: fronteras de sílaba

`silabificador` es un silabificador ligero del portugués construido enteramente a partir de reglas hechas a mano, **sin dependencias**. La interfaz es tan pequeña como suena:

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

Se ajustó y probó contra datos limpios del [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org), y se evaluó sobre el [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon) — un dataset abierto de más de 100.000 entradas extraídas de la misma fuente. La segmentación silábica es un paso fundacional para la asignación del acento, la separación silábica y la transcripción fonémica, así que hacerlo bien y rápido rinde en todo lo que viene después.

### TugaPhone: grafema a fonema con conciencia dialectal

`TugaPhone` convierte texto arbitrario en portugués a IPA, y lo hace a través de los principales dialectos lusófonos: europeo (`pt-PT`), brasileño (`pt-BR`), angoleño (`pt-AO`), mozambiqueño (`pt-MZ`) y timorense (`pt-TL`). Fundamentalmente, preserva la variación dialectal en lugar de aplanarlo todo a un único "estándar". La misma frase sale distinta según dónde se hable:

```
Choveu muito ontem à noite.
pt-PT → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈoj·tɨ
pt-BR → ʃo·ˈvew mwˈĩ·tʊ ˈõ·tẽ ˈa nˈoj·tʃɪ
pt-AO → ʃo·ˈvew mˈũjn·tʊ ˈõ·tẽ ˈa nˈoj·tɨ
pt-MZ → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈɔj·tɨ
pt-TL → ʃo·ˈvew mˈuj·tʊ ˈõ·tẽ ˈa nˈojtʰ
```

Bajo el capó, TugaPhone es un **híbrido** de dos técnicas clásicas. Primero consulta un léxico fonético curado (el mismo Portuguese Phonetic Lexicon anterior) para las palabras conocidas; para cualquier cosa que no esté en el léxico — nombres, neologismos, préstamos extranjeros — recurre a un motor de G2P basado en reglas. La pipeline es explícita en cada etapa: normalización del texto, etiquetado morfosintáctico opcional, búsqueda en el léxico, respaldo basado en reglas, y luego transformaciones específicas del dialecto.

Merece la pena destacar dos detalles. La **normalización de números** convierte los dígitos en sus formas habladas en portugués con concordancia correcta de género y número:

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
normalize_numbers("1ª vez")                # primeira vez
```

Incluso respeta las convenciones de escala — escala larga `biliões` para `pt-PT`, escala corta `trilhões` para `pt-BR`. La **desambiguación de homógrafos** usa el contexto morfosintáctico, así que `para` como preposición se trata de forma distinta que `para` como verbo. TugaPhone puede usar un etiquetador spaCy o Brill cuando esté disponible, pero también incluye un respaldo basado en reglas sin dependencias, fiel al principio de sin conexión primero.

La arquitectura es una jerarquía limpia — frase → palabra → grafema → carácter — con reglas sensibles al contexto aplicadas en cada nivel: calidad vocálica y alófonos consonánticos en el nivel de carácter, dígrafos como ⟨ch⟩ y ⟨nh⟩ y diptongos como ⟨ai⟩ y ⟨ou⟩ en el nivel de grafema, acento y silabificación en el nivel de palabra. TugaPhone reutiliza `silabificador` para la capa silábica, junto con las bibliotecas complementarias **[Tugalex](https://github.com/TigreGotico/tugalex)** (léxico y excepciones) y **[TugaTagger](https://github.com/TigreGotico/tugatagger)** (etiquetado morfosintáctico). Piezas pequeñas y componibles — cada una útil por sí sola.

TugaPhone es honesto sobre sus límites: la cobertura del léxico es más escasa para los dialectos africanos y el timorense, los acentos subregionales (Oporto, Miño, Braga y otros) son aproximaciones experimentales de rasgos documentados, y la prosodia a nivel de frase está simplificada. Son limitaciones documentadas abiertamente, no modos de fallo ocultos — exactamente el tipo de transparencia que un sistema basado en reglas hace posible.

### El panorama más amplio: orthography2ipa

El portugués es una variedad entre muchas, y el mismo patrón de ingeniería generaliza. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) es un paquete de Python de datos puros con mapeos de grafema→IPA y alófonos con motivación lingüística que abarca más de 350 códigos de lengua en más de 20 familias lingüísticas. Traza una distinción clara que cualquier sistema serio de G2P necesita: un **mapa de grafemas** dice qué fonemas *puede* representar una grafía, mientras que un **mapa de alófonos** dice cómo un fonema realmente *se realiza* en un contexto dado. Las variedades regionales se modelan como sus propias especificaciones vinculadas mediante un linaje ponderado de múltiples antepasados, de modo que los árboles dialectales heredan de sus padres en vez de duplicar datos.

Ese es el mismo instinto tras `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ` y `pt-TL` en TugaPhone: tratar cada variedad lusófona como ciudadana de primera clase con sus propias reglas, no como una desviación de un único acento canónico. Los datos son declarativos y la lógica es fina y conectable — puedes leer las reglas, citar sus fuentes y confiar en la salida.

### Pruébalo

Todo lo de aquí es de código abierto e instalable hoy mismo:

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

Para los mapeos multilingües más amplios, véase [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Determinista, rápido, sin conexión, y construido para toda la amplitud del mundo de habla portuguesa.

Esta pila de fonética del portugués se construye sobre nuestro **[trabajo de grafema a IPA para más de 350 lenguas](/es/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, y forma la columna vertebral fonética de **[TTS que funciona en una patata](/es/blog/2026-05-10-tts-that-runs-on-a-potato)** y de las **[voces multilingües Miro y Dii](/es/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
