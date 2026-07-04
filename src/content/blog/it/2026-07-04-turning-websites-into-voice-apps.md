---
title: "Se Tutti Lanciano un'App, Noi Lanciamo la Voce: Trasformare i Siti Web in App Vocali"
description: "Ogni sito che conta è finito avvolto in un'app mobile. Proponiamo la mossa opposta per l'era della voce e della CLI: un'API pulita più una skill vocale per sito, così che il web diventi navigabile con l'orecchio e con la tastiera. Un sito alla volta, tutto sommato dà un browser vocale."
date: 2026-07-04
lang: it
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

A un certo punto negli ultimi quindici anni, il web ha deciso silenziosamente che
ogni sito importante ha bisogno anche di un'app mobile. Non perché l'HTML abbia
smesso di funzionare — ma perché un'app è una *superficie controllata*: un insieme
curato di azioni, senza cromatura che non avete scelto, un'interfaccia costruita per
un unico modo di interagire.

Pensiamo che la stessa mossa sia in attesa di essere fatta per un diverso insieme di
utenti e un diverso insieme di interfacce. Se tutti trasformano il proprio sito in
un'app Android, **noi possiamo trasformare i siti in app vocali** — e in
applicazioni da riga di comando, e in flussi nativi per lettori di schermo. La stessa
idea, nella direzione opposta: avvolgere un sito in una superficie costruita per il
modo in cui *voi* volete interagire con esso, tranne che la superficie è la vostra
voce e il vostro terminale invece di un touchscreen.

## Il web è appena usabile con l'orecchio

Per un utente vedente con un mouse, un sito moderno va bene. Per qualcuno che naviga
con la voce, o attraverso un lettore di schermo, o da un terminale, la maggior parte
del web è un ambiente ostile: muri di scroll infinito, banner dei cookie, pop-up,
menu che richiedono un puntatore, contenuto sepolto sotto tre strati di paccottiglia
interattiva. L'informazione è lì dentro. Tirarla fuori, a mani libere, è una miseria.

La risposta abituale è "i siti dovrebbero essere più accessibili", e dovrebbero. Ma
non aggiusteremo l'intero web chiedendolo con gentilezza. Ciò che *possiamo* fare è
prendere i siti che contano e costruire un'interfaccia parlata e pulita per ciascuno
— come hanno fatto gli app store per il tocco, ma per la voce e la CLI, e in modo
aperto.

## Due livelli: un'API pulita, poi una skill vocale

Ognuna di queste app vocali è composta da due pezzi impilati, e noi già li
costruiamo entrambi.

**Livello uno — un client tipizzato che trasforma un sito in un'API.** Questo è
esattamente il nostro [lavoro di scraping e reverse-engineering di API](/it/blog/2026-04-20-music-database-scrapers):
raggiungere un sito che non ha alcuna interfaccia pubblica utilizzabile e restituire
oggetti strutturati e tipizzati anziché HTML fragile — verbi, non scraping:

```python
from py_bandcamp import BandCamp

for release in BandCamp.search_albums("king gizzard"):
    artist = release.work.credits[0].entity.name if release.work.credits else ""
    print(release.work.title, artist, release.uri)
```

Gli strumenti di ricognizione e di
[trasporto anti-bot](/it/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)
sottostanti mantengono quell'accesso funzionante man mano che il sito cambia. Quel
client è già utile di per sé: per un utente di terminale l'API *è* la versione
accessibile del sito web — il nostro client SoundCloud include persino `nds`,
un'applicazione da riga di comando per cercare e riprodurre musica senza un browser
in vista. Una volta che un sito è un'API, smette di essere un artefatto visivo e
diventa qualcosa che una macchina — o una pipeline vocale — può pilotare.

