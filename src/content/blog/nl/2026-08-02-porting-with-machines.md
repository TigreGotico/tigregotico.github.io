---
title: "Porten met machines, en de licentievraag die we niet konden beantwoorden"
description: "We herschreven meerdere C-, C++- en Java-programma's (de G2P van espeak-ng, Cotovia, AhoTTS, HermiT) als puur Python, met een AI die de originele bron las en een mens die orkestreerde. Niemand aan onze kant las de originelen. Dat roept twee aparte vragen op: kan de output überhaupt bezit zijn, en is het een afgeleid werk van de invoer? We behielden de upstream-licenties omdat dat goedkoper was dan antwoorden. We denken nog steeds dat de vraag open is."
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

We hebben een handvol oude programma's herschreven in Python. De G2P-front-end van [espeak-ng](https://github.com/espeak-ng/espeak-ng), de Galicische en Spaanse transcriptieregels van [Cotovia](https://gtm.uvigo.es/en/transfer/software/cotovia/), de Baskische taalverwerking van [AhoTTS](https://github.com/aholab/AhoTTS), de [EYE](https://github.com/eyereasoner/eye) N3-redeneerder, en de OWL 2 DL-redeneerder [HermiT](http://www.hermit-reasoner.com/). C, C++ en Java, de meeste ouder dan een decennium.

Het motief was gewoon. Een C-programma dat Galicisch fonemiseert is uitstekend, totdat u het in een Python-spraakstack op een ARM-bordje wilt draaien: een compiler, een toolchain, cross-compilatie, een subprocesgrens waarover u tekst moet marshalen. Een Java-redeneerder heeft een JVM nodig; puur Python heeft alleen `pip install` nodig, en u kunt het bestand openen dat bepaalt waar de klemtoon valt en het aanpassen.

De ports zijn semi-autonoom uitgevoerd: een AI las de originele bron en schreef de Python, een mens leidde het werk en controleerde de output tegen de originele binary. Bij verschillende ervan heeft niemand aan onze kant ooit de originele bron gelezen; het model wel, en wij lazen de diffs en de pariteitstests.

Dat laat een vraag over die we niet konden beantwoorden: **is het resultaat een afgeleid werk, en van wie is het?**

We zijn ingenieurs. Niets hier is juridisch advies, en we zijn daar niet toe gekwalificeerd: dit is een beschrijving van een beslissing die we namen en de redenering erachter.

## Twee vragen die steeds door elkaar worden gehaald

Een programma herimplementeren door de bron te lezen is niet nieuw. Nieuw is de opzet: de lezer is een machine, de bouwer is dezelfde machine, en de mensen in de lus hebben het origineel nooit gezien.

Er zijn hier twee onafhankelijke vragen, bijna altijd tot één samengevoegd, hoewel u de ene met ja en de andere met nee kunt beantwoorden.

1. **Kan de output überhaupt bezit zijn?** Auteursrecht hecht aan werken met auteurs. Als een machine de code produceerde, wie is dan de auteur?
2. **Is de output een afgeleide van de invoer?** Wie er ook auteur was, als iemand dat al was, maakt het resultaat inbreuk op het origineel?

Een **afgeleid werk** is een werk gebaseerd op een reeds bestaand werk, zoals een vertaling of een port. **Copyleft**-licenties (de GPL-familie) staan u toe code te gebruiken en te wijzigen op voorwaarde dat wat u distribueert onder dezelfde voorwaarden blijft. **Permissieve** licenties (MIT, Apache-2.0, BSD) staan u toe het resultaat in proprietaire software te verwerken. De **LGPL** zit er tussenin.

## Vraag één: is er een auteur?

Auteursrecht vereist een menselijke auteur. Het Amerikaanse Copyright Office houdt dit consistent aan, en in *Thaler v. Perlmutter* was het D.C. Circuit het daarmee eens: de Copyright Act "vereist dat alle in aanmerking komende werken in eerste instantie door een mens worden geschreven" (nr. 23-5233, D.C. Cir., 18 maart 2025; het Hooggerechtshof wees cassatie af in maart 2026). De Europese norm komt op een vergelijkbare plek uit: bescherming vereist "de eigen intellectuele schepping van de auteur", wat een auteur veronderstelt die schept.

Geen van beide zegt dat AI-ondersteund werk onbeschermbaar is, alleen dat wat een machine op eigen houtje genereert dat niet is, en waar de grens ligt hangt af van hoeveel een mens heeft bijgedragen: in onze ports, reëel maar dun, het kiezen van het doel, het structureren van het pakket, het beoordelen van pariteitsfouten. Het is niet vanzelfsprekend dat dit ons de auteur maakt van de transcriptieregels.

