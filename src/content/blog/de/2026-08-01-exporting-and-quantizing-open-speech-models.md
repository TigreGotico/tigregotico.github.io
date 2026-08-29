---
title: "Offene Sprachmodelle exportieren und quantisieren, damit sie wirklich laufen"
description: "Ein trainiertes Sprachmodell auf einer Forschungs-GitHub-Seite ist kein Sprachassistent. Wir konvertieren offene ASR- und TTS-Checkpoints nach ONNX, CoreML und GGUF, quantisieren sie und validieren die Ausgabe. Dann veröffentlichen wir die Ergebnisse unter OpenVoiceOS, sodass jede von ihnen abgedeckte Sprache in einem echten, offline arbeitenden Assistenten landet."
date: 2026-08-01
lang: de
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

Ein als Forschungs-Checkpoint veröffentlichtes Spracherkennungsmodell ist meist ein
Ordner mit PyTorch-Gewichten, ein Trainingsskript und ein Hinweis darauf, mit welcher
GPU es trainiert wurde. Das reicht aus, um einen Benchmark-Wert zu reproduzieren. Es
reicht nicht aus, um es auf einen Raspberry Pi, ein Telefon oder einen Laptop ohne
Internetverbindung zu bringen. Der Weg vom einen zum anderen ist Konvertierungsarbeit,
und sie macht den größten Teil dessen aus, was darüber entscheidet, ob ein offenes
Sprachmodell jemals ein echtes Gerät erreicht.

