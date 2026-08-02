---
title: "TTS-Modelle, die auf einer Kartoffel laufen"
description: "phoonnx ist ein Forschungs-Framework für VITS-basierte Sprachsynthese, gebaut, um bequem auf schwacher Hardware zu laufen. Keine GPU, keine Cloud, kein API-Schlüssel: nur eine ONNX-Stimme mit rund 15,65 Millionen Parametern und eine CPU. Hier erfahren Sie, wie klein eine gute Stimme sein kann und wie wir sie trainieren."
date: 2026-05-10
lang: de
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

Gute Sprachsynthese braucht weder eine GPU noch ein Cloud-Abonnement. Eine natürliche, mehrsprachige Stimme passt in etwas, das Sie sich
schämen würden, einen Server zu nennen: die Art von Platine, die Sie "nur für alle
Fälle" in einer Schublade aufbewahren. Eine Kartoffel.

[**phoonnx**](https://github.com/TigreGotico/phoonnx) ist unser Forschungs-Framework
für genau dieses Ziel: kleine VITS-basierte Stimmen, die **vollständig offline, auf
der CPU, auf günstiger Hardware** laufen und die wir außerdem *selbst* von Grund auf
trainieren können.

## Wie klein ist klein?

Nennen wir eine echte Zahl, anstatt vage darum herumzureden. Wir haben eine
Produktions-Stimme von phoonnx, die baskische "Miro"-Stimme
(`OpenVoiceOS/phoonnx_eu-ES_miro_espeak`), direkt von Hugging Face geholt und die
Gewichte im ONNX-Graphen gezählt:

```python
import onnx, numpy as np
m = onnx.load("miro_eu-ES.onnx")
print(sum(int(np.prod(i.dims)) for i in m.graph.initializer))
# 15650459
```

**~15,65 Millionen Parameter.** Das ist die gesamte Stimme: Encoder, Decoder und
alles andere, in einer 63-MB-Datei. Die weibliche "Dii"-Stimme aus derselben Veröffentlichung
kommt auf die *exakt gleiche* Zahl, weil sie sich die Standard-VITS-Architektur von
phoonnx teilen. Die Persönlichkeit steckt in den Gewichten, nicht in zusätzlicher
Kapazität.

Zur Einordnung: Eine einzelne Schicht eines "kleinen" modernen Sprachmodells kann mehr
Parameter tragen als dieser gesamte Sprachsynthesizer, und trotzdem spricht er fließend.

## Warum VITS und warum ONNX

[VITS](https://arxiv.org/abs/2106.06103) ist das Rückgrat jeder phoonnx-Stimme. Es ist
eine End-to-End-Architektur: Text (nun ja, Phoneme) hinein, Wellenform heraus, ohne
separaten Vocoder, den man beaufsichtigen müsste, und ohne autoregressive Schleife, die
sich Sample für Sample vorwärtsschleppt. Genau dieses End-to-End-Design macht es auf
einer Kartoffel handhabbar: ein Vorwärtsdurchlauf, parallele Synthese, fertig.

Wir bringen kein PyTorch an den Edge. Trainierte Stimmen werden nach **ONNX** exportiert
und laufen über [`onnxruntime`](https://onnxruntime.ai/) auf der **CPU**, ohne CUDA,
ohne GPU, ohne Treiber-Roulette. `onnxruntime` ist eine kompakte, portable
C++-Engine, und ein Graph mit 15 Millionen Parametern liegt gut im Bereich dessen, was
ein Kern der Raspberry-Pi-Klasse schneller als in Echtzeit verarbeitet.

Das Ergebnis ist
ein Sprachassistent, der weiterspricht, wenn Ihr Internet ausfällt, wenn der
Cloud-Anbieter eine Störung hat oder wenn Sie einfach nie wollten, dass das Audio Ihres
Zuhauses das Haus verlässt.

## Die Phoneme sind, wo die Intelligenz steckt

Ein winziges akustisches Modell kann es sich leisten, winzig zu sein, weil phoonnx die
schwere linguistische Arbeit *vorab* erledigt, im Phonemizer. Ein Phonemizer
(Graphem-zu-Phonem, oder G2P) wandelt geschriebenen Text in die Folge von Lauteinheiten
um, die das Modell tatsächlich spricht, sodass das VITS-Netz nie Rechtschreibung lernen
muss, nur Klang.

Unsere Arbeit an Phonemen fußt auf **[Graphem-zu-IPA für über 350 Sprachen](/de/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** und **[klassischer portugiesischer Phonetik](/de/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, die es ermöglichen, Stimmen für ressourcenarme Sprachen zu trainieren, ohne wochenlange Expertenannotation.

phoonnx ist bewusst phonemizer-agnostisch und bringt eine kleine Armee davon mit:
`espeak-ng`, [gruut](https://github.com/rhasspy/gruut),
[epitran](https://github.com/dmort27/epitran),
[misaki](https://github.com/hexgrad/misaki),
[transphone](https://github.com/xinjli/transphone) (das in die tausenden von Sprachen
hineinreicht, die in Glottolog katalogisiert sind), dazu Spezialisten wie
[mantoq](https://github.com/mush42/mantoq) für Arabisch,
**[cotovia](https://github.com/TigreGotico/pycotovia)** für Galicisch, OpenJTalk für
Japanisch und KoG2P für Koreanisch.

Sie geben IPA, ARPA, Pinyin, Hangul, Buckwalter aus: was auch immer die Sprache braucht. Es gibt sogar ein modellbasiertes mehrsprachiges
G2P, aufgebaut auf ByT5, nach ONNX exportiert wie alles andere.

Die Orthografie an den Phonemizer auszulagern ist der Trick, der es einem Modell mit 15
Millionen Parametern erlaubt, in einer ressourcenarmen Sprache gut zu klingen, die es
nie geschrieben gesehen hat.

## Ein Framework zum *Bauen* von Stimmen, nicht nur zum Ausführen

phoonnx ist
nicht nur ein Inferenz-Toolkit. Das begleitende Framework
[**`phoonnx_train`**](https://github.com/TigreGotico/phoonnx) ist die Art und Weise, wie
wir die Stimmen überhaupt erst *herstellen*.

`phoonnx_train` deckt die gesamte Pipeline ab:

- **Vorverarbeitung** eines Datensatzes im LJSpeech-Stil zu phonemisierten
  Trainingsdaten.
- **Training** des VITS-Generators (jene ~15,65M Parameter) auf einer einzelnen
  Consumer- oder Mid-Range-GPU. Ein derart kleines Modell braucht keinen
  Trainingscluster.
- **Export** des fertigen Checkpoints nach ONNX mit einem einzigen Skript, bereit, um
  direkt in `onnxruntime` auf einem Gerät eingesetzt zu werden.

Weil das Rezept offen ist und die Modelle klein sind, ist der Bau einer brandneuen
Stimme für eine Sprache, die *keine* offene Offline-Option hat, ein Projekt im Umfang
eines Wochenendes, nicht eines Forschungsstipendiums. So haben wir Lücken für
unterversorgte Sprachen gefüllt, darunter Baskisch, Mirandesisch, europäisches Portugiesisch und
mehr, anstatt darauf zu warten, dass ein Anbieter entscheidet, dass eine Sprache
kommerziell interessant ist.

## Bereits in Ihren Assistenten eingebunden

Sie müssen nichts davon von Hand zusammenkleben. phoonnx bringt ein natives
OpenVoiceOS-Plugin mit, `ovos-tts-plugin-phoonnx`, das Stimmen für Sie abruft und lädt:

```json
"tts": {
  "module": "ovos-tts-plugin-phoonnx",
  "ovos-tts-plugin-phoonnx": {
    "voice": "OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone"
  }
}
```

Lassen Sie die `voice` weg, und es wählt das erste Modell, das zu Ihrer Sprache passt.
Für die Verwaltung von Stimmen außerhalb eines Assistenten gibt es eine CLI,
`phoonnx-voices`, um Sprachen aufzulisten, Stimmen zu durchstöbern und Modelle
vorab herunterzuladen:

```bash
phoonnx-voices list-voices --lang pt-PT
phoonnx-voices download OpenVoiceOS/phoonnx_pt-PT_miro_tugaphone
```

Und weil phoonnx schlichtes VITS-über-ONNX spricht, führt seine Inferenz-Engine auch
Stimmen aus, die mit Piper, Mimic3, Coqui und MMS trainiert wurden: **über tausend
Sprachen und Stimmen** insgesamt. Ein kleines Runtime, und ein riesiger Katalog, nichts
davon telefoniert nach Hause.

## Der Punkt

Sprachtechnologie, die Sie respektiert, muss *dort laufen, wo Sie sind*, auf Ihrer
Hardware, unter Ihrer Kontrolle, mit ausgestecktem Netzwerkkabel, wenn Sie möchten.
phoonnx ist unsere Wette, dass der Weg dorthin nicht größere Modelle sind, sondern die
richtige Architektur, klein gemacht: VITS als Rückgrat, clevere Phonemizer, um die
linguistische Last zu tragen, ONNX für Portabilität und ein offenes Trainings-Framework,
damit jeder den Katalog wachsen lassen kann.

Fünfzehneinhalb Millionen Parameter, die auf der CPU laufen, trainiert auf Hardware,
die sich jeder leisten kann: Das ist die Trainings-Pipeline hinter jeder phoonnx-Stimme.
