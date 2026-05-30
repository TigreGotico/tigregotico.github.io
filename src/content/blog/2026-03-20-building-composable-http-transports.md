---
title: "Building Composable HTTP Transports for Resilient Scraping"
description: "HTTP clients are fragile under bot detection and rate limits. We built unblock_requests and anon_requests as drop-in requests.Session subclasses that compose—TLS impersonation, IP rotation, Wayback fallback, all stacked into one resilient transport."
date: 2026-03-20
author: "Casimiro Ferreira"
tags:
  - "HTTP"
  - "Scraping"
  - "Bot Detection"
  - "Cloudflare"
  - "Proxies"
  - "FOSS"
draft: false
---

## The transport layer problem

When you scrape the public web, two problems arrive together:

1. **"What are you?"** — Cloudflare, bot walls, and TLS fingerprinting check if you are a real browser.
2. **"Who are you?"** — IP reputation and rate limits check if you are a real person.

These are orthogonal problems that deserve orthogonal solutions. We solve them with two small libraries that stack cleanly: **[unblock_requests](https://github.com/TigreGotico/unblock_requests)** (for "what are you") and **[anon_requests](https://github.com/TigreGotico/anon_requests)** (for "who are you").

Both subclass `requests.Session`, so they are drop-in replacements. Your HTTP code stays the same; you just swap the constructor.

## unblock_requests: bypassing bot detection

The insight: most bot detection is **not** about what you're asking — it's about *how you look on the wire*. Your Python `requests` library uses OpenSSL for TLS, which has a distinctive handshake. A real Chrome browser has a different handshake. Cloudflare (and similar defenders) match the pattern to a database of known bots and blocks you instantly.

**[curl_cffi](https://github.com/yifeikong/curl_cffi)** solves this by impersonating the TLS handshake of a real Chrome browser. `unblock_requests` wraps it as a drop-in `requests.Session` replacement:

```python
from unblock_requests import CloudflareSession
import requests

# Drop-in replacement for requests.Session
s = CloudflareSession()  # TLS impersonation by default
html = s.get("https://example.com").text

# Everything else is standard requests API
s.headers.update({"User-Agent": "My Bot/1.0"})
json_response = s.post("https://api.example.com/data", json={"key": "value"}).json()
```

### Four transport modes: pick what you need

- **`curl_cffi`** (default) — impersonate Chrome TLS/JA3 fingerprint. Works for 90% of sites. No extra infrastructure needed. **This is your first choice.**
- **`flaresolverr`** — proxy to a headless browser that solves actual JavaScript challenges. When a site loads content with JS (not just static HTML), curl_cffi won't work — you need a real browser to execute it. `flaresolverr` runs headless Chrome out-of-process and returns the solved HTML.
- **`wayback`** — read the latest Internet Archive snapshot. Stale (days or weeks old), but never blocked. Useful when live access fails.
- **`requests`** — plain vanilla `requests`, no tricks. Use when you've already been approved by the site or when you know it's not defended.

### Graceful degradation: try live, fall back to archive

The game-changer is **composability**:

```python
s = CloudflareSession(
    flaresolverr_url="http://host:8191",      # If TLS fails, try browser
    wayback_fallback=True                       # If browser fails, try archive
)

# This single request tries three strategies:
# 1. TLS impersonation (instant, cheap)
# 2. Browser (slow, works with JS)
# 3. Archive (ancient, but never fails)
html = s.get("https://example.com").text
```

The result: a scraper that keeps working even when defenses change. Most of the time you get live data instantly. When a site escalates to JS challenges, the browser kicks in. When infrastructure is down, the archive answers. **One object, three fallback strategies.**

Linked: **[Beating Bot Walls](/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** covers the detailed architecture.

## anon_requests: IP rotation

The orthogonal problem: even a perfect TLS fingerprint gets rate-limited if every request is from one IP. **[anon_requests](https://github.com/TigreGotico/anon_requests)** rotates your IP through proxies or Tor:

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5) as s:
    for url in urls:
        response = s.get(url)  # Each request uses a new IP
```

## Composition: rotation *and* TLS impersonation

The beauty is that these stack. `anon_requests` accepts a `session_factory` — any callable that returns a `requests.Session`. Inject a `CloudflareSession` and you get both:

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(
        flaresolverr_url="http://host:8191"
    )
)

session.get(url)  # Rotates IP AND solves Cloudflare
```

The rotated proxy flows into FlareSolverr too — the headless browser solves the challenge through the same rotated IP. No fingerprint/exit-node split for defenders to notice.

## Why this shape

Each concern is its own thin subclass. You pick what you need by swapping a constructor, not by rewriting your HTTP code. The expensive tool (a real browser) stays out-of-process. The common case (TLS fingerprint) is cheap. And when live access fails, the archive answers.

See also: how these power our **[data extraction pipeline](/blog/2026-04-05-data-extraction-clean-apis-and-datasets)** and all **[30+ scrapers](/blog/2026-06-08-maintaining-30-scrapers)**.

Both are FOSS and self-hostable:
- [`unblock_requests`](https://github.com/TigreGotico/unblock_requests)
- [`anon_requests`](https://github.com/TigreGotico/anon_requests)
