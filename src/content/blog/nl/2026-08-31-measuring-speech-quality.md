---
title: "Spraakkwaliteit meten zonder luisterpanel"
description: "Een praktische gids voor speechonnxmetrics: wat MOS, no-reference MOS-voorspellers, intrusieve signaalmetrieken en ASR-gebaseerde WER/CER daadwerkelijk meten, wanneer elk van toepassing is, echte scores op echte audio, en waarom een voorspelde MOS bewijs is, geen waarheid."
date: 2026-08-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "speechonnxmetrics"
  - "TTS"
  - "ONNX"
  - "evaluation"
draft: false
---

Een ruisonderdrukkingsmodel brengt een nieuw checkpoint uit. Een TTS-stem
wordt hertraind op meer data. Een stemklonings-pijplijn wisselt zijn
vocoder. In elk geval moet iemand antwoorden: is de output beter of
slechter dan voorheen?

"Het klinkt beter voor mij" schaalt niet. Het
breekt af zodra de taal er niet een is die u spreekt, zodra er twintig
checkpoints te vergelijken zijn in plaats van twee, of zodra de wijziging
bij elke commit gecontroleerd moet worden in plaats van eenmaal met de
hand.

Het rigoureuze antwoord op "klinkt het beter" is een **Mean Opinion Score
(MOS)**: plaats de audio voor een panel van luisteraars, vraag elk om het
1 tot 5 te beoordelen, en middel de scores. MOS is de standaard
spraakkwaliteitsmetriek omdat hij de vraag stelt die ertoe doet,
zou een mens dit acceptabel vinden, in plaats van een benadering ervan.

Het is ook duur. Een panel rekruteren, het consistent laten draaien, en
het herhalen voor elke taal, elke opnameconditie en elke modelversie die
een klein team uitbrengt, is niet iets waar een luisterpanel bij kan
blijven.

