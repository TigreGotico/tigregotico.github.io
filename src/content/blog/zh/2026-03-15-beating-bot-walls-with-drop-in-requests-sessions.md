---
title: "用可组合、即插即用的 requests 会话突破反爬机器人墙"
description: "我们如何在不于关键路径上启动无头浏览器的前提下，保持对公开数据的稳健访问：TLS 指纹伪装、用于 JS 挑战的 FlareSolverr 代理、Wayback Machine 回退，以及 IP 轮换——全部封装在两个可组合的 requests.Session 子类 unblock_requests 和 anon_requests 之后。"
date: 2026-03-15
lang: zh
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

我们的许多工作——媒体元数据客户端、目录增强、归档——都依赖于可靠地读取
**公开的**网页。问题很少出在数据本身，而是出在它前面的那堵墙。而这堵墙会问
两个相互独立的问题：

- **"你是什么？"**——Cloudflare 及同类服务拦截请求，并不是因为你*请求了什么*，
  而是因为你在网络层面上*看起来怎么样*：你的 TLS 握手、你的 JA3 指纹、你是否
  能够运行一个 JavaScript 挑战。
- **"你是谁？"**——IP 信誉和速率限制完全无视你的指纹；它们统计的是有多少请求
  来自同一个地址。

这两个问题彼此正交，所以我们用两个能干净叠加的小型库来分别回应它们：
**unblock_requests** 回答*你是什么*，**anon_requests** 回答*你是谁*。两者在
日常代码中都是 `requests` 会话的即插即用替代品。本文专门讨论这一传输层——
网络字节这一部分——而不涉及位于其上的解析或流水线。

## 设计约束：保持 `requests` 的形态

`unblock_requests` 的会话是 `requests.Session` 的子类，只重写了
`request()`——其余的一切（`.get()`、`.post()`、cookie、请求头、上下文管理器
语义）都是继承来的，所以任何针对 `requests.Session` 编写的类型化代码都能原封
不动地接受它们。`anon_requests` 的会话则是包装而非子类化——它们暴露相同的动词
方法和上下文管理器接口，但在每次轮换时都会重建其内部会话：

```python
from unblock_requests import CloudflareSession   # alias: Session
import requests

s = CloudflareSession(flaresolverr_url="http://your-flaresolverr-host:8191")
html = s.get("https://www.progarchives.com/artist.asp?id=1").text
assert isinstance(s, requests.Session)            # True
```

整套伦理立场与工程立场都浓缩在这一行里：我们不是在把浏览器当作用户来自动化，
而是在为本就公开的数据打造一个*稳健的 HTTP 客户端*。没有任何带界面的浏览器会
在任何人的屏幕上弹出，关键路径上也无需任何显示器。

## 第一层：`unblock_requests` 及其传输方式

`unblock_requests` 防御的是**机器人检测**。你通过 `mode=` 关键字参数（或
`UNBLOCK_REQUESTS_TRANSPORT` 环境变量——显式关键字参数总是优先）来选择传输
方式。主要有四种：

| 模式 | 作用 |
|---|---|
| `curl_cffi` *（默认）* | 通过 `curl_cffi` 进行 Chrome 的 TLS/JA3 伪装。在大多数网络上无需额外基础设施即可通过机器人检测。 |
| `requests` | 纯 `requests`，无伪装。 |
| `flaresolverr` | 通过一个解决 JS 挑战的 FlareSolverr 无头浏览器进行代理转发——**实时**数据。 |
| `wayback` | 读取 Internet Archive 最新的快照——过时，但什么都不需要。 |

默认的 `curl_cffi` 是最省事的胜利。大多数"你是机器人"的裁决，归根结底是 TLS
指纹不匹配：原生 `requests`（经由 OpenSSL）的握手与 Chrome 毫无相似之处。
`curl_cffi` 会伪装成一个真实的 Chrome 构建版本（默认 `impersonate="chrome"`），
于是握手和 JA3 都对得上，检测便直接通过。没有执行任何 JavaScript，也没有启动
任何浏览器。

当某个站点升级到真正的交互式 JS 挑战时，`curl_cffi` 就不够用了——必须有东西
来运行这个挑战。这就是 `flaresolverr` 模式的用武之地：一个你自行托管的
[FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) 实例在你的进程
**之外**用无头浏览器完成求解，而 `unblock_requests` 只是向它发送 POST 请求，
并从响应中提取出解好的 HTML。设置 `flaresolverr_url` 会自动选择此模式：

