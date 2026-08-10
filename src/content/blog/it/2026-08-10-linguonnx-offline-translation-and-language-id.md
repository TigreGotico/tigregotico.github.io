---
title: "linguonnx: traduzione e identificazione della lingua offline su ONNX"
description: "linguonnx traduce testo e identifica lingue sulla CPU, senza torch e senza cloud. 184 modelli di traduzione int8 e 5 modelli di identificazione della lingua, 586 lingue raggiungibili, e un router che concatena modelli piccoli quando nessun modello copre una coppia."
date: 2026-08-10
lang: it
author: "Casimiro Ferreira"
tags:
  - "linguonnx"
  - "translation"
  - "language identification"
  - "ONNX"
  - "self-hosted"
  - "OVOS"
draft: false
---

[**linguonnx**](https://github.com/TigreGotico/linguonnx) è una libreria Python
per la traduzione automatica e l'identificazione della lingua. Gira su
`onnxruntime`, sulla CPU, offline. Non usa torch in nessun momento: il ciclo di
generazione encoder-decoder, beam search e cache KV incluse, è scritto
direttamente sui grafi ONNX.

```bash
pip install linguonnx
```

```python
from linguonnx import load_translator, load_detector

tx = load_translator()
print(tx.translate("bom dia, como estás?", src="pt", tgt="en"))
# 'Good morning, how are you?'   via opus-mt-pt-en-int8, 172 MB

det = load_detector()
print(det.detect("Egun on, zer moduz?"))    # 'eu'
```

È Apache-2.0 e non scarica nessun modello che non hai chiesto.

## Cosa contiene

Il registro ha 369 voci di traduzione — fp32 e int8 di ogni modello — e 10 voci
di identificazione della lingua. `load_translator()` usa int8 per impostazione
predefinita, quindi un'installazione normale instrada su 184 modelli di
traduzione quantizzati e 5 classificatori quantizzati. Sono tutti conversioni
ONNX pubblicate sotto [`TigreGotico/`](https://huggingface.co/TigreGotico) su
HuggingFace.

Sul grafo predefinito, 586 lingue sono raggiungibili. Quel numero è fissato nei
test, quindi resta vero oppure la build lo segnala.

I classificatori sono export ONNX di quattro modelli fastText: GlotLID, il
classico `lid.176`, OpenLID e OpenLID-v2. GlotLID etichetta 2102 *varietà*,
quindi l'arabo colloquiale torna come najdi (`ars`) e il cinese può tornare come
cantonese. Questa è identificazione del dialetto quando la vuoi, e
`collapse_varieties=True` quando non la vuoi.

## Una coppia senza modello è una catena di modelli

La maggior parte delle coppie di lingue non ha un modello bilingue. Il router
tratta un modello come un insieme di capacità e non come un arco fisso, e
concatena i passaggi quando serve:

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — è passato dal galiziano
```

Con quella politica, dal portoghese al basco si passa dal galiziano, su due
modelli Marian da 84 MB e 153 MB. Il pivot non è mai silenzioso: la `Route` arriva
con la traduzione e dice quali modelli ha usato e per quali lingue è passata.

Un percorso non è un fatto fisso su una coppia di lingue. È ciò che i vincoli del
chiamante fanno del registro: cambia il budget di dimensione o la preferenza sui
passaggi e la stessa coppia può passare per un'altra lingua, oppure ridursi a un
solo passaggio attraverso un grande modello multilingue. La `Route` dice quale ti
è toccato.

L'ordinamento preferisce l'istituzione che cura la lingua. HiTZ addestra il
basco, Proxecto Nós il galiziano, Projecte AINA il catalano, AI4Bharat le coppie
indiane, Masakhane le coppie dell'Africa occidentale, TartuNLP quelle
ugro-finniche. Un modello dello specialista vince il pareggio contro un modello
multilingue generale.

## Politica a runtime, mai in fase di indicizzazione

Questa è la legge del registro: elenca ogni modello pubblicato, qualunque sia la
sua dimensione, la sua licenza o il suo punteggio. Il filtraggio e l'ordinamento
avvengono a runtime, nel processo del chiamante, con le sue regole. Un modello
che l'indice esclude non può essere scelto in nessun modo, quindi l'indice non
esclude nulla.

Il chiamante imposta la politica in `load_translator`: `max_model_mb`,
`oversize_fallback`, `count_cached_as_free`, `prefer`, `max_hops`, `precision`,
`model_cache_size`, `exclude_flagged` e `min_chrf`. Ognuno si può sovrascrivere
anche chiamata per chiamata.

## Un limite di dimensione preferisce i modelli piccoli, non cancella lingue

Un budget di dimensione è la manopola ovvia per una macchina piccola, e la sua
implementazione ovvia è sbagliata. Usato come filtro, `max_model_mb=500` riduce
le 586 lingue raggiungibili a 249, perché la coda lunga vive dentro i grandi
modelli multilingue e nessuna catena di modelli piccoli li sostituisce.

`oversize_fallback=True` rende il budget una preferenza:

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 586, non 249
```

Dall'inglese al catalano resta il modello piccolo, perché un modello piccolo
esiste. Dall'inglese al ciuvascio si sale a MADLAD, perché MADLAD è l'unico
modello del registro con il ciuvascio, e l'alternativa non è un percorso più
economico ma nessun percorso. `waived_size_cap` dice quale limite il percorso ha
superato, così una macchina che ha stanziato 500 MB scopre di averne scaricati
4945.

Quattro regole tengono la cosa onesta. La ricerca allargata parte solo per la
coppia rimasta vuota. Il limite sale di una dimensione di modello alla volta,
quindi una coppia servita da NLLB-200 e da MADLAD riceve NLLB-200. Il limite
delimita un modello, non un percorso, quindi una catena di due passaggi da 237 MB
la trova la ricerca normale. E l'escalation non supera mai il budget di
download.

## Raggiungibile non è utilizzabile

`madlad400-3b-mt` copre il ciuvascio. Chiedigli `en -> cv` e risponde in russo:
`"Good day, my friend."` torna come `"Добрый день, мой друг."`. L'instradamento è
corretto — l'etichetta del ciuvascio è un pezzo SentencePiece distinto — e il
modello scrive comunque la lingua sbagliata.

Perciò una voce del registro porta `language_flags`, una lingua alla volta, con
l'osservazione dietro: l'input, l'output, il verdetto del rilevatore
(`glotlid=ru`), la data e il metodo. Il ciuvascio è raggiungibile e non è
utilizzabile, e il registro dice entrambe le cose.

La qualità dell'intero modello è registrata allo stesso modo. Un campo `quality`
porta un punteggio chrF contro il riferimento **umano** FLORES-200 devtest, con
il corpus, la modalità di decodifica e la dimensione del campione accanto, perché
un punteggio senza dimensione del campione accanto non significa nulla. L'assenza
del campo significa non misurato, che non è lo stesso stato di cattivo, e nulla
inventa un numero per un modello non misurato. Due controlli alzano un flag: chrF
sotto 40 in una delle due precisioni, e int8 che resta indietro di più di 2 chrF
rispetto a fp32.

Un flag non rimuove nulla dal registro. Dà a `exclude_flagged=True` e a
`min_chrf=` qualcosa su cui agire, e dà a una persona un motivo per leggere:

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

Una scansione su tutto il registro passa una frase reale in ogni modello
registrato e fallisce su output vuoto, output di soli spazi, oppure output
identico all'input. Le frasi di esempio sono per lingua di partenza e verificate
a mano; una lingua senza esempio viene saltata invece di essere provata con testo
di un'altra lingua.

## Da OpenVoiceOS

[`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)
avvolge la libreria in due plugin con una sola installazione: un rilevatore di
lingua (`opm.lang.detect`, id `ovos-lang-detect-plugin-linguonnx`) e un
traduttore (`opm.lang.translate`, id `ovos-translate-plugin-linguonnx`).
Entrambi caricano i modelli al primo uso, e ogni argomento di `load_detector` e
`load_translator` è raggiungibile da `mycroft.conf`.

La libreria documenta il resto: [routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md)
per le politiche e il budget di dimensione, [models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md)
per il registro, e [licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
per i livelli di licenza — i modelli GPL-3.0 e CC-BY-NC-4.0 esistono nell'indice
e vanno chiesti per nome.
