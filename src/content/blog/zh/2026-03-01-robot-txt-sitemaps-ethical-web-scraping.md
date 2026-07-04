---
title: "Robots.txt、Sitemap 与合乎道德的网页抓取"
description: "在构建抓取器之前，先侦察目标站点。sitemapper 会读取 robots.txt、获取每一个 sitemap，并可选地遍历链接图谱——让你的抓取器从站点自身的契约出发，而非蛮力硬闯。"
date: 2026-03-01
lang: zh
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

## 从侦察开始，而非蛮力

最糟糕的抓取器是盲目爬行的。它们猛烈冲击站点，无视 crawl-delay 声明，把每一条
路径都翻遍以寻找数据，并且只要结构中有一个类名发生变化就崩溃。最好的抓取器则从
阅读站点开始。

每个网站都在三个地方发布了一份契约：**robots.txt**（爬取策略）、**sitemap**
（站点自身认为值得索引的内容），以及**链接图谱**（页面之间实际是如何连接的）。
先读懂这些，就能在写下任何一行抓取代码之前回答三个问题：

1. **这个站点可以抓取吗？** robots.txt 允许什么，以及以怎样的速率？
2. **数据在哪里？** sitemap 揭示了什么？
3. **站点是如何组织的？** 链接拓扑是什么样子？

这正是 **[sitemapper](https://github.com/TigreGotico/sitemapper)** 所做的事。

## 被动发现：robots.txt + sitemap

`discover()` 会获取 robots.txt 以及它能找到的每一个 sitemap——包括 `Sitemap:`
指令、指向子 sitemap 的 sitemap 索引，以及经过 gzip 压缩的文件——而不爬取任何
一个 HTML 页面：

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

当你需要时，逐个 agent 的细节都在那里：`info.robots.groups` 按文档顺序保存了每一个
`User-agent` 块及其 `allows`、`disallows` 和 `crawl_delay`。如果一个站点根本没有
robots.txt，`is_allowed()` 会对所有内容返回 `True`——策略的缺失本身就是策略。

以 sitemap 为先的抓取带来的回报：不必通过爬取来发现 URL（慢、嘈杂、不完整），而是
从维护者自己的列表出发。你抓取站点声明为重要的内容，以站点声明为可接受的速率，只用
一小部分请求就能完成。

## 主动发现：链接图谱

有些站点不发布 sitemap。对于这些站点，`crawl()` 会从基准 URL 出发执行一次有界的
广度优先爬取，并返回一个包含内部页面和外链的 `LinkGraph`：

```python
from sitemapper import crawl

graph = crawl("https://example.com", max_pages=50, max_depth=2)
print(graph.summary())
# Pages crawled (internal): 50
# External URLs seen: 87
# Top external domains: ...
```

这会告诉你真实的拓扑——哪些页面链接到什么——从而让你判断这个站点是否值得为其构建
一个结构化的抓取器。发现与爬取被刻意设计为分开的调用：被动步骤从不获取 HTML，因此
你总能在决定爬取之前，先礼貌地进行侦察。

## 构建于同一套具备韧性的传输之上

如果侦察本身被反爬虫墙拦下，那么对站点的侦察就毫无意义。sitemapper 的所有 HTTP
都经由
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests)——出自我们
**[反爬虫墙传输一文](/zh/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)** 的
那套模拟 TLS 的传输——因此即便在由 Cloudflare 保护的站点上，robots.txt 和 sitemap
也能被取回。可以通过环境变量（`SITEMAPPER_FLARESOLVERR_URL`、
`SITEMAPPER_WAYBACK_FALLBACK=1`）或经由 `Sitemapper` 类，启用一个 FlareSolverr
实例或 Wayback Machine 回退。

## 为什么这很重要

**Crawl-delay**：一个声明 `Crawl-delay: 2` 的站点是在告诉你它希望被访问的速度。
无视它，你会被封禁——或者你会为所有人降低这个站点的质量。尊重它，你的抓取器就是在
公平地对待它。

**用 sitemap 取代爬取**：sitemap 列出了站点希望被索引的内容。盲目的链接爬取可能会
触及多达五倍的 URL 才找到相同的内容。有 sitemap 时就从 sitemap 开始；这对你更快，
对服务器也更轻。

**先定范围，再写代码**：有些站点在 robots.txt 中彻底禁止抓取；有些站点的 sitemap
已经包含了你所需的一切。花十秒钟运行 `discover()`，就能在投入编写解析器之前告诉你
自己处于哪种情况。

## 这个工具

```bash
pip install sitemapper
pip install sitemapper[stealth]   # adds curl_cffi TLS impersonation
```

将它作为库使用，或从命令行使用——`--json` 会输出完整的发现结果以便管道传递给其他
工具，`--crawl` 则加上链接图谱这一步：

```bash
python -m sitemapper https://example.com
python -m sitemapper https://example.com --crawl --max-pages 50 --json
```

它是自由软件，运行在你自己的硬件上。让每一个抓取器都从侦察开始。
