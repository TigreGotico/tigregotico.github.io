---
title: "Pronunciarlo Bene: Disambiguare gli Eterofoni Portoghesi per il TTS"
description: "Molte parole del portoghese europeo si scrivono allo stesso modo ma si pronunciano diversamente a seconda del significato — e sbagliare la vocale fa dire alla voce TTS la parola sbagliata. Abbiamo costruito bifonia-pt-homographs, un dataset aperto etichettato per significato di 56.891 frasi su 27 parole, e un minuscolo risolutore a zero dipendenze che raggiunge ≈94% dove i pesanti tagger POS si fermano a ≈75%."
date: 2026-06-12
lang: it
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Portuguese"
  - "TTS"
  - "Grapheme-to-Phoneme"
  - "NLP"
  - "Accessibility"
  - "FOSS"
draft: false
---

## Pronunciarlo Bene: Disambiguare gli Eterofoni Portoghesi per il TTS

Quando una voce sintetica legge "Tenho sede", un ascoltatore portoghese si aspetta di sentire *sete*. Ma la stessa identica grafia, `sede`, può anche significare *sede/quartier generale* — e le due si pronunciano con vocali diverse. Dicetela con la vocale sbagliata e la voce non suona solo strana; pronuncia ad alta voce una parola diversa. Per qualcuno che si affida al TTS per farsi leggere lo schermo, quella è la linea che separa l'intelligibile dal confuso.

Questo è un problema di front-end — la fase grafema-fonema che decide *quali suoni* mappa una parola, molto prima che un qualsiasi vocoder neurale trasformi quei suoni in audio. Nessuna quantità di qualità del vocoder lo risolve. Se il front-end sceglie la pronuncia sbagliata, la voce articola la parola sbagliata, nitidamente.

### Omografi eterofonici: stessa grafia, suono diverso, significato diverso

Il portoghese europeo è pieno di parole scritte in modo identico ma pronunciate con una qualità vocalica diversa — una vocale *aperta* contro una *chiusa* — dove la scelta corretta dipende dal **significato**, non solo dalla grammatica. Alcune:

- **`sede`** — *sete* (e chiusa, `ˈsedɨ`) contro *sede/sede centrale* (e aperta, `ˈsɛdɨ`). Entrambi sostantivi.
- **`forma`** — *stampo / teglia* (o chiusa, `ˈfoɾmɐ`, scritto *fôrma*) contro *forma / modo* (o aperta, `ˈfɔɾmɐ`).
- **`molho`** — *salsa* (o chiusa) contro *fascio* (o aperta).
- **`corte`** — *corte reale* (o chiusa) contro *un taglio* (o aperta).

Un sistema TTS ingenuo si impegna su una sola pronuncia per grafia. Così legge *sete* con la vocale di *sede centrale* — ogni volta — e l'ascoltatore sente la parola sbagliata.

### Perché "basta etichettare la parte del discorso" non funziona

La soluzione ovvia è far girare un tagger di parti del discorso (POS) sulla frase e scegliere la pronuncia in base al POS. Aiuta per alcune coppie, ma fallisce *per costruzione* ogni volta che due significati condividono una parte del discorso.

Prendete di nuovo `sede`. *Sete* e *sede centrale* sono **entrambi sostantivi**. Un tagger POS li etichetta in modo identico — non c'è alcun segnale grammaticale per distinguerli — quindi può solo indovinare la lettura più comune. Abbiamo misurato esattamente questo: sul nostro test set, sia spaCy sia Stanza segnano **0%** sul senso *sete* di `sede`. Scelgono sempre *sede centrale*. Lo stesso soffitto strutturale si presenta su `corte` (taglio contro corte), `forma` (stampo contro forma) e `molho` (salsa contro fascio): quando il significato si divide all'interno di una singola parte del discorso, la grammatica non lo vede.

### Il dataset: etichettare il significato, non la grammatica

