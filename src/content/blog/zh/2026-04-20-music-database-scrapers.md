---
title: "隆重推出我们的音乐数据库抓取器"
description: "带你了解我们维护的一系列类型化 Python 客户端，覆盖各类音乐来源——Bandcamp、SoundCloud、SomaFM、TuneIn、iHeartRadio，以及各大音乐百科全书——它们全部通过一个简洁的接口输出一致的、类型化的媒体元数据，并共用同一套合规、低请求量的 HTTP 传输层。"
date: 2026-04-20
lang: zh
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Scrapers"
  - "Media Metadata"
  - "Music"
  - "Python"
  - "FOSS"
draft: false
---

## 一个接口，涵盖整个音乐网络

音乐网络分散在许多各自独立的网站上。Bandcamp 卖给你一个 FLAC 文件和一份知识共享许可证；SoundCloud 播放着别处找不到的混音；SomaFM 运营着一组由听众赞助的电台频道；而不少社区运营的网站则维护着关于前卫摇滚、爵士、古典和金属乐的精心整理的百科全书。每个网站都有自己的标记结构、自己的怪癖，甚至对"曲目"到底是什么都有自己的一套理解。

我们维护着一系列小巧、专注的开源 Python 客户端，用来驯服这团混乱。它们每一个在本质上都做着同样的事：伸手探入某个音乐来源，然后把 **类型化的媒体元数据模型** 交还给你——是经过校验的对象，而非脆弱的字典——这样你其余的代码就永远不必关心数据究竟来自哪个网站。九个客户端中有七个发布在 PyPI 上；另外两个则直接从 GitHub 安装。它们说着同一套词汇。

下面就来逐一介绍。

## 流媒体与电台

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** 抓取 Bandcamp：搜索曲目、专辑、艺人和厂牌；按流派标签浏览；从一个种子拉取推荐和相关艺人；并提取可播放的 MP3 URL。搜索会返回类型化的 `Release` 对象，携带标题、封面、流派、演职员信息，以及——对于重视 FOSS 的人尤为关键的——一个 SPDX 风格的许可证字段，并带有 `is_open()` 检查，让你能区分一份知识共享发行版和一份保留所有权利的发行版。完整保真的专辑转换会按需填充有序的曲目列表。

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** 是我们的 SoundCloud 客户端，也是这一系列中的瑞士军刀。三个独立的后端——一个元数据丰富的 API 后端、一个零依赖的 HTML 抓取器，以及一个 yt-dlp 后端——坐落在一个协调器之后，后者会从一个后端优雅地回退到下一个。它搜索曲目和人物，解析直接流 URL（渐进式或 HLS），下载曲目和整个播放列表，甚至还附带一个终端应用 `nds`，供你在命令行搜索和播放。返回的发行版携带编解码器、比特率、流派、国家、SPDX 许可证以及完整的合集曲目列表。

