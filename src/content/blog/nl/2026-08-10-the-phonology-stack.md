---
title: "Hoe de fonologiestack in elkaar zit"
description: "Een architectuurrondleiding langs onze tekst-naar-uitspraak-stack: scriptconv voor notatie, orthography2ipa als de taaloverschrijdende grafeem-naar-IPA-engine, taalspecifieke frontends daarbovenop voor Portugees, Baskisch, Mirandees, Barranquenho en Arabisch, en phonematcher voor klankgebaseerd zoeken. Laat zien waarom de lagen bestaan, wat een kandidaat-lattice is, en echte dialectuitvoer."
date: 2026-08-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "Linguistics"
  - "FOSS"
draft: false
---

Neem het Engelse woord "read". Geschreven vertelt het je niet hoe je het uitspreekt. "I read the book yesterday" en "I read the book every day" gebruiken dezelfde vijf letters voor twee verschillende klanken: de ene rijmt op "red", de andere op "reed". Een schermlezer, een spraakassistent, of een zoekvak dat alleen naar spelling kijkt, kan dit niet goed krijgen. Het moet redeneren over uitspraak, niet alleen over tekst.

Dat redeneerprobleem, geschreven woorden omzetten in de klanken die ze vertegenwoordigen, is wat onze fonologiestack oplost. Dit artikel is een kaart van hoe de onderdelen ervan in elkaar passen, van ruwe notatie tot taalspecifieke uitspraak-engines en klankgebaseerd zoeken.

## Enkele termen, eenvoudig uitgelegd

Een paar woorden die steeds terugkomen:

- **Grafeem**: een geschreven symbool, een letter, of een lettercombinatie zoals "ch".
- **Foneem**: een onderscheidende klankeenheid in een taal, zoals de "k"-klank in "cat".
- **IPA** (International Phonetic Alphabet): een standaardalfabet om klanken precies vast te leggen, onafhankelijk van de spelling van welke taal dan ook. "Cat" wordt in IPA geschreven als `kæt`.
- **G2P** (grafeem-naar-foneem): het algemene probleem van spelling omzetten naar klank.
- **Allofoon**: een variantrealisatie van hetzelfde foneem afhankelijk van context. De "t" in "top" en de "t" in "stop" zijn hetzelfde foneem in het Engels maar worden net iets anders uitgesproken.
- **Lettergreepverdeling**: een woord opsplitsen in lettergrepen, bijvoorbeeld "extraordinário" in `ex-tra-or-di-ná-ri-o`.
- **Homograaf**: twee woorden met dezelfde spelling maar verschillende betekenis. Een **heterofone homograaf** (of heterofoon) is een homograaf die anders wordt uitgesproken afhankelijk van welke betekenis bedoeld is, zoals "read"/"read" hierboven.
- **Morfologie**: de interne structuur van woorden, voorvoegsels, stammen, achtervoegsels, verbuigingen.
- **Woordsoortlabeling (POS-tagging)**: elk woord in een zin labelen als zelfstandig naamwoord, werkwoord, bijvoeglijk naamwoord, enzovoort.

## Het kernprobleem

Spelling is een lossy codering van klank. Drie afzonderlijke dingen maken het lastig om terug te draaien:

1. **Dubbelzinnigheid.** Dezelfde letters kunnen naar verschillende klanken afbeelden, afhankelijk van betekenis, grammatica, of pure onregelmatigheid ("read" hierboven; het Engels zit er vol mee).
2. **Dialect.** Hetzelfde woord, in dezelfde taal, wordt anders uitgesproken afhankelijk van waar de spreker vandaan komt. Europees en Braziliaans Portugees delen de spelling maar niet de klinkers.
3. **Dekking.** De meeste talen ter wereld hebben helemaal geen professioneel samengesteld uitspraakwoordenboek. Een G2P-systeem dat alleen via een opzoektabel werkt, is een systeem dat alleen voor een handvol talen werkt.

