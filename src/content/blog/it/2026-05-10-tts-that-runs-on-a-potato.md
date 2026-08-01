---
title: "Modelli di TTS che Girano su una Patata"
description: "phoonnx è un framework di ricerca per la sintesi vocale basata su VITS, costruito per girare comodamente su hardware di fascia bassa. Nessuna GPU, nessun cloud, nessuna chiave API — solo una voce ONNX da ~15,65 milioni di parametri e una CPU. Ecco quanto può essere piccola una buona voce, e come le addestriamo."
date: 2026-05-10
lang: it
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "ONNX"
  - "VITS"
  - "self-hosted"
  - "OVOS"
draft: false
---

Una buona sintesi vocale non richiede una GPU né un abbonamento cloud. Una voce naturale e multilingue può stare in qualcosa
che vi vergognereste di chiamare server — quel genere di scheda che tenete in un
cassetto "non si sa mai". Una patata.

[**phoonnx**](https://github.com/TigreGotico/phoonnx) è il nostro framework di
ricerca proprio per quel bersaglio: piccole voci basate su VITS che girano
**completamente offline, su CPU, su hardware economico**, e che possiamo anche
*addestrare da zero* noi stessi.

## Quanto è piccolo "piccolo"?

Mettiamoci sopra un numero concreto invece di sventolare le mani. Abbiamo preso una
voce phoonnx di produzione — la voce basca "Miro"
(`OpenVoiceOS/phoonnx_eu-ES_miro_espeak`) — direttamente da Hugging Face e abbiamo
contato i pesi nel grafo ONNX:

```python
import onnx, numpy as np
m = onnx.load("miro_eu-ES.onnx")
print(sum(int(np.prod(i.dims)) for i in m.graph.initializer))
# 15650459
```

**~15,65 milioni di parametri.** Questa è l'intera voce — encoder, decoder,
tutto quanto — in un file da 63 MB. La voce femminile "Dii" della stessa release
conta *esattamente lo stesso* numero, perché condividono l'architettura VITS
standard di phoonnx; la personalità vive nei pesi, non in capacità aggiuntiva.

Per dare una prospettiva: un singolo strato di un "piccolo" modello linguistico
moderno può portare più parametri di questo intero sintetizzatore vocale, eppure
parla fluentemente.

## Perché VITS, e perché ONNX

[VITS](https://arxiv.org/abs/2106.06103) è la spina dorsale di ogni voce phoonnx.
È un'architettura end-to-end — testo (be', fonemi) in ingresso, forma d'onda in
uscita — senza un vocoder separato da accudire e senza un ciclo autoregressivo che
avanza un campione alla volta. Quel design end-to-end è precisamente ciò che la
rende trattabile su una patata: un unico passaggio in avanti, sintesi parallela,
fatto.

Non spediamo PyTorch all'edge. Le voci addestrate vengono esportate in **ONNX** ed
eseguite tramite [`onnxruntime`](https://onnxruntime.ai/) sulla **CPU** — niente
CUDA, niente GPU, niente roulette dei driver. `onnxruntime` è un motore C++ compatto
e portatile, e un grafo da 15 milioni di parametri rientra ampiamente in ciò che un
core di classe Raspberry Pi mastica più veloce del tempo reale. Il risultato è un
assistente vocale che continua a parlare quando la vostra connessione internet è
giù, quando il provider cloud ha un'interruzione, o quando semplicemente non avete
mai voluto che l'audio di casa uscisse di casa in primo luogo.

## I fonemi sono dove si nasconde l'intelligenza

Un modello acustico minuscolo può permettersi di essere minuscolo perché phoonnx fa
il duro lavoro linguistico *a monte*, nel phonemizer. Un phonemizer
(grafema-fonema, o G2P) converte il testo scritto nella sequenza di unità sonore che
il modello effettivamente pronuncia — così che la rete VITS non debba mai imparare
l'ortografia, ma solo il suono.

Il nostro lavoro sui fonemi si fonda su **[grafema-a-IPA per 820 lingue](/it/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** e sulla **[fonetica classica del portoghese](/it/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, che rendono possibile addestrare voci per lingue a basse risorse senza settimane di annotazione esperta.

phoonnx è deliberatamente agnostico rispetto al phonemizer e ne raccoglie un
piccolo esercito: `espeak-ng`, [gruut](https://github.com/rhasspy/gruut),
[epitran](https://github.com/dmort27/epitran),
[misaki](https://github.com/hexgrad/misaki),
[transphone](https://github.com/xinjli/transphone) (che raggiunge le migliaia di
lingue catalogate in Glottolog), oltre a specialisti come
[mantoq](https://github.com/mush42/mantoq) per l'arabo,
**[cotovia](https://github.com/TigreGotico/pycotovia)** per il galiziano, OpenJTalk
per il giapponese, e KoG2P per il coreano. Emettono IPA, ARPA, Pinyin, Hangul,
Buckwalter — qualunque cosa serva alla lingua. C'è persino un G2P multilingue basato
su modello costruito su ByT5, esportato in ONNX come tutto il resto.

Scaricare l'ortografia sul phonemizer è il trucco che permette a un modello da 15
milioni di parametri di suonare bene in una lingua a basse risorse che non ha mai
visto scritta.

## Un framework per *costruire* voci, non solo per eseguirle

phoonnx non è
solo un toolkit di inferenza. Il framework compagno
[**`phoonnx_train`**](https://github.com/TigreGotico/phoonnx) è il modo in cui
*creiamo* le voci in primo luogo.

`phoonnx_train` copre l'intera pipeline:

- **Preelaborazione** di un dataset in stile LJSpeech in dati di addestramento
  fonemizzati.
- **Addestramento** del generatore VITS (quei ~15,65M di parametri) su una singola
  GPU consumer o di fascia media — un modello così piccolo non richiede un cluster
  di addestramento.
- **Esportazione** del checkpoint finito in ONNX con un singolo script, pronto per
  essere calato direttamente in `onnxruntime` su un dispositivo.

Poiché la ricetta è aperta e i modelli sono piccoli, costruire una voce
completamente nuova per una lingua che *non* ha alcuna opzione offline aperta è un
progetto su scala di weekend, non su scala di borsa di ricerca. È così che siamo
riusciti a colmare lacune per lingue trascurate — basco, mirandese, portoghese
europeo e altre — invece di aspettare che un fornitore decida che una lingua è
commercialmente interessante.

## Già collegato al vostro assistente

Non dovete incollare a mano nulla di tutto questo. phoonnx include un plugin nativo
per OpenVoiceOS, `ovos-tts-plugin-phoonnx`, che recupera e carica le voci per voi:

```json
"tts": {
  "module": "ovos-tts-plugin-phoonnx",
  "ovos-tts-plugin-phoonnx": {
    "voice": "OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone"
  }
}
```

Omettete `voice` e sceglie il primo modello che corrisponde alla vostra lingua. Per
gestire le voci al di fuori di un assistente c'è una CLI, `phoonnx-voices`, per
elencare lingue, sfogliare voci e pre-scaricare modelli:

```bash
phoonnx-voices list-voices --lang pt-PT
phoonnx-voices download OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone
```

E poiché phoonnx parla il semplice VITS-su-ONNX, il suo motore di inferenza esegue
anche voci addestrate da Piper, Mimic3, Coqui e MMS — **oltre mille lingue e voci**
in totale. Un piccolo runtime, un enorme catalogo, e niente di tutto ciò che
telefona a casa.

## Il punto

La tecnologia vocale che vi rispetta deve girare *dove siete voi* — sul vostro
hardware, sotto il vostro controllo, con il cavo di rete staccato se volete. phoonnx
è la nostra scommessa che il modo per arrivarci non siano modelli più grandi, ma la
giusta architettura resa piccola: VITS per la spina dorsale, phonemizer ingegnosi
per portare il carico linguistico, ONNX per la portabilità e un framework di
addestramento aperto così che chiunque possa far crescere il catalogo.

Quindici milioni e mezzo di parametri, in esecuzione su CPU, addestrati su hardware
che chiunque può possedere: questa è la pipeline di addestramento dietro ogni voce
phoonnx.
