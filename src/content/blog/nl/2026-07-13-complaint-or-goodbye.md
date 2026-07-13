---
title: "Je sentimentmodel kan een klacht niet onderscheiden van een afscheid"
description: "Twee boos ogende supportberichten. De ene klant staat op escaleren; de andere is weg zonder een woord. Bijna geen enkel emotiemodel kan ze uit elkaar houden — omdat ze allemaal dezelfde as missen. Maak kennis met emotion-algebra."
date: 2026-07-13
lang: nl
author: "Casimiro Ferreira"
tags:
  - "Affective Computing"
  - "Emotion"
  - "Machine Learning"
  - "LILACS"
  - "Open Source"
  - "Science"
draft: false
---

Twee berichten komen binnen in je supportwachtrij.

> "Dit is de derde keer dat jullie app mijn werk kwijtmaakt. Fix het."

> "Ik weet niet of ik het goed doe en ik ben bang dat ik iets stuk heb gemaakt."

Stuur ze door elk sentimentmodel dat je maar wilt. Beide komen hetzelfde uit:
**negatief, hoge arousal**. Boos ogend. Van streek.

Dus je behandelt ze hetzelfde — en je hebt zojuist een fout gemaakt, want deze
twee mensen hebben het tegenovergestelde nodig.

De eerste is *woedend*, en woedende mensen zijn *betrokken*. Ze geloven dat ze een
oplossing kunnen afdwingen, en ze blijven doorgaan totdat ze die krijgen. Stuur ze
een warm excuses en een belofte om het uit te zoeken, en je maakt ze nog kwaader.

De tweede is *bang*. Ze denken niet dat ze iets kunnen fixen. Eén slecht antwoord
en ze sluiten het tabblad en komen nooit meer terug — stil, zonder je ooit te
vertellen waarom. Stuur ze een ticketnummer en een venster van vijf dagen, en je
bent ze kwijt.

De een is een klacht. De andere is een afscheid. En bijna niets in de toolbox van
emotie-AI kan je vertellen welke welke is.

We hebben er even over nagedacht waarom. Het antwoord bleek interessanter dan
verwacht, en het eindigt met een neuraal netwerk getraind op een miljard tweets
die het eens is met een psychologisch artikel uit 1985 dat het nooit heeft gelezen.

## De ontbrekende dimensie

Dit is het met woede en angst: **ze zijn bijna identiek, gemeten op de gebruikelijke
manier.**

Beide voelen slecht. Beide zijn sterk geactiveerd — je hartslag gaat sowieso omhoog.
Die twee eigenschappen, "hoe goed voelt het" en "hoe opgewonden ben je", zijn de twee
dimensies waarop bijna elk emotiemodel is gebouwd. Meestal heten ze *valentie*
en *arousal*.

Woede en angst zitten bovenop elkaar in die ruimte. Elk model gebouwd op die twee
getallen kan ze niet scheiden, hoe geavanceerd ook, omdat de informatie er simpelweg
niet is.

Wat ze daadwerkelijk scheidt is een derde ding: **voel je je in staat om er iets aan
te doen?**

Woede is wat je voelt als iets mis is *en je kunt handelen*. Angst is wat je voelt
als iets mis is *en je kunt niet*. Dat gevoel van controle — psychologen noemen het
*coping potential* of *potentie* — is het volledige verschil. Het vertelt je ook of
iemand zal vechten of vluchten, escaleren of verdwijnen.

Het is geen marginaliteit. **Vier onafhankelijke onderzoeksprogramma's** kwamen er
apart op uit over twee decennia, en een van hen (Lerner & Keltner, 2001) demonstreerde
het *causaal*: boze mensen maken optimistische, risicotolerante oordelen terwijl
bangen mensen pessimistische, risicomijdende maken — en het effect loopt door controle
en zekerheid, niet door hoe slecht ze zich voelen.

Hun meest opvallende bevinding is de moeite waard om bij stil te staan. **De oordelen
van boze mensen lijken op die van gelukkige mensen.** Niet op die van bange mensen.
Woede en geluk hebben tegenovergestelde valentie, en dat doet er niet toe, want
valentie is niet wat het werk doet.

Waarom komt die as dan niet voor in de tools?

## Waarom de as verdwenen is

