---
title: "Esportare e Quantizzare Modelli Vocali Aperti Perché Funzionino Davvero"
description: "Un modello vocale addestrato su una pagina GitHub di ricerca non è un assistente vocale. Convertiamo checkpoint aperti di ASR e TTS in ONNX, CoreML e GGUF, li quantizziamo e ne validiamo l'output — poi pubblichiamo i risultati sotto OpenVoiceOS, così che ogni lingua che coprono giri in un assistente reale e offline."
date: 2026-08-01
lang: it
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "CoreML"
  - "GGUF"
  - "ASR"
  - "OVOS"
  - "OpenVoiceOS"
  - "Quantization"
  - "Open Source"
draft: false
---

Un modello di riconoscimento vocale pubblicato come checkpoint di ricerca è di norma una cartella di pesi PyTorch, uno script di addestramento e una nota su quale GPU sia stato addestrato. Questo basta a riprodurre un punteggio di benchmark. Non basta a farlo girare su un Raspberry Pi, su un telefono o su un portatile senza connessione a internet. Passare dall'uno all'altro è lavoro di conversione, ed è la maggior parte di ciò che determina se un modello vocale aperto arriva mai a un dispositivo reale.

Facciamo questo lavoro di conversione di mestiere: prendiamo modelli aperti di ASR (riconoscimento automatico del parlato, cioè speech-to-text) e TTS (text-to-speech) e li trasformiamo in file che girano offline, su CPU ordinarie o su acceleratori on-device, senza bisogno di uno stack Python di addestramento in fase di esecuzione. La maggior parte dei risultati viene pubblicata sotto l'[organizzazione OpenVoiceOS](https://huggingface.co/OpenVoiceOS) su Hugging Face anziché sotto la nostra, ed è una scelta deliberata — il motivo è più sotto.

## Perché un checkpoint non è una distribuzione

Un checkpoint PyTorch o NeMo si aspetta un ambiente Python specifico: le versioni giuste delle librerie, di norma una GPU, e il framework di addestramento stesso solo per eseguire l'inferenza. Questo stack è grande, cambia continuamente e non è qualcosa che si vuole includere in un assistente vocale che deve avviarsi su una piccola scheda.

L'esportazione del modello risolve questo problema convertendo la rete addestrata in un formato pensato puramente per l'inferenza — niente codice di addestramento, niente autograd, nessun vincolo al framework. Puntiamo a tre formati di questo tipo, ciascuno per una forma di distribuzione diversa:

