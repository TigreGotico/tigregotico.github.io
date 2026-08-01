---
title: "Due Voci, Tutte le Lingue: Miro & Dii"
description: "TigreGótico si sta associando a OpenVoiceOS per dare all'assistente due identità vocali coerenti — Miro e Dii — che suonano allo stesso modo in ogni lingua, costruite con la nostra tecnologia di clonazione vocale e il motore phoonnx. Due modelli TTS per ogni lingua richiesta, lingue in via di estinzione incluse."
date: 2026-06-15
lang: it
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "OVOS"
  - "voice cloning"
  - "G2P"
  - "language inclusion"
draft: false
---

> **Ascoltatele ora:** la [Demo delle Voci](../../demo) esegue Miro e Dii dal vivo nel
> vostro browser — scegliete una lingua, digitate una frase e ascoltate. Nessuna installazione, nessun server.

Le persone ricordano la voce di un assistente più del suo nome. Perciò la domanda centrale della nostra collaborazione con [OpenVoiceOS](https://www.openvoiceos.org/) è pratica: a chi dovrebbe assomigliare l'assistente, in ogni lingua?

La risposta è **Miro** (maschile) e **Dii** (femminile) — due identità vocali che si mantengono in ogni lingua supportata da OpenVoiceOS. Un utente che configura l'assistente a Lisbona e in seguito passa al tedesco dovrebbe sentire lo stesso parlante familiare. Una voce di marca, tutte le lingue, di proprietà della comunità.

## Un'identità, molte lingue

Il modo consueto per ottenere una voce multilingue è addestrare un unico modello su molte lingue tutte insieme. Funziona, ma tende a sbavare il risultato: gli accenti tracimano da una lingua all'altra, la pronuncia diventa approssimativa e la voce perde la nitidezza di un parlante nativo.

Noi scegliamo la strada più difficile. Per ogni lingua costruiamo un modello **monolingue** — un modello, una lingua, addestrato per fare bene quella lingua. Il trucco che li lega insieme è la **clonazione vocale**: ogni modello monolingue di Miro è clonato dalla stessa identità di origine, e lo stesso vale per Dii. Il risultato è una famiglia di modelli per-lingua che parlano ciascuno come un nativo, eppure condividono tutti lo stesso timbro, lo stesso carattere, la stessa Miro-ità o Dii-ità. Ottenete pronuncia di qualità nativa *e* un'unica identità riconoscibile, invece di scambiare l'una con l'altra.

Questi modelli sono addestrati e serviti con [**phoonnx**](https://github.com/TigreGotico/phoonnx), il nostro framework TTS aperto — basato su VITS, esportato in ONNX, solo CPU. Le voci girano completamente offline; nessun cloud, nessuna chiave API, nessun dato che lascia il vostro hardware. Dentro OpenVoiceOS, il plugin `ovos-tts-plugin-phoonnx` si occupa di recuperarle e caricarle. Per la storia completa sull'hardware e l'architettura, vedete [TTS che Gira su una Patata](/it/blog/2026-05-10-tts-that-runs-on-a-potato).

## La ricerca su G2P che lo rende possibile

Parlare bene una lingua non riguarda solo la voce — riguarda il sapere come la scrittura *deve* suonare. Questo è il compito della conversione **grafema-fonema (G2P)**: trasformare il testo scritto nella sequenza di fonemi che il modello effettivamente pronuncia. Ogni nuova lingua che affrontiamo arriva con la propria ricerca su G2P, ed è in quella ricerca che vive gran parte del vero lavoro.

phoonnx è deliberatamente flessibile qui. Può pilotare un'intera gamma di phonemizer — eSpeak, Gruut, Epitran, il [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0) basato su modello, e strumenti specifici per lingua dove i motori generali non arrivano. Questo si collega direttamente al nostro più ampio stack di fonetica: la nostra **[ricerca ortografia-a-IPA](/it/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** e i **[phonemizer lusofoni](/it/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** che abbiamo costruito per la famiglia portoghese alimentano lo stesso obiettivo — IPA accurato per lingue che i grandi fornitori di TTS non si sono mai presi la briga di modellare con cura. Quando una lingua non ha un buon phonemizer pronto all'uso, quella lacuna *è* il progetto. Facciamo prima la ricerca grafia-a-suono, poi la voce segue.


## Due modelli per ogni lingua richiesta

Ecco l'offerta concreta, ed è il cuore della collaborazione: **per ogni lingua che qualcuno richiede, costruiremo due modelli TTS — Miro e Dii.** Non una tabella di marcia di forse-un-giorno; un impegno permanente. Chiedete una lingua, e la coppia universale arriva fino a lei.

E intendiamo *ogni* lingua, non solo quelle comode e commercialmente ovvie. Le voci che mancano al mondo raramente sono quelle con cento milioni di parlanti — sono le **lingue in via di estinzione e minoritarie** che il TTS mainstream ignora silenziosamente perché il mercato è troppo piccolo per valerne la pena. Sono esattamente quelle le lingue che vogliamo raggiungere: comunità che non hanno mai avuto una voce sintetica di alta qualità da poter chiamare propria, e che non hanno alcun motivo di aspettarsi che un fornitore della Silicon Valley la fornisca mai.

Questa non è una promessa per dopo. Al momento in cui scriviamo, la [**collezione di modelli TTS phoonnx**](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) su Hugging Face elenca 13 lingue con almeno una voce pubblicata, e 8 di queste — basco, arabo, portoghese europeo, **asturiano**, **aragonese**, **frisone**, occitano e spagnolo colombiano — hanno già sia Miro sia Dii disponibili.

## Aperto e auto-ospitato

Le voci sono **gratuite e open source**, girano **offline e auto-ospitate** così che nulla di ciò che dite lasci il vostro hardware, e l'intero stack — motore, phonemizer, ricerca su G2P, voci addestrate — è aperto perché una comunità possa prenderlo e mantenerlo.

Se la vostra lingua non è ancora nell'elenco, non è una porta chiusa — è una richiesta in attesa di essere fatta.
