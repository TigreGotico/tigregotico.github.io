---
title: "Derrubar Muros Anti-Bot com Sessões requests Componíveis e Prontas a Usar"
description: "Como mantemos acesso resiliente a dados públicos sem arrancar um navegador headless no caminho crítico: impersonação de impressão digital TLS, um proxy FlareSolverr para desafios JS, um recurso à Wayback Machine e rotação de IP — tudo por trás de duas subclasses componíveis de requests.Session, unblock_requests e anon_requests."
date: 2026-03-15
lang: pt
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

Grande parte do nosso trabalho — clientes de metadados de media, enriquecimento de
catálogos, arquivo — depende de ler páginas web **públicas** de forma fiável. O
problema raramente são os dados; é o muro à frente deles. E o muro faz duas
perguntas distintas:

- **"O que és tu?"** — a Cloudflare e afins bloqueiam pedidos não pelo *que*
  pedes, mas pelo *aspeto* que tens à saída: o teu handshake TLS, a tua impressão
  digital JA3, se consegues executar um desafio JavaScript.
- **"Quem és tu?"** — a reputação de IP e os limites de taxa ignoram por completo
  a tua impressão digital; contam quantos pedidos vêm de um único endereço.

As duas perguntas são ortogonais, por isso respondemos-lhes com duas pequenas
bibliotecas que se empilham de forma limpa: o **unblock_requests** responde a *o
que és tu*, e o **anon_requests** responde a *quem és tu*. Ambas são substitutos
diretos de uma sessão `requests` no código do dia a dia. Este artigo é
especificamente sobre essa camada de transporte — a parte dos bytes à saída — e não
sobre o parsing ou o pipeline que assenta por cima.

## A restrição de design: manter a forma do `requests`

As sessões do `unblock_requests` fazem subclasse de `requests.Session` e apenas
sobrepõem o `request()` — tudo o resto (`.get()`, `.post()`, cookies, cabeçalhos,
semântica de context manager) é herdado, pelo que qualquer código tipado contra
`requests.Session` as aceita sem alterações. As sessões do `anon_requests` envolvem
em vez de fazer subclasse — expõem os mesmos métodos de verbo e a mesma interface
de context manager, mas reconstroem a sua sessão interna a cada rotação:

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

Está aqui, numa linha, toda a postura ética e de engenharia: não estamos a
automatizar um navegador-como-utilizador, estamos a construir um *cliente HTTP
resiliente* para dados que já são públicos. Nenhum navegador com interface aparece
no ecrã de ninguém, e nada no caminho crítico precisa de um display.

## Camada um: o `unblock_requests` e os seus transportes

O `unblock_requests` defende contra a **deteção de bots**. Escolhes um transporte
com o argumento `mode=` (ou a variável de ambiente `UNBLOCK_REQUESTS_TRANSPORT` —
argumentos explícitos ganham sempre). Os quatro principais:

| Modo | O que faz |
|---|---|
| `curl_cffi` *(predefinição)* | Impersonação TLS/JA3 do Chrome via `curl_cffi`. Ultrapassa a verificação de bot na maioria das redes sem infraestrutura extra. |
| `requests` | `requests` simples, sem impersonação. |
| `flaresolverr` | Encaminha através de um navegador headless FlareSolverr que resolve o desafio JS — dados **em direto**. |
| `wayback` | Lê o snapshot mais recente do Internet Archive — desatualizado, mas não precisa de nada. |

A predefinição, `curl_cffi`, é a vitória barata. A maioria dos veredictos "és um
bot" resume-se a uma discrepância de impressão digital TLS: o `requests` de origem
(via OpenSSL) faz um handshake em nada parecido com o do Chrome. O `curl_cffi`
impersona uma build real do Chrome (`impersonate="chrome"` por predefinição), pelo
que o handshake e o JA3 alinham e a verificação simplesmente passa. Nenhum
JavaScript executado, nenhum navegador arrancado.

Quando um site escala para um verdadeiro desafio JS interativo, o `curl_cffi` não
chega — algo tem de executar o desafio. É aí que entra o modo `flaresolverr`: uma
instância de [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) que
alojas tu próprio faz a resolução num navegador headless **fora do teu processo**, e
o `unblock_requests` limita-se a fazer POST para ela e a extrair o HTML resolvido da
resposta. Definir `flaresolverr_url` seleciona este modo automaticamente:

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## Degradação graciosa para o arquivo

