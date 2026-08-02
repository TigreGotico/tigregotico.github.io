---
title: "Scegliere un Motore di Clonazione Vocale"
description: "voiceclonnx esegue 10 motori di conversione vocale dietro un'unica API, dallo scambio di feature kNN al codec-LM autoregressivo. Questa è una guida alle famiglie di modelli che ci sono dietro, al vero compromesso misurato tra intelligibilità e somiglianza del parlante, e a come scegliere un motore per un compito specifico."
date: 2026-08-01
lang: it
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "voice cloning"
  - "voice conversion"
  - "self-hosted"
draft: false
---

La conversione vocale (voice conversion) prende una registrazione e un parlante
di riferimento, e produce le stesse parole nella voce del parlante di
riferimento. Non c'è alcun testo coinvolto in nessun punto della pipeline:
l'input è audio, l'output è audio, e il modello non legge né scrive mai una
trascrizione. Questo è ciò che la distingue dal text-to-speech (TTS), che
parte dal testo e non ha alcuna registrazione sorgente da preservare. La
conversione vocale risponde a una domanda più circoscritta: data questa
registrazione, fatela suonare come qualcun altro, mantenendo intatte le
parole.

Questo compito più circoscritto ha usi reali. Doppiare una registrazione con
una voce coerente senza assumere un secondo doppiatore. Anonimizzare un
parlante in un'intervista o in una chiamata di assistenza mantenendo le
parole testuali. Dare all'output di un sistema TTS un'unica identità
stabile tra le lingue, quando le voci sottostanti per ciascuna lingua sono
state addestrate indipendentemente e suonerebbero altrimenti come persone
diverse.

