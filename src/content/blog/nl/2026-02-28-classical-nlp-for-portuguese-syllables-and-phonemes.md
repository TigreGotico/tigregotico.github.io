---
title: "Klassieke NLP voor het Portugees: lettergreepverdeling en grafeem-naar-foneem"
description: "Een blik op onze op regels gebaseerde, volledig offline Portugese NLP-stack — silabificador voor lettergreepverdeling en TugaPhone voor dialectbewuste grafeem-naar-foneem — en hoe deze aansluiten op het bredere orthography2ipa-werk voor Lusofone variëteiten. Geen deep-learning-blackboxes: deterministisch, snel en met weinig afhankelijkheden."
date: 2026-02-28
lang: nl
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

Lettergreepbreuken, klemtoonplaatsing en spelling-naar-klank-afbeeldingen in het Portugees volgen regels die taalkundigen documenteerden lang voordat iemand een neuraal netwerk trainde. Wanneer die regels expliciet zijn, is het juiste gereedschap een kleine, deterministische, volledig offline bibliotheek die je kunt lezen, auditen en overal kunt draaien. Dat is de filosofie achter onze klassieke Portugese NLP-stack: [silabificador](https://github.com/TigreGotico/silabificador) voor lettergreepverdeling en [TugaPhone](https://github.com/TigreGotico/tugaphone) voor grafeem-naar-foneem (G2P).

### Waarom klassiek, en waarom nu

Fonetiek is een van de gebieden waar deterministische regels werkelijk uitblinken. De grensregels van de Portugese lettergreepverdeling en de regelmatigheden van de spelling zijn goed gedocumenteerd, waardoor een met de hand gemaakte regelengine transcripties oplevert die je regel voor regel kunt inspecteren. Geen GPU, geen modeldownload, geen netwerkoproep. Dat is belangrijk voor datasoevereiniteit: een Lusofone spraakpijplijn zou zijn tekst niet naar een externe API moeten hoeven sturen alleen maar om te ontdekken hoe een woord wordt uitgesproken. Het is ook belangrijk voor snelheid en footprint — deze bibliotheken hebben weinig afhankelijkheden en draaien even gemakkelijk op een laptop, een server of een embedded apparaat.

### silabificador: lettergreepgrenzen

`silabificador` is een lichtgewicht Portugese lettergreepverdeler die volledig is opgebouwd uit met de hand gemaakte regels, **zonder afhankelijkheden**. De interface is zo klein als hij klinkt:

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

Hij is afgesteld en getest tegen schone data van het [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org) en gebenchmarkt op het [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon) — een open dataset van meer dan 100.000 vermeldingen uit dezelfde bron. Lettergreepsegmentatie is een fundamentele stap voor klemtoontoewijzing, afbreking en foneemtranscriptie, dus het goed en snel doen loont overal verderop in de keten.

### TugaPhone: dialectbewuste grafeem-naar-foneem

`TugaPhone` zet willekeurige Portugese tekst om naar IPA, en doet dat over de belangrijkste Lusofone dialecten heen: Europees (`pt-PT`), Braziliaans (`pt-BR`), Angolees (`pt-AO`), Mozambikaans (`pt-MZ`) en Timorees (`pt-TL`). Cruciaal is dat het dialectvariatie behoudt in plaats van alles af te vlakken tot één "standaard". Dezelfde zin komt er anders uit, afhankelijk van waar hij wordt gesproken:

```
Choveu muito ontem à noite.
pt-PT → ʃuˈvew ˈmũjtu ˈõtɐ̃j a ˈnojt
pt-BR → ʃoˈvew ˈmwĩtʊ ˈõtẽj a ˈnojtʃɪ
pt-AO → ʃoˈvew ˈmũjntʊ ˈõntẽj a ˈnojtɨ
pt-MZ → ʃoˈvew ˈmũjtu ˈõtẽj a ˈnɔjtɨ
pt-TL → ʃoˈvew ˈmujtʊ ˈõntɐ̃j a ˈnojtʰ
```

Onder de motorkap stuurt TugaPhone de gedeelde `orthography2ipa`-kandidaat-lattice-engine aan en legt daarbovenop Portugese specifieke zorgen via de eigen uitbreidingspunten van die engine. Het raadpleegt een gecureerd fonetisch lexicon (hetzelfde Portuguese Phonetic Lexicon hierboven) voor bekende woorden; voor alles wat niet in het lexicon staat — namen, neologismen, buitenlandse ontleningen — genereert de lattice kandidaten uit de grafeem- en allofoonregels van het dialect.

Twee details zijn het vermelden waard. **Getalnormalisatie** zet cijfers om in hun gesproken Portugese vormen, met correcte overeenkomst in geslacht en getal:

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
```

Het respecteert zelfs schaalconventies — lange schaal `biliões` voor `pt-PT`, korte schaal `trilhões` voor `pt-BR`. **Homograafdesambiguatie** wordt gedelegeerd aan de [bifonia](https://github.com/TigreGotico/bifonia)-bibliotheek, die de op betekenis gebaseerde kennis bezit van welke heterofone homografen bestaan en welke lezing ze dragen — zodat `para` als voorzetsel anders wordt behandeld dan `para` als werkwoord — en de gekozen lezing markeert met extra diakritische tekens voordat de lattice de zin ooit ziet.

TugaPhone fonemiseert door de gedeelde `orthography2ipa`-kandidaat-lattice aan te sturen: dialectkeuze *is* de keuze van de `orthography2ipa`-lectspecificatie, zodat dialectverschijnselen — betacisme, Porto's stijgende tweeklanken, Madeirese /l/-palatalisatie, Azorese /u/-frontering, coda-sisklank-sandhi en meer — uit de lattice zelf komen in plaats van uit achteraf toegepaste tekstbewerkingen. TugaPhone voegt alleen toe wat `orthography2ipa` bewust aan de aanroeper overlaat, aangesloten via de eigen uitbreidingspunten van die engine: geslachtsbewuste getal-/rangtelwoordexpansie en de heterofoonmarkering van bifonia draaien als de normalisatiefase van de engine voordat de lattice de tekst ziet; het gecureerde uitspraaklexicon van **[Tugalex](https://github.com/TigreGotico/tugalex)** is per lect geregistreerd via `orthography2ipa.register_lexicon`, zodat een gedekt woord in hetzelfde overschrijvingspad valt als de eigen uitzonderingen van een specificatie, en de lattice alleen kandidaten genereert voor woorden die het lexicon niet dekt; lettergreepverdeling komt van de eigen, door `silabificador` ondersteunde plugin van `orthography2ipa`, zodat de klemtoon op dezelfde lettergreep valt die TugaPhone anders zelf zou hebben gekozen. Kleine, samenstelbare onderdelen die één gedeelde engine voeden — elk op zichzelf bruikbaar.

TugaPhone is eerlijk over zijn grenzen: de lexicondekking is schaarser voor de Afrikaanse en Timorese dialecten, de subregionale accenten (Porto, Minho, Braga en andere) zijn experimentele benaderingen van gedocumenteerde kenmerken, en de prosodie op zinsniveau is vereenvoudigd. Dit zijn openlijk gedocumenteerde beperkingen, geen verborgen faalmodi.

### Het bredere plaatje: orthography2ipa

Het Portugees is één variëteit onder vele, en hetzelfde engineeringpatroon generaliseert. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) is een puur op data gebaseerd Python-pakket met linguïstisch gemotiveerde grafeem→IPA- en allofoonafbeeldingen, dat 820 talen over meer dan 20 taalfamilies bestrijkt. Het maakt een scherp onderscheid dat elk serieus G2P-systeem nodig heeft: een **grafeemkaart** zegt welke fonemen een spelling *kan* vertegenwoordigen, terwijl een **allofoonkaart** zegt hoe een foneem zich daadwerkelijk *manifesteert* in een gegeven context. Regionale variëteiten worden gemodelleerd als hun eigen specificaties, verbonden via gewogen afstamming met meerdere voorouders, zodat dialectbomen erven van hun ouders in plaats van data te dupliceren.

Dat is hetzelfde instinct achter `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ` en `pt-TL` in TugaPhone: behandel elke Lusofone variëteit als een volwaardige burger met zijn eigen regels, en niet als een afwijking van één canoniek accent. De data is declaratief en de logica is dun en pluggable — je kunt de regels lezen, hun bronnen citeren en de uitvoer vertrouwen.

### Probeer het uit

Alles hier is open source en vandaag nog installeerbaar:

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

Voor de bredere meertalige afbeeldingen, zie [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Deterministisch, snel, offline en gebouwd voor de volle breedte van de Portugeessprekende wereld.

Deze Portugese fonetiekstack bouwt voort op ons **[grafeem-naar-IPA-werk voor 820 talen](/nl/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, en vormt de fonetische ruggengraat voor **[TTS die op een aardappel draait](/nl/blog/2026-05-10-tts-that-runs-on-a-potato)** en de **[meertalige stemmen Miro & Dii](/nl/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
