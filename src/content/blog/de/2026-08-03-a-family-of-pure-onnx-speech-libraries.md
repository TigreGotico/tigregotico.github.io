---
title: "Eine Familie reiner ONNX-Sprachbibliotheken"
description: "TigreGótico pflegt eine Reihe von Sprachbibliotheken — Bandbreitenerweiterung, Voice Cloning, Sprecher-Embeddings, VAD, Wortbetonung, Phonemisierung, TTS und eine Metrik-Bibliothek, um sie alle zu bewerten — die sich an eine gemeinsame Laufzeitregel halten: nur onnxruntime und numpy, kein PyTorch, keine GPU erforderlich."
date: 2026-08-03
lang: de
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

ONNX ist ein Dateiformat für ein trainiertes neuronales Netz: die Gewichte und der
Berechnungsgraph, eingefroren, ohne Abhängigkeit von dem Framework, das es trainiert
hat. Ein nach ONNX exportiertes Modell kann über **ONNX Runtime** laufen, eine kleine
Inferenz-Engine, die nichts anderes tut, als diesen Graphen auszuführen. Sie weiß
nicht, wie das Modell trainiert wurde, unterstützt kein Training und braucht kein
installiertes PyTorch oder TensorFlow.

Mehrere unserer Bibliotheken halten sich an eine Regel: Zur Laufzeit sind die
einzigen Abhängigkeiten `onnxruntime` und `numpy`. Nicht "meistens" — der Import
des Pakets selbst zieht niemals ein Trainings-Framework nach. `audiosronnx`
(Bandbreitenerweiterung und Entrauschung), `voiceclonnx` (Voice Cloning),
`speakeronnx` (Sprecher-Embeddings), `speechonnxmetrics` (Evaluierung), `stressonnx`
(Wortbetonung), `vadonnx` (Sprachaktivitätserkennung) und `phoonnx` (Phonemisierung
und Text-zu-Sprache) folgen dieser Regel alle, jede in ihrem eigenen PyPI-Paket.
Zwei weitere, `phoonnx.js` und `precise-onnx-js`, setzen dieselbe Idee im Browser
um, mit `onnxruntime-web` statt.

## Warum der Aufwand

Der naheliegende Weg, ein Sprachmodell auszuliefern, besteht darin, das
Trainings-Framework auch für die Inferenz zu behalten. Das ist während der
Entwicklung bequem. In der Produktion ist es eine Belastung.

- **Installationsgröße.** Eine PyTorch-+-CUDA-Installation läuft in
  Gigabyte-Bereiche, bevor Sie auch nur ein einziges Modell geladen haben.
  `onnxruntime` und `numpy` zusammen sind wenige Dutzend Megabyte.
- **Kein CUDA zu verwalten.** Einen GPU-Treiber, eine CUDA-Toolkit-Version und
  einen Framework-Build passend zu halten, ist eine wiederkehrende Quelle für
  Ausfälle. Reines CPU-ONNX-Runtime umgeht das vollständig und läuft trotzdem auf
  einer GPU, sofern eine verfügbar ist, mit demselben Graphen.
- **Läuft auf bescheidener Hardware.** Ein Raspberry Pi oder ein zehn Jahre alter
  Laptop kann `onnxruntime` bequem ausführen. Einen vollständigen PyTorch-Stack
  kann er meist nicht mit brauchbarer Geschwindigkeit ausführen, oder auf einer
  32-Bit- oder speicherbeschränkten Platine überhaupt nicht installieren.
- **Ein Artefakt, jede Plattform.** Dieselbe `.onnx`-Datei läuft unverändert auf
  Linux, macOS, Windows — und, über `onnxruntime-web`, in einem Browser-Tab. Es
  gibt keinen separaten Exportschritt pro Ziel.
- **Keine Konflikte zwischen Trainings- und Serving-Versionen.** Ein
  Trainings-Stack pinnt bestimmte Framework- und CUDA-Versionen fest. Ein
  Serving-Stack will die kleinstmögliche, stabilste Menge an Abhängigkeiten. Sie
  zu trennen bedeutet, eine aktualisieren zu können, ohne die andere zu brechen.

## Was es kostet

Die Einschränkung ist real, und sie ist nicht umsonst.

**Sie können nicht In-Process feinabstimmen.** Ein ONNX-Graph hat keinen
Optimizer, keinen Backward-Pass. Jede dieser Bibliotheken behandelt Modelle als
feste Artefakte: Sie laden sie und führen sie aus. Training oder Fine-Tuning
geschieht separat, mit dem ursprünglichen Framework, und das Ergebnis wird
anschließend nach ONNX exportiert. `stressonnx` und `speechonnxmetrics` behalten
beide ein optionales `export`-Extra, das `torch` ausschließlich für diesen
Offline-Konvertierungsschritt zieht — niemals für die Inferenz.

