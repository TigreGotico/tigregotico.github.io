---
title: "If Everyone Ships an App, We'll Ship Voice: Turning Websites Into Voice Apps"
description: "Every site that matters got wrapped in a mobile app. We propose the opposite move for the voice and CLI era: a clean API plus a voice skill per site, so the web becomes browsable by ear and by keyboard. One site at a time, it adds up to a voice browser."
date: 2026-07-04
author: "Casimiro Ferreira"
tags:
  - "Voice"
  - "Accessibility"
  - "OpenVoiceOS"
  - "Web Automation"
  - "CLI"
  - "FOSS"
draft: false
---

Sometime in the last fifteen years, the web quietly decided that every
important site also needs a mobile app. Not because HTML stopped working, but
because an app is a *controlled surface*: a curated set of actions, no
browser chrome (menus, tabs, and address bars) you didn't choose, an
interface built for one way of interacting.

We think the same move is waiting to be made for a different set of users and a
different set of interfaces. If everyone turns their site into an Android app,
**we can turn sites into voice apps**, and command-line apps, and
screen-reader-native flows. Same idea, opposite direction: wrap a site in a
surface built for how *you* want to interact with it, except the surface is
your voice and your terminal instead of a touchscreen.

## The web is barely usable by ear

For a sighted user with a mouse, a modern site is fine. For someone browsing by
voice, or through a screen reader, or from a terminal, most of the web is a
hostile environment: infinite-scroll walls, cookie banners, pop-ups, menus that
need a pointer, content buried under three layers of interactive cruft. The
information is in there. Getting it out, hands-free, is miserable.

The usual answer is "sites should be more accessible," and they should. But we
are not going to fix the whole web by asking nicely. What we *can* do is take
the sites that matter and build a clean, spoken interface to each one, the way
the app stores did for touch, but for voice and CLI, and openly.

## Two layers: a clean API, then a voice skill

Every one of these voice apps is two pieces stacked, and we already build both.

**Layer one is a typed client that turns a site into an API.** This is exactly
our [scraping and API-reverse-engineering work](/blog/2026-04-20-music-database-scrapers):
it reaches into a site that has no usable public interface and hands back
structured, typed objects instead of brittle HTML. Verbs, not scraping:

```python
from py_bandcamp import BandCamp

for release in BandCamp.search_albums("king gizzard"):
    artist = release.work.credits[0].entity.name if release.work.credits else ""
    print(release.work.title, artist, release.uri)
```

The recon and
[anti-bot transport](/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)
tooling underneath keeps that access working as the site changes. That client
is already useful on its own: for a terminal user the API *is* the accessible
version of the website. Our SoundCloud client even ships `nds`, a command-line
app for searching and playing music with no browser in sight. Once a site is an
API, it stops being a visual artifact and becomes something a machine, or a
voice pipeline, can drive.

**Layer two is an OVOS plugin that speaks that API.** On top of the client sits
an [OpenVoiceOS](https://openvoiceos.org) plugin that maps spoken intents to
API calls and narrates the results with our
[offline TTS voices](/blog/2026-06-15-two-voices-every-language-miro-and-dii).
It is deliberately *not* a bespoke skill per site, because that road leads to
dozens of one-off skills nobody can maintain. For anything media-shaped it is
an [OCP](https://openvoiceos.github.io/ovos-technical-manual/) provider plugin:
one small adapter that exposes a site's search-and-play surface to the whole
Open Common Play framework, so "search", "play", "next", and "resume" already
work the same way they do for every other source. The site drops into a
uniform voice interface instead of inventing its own.

The result: "Play the SomaFM Groove Salad channel." "Search Bandcamp for
Creative-Commons ambient." The website, turned into something you can use
without looking at it, and without a new grammar to learn for every site.

## In the age of LLMs, a typed API is a natural-language UI waiting to happen

There is a second reason this shape matters more now than it would have five
years ago. A clean, typed client is exactly what a large language model needs
to become a *natural-language front-end* to a website.

Give an LLM a documented set of functions, such as `search_albums`,
`get_recommendations`, and `stream_url`, and it will happily translate "find me
something like Naxatras but heavier" into the right calls, chain them, and
speak the result back. The structured API is the hard part. The conversational
interface on top is increasingly something the model just *provides*, as long
as the tools it is handed are well-typed and honest about what they return.
Messy HTML gives an LLM nothing to hold onto. A typed client gives it a control
surface.

So our website clients ship a **`SKILL.md`**, a plain-language
description of what the API does, its verbs, its return types, and example
calls, written for an agent to read. Point an LLM-driven assistant at it and the
client becomes a tool the model can use immediately: no glue code, no bespoke
integration, just "here is what this site can do, in words." One document turns
a scraper into something a language model can operate on your behalf.

It is the same structured data serving three front-ends at once: a **CLI** for
terminal users, an **OCP/voice plugin** for hands-free use, and an **LLM tool**
for natural-language control. Build the API once; wear it three ways.

## Why this matters most for people who can't see the screen

For blind and low-vision users this is not a convenience feature. It is the
difference between access and exclusion. A screen reader can only read what a
page exposes cleanly, and most pages don't. A dedicated voice app skips the page
entirely: it goes to the structured data and speaks *that*, in a flow designed
for listening from the first line of code.

It is the same principle behind our
[audio-first games](/games), built for ears, not eyes, with blind players as
the primary audience rather than an afterthought. Voice apps for websites extend
that principle from games to the rest of the web.

## One site at a time, but the direction is a voice browser

Here is the honest part: there is no universal shortcut. You cannot voice-enable
"the web" in one shot, because every site is its own tangle. It has to be done
**per site**: one client, one skill, one carefully-mapped set of intents at a
time. That sounds like a limitation, and in the short term it is.

But look at where the accumulation points. Each site we wrap is one more corner
of the web that is now reachable by voice and by CLI. String enough of them
together (a common metadata vocabulary, a shared voice layer, a consistent set
of "search / open / read / play / next" intents) and you are no longer looking
at a pile of separate skills. You are looking at the beginnings of a **voice
browser**: a way to move through the web by talking, where individual sites are
just destinations that already know how to answer.

The mobile era's bet was that a site worth using is worth an app. Ours is that a
site worth using is worth a *voice*. We build them one at a time, in the
open, and each one makes the web a little more browsable for people the
visual web left behind.

Want a specific site turned into a voice or CLI app, for accessibility, for
your product, or just because it should exist? [Let's talk.](/services)
