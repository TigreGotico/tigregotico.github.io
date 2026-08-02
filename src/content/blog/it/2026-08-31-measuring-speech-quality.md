---
title: "Misurare la Qualità del Parlato Senza un Panel di Ascolto"
description: "Una guida pratica a speechonnxmetrics: cosa misurano davvero MOS, predittori MOS senza riferimento, metriche di segnale intrusive e WER/CER basati su ASR, quando ciascuno si applica, punteggi reali su audio reale, e perché un MOS predetto è evidenza, non verità."
date: 2026-08-01
lang: it
author: "Casimiro Ferreira"
tags:
  - "speechonnxmetrics"
  - "TTS"
  - "ONNX"
  - "evaluation"
draft: false
---

Un modello di denoising distribuisce un nuovo checkpoint. Una voce TTS viene
riaddestrata su più dati. Una pipeline di clonazione vocale cambia il proprio
vocoder. In ciascun caso, qualcuno deve rispondere: l'output è migliore o
peggiore di prima? "A me suona meglio" non scala. Si sgretola nel momento in
cui la lingua non è una che parlate, nel momento in cui ci sono venti
checkpoint da confrontare invece di due, o nel momento in cui il cambiamento
va verificato a ogni commit invece che una volta a mano.

La risposta rigorosa a "suona meglio" è un **Mean Opinion Score (MOS)**:
mettete l'audio davanti a un panel di ascoltatori, chiedete a ciascuno di
valutarlo da 1 a 5, e fate la media dei punteggi. Il MOS è la metrica
standard per la qualità del parlato proprio perché pone la domanda che conta
— un essere umano lo troverebbe accettabile — invece di un suo surrogato. È
anche costoso. Reclutare un panel, farlo funzionare in modo coerente e
ripeterlo per ogni lingua, ogni condizione di registrazione e ogni versione
di modello che un piccolo team distribuisce non è qualcosa che un panel di
ascolto può sostenere.

