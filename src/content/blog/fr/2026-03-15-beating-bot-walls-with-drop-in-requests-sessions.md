---
title: "Des sessions requests composables et prêtes à l'emploi pour un accès résilient aux données publiques"
description: "Deux sous-classes composables de requests.Session pour lire de façon fiable des pages web publiques sans navigateur headless dans le chemin critique : un transport compatible TLS, un proxy FlareSolverr pour les défis JS, un repli sur la Wayback Machine et des requêtes à IP diversifiées — unblock_requests et anon_requests."
date: 2026-03-15
lang: fr
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

Une grande partie de notre travail — clients de métadonnées média, enrichissement de
catalogues, archivage — repose sur la lecture fiable de pages web **publiques**. Le
problème, ce n'est pas vraiment les données ; c'est qu'une bonne partie de
l'infrastructure de détection de bots a été calibrée contre des attaques scriptées
et finit par classer à tort tout client non-navigateur bien élevé comme tel. Cela se
joue sur deux axes distincts :

- **« Qu'êtes-vous ? »** — Cloudflare et consorts signalent les requêtes non pas pour
  *ce* que vous demandez, mais pour *l'allure* que vous avez sur le fil : votre
  handshake TLS, votre empreinte JA3, votre capacité à exécuter un défi JavaScript.
  Un handshake `requests` ordinaire ne ressemble en rien à celui d'un navigateur, il
  se fait donc repérer par des vérifications visant l'abus scripté, même quand le
  trafic lui-même est bénin.
- **« Qui êtes-vous ? »** — la réputation d'IP et les limites de débit ignorent
  totalement votre empreinte ; elles comptent combien de requêtes proviennent d'une
  même adresse, ce qui peut pénaliser un client unique et bien élevé aussi facilement
  qu'un client abusif.

Les deux axes sont orthogonaux, aussi y répondons-nous avec deux petites
bibliothèques qui s'empilent proprement : **unblock_requests** répond à *qu'êtes-vous*,
**anon_requests** répond à *qui êtes-vous*. Toutes deux sont des substituts directs
d'une session `requests` dans le code de tous les jours. Cet article porte
spécifiquement sur cette couche de transport — la partie octets-sur-le-fil — et non
sur le parsing ou le pipeline qui repose au-dessus.

