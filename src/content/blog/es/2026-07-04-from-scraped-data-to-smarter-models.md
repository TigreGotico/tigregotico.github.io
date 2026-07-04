---
title: "Por Qué Acumulamos Datos: De Catálogos Extraídos a Modelos de Voz y Lenguaje Más Inteligentes"
description: "Datos limpios, tipados y con procedencia clara son la materia prima de todos los modelos que publicamos. Cómo los catálogos que construyen nuestros scrapers se convierten en vocabularios de sesgo para ASR, clasificadores de intención, corpus sintéticos de NER, léxicos G2P, voces TTS — y combustible honesto para LLM."
date: 2026-07-04
lang: es
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Data Collection"
  - "ASR"
  - "NLP"
  - "TTS"
  - "LLM"
  - "FOSS"
draft: false
---

Escribimos mucho sobre *cómo* extraemos datos — el
**[instrumental de reconocimiento](/es/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**,
los **[transportes anti-bot](/es/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**,
los **[clientes tipados de metadatos musicales](/es/blog/2026-04-20-music-database-scrapers)**.
Una pregunta justa es *por qué*. Somos una empresa de IA de voz; ¿qué hacemos
manteniendo scrapers de enciclopedias musicales y directorios de radio?

La respuesta es que **los datos están aguas arriba de todo lo que publicamos**. Un
asistente de voz es tan bueno como las palabras que espera oír, las entidades que
puede reconocer y las pronunciaciones que conoce. Nada de eso viene de diagramas
de arquitectura. Viene de datos — y los datos interesantes rara vez están en un
dataset ya preparado. Están repartidos por la web pública, en catálogos que los
humanos pasaron décadas curando.

Esto es lo que le ocurre a esos datos después de recogerlos.

## Entidades: el vocabulario del que vive un asistente de voz

Di "pon Sultans of Swing de Dire Straits" a un asistente. Antes de que cualquier
modelo pueda actuar sobre eso, algo tiene que saber que *Sultans of Swing* es una
canción y *Dire Straits* es un artista. Multiplica por cada artista, álbum,
emisora, pódcast y género que un usuario pueda nombrar, y tienes el verdadero
vocabulario de un asistente de medios — cientos de miles de entidades con nombre,
ninguna de las cuales aparece en un corpus estándar de entrenamiento de NLP.

Nuestros clientes de medios emiten exactamente esto: registros tipados con
identificadores canónicos, normalizados según el esquema
**[mediavocab](https://github.com/TigreGotico/mediavocab)**.
Esos catálogos de entidades alimentan directamente:

- **Coincidencia de intención basada en palabras clave** — las listas de entidades
  se convierten en los gazetteers que anclan las consultas de medios en OpenVoiceOS.
- **Clasificadores de intención** — nuestros datasets de intención de medios combinan
  entidades reales extraídas con síntesis de frases mediante plantillas y asistida por
  LLM, produciendo enunciados como los que hacen los usuarios reales, poblados con
  entidades que realmente existen. Los modelos entrenados así resuelven la decisión
  de "¿es esto una petición de reproducción, y de qué?" en el pipeline de medios de
  OpenVoiceOS.
- **Corpus sintéticos de NER** — la misma receta se generaliza: toma un catálogo de
  entidades reales, genera frases naturales en torno a ellas, y tienes un dataset de
  entidades con nombre etiquetado para un dominio que ningún corpus académico cubre.
  Las entidades son reales, así que la distribución es honesta; las frases son
  sintéticas, así que el volumen es el que necesites.

## Sesgar el reconocimiento de voz hacia las palabras que importan

El ASR de propósito general se entrena con habla general, así que transcribe *Dire
Straits* como "dire straights" y destroza cualquier nombre de aldea portuguesa. La
solución no es reentrenar desde cero — es el **sesgo (biasing)**: dar al reconocedor
el vocabulario de tu dominio.

Los catálogos extraídos son ese vocabulario. En concreto:

- **Sesgo de modelo de lenguaje** — los LM de n-gramas o de fusión superficial
  entrenados con texto rico en entidades empujan al decodificador hacia palabras del
  dominio. El LM de un asistente de medios debería entrenarse con *títulos de canciones
  y nombres de artistas*, y el nuestro puede serlo, porque los tenemos — tipados,
  deduplicados, con procedencia limpia.
- **Reconocimiento condicionado por prompt** — las arquitecturas más recientes aceptan
  un prompt de texto o una lista de contexto en tiempo de inferencia. Alimentar la
  biblioteca real del usuario — las entidades que extrajeron nuestros clientes — al
  contexto del reconocedor convierte un "nombre propio irreconocible" en un "elemento
  de vocabulario conocido".
- **Datos de fine-tuning** — cuando el sesgo no basta, los catálogos de entidades más
  nuestras [voces TTS](/es/blog/2026-05-10-tts-that-runs-on-a-potato) generan habla
  sintética para las frases exactas que un despliegue no puede permitirse fallar.
  Este es el [servicio de construcción de datasets](/es/services) que ofrecemos
  comercialmente, y está construido sobre el mismo pipeline abierto.

## Pronunciación: de diccionarios rastreados a G2P y TTS

Algunos de nuestros rastreos más valiosos no son catálogos de entidades sino
**léxicos**. Rastrear el diccionario Infopédia produjo
[infopedia-pt-ipa](https://huggingface.co/datasets/TigreGotico/infopedia-pt-ipa),
más de 100.000 pares palabra→IPA de portugués europeo. Ese dataset:

- evalúa y ajusta nuestro
  [stack G2P de portugués](/es/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes) basado en reglas,
- ancla la pronunciación de las [voces TTS](/es/blog/2026-06-15-two-voices-every-language-miro-and-dii)
  para que pronuncien las palabras como lo hacen realmente los hablantes,
- y siembra recursos etiquetados por significado como nuestro
  [trabajo sobre heterófonos portugueses](https://github.com/TigreGotico/bifonia), donde
  la misma grafía se corresponde con sonidos distintos según el sentido.

Los datos de grafía a sonido son el rincón menos glamuroso de la tecnología del habla
y el que más decide si una voz suena nativa. Nadie te entrega estos datos. Los
rastreas, los limpias y los publicas — para que el siguiente equipo no tenga que
hacerlo.

## Combustible honesto para los LLM

Todo lo anterior se aplica también a los grandes modelos de lenguaje, con un matiz
adicional: **la procedencia importa ahora más que el volumen**. La web abierta está
cada vez más contaminada con texto generado por modelos; entrenar o evaluar sobre ella
recicla silenciosamente las salidas del modelo de ayer. Por eso nos importan las
fuentes con procedencia humana limpia — décadas de
[archivos de Usenet](/es/blog/2026-07-01-usenet-and-remailers-in-2026), enciclopedias
curadas, diccionarios oficiales — y por eso cada dataset que publicamos indica de
dónde vino cada registro.

Los catálogos estructurados también alimentan a los LLM en tiempo de *inferencia*: un
almacén de entidades tipado y deduplicado es exactamente lo que una capa de
recuperación o la API de herramientas de un agente quiere para anclar sus respuestas.
Las APIs limpias sobre fuentes desordenadas no son solo una comodidad de scraping —
son la forma de mantener un modelo de lenguaje adherido a los hechos.

## El pipeline, de principio a fin

Así que el cuadro completo se ve así:

```
recon → resilient extraction → typed clients → normalised catalogues
      → gazetteers & intent data     (NLP)
      → biasing LMs & fine-tune sets (ASR)
      → lexicons & phoneme labels    (G2P / TTS)
      → provenance-clean corpora     (LLMs, retrieval)
```

Cada etapa es de código abierto, cada dataset se publica donde la licencia lo permite,
y el mismo pipeline que cubre las necesidades de nuestros propios modelos está
disponible [como un servicio](/es/services) para los tuyos. Los scrapers no son una
misión secundaria. Son la cantera de la que se construye todo el stack.
