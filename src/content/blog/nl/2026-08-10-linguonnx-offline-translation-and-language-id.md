---
title: "linguonnx: offline vertaling en taalherkenning op ONNX"
description: "linguonnx vertaalt tekst en herkent talen op de CPU, zonder torch en zonder cloud. 184 int8-vertaalmodellen en 5 taalherkenningsmodellen, 586 bereikbare talen, en een router die kleine modellen aan elkaar knoopt als geen enkel model een taalpaar dekt."
date: 2026-08-10
lang: nl
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

[**linguonnx**](https://github.com/TigreGotico/linguonnx) is een Python-bibliotheek
voor machinevertaling en taalherkenning. Het draait op `onnxruntime`, op de CPU,
offline. Het gebruikt op geen enkel moment torch — de generatielus van encoder en
decoder, met beam search en KV-cache, is rechtstreeks tegen de ONNX-grafen
geschreven.

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

Het is Apache-2.0 en het downloadt geen model dat je niet hebt gevraagd.

## Wat er meekomt

Het register bevat 369 vertaalitems — fp32 en int8 van elk model — en 10 items
voor taalherkenning. `load_translator()` kiest standaard int8, dus een gewone
installatie routeert over 184 gekwantiseerde vertaalmodellen en 5 gekwantiseerde
classifiers. Allemaal zijn het ONNX-conversies, gepubliceerd onder
[`TigreGotico/`](https://huggingface.co/TigreGotico) op HuggingFace.

Over de standaardgraaf zijn 586 talen bereikbaar. Dat getal staat vast in de
tests, dus het blijft waar of de build zegt het.

De classifiers zijn ONNX-exports van vier fastText-modellen: GlotLID, het
klassieke `lid.176`, OpenLID en OpenLID-v2. GlotLID labelt 2102 *variëteiten*,
dus spreektalig Arabisch komt terug als Najdi (`ars`) en Chinees kan terugkomen
als Kantonees. Dat is dialectherkenning als je die wilt, en
`collapse_varieties=True` als je die niet wilt.

## Een paar zonder model is een keten van modellen

De meeste taalparen hebben geen tweetalig model. De router behandelt een model
als een verzameling mogelijkheden en niet als een vaste rand, en knoopt stappen
aan elkaar als het moet:

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — het ging via het Galicisch
```

Onder dat beleid gaat Portugees naar Baskisch via het Galicisch, over twee
Marian-modellen van 84 MB en 153 MB. De pivot is nooit stil: de `Route` komt terug
met de vertaling en zegt welke modellen zijn gebruikt en langs welke talen de
route liep.

Een route is geen vast feit over een taalpaar. Het is wat de beperkingen van de
aanroeper van het register maken: verander het groottebudget of de voorkeur voor
stappen en hetzelfde paar gaat via een andere taal, of krimpt tot één stap door
één groot meertalig model. De `Route` zegt welke het geworden is.

De rangschikking geeft voorrang aan de instelling die de taal verzorgt. HiTZ
traint Baskisch, Proxecto Nós Galicisch, Projecte AINA Catalaans, AI4Bharat de
Indische paren, Masakhane de West-Afrikaanse paren, TartuNLP de Fins-Oegrische.
Een model van de specialist wint het gelijkspel van een algemeen meertalig model.

## Beleid tijdens uitvoering, nooit in de index

Dit is de wet van het register: het somt elk gepubliceerd model op, wat ook de
grootte, de licentie of de score is. Filteren en rangschikken gebeuren tijdens
uitvoering, in het proces van de aanroeper, onder diens regels. Een model dat de
index weglaat kan helemaal niet worden gekozen, dus laat de index niets weg.

De aanroeper stelt het beleid in via `load_translator`: `max_model_mb`,
`oversize_fallback`, `count_cached_as_free`, `prefer`, `max_hops`, `precision`,
`model_cache_size`, `exclude_flagged` en `min_chrf`. Elk daarvan is ook per
aanroep te overschrijven.

## Een groottelimiet geeft voorrang aan kleine modellen, het wist geen talen

Een groottebudget is de voor de hand liggende knop voor een kleine machine, en de
voor de hand liggende uitvoering ervan is fout. Als filter brengt
`max_model_mb=500` de 586 bereikbare talen terug naar 249, want de lange staart
zit in de grote meertalige modellen en geen keten van kleine modellen vervangt
die.

`oversize_fallback=True` maakt van het budget een voorkeur:

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 586, niet 249
```

Engels naar Catalaans blijft op het kleine model, want een klein model bestaat.
Engels naar Tsjoevasjisch schaalt op naar MADLAD, want MADLAD is het enige model
in het register met Tsjoevasjisch, en het alternatief is geen goedkopere route
maar geen route. `waived_size_cap` zegt welke limiet de route mocht passeren, dus
een machine die 500 MB begrootte, hoort dat ze 4945 MB haalde.

Vier regels houden dat eerlijk. De ruimere zoektocht draait alleen voor het paar
dat leeg terugkwam. De limiet stijgt met één modelgrootte per keer, dus een paar
dat NLLB-200 en MADLAD dekken krijgt NLLB-200. De limiet begrenst één model, niet
een route, dus een keten van twee stappen van 237 MB vindt de gewone zoektocht. En
de escalatie gaat nooit voorbij het downloadbudget.

## Bereikbaar is niet bruikbaar

`madlad400-3b-mt` dekt Tsjoevasjisch. Vraag het `en -> cv` en het antwoordt in het
Russisch: `"Good day, my friend."` komt terug als `"Добрый день, мой друг."`. De
routering klopt — het label voor Tsjoevasjisch is een apart SentencePiece-stuk —
en het model schrijft toch de verkeerde taal.

Daarom draagt een registeritem `language_flags`, één taal per keer, met de
waarneming erachter: de invoer, de uitvoer, het oordeel van de detector
(`glotlid=ru`), de datum en de methode. Tsjoevasjisch is bereikbaar en is niet
bruikbaar, en het register zegt allebei.

De kwaliteit van een heel model wordt op dezelfde manier vastgelegd. Een veld
`quality` draagt een chrF-score tegen de **menselijke** FLORES-200-devtest-
referentie, met het corpus, de decodeermodus en de steekproefgrootte ernaast,
want een score zonder zichtbare steekproefgrootte betekent niets. Ontbreekt het
veld, dan is er niet gemeten, en dat is niet hetzelfde als slecht; niets verzint
een getal voor een ongemeten model. Twee controles zetten een vlag: chrF onder 40
in een van beide precisies, en int8 meer dan 2 chrF achter fp32.

Een vlag haalt niets uit het register. Ze geeft `exclude_flagged=True` en
`min_chrf=` iets om op te handelen, en een mens een reden om te lezen:

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

Een sweep over het hele register stuurt één echte zin door elk geregistreerd model
en faalt bij lege uitvoer, uitvoer met alleen witruimte, of uitvoer gelijk aan de
invoer. De voorbeeldzinnen staan per brontaal en zijn met de hand gecontroleerd;
een taal zonder voorbeeld wordt overgeslagen in plaats van getest met tekst uit
een andere taal.

## Vanuit OpenVoiceOS

[`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)
verpakt de bibliotheek als twee plugins uit één installatie: een taalherkenner
(`opm.lang.detect`, id `ovos-lang-detect-plugin-linguonnx`) en een vertaler
(`opm.lang.translate`, id `ovos-translate-plugin-linguonnx`). Beide laden hun
modellen bij het eerste gebruik, en elk argument van `load_detector` en
`load_translator` is bereikbaar vanuit `mycroft.conf`.

De bibliotheek documenteert de rest: [routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md)
voor het beleid en het groottebudget, [models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md)
voor het register, en [licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
voor de licentieniveaus — GPL-3.0- en CC-BY-NC-4.0-modellen staan in de index en
moeten bij naam worden gevraagd.