Elke serieuze poging tot tekst-naar-spraak, trainingsdata voor spraakherkenning, of fonetisch bewust zoeken moet met alle drie rekening houden.

## Waarom de stack gelaagd is

De stack splitst het probleem op in lagen die niets van elkaar hoeven te weten:

- **Notatie**: omzetten tussen fonetische alfabetten en schriften. Dit heeft niets te maken met de fonologie van een specifieke taal. Het is symboolvertaling.
- **Fonologie**: spelling afbeelden op IPA voor een gegeven taal, met een specificatie van het klanksysteem van die taal.
- **Taalspecifieke uitzonderingsafhandeling**: de onregelmatige woorden, dialecteigenaardigheden, homografen en morfologische structuur die een algemene engine niet alleen uit spellingsregels kan afleiden.

Deze gescheiden houden is een ontwerpbeslissing, geen ongeluk, en het levert een directe winst op: een nieuwe taal toevoegen betekent een **specificatie** schrijven (data die het klanksysteem beschrijft), geen nieuw programma. De engine die de specificatie verbruikt, de lattice-zoekopdracht, de tokenizer, de afstandsmetrieken: niets daarvan wordt herschreven. De notatielaag daaronder wordt door elke taal gedeeld, inclusief talen waar de fonologie-engine nog nooit van heeft gehoord.

### De notatielaag: scriptconv

