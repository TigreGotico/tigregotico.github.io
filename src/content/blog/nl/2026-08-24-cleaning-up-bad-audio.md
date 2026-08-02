---
title: "Slechte audio opschonen: ruisonderdrukking en bandbreedte-extensie in audiosronnx"
description: "audiosronnx behandelt ruisonderdrukking en bandbreedte-extensie als twee aparte taken: het echte engine-register, modelgroottes en licenties, de lijst met afgewezen modellen, en hoe u controleert of de output daadwerkelijk is verbeterd."
date: 2026-08-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "denoising"
  - "bandwidth extension"
  - "speech"
draft: false
---

Een opname kan op twee verschillende manieren slecht zijn, en de oplossingen
overlappen niet.

De eerste manier: achtergrondruis zit bovenop de spraak — verkeer, een
ventilator, kamergezoem. Het signaal dat ertoe doet is er; er zit iets
anders doorheen gemengd. Dat verwijderen is **ruisonderdrukking**
(*denoising*).

De tweede manier: de opname heeft nooit het volledige signaal vastgelegd.
Telefonieaudio wordt bemonsterd op 8.000 samples per seconde (8 kHz); een
volledig-kwaliteitsopname is meestal 48 kHz. De **sample rate** bepaalt de
hoogste frequentie die een digitaal signaal kan representeren, dus een
8 kHz-gesprek heeft helemaal geen inhoud boven 4 kHz — niet zacht, niet
gefilterd, gewoon nooit opgenomen. Die audio weer volledig laten klinken
betekent plausibele hoge frequenties verzinnen die nooit zijn vastgelegd.
Dat is **bandbreedte-extensie** (*bandwidth extension*).

