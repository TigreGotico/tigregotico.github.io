---
title: "Een familie van pure-ONNX-spraakbibliotheken"
description: "TigreGótico onderhoudt een reeks spraakbibliotheken — bandbreedte-extensie, voice cloning, sprekersembeddings, VAD, woordklemtoon, fonemisatie, TTS, en een metrics-bibliotheek om ze allemaal te scoren — die één runtime-regel delen: alleen onnxruntime en numpy, geen PyTorch, geen GPU vereist."
date: 2026-08-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "TTS"
  - "voice cloning"
  - "VAD"
  - "self-hosted"
  - "phoonnx"
draft: false
---

ONNX is een bestandsformaat voor een getraind neuraal netwerk: de gewichten en de rekengraaf, bevroren, zonder afhankelijkheid van het framework waarmee het is getraind. Een naar ONNX geëxporteerd model kan draaien via **ONNX Runtime**, een kleine inferentie-engine die niets anders doet dan die graaf uitvoeren. Ze weet niet hoe het model is getraind, ondersteunt geen training, en heeft geen PyTorch of TensorFlow nodig.

Verschillende van onze bibliotheken houden zich aan één regel: ten tijde van uitvoering zijn de enige afhankelijkheden `onnxruntime` en `numpy`. Niet "meestal": het importeren van het pakket zelf haalt nooit een trainingsframework binnen.

`audiosronnx` (bandbreedte-extensie en ruisonderdrukking), `voiceclonnx` (voice cloning), `speakeronnx` (sprekersembeddings), `speechonnxmetrics` (evaluatie), `stressonnx` (woordklemtoon), `vadonnx` (voice activity detection) en `phoonnx` (fonemisatie en tekst-naar-spraak) volgen dit allemaal, elk in zijn eigen PyPI-pakket. Nog twee, `phoonnx.js` en `precise-onnx-js`, passen hetzelfde idee toe in de browser, met `onnxruntime-web` in plaats daarvan.

## Waarom de moeite

De voor de hand liggende manier om een spraakmodel uit te brengen, is het trainingsframework ook voor inferentie te blijven gebruiken. Dat is handig tijdens ontwikkeling. Het is een risico in productie.

- **Installatiegrootte.** Een PyTorch + CUDA-installatie loopt al op tegen gigabytes voordat je ook maar één model hebt geladen. `onnxruntime` en `numpy` samen zijn een paar tientallen megabytes.
- **Geen CUDA om te beheren.** Het op elkaar afstemmen van een GPU-driver, een CUDA-toolkitversie en een frameworkbuild is een terugkerende bron van kapotgaan. CPU-only ONNX Runtime slaat dat helemaal over, en draait nog steeds dezelfde graaf op een GPU waar die beschikbaar is.
- **Draait op bescheiden hardware.** Een Raspberry Pi of een laptop van tien jaar oud kan `onnxruntime` comfortabel draaien. Meestal kan zo'n apparaat geen volledige PyTorch-stack draaien op een bruikbare snelheid, of hem zelfs helemaal niet installeren op een 32-bit of geheugenbeperkt bordje.
- **Eén artefact, elk platform.** Hetzelfde `.onnx`-bestand draait ongewijzigd op Linux, macOS, Windows — en, via `onnxruntime-web`, in een browsertabblad. Er is geen aparte exportstap per doel.
- **Geen versieconflicten tussen training en serving.** Een trainingsstack pint specifieke framework- en CUDA-versies vast. Een servingstack wil de kleinste, meest stabiele set afhankelijkheden mogelijk. Ze scheiden betekent de een kunnen upgraden zonder de ander te breken.

## Wat het kost

De beperking is echt, en ze is niet gratis.

### Je kunt niet in-process finetunen

Een ONNX-graaf heeft geen optimizer, geen backward pass. Elk van deze bibliotheken behandelt modellen als vaste artefacten: je laadt ze en je draait ze. Training of finetuning gebeurt apart, met het oorspronkelijke framework, en het resultaat wordt daarna naar ONNX geëxporteerd. `stressonnx` en `speechonnxmetrics` houden allebei een optionele `export`-extra aan die puur voor die offline-conversiestap `torch` binnenhaalt, nooit voor inferentie.

### Niet elke architectuur exporteert probleemloos

