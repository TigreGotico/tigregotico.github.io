---
title: "Presentiamo il Primo Fonemizzatore per il Barranquenho"
description: "g2p_barranquenho è il primo convertitore aperto grafema-fonema per il barranquenho, la lingua di contatto ibero-romanza di Barrancos, Portogallo — regole derivate dalla convenzione ortografica recentemente pubblicata dal comune, verificabili rispetto alle fonti incluse nel repository."
date: 2025-12-12
lang: it
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) è il primo convertitore aperto grafema-fonema per il [barranquenho](https://en.wikipedia.org/wiki/Barranquenho), una lingua di contatto ibero-romanza parlata a Barrancos, Portogallo — un comune al confine spagnolo dove il portoghese e lo spagnolo estremegno/andaluso coesistono da secoli.

### Cosa rende il barranquenho fonologicamente interessante

Il barranquenho non è un dialetto né del portoghese né dello spagnolo; è un sistema autenticamente distinto. Il Consiglio Comunale di Barrancos ha recentemente pubblicato tre documenti fondativi — un dizionario, una convenzione ortografica e una grammatica di base — che hanno fornito le regole di cui avevamo bisogno. L'annuncio: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

Da quella convenzione ortografica abbiamo derivato l'insieme di regole. Il fonemizzatore esegue due passaggi sull'input in minuscolo:

1. **Passaggio dei digrammi** — collassa i grafemi multi-lettera: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/, e `qu`/`gu` prima di vocali anteriori → /k//g/.
2. **Passaggio dei grafemi** — mappa i restanti caratteri in IPA con regole sensibili al contesto: dittonghi nasali prima di `m`/`n` (per esempio, `an` → /ɐ͂/), `e` a fine parola → /ɨ/, `v` sempre → /b/, `s` sonorizzato in /z/ tranne a inizio parola, `r` vs `rr` (vibrante semplice vs multipla), e `h` come /h/ pronunciata — a differenza di entrambe le lingue madri.

Il grafema `x` ha la logica più complessa, ricorrendo alle euristiche contestuali del portoghese laddove la convenzione barranquenha tace.

In pratica:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ũ ẽjoɾmj pasu paɾɐ u bɐrɐ͂keɲu j paɾɐ ɐ kultuɾɐ bɐrɐ͂keɲɐ`

La libreria è un'unica funzione, `phonemize(word: str) -> list[str]`, senza dipendenze in fase di esecuzione — Python puro. I PDF di origine (convenzione, dizionario, grammatica) sono inclusi nella radice del repository affinché le regole siano verificabili rispetto alla loro fonte.

### Cosa viene dopo

Un convertitore G2P è il prerequisito minimo per il lavoro di TTS e ASR. Senza di esso, un modello addestrato sul testo non ha alcuna fondazione fonetica di principio. Con esso, il percorso verso un modello vocale barranquenho segue la stessa pipeline ibrida che abbiamo usato per l'asturiano e l'aragonese — l'ostacolo sono i dati vocali, non gli strumenti.

**Se dispone di registrazioni di barranquenho parlato o di accesso a parlanti disposti a contribuire sotto licenza aperta, si metta in contatto.** Le registrazioni di parlanti nativi, anche solo poche ore, renderebbero praticabile un modello TTS.

→ [g2p_barranquenho su GitHub](https://github.com/TigreGotico/g2p_barranquenho)
