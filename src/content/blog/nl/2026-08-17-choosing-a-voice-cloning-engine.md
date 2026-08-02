---
title: "Een stemklonings-engine kiezen"
description: "voiceclonnx draait 10 stemconversie-engines achter één API, van kNN-feature-swap tot AR codec-LM. Dit is een gids voor de modelfamilies erachter, de echte gemeten afweging tussen verstaanbaarheid en sprekergelijkenis, en hoe u een engine kiest voor een specifieke taak."
date: 2026-08-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "voice cloning"
  - "voice conversion"
  - "self-hosted"
draft: false
---

Stemconversie neemt een opname en een referentiespreker, en produceert
dezelfde woorden in de stem van de referentiespreker. Er komt nergens tekst
aan te pas in de pijplijn: de input is audio, de output is audio, en het
model leest of schrijft nooit een transcript. Dat onderscheidt het van
tekst-naar-spraak (TTS), dat begint bij tekst en geen bronopname heeft om te
bewaren. Stemconversie beantwoordt een nauwere vraag: gegeven deze opname,
laat ze klinken als iemand anders, terwijl de woorden intact blijven.

Die nauwere taak heeft echte toepassingen. Een opname nasynchroniseren naar
een consistente stem zonder een tweede stemacteur in te huren. Een spreker
in een interview of supportgesprek anonimiseren terwijl de woorden verbatim
blijven. De output van een TTS-systeem één stabiele identiteit geven over
talen heen, wanneer de onderliggende stemmen voor elke taal onafhankelijk
zijn getraind en anders als verschillende personen zouden klinken.

