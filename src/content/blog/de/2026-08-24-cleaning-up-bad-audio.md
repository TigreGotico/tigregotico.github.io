---
title: "Schlechtes Audio bereinigen: Entrauschung und Bandbreitenerweiterung in audiosronnx"
description: "Eine Tiefenanalyse der zwei getrennten Aufgaben von audiosronnx — Rauschen entfernen und fehlende hohe Frequenzen wieder aufbauen — mit der tatsächlichen Engine-Registry, Modellgrößen und Lizenzen, der Liste abgelehnter Modelle und wie man prüft, ob sich die Ausgabe tatsächlich verbessert hat."
date: 2026-08-01
lang: de
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "denoising"
  - "bandwidth extension"
  - "speech"
draft: false
---

Eine Aufnahme kann auf zwei unterschiedliche Arten schlecht sein, und die Lösungen überschneiden sich nicht.

Die erste Art: Hintergrundgeräusche liegen über der Sprache — Verkehr, ein Lüfter, Raumbrummen. Das Signal, das zählt, ist vorhanden; etwas anderes ist hineingemischt. Das zu entfernen ist **Entrauschung** (Denoising).

Die zweite Art: Die Aufnahme hat das vollständige Signal von vornherein nie erfasst. Telefonaudio wird mit 8.000 Abtastungen pro Sekunde (8 kHz) abgetastet; eine vollqualitative Aufnahme liegt meist bei 48 kHz. Die **Abtastrate** legt die höchste Frequenz fest, die ein digitales Signal darstellen kann, sodass ein 8-kHz-Anruf überhaupt keinen Inhalt oberhalb von 4 kHz hat — nicht leise, nicht gefiltert, sondern schlicht nie aufgenommen. Dieses Audio wieder voll klingen zu lassen bedeutet, plausible hohe Frequenzen zu erfinden, die nie erfasst wurden. Das ist **Bandbreitenerweiterung**.

