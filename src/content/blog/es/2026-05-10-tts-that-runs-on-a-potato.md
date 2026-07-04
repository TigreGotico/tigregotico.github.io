---
title: "Modelos de TTS que Funcionan en una Patata"
description: "phoonnx es un framework de investigación para síntesis de voz basada en VITS, construido para funcionar cómodamente en hardware modesto. Sin GPU, sin nube, sin clave de API — solo una voz ONNX de ~15,65 millones de parámetros y una CPU. Aquí explicamos lo pequeña que puede ser una buena voz, y cómo las entrenamos."
date: 2026-05-10
lang: es
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "ONNX"
  - "VITS"
  - "self-hosted"
  - "OVOS"
draft: false
---

Existe un mito persistente de que una buena síntesis de voz necesita una GPU
potente, una factura abultada de la nube y una clave de API con tu tarjeta de
crédito grapada. No es así. Una voz natural y multilingüe cabe en algo que te
daría vergüenza llamar servidor — el tipo de placa que guardas en un cajón "por si
acaso". Una patata.

[**phoonnx**](https://github.com/TigreGotico/phoonnx) es nuestro framework de
investigación para exactamente ese objetivo: voces pequeñas basadas en VITS que
funcionan **totalmente sin conexión, en CPU, en hardware barato**, y que además
podemos *entrenar nosotros mismos* desde cero.

## ¿Cómo de pequeño es pequeño?

Pongamos un número real en lugar de generalidades. Cogimos una voz phoonnx de
producción — la voz en euskera "Miro"
(`OpenVoiceOS/phoonnx_eu-ES_miro_espeak`) — directamente de Hugging Face y contamos
los pesos del grafo ONNX:

```python
import onnx, numpy as np
m = onnx.load("miro_eu-ES.onnx")
print(sum(int(np.prod(i.dims)) for i in m.graph.initializer))
# 15650459
```

**~15,65 millones de parámetros.** Esa es la voz completa — codificador,
descodificador, todo — en un archivo de 63 MB. La voz femenina "Dii" de la misma
publicación cuenta *exactamente el mismo* número, porque comparten la arquitectura
VITS estándar de phoonnx; la personalidad reside en los pesos, no en capacidad
adicional.

Para poner las cosas en perspectiva: una sola capa de un modelo de lenguaje
"pequeño" moderno puede contener más parámetros que todo este sintetizador de voz.
Quince millones y medio equivale aproximadamente al peso de una instantánea de
móvil, y habla con fluidez.

## Por qué VITS, y por qué ONNX

[VITS](https://arxiv.org/abs/2106.06103) es la columna vertebral de toda voz
phoonnx. Es una arquitectura de extremo a extremo — entra texto (bueno, fonemas) y
sale forma de onda — sin un vocoder aparte al que atender y sin un bucle
autorregresivo que avanza muestra a muestra. Ese diseño de extremo a extremo es
precisamente lo que lo hace viable en una patata: una pasada hacia adelante,
síntesis paralela, listo.

No llevamos PyTorch al borde de la red. Las voces entrenadas se exportan a **ONNX**
y se ejecutan a través de [`onnxruntime`](https://onnxruntime.ai/) en la **CPU** —
sin CUDA, sin GPU, sin ruleta de controladores. `onnxruntime` es un motor C++
compacto y portátil, y un grafo de 15 millones de parámetros está muy dentro de lo
que un núcleo de clase Raspberry Pi procesa más rápido que en tiempo real. El
resultado es un asistente de voz que sigue hablando cuando tu internet se cae,
cuando el proveedor de la nube tiene una interrupción, o cuando simplemente nunca
quisiste que el audio de tu hogar saliera de casa. **La soberanía de los datos aquí
no es un interruptor de función; es la arquitectura.**

## Los fonemas son donde se esconde la inteligencia

Un modelo acústico diminuto puede permitirse ser diminuto porque phoonnx hace el
trabajo lingüístico difícil *por adelantado*, en el fonemizador. Un fonemizador
(grafema a fonema, o G2P) convierte el texto escrito en la secuencia de unidades de
sonido que el modelo realmente pronuncia — de modo que la red VITS nunca tiene que
aprender ortografía, solo sonido.

Nuestro trabajo con fonemas se basa en **[grafema a IPA para más de 350 lenguas](/es/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** y en **[fonética clásica del portugués](/es/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, que hacen posible entrenar voces para lenguas con pocos recursos sin semanas de anotación experta.

phoonnx es deliberadamente agnóstico respecto al fonemizador y agrupa un pequeño
ejército de ellos: `espeak-ng`, [gruut](https://github.com/rhasspy/gruut),
[epitran](https://github.com/dmort27/epitran),
[misaki](https://github.com/hexgrad/misaki),
[transphone](https://github.com/xinjli/transphone) (que alcanza los miles de lenguas
catalogadas en Glottolog), además de especialistas como
[mantoq](https://github.com/mush42/mantoq) para el árabe,
**[cotovia](https://github.com/TigreGotico/pycotovia)** para el gallego, OpenJTalk
para el japonés, y KoG2P para el coreano. Emiten IPA, ARPA, Pinyin, Hangul,
Buckwalter — lo que cada lengua necesite. Hay incluso un G2P multilingüe basado en
modelo construido sobre ByT5, exportado a ONNX como todo lo demás.

Descargar la ortografía en el fonemizador es el truco que permite que un modelo de
15 millones de parámetros suene bien en una lengua con pocos recursos que nunca ha
visto escrita.

## Un framework para *construir* voces, no solo ejecutarlas

Esta es la parte que más importa, y la que se suele pasar por alto: phoonnx no es
solo un conjunto de herramientas de inferencia. El framework complementario
[**`phoonnx_train`**](https://github.com/TigreGotico/phoonnx) es como *creamos* las
voces en primer lugar.

`phoonnx_train` cubre toda la canalización:

- **Preprocesamiento** de un conjunto de datos al estilo LJSpeech en datos de
  entrenamiento fonemizados.
- **Entrenamiento** del generador VITS (esos ~15,65 millones de parámetros) con un
  tiempo de GPU modesto — son modelos pequeños, así que el entrenamiento es barato y
  rápido comparado con los grandes sistemas de voz.
- **Exportación** del punto de control terminado a ONNX con un solo script, listo
  para colocarse directamente en `onnxruntime` en un dispositivo.

Como la receta es abierta y los modelos son pequeños, construir una voz totalmente
nueva para una lengua que *no* tiene ninguna opción abierta sin conexión es un
proyecto de escala de un fin de semana, no de escala de una beca de investigación.
Así es como hemos ido cubriendo huecos para lenguas desatendidas — euskera,
mirandés, portugués europeo y más — en lugar de esperar a que un proveedor decida
que una lengua es comercialmente interesante.

## Ya integrado en tu asistente

No tienes que unir nada de esto a mano. phoonnx incluye un plugin nativo de
OpenVoiceOS, `ovos-tts-plugin-phoonnx`, que obtiene y carga las voces por ti:

```json
"tts": {
  "module": "ovos-tts-plugin-phoonnx",
  "ovos-tts-plugin-phoonnx": {
    "voice": "OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone"
  }
}
```

Omite `voice` y elegirá el primer modelo que coincida con tu lengua. Para gestionar
voces fuera de un asistente hay una CLI, `phoonnx-voices`, para listar lenguas,
explorar voces y predescargar modelos:

```bash
phoonnx-voices list-voices --lang pt-PT
phoonnx-voices download OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone
```

Y como phoonnx habla VITS sobre ONNX puro, su motor de inferencia también ejecuta
voces entrenadas por Piper, Mimic3, Coqui y MMS — **más de mil lenguas y voces** en
total. Un runtime pequeño, un catálogo enorme, y nada de ello llamando a casa.

## La cuestión

La tecnología de voz que te respeta tiene que funcionar *donde tú estás* — en tu
hardware, bajo tu control, con el cable de red desenchufado si quieres. phoonnx es
nuestra apuesta de que la manera de llegar ahí no son modelos más grandes, sino la
arquitectura correcta hecha pequeña: VITS para la columna vertebral, fonemizadores
ingeniosos para llevar la carga lingüística, ONNX para la portabilidad, y un
framework de entrenamiento abierto para que cualquiera pueda hacer crecer el
catálogo.

Quince millones y medio de parámetros. Sin GPU. Sin nube. Sin excusas. Si funciona
en una patata, funciona en todas partes.
