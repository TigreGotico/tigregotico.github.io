---
title: "TTS-modellen die op een aardappel draaien"
description: "phoonnx is een onderzoeksframework voor VITS-gebaseerde tekst-naar-spraak, gebouwd om comfortabel op zwakke hardware te draaien. Geen GPU, geen cloud, geen API-sleutel: alleen een ONNX-stem van ~15,65 miljoen parameters en een CPU. Zo klein kan een goede stem zijn, en zo trainen we ze."
date: 2026-05-10
lang: nl
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "ONNX"
  - "VITS"
  - "self-hosted"
  - "OVOS"
draft: false
---

Goede tekst-naar-spraak heeft geen GPU of cloudabonnement nodig. Een natuurlijke, meertalige stem past in iets waarvoor je je zou schamen om het een server te noemen: het soort bordje dat je "voor het geval dat" in een la bewaart. Een aardappel.

[**phoonnx**](https://github.com/TigreGotico/phoonnx) is ons onderzoeksframework voor precies dat doel: kleine VITS-gebaseerde stemmen die **volledig offline, op CPU, op goedkope hardware** draaien, en die we ook *zelf* vanaf nul kunnen *trainen*.

## Hoe klein is klein?

Laten we er een echt getal op plakken in plaats van vaag te doen. We haalden een productie-phoonnx-stem, de Baskische "Miro"-stem (`OpenVoiceOS/phoonnx_eu-ES_miro_espeak`), rechtstreeks van Hugging Face en telden de gewichten in de ONNX-graaf:

```python
import onnx, numpy as np
m = onnx.load("miro_eu-ES.onnx")
print(sum(int(np.prod(i.dims)) for i in m.graph.initializer))
# 15650459
```

**~15,65 miljoen parameters.** Dat is de hele stem: encoder, decoder, en al de rest, in een bestand van 63 MB. De vrouwelijke "Dii"-stem uit dezelfde uitgave komt uit op *precies hetzelfde* getal, omdat ze de standaard phoonnx VITS-architectuur delen. De persoonlijkheid zit in de gewichten, niet in extra capaciteit.

Ter vergelijking: een enkele laag van een "klein" modern taalmodel kan meer parameters dragen dan deze hele spraaksynthesizer, en toch spreekt hij vloeiend.

## Waarom VITS, en waarom ONNX

[VITS](https://arxiv.org/abs/2106.06103) is de ruggengraat van elke phoonnx-stem. Het is een end-to-end-architectuur: tekst (nou ja, fonemen) erin, golfvorm eruit, zonder aparte vocoder om op te passen en zonder autoregressieve lus die één sample tegelijk voortkruipt. Dat end-to-end-ontwerp is precies wat het op een aardappel behapbaar maakt: één voorwaartse doorloop, parallelle synthese, klaar.

We sturen geen PyTorch naar de edge. Getrainde stemmen worden geëxporteerd naar **ONNX** en draaien via [`onnxruntime`](https://onnxruntime.ai/) op de **CPU**, zonder CUDA, zonder GPU, zonder driver-roulette. `onnxruntime` is een strakke, portabele C++-engine, en een graaf van 15 miljoen parameters valt ruimschoots binnen wat een Raspberry-Pi-achtige kern sneller dan realtime doorkauwt.

Het resultaat is een spraakassistent die blijft praten wanneer je internet uitvalt, wanneer de cloudprovider een storing heeft, of wanneer je gewoon nooit wilde dat je thuisaudio het huis verliet.

## Fonemen zijn waar de slimheid zich verbergt

Een klein akoestisch model kan zich veroorloven klein te zijn omdat phoonnx het zware linguïstische werk *vooraf* doet, in de fonemizer. Een fonemizer (grafeem-naar-foneem, of G2P) zet geschreven tekst om in de reeks klankeenheden die het model daadwerkelijk uitspreekt, zodat het VITS-netwerk nooit spelling hoeft te leren, alleen klank.

Ons foneemwerk is geworteld in **[grafeem-naar-IPA voor 350+ talen](/nl/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** en **[klassieke Portugese fonetiek](/nl/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, die het mogelijk maken stemmen te trainen voor talen met weinig hulpbronnen zonder wekenlange annotatie door experts.

phoonnx is bewust fonemizer-agnostisch en levert een klein legioen ervan mee: `espeak-ng`, [gruut](https://github.com/rhasspy/gruut), [epitran](https://github.com/dmort27/epitran), [misaki](https://github.com/hexgrad/misaki), [transphone](https://github.com/xinjli/transphone) (dat reikt in de duizenden talen gecatalogiseerd in Glottolog), plus specialisten zoals [mantoq](https://github.com/mush42/mantoq) voor Arabisch, **[cotovia](https://github.com/TigreGotico/pycotovia)** voor Galicisch, OpenJTalk voor Japans, en KoG2P voor Koreaans.

Ze sturen IPA, ARPA, Pinyin, Hangul, Buckwalter uit: wat de taal ook nodig heeft. Er is zelfs een modelgebaseerde meertalige G2P gebouwd op ByT5, net als al het andere geëxporteerd naar ONNX.

Het uitbesteden van de orthografie aan de fonemizer is de truc waarmee een model van 15 miljoen parameters goed klinkt in een taal met weinig hulpbronnen die het nog nooit geschreven heeft gezien.

## Een framework om stemmen te *bouwen*, niet alleen om ze te draaien

phoonnx is niet alleen een inferentietoolkit. Het bijbehorende framework [**`phoonnx_train`**](https://github.com/TigreGotico/phoonnx) is hoe we de stemmen in de eerste plaats *maken*.

`phoonnx_train` dekt de volledige pijplijn:

- **Voorbewerking** van een LJSpeech-achtige dataset tot gefonemiseerde trainingsgegevens.
- **Training** van de VITS-generator (die ~15,65M parameters) op een enkele consumenten- of middenklasse-GPU. Een model van deze omvang heeft geen trainingscluster nodig.
- **Export** van het voltooide checkpoint naar ONNX met één script, klaar om rechtstreeks in `onnxruntime` op een apparaat te droppen.

Omdat het recept open is en de modellen klein zijn, is het bouwen van een gloednieuwe stem voor een taal die *geen* open offline optie heeft een project op weekendschaal, niet op de schaal van een onderzoeksbeurs. Zo hebben we gaten opgevuld voor achtergestelde talen, waaronder Baskisch, Mirandees, Europees Portugees en meer, in plaats van te wachten tot een leverancier besluit dat een taal commercieel interessant is.

## Al geïntegreerd in je assistent

Je hoeft dit niet allemaal met de hand aan elkaar te lijmen. phoonnx levert een native OpenVoiceOS-plugin, `ovos-tts-plugin-phoonnx`, die stemmen voor je ophaalt en laadt:

```json
"tts": {
  "module": "ovos-tts-plugin-phoonnx",
  "ovos-tts-plugin-phoonnx": {
    "voice": "OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone"
  }
}
```

Laat de `voice` weg en het kiest het eerste model dat bij je taal past. Voor het beheren van stemmen buiten een assistent is er een CLI, `phoonnx-voices`, om talen op te sommen, stemmen te doorbladeren en modellen vooraf te downloaden:

```bash
phoonnx-voices list-voices --lang pt-PT
phoonnx-voices download OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone
```

En omdat phoonnx gewoon VITS-over-ONNX spreekt, draait zijn inferentie-engine ook stemmen getraind door Piper, Mimic3, Coqui en MMS: **meer dan duizend talen en stemmen** in totaal. Eén kleine runtime, en een enorme catalogus, en niets ervan belt naar huis.

## De kern

Spraaktechnologie die jou respecteert moet draaien *waar jij bent*, op jouw hardware, onder jouw controle, met de netwerkkabel eruit als je dat wilt. phoonnx is onze inzet dat de weg daarheen niet grotere modellen zijn, maar de juiste architectuur klein gemaakt: VITS voor de ruggengraat, slimme fonemizers om de linguïstische last te dragen, ONNX voor portabiliteit, en een open trainingsframework zodat iedereen de catalogus kan laten groeien.

Vijftieneneenhalf miljoen parameters, draaiend op CPU, getraind op hardware die iedereen kan bezitten: dat is de trainingspijplijn achter elke phoonnx-stem.
