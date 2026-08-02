---
title: "Kombinierbare, direkt einsetzbare requests-Sessions für widerstandsfähigen Zugriff auf öffentliche Daten"
description: "Zwei kombinierbare requests.Session-Subklassen, um öffentliche Webseiten zuverlässig zu lesen, ohne im heißen Pfad einen Headless-Browser zu starten: TLS-kompatibler Transport, ein FlareSolverr-Proxy für JS-Challenges, ein Wayback-Machine-Fallback und IP-diversifizierte Anfragen: unblock_requests und anon_requests."
date: 2026-03-15
lang: de
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

Ein Großteil unserer Arbeit (Medien-Metadaten-Clients, Katalog-Anreicherung,
Archivierung) hängt davon ab, **öffentliche** Webseiten zuverlässig zu lesen. Das
Problem sind selten die Daten. Es ist, dass ein Großteil der
Bot-Erkennungsinfrastruktur auf skriptgesteuerte Angriffe abgestimmt ist und am
Ende jeden wohlverhaltenen Nicht-Browser-Client als einen solchen fehlklassifiziert.
Das geschieht auf zwei getrennten Achsen:

- **„Was sind Sie?"** Cloudflare und Konsorten markieren Anfragen nicht dafür,
  *was* Sie anfragen, sondern dafür, *wie* Sie auf der Leitung aussehen: Ihr
  TLS-Handshake, Ihr JA3-Fingerabdruck (ein Hash davon, wie Ihr TLS-Handshake
  aufgebaut ist, der sich zwischen einem Browser und einer einfachen HTTP-Bibliothek
  unterscheidet, selbst wenn beide dieselbe Seite anfragen), ob Sie eine
  JavaScript-Challenge ausführen können. Ein einfacher `requests`-Handshake sieht einem Browser-Handshake
  überhaupt nicht ähnlich, sodass er von Prüfungen erfasst wird, die auf
  skriptgesteuerten Missbrauch abzielen, selbst wenn der Traffic selbst harmlos ist.
- **„Wer sind Sie?"** IP-Reputation und Ratenbegrenzungen ignorieren Ihren
  Fingerabdruck völlig. Sie zählen, wie viele Anfragen von einer Adresse kommen,
  was einen einzelnen wohlverhaltenen Client ebenso treffen kann wie einen
  missbräuchlichen.

Die beiden Achsen sind orthogonal, daher beantworten wir sie mit zwei kleinen
Bibliotheken, die sich sauber stapeln lassen: **unblock_requests** beantwortet *was
sind Sie*, **anon_requests** beantwortet *wer sind Sie*. Beide sind direkte
Ersatzlösungen für eine `requests`-Session im alltäglichen Code. In diesem Beitrag
geht es speziell um diese Transportschicht, den Bytes-auf-der-Leitung-Teil, nicht
um das Parsing oder die Pipeline darüber.