`audiosronnx` behandelt dit als twee verschillende problemen met twee
verschillende toegangspunten, omdat het verkeerde gebruiken het verkeerde
doet. Draai een bandbreedte-extender op een ruizig signaal en hij zal
trouw een hoogfrequente versie van de ruis reconstrueren. Ruisonderdrukking
moet eerst gebeuren.

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _     = load_sr("lavasr").upscale(clean, rate)              # extend to 48 kHz
```

`load_denoise()` en `load_sr()` weigeren elkaars engines — `load_denoise`
om een bandbreedte-extender vragen geeft een fout in plaats van stilletjes
de verkeerde taak uit te voeren.

## Waar dit werkelijk helpt

De voor de hand liggende aanname is dat audio opschonen vóór spraakherkenning het
transcript wel moet verbeteren. In de praktijk is dat niet betrouwbaar. Moderne
herkenners zijn getraind op grote hoeveelheden ruizige, smalbandige spraak uit de
echte wereld, dus een herkenner verwerkt een ruizige opname vaak beter dan
dezelfde opname nadat een enhancer erdoorheen is gegaan. Verbetering is lossy.
Ze verwijdert wat ze als ruis beoordeelt, en kan daarbij akoestisch detail
meenemen dat de herkenner juist gebruikte, of artefacten achterlaten die de
herkenner nooit tijdens de training heeft gehoord. Of het helpt of schaadt hangt
af van het specifieke model, waarop het getraind is, en wat er mis is met de
opname. Het moet per model gemeten worden, niet aangenomen.

De twee plekken waar deze tools consequent renderen, liggen allebei aan de
synthesekant.

De eerste is **het voorbereiden van trainingsdata**. Een tekst-naar-spraakstem
erft het karakter van zijn trainingsaudio, inclusief de ruimte waarin die is
opgenomen. Ruis, gezoem en een lage samplerate in het corpus worden ruis, gezoem
en een gedempte klank in elke zin die de voltooide stem ooit uitspreekt. Een
corpus opschonen vóór training, en het optillen naar een consistente 48 kHz, is
werk dat eenmalig gedaan wordt en elke uitvoer daarna verbetert. Dit telt het
meest voor talen zonder studiocorpus, waar de enige bestaande opnames nooit voor
spraaksynthese bedoeld waren.

De tweede is **het nabewerken van gesynthetiseerde spraak**. Een vocoder kan een
metaalachtige rand of een bandbeperkte klank achterlaten, vooral bij een model
getraind op een kleine of laagfrequente dataset. De uitvoer door een
bandbreedte-extender laten lopen, tilt haar op zonder iets opnieuw te trainen.

Een menselijke luisteraar is het derde geval, en het eenvoudigste: een opname
waar een persoon doorheen moet luisteren, is gebaat bij helderheid, wat een
herkenner er ook van gemaakt zou hebben.

## Het engineregister

`audiosronnx` levert tien ruisonderdrukkers en zeven
bandbreedte-extenders, allemaal laadbaar op naam via `load_denoise()` /
`load_sr()`, allemaal pure ONNX zonder torch tijdens runtime.

Ruisonderdrukkers:

| Engine | Snelheid | Grootte | Licentie |
|--------|------|--------|---------|
| dpdfnet (standaard) | 8/16/48 kHz | 8.7–14.9 MB | Apache-2.0 |
| mossformer2 | 48 kHz | 229 MB | Apache-2.0 |
| frcrn | 16 kHz | 57.5 MB | Apache-2.0 |
| mpsenet | 16 kHz | 9.7 MB | MIT |
| gtcrn | 16 kHz | 0.54 MB | MIT |
| cmgan | 16 kHz | 7.8 MB | MIT |
| metadenoiser | 16 kHz | 19–34 MB | CC-BY-NC-4.0 |
| mossformergan | 16 kHz | 17.7 MB | Apache-2.0 |
| voicefixer | 44.1 kHz | 415 MB | MIT |
| deepfilternet | 48 kHz | ~2 MB | MIT |

Bandbreedte-extenders:

| Engine | Input | Grootte | Licentie |
|--------|-------|--------|---------|
| lavasr (standaard) | 8–48 kHz | ~52 MB | Apache-2.0 |
| novasr | 16 kHz | ~0.2 MB | Apache-2.0 |
| flowhigh | willekeurig | ~200 MB | MIT |
| hifiganbwe | willekeurig | ~4 MB | MIT |
| apbwe | willekeurig (12 kHz-band) | ~120 MB | MIT |
| sidon | 16 kHz | ~410 MB | MIT |
| callenhancer | 8–16 kHz | ~3 GB / ~1.3 GB int8 | CC-BY-NC-4.0 |

Het kleinste model in de bibliotheek, `gtcrn`, is 0.54 MB. De grootste,
`voicefixer`, is 415 MB — bijna 800 keer groter, en doet een ander werk:
het is een *restauratie*model dat ruis, galm, clipping en ontbrekende
bandbreedte samen behandelt in plaats van één probleem tegelijk.

De meeste gewichten zijn MIT of Apache-2.0. Twee niet: `metadenoiser` en
`callenhancer` verschijnen onder CC-BY-NC-4.0, niet-commercieel. Die
licentie dekt de gewichten, niet de audio die ermee verwerkt is, en de
bibliotheek vermeldt dat bij elk gebruikspunt — `audiosronnx list`
rapporteert het per engine. Niets weerhoudt een aanroeper ervan
`metadenoiser` te kiezen vanwege zijn architectuur in het tijddomein, maar
de keuze moet weloverwogen worden gemaakt.

Het register bestaat omdat geen enkel model wint op elke opname. `dpdfnet`
is de standaard omdat het geen extra afhankelijkheden nodig heeft en 8, 16
en 48 kHz dekt vanuit één model. `mossformer2` is de best gemeten keuze op
fullband-input. `mossformergan` post de hoogste gepubliceerde PESQ-score
(3.47) onder de geleverde ruisonderdrukkers. `gtcrn` is de keuze wanneer de
bindende beperking footprint is, op 0.54 MB. Op één testclip met
breedbandige Gaussische ruis herstelden ruisonderdrukkers 3.5 tot 5.9 dB
SNR bij een 19 dB-input-SNR, oplopend tot 7.5–13.7 dB bij een moeilijker
5 dB-input. Dat is een synthetisch, vijandig ruisgeval: het rangschikt de
engines consistent maar zegt weinig over babbelruis of codec-artefacten,
wat precies waarom het register tien modellen behoudt in plaats van alleen
de winnaar te leveren.

`cmgan` is het duidelijkste geval van een model dat expres wordt behouden
ondanks te verliezen: het wordt gedomineerd op zowel PESQ als SNR door
`gtcrn`, op veertien keer de grootte, en blijft toch — zodat gepubliceerde
resultaten gebouwd tegen `cmgan` reproduceerbaar blijven en een aparte
architectuur beschikbaar blijft om tegen te vergelijken.

Aan de kant van bandbreedte-extensie doen `sidon` en `callenhancer` ander
werk dan `lavasr` of `novasr`: in plaats van een plausibele hoge band toe
te voegen bovenop het bestaande signaal, resynthetiseren ze spraak vanaf
nul via een neurale vocoder, wat codec-schade kan herstellen die een
band-extender niet kan aanraken — tegen veel hogere rekenkosten.
`callenhancer` is specifiek getraind op telefonieaudio, wat verklaart
waarom zijn gewichten de niet-commerciële licentie dragen.

## Wat het niet heeft gehaald

`audiosronnx` levert een engine alleen wanneer hij exporteert naar één
enkele statische ONNX-graaf, draait op CPU via onnxruntime, een duidelijke
licentie draagt, en end-to-end gevalideerd is tegen de originele
implementatie — niet alleen tegen het ruwe model, want een graaf die
overeenkomt met het netwerk maar niet met de omringende normalisatie
produceert audio die goed klinkt en stilletjes fout is.

Het bestand `docs/not-shipped.md` van het project documenteert elke
kandidaat die geëvalueerd en afgewezen werd, met de specifieke reden, wat
het een van de nuttigere documenten in de repository maakt omdat het de
werkelijke grenzen laat zien van wat "pure ONNX, alleen CPU" vandaag kan
doen in plaats van ze te beweren.

### Iteratieve samplers hebben geen statische graaf om te exporteren

Diffusie- en flow-matching-modellen draaien een netwerk vele keren per
uiting, met een lus waarvan de lengte niet vaststaat op exporttijd. AudioSR
(een ongeveer 6 GB grote latente-diffusiepijplijn met een aparte VAE, LDM
en vocoder) en SGMSE vallen hier allebei onder. De eigen 2025
streaming-opvolger van SGMSE haalt real-time alleen op een consumenten-GPU,
laat staan CPU.

### Locatie-variabele convoluties zien er diskwalificerend uit en zijn dat meestal niet

`resemble-enhance` werd in dit document lang afgewezen
vanwege LVCNet, de locatie-variabele convolutie van de vocoder, op de
theorie dat kernels voorspeld per positie via `unfold` en `einsum` niet
kunnen invouwen in een statische graaf. Direct getest bleek dat onjuist:
beide operaties hebben ONNX-equivalenten. De werkelijke fout is een
aparte, goed begrepen tracefout ("ONNX export of convolution for kernel of
unknown shape") al elders in de codebase opgelost voor de
resamplers van BigVGAN. Wat `resemble-enhance` nog buiten houdt is schaal:
vier netwerken inclusief een CFM ODE-sampler en een autoencoder, op
44.1 kHz. Dat is een scope-beslissing, geen onmogelijkheid.

### Sommige modellen hebben niets getraind om te exporteren

RNNoise wordt
geleverd als handgeschreven C, geen graaf in een trainbaar framework, dus het
porten zou betekenen een equivalent netwerk vanaf nul opnieuw trainen.
Fast-ULCNet publiceert alleen architectuurcode, geen checkpoint helemaal.

### Een restrictieve licentie is een etiketteringsbeslissing, geen automatische diskwalificatie

Precies daarom worden `callenhancer` en
`metadenoiser` geleverd. Wat *wél* diskwalificerend is, zijn gewichten
gepubliceerd zonder enige licentie: mdctGAN werd om precies die reden
afgewezen, bovenop een op `torch.fft` gebaseerde front-end die niet
betrouwbaar exporteert.

### Een `torch.stft` die intern in het model wordt aangeroepen is een werkelijke structurele blokkade

De samplerlus van NU-Wave2 is niet het
probleem; die zou buiten de graaf in numpy kunnen draaien, zoals de STFT
van elke andere engine dat doet. Wat blokkeert is dat zijn `forward`-methode
intern `torch.stft` en `torch.istft` aanroept, wat de bibliotheek bewust
buiten elke graaf houdt die ze levert, en dat is ook de operator die in het
algemeen het minst betrouwbaar exporteert. Het fixen zou betekenen het
model splitsen op de transformatiegrens, echte herstructurering in plaats
van een operatorwissel.

### De architectuur van een model reproduceren is niet hetzelfde als de output ervan reproduceren

LiSenNet heeft 56K parameters, onder 300 KB,
wat het de kleinste engine in de bibliotheek zou maken. De publiek beschikbare
ONNX-port ervan draait en produceert plausibel ogende gedempte audio, maar
end-to-end gemeten vernietigt het het signaal: −10.8 dB SNR bij 11 dB
input. De eigen referentie-implementatie van de port exact reproduceren
geeft hetzelfde identieke negatieve resultaat, wat betekent dat de
referentie-implementatie zelf niet overeenkomt met de front-end die zijn
eigen documentatie beschrijft. Er is nog geen correcte target om tegen te
valideren.

Deze afwijzingen gaan zelden over grootte of snelheid. Elke afwijzing heeft
een specifieke, nauw omschreven oorzaak: een niet-ondersteunde operator met een exacte vervanging
(`torch.complex` heeft geen ONNX-operatie, maar `atan2(im, re)` berekent
dezelfde fasehoek), een tensor gebouwd uit de runtime-vorm van een input
die een tracer niet kan vastpinnen, of een transformatie geplaatst aan de
verkeerde kant van een graafgrens.

## Bevestigen dat de output daadwerkelijk beter werd

Een ONNX-bestand dat draait is geen bewijs dat een opname verbeterde. Twee
verschillende faalmodi zien er van buitenaf identiek uit: een
ruisonderdrukker die spraak dempt samen met de ruis, en een
bandbreedte-extender die een hoge band toevoegt met de verkeerde
harmonische inhoud, produceren allebei audio die probleemloos afspeelt en
zelfs schoner kan klinken bij een terloopse luisterbeurt.

De zusterbibliotheek `speechonnxmetrics` verandert dat oordeel in een getal
in plaats van een indruk. Ze scoort audio op **MOS** (Mean
Opinion Score, een 1-5-beoordeling van waargenomen kwaliteit) op twee
manieren: no-reference neurale voorspellers zoals DNSMOS en UTMOS, die een
opname scoren zonder schoon origineel om mee te vergelijken, en intrusieve
metrieken zoals STOI en SI-SDR, die de schone referentie nodig hebben en
meten hoe dicht de output er daadwerkelijk bij komt.

```python
import speechonnxmetrics as s

