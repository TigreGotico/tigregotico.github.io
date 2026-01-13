# HiveMind-core v4.0: AGPL, History, and the Path Forward

Sometimes necessity doesn’t just spark invention, it drags you along and forces you to make something you didn’t know you needed. HiveMind started exactly like that.

Around **2015**, I moved from Windows to Linux. Soon after my main laptop broke, leaving me stuck with a barely functional **32-bit relic**. Mycroft was too heavy to run locally, but a friend lent me access to a server (hello Chris Schantz, if you’re reading this!). The plan: run Mycroft on the server and access it from my laptop. To do that, I needed middleware to bridge the two. And thus, **HiveMind** was born — a tiny, chaotic, stubborn little project that would grow into a full network-first voice middleware.

This early hack pushed me deeper into Mycroft contributions and eventually led to the creation of **OpenVoiceOS (OVOS)**. But let’s be clear: **HiveMind is my personal project, not an OVOS Foundation project**. 

OVOS integration happens naturally; it’s modular, and HiveMind can leverage its plugins: STT, TTS, WakeWord, and even the listener code for satellites. But you don’t need OVOS at all, HiveMind can run **any “brain” or agent**, from OVOS to a straight-up LLM. Satellites don’t care; they just work. Modularity rocks.

---

## HiveMind Through the Ages

HiveMind has evolved through necessity, experimentation, and stubbornness:

1. **TCP sockets (2015)** - proof-of-concept: can two machines even talk?
2. **WebSockets** - more reliable communication, fewer broken dreams.
3. **Multiple simultaneous transport protocols** - HTTP on one port, WebSockets on another, satellites don’t blink.
4. **Modular plugin architecture** - custom transports, binary audio streams, fully replaceable brains. Drop-in compatible, edge devices oblivious.

Now HiveMind is a **network-first transport + authentication middleware**, designed for distributing agents (brains) across any number of devices. Replace the brain? Just plug in a different agent. Use an LLM? Satellites don’t care. Permissions may not fully apply in that case (no skills/intents to allow/block), but all infrastructure still works.

---

## License Change: AGPL as a Necessary Evil

Let’s be honest: AGPL is not glamorous. I’ve criticized GPL before; the “my kind of freedom is better than yours” discourse gets old. GPL projects can use my Apache code, but I can’t use theirs. HiveMind will become **less free for commercial usage**, but users arguably gain more protections. FSF and the Linux world would probably approve.

Why AGPL?

* **Networked deployments:** HiveMind is almost always used across multiple devices. AGPL ensures modifications remain open.
* **Sustainability:** Commercial users who want to avoid AGPL will pursue a **commercial license**, letting me focus on HiveMind development instead of chasing business leads. Indirectly, OVOS also benefits, since it’s the reference agent implementation.
* **FOSS sanity:** SSPL, open-core, or inventing a new license would be **FOSS suicide** or contribute to license proliferation. AGPL is the pragmatic compromise.
* **GAFAM? Not our audience:** Big players will implement their own alternatives anyway. Copyleft doesn’t scare them into licensing HiveMind; and that’s fine. AGPL protects the community and small-to-medium businesses, not the already-resourced giants.

> 💡 **Non-profits and permissively licensed projects** (MIT, BSD, Apache-2.0, etc.) are eligible for **no-cost commercial licenses**. Contributions to the ecosystem are considered sufficient — just reach out.

---

## Sustainable Development: Why This Matters

Historically, HiveMind has often taken a backseat to OVOS. OVOS has a vibrant, active community, many eyes on the code, people willing to help with support, and lots of real-world testing. HiveMind, by contrast, is **niche, networked, and complex**. If I don’t work on it, it doesn’t get done. If I don’t provide support, no one else can.

For years, I’ve been chasing business leads and grant opportunities just to keep the lights on, which means HiveMind ideas often stayed in my head; some lost forever, some only half-remembered. This is not sustainable, and it’s not fair to the project or its potential users.

The AGPL v4.0 change and the introduction of commercial licensing are **not about locking things down**. They’re about creating a **reliable, funded pathway** to dedicate time to HiveMind development:

* To implement long-standing features that have been waiting for years.
* To improve stability, performance, and usability in real-world networked deployments.
* To ensure that when someone asks “how do I do X with HiveMind?” there’s a real, maintained answer.

In short, sustainable funding ensures HiveMind can grow **intentionally**, instead of being a series of half-baked ideas lost to time or postponed indefinitely. It’s about giving this project the attention it deserves and keeping the chaos under control, in the best possible way.

---

## Looking Ahead: OVOS 2026 and Beyond

Thanks to the [**NLnet NGI Zero fund**](https://blog.openvoiceos.org/posts/2025-10-20-ngi), the **OVOS bus messages** will be standardized in 2026. Think **“OVOS Protocol via HiveMind”** — because apparently [everything is called a protocol in the age of LLMs, so why not us?](https://blog.openvoiceos.org/posts/2025-10-24-protocol_interoperability)

* HiveMind used to be basically “get message from A to B.”
* OVOS 2026 introduces a **defined inventory of valid messages**. Arbitrary messages are still possible.
* Replacing the brain is standardized: a **hivemind-agent-plugin** translates OVOS Protocol messages to whatever your brain expects — OVOS, LLMs, A2A, Wyoming, whatever.

This keeps HiveMind satellites fully **drop-in compatible**, modular, and future-proof.


---

## What This Means

* HiveMind stays **open-source and usable**, even with AGPL.
* OVOS continues as the reference agent, while HiveMind grows independently.
* Commercial users now have a **clear licensing path**, funding sustainable development.
* Sustainable, funded development, so I can finally tackle some of those long-forgotten ideas.

From a broken laptop in university to fully-featured, network-first middleware, HiveMind has always been about **solving real problems, enabling communities, and letting chaos work beautifully**. AGPL v4.0 is a **necessary evil**, ensuring HiveMind can grow sustainably, protect contributions, and avoid the trap of pseudo-FOSS licenses.