**Livello due — un plugin OVOS che parla quell'API.** Sopra il client si appoggia un
plugin [OpenVoiceOS](https://openvoiceos.org) che mappa gli intenti parlati a
chiamate API e narra i risultati con le nostre
[voci TTS offline](/it/blog/2026-06-15-two-voices-every-language-miro-and-dii). Non è,
deliberatamente, una skill su misura per sito — quella strada porta a dozzine di
skill isolate che nessuno riesce a mantenere. Per qualsiasi cosa abbia forma
multimediale è un plugin fornitore
[OCP](https://openvoiceos.github.io/ovos-technical-manual/): un piccolo adattatore
che espone la superficie di ricerca-e-riproduzione di un sito all'intero framework
Open Common Play, così che "cerca", "riproduci", "successivo" e "riprendi" funzionino
già allo stesso modo in cui funzionano per ogni altra fonte. Il sito si inserisce in
un'interfaccia vocale uniforme invece di inventare la propria.

Il risultato: "Riproduci il canale Groove Salad di SomaFM." "Cerca su Bandcamp
ambient Creative-Commons." Il sito web, trasformato in qualcosa che potete usare
senza guardarlo — e senza una nuova grammatica da imparare per ogni sito.

## Nell'era degli LLM, un'API tipizzata è un'interfaccia in linguaggio naturale in attesa di accadere

C'è una seconda ragione per cui questa forma conta più ora di quanto conterebbe
cinque anni fa. Un client pulito e tipizzato è esattamente ciò di cui un grande
modello linguistico ha bisogno per diventare un *front-end in linguaggio naturale*
per un sito web.

Date a un LLM un insieme documentato di funzioni — `search_albums`,
`get_recommendations`, `stream_url` — e tradurrà allegramente "trovami qualcosa come
i Naxatras ma più pesante" nelle chiamate giuste, le concatenerà e ne pronuncerà il
risultato. L'API strutturata è la parte difficile; l'interfaccia conversazionale al
di sopra è sempre più qualcosa che il modello semplicemente *fornisce*, purché gli
strumenti che gli vengono consegnati siano ben tipizzati e onesti su ciò che
restituiscono. L'HTML disordinato non dà a un LLM nulla a cui aggrapparsi. Un client
tipizzato gli dà una superficie di controllo.

Perciò i nostri client per siti web includono un **`SKILL.md`** — una descrizione in
linguaggio semplice di ciò che l'API fa, dei suoi verbi, dei suoi tipi di ritorno e
di esempi di chiamate, scritta perché un agente la legga. Puntate un assistente
guidato da LLM su di esso e il client diventa uno strumento che il modello può usare
immediatamente: nessun codice di collegamento, nessuna integrazione su misura, solo
"ecco cosa può fare questo sito, a parole". Un documento trasforma uno scraper in
qualcosa che un modello linguistico può operare per vostro conto.

Sono gli stessi dati strutturati a servire tre front-end contemporaneamente: una
**CLI** per gli utenti di terminale, un **plugin OCP/vocale** per l'uso a mani
libere, e uno **strumento LLM** per il controllo in linguaggio naturale. Costruite
l'API una volta; indossatela in tre modi.

## Perché questo conta di più per chi non può vedere lo schermo

Per gli utenti ciechi e ipovedenti questa non è una funzionalità di comodità — è la
differenza tra accesso ed esclusione. Un lettore di schermo può leggere solo ciò che
una pagina espone in modo pulito, e la maggior parte delle pagine non lo fa. Un'app
vocale dedicata salta la pagina del tutto: va ai dati strutturati e pronuncia
*quelli*, in un flusso progettato per l'ascolto fin dalla prima riga di codice.

È lo stesso principio dietro i nostri
[giochi audio-first](/it/games) — costruiti per le orecchie, non per gli occhi, con i
giocatori ciechi come pubblico principale anziché come ripensamento. Le app vocali
per i siti web estendono quel principio dai giochi al resto del web.

## Un sito alla volta — ma la direzione è un browser vocale

Ecco la parte onesta: non esiste una scorciatoia universale. Non si può abilitare
alla voce "il web" in un colpo solo, perché ogni sito è il suo groviglio. Deve essere
fatto **per sito** — un client, una skill, un insieme di intenti mappato con cura
alla volta. Sembra una limitazione, e nel breve termine lo è.

Ma guardate dove punta l'accumulo. Ogni sito che avvolgiamo è un angolo in più del
web ora raggiungibile con la voce e con la CLI. Mettetene insieme abbastanza — un
vocabolario di metadati comune, un livello vocale condiviso, un insieme coerente di
intenti "cerca / apri / leggi / riproduci / successivo" — e non state più guardando un
mucchio di skill separate. State guardando gli inizi di un **browser vocale**: un
modo di muoversi attraverso il web parlando, dove i singoli siti sono solo
destinazioni che già sanno come rispondere.

La scommessa dell'era mobile era che un sito che vale la pena usare vale un'app. La
nostra è che un sito che vale la pena usare vale una *voce*. Li stiamo costruendo uno
alla volta, in modo aperto, e ognuno di essi rende il web un po' più navigabile per
le persone che il web visivo ha lasciato indietro.

Volete un sito specifico trasformato in un'app vocale o da riga di comando — per
l'accessibilità, per il vostro prodotto, o solo perché dovrebbe esistere?
[Parliamone.](/it/services)
