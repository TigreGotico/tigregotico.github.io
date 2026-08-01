---
title: "NLP Classico per il Portoghese: Sillabazione e Grafema-in-Fonema"
description: "Uno sguardo al nostro stack di NLP per il portoghese, basato su regole e completamente offline — silabificador per la sillabazione e TugaPhone per il grafema-in-fonema sensibile al dialetto — e come si collegano al più ampio lavoro di orthography2ipa per le varietà lusofone. Nessuna scatola nera di deep learning: deterministico, veloce e con poche dipendenze."
date: 2026-02-28
lang: it
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

La divisione delle sillabe, il punto in cui cade l'accento e la mappatura tra ortografia e suono in portoghese seguono regole che i linguisti hanno documentato molto prima che qualcuno addestrasse una rete neurale. Quando quelle regole sono esplicite, lo strumento giusto è una libreria piccola, deterministica e completamente offline che si può leggere, verificare ed eseguire ovunque. È questa la filosofia dietro il nostro stack classico di NLP per il portoghese: [silabificador](https://github.com/TigreGotico/silabificador) per la sillabazione e [TugaPhone](https://github.com/TigreGotico/tugaphone) per il grafema-in-fonema (G2P).

### Perché classico, e perché ora

La fonetica è una delle aree in cui le regole deterministiche brillano davvero. Le regole di confine della sillabazione portoghese e le regolarità della sua ortografia sono ben documentate, perciò un motore di regole realizzato a mano produce trascrizioni che si possono ispezionare riga per riga. Nessuna GPU, nessun download di modelli, nessuna chiamata di rete. Questo è importante per la sovranità dei dati: una pipeline vocale lusofona non dovrebbe dover inviare il proprio testo a un'API remota solo per scoprire come pronunciare una parola. È importante anche per la velocità e l'ingombro — queste librerie hanno poche dipendenze e girano su un portatile, un server o un dispositivo embedded con pari facilità.

### silabificador: confini di sillaba

`silabificador` è un sillabatore del portoghese leggero, costruito interamente a partire da regole realizzate a mano, **senza dipendenze**. L'interfaccia è tanto piccola quanto sembra:

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

È stato regolato e testato con dati puliti del [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org) e valutato sul [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon) — un dataset aperto con oltre 100.000 voci provenienti dalla stessa fonte. La segmentazione sillabica è un passo fondamentale per l'assegnazione dell'accento, la sillabazione a fine riga e la trascrizione fonemica, perciò farla bene e velocemente ripaga in tutto ciò che sta a valle.

### TugaPhone: grafema-in-fonema sensibile al dialetto

`TugaPhone` trasforma testo portoghese arbitrario in IPA, e lo fa attraverso i principali dialetti lusofoni: europeo (`pt-PT`), brasiliano (`pt-BR`), angolano (`pt-AO`), mozambicano (`pt-MZ`) e timorese (`pt-TL`). Fondamentalmente, preserva la variazione dialettale anziché appiattire tutto verso un unico "standard". La stessa frase risulta diversa a seconda del luogo in cui viene parlata:

```
Choveu muito ontem à noite.
pt-PT → ʃuˈvew ˈmũjtu ˈõtɐ̃j a ˈnojt
pt-BR → ʃoˈvew ˈmwĩtʊ ˈõtẽj a ˈnojtʃɪ
pt-AO → ʃoˈvew ˈmũjntʊ ˈõntẽj a ˈnojtɨ
pt-MZ → ʃoˈvew ˈmũjtu ˈõtẽj a ˈnɔjtɨ
pt-TL → ʃoˈvew ˈmujtʊ ˈõntɐ̃j a ˈnojtʰ
```

Dietro le quinte, TugaPhone pilota il motore condiviso a lattice di candidati di `orthography2ipa` e vi sovrappone le esigenze specifiche del portoghese attraverso i punti di estensione di quello stesso motore. Consulta un lessico fonetico curato (lo stesso Portuguese Phonetic Lexicon di cui sopra) per le parole note; per tutto ciò che non è nel lessico — nomi, neologismi, prestiti stranieri — la lattice genera candidati a partire dalle regole di grafema e allofono del dialetto.

