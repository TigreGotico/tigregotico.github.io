---
title: "Vencer los muros anti-bot con sesiones requests componibles y directas"
description: "Cómo mantenemos un acceso resiliente a datos públicos sin arrancar un navegador headless en la ruta caliente: suplantación de huella TLS, un proxy FlareSolverr para los desafíos JS, un respaldo a Wayback Machine, y rotación de IP — todo tras dos subclases componibles de requests.Session, unblock_requests y anon_requests."
date: 2026-03-15
lang: es
author: "Casimiro Ferreira"
tags:
  - "HTTP"
  - "Scraping"
  - "Cloudflare"
  - "Anti-Bot"
  - "Python"
  - "Open Source"
draft: false
---

Buena parte de nuestro trabajo — clientes de metadatos multimedia,
enriquecimiento de catálogos, archivado — depende de leer páginas web
**públicas** de forma fiable. El problema rara vez son los datos; es el muro que
hay delante de ellos. Y el muro plantea dos preguntas separadas:

- **"¿Qué eres?"** — Cloudflare y compañía bloquean las peticiones no por *qué*
  pides sino por *cómo* te ves en el cable: tu handshake TLS, tu huella JA3, si
  puedes ejecutar un desafío de JavaScript.
- **"¿Quién eres?"** — la reputación de IP y los límites de tasa ignoran tu
  huella por completo; cuentan cuántas peticiones vienen de una sola dirección.

Las dos preguntas son ortogonales, así que las respondemos con dos pequeñas
bibliotecas que se apilan de forma limpia: **unblock_requests** responde a *qué
eres*, **anon_requests** responde a *quién eres*. Ambas son sustitutas directas
de una sesión `requests` en el código de cada día. Esta entrada trata
específicamente de esa capa de transporte — la parte de los bytes en el cable —
no del análisis ni de la pipeline que se asienta encima.

## La restricción de diseño: mantener la forma de `requests`

Las sesiones de `unblock_requests` heredan de `requests.Session` y solo
sobrescriben `request()` — todo lo demás (`.get()`, `.post()`, cookies,
cabeceras, semántica de gestor de contexto) se hereda, así que cualquier cosa
tipada contra `requests.Session` las acepta sin cambios. Las sesiones de
`anon_requests` envuelven en lugar de heredar — exponen los mismos métodos verbo
y la misma interfaz de gestor de contexto, pero reconstruyen su sesión interna
en cada rotación:

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

Esa es toda la postura ética y de ingeniería en una línea: no estamos
automatizando un navegador-como-usuario, estamos haciendo un *cliente HTTP
resiliente* para datos que ya son públicos. Ningún navegador con ventana salta
en la pantalla de nadie, y nada en la ruta caliente necesita una pantalla.

## Capa uno: `unblock_requests` y sus transportes

`unblock_requests` defiende contra la **detección de bots**. Eliges un
transporte con el kwarg `mode=` (o la variable de entorno
`UNBLOCK_REQUESTS_TRANSPORT` — los kwargs explícitos siempre ganan). Los cuatro
principales:

| Modo | Qué hace |
|---|---|
| `curl_cffi` *(por defecto)* | Suplantación de TLS/JA3 de Chrome mediante `curl_cffi`. Supera la verificación de bots en la mayoría de las redes sin infraestructura adicional. |
| `requests` | `requests` plano, sin suplantación. |
| `flaresolverr` | Hace de proxy a través de un navegador headless FlareSolverr que resuelve el desafío JS — datos **en vivo**. |
| `wayback` | Lee la última instantánea del Internet Archive — obsoleta, pero no necesita nada. |

El valor por defecto, `curl_cffi`, es la victoria barata. La mayoría de los
veredictos de "eres un bot" son un desajuste de huella TLS: `requests` de fábrica
(vía OpenSSL) hace un handshake en nada parecido a Chrome. `curl_cffi` suplanta
una compilación real de Chrome (`impersonate="chrome"` por defecto), así que el
handshake y el JA3 encajan y la verificación simplemente pasa. Ningún JavaScript
ejecutado, ningún navegador lanzado.