**[radiosoma](https://github.com/TigreGotico/radiosoma)** 封装了 SomaFM 的公开频道 API。SomaFM 处于这个光谱中友好、开放 API 的那一端，客户端对它建模得干净利落：每个频道是一件作品，而 **每一种流编码**——130 kbps AAC、256 kbps MP3、64 与 32 kbps HE-AAC——都成为该频道自己的一个 `Release`，这样使用方就能挑选最合适的一个，并按身份去重。近期曲目源以一份整洁的播放时间表呈现。

**[tunein](https://github.com/TigreGotico/tunein)** 是一个非官方的 TuneIn 客户端，覆盖全世界的线性电台和 IPTV 台。快速路径只返回搜索载荷；一个可选的富化调用会补上流派、语言、国家、呼号和口号。因为 TuneIn 会为每个电台返回多个流 URL——不同的比特率、镜像和协议——每个都成为自己的一个 `Release`，同样让使用方在播放时自行选择。一个小巧的 CLI 为你提供表格或 JSON 输出。

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** 与 iHeartRadio 的公开 API 对话——无需密钥，无需账户。搜索电台、播客、艺人、曲目和播放列表；检索带有直接音频流 URL 的播客单集；并依靠并行的详情抓取，让电台和艺人查询并发运行。每个模型都提供 `to_external_ids()` 和 `to_signals()` 辅助方法，可直接嵌入类型化的元数据管道。

## 音乐百科全书与档案库

这一系列的后半部分瞄准那些伟大的社区目录。

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)**（Prog Archives）、**[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)**（Jazz Music Archives，两者都直接从各自的 GitHub 仓库安装而非通过 PyPI）和 **[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)**（Classical Archives）有着几乎一致的形态：浏览 A–Z 索引、按名称搜索、抓取一个完整的艺人或作曲家页面，附带传记、国家以及会员评分的唱片目录。Prog 和 Jazz Archives 抓取 HTML；Classical Archives 封装一个公开的 JSON API，并暴露某作曲家的专辑 *以及* 一棵递归展开的作品树。每个模型都通过 `to_external_ids_dict()` 携带该网站稳定的规范 id，这正是你交叉引用两个目录时所需要的。

**[pymetal](https://github.com/TigreGotico/pymetal)** 是我们面向 Encyclopaedia Metallum（金属档案库）的客户端——也是这一系列中最雄心勃勃的一个。大多数抓取器会把一首曲目压平成 `(id, title, band, album)`。pymetal 拒绝丢失金属档案库单独保留的信息：一首曲目可以归属于 **多个乐队**（拼盘、合作），一支乐队的 **阵容会随时间切分**，而一首曲目可以 **出现在多个发行版上**（合辑、再版、单曲）。它把每一者都建模为以档案 id 为键的一等实体，因此重新抓取是幂等的。其端点覆盖面很广——高级的乐队/专辑/歌曲搜索、带有拼盘上各乐队归属的完整发行页、按状态分区并带角色时间范围的阵容、评论、推荐、外部链接和歌词——全部作为可通过 JSON 往返的 Pydantic v2 模型。

除了音乐之外，**[tutubo](https://github.com/TigreGotico/tutubo)** 抓取 YouTube 和 YouTube Music，而 **[pymal](https://github.com/TigreGotico/pymal)** 覆盖 MyAnimeList——把同样的类型化元数据模式扩展到更广泛的媒体类别。它们全部输出同一套词汇，因此单一的下游使用方可以统一地处理一切。

## 为合规、低请求量的访问而生

这些客户端只抓取公开的目录页面，请求量很低，并且会在抓取前检查各站点的 `robots.txt`——参见
**[关于 robots.txt 与 sitemap 的文章](/zh/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**
了解这一侦察步骤是如何工作的。在整个系列中，HTTP 层是 **可插拔的**：客户端默认使用一个 TLS 握手与真实浏览器相符的传输层（`curl_cffi`，匹配 Chrome 的 TLS/JA3），这样一个行为得体的客户端就不会被那些针对脚本化滥用调优的检测系统误判为恶意自动化程序。由 Cloudflare 挡在前面的百科全书还可以额外通过一个 FlareSolverr 实例来获取实时数据，或者以互联网档案馆的 Wayback Machine 作为回退。解析层刻意独立于 HTML 的到达方式，因此无论你选择哪种传输，同一套代码都能工作。

## 一个跨来源的音乐目录

真正的回报，发生在你不再把这些当作九个独立工具的时候。因为它们全部输出同一套类型化的元数据词汇，也全部暴露规范的外部 id，你可以把单个艺人在 Bandcamp、SoundCloud、电台目录和百科全书之间散布展开，然后把结果折叠进一个连贯的目录——按身份去重、感知许可证、可直接喂给推荐引擎、媒体服务器或研究数据集。

这些客户端每一个都是自由软件，可自托管，在你自己的硬件上运行，无需任何 API 密钥。挑选你在意的来源：如果它在 PyPI 上就 `pip install`，否则对于只在 GitHub 上发布的 pyprogarchives 和 pyjazzmusicarchives，用 `pip install git+https://github.com/TigreGotico/<repo>`——然后开始构建。

所有抓取器都搭载我们的 **[可组合、即插即用的 requests 会话](/zh/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**。流媒体与电台客户端直接输出 **[mediavocab](https://github.com/TigreGotico/mediavocab)** 模式，且每个客户端都暴露规范的外部 id，因此音乐元数据可与 **[media-archivist](https://github.com/TigreGotico/media-archivist)**（我们的跨来源索引器与去重元数据服务器）集成。
