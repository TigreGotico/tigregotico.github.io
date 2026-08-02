---
title: "Schriften en fonetische notaties: wat scriptconv daadwerkelijk converteert"
description: "Een diepgaande blik op scriptconv, de zero-dependency-bibliotheek die schriftsystemen detecteert en tussen fonetische notaties converteert. Behandelt IPA, ARPABET en X-SAMPA; ISO-15924-schriftdetectie; Buckwalter-transliteratie voor Arabisch; Hangeul-decompositie in jamo; en kana-conversie, met echte, uitgevoerde voorbeelden en eerlijke beperkingen."
date: 2026-08-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "Linguistics"
  - "FOSS"
draft: false
---

Een Amerikaans uitspraakwoordenboek zegt dat een kat (*cat*) klinkt als
`K AE1 T`. Het Internationaal Fonetisch Alfabet schrijft hetzelfde geluid
als `kæt`. Een ander, alleen-ASCII-systeem schrijft het als `k"{t`. Alle
drie beschrijven exact dezelfde twee fonemen — een "k"-klank gevolgd door
een korte "a" gevolgd door een "t". Er is niets aan het geluid veranderd.
Alleen het alfabet dat gebruikt is om het op te schrijven is veranderd.

Dit gebeurt voortdurend bij iedereen die uitspraakdata uit meer dan één
bron combineert. Een spraakdataset gebouwd op basis van een Amerikaans
woordenboek gebruikt één notatie. Een Europees lexicon gebruikt een
andere. Een tekst-naar-spraakmotor verwacht een derde. Voordat die data
kan worden samengevoegd, doorzocht, of vergeleken, moet ze vertaald worden
van het ene fonetische alfabet naar het andere — hetzelfde werk dat een
vertaler doet tussen menselijke talen, behalve dat de "talen" hier
manieren zijn om geluid op te schrijven in plaats van manieren om woorden
op te schrijven.

`scriptconv` is een kleine Python-bibliotheek die deze vertaling doet, plus
een verwante taak een niveau hoger: uitzoeken in welk schriftsysteem een
stuk tekst zich zelfs bevindt voordat er iets anders mee gedaan kan worden.
Ze heeft geen mening over taalkunde — ze raadt niet hoe een woord wordt
uitgesproken. Ze verplaatst alleen symbolen die al bekende klanken
vertegenwoordigen van de ene notatie naar de andere, en identificeert
schriften vanuit de tekens zelf.

## Een paar termen, eenvoudig gedefinieerd

- **Schrift**: een schriftsysteem — de daadwerkelijke tekenset, zoals
  Latijns, Cyrillisch, of Hangeul. Niet hetzelfde als een taal: Engels,
  Frans en Vietnamees gebruiken allemaal het Latijnse schrift, en Servisch
  kan geschreven worden in zowel Cyrillisch als Latijns.
- **Orthografie**: de conventionele spellingsregels voor het schrijven van
  een specifieke taal in een schrift — hoofdlettergebruik, accenttekens,
  spatiëring.
- **Foneem**: een onderscheiden klankeenheid in een taal, zoals de
  "k"-klank in "kat".
- **IPA** (Internationaal Fonetisch Alfabet): een standaardalfabet om
  klanken precies op te schrijven, onafhankelijk van de normale spelling
  van een taal.
- **Transliteratie**: tekst converteren van het ene schrift naar het
  andere door tekens toe te wijzen, met als doel de originele spelling
  exact te behouden in plaats van de uitspraak.
- **Romanisatie**: transliteratie specifiek naar het Latijnse schrift.

## Waarom alleen-ASCII fonetische alfabetten überhaupt bestaan

IPA heeft tekens nodig zoals `ʃ`, `ʒ`, `ə` en `ˈ` die niet op een standaard
toetsenbord staan. Dat was decennialang een echt probleem in de
informatica, voordat Unicode universeel was en voordat de meeste lettertypen,
terminals en bestandsformaten betrouwbaar niet-ASCII-tekst ondersteunden.
Onderzoekers bouwden alleen-ASCII-vervangingen: ARPABET, ontwikkeld voor
Amerikaans-Engels spraakherkenningswerk, en X-SAMPA, een ASCII-codering van
de volledige IPA ontwikkeld om e-mail- en oude-terminal-veilig te zijn. Dit
zijn geen historische curiositeiten. ARPABET is nog steeds de notatie die
gebruikt wordt door wijdverspreide Amerikaans-Engelse uitspraakwoordenboeken
en spraaktools, en X-SAMPA duikt nog steeds op in linguïstische tooling
die platte tekst nodig heeft. Alles wat die data leest moet dat alfabet
kunnen lezen.