Cuando un sitio escala a un desafío JS interactivo de verdad, `curl_cffi` no
basta — algo tiene que ejecutar el desafío. Ese es el modo `flaresolverr`: una
instancia de [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) que tú
autoalojas hace la resolución en un navegador headless **fuera de tu proceso**, y
`unblock_requests` simplemente le hace un POST y extrae el HTML resuelto de la
respuesta. Establecer `flaresolverr_url` selecciona este modo automáticamente:

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## Degradación elegante hacia el archivo

La infraestructura tiene días malos — FlareSolverr está caído, el sitio es
inalcanzable, el desafío es irresoluble ahora mismo. En lugar de hacer fracasar
todo el trabajo, la sesión puede recurrir a **Wayback Machine**. La detección de
desafíos es heurística: un pequeño ayudante `is_challenge()` husmea la primera
parte del cuerpo en busca de los marcadores reveladores de un interstitial de
Cloudflare ("just a moment", `challenge-platform`, `cf_chl_opt`,
`cf-mitigated`). En un GET bloqueado, si `wayback_fallback` está activado, la
sesión resuelve la última instantánea mediante la API de disponibilidad de
`archive.org` y devuelve sus bytes en bruto (la forma en bruto `…id_/`, sin barra
de herramientas ni reescritura de enlaces). archive.org no está protegido por
Cloudflare, así que `requests` plano lo alcanza.

Dos notas de implementación que conviene conocer: en los modos `wayback` y
`flaresolverr` el resultado es una `requests.Response` *sintetizada* pero
genuina, construida a partir del HTML obtenido — así que `stream=`, los
adaptadores personalizados y el pooling de conexiones no aplican ahí, mientras
que los modos `requests`/`curl_cffi` son totalmente nativos. Y el respaldo solo
se dispara para los GET; nunca reproducimos en silencio una petición mutante
desde un archivo.

## Capa dos: `anon_requests` y la rotación de IP

El problema ortogonal es la **reputación de IP**. Incluso una huella perfecta
acaba con límite de tasa o baneada si cada petición viene de una sola dirección.
`anon_requests` lo gestiona con `RotatingProxySession` (proxies públicos
extraídos, validación opcional, SOCKS5/HTTP) y `RotatingTorSession` (circuitos
Tor rotatorios). Cada petición sale por un exit fresco, y los proxies muertos se
apartan de la rotación al fallar la conexión.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## La composición: rotación **y** bypass a la vez

Estas dos bibliotecas están diseñadas para apilarse en vez de solaparse. Las
sesiones de `anon_requests` aceptan un `session_factory` — cualquier callable que
devuelva una `requests.Session`, con `requests.Session` por defecto. Los ajustes
de rotación y proxy se aplican a lo que sea que devuelva esa factory. Así que
inyectas una `CloudflareSession` como factory y obtienes ambos comportamientos de
un solo objeto:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates the IP *and* solves Cloudflare
```

El proxy rotado fluye a través de *cada* transporte — incluido dentro de
FlareSolverr, que conduce su navegador headless mediante el campo `proxy` de la
petición de resolución. Así que la IP que resuelve el desafío es la misma IP
rotada que usa el resto de la petición: sin una separación huella/nodo-de-salida
que un defensor pueda notar.

## Por qué esta forma

Mantener cada preocupación como su propia y fina subclase de `requests.Session`
significa que quienes llaman eligen solo lo que necesitan — la suplantación TLS
sola, la pila completa de rotación-más-resolución, o cualquier cosa intermedia —
cambiando un constructor, no reescribiendo su código HTTP. La herramienta cara y
pesada (un navegador real) se queda *fuera del proceso* en FlareSolverr y se
invoca solo cuando un desafío JS lo exige de verdad; el caso común es un
handshake suplantado barato. Y cuando la web en vivo se niega, el archivo
responde.

La costura del `session_factory` es donde ocurre la composición, y mantiene las
bibliotecas independientemente extensibles: añade un modo de transporte a
`unblock_requests` y `anon_requests` lo compone gratis. Acceso resiliente a datos
públicos, hecho con limpieza.

Ambas son FOSS y autoalojables:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) y
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

Estos transportes impulsan todos nuestros **[scrapers de bases de datos musicales](/es/blog/2026-04-20-music-database-scrapers)**. Para el reconocimiento del sitio antes de construir cualquier scraper, véase **[sitemapper](https://github.com/TigreGotico/sitemapper)** y la **[entrada sobre robots.txt y sitemaps](/es/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**.