[`speechonnxmetrics`](https://github.com/TigreGotico/speechonnxmetrics) is
een bibliotheek om dat oordeel te benaderen zonder panel, bij elke build.
Ze groepeert haar metrieken in drie families, en de juiste familie kiezen
voor de situatie is belangrijker dan welk individueel getal ook.

## Drie families, drie vragen

**No-reference MOS-schatters** zijn neurale netwerken getraind om te
voorspellen wat een luisterpanel zou zeggen, alleen op basis van de audio.
Ze hebben geen schoon origineel nodig, alleen de output die u wilt
beoordelen.

Gebruik deze familie wanneer er geen ground truth is om mee te
vergelijken: het scoren van de output van een TTS-systeem, of het
controleren van een echte, al gedegradeerde opname na ruisonderdrukking.

**Intrusieve metrieken** hebben een bijpassende schone referentie nodig en
meten de afstand tussen die en het gedegradeerde signaal. Gebruik deze
familie wanneer u de degradatie zelf hebt gefabriceerd en nog steeds het
schone origineel bezit: u voerde een bekend-goede opname door een codec,
een bandbreedte-extensiemodel, of een stemconverter, en wilt weten hoe ver
de output van de bron is afgeweken.

**ASR-gebaseerde tekstmetrieken** transcriberen de output met een
spraakherkenner en vergelijken het transcript met de verwachte tekst. Dit
vangt iets dat de andere twee families niet kunnen: audio die perfect
natuurlijk en schoon klinkt maar de verkeerde woorden zegt. Een no-reference MOS-voorspeller beoordeelt natuurlijkheid, niet juistheid, dus
een vloeiende verkeerde uitspraak scoort prima. Een intrusieve metriek
heeft een referentie-golfvorm nodig, geen referentiezin. Alleen
tekstvergelijking vangt een verkeerd woord.

De bibliotheek stelt dit alles bloot via één functie:

```python
import speechonnxmetrics as s

# No-reference: only the output needed, no ground truth exists
s.score("output.wav", ["utmos"])

# Intrusive: needs a clean reference, ref= is required
s.score("degraded.wav", ["stoi", "mcd", "si_sdr"], ref="clean.wav")
```

Tekstmetrieken leven in een aparte module, `speechonnxmetrics.asr`, omdat
ze strings vergelijken, geen audio. `s.score()` verzendt alleen metrieken
die een golfvorm nemen.

## No-reference MOS: de getallen lezen

Vier MOS-schatters worden geleverd, elk met waarden op een schaal van 1-5
waar hoger beter is, dezelfde schaal die een menselijk panel gebruikt:

| metriek | dimensies | getraind op | commercieel gebruik |
|---|---|---|---|
| `utmos` | één natuurlijkheidsscore | gesynthetiseerde spraak (VoiceMOS Challenge) | ja |
| `dnsmos` | `sig` / `bak` / `ovrl` (spraakkwaliteit / achtergrondruis / algeheel) | ITU-T P.835 | ja |
| `dnsmos_p808` | één crowdsourced-luister-MOS | ITU-T P.808 | ja |
| `sigmos` | 7 dimensies (`col`, `disc`, `loud`, `noise`, `reverb`, `sig`, `ovrl`) | ITU-T P.804 | ja |
| `nisqa` | `mos` plus `noi`/`dis`/`col`/`loud`-uitsplitsing | NISQA-v2 | **nee — CC BY-NC-SA 4.0** |

`nisqa` is de enige metriek in de hele bibliotheek met niet-commerciële
gewichten. De andere vier zijn MIT-gelicentieerd. `speechonnxmetrics`
filtert dit niet voor u. Het vermeldt de licentie en laat de keuze aan de
aanroeper.

Hier is wat echte audio scoort. Door de eigen meegeleverde fixtures van de
bibliotheek te draaien (een schone opname, `source.wav`, en een
neurale-codec-resynthese van dezelfde clip, `facodec_aria.wav`) door
UTMOS:

```python
>>> s.score("source.wav", ["utmos"])
{'utmos': 4.41}
>>> s.score("facodec_aria.wav", ["utmos"])
{'utmos': 3.21}
```

De schone opname landt dicht bij de top van de schaal, zoals het hoort.
Het is echte menselijke spraak, niet gesynthetiseerd. De codec-resynthese
zakt meer dan een heel punt. Dat gat, meer dan een van beide getallen
apart, is het bruikbare signaal: het vertelt u dat de codec hoorbare
degradatie introduceert, en geeft u een getal om te volgen naarmate de
codec wordt afgesteld.

DNSMOS op dezelfde schone opname:

```python
>>> s.score("source.wav", ["dnsmos"])
{'dnsmos.sig': 3.45, 'dnsmos.bak': 3.60, 'dnsmos.ovrl': 2.93}
```

Drie getallen, geen één, en ze divergeren: `ovrl` zit merkbaar onder
zowel `sig` als `bak`. Die divergentie is informatief in plaats van een
bug. `ovrl` is de P.835-beoordeling van de algehele luisterervaring, en
die neigt ertoe een opname harder te straffen dan een van de
componentscores alleen zou suggereren, vooral voor een opname uit de
echte wereld in plaats van een studio-opname. Wanneer `bak` laag is, zoek
naar achtergrondruis. Wanneer `sig` laag is, zoek naar artefacten op
stemniveau: clipping, uitval, robotisch timbre. Rapporteer meer dan één
voorspeller voor dezelfde clip. Ze zijn getraind op verschillende data en
zijn het op informatieve manieren oneens, en een groot gat tussen twee
onafhankelijke voorspellers op dezelfde clip is een aanwijzing om te gaan
luisteren.

## Intrusieve metrieken: de getallen lezen

Elf referentiegebaseerde metrieken meten afstand van een schoon origineel.
Degene die het eerst het kennen waard zijn:

| metriek | bereik | richting | meet |
|---|---|---|---|
| `stoi` / `estoi` | 0–1 | hoger is beter | short-time objective intelligibility — hoeveel van de *inhoud* overleeft, onafhankelijk van hoe natuurlijk het klinkt |
| `si_sdr` / `sdr` / `snr` | dB, onbegrensd | hoger is beter | signaal-tot-vervorming / signaal-tot-ruis-verhouding |
| `mcd` | dB, onbegrensd | lager is beter | mel-cepstrale vervorming — afstand van de spectrale envelope, een klassieke TTS/VC-kwaliteitsmetriek |
| `log_f0_rmse` | onbegrensd | lager is beter | toonhoogtecontourfout |
| `lsd` / `msd` | dB | lager is beter | log-spectrale / mel-spectrale afstand |

Merk op dat de richting omslaat: STOI en de SDR-familie gaan omhoog
wanneer de kwaliteit beter is, terwijl MCD, toonhoogtefout en spectrale afstand
omlaag gaan. Ze door elkaar halen bij het lezen van een tabel is een
makkelijke vergissing.

Dezelfde codec-resynthese scoren tegen zijn schone bron:

```python
>>> s.score("facodec_aria.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav")
{'stoi': 0.662, 'mcd': 10.46, 'si_sdr': -26.94}
```

Een STOI van 0.66 op een schaal van 0-1 waar 1.0 een perfecte match is,
zegt dat verstaanbaarheid een echte klap kreeg. Dit is ver onder wat een
licht verwerkte opname zou scoren.

Een SI-SDR van ongeveer −27 dB
bevestigt dit. SI-SDR is negatief wanneer de vervormingsenergie het
signaal overtreft, en een groot negatief getal betekent zware structurele
verandering, niet alleen toegevoegde ruis. Een MCD van 10.46 dB is hoog. Gepubliceerde TTS-systemen die duidelijk synthetisch klinken maar toch
sprekerconsistent zijn, landen doorgaans in enkele cijfers, dus 10+ wijst
op substantiële spectrale-envelope-drift tussen de resynthese en het
origineel.

## ASR-gebaseerde metrieken: de getallen lezen

Vijf tekstmetrieken komen van één Levenshtein-alignering tussen een
referentietranscript en een hypothese (waar de audio daadwerkelijk als
getranscribeerd werd):

| metriek | bereik | richting | betekenis |
|---|---|---|---|
| `wer` | ≥ 0 (meestal 0–1, kan 1 overschrijden) | lager is beter | word error rate: substituties + verwijderingen + invoegingen, gedeeld door het aantal referentiewoorden |
| `cer` | 0–1 | lager is beter | hetzelfde idee op tekenniveau — vergevingsgezinder voor kleine spellings-/tokenisatie-mismatches |
| `mer` | 0–1 | lager is beter | match error rate |
| `wil` | 0–1 | lager is beter | verloren woordinformatie |
| `wip` | 0–1 | hoger is beter | behouden woordinformatie (`1 − wil`) |

Een uitgewerkt voorbeeld: referentie "the quick brown fox jumps over the
lazy dog" tegen hypothese "the quick brown fox jumped over a lazy dog"
(één substitutie, "jumps" → "jumped", één verwijdering van "the"):

```python
>>> from speechonnxmetrics import asr
>>> from speechonnxmetrics.asr import BASIC
>>> asr.wer(reference, hypothesis, normalizer=BASIC)
0.222
>>> asr.cer(reference, hypothesis, normalizer=BASIC)
0.116
```

Een WER van 0.22 betekent dat ongeveer één op de vijf woorden fout is:
merkbaar, de moeite van het beluisteren waard. CER is lager op hetzelfde
paar omdat scoring op tekenniveau een substitutie van één woord behandelt
als een handvol tekenbewerkingen binnen een veel langere tekenreeks, niet
als een heel ontbrekend token.

CER en WER beantwoorden verschillende
vragen en zijn niet direct met elkaar vergelijkbaar. Een WER boven
ongeveer 0.3–0.4 op natuurlijke spraak betekent meestal dat het
ASR-systeem, of de audio die het transcribeert, een echt probleem heeft,
geen afrondingsfout.

`speechonnxmetrics` normaliseert tekst nooit namens u. Een ruwe
vergelijking telt hoofdlettergebruik en interpunctie als fouten, wat
zelden is wat u wilt wanneer u uitspraak beoordeelt in plaats van exacte
transcriptopmaak. Geef expliciet een normalizer mee: `BASIC` zet om naar
kleine letters en reduceert witruimte, `STRICT` breidt ook samentrekkingen
uit en verwijdert diakritische tekens, interpunctie en stopwoorden.

## De belangrijkste kanttekening

Elk no-reference MOS-getal in deze bibliotheek is een voorspelling van een
model, geen meting van een feit. UTMOS, DNSMOS, SIGMOS en NISQA zijn elk
getraind op een specifieke set luistertestdata, in specifieke talen en
opnamecondities.

Een voorspeller die vooral getraind is op Engelse
studio-opnamen kan een taal die hij nooit tijdens training zag, een accent
dat zijn trainingspanel nooit beoordeelde, of een opnameconditie
(telefoonaudio, een lawaaierige kamer, een microfoon van lage kwaliteit)
buiten zijn trainingsdistributie verkeerd beoordelen. Het model liegt
niet. Het extrapoleert, en extrapolatie vanuit onbekende inputs is waar
neurale voorspellers het minst betrouwbaar zijn.

Behandel een voorspelde MOS als bewijs, niet als grondwaarheid. Het is
betrouwbaar voor waar het goed in is: grote regressies opvangen, meerdere
kandidaten tegen elkaar rangschikken, en een run signaleren die een mens
echt moet beluisteren.

Het is geen vervanging voor een echt luisterpanel
wanneer een beslissing veel op het spel zet, en het zou niet het laatste
woord moeten zijn over een taal of conditie waarop het onderliggende model
niet getraind is om te beoordelen. De praktische verzachting is meerdere
voorspellers samen te rapporteren en onenigheid tussen hen te behandelen als
een aanleiding om te luisteren in plaats van ruis om weg te middelen.

## Wat dit mogelijk maakt

Niets hiervan is nuttig op zichzelf. Het wordt nuttig op het moment dat
meerdere engines op dezelfde voet vergeleken moeten worden: welke
TTS-engine, welke STT-engine, welk verbeteringsmodel als standaard te
gebruiken.

De [pure-ONNX-spraakbibliotheken](/nl/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries)
die `speechonnxmetrics` gebouwd werd om te evalueren (TTS, ASR,
ruisonderdrukking, stemklonen) publiceren vergelijkingen per engine
geproduceerd met precies de metrieken hierboven: no-reference MOS voor
systemen zonder ground truth, intrusieve metrieken waar een schone
referentie bestaat, WER/CER overal waar de juistheid van het transcript
in het geding is. Dat is wat "we kozen deze engine" verandert in een
getal dat iemand anders kan controleren.

Als uw project een taal, een engine of een opnameconditie nodig heeft die
op deze manier geëvalueerd moet worden en dat nog niet gedekt is,
[neem dan contact op](/nl/contact) of bekijk [onze diensten](/nl/services).