`scriptconv` voert de daadwerkelijke conversie uit. Dit is uitgevoerde
output, geen beschrijving:

```python
from scriptconv import convert, arpa_to_ipa, ipa_to_arpa

convert("K AE1 T", "arpa", "ipa")
# 'kæt'

convert("HH AH0 L OW1", "arpa", "ipa")
# 'həloʊ'

convert("kˈæt", "ipa", "x-sampa")
# 'k"{t'

arpa_to_ipa("HH AH0 L OW1", stress=True)
# 'həlˈoʊ'

ipa_to_arpa("həlˈoʊ", stress=True)
# 'HH AH0 L OW1'
```

Klemtoonmarkeringen overleven de heen-en-terugreis. ARPABET markeert
klemtoon met een cijfer vastgeplakt aan de klinker (`OW1`); IPA markeert
het met een `ˈ` geplaatst vóór de beklemtoonde lettergreep.
`arpa_to_ipa(..., stress=True)` draagt die informatie over, en terug
converteren reconstrueert exact de originele cijfers.

IPA zit met opzet in het midden van dit alles. `scriptconv` behandelt
elke notatie als een knoop in een graaf en elke converter als een rand, en
routeert conversies via IPA als hub in plaats van handmatig een converter
te schrijven voor elk paar notaties direct:

```python
from scriptconv import DEFAULT_GRAPH

[f"{e.src}->{e.dst}" for e in DEFAULT_GRAPH.route("arpa", "x-sampa")]
# ['arpa->ipa', 'ipa->x-sampa']
```

In totaal transcoderen negen notaties door die hub: ARPABET, X-SAMPA,
Kirshenbaum, Lexique, Cotovía, RFE en mantoq, plus Buckwalter, hieronder
behandeld.

## Het schrift detecteren voordat er iets anders gebeurt

Voordat software kan beslissen hoe een stuk tekst te verwerken — in welke
richting te renderen, welke spellingscontrole te draaien, welk lettertype
te kiezen — moet het weten in welk schrift de tekst is. Dat is een andere
vraag dan in welke taal het is. Schrift identificeert de tekenset; taal
identificeert het vocabulaire en de grammatica. Servisch, opnieuw, kan
Cyrillisch of Latijns zijn. Oezbeeks ook. `scriptconv` detecteert het
schrift direct uit de tekens, en koppelt apart een taalcode aan het
schrift waarin ze conventioneel wordt geschreven:

```python
from scriptconv import detect_script, script_runs, lang_to_script, base_direction

detect_script("Здравствуйте")
# 'Cyrl'

detect_script("안녕하세요")
# 'Hang'

script_runs("привет hello")
# [('Cyrl', 'привет '), ('Latn', 'hello')]

base_direction("مرحبا hello")
# 'mixed'

lang_to_script("uzb_cyr")
# 'Cyrl'
```

`detect_script` retourneert een ISO 15924-code — het standaard
viercijferige tag-register voor schriften (`Cyrl` voor Cyrillisch, `Hang`
voor Hangeul, `Latn` voor Latijns, `Arab` voor Arabisch). `script_runs`
splitst gemengde tekst op in aaneengesloten stukken per schrift, wat een
renderer nodig heeft om te beslissen, zin voor zin, welk lettertype en
welke tekstrichting toe te passen. `base_direction` rapporteert of een
gemengde string van links naar rechts, van rechts naar links, of beide
leest.

## De moeilijke gevallen: Buckwalter, Hangeul en kana

Drie schriftsysteemconversies komen vaak genoeg voor in echte pijplijnen
dat `scriptconv` elk direct behandelt.

**Buckwalter**, voor Arabisch, is een ASCII-translitteratieschema dat elke
Arabische letter en diakritisch teken aan een specifiek ASCII-teken
toewijst, één-op-één, zodat de originele spelling — inclusief
klinkertekens die inheemse tekst meestal weglaat — exact gereconstrueerd
kan worden. Het bestaat omdat Arabisch schrift lastig te hanteren is in
pijplijnen en tools gebouwd rond ASCII: sorteren, diffen, reguliere
expressies en oudere tekstformaten worden allemaal makkelijker zodra de
tekst Latijns-alfabet-ASCII is, mits de mapping exact en omkeerbaar is.

```python
from scriptconv import buckwalter_to_arabic, arabic_to_buckwalter

buckwalter_to_arabic("mrHbA")
# 'مرحبا'

arabic_to_buckwalter("مرحبا")
# 'mrHbA'

arabic_to_buckwalter("رحمٰن")
# 'rHm`n'
```

Het laatste voorbeeld bevat de dolk-alif, een klein superscript
diakritisch teken gebruikt in een handvol woorden (`رحمٰن`, *rahman*) —
Buckwalter heeft een specifiek ASCII-teken (`` ` ``) hiervoor
gereserveerd, apart van een gewone alif, zodat de transliteratie de twee
niet samenvoegt.