Ci sono due dettagli che vale la pena evidenziare. La **normalizzazione dei numeri** trasforma le cifre nelle loro forme parlate in portoghese, con corretta concordanza di genere e numero:

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
```

Rispetta perfino le convenzioni di scala — scala lunga `biliões` per `pt-PT`, scala corta `trilhões` per `pt-BR`. La **disambiguazione degli omografi** è delegata alla libreria [bifonia](https://github.com/TigreGotico/bifonia), che possiede la conoscenza basata sui significati di quali omografi eterofonici esistono e quale lettura portano — così che `para` come preposizione è trattato diversamente da `para` come verbo — e marca la lettura scelta con diacritici aggiuntivi prima che la lattice veda mai la frase.

TugaPhone fonemizza pilotando la lattice di candidati condivisa di `orthography2ipa`: la scelta del dialetto *è* la scelta della specifica del letto di `orthography2ipa`, perciò i fenomeni dialettali — betacismo, i dittonghi ascendenti di Porto, la palatalizzazione della /l/ madeirense, l'anteriorizzazione della /u/ azzorriana, il sandhi delle sibilanti in coda e altro ancora — provengono dalla lattice stessa anziché da correzioni testuali fatte a posteriori. TugaPhone aggiunge solo ciò che `orthography2ipa` lascia deliberatamente al chiamante, collegato attraverso i suoi stessi punti di estensione: l'espansione dei numeri/ordinali sensibile al genere e la marcatura degli eterofoni di bifonia girano come fase di normalizzazione del motore prima che la lattice veda il testo; il lessico di pronuncia curato di **[Tugalex](https://github.com/TigreGotico/tugalex)** è registrato per letto tramite `orthography2ipa.register_lexicon`, cosicché una parola coperta rientri nello stesso percorso di override delle eccezioni proprie di una specifica, e la lattice generi candidati solo per le parole che il lessico non copre; la sillabazione proviene dal plugin di `orthography2ipa` basato su `silabificador`, cosicché l'accento cada sulla stessa sillaba che TugaPhone avrebbe altrimenti scelto. Pezzi piccoli e componibili che alimentano un motore condiviso — ciascuno utile di per sé.

TugaPhone è onesto sui propri limiti: la copertura del lessico è più scarsa per i dialetti africani e timorese, gli accenti sub-regionali (Porto, Minho, Braga, tra gli altri) sono approssimazioni sperimentali di caratteristiche documentate e la prosodia a livello di frase è semplificata. Queste sono limitazioni documentate apertamente, non modalità di fallimento nascoste.

### Il quadro più ampio: orthography2ipa

Il portoghese è una varietà tra molte, e lo stesso schema ingegneristico si generalizza. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) è un pacchetto Python a dati puri con mappature grafema→IPA e di allofoni linguisticamente motivate, che abbraccia 807 lingue in più di 20 famiglie linguistiche. Traccia una distinzione netta di cui ogni sistema di G2P serio ha bisogno: una **mappa di grafemi** dice quali fonemi un'ortografia *può* rappresentare, mentre una **mappa di allofoni** dice come un fonema effettivamente *si realizza* in un dato contesto. Le varietà regionali sono modellate come proprie specifiche, collegate attraverso un lignaggio ponderato a più antenati, così che gli alberi dialettali ereditino dai loro genitori anziché duplicare i dati.

È lo stesso istinto dietro `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ` e `pt-TL` in TugaPhone: trattare ogni varietà lusofona come un cittadino di pieno diritto con le proprie regole, e non come una deviazione da un unico accento canonico. I dati sono dichiarativi e la logica è sottile e pluggabile — puoi leggere le regole, citarne le fonti e fidarti del risultato.

### Provalo

Tutto ciò che è qui è open source e installabile già oggi:

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

Per le mappature multilingue più ampie, vedi [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Deterministico, veloce, offline e costruito per l'intera ampiezza del mondo di lingua portoghese.

Questo stack di fonetica portoghese si basa sul nostro **[lavoro di grafema-in-IPA per 807 lingue](/it/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, formando la spina dorsale fonetica del **[TTS che gira su una patata](/it/blog/2026-05-10-tts-that-runs-on-a-potato)** e delle **[voci multilingue Miro & Dii](/it/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