De meeste emotietools gaan terug op een klein aantal theoretische modellen. De twee
meest invloedrijke zijn **Plutchiks Wiel van Emoties** (1980) en, daarop gebouwd,
**Cambria's Zandloper van Emoties** (2012), het model achter SenticNet.

Plutchiks wiel is een prachtig voorwerp. Het is gevormd als een kleurenwiel, en het
draagt de centrale gedachte van het kleurenwiel over: emoties komen in ** tegenovergestelde
paren**. Vreugde staat tegenover verdriet. Vertrouwen staat tegenover afkeer. En woede
staat tegenover angst.

Dat laatste is het probleem, en als je het eenmaal ziet, kun je het niet meer
ontzien.

Als woede en angst tegenovergestelde uiteinden van één as zijn, dan heffen ze elkaar
op. Neem de meest intense woede die iemand kan voelen, meng het met de meest intense
terror, en vraag het model wat je krijgt:

```
(rage + terror) / 2  ==  neutrality
```

**Kalm.** Meng de twee meest gewelddadige negatieve toestanden waar een mens toe
in staat is, en het model meldt dat je helemaal niets voelt.

Dat is geen bug in een implementatie. Het is een direct gevolg van de geometrie —
en het betekent dat het model precies datgene heeft weggegooid wat we nodig hadden.
Door woede en angst *tegenovergesteld* te maken, garandeert het dat ze nooit *uit
elkaar kunnen worden gehouden*.

Overigens weet het wiel dit half. De Zandloper heeft een formule voor het scoren
van sentiment, en in die formule is de woede–angst-as gewikkeld in een absolute
waarde: **beide uiteinden tellen als onaangenaam**. Dat klopt ook! Woede en angst
zijn allebei onaangenaam. Maar het contradictie zachtjes de geometrie die ze aan
 tegenovergestelde polen plaatste. De eigen rekenkunde van het model is het niet
eens met zijn eigen diagram.

## Wat de literatuur eigenlijk zegt

Op dit punt stopten we met het schrijven van code en gingen we de literatuur lezen,
en het waren geen comfortabele dagen.

Plutchiks structuur van tegenovergestelde paren is getest. In 2009 lieten Smith &
Schneider het door meer dan tweeduizend statistische tests lopen en concludeerden dat
de theorie van het emotiewiel "geen empirische steun ontvangt." De tegenovergestelde
paren zijn een elegante metafoor ontleend aan de kleurentheorie. Het zijn geen
bevindingen over mensen.

Ondertussen repliseren de dingen die *wel* repliseren — Russells valentie–arousal
circumplex, en de controledimensie die woede van angst scheidt — precies die stukken
die zelden in werkende software belanden.

Er is hier een probleem van de tweede orde, en het is datgene dat ons daadwerkelijk
verontrustte. Elk van deze modellen is *bruikbaar*. Ze zijn levendig, ze zijn
leerbaar, ze passen op een slide. Dus worden ze herhaald — en zodra een model vaak
genoeg is herhaald, begint het controleren van de herkomst te voelen als
muggenziften in plaats van zorgvuldigheid. Zo wordt een metafoor zachtjes een
fundering.

## Bouwen op wat overleeft

