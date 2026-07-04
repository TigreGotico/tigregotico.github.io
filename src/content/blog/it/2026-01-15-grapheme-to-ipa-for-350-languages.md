---
title: "Grafema-in-IPA per oltre 350 Lingue"
description: "orthography2ipa è una risorsa a dati puri, linguisticamente fondata, che mappa l'ortografia in IPA e modella come i fonemi si realizzano come allofoni in oltre 350 codici di lingua e più di 20 famiglie linguistiche. Un tokenizzatore maximal-munch, metriche di distanza fonologica e di scrittura, lignaggio dialettale e un insieme di specifiche validato tramite schema — senza pesi addestrati, completamente auto-ospitabile."
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

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** è un pacchetto Python a dati puri — JSON dichiarativo, logica sottile e pluggabile, senza pesi addestrati — che mappa l'ortografia in IPA e modella come quei fonemi si realizzano nel contesto attraverso **394 specifiche di lingua e più di 20 famiglie linguistiche**. Installalo, leggi i dati, fai un fork dei dati. Nulla è nascosto in un checkpoint.

Alimenta tutto ciò che sta a valle: gli stack specifici del portoghese [silabificador](https://github.com/TigreGotico/silabificador) e [TugaPhone](https://github.com/TigreGotico/tugaphone) (vedi **[NLP classico per sillabe e fonemi del portoghese](/it/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), il G2P del barranquenho e la fondazione fonemica del **[TTS che gira su una patata](/it/blog/2026-05-10-tts-that-runs-on-a-potato)**.

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

Ogni lingua è una dataclass `LanguageSpec` congelata, e porta con sé molto più di un elenco di fonemi: grafemi (inclusi digrammi e trigrammi), una mappa di allofoni, **grafemi posizionali** per sostituzioni sensibili al contesto (inizio parola, intervocalico, prima di /i/), **ascendenza** ponderata con più antenati, **regole di sandhi** tra parole, un **inventario tonale** opzionale e la provenienza — un `QualityTier` che percorre `stub → skeleton → research → production`, un `ScriptType` (alfabeto, abjad, abugida, …) e fonti bibliografiche.

La regola di inclusione è rigorosa e vale la pena affermarla senza giri di parole: **solo le mappature fondate sull'ortografia ufficiale e sulla grammatica documentata entrano. Le regole arbitrarie sulle sottostringhe sono escluse.** Il ⟨lh⟩ portoghese, il ⟨sch⟩ tedesco e il ⟨th⟩ inglese ci sono perché sono unità ortografiche standard. Le euristiche comode-ma-inventate no. Quando una specifica dichiara grafemi ma nessuna mappa di allofoni esplicita, viene derivata una mappa di identità di base — ogni fonema è, al minimo, la propria realizzazione di superficie — così che nulla scompaia silenziosamente.

Le varietà regionali hanno le proprie specifiche, anziché un flag su un genitore. Il portoghese brasiliano e quello europeo divergono sistematicamente, perciò sono oggetti `LanguageSpec` distinti, collegati dall'ascendenza:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Gli alberi dialettali rimangono manutenibili perché i file JSON supportano l'ereditarietà `graphemes_base` / `allophones_base`: una variante dichiara solo ciò che differisce dal proprio genitore. Il lignaggio è ponderato e a più antenati — genitore, substrato, superstrato, adstrato — che è il modo onesto di modellare lingue che sono prodotti di contatto anziché discendenti puri.

## Un tokenizzatore che ammette l'ambiguità

L'ortografia non è un problema di segmentazione pulito, perciò il pacchetto include `PhonetokTokenizer`, un tokenizzatore di grafemi **maximal-munch** con espansione IPA tramite beam-search. Preferisce avidamente l'unità ortografica corrispondente più lunga, poi esplora trascrizioni candidate ordinate quando un'ortografia è ambigua:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

Anziché scommettere su un unico risultato, ottieni un beam con punteggio — esattamente l'input che un lessico, una lattice o un reranker di pronuncia a valle desidera.

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

## La CLI

Tutto ciò che è sopra è accessibile senza scrivere Python. Lo script da console `orthography2ipa` include `list`, `info`, `transcribe` e `distance`, e ogni sottocomando accetta `--json` per l'inoltro verso una pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Perché i dati puri contano

L'intero insieme di specifiche è validato tramite schema — dataclass congelate in stile pydantic, **394 specifiche** setacciate da una suite di test di integrità, con `SCHEMA.md` a documentarne la forma. Dove una tabella statica genuinamente non riesce a esprimere le regole, una logica specifica della lingua si innesta attorno ai dati: i sillabatori si registrano tramite un gruppo di entry-point, e il G2P algoritmico più pesante (come il nostro tokenizzatore per l'arabo [arbtok](https://github.com/TigreGotico/arbtok), che gestisce l'assimilazione delle lettere solari, l'elisione della hamzat al-wasl e le forme di tanwin) si basa sulle stesse specifiche a valle.

Non c'è alcun modello opaco che decide come suonano le lingue dei tuoi utenti. Le mappature sono verificabili, le fonti sono citate e aggiungere una lingua significa scrivere un unico file JSON validato. Per chiunque costruisca TTS, ASR o NLP fonetico e si rifiuti di esternalizzare la propria fonologia a una scatola nera — e la voglia in esecuzione sul proprio hardware — è questo il punto. È Apache 2.0, ed è tuo da ispezionare, estendere e auto-ospitare.