`audiosronnx` behandelt dies als zwei verschiedene Probleme mit zwei verschiedenen Einstiegspunkten, weil das falsche zu verwenden das Falsche tut. Führen Sie einen Bandbreitenerweiterer auf einem verrauschten Signal aus, und er wird getreu eine Hochfrequenzversion des Rauschens rekonstruieren. Entrauschung muss zuerst geschehen.

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _     = load_sr("lavasr").upscale(clean, rate)              # extend to 48 kHz
```

`load_denoise()` und `load_sr()` lehnen die jeweils andere Engine ab — `load_denoise` nach einem Bandbreitenerweiterer zu fragen, löst einen Fehler aus, statt still das Falsche zu tun.

## Warum das vor der Erkennung kommt

Spracherkennung und Sprecheridentifikation werden meist mit vergleichsweise sauberem Audio trainiert. Geben Sie einem Erkenner 8-kHz-Telefonsprache oder Sprache mit einem laufenden Lüfter darunter, und die Wortfehlerrate steigt — nicht weil das Modell schlecht ist, sondern weil die Eingabe nicht mehr aussieht wie das, worauf es trainiert wurde. Dasselbe gilt für Sprecher-Embeddings, die für Identifikation oder Diarisierung verwendet werden: Rauschen und fehlende Bandbreite verzerren genau die akustischen Details, auf die sich diese Embeddings verlassen.

Das macht die Bereinigung zu einer Pipeline-Stufe, die *vor* der Erkennung steht, nicht zu einer Alternative dazu. Eine echte Pipeline für einen verrauschten 8-kHz-Telefonanruf sieht so aus: entrauschen, dann auf 48 kHz erweitern, dann Erkennung oder Sprecher-ID auf dem Ergebnis ausführen. Auf einen besseren Erkenner umzusteigen, ohne vorher die Eingabe zu reparieren, verschwendet Aufwand am falschen Ort — das Modell verschlechtert sich am selben beschädigten Signal, egal wie gut es ist.

## Die Engine-Registry

`audiosronnx` liefert zehn Entrauscher und sieben Bandbreitenerweiterer, alle namentlich ladbar über `load_denoise()` / `load_sr()`, alle reines ONNX ohne torch zur Laufzeit.

Entrauscher:

| Engine | Rate | Größe | Lizenz |
|--------|------|------|---------|
| dpdfnet (Standard) | 8/16/48 kHz | 8,7–14,9 MB | Apache-2.0 |
| mossformer2 | 48 kHz | 229 MB | Apache-2.0 |
| frcrn | 16 kHz | 57,5 MB | Apache-2.0 |
| mpsenet | 16 kHz | 9,7 MB | MIT |
| gtcrn | 16 kHz | 0,54 MB | MIT |
| cmgan | 16 kHz | 7,8 MB | MIT |
| metadenoiser | 16 kHz | 19–34 MB | CC-BY-NC-4.0 |
| mossformergan | 16 kHz | 17,7 MB | Apache-2.0 |
| voicefixer | 44,1 kHz | 415 MB | MIT |
| deepfilternet | 48 kHz | ~2 MB | MIT |

Bandbreitenerweiterer:

| Engine | Eingabe | Größe | Lizenz |
|--------|-------|------|---------|
| lavasr (Standard) | 8–48 kHz | ~52 MB | Apache-2.0 |
| novasr | 16 kHz | ~0,2 MB | Apache-2.0 |
| flowhigh | beliebig | ~200 MB | MIT |
| hifiganbwe | beliebig | ~4 MB | MIT |
| apbwe | beliebig (12-kHz-Band) | ~120 MB | MIT |
| sidon | 16 kHz | ~410 MB | MIT |
| callenhancer | 8–16 kHz | ~3 GB / ~1,3 GB int8 | CC-BY-NC-4.0 |

Das kleinste Modell in der Bibliothek, `gtcrn`, ist 0,54 MB groß. Das größte, `voicefixer`, ist 415 MB groß — fast 800-mal größer, und es erledigt eine andere Aufgabe: Es ist ein *Restaurationsmodell*, das Rauschen, Nachhall, Clipping und fehlende Bandbreite gemeinsam behandelt statt ein Problem nach dem anderen.

Die meisten Gewichte sind MIT oder Apache-2.0. Zwei sind es nicht: `metadenoiser` und `callenhancer` werden unter CC-BY-NC-4.0 ausgeliefert, nicht-kommerziell. Diese Lizenz gilt für die Gewichte, nicht für damit verarbeitetes Audio, und die Bibliothek gibt das an jedem Verwendungspunkt an — `audiosronnx list` berichtet es pro Engine. Nichts hindert einen Aufrufer daran, `metadenoiser` wegen seiner Zeitbereichs-Architektur zu wählen, aber die Wahl muss wissentlich getroffen werden.

Die Registry existiert, weil kein einzelnes Modell bei jeder Aufnahme gewinnt. `dpdfnet` ist der Standard, weil es keine zusätzlichen Abhängigkeiten braucht und 8, 16 und 48 kHz aus einem einzigen Modell abdeckt. `mossformer2` ist die gemessen beste Wahl bei Vollbandeingabe. `mossformergan` erzielt den höchsten veröffentlichten PESQ-Wert (3,47) unter den ausgelieferten Entrauschern. `gtcrn` ist die Wahl, wenn die bindende Einschränkung der Speicherbedarf ist, mit 0,54 MB. Bei einem Testclip mit breitbandigem Gaußschem Rauschen gewannen Entrauscher 3,5 bis 5,9 dB SNR bei 19 dB Eingangs-SNR zurück, steigend auf 7,5–13,7 dB bei einem schwierigeren 5-dB-Eingang. Das ist ein synthetischer, feindlicher Rauschfall: Er ordnet die Engines konsistent, sagt aber wenig über Stimmengewirr-Rauschen oder Codec-Artefakte aus, was genau der Grund ist, warum die Registry zehn Modelle behält, statt nur den Gewinner auszuliefern.

`cmgan` ist der klarste Fall eines Modells, das absichtlich behalten wird, obwohl es verliert: Es wird sowohl bei PESQ als auch bei SNR von `gtcrn` dominiert, das vierzehnmal kleiner ist, und bleibt trotzdem — damit veröffentlichte Ergebnisse, die gegen `cmgan` erstellt wurden, reproduzierbar bleiben und eine eigenständige Architektur zum Vergleich verfügbar bleibt.

Auf der Seite der Bandbreitenerweiterung erledigen `sidon` und `callenhancer` eine andere Aufgabe als `lavasr` oder `novasr`: Statt ein plausibles Hochband auf das vorhandene Signal aufzusetzen, resynthetisieren sie Sprache von Grund auf über einen neuronalen Vocoder, was Codec-Schäden reparieren kann, die ein Bandbreitenerweiterer nicht anfassen kann — zu weit höheren Rechenkosten. `callenhancer` ist speziell auf Telefonieaudio trainiert, weshalb seine Gewichte die nicht-kommerzielle Lizenz tragen.

## Was es nicht hineingeschafft hat

`audiosronnx` liefert eine Engine nur aus, wenn sie sich in einen einzigen statischen ONNX-Graphen exportieren lässt, auf CPU über onnxruntime läuft, eine klare Lizenz trägt und Ende-zu-Ende gegen die ursprüngliche Implementierung validiert wurde — nicht nur gegen das rohe Modell, da ein Graph, der zum Netzwerk passt, aber nicht zu dessen umgebender Normalisierung, Audio erzeugt, das gut klingt und still falsch ist.

Die Datei `docs/not-shipped.md` des Projekts dokumentiert jeden Kandidaten, den es evaluiert und abgelehnt hat, mit dem spezifischen Grund, was sie zu einem der nützlichsten Dokumente im Repository macht, weil sie die tatsächlichen Grenzen dessen zeigt, was "reines ONNX, nur CPU" heute leisten kann, statt sie nur zu behaupten.

**Iterative Sampler haben keinen statischen Graphen zu exportieren.** Diffusions- und Flow-Matching-Modelle führen ein Netzwerk mehrfach pro Äußerung aus, mit einer Schleife, deren Länge zur Exportzeit nicht feststeht. AudioSR (eine etwa 6 GB große latente Diffusionspipeline mit separatem VAE, LDM und Vocoder) und SGMSE fallen beide hierunter — SGMSEs eigener Streaming-Nachfolger von 2025 erreicht Echtzeit erst auf einer Consumer-GPU, von CPU ganz zu schweigen.

**Positionsabhängige Faltungen sehen disqualifizierend aus und sind es größtenteils nicht.** `resemble-enhance` wurde in diesem Dokument lange wegen LVCNet abgelehnt, der positionsabhängigen Faltung des Vocoders, mit der Theorie, dass Kernel, die pro Position über `unfold` und `einsum` vorhergesagt werden, sich nicht in einen statischen Graphen einfügen lassen. Direkt getestet, stellte sich das als falsch heraus — beide Operationen haben ONNX-Äquivalente. Der tatsächliche Fehler ist ein separater, bereits gut verstandener Trace-Fehler ("ONNX-Export einer Faltung für einen Kernel unbekannter Form"), der andernorts im Code für BigVGANs Resampler bereits gelöst ist. Was `resemble-enhance` weiterhin draußen hält, ist der Umfang: vier Netzwerke einschließlich eines CFM-EDO-Samplers und eines Autoencoders bei 44,1 kHz — eine Umfangsentscheidung, keine Unmöglichkeit.

**Manche Modelle haben nichts Trainiertes zum Exportieren.** RNNoise wird als handgeschriebenes C ausgeliefert, kein Graph in einem trainierbaren Framework — es zu portieren würde bedeuten, ein äquivalentes Netzwerk von Grund auf neu zu trainieren. Fast-ULCNet veröffentlicht nur Architektur-Code, überhaupt keinen Checkpoint.

**Eine restriktive Lizenz ist eine Kennzeichnungsentscheidung, keine automatische Disqualifikation** — genau deshalb werden `callenhancer` und `metadenoiser` ausgeliefert. Was disqualifiziert, sind Gewichte, die ganz ohne Lizenz veröffentlicht wurden: mdctGAN wurde genau deswegen abgelehnt, zusätzlich zu einem `torch.fft`-basierten Frontend, das sich nicht zuverlässig exportieren lässt.

**Dass `torch.stft` innerhalb des Modells aufgerufen wird, ist ein echter struktureller Blocker.** Die Sampler-Schleife von NU-Wave2 ist nicht das Problem — das könnte in numpy außerhalb des Graphen laufen, genau wie das STFT jeder anderen Engine. Was es blockiert, ist, dass seine `forward`-Methode intern `torch.stft` und `torch.istft` aufruft, was die Bibliothek absichtlich aus jedem von ihr ausgelieferten Graphen heraushält, und das zudem der Operator ist, der sich generell am unzuverlässigsten exportieren lässt. Das zu beheben würde bedeuten, das Modell an der Transformationsgrenze aufzuteilen — echte Umstrukturierung statt eines einfachen Operatortauschs.

**Die Architektur eines Modells zu reproduzieren ist nicht dasselbe wie seine Ausgabe zu reproduzieren.** LiSenNet hat 56 K Parameter, unter 300 KB — es wäre die kleinste Engine in der Bibliothek. Sein öffentlich verfügbarer ONNX-Port läuft und produziert plausibel aussehendes, gedämpftes Audio, aber Ende-zu-Ende gemessen zerstört er das Signal: −10,8 dB SNR bei 11 dB Eingang. Die eigene Referenzimplementierung des Ports exakt zu reproduzieren, liefert dasselbe negative Ergebnis, was bedeutet, dass die Referenzimplementierung selbst nicht zum Frontend passt, das ihre eigene Dokumentation beschreibt — es gibt noch kein korrektes Ziel, gegen das validiert werden könnte.

Das Muster über all diese Fälle hinweg ist, dass die interessanten Fehler selten "das Modell ist zu groß" oder "Diffusion ist langsam" sind. Sie sind spezifisch: ein nicht unterstützter Operator mit einem exakten Ersatz (`torch.complex` hat keinen ONNX-Operator, aber `atan2(im, re)` berechnet denselben Phasenwinkel), ein aus der Laufzeitform einer Eingabe gebauter Tensor, den ein Tracer nicht festlegen kann, oder eine Transformation auf der falschen Seite einer Graphengrenze.

## Bestätigen, dass sich die Ausgabe tatsächlich verbessert hat

Eine ausführbare ONNX-Datei ist kein Beweis dafür, dass sich eine Aufnahme verbessert hat. Zwei unterschiedliche Fehlermodi sehen von außen identisch aus: ein Entrauscher, der Sprache zusammen mit dem Rauschen stummschaltet, und ein Bandbreitenerweiterer, der ein Hochband mit falschem harmonischem Inhalt hinzufügt, erzeugen beide Audio, das ohne Fehler abgespielt wird und bei flüchtigem Hinhören sogar sauberer klingen kann.

Die Schwesterbibliothek `speechonnxmetrics` existiert, um dieses Urteil messbar statt impressionistisch zu machen. Sie bewertet Audio nach **MOS** (Mean Opinion Score, eine 1–5-Bewertung der wahrgenommenen Qualität) auf zwei Arten: referenzlose neuronale Prädiktoren wie DNSMOS und UTMOS, die eine Aufnahme ohne sauberes Original zum Vergleich bewerten, und intrusive Metriken wie STOI und SI-SDR, die die saubere Referenz brauchen und messen, wie nah die Ausgabe tatsächlich daran liegt.

```python
import speechonnxmetrics as s