Dat levert een lastig object op: een licentie is een toestemming verleend door een rechthebbende, dus als niemand rechten heeft op de output, is het licentiebestand aan de wortel van de repository decoratie, en bijt het argument zichzelf in de staart. Wie beweert dat machinaal gegenereerde code onbezeten is, beweert daarmee ook dat de eigen distributievoorwaarden onafdwingbaar zijn, nog voordat het bij die van de upstream komt.

## Vraag twee: is het afgeleid?

Deze vraag geeft niet om wie de auteur is. Inbreuk draait om toegang tot het origineel plus substantiële gelijkenis met de beschermde **expressie** ervan, de specifieke manier waarop het ding geschreven is, niet wat het doet, en we hadden toegang: het model las de bron, en die helft staat niet ter discussie.

De gelijkenis-helft is waar de taalverandering minder uitmaakt dan mensen verwachten. Een roman vertalen levert een afgeleid werk op; een taal veranderen weerlegt een claim van letterlijk kopiëren, maar niet een claim over structuur, de volgorde van de transformaties, de opdeling in functies, de vorm van de regeltabellen.

Een tool wast ook niets wit: als u een kopie stuurt en het resultaat verzendt, hebt u het gemaakt, en "het model schreef het" is niet meer verdediging dan "de compiler genereerde het".

## Het sterkste argument aan de andere kant

Er is een serieuze zaak dat een cross-talige herimplementatie in orde is. In *SAS Institute v World Programming* (HvJEU, C-406/10, 2 mei 2012) oordeelde het Hof dat "noch de functionaliteit van een computerprogramma, noch de programmeertaal en de indeling van de bestandsformaten die in een computerprogramma worden gebruikt om bepaalde functies ervan te benutten, een vorm van uitdrukking van dat programma vormen". De Softwarerichtlijn (2009/24/EG, artikel 1, lid 2) zegt hetzelfde over de ideeën en beginselen die aan een programma ten grondslag liggen, en het Hof oordeelde dat een licentienemer het gedrag van een programma mag bestuderen om de ideeën erachter te achterhalen, en die mag herimplementeren.

Dat betekent dat wat een fonemizer *doet*, deze grafeemreeks omzetten in dat foneem, door niemand wordt bezeten: de Galicische klemtoonregels zijn feiten over het Galicisch, en de OWL 2 directe semantiek is een gepubliceerde W3C-specificatie. Een herimplementatie die gedrag reproduceert in plaats van expressie is rechtmatig, en een herschrijving over talen heen staat veel verder van inbreuk af dan een kopieer-en-plak.

De kloof tussen dat argument en onze situatie is de bron: *SAS* gaat over gedrag bestuderen, en ons model las de code.

## Het precedent dat al bestaat, en hoever het reikt

Het argument "machinaal gegenereerde output heeft geen auteur, dus er hecht geen auteursrecht" is geen gedachte-experiment: modeldistillatie en synthetische trainingsdata rusten er allebei op, bedrijfstakbreed. De duidelijkste publieke uitspraak is [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), een veelgebruikt open TTS-model wiens kaart zegt dat het uitsluitend is getraind op permissieve of niet-auteursrechtelijk beschermde audio, en dat onder de toegestane bronnen vermeldt:

> Synthetic audio generated by closed TTS models from large providers

