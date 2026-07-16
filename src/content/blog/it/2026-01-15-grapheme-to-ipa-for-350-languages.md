---
title: "Grafema-in-IPA per 676 Lingue"
description: "orthography2ipa è una risorsa a dati puri, linguisticamente fondata, che mappa l'ortografia in IPA e modella come i fonemi si realizzano come allofoni attraverso ~750 specifiche di lingua, 676 lingue e più di 20 famiglie linguistiche. Una lattice di candidati, lignaggio dialettale e un insieme di specifiche validato tramite schema e citato alla letteratura dialettologica — senza pesi addestrati, completamente auto-ospitabile."
date: 2026-01-15
lang: it
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** è un pacchetto Python a dati puri — JSON dichiarativo, logica sottile e pluggabile, senza pesi addestrati — che mappa l'ortografia in IPA e modella come quei fonemi si realizzano nel contesto. Include **~750 specifiche di lingua che coprono 676 lingue** (più 73 nodi di clade solo per la classificazione) attraverso **più di 20 famiglie linguistiche**. Installalo, leggi i dati, fai un fork dei dati. Nulla è nascosto in un checkpoint.

È il livello di fonologia sotto tutto ciò che sta a valle: la lattice di candidati che produce è consumata dal frontend TTS arabo [arbtok](https://github.com/TigreGotico/arbtok), dagli stack portoghesi [TugaPhone](https://github.com/TigreGotico/tugaphone) e [silabificador](https://github.com/TigreGotico/silabificador) (vedi **[NLP classico per sillabe e fonemi del portoghese](/it/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), dal [fonemizzatore del barranquenho](/it/blog/2025-12-12-barranquenho), dal fonemizzatore del mirandese e dalla fondazione fonemica del **[TTS che gira su una patata](/it/blog/2026-05-10-tts-that-runs-on-a-potato)**.

## Due mappe, non una

La distinzione critica: una **mappa di grafemi** ti dice quali fonemi un'ortografia *può* rappresentare. Una **mappa di allofoni** ti dice come un fonema *si realizza* nel contesto. Confondere le due è la modalità di fallimento più comune nei sistemi di G2P.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

Il ⟨th⟩ inglese è genuinamente ambiguo tra /θ/ e /ð/ — questo è un fatto di ortografia-in-fonema. Il /t/ inglese compare come un'occlusiva semplice, un'occlusiva aspirata, un'occlusiva glottidale o un flap, a seconda di dove cade — questo è un fatto di fonema-in-realizzazione. Tenere le due separate significa che puoi andare da *testo → candidati fonema* per la trascrizione e da *fonema → realizzazione di superficie* per la modellazione della pronuncia, senza che l'una corrompa l'altra. Per il TTS è la differenza tra un accento credibile e uno robotico; per l'ASR è la differenza tra un lessico che corrisponde a ciò che la gente dice davvero e uno che corrisponde al dizionario.

## Cosa porta con sé ogni lingua

Ogni lingua è una dataclass `LanguageSpec` congelata, e porta con sé molto più di un elenco di fonemi: grafemi (inclusi digrammi e trigrammi), una mappa di allofoni, **grafemi posizionali** per sostituzioni sensibili al contesto (inizio parola, intervocalico, prima di /i/), **ascendenza** ponderata con più antenati, **regole di sandhi** tra parole, un **inventario tonale** opzionale e la provenienza — un `QualityTier` che percorre `stub → skeleton → research → production`, un `ScriptType` (alfabeto, abjad, abugida, …) e fonti bibliografiche con riferimenti di pagina puntuali.

La regola di inclusione è rigorosa e vale la pena affermarla senza giri di parole: **solo le mappature fondate sull'ortografia ufficiale e sulla grammatica documentata entrano. Le regole arbitrarie sulle sottostringhe sono escluse.** Il ⟨lh⟩ portoghese, il ⟨sch⟩ tedesco e il ⟨th⟩ inglese ci sono perché sono unità ortografiche standard. Le euristiche comode-ma-inventate no. Quando una specifica dichiara grafemi ma nessuna mappa di allofoni esplicita, viene derivata una mappa di identità di base — ogni fonema è, al minimo, la propria realizzazione di superficie — così che nulla scompaia silenziosamente.

Le varietà regionali hanno le proprie specifiche, anziché un flag su un genitore. Il portoghese brasiliano e quello europeo divergono sistematicamente, perciò sono oggetti `LanguageSpec` distinti, collegati dall'ascendenza:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Gli alberi dialettali rimangono manutenibili perché i file JSON supportano l'ereditarietà `graphemes_base` / `allophones_base`: una variante dichiara solo ciò che differisce dal proprio genitore. Il lignaggio è ponderato e a più antenati — genitore, substrato, superstrato, adstrato — che è il modo onesto di modellare lingue che sono prodotti di contatto anziché discendenti puri.

## Profondo sul campo, non solo ampio

La cifra di 676 è l'ampiezza; la profondità è dove sta il lavoro. Le specifiche procedono letto per letto dove lo fa la letteratura dialettologica, e ciascuna è citata a quella letteratura con riferimenti di pagina puntuali anziché ricavata per pattern-matching da una tabella di fonemi.

La copertura **iberica** è l'esempio più chiaro: **oltre 100 specifiche** per le lingue della penisola. Ogni lingua romanza di Spagna — castigliano, catalano/valenciano, galiziano (sia nella norma della RAG sia in quella reintegrazionista), asturiano, aragonese e le sue varietà di valle (ansotano, chistabín, benasqués…), estremegno — accanto al basco, ai creoli ibero-romanzi e agli strati storici che la maggior parte delle risorse salta del tutto: **arabo andalusi** e **mozarabico**. Il versante arabo porta con sé **34 letti dialettali** (dal najdi e l'hijazi passando per il levantino, il maghrebino e le varietà peninsulari), e il versante lusofono **46 letti del portoghese e delle lingue del Portogallo**, fino al rionorese, al guadramilese e ai sotto-dialetti mirandesi.