[`voiceclonnx`](https://github.com/TigreGotico/voiceclonnx) implementa 10 di
questi motori dietro un'unica API Python, tutti eseguiti su `onnxruntime`
senza bisogno di PyTorch al momento dell'inferenza. I motori non sono
intercambiabili. Provengono da famiglie di modelli diverse, e sceglierne uno
significa scegliere un compromesso, non un vincitore.

## L'API, in breve

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
print(cloner.sample_rate)   # 16000
```

`clone_voice(audio, reference_voice, out_path)` prende la registrazione
sorgente, una clip di riferimento di 5-30 secondi del parlante target e un
percorso di output, e restituisce il percorso del WAV convertito. Cambiare
motore significa cambiare la stringa `engine=`; la forma della chiamata non
cambia. Un motore, `rvc`, è l'eccezione — prende il percorso di un modello
vocale `.onnx` invece di una registrazione di riferimento, trattato più
avanti. `pip install voiceclonnx` scarica tutti e 10 i motori; i modelli si
scaricano da Hugging Face al primo utilizzo.

## Due assi, non un solo punteggio

Due numeri descrivono quanto bene ha funzionato una conversione, e non si
muovono insieme.

Il **word error rate (WER)** misura l'intelligibilità: quanto della frase
originale è sopravvissuto, giudicato facendo passare di nuovo l'output
attraverso un riconoscitore vocale e confrontandolo con la trascrizione
sorgente. Uno 0% di WER significa che ogni parola è passata correttamente.

La **somiglianza del parlante** (speaker similarity) misura l'identità: se
l'output suona davvero come il parlante target, non come quello originale.
Viene calcolata estraendo un embedding del parlante — un'impronta numerica
compatta del timbro di una voce, il colore tonale che fa suonare una voce
diversa da un'altra alla stessa altezza e intensità — dall'output e dalla
clip di riferimento, e poi confrontandoli con la similarità del coseno
(cosine similarity). Un punteggio di 1,0 significa timbro identico; la
baseline di `voiceclonnx` stessa — una copia non convertita della sorgente
valutata contro il target — si attesta a 0,09, quindi qualunque valore
significativamente superiore sta svolgendo un lavoro di conversione reale.

`voiceclonnx` pubblica entrambi i numeri per ogni motore, misurati sulla
stessa frase convertita verso due voci di riferimento. Il WER proviene da
`faster-whisper`; la somiglianza del parlante proviene da un modello di
embedding `wespeaker-resnet34` (verificato incrociando altri due modelli).
Messi uno accanto all'altro, emerge uno schema: nessun motore primeggia in
entrambe le colonne.

| Motore | Famiglia | WER | Somiglianza col target |
|---|---|---|---|
| `focalcodec` | Scambio di feature kNN | 15-19% | **0,61** |
| `lscodec` | Codec a parlante disaccoppiato | ~35% | 0,54 |
| `chatterbox` | Codec-LM autoregressivo | 4-8% | 0,54 |
| `knnvc` | Scambio di feature kNN | 12-15% | 0,49 |
| `facodec` | Codec fattorizzato | **0%** | 0,44 |
| `openvoice` | Trasferimento del colore tonale | **0%** | 0,37 |
| `bicodec` | Token semantici + globali | 12% | 0,29 |
| `triaan` | Triple-AAN | 4% | 0,29 |
| `cosyvoice` | Flow-matching | 8% | 0,21 |

(`rvc` converte qualsiasi sorgente verso un'unica voce fissa addestrata dalla
comunità piuttosto che verso una clip di riferimento arbitraria, quindi non è
confrontabile in questa tabella; vedi sotto.)

Leggete la tabella riga per riga, non cercando un'unica riga migliore in
assoluto. `facodec` e `openvoice` si collocano allo 0% di WER — ogni parola
sopravvive — con somiglianza moderata. `focalcodec` e `lscodec` stanno
all'estremo opposto: il trasferimento di timbro più forte dell'insieme,
pagato lasciando che il 15-35% delle parole esca sbagliato. `chatterbox` è
l'unico motore che va bene su entrambi gli assi contemporaneamente (WER
4-8%, somiglianza 0,54), proprietà della sua architettura, trattata di
seguito.

## Perché le famiglie si comportano diversamente

I motori si dividono in approcci distinti, e l'approccio predice dove un
motore si colloca nella tabella sopra.

**Scambio di feature kNN** (`knnvc`, `focalcodec`). L'audio sorgente viene
scomposto in brevi frame, ciascuno trasformato in un vettore di feature da un
encoder auto-supervisionato pre-addestrato. Per ogni frame sorgente,
l'algoritmo trova i *k* frame più vicini in un insieme di feature del
parlante target e li media, sostituendo il timbro della sorgente frame per
frame lasciando il contenuto fonetico sottostante dove è stato estratto dalla
rappresentazione propria dell'encoder. Non c'è un decoder appreso che mappi
una voce sull'altra — lo scambio è una ricerca dei vicini più prossimi — ed
è per questo che il trasferimento di timbro può essere aggressivo
(`focalcodec` raggiunge 0,61 di somiglianza) al costo di occasionalmente
corrompere frame che avevano una corrispondenza scarsa nel pool target, cosa
che si manifesta come WER.

**Codec fattorizzato** (`facodec`). Un codec audio neurale — un modello che
comprime il parlato in una sequenza compatta di token e lo ricostruisce —
addestrato a suddividere esplicitamente quei token in flussi separati di
contenuto e timbro. Poiché il contenuto è un flusso dedicato, il decoder
ricostruisce le parole con alta fedeltà; solo il flusso del timbro viene
scambiato per il parlante target. Questa separazione esplicita è il motivo
per cui `facodec` raggiunge lo 0% di WER: la preservazione del contenuto non
compete con nient'altro.

**Trasferimento del colore tonale** (`openvoice`). Un modulo di conversione
cambia il colore tonale — l'andamento del pitch e il timbro — dopo che un
encoder separato ha fissato il contenuto linguistico, in uno spirito simile
all'approccio del codec fattorizzato ma implementato come un passaggio di
trasferimento del colore su uno spettrogramma mel piuttosto che su token
discreti. Anch'esso raggiunge lo 0% di WER, con una somiglianza un po' più
bassa di `facodec`.

**Codec-LM autoregressivo** (`chatterbox`). Un modello linguistico
autoregressivo che predice i token del codec uno alla volta, condizionato
sull'embedding del parlante target, molto simile a un modello linguistico
text-to-speech ma condizionato sui token di contenuto della registrazione
sorgente invece che sul testo. Poiché genera la prosodia (ritmo, accento,
intonazione) come parte dello stesso processo autoregressivo invece di
copiarla direttamente dalla sorgente, può portare con sé lo stile di
eloquio insieme al timbro — motivo per cui la documentazione nota che offre
"il cambiamento sorgente-target più forte" — ed è l'unico motore che ottiene
un buon punteggio sia sull'intelligibilità sia sulla somiglianza
contemporaneamente.

**Flow-matching** (`cosyvoice`). Un processo generativo continuo che
raffina iterativamente rumore nello spettrogramma mel target, usando un
risolutore di ODE (equazione differenziale ordinaria) eseguito un numero
configurabile di passi (`ode_steps`, predefinito 10). Il suo encoder di
contenuto è progettato per il trasferimento cross-linguistico, e questa
generalità è probabilmente il motivo per cui il suo punteggio di somiglianza
al target è il più basso dell'insieme: la rappresentazione ottimizza per
l'indipendenza dalla lingua, non per la corrispondenza più stretta col
parlante.

**Codec a parlante disaccoppiato** (`lscodec`). Come `facodec`, un codec
addestrato a separare il contenuto dall'identità del parlante, ma calibrato
per spingere ulteriormente la somiglianza a costo diretto della precisione
del flusso di contenuto, arrivando a ~35% di WER con la seconda somiglianza
più alta dell'insieme.

**Codec Triple-AAN e a token semantici-più-globali** (`triaan`, `bicodec`) si
collocano nel mezzo su entrambi gli assi: WER moderato, somiglianza
moderata, nessuna forte inclinazione in un senso o nell'altro.

**Codec any-to-ONE + vocoder** (`rvc`). Costruito su ContentVec (un encoder di
contenuto) che alimenta un vocoder VITS, addestrato per singola voce target
invece di accettare una clip di riferimento arbitraria. `reference_voice` per
questo motore è il percorso a un file modello RVC `.onnx` o un ID di
repository Hugging Face, non un file audio:

```python
cloner = VoiceCloner(engine="rvc")
out = cloner.clone_voice("source.wav", "/path/to/myvoice.onnx", "out.wav")
```

Poiché ogni modello RVC è addestrato su un'unica voce target, non prende una
clip di riferimento al momento dell'inferenza e non viene valutato sullo
stesso benchmark di somiglianza dei motori any-to-any. Il suo 38% di WER
misurato riflette un singolo modello campione addestrato dalla comunità, non
l'architettura in generale — la qualità dipende da come quel modello
specifico è stato addestrato. Esistono migliaia di voci RVC comunitarie su
Hugging Face, caricabili direttamente tramite ID di repository.

## Decidere quale eseguire

**Pipeline rapida e general-purpose.** Iniziate con `facodec` o `openvoice`.
Entrambi raggiungono uno 0% di WER misurato con somiglianza moderata (0,44 e
0,37), ed entrambi distribuiscono una variante quantizzata INT8 senza
regressioni di qualità dichiarate — passate `quantized=True` per un modello
più piccolo e più veloce.

**Massima somiglianza col parlante.** Usate `focalcodec` (0,61 di
somiglianza, la più alta misurata) se il 15-19% di WER è accettabile per il
caso d'uso, oppure `chatterbox` (0,54 di somiglianza, 4-8% di WER) se non lo
è. `chatterbox` funziona anche a 24 kHz, la frequenza di output più alta per
la conversione any-to-any nell'insieme — `rvc` arriva fino a 48 kHz ma solo
nella modalità any-to-ONE descritta sopra.

**Hardware a basse risorse.** `knnvc` in INT8 occupa circa 123 MB su disco,
l'ingombro più piccolo dell'insieme, con 0,49 di somiglianza e 12-15% di
WER — un compromesso ragionevole per memoria limitata. Non tutti i motori
si quantizzano in modo pulito: `focalcodec` e `cosyvoice` sono documentati
come degradanti in INT8, quindi teneteli entrambi in fp32.

**Una lingua su cui il motore non è stato addestrato.** L'encoder di
contenuto di `cosyvoice` è costruito per il trasferimento cross-linguistico,
motivo documentato per preferirlo a un motore calibrato per la conversione
nella stessa lingua, anche se la sua somiglianza misurata (0,21) è la più
bassa dei nove motori direttamente confrontabili.

**Identità vocale sopra la formulazione esatta.** `lscodec` offre il
trasferimento di timbro più forte tra i motori della famiglia codec (0,54, a
pari merito con `chatterbox`) al costo del WER più alto dell'insieme
confrontabile (~35%). Sceglietelo quando l'obiettivo è "questo suona come il
parlante target" e occasionali errori di parola nell'output sono
tollerabili.

**Un'unica voce comunitaria fissa invece di una clip arbitraria.** `rvc`,
usando un modello vocale `.onnx` pre-addestrato invece di una registrazione
di riferimento.

**Vincolo non commerciale da controllare per primo.** I pesi di `bicodec`
sono concessi in licenza CC BY-NC-SA 4.0. I pesi di ogni altro motore sono
MIT, Apache-2.0 o CC BY 4.0. Verificate la licenza del peso specifico che
distribuite prima di spedirlo commercialmente.

## Ciò che non fa bene, e su chi non dovrebbe essere usato

Ogni numero sopra viene con la stessa avvertenza: i numeri descrivono una
frase dimostrativa in inglese convertita tra due voci di riferimento
specifiche. Una lingua diversa, una registrazione sorgente più rumorosa, una
clip di riferimento più corta o di qualità inferiore, o un parlante sorgente
la cui voce si trova lontana da qualunque cosa nei dati di addestramento di
un motore, sposteranno tutti i numeri, di solito in peggio. Nessuno di questi
motori è una soluzione universale per una registrazione sorgente di bassa
qualità — parecchi convertono allegramente il timbro trasportando il rumore
sorgente direttamente attraverso, poiché il rumore ha una propria firma
acustica che una separazione contenuto/timbro non sempre separa in modo
pulito.

La conversione vocale solleva anche un rischio reale che la sua stretta
cugina, la clonazione vocale per il TTS, ha già costretto questo team a
considerare: convertire una registrazione per farla suonare come una persona
reale e identificabile è una tecnologia capace di impersonificazione,
indipendentemente dall'intenzione. La regola che questo team applica alle
voci sintetiche in generale — ottenere il permesso esplicito prima di usare
la voce di una persona reale come donatore o target, e ricorrere a
registrazioni di pubblico dominio o a una voce deliberatamente originale
quando il permesso non è possibile — si applica qui senza eccezioni. Una clip
di riferimento di una persona reale non è diversa, dal punto di vista del
consenso, da un intero set di addestramento della sua voce; richiede
semplicemente molto meno per produrre un risultato utilizzabile, il che è un
motivo per più cautela, non meno.

Contattateci tramite [contact](/contact) o consultate [cosa offriamo](/services)
se la conversione vocale fa parte di una pipeline che state costruendo.