[scriptconv](https://github.com/TigreGotico/scriptconv) is een kern zonder afhankelijkheden voor fonetische notatie en schriftverwerking: ISO-15924-schriftdetectie, IPA-conversies van en naar ARPABET, X-SAMPA, Lexique, Kirshenbaum, Cotovía- en RFE-notatie, Buckwalter-transliteratie voor het Arabisch, Hangul-decompositie naar jamo, en kana-verwerking. Niets hiervan vereist te weten tot welke taal een woord behoort. Een foneemreeks in IPA converteert naar ARPABET op dezelfde manier, ongeacht de brontaal:

```python
>>> import scriptconv as s
>>> s.ipa_to_arpa("kæt")
'K AE T'
>>> s.ipa_to_xsampa("kæt")
'k{t'
```

Elke laag hierboven kan ervan uitgaan dat notatieconversie al is opgelost.

### De engine: orthography2ipa

[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) is de taaloverschrijdende engine. Het neemt een taalspecificatie, een declaratieve beschrijving van de grafeem-naar-foneem-regels van die taal, en een stuk tekst, en produceert IPA. Op het moment van schrijven levert het specificaties die **820 talen** dekken (`available_codes()` op het geïnstalleerde pakket geeft een lijst van die lengte terug; behandel het exacte cijfer als een bewegend doel, aangezien er in de loop van de tijd specificaties worden toegevoegd).

```python
>>> import orthography2ipa as o
>>> len(o.available_codes())
820
```

De engine zelf bevat geen ingebakken taalspecifieke code. Een nieuwe taal is een nieuw specificatiebestand, getoetst aan hetzelfde schema als elke andere specificatie.

## De lattice: gerangschikte kandidaten, geen enkele gok

Gezien het dubbelzinnigheidsprobleem hierboven, is je vastleggen op één enkele uitvoer per woord vaak fout. orthography2ipa produceert in plaats daarvan een **lattice**, een set gerangschikte kandidaatuitspraken, en laat hogere lagen die versmallen met context die de engine zelf niet heeft (betekenis, woordsoort, een lexiconvermelding).

Neem "read" opnieuw:

```python
>>> from orthography2ipa import G2P
>>> g = G2P("en")
>>> g.transcribe("read")
'ɹiːd'
>>> g.candidates("read")
[IPAPath('ɹiːd', score=0.0), IPAPath('ɹɛd', score=1.0)]
```

Zonder meer context geeft de engine zijn beste gok terug (tegenwoordige tijd, lagere kosten) maar houdt het alternatief (verleden tijd) op de lattice met zijn kosten eraan vast. Een stroomafwaartse component die weet dat de zin in de verleden tijd staat, kan de tweede kandidaat kiezen in plaats van de eerste. Dit is hetzelfde idee dat, op grotere schaal, wordt gebruikt door bifonia (hieronder) voor Portugese heterofonen: een algemene lattice levert kandidaten, een smallere, beter geïnformeerde laag kiest daartussen.

## Dialecten krijgen hun eigen regels, geen bijzaak

Twee sprekers van dezelfde taal kunnen dezelfde zin verschillend uitspreken, en een fonologiestack die "Portugees" behandelt als één vast klanksysteem, zal elk dialect op één na fout krijgen. orthography2ipa stelt dialectafhandeling rechtstreeks bloot. `available_profiles()` op het geïnstalleerde pakket somt dialect- en lectprofielen op zoals `lisbon`, `porto`, `estremenho`, `galician`, en andere, en [tugaphone](https://github.com/TigreGotico/tugaphone), de daarop gebouwde Portugese frontend, fonemiseert dezelfde zin over Lusofone variëteiten heen. Hier is één zin, doorgevoerd door alle vijf ondersteunde dialecten:

| Dialect | Uitvoer |
|---|---|
| pt-PT (Portugal) | `ˈbõ ˈdiɐ ˈkomu eˈʃta vɔˈse` |
| pt-BR (Brazilië) | `ˈbõ ˈdʒiɐ ˈkɔ̃mʊ eˈsta voˈse` |
| pt-AO (Angola) | `ˈbõ ˈdiɐ ˈkomʊ eˈsta vɔˈse` |
| pt-MZ (Mozambique) | `ˈbõ ˈdiɐ ˈkomu eˈsta vɔˈse` |
| pt-TL (Oost-Timor) | `ˈbõ ˈdiə ˈkoɔmʊ eˈsta vɔˈse` |

("Bom dia, como está você?", "Goedemorgen, hoe gaat het met u?") Het medeklinkerskelet blijft herkenbaar over alle vijf, maar twee bekende markeringen onderscheiden ze meteen. In "dia" verandert het Braziliaans Portugees de `d` vóór een `i` in `dʒ`, de klank aan het begin van het Engelse "jam"; de andere houden een gewone `d` aan. In "está" spreekt het Europees Portugees de `s` aan het einde van een lettergreep uit als `ʃ`, de "sh" van "shoe", terwijl elke andere variëteit `s` aanhoudt. Een uitspraakwoordenboek gebouwd op de regels van één dialect krijgt beide fout voor de luisteraar van elk ander dialect.

[euskaphone](https://github.com/TigreGotico/euskaphone) doet hetzelfde voor Baskische dialecten, rechtstreeks gebouwd op de orthography2ipa-lattice in plaats van op een aparte engine:

```python
>>> from euskaphone import EuskaPhonemizer
>>> EuskaPhonemizer().phonemize_sentence("Kaixo, zer moduz zaude?")
'kai̯ʃo s̻er modus̻ s̻au̯de'
```

## De taalspecifieke frontends

Boven de gedeelde engine zitten frontends die toevoegen wat een algemene specificatie niet kan: onregelmatige woorden, een gecureerd lexicon, sandhi (klankveranderingen op woordgrenzen), en dialectspecifieke overschrijvingen.

- **[tugaphone](https://github.com/TigreGotico/tugaphone)**: Portugees, over pt-PT, pt-BR, pt-AO, pt-MZ en pt-TL, dat een gecureerd lexicon combineert met een op regels gebaseerde terugval (hierboven getoond).
- **[euskaphone](https://github.com/TigreGotico/euskaphone)**: Baskisch, dialectbewust, gebouwd op dezelfde lattice (hierboven getoond).
- **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)**: Mirandees, de Asturisch-Leonese taal van Terra de Miranda, Portugal, met woordoverschrijdende sandhi, allofonie en klemtoon:

  ```python
  >>> from mwl_phonemizer import phonemize
  >>> phonemize("Falo la lhéngua mirandesa.")
  'ˈfalu lɐ ˈʎɛŋɡwa miɾɐˈndez̺ɐ.'
  ```

- **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)**: de eerste open G2P voor het Barranquenho, de Ibero-Romaanse contacttaal van Barrancos, aan de grens tussen Portugal en Spanje. Zie **[Wij presenteren de eerste phonemizer voor het Barranquenho](/nl/blog/2025-12-12-barranquenho)** voor hoe de regels ervan zijn afgeleid uit de eigen spellingsconventie van de gemeente.
- **[arbtok](https://github.com/TigreGotico/arbtok)**: Arabisch, gebouwd op de lattice van orthography2ipa, met toevoeging van dialectbewuste diakritisering en dekking van het Modern Standaard-, het Klassiek- en een aantal regionale variëteiten van het Arabisch. Arabisch schrift laat normaal gesproken de korte-klinkertekens weg die een fonemizer nodig heeft, dus de belangrijkste taak van arbtok is die te herstellen voordat het resultaat aan de gedeelde engine wordt overgedragen. Het wordt onderhouden door iemand die geen moedertaalspreker Arabisch is, dus behandel het als actief in ontwikkeling in plaats van een afgewerkte, door moedertaalsprekers gecontroleerde referentie: nuttig, maar de plek om de uitvoer tegen een moedertaalspreker te controleren voordat je het in iets gebruikersgerichts uitbrengt.

Elk van deze frontends is een dunne laag taalspecifieke logica bovenop dezelfde gedeelde lattice-engine en dezelfde gedeelde notatielaag daaronder. Geen enkele ervan herimplementeert IPA-conversie of lattice-zoeken.

## Ondersteunende Portugese hulpmiddelen

Het Portugees heeft de diepste stack, omdat Portugese uitspraak van meer afhangt dan spellingsregels: het hangt af van lettergreepstructuur, woordsoort, en soms pure betekenis.

- **[silabificador](https://github.com/TigreGotico/silabificador)** splitst woorden in lettergrepen met handgemaakte regels:

  ```python
  >>> from silabificador import syllabify
  >>> syllabify("extraordinário")
  ['ex', 'tra', 'or', 'di', 'ná', 'ri', 'o']
  ```

- **[tugalex](https://github.com/TigreGotico/tugalex)** is het lexicon achter tugaphone: IPA-transcripties, lettergreepdata en orthografische regels voor echte woorden, zodat gewone en onregelmatige woordenschat niet elke keer opnieuw uit de spelling hoeft te worden afgeleid.
- **[tugatagger](https://github.com/TigreGotico/tugatagger)** omhult verschillende POS-taggingbackends (spaCy, Stanza, een Brill-achtige tagger, een afhankelijkheidsvrije heuristische terugval) achter één interface, zodat andere hulpmiddelen kunnen vragen "welke woordsoort is dit woord" zonder zich vast te leggen op één specifieke backend.
- **[tugamorph](https://github.com/TigreGotico/tugamorph)** is een op regels gebaseerde morfologische analysator: het segmenteert een woord in voorvoegsel, stam, achtervoegsel, verbuiging en clitisch, met alleen de Python-standaardbibliotheek, optioneel aangescherpt door silabificador en tugatagger.
- **[bifonia](https://github.com/TigreGotico/bifonia)** lost Europees-Portugese heterofone homografen op: woorden zoals "sede" (dorst, `ˈsedɨ`, versus hoofdkwartier, `ˈsɛdɨ`) waarbij de juiste uitspraak van betekenis afhangt, niet van grammatica. Zie **[Goed uitspreken: Portugese heterofonen ontrafelen voor TTS](/nl/blog/2026-06-12-disambiguating-portuguese-heterographs-for-tts)** voor hoe het is gebouwd en geëvalueerd. Dit is het concrete geval achter het lattice-idee hierboven: orthography2ipa kan beide kandidaatlezingen van "sede" leveren, maar alleen een betekenisbewuste laag zoals bifonia kan daartussen kiezen.

Voor meer over hoe silabificador en tugaphone dagelijks samenwerken, zie **[Klassieke NLP voor het Portugees: lettergreepverdeling en grafeem-naar-foneem](/nl/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, en voor de bredere engine die aan dit alles ten grondslag ligt, **[Grafeem-naar-IPA voor 820 talen](/nl/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**.

## Klankgebaseerd zoeken: phonematcher

Alles hierboven zet tekst om in klank. [phonematcher](https://github.com/TigreGotico/phonematcher) werkt met de klankrepresentaties zelf: het berekent fonetische afstand tussen IPA-symbolen en doet fuzzy zoeken over woordenlijsten op basis van hoe woorden klinken in plaats van hoe ze gespeld zijn.

```python
>>> from phonematcher.distance import phonetic_distance
>>> phonetic_distance('b', 'p')   # voiced vs. voiceless bilabial stop — very similar
0.043478260869565216
>>> phonetic_distance('p', 'k')   # bilabial vs. velar stop — less similar
0.34782608695652173
>>> phonetic_distance('a', 'k')   # vowel vs. consonant — maximally different
1.0
```

Die afstandsmetriek is nuttig in twee concrete situaties: een catalogus van woorden of namen doorzoeken op basis van hoe iets klinkt in plaats van de exacte spelling (nuttig voor typfouttolerante spraakinterfaces en voor het matchen van leenwoorden tussen schriftsystemen), en vergelijken hoe fonologisch dicht twee verwante lects bij elkaar staan, dezelfde soort vergelijking die de dialecttabel hierboven met het oog maakt, maar dan berekend in plaats van op het oog geschat. phonematcher staat niet op PyPI. Het installeert vanaf de bron (`pip install -e .` tegen de GitHub-checkout, plus `rapidfuzz`).

## Eerlijke grenzen

De dekking over 820 taalspecificaties is per constructie ongelijk: talen met een gevestigde fonologische literatuur en een lexicon leveren betere uitvoer dan talen met een dunne specificatie die vooral is afgeleid uit algemene orthografische conventies. De kwaliteit is consequent het best waar een gecureerd lexicon bestaat: het Portugees, ondersteund door tugalex, is het sterkste geval in de stack. Talen die puur op specificatieregels leunen zonder lexicon, verwerken onregelmatige en geleende woordenschat verkeerd.

Een paar componenten zijn expliciet geen afgewerkte, door moedertaalsprekers gecontroleerde referenties: arbtok wordt onderhouden door iemand die geen moedertaalspreker Arabisch is en moet tegen het oordeel van een moedertaalspreker worden gecontroleerd voordat het in iets gebruikersgerichts wordt gebruikt. Frontends gebouwd op dunne specificaties erven die dunheid. Een frontend is maar zo goed als de specificatie en het lexicon eronder.

## Waarom dit belangrijk is als jouw taal geen spraaktooling heeft

De meeste talen ter wereld hebben geen commerciële TTS-stem, geen commercieel STT-model, en geen professioneel onderhouden uitspraakwoordenboek. Het gelaagde ontwerp hierboven betekent dat die kloof niet vereist dat je een fonologie-engine vanaf nul bouwt: het vereist het schrijven van een specificatie voor het klanksysteem van de doeltaal en, waar mogelijk, een lexicon van de onregelmatige woorden ervan. De lattice-engine, de notatieconversies en de zoektooling zijn er al. Als jouw taal, dialect, of product uitspraakondersteuning nodig heeft die nog niet bestaat, is dat het soort werk dat wij op ons nemen. Zie **[onze diensten](/nl/services)** of **[neem contact op](/nl/contact)**.
