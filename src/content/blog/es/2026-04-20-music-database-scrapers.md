---
title: "Presentamos nuestros scrapers de bases de datos de música"
description: "Un recorrido por la familia de clientes Python tipados que mantenemos para fuentes de música — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio y las grandes enciclopedias musicales — todos emitiendo metadatos de medios consistentes y tipados tras una única interfaz limpia y circulando sobre el mismo transporte anti-bot resiliente."
date: 2026-04-20
lang: es
author: "Casimiro Ferreira"
tags:
  - "Scrapers"
  - "Media Metadata"
  - "Music"
  - "Python"
  - "FOSS"
draft: false
---

## Una interfaz para toda la web musical

La web de la música está gloriosamente fragmentada. Bandcamp te vende un FLAC y una licencia Creative Commons; SoundCloud transmite un remix que nadie más aloja; SomaFM mantiene un querido conjunto de canales de radio financiados por los oyentes; y un rincón silencioso de internet conserva enciclopedias minuciosamente curadas de rock progresivo, jazz, clásica y metal. Cada sitio tiene su propio marcado, sus propias manías, su propia idea de qué es siquiera una «pista».

Mantenemos una familia de clientes Python pequeños, enfocados y de código abierto que doman ese caos. Todos hacen, en esencia, lo mismo: acceden a una fuente de música y te devuelven **modelos de metadatos de medios tipados** — objetos validados en lugar de diccionarios frágiles — para que el resto de tu código nunca tenga que preocuparse de qué sitio proceden los datos. Instala uno, instala los nueve; hablan el mismo vocabulario.

Este es el recorrido.

## Streaming y radio

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** hace scraping de Bandcamp: busca pistas, álbumes, artistas y sellos; navega por etiqueta de género; obtiene recomendaciones y artistas relacionados a partir de una semilla; y extrae una URL de MP3 reproducible. Las búsquedas devuelven objetos `Release` tipados que llevan título, portada, géneros, créditos y — algo crucial para los mentalizados con el FOSS — un campo de licencia al estilo SPDX con una comprobación `is_open()` para que puedas distinguir un lanzamiento Creative Commons de uno con todos los derechos reservados. Una conversión de álbum de fidelidad total rellena la lista de pistas ordenada bajo demanda.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** es nuestro cliente de SoundCloud, y es la navaja suiza del grupo. Tres backends independientes — un backend de API rico en metadatos, un scraper de HTML sin dependencias y un backend yt-dlp — se asientan tras un orquestador que retrocede con elegancia de uno al siguiente. Busca pistas y personas, resuelve URLs de stream directas (progresivas o HLS), descarga pistas y listas de reproducción enteras, e incluso incluye una aplicación de terminal, `nds`, para buscar y reproducir desde la línea de comandos. Los lanzamientos vuelven con códec, tasa de bits, géneros, país, licencia SPDX y listas de pistas completas de los sets.

**[radiosoma](https://github.com/TigreGotico/radiosoma)** envuelve la API pública de canales de SomaFM. SomaFM es el extremo amable y de API abierta del espectro, y el cliente lo modela de forma limpia: cada canal es una obra, y **cada codificación de stream** — AAC a 130 kbps, MP3 a 256 kbps, HE-AAC a 64 y 32 kbps — se convierte en su propio `Release` de ese canal, para que un consumidor pueda elegir el mejor ajuste y desduplicar por identidad. El feed de pistas recientes aparece como un horario ordenado de lo que ha estado sonando.

**[tunein](https://github.com/TigreGotico/tunein)** es un cliente TuneIn no oficial para las emisoras de radio lineal e IPTV del mundo. Un camino rápido devuelve solo la carga útil de la búsqueda; una llamada de enriquecimiento opcional rellena género, idioma, país, indicativo y eslogan. Como TuneIn devuelve múltiples URLs de stream por emisora — distintas tasas de bits, réplicas y protocolos — cada una se convierte en su propio `Release`, dejando de nuevo que el consumidor elija en el momento de la reproducción. Una pequeña CLI te da salida en tabla o JSON.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** habla con la API pública de iHeartRadio — sin clave, sin cuenta. Busca emisoras, podcasts, artistas, pistas y listas de reproducción; obtiene episodios de podcast con URLs de stream de audio directas; y se apoya en obtenciones de detalles en paralelo para que las búsquedas de emisora y artista se ejecuten de forma concurrente. Cada modelo ofrece los auxiliares `to_external_ids()` y `to_signals()` para encajar directamente en una pipeline de metadatos tipada.

## Enciclopedias y archivos de música

La segunda mitad de la familia apunta a los grandes catálogos comunitarios — los sitios donde los humanos han pasado años valorando discografías y discutiendo sobre subgéneros.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)** (Jazz Music Archives) y **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)** (Classical Archives) comparten una forma casi idéntica: navegar el índice A–Z, buscar por nombre y obtener una página completa de artista o compositor con biografía, país y una discografía valorada por los miembros. Prog y Jazz Archives hacen scraping de HTML; Classical Archives envuelve una API JSON pública y expone los álbumes de un compositor *y* un árbol de obras aplanado recursivamente. Cada modelo lleva el id canónico estable del sitio vía `to_external_ids_dict()`, que es exactamente lo que necesitas para cruzar un catálogo con otro.

