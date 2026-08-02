---
title: "Porten met machines, en de licentievraag die we niet konden beantwoorden"
description: "We herschreven meerdere C-, C++- en Java-programma's — de G2P van espeak-ng, Cotovia, AhoTTS, HermiT — als puur Python, met een AI die de originele bron las en een mens die orkestreerde. Dat roept twee vragen op: kan de output überhaupt bezit zijn, en is het een afgeleid werk? We behielden de upstream-licenties omdat dat goedkoper was dan antwoorden."
date: 2026-08-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "FOSS"
  - "Licensing"
  - "Open Source"
  - "Python"
  - "G2P"
draft: false
---

We hebben een handvol oude programma's herschreven in Python. De G2P-front-end
van [espeak-ng](https://github.com/espeak-ng/espeak-ng), de Galicische en
Spaanse transcriptieregels van
[Cotovia](https://gtm.uvigo.es/en/transfer/software/cotovia/), de Baskische
taalverwerking van [AhoTTS](https://github.com/aholab/AhoTTS), de
[EYE](https://github.com/eyereasoner/eye) N3-redeneerder, en de OWL 2
DL-redeneerder [HermiT](http://www.hermit-reasoner.com/). C, C++ en Java, de
meeste ouder dan een decennium, allemaal nog steeds het beste wat er is voor
wat ze doen.

Het motief was gewoon. Een C-programma dat Galicisch fonemiseert is
uitstekend totdat je het in een Python-spraakstack op een ARM-bordje wilt
draaien. Dan heb je een compiler nodig, een toolchain, cross-compilatie, een
verpakkingsverhaal per platform, en een subprocesgrens waarover je tekst
moet marshalen. Een Java-redeneerder heeft een JVM nodig. Puur Python heeft
alleen `pip install` nodig. Het leest ook zo: je kunt het bestand openen dat
bepaalt waar de klemtoon valt en het aanpassen, zonder te weten hoe het
originele buildsysteem werkt.

De ports zijn semi-autonoom uitgevoerd. Een AI las de originele bron en
schreef de Python; een mens leidde het werk en controleerde de output tegen
de originele binary. Bij verschillende ervan heeft niemand aan onze kant ooit
de originele bron gelezen. Het model las hem. Wij lazen de diffs en de
pariteitstests.

Dat laat een vraag over waarover we een beslissing moesten nemen, en die we
niet konden beantwoorden: **is het resultaat een afgeleid werk, en van wie is
het?**

We zijn ingenieurs. Niets hier is juridisch advies, en we zijn niet
gekwalificeerd om dat te geven. Dit is een beschrijving van een beslissing
die we namen en de redenering erachter.

## Twee vragen die steeds door elkaar worden gehaald

Een programma herimplementeren door de broncode te lezen is niet nieuw.
Mensen herschrijven C in Python sinds er Python bestaat. Wat nieuw is, is de
opzet: de lezer is een machine, de implementeerder is dezelfde machine, en de
mensen in de lus hebben het origineel nooit gezien.

Er zijn hier twee vragen, en bijna elke discussie hierover laat ze in elkaar
overvloeien. Ze zijn onafhankelijk.

1. **Kan de output überhaupt bezit zijn?** Auteursrecht hecht zich aan
   werken met auteurs. Als een machine de code produceerde, wie is dan de
   auteur?
2. **Is de output een afgeleide van de input?** Wie het ook auteurde — als
   iemand dat deed — schendt het resultaat het origineel?

Je kunt op de ene vraag ja antwoorden en op de andere nee, in beide
richtingen. Houd ze gescheiden.

Wat vocabulaire, aangezien de rest hiervan ervan afhangt. Een **afgeleid
werk** is een werk gebaseerd op een reeds bestaand werk — een vertaling, een
bewerking, een port. Het recht om er een te maken behoort toe aan de
auteursrechthebbende van het origineel. **Copyleft**-licenties (de
GPL-familie) laten je de code gebruiken en aanpassen op voorwaarde dat wat je
distribueert onder dezelfde voorwaarden blijft. **Permissieve** licenties
(MIT, Apache-2.0, BSD) laten je vrijwel alles doen, inclusief het resultaat
in proprietaire software verwerken. De **LGPL** zit ertussenin: copyleft
geldt voor de bibliotheek zelf, maar deze linken in een groter programma
dwingt dat programma niet open. Ze zijn allemaal gebouwd op auteursrecht. Ze
bijten alleen als er auteursrecht is om te handhaven.

## Vraag één: is er een auteur?

Auteursrecht vereist een menselijke auteur. Het Amerikaanse Copyright Office
heeft dit consequent volgehouden, en in *Thaler v. Perlmutter* stemde het
D.C. Circuit daarmee in: de Copyright Act "vereist dat elk in aanmerking
komend werk in eerste instantie door een mens is geauteurd" (No. 23-5233,
D.C. Cir., 18 maart 2025; het Hooggerechtshof weigerde certiorari in maart
2026). De Europese norm heeft een andere vorm en komt op een vergelijkbare
plek uit — bescherming vereist "de eigen intellectuele schepping van de
auteur", wat een auteur veronderstelt die schept.

Geen van beide zegt dat AI-ondersteund werk onbeschermbaar is. Beide zeggen
dat wat de machine op eigen houtje genereerde dat wel is. De lijn loopt door
het werk heen, niet eromheen, en waar hij precies valt hangt af van hoeveel
een mens heeft bijgedragen. In onze ports is de menselijke bijdrage reëel
maar dun: het doel kiezen, het pakket structureren, de pariteitsfouten
beoordelen. Het is niet vanzelfsprekend dat dit ons de auteur maakt van de
transcriptieregels.

Dat levert een lastig object op. Een licentie is een toestemming verleend
door een rechthebbende. Als niemand rechten heeft op de output, is het
licentiebestand aan de root van de repository decoratie. Merk op waar dat
argument naartoe leidt: het vreet eerst je eigen licentie op. Iedereen die
beweert dat machinaal gegenereerde code niemand toebehoort, beweert dat hun
eigen releasevoorwaarden niet afdwingbaar zijn, nog voordat ze bij de
upstream in de buurt komen.

## Vraag twee: is het afgeleid?

Deze kwestie interesseert zich niet voor wie de auteur is. Inbreuk draait om
toegang tot het origineel plus wezenlijke gelijkenis met de beschermde
**expressie** ervan — de specifieke manier waarop het geschreven is, niet
wat het doet.

We hadden toegang. Het model las de bron. Dat deel staat niet ter discussie.

De gelijkenishelft is waar het interessant wordt, en waar de taalverandering
minder uitmaakt dan mensen verwachten. Een roman vertalen naar een andere
taal produceert een afgeleid werk; dat is het schoolvoorbeeld. Van taal
veranderen weerlegt een claim van letterlijk kopiëren. Het weerlegt geen
claim over structuur — de volgorde van de transformaties, de opsplitsing in
functies, de vorm van de regeltabellen, de manier waarop de randgevallen
zijn uitgesneden.

Het is ook de moeite waard om het gewoon te zeggen: een tool wast niets wit.
Als je een kopie aanstuurt en het resultaat verzendt, ben jij degene die het
gemaakt heeft. "Het model schreef het" is geen verweer, net zomin als "de
compiler zond het uit" dat zou zijn.

## Het sterkste argument aan de andere kant

Er is een serieus argument dat een cross-language herimplementatie in orde
is, en het verdient om correct uiteengezet te worden in plaats van
weggewuifd.

In *SAS Institute v World Programming* (HvJEU, C-406/10, 2 mei 2012)
oordeelde het Hof dat "noch de functionaliteit van een computerprogramma,
noch de programmeertaal en het formaat van gegevensbestanden die in een
computerprogramma worden gebruikt om bepaalde functies ervan te benutten,
een vorm van uitdrukking van dat programma vormen". Ze zijn dus niet
beschermd door auteursrecht. De Softwarerichtlijn (2009/24/EG, artikel
1(2)) zegt hetzelfde over de ideeën en beginselen die aan enig element van
een programma ten grondslag liggen. Het Hof oordeelde ook dat een licentiehouder
het gedrag van een programma mag bestuderen en observeren om de ideeën
erachter te bepalen, en die mag herimplementeren.

Dat is geen technisch detail. Het betekent dat wat een fonemizer *doet* —
deze grafeemreeks wordt, in deze context, dat foneem — niemand toebehoort.
De Galicische klemtoonregels zijn feiten over het Galicisch. De OWL 2
directe semantiek is een gepubliceerde W3C-specificatie. Onder die lezing is
een herimplementatie die gedrag reproduceert en geen expressie rechtmatig,
en een herschrijving over talen heen staat veel verder van inbreuk dan een
copy-paste.

De kloof tussen dat argument en onze situatie is de bron. *SAS* gaat over
het bestuderen van gedrag. Ons model las de code.

## Het precedent dat al bestaat, en hoever het reikt

Het argument "machine-output heeft geen auteur, dus er hangt geen
auteursrecht aan vast" is geen gedachte-experiment. Het is dragend in de
praktijk, in de hele industrie. Modeldistillatie en synthetische
trainingsdata rusten er beide op.

De duidelijkste publieke verklaring ervan is
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), een veelgebruikt
open TTS-model. De modelkaart zegt dat het uitsluitend getraind is op
permissieve of niet-auteursrechtelijk beschermde audio, en noemt onder de
toegestane bronnen:

> Synthetic audio generated by closed TTS models from large providers

met een voetnoot die verwijst naar de
[AI-beleidsrichtlijnen](https://copyright.gov/ai/ai_policy_guidance.pdf) van
het Amerikaanse Copyright Office. De redeneerketen is dezelfde als
hierboven: de audio werd door een machine gegenereerd, machine-output heeft
geen menselijke auteur, dus er bestaat geen auteursrecht op, dus er is niets
om te schenden door erop te trainen. Het model verschijnt onder Apache-2.0.
De kaart trekt ook een grens — het sluit synthetische audio van *open*
TTS-modellen en van aangepaste stemklonen uit — een teken dat de auteurs
hebben uitgezocht waar het argument ophoudt in plaats van het overal op toe
te passen.

Hier is het deel dat ertoe doet voor porten. **Dat precedent lost de andere
helft van het probleem op.**

Het argument van Kokoro gaat over de **input**. Wat zij consumeerden was
zelf machinaal gegenereerd, dus de claim is dat het bij aanvang geen
auteursrecht droeg. Niet-auteursrechtelijk beschermd erin, dus niets om te
erven.

Onze situatie is het spiegelbeeld. Wat wij consumeerden — de C van
espeak-ng, de C++ van Cotovia, de Java van HermiT — is ondubbelzinnig door
mensen geschreven en auteursrechtelijk beschermd, door met naam genoemde
mensen, aan met naam genoemde universiteiten, decennia geleden. Wat er
*uitkwam* was machinaal geschreven. Het argument "geen auteursrecht op
AI-output" landt op onze output, niet op onze input. Het reikt niet
stroomopwaarts. Het is, opnieuw, het argument dat onze eigen licentie
ondermijnt terwijl het de rechten van de upstream volledig onaangetast
laat.

Er is nog een asymmetrie die het noemen waard is. De resterende
blootstelling van Kokoro is niet echt auteursrecht — het is **contract**.
Gesloten providers' gebruiksvoorwaarden verbieden doorgaans het gebruik van
hun output om concurrerende modellen te trainen, en een voorwaarde waarmee
je hebt ingestemd verdampt niet omdat de output achteraf niet-beschermbaar
bleek. Copyleft werkt niet zo. Niemand klikt "Ik ga akkoord" voor de GPL.
Het is een eenzijdige toekenning van toestemming, en het bindt je alleen als
je die toestemming nodig hebt — dat wil zeggen, alleen als wat je maakte een
afgeleid werk is.

Dus valt het geheel terug op de ene vraag die niemand heeft beantwoord. Als
een cross-language, machinaal geschreven herimplementatie geen afgeleid werk
is, was de GPL nooit geactiveerd en gold er niets. Als het er wel een is,
gold de GPL vanaf de eerste regel. Er is geen derde toestand, en geen
hoeveelheid discussie over AI-auteurschap verschuift die specifieke naald.

## Cleanrooms, en of twee modellen er één maken

Het klassieke antwoord op precies dit probleem is het cleanroom-protocol, en
het is de moeite waard het precies te beschrijven omdat de vorm ervan
ertoe doet.

Eén team leest het origineel en schrijft een functionele specificatie: wat
het programma doet, in gedragstermen. Een tweede team, dat het origineel
nooit heeft gezien, implementeert alleen vanuit die specificatie. De output
van het tweede team is aantoonbaar niet gekopieerd van expressie die het
nooit zag. Zo is de pc-BIOS herimplementeerd, en daarom heeft die
herimplementatie overleefd.

De voor de hand liggende moderne zet is één model laten lezen en
beschrijven, en een ander model met een verse context laten implementeren.
Structureel is dat hetzelfde protocol. Is het een cleanroom?

Het heeft de juiste vorm. Maar een cleanroom is geen technische constructie
— het is een **bewijsrechtelijke**. De hele waarde ervan is achteraf de
scheiding te kunnen aantonen, aan iemand die aanneemt dat je vals speelde.
De tweemodelversie betekent dus alleen iets als de discipline helemaal
standhoudt:

- De twee kanten delen echt nooit context. Niet "we zeiden dat het moest
  vergeten" — aparte runs, aparte transcripten.
- De specificatie draagt gedrag en niets anders. Geen pseudocode die de
  controlestroom van het origineel weerspiegelt. Geen identifiernamen. Geen
  functievolgorde. Dat is expressie, en een specificatie er vol mee is het
  origineel in vermomming.
- Beide kanten houden hun logboeken bij, want een cleanroom die je niet kunt
  bewijzen is een verhaal.

Als de leeskant structuur uitzendt, gaat de besmetting er recht doorheen en
heb je een afgeleid werk met extra stappen en een grotere tokenrekening.

Dat hebben we niet gedaan. Het implementerende model las de bron direct.
Daarom staat er in het pycotovia-README, in de repository, publiekelijk:

> Because the implementing AI **read the GPL source**, this is **not a
> clean-room reimplementation** and we make no such claim. It is a
> source-derived port.

We hebben liever dat die zin is opgeschreven dan er later op te moeten
antwoorden.

## Wat we deden

We behielden de upstream-licenties.

[espyak](https://github.com/TigreGotico/espyak) is GPL-3.0-or-later, in
overeenstemming met espeak-ng. Dat is niet eens een moeilijk geval: het
pakket bundelt espeak-ng's eigen datafiles woordelijk — `dictsource`,
`phsource`, `lang` — en geen enkele theorie van auteurschap raakt bestanden
die we ongewijzigd hebben gekopieerd. De data van de upstream zit in de
wheel, dus de licentie van de upstream komt erbij.

[pycotovia](https://github.com/TigreGotico/pycotovia) is GPL-3.0, in
overeenstemming met Cotovia (GPL-3.0+).
[ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) en
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa)
zijn GPL-3.0, in overeenstemming met AhoTTS, wiens licentiebestand GPL-3.0+
aangeeft voor de taalverwerking.
[pyeye](https://github.com/TigreGotico/pyeye) is MIT, in overeenstemming met
EYE. Copyleft erin, copyleft eruit; permissief erin, permissief eruit.

We deden dat niet omdat we hadden vastgesteld dat het verplicht was. We
deden het omdat de asymmetrie de beslissing nam zonder dat het antwoord
nodig was.

We publiceren toch open source. Copyleft kost ons vrijwel niets — de enige
echte kost is het geval waarin een klant de code binnen iets proprietairs
wil, en voor deze specifieke bibliotheken is dat geval zeldzaam. Dus
copyleft zijn terwijl dat strikt genomen niet nodig was, kost ongeveer nul.

De andere fout is niet symmetrisch. Een permissieve licentie op iets
plaatsen dat copyleft had moeten zijn, is een probleem dat pas laat wordt
ontdekt, publiekelijk, door iemand anders, nadat andere mensen erop hebben
voortgebouwd onder voorwaarden die je niet gerechtigd was aan te bieden. Dat
terugdraaien betekent elke stroomafwaartse gebruiker contacteren.

Die asymmetrie is ook waarom het de moeite waard is deze mismatch in het
algemeen in de gaten te houden. Een structurele port van een LGPL-origineel
kan niet zomaar Apache-2.0 worden door herschreven te zijn in een andere
taal — en dat is precies het soort mismatch dat makkelijk te maken en
moeilijk op te merken is, want niets klaagt. De build slaagt. De tests
slagen. De licentiekop is maar een bestand. HermiT is LGPL, dus de licentie
van onze Python-port ervan is een van de gevallen die we herzien — wat de
alledaagse, correcte uitkomst is: je controleert, en je fixt wat gefixt
moet worden.

Onder een zo scheve asymmetrie hoef je de juridische vraag niet op te lossen
om de beslissing te nemen. Je neemt gewoon de tak waar fout zitten
overleefbaar is.

## Dezelfde vraag, in de andere richting

Alles hierboven gaat over code die wij produceren. Dezelfde logica geldt
identiek voor code die we ontvangen. Iemand opent een pull request tegen een
van onze repositories. De patch is geschreven door een model. Wat verlenen
ze ons?

De meeste projecten regelen dit met de
[Developer Certificate of Origin](https://developercertificate.org/) — de
DCO, de `Signed-off-by:`-regel onderaan een commitbericht. Het is een korte
verklaring waartoe de bijdrager zich verklaart bij het ondertekenen: dat hij
de bijdrage zelf heeft gecreëerd, of dat ze afkomstig is van een bron onder
een compatibele licentie en hij het recht heeft ze in te dienen onder de
voorwaarden van het project. Het is bewust lichtgewicht. Geen advocaten,
geen papierwerk, één regel per commit. Zo stellen de Linux-kernel en QEMU,
onder velen anderen, vast waar hun code vandaan komt.

Voor een machinaal geschreven patch is geen van beide onderdelen
vanzelfsprekend waar. En de splitsing lost zich hetzelfde op welke tak je
ook neemt.

Als machinaal gegenereerde output geen auteursrecht draagt, houdt de
bijdrager geen rechten erop. Er is niets aan jou te licentiëren.

Als het in plaats daarvan wordt behandeld als afgeleid van zijn
trainingsdata, behoren de rechten — wat ze ook zijn — toe aan wie die data
schreef. De bijdrager houdt nog steeds niets, en heeft nog steeds niets aan
jou te licentiëren.

Hoe dan ook, ze kunnen niet verlenen wat ze niet bezitten. De handtekening
is niet oneerlijk. De bijdrager tekende te goeder trouw en deed het werk.
Het is gewoonweg leeg: een overdracht van iets dat nooit het zijne was om
over te dragen.

De praktische consequentie is minder alarmerend dan het klinkt, en de twee
takken verschillen scherp.

Op de eerste tak heb je helemaal geen toestemming nodig. Materiaal dat
niemand bezit kan door iedereen worden gebruikt. De patch aannemen is prima
en er gebeurt niets ergs. Wat stilletjes verandert is de andere richting:
copyleft is gebouwd op auteursrecht, en het kan niet vasthechten aan
materiaal dat er geen draagt. Een GPL-project dat machinaal geschreven
patches accumuleert, accumuleert delen die zijn eigen licentie mogelijk niet
bereikt. De licentie blijft het werk zoals gedistribueerd beheersen. De
afdwingbare kern erbinnen verdunt langzaam, zonder dat iemand het merkt.

De tweede tak heeft tanden. Als een model verbatim gememoriseerde
trainingsdata reproduceert — wat gebeurt, meer met veelvoorkomende idiomen
en bekende implementaties dan met nieuwe logica — dan heb je andermans
auteursrechtelijk beschermde code aanvaard, op verzekering van een
bijdrager die geen manier had om te controleren. De hele waarde van de DCO
is dat de persoon die tekent in staat was om het te weten. Hier is dat niet
het geval.

Debian werkt dit nu uit. Een
[algemene resolutie over LLM-gebruik](https://www.debian.org/vote/2026/vote_002)
ging op 23 juli 2026 zijn discussieperiode in met vijf voorstellen op het
stembiljet. Ze bestrijken de hele reeks: Voorstel A zou het Sociaal Contract
wijzigen om LLM-ondersteunde bijdragen aan pakketten, documentatie en
webbronnen volledig te verbieden; Voorstel C vraagt bijdragers om LLM's
zoveel mogelijk te vermijden, vereist door mensen geschreven tekst voor
projectcommunicatie, en laat individuele maintainers hun eigen verboden
opleggen; Voorstellen B, D en E staan AI-ondersteund werk toe onder
voorwaarden, gebaseerd op respectievelijk licentieverificatie,
verantwoordingsplicht van bijdragers, openbaarmaking, en beperkingen op het
sturen van vertrouwelijk materiaal naar clouddiensten. Op het moment van
schrijven wordt het bediscussieerd en is er niets besloten.

Dit is de tweede keer. Een
[eerdere poging in 2024](https://lwn.net/Articles/972331/) eindigde zonder
resolutie, en de redenering om te stoppen is het onthouden waard: het
bezwaar tegen handelen was niet dat de zorg ongegrond was, maar dat een
regel die niemand kan handhaven niet de moeite waard is om aan te nemen. Je
kunt niet naar een diff kijken en het zien.

Dit is geen randgeval-bezorgdheid. Het treft het hardst juist de projecten
met de zorgvuldigste herkomst, omdat het hele model van een op DCO
gebaseerd project over waar zijn code vandaan komt op die ene attestatie
rust.

We hebben niet opgelost hoe we hiermee zullen omgaan, en we staan er slecht
voor om streng te zijn. We verzenden ports geschreven door een model. Een
project dat machinaal geschreven code publiceert en machinaal geschreven
bijdragen weigert, houdt twee onverenigbare standpunten tegelijk aan, en dat
liever niet. De eerlijke opties zijn dezelfde als die Debian afweegt —
openbaarmaking, verantwoordingsplicht van bijdragers, of een regel die
niemand kan verifiëren — en we hebben er geen gekozen.

## De andere as waarlangs het argument loopt

Het debat van Debian gaat over herkomst en licentiëring. Het is niet de
enige as, en de tweede heeft niets met auteursrecht te maken.

Codeberg, de FLOSS-forge, nam in juli 2026 twee door leden goedgekeurde
moties aan en
[zette zijn redenering uiteen](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
in termen die auteursrecht nauwelijks raken. De bezwaren gaan over kosten en
inspanning: energie- en hardwareverbruik afgewenteld op iedereen;
crawlerverkeer dat kleine forges onder druk zet om verdedigingen te bouwen
die ook gewone gebruikers hinderen; eenmalige "vibe-coded" projecten die
worden gepubliceerd en nooit onderhouden; en de last op de mensen die
reviewen:

> Maintainers are under an increased work-load due to people submitting
> (often well-meaning) low-effort, LLM-generated contributions that require
> substantial amounts of time to review.

Hun gebruiksvoorwaarden ontmoedigen nu zulke projecten, per geval toegepast
door moderators in plaats van door massale verwijdering.

Er circuleren dus twee onafhankelijke vragen, en een project kan overal op
het rooster terechtkomen: of machinaal geschreven code überhaupt in licentie
kan worden gegeven, en of het ecosysteem het volume kan absorberen. Debian
stemt over de eerste en is niet tot een conclusie gekomen. Codeberg heeft
gehandeld op de tweede. Geen van beide uitkomsten regelt de andere, en de
antwoorden die een project op elk geeft zijn grotendeels ongecorreleerd.

## Het deel dat we niet gaan doen alsof het opgelost is

We hadden misschien niets van dit alles hoeven doen.

Beschouw de drie argumenten samen. Functionaliteit is niet beschermd — het
HvJEU zei dat direct. Puur machinaal gegenereerde output heeft mogelijk geen
menselijke auteur, dus er hoeft geen nieuw auteursrecht te zijn om je
zorgen over te maken en, ongemakkelijk, ook geen van ons. En een
tweemodellenprotocol dat met echte discipline wordt uitgevoerd, zou een
authentieke cleanroom kunnen zijn, in welk geval de port nooit beschermde
expressie heeft aangeraakt.

Als alle drie kloppen, hadden sommige van deze ports met een gerust geweten
permissief in licentie gegeven kunnen worden. Als geen ervan klopt, was
onze voorzichtige keuze gewoon correct. We weten niet welke, en we hebben
het niet getest. We zijn niet geïnteresseerd om het geval te zijn dat dit
beslecht.

De vraag verdwijnt niet door genegeerd te worden. Dit soort porten wordt
gewoon — het is nu goedkoop, en er is een enorme hoeveelheid onderhouden
C die het waard is verplaatst te worden naar een plek waar het onderhouden
kan worden. Elk van die ports zal dezelfde twee vragen tegenkomen, en de
meeste zullen erop antwoorden door ze niet te stellen. Net als elk project
dat een patch samenvoegt die het niet zelf schreef, wat betekent: allemaal.
De vragen komen, of je nu de code schrijft of ze alleen aanvaardt.