Per quanto ci risulta, molte di queste sono la **prima fonologia leggibile da una macchina** mai pubblicata per la varietà — rionorese, guadramilese, benasqués, angolar, arabo andalusi tra queste — e il lavoro a valle rilascia i **primi dizionari IPA** per **barranquenho** e **mirandese**.

## Una lattice di candidati, non un'unica ipotesi

L'ortografia non è un problema di segmentazione pulito, perciò l'architettura di punta è una **lattice di candidati**. Il `PhonetokTokenizer` fa una tokenizzazione dei grafemi **maximal-munch** — preferendo avidamente l'unità ortografica corrispondente più lunga — e, sulla tabella dei grafemi della specifica, produce una lattice per posizione di candidati IPA ordinati anziché un unico output fragile:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

La lattice è il contratto su cui costruisce l'intera famiglia a valle. Un engine specifico della lingua consuma la lattice condivisa e aggiunge solo la fonologia che una tabella statica non può esprimere, mantenendo ogni consumatore sullo stesso nucleo fondato:

- **[arbtok](https://github.com/TigreGotico/arbtok)** costruisce la fonologia del TTS arabo sulla lattice, aggiungendo l'assimilazione delle lettere solari, l'elisione della hamzat al-waṣl, la gemellazione e la gestione delle legature — e una nuova **fusione rawi-lattice** che ripristina le vocali brevi mancanti del testo dialettale non diacritizzato assegnando un punteggio alla distribuzione per carattere di un ensemble *sotto le licenze del letto richiesto*, anziché fidarsi di un generatore libero.
- **[TugaPhone](https://github.com/TigreGotico/tugaphone)**, **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** (mirandese) e **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** consumano tutti lo stesso lattice-core per le loro varietà lusofone.

## Misurare la distanza tra le lingue

Poiché i dati sono strutturati anziché cotti nei pesi, puoi confrontare le lingue direttamente. Le metriche di distanza abbracciano le dimensioni di inventario, grafema, allofono e ascendenza, oltre a una famiglia separata di distanza di scrittura:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Anche i vettori di caratteristiche sono esposti, perciò una coppia quasi identica come i due standard portoghesi si colloca a 0,04, mentre coppie genuinamente distanti si separano nettamente. Questo è utile sia per le decisioni di transfer learning, sia per il bootstrapping di lingue a poche risorse, sia per la dialettometria.

## Come sappiamo che i dati sono buoni

Il "gold" affidabile per il G2P quasi non esiste — la maggior parte dei dataset pubblici è l'output di un fonemizzatore riutilizzato come riferimento, perciò un basso tasso di errore rispetto ad essi significa "concorda con quello strumento", non "è corretto". Su questo siamo espliciti e abbiamo costruito una metodologia di verifica attorno ad esso, anziché riportare un unico numero lusinghiero.

Per le varietà che ci stanno più a cuore, il gold è **redatto, non raccolto**: un insieme di frasi per letto ancorato all'engine, giudicato in **coppie cieche**, arbitrato rispetto alla **letteratura con riferimenti di pagina puntuali**, e ripiegato attraverso **classi di correzione** in un ciclo di feedback dell'engine — un disaccordo tra l'output dell'engine e la forma corretta è una traccia di un bug reale della specifica. Attraverso il gold del TTS ancorato all'engine e le attestazioni delle fonti primarie ci sono **diverse migliaia di righe verificate**. L'inquadramento è deliberatamente onesto sulla provenienza: sintetico e arbitrato dalla letteratura dove è tutto ciò che esiste, e gold umano genuino dove esiste — l'insieme `mirandese_g2p` di parlanti nativi mirandesi, le attestazioni di fonti primarie con riferimenti di pagina puntuali e i contributi nativi. Le affermazioni di accuratezza sono fatte **solo** rispetto al gold umano; un punteggio perfetto rispetto alla bozza dell'engine stesso non significherebbe nulla.

I numeri, letti come direzionali e sempre citati alla loro fonte ([`docs/scoreboard.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/scoreboard.md), [`docs/benchmarks.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/benchmarks.md) e i documenti di benchmark dei repository a valle):

- **Dialetti arabi, input nudo non diacritizzato** — il caso difficile, realistico per il deployment. Sul gold TTS a input nudo di arbtok (33 letti), la fusione rawi-lattice sotto le licenze dialettali raggiunge un **PER medio di 0,189**, battendo lo stesso ensemble eseguito come generatore libero (0,193), con il margine concentrato sui letti che divergono di più dall'MSA. Sulla maggior parte dei letti arbtok batte espeak-ng sull'input nudo; sull'MSA stesso, espeak — che è ottimizzato per l'MSA — vince ancora (espeak 0,176 vs arbtok 0,245).
- **Dialetti arabi, input diacritizzato** — con i segni presenti il PER di arbtok si colloca tra **0,01 e 0,08** per letto, ben al di sotto dell'unica voce MSA di espeak (ad es. najdi 0,009 vs espeak 0,221; egiziano 0,027 vs espeak 0,287). espeak non ha voci dialettali, perciò questo è onestamente un confronto tra mele e arance — ma il divario è il punto.
- **Portoghese, rispetto al gold umano esperto** — il portoghese europeo di Lisbona si colloca a **PER 0,029** (88% di corrispondenza esatta) su fonti primarie con riferimenti di pagina puntuali, e il gold mirandese di parlanti nativi a **0,146**.

Ognuno di questi è una proprietà dello stato attuale dei dati, incrociata con un intervallo di confidenza bootstrap, non un trofeo da classifica. Dove l'intervallo è ampio o il campione minuscolo, lo scoreboard lo dice.

## La CLI

Tutto ciò che è sopra è accessibile senza scrivere Python. Lo script da console `orthography2ipa` include `list`, `info`, `transcribe` e `distance`, e ogni sottocomando accetta `--json` per l'inoltro verso una pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Perché i dati puri contano

L'intero insieme di specifiche è validato tramite schema — dataclass congelate in stile pydantic, setacciate da una suite di test di integrità, con `SCHEMA.md` a documentarne la forma. Dove una tabella statica genuinamente non riesce a esprimere le regole, una logica specifica della lingua si innesta attorno ai dati: i sillabatori si registrano tramite un gruppo di entry-point, e gli engine più pesanti si basano sulla lattice condivisa a valle.

Non c'è alcun modello opaco che decide come suonano le lingue dei tuoi utenti. Le mappature sono verificabili, le fonti sono citate alla pagina, e aggiungere una lingua significa scrivere un unico file JSON validato — parti da [`docs/adding_a_language.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/adding_a_language.md) e dalla [guida introduttiva](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/getting_started.md). Per chiunque costruisca TTS, ASR o NLP fonetico e si rifiuti di esternalizzare la propria fonologia a una scatola nera — e la voglia in esecuzione sul proprio hardware — è questo il punto. È Apache 2.0, ed è tuo da ispezionare, estendere e auto-ospitare.