Dynamische controlestroom, aangepaste CUDA-kernels, of operaties zonder ONNX-equivalent kunnen een eenvoudige export blokkeren. De README van `audiosronnx` documenteert dit rechtstreeks: hij houdt een [lijst van niet-uitgebrachte modellen](https://github.com/TigreGotico/audiosronnx) bij die zijn geëvalueerd en afgewezen, met redenen, in plaats van te doen alsof elk onderzoeksmodel zomaar overgezet kan worden.

### Voorbewerking moet met de hand opnieuw geïmplementeerd worden

Een framework als PyTorch of Kaldi levert snelle, geteste implementaties van STFT (een golfvorm omzetten in een spectrogram), mel-filterbankkenmerken en resampling. Zodra het model zelf niet meer van dat framework afhangt, kan de voorbewerking dat ook niet meer.

`speakeronnx` implementeert om precies die reden een 80-bands log-mel-filterbank opnieuw in pure NumPy, en `audiosronnx` doet hetzelfde voor STFT en resampling. Het is meer code om goed te krijgen, en het heeft eigen pariteitstests nodig tegen het origineel.

## Eén taak, meerdere engines, één API

Getrainde spraakmodellen verschillen enorm naar taal, opnamecondities en doeldomein. Een sprekersverificatiemodel getraind op schone voorgelezen spraak kan falen op telefoonaudio. Een voice-cloningmodel afgesteld op Engelse timbre-overdracht kan verstaanbaarheid verliezen op toontalen.

Er is geen enkel model dat overal wint, dus je vooraf op één vastleggen is gokken.

Elke bibliotheek in deze familie kiest één taak en verpakt verschillende onafhankelijk gepubliceerde modellen achter één interface, zodat het wisselen van engine een wijziging van één regel is in plaats van een herschrijving.

`audiosronnx` scheidt zijn twee taken — ruisonderdrukking en bandbreedte-extensie (een smalbandige opname, zoals 8 kHz-telefoonaudio, omzetten in een voller klinkend signaal met een hogere samplerate) — achter twee laders, elk ondersteund door meerdere engines:

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

`load_denoise` registreert momenteel tien ruisonderdrukkers (`dpdfnet`, `mossformer2`, `frcrn`, `mpsenet`, `gtcrn`, `cmgan`, `metadenoiser`, `mossformergan`, `voicefixer`, `deepfilternet`), van een model van 0,54 MB tot een van 415 MB, onder verschillende licenties. `load_sr` registreert zeven bandbreedte-extenders (`lavasr`, `novasr`, `flowhigh`, `hifiganbwe`, `apbwe`, `sidon`, `callenhancer`).

Gedomineerde modellen, modellen die een andere engine op elke gemeten as verslaat, blijven toch in het register staan, zodat een gepubliceerd benchmarkresultaat op aanvraag reproduceerbaar blijft.

`voiceclonnx` hanteert dezelfde aanpak voor voice cloning — de stem in een bestaande opname omzetten zodat die klinkt als een andere referentiespreker, zonder via tekst te gaan:

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

Er zijn tien engines geregistreerd (`facodec`, `openvoice`, `chatterbox`, `triaan`, `cosyvoice`, `bicodec`, `knnvc`, `focalcodec`, `lscodec`, `rvc`), verspreid over zes verschillende modelfamilies: kNN-kenmerkuitwisseling, gefactoriseerde codec, flow-matching, toonkleuroverdracht, AR-codec-LM en sprekersontkoppelde codec.

Elke engine levert gepubliceerde cijfers voor verstaanbaarheid en sprekersgelijkenis, zodat het kiezen van een engine een vergelijking is, geen muntworp.

`vadonnx` past het patroon toe op voice activity detection — bepalen welke delen van een audiostream überhaupt spraak bevatten:

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

Zes modelfamilies zijn geregistreerd (`silero`, `marblenet`, `pyannote`, `fsmn`, `speechbrain`, `ten`), en een declaratieve `IOSignature` laat één generieke engine de meeste ervan aansturen, of wijst naar elk aangepast `.onnx`-VAD-bestand.

`speakeronnx` extraheert een **sprekersembedding** — een vector van vaste lengte die samenvat wie er spreekt, onafhankelijk van wat er gezegd is — en vergelijkt twee embeddings via cosine-gelijkenis om te controleren of twee clips dezelfde spreker zijn:

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

Het registreert negen modellen over vier architectuurfamilies (WeSpeaker, CAM++, ERes2Net, ReDimNet), met gepubliceerde embeddingdimensies en licenties.

`stressonnx` kiest woordklemtoon voor tekst-naar-spraak-frontends — welke lettergreep van een woord de nadruk draagt, informatie die veel talen niet uitspellen (Russisch *за́мок*, kasteel, versus *замо́к*, slot, delen elke letter). Het registreert een neurale pijplijn voor het Russisch, een tweede voor het Oekraïens en Wit-Russisch, en een op regels en woordenlijst gebaseerde backend die 26 talen dekt zonder enige neurale inferentie:

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

`phoonnx` fonemiseert tekst (zet gespelde woorden om in de klankeenheden die een TTS-model verbruikt) en draait tekst-naar-spraak over 17 geregistreerde synthese-engines en stemmen geëxporteerd uit verschillende ecosystemen (native phoonnx, Piper, Mimic3, Coqui, MMS, Transformers):

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

`phoonnx.js` draagt dezelfde tokenizer-paden over naar de browser met `onnxruntime-web`, en `precise-onnx-js` port wakewoorddetectie (MFCC-kenmerkextractie plus een ONNX-classificator, compatibel met Mycroft Precise-modellen) naar JavaScript, beide zonder server:

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

Gewichten voor `audiosronnx` (18 gepubliceerde modellen) en `voiceclonnx` (10 gepubliceerde modellen) staan als aparte downloads op de [TigreGótico Hugging Face-organisatie](https://huggingface.co/TigreGotico), opgehaald bij eerste gebruik en lokaal gecachet, zodat het kiezen van een andere engine een configuratiewijziging is, geen herimplementatie.

## Meten welke engine daadwerkelijk wint

Veel engines achter één API registreren betaalt zich alleen uit als je kunt zeggen welke engine daadwerkelijk beter is voor jouw invoer. Daarvoor is `speechonnxmetrics`: een metrics-bibliotheek gebouwd op dezelfde `numpy` + `onnxruntime`-beperking, zodat het scoren van een model niets extra's kost om te installeren.

Het groepeert metrieken in drie soorten. **No-reference MOS**-schatters (UTMOS, DNSMOS, NISQA, SIGMOS) voorspellen een **Mean Opinion Score**, de natuurlijkheidsbeoordeling van 1 tot 5 die een menselijk luisterpanel aan een clip zou geven, zonder dat er een schone referentie nodig is om tegen te vergelijken.

**Intrusieve metrieken** (STOI, short-time objective intelligibility; SI-SDR, scale-invariant signal-to-distortion ratio; MCD, mel-cepstral distortion) hebben een overeenkomende schone referentie nodig en meten hoe dicht de uitvoer daarbij in de buurt komt. **Op ASR gebaseerde tekstmetrieken**, WER (word error rate) en CER (character error rate), laten een spraakherkenner over de uitvoer lopen en vergelijken het transcript met de verwachte tekst, waarmee gevallen worden opgevangen waarin een model audio produceert die goed klinkt maar de verkeerde woorden zegt.

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

Dit verandert het kiezen van een engine van een luistertest in een tabel. `voiceclonnx` publiceert precies die vergelijking voor zijn tien cloning-engines: WER tegen het brontranscript plus een aparte sprekersgelijkenisscore voor elk, zodat "facodec geeft 0% WER" of "lscodec ruilt WER in voor sterkere timbre-overdracht" gemeten claims zijn, geen indrukken.

Vermenigvuldig dat over talen en opnamecondities en handmatig vergelijken houdt op realistisch te zijn. Een objectieve metriek is wat een register van tien engines beheersbaar houdt.

## Waar dit nuttig is

Als je offline spraakverwerking nodig hebt (een opname opschonen, een stem klonen, detecteren wie er spreekt, of er een synthetiseren) op hardware die nooit een GPU zal zien, is dit de vorm om naar te zoeken: een kleine runtime-afhankelijkheid, een keuze uit gepubliceerde modellen in plaats van één vaste standaard, en een manier om te meten welke daadwerkelijk werkt voor jouw geval.

Elke bibliotheek hierboven is een `pip install` verwijderd, MIT- of Apache-gelicentieerd op codeniveau (individuele modelgewichten dragen hun eigen upstream-licenties, gedocumenteerd per engine), en draait hetzelfde op een laptop, een server, of een Raspberry Pi.

Neem contact op via [/contact](/nl/contact) of bekijk wat we verder bouwen op [/services](/nl/services).
