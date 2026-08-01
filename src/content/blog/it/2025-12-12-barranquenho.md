---
title: "Presentiamo il Primo Fonemizzatore per il Barranquenho"
description: "g2p_barranquenho è il primo convertitore aperto grafema-fonema per il barranquenho, la lingua di contatto ibero-romanza di Barrancos, Portogallo — regole derivate dalla convenzione ortografica recentemente pubblicata dal comune, verificabili rispetto alle fonti incluse nel repository."
date: 2025-12-12
lang: it
updated: 2026-08-01
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

Da quella convenzione ortografica abbiamo derivato l'insieme di regole — ma anziché costruire a mano un passaggio su misura sul testo, esso vive come specifica linguistica, `ext-PT-x-barrancos`, nel motore condiviso **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)**. La tabella dei grafemi, le regole allofoniche, il modello dell'accento e il sandhi tra parole di quella specifica descrivono ogni realizzazione del barranquenho: i grafemi multi-lettera collassano come documentato dalla convenzione (`tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/), i dittonghi nasali compaiono prima di `m`/`n`, `v` mappa sempre a /b/, e `h` emerge come /h/ pronunciata — a differenza di entrambe le lingue madri.

`g2p_barranquenho` è di per sé un sottile wrapper lato chiamante attorno a `orthography2ipa.G2P` guidato da quella specifica: si occupa della normalizzazione del testo (normalizzazione delle maiuscole/minuscole, tokenizzazione nelle forme attese dalla specifica), dell'espansione dei numeri e di un'interfaccia stabile `phonemize`/`transcribe`, ma non delle regole fonologiche — migliorare una regola significa modificare la specifica a monte, così ogni consumatore a valle condivide la correzione.

In pratica:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ˈũ eˈnɔɾmi ˈpas̺u ˈpaɾɐ ˈu bɐrɐ̃ˈkɛɲu ˈi ˈpaɾɐ ɐ kuˈltuɾɐ bɐrɐ̃ˈkɛɲɐ`

I PDF di origine (convenzione, dizionario, grammatica) sono inclusi nella radice del repository affinché le regole siano verificabili rispetto alla loro fonte.

### Cosa viene dopo

Un convertitore G2P è il prerequisito minimo per il lavoro di TTS e ASR. Senza di esso, un modello addestrato sul testo non ha alcuna fondazione fonetica di principio. Con esso, il percorso verso un modello vocale barranquenho segue la stessa pipeline ibrida che abbiamo usato per l'asturiano e l'aragonese — l'ostacolo sono i dati vocali, non gli strumenti.

**Se dispone di registrazioni di barranquenho parlato o di accesso a parlanti disposti a contribuire sotto licenza aperta, si metta in contatto.** Le registrazioni di parlanti nativi, anche solo poche ore, renderebbero praticabile un modello TTS.

→ [g2p_barranquenho su GitHub](https://github.com/TigreGotico/g2p_barranquenho)