**Der Geltungsbereich, unverblümt gesagt:** Diese Transporte sind ausschließlich
für öffentliche, nicht authentifizierte Seiten gedacht. Sie respektieren
`robots.txt` und jede deklarierte Crawl-Verzögerung (siehe unseren
**[Beitrag zu robots.txt &amp; Sitemaps](/de/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
dazu, wie wir das prüfen, bevor wir einen Scraper schreiben), und jeder darauf
aufbauende Client wird auf ein niedriges Anfragevolumen beschränkt, sodass eine
Zielseite nie eine nennenswerte Last von uns sieht. Das ist kein nachträglich
angeklebter Disclaimer. Es ist eine echte technische Randbedingung dafür, wie
diese Sessions eingesetzt werden, denn ein widerstandsfähiger Client, der zugleich
rücksichtslos ist, konterkariert seinen eigenen Zweck.

## Die Design-Randbedingung: die `requests`-Form beibehalten

`unblock_requests`-Sessions leiten sich von `requests.Session` ab und überschreiben
nur `request()`. Alles andere (`.get()`, `.post()`, Cookies, Header, die
Context-Manager-Semantik) wird geerbt, sodass alles, was gegen `requests.Session`
typisiert ist, sie unverändert akzeptiert. Die `anon_requests`-Sessions umschließen
statt abzuleiten. Sie stellen dieselben Verb-Methoden und die
Context-Manager-Schnittstelle bereit, bauen aber ihre innere Session bei jeder
Rotation neu auf:

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

Das ist die gesamte ethische und technische Haltung in einer Zeile: Wir
automatisieren keinen Browser-als-Nutzer, wir bauen einen *widerstandsfähigen
HTTP-Client* für bereits öffentliche Daten. Kein sichtbarer Browser erscheint auf
jemandes Bildschirm, und nichts im heißen Pfad braucht ein Display.

## Schicht eins: `unblock_requests` und seine Transporte

`unblock_requests` macht einen einfachen Python-Client interoperabel mit
**Bot-Erkennungsprüfungen, die auf Browser abgestimmt sind**. Sie wählen einen Transport mit
dem Schlüsselwortargument `mode=` (oder der Umgebungsvariablen
`UNBLOCK_REQUESTS_TRANSPORT`; explizite Schlüsselwortargumente gewinnen immer). Die
wichtigsten vier:

| Modus | Was er tut |
|---|---|
| `curl_cffi` *(Standard)* | Chrome-TLS/JA3-Imitation über `curl_cffi`. Erzeugt in den meisten Netzwerken einen browserförmigen Handshake, ohne zusätzliche Infrastruktur. |
| `requests` | Einfaches `requests`, keine Imitation. |
| `flaresolverr` | Leitet über einen FlareSolverr-Headless-Browser, der die JS-Challenge löst: **Live**-Daten. |
| `wayback` | Liest den neuesten Snapshot des Internet Archive: veraltet, braucht aber nichts. |

Der Standard, `curl_cffi`, ist der günstige Gewinn. Die meisten „Sie sind ein
Bot"-Urteile sind eine TLS-Fingerabdruck-Nichtübereinstimmung: Das Standard-`requests`
(über OpenSSL) macht seinen Handshake in nichts wie Chrome. `curl_cffi` imitiert
einen echten Chrome-Build (`impersonate="chrome"` standardmäßig), sodass Handshake
und JA3 übereinstimmen und die Prüfung einfach passiert. Kein JavaScript ausgeführt,
kein Browser gestartet.

Wenn eine Website zu einer tatsächlichen interaktiven JS-Challenge eskaliert, reicht
`curl_cffi` nicht aus. Etwas muss die Challenge ausführen. Das ist der
`flaresolverr`-Modus: Eine
[FlareSolverr](https://github.com/FlareSolverr/FlareSolverr)-Instanz, die Sie selbst
hosten, übernimmt das Lösen in einem Headless-Browser **außerhalb Ihres Prozesses**,
und `unblock_requests` sendet nur ein POST daran und hebt das gelöste HTML aus der
Antwort heraus. Das Setzen von `flaresolverr_url` wählt diesen Modus automatisch:

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## Elegante Degradation zum Archiv

Infrastruktur hat schlechte Tage: FlareSolverr ist ausgefallen, die Website ist
nicht erreichbar, die Challenge ist gerade nicht lösbar. Statt den ganzen Job
scheitern zu lassen, kann die Session auf die **Wayback Machine** zurückgreifen. Die
Challenge-Erkennung ist heuristisch: Ein kleiner `is_challenge()`-Helfer schnüffelt
am ersten Teil des Body nach den verräterischen Markern eines
Cloudflare-Zwischenbildschirms („just a moment", `challenge-platform`,
`cf_chl_opt`, `cf-mitigated`). Bei einem blockierten GET löst die Session, wenn
`wayback_fallback` aktiviert ist, den neuesten Snapshot über die Verfügbarkeits-API
von `archive.org` auf und gibt dessen Rohbytes zurück (die rohe `…id_/`-Form, ohne
Toolbar oder Link-Umschreibung). archive.org ist nicht Cloudflare-geschützt, sodass
einfaches `requests` es erreicht.

Zwei Implementierungshinweise, die es zu kennen lohnt: In den Modi `wayback` und
`flaresolverr` ist das Ergebnis eine *synthetisierte*, aber echte
`requests.Response`, die aus dem abgerufenen HTML aufgebaut wird, daher gelten dort
`stream=`, benutzerdefinierte Adapter und Connection-Pooling nicht, während die Modi
`requests`/`curl_cffi` vollständig nativ sind. Und der Fallback greift nur bei GETs.
Wir wiederholen niemals stillschweigend eine verändernde Anfrage aus einem Archiv.

## Schicht zwei: `anon_requests` und IP-Rotation

Das orthogonale Problem ist die **IP-Reputation**. Selbst ein perfekt
browserförmiger Handshake kann ratenbegrenzt werden, wenn jede Anfrage von einer
Adresse kommt. Volumenbasierte Heuristiken schauen auf die Adresse, nicht auf den
Fingerabdruck. `anon_requests` verteilt die Last über Adressen hinweg mit
`RotatingProxySession` (gescrapte öffentliche Proxys, optionale Validierung,
SOCKS5/HTTP) und `RotatingTorSession` (rotierende Tor-Circuits), sodass ein Client
mit niedrigem Volumen nie mit einem verwechselt wird, der eine Website von einer
einzigen IP aus bombardiert. Jede Anfrage geht über einen frischen Exit hinaus, und
tote Proxys werden bei Verbindungsfehlern wegrotiert.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## Die Komposition: verteilte Last **und** ein kompatibler Handshake zugleich

Diese beiden Bibliotheken sind darauf ausgelegt, sich zu stapeln statt sich zu
überlappen. `anon_requests`-Sessions akzeptieren ein `session_factory`, ein
beliebiges Callable, das eine `requests.Session` zurückgibt, standardmäßig
`requests.Session`. Die Rotations- und Proxy-Einstellungen werden auf das angewendet,
was diese Factory zurückgibt. So injizieren Sie eine `CloudflareSession` als Factory
und erhalten beide Verhaltensweisen aus einem Objekt:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # spreads load across IPs *and* uses a browser-compatible handshake
```

Der rotierte Proxy fließt durch *jeden* Transport, auch in FlareSolverr hinein, das
seinen Headless-Browser über das Feld `proxy` der Solve-Anfrage steuert. So bleibt
die gesamte Anfrage (Handshake, Challenge-Lösung und Exit-IP) durchgängig
konsistent, was für einen Client, der nicht versucht, wie mehr als ein Besucher
auszusehen, korrektes Verhalten ist.

## Warum diese Form

Jedes Anliegen als eigene dünne `requests.Session`-Subklasse zu halten bedeutet, dass
Aufrufer nur das wählen, was sie brauchen (TLS-Imitation allein, den vollständigen
Rotations-plus-Solve-Stack oder alles dazwischen), indem sie einen Konstruktor
austauschen, nicht indem sie ihren HTTP-Code umschreiben. Das teure, schwergewichtige
Werkzeug (ein echter Browser) bleibt *außerhalb des Prozesses* in FlareSolverr und
wird nur herbeigerufen, wenn eine JS-Challenge es wirklich erfordert. Der häufige
Fall ist ein günstiger imitierter Handshake. Und wenn das Live-Web sich weigert,
antwortet das Archiv.

Die `session_factory`-Naht ist der Ort, an dem die Komposition geschieht, und sie
hält die Bibliotheken unabhängig erweiterbar: Fügen Sie `unblock_requests` einen
Transportmodus hinzu, und `anon_requests` komponiert ihn kostenlos mit.
Widerstandsfähiger Zugriff auf öffentliche Daten, sauber umgesetzt.

Beide sind FOSS und selbst hostbar:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) und
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

Diese Transporte treiben all unsere **[Musikdatenbank-Scraper](/de/blog/2026-04-20-music-database-scrapers)** an. Für die Website-Aufklärung, bevor Sie einen Scraper bauen, siehe **[sitemapper](https://github.com/TigreGotico/sitemapper)** und den **[Beitrag zu robots.txt &amp; Sitemaps](/de/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**.
