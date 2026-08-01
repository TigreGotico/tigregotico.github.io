---
title: "Una Famiglia di Librerie Vocali Pure-ONNX"
description: "TigreGótico mantiene un insieme di librerie vocali — estensione di banda, clonazione vocale, embedding del parlante, VAD, accento di parola, fonemizzazione, TTS e una libreria di metriche per valutarle tutte — che condividono un'unica regola di runtime: solo onnxruntime e numpy, niente PyTorch, nessuna GPU richiesta."
date: 2026-08-03
lang: it
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "TTS"
  - "voice cloning"
  - "VAD"
  - "self-hosted"
  - "phoonnx"
draft: false
---

ONNX è un formato di file per una rete neurale addestrata: i pesi e il grafo di calcolo, congelati, senza dipendenza dal framework che l'ha addestrata. Un modello esportato in ONNX può girare attraverso **ONNX Runtime**, un piccolo motore di inferenza che non fa altro che eseguire quel grafo. Non sa come il modello sia stato addestrato, non supporta l'addestramento e non ha bisogno che PyTorch o TensorFlow siano installati.

Diverse nostre librerie rispettano un'unica regola: in fase di esecuzione, le uniche dipendenze sono `onnxruntime` e `numpy`. Non "per lo più" — l'importazione del pacchetto stesso non trascina mai un framework di addestramento. `audiosronnx` (estensione di banda e riduzione del rumore),
`voiceclonnx` (clonazione vocale), `speakeronnx` (embedding del parlante), `speechonnxmetrics`
(valutazione), `stressonnx` (accento di parola), `vadonnx` (rilevazione dell'attività vocale) e
`phoonnx` (fonemizzazione e text-to-speech) la seguono tutte, ciascuna nel proprio pacchetto PyPI. Altre due, `phoonnx.js` e `precise-onnx-js`, applicano la stessa idea nel
browser con `onnxruntime-web` al posto suo.

## Perché preoccuparsene

Il modo ovvio di distribuire un modello vocale è tenere il framework di addestramento anche per l'inferenza. È comodo durante lo sviluppo. È una zavorra in produzione.

- **Dimensione dell'installazione.** Un'installazione PyTorch + CUDA arriva a gigabyte prima ancora di aver caricato un solo modello. `onnxruntime` e `numpy` insieme sono poche decine di megabyte.
- **Nessun CUDA da gestire.** Far corrispondere un driver GPU, una versione del toolkit CUDA e una build del framework è una fonte ricorrente di rotture. ONNX Runtime solo-CPU salta tutto questo, e continua comunque a eseguire lo stesso grafo su una GPU dove ne è disponibile una.
- **Gira su hardware modesto.** Un Raspberry Pi o un portatile di dieci anni fa può eseguire `onnxruntime` comodamente. Di norma non può eseguire uno stack PyTorch completo a una velocità utilizzabile, o installarlo del tutto su una scheda a 32 bit o con memoria limitata.
- **Un solo artefatto, ogni piattaforma.** Lo stesso file `.onnx` gira senza modifiche su Linux, macOS, Windows — e, tramite `onnxruntime-web`, dentro una scheda del browser. Non c'è un passo di esportazione separato per ogni obiettivo.
- **Nessun conflitto di versione tra addestramento e servizio.** Uno stack di addestramento fissa versioni specifiche di framework e CUDA. Uno stack di servizio vuole l'insieme di dipendenze più piccolo e stabile possibile. Separarli significa aggiornare l'uno senza rompere l'altro.

## Cosa costa

Il vincolo è reale, e non è gratuito.

**Non si può affinare in processo.** Un grafo ONNX non ha ottimizzatore, né passaggio all'indietro.
Ognuna di queste librerie tratta i modelli come artefatti fissi: li si carica e li si esegue. L'addestramento o l'affinamento avviene separatamente, con il framework originale, e il risultato viene esportato in ONNX in seguito. `stressonnx` e `speechonnxmetrics` mantengono entrambi un extra opzionale `export` che include `torch` puramente per quel passo di conversione offline
— mai per l'inferenza.

**Non ogni architettura si esporta in modo pulito.** Flusso di controllo dinamico, kernel CUDA personalizzati,
o operazioni senza equivalente ONNX possono bloccare un'esportazione diretta. Il README di `audiosronnx` lo documenta direttamente: mantiene una [lista dei non pubblicati](https://github.com/TigreGotico/audiosronnx)
di modelli che ha valutato e respinto, con le ragioni, anziché fingere che ogni modello di ricerca si porti sempre.

**Il preprocessing deve essere reimplementato a mano.** Un framework come PyTorch o Kaldi
fornisce implementazioni veloci e testate di STFT (trasformare una forma d'onda in uno spettrogramma),
caratteristiche mel-filterbank e ricampionamento. Una volta che il modello stesso non dipende più da
quel framework, non può farlo nemmeno il suo preprocessing — `speakeronnx` reimplementa un
filtro log-mel a 80 bande in NumPy puro esattamente per questo motivo, e `audiosronnx` fa lo
stesso per STFT e ricampionamento. È più codice da far funzionare correttamente, e richiede i propri
test di parità rispetto all'originale.

## Un compito, più motori, un'unica API

I modelli vocali addestrati variano enormemente per lingua, condizione di registrazione e dominio
di destinazione. Un modello di verifica del parlante addestrato su parlato letto pulito può fallire su
audio telefonico. Un modello di clonazione vocale calibrato per il trasferimento del timbro in inglese può perdere intelligibilità
su lingue tonali. Non esiste un unico modello che vinca ovunque, perciò impegnarsi su uno solo a priori è una scommessa.

Ogni libreria di questa famiglia sceglie un unico compito e avvolge diversi modelli pubblicati indipendenti dietro un'unica interfaccia, così che cambiare motore sia una modifica di una riga anziché una riscrittura.

`audiosronnx` separa i suoi due compiti — riduzione del rumore ed estensione di banda (trasformare
una registrazione a banda stretta, come audio telefonico a 8 kHz, in un segnale dal suono più pieno, a frequenza di campionamento
più alta) — dietro due loader, ciascuno sostenuto da diversi motori:

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

`load_denoise` registra attualmente dieci riduttori di rumore (`dpdfnet`, `mossformer2`, `frcrn`,
`mpsenet`, `gtcrn`, `cmgan`, `metadenoiser`, `mossformergan`, `voicefixer`,
`deepfilternet`), da un modello di 0,54 MB a uno di 415 MB, sotto licenze diverse.
`load_sr` registra sette estensori di banda (`lavasr`, `novasr`, `flowhigh`,
`hifiganbwe`, `apbwe`, `sidon`, `callenhancer`). I modelli dominati — quelli che un altro motore
batte su ogni asse misurato — restano comunque nel registro, così che un risultato di benchmark pubblicato
resti riproducibile su richiesta.

`voiceclonnx` adotta lo stesso approccio per la clonazione vocale — convertire la voce in una
registrazione esistente perché suoni come un diverso parlante di riferimento, senza passare per il
testo:

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

Sono registrati dieci motori (`facodec`, `openvoice`, `chatterbox`, `triaan`, `cosyvoice`,
`bicodec`, `knnvc`, `focalcodec`, `lscodec`, `rvc`), che spaziano su sei famiglie di modelli
distinte — scambio di caratteristiche kNN, codec fattorizzato, flow-matching, trasferimento del colore tonale,
LM-codec autoregressivo e codec disaccoppiato dal parlante. Dietro le quinte ciascuno viene fornito con
numeri pubblicati di intelligibilità e somiglianza del parlante, così che scegliere un motore sia un
confronto, non un lancio di moneta.

`vadonnx` applica lo schema alla rilevazione dell'attività vocale — decidere quali parti di un
flusso audio contengano affatto del parlato:

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

Sono registrate sei famiglie di modelli (`silero`, `marblenet`, `pyannote`, `fsmn`,
`speechbrain`, `ten`), e una `IOSignature` dichiarativa permette a un unico motore generico
di pilotarne la maggior parte, o di puntare a qualsiasi file VAD `.onnx` personalizzato.

`speakeronnx` estrae un **embedding del parlante** — un vettore a lunghezza fissa che riassume
chi sta parlando, indipendentemente da cosa ha detto — e confronta due embedding per similarità coseno
per verificare se due clip appartengono allo stesso parlante:

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

Registra nove modelli su quattro famiglie di architetture (WeSpeaker, CAM++, ERes2Net,
ReDimNet), con dimensioni di embedding e licenze pubblicate.

`stressonnx` sceglie l'accento di parola per i front-end di text-to-speech — quale sillaba di una parola
porta l'enfasi, un'informazione che molte lingue non esplicitano (il russo *за́мок*, castello,
contro *замо́к*, lucchetto, condividono ogni lettera). Registra una pipeline neurale per il russo, una
seconda per l'ucraino e il bielorusso, e un backend basato su regole e vocabolario che copre 26
lingue senza alcuna inferenza neurale:

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

`phoonnx` fonemizza il testo (trasforma le parole scritte nelle unità sonore che un modello TTS
consuma) ed esegue il text-to-speech su 17 motori di sintesi registrati e
voci esportate da diversi ecosistemi (phoonnx nativo, Piper, Mimic3, Coqui, MMS,
Transformers):

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

`phoonnx.js` porta gli stessi percorsi di tokenizzazione nel browser con
`onnxruntime-web`, e `precise-onnx-js` porta la rilevazione della parola di attivazione (estrazione di caratteristiche MFCC
più un classificatore ONNX, compatibile con i modelli Mycroft Precise) in
JavaScript, entrambi senza un server:

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

I pesi per `audiosronnx` (18 modelli pubblicati) e `voiceclonnx` (10 modelli pubblicati)
vivono come download separati sull'[organizzazione Hugging Face di TigreGótico](https://huggingface.co/TigreGotico), recuperati al primo utilizzo e messi in cache localmente, così che
scegliere un motore diverso sia una modifica di configurazione, non una ridistribuzione.

## Chiudere il cerchio: giudicare i motori invece di indovinare

Registrare molti motori dietro un'unica API ripaga solo se si può dire quale sia
effettivamente migliore per il proprio input. È a questo che serve `speechonnxmetrics`: una libreria di metriche costruita sullo stesso vincolo `numpy` + `onnxruntime`, così che valutare un modello non costi nulla in più da installare.

Raggruppa le metriche in tre tipi. Gli stimatori **MOS senza riferimento** — UTMOS, DNSMOS,
NISQA, SIGMOS — prevedono un **Mean Opinion Score**, il voto di naturalezza da 1 a 5 che un panel
di ascoltatori umani darebbe a una clip, senza bisogno di un riferimento pulito con cui confrontarsi.
Le **metriche intrusive** — STOI (intelligibilità obiettiva a breve termine), SI-SDR
(rapporto segnale-distorsione invariante di scala), MCD (distorsione mel-cepstrale) — necessitano di un
riferimento pulito corrispondente e misurano quanto l'output vi si avvicini. Le **metriche testuali basate su ASR**
— WER (tasso di errore sulle parole) e CER (tasso di errore sui caratteri) — eseguono un riconoscitore
vocale sull'output e confrontano la trascrizione con il testo atteso, individuando
i casi in cui un modello produce un audio che suona bene ma dice le parole sbagliate.

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

Questo trasforma la scelta del motore da un test d'ascolto in una tabella. `voiceclonnx`
pubblica esattamente quel confronto per i suoi dieci motori di clonazione — WER rispetto alla
trascrizione sorgente più un punteggio separato di somiglianza del parlante per ciascuno, così che "facodec
dà lo 0% di WER" o "lscodec scambia il WER per un trasferimento del timbro più forte" sono affermazioni misurate,
non impressioni. Moltiplicate questo per lingue e condizioni di registrazione e il confronto manuale
smette di essere realistico; una metrica oggettiva è ciò che rende un registro a dieci motori
utilizzabile invece che opprimente.

## Dove è utile

Se avete bisogno di elaborazione vocale offline — ripulire una registrazione, clonare una voce,
rilevare chi sta parlando, o sintetizzarne una — su hardware che non vedrà mai una GPU,
questa è la forma da cercare: una piccola dipendenza di runtime, una scelta tra modelli pubblicati
invece di un unico predefinito fisso, e un modo per misurare quale funzioni davvero per il vostro
caso. Ognuna delle librerie sopra è a un `pip install` di distanza, con licenza MIT o Apache a livello
di codice (i pesi dei singoli modelli portano le proprie licenze a monte, documentate per
motore), e gira allo stesso modo su un portatile, un server o un Raspberry Pi.

Contattateci tramite [/contact](/contact) o guardate cos'altro costruiamo su
[/services](/services).