**[pymetal](https://github.com/TigreGotico/pymetal)** es nuestro cliente para la Encyclopaedia Metallum, los Metal Archives — y el más ambicioso del conjunto. La mayoría de los scrapers aplana una pista a `(id, title, band, album)`. pymetal se niega a perder lo que Metal Archives mantiene separado: una pista puede acreditar a **varias bandas** (splits, colaboraciones), la **formación de una banda está segmentada a lo largo del tiempo** y una pista puede **aparecer en muchos lanzamientos** (recopilatorios, reediciones, sencillos). Modela cada uno como una entidad de primera clase indexada por el id del archivo, para que los re-scrapes sean idempotentes. La superficie de endpoints es amplia — búsqueda avanzada de banda/álbum/canción, páginas completas de lanzamiento con atribución por banda en los splits, formaciones particionadas por estado con rangos de fechas de función, reseñas, recomendaciones, enlaces externos y letras — todo como modelos Pydantic v2 que hacen round-trip a través de JSON.

Más allá de la música, **[tutubo](https://github.com/TigreGotico/tutubo)** hace scraping de YouTube y YouTube Music, y **[pymal](https://github.com/TigreGotico/pymal)** cubre MyAnimeList — extendiendo los mismos patrones de metadatos tipados a categorías de medios más amplias. Todos emiten el mismo vocabulario para que un único consumidor aguas abajo lo maneje todo de forma uniforme.

## Construidos para sobrevivir a la web moderna

Un scraper que se rompe la primera vez que un sitio levanta un muro de bots no vale nada. En toda la familia la capa HTTP es **enchufable**, y donde los sitios están activamente defendidos contra bots los clientes recurren por defecto a un transporte que se hace pasar por un navegador — `curl_cffi` coincidiendo con las huellas TLS/JA3 reales de Chrome — para superar retos que rechazan el `requests` corriente. Las enciclopedias tras Cloudflare pueden además enrutar a través de una instancia FlareSolverr para datos en directo, o leer desde la Wayback Machine del Internet Archive cuando solo necesitas *algo*. La capa de parsing es deliberadamente independiente de cómo llega el HTML, así que el mismo código funciona sea cual sea el transporte que elijas.

## Un catálogo de música multifuente

La verdadera recompensa es lo que ocurre cuando dejas de pensar en esto como nueve herramientas separadas. Como todos emiten el mismo vocabulario de metadatos tipado y todos exponen ids externos canónicos, puedes desplegar un único artista por Bandcamp, SoundCloud, los directorios de radio y las enciclopedias, y luego plegar los resultados en un catálogo coherente — desduplicado por identidad, consciente de las licencias y listo para alimentar un motor de recomendación, un servidor de medios o un dataset de investigación.

Cada uno de estos clientes es software libre, autoalojable, y se ejecuta en tu propio hardware sin claves de API que haya que suplicar. Elige la fuente que te interese, haz `pip install` y empieza a construir.

Todos los scrapers circulan sobre nuestras **[capas de transporte anti-bot](/es/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**. Los clientes de streaming y radio emiten el esquema **[mediavocab](https://github.com/TigreGotico/mediavocab)** directamente, y cada cliente expone ids externos canónicos, para que los metadatos de música se integren con **[media-archivist](https://github.com/TigreGotico/media-archivist)**, nuestro indexador multifuente y servidor de metadatos desduplicador.
