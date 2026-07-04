---
title: "Creare Voci Sintetiche da Zero"
description: "Creare una voce per un sistema di sintesi vocale richiede di solito che una persona reale trascorra ore a registrare audio. È costoso, richiede tempo e, in molte lingue o accenti, le voci semplicemente non esistono affatto"
date: 2025-06-26
lang: it
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Synthetic Data"
  - "Voice Cloning"
  - "OVOS"
draft: false
---

> Questo blog è stato originariamente pubblicato sul [blog di OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-06-26-making-synthetic-voices-from-scratch)

Una buona voce TTS offline per il portoghese europeo non esisteva. La registrazione in studio è costosa, richiede mesi e, nella maggior parte delle lingue del mondo, le registrazioni semplicemente non sono mai state fatte. Così ne abbiamo costruite quattro da zero — senza cabina di registrazione, senza doppiatore, senza cloud.

### La pipeline in tre passaggi

**1. Generare coppie di parlato sintetico.** Usiamo una voce TTS esistente come donatrice — qualsiasi fonte in grado di produrre audio intelligibile — e la eseguiamo su un ampio corpus di testo per produrre migliaia di coppie audio/testo. La voce donatrice non deve essere di alta qualità. Deve solo essere abbastanza coerente da poter imparare da essa.

**2. Applicare la conversione vocale.** Un passaggio di conversione vocale trasforma il timbro della donatrice in una nuova identità — genere, età o personaggio diversi. L'audio risultante suona come la voce target, non come la donatrice. È qui che nasce una nuova personalità.

**3. Addestrare un modello VITS compatto.** L'audio convertito diventa il set di addestramento per un piccolo modello ad architettura VITS tramite [phoonnx_train](https://github.com/TigreGotico/phoonnx). Il modello finito viene esportato in ONNX e funziona interamente offline — su un Raspberry Pi se necessario.

### Salvaguardie etiche

Se la donatrice è la voce di una persona reale, otteniamo prima il permesso esplicito. Quando nessun permesso è possibile, usiamo registrazioni di pubblico dominio o generiamo una voce completamente originale che non copia l'identità di nessuno. Il passaggio di conversione vocale ha anche un'utile proprietà per la privacy: l'output è acusticamente distinto abbastanza dalla donatrice da rendere trascurabile il rischio di impersonificazione.

### Applicato al portoghese europeo

Il portoghese europeo non aveva alcuna voce offline aperta di alta qualità. Abbiamo prodotto quattro voci — comprese le identità Miro e Dii che ora sono le voci OVOS predefinite per `pt-PT` — usando esattamente questa pipeline. Funzionano comodamente su hardware modesto, non richiedono alcuna connessione a internet e i dati di addestramento sono [pubblicati apertamente](https://huggingface.co/TigreGotico) affinché chiunque possa riprodurle o estenderle.

Tutti i modelli e i dataset risiedono su [huggingface.co/OpenVoiceOS](https://huggingface.co/OpenVoiceOS) e [huggingface.co/TigreGotico](https://huggingface.co/TigreGotico).