- **[ONNX](https://onnxruntime.ai/)** (Open Neural Network Exchange) è un formato di grafo portabile che un'ampia gamma di runtime può eseguire, su CPU o GPU, su Linux, Windows, macOS o schede embedded. È il nostro obiettivo predefinito perché gira ovunque giri `onnxruntime`, cioè quasi ovunque.
- **CoreML** è il formato di inferenza on-device di Apple. Un pacchetto CoreML gira sul Neural Engine o sulla GPU di un Mac o di un iPhone anziché sulla CPU, il che conta per il riconoscimento vocale in tempo reale su hardware Apple.
- **[GGUF](https://github.com/ggml-org/llama.cpp)** è il formato usato da `llama.cpp` e dal suo ecosistema, costruito per modelli quantizzati in stile LLM che devono girare con un ingombro di memoria ridotto. Lo usiamo per i modelli vocali più recenti basati su transformer, architetturalmente più vicini a un modello linguistico che a un classico modello acustico.

Scegliere l'obiettivo giusto non è cosmetico. Un modello ASR basato su conformer (l'architettura dietro la maggior parte dei moderni riconoscitori vocali, che combina convoluzione e self-attention) si converte in modo pulito in ONNX o CoreML. Un modello vocale basato su Qwen3 è, sotto il cofano, un modello linguistico, perciò si inserisce naturalmente nella pipeline GGUF/`llama.cpp` invece.

## Cosa costa la quantizzazione, e cosa offre in cambio

Quantizzare significa memorizzare i pesi di un modello con meno bit per numero — 16, 8 o 4 bit invece dei float a 32 bit con cui è stato addestrato. Numeri più piccoli producono un file più piccolo e, su hardware adatto, un'inferenza più veloce, perché c'è meno dati da spostare e aritmetica più economica da eseguire.

Possiamo dare una cifra esatta di questo compromesso per un modello reale. `nvidia/parakeet-tdt-0.6b-v3` è un modello ASR da 0,6 miliardi di parametri. Il suo componente CoreML mel-encoder è di 1132,5 MB a piena precisione; palettizzato a 4 bit diventa 284,2 MB — una riduzione di 3,99 volte, corrisposta quasi esattamente nei suoi tre sotto-componenti (encoder, decoder, rete di decisione congiunta). Sull'intero pacchetto, l'esportazione CoreML non quantizzata è di circa 1,14 GB; la versione a 4 bit è di circa 293 MB. È la differenza tra un modello che sta comodamente su un telefono e uno che a malapena ci sta.

Il costo è l'accuratezza: meno bit per peso significa meno precisione, e oltre un certo punto ciò si traduce in più errori di riconoscimento. Il modo standard di misurarlo per l'ASR è il WER (word error rate — la percentuale di parole che il modello sbaglia rispetto a una trascrizione corretta). Per questo pubblichiamo più livelli di quantizzazione dello stesso modello fianco a fianco — 4 bit, 6 bit, 8 bit (`int8`) e `fp16` — invece di sceglierne uno sperando che vada bene per ogni dispositivo. Un telefono e un desktop possono permettersi punti diversi su quella curva.

## Il problema della validazione

Una conversione che produce silenziosamente un output peggiore è più pericolosa di nessuna conversione, perché nulla in essa sembra rotto — si carica, gira, semplicemente riconosce il parlato un po' peggio, o molto peggio in una lingua che personalmente non parlate e non potete verificare a orecchio. L'unico modo per accorgersene è confrontare l'output del modello esportato con l'implementazione di riferimento originale su audio reale, per ogni lingua e ogni livello di quantizzazione, prima di pubblicarlo.

Questo è il minimo indispensabile per qualsiasi conversione che distribuiamo: far passare lo stesso audio attraverso il modello sorgente e il modello convertito, e confermare che concordano. Non è un passaggio affascinante, ma saltarlo è il modo in cui una "lingua supportata" smette di funzionare silenziosamente.

## Perché i modelli vivono sotto OpenVoiceOS, non sotto di noi

L'esportazione di modelli è una capacità aziendale: dateci un checkpoint e un dispositivo di destinazione, e lo faremo girare offline, validato, al livello di quantizzazione adatto al vostro hardware. Ma i modelli convertiti che produciamo a partire da checkpoint aperti e non commissionati vanno a
[OpenVoiceOS](https://huggingface.co/OpenVoiceOS), la piattaforma aperta di assistente vocale per cui questi modelli sono costruiti — non al nostro spazio dei nomi.

Il motivo è semplice: OpenVoiceOS è dove i modelli vengono usati. Un modello convertito che siede in un account aziendale è un bell'artefatto. Lo stesso modello pubblicato dove [`ovos-stt-plugin-onnx-asr`](https://github.com/OpenVoiceOS/ovos-stt-plugin-onnx-asr),
[`ovos-stt-plugin-coreml`](https://github.com/TigreGotico/ovos-stt-plugin-coreml)
o [`ovos-stt-plugin-rover`](https://github.com/TigreGotico/ovos-stt-plugin-rover)
può trovarlo per nome è una lingua che un assistente reale può ora parlare o capire. Pubblicare sotto l'organizzazione stessa della piattaforma è ciò che trasforma una conversione in funzionalità supportata anziché in una curiosità di ricerca, ed è come ci assicuriamo che fare questo lavoro una volta sola vada a beneficio di ogni installazione OpenVoiceOS, non solo del cliente che l'ha richiesto.

Per essere chiari sull'attribuzione: non addestriamo questi modelli acustici da zero, e non ne rivendichiamo il merito. La ricerca sottostante — i modelli Parakeet e Conformer di NVIDIA, i modelli IndicConformer di AI4Bharat per le lingue indiane, modelli universitari e di istituti pubblici come il Proxecto Nós della Galizia o i modelli Conformer del centro basco HiTZ, e sforzi indipendenti di conversione di modelli per lingue africane e minoritarie — appartiene ai gruppi che li hanno addestrati. Ciò che aggiungiamo è la conversione, la quantizzazione, il controllo di correttezza rispetto all'originale e il collegamento del plugin che permette a un assistente di caricare il risultato per nome.

La scala di quel lavoro di conversione, contata direttamente da ciò che è pubblicato: oltre novanta varianti ASR Parakeet (tra dimensioni, lingue e livelli di quantizzazione) esportate in ONNX e CoreML; più di trenta modelli Conformer NVIDIA; ventidue modelli IndicConformer di AI4Bharat che coprono lingue indiane a scarse risorse; ventidue modelli wav2vec2 per lingue tra cui svedese, islandese, faroese, finlandese ed entrambe le forme scritte del norvegese; nove modelli Conformer per basco e galiziano; e modelli Whisper e wav2vec2 convertiti indipendentemente che coprono lingue africane e creole come shona, zulu, xhosa, malgascio, creolo haitiano e cabilo. Contando solo le conversioni ASR confermate per codice di lingua distinto, sono almeno 74 lingue diverse con un riconoscitore vocale offline e quantizzato disponibile oggi — prima ancora di contare il catalogo separato di voci TTS esportate per lingue come basco, aragonese, asturiano, galiziano, occitano e arabo.

## Se la vostra lingua o il vostro dispositivo oggi non hanno nulla di offline

La maggior parte delle lingue non ottiene mai un'opzione vocale offline commerciale, perché il mercato per quella sola lingua non giustifica a un fornitore di costruirne una. Il modello descritto sopra — prendere un checkpoint aperto esistente, convertirlo in un formato che gira sull'hardware che avete davvero, quantizzarlo per farlo stare, verificarlo rispetto all'originale e collegarlo a un plugin — non dipende dalla dimensione del mercato. Dipende dall'esistenza di un checkpoint aperto da cui partire, il che è sempre più il caso normale.

Se avete un modello vocale che gira solo su una GPU di addestramento, o un dispositivo che al momento non ha supporto vocale offline nella sua lingua, [contattateci](/contact) o guardate come si presenta questo lavoro end-to-end sulla nostra [pagina servizi](/services).
