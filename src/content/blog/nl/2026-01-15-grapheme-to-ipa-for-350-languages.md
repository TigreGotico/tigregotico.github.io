---
title: "Grafeem-naar-IPA voor 807 talen"
description: "orthography2ipa is een taalkundig gefundeerde bron van pure data die spelling op IPA afbeeldt en modelleert hoe fonemen als allofonen tot uiting komen over 896 taalspecificaties, 807 talen en meer dan 20 taalfamilies. Een kandidaat-lattice, een maximal-munch-tokenizer, fonologische en schriftafstandsmetrieken, dialectlijn en een schema-gevalideerde specificatieset, geciteerd naar de dialectologische literatuur — zonder getrainde gewichten, volledig zelf te hosten."
date: 2026-01-15
lang: nl
updated: 2026-08-01
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

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** is een Python-pakket van pure data — declaratieve JSON, dunne en pluggbare logica, zonder getrainde gewichten — dat spelling op IPA afbeeldt en modelleert hoe die fonemen in context tot uiting komen. Het levert **896 taalspecificaties die 807 talen dekken** (plus 89 nodes die alleen voor classificatie dienen) over **meer dan 20 taalfamilies**. Installeer het, lees de data, fork de data. Niets zit verborgen in een checkpoint.

Het is de fonologielaag onder alles wat stroomafwaarts gebeurt: de kandidaat-lattice die het produceert wordt gebruikt door de Arabische TTS-frontend [arbtok](https://github.com/TigreGotico/arbtok), de Portugese stacks [TugaPhone](https://github.com/TigreGotico/tugaphone) en [silabificador](https://github.com/TigreGotico/silabificador) (zie **[klassieke NLP voor Portugese lettergrepen en fonemen](/nl/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), de [Barranquenho-fonemizer](/nl/blog/2025-12-12-barranquenho), de Mirandese-fonemizer en de fonemische basis voor **[TTS die op een aardappel draait](/nl/blog/2026-05-10-tts-that-runs-on-a-potato)**.

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

Elke taal is een bevroren `LanguageSpec`-dataclass en die draagt veel meer dan alleen een foneemlijst: grafemen (inclusief digrafen en trigrafen), een allofoonkaart, **positionele grafemen** voor contextgevoelige overschrijvingen (woordinitiaal, intervocalisch, vóór /i/), gewogen **afstamming** met meerdere voorouders, **sandhi-regels** over woordgrenzen heen, een optionele **toonvoorraad** en herkomst — een `QualityTier` die van `stub → skeleton → research → production` loopt, een `ScriptType` (alfabet, abjad, abugida, …) en bibliografische bronnen met paginaverwijzingen.

De inclusieregel is streng en verdient het om onomwonden te worden gesteld: **alleen afbeeldingen die gefundeerd zijn in officiële orthografie en gedocumenteerde grammatica komen erin. Willekeurige substring-regels worden uitgesloten.** Het Portugese ⟨lh⟩, het Duitse ⟨sch⟩ en het Engelse ⟨th⟩ zitten erin omdat het standaard orthografische eenheden zijn. Handige-maar-verzonnen heuristieken niet. Wanneer een specificatie grafemen declareert maar geen expliciete allofoonkaart, wordt een basale identiteitskaart afgeleid — elk foneem is op zijn minst zijn eigen oppervlakterealisatie — zodat niets stilzwijgend verdwijnt.

Regionale varianten krijgen hun eigen specificaties in plaats van een vlag op een ouder. Braziliaans en Europees Portugees lopen systematisch uiteen, dus het zijn afzonderlijke `LanguageSpec`-objecten die via afstamming met elkaar verbonden zijn:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Dialectbomen blijven onderhoudbaar omdat JSON-bestanden `graphemes_base` / `allophones_base`-overerving ondersteunen: een variant declareert alleen wat er verschilt van de ouder. De lijn is gewogen en heeft meerdere voorouders — ouder, substraat, superstraat, adstraat — wat de eerlijke manier is om talen te modelleren die contactproducten zijn in plaats van zuivere afstammelingen.

## Diep op de grond, niet alleen breed

Het getal 807 is breedte; de diepte is waar het werk zit. De specificaties gaan lect voor lect zo ver als de dialectologische literatuur gaat, en elke specificatie is naar die literatuur geciteerd met paginaverwijzingen in plaats van afgeleid via patroonherkenning uit een foneemtabel.

De **Iberische** dekking is het duidelijkste voorbeeld: **meer dan 100 specificaties** voor de talen van het schiereiland. Elke Romaanse taal van Spanje — Castiliaans, Catalaans/Valenciaans, Galicisch (zowel de RAG- als de reïntegrationistische norm), Asturisch, Aragonees en zijn valleivarianten (Ansotano, Chistabín, Benasqués…), Extremadurees — naast Baskisch, de Ibero-Romaanse creolen en de historische lagen die de meeste bronnen volledig overslaan: **Andalusisch Arabisch** en **Mozarabisch**. Aan de Arabische kant zitten **34 dialectlects** (van Najdi en Hijazi tot Levantijns, Maghrebijns en de schiereilandvarianten), en aan de Lusofone kant **46 lects van het Portugees en de talen van Portugal**, tot en met Rionorees, Guadramilees en de Mirandese subdialecten.

Voor zover wij weten zijn verschillende hiervan de **eerste machineleesbare fonologie** die ooit voor de variëteit is gepubliceerd — hiermee bedoelen we een gestructureerde, schema-gevalideerde grafeem/allofoon-specificatie die een programma kan bevragen, in tegenstelling tot een foneeminventaris die alleen in proza wordt beschreven in de dialectologische literatuur — Rionorees en Guadramilees onder andere. Het stroomafwaartse werk levert de **eerste IPA-woordenboeken** voor **Barranquenho** en **Mirandees**.

## Een kandidaat-lattice, geen enkele gok

Spelling is geen zuiver segmentatieprobleem, dus de vlaggenschiparchitectuur is een **kandidaat-lattice**. De `PhonetokTokenizer` doet **maximal-munch**-grafeemtokenisatie — geeft gretig de voorkeur aan de langste passende orthografische eenheid — en produceert, over de grafeemtabel van de specificatie, per positie een lattice van gerangschikte IPA-kandidaten in plaats van één brosse uitkomst:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

De lattice is het contract waarop de hele stroomafwaartse familie voortbouwt. Een taalspecifieke engine gebruikt de gedeelde lattice en voegt alleen de fonologie toe die een statische tabel niet kan uitdrukken, waardoor elke consument op dezelfde gefundeerde kern blijft:

- **[arbtok](https://github.com/TigreGotico/arbtok)** bouwt Arabische TTS-fonologie op de lattice en voegt zonneletterassimilatie, hamzat al-waṣl-elisie, geminatie en ligatuurafhandeling toe — plus een nieuwe **rawi-lattice-fusie** die de ontbrekende korte klinkers van ongediacriseerde dialectale tekst herstelt door de verdeling per teken van een ensemble te scoren *onder de licentiëring van de gevraagde lect*, in plaats van een vrije generator te vertrouwen.
- **[TugaPhone](https://github.com/TigreGotico/tugaphone)**, **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** (Mirandees) en **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** gebruiken allemaal dezelfde lattice-kern voor hun Lusofone varianten.

## De afstand tussen talen meten

Omdat de data gestructureerd is in plaats van vastgebakken in gewichten, kun je talen rechtstreeks vergelijken. De afstandsmetrieken beslaan de dimensies voorraad, grafeem, allofoon en afstamming, plus een aparte familie van schriftafstanden:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.0515 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Ook de kenmerkvectoren worden blootgesteld, zodat een vrijwel identiek paar zoals de twee Portugese standaarden op 0,0515 uitkomt, terwijl werkelijk ver uiteenliggende paren zich helder scheiden. Dit is nuttig voor beslissingen rond transfer learning, voor het bootstrappen van talen met weinig middelen en voor dialectometrie.

## Hoe we weten dat de data iets waard is

Betrouwbaar G2P-"goud" bestaat nauwelijks — de meeste openbare datasets zijn de eigen output van een fonemizer die hergebruikt wordt als referentie, dus een lage foutmarge daartegen betekent "komt overeen met dat hulpmiddel", niet "correct". Wij zijn daar expliciet over en hebben er een verificatiemethodologie omheen gebouwd in plaats van één vleiend getal te rapporteren.

Voor de varianten waar we het meeste om geven is het goud **geschreven, niet geschraapt**: een engine-gepinde zinnenset per lect, beoordeeld in **blinde paren**, gearbitreerd tegen **paginagepinde literatuur** en teruggevoerd via **correctieklassen** in een engine-feedbacklus — een verschil tussen de output van de engine en de gecorrigeerde vorm is een aanwijzing voor een echte bug in een specificatie. Over het engine-gepinde TTS-goud en de attestaties uit primaire bronnen zijn er **enkele duizenden geverifieerde rijen**. De kadering is bewust eerlijk over herkomst: synthetisch en literatuur-gearbitreerd waar dat alles is wat er bestaat, en echt menselijk goud waar dat wel bestaat — de door moedertaalsprekers samengestelde Mirandese `mirandese_g2p`-set, paginagepinde attestaties uit primaire bronnen en bijdragen van moedertaalsprekers. Nauwkeurigheidsclaims worden **alleen** gemaakt tegen menselijk goud; een perfecte score tegen het eigen concept van de engine zou niets betekenen.

De cijfers, gelezen als richtinggevend en altijd geciteerd naar hun bron ([`docs/scoreboard.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/scoreboard.md), [`docs/benchmarks.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/benchmarks.md) en de benchmarkdocumenten van de stroomafwaartse repos):

- **Arabische dialecten, kale ongediacriseerde invoer** — het moeilijke, uitrol-realistische geval. Op arbtoks TTS-goud met kale invoer (33 lects) bereikt de rawi-lattice-fusie onder dialectlicentiëring een **gemiddelde PER van 0,189**, wat hetzelfde ensemble dat als vrije generator draait (0,193) verslaat, met de marge geconcentreerd op de lects die het meest afwijken van het MSA. Op de meeste lects verslaat arbtok espeak-ng op de kale invoer; op het MSA zelf wint espeak — dat op het MSA is afgesteld — nog steeds (espeak 0,176 vs arbtok 0,245).
- **Arabische dialecten, gediacriseerde invoer** — met de tekens aanwezig zit arbtoks PER op **0,01–0,08** per lect, ruim onder espeaks enkele MSA-stem (bijv. Najdi 0,009 vs espeak 0,221; Egyptisch 0,027 vs espeak 0,287). espeak heeft geen dialectstemmen, dus dit is eerlijk gezegd appels met peren vergelijken — maar de kloof is het punt.
- **Portugees, tegen deskundig menselijk goud** — Lissabons Europees Portugees komt uit op **PER 0,029** (88% exacte overeenkomst) op paginagepinde primaire bronnen, en het door moedertaalsprekers samengestelde Mirandese goud op **0,146**.

Elk van deze is een eigenschap van de huidige toestand van de data, gekruist met een bootstrap-betrouwbaarheidsinterval, geen leaderboard-trofee. Waar het interval breed of de steekproef klein is, zegt het scorebord dat.

## De CLI

Alles hierboven is bereikbaar zonder Python te schrijven. Het `orthography2ipa`-consolescript bevat `list`, `info`, `transcribe` en `distance`, en elk subcommando accepteert `--json` om door te sluizen naar een pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Waarom pure data ertoe doet

De hele specificatieset is schema-gevalideerd — bevroren dataclasses in pydantic-stijl, doorlopen door een suite van integriteitstests, met `SCHEMA.md` die de vorm documenteert. Waar een statische tabel de regels werkelijk niet kan uitdrukken, sluit taalspecifieke logica rond de data aan: syllabificatoren registreren zich via een entry-point-groep, en de zwaardere engines bouwen stroomafwaarts voort op de gedeelde lattice.

Er is geen ondoorzichtig model dat bepaalt hoe de talen van je gebruikers klinken. De afbeeldingen zijn controleerbaar, de bronnen worden tot op de pagina geciteerd en een taal toevoegen is het schrijven van één gevalideerd JSON-bestand — begin bij [`docs/adding_a_language.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/adding_a_language.md) en de [aan-de-slag-gids](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/getting_started.md). Voor iedereen die TTS, ASR of fonetische NLP bouwt en weigert zijn fonologie uit te besteden aan een zwarte doos — en die het op zijn eigen hardware wil draaien — is dat het punt. Het is Apache 2.0, en het is van jou om te inspecteren, uit te breiden en zelf te hosten.