[`speechonnxmetrics`](https://github.com/TigreGotico/speechonnxmetrics) è
una libreria per approssimare quel giudizio senza un panel, a ogni build.
Raggruppa le proprie metriche in tre famiglie, e scegliere la famiglia
giusta per la situazione conta più di qualsiasi numero individuale.

## Tre famiglie, tre domande

I **predittori MOS senza riferimento** (no-reference) sono reti neurali
addestrate a predire cosa direbbe un panel di ascolto, dal solo audio. Non
hanno bisogno di un originale pulito — solo dell'output da giudicare. Usate
questa famiglia quando non esiste una verità di riferimento con cui
confrontare: valutare l'output di un sistema TTS, o verificare una
registrazione reale, già degradata, dopo il denoising.

Le **metriche intrusive** richiedono un riferimento pulito corrispondente e
misurano la distanza tra questo e il segnale degradato. Usate questa
famiglia quando avete voi stessi provocato la degradazione e conservate
ancora l'originale pulito: avete fatto passare una registrazione nota per
essere buona attraverso un codec, un modello di estensione di banda o un
convertitore vocale, e volete sapere quanto l'output si sia allontanato
dalla sorgente.

Le **metriche testuali basate su ASR** trascrivono l'output con un
riconoscitore vocale e confrontano la trascrizione con il testo atteso.
Questo cattura qualcosa che le altre due famiglie non possono: audio che
suona perfettamente naturale e pulito ma dice le parole sbagliate. Un
predittore MOS senza riferimento valuta la naturalezza, non la correttezza —
una pronuncia scorretta ma fluente ottiene un buon punteggio. Una metrica
intrusiva richiede una forma d'onda di riferimento, non una frase di
riferimento. Solo il confronto testuale cattura una parola sbagliata.

La libreria espone tutto questo attraverso un'unica funzione:

```python
import speechonnxmetrics as s

# No-reference: only the output needed, no ground truth exists
s.score("output.wav", ["utmos"])

# Intrusive: needs a clean reference, ref= is required
s.score("degraded.wav", ["stoi", "mcd", "si_sdr"], ref="clean.wav")
```

Le metriche testuali vivono in un modulo separato, `speechonnxmetrics.asr`,
perché confrontano stringhe, non audio — `s.score()` smista solo le
metriche che prendono una forma d'onda.

## MOS senza riferimento: leggere i numeri

Vengono distribuiti quattro stimatori MOS, ciascuno restituisce valori su
una scala 1–5 dove più alto è meglio — la stessa scala usata da un panel
umano:

| metrica | dimensioni | addestrata su | uso commerciale |
|---|---|---|---|
| `utmos` | un punteggio di naturalezza | parlato sintetizzato (VoiceMOS Challenge) | sì |
| `dnsmos` | `sig` / `bak` / `ovrl` (qualità del parlato / rumore di fondo / complessivo) | ITU-T P.835 | sì |
| `dnsmos_p808` | un MOS da ascolto crowdsourced | ITU-T P.808 | sì |
| `sigmos` | 7 dimensioni (`col`, `disc`, `loud`, `noise`, `reverb`, `sig`, `ovrl`) | ITU-T P.804 | sì |
| `nisqa` | `mos` più suddivisione `noi`/`dis`/`col`/`loud` | NISQA-v2 | **no — CC BY-NC-SA 4.0** |

`nisqa` è l'unica metrica dell'intera libreria con pesi non commerciali. Le
altre quattro sono con licenza MIT. `speechonnxmetrics` non filtra questo
per voi; dichiara la licenza e lascia la scelta a chi chiama.

Ecco cosa punteggia l'audio reale. Eseguendo le fixture incluse nella
libreria — una registrazione pulita (`source.wav`) e una risintesi con
codec neurale della stessa clip (`facodec_aria.wav`) — attraverso UTMOS:

```python
>>> s.score("source.wav", ["utmos"])
{'utmos': 4.41}
>>> s.score("facodec_aria.wav", ["utmos"])
{'utmos': 3.21}
```

La registrazione pulita si colloca vicino alla cima della scala, come
dovrebbe — è vero parlato umano, non sintetizzato. La risintesi con codec
scende di oltre un punto intero. Quel divario, più di ciascun numero preso
singolarmente, è il segnale utile: dice che il codec introduce una
degradazione udibile, e fornisce un numero da monitorare mentre il codec
viene ottimizzato.

DNSMOS sulla stessa registrazione pulita:

```python
>>> s.score("source.wav", ["dnsmos"])
{'dnsmos.sig': 3.45, 'dnsmos.bak': 3.60, 'dnsmos.ovrl': 2.93}
```

Tre numeri, non uno, e divergono — `ovrl` si colloca sensibilmente sotto sia
`sig` sia `bak`. Quella divergenza è informativa, non un difetto: `ovrl` è
il punteggio P.835 dell'esperienza di ascolto complessiva, e tende a
penalizzare una registrazione più duramente di quanto suggerirebbe da sola
ciascun punteggio componente, specialmente per una registrazione del mondo
reale piuttosto che di studio. Quando `bak` è basso, cercate rumore di
fondo. Quando `sig` è basso, cercate artefatti a livello di voce —
clipping, interruzioni, timbro robotico. Riportate più di un predittore per
la stessa clip: sono addestrati su dati diversi e divergono in modi
informativi, e un ampio divario tra due predittori indipendenti sulla stessa
clip è un segnale per andare ad ascoltare.

## Metriche intrusive: leggere i numeri

Undici metriche basate su riferimento misurano la distanza da un originale
pulito. Quelle da conoscere per prime:

| metrica | intervallo | direzione | misura |
|---|---|---|---|
| `stoi` / `estoi` | 0–1 | più alto è meglio | intelligibilità obiettiva a breve termine — quanto del *contenuto* sopravvive, indipendentemente da quanto suoni naturale |
| `si_sdr` / `sdr` / `snr` | dB, illimitato | più alto è meglio | rapporto segnale-distorsione / segnale-rumore |
| `mcd` | dB, illimitato | più basso è meglio | distorsione mel-cepstrale — distanza dell'inviluppo spettrale, una metrica classica di qualità TTS/VC |
| `log_f0_rmse` | illimitato | più basso è meglio | errore del contorno del pitch |
| `lsd` / `msd` | dB | più basso è meglio | distanza log-spettrale / mel-spettrale |

Notate che la direzione si inverte: STOI e la famiglia SDR salgono quando
la qualità è migliore; MCD, errore di pitch e distanza spettrale scendono.
Confonderli leggendo una tabella è un errore facile.

Valutando la stessa risintesi con codec contro la sua sorgente pulita:

```python
>>> s.score("facodec_aria.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav")
{'stoi': 0.662, 'mcd': 10.46, 'si_sdr': -26.94}
```

Uno STOI di 0,66 su una scala 0–1 dove 1,0 è una corrispondenza perfetta
dice che l'intelligibilità ha subito un colpo reale — è ben al di sotto di
quanto punteggerebbe una registrazione leggermente elaborata. Un SI-SDR di
circa −27 dB lo conferma: SI-SDR è negativo ogni volta che l'energia della
distorsione supera quella del segnale, e un numero fortemente negativo
significa un cambiamento strutturale pesante, non solo rumore aggiunto. Un
MCD di 10,46 dB è alto; i sistemi TTS pubblicati che suonano chiaramente
sintetici ma comunque coerenti con il parlante si collocano tipicamente a
una sola cifra, quindi 10+ indica una deriva sostanziale dell'inviluppo
spettrale tra la risintesi e l'originale.

## Metriche basate su ASR: leggere i numeri

Cinque metriche testuali derivano da un unico allineamento di Levenshtein
tra una trascrizione di riferimento e un'ipotesi (ciò in cui l'audio è
stato effettivamente trascritto):

