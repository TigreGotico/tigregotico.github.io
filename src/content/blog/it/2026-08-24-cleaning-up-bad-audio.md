---
title: "Ripulire l'Audio Difettoso: Denoising ed Estensione della Banda in audiosronnx"
description: "Un approfondimento sui due compiti separati di audiosronnx — rimuovere il rumore e ricostruire le alte frequenze mancanti — con il registro reale dei motori, dimensioni dei modelli e licenze, l'elenco dei modelli scartati, e come verificare se l'output è davvero migliorato."
date: 2026-08-01
lang: it
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "denoising"
  - "bandwidth extension"
  - "speech"
draft: false
---

Una registrazione può essere difettosa in due modi diversi, e le soluzioni
non si sovrappongono.

Il primo modo: il rumore di fondo si sovrappone al parlato — traffico, una
ventola, il ronzio della stanza. Il segnale che conta c'è; qualcos'altro vi
si è mescolato. Rimuoverlo è il **denoising**.

Il secondo modo: la registrazione non ha mai catturato il segnale completo
fin dall'inizio. L'audio telefonico è campionato a 8.000 campioni al secondo
(8 kHz); una registrazione di piena qualità è di solito a 48 kHz. La
**frequenza di campionamento** (sample rate) fissa la frequenza più alta che
un segnale digitale può rappresentare, quindi una chiamata a 8 kHz non ha
alcun contenuto sopra i 4 kHz — non attenuato, non filtrato, semplicemente
mai registrato. Far suonare di nuovo pieno quell'audio significa inventare
alte frequenze plausibili che non sono mai state catturate. Questa è
l'**estensione della banda** (bandwidth extension).

