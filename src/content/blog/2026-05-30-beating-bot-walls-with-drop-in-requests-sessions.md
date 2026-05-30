---
title: "Beating Bot Walls With Drop-In requests Sessions"
description: "How we keep resilient access to public data without firing up a headless browser in the hot path: TLS fingerprint impersonation, a FlareSolverr proxy for JS challenges, a Wayback Machine fallback, and IP rotation — all behind two composable requests.Session subclasses, unblock_requests and anon_requests."
date: 2026-03-15
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

A lot of our work — media-metadata clients, catalog enrichment, archival —
depends on reading **public** web pages reliably. The problem is rarely the
data; it is the wall in front of it. Cloudflare and friends increasingly block
requests not for *what* you ask but for *how* you look on the wire: your TLS
handshake, your JA3 fingerprint, whether you can run a JavaScript challenge.

We solve this at the transport layer with two small libraries that each subclass
`requests.Session`, so they are genuine drop-in replacements. This post is about
that layer specifically — the bytes-on-the-wire part — not the parsing or the
pipeline that sits above it.

## The design constraint: stay a `requests.Session`

Both libraries only override `request()`. Everything else — `.get()`, `.post()`,
cookies, headers, context-manager semantics — is inherited from `requests`.
Anything typed against `requests.Session` accepts them unchanged:

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://192.168.1.116:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

That is the whole ethical and engineering posture in one line: we are not
automating a browser-as-a-user, we are making a *resilient HTTP client* for
data that is already public. No headed browser pops up on anyone's screen, and
nothing in the hot path needs a display.

## Layer one: `unblock_requests` and its four transports

`unblock_requests` defends against **bot detection**. You pick a transport with
the `mode=` kwarg (or the `UNBLOCK_REQUESTS_TRANSPORT` env var — explicit kwargs
always win). There are four:

| Mode | What it does |
|---|---|
| `curl_cffi` *(default)* | Chrome TLS/JA3 impersonation via `curl_cffi`. Clears the bot check on most networks with no extra infra. |
| `requests` | Plain `requests`, no impersonation. |
| `flaresolverr` | Proxies through a FlareSolverr headless browser that solves the JS challenge — **live** data. |
| `wayback` | Reads the latest Internet Archive snapshot — stale, but needs nothing. |

The default, `curl_cffi`, is the cheap win. Most "you are a bot" verdicts are a
TLS-fingerprint mismatch: stock `requests` (via OpenSSL) handshakes nothing like
Chrome. `curl_cffi` impersonates a real Chrome build (`impersonate="chrome"` by
default), so the handshake and JA3 line up and the check simply passes. No
JavaScript executed, no browser launched.

When a site escalates to an actual interactive JS challenge, `curl_cffi` is not
enough — something has to run the challenge. That is `flaresolverr` mode: a
[FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) instance you
self-host does the solving in a headless browser **out of your process**, and
`unblock_requests` just POSTs to it and lifts the solved HTML out of the
response. Setting `flaresolverr_url` selects this mode automatically:

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## Graceful degradation to the archive

Infrastructure has bad days — FlareSolverr is down, the site is unreachable, the
challenge is unsolvable right now. Rather than fail the whole job, the session
can fall back to the **Wayback Machine**. Challenge detection is heuristic: a
small `is_challenge()` helper sniffs the first part of the body for the
tell-tale markers of a Cloudflare interstitial ("just a moment",
`challenge-platform`, `cf_chl_opt`, `cf-mitigated`). On a blocked GET, if
`wayback_fallback` is on, the session resolves the latest snapshot via
`archive.org`'s availability API and returns its raw bytes (the `…id_/` raw
form, with no toolbar or link rewriting). archive.org is not Cloudflare-gated,
so plain `requests` reaches it.

Two implementation notes worth knowing: in `wayback` and `flaresolverr` modes
the result is a *synthesized* but genuine `requests.Response` built from the
fetched HTML — so `stream=`, custom adapters and connection pooling do not apply
there, whereas `requests`/`curl_cffi` modes are fully native. And the fallback
only fires for GETs; we never silently replay a mutating request from an
archive.

## Layer two: `anon_requests` and IP rotation

The orthogonal problem is **IP reputation**. Even a perfect fingerprint gets
rate-limited or banned if every request comes from one address.
`anon_requests` handles that with `RotatingProxySession` (scraped public
proxies, optional validation, SOCKS5/HTTP) and `RotatingTorSession` (rotating
Tor circuits). Each request rotates the exit and retries until it gets a `200`.

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## The composition: rotation **and** bypass at once

These two libraries are designed to stack rather than overlap. `anon_requests`
sessions accept a `session_factory` — any callable returning a
`requests.Session`, defaulting to `requests.Session`. The rotation and proxy
settings are applied to whatever that factory returns. So you inject a
`CloudflareSession` as the factory and get both behaviors from one object:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates the IP *and* solves Cloudflare
```

The rotated proxy flows through *every* transport — including into FlareSolverr,
which drives its headless browser through the `proxy` field of the solve
request. So the IP that solves the challenge is the same rotated IP the rest of
the request uses: no fingerprint/exit-node split for a defender to notice.

## Why this shape

Keeping each concern its own thin `requests.Session` subclass means callers
choose only what they need — TLS impersonation alone, the full
rotation-plus-solve stack, or anything between — by swapping a constructor, not
by rewriting their HTTP code. The expensive, heavyweight tool (a real browser)
stays *out of process* in FlareSolverr and is summoned only when a JS challenge
genuinely demands it; the common case is a cheap impersonated handshake. And
when the live web refuses, the archive answers. Resilient access to public data,
done cleanly.

Both are FOSS and self-hostable:
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) and
[`anon_requests`](https://github.com/TigreGotico/anon_requests).

These transport libraries form the foundation for **[extracting data from hard-to-reach sources](/blog/2026-04-05-data-extraction-clean-apis-and-datasets)** and power all of our **[music database scrapers](/blog/2026-04-20-music-database-scrapers)**. See also **[sitemapper](https://github.com/TigreGotico/sitemapper)**, our site-recon utility that pairs with these transports to learn site structure before building any scraper.
