---
title: "Un Dataset Multilingue di Tipi di Frase: Domande, Comandi, Affermazioni"
description: "Abbiamo pubblicato sentence-types-multilingual — quasi 70.000 frasi in sette lingue, classificate per tipo grammaticale (domanda, comando, affermazione, esclamazione). È il corpus di addestramento dietro la libreria di instradamento little_questions."
date: 2026-04-01
lang: it
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

La logica di instradamento di un assistente vocale dipende dal sapere che tipo di frase ha ricevuto prima di tentare di rispondere a qualsiasi cosa. Una domanda ha bisogno di una risposta. Un comando ha bisogno di essere eseguito. Un'affermazione potrebbe aver bisogno di un riscontro o di essere memorizzata. Azzeccare quella classificazione, in qualsiasi lingua l'utente parli, è il prerequisito per tutto il resto.

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** è il corpus di addestramento dietro quel livello — 69.300 frasi etichettate, 9.900 per ciascuna di sette lingue: inglese, spagnolo, francese, tedesco, italiano, portoghese e olandese.

## Cosa significano le etichette nella pratica

Il dataset usa un insieme piatto di sei etichette — una colonna `label` per riga, senza suddivisione tipo/sotto-tipo — che mappano direttamente sul modo in cui `little_questions` (la libreria di inferenza che consuma questi dati) instrada gli enunciati:

- **wh_question** — domande costruite attorno a una parola interrogativa (cosa, dove, chi, e così via).
- **polar_question** — domande sì/no. La tassonomia EAT all'interno di `little_questions` aggiunge 53 etichette granulari di tipo di risposta (persona, luogo, quantità, definizione, e così via) sopra le etichette di domanda, ma la classificazione del tipo di frase è il primo cancello.
- **command** — forme imperative. I comandi non si aspettano una risposta; si aspettano un'azione.
- **request** — richieste di azione cortesi o indirette, distinte da un imperativo nudo.
- **statement** — dichiarativa. Le affermazioni in un contesto di dialogo portano spesso una polarità che conta a valle: un classificatore sì/no/forse viene eseguito sulle affermazioni per interpretare le risposte a domande precedenti.
- **exclamation** — enunciati marcati emotivamente che necessitano di un trattamento diverso da quello delle dichiarative neutre.

```json
{
  "language": "en",
  "label": "wh_question",
  "text": "What time is it?"
}
```

## Perché la copertura interlinguistica non è banale

La stessa intenzione comunicativa si manifesta in modo diverso in grammatiche diverse:

- L'inglese marca le domande con l'inversione dell'ordine delle parole; il portoghese e lo spagnolo le marcano spesso con la sola punteggiatura e intonazione, lasciando intatto l'ordine delle parole.
- Il tedesco separa i verbi verso la posizione finale della frase in modi che spostano il luogo in cui risiede il segnale classificatore.
- Le lingue romanze usano una morfologia imperativa dedicata per i comandi che l'inglese esprime con il verbo nella sua forma nuda.

Un modello addestrato solo sull'inglese sbaglia questi casi ovunque altrove. Dati paralleli ed etichettati nelle sette lingue forniscono il segnale interlinguistico di cui i classificatori per lingua hanno bisogno — e la stessa pipeline di generazione si estende ad altre lingue man mano che vengono aggiunte.

## Lo stack a valle

I modelli addestrati su questi dati sono distribuiti all'interno di **[little_questions](https://github.com/TigreGotico/little_questions)** — una libreria offline senza dipendenze (numpy + onnxruntime) con classificatori ONNX per lingua per il tipo di frase e un modello di polarità sì/no per 43 lingue. I modelli sono inclusi nella wheel stessa per l'inglese e scaricati in modo lazy per le altre lingue. I classificatori del tipo di frase sono pubblicati come `TigreGotico/sentence-types` su HuggingFace; i classificatori del tipo di risposta EAT sono addestrati internamente e non rilasciati pubblicamente.

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` è il livello di instradamento del linguaggio naturale per OVOS e LILACS: classificare se un enunciato è una domanda, un comando o un'affermazione è la prima decisione di smistamento che una pipeline vocale prende.

[**sentence-types-multilingual su HuggingFace**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**little_questions su GitHub**](https://github.com/TigreGotico/little_questions)