**La portée, clairement énoncée :** ces transports sont destinés uniquement aux
pages publiques, non authentifiées. Ils respectent le `robots.txt` et tout
crawl-delay déclaré — voir notre
**[article sur robots.txt et les sitemaps](/fr/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
pour la façon dont nous vérifions cela avant d'écrire un scraper — et chaque client
construit dessus est maintenu à de faibles volumes de requêtes, de sorte qu'une
origine cible ne voit jamais de charge significative venant de nous. Ce n'est pas
un avertissement ajouté après coup ; c'est une contrainte d'ingénierie réelle sur la
façon dont ces sessions sont utilisées, car un client résilient qui est aussi peu
respectueux se saborde lui-même.

## La contrainte de conception : conserver la forme de `requests`

Les sessions de `unblock_requests` héritent de `requests.Session` et ne surchargent
que `request()` — tout le reste (`.get()`, `.post()`, cookies, en-têtes, sémantique
de context manager) est hérité, de sorte que tout code typé contre `requests.Session`
les accepte sans modification. Les sessions de `anon_requests` enveloppent plutôt
qu'elles n'héritent — elles exposent les mêmes méthodes de verbe et la même interface
de context manager, mais reconstruisent leur session interne à chaque rotation :

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

Voilà, en une ligne, toute la posture éthique et technique : nous n'automatisons pas
un navigateur-en-tant-qu'utilisateur, nous construisons un *client HTTP résilient*
pour des données qui sont déjà publiques. Aucun navigateur avec interface n'apparaît
sur l'écran de qui que ce soit, et rien dans le chemin critique n'a besoin d'un
affichage.

## Couche un : `unblock_requests` et ses transports

`unblock_requests` rend un client Python ordinaire interopérable avec les
**vérifications de détection de bots calibrées pour les navigateurs**. Vous choisissez un
transport avec l'argument `mode=` (ou la variable d'environnement
`UNBLOCK_REQUESTS_TRANSPORT` — les arguments explicites l'emportent toujours). Les
quatre principaux :

| Mode | Ce qu'il fait |
|---|---|
| `curl_cffi` *(par défaut)* | Impersonation TLS/JA3 de Chrome via `curl_cffi`. Se présente comme un handshake à l'allure d'un navigateur sur la plupart des réseaux, sans infrastructure supplémentaire. |
| `requests` | `requests` simple, sans impersonation. |
| `flaresolverr` | Passe par un navigateur headless FlareSolverr qui résout le défi JS — données **en direct**. |
| `wayback` | Lit le snapshot le plus récent de l'Internet Archive — obsolète, mais ne requiert rien. |

Le mode par défaut, `curl_cffi`, est la victoire à bas coût. La plupart des verdicts
« vous êtes un bot » se résument à une divergence d'empreinte TLS : le `requests`
d'origine (via OpenSSL) réalise un handshake en rien comparable à celui de Chrome.
`curl_cffi` impersonne une véritable build de Chrome (`impersonate="chrome"` par
défaut), de sorte que le handshake et le JA3 s'alignent et que la vérification passe
tout simplement. Aucun JavaScript exécuté, aucun navigateur lancé.

Lorsqu'un site escalade vers un véritable défi JS interactif, `curl_cffi` ne suffit
pas — il faut que quelque chose exécute le défi. C'est là qu'entre le mode
`flaresolverr` : une instance de
[FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) que vous hébergez
vous-même effectue la résolution dans un navigateur headless **hors de votre
processus**, et `unblock_requests` se contente d'y faire un POST et d'extraire le HTML
résolu de la réponse. Définir `flaresolverr_url` sélectionne ce mode automatiquement :

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## Dégradation gracieuse vers l'archive

L'infrastructure a de mauvais jours — FlareSolverr est hors service, le site est
injoignable, le défi est pour l'instant insoluble. Plutôt que de faire échouer toute
la tâche, la session peut se replier sur la **Wayback Machine**. La détection des
défis est heuristique : un petit auxiliaire `is_challenge()` flaire la première partie
du corps à la recherche des marqueurs révélateurs d'un interstitiel Cloudflare
(« just a moment », `challenge-platform`, `cf_chl_opt`, `cf-mitigated`). Face à un GET
bloqué, si `wayback_fallback` est activé, la session résout le snapshot le plus récent
via l'API de disponibilité d'`archive.org` et renvoie ses octets bruts (la forme brute
`…id_/`, sans barre d'outils ni réécriture de liens). archive.org n'est pas protégé
par Cloudflare, si bien que le `requests` simple y accède.

Deux notes d'implémentation qui valent la peine d'être connues : dans les modes
`wayback` et `flaresolverr`, le résultat est une `requests.Response` *synthétisée*
mais authentique, construite à partir du HTML récupéré — de sorte que `stream=`, les
adaptateurs personnalisés et le connection pooling ne s'y appliquent pas, tandis que
les modes `requests`/`curl_cffi` sont pleinement natifs. Et le repli ne se déclenche
que pour les GET ; nous ne rejouons jamais silencieusement une requête mutante depuis
une archive.

## Couche deux : `anon_requests` et la rotation d'IP

Le problème orthogonal est la **réputation d'IP**. Même un handshake parfaitement
crédible peut se faire limiter en débit si toutes les requêtes proviennent d'une
seule adresse — les heuristiques fondées sur le volume regardent l'adresse, pas
l'empreinte. `anon_requests` répartit la charge entre plusieurs adresses avec
`RotatingProxySession` (proxies publics extraits, validation optionnelle,
SOCKS5/HTTP) et `RotatingTorSession` (circuits Tor rotatifs), de sorte qu'un client
à faible volume n'est jamais confondu avec un client qui martèle un site depuis une
seule IP. Chaque requête sort par une nouvelle sortie, et les proxies morts sont
écartés par rotation en cas d'échec de connexion.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## La composition : charge répartie **et** handshake compatible d'un seul coup

Ces deux bibliothèques sont conçues pour s'empiler plutôt que se chevaucher. Les
sessions de `anon_requests` acceptent un `session_factory` — n'importe quel callable
retournant une `requests.Session`, avec pour défaut `requests.Session`. Les réglages
de rotation et de proxy sont appliqués à ce que cette factory retourne. Vous injectez
donc une `CloudflareSession` comme factory et obtenez les deux comportements en un
seul objet :

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # spreads load across IPs *and* uses a browser-compatible handshake
```

Le proxy en rotation circule à travers *tous* les transports — y compris jusque dans
FlareSolverr, qui pilote son navigateur headless via le champ `proxy` de la requête de
résolution. Ainsi, l'ensemble de la requête — handshake, résolution du défi et IP de
sortie — reste cohérent de bout en bout, ce qui est simplement le comportement correct
pour un client qui ne cherche pas à se faire passer pour plus d'un visiteur.

## Pourquoi cette forme

Garder chaque préoccupation dans sa propre sous-classe fine de `requests.Session`
signifie que l'appelant ne choisit que ce dont il a besoin — l'impersonation TLS
seule, la stack complète de rotation-plus-résolution, ou quoi que ce soit entre les
deux — en changeant un constructeur, non en réécrivant son code HTTP. L'outil coûteux
et lourd (un vrai navigateur) reste *hors du processus* dans FlareSolverr et n'est
convoqué que lorsqu'un défi JS l'exige véritablement ; le cas courant est un handshake
impersonné et bon marché. Et quand le web en direct refuse, l'archive répond.

La jointure `session_factory` est l'endroit où se produit la composition, et c'est ce
qui maintient les bibliothèques extensibles de façon indépendante : ajoutez un mode de
transport à `unblock_requests` et `anon_requests` le compose gratuitement. Un accès
résilient aux données publiques, réalisé proprement.

Toutes deux sont FOSS et auto-hébergeables :
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) et
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

Ces transports alimentent tous nos **[scrapers de bases de données musicales](/fr/blog/2026-04-20-music-database-scrapers)**. Pour la reconnaissance d'un site avant de construire tout scraper, voyez **[sitemapper](https://github.com/TigreGotico/sitemapper)** et l'**[article sur robots.txt et les sitemaps](/fr/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**.
