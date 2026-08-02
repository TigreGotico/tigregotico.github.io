---
title: "Een meertalige dataset van zinstypen: vragen, commando's, uitspraken"
description: "We hebben sentence-types-multilingual gepubliceerd — bijna 70.000 zinnen in zeven talen, geclassificeerd naar grammaticaal type (vraag, commando, uitspraak, uitroep). Het is het trainingscorpus achter de routeringsbibliotheek little_questions."
date: 2026-04-01
lang: nl
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

De routeringslogica van een spraakassistent hangt ervan af of hij weet wat voor soort zin hij heeft ontvangen voordat hij ook maar iets probeert te beantwoorden. Een vraag vereist een antwoord. Een commando vereist uitvoering. Een uitspraak vereist mogelijk een bevestiging of opslag. Die classificatie juist krijgen, in welke taal de gebruiker ook spreekt, is de voorwaarde voor al het andere.

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** is het trainingscorpus achter die laag: 69.300 gelabelde zinnen, 9.900 voor elk van zeven talen (Engels, Spaans, Frans, Duits, Italiaans, Portugees en Nederlands).

## Wat de labels in de praktijk betekenen

De dataset gebruikt een platte set van zes labels: één `label`-kolom per rij, zonder splitsing in type/subtype. Deze labels komen rechtstreeks overeen met de manier waarop `little_questions` (de inferentiebibliotheek die deze data verbruikt) uitingen routeert:

- **wh_question**: vragen opgebouwd rond een vraagwoord (wat, waar, wie, enzovoort).
- **polar_question**: ja/nee-vragen. De EAT-taxonomie (Expected Answer Type) binnen `little_questions` voegt 53 fijnmazige labels voor antwoordtype toe (persoon, locatie, hoeveelheid, definitie, enzovoort) bovenop de vraaglabels, maar de classificatie van het zinstype is de eerste poort.
- **command**: imperatieve vormen. Commando's verwachten geen antwoord. Ze verwachten een actie.
- **request**: beleefde of indirecte verzoeken om actie, te onderscheiden van een kaal imperatief.
- **statement**: declaratief. Uitspraken in een dialoogcontext dragen vaak een polariteit die verderop in het proces van belang is. Een ja/nee/misschien-classificator draait op uitspraken om antwoorden op eerdere vragen te interpreteren.
- **exclamation**: emotioneel gemarkeerde uitingen die een andere behandeling vereisen dan neutrale declaratieven.

```json
{
  "language": "en",
  "label": "wh_question",
  "text": "What time is it?"
}
```

## Waarom cross-linguïstische dekking niet triviaal is

Dezelfde communicatieve intentie manifesteert zich op verschillende manieren in verschillende grammatica's:

- Het Engels markeert vragen met inversie van de woordvolgorde. Het Portugees en het Spaans markeren ze vaak louter met interpunctie en intonatie, waarbij de woordvolgorde onaangeroerd blijft.
- Het Duits verplaatst werkwoorden naar de zinsfinale positie op manieren die de plaats verschuiven waar het classificerende signaal zich bevindt.
- De Romaanse talen gebruiken specifieke imperatiefmorfologie voor commando's die het Engels met het kale werkwoord uitdrukt.

Een model dat alleen op Engels is getraind, maakt deze gevallen overal elders fout. Parallelle, gelabelde data over de zeven talen leveren het cross-linguïstische signaal dat classificatoren per taal nodig hebben. Dezelfde generatiepipeline breidt zich uit naar verdere talen naarmate deze worden toegevoegd.

## De downstream-stack

De modellen die op deze data zijn getraind, worden geleverd binnen **[little_questions](https://github.com/TigreGotico/little_questions)**, een offline bibliotheek zonder afhankelijkheden (numpy + onnxruntime) met ONNX-classificatoren per taal voor het zinstype en een ja/nee-polariteitsmodel voor 43 talen. De modellen zijn voor het Engels in de wheel zelf meegeleverd en worden voor andere talen lazy gedownload. De zinstype-classificatoren worden op HuggingFace gepubliceerd als `TigreGotico/sentence-types`. De EAT-antwoordtype-classificatoren worden intern getraind en niet publiek uitgebracht.

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` is de natuurlijke-taal-routeringslaag voor OVOS en LILACS: classificeren of een uiting een vraag, een commando of een uitspraak is, is de eerste dispatchbeslissing die een spraakpipeline neemt.

[**sentence-types-multilingual op HuggingFace**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**little_questions op GitHub**](https://github.com/TigreGotico/little_questions)
