---
title: "Robots.txt, Sitemaps e Scraping Ético"
description: "Antes de construir um scraper, faça o reconhecimento do site. O sitemapper lê o robots.txt, obtém todos os sitemaps e, opcionalmente, percorre o grafo de ligações — para que o seu scraper parta do próprio contrato do site em vez da força bruta."
date: 2026-03-01
lang: pt
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

## Comece pelo reconhecimento, não pela força bruta

Os piores scrapers rastreiam às cegas. Martelam um site, ignoram as declarações
de crawl-delay, percorrem todos os caminhos à procura de dados e partem-se
quando a estrutura muda pelo nome de uma única classe. Os melhores scrapers
começam por ler o site.

Todos os sites publicam um contrato em três lugares: o **robots.txt** (política
de rastreio), os **sitemaps** (o que o próprio site considera digno de
indexação) e o **grafo de ligações** (como as páginas estão de facto ligadas
entre si). Ler isto primeiro responde a três perguntas antes de escrever uma
única linha de código de scraping:

1. **Este site pode ser scrapeado?** O que permite o robots.txt, e a que ritmo?
2. **Onde estão os dados?** O que revelam os sitemaps?
3. **Como está estruturado o site?** Qual é a topologia das ligações?

É isso que o **[sitemapper](https://github.com/TigreGotico/sitemapper)** faz.

## Descoberta passiva: robots.txt + sitemaps

O `discover()` obtém o robots.txt e todos os sitemaps que conseguir encontrar —
incluindo diretivas `Sitemap:`, índices de sitemaps que apontam para
sub-sitemaps e ficheiros comprimidos com gzip — sem rastrear uma única página
HTML:

```python
from sitemapper import discover

info = discover("https://www.python.org")
print(info.summary())
# Base URL:         https://www.python.org
# Sitemaps found:   1
# URLs in sitemaps: 342
# Crawl-delay:      None

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

O detalhe por agente está lá quando precisa dele: `info.robots.groups` contém
cada bloco `User-agent` com os seus `allows`, `disallows` e `crawl_delay`, por
ordem no documento. Se um site não tiver robots.txt nenhum, `is_allowed()`
devolve `True` para tudo — a ausência de política é, ela própria, a política.

O ganho do scraping orientado por sitemaps: em vez de descobrir URLs através do
rastreio (lento, ruidoso, incompleto), parte da própria lista dos mantenedores.
Faz scraping do que o site declara importante, ao ritmo que declara aceitável,
numa fração dos pedidos.

## Descoberta ativa: o grafo de ligações

Alguns sites não publicam sitemap. Para esses, o `crawl()` executa um rastreio
em largura, limitado, a partir do URL base, e devolve um `LinkGraph` das
páginas internas e das ligações de saída:

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

Isto diz-lhe a topologia real — que páginas ligam a quê — para que possa
decidir se o site justifica sequer um scraper estruturado. Descoberta e rastreio
são chamadas deliberadamente separadas: o passo passivo nunca obtém HTML, por
isso pode sempre fazer o reconhecimento de forma educada antes de decidir
rastrear.

## Assente no mesmo transporte resiliente

O reconhecimento de um site é inútil se o próprio reconhecimento for barrado por
muros anti-bot. Todo o HTTP do sitemapper passa pelo
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) — o
transporte com personificação de TLS do nosso
**[artigo sobre transporte anti-bot](/pt/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** —
por isso o robots.txt e os sitemaps chegam mesmo em sites protegidos pela
Cloudflare. Uma instância FlareSolverr ou um recurso à Wayback Machine podem ser
ativados com variáveis de ambiente (`SITEMAPPER_FLARESOLVERR_URL`,
`SITEMAPPER_WAYBACK_FALLBACK=1`) ou através da classe `Sitemapper`.

## Porque é que isto importa

**Crawl-delay**: um site que declara `Crawl-delay: 2` está a dizer-lhe a que
velocidade quer ser acedido. Ignore-o e é bloqueado — ou degrada o site para
toda a gente. Respeite-o e o seu scraper joga limpo.

**Sitemaps em vez de rastreio**: um sitemap lista o que o site quer indexado. O
rastreio cego de ligações pode tocar em cinco vezes mais URLs para encontrar o
mesmo conteúdo. Comece pelo sitemap quando existe um; é mais rápido para si e
mais leve para o servidor.

**Âmbito antes do código**: alguns sites proíbem o scraping de forma explícita
no robots.txt; outros têm sitemaps que já contêm tudo o que precisa. Dez
segundos de `discover()` dizem-lhe em que situação está antes de investir num
parser.

## A ferramenta

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

Use-a como biblioteca, ou a partir da linha de comandos — `--json` emite a
descoberta completa para encaminhar para outras ferramentas, `--crawl`
acrescenta o passo do grafo de ligações:

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json
```

É software livre e corre no seu próprio hardware. Comece cada scraper pelo
reconhecimento.