A infraestrutura tem dias maus — o FlareSolverr está em baixo, o site está
inacessível, o desafio é neste momento insolúvel. Em vez de falhar todo o trabalho,
a sessão pode recorrer à **Wayback Machine**. A deteção de desafios é heurística:
um pequeno auxiliar `is_challenge()` fareja a primeira parte do corpo à procura dos
marcadores reveladores de um interstício da Cloudflare ("just a moment",
`challenge-platform`, `cf_chl_opt`, `cf-mitigated`). Perante um GET bloqueado, se o
`wayback_fallback` estiver ativo, a sessão resolve o snapshot mais recente via API
de disponibilidade do `archive.org` e devolve os seus bytes em bruto (a forma em
bruto `…id_/`, sem barra de ferramentas nem reescrita de links). O archive.org não
está protegido pela Cloudflare, por isso o `requests` simples chega lá.

Duas notas de implementação que vale a pena conhecer: nos modos `wayback` e
`flaresolverr` o resultado é uma `requests.Response` *sintetizada* mas genuína,
construída a partir do HTML obtido — pelo que `stream=`, adaptadores personalizados
e connection pooling não se aplicam aí, ao passo que os modos `requests`/`curl_cffi`
são totalmente nativos. E o recurso ao arquivo só dispara para GETs; nunca
reproduzimos silenciosamente um pedido mutante a partir de um arquivo.

## Camada dois: o `anon_requests` e a rotação de IP

O problema ortogonal é a **reputação de IP**. Mesmo uma impressão digital perfeita
apanha limite de taxa ou banimento se todos os pedidos vierem de um único endereço.
O `anon_requests` trata disso com `RotatingProxySession` (proxies públicos
extraídos, validação opcional, SOCKS5/HTTP) e `RotatingTorSession` (circuitos Tor
rotativos). Cada pedido sai por uma saída nova, e os proxies mortos são retirados
por rotação em caso de falha de ligação.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## A composição: rotação **e** contorno de uma só vez

Estas duas bibliotecas foram desenhadas para se empilhar em vez de se sobrepor. As
sessões do `anon_requests` aceitam um `session_factory` — qualquer callable que
devolva uma `requests.Session`, com predefinição `requests.Session`. As definições
de rotação e proxy são aplicadas ao que quer que essa factory devolva. Assim,
injetas uma `CloudflareSession` como factory e obténs ambos os comportamentos num só
objeto:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates the IP *and* solves Cloudflare
```

O proxy rotativo flui através de *todos* os transportes — incluindo para dentro do
FlareSolverr, que conduz o seu navegador headless através do campo `proxy` do pedido
de resolução. Assim, o IP que resolve o desafio é o mesmo IP rotativo que o resto do
pedido usa: sem uma separação impressão-digital/nó-de-saída que um defensor possa
notar.

## Porquê esta forma

Manter cada preocupação na sua própria subclasse fina de `requests.Session`
significa que quem chama escolhe apenas o que precisa — só impersonação TLS, a stack
completa de rotação-mais-resolução, ou qualquer coisa pelo meio — trocando um
construtor, não reescrevendo o seu código HTTP. A ferramenta cara e pesada (um
navegador a sério) fica *fora do processo* no FlareSolverr e só é invocada quando um
desafio JS genuinamente o exige; o caso comum é um handshake impersonado e barato. E
quando a web em direto se recusa, o arquivo responde.

A junção do `session_factory` é onde acontece a composição, e é o que mantém as
bibliotecas extensíveis de forma independente: acrescenta um modo de transporte ao
`unblock_requests` e o `anon_requests` compõe-no de borla. Acesso resiliente a
dados públicos, feito de forma limpa.

Ambas são FOSS e auto-alojáveis:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) e
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

Estes transportes alimentam todos os nossos **[scrapers de bases de dados de música](/pt/blog/2026-04-20-music-database-scrapers)**. Para reconhecimento de um site antes de construíres qualquer scraper, vê o **[sitemapper](https://github.com/TigreGotico/sitemapper)** e o **[artigo sobre robots.txt e sitemaps](/pt/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**.
