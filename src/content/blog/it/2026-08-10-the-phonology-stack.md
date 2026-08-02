---
title: "Come si Incastra lo Stack di Fonologia"
description: "Un tour architetturale del nostro stack testo-in-pronuncia: scriptconv per la notazione, orthography2ipa come motore grafema-in-IPA multilingue, frontend specifici per lingua costruiti sopra di esso per portoghese, basco, mirandese, barranquenho e arabo, e phonematcher per la ricerca basata sul suono. Mostra perché esistono i livelli, cos'è una lattice di candidati e output dialettali reali."
date: 2026-08-01
lang: it
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "Linguistics"
  - "FOSS"
draft: false
---

Prendiamo la parola inglese "read". Scritta, non dice come pronunciarla. "I read the book yesterday" e "I read the book every day" usano le stesse cinque lettere per due suoni diversi — uno fa rima con "red", l'altro con "reed". Uno screen reader, un assistente vocale o una casella di ricerca che guardino solo l'ortografia non possono farlo correttamente. Devono ragionare sulla pronuncia, non solo sul testo.

Quel problema di ragionamento — trasformare le parole scritte nei suoni che rappresentano — è ciò che il nostro stack di fonologia risolve. Questo articolo è una mappa di come i suoi pezzi si incastrano, dalla notazione grezza fino ai motori di pronuncia specifici per lingua e alla ricerca basata sul suono.

## Alcuni termini, definiti chiaramente

Alcune parole che ricorrono in tutto l'articolo:

- **Grafema**: un simbolo scritto — una lettera, o una combinazione di lettere come "ch".
- **Fonema**: un'unità distinta di suono in una lingua, come il suono "k" in "cat".
- **IPA** (Alfabeto Fonetico Internazionale): un alfabeto standard per scrivere i suoni con precisione, indipendentemente dall'ortografia di qualsiasi lingua. "Cat" si scrive `kæt` in IPA.
- **G2P** (grafema-in-fonema): il problema generale di convertire l'ortografia in suono.
- **Allofono**: una realizzazione variante dello stesso fonema a seconda del contesto — la "t" in "top" e la "t" in "stop" sono lo stesso fonema in inglese ma vengono pronunciate leggermente in modo diverso.
- **Sillabazione**: dividere una parola in sillabe, ad esempio "extraordinário" in `ex-tra-or-di-ná-ri-o`.
- **Omografo**: due parole scritte allo stesso modo ma con significati diversi; un **omografo eterofonico** (o eterofono) è un omografo pronunciato diversamente a seconda del significato inteso, come "read"/"read" sopra.
- **Morfologia**: la struttura interna delle parole — prefissi, radici, suffissi, flessioni.
- **Etichettatura delle parti del discorso (POS)**: etichettare ogni parola di una frase come sostantivo, verbo, aggettivo e così via.

## Il problema centrale

L'ortografia è una codifica con perdita del suono. Tre fattori distinti la rendono difficile da invertire:

1. **Ambiguità.** Le stesse lettere possono mappare a suoni diversi a seconda del significato, della grammatica o della pura irregolarità ("read" sopra; l'inglese ne è pieno).
2. **Dialetto.** La stessa parola, nella stessa lingua, si pronuncia diversamente a seconda della provenienza del parlante. Il portoghese europeo e quello brasiliano condividono l'ortografia ma non le vocali.
3. **Copertura.** La maggior parte delle lingue del mondo non ha alcun dizionario di pronuncia curato professionalmente. Un sistema G2P che funziona solo tramite tabella di lookup è un sistema che funziona solo per una manciata di lingue.

Qualsiasi tentativo serio di text-to-speech, dati di addestramento per il riconoscimento vocale, o ricerca foneticamente consapevole deve affrontare tutti e tre.

## Perché lo stack è a livelli

Lo stack divide il problema in livelli che non hanno bisogno di conoscersi a vicenda:

- **Notazione** — convertire tra alfabeti fonetici e sistemi di scrittura. Non ha nulla a che vedere con la fonologia di una lingua particolare; è traduzione di simboli.
- **Fonologia** — mappare l'ortografia in IPA per una data lingua, usando una specifica del suo sistema sonoro.
- **Gestione delle eccezioni specifiche per lingua** — le parole irregolari, le stranezze dialettali, gli omografi e la struttura morfologica che un motore generale non può dedurre dalle sole regole ortografiche.

Tenere questi livelli separati è una decisione di design, non un caso, e ha un beneficio diretto: aggiungere una nuova lingua significa scrivere una **specifica** (dati che descrivono il suo sistema sonoro), non un nuovo programma. Il motore che consuma la specifica, la ricerca sulla lattice, il tokenizzatore, le metriche di distanza — nulla di tutto ciò viene riscritto. Il livello di notazione sottostante è condiviso da ogni lingua, incluse quelle di cui il motore di fonologia non ha mai sentito parlare.

### Il livello di notazione: scriptconv

[scriptconv](https://github.com/TigreGotico/scriptconv) è un nucleo senza dipendenze per la notazione fonetica e la gestione dei sistemi di scrittura: rilevamento del sistema di scrittura ISO-15924, conversioni IPA da e verso ARPABET, X-SAMPA, Lexique, Kirshenbaum, Cotovía e notazione RFE, traslitterazione Buckwalter per l'arabo, decomposizione dell'Hangul in jamo, e gestione dei kana. Nulla di tutto ciò richiede di sapere a quale lingua appartenga una parola — una stringa di fonemi in IPA si converte in ARPABET allo stesso modo indipendentemente dalla lingua sorgente:

```python
>>> import scriptconv as s
>>> s.ipa_to_arpa("kæt")
'K AE T'
>>> s.ipa_to_xsampa("kæt")
'k{t'
```

Ogni livello sopra questo può presupporre che la conversione di notazione sia già risolta.

### Il motore: orthography2ipa

[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) è il motore multilingue. Prende una specifica di lingua — una descrizione dichiarativa delle regole grafema-in-fonema di quella lingua — e un pezzo di testo, e produce IPA. Al momento in cui scriviamo include specifiche che coprono **820 lingue** (`available_codes()` sul pacchetto installato restituisce un elenco di quella lunghezza; considerate la cifra esatta come un bersaglio mobile, poiché le specifiche vengono aggiunte nel tempo).

```python
>>> import orthography2ipa as o
>>> len(o.available_codes())
820
```

Il motore stesso non ha alcun codice specifico per lingua incorporato. Una nuova lingua è un nuovo file di specifica, verificato rispetto allo stesso schema di ogni altra specifica.

## La lattice: candidati classificati, non un'unica ipotesi

Dato il problema di ambiguità sopra, impegnarsi su un unico output per parola è spesso sbagliato. orthography2ipa produce invece una **lattice** — un insieme di pronunce candidate classificate — e lascia che i livelli superiori la restringano usando un contesto che il motore stesso non possiede (significato, parte del discorso, una voce di lessico).

Riprendiamo "read":

```python
>>> from orthography2ipa import G2P
>>> g = G2P("en")
>>> g.transcribe("read")
'ɹiːd'
>>> g.candidates("read")
[IPAPath('ɹiːd', score=0.0), IPAPath('ɹɛd', score=1.0)]
```

Senza ulteriore contesto il motore restituisce la sua migliore ipotesi (tempo presente, costo minore) ma mantiene l'alternativa (tempo passato) sulla lattice con il suo costo associato. Un componente a valle che sa che la frase è al passato può scegliere il secondo candidato invece del primo. Questa è la stessa idea usata, su scala più ampia, da bifonia (sotto) per gli eterofoni portoghesi: una lattice di uso generale fornisce i candidati, un livello più ristretto e meglio informato sceglie tra essi.

## I dialetti sono cittadini di prima classe

Due parlanti della stessa lingua possono pronunciare la stessa frase in modo diverso, e uno stack di fonologia che tratta il "portoghese" come un unico sistema sonoro fisso sbaglierà ogni dialetto tranne uno. orthography2ipa espone la gestione dei dialetti direttamente — `available_profiles()` sul pacchetto installato elenca profili di dialetto e letto come `lisbon`, `porto`, `estremenho`, `galician`, e altri — e [tugaphone](https://github.com/TigreGotico/tugaphone), il frontend portoghese costruito su di esso, fonemizza la stessa frase attraverso le varietà lusofone. Ecco una frase eseguita attraverso tutti e cinque i dialetti supportati:

| Dialetto | Output |
|---|---|
| pt-PT (Portogallo) | `ˈbõ ˈdiɐ ˈkomu eˈʃta vɔˈse` |
| pt-BR (Brasile) | `ˈbõ ˈdʒiɐ ˈkɔ̃mʊ eˈsta voˈse` |
| pt-AO (Angola) | `ˈbõ ˈdiɐ ˈkomʊ eˈsta vɔˈse` |
| pt-MZ (Mozambico) | `ˈbõ ˈdiɐ ˈkomu eˈsta vɔˈse` |
| pt-TL (Timor Est) | `ˈbõ ˈdiə ˈkoɔmʊ eˈsta vɔˈse` |

("Bom dia, como está você?" — "Buongiorno, come stai?") Lo scheletro consonantico resta riconoscibile in tutti e cinque, ma due marcatori ben noti li separano immediatamente. In "dia", il portoghese brasiliano trasforma la `d` prima di una `i` in `dʒ`, il suono all'inizio dell'inglese "jam" — gli altri mantengono una `d` semplice. In "está", il portoghese europeo pronuncia la `s` alla fine di una sillaba come `ʃ`, la "sh" di "shoe", mentre ogni altra varietà mantiene `s`. Un dizionario di pronuncia costruito sulle regole di un dialetto sbaglia entrambi questi aspetti per l'ascoltatore di ogni altro dialetto.

[euskaphone](https://github.com/TigreGotico/euskaphone) fa lo stesso per i dialetti baschi, costruito direttamente sulla lattice di orthography2ipa anziché su un motore separato:

```python
>>> from euskaphone import EuskaPhonemizer
>>> EuskaPhonemizer().phonemize_sentence("Kaixo, zer moduz zaude?")
'kai̯ʃo s̻er modus̻ s̻au̯de'
```

## I frontend specifici per lingua

Sopra il motore condiviso siedono frontend che aggiungono ciò che una specifica generale non può: parole irregolari, un lessico curato, sandhi (cambiamenti sonori ai confini di parola) e override specifici del dialetto.

- **[tugaphone](https://github.com/TigreGotico/tugaphone)** — portoghese, attraverso pt-PT, pt-BR, pt-AO, pt-MZ e pt-TL, che combina un lessico curato con un ripiego basato su regole (mostrato sopra).
- **[euskaphone](https://github.com/TigreGotico/euskaphone)** — basco, consapevole del dialetto, costruito sulla stessa lattice (mostrato sopra).
- **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** — mirandese, la lingua asturleonese della Terra de Miranda, Portogallo, con sandhi tra parole, allofonia e accento:

  ```python
  >>> from mwl_phonemizer import phonemize
  >>> phonemize("Falo la lhéngua mirandesa.")
  'ˈfalu lɐ ˈʎɛŋɡwa miɾɐˈndez̺ɐ.'
  ```

- **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** — il primo G2P aperto per il barranquenho, la lingua di contatto ibero-romanza di Barrancos, al confine tra Portogallo e Spagna. Vedi **[Presentiamo il Primo Fonemizzatore per il Barranquenho](/it/blog/2025-12-12-barranquenho)** per come le sue regole siano state derivate dalla convenzione ortografica dello stesso comune.
- **[arbtok](https://github.com/TigreGotico/arbtok)** — arabo, costruito sulla lattice di orthography2ipa, che aggiunge la diacritizzazione consapevole del dialetto e copre l'arabo standard moderno, classico e diverse varietà regionali. La scrittura araba di norma omette i segni delle vocali brevi di cui un fonemizzatore ha bisogno, perciò il compito principale di arbtok è recuperarli prima di passare il risultato al motore condiviso. È mantenuto da qualcuno che non parla arabo come madrelingua, perciò trattatelo come in sviluppo attivo piuttosto che come un riferimento finito e revisionato da un madrelingua — utile, ma il punto in cui verificare l'output rispetto a un parlante nativo prima di distribuirlo in qualcosa rivolto agli utenti.

Ognuno di questi frontend è un sottile livello di logica specifica per lingua sopra lo stesso motore a lattice condiviso e lo stesso livello di notazione condiviso sottostante. Nessuno di essi reimplementa la conversione IPA o la ricerca sulla lattice.

## Strumenti di supporto per il portoghese

Il portoghese ha lo stack più profondo, perché la pronuncia portoghese dipende da più delle sole regole ortografiche: dipende dalla struttura sillabica, dalla classe di parola e a volte dal puro significato.

- **[silabificador](https://github.com/TigreGotico/silabificador)** divide le parole in sillabe usando regole realizzate a mano:

  ```python
  >>> from silabificador import syllabify
  >>> syllabify("extraordinário")
  ['ex', 'tra', 'or', 'di', 'ná', 'ri', 'o']
  ```

- **[tugalex](https://github.com/TigreGotico/tugalex)** è il lessico dietro tugaphone: trascrizioni IPA, dati sillabici e regole ortografiche per parole reali, così che il vocabolario comune e irregolare non debba essere ri-derivato dall'ortografia ogni volta.
- **[tugatagger](https://github.com/TigreGotico/tugatagger)** avvolge diversi backend di etichettatura POS (spaCy, Stanza, un tagger in stile Brill, un ripiego euristico senza dipendenze) dietro un'unica interfaccia, così che altri strumenti possano chiedere "che parte del discorso è questa parola" senza impegnarsi su un backend specifico.
- **[tugamorph](https://github.com/TigreGotico/tugamorph)** è un analizzatore morfologico basato su regole: segmenta una parola in prefisso, radice, suffisso, flessione e clitico, usando solo la libreria standard di Python, opzionalmente affinato da silabificador e tugatagger.
- **[bifonia](https://github.com/TigreGotico/bifonia)** risolve gli omografi eterofonici del portoghese europeo — parole come "sede" (sete, `ˈsedɨ`, contro sede aziendale, `ˈsɛdɨ`) dove la pronuncia corretta dipende dal significato, non dalla grammatica. Vedi **[Dirlo Bene: Disambiguare gli Eterofoni Portoghesi per il TTS](/it/blog/2026-06-12-disambiguating-portuguese-heterographs-for-tts)** per come è stato costruito e valutato. Questo è il caso concreto dietro l'idea di lattice sopra: orthography2ipa può fornire entrambe le letture candidate di "sede", ma solo un livello consapevole del significato come bifonia può scegliere tra esse.

Per saperne di più su come silabificador e tugaphone lavorano insieme quotidianamente, vedi **[NLP Classico per il Portoghese: Sillabazione e Grafema-in-Fonema](/it/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, e per il motore più ampio sotto tutto questo, **[Grafema-in-IPA per 820 Lingue](/it/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**.

## Ricerca basata sul suono: phonematcher

Tutto ciò che precede trasforma il testo in suono. [phonematcher](https://github.com/TigreGotico/phonematcher) lavora con le rappresentazioni sonore stesse: calcola la distanza fonetica tra simboli IPA e fa ricerca fuzzy su liste di parole in base a come le parole suonano anziché a come sono scritte.

```python
>>> from phonematcher.distance import phonetic_distance
>>> phonetic_distance('b', 'p')   # voiced vs. voiceless bilabial stop — very similar
0.043478260869565216
>>> phonetic_distance('p', 'k')   # bilabial vs. velar stop — less similar
0.34782608695652173
>>> phonetic_distance('a', 'k')   # vowel vs. consonant — maximally different
1.0
```

Quella metrica di distanza è utile in due situazioni concrete: cercare un catalogo di parole o nomi in base a come qualcosa suona anziché alla sua ortografia esatta (utile per interfacce vocali tolleranti ai refusi e per far corrispondere prestiti linguistici tra sistemi di scrittura diversi), e confrontare quanto siano fonologicamente vicini due letti imparentati — lo stesso tipo di confronto che la tabella dei dialetti sopra fa a occhio, ma calcolato anziché stimato. phonematcher non è su PyPI; si installa dal sorgente (`pip install -e .` sul checkout GitHub, più `rapidfuzz`).

## Limiti onesti

La copertura tra 820 specifiche di lingua è disomogenea per costruzione: le lingue con una letteratura fonologica consolidata e un lessico producono un output migliore delle lingue con una specifica sottile dedotta perlopiù da convenzioni ortografiche generali. La qualità è costantemente migliore dove esiste un lessico curato — il portoghese, sostenuto da tugalex, è il caso più solido dello stack; le lingue che si affidano solo alle regole della specifica senza un lessico gestiranno male il vocabolario irregolare e i prestiti.

Alcuni componenti non sono esplicitamente riferimenti finiti e revisionati da madrelingua: arbtok è mantenuto da un parlante non nativo dell'arabo e dovrebbe essere verificato rispetto al giudizio di un madrelingua prima dell'uso in qualcosa rivolto agli utenti. I frontend costruiti su specifiche sottili ereditano quella sottigliezza — un frontend vale quanto la specifica e il lessico che ha sotto.

## Perché questo conta se la vostra lingua non ha strumenti vocali

La maggior parte delle lingue del mondo non ha una voce TTS commerciale, nessun modello STT commerciale, e nessun dizionario di pronuncia mantenuto professionalmente. Il design a livelli sopra descritto significa che colmare quel divario non richiede di costruire un motore di fonologia da zero: richiede di scrivere una specifica per il sistema sonoro della lingua di destinazione e, dove possibile, un lessico delle sue parole irregolari. Il motore a lattice, le conversioni di notazione e gli strumenti di ricerca ci sono già. Se la vostra lingua, il vostro dialetto o il vostro prodotto hanno bisogno di supporto alla pronuncia che ancora non esiste, è il tipo di lavoro che affrontiamo — vedi **[i nostri servizi](/it/services)** o **[contattateci](/it/contact)**.
