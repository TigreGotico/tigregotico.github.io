---
title: "Usenet en 2026: un corpus de texto limpio y previo a la IA para entrenamiento y evaluación"
description: "Usenet es un archivo prístino del discurso humano previo a la IA — décadas de publicaciones en grupos de noticias, todas escritas por humanos, ninguna tocada por modelos de lenguaje. Eso lo convierte en datos valiosos de entrenamiento y evaluación para modelos de lenguaje y de voz. Construimos una pequeña herramienta en Python para recolectarlo."
date: 2026-07-01
lang: es
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

La mayoría de los corpus de texto de la web abierta están contaminados: el texto generado por LLM se ha filtrado en Reddit, Stack Overflow, GitHub y blogs, así que un modelo entrenado con ellos está aprendiendo en parte de otros modelos. Usenet es diferente. Son décadas de guerras de mensajes, preguntas y respuestas técnicas y discusiones en grupos de noticias, todo escrito por humanos, anterior por completo a los modelos de lenguaje actuales. Para cualquiera que entrene o evalúe modelos de lenguaje y de voz, un archivo amplio de texto escrito por humanos con procedencia limpia es exactamente el tipo de dato cada vez más difícil de encontrar.

-----

## Usenet como corpus previo a la IA

Usenet recibe miles de publicaciones al día a lo largo de cientos de grupos activos. Retrocede en el archivo hasta los años 80 y tendrás **millones de artículos** — cada uno una señal de lo que a los humanos realmente les importaba, sobre lo que discutían, lo que querían saber — con una procedencia lo bastante limpia como para citarla.

Construimos una herramienta llamada **usenet** que hace que recolectar esto sea sencillo:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

La mayoría de los servidores públicos ya no soportan `NEWNEWS` (consulta por fecha), por lo que **la navegación por grupos es el enfoque estándar.** Extraes un grupo cada vez — no es una barrera, es solo la realidad del protocolo.

Para convertir un grupo de noticias en un conjunto de datos de entrenamiento, `dataset.py` recolecta artículos en JSONL:

```
{
  "group": "comp.lang.python",
  "message_id": "<12345@example.com>",
  "subject": "Best practices for list comprehensions",
  "author": "Alice",
  "date": "1999-03-15T10:22:00Z",
  "language": "en",
  "text": "In my experience, list comprehensions are most readable when...",
}
```

Un artículo por línea. Sube unos cuantos miles de ellos a Hugging Face y tendrás un **conjunto de datos disponible públicamente, escrito por humanos y con procedencia limpia** que puedes citar y republicar.

Repositorio: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Leer Usenet sin cuenta

La mayoría de los servidores públicos de noticias permiten leer sin registrarse:

```python
from usenet import UsenetServer

servers = [
    "news.neodome.net",
    "news.samoylyk.net",
    "freenews.netfront.net"
]

for server in servers:
    try:
        with UsenetServer(server) as s:
            articles = s.get_articles("alt.test", limit=5)
            print(f"Success on {server}: {len(articles)} articles")
            break
    except OSError:
        continue
```

-----

## Por qué esto importa

Usenet es un archivo con procedencia limpia de texto escrito por humanos a escala, anterior a la era del contenido generado por máquinas. Ya sea que estés entrenando modelos, construyendo conjuntos de datos o estudiando el discurso de internet antes de que se diluyera con texto generado por IA, ese archivo sigue ahí y sigue creciendo.

**Repositorio:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — recolecta Usenet en conjuntos de datos de entrenamiento; lee públicamente sin cuenta.
