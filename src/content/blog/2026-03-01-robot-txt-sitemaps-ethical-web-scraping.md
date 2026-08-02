---
title: "Robots.txt, Sitemaps, and Ethical Web Scraping"
description: "Before you build a scraper, scout the site. sitemapper reads robots.txt, fetches every sitemap, and optionally crawls the link graph, so your scraper starts from the site's own contract instead of brute force."
date: 2026-03-01
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

## Start with reconnaissance, not brute force

The worst scrapers crawl blind. They hammer a site, ignore crawl-delay
declarations, thrash every path looking for data, and break when the structure
changes by a single class name. The best scrapers start by reading the site.

Every website publishes a contract in three places: **robots.txt** (crawl
policy), the **sitemaps** (what the site itself considers worth indexing), and
the **link graph** (how pages are actually wired together). Reading these first
answers three questions before you write a single line of scraping code:

1. **Is this site scrapable?** What does robots.txt allow, and at what pace?
2. **Where is the data?** What do the sitemaps surface?
3. **How is the site structured?** What does the link topology look like?

That is what **[sitemapper](https://github.com/TigreGotico/sitemapper)** does.

## Passive discovery: robots.txt + sitemaps

`discover()` fetches robots.txt and every sitemap it can find, including
`Sitemap:` directives, sitemap indexes that point at sub-sitemaps, and gzipped
files, without crawling a single HTML page:

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

The per-agent detail is there when you need it: `info.robots.groups` holds each
`User-agent` block with its `allows`, `disallows`, and `crawl_delay`, in
document order. If a site has no robots.txt at all, `is_allowed()` returns
`True` for everything. Absence of a policy is itself the policy.

Sitemap-first scraping pays off because you skip discovering URLs by crawling
(slow, noisy, incomplete) and start from the maintainers' own list. You scrape
what the site declares important, at the pace it declares acceptable, in a
fraction of the requests.

## Active discovery: the link graph

Some sites publish no sitemap. For those, `crawl()` runs a bounded
breadth-first crawl from the base URL and returns a `LinkGraph` of internal
pages and outgoing links:

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

This tells you the actual topology, which pages link to what, so you can
decide whether the site is worth a structured scraper at all. Discovery and
crawling are deliberately separate calls: the passive step never fetches HTML,
so you can always scout politely before deciding to crawl.

## Built on the same resilient transport

Site recon is pointless if the recon itself gets bot-walled. All of
sitemapper's HTTP goes through
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests), the
TLS-impersonating transport (it mimics a real browser's TLS fingerprint) from our
**[anti-bot transport post](/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**,
so robots.txt and sitemaps come back even on Cloudflare-fronted sites. A
FlareSolverr instance or Wayback Machine fallback can be enabled with
environment variables (`SITEMAPPER_FLARESOLVERR_URL`,
`SITEMAPPER_WAYBACK_FALLBACK=1`) or via the `Sitemapper` class.

## Why this matters

A site that declares `Crawl-delay: 2` is telling you how fast it wants to be
hit. Ignore it and you risk getting blocked, or you degrade the site for
everyone. Respect it and your scraper plays fair.

A sitemap lists what the site wants indexed. Blind link-crawling can touch
five times as many URLs to find the same content, so start from the sitemap
when one exists. It is faster for you and lighter on the server.

Scope matters before you write code. Some sites forbid scraping outright in
robots.txt. Others have sitemaps that already contain everything you need. Ten
seconds of `discover()` tells you which situation you are in before you invest
in a parser.

## The tool

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

Use it as a library, or from the command line: `--json FILE` writes the full
discovery to a file for other tools to consume, `--crawl` adds the link-graph step:

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json out.json
```

It is free software and runs on your own hardware. Start every scraper with
reconnaissance.