[`voiceclonnx`](https://github.com/TigreGotico/voiceclonnx) implementeert 10
van deze engines achter één Python-API, allemaal draaiend op
`onnxruntime` zonder dat PyTorch nodig is bij inferentie. De engines zijn
niet inwisselbaar. Ze komen uit verschillende modelfamilies, en er een
kiezen betekent een afweging kiezen, geen winnaar.

## De API, in het kort

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
print(cloner.sample_rate)   # 16000
```

`clone_voice(audio, reference_voice, out_path)` neemt de bronopname, een
5-30 seconden durend referentiefragment van de doelspreker, en een
uitvoerpad, en geeft het pad naar de geconverteerde WAV terug. Van engine
wisselen betekent de `engine=`-string wisselen; de vorm van de aanroep
verandert niet. Eén engine, `rvc`, vormt de uitzondering — die neemt een
pad naar een `.onnx`-stemmodel in plaats van een referentieopname, hieronder
behandeld. `pip install voiceclonnx` haalt alle 10 engines binnen; modellen
worden bij eerste gebruik gedownload van Hugging Face.

## Twee assen, niet één score

Twee getallen beschrijven hoe goed een conversie werkte, en ze bewegen niet
samen.

**Word error rate (WER)** meet verstaanbaarheid: hoeveel van de originele
zin overleefde, beoordeeld door de output terug door een spraakherkenner te
voeren en te vergelijken met het brontranscript. 0% WER betekent dat elk
woord correct doorkwam.

**Sprekergelijkenis** meet identiteit: of de output daadwerkelijk klinkt
als de doelspreker, niet de originele. Het wordt berekend door een
sprekerembedding te extraheren — een compacte numerieke vingerafdruk van het
timbre van een stem, de tonale kleur die de ene stem anders laat klinken
dan de andere bij dezelfde toonhoogte en luidheid — uit de output en uit
het referentiefragment, en ze dan te vergelijken met cosinusgelijkenis. Een
score van 1,0 betekent identiek timbre; de eigen baseline van
`voiceclonnx` — een ongeconverteerde kopie van de bron gescoord tegen het
doel — ligt op 0,09, dus alles wat betekenisvol daarboven zit doet echt
conversiewerk.

`voiceclonnx` publiceert beide getallen voor elke engine, gemeten aan de
hand van dezelfde zin geconverteerd naar twee referentiestemmen. De WER komt
van `faster-whisper`; de sprekergelijkenis komt van een
`wespeaker-resnet34`-embeddingmodel (kruisgecontroleerd tegen twee andere).
Zet ze naast elkaar en er verschijnt een patroon: geen enkele engine
overtreft beide kolommen.

| Engine | Familie | WER | Doelgelijkenis |
|---|---|---|---|
| `focalcodec` | kNN feature-swap | 15-19% | **0.61** |
| `lscodec` | Spreker-ontkoppelde codec | ~35% | 0.54 |
| `chatterbox` | AR codec-LM | 4-8% | 0.54 |
| `knnvc` | kNN feature-swap | 12-15% | 0.49 |
| `facodec` | Gefactoriseerde codec | **0%** | 0.44 |
| `openvoice` | Toonkleur-overdracht | **0%** | 0.37 |
| `bicodec` | Semantische + globale tokens | 12% | 0.29 |
| `triaan` | Triple-AAN | 4% | 0.29 |
| `cosyvoice` | Flow-matching | 8% | 0.21 |

(`rvc` converteert elke bron naar één vaste, door de community getrainde
stem in plaats van naar een willekeurig referentiefragment, dus is het niet
vergelijkbaar in deze tabel; zie hieronder.)

Lees de tabel per rij, niet zoekend naar één beste regel. `facodec` en
`openvoice` zitten op 0% WER — elk woord overleeft — met matige gelijkenis.
`focalcodec` en `lscodec` zitten aan het andere uiteinde: de sterkste
timbre-overdracht in de set, gekocht door 15-35% van de woorden fout te
laten uitkomen. `chatterbox` is de enige engine die op beide assen tegelijk
goed presteert (4-8% WER, 0,54 gelijkenis), wat een eigenschap is van zijn
architectuur, hierna behandeld.

## Waarom de families zich verschillend gedragen

De engines splitsen zich in verschillende benaderingen, en de benadering
voorspelt waar een engine landt op de tabel hierboven.

**kNN feature-swap** (`knnvc`, `focalcodec`). De bronaudio wordt opgedeeld
in korte frames, elk omgezet in een featurevector door een vooraf getrainde
zelfgesuperviseerde encoder. Voor elk bronframe vindt het algoritme de *k*
dichtstbijzijnde frames in een pool van features van de doelspreker en
middelt ze in, waarbij het timbre van de bron frame voor frame wordt
vervangen terwijl de onderliggende fonetische inhoud blijft waar hij werd
geëxtraheerd uit de eigen representatie van de encoder. Er is geen geleerde
decoder die de ene stem op de andere afbeeldt — de swap is een
dichtstbijzijnde-buren-opzoeking — wat verklaart waarom timbre-overdracht
agressief kan zijn (`focalcodec` bereikt 0,61 gelijkenis) ten koste van af
en toe verhaspelde frames die een slechte match hadden in de doelpool, wat
zich uit als WER.

**Gefactoriseerde codec** (`facodec`). Een neurale audiocodec — een model
dat spraak comprimeert tot een compacte tokenreeks en reconstrueert — die
getraind is om die tokens expliciet te splitsen in aparte inhouds- en
timbre-stromen. Omdat inhoud een toegewijde stroom is, reconstrueert de
decoder de woorden met hoge getrouwheid; alleen de timbre-stroom wordt
verwisseld voor de doelspreker. Die expliciete scheiding verklaart waarom
`facodec` 0% WER bereikt: het behoud van inhoud concurreert met niets.

**Toonkleur-overdracht** (`openvoice`). Een conversiemodule verandert
toonkleur — toonhoogtecontour en timbre — nadat een aparte encoder de
linguïstische inhoud heeft vastgelegd, in een geest vergelijkbaar met de
gefactoriseerde-codecbenadering maar geïmplementeerd als een
kleuroverdrachtsstap over een mel-spectrogram in plaats van discrete
tokens. Het bereikt ook 0% WER, met iets lagere gelijkenis dan `facodec`.

**AR codec-LM** (`chatterbox`). Een autoregressief taalmodel dat
codectokens één voor één voorspelt, geconditioneerd op de embedding van de
doelspreker, veel als een tekst-naar-spraaktaalmodel maar geconditioneerd op
de inhoudstokens van de bronopname in plaats van tekst. Omdat het prosodie
(ritme, klemtoon, intonatie) genereert als onderdeel van hetzelfde
autoregressieve proces in plaats van het rechtstreeks van de bron te
kopiëren, kan het spreekstijl meedragen met timbre — wat verklaart waarom
de documentatie noteert dat het de "sterkste bron-naar-doel-verschuiving"
geeft — en het is de enige engine die goed scoort op zowel
verstaanbaarheid als gelijkenis tegelijk.

**Flow-matching** (`cosyvoice`). Een continu generatief proces dat
iteratief ruis verfijnt tot het doel-mel-spectrogram, met een ODE
(gewone differentiaalvergelijking)-solver die een instelbaar aantal keer
stapt (`ode_steps`, standaard 10). De inhoudsencoder is ontworpen voor
crosslinguale overdracht, en die algemeenheid is waarschijnlijk waarom zijn
doelgelijkenisscore de laagste in de set is: de representatie optimaliseert
voor taalonafhankelijkheid, niet voor de nauwste sprekermatch.

**Spreker-ontkoppelde codec** (`lscodec`). Net als `facodec`, een codec
getraind om inhoud van sprekeridentiteit te scheiden, maar afgesteld om
gelijkenis verder te duwen ten koste van de precisie van de inhoudsstroom,
landend op ~35% WER met de op één na hoogste gelijkenis in de set.

**Triple-AAN- en semantisch-plus-globale-token-codecs** (`triaan`,
`bicodec`) zitten in het midden op beide assen: matige WER, matige
gelijkenis, geen sterke bias in beide richtingen.

**Any-to-ONE codec + vocoder** (`rvc`). Gebouwd op ContentVec (een
inhoudsencoder) die een VITS-vocoder voedt, getraind per doelstem in plaats
van een willekeurig referentiefragment te accepteren. `reference_voice`
voor deze engine is een pad naar een `.onnx` RVC-modelbestand of een
Hugging Face-repo-ID, geen audiobestand:

```python
cloner = VoiceCloner(engine="rvc")
out = cloner.clone_voice("source.wav", "/path/to/myvoice.onnx", "out.wav")
```

Omdat elk RVC-model op één doelstem is getraind, neemt het geen
referentiefragment bij inferentie en wordt het niet gescoord op dezelfde
gelijkenisbenchmark als de any-to-any-engines. De gemeten 38% WER
weerspiegelt één door de community getraind voorbeeldmodel, niet de
architectuur in het algemeen — kwaliteit hangt af van hoe dat specifieke
model getraind werd. Duizenden community-RVC-stemmen bestaan op Hugging
Face en laden direct via repo-ID.

## Bepalen welke te draaien

**Snelle, algemene pijplijn.** Begin met `facodec` of `openvoice`. Beide
halen 0% gemeten WER met matige gelijkenis (0,44 en 0,37), en beide leveren
een INT8-gekwantiseerde variant zonder vermelde kwaliteitsregressie — geef
`quantized=True` mee voor een kleiner, sneller model.

**Maximale sprekergelijkenis.** Gebruik `focalcodec` (0,61 gelijkenis, de
hoogste gemeten) als de 15-19% WER acceptabel is voor het gebruiksscenario,
of `chatterbox` (0,54 gelijkenis, 4-8% WER) als dat niet zo is.
`chatterbox` draait ook op 24 kHz, de hoogste outputsnelheid voor
any-to-any-conversie in de set — `rvc` gaat tot 48 kHz maar alleen in de
any-to-ONE-modus hierboven.

**Hardware met beperkte middelen.** `knnvc` in INT8 is ongeveer 123 MB op
schijf, de kleinste footprint in de set, met 0,49 gelijkenis en 12-15% WER
— een redelijke afweging voor beperkt geheugen. Niet elke engine
kwantiseert netjes: `focalcodec` en `cosyvoice` zijn gedocumenteerd als
degraderend in INT8, dus houd die twee in fp32.

**Een taal waarop de engine niet getraind was.** De inhoudsencoder van
`cosyvoice` is gebouwd voor crosslinguale overdracht, wat de gedocumenteerde
reden is om ernaar te grijpen boven een engine afgesteld voor
conversie binnen dezelfde taal, ook al is zijn gemeten gelijkenis (0,21) de
laagste van de negen direct vergelijkbare engines.

**Stemidentiteit boven exacte formulering.** `lscodec` geeft de sterkste
timbre-overdracht onder de codec-familie-engines (0,54, gelijk met
`chatterbox`) ten koste van de hoogste WER in de vergelijkbare set (~35%).
Kies deze wanneer het doel is "klinkt dit als de doelspreker" en
incidentele woordfouten in de output aanvaardbaar zijn.

**Eén vaste community-stem in plaats van een willekeurig fragment.** `rvc`,
met een vooraf getraind `.onnx`-stemmodel in plaats van een
referentieopname.

**Niet-commerciële beperking eerst te controleren.** De gewichten van
`bicodec` zijn gelicentieerd onder CC BY-NC-SA 4.0. Elke andere engine's
gewichten zijn MIT, Apache-2.0, of CC BY 4.0. Controleer de licentie van
het specifieke gewicht dat u inzet voordat u het commercieel verzendt.

## Wat het niet goed doet, en op wie het niet gebruikt moet worden

Elk getal hierboven komt met dezelfde kanttekening: de getallen beschrijven
een Engelse demozin geconverteerd tussen twee specifieke referentiestemmen.
Een andere taal, een ruisrijkere bronopname, een korter of
lagerekwaliteits referentiefragment, of een bronspreker wiens stem ver
afstaat van alles in de trainingsdata van een engine, zullen allemaal de
getallen verschuiven, meestal ten kwade. Geen van deze engines is een
universele oplossing voor een bronopname van lage kwaliteit — verschillende
converteren graag timbre terwijl ze bronruis rechtstreeks doorlaten, omdat
ruis zijn eigen akoestische signatuur heeft die een inhoud/timbre-splitsing
niet altijd netjes scheidt.

Stemconversie brengt ook een reëel risico met zich mee dat zijn nauwe
neef, stemklonen voor TTS, dit team al dwong te doorgronden: een opname
converteren zodat ze klinkt als een echte, identificeerbare persoon is een
technologie die identiteitsfraude mogelijk maakt, ongeacht of dat de
bedoeling was. De regel die dit team toepast op synthetische stemmen in het
algemeen — expliciete toestemming verkrijgen voordat de stem van een echte
persoon als donor of doel wordt gebruikt, en terugvallen op
publiek-domein-opnamen of een bewust originele stem wanneer toestemming niet
mogelijk is — geldt hier zonder uitzondering. Een referentiefragment van een
echte persoon is, vanuit toestemmingsoogpunt, niet anders dan een volledige
trainingsset van diens stem; er is alleen veel minder van nodig om een
bruikbaar resultaat te produceren, wat een reden is voor meer voorzichtigheid,
niet minder.

Neem contact op via [contact](/contact) of bekijk [wat we aanbieden](/services)
als stemconversie deel uitmaakt van een pijplijn die u bouwt.
