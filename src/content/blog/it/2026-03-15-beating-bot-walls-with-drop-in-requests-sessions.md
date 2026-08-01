---
title: "Sessioni requests Componibili e Pronte all'Uso per un Accesso Resiliente ai Dati Pubblici"
description: "Due sottoclassi componibili di requests.Session per leggere pagine web pubbliche in modo affidabile senza un browser headless nel percorso critico: trasporto compatibile con TLS, un proxy FlareSolverr per le sfide JS, un ripiego sulla Wayback Machine e richieste diversificate per IP — unblock_requests e anon_requests."
date: 2026-03-15
lang: it
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

Gran parte del nostro lavoro — client di metadati multimediali, arricchimento di
cataloghi, archiviazione — dipende dalla lettura affidabile di pagine web
**pubbliche**. Il problema raramente sono i dati; è che gran parte dell'infrastruttura
di rilevazione dei bot è stata calibrata contro attacchi automatizzati e finisce
per classificare erroneamente come tale qualsiasi client non-browser ben educato.
Questo accade su due assi distinti:

- **"Cosa sei?"** — Cloudflare e simili segnalano le richieste non per *ciò* che
  chiedi, ma per *l'aspetto* che hai sul filo: il tuo handshake TLS, la tua
  impronta digitale JA3, la tua capacità di eseguire una sfida JavaScript. Un
  handshake `requests` puro non somiglia affatto a quello di un browser, perciò
  viene intercettato da controlli pensati per l'abuso automatizzato anche quando
  il traffico stesso è innocuo.
- **"Chi sei?"** — la reputazione dell'IP e i limiti di frequenza ignorano
  completamente la tua impronta digitale; contano quante richieste provengono da
  un unico indirizzo, il che può penalizzare un singolo client ben educato tanto
  quanto uno abusivo.

I due assi sono ortogonali, perciò rispondiamo a essi con due piccole
librerie che si impilano in modo pulito: **unblock_requests** risponde a *cosa
sei*, e **anon_requests** risponde a *chi sei*. Entrambe sono sostituti diretti
di una sessione `requests` nel codice di tutti i giorni. Questo articolo riguarda
specificamente quel livello di trasporto — la parte dei byte sul filo — e non il
parsing o la pipeline che vi sta sopra.

**L'ambito, detto chiaramente:** questi trasporti sono destinati solo a pagine
pubbliche e non autenticate. Rispettano `robots.txt` ed eventuali crawl-delay
dichiarati — vedi il nostro **[articolo su robots.txt e sitemap](/it/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
per come lo verifichiamo prima di scrivere uno scraper — e ogni client costruito
sopra di essi è mantenuto a volumi di richiesta bassi, così che un'origine
bersaglio non veda mai da noi un carico significativo. Non è una clausola
aggiunta a posteriori; è un vero vincolo ingegneristico su come queste sessioni
vengono usate, perché un client resiliente che è anche irrispettoso vanifica il
proprio stesso scopo.

## Il vincolo di design: mantenere la forma di `requests`

Le sessioni di `unblock_requests` fanno da sottoclasse di `requests.Session` e
sovrascrivono soltanto `request()` — tutto il resto (`.get()`, `.post()`,
cookie, header, semantica di context manager) è ereditato, perciò qualsiasi
codice tipizzato rispetto a `requests.Session` le accetta senza modifiche. Le
sessioni di `anon_requests` avvolgono anziché fare da sottoclasse — espongono gli
stessi metodi di verbo e la stessa interfaccia di context manager, ma
ricostruiscono la loro sessione interna a ogni rotazione:

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

Ecco, in una riga, tutta la postura etica e ingegneristica: non stiamo
automatizzando un browser-come-utente, stiamo costruendo un *client HTTP
resiliente* per dati che sono già pubblici. Nessun browser con interfaccia
compare sullo schermo di qualcuno, e nulla nel percorso critico necessita di un
display.

## Livello uno: `unblock_requests` e i suoi trasporti

`unblock_requests` rende un client Python semplice interoperabile con i **controlli
di rilevazione bot calibrati per i browser**. Scegli un trasporto con
l'argomento `mode=` (o la variabile d'ambiente `UNBLOCK_REQUESTS_TRANSPORT` — gli
argomenti espliciti vincono sempre). I quattro principali:

| Modalità | Cosa fa |
|---|---|
| `curl_cffi` *(predefinita)* | Impersonificazione TLS/JA3 di Chrome via `curl_cffi`. Si presenta come un handshake dalla forma di un browser sulla maggior parte delle reti senza infrastruttura aggiuntiva. |
| `requests` | `requests` semplice, senza impersonificazione. |
| `flaresolverr` | Instrada attraverso un browser headless FlareSolverr che risolve la sfida JS — dati **in diretta**. |
| `wayback` | Legge lo snapshot più recente di Internet Archive — datato, ma non richiede nulla. |

La predefinita, `curl_cffi`, è la vittoria a buon mercato. La maggior parte dei
verdetti "sei un bot" si riduce a una discrepanza dell'impronta digitale TLS: il
`requests` di serie (via OpenSSL) esegue un handshake per nulla simile a quello
di Chrome. `curl_cffi` impersona una build reale di Chrome (`impersonate="chrome"`
per impostazione predefinita), perciò l'handshake e il JA3 si allineano e il
controllo semplicemente passa. Nessun JavaScript eseguito, nessun browser
avviato.