s.score("clean.wav", ["utmos"])
# -> {'utmos': 4.41}

s.score("denoised.wav", ["stoi", "si_sdr"], ref="clean.wav")
# -> {'stoi': 0.66, 'si_sdr': -26.9}
```

Voor en na een ruisonderdrukker of extender uitvoeren laat de vorm van een
echte vergelijking eruit vallen: DNSMOS of UTMOS op de ruwe en verwerkte
audio om te zien of de waargenomen kwaliteit überhaupt bewoog, en — wanneer
er een schone referentie bestaat, wat het geval is voor synthetische
ruistests maar zelden voor een echt telefoongesprek — SI-SDR of STOI om te
zien of het verwerkte signaal er daadwerkelijk naartoe convergeerde in
plaats van gewoon anders te klinken. Dat is dezelfde discipline achter de
SNR-cijfers in de ruisonderdrukkertabel hierboven: een getal gekoppeld aan
een specifieke ruisconditie, geen bijvoeglijk naamwoord. De bredere familie
van pure-ONNX-spraakbibliotheken waarin dit past, inclusief
`speechonnxmetrics` zelf, wordt behandeld in
[A Family of Pure-ONNX Speech Libraries](/nl/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries).

Audio opschonen voor een trainingscorpus, voor een gesynthetiseerde stem, of
voor iemand die ernaar moet luisteren, is een op zichzelf staand
engineeringprobleem, met zijn eigen afwegingen tussen modellen en zijn eigen
lijst van benaderingen die het contact met een echt signaal niet overleefden.

Vragen over de toepassing hiervan op een specifieke pijplijn:
[neem contact op](/nl/contact).
