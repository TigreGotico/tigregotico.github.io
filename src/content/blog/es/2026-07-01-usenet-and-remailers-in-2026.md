---
title: "Usenet y Remailers en 2026: una cápsula del tiempo intacta y una red de privacidad que se niega a morir"
description: "Usenet es un archivo prístino del discurso humano previo a la IA — datos de entrenamiento libres de LLM procedentes de décadas de historia de internet. Pero no es solo arqueología: la red de remailers cypherpunk sigue funcionando en 2026, ofreciendo mensajería anónima real. Construimos dos pequeñas herramientas para mostrarte ambas."
date: 2026-07-01
lang: es
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

La mayoría de los corpus de la web abierta están contaminados — el texto generado por LLM se ha filtrado en Reddit, Stack Overflow, GitHub, blogs. Usenet es diferente: décadas de guerras de mensajes, preguntas y respuestas técnicas y discusiones en grupos de noticias, todo escrito por humanos, nada de ello tocado por modelos de lenguaje. Y mientras indagaba en ello, encontré algo más que sigue en marcha: **la red de remailers cypherpunk sigue operando en 2026**, mantenida por un pequeño grupo de entusiastas de la criptografía que nunca lo dejaron.

Construimos dos pequeñas herramientas en Python para ambas.

-----

## La Cápsula del Tiempo: Usenet como Corpus Previo a la IA

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

## Los Cypherpunks Nunca se Fueron

La red de remailers sigue funcionando.

**Los remailers de Tipo I** (remailers Cypherpunk): envían un mensaje envuelto en cifrado PGP anidado — cada salto descifra una capa y la reenvía a la siguiente. Desde fuera, el mensaje parece provenir del remailer, no de ti. Para cuando llega al salto final, el remitente original se ha perdido.

**Los remailers de Tipo II** (Mixmaster): añaden relleno aleatorio, eliminan cabeceras, retienen los mensajes antes de reenviarlos y los encadenan a través de varios remailers simultáneamente. Mucho más difíciles de rastrear.

Ambos siguen funcionando. Hay **aproximadamente media docena de remailers activos** en 2026. La red de pingers publica estadísticas diarias en `alt.privacy.anon-server.stats`, igual que ha hecho durante décadas. A fecha de mayo de 2026:

- **frannie** (mix@franxial.com) — 100% de disponibilidad
- **frell** (godot@remailer.frell.eu.org) — 100% de disponibilidad
- **yeahno** (mix@yeahno.net) — 100% de disponibilidad
- **dizum** (remailer@dizum.com) — ~99% de disponibilidad
- **paranoia** (mixmaster@remailer.paranoici.org) — ~92% de disponibilidad

La biblioteca **remailers** descubre la red activa analizando esas publicaciones diarias de estadísticas:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## Usándolas Hoy

### Leer Usenet Sin Cuenta

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

### Publicar de Forma Anónima

La mayoría de los servidores requieren una cuenta gratuita para publicar. **paganini.bofh.team** y **news.tcpreset.net** aceptan publicaciones anónimas, incluso en `alt.anonymous.messages` — el buzón tradicional para destinatarios anónimos.

### Enviar un Mensaje Anónimo a través de la Cadena de Remailers

Los remailers siguen usando **claves PGP DSA + ElGamal** de los años 90 — criptografía antigua a la que las bibliotecas modernas de PGP en Python no pueden cifrar. Recurrimos a **GnuPG** (el código antiguo es imprescindible):

```python
from remailers.network import fetch_live_remailers, fetch_keyring_blob
from remailers.gpg import GPGKeyring
from remailers.cypherpunk import build_chain

remailers = fetch_live_remailers()

# the published keyring is full of DSA/ElGamal keys -> use the GnuPG backend
with GPGKeyring(fetch_keyring_blob()) as gpg:
    have = set(gpg.recipients())
    chain = [r for r in remailers
             if r.is_cpunk and r.accepts_pgp and r.address in have][:3]

    # nest a PGP layer per hop; the exit posts to a newsgroup
    message, entry = build_chain(
        hops=[(r.address, r.address) for r in chain],
        anon_post_to="alt.anonymous.messages",
        body="Hello from the shadows",
        encrypt=gpg.encrypt,
    )

# `message` goes to `entry` over SMTP (remailers.cypherpunk.send_chain) —
# the one piece you bring yourself: an email sender.
```

### Encontrar Respuestas: Asuntos con Hash

Si esperas una respuesta en `alt.anonymous.messages`, no querrás que el asunto revele el contenido. El protocolo de remailers soporta **hSub**: el destinatario aplica un hash al asunto original con SHA-256 y publica la respuesta con el hash como asunto. Solo alguien que conozca el asunto original puede identificarlo en el torrente de mensajes.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

Para mayor privacidad, algunos mensajes usan **eSub** — asuntos cifrados que solo el destinatario puede descifrar.

-----

## Por Qué Esto Todavía Importa

La red de remailers es lenta y está diseñada para otra época. Pero es **descentralizada, sin dueño e imposible de clausurar** — no hay ninguna empresa a la que citar judicialmente, ningún servicio que descontinuar. El mismo diseño cypherpunk que funcionaba en 1995 sigue funcionando.

Usenet es el premio más raro: un archivo con procedencia limpia de texto escrito por humanos a escala. Ya sea que estés entrenando modelos, construyendo conjuntos de datos o estudiando el discurso real de internet, Usenet está ahí — limpio, incorrupto, libre.

**Repositorios:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Recolecta Usenet en conjuntos de datos de entrenamiento; lee públicamente sin cuenta.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — Encuentra remailers activos, construye cadenas anónimas, envía a través de Cypherpunk Tipo I.
