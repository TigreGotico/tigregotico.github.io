---
title: "Open spraakmodellen exporteren en kwantiseren zodat ze echt draaien"
description: "Een getraind spraakmodel op een onderzoeks-GitHub-pagina is geen spraakassistent. Wij zetten open ASR- en TTS-checkpoints om naar ONNX, CoreML en GGUF, kwantiseren ze en valideren de uitvoer — en publiceren de resultaten vervolgens onder OpenVoiceOS, zodat elke taal die ze dekken terechtkomt in een echte, offline assistent."
date: 2026-08-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "CoreML"
  - "GGUF"
  - "ASR"
  - "OVOS"
  - "OpenVoiceOS"
  - "Quantization"
  - "Open Source"
draft: false
---

Een spraakherkenningsmodel dat als onderzoekscheckpoint wordt gepubliceerd, is meestal een map met PyTorch-gewichten, een trainingsscript en een notitie over welke GPU ervoor is gebruikt. Dat is genoeg om een benchmarkscore te reproduceren. Het is niet genoeg om op een Raspberry Pi, een telefoon, of een laptop zonder internetverbinding te zetten. Van het een naar het ander komen is conversiewerk, en dat conversiewerk bepaalt grotendeels of een open spraakmodel ooit een echt apparaat bereikt.

Wij doen dit conversiewerk voor de kost: open ASR-modellen (automatische spraakherkenning, oftewel spraak-naar-tekst) en TTS-modellen (tekst-naar-spraak) omzetten naar bestanden die offline draaien, op gewone CPU's of on-device-versnellers, zonder dat er ten tijde van uitvoering een Python-trainingsstack nodig is. De meeste resultaten worden gepubliceerd onder de [OpenVoiceOS-organisatie](https://huggingface.co/OpenVoiceOS) op Hugging Face in plaats van onder onze eigen naam, en die keuze is bewust — hieronder meer over waarom.

## Waarom een checkpoint geen implementatie is

Een PyTorch- of NeMo-checkpoint verwacht een specifieke Python-omgeving: de juiste bibliotheekversies, meestal een GPU, en het trainingsframework zelf alleen al om inferentie te draaien. Die stack is groot, verandert voortdurend en is niet iets wat je wilt meeleveren in een spraakassistent die moet opstarten op een klein bordje.

Modelexport lost dit op door het getrainde netwerk om te zetten naar een formaat dat puur bedoeld is voor inferentie — geen trainingscode, geen autograd, geen vastzitten aan één framework. Wij richten ons op drie van zulke formaten, elk voor een andere implementatievorm:

