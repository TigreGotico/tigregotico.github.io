---
title: "Perché Accumuliamo Dati: Dai Cataloghi Scrapati a Modelli Vocali e Linguistici più Intelligenti"
description: "Dati puliti, tipizzati e con buona provenienza sono la materia prima di ogni modello che spediamo. Come i cataloghi costruiti dai nostri scraper diventano vocabolari di biasing per ASR, classificatori di intenti, corpora NER sintetici, lessici G2P, voci TTS — e carburante onesto per gli LLM."
date: 2026-07-04
lang: it
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Data Collection"
  - "ASR"
  - "NLP"
  - "TTS"
  - "LLM"
  - "FOSS"
draft: false
---

Scriviamo molto su *come* estraiamo i dati — gli
**[strumenti di ricognizione](/it/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**,
i **[trasporti anti-bot](/it/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**,
i **[client di metadati musicali tipizzati](/it/blog/2026-04-20-music-database-scrapers)**.
Una domanda legittima è *perché*. Siamo un'azienda di IA vocale; che ci facciamo a
mantenere scraper per enciclopedie musicali e directory radio?

La risposta è che **i dati sono a monte di tutto ciò che spediamo**. Un assistente
vocale è buono solo quanto le parole che si aspetta di sentire, le entità che sa
riconoscere e le pronunce che conosce. Niente di tutto ciò viene dai diagrammi di
architettura. Viene dai dati — e i dati interessanti raramente si trovano in un
dataset preconfezionato. Sono sparsi per il web pubblico, in cataloghi che gli
esseri umani hanno passato decenni a curare.

Ecco cosa succede a quei dati dopo che li raccogliamo.

## Entità: il vocabolario di cui vive un assistente vocale

Dite "riproduci Sultans of Swing dei Dire Straits" a un assistente. Prima che un
qualsiasi modello possa agire su questo, qualcosa deve sapere che *Sultans of Swing*
è una traccia e *Dire Straits* è un artista. Moltiplicate per ogni artista, album,
stazione, podcast e genere che un utente potrebbe nominare, e avete il vero
vocabolario di un assistente multimediale — centinaia di migliaia di entità
nominate, nessuna delle quali appare in un corpus di addestramento NLP standard.

I nostri client multimediali emettono esattamente questo: record tipizzati con id
canonici, normalizzati nello schema
**[mediavocab](https://github.com/TigreGotico/mediavocab)**. Quei cataloghi di
entità alimentano direttamente:

- **Il matching di intenti basato su parole chiave** — le liste di entità diventano
  i gazetteer che ancorano le query multimediali in OpenVoiceOS.
- **I classificatori di intenti** — i nostri dataset di intenti multimediali
  combinano entità reali scrapate con la sintesi di frasi tramite template e
  assistita da LLM, producendo enunciati simili a quelli dei veri utenti, popolati
  con entità che esistono davvero. I modelli addestrati in questo modo gestiscono la
  decisione "è questa una richiesta di riproduzione, e di cosa?" nella pipeline
  multimediale di OpenVoiceOS.
- **I corpora NER sintetici** — la stessa ricetta si generalizza: prendete un
  catalogo di entità reali, generate frasi naturali attorno ad esse, e avete un
  dataset di named-entity etichettato per un dominio che nessun corpus accademico
  copre. Le entità sono reali, quindi la distribuzione è onesta; le frasi sono
  sintetiche, quindi il volume è quello che vi serve.

## Orientare il riconoscimento vocale verso le parole che contano

L'ASR generico è addestrato su parlato generico, quindi trascrive *Dire Straits*
come "dire straights" e storpia ogni nome di paese portoghese. La soluzione non è
riaddestrare da zero — è il **biasing**: dare al riconoscitore il vocabolario del
vostro dominio.

I cataloghi scrapati sono quel vocabolario. In concreto:

- **Biasing tramite modello linguistico** — gli LM n-gram o a shallow-fusion
  addestrati su testo ricco di entità spingono il decoder verso parole del dominio.
  L'LM di un assistente multimediale dovrebbe essere addestrato su *titoli di tracce
  e nomi di artisti*, e il nostro può esserlo, perché li abbiamo — tipizzati,
  deduplicati, con provenienza pulita.
- **Riconoscimento condizionato da prompt** — le architetture più recenti accettano
  un prompt di testo o una lista di contesto al momento dell'inferenza. Alimentare la
  libreria effettiva dell'utente — le entità che i nostri client hanno estratto —
  nel contesto del riconoscitore trasforma un "nome proprio irriconoscibile" in un
  "elemento di vocabolario noto".
- **Dati di fine-tuning** — dove il biasing non basta, i cataloghi di entità più le
  nostre [voci TTS](/it/blog/2026-05-10-tts-that-runs-on-a-potato) generano parlato
  sintetico per le esatte frasi che un deployment non deve sbagliare. Questo è il
  [servizio di costruzione di dataset](/it/services) che offriamo commercialmente, ed
  è costruito sulla stessa pipeline aperta.

## Pronuncia: dai dizionari crawlati a G2P e TTS

Alcuni dei nostri crawl più preziosi non sono cataloghi di entità ma **lessici**. Il
crawl del dizionario Infopédia ha prodotto
[infopedia-pt-ipa](https://huggingface.co/datasets/TigreGotico/infopedia-pt-ipa),
oltre 100.000 coppie parola→IPA del portoghese europeo. Quel dataset:

- fa da benchmark e mette a punto il nostro
  [stack G2P portoghese basato su regole](/it/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes),
- ancora la pronuncia per le [voci TTS](/it/blog/2026-06-15-two-voices-every-language-miro-and-dii)
  così che dicano le parole nel modo in cui i parlanti le dicono davvero,
- e semina risorse etichettate per significato come il nostro
  [lavoro sugli eterofoni portoghesi](https://github.com/TigreGotico/bifonia), dove
  la stessa grafia mappa a suoni diversi a seconda del senso.

I dati grafia-a-suono sono l'angolo meno affascinante della tecnologia vocale e
quello che più decide se una voce suona nativa. Nessuno vi consegna questi dati. Li
crawlate, li pulite e li pubblicate — così che il prossimo team non debba farlo.

## Carburante onesto per gli LLM

Tutto ciò che precede si applica anche ai grandi modelli linguistici, con una svolta
in più: **ora la provenienza conta più del volume**. Il web aperto è sempre più
contaminato da testo generato da modelli; addestrare o valutare su di esso ricicla
silenziosamente gli output dei modelli di ieri. Ecco perché teniamo alle fonti con
provenienza umana pulita — decenni di
[archivi Usenet](/it/blog/2026-07-01-usenet-and-remailers-in-2026), enciclopedie
curate, dizionari ufficiali — ed ecco perché ogni dataset che pubblichiamo dichiara
da dove proviene ciascun record.

I cataloghi strutturati alimentano gli LLM anche al momento dell'*inferenza*: uno
store di entità tipizzato e deduplicato è esattamente ciò a cui un livello di
retrieval o l'API di uno strumento di un agente vogliono ancorare le proprie
risposte. API pulite su fonti disordinate non sono solo una comodità di scraping —
sono il modo in cui si tiene un modello linguistico attaccato ai fatti.

## La pipeline, da un capo all'altro

Quindi il quadro completo è questo:

```
recon → resilient extraction → typed clients → normalised catalogues
      → gazetteers & intent data     (NLP)
      → biasing LMs & fine-tune sets (ASR)
      → lexicons & phoneme labels    (G2P / TTS)
      → provenance-clean corpora     (LLMs, retrieval)
```

Ogni fase è open source, ogni dataset è pubblicato dove la licenza lo consente, e la
stessa pipeline che soddisfa i bisogni dei nostri modelli è disponibile
[come collaborazione](/it/services) per i vostri. Gli scraper non sono una missione
secondaria. Sono la cava da cui è costruito l'intero stack.
