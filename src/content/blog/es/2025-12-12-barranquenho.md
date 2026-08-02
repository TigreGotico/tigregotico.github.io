---
title: "Presentamos el primer fonemizador para el barranqueño"
description: "g2p_barranquenho es el primer conversor abierto de grafema a fonema para el barranqueño, la lengua de contacto iberorrománica de Barrancos, Portugal — reglas derivadas de la recién publicada convención ortográfica del municipio, auditables frente a las fuentes incluidas en el repositorio."
date: 2025-12-12
lang: es
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) es el primer conversor abierto de grafema a fonema para el [barranqueño](https://en.wikipedia.org/wiki/Barranquenho). El barranqueño es una lengua de contacto iberorrománica hablada en Barrancos, Portugal, un municipio en la frontera española donde el portugués y el español extremeño/andaluz han coexistido durante siglos.

### Qué hace al barranqueño fonológicamente interesante

El barranqueño no es un dialecto del portugués ni del español. Es un sistema lingüístico distinto. El Ayuntamiento de Barrancos publicó recientemente tres documentos fundacionales: un diccionario, una convención ortográfica y una gramática básica. Estos nos dieron las reglas que necesitábamos. Lea el anuncio: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

Derivamos el conjunto de reglas a partir de esa convención ortográfica. En lugar de programar a mano una pasada específica sobre el texto, las reglas viven como una especificación de idioma, `ext-PT-x-barrancos`, dentro del motor compartido **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)**. La tabla de grafemas, las reglas de alófonos, el modelo de acentuación y el sandhi entre palabras de esa especificación describen todas las realizaciones del barranqueño. Los grafemas de varias letras colapsan tal y como documenta la convención: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/. Los diptongos nasales aparecen ante `m`/`n`. `v` siempre se mapea a /b/, y `h` se manifiesta como una /h/ pronunciada, a diferencia de las lenguas de origen.

`g2p_barranquenho` en sí es una fina envoltura del lado del llamante alrededor de `orthography2ipa.G2P`, dirigida por esa especificación. Se encarga de la normalización del texto (plegado de mayúsculas, tokenización en las formas que espera la especificación), la expansión de números y una interfaz estable `phonemize`/`transcribe`, pero no de las reglas fonológicas. Mejorar una regla significa editar la especificación en origen, de modo que todos los consumidores posteriores comparten la corrección.

En la práctica:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ˈũ eˈnɔɾmi ˈpas̺u ˈpaɾɐ ˈu bɐrɐ̃ˈkɛɲu ˈi ˈpaɾɐ ɐ kuˈltuɾɐ bɐrɐ̃ˈkɛɲɐ`

Los PDF de origen (convención, diccionario, gramática) están incluidos en la raíz del repositorio para que las reglas sean auditables frente a su fuente.

### Qué viene a continuación

Un conversor de G2P es el requisito mínimo para el trabajo de TTS y ASR. Sin él, un modelo entrenado sobre texto no tiene una base fonética con fundamento. Con él, el camino hacia un modelo de voz barranqueño sigue la misma pipeline híbrida que usamos para el asturiano y el aragonés. El obstáculo son los datos de habla, no las herramientas.

**Si dispone de grabaciones de barranqueño hablado o de acceso a hablantes dispuestos a contribuir bajo una licencia abierta, póngase en contacto.** Grabaciones de hablantes nativos, aunque sean unas pocas horas, harían viable un modelo de TTS.

→ [g2p_barranquenho en GitHub](https://github.com/TigreGotico/g2p_barranquenho)