`audiosronnx` tratta questi come due problemi diversi con due punti di
ingresso diversi, perché usare quello sbagliato fa la cosa sbagliata.
Eseguire un estensore di banda su un segnale rumoroso ricostruirà
fedelmente una versione ad alta frequenza del rumore. Il denoising deve
avvenire prima.

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _     = load_sr("lavasr").upscale(clean, rate)              # extend to 48 kHz
```

`load_denoise()` e `load_sr()` rifiutano i motori l'uno dell'altro —
chiedere a `load_denoise` un estensore di banda solleva un errore invece di
svolgere silenziosamente il compito sbagliato.

## Perché questo viene prima del riconoscimento

Il riconoscimento vocale e l'identificazione del parlante sono di solito
addestrati su audio comparativamente pulito. Date in pasto a un
riconoscitore parlato telefonico a 8 kHz, o parlato con una ventola in
sottofondo, e il word error rate sale — non perché il modello sia scadente,
ma perché l'input non assomiglia più a ciò su cui è stato addestrato. Lo
stesso vale per gli embedding del parlante usati per l'identificazione o la
diarizzazione: rumore e banda mancante distorcono l'esatto dettaglio
acustico da cui quegli embedding dipendono.

Questo rende la pulizia una fase della pipeline che sta *prima* del
riconoscimento, non un'alternativa ad esso. Una pipeline reale per una
chiamata telefonica rumorosa a 8 kHz è: denoising, poi estensione a 48 kHz,
poi esecuzione del riconoscimento o dell'identificazione del parlante sul
risultato. Sostituire con un riconoscitore migliore senza prima correggere
l'input spende lo sforzo nel posto sbagliato — il modello si degrada sullo
stesso segnale danneggiato per quanto sia bravo.

## Il registro dei motori

`audiosronnx` distribuisce dieci denoiser e sette estensori di banda, tutti
caricabili per nome tramite `load_denoise()` / `load_sr()`, tutti puro ONNX
senza torch a runtime.

Denoiser:

| Motore | Frequenza | Dimensione | Licenza |
|--------|------|----------|---------|
| dpdfnet (predefinito) | 8/16/48 kHz | 8,7–14,9 MB | Apache-2.0 |
| mossformer2 | 48 kHz | 229 MB | Apache-2.0 |
| frcrn | 16 kHz | 57,5 MB | Apache-2.0 |
| mpsenet | 16 kHz | 9,7 MB | MIT |
| gtcrn | 16 kHz | 0,54 MB | MIT |
| cmgan | 16 kHz | 7,8 MB | MIT |
| metadenoiser | 16 kHz | 19–34 MB | CC-BY-NC-4.0 |
| mossformergan | 16 kHz | 17,7 MB | Apache-2.0 |
| voicefixer | 44,1 kHz | 415 MB | MIT |
| deepfilternet | 48 kHz | ~2 MB | MIT |

Estensori di banda:

| Motore | Input | Dimensione | Licenza |
|--------|-------|----------|---------|
| lavasr (predefinito) | 8–48 kHz | ~52 MB | Apache-2.0 |
| novasr | 16 kHz | ~0,2 MB | Apache-2.0 |
| flowhigh | qualsiasi | ~200 MB | MIT |
| hifiganbwe | qualsiasi | ~4 MB | MIT |
| apbwe | qualsiasi (banda 12 kHz) | ~120 MB | MIT |
| sidon | 16 kHz | ~410 MB | MIT |
| callenhancer | 8–16 kHz | ~3 GB / ~1,3 GB int8 | CC-BY-NC-4.0 |

Il modello più piccolo della libreria, `gtcrn`, è 0,54 MB. Il più grande,
`voicefixer`, è 415 MB — quasi 800 volte più grande, e svolge un compito
diverso: è un modello di *restauro* che gestisce insieme rumore, riverbero,
clipping e banda mancante invece di un problema alla volta.

La maggior parte dei pesi è MIT o Apache-2.0. Due non lo sono: `metadenoiser`
e `callenhancer` sono distribuiti con licenza CC-BY-NC-4.0, non commerciale.
Quella licenza copre i pesi, non l'audio elaborato con essi, e la libreria
lo dichiara a ogni punto di utilizzo — `audiosronnx list` lo riporta per
motore. Nulla impedisce a chi chiama di scegliere `metadenoiser` per la sua
architettura nel dominio del tempo, ma la scelta va fatta consapevolmente.

Il registro esiste perché nessun singolo modello vince su ogni
registrazione. `dpdfnet` è il predefinito perché non richiede dipendenze
extra e copre 8, 16 e 48 kHz da un unico modello. `mossformer2` è la scelta
migliore misurata su input a banda piena. `mossformergan` ottiene il
punteggio PESQ pubblicato più alto (3,47) tra i denoiser distribuiti.
`gtcrn` è la scelta quando il vincolo determinante è l'ingombro, a 0,54 MB.
Su una clip di test con rumore gaussiano a banda larga, i denoiser hanno
recuperato da 3,5 a 5,9 dB di SNR con un SNR di ingresso di 19 dB, salendo a
7,5–13,7 dB con un più difficile 5 dB in ingresso. Si tratta di un caso di
rumore sintetico e ostile: classifica i motori in modo coerente ma dice poco
su rumore di sottofondo (babble) o artefatti da codec, che è esattamente il
motivo per cui il registro mantiene dieci modelli invece di distribuire solo
il vincitore.

`cmgan` è il caso più chiaro di un modello mantenuto di proposito nonostante
perda: è dominato sia in PESQ sia in SNR da `gtcrn`, che occupa quattordici
volte meno spazio, e resta comunque — così che i risultati pubblicati
costruiti su `cmgan` restino riproducibili e un'architettura distinta resti
disponibile come confronto.

Sul fronte dell'estensione di banda, `sidon` e `callenhancer` svolgono un
compito diverso da `lavasr` o `novasr`: invece di aggiungere una banda alta
plausibile sopra il segnale esistente, risintetizzano il parlato da zero
tramite un vocoder neurale, il che può riparare danni da codec che un
estensore di banda non può toccare — a un costo computazionale molto più
alto. `callenhancer` è addestrato specificamente su audio telefonico, motivo
per cui i suoi pesi portano la licenza non commerciale.

## Cosa non è entrato

`audiosronnx` distribuisce un motore solo quando questo esporta in un unico
grafo ONNX statico, gira su CPU tramite onnxruntime, porta una licenza
chiara ed è stato validato end-to-end contro l'implementazione originale —
non solo contro il modello grezzo, poiché un grafo che corrisponde alla rete
ma non alla normalizzazione che la circonda produce audio che suona bene ed
è silenziosamente sbagliato.

Il file `docs/not-shipped.md` del progetto documenta ogni candidato valutato
e scartato, con il motivo specifico, il che lo rende uno dei documenti più
utili del repository perché mostra i confini reali di ciò che "puro ONNX,
solo CPU" può fare oggi invece di limitarsi ad affermarli.

**I sampler iterativi non hanno un grafo statico da esportare.** I modelli di
diffusione e flow-matching eseguono una rete molte volte per enunciato, con
un ciclo la cui lunghezza non è fissa al momento dell'esportazione. AudioSR
(una pipeline di diffusione latente di circa 6 GB con un VAE, un LDM e un
vocoder separati) e SGMSE cadono entrambi qui — il successivo modello
streaming 2025 di SGMSE raggiunge il tempo reale solo su una GPU consumer,
figuriamoci su CPU.

**Le convoluzioni a posizione variabile sembrano squalificanti e per lo più
non lo sono.** `resemble-enhance` è stato a lungo scartato in questo
documento a causa di LVCNet, la convoluzione a posizione variabile del
vocoder, sulla teoria che i kernel predetti per posizione tramite `unfold` e
`einsum` non possano essere ridotti a un grafo statico. Testato
direttamente, si è rivelato falso — entrambe le operazioni hanno
equivalenti ONNX. Il fallimento effettivo è un errore di tracciamento
separato e ben noto ("ONNX export of convolution for kernel of unknown
shape") già risolto altrove nella codebase per i ricampionatori di BigVGAN.
Ciò che ancora tiene fuori `resemble-enhance` è la scala: quattro reti tra
cui un sampler ODE CFM e un autoencoder, a 44,1 kHz — una decisione di
ambito, non un'impossibilità.

**Alcuni modelli non hanno nulla di addestrato da esportare.** RNNoise è
distribuito come C scritto a mano, non come grafo in un framework
addestrabile — portarlo significherebbe riaddestrare da zero una rete
equivalente. Fast-ULCNet pubblica solo il codice dell'architettura, nessun
checkpoint.

**Una licenza restrittiva è una decisione di etichettatura, non una
squalifica automatica** — è esattamente per questo che `callenhancer` e
`metadenoiser` vengono distribuiti. Ciò che *è* squalificante sono pesi
pubblicati senza alcuna licenza: mdctGAN è stato scartato per questo
motivo esatto, oltre a un front-end basato su `torch.fft` che non esporta
in modo affidabile.

**`torch.stft` chiamato all'interno del modello è un vero blocco
strutturale.** Il ciclo del sampler di NU-Wave2 non è il problema — potrebbe
girare in numpy fuori dal grafo, come fa l'STFT di ogni altro motore. Ciò
che lo blocca è che il suo metodo `forward` chiama internamente
`torch.stft` e `torch.istft`, che la libreria tiene deliberatamente fuori
da ogni grafo che distribuisce, e che è anche l'operatore che esporta meno
affidabilmente in generale. Risolverlo significherebbe dividere il modello
al confine della trasformata, una vera ristrutturazione piuttosto che una
sostituzione di operatore.

**Riprodurre l'architettura di un modello non è lo stesso che riprodurne
l'output.** LiSenNet ha 56 K parametri, meno di 300 KB — sarebbe il motore
più piccolo della libreria. Il suo port ONNX pubblicamente disponibile gira
e produce audio attenuato dall'aspetto plausibile, ma misurato end-to-end
distrugge il segnale: −10,8 dB di SNR con 11 dB in ingresso. Riprodurre
esattamente l'implementazione di riferimento dello stesso port dà lo stesso
identico risultato negativo, il che significa che l'implementazione di
riferimento stessa non corrisponde al front-end che la sua stessa
documentazione descrive — non esiste ancora un target corretto rispetto a
cui validare.

Lo schema in tutti questi casi è che i fallimenti interessanti sono
raramente "il modello è troppo grande" o "la diffusione è lenta". Sono
specifici: un operatore non supportato con un sostituto esatto
(`torch.complex` non ha un'operazione ONNX, ma `atan2(im, re)` calcola lo
stesso angolo di fase), un tensore costruito dalla forma a runtime di un
input che un tracer non può fissare, o una trasformata posta sul lato
sbagliato di un confine del grafo.

## Confermare che l'output sia davvero migliorato

Un file ONNX che gira non è prova che una registrazione sia migliorata. Due
diverse modalità di fallimento appaiono identiche dall'esterno: un denoiser
che silenzia il parlato insieme al rumore, e un estensore di banda che
aggiunge una banda alta con il contenuto armonico sbagliato, producono
entrambi audio che si riproduce senza errori e può persino suonare più
pulito a un ascolto superficiale.

La libreria sorella `speechonnxmetrics` esiste per rendere quel giudizio
misurabile invece che impressionistico. Valuta l'audio sul **MOS** (Mean
Opinion Score, un punteggio da 1 a 5 della qualità percepita) in due modi:
predittori neurali senza riferimento come DNSMOS e UTMOS, che valutano una
registrazione senza un originale pulito con cui confrontarla, e metriche
intrusive come STOI e SI-SDR, che richiedono il riferimento pulito e
misurano quanto l'output sia effettivamente vicino ad esso.

```python
import speechonnxmetrics as s