```python
CloudflareSession(flaresolverr_url="http://host:8191")          # solve live
CloudflareSession(mode="wayback")                              # force archive
CloudflareSession(flaresolverr_url="http://host:8191",
                  wayback_fallback=True)                       # live, archive on failure
```

## 优雅降级到归档

基础设施也有不顺的时候——FlareSolverr 宕机了、站点无法访问、挑战此刻无解。
与其让整个任务失败，会话可以回退到 **Wayback Machine**。挑战检测是启发式的：
一个小小的 `is_challenge()` 辅助函数会嗅探响应体的开头部分，寻找 Cloudflare
拦截页的标志性标记（"just a moment"、`challenge-platform`、`cf_chl_opt`、
`cf-mitigated`）。在一次被拦截的 GET 请求中，如果 `wayback_fallback` 已开启，
会话就会通过 `archive.org` 的可用性 API 解析出最新的快照，并返回其原始字节
（即 `…id_/` 原始形式，没有工具栏，也不改写链接）。archive.org 没有被
Cloudflare 拦截，所以纯 `requests` 就能到达它。

有两点值得了解的实现细节：在 `wayback` 和 `flaresolverr` 模式下，结果是一个
根据获取到的 HTML *合成*但货真价实的 `requests.Response`——所以 `stream=`、
自定义适配器和连接池在那里并不适用，而 `requests`/`curl_cffi` 模式则完全是
原生的。而且回退只对 GET 请求触发；我们绝不会悄悄地从归档中重放一个具有副作用
的请求。

## 第二层：`anon_requests` 与 IP 轮换

正交的那个问题是 **IP 信誉**。即便指纹完美无缺，只要所有请求都来自同一个地址，
照样会遭到速率限制或封禁。`anon_requests` 用 `RotatingProxySession`（抓取来的
公共代理，可选校验，SOCKS5/HTTP）和 `RotatingTorSession`（轮换的 Tor 电路）
来处理这一点。每个请求都从一个新的出口发出，连接失败时死掉的代理会被轮换
淘汰。

```python
from anon_requests import RotatingProxySession, ProxyType

with RotatingProxySession(proxy_type=ProxyType.SOCKS5, validate=True) as s:
    print(s.get("https://ipecho.net/plain", timeout=5).text)  # a new IP each time
```

## 组合：轮换**与**绕过一步到位

这两个库的设计初衷是叠加而非重叠。`anon_requests` 的会话接受一个
`session_factory`——任何返回 `requests.Session` 的可调用对象，默认为
`requests.Session`。轮换和代理设置会被应用到该工厂返回的任何东西上。因此，你
把一个 `CloudflareSession` 作为工厂注入进去，就能从单个对象获得这两种行为：

```python
from anon_requests import RotatingProxySession
from unblock_requests import CloudflareSession

session = RotatingProxySession(
    session_factory=lambda: CloudflareSession(flaresolverr_url="http://host:8191"),
)
session.get(url)   # rotates the IP *and* solves Cloudflare
```

轮换的代理会贯穿*每一种*传输方式——包括进入 FlareSolverr 内部，它通过求解请求
的 `proxy` 字段来驱动其无头浏览器。这样一来，解决挑战的 IP 就与请求其余部分
所用的轮换 IP 完全相同：不会出现指纹与出口节点分离、让防御方察觉的情况。

## 为何是这种形态

把每个关注点都放进各自轻薄的 `requests.Session` 子类里，意味着调用方只需选择
自己所需的东西——只要 TLS 伪装、完整的轮换加求解栈，或介于两者之间的任何组合
——只需替换一个构造函数，而无需重写他们的 HTTP 代码。那件昂贵、笨重的工具
（一个真正的浏览器）留在 FlareSolverr 里、留在进程*之外*，只有当一个 JS 挑战
确实需要时才被召唤；常见情况只是一次廉价的伪装握手。而当实时网页拒绝时，归档
会作答。

`session_factory` 这道接缝正是组合发生的地方，它让这两个库能够各自独立地扩展：
给 `unblock_requests` 添加一种传输模式，`anon_requests` 就能免费地把它组合进来。
对公开数据的稳健访问，干净利落地完成。

两者都是 FOSS 且可自行托管：
[`unblock_requests`](https://github.com/TigreGotico/unblock_requests) 和
[`anon_requests`](https://github.com/TigreGotico/anon_requests)。

这些传输方式驱动着我们所有的 **[音乐数据库爬虫](/zh/blog/2026-04-20-music-database-scrapers)**。在构建任何爬虫之前进行站点侦察，请参阅 **[sitemapper](https://github.com/TigreGotico/sitemapper)** 以及 **[关于 robots.txt 和 sitemaps 的文章](/zh/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**。