Dus bouwden we [**emotion-algebra**](https://github.com/TigreGotico/emotion-algebra),
en plaatsten de ontbrekende as in het midden.

De kern heeft vijf getallen: hoe goed het voelt, hoe slecht het voelt (ja, apart —
daar komen we op terug), hoe in controle je je voelt, hoe geactiveerd je bent, en hoe
onverwacht het allemaal is. Die komen van Fontaine en collega's (2007), die ze
afleidden uit 144 gemeten kenmerken verspreid over culturen, niet uit een aantrekkelijk
diagram.

Nu gedraagt de mengsel zich zoals het hoort:

```python
from emotion_algebra import prototype, dominant

dominant(prototype("anger").blend(prototype("fear"), 0.5))
# 'distress'
```

Niet "kalm." **Nood** — diep onaangenaam, sterk geactiveerd, met het gevoel van
controle opgeheven. Precies wat een mengsel van woede en terror zou moeten voelen.

En de supportwachtrij werkt:

```python
from emotion_algebra import affect_from_texts

angry, afraid = affect_from_texts([
    "This is the third time your app has lost my work. Fix it.",
    "I don't know if I'm doing this right and I'm scared I've broken something.",
])

angry.valence,  angry.potency    # -0.43, +0.16   -> 'annoyance'
afraid.valence, afraid.potency   # -0.47, -0.43   -> 'apprehension'
```

Kijk naar die getallen. **De valentie is nagenoeg identiek** — beide berichten zijn
ongeveer even onaangenaam, en daarom ziet een conventioneel sentimentmodel één ding.
De *potentie* is tegenovergesteld. De ene persoon voelt zich in staat om te handelen;
de andere niet.

Daar heb je je klacht, en daar heb je je afscheid.

## De test die het had kunnen doden

Dit is wat ons zorgen baarde. Al het bovenstaande rust op de psychologische literatuur,
en die literatuur is bijna volledig gebouwd op **vragenlijsten** — mensen die woorden
beoordelen op een schaal van 1 tot 9. Vragenlijsten hebben een onaangename eigenschap:
ze kunnen zachtjes een theorie *encoderen* in plaats van die te testen. Als iedereen
die emotievragenlijsten schrijft hetzelfde schoolboek heeft geleerd, zullen de
vragenlijsten het eens zijn met het schoolboek, en zal iedereen zich erg bevestigd
voelen.

We wilden een getuige zonder enige theoretische opleiding.

**DeepMoji** is een neuraal netwerk dat is getraind op **1,2 miljard tweets** om te
raden met welke emoji een bericht eindigde. Dat is werkelijk alles wat het doet. Het
heeft nog nooit van Plutchik gehoord, of van beoordelingstheorie, of van coping
potential. Het heeft helemaal geen mening over emoties — het heeft alleen een extreem
goed gevoel voor hoe mensen *werkelijk schrijven* als ze dingen voelen.

Dus stelden we het de enige vraag die ertoe deed:

> Kun je woede van angst onderscheiden? En zo ja — wat gebruik je daarvoor?

**Het kan.** Gegeven echte menselijke reacties gelabeld door echte mensen, scheidt het
woede van angst ver boven toeval. (Door de labels te schrappen verdwijnt het vermogen
volledig, dus het is geen artefact van onze methode.)

Toen keken we naar *hoe*. We namen de richting die DeepMoji gebruikt om de twee uit
elkaar te houden, en maten hoe sterk die overeenkomt met elk van onze vijf assen.

Hij komt overeen met **potentie** — drie keer sterker dan met iets anders. Niet
valentie. Niet arousal.

Een model getraind op een miljard tweets, dat nooit is verteld dat woede een gevoel
van controle omvat en angst het ontbreken ervan, grijpt precies naar dat onderscheid
als je het moet kiezen. Het vond de as zelf.

Dat is het meest overtuigende wat we hebben, en we willen duidelijk maken dat het de
andere kant op had kunnen gaan. Als DeepMoji woede en angst had gescheiden op basis
van valentie, of ze helemaal niet had gescheiden, dan was onze derde as een artefact
van de psychologische literatuur geweest en hadden we dat moeten zeggen.

## Bitterzoet, en andere dingen die één getal niet kan vasthouden

Nog een gevolg, want het is een mooi.

We dragen "hoe goed het voelt" en "hoe slecht het voelt" als **twee afzonderlijke
getallen**, niet als één score van negatief tot positief. Dat klinkt als een
technisch detail. Is het niet.

Mensen voelen zich echt goed en slecht tegelijk. De klassieke studie gebruikt de
diploma-uitreiking: studenten rapporteren echte blijdschap en echte verdriet
*gelijktijdig*, niet een lauwig gemiddelde van de twee. Een enkele valentiescore is
wiskundig niet in staat om dat weer te geven. Hij moet melden "licht gelukkig," en
dat is niet wat iemand daar voelt.

Twee kanalen kunnen het wel vasthouden. Dat betekent dat het model de overwinning
tegen wil en dank, het liefdevolle afscheid, de klant die opgelucht is *en* nog steeds
woedend kan representeren. Dat zijn de interessante emoties, en het zijn diegene die
één getal platdrukt.

## Emoties voor de andere kant

Alles tot nu gaat over het lezen van een mens. Dezelfde machinerie draait achteruit,
om een personage een eigen emotioneel leven te geven.

Een emotie hier is een *verplaatsing* — je bent weggeduwd van waar je normaal zit,
en in de loop van de tijd drijf je terug. De plek waar je naar terugdrijft is geen
nul. Er bestaat zoiets niet als "geen emotie"; zelfs in rust ben je ergens, en dat
ergens is licht aangenaam, kalm, en licht in controle. (Dat lichte positieve
scheefje is waarom een wezen in rust iets gaat *verken* in plaats van inert te
blijven zitten. Het is een echt, gemeten effect.)

Dus een bewaker die net iets angstaanjagends heeft gezien keert niet terug naar
neutraal wanneer een timer afloopt. Hij daalt erdoorheen:

```
terror → fear → apprehension → pensiveness → acceptance
```

Angst, dan voorzichtigheid, dan een soort stille piekering, en uiteindelijk is hij
weer prima. We hebben die sequentie niet voorgeschreven; hij valt uit de geometrie.

En twee bewakers kunnen verschillen omdat ze naar *verschillende* rustplaatsen
toevoegen. Geef de ene een iets lagere baseline-gevoel van controle en de gewoonte om
slecht nieuws twee keer zo hard te nemen, en hij wordt herkenbaar angstig — schrikt
meer, herstelt langzamer, piekert langer. Dat is een personage, en het zijn vier
getallen in plaats van een gedragboom.

Dan het nuttige deel: wat *doet* hij? Dat komt ook van de controledenas. De boze
bewaker valt je aan. De bange bewaker rent. "Negatieve emotie" kan niet kiezen
tussen die twee, en dat kon het nooit.

## Het deel waarin we je vertellen wat er mis mee is

Elk model in de bibliotheek draagt een **gradering** en een citatie — van
`ESTABLISHED` (gerepliceerd, crosscultureel, meta-analytisch) tot `METAPHOR` (een
mooi diagram dat de test niet overleefde).

Plutchiks wiel zit erin, gegradeerd als `METAPHOR`, en het werkt nog steeds precies
zoals Plutchik het especificatie — `-anger` geeft nog steeds `fear`, want dat is wat
zijn model zegt. Zijn rekenkundig wordt trouw geïmplementeerd, *en* zijn model klopt
niet over mensen. Beide dingen zijn waar, en we vertellen je liever allebei dan dat
we er één uitkiezen.

We zijn eveneens bot over onze eigen tekortkomingen:

**Arousal uit tekst lezen is onopgelost.** We kunnen valentie krijgen, we kunnen
potentie krijgen — we kunnen niet betrouwbaar zeggen hoe *opgewonden* iemand is
op basis van diens woorden. Ons beste getal is slecht. We leveren het met het label
slecht in plaats van zachtjes te hopen dat je het niet controleert.

**Eén van onze eigen bevindingen is voorlopig.** Het "gevoel van controle" dat
woede *veroorzaakt* en het "gevoel van controle" dat mensen *rapporteren terwijl ze
boos zijn* blijken niet hetzelfde te zijn — je voelt je minder in controle middenin
je woede dan de theorie zou voorspellen. Je humeur verliezen is uiteindelijk
*controle verliezen*. We vinden dat belangrijk. We vinden ook dat ons bewijs daarvoor
dun is, en we hebben het dienovereenkomstig gemarkeerd.

## Waarom we ons de moeite getroosten

Een emotiebibliotheek die zachtjes dingen beweert die het bewijs tegenspreekt is
erger dan nutteloos. Het is *zelfverzekerd* nutteloos — en alles wat erop wordt
gebouwd erft de fout, stil, voor altijd.

We leveren liever iets dat je vertelt hoeveel vertrouwen je elk van zijn eigen
onderdelen kunt geven.

```bash
pip install emotion-algebra
```

De [documentatie](https://github.com/TigreGotico/emotion-algebra) heeft een
vijfminuten-snelstart, een gids om een agent een emotioneel leven te geven, en de
volledige bewijstabel met elke citatie erin. Als je denkt dat een van onze
graderingen fout is, staat de bronbron klaar om mee te discussiëren — en we willen
het echt horen.

Ondertussen: ergens in je supportwachtrij zit iemand stil een afscheid te
schrijven. Het zou goed zijn om te weten wie het is.
