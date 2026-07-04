---
title: "Twee stemmen, elke taal: Miro & Dii"
description: "TigreGótico werkt samen met OpenVoiceOS om de assistent twee consistente stemidentiteiten te geven — Miro en Dii — die in elke taal hetzelfde klinken, gebouwd met onze voice-cloning-technologie en de phoonnx-engine. Twee TTS-modellen voor elke taal die iemand aanvraagt, bedreigde talen inbegrepen."
date: 2026-06-15
lang: nl
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "OVOS"
  - "voice cloning"
  - "G2P"
  - "language inclusion"
draft: false
---

> **Beluister ze nu:** de [Voices Demo](../../demo) draait Miro & Dii live in je
> browser — kies een taal, typ een zin, en luister. Geen installatie, geen server.

Mensen onthouden de stem van een assistent beter dan zijn naam. Het is wat software laat aanvoelen als een aanwezigheid in plaats van een proces. Dus de kernvraag van onze samenwerking met [OpenVoiceOS](https://www.openvoiceos.org/) is een praktische: op wie moet de assistent lijken, in elke taal?

Het antwoord is **Miro** (mannelijk) en **Dii** (vrouwelijk) — twee stemidentiteiten die dragen over elke taal die OpenVoiceOS ondersteunt. Een gebruiker die de assistent in Lissabon configureert en later overschakelt naar Duits, zou dezelfde vertrouwde spreker moeten horen. Eén merkstem, elke taal, in eigendom van de gemeenschap.

## Eén identiteit, vele talen

De gebruikelijke manier om een meertalige stem te krijgen is om één enkel model tegelijk op vele talen te trainen. Het werkt, maar het neigt ertoe het resultaat uit te smeren: accenten bloeden door in andere talen, de uitspraak wordt bij benadering, en de stem verliest de scherpte van een moedertaalspreker.

Wij nemen de moeilijkere weg. Voor elke taal bouwen we een **eentalig** model — één model, één taal, getraind om die taal goed te doen. De truc die ze samenbindt is **voice cloning**: elk eentalig Miro-model wordt gekloond van dezelfde bronidentiteit, en evenzo voor Dii. Het resultaat is een familie van modellen per taal die elk als een moedertaalspreker klinken, maar allemaal hetzelfde timbre delen, hetzelfde karakter, dezelfde Miro-heid of Dii-heid. Je krijgt uitspraak van moedertaalkwaliteit *én* één herkenbare identiteit, in plaats van het één voor het ander in te ruilen.

Deze modellen worden getraind en geserveerd met [**phoonnx**](https://github.com/TigreGotico/phoonnx), ons open TTS-framework — VITS-gebaseerd, ONNX-geëxporteerd, alleen-CPU. De stemmen draaien volledig offline; geen cloud, geen API-sleutel, geen gegevens die je hardware verlaten. Binnen OpenVoiceOS handelt de plugin `ovos-tts-plugin-phoonnx` het ophalen en laden af. Voor het volledige verhaal over hardware en architectuur, zie [TTS die op een aardappel draait](/nl/blog/2026-05-10-tts-that-runs-on-a-potato).

## Het G2P-onderzoek dat het mogelijk maakt

Een taal goed spreken gaat niet alleen over de stem — het gaat over weten hoe het schrift *bedoeld* is te klinken. Dat is de taak van **grafeem-naar-foneem (G2P)**-conversie: geschreven tekst omzetten in de reeks fonemen die het model daadwerkelijk uitspreekt. Elke nieuwe taal die we oppakken, komt met zijn eigen G2P-onderzoek, en in dat onderzoek zit veel van het echte werk.

phoonnx is hier bewust flexibel. Het kan een hele reeks fonemizers aandrijven — eSpeak, Gruut, Epitran, modelgebaseerde [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0), en taalspecifieke tools waar algemene engines tekortschieten. Dit sluit rechtstreeks aan op onze bredere fonetiekstack: ons **[orthografie-naar-IPA-onderzoek](/nl/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** en de **[Lusofone fonemizers](/nl/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** die we voor de Portugese taalfamilie hebben gebouwd, voeden hetzelfde doel — accurate IPA voor talen die de grote TTS-leveranciers nooit de moeite hebben genomen zorgvuldig te modelleren. Wanneer een taal geen goede kant-en-klare fonemizer heeft, *is* dat gat het project. We doen eerst het spelling-naar-klank-onderzoek, dan volgt de stem.


## Twee modellen voor elke gevraagde taal

Hier is het concrete aanbod, en het is het hart van de samenwerking: **voor elke taal die iemand aanvraagt, bouwen we twee TTS-modellen — Miro en Dii.** Geen roadmap vol misschientjes; een staande toezegging. Vraag om een taal, en het universele paar komt ernaartoe.

En we bedoelen *elke* taal, niet alleen de comfortabele, commercieel voor de hand liggende. De stemmen die in de wereld ontbreken, zijn zelden die met honderd miljoen sprekers — het zijn de **bedreigde en minderheidstalen** die reguliere TTS stilletjes negeert omdat de markt te klein is om er moeite voor te doen. Dat zijn precies de talen die we willen bereiken. **Fries. Asturisch. Aragonees.** Talen gedragen door gemeenschappen die nog nooit een hoogwaardige synthetische stem van zichzelf hebben gehad, en die geen enkele reden hebben om te verwachten dat een Silicon Valley-leverancier die ooit zal leveren.

Een consistente stemidentiteit doet hier nog meer terzake. Wanneer een minderheidstaalgemeenschap Miro en Dii krijgt, krijgen ze dezelfde waardige, professionele stem die een gebruiker van een grote taal krijgt — geen blikkerige bijzaak, maar een eersteklaslid van dezelfde familie. Inclusie is in dit werk geen voetnoot. Het is het doel.

## Open, privé, en van jou om te houden

Alles hier volgt de principes die OpenVoiceOS en TigreGótico delen. De stemmen zijn **vrij en opensource**. Ze draaien **offline en zelf-gehost**, zodat wat je tegen je assistent zegt op je hardware blijft. De modellen zijn **klein en efficiënt**, zodat privacy je geen datacenter kost. En omdat de hele stack — de engine, de fonemizers, het G2P-onderzoek, de getrainde stemmen — open is, kan een gemeenschap haar taal oppakken en ermee doorgaan lang nadat welk afzonderlijk bedrijf dan ook verder is gegaan.

Je kunt de groeiende verzameling stemmen doorbladeren in de [**phoonnx TTS models collection**](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) op Hugging Face. Als je taal er nog niet bij staat, is dat geen gesloten deur — het is een aanvraag die wacht om gedaan te worden.

Twee stemmen. Elke taal. Die welke de rest van de industrie vergat, inbegrepen.
