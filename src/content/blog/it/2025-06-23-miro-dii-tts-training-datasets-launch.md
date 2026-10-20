---
title: "Dati di Addestramento TTS Miro & Dii: 40 Dataset Pubblici in 20 Locale"
description: "Abbiamo pubblicato 40 dataset di addestramento sintetici per le voci Miro e Dii in portoghese, neerlandese, tedesco, francese, italiano, giapponese, spagnolo e altro ancora. Clonazione vocale su larga scala: ogni lingua ottiene due identità coerenti."
date: 2025-06-23
updated: 2026-10-20
lang: it
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Voice"
  - "Datasets"
  - "Miro & Dii"
  - "Multilingual"
  - "FOSS"
draft: false
---

## Cosa stiamo pubblicando

Tutti i **40 dataset di addestramento sintetici** usati per costruire Miro e Dii — le identità vocali che abbiamo sviluppato in collaborazione con OpenVoiceOS. La raccolta copre portoghese europeo, portoghese brasiliano, neerlandese, tedesco, francese, italiano, giapponese, spagnolo, rumeno, polacco, svedese, hindi, danese, farsi, inglese, basco e altro ancora. Ogni dataset segue una convenzione di denominazione coerente: `tts-train-synthetic-miro_pt-PT`, `tts-train-synthetic-dii_pt-BR`, `tts-train-synthetic-miro_nl-NL`, e così via per ogni coppia di lingue.

Ogni dataset è completamente sintetico — testo generato abbinato ad audio sintetizzato in layout LJSpeech, senza sessioni in studio — ed è rilasciato con la licenza CC-BY-NC-ND-4.0, che consente l'uso non commerciale con attribuzione e non consente opere derivate né l'uso commerciale. La fonemizzazione avviene in fase di addestramento in phoonnx, appoggiandosi alla nostra [ricerca su G2P per oltre 350 lingue](/it/blog/2026-01-15-grapheme-to-ipa-for-350-languages).

## Come l'identità vocale rimane coerente tra le lingue

Non addestriamo un unico blocco multilingue sperando che l'accento si sistemi da solo. Ogni lingua ottiene un **modello monolingue** — addestrato per suonare come un madrelingua di quella lingua. L'identità condivisa tra i modelli deriva dalla **clonazione vocale**: ogni modello Miro e ogni modello Dii è clonato dalla stessa voce di origine prima di essere adattato a una nuova lingua. Il timbro, il carattere, la qualità riconoscibile della voce — questo si trasferisce. L'accento no, deliberatamente.

La conseguenza pratica: un parlante portoghese, un parlante neerlandese, un parlante giapponese — tutti inequivocabilmente **la stessa persona**, ognuno con un suono nativo.

## Perché pubblicare i dati di addestramento

Un checkpoint senza i suoi dati di addestramento è una scatola nera. Pubblicarli rende la voce **verificabile** (puoi vedere esattamente da cosa ha imparato) e **riproducibile** (esegui `phoonnx_train` sugli stessi dati e ottieni lo stesso risultato). La licenza non consente opere derivate: estendere i dati, affinarli per un dialetto o costruirci sopra un nuovo parlante richiede quindi il nostro permesso.

Questo conta soprattutto per le lingue a basse risorse presenti in questo elenco. Quando i dati di addestramento sono pubblici, la comunità che parla una lingua può vedere e verificare da cosa è stata costruita la propria voce — senza aspettare che un fornitore decida che è commercialmente interessante.

## Dove trovare tutto

Tutti i dataset e i modelli addestrati risiedono sotto [**TigreGotico su HuggingFace**](https://huggingface.co/TigreGotico), con checkpoint vocali compatibili con Piper anche replicati sotto [OpenVoiceOS](https://huggingface.co/OpenVoiceOS).

Per il framework di inferenza e addestramento che utilizza questi dataset, vedi [**phoonnx**](https://github.com/TigreGotico/phoonnx).