| metrica | intervallo | direzione | significato |
|---|---|---|---|
| `wer` | ≥ 0 (di solito 0–1, può superare 1) | più basso è meglio | word error rate: sostituzioni + cancellazioni + inserimenti, diviso per il numero di parole di riferimento |
| `cer` | 0–1 | più basso è meglio | la stessa idea a livello di carattere — più tollerante verso piccole differenze di ortografia/tokenizzazione |
| `mer` | 0–1 | più basso è meglio | match error rate |
| `wil` | 0–1 | più basso è meglio | word information lost |
| `wip` | 0–1 | più alto è meglio | word information preserved (`1 − wil`) |

Un esempio svolto: riferimento "the quick brown fox jumps over the lazy dog"
contro ipotesi "the quick brown fox jumped over a lazy dog" (una
sostituzione, "jumps" → "jumped", una cancellazione di "the"):

```python
>>> from speechonnxmetrics import asr
>>> from speechonnxmetrics.asr import BASIC
>>> asr.wer(reference, hypothesis, normalizer=BASIC)
0.222
>>> asr.cer(reference, hypothesis, normalizer=BASIC)
0.116
```

Un WER di 0,22 significa che circa una parola su cinque è sbagliata —
percepibile, da ascoltare. Il CER è più basso sulla stessa coppia perché la
valutazione a livello di carattere tratta una sostituzione di una parola
come una manciata di modifiche di carattere dentro una stringa molto più
lunga, non un intero token mancante; CER e WER rispondono a domande diverse
e non sono direttamente confrontabili tra loro. Un WER sopra circa 0,3–0,4
su parlato naturale di solito significa che il sistema ASR, o l'audio che
sta trascrivendo, ha un problema reale, non un errore di arrotondamento.

`speechonnxmetrics` non normalizza mai il testo per vostro conto — un
confronto grezzo conta maiuscole e punteggiatura come errori, il che
raramente è ciò che si vuole quando si valuta la pronuncia piuttosto che la
formattazione esatta della trascrizione. Passate un normalizzatore
esplicitamente: `BASIC` mette in minuscolo e comprime gli spazi bianchi,
`STRICT` espande anche le contrazioni e rimuove diacritici, punteggiatura e
parole di riempimento.

## L'avvertenza più importante

Ogni numero MOS senza riferimento in questa libreria è una predizione di un
modello, non la misurazione di un fatto. UTMOS, DNSMOS, SIGMOS e NISQA sono
stati ciascuno addestrati su uno specifico insieme di dati di test di
ascolto, in lingue e condizioni di registrazione specifiche. Un predittore
addestrato per lo più su registrazioni di studio in inglese può giudicare
male una lingua mai vista in addestramento, un accento mai valutato dal suo
panel di addestramento, o una condizione di registrazione — audio
telefonico, una stanza rumorosa, un microfono a basse risorse — fuori dalla
sua distribuzione di addestramento. Il modello non sta mentendo; sta
estrapolando, e l'estrapolazione da input non familiari è dove i
predittori neurali sono meno affidabili.

Trattate un MOS predetto come evidenza, non come verità di riferimento. È
affidabile per ciò in cui è bravo: catturare grandi regressioni, classificare
diversi candidati l'uno contro l'altro, e segnalare un'esecuzione che
richiede un ascolto umano reale. Non è un sostituto di un vero panel di
ascolto quando una decisione è ad alto rischio, e non dovrebbe essere
l'ultima parola su una lingua o una condizione che il modello sottostante
non è stato addestrato a giudicare. Riportare più predittori insieme, e
trattare il disaccordo tra loro come uno spunto per ascoltare piuttosto che
rumore da mediare via, è la mitigazione pratica.

## Perché questo è ciò che rende un confronto utilizzabile

Nulla di tutto ciò è utile in isolamento. Diventa utile nel momento in cui
più motori devono essere confrontati sullo stesso piano — quale motore TTS,
quale motore STT, quale modello di miglioramento usare come predefinito. Le
[librerie vocali in puro
ONNX](/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries) che
`speechonnxmetrics` è stata costruita per valutare — TTS, ASR, denoising,
clonazione vocale — pubblicano confronti per motore prodotti esattamente
con le metriche sopra: MOS senza riferimento per sistemi senza verità di
riferimento, metriche intrusive dove esiste un riferimento pulito, WER/CER
ovunque sia in discussione la correttezza della trascrizione. Questo è ciò
che trasforma "abbiamo scelto questo motore" in un numero che qualcun altro
può verificare.

Se il vostro progetto necessita di una lingua, un motore o una condizione di
registrazione valutati in questo modo e non è ancora coperto,
[mettetevi in contatto](/contact) o guardate [i nostri servizi](/services).
