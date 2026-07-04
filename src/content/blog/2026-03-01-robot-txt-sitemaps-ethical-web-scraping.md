---
title: "Robot.txt, Sitemaps, and Ethical Web Scraping"
description: "Before you build a scraper, scout the site. We built sitemapper to read robots.txt, parse sitemaps, traverse link graphs, and respect crawl-delay declarations — making every scraper faster and more polite."
date: 2026-03-01
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

The worst scrapers are the ones that crawl blind. They hammer a site, ignore crawl-delay declarations, thrash every path looking for data, and break when the structure changes by a single class name. The best scrapers start by reading the site.

Every website publishes a contract in three places: **robots.txt** (crawl policy), the **sitemap** (what's worth crawling), and the **link graph** (how the site is wired). Reading these first answers three questions before you write a single line of scraping code:

1. **Is this site scrapable?** What does robots.txt allow?
2. **Where is the data?** What does the sitemap surface?
3. **How is the site structured?** What's the link topology?

That is what **[sitemapper](https://github.com/TigreGotico/sitemapper)** does. It is small (no dependencies), fast, and a prerequisite for building **any** scraper responsibly.

## How sitemapper works

The tool is simple and composable. The examples below are illustrative of the API shape — consult the [repo](https://github.com/TigreGotico/sitemapper) for current usage. Start a discovery:

```python
from sitemapper import discover

# Scout a site: robots.txt, sitemaps, and link graph
results = discover("https://example.com")

# What crawl delay should you respect?
delay = results.robots_txt.crawl_delay
if delay:
    print(f"Wait {delay} seconds between requests")

# What paths are allowed?
allowed = results.robots_txt.allowed_paths
disallowed = results.robots_txt.disallowed_paths
print(f"Allowed: {allowed}, Disallowed: {disallowed}")

# What sitemaps exist?
for sitemap in results.sitemaps:
    print(f"Found sitemap: {sitemap.url}")
    
# What links did we discover from the homepage?
print(f"Discovered {len(results.discovered_urls)} reachable URLs")
```

### robots.txt parsing in depth

A robots.txt file declares crawl policy to any agent that reads it. It specifies:
- **Crawl delays** — "wait this many seconds between requests" (or use the `Crawl-delay` header)
- **User-agent rules** — different rules for different crawlers (you can target specific ones)
- **Disallowed paths** — "don't scrape under `/private/`" or "`/admin/*`"
- **Request-rate** — "no more than N requests per minute"

`sitemapper` parses all of this and exposes it cleanly:

```python
# Respect crawl delay
delay = results.robots_txt.crawl_delay  # e.g., 2.0 seconds
if delay:
    time.sleep(delay)  # before each request

# Check if a path is scrapable
is_allowed = results.robots_txt.is_allowed("/api/users")  # True or False

# Get policy for a specific user-agent (yours, or "Googlebot", etc)
policy = results.robots_txt.for_user_agent("MyBot/1.0")
```

If a site has no robots.txt, `sitemapper` handles it gracefully — assume everything is allowed and move on.

### Sitemaps (XML and TXT)

Sitemaps are the gold standard. A site's maintainers explicitly list what they consider important content — exactly the signal you want. Rather than blindly crawling 100,000 URLs hoping you find everything, read the sitemap and know the scope.

Sitemaps come in two forms:
- **XML sitemaps** — structured, machine-readable, the modern standard
- **Text sitemaps** — one URL per line, simpler

Both are useful. A site might have a main `sitemap.xml` that points to language-specific or category-specific sub-sitemaps.

`sitemapper` discovers all of them and exposes the URLs:

```python
for sitemap in results.sitemaps:
    print(f"Sitemap: {sitemap.url} ({len(sitemap.urls)} URLs)")
    
    for url in sitemap.urls:
        # url.loc — the actual URL
        # url.lastmod — when it was last updated
        # url.changefreq — how often it changes (daily, weekly, never)
        # url.priority — how important the site thinks it is (0.0-1.0)
        
        print(f"  {url.loc}")
        if url.lastmod:
            print(f"    Last modified: {url.lastmod}")
```

The payoff: instead of discovering URLs through crawling (which is slow and misses dead-end pages), you start with the maintainers' own list. You scrape what the site thinks is important, at the pace they declared, and you're done in 1/10th the time.

### Link graph discovery

Some sites don't publish a sitemap. For those, `sitemapper` crawls from the homepage and builds a map of the reachable link graph:

```python
for url in results.discovered_urls:
    print(url)
```

This tells you the actual topology of the site — which pages link to what, and which ones are isolated. You can use it to decide: do I scrape this manually, or is the site too complex?

## Why this matters for scrapers

**Crawl delay**: Sites declare how fast they want to be hit. A 2-second crawl-delay means "wait 2 seconds between requests." Ignore it and you'll get blocked, or worse, DoS the site. Respect it and your scraper plays fair.

**Sitemaps over crawling**: A sitemap lists 10,000 URLs. Link crawling from the homepage might reach 50,000 before it stops. Start with the sitemap if it exists — it is faster for you and lighter on the server.

**Scope discovery**: Before writing a parser, know if the site is even scrapable. Some sites explicitly forbid scraping in robots.txt. Some have broken/incomplete sitemaps. Sitemapper tells you what you're actually dealing with.

See also: **[anti-bot transport layers](/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** — sitemapper pairs with these transports so you know the site structure before you start hitting it.

## The tool

`sitemapper` is small and pure-Python:

```bash
pip install sitemapper
```

Use it as a library or as a CLI:

```bash
python -m sitemapper https://example.com
```

It is free software, self-hosted, and runs on your own hardware. Start every scraper with reconnaissance.
