---
title: "Making Synthetic Voices From Scratch"
description: "Creating a voice for a text-to-speech system usually requires a real person to spend hours recording audio. That’s expensive, time-consuming, and in many languages or accents, the voices just don’t exist at all"
date: 2025-06-26
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Synthetic Data"
  - "Voice Cloning"
  - "OVOS"
coverExternal: "https://github.com/OpenVoiceOS/ovos_assets/blob/master/ovos_tts.png?raw=true"
draft: false
---

## Making Synthetic Voices From Scratch

> This blog was originally posted in the [OpenVoiceOS blog](https://blog.openvoiceos.org/posts/2025-06-26-making-synthetic-voices-from-scratch)

### What’s the problem?

Creating a voice for a text-to-speech (TTS) system usually requires a real person to spend hours recording audio. That’s expensive, time-consuming, and in many languages or accents, the voices just don’t exist at all, especially for open-source or offline use.

### What did we do?

We developed a technique that allows us to **create synthetic voices completely from scratch**, even if we don’t have recordings from a real person. These voices:

* Work **offline**, even on small devices like a Raspberry Pi,
* Can speak any language, if there’s a good donor system available,
* Are fully customizable in sound and tone.

### How does it work?

1. **Start with an existing voice** - We use an existing TTS voice (from any source) to generate lots of fake speech and text pairs.

2. **Transform it into a new voice** - We apply a special voice conversion process to change the sound of the voice to something new, like a different gender, age, or accent.

3. **Train a compact model** - With this synthetic data, we train a new voice model that sounds natural, speaks fluently, and runs entirely offline.

### Why is this special?

* We can create a new voice **without needing anyone to record lines**.
* The voices don’t rely on cloud services, they work **100% offline**.
* Each voice can be **customized** to sound unique or to match a character, personality, or accent.

### What about ethics?

We take voice rights seriously.

* If we’re using a real person’s voice, we always get **clear permission**.
* If no permission is available, we use **public domain recordings** or create **original voices** that don’t copy anyone.
* Our process actually makes the voice **less recognizable**, which helps protect privacy and avoid impersonation risks.

### Real-world example

We applied this method to **European Portuguese**, a language that had no good offline voice options. In a short time, we built **4 brand-new, high-quality voices**, no recordings needed, and they all run on small local devices.

> 💡 Did we mention OpenVoiceOS now has a huggingface account? find all our TTS voices and more at [huggingface.co/OpenVoiceOS](https://huggingface.co/OpenVoiceOS)

---

### In short:

> We’ve found a way to build natural-sounding, offline-ready synthetic voices, **without needing a real speaker**. It’s fast, ethical, and opens the door for more voices in more languages, for everyone.

---

## Help Us Build Voice for Everyone 

If you believe that voice assistants should be open, inclusive, and user-controlled, we invite you to support OVOS: 

- **💸 Donate**: Your contributions help us pay for infrastructure, development, and legal protections. 

- **📣 Contribute Open Data**: Speech models need diverse, high-quality data. If you can share voice samples, transcripts, or datasets under open licenses, let's collaborate. 

- **🌍 Help Translate**: OVOS is global by nature. Translators make our platform accessible to more communities every day. 

We're not building this for profit. We're building it for people. And with your help, we can ensure open voice has a future—transparent, private, and community-owned. 

👉 [Support the project here](https://www.openvoiceos.org/contribution)

