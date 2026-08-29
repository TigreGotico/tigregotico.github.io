---
title: "Robots.txt, sitemaps y scraping web ético"
description: "Antes de construir un scraper, explora el sitio. sitemapper lee robots.txt, obtiene todos los sitemaps y, opcionalmente, rastrea el grafo de enlaces, para que tu scraper parta del propio contrato del sitio en vez de la fuerza bruta."
date: 2026-03-01
lang: es
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Web Scraping"
  - "Sitemaps"
  - "Ethics"
  - "Robots.txt"
  - "Data Collection"
  - "FOSS"
draft: false
---

## Empieza por el reconocimiento, no por la fuerza bruta

Los peores scrapers rastrean a ciegas. Machacan un sitio, ignoran las
declaraciones de crawl-delay, revuelven cada ruta buscando datos, y se rompen
cuando la estructura cambia por un solo nombre de clase. Los mejores scrapers
empiezan por leer el sitio.

Todo sitio web publica un contrato en tres lugares: **robots.txt** (política de
rastreo), los **sitemaps** (lo que el propio sitio considera digno de
indexación), y el **grafo de enlaces** (cómo están realmente conectadas las
páginas). Leer esto primero responde a tres preguntas antes de que escribas una
sola línea de código de scraping:

1. **¿Es rastreable este sitio?** ¿Qué permite robots.txt, y a qué ritmo?
2. **¿Dónde están los datos?** ¿Qué exponen los sitemaps?
3. **¿Cómo está estructurado el sitio?** ¿Qué aspecto tiene la topología de enlaces?

Eso es lo que hace **[sitemapper](https://github.com/TigreGotico/sitemapper)**.

## Descubrimiento pasivo: robots.txt + sitemaps

`discover()` obtiene robots.txt y todos los sitemaps que puede encontrar,
incluidas las directivas `Sitemap:`, los índices de sitemaps que apuntan a
sub-sitemaps, y los archivos comprimidos con gzip, sin rastrear una sola
página HTML:

```python
from sitemapper import discover

info = discover("https://www.python.org")
print(info.summary())
# Base URL:       https://www.python.org
# Blocked:        False
# Sitemaps found: 1
# URLs in sitemaps: 342
# Crawl-delay:    None
# Sitemap directives in robots.txt: 1

# What pace does the site ask for?
if info.robots.crawl_delay:
    print(f"Wait {info.robots.crawl_delay}s between requests")

# May I fetch this path?
info.robots.is_allowed("/api/users")            # True / False
info.robots.is_allowed("/admin", user_agent="MyBot/1.0")

# Every deduplicated URL the site's own sitemaps declare
for url in info.urls:
    print(url.loc, url.lastmod, url.changefreq, url.priority)
```

El detalle por agente está ahí cuando lo necesitas: `info.robots.groups`
contiene cada bloque `User-agent` con sus `allows`, `disallows` y `crawl_delay`,
en orden de documento. Si un sitio no tiene robots.txt en absoluto,
`is_allowed()` devuelve `True` para todo. La ausencia de una política es en sí
misma la política.

El scraping que empieza por el sitemap rinde porque evitas descubrir URL
rastreando (lento, ruidoso, incompleto) y partes de la propia lista de los
responsables. Rastreas lo que el sitio declara importante, al ritmo que declara
aceptable, con una fracción de las peticiones.

## Descubrimiento activo: el grafo de enlaces

Algunos sitios no publican ningún sitemap. Para esos, `crawl()` ejecuta un
rastreo acotado en anchura desde la URL base y devuelve un `LinkGraph` de
páginas internas y enlaces salientes:

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

Esto te indica la topología real, qué páginas enlazan con qué, para que puedas
decidir si el sitio merece un scraper estructurado siquiera. El descubrimiento y
el rastreo son deliberadamente llamadas separadas: el paso pasivo nunca obtiene
HTML, así que siempre puedes explorar con educación antes de decidir rastrear.

## Construido sobre el mismo transporte resiliente

El reconocimiento del sitio no sirve de nada si el propio reconocimiento acaba
tras un muro anti-bot. Todo el HTTP de sitemapper pasa por
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests), el
transporte que suplanta el TLS (imita la huella TLS de un navegador real) de nuestra
**[entrada sobre transporte anti-bot](/es/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**,
para que robots.txt y los sitemaps regresen incluso en sitios protegidos por
Cloudflare. Una instancia de FlareSolverr o un respaldo a Wayback Machine se
pueden activar con variables de entorno (`SITEMAPPER_FLARESOLVERR_URL`,
`SITEMAPPER_WAYBACK_FALLBACK=1`) o mediante la clase `Sitemapper`.

## Por qué esto importa

Un sitio que declara `Crawl-delay: 2` te está diciendo a qué velocidad quiere
que lo golpeen. Ignóralo y te arriesgas a que te bloqueen, o degradas el sitio
para todos. Respétalo y tu scraper juega limpio.

Un sitemap enumera lo que el sitio quiere indexar. El rastreo ciego de enlaces
puede tocar cinco veces más URL para encontrar el mismo contenido, así que
parte del sitemap cuando exista uno. Es más rápido para ti y más ligero para
el servidor.

El alcance importa antes de escribir código. Algunos sitios prohíben el
scraping de plano en robots.txt. Otros tienen sitemaps que ya contienen todo
lo que necesitas. Diez segundos de `discover()` te dicen en qué situación
estás antes de que inviertas en un parser.

## La herramienta

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

Úsala como biblioteca, o desde la línea de comandos: `--json FILE` escribe el
descubrimiento completo en un archivo para que otras herramientas lo consuman, `--crawl`
añade el paso del grafo de enlaces:

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json out.json
```

Es software libre y funciona en tu propio hardware. Empieza cada scraper con
reconocimiento.
