---
title: "Crear Voces Sintéticas desde Cero"
description: "Crear una voz para un sistema de texto a voz normalmente exige que una persona real dedique horas a grabar audio. Eso es caro, lento y, en muchos idiomas o acentos, las voces sencillamente no existen"
date: 2025-06-26
lang: es
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Synthetic Data"
  - "Voice Cloning"
  - "OVOS"
draft: false
---

> Este blog se publicó originalmente en el [blog de OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-06-26-making-synthetic-voices-from-scratch)

No existía una buena voz TTS offline para el portugués europeo. La grabación en estudio es cara, lleva meses y, en la mayoría de los idiomas del mundo, las grabaciones sencillamente nunca se han hecho. Por eso construimos cuatro desde cero, sin cabina de grabación, sin actor de voz y sin nube.

### El pipeline de tres pasos

**1. Generar pares de habla sintéticos.** Usamos una voz TTS existente como donante (cualquier fuente capaz de producir audio inteligible) y la ejecutamos sobre un gran corpus de texto para producir miles de pares de audio/texto. La voz donante no necesita ser de alta calidad. Solo tiene que ser lo bastante coherente como para aprender de ella.

**2. Aplicar conversión de voz.** Un paso de conversión de voz transforma el timbre de la donante en una nueva identidad: un género, edad o personaje diferentes. El audio resultante suena como la voz objetivo, no como la donante.

**3. Entrenar un modelo VITS compacto.** VITS es una arquitectura neuronal de texto a voz. El audio convertido se convierte en el conjunto de entrenamiento para un pequeño modelo VITS mediante [phoonnx_train](https://github.com/TigreGotico/phoonnx). El modelo terminado se exporta a ONNX (un formato portable para ejecutar modelos entrenados) y se ejecuta enteramente offline, en una Raspberry Pi si es necesario.

### Salvaguardas éticas

Si la donante es la voz de una persona real, obtenemos primero su permiso explícito. Cuando ningún permiso es posible, usamos grabaciones de dominio público o generamos una voz totalmente original que no copia la identidad de nadie. El paso de conversión de voz tiene además una propiedad útil de privacidad: la salida es acústicamente lo bastante distinta de la donante como para que el riesgo de suplantación sea insignificante.

### Aplicado al portugués europeo

El portugués europeo no tenía ninguna voz offline abierta de alta calidad. Producimos cuatro voces, incluidas las identidades Miro y Dii, que son ahora las voces OVOS por defecto para `pt-PT`, usando exactamente este pipeline. Se ejecutan cómodamente en hardware modesto, no requieren conexión a internet, y los datos de entrenamiento están [publicados abiertamente](https://huggingface.co/TigreGotico) para que cualquiera pueda reproducirlos o ampliarlos.

Todos los modelos y datasets están en [huggingface.co/OpenVoiceOS](https://huggingface.co/OpenVoiceOS) y [huggingface.co/TigreGotico](https://huggingface.co/TigreGotico).