met een voetnoot naar de [AI-beleidsrichtlijn](https://copyright.gov/ai/ai_policy_guidance.pdf) van het Amerikaanse Copyright Office: machinale output heeft geen menselijke auteur, dus er is niets om op inbreuk te maken door erop te trainen. Het model wordt uitgebracht onder Apache-2.0, en de kaart sluit ook synthetische audio van *open* TTS-modellen en aangepaste stemklonen uit, een teken dat de auteurs hebben uitgezocht waar het argument ophoudt.

Dat precedent lost de andere helft van het probleem op. Kokoro's argument gaat over de **invoer**: wat ze consumeerden was zelf machinaal gegenereerd, dus de claim is dat het van meet af aan geen auteursrecht droeg. Onze situatie is het spiegelbeeld: wat wij consumeerden, de C van espeak-ng, de C++ van Cotovia en de Java van HermiT, is door mensen geschreven en auteursrechtelijk beschermd door met naam genoemde personen aan met naam genoemde universiteiten, en wat er *uit* kwam was machinaal geschreven, dus het argument raakt onze output, niet onze invoer, en reist niet stroomopwaarts.

Er is een verdere asymmetrie: Kokoro's resterende blootstelling, als die er al is, is contractueel in plaats van auteursrechtelijk, en die verplichting overleeft zelfs waar auteursrecht dat niet doet. Copyleft werkt niet zo; niemand klikt op "ik ga akkoord" bij de GPL, en die bindt u alleen als wat u maakte een afgeleid werk is.

Dus het valt terug op de vraag die nog niemand heeft beantwoord. Als een cross-talige, machinaal geschreven herimplementatie geen afgeleid werk is, was de GPL nooit van toepassing. Als het er wel een is, gold ze vanaf de eerste regel. Er is geen derde toestand.

## Cleanrooms, en of twee modellen er één maken

Het klassieke antwoord op dit probleem is het cleanroom-protocol: één team leest het origineel en schrijft een functionele specificatie van wat het programma doet, en een tweede team, dat het origineel nooit heeft gezien, implementeert alleen vanuit die specificatie. Zo is de PC-BIOS geherimplementeerd, en waarom die overleefde.

De voor de hand liggende moderne zet is één model te laten lezen en beschrijven, en een ander model met een verse context te laten implementeren, structureel hetzelfde protocol. Het heeft de juiste vorm, maar een cleanroom is geen technisch construct, het is een **bewijsrechtelijk** construct, waarvan de hele waarde bestaat uit het aantonen van de scheiding aan iemand die aanneemt dat u vals speelde. De tweemodellenversie betekent alleen iets als de discipline standhoudt:

- De twee kanten delen werkelijk nooit context. Niet "we hebben het gevraagd te vergeten", maar aparte runs, aparte transcripten.
- De specificatie draagt gedrag en niets anders. Geen pseudocode die de controlestroom van het origineel weerspiegelt. Geen identifier-namen. Geen functievolgorde. Dat is expressie, en een specificatie vol daarvan is het origineel in een kostuum.
- De documentatie van beide kanten wordt bewaard, want een cleanroom die u niet kunt bewijzen is een verhaal.

Als de lezende kant structuur uitstuurt, gaat de besmetting er recht doorheen, en houdt u een afgeleid werk over met extra stappen en een grotere tokenrekening.

Dat hebben we niet gedaan: het implementerende model las de bron rechtstreeks, en daarom staat er in het pycotovia-README, publiekelijk:

> Because the implementing AI **read the GPL source**, this is **not a clean-room reimplementation** and we make no such claim. It is a source-derived port.

We hebben liever dat dat is opgeschreven dan er later op te moeten antwoorden.

## Wat we deden

We behielden de upstream-licenties: copyleft erin, copyleft eruit; permissief erin, permissief eruit. [espyak](https://github.com/TigreGotico/espyak) is GPL-3.0-or-later, in overeenstemming met espeak-ng; niet eens een moeilijk geval, aangezien het espeak-ng's eigen datafiles woordelijk bundelt (`dictsource`, `phsource`, `lang`), en geen enkele theorie van auteurschap ongewijzigd gekopieerde bestanden raakt. [pycotovia](https://github.com/TigreGotico/pycotovia) is GPL-3.0, in overeenstemming met Cotovia (GPL-3.0+). [ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) en [pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa) zijn GPL-3.0, in overeenstemming met AhoTTS. [pyeye](https://github.com/TigreGotico/pyeye) is MIT, in overeenstemming met EYE.

We deden dit niet omdat we hadden vastgesteld dat het verplicht was, maar omdat de asymmetrie de beslissing nam zonder dat het antwoord nodig was: copyleft kost ons hier vrijwel niets, terwijl een permissieve licentie op iets dat copyleft had moeten zijn de ergere fout is, laat ontdekt en in het openbaar, nadat mensen hebben voortgebouwd op voorwaarden die u niet gerechtigd was aan te bieden.

Die asymmetrie is het waard om in het algemeen in de gaten te houden: niemand klaagt wanneer een structurele port van een LGPL-origineel stilletjes Apache-2.0 wordt in vertaling. HermiT is LGPL en onze Python-port draagt LGPL-3.0 om overeen te komen. De rest van de set leverde nog twee gevallen op, allebei ondramatisch: een wrapper die Apache-2.0 verklaart terwijl de upstream MIT is, en repositories waarvan het README een licentie noemde zonder bijbehorend bestand. U controleert, u repareert wat gerepareerd moet worden, en de interessante vraag blijft open.

U hoeft de juridische vraag niet op te lossen om deze beslissing te nemen; u neemt de tak waar fout zitten overleefbaar is.

## Dezelfde vraag, in de andere richting

Dezelfde logica geldt voor code die we ontvangen: iemand opent een pull request geschreven door een model, en de vraag is wat diegene ons verleent.

De meeste projecten regelen dit met de [Developer Certificate of Origin](https://developercertificate.org/): de `Signed-off-by:`-regel die verklaart dat u de bijdrage schreef, of dat ze afkomstig is van een compatibele bron die u het recht geeft om ze in te dienen. Zo stellen de Linux-kernel en QEMU vast waar hun code vandaan komt.

Voor een machinaal geschreven patch is geen van beide poten vanzelfsprekend waar: als machinale output geen auteursrecht draagt, heeft de bijdrager er geen rechten op; als ze in plaats daarvan wordt afgeleid van trainingsdata, behoren de rechten toe aan wie die data schreef. Hoe dan ook kunnen ze niet verlenen wat ze niet bezitten, en de handtekening, hoewel niet oneerlijk, draagt iets over dat nooit van hen was om over te dragen.

De gevolgen verschillen scherp. Op de eerste tak kan materiaal dat niemand bezit door iedereen worden gebruikt, maar copyleft kan niet hechten aan materiaal dat er geen draagt, dus een GPL-project dat machinaal geschreven patches opneemt, accumuleert stilletjes delen die zijn eigen licentie mogelijk niet bereikt. De tweede tak heeft tanden: als een model verbatim gememoriseerde trainingsdata reproduceert, wat vaker gebeurt bij idiomen dan bij nieuwe logica, hebt u andermans auteursrechtelijk beschermde code aanvaard op verzekering van een bijdrager die geen manier had om het te controleren, en dat komt het hardst aan bij de projecten met de zorgvuldigste herkomst.

Debian werkt dit nu uit. Een [algemene resolutie over LLM-gebruik](https://www.debian.org/vote/2026/vote_002) ging in juli 2026 zijn discussieperiode in, variërend van het volledig verbieden van LLM-ondersteunde bijdragen tot het toestaan ervan onder openbaarmaking en verantwoordingsplicht, en er is niets besloten. Een [eerdere poging in 2024](https://lwn.net/Articles/972331/) eindigde ook zonder resolutie: het bezwaar was niet dat de zorg ongegrond was, maar dat een regel die niemand kan handhaven niet de moeite waard is om aan te nemen.

We staan er slecht voor om streng te zijn: we verzenden ports geschreven door een model, en een project dat machinaal geschreven code publiceert terwijl het machinaal geschreven bijdragen weigert, houdt twee onverenigbare standpunten tegelijk aan.

Licentiëring is niet de enige as waarlangs dit argument loopt, hoewel het de as is waar dit artikel over gaat. Codeberg nam in juli 2026 twee door leden goedgekeurde moties aan en [zette zijn redenering uiteen](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html) bijna zonder licenties te noemen: energie- en hardwarekosten, crawlerverkeer, onderhouden eenmalige projecten, en de reviewlast die laagdrempelige patches op maintainers leggen. Dat staat los van of de code in licentie kan worden gegeven. Debian stemt over het eerste en heeft nog niets besloten; Codeberg handelde op het tweede.

## Het deel dat we niet gaan doen alsof het opgelost is

We hadden dit alles misschien niet hoeven doen.

Neem de drie argumenten samen. Functionaliteit is niet beschermd; het HvJEU zei dat direct. Puur machinaal gegenereerde output heeft mogelijk geen menselijke auteur, dus er is mogelijk geen nieuw auteursrecht om u zorgen over te maken en, ongemakkelijk, ook geen van ons. En een tweemodellenprotocol dat met echte discipline wordt uitgevoerd, zou een authentieke cleanroom kunnen zijn, in welk geval de port nooit beschermde expressie heeft aangeraakt.

Als alle drie kloppen, hadden sommige van deze ports met een gerust geweten permissief in licentie gegeven kunnen worden. Als geen enkele klopt, was onze voorzichtige keuze gewoon correct. We weten niet welke, we hebben het niet getest, en we zijn niet geïnteresseerd om het geval te zijn dat het beslecht.

De vraag verdwijnt niet door genegeerd te worden. Dit soort porten wordt gewoon, en er is een enorme hoeveelheid onderhouden C die het waard is verplaatst te worden naar een plek waar het onderhouden kan worden. Elke port van dat soort komt dezelfde twee vragen tegen, en de meeste zullen erop antwoorden door ze niet te stellen. Net als elk project dat een patch samenvoegt dat het niet zelf schreef, wat betekent: allemaal.
