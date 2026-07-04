---
title: "Grafeem-naar-IPA voor meer dan 350 talen"
description: "orthography2ipa is een taalkundig gefundeerde bron van pure data die spelling op IPA afbeeldt en modelleert hoe fonemen als allofonen tot uiting komen in meer dan 350 taalcodes en meer dan 20 taalfamilies. Een maximal-munch-tokenizer, fonologische en schriftafstandsmetrieken, dialectlijn en een schema-gevalideerde specificatieset — zonder getrainde gewichten, volledig zelf te hosten."
date: 2026-01-15
lang: nl
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** is een Python-pakket van pure data — declaratieve JSON, dunne en pluggbare logica, zonder getrainde gewichten — dat spelling op IPA afbeeldt en modelleert hoe die fonemen in context tot uiting komen over **394 taalspecificaties en meer dan 20 taalfamilies**. Installeer het, lees de data, fork de data. Niets zit verborgen in een checkpoint.

Het voedt alles wat er stroomafwaarts gebeurt: de Portugees-specifieke stacks [silabificador](https://github.com/TigreGotico/silabificador) en [TugaPhone](https://github.com/TigreGotico/tugaphone) (zie **[klassieke NLP voor Portugese lettergrepen en fonemen](/nl/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), de Barranquenho-G2P en de fonemische basis voor **[TTS die op een aardappel draait](/nl/blog/2026-05-10-tts-that-runs-on-a-potato)**.

## Twee kaarten, niet één

Het cruciale onderscheid: een **grafeemkaart** vertelt je welke fonemen een spelling *kan* voorstellen. Een **allofoonkaart** vertelt je hoe een foneem in context *tot uiting komt*. Die twee door elkaar halen is de meest voorkomende faalmodus in G2P-systemen.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

Het Engelse ⟨th⟩ is werkelijk dubbelzinnig tussen /θ/ en /ð/ — dat is een feit op het niveau van spelling-naar-foneem. De Engelse /t/ verschijnt als een gewone plofklank, een geaspireerde plofklank, een glottisslag of een flap, afhankelijk van waar hij valt — dat is een feit op het niveau van foneem-naar-realisatie. De twee gescheiden houden betekent dat je van *tekst → foneemkandidaten* kunt gaan voor transcriptie en van *foneem → oppervlakterealisatie* voor uitspraakmodellering, zonder dat het ene het andere corrumpeert. Voor TTS is dat het verschil tussen een geloofwaardig en een robotachtig accent; voor ASR is het het verschil tussen een lexicon dat overeenkomt met wat mensen werkelijk zeggen en een lexicon dat overeenkomt met het woordenboek.

## Wat elke taal draagt

Elke taal is een bevroren `LanguageSpec`-dataclass en die draagt veel meer dan alleen een foneemlijst: grafemen (inclusief digrafen en trigrafen), een allofoonkaart, **positionele grafemen** voor contextgevoelige overschrijvingen (woordinitiaal, intervocalisch, vóór /i/), gewogen **afstamming** met meerdere voorouders, **sandhi-regels** over woordgrenzen heen, een optionele **toonvoorraad** en herkomst — een `QualityTier` die van `stub → skeleton → research → production` loopt, een `ScriptType` (alfabet, abjad, abugida, …) en bibliografische bronnen.

De inclusieregel is streng en verdient het om onomwonden te worden gesteld: **alleen afbeeldingen die gefundeerd zijn in officiële orthografie en gedocumenteerde grammatica komen erin. Willekeurige substring-regels worden uitgesloten.** Het Portugese ⟨lh⟩, het Duitse ⟨sch⟩ en het Engelse ⟨th⟩ zitten erin omdat het standaard orthografische eenheden zijn. Handige-maar-verzonnen heuristieken niet. Wanneer een specificatie grafemen declareert maar geen expliciete allofoonkaart, wordt een basale identiteitskaart afgeleid — elk foneem is op zijn minst zijn eigen oppervlakterealisatie — zodat niets stilzwijgend verdwijnt.

Regionale varianten krijgen hun eigen specificaties in plaats van een vlag op een ouder. Braziliaans en Europees Portugees lopen systematisch uiteen, dus het zijn afzonderlijke `LanguageSpec`-objecten die via afstamming met elkaar verbonden zijn:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Dialectbomen blijven onderhoudbaar omdat JSON-bestanden `graphemes_base` / `allophones_base`-overerving ondersteunen: een variant declareert alleen wat er verschilt van de ouder. De lijn is gewogen en heeft meerdere voorouders — ouder, substraat, superstraat, adstraat — wat de eerlijke manier is om talen te modelleren die contactproducten zijn in plaats van zuivere afstammelingen.

## Een tokenizer die dubbelzinnigheid toelaat

Spelling is geen zuiver segmentatieprobleem, dus het pakket bevat de `PhonetokTokenizer`, een **maximal-munch**-grafeemtokenizer met IPA-expansie via beam-search. Hij geeft gretig de voorkeur aan de langste passende orthografische eenheid en verkent vervolgens gerangschikte kandidaat-transcripties wanneer een spelling dubbelzinnig is:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

In plaats van te gokken op één enkele uitkomst krijg je een gescoorde beam — precies de invoer die een stroomafwaarts lexicon, lattice of uitspraak-reranker wil.

## De afstand tussen talen meten

Omdat de data gestructureerd is in plaats van vastgebakken in gewichten, kun je talen rechtstreeks vergelijken. De afstandsmetrieken beslaan de dimensies voorraad, grafeem, allofoon en afstamming, plus een aparte familie van schriftafstanden:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Ook de kenmerkvectoren worden blootgesteld, zodat een vrijwel identiek paar zoals de twee Portugese standaarden op 0,04 uitkomt, terwijl werkelijk ver uiteenliggende paren zich helder scheiden. Dit is nuttig voor beslissingen rond transfer learning, voor het bootstrappen van talen met weinig middelen en voor dialectometrie.

## De CLI

Alles hierboven is bereikbaar zonder Python te schrijven. Het `orthography2ipa`-consolescript bevat `list`, `info`, `transcribe` en `distance`, en elk subcommando accepteert `--json` om door te sluizen naar een pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Waarom pure data ertoe doet

De hele specificatieset is schema-gevalideerd — bevroren dataclasses in pydantic-stijl, **394 specificaties** doorlopen door een suite van integriteitstests, met `SCHEMA.md` die de vorm documenteert. Waar een statische tabel de regels werkelijk niet kan uitdrukken, sluit taalspecifieke logica rond de data aan: syllabificatoren registreren zich via een entry-point-groep, en zwaardere algoritmische G2P (zoals onze Arabische tokenizer [arbtok](https://github.com/TigreGotico/arbtok), die zonneletterassimilatie, hamzat al-wasl-elisie en tanwin-vormen afhandelt) bouwt stroomafwaarts op dezelfde specificaties voort.

Er is geen ondoorzichtig model dat bepaalt hoe de talen van je gebruikers klinken. De afbeeldingen zijn controleerbaar, de bronnen worden geciteerd en een taal toevoegen is het schrijven van één gevalideerd JSON-bestand. Voor iedereen die TTS, ASR of fonetische NLP bouwt en weigert zijn fonologie uit te besteden aan een zwarte doos — en die het op zijn eigen hardware wil draaien — is dat het punt. Het is Apache 2.0, en het is van jou om te inspecteren, uit te breiden en zelf te hosten.