Wir leisten diese Konvertierungsarbeit hauptberuflich: Wir nehmen offene ASR-Modelle
(automatische Spracherkennung, also Sprache-zu-Text) und TTS-Modelle (Text-zu-Sprache)
und verwandeln sie in Dateien, die offline laufen, auf gewöhnlichen CPUs oder
On-Device-Beschleunigern, ohne dass zur Laufzeit ein Python-Trainings-Stack
erforderlich ist. Die meisten Ergebnisse werden unter der
[OpenVoiceOS-Organisation](https://huggingface.co/OpenVoiceOS) auf Hugging Face
veröffentlicht statt unter unserer eigenen, und diese Entscheidung ist bewusst
getroffen. Mehr dazu weiter unten.

## Warum ein Checkpoint keine Bereitstellung ist

Ein PyTorch- oder NeMo-Checkpoint (NVIDIAs Toolkit für das Modelltraining) erwartet eine bestimmte Python-Umgebung: die
richtigen Bibliotheksversionen, meist eine GPU, und das Trainings-Framework selbst
nur, um Inferenz auszuführen. Dieser Stack ist groß, ändert sich ständig und ist
nichts, das Sie in einem Sprachassistenten ausliefern möchten, der auf einer kleinen
Platine booten muss.

Modell-Export löst dies, indem das trainierte Netzwerk in ein Format konvertiert
wird, das ausschließlich für Inferenz gedacht ist, ohne Trainingscode, ohne
Autograd (die Maschinerie, mit der ein Framework während des Trainings Gradienten berechnet), und ohne Framework-Bindung. Wir zielen auf drei solcher Formate ab, jedes für
eine andere Einsatzform:

- **[ONNX](https://onnxruntime.ai/)** (Open Neural Network Exchange) ist ein
  portables Graph-Format, das eine breite Palette von Laufzeitumgebungen ausführen
  kann, auf CPU oder GPU, unter Linux, Windows, macOS oder auf eingebetteten
  Platinen. Es ist unser Standardziel, weil es überall läuft, wo `onnxruntime` läuft
  — das heißt: fast überall.
- **CoreML** ist Apples On-Device-Inferenzformat. Ein CoreML-Paket läuft auf der
  Neural Engine oder GPU eines Mac oder iPhone statt auf der CPU. Das zählt für
  Echtzeit-Spracherkennung auf Apple-Hardware.
- **[GGUF](https://github.com/ggml-org/llama.cpp)** ist das von `llama.cpp` und
  seinem Ökosystem verwendete Format, gebaut für quantisierte, LLM-artige Modelle,
  die mit kleinem Speicherbedarf laufen müssen. Wir verwenden es für die neueren,
  transformerbasierten Sprachmodelle, die architektonisch näher an einem
  Sprachmodell als an einem klassischen akustischen Modell liegen.

Die Wahl des richtigen Ziels ist nicht kosmetisch. Ein Conformer-basiertes
ASR-Modell (die Architektur hinter den meisten modernen Spracherkennern, die
Faltung und Self-Attention kombiniert) konvertiert sauber nach ONNX oder CoreML.
Ein Qwen3-basiertes Sprachmodell ist unter der Haube ein Sprachmodell, sodass es
stattdessen natürlich in die GGUF-/`llama.cpp`-Pipeline passt.

## Was Quantisierung kostet, und was sie bringt

Quantisierung bedeutet, die Gewichte eines Modells mit weniger Bits pro Zahl zu
speichern — 16-Bit oder 8-Bit oder 4-Bit statt der 32-Bit-Gleitkommazahlen, mit
denen es trainiert wurde. Kleinere Zahlen ergeben eine kleinere Datei und, auf
geeigneter Hardware, schnellere Inferenz, weil weniger Daten bewegt und günstigere
Arithmetik ausgeführt werden muss.

Für ein reales Modell können wir eine genaue Zahl auf diesen Kompromiss legen.
`nvidia/parakeet-tdt-0.6b-v3` ist ein ASR-Modell mit 0,6 Milliarden Parametern.
Seine CoreML-Mel-Encoder-Komponente ist bei voller Präzision 1132,5 MB groß;
palettiert (Apples Bezeichnung für diesen Quantisierungsschritt) auf 4 Bit wird sie zu 284,2 MB, eine Reduktion um das 3,99-Fache, fast
exakt über alle drei Teilkomponenten hinweg (Encoder, Decoder, Joint-Decision-Netz).
Über das gesamte Paket hinweg ist der unquantisierte CoreML-Export etwa 1,14 GB
groß, die 4-Bit-Version etwa 293 MB. Das ist der Unterschied zwischen einem
Modell, das bequem auf ein Telefon passt, und einem, das das gerade so tut.

Die Kosten sind Genauigkeit. Weniger Bits pro Gewicht bedeuten weniger Präzision,
und ab einem bestimmten Punkt zeigt sich das als mehr Erkennungsfehler. Das
Standardmaß dafür bei ASR ist WER (Word Error Rate: der Prozentsatz der Wörter,
die das Modell im Vergleich zu einer korrekten Transkription falsch erkennt).
Deshalb veröffentlichen wir mehrere Quantisierungsstufen desselben Modells
nebeneinander, `4-Bit`, `6-Bit`, `8-Bit` (`int8`) und `fp16`, statt eine auszuwählen
und zu hoffen, dass sie für jedes Gerät gut genug ist. Ein Telefon und ein
Desktop-Rechner können sich unterschiedliche Punkte auf dieser Kurve leisten.

## Das Validierungsproblem

Eine Konvertierung, die still schlechtere Ausgaben produziert, ist gefährlicher
als gar keine Konvertierung, weil nichts daran defekt aussieht. Sie lädt, sie
läuft, und sie erkennt Sprache nur ein bisschen schlechter, oder viel schlechter in
einer Sprache, die Sie selbst nicht sprechen und nicht per Gehör stichprobenartig
prüfen können. Der einzige Weg, das zu erfassen, besteht darin, die Ausgabe des
exportierten Modells mit der ursprünglichen Referenzimplementierung auf echtem
Audio zu vergleichen, für jede Sprache und jede Quantisierungsstufe, bevor es
veröffentlicht wird.

Das ist die Mindestanforderung für jede Konvertierung, die wir ausliefern:
dasselbe Audio durch das Quellmodell und das konvertierte Modell laufen lassen
und bestätigen, dass sie übereinstimmen. Es ist kein glamouröser Schritt, aber
ihn zu überspringen ist die Art, wie eine "unterstützte Sprache" still aufhört
zu funktionieren.

## Warum die Modelle unter OpenVoiceOS liegen, nicht unter uns

Modell-Export ist eine Unternehmensfähigkeit. Geben Sie uns einen Checkpoint und
ein Zielgerät, und wir bringen ihn offline, validiert, auf der zu Ihrer Hardware
passenden Quantisierungsstufe zum Laufen. Aber die konvertierten Modelle, die
wir aus offenen, nicht in Auftrag gegebenen Checkpoints erzeugen, gehen an
[OpenVoiceOS](https://huggingface.co/OpenVoiceOS), die offene
Sprachassistenten-Plattform, für die diese Modelle gebaut sind, um darauf zu
laufen, nicht in unseren eigenen Namensraum.

Der Grund ist einfach. OpenVoiceOS ist dort, wo die Modelle genutzt werden. Ein
konvertiertes Modell in einem Unternehmenskonto ist ein nettes Artefakt.
Dasselbe Modell, veröffentlicht dort, wo [`ovos-stt-plugin-onnx-asr`](https://github.com/OpenVoiceOS/ovos-stt-plugin-onnx-asr),
[`ovos-stt-plugin-coreml`](https://github.com/TigreGotico/ovos-stt-plugin-coreml)
oder [`ovos-stt-plugin-rover`](https://github.com/TigreGotico/ovos-stt-plugin-rover)
es namentlich finden können, ist eine Sprache, die ein echter Assistent jetzt
sprechen oder verstehen kann. Die Veröffentlichung unter der eigenen Organisation
der Plattform macht aus einer Konvertierung eine unterstützte Funktion
statt einer Forschungskuriosität. So stellen wir sicher, dass diese
Arbeit, einmal geleistet, jeder OpenVoiceOS-Installation zugutekommt, nicht nur
dem Kunden, der sie angefragt hat.

Um bei der Zuschreibung klar zu sein: Wir trainieren diese akustischen Modelle
nicht von Grund auf, und wir behaupten das auch nicht. Die zugrunde liegende
Forschung gehört den Teams, die sie trainiert haben: NVIDIAs Parakeet- und Conformer-Modelle, AI4Bharats
IndicConformer-Modelle für indische Sprachen, universitäre und
öffentlich-institutionelle Modelle wie Galiciens Proxecto Nós oder die
Conformer-Modelle des baskischen HiTZ-Zentrums, sowie unabhängige Bemühungen,
Modelle für afrikanische und Minderheitensprachen zu konvertieren. Was wir beitragen, ist die Konvertierung, die
Quantisierung, die Korrektheitsprüfung gegen das Original und die
Plugin-Verdrahtung, die es einem Assistenten erlaubt, das Ergebnis namentlich zu
laden.

Der Umfang dieser Konvertierungsarbeit, direkt aus dem Veröffentlichten gezählt, sieht so aus:
Über neunzig Parakeet-ASR-Varianten (über Größen, Sprachen und
Quantisierungsstufen hinweg) sind nach ONNX und CoreML exportiert. Dazu kommen mehr als dreißig
NVIDIA-Conformer-Modelle, zweiundzwanzig AI4Bharat-IndicConformer-Modelle für
ressourcenarme indische Sprachen und zweiundzwanzig wav2vec2-Modelle für Sprachen
wie Schwedisch, Isländisch, Färöisch, Finnisch und beide Schriftformen des
Norwegischen. Neun Conformer-Modelle decken Baskisch und Galicisch ab, und
unabhängig konvertierte Whisper- und wav2vec2-Modelle decken afrikanische Sprachen
und Kreolsprachen wie Shona, Zulu, Xhosa, Malagasy, Haitianisch-Kreolisch und
Kabylisch ab. Zählt man nur bestätigte ASR-Konvertierungen nach eindeutigem
Sprachcode, sind das mindestens 74 verschiedene Sprachen mit einer heute
verfügbaren offline, quantisierten Spracherkennung. Diese Zahl schließt den separaten
Katalog an TTS-Stimmen nicht ein, die für Sprachen wie Baskisch, Aragonesisch,
Asturisch, Galicisch, Okzitanisch und Arabisch exportiert wurden.

## Wenn Ihre Sprache oder Ihr Gerät heute nichts Offline-fähiges hat

Die meisten Sprachen bekommen nie eine kommerzielle Offline-Sprachoption, weil der
Markt für diese Sprache allein einen Anbieter nicht dazu bewegt, eine zu bauen.
Das oben beschriebene Muster hängt nicht von der Marktgröße ab: einen vorhandenen offenen Checkpoint nehmen, ihn
in ein Format konvertieren, das auf der Hardware läuft, die Sie tatsächlich
haben, ihn passend quantisieren, gegen das Original verifizieren und in ein
Plugin einbinden. Es hängt davon ab, dass es
einen offenen Checkpoint gibt, von dem aus man starten kann, was zunehmend der
Normalfall ist.

Wenn Sie ein Sprachmodell haben, das nur auf einer Trainings-GPU läuft, oder ein
Gerät, das derzeit keine Offline-Sprachunterstützung in seiner Sprache hat,
[nehmen Sie Kontakt auf](/de/contact). Oder sehen Sie sich an, wie diese Arbeit von
Anfang bis Ende aussieht, auf [unserer Leistungsseite](/de/services).