s.score("clean.wav", ["utmos"])
# -> {'utmos': 4.41}

s.score("denoised.wav", ["stoi", "si_sdr"], ref="clean.wav")
# -> {'stoi': 0.66, 'si_sdr': -26.9}
```

Eseguitela prima e dopo un denoiser o un estensore e la forma di un
confronto reale emerge da sola: DNSMOS o UTMOS sull'audio grezzo ed
elaborato per vedere se la qualità percepita si è mossa, e — quando esiste
un riferimento pulito, cosa vera per test di rumore sintetico ma raramente
per una vera chiamata telefonica — SI-SDR o STOI per vedere se il segnale
elaborato è effettivamente convergito verso di esso invece di suonare
soltanto diverso. È la stessa disciplina dietro le cifre di SNR nella
tabella dei denoiser sopra: un numero legato a una condizione di rumore
specifica, non un aggettivo. La famiglia più ampia di librerie vocali in
puro ONNX in cui questa si inserisce, incluso `speechonnxmetrics` stessa, è
trattata in
[A Family of Pure-ONNX Speech Libraries](/it/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries).

Ripulire l'audio prima che raggiunga un riconoscitore, un sistema di
identificazione del parlante o un ascoltatore umano è un'ingegneria a sé,
con il proprio registro di compromessi e il proprio elenco di approcci
tentati e non sopravvissuti al contatto con un segnale reale.

Domande sull'applicazione di questo a una pipeline specifica:
[mettetevi in contatto](/it/contact).
