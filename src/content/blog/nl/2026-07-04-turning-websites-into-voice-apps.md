---
title: "Als iedereen een app uitbrengt, brengen wij stem uit: websites veranderen in spraakapps"
description: "Elke site die ertoe doet, werd verpakt in een mobiele app. Wij stellen de omgekeerde beweging voor voor het spraak- en CLI-tijdperk: een schone API plus een spraakskill per site, zodat het web doorbladerbaar wordt op het gehoor en met het toetsenbord. Eén site tegelijk telt het op tot een spraakbrowser."
date: 2026-07-04
lang: nl
author: "Casimiro Ferreira"
tags:
  - "Voice"
  - "Accessibility"
  - "OpenVoiceOS"
  - "Web Automation"
  - "CLI"
  - "FOSS"
draft: false
---

Ergens in de afgelopen vijftien jaar besloot het web stilletjes dat elke
belangrijke site ook een mobiele app nodig heeft. Niet omdat HTML ophield te
werken, maar omdat een app een *gecontroleerd oppervlak* is: een samengestelde set
acties, geen browserchrome (menu's, tabbladen en adresbalken) die je niet koos, een
interface gebouwd voor één manier van interacteren.

Wij denken dat dezelfde beweging wacht om gemaakt te worden voor een andere groep
gebruikers en een andere reeks interfaces. Als iedereen zijn site in een
Android-app verandert, **kunnen wij sites in spraakapps veranderen**, en
opdrachtregelapps, en schermlezer-native flows. Hetzelfde idee, omgekeerde
richting: verpak een site in een oppervlak gebouwd voor hoe *jij* ermee wilt
interacteren, behalve dat het oppervlak je stem en je terminal is in plaats van een
touchscreen.

## Het web is nauwelijks bruikbaar op het gehoor

Voor een ziende gebruiker met een muis is een moderne site prima. Voor iemand die op
gehoor bladert, of via een schermlezer, of vanaf een terminal, is het grootste deel
van het web een vijandige omgeving: eindeloze scrollmuren, cookiebanners, pop-ups,
menu's die een aanwijzer nodig hebben, inhoud begraven onder drie lagen interactieve
rommel. De informatie zit erin. Die eruit krijgen, handsfree, is ellendig.

Het gebruikelijke antwoord is "sites zouden toegankelijker moeten zijn", en dat zou
ook zo moeten. Maar we gaan het hele web niet repareren door beleefd te vragen. Wat
we *wel* kunnen doen, is de sites nemen die ertoe doen en voor elk een schone,
gesproken interface bouwen, zoals de appstores deden voor touch, maar voor spraak
en CLI, en openlijk.

## Twee lagen: een schone API, dan een spraakskill

Elk van deze spraakapps bestaat uit twee gestapelde stukken, en we bouwen beide al.

**Laag één is een getypeerde client die een site in een API verandert.** Dit is
precies ons [scraping- en API-reverse-engineeringwerk](/nl/blog/2026-04-20-music-database-scrapers):
hij reikt in een site die geen bruikbare publieke interface heeft en geeft
gestructureerde, getypeerde objecten terug in plaats van broze HTML. Werkwoorden,
geen scraping:

```python
from py_bandcamp import BandCamp

for release in BandCamp.search_albums("king gizzard"):
    artist = release.work.credits[0].entity.name if release.work.credits else ""
    print(release.work.title, artist, release.uri)
```

De recon- en
[anti-bot-transport](/nl/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)tooling
eronder houdt die toegang werkend terwijl de site verandert. Die client is op zichzelf
al nuttig: voor een terminalgebruiker *is* de API de toegankelijke versie van de
website. Onze SoundCloud-client levert zelfs `nds` mee, een opdrachtregelapp om
muziek te zoeken en af te spelen zonder een browser in zicht. Zodra een site een API
is, houdt hij op een visueel artefact te zijn en wordt hij iets wat een machine, of
een spraakpijplijn, kan aandrijven.

**Laag twee is een OVOS-plugin die die API spreekt.** Boven op de client zit een
[OpenVoiceOS](https://openvoiceos.org)-plugin die gesproken intents naar API-aanroepen
mapt en de resultaten vertelt met onze
[offline TTS-stemmen](/nl/blog/2026-06-15-two-voices-every-language-miro-and-dii).
Het is bewust *geen* op maat gemaakte skill per site, want die weg leidt tot tientallen
eenmalige skills die niemand kan onderhouden. Voor alles wat mediavormig is, is het
een [OCP](https://openvoiceos.github.io/ovos-technical-manual/)-providerplugin: één
kleine adapter die het zoek-en-afspeeloppervlak van een site blootstelt aan het hele
Open Common Play-framework, zodat "zoeken", "afspelen", "volgende" en "hervatten" al
op dezelfde manier werken als voor elke andere bron. De site valt in een uniforme
spraakinterface in plaats van zijn eigen uit te vinden.

Het resultaat: "Speel het SomaFM Groove Salad-kanaal." "Zoek op Bandcamp naar
Creative-Commons ambient." De website, veranderd in iets wat je kunt gebruiken zonder
ernaar te kijken, en zonder voor elke site een nieuwe grammatica te moeten leren.

## In het tijdperk van LLM's is een getypeerde API een natuurlijke-taal-UI die staat te wachten

Er is een tweede reden waarom deze vorm er nu meer toe doet dan vijf jaar geleden. Een
schone, getypeerde client is precies wat een groot taalmodel nodig heeft om een
*natuurlijke-taal-front-end* voor een website te worden.

Geef een LLM een gedocumenteerde set functies, zoals `search_albums`, `get_recommendations`
en `stream_url`, en het zal met plezier "vind me iets als Naxatras maar zwaarder"
vertalen naar de juiste aanroepen, ze aan elkaar ketenen, en het resultaat teruggeven.
De gestructureerde API is het moeilijke deel. De conversationele interface erbovenop is
steeds vaker iets wat het model gewoon *levert*, zolang de tools die het krijgt goed
getypeerd en eerlijk zijn over wat ze teruggeven. Rommelige HTML geeft een LLM niets
om zich aan vast te houden. Een getypeerde client geeft het een bedieningsoppervlak.

Dus onze website-clients leveren een **`SKILL.md`** mee, een beschrijving in gewone
taal van wat de API doet, zijn werkwoorden, zijn retourtypes en voorbeeldaanroepen,
geschreven om door een agent gelezen te worden. Richt een LLM-aangedreven assistent
erop en de client wordt een tool die het model onmiddellijk kan gebruiken: geen
lijmcode, geen maatwerkintegratie, gewoon "dit is wat deze site kan, in woorden." Eén
document verandert een scraper in iets wat een taalmodel namens jou kan bedienen.

Het zijn dezelfde gestructureerde data die drie front-ends tegelijk bedienen: een
**CLI** voor terminalgebruikers, een **OCP/spraakplugin** voor handsfree gebruik, en
een **LLM-tool** voor natuurlijke-taalbediening. Bouw de API één keer; draag hem op
drie manieren.

## Waarom dit het meest telt voor mensen die het scherm niet kunnen zien

Voor blinde en slechtziende gebruikers is dit geen gemaksfunctie. Het is het verschil
tussen toegang en uitsluiting. Een schermlezer kan alleen lezen wat een pagina schoon
blootstelt, en de meeste pagina's doen dat niet. Een toegewijde spraakapp slaat de
pagina volledig over: hij gaat naar de gestructureerde data en spreekt *die* uit, in
een flow ontworpen om te beluisteren vanaf de eerste regel code.

Het is hetzelfde principe achter onze
[audio-first games](/nl/games), gebouwd voor oren, niet ogen, met blinde spelers als
het primaire publiek in plaats van een bijzaak. Spraakapps voor websites breiden dat
principe uit van games naar de rest van het web.

## Eén site tegelijk, maar de richting is een spraakbrowser

Hier is het eerlijke deel: er is geen universele sluiproute. Je kunt niet in één klap
"het web" spraakvaardig maken, want elke site is zijn eigen kluwen. Het moet **per
site** gebeuren: één client, één skill, één zorgvuldig gemapte set intents tegelijk.
Dat klinkt als een beperking, en op de korte termijn is het dat ook.

Maar kijk waar de opeenstapeling naartoe wijst. Elke site die we verpakken, is nog een
hoek van het web die nu bereikbaar is met stem en met CLI. Rijg er genoeg aan elkaar
(een gemeenschappelijk metadatavocabulaire, een gedeelde spraaklaag, een consistente set
van "zoeken / openen / lezen / afspelen / volgende"-intents) en je kijkt niet langer
naar een stapel losse skills. Je kijkt naar het begin van een **spraakbrowser**: een
manier om je door het web te bewegen door te praten, waar afzonderlijke sites gewoon
bestemmingen zijn die al weten hoe ze moeten antwoorden.

De inzet van het mobiele tijdperk was dat een site die het gebruiken waard is een app
waard is. De onze is dat een site die het gebruiken waard is een *stem* waard is. We
bouwen ze één voor één, in de openbaarheid, en elk ervan maakt het web een beetje meer
doorbladerbaar voor de mensen die het visuele web achterliet.

Wil je een specifieke site veranderd in een spraak- of CLI-app, voor
toegankelijkheid, voor je product, of gewoon omdat het zou moeten bestaan?
[Laten we praten.](/nl/services)