**Nicht jede Architektur exportiert sauber.** Dynamischer Kontrollfluss,
benutzerdefinierte CUDA-Kernel oder Operationen ohne ONNX-Äquivalent können einen
geradlinigen Export blockieren. Das README von `audiosronnx` dokumentiert das
direkt: Es führt eine [Liste nicht ausgelieferter Modelle](https://github.com/TigreGotico/audiosronnx),
die evaluiert und abgelehnt wurden, samt Gründen, statt so zu tun, als würde
jedes Forschungsmodell sich problemlos portieren lassen.

**Vorverarbeitung muss von Hand neu implementiert werden.** Ein Framework wie
PyTorch oder Kaldi liefert schnelle, getestete Implementierungen von STFT
(Umwandlung einer Wellenform in ein Spektrogramm), Mel-Filterbank-Merkmalen und
Resampling. Sobald das Modell selbst nicht mehr von diesem Framework abhängt,
kann seine Vorverarbeitung das auch nicht mehr — `speakeronnx` implementiert aus
genau diesem Grund eine 80-Band-Log-Mel-Filterbank in reinem NumPy neu, und
`audiosronnx` tut dasselbe für STFT und Resampling. Es ist mehr Code, den man
richtig hinbekommen muss, und er braucht eigene Paritätstests gegen das Original.

## Eine Aufgabe, mehrere Engines, eine API

Trainierte Sprachmodelle variieren enorm nach Sprache, Aufnahmebedingung und
Zieldomäne. Ein auf sauberer Lesesprache trainiertes
Sprecherverifikationsmodell kann bei Telefonaudio versagen. Ein für englische
Klangfarbenübertragung abgestimmtes Voice-Cloning-Modell kann bei Tonsprachen
an Verständlichkeit verlieren. Es gibt kein einziges Modell, das überall
gewinnt, sodass eine Festlegung im Voraus eine Vermutung ist.

Jede Bibliothek in dieser Familie wählt eine einzelne Aufgabe und umschließt
mehrere unabhängig veröffentlichte Modelle hinter einer Schnittstelle, sodass
der Wechsel der Engine eine einzeilige Änderung ist statt einer Neufassung.

`audiosronnx` trennt seine zwei Aufgaben — Entrauschung und
Bandbreitenerweiterung (die Umwandlung einer Schmalbandaufnahme, etwa
8-kHz-Telefonaudio, in ein volleres klingendes Signal mit höherer Abtastrate) —
hinter zwei Loadern, jeder von mehreren Engines gestützt:

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

`load_denoise` registriert derzeit zehn Entrauscher (`dpdfnet`, `mossformer2`,
`frcrn`, `mpsenet`, `gtcrn`, `cmgan`, `metadenoiser`, `mossformergan`,
`voicefixer`, `deepfilternet`), von einem 0,54-MB-Modell bis zu einem
415-MB-Modell, unter unterschiedlichen Lizenzen. `load_sr` registriert sieben
Bandbreitenerweiterer (`lavasr`, `novasr`, `flowhigh`, `hifiganbwe`, `apbwe`,
`sidon`, `callenhancer`). Dominierte Modelle — solche, die eine andere Engine
auf jeder gemessenen Achse schlägt — bleiben trotzdem in der Registry, sodass
ein veröffentlichtes Benchmark-Ergebnis auf Abruf reproduzierbar bleibt.

`voiceclonnx` verfolgt denselben Ansatz für Voice Cloning — die Umwandlung der
Stimme in einer bestehenden Aufnahme, damit sie wie ein anderer
Referenzsprecher klingt, ohne den Umweg über Text:

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

Zehn Engines sind registriert (`facodec`, `openvoice`, `chatterbox`, `triaan`,
`cosyvoice`, `bicodec`, `knnvc`, `focalcodec`, `lscodec`, `rvc`), die sechs
unterschiedliche Modellfamilien umfassen — kNN-Feature-Swap, faktorisierter
Codec, Flow-Matching, Klangfarbenübertragung, AR-Codec-LM und
sprecherentkoppelter Codec. Im Hintergrund liefert jede davon veröffentlichte
Verständlichkeits- und Sprecherähnlichkeitswerte, sodass die Wahl einer Engine
ein Vergleich ist, kein Münzwurf.

`vadonnx` wendet das Muster auf Sprachaktivitätserkennung an — die
Entscheidung, welche Teile eines Audiostreams überhaupt Sprache enthalten:

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

Sechs Modellfamilien sind registriert (`silero`, `marblenet`, `pyannote`,
`fsmn`, `speechbrain`, `ten`), und eine deklarative `IOSignature` lässt eine
einzige generische Engine die meisten davon ansteuern oder auf jede
benutzerdefinierte `.onnx`-VAD-Datei zeigen.

`speakeronnx` extrahiert ein **Sprecher-Embedding** — einen Vektor fester
Länge, der zusammenfasst, wer spricht, unabhängig davon, was gesagt wurde —
und vergleicht zwei Embeddings per Kosinus-Ähnlichkeit, um zu prüfen, ob zwei
Clips vom selben Sprecher stammen:

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

Es registriert neun Modelle über vier Architekturfamilien (WeSpeaker, CAM++,
ERes2Net, ReDimNet), mit veröffentlichten Embedding-Dimensionen und Lizenzen.

`stressonnx` wählt die Wortbetonung für Text-zu-Sprache-Frontends — welche
Silbe eines Wortes die Betonung trägt, eine Information, die viele Sprachen
nicht ausbuchstabieren (Russisch *за́мок*, Schloss, gegenüber *замо́к*, Schloss
(Verschluss), teilen jeden Buchstaben). Es registriert eine neuronale Pipeline
für Russisch, eine zweite für Ukrainisch und Belarussisch und ein
Regel-und-Wörterbuch-Backend, das 26 Sprachen ganz ohne neuronale Inferenz
abdeckt:

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

`phoonnx` phonemisiert Text (verwandelt geschriebene Wörter in die
Klangeinheiten, die ein TTS-Modell verarbeitet) und führt Text-zu-Sprache über
17 registrierte Synthese-Engines und Stimmen aus mehreren Ökosystemen aus
(natives phoonnx, Piper, Mimic3, Coqui, MMS, Transformers):

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

`phoonnx.js` trägt dieselben Tokenizer-Pfade in den Browser mit
`onnxruntime-web`, und `precise-onnx-js` portiert Weckwort-Erkennung
(MFCC-Merkmalsextraktion plus ein ONNX-Klassifikator, kompatibel mit
Mycroft-Precise-Modellen) nach JavaScript, beide ohne Server:

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

Gewichte für `audiosronnx` (18 veröffentlichte Modelle) und `voiceclonnx` (10
veröffentlichte Modelle) liegen als separate Downloads auf der
[TigreGótico-Hugging-Face-Organisation](https://huggingface.co/TigreGotico),
werden bei der ersten Nutzung geholt und lokal zwischengespeichert, sodass die
Wahl einer anderen Engine eine Konfigurationsänderung ist, keine
Neubereitstellung.

## Den Kreis schließen: Engines bewerten statt raten

Viele Engines hinter einer API zu registrieren, zahlt sich nur aus, wenn Sie
erkennen können, welche für Ihre Eingabe tatsächlich besser ist. Dafür ist
`speechonnxmetrics` da: eine Metrik-Bibliothek, die auf derselben
`numpy`-+-`onnxruntime`-Beschränkung aufbaut, sodass die Bewertung eines
Modells keine zusätzlichen Installationskosten verursacht.

Sie gruppiert Metriken in drei Arten. **Referenzlose MOS**-Schätzer — UTMOS,
DNSMOS, NISQA, SIGMOS — sagen einen **Mean Opinion Score** vorher, die
1-bis-5-Natürlichkeitsbewertung, die ein menschliches Hörer-Panel einem Clip
geben würde, ohne eine saubere Referenz zum Vergleich zu brauchen.
**Intrusive Metriken** — STOI (Short-Time Objective Intelligibility), SI-SDR
(skaleninvariantes Signal-zu-Verzerrungs-Verhältnis), MCD
(Mel-Cepstral-Distortion) — brauchen eine passende saubere Referenz und messen,
wie nah die Ausgabe daran liegt. **ASR-basierte Textmetriken** — WER (Word
Error Rate) und CER (Character Error Rate) — führen einen Spracherkenner über
die Ausgabe und vergleichen die Transkription mit dem erwarteten Text, wobei
sie Fälle erfassen, in denen ein Modell Audio produziert, das gut klingt, aber
die falschen Wörter sagt.

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

Das verwandelt die Wahl der Engine von einem Hörtest in eine Tabelle.
`voiceclonnx` veröffentlicht genau diesen Vergleich für seine zehn
Cloning-Engines — WER gegen die Quelltranskription plus einen separaten
Sprecherähnlichkeitswert für jede, sodass „facodec liefert 0 % WER" oder
„lscodec tauscht WER gegen stärkere Klangfarbenübertragung" gemessene
Aussagen sind, keine Eindrücke. Multipliziert man das über Sprachen und
Aufnahmebedingungen, hört manueller Vergleich auf, realistisch zu sein; eine
objektive Metrik ist das, was eine Zehn-Engine-Registry benutzbar macht statt
überwältigend.

## Wo das nützlich ist

Wenn Sie Offline-Sprachverarbeitung brauchen — eine Aufnahme säubern, eine
Stimme klonen, erkennen, wer spricht, oder eine synthetisieren — auf Hardware,
die nie eine GPU sehen wird, ist das die Form, nach der Sie suchen sollten:
eine kleine Laufzeitabhängigkeit, eine Wahl unter veröffentlichten Modellen
statt eines einzigen festen Standards, und eine Möglichkeit zu messen, welches
für Ihren Fall tatsächlich funktioniert. Jede der oben genannten Bibliotheken
ist ein `pip install` entfernt, auf Code-Ebene MIT- oder Apache-lizenziert
(einzelne Modellgewichte tragen ihre eigenen Upstream-Lizenzen, pro Engine
dokumentiert), und läuft gleich auf einem Laptop, einem Server oder einem
Raspberry Pi.

Nehmen Sie Kontakt auf über [/contact](/contact) oder sehen Sie, was wir sonst
noch bauen, unter [/services](/services).