Quando un sito passa a una vera sfida JS interattiva, `curl_cffi` non basta —
qualcosa deve eseguire la sfida. È qui che entra la modalità `flaresolverr`:
un'istanza di [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) che
ospiti tu stesso esegue la risoluzione in un browser headless **fuori dal tuo
processo**, e `unblock_requests` si limita a fare POST verso di essa ed estrarre
l'HTML risolto dalla risposta. Impostare `flaresolverr_url` seleziona questa
modalità automaticamente:

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## Degradazione graziosa verso l'archivio

L'infrastruttura ha giornate storte — FlareSolverr è fuori uso, il sito è
irraggiungibile, la sfida è al momento irrisolvibile. Anziché far fallire l'intero
lavoro, la sessione può ripiegare sulla **Wayback Machine**. La rilevazione delle
sfide è euristica: un piccolo aiutante `is_challenge()` fiuta la prima parte del
corpo in cerca dei marcatori rivelatori di un interstiziale di Cloudflare ("just a
moment", `challenge-platform`, `cf_chl_opt`, `cf-mitigated`). Di fronte a un GET
bloccato, se `wayback_fallback` è attivo, la sessione risolve lo snapshot più
recente tramite l'API di disponibilità di `archive.org` e ne restituisce i byte
grezzi (la forma grezza `…id_/`, senza barra degli strumenti né riscrittura dei
link). archive.org non è protetto da Cloudflare, perciò il `requests` semplice vi
arriva.

Due note di implementazione che vale la pena conoscere: nelle modalità `wayback` e
`flaresolverr` il risultato è una `requests.Response` *sintetizzata* ma genuina,
costruita a partire dall'HTML recuperato — perciò `stream=`, adattatori
personalizzati e connection pooling non si applicano lì, mentre le modalità
`requests`/`curl_cffi` sono completamente native. E il ripiego sull'archivio scatta
solo per i GET; non riproduciamo mai silenziosamente una richiesta mutante a partire
da un archivio.

## Livello due: `anon_requests` e la rotazione degli IP

Il problema ortogonale è la **reputazione dell'IP**. Anche un handshake dalla
forma di un browser perfettamente riuscito può subire limiti di frequenza se
tutte le richieste provengono da un unico indirizzo — le euristiche basate sul
volume guardano l'indirizzo, non l'impronta digitale. `anon_requests` distribuisce
il carico su più indirizzi con `RotatingProxySession` (proxy pubblici estratti,
validazione opzionale, SOCKS5/HTTP) e `RotatingTorSession` (circuiti Tor rotanti),
cosicché un client a basso volume non venga mai scambiato per uno che martella un
sito da un singolo IP. Ogni richiesta esce da un'uscita nuova, e i proxy morti
vengono ruotati via in caso di errore di connessione.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## La composizione: carico distribuito **e** un handshake compatibile in una volta sola

Queste due librerie sono progettate per impilarsi anziché sovrapporsi. Le sessioni
di `anon_requests` accettano un `session_factory` — qualsiasi callable che
restituisca una `requests.Session`, con predefinito `requests.Session`. Le
impostazioni di rotazione e proxy vengono applicate a qualunque cosa quella factory
restituisca. Così, inietti una `CloudflareSession` come factory e ottieni entrambi i
comportamenti da un solo oggetto:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # spreads load across IPs *and* uses a browser-compatible handshake
```

Il proxy ruotato fluisce attraverso *ogni* trasporto — anche dentro FlareSolverr,
che guida il suo browser headless attraverso il campo `proxy` della richiesta di
risoluzione. Così, l'intera richiesta — handshake, risoluzione della sfida ed IP
di uscita — resta coerente end-to-end, il che è semplicemente il comportamento
corretto per un client che non sta cercando di sembrare più di un visitatore.

## Perché questa forma

Mantenere ogni preoccupazione nella propria sottile sottoclasse di
`requests.Session` significa che chi chiama sceglie solo ciò di cui ha bisogno —
la sola impersonificazione TLS, l'intero stack di rotazione-più-risoluzione, o
qualsiasi cosa nel mezzo — scambiando un costruttore, non riscrivendo il proprio
codice HTTP. Lo strumento costoso e pesante (un vero browser) rimane *fuori dal
processo* in FlareSolverr ed è invocato solo quando una sfida JS lo richiede
genuinamente; il caso comune è un handshake impersonato ed economico. E quando il
web in diretta rifiuta, l'archivio risponde.

La giuntura di `session_factory` è dove avviene la composizione, ed è ciò che
mantiene le librerie estensibili in modo indipendente: aggiungi una modalità di
trasporto a `unblock_requests` e `anon_requests` la compone gratuitamente. Accesso
resiliente ai dati pubblici, fatto in modo pulito.

Entrambe sono FOSS e auto-ospitabili:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) e
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

Questi trasporti alimentano tutti i nostri **[scraper di database musicali](/it/blog/2026-04-20-music-database-scrapers)**. Per la ricognizione di un sito prima di costruire qualsiasi scraper, vedi **[sitemapper](https://github.com/TigreGotico/sitemapper)** e l'**[articolo su robots.txt e sitemap](/it/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**.