Perciò abbiamo costruito un dataset aperto che etichetta ciò che conta davvero — il significato. **`bifonia-pt-homographs`** è composto da **56.891 frasi in portoghese europeo** che coprono **27 omografi eterofonici**. Ogni frase è etichettata con la parola, il suo **significato** (senso), la sua parte del discorso, la sua pronuncia IPA e una forma con diacritici ripristinati (per esempio *sêde* contro *séde*) che rende inequivocabile sulla pagina la lettura intesa.

La chiave di raggruppamento è il significato — è tutto il punto. Un singolo record ha questo aspetto:

```json
{
  "word": "sede",
  "sense": "thirst",
  "pos": "NOUN",
  "ipa": "ˈsedɨ",
  "sentence": "Depois da corrida tinha tanta sede que bebi um litro de água."
}
```

Le pronunce sono state verificate rispetto al dizionario [infopédia](https://www.infopedia.pt) (Porto Editora) anziché indovinate, e le suddivisioni train/test sono stratificate per `(word, meaning)`, così che un modello a valle — un BiLSTM, per dire — veda ogni senso in entrambe le metà. È pubblicato su Hugging Face come [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs).

### Quanto bene può essere risolto?

Con dati etichettati per significato, abbiamo potuto misurare come se la cavano i diversi approcci nello scegliere il significato corretto — e quindi la pronuncia corretta:

| Approccio | Accuratezza |
| --- | --- |
| Indovinare sempre il senso più comune | ≈53% |
| POS di spaCy → significato | ≈66% |
| POS di Stanza → significato | ≈75% |
| Regola `bifonia` + risolutore di significato | **≈94%** |

Gli approcci basati su POS si fermano esattamente dove ci si aspetterebbe: possono instradare per grammatica ma mai per significato, quindi le divisioni interne alla categoria dei sostantivi restano fuori portata. Il nostro risolutore — la libreria [`bifonia`](https://github.com/TigreGotico/bifonia), leggera e **completamente priva di dipendenze** — raggiunge il **≈94%**, e soprattutto tocca il **100%** sul caso `sede`/*sete* su cui i tagger POS ottengono lo **0%**.

Il titolo non è solo il numero. È che un componente piccolo, veloce e completamente aperto batte i pesanti tagger POS neurali su questo compito — perché risolve il *significato*, non solo la grammatica. Nessuna GPU, nessun download di modello, nessuna chiamata di rete.

### Perché conta

La pronuncia corretta è fondamentale, non cosmetica. I lettori di schermo e gli assistenti vocali sono il modo in cui gli utenti ciechi e solo-voce leggono il mondo, e un front-end che pronuncia male parole comuni degrada silenziosamente ogni frase che tocca. Correggere la disambiguazione degli eterofoni alla fonte significa che la voce dice ciò che il testo significa.

Poiché il dataset è aperto e il risolutore è minuscolo e forkabile, chiunque costruisca un front-end TTS portoghese può farlo bene senza un modello gigante — e lo stesso approccio si porta con pulizia a una lingua affine come il galiziano, dove la distinzione vocale aperta/chiusa crea la stessa trappola. I dati etichettati svolgono anche una doppia funzione: sono esattamente ciò che serve per addestrare modelli statistici compatti, come un classificatore per-parola, per i team che hanno il corpus e vogliono un risolutore appreso accanto a quello basato su regole.

### Provatelo

Il dataset è su Hugging Face all'indirizzo [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs), e il risolutore vive in [`bifonia`](https://github.com/TigreGotico/bifonia). Si inserisce nel più ampio lavoro di fonetica portoghese dietro **[NLP classico per il portoghese](/it/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** e lo **[stack grafema-a-IPA per oltre 350 lingue](/it/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** — piccoli pezzi deterministici che fanno pronunciare a una voce una lingua nel modo in cui i suoi parlanti la pronunciano davvero.