s.score("clean.wav", ["utmos"])
# -> {'utmos': 4.41}

s.score("denoised.wav", ["stoi", "si_sdr"], ref="clean.wav")
# -> {'stoi': 0.66, 'si_sdr': -26.9}
```

Führt man das vor und nach einem Entrauscher oder Erweiterer aus, ergibt sich die Form eines echten Vergleichs: DNSMOS oder UTMOS auf dem rohen und verarbeiteten Audio, um zu sehen, ob sich die wahrgenommene Qualität überhaupt bewegt hat, und — wenn eine saubere Referenz existiert, was bei synthetischen Rauschtests der Fall ist, aber selten bei einem echten Telefonanruf — SI-SDR oder STOI, um zu sehen, ob das verarbeitete Signal tatsächlich darauf zukonvergiert ist, statt nur anders zu klingen. Das ist dieselbe Disziplin hinter den SNR-Zahlen in der Entrauscher-Tabelle oben: eine Zahl, die an eine bestimmte Rauschbedingung gebunden ist, kein Adjektiv. Die breitere Familie reiner ONNX-Bibliotheken, in die dies passt, einschließlich `speechonnxmetrics` selbst, wird behandelt in
[Eine Familie reiner ONNX-Sprachbibliotheken](/de/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries).

Audio zu bereinigen, bevor es einen Erkenner, ein Sprecher-ID-System oder eine menschliche Zuhörerschaft erreicht, ist eine eigene Ingenieursaufgabe, mit ihrer eigenen Registry an Kompromissen und ihrer eigenen Liste an Ansätzen, die probiert wurden und den Kontakt mit einem echten Signal nicht überlebt haben.

Fragen zur Anwendung darauf in einer bestimmten Pipeline: [nehmen Sie Kontakt auf](/contact).
