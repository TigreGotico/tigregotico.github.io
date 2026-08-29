---
title: "Sesiones requests componibles y directas para un acceso resiliente a datos públicos"
description: "Dos subclases componibles de requests.Session para leer páginas web públicas de forma fiable sin un navegador headless en la ruta caliente: transporte compatible con TLS, un proxy FlareSolverr para los desafíos JS, un respaldo a Wayback Machine, y peticiones con IP diversificada: unblock_requests y anon_requests."
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

Buena parte de nuestro trabajo (clientes de metadatos multimedia,
enriquecimiento de catálogos, archivado) depende de leer páginas web
**públicas** de forma fiable. El problema rara vez son los datos. Es que buena
parte de la infraestructura de detección de bots está ajustada contra ataques
programados y acaba clasificando erróneamente como uno de ellos a cualquier
cliente no-navegador que se comporta bien. Eso ocurre en dos ejes separados:

- **"¿Qué eres?"** Cloudflare y compañía marcan las peticiones no por *qué*
  pides sino por *cómo* te ves en el cable: tu handshake TLS, tu huella JA3 (un
  hash de cómo se construye tu handshake TLS, que difiere entre un navegador y
  una biblioteca HTTP simple aunque ambos pidan la misma página), si
  puedes ejecutar un desafío de JavaScript. Un handshake `requests` normal no se
  parece en nada al de un navegador, así que queda atrapado por comprobaciones
  pensadas para el abuso programado aunque el tráfico en sí sea inocuo.
- **"¿Quién eres?"** La reputación de IP y los límites de tasa ignoran tu
  huella por completo. Cuentan cuántas peticiones vienen de una sola dirección,
  lo que puede penalizar a un único cliente que se comporta bien tan fácilmente
  como a uno abusivo.

Los dos ejes son ortogonales, así que los respondemos con dos pequeñas
bibliotecas que se apilan de forma limpia: **unblock_requests** responde a *qué
eres*, **anon_requests** responde a *quién eres*. Ambas son sustitutas directas
de una sesión `requests` en el código de cada día. Esta entrada trata
específicamente de esa capa de transporte, la parte de los bytes en el cable,
no del análisis ni de la pipeline que se asienta encima.

**El alcance, dicho con claridad:** estos transportes son solo para páginas
públicas y sin autenticación. Respetan `robots.txt` y cualquier crawl-delay
declarado (véase nuestra **[entrada sobre robots.txt y
sitemaps](/es/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)** para
cómo comprobamos eso antes de escribir un scraper), y todo cliente construido
sobre ellos se mantiene con volúmenes de petición bajos, de modo que un origen
objetivo nunca ve carga significativa procedente de nosotros. Eso no es un
aviso legal añadido a posteriori. Es una restricción de ingeniería real sobre
cómo se usan estas sesiones, porque un cliente resiliente que además es
desconsiderado frustra su propio propósito.

## La restricción de diseño: mantener la forma de `requests`

Las sesiones de `unblock_requests` heredan de `requests.Session` y solo
sobrescriben `request()`. Todo lo demás (`.get()`, `.post()`, cookies,
cabeceras, semántica de gestor de contexto) se hereda, así que cualquier cosa
tipada contra `requests.Session` las acepta sin cambios. Las sesiones de
`anon_requests` envuelven en lugar de heredar. Exponen los mismos métodos verbo
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

`unblock_requests` hace que un cliente Python normal sea interoperable con las
**comprobaciones de detección de bots ajustadas para navegadores**. Eliges un
transporte con el kwarg `mode=` (o la variable de entorno
`UNBLOCK_REQUESTS_TRANSPORT`; los kwargs explícitos siempre ganan). Los cuatro
principales:

| Modo | Qué hace |
|---|---|
| `curl_cffi` *(por defecto)* | Suplantación de TLS/JA3 de Chrome mediante `curl_cffi`. Pasa como un handshake con forma de navegador en la mayoría de las redes sin infraestructura adicional. |
| `requests` | `requests` plano, sin suplantación. |
| `flaresolverr` | Hace de proxy a través de un navegador headless FlareSolverr que resuelve el desafío JS: datos **en vivo**. |
| `wayback` | Lee la última instantánea del Internet Archive: obsoleta, pero no necesita nada. |

El valor por defecto, `curl_cffi`, es la victoria barata. La mayoría de los
veredictos de "eres un bot" son un desajuste de huella TLS: `requests` de fábrica
(vía OpenSSL) hace un handshake en nada parecido a Chrome. `curl_cffi` suplanta
una compilación real de Chrome (`impersonate="chrome"` por defecto), así que el
handshake y el JA3 encajan y la verificación simplemente pasa. Ningún JavaScript
ejecutado, ningún navegador lanzado.

Cuando un sitio escala a un desafío JS interactivo de verdad, `curl_cffi` no
basta. Algo tiene que ejecutar el desafío. Ese es el modo `flaresolverr`: una
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

La infraestructura tiene días malos: FlareSolverr está caído, el sitio es
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
genuina, construida a partir del HTML obtenido, así que `stream=`, los
adaptadores personalizados y el pooling de conexiones no aplican ahí, mientras
que los modos `requests`/`curl_cffi` son totalmente nativos. Y el respaldo solo
se dispara para los GET. Nunca reproducimos en silencio una petición mutante
desde un archivo.

## Capa dos: `anon_requests` y la rotación de IP

El problema ortogonal es la **reputación de IP**. Incluso un handshake con
forma de navegador perfecta puede acabar con límite de tasa si cada petición
viene de una sola dirección. Las heurísticas basadas en volumen miran la
dirección, no la huella. `anon_requests` reparte la carga entre direcciones con
`RotatingProxySession` (proxies públicos extraídos, validación opcional,
SOCKS5/HTTP) y `RotatingTorSession` (circuitos Tor rotatorios), de modo que un
cliente de bajo volumen nunca se confunde con uno que bombardea un sitio desde
una única IP. Cada petición sale por un exit fresco, y los proxies muertos se
apartan de la rotación al fallar la conexión.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## La composición: carga distribuida **y** un handshake compatible a la vez

Estas dos bibliotecas están diseñadas para apilarse en vez de solaparse. Las
sesiones de `anon_requests` aceptan un `session_factory`, cualquier callable que
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
session.get(url)   # spreads load across IPs *and* uses a browser-compatible handshake
```

El proxy rotado fluye a través de *cada* transporte, incluido dentro de
FlareSolverr, que conduce su navegador headless mediante el campo `proxy` de la
petición de resolución. Así que toda la petición (handshake, resolución del
desafío y IP de salida) se mantiene coherente de principio a fin, que es
el comportamiento correcto para un cliente que no intenta
aparentar ser más de un visitante.

## Por qué esta forma

Mantener cada preocupación como su propia y fina subclase de `requests.Session`
significa que quienes llaman eligen solo lo que necesitan (la suplantación TLS
sola, la pila completa de rotación-más-resolución, o cualquier cosa intermedia)
cambiando un constructor, no reescribiendo su código HTTP. La herramienta cara y
pesada (un navegador real) se queda *fuera del proceso* en FlareSolverr y se
invoca solo cuando un desafío JS lo exige de verdad. El caso común es un
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