**Hangeul** ziet eruit als lettergreepblokken, maar elk blok is een
samengesteld cluster van individuele letters (jamo) uitgelijnd in een
raster — de manier waarop "H", "A", "N" visueel samenkomen tot één glyph
voor "han" in plaats van van links naar rechts geschreven te worden.
Software die de individuele letters nodig heeft — voor zoeken, voor
fonologische analyse, om een ander systeem te voeden — moet ze weer uit
elkaar halen:

```python
from scriptconv.translit import decompose_hangul

decompose_hangul("한국")
# 'ㅎㅏㄴㄱㅜㄱ'

decompose_hangul("국민")
# 'ㄱㅜㄱㅁㅣㄴ'
```

Dat laatste voorbeeld is belangrijk voor wat het *niet* doet: 국민
(*gungmin*, "burger") wordt uitgesproken met nasale assimilatie,
`[ɡuŋmin]`, maar `decompose_hangul` geeft de letters terug zoals
geschreven — `ㄱㅜㄱㅁㅣㄴ`, niet-geassimileerd — omdat decompositie
rekenkunde is op het Unicode-codepoint, geen fonologische regel. Het
vertelt u wat er geschreven werd, niet hoe het klinkt.

**Kana-conversie** verplaatst tussen de twee lettergreepschriften van het
Japans, hiragana en katakana, die dezelfde klanken vertegenwoordigen met
verschillende tekens op een vaste codepoint-verschuiving:

```python
from scriptconv import hira_to_kana, kana_to_hira

hira_to_kana("こんにちは")
# 'コンニチハ'

kana_to_hira("カタカナ")
# 'かたかな'
```

## Waarom dit in zijn eigen bibliotheek leeft

Een fonemizer — een tool die raadt hoe een geschreven woord wordt
uitgesproken — heeft taalkundig oordeel nodig: klemtoonregels,
uitzonderingen, contextafhankelijke uitspraak. `scriptconv` heeft
opzettelijk niets daarvan. Elke functie hierboven is een
tabelopzoeking of een codepoint-berekening: dezelfde input, dezelfde
output, geen giswerk, geen taalmodel, niets dat fout zou kunnen zijn over
hoe een specifieke taal daadwerkelijk klinkt. Dat maakt het veilig om te
delen tussen elke fonemizer die het nodig heeft, in plaats van dat elke
fonemizer zijn eigen ARPABET-tabel met zijn eigen bugs herimplementeert.
De post over de [fonologie-stack](/blog/2026-08-10-the-phonology-stack)
behandelt hoe de daadwerkelijke uitspraak-radende motoren — die welke
werkelijk taalkundige meningen dragen — bovenop deze laag zijn gebouwd in
plaats van hem te dupliceren.

## Waar de mapping niet exact is

Converteren tussen notaties is niet altijd verliesvrij, en `scriptconv`
registreert dit als opvraagbare data in plaats van het als verrassing te
laten. Elke notatie heeft twee onafhankelijk bijgehouden eigenschappen: of
het converteren ervan naar IPA en terug de originele symbolen exact
reproduceert, en of IPA geconverteerd naar en terug vanuit die notatie
elk IPA-symbool reproduceert.

ARPABET faalt in beide richtingen: het heeft een beperkte,
Engels-specifieke foneeminventaris, dus gaan van IPA → ARPABET → IPA kan
onderscheidingen verliezen die IPA kan maken maar waarvoor de tabel van
ARPABET geen symbool heeft. X-SAMPA en Lexique dekken de volledige
IPA-inventaris getrouw maar zijn niet gegarandeerd om schoon terug te
gaan vanuit hun eigen kant. Kirshenbaum en Buckwalter gaan schoon terug
vanuit hun eigen kant naar IPA maar niet omgekeerd. Mantoq, het fonetische
alfabet van de Halabi Arabische fonetiseerder, converteert slechts één
kant op, naar IPA — er is geen converter terug. Niets hiervan is ergens
verstopt in een docstring; het is data die de bibliotheek blootstelt
zodat een aanroeper kan controleren voordat wordt aangenomen dat een
heen-en-terugreis veilig is.

---

Als u uitspraakdata uit meerdere bronnen aan elkaar naait, of schriften
moet detecteren en tekst moet normaliseren voordat het een fonemizer
bereikt, [neem dan contact op](/contact) of bekijk wat we nog meer bouwen
op dit gebied op de [servicespagina](/services).
