---
title: "Klassieke NLP voor het Portugees: lettergreepverdeling en grafeem-naar-foneem"
description: "Een blik op onze op regels gebaseerde, volledig offline Portugese NLP-stack — silabificador voor lettergreepverdeling en TugaPhone voor dialectbewuste grafeem-naar-foneem — en hoe deze aansluiten op het bredere orthography2ipa-werk voor Lusofone variëteiten. Geen deep-learning-blackboxes: deterministisch, snel en met weinig afhankelijkheden."
date: 2026-02-28
lang: nl
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

Niet elk taalprobleem heeft een miljard parameters nodig. Een groot deel van de Portugese tekstverwerking wordt beheerst door regels die taalkundigen opschreven lang voordat iemand een neuraal netwerk trainde — regels over waar lettergrepen breken, waar de klemtoon valt en hoe een bepaalde spelling op een klank wordt afgebeeld. Wanneer die regels expliciet zijn, is het juiste gereedschap een kleine, deterministische, volledig offline bibliotheek die je kunt lezen, auditen en overal kunt draaien. Dat is de filosofie achter onze klassieke Portugese NLP-stack: [silabificador](https://github.com/TigreGotico/silabificador) voor lettergreepverdeling en [TugaPhone](https://github.com/TigreGotico/tugaphone) voor grafeem-naar-foneem (G2P).

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
pt-PT → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈoj·tɨ
pt-BR → ʃo·ˈvew mwˈĩ·tʊ ˈõ·tẽ ˈa nˈoj·tʃɪ
pt-AO → ʃo·ˈvew mˈũjn·tʊ ˈõ·tẽ ˈa nˈoj·tɨ
pt-MZ → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈɔj·tɨ
pt-TL → ʃo·ˈvew mˈuj·tʊ ˈõ·tẽ ˈa nˈojtʰ
```

Onder de motorkap is TugaPhone een **hybride** van twee klassieke technieken. Eerst raadpleegt het een gecureerd fonetisch lexicon (hetzelfde Portuguese Phonetic Lexicon hierboven) voor bekende woorden; voor alles wat niet in het lexicon staat — namen, neologismen, buitenlandse ontleningen — valt het terug op een op regels gebaseerde G2P-engine. De pijplijn is in elke fase expliciet: tekstnormalisatie, optionele woordsoortlabeling, lexiconopzoeking, op regels gebaseerde terugval en ten slotte dialectspecifieke transformaties.

Twee details zijn het vermelden waard. **Getalnormalisatie** zet cijfers om in hun gesproken Portugese vormen, met correcte overeenkomst in geslacht en getal:

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
normalize_numbers("1ª vez")                # primeira vez
```

Het respecteert zelfs schaalconventies — lange schaal `biliões` voor `pt-PT`, korte schaal `trilhões` voor `pt-BR`. **Homograafdesambiguatie** gebruikt woordsoortcontext, zodat `para` als voorzetsel anders wordt behandeld dan `para` als werkwoord. TugaPhone kan een spaCy- of Brill-tagger gebruiken wanneer die beschikbaar is, maar levert ook een op regels gebaseerde terugval zonder afhankelijkheden, trouw aan het offline-first-principe.

De architectuur is een heldere hiërarchie — zin → woord → grafeem → teken — met contextgevoelige regels die op elk niveau worden toegepast: klinkerkwaliteit en medeklinkerallofonen op tekenniveau, digraven zoals ⟨ch⟩ en ⟨nh⟩ en tweeklanken zoals ⟨ai⟩ en ⟨ou⟩ op grafeemniveau, klemtoon en lettergreepverdeling op woordniveau. TugaPhone hergebruikt `silabificador` voor de lettergreeplaag, naast de begeleidende bibliotheken **[Tugalex](https://github.com/TigreGotico/tugalex)** (lexicon en uitzonderingen) en **[TugaTagger](https://github.com/TigreGotico/tugatagger)** (woordsoortlabeling). Kleine, samenstelbare onderdelen — elk op zichzelf bruikbaar.

TugaPhone is eerlijk over zijn grenzen: de lexicondekking is schaarser voor de Afrikaanse en Timorese dialecten, de subregionale accenten (Porto, Minho, Braga en andere) zijn experimentele benaderingen van gedocumenteerde kenmerken, en de prosodie op zinsniveau is vereenvoudigd. Dit zijn openlijk gedocumenteerde beperkingen, geen verborgen faalmodi — precies het soort transparantie dat een op regels gebaseerd systeem mogelijk maakt.

### Het bredere plaatje: orthography2ipa

Het Portugees is één variëteit onder vele, en hetzelfde engineeringpatroon generaliseert. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) is een puur op data gebaseerd Python-pakket met linguïstisch gemotiveerde grafeem→IPA- en allofoonafbeeldingen, dat meer dan 350 taalcodes over meer dan 20 taalfamilies bestrijkt. Het maakt een scherp onderscheid dat elk serieus G2P-systeem nodig heeft: een **grafeemkaart** zegt welke fonemen een spelling *kan* vertegenwoordigen, terwijl een **allofoonkaart** zegt hoe een foneem zich daadwerkelijk *manifesteert* in een gegeven context. Regionale variëteiten worden gemodelleerd als hun eigen specificaties, verbonden via gewogen afstamming met meerdere voorouders, zodat dialectbomen erven van hun ouders in plaats van data te dupliceren.

Dat is hetzelfde instinct achter `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ` en `pt-TL` in TugaPhone: behandel elke Lusofone variëteit als een volwaardige burger met zijn eigen regels, en niet als een afwijking van één canoniek accent. De data is declaratief en de logica is dun en pluggable — je kunt de regels lezen, hun bronnen citeren en de uitvoer vertrouwen.

### Probeer het uit

Alles hier is open source en vandaag nog installeerbaar:

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

Voor de bredere meertalige afbeeldingen, zie [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Deterministisch, snel, offline en gebouwd voor de volle breedte van de Portugeessprekende wereld.

Deze Portugese fonetiekstack bouwt voort op ons **[grafeem-naar-IPA-werk voor meer dan 350 talen](/nl/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, en vormt de fonetische ruggengraat voor **[TTS die op een aardappel draait](/nl/blog/2026-05-10-tts-that-runs-on-a-potato)** en de **[meertalige stemmen Miro & Dii](/nl/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
