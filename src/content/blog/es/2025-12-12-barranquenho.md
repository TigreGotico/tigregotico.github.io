---
title: "Presentamos el primer fonemizador para el barranqueño"
description: "g2p_barranquenho es el primer conversor abierto de grafema a fonema para el barranqueño, la lengua de contacto iberorrománica de Barrancos, Portugal — reglas derivadas de la recién publicada convención ortográfica del municipio, auditables frente a las fuentes incluidas en el repositorio."
date: 2025-12-12
lang: es
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) es el primer conversor abierto de grafema a fonema para el [barranqueño](https://en.wikipedia.org/wiki/Barranquenho), una lengua de contacto iberorrománica hablada en Barrancos, Portugal — un municipio en la frontera española donde el portugués y el español extremeño/andaluz han coexistido durante siglos.

### Qué hace al barranqueño fonológicamente interesante

El barranqueño no es un dialecto del portugués ni del español; es un sistema genuinamente distinto. El Ayuntamiento de Barrancos publicó recientemente tres documentos fundacionales — un diccionario, una convención ortográfica y una gramática básica — que aportaron las reglas que necesitábamos. El anuncio: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

A partir de esa convención ortográfica derivamos el conjunto de reglas. El fonemizador ejecuta dos pasadas sobre la entrada en minúsculas:

1. **Pasada de dígrafos** — colapsa los grafemas de varias letras: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/, y `qu`/`gu` ante vocales anteriores → /k//g/.
2. **Pasada de grafemas** — mapea los caracteres restantes a IPA con reglas sensibles al contexto: diptongos nasales ante `m`/`n` (p. ej. `an` → /ɐ͂/), `e` en posición final de palabra → /ɨ/, `v` siempre → /b/, `s` sonorizada a /z/ salvo en posición inicial de palabra, `r` frente a `rr` (vibrante simple frente a múltiple), y `h` como una /h/ pronunciada — a diferencia de cualquiera de las lenguas de origen.

El grafema `x` tiene la lógica más compleja, recurriendo a heurísticas contextuales del portugués allí donde la convención barranqueña guarda silencio.

En la práctica:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ũ ẽjoɾmj pasu paɾɐ u bɐrɐ͂keɲu j paɾɐ ɐ kultuɾɐ bɐrɐ͂keɲɐ`

La biblioteca es una única función, `phonemize(word: str) -> list[str]`, sin dependencias en tiempo de ejecución — Python puro. Los PDF de origen (convención, diccionario, gramática) están incluidos en la raíz del repositorio para que las reglas sean auditables frente a su fuente.

### Qué viene a continuación

Un conversor de G2P es el requisito mínimo para el trabajo de TTS y ASR. Sin él, un modelo entrenado sobre texto no tiene una base fonética con fundamento. Con él, el camino hacia un modelo de voz barranqueño sigue la misma pipeline híbrida que usamos para el asturiano y el aragonés — el obstáculo son los datos de habla, no las herramientas.

**Si dispone de grabaciones de barranqueño hablado o de acceso a hablantes dispuestos a contribuir bajo una licencia abierta, póngase en contacto.** Grabaciones de hablantes nativos, aunque sean unas pocas horas, harían viable un modelo de TTS.

→ [g2p_barranquenho en GitHub](https://github.com/TigreGotico/g2p_barranquenho)