- **[ONNX](https://onnxruntime.ai/)** (Open Neural Network Exchange) is een draagbaar graafformaat dat een breed scala aan runtimes kan uitvoeren, op CPU of GPU, op Linux, Windows, macOS of embedded bordjes. Het is ons standaarddoel omdat het overal draait waar `onnxruntime` draait, en dat is bijna overal.
- **CoreML** is Apples formaat voor on-device-inferentie. Een CoreML-pakket draait op de Neural Engine of GPU van een Mac of iPhone in plaats van op de CPU, wat van belang is voor realtime spraakherkenning op Apple-hardware.
- **[GGUF](https://github.com/ggml-org/llama.cpp)** is het formaat dat `llama.cpp` en het bijbehorende ecosysteem gebruiken, gebouwd voor gekwantiseerde, LLM-achtige modellen die met een kleine geheugenvoetafdruk moeten draaien. Wij gebruiken het voor de nieuwere, op transformers gebaseerde spraakmodellen die architectonisch dichter bij een taalmodel staan dan bij een klassiek akoestisch model.

Het juiste doel kiezen is geen cosmetische keuze. Een op conformer gebaseerd ASR-model (de architectuur achter de meeste moderne spraakherkenners, die convolutie en self-attention combineert) converteert probleemloos naar ONNX of CoreML. Een op Qwen3 gebaseerd spraakmodel is onder de motorkap een taalmodel, dus dat past van nature juist in de GGUF-/`llama.cpp`-pijplijn.

## Wat kwantisatie kost, en wat het oplevert

Kwantisatie betekent dat de gewichten van een model worden opgeslagen met minder bits per getal — 16-bit, 8-bit of 4-bit in plaats van de 32-bit floats waarmee het is getraind. Kleinere getallen leveren een kleiner bestand op en, op geschikte hardware, snellere inferentie, omdat er minder data hoeft te worden verplaatst en de rekenkunde goedkoper is.

We kunnen een exact cijfer plakken op de afweging voor één echt model. `nvidia/parakeet-tdt-0.6b-v3` is een ASR-model met 0,6 miljard parameters. De CoreML-mel-encoder-component is 1132,5 MB op volledige precisie; gepalettiseerd naar 4 bits wordt dat 284,2 MB — een reductie van 3,99x, vrijwel exact overeenkomend over de drie subcomponenten (encoder, decoder, joint-decision-netwerk). Over het hele pakket is de niet-gekwantiseerde CoreML-export ongeveer 1,14 GB; de 4-bit-versie ongeveer 293 MB. Dat is het verschil tussen een model dat comfortabel op een telefoon past en een model dat het maar net redt.

De prijs is nauwkeurigheid: minder bits per gewicht betekent minder precisie, en voorbij een bepaald punt vertaalt zich dat in meer herkenningsfouten. De standaardmanier om dat voor ASR te meten is WER (word error rate — het percentage woorden dat het model verkeerd heeft ten opzichte van een correct transcript). Daarom publiceren we meerdere kwantisatieniveaus van hetzelfde model naast elkaar — 4-bit, 6-bit, 8-bit (`int8`) en `fp16` — in plaats van er één te kiezen en te hopen dat die goed genoeg is voor elk apparaat. Een telefoon en een desktop kunnen zich verschillende punten op die curve veroorloven.

## Het validatieprobleem

Een conversie die stilzwijgend slechtere uitvoer produceert, is gevaarlijker dan helemaal geen conversie, want niets eraan lijkt kapot — het laadt, het draait, het herkent spraak alleen een beetje slechter, of een stuk slechter in een taal die je zelf niet spreekt en niet op het gehoor kunt controleren. De enige manier om dat op te vangen, is de uitvoer van het geëxporteerde model vergelijken met de oorspronkelijke referentie-implementatie op echte audio, voor elke taal en elk kwantisatieniveau, vóórdat het wordt gepubliceerd.

Dat is de basisvoorwaarde voor elke conversie die we uitbrengen: dezelfde audio door zowel het bronmodel als het geconverteerde model laten lopen en bevestigen dat ze het eens zijn. Het is geen glamoureuze stap, maar hem overslaan is precies hoe een "ondersteunde taal" stilletjes ophoudt te werken.

## Waarom de modellen onder OpenVoiceOS staan, en niet onder ons

Modelexport is een bedrijfsvaardigheid: geef ons een checkpoint en een doelapparaat, en wij krijgen het offline draaiend, gevalideerd, op het kwantisatieniveau dat bij jouw hardware past. Maar de geconverteerde modellen die we produceren uit open, niet-opdrachtgebonden checkpoints, gaan naar [OpenVoiceOS](https://huggingface.co/OpenVoiceOS), het open spraakassistentplatform waar deze modellen op zijn gebouwd om te draaien — niet naar onze eigen naamruimte.

De reden is eenvoudig: OpenVoiceOS is waar de modellen worden gebruikt. Een geconverteerd model in een bedrijfsaccount is een aardig artefact. Datzelfde model gepubliceerd op de plek waar [`ovos-stt-plugin-onnx-asr`](https://github.com/OpenVoiceOS/ovos-stt-plugin-onnx-asr), [`ovos-stt-plugin-coreml`](https://github.com/TigreGotico/ovos-stt-plugin-coreml), of [`ovos-stt-plugin-rover`](https://github.com/TigreGotico/ovos-stt-plugin-rover) het op naam kunnen vinden, is een taal die een echte assistent nu kan spreken of begrijpen. Publiceren onder de eigen organisatie van het platform is wat een conversie omzet in ondersteunde functionaliteit in plaats van een onderzoekscuriositeit, en het is hoe we ervoor zorgen dat dit werk eenmaal doen elke OpenVoiceOS-installatie ten goede komt, niet alleen de klant die erom vroeg.

Om duidelijk te zijn over toeschrijving: wij trainen deze akoestische modellen niet zelf vanaf nul, en we beweren dat ook niet. Het onderliggende onderzoek — NVIDIA's Parakeet- en Conformer-modellen, de IndicConformer-modellen van AI4Bharat voor Indiase talen, modellen van universiteiten en publieke instituten zoals het Galicische Proxecto Nós of de Conformer-modellen van het Baskische HiTZ-centrum, en onafhankelijke inspanningen om modellen voor Afrikaanse en minderheidstalen te converteren — behoort toe aan de teams die ze getraind hebben. Wat wij toevoegen is de conversie, de kwantisatie, de correctheidscontrole tegen het origineel, en de plugin-bekabeling waarmee een assistent het resultaat op naam kan laden.

De omvang van dat conversiewerk, rechtstreeks geteld uit wat is gepubliceerd: meer dan negentig Parakeet-ASR-varianten (over groottes, talen en kwantisatieniveaus) geëxporteerd naar ONNX en CoreML; meer dan dertig NVIDIA Conformer-modellen; tweeëntwintig AI4Bharat IndicConformer-modellen die talen met weinig hulpbronnen uit India dekken; tweeëntwintig wav2vec2-modellen voor talen waaronder Zweeds, IJslands, Faroees, Fins en beide geschreven vormen van het Noors; negen Conformer-modellen voor Baskisch en Galicisch; en onafhankelijk geconverteerde Whisper- en wav2vec2-modellen die Afrikaanse en creoolse talen dekken zoals Shona, Zoeloe, Xhosa, Malagasi, Haïtiaans Creools en Kabylisch. Als je alleen bevestigde ASR-conversies telt per afzonderlijke taalcode, zijn dat minstens 74 verschillende talen met vandaag een offline, gekwantiseerde spraakherkenner beschikbaar — nog vóórdat je de aparte catalogus meetelt van TTS-stemmen geëxporteerd voor talen zoals Baskisch, Aragonees, Asturisch, Galicisch, Occitaans en Arabisch.

## Als jouw taal of jouw apparaat vandaag niets offline heeft

De meeste talen krijgen nooit een commerciële offline spraakoptie, omdat de markt voor die ene taal een leverancier er niet toe brengt er een te bouwen. Het patroon hierboven — een bestaand open checkpoint nemen, converteren naar een formaat dat draait op de hardware die je daadwerkelijk hebt, kwantiseren zodat het past, verifiëren tegen het origineel, en inbouwen in een plugin — hangt niet af van marktgrootte. Het hangt af van de aanwezigheid van een open checkpoint om mee te beginnen, en dat is steeds vaker het normale geval.

Heb je een spraakmodel dat alleen op een trainings-GPU draait, of een apparaat dat momenteel geen offline spraakondersteuning heeft in zijn taal, [neem dan contact op](/nl/contact) of bekijk hoe dit werk er van begin tot eind uitziet op [onze diensten-pagina](/nl/services).
