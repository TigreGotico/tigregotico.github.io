---
title: "Eine Voice-Cloning-Engine wählen"
description: "voiceclonnx betreibt 10 Voice-Conversion-Engines hinter einer API, vom kNN-Feature-Swap bis zum AR-Codec-LM. Dies ist ein Leitfaden zu den dahinterstehenden Modellfamilien, dem real gemessenen Kompromiss zwischen Verständlichkeit und Sprecherähnlichkeit, und wie man eine Engine für eine bestimmte Aufgabe auswählt."
date: 2026-08-01
lang: de
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "voice cloning"
  - "voice conversion"
  - "self-hosted"
draft: false
---

Voice Conversion nimmt eine Aufnahme und einen Referenzsprecher und erzeugt dieselben Wörter in der Stimme des Referenzsprechers. Nirgends in der Pipeline ist Text im Spiel: Die Eingabe ist Audio, die Ausgabe ist Audio, und das Modell liest oder schreibt niemals ein Transkript. Das unterscheidet es von Text-zu-Sprache (TTS), das von Text ausgeht und keine Quellaufnahme zu bewahren hat. Voice Conversion beantwortet eine engere Frage: Lass diese Aufnahme so klingen, als wäre sie von jemand anderem, bei intakten Wörtern.

Diese engere Aufgabe hat echte Anwendungen. Eine Aufnahme in eine konsistente Stimme synchronisieren, ohne einen zweiten Sprecher zu engagieren. Einen Sprecher in einem Interview oder einem Support-Anruf anonymisieren, während die Wörter wortgetreu erhalten bleiben. Der Ausgabe eines TTS-Systems eine einzige stabile Identität über Sprachen hinweg geben, wenn die zugrundeliegenden Stimmen jeder Sprache unabhängig trainiert wurden und sonst wie unterschiedliche Personen klingen würden.

[`voiceclonnx`](https://github.com/TigreGotico/voiceclonnx) implementiert 10 dieser Engines hinter einer einzigen Python-API, alle laufen auf `onnxruntime` ohne PyTorch zur Inferenzzeit. Die Engines sind nicht austauschbar. Sie stammen aus unterschiedlichen Modellfamilien, und eine zu wählen bedeutet, einen Kompromiss zu wählen, keinen Gewinner.

## Die API, kurz

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
print(cloner.sample_rate)   # 16000
```

`clone_voice(audio, reference_voice, out_path)` nimmt die Quellaufnahme, einen 5–30-Sekunden-Referenzclip der Zielsprecherin oder des Zielsprechers, und einen Ausgabepfad, und gibt den Pfad zur konvertierten WAV-Datei zurück. Die Engine zu wechseln bedeutet, die `engine=`-Zeichenkette zu wechseln; die Aufrufform ändert sich nicht. Eine Engine, `rvc`, ist die Ausnahme — sie nimmt einen Pfad zu einem `.onnx`-Stimmmodell statt einer Referenzaufnahme, unten behandelt. `pip install voiceclonnx` zieht alle 10 Engines; Modelle werden bei der ersten Nutzung von Hugging Face heruntergeladen.

## Zwei Achsen, nicht eine Punktzahl

Zwei Zahlen beschreiben, wie gut eine Konversion funktioniert hat, und sie bewegen sich nicht gemeinsam.

**Word Error Rate (WER)** misst die Verständlichkeit: wie viel des ursprünglichen Satzes überlebt hat, beurteilt, indem die Ausgabe wieder durch einen Spracherkenner geschickt und mit dem Quelltranskript verglichen wird. 0 % WER bedeutet, dass jedes Wort korrekt durchkam.

**Sprecherähnlichkeit** misst die Identität: ob die Ausgabe tatsächlich wie die Zielsprecherin oder der Zielsprecher klingt, nicht wie die ursprüngliche Stimme. Sie wird berechnet, indem ein Sprecher-Embedding extrahiert wird — ein kompakter numerischer Fingerabdruck des Klangfarbe-Timbres einer Stimme, die Klangfarbe, die eine Stimme bei gleicher Tonhöhe und Lautstärke von einer anderen unterscheidet — aus der Ausgabe und aus dem Referenzclip, und diese dann per Kosinus-Ähnlichkeit vergleicht. Ein Wert von 1,0 bedeutet identisches Timbre; die eigene Basislinie von `voiceclonnx` — eine unkonvertierte Kopie der Quelle, gegen das Ziel bewertet — liegt bei 0,09, sodass alles deutlich darüber echte Konversionsarbeit leistet.

`voiceclonnx` veröffentlicht beide Zahlen für jede Engine, gemessen an demselben Satz, konvertiert zu zwei Referenzstimmen. Der WER stammt von `faster-whisper`; die Sprecherähnlichkeit stammt von einem `wespeaker-resnet34`-Embedding-Modell (gegen zwei weitere gegengeprüft). Nebeneinandergestellt zeigt sich ein Muster: Keine Engine führt in beiden Spalten.

| Engine | Familie | WER | Zielähnlichkeit |
|---|---|---|---|
| `focalcodec` | kNN-Feature-Swap | 15–19 % | **0,61** |
| `lscodec` | Sprecherentkoppelter Codec | ~35 % | 0,54 |
| `chatterbox` | AR-Codec-LM | 4–8 % | 0,54 |
| `knnvc` | kNN-Feature-Swap | 12–15 % | 0,49 |
| `facodec` | Faktorisierter Codec | **0 %** | 0,44 |
| `openvoice` | Klangfarbenübertragung | **0 %** | 0,37 |
| `bicodec` | Semantische + globale Tokens | 12 % | 0,29 |
| `triaan` | Triple-AAN | 4 % | 0,29 |
| `cosyvoice` | Flow-Matching | 8 % | 0,21 |

(`rvc` konvertiert jede Quelle zu einer einzigen festen, von der Community trainierten Stimme statt zu einem beliebigen Referenzclip, ist also in dieser Tabelle nicht vergleichbar; siehe unten.)

Lesen Sie die Tabelle zeilenweise, nicht auf der Suche nach einer einzigen besten Zeile. `facodec` und `openvoice` liegen bei 0 % WER — jedes Wort überlebt — mit moderater Ähnlichkeit. `focalcodec` und `lscodec` liegen am anderen Ende: die stärkste Klangfarbenübertragung im Satz, erkauft dadurch, dass 15–35 % der Wörter falsch herauskommen. `chatterbox` ist die einzige Engine, die auf beiden Achsen gleichzeitig gut abschneidet (4–8 % WER, 0,54 Ähnlichkeit), was eine Eigenschaft ihrer Architektur ist, im Folgenden behandelt.

## Warum sich die Familien unterschiedlich verhalten

Die Engines teilen sich in unterschiedliche Ansätze auf, und der Ansatz sagt voraus, wo eine Engine in der obigen Tabelle landet.

**kNN-Feature-Swap** (`knnvc`, `focalcodec`). Das Quellaudio wird in kurze Frames zerlegt, jeder von einem vortrainierten selbstüberwachten Encoder in einen Merkmalsvektor verwandelt. Für jeden Quellframe findet der Algorithmus die *k* nächsten Frames in einem Pool der Merkmale der Zielsprecherin oder des Zielsprechers und mittelt sie ein, wobei das Timbre-Frame der Quelle Frame für Frame ersetzt wird, während der zugrundeliegende phonetische Inhalt dort bleibt, wo er aus der eigenen Repräsentation des Encoders extrahiert wurde. Es gibt keinen gelernten Decoder, der eine Stimme auf eine andere abbildet — der Austausch ist eine Nächste-Nachbarn-Suche —, weshalb die Klangfarbenübertragung aggressiv sein kann (`focalcodec` erreicht 0,61 Ähnlichkeit) auf Kosten gelegentlicher Verunstaltung von Frames, die im Zielpool eine schlechte Übereinstimmung hatten, was sich im WER zeigt.

**Faktorisierter Codec** (`facodec`). Ein neuronaler Audiocodec — ein Modell, das Sprache in eine kompakte Token-Sequenz komprimiert und rekonstruiert — trainiert, um diese Tokens explizit in getrennte Inhalts- und Timbre-Streams aufzuteilen. Da Inhalt ein eigener Stream ist, rekonstruiert der Decoder die Wörter mit hoher Genauigkeit; nur der Timbre-Stream wird gegen den der Zielsprecherin oder des Zielsprechers getauscht. Diese explizite Trennung ist, warum `facodec` 0 % WER erreicht: Die Inhaltsbewahrung konkurriert mit nichts.

**Klangfarbenübertragung** (`openvoice`). Ein Konversionsmodul ändert die Klangfarbe — Tonhöhenverlauf und Timbre — nachdem ein separater Encoder den linguistischen Inhalt fixiert hat, ähnlich im Geist dem Ansatz des faktorisierten Codecs, aber implementiert als Farbübertragungsschritt über ein Mel-Spektrogramm statt diskrete Tokens. Es erreicht ebenfalls 0 % WER, mit etwas geringerer Ähnlichkeit als `facodec`.

**AR-Codec-LM** (`chatterbox`). Ein autoregressives Sprachmodell, das Codec-Tokens nacheinander vorhersagt, konditioniert auf das Embedding der Zielsprecherin oder des Zielsprechers, ganz ähnlich einem Text-zu-Sprache-Sprachmodell, aber konditioniert auf die Inhalts-Tokens der Quellaufnahme statt auf Text. Da es Prosodie (Rhythmus, Betonung, Intonation) als Teil desselben autoregressiven Prozesses erzeugt statt sie direkt aus der Quelle zu kopieren, kann es den Sprechstil zusammen mit dem Timbre mitführen — weshalb die Dokumentation anmerkt, dass es die „stärkste Quelle-zu-Ziel-Verschiebung" bietet — und es ist die einzige Engine, die gleichzeitig bei Verständlichkeit und Ähnlichkeit gut abschneidet.

**Flow-Matching** (`cosyvoice`). Ein kontinuierlicher generativer Prozess, der Rauschen iterativ zum Ziel-Mel-Spektrogramm verfeinert, unter Verwendung eines EDO-Lösers (gewöhnliche Differentialgleichung), der eine konfigurierbare Anzahl an Schritten durchläuft (`ode_steps`, Standard 10). Sein Inhaltsencoder ist für sprachübergreifende Übertragung ausgelegt, und diese Allgemeinheit ist wahrscheinlich der Grund, warum sein Zielähnlichkeitswert der niedrigste im Satz ist: Die Repräsentation optimiert auf Sprachunabhängigkeit, nicht auf die engste Sprecherübereinstimmung.

**Sprecherentkoppelter Codec** (`lscodec`). Wie `facodec` ein Codec, der trainiert wurde, Inhalt von Sprecheridentität zu trennen, aber darauf abgestimmt, die Ähnlichkeit weiter zu treiben, auf direkte Kosten der Präzision des Inhaltsstreams, was bei ~35 % WER mit der zweithöchsten Ähnlichkeit im Satz landet.

**Triple-AAN- und Semantische-plus-globale-Tokens-Codecs** (`triaan`, `bicodec`) liegen bei beiden Achsen in der Mitte: moderater WER, moderate Ähnlichkeit, keine starke Verzerrung in eine Richtung.

**Beliebig-zu-EINEM-Codec plus Vocoder** (`rvc`). Aufgebaut auf ContentVec (einem Inhaltsencoder), der einen VITS-Vocoder speist, pro Zielstimme trainiert statt einen beliebigen Referenzclip zu akzeptieren. `reference_voice` ist bei dieser Engine ein Pfad zu einer `.onnx`-RVC-Modelldatei oder eine Hugging-Face-Repo-ID, keine Audiodatei:

```python
cloner = VoiceCloner(engine="rvc")
out = cloner.clone_voice("source.wav", "/path/to/myvoice.onnx", "out.wav")
```

Da jedes RVC-Modell auf einer einzigen Zielstimme trainiert wird, nimmt es zur Inferenzzeit keinen Referenzclip entgegen und wird nicht mit demselben Ähnlichkeits-Benchmark bewertet wie die Beliebig-zu-beliebig-Engines. Sein gemessener WER von 38 % spiegelt ein von der Community trainiertes Beispielmodell wider, nicht die Architektur im Allgemeinen — die Qualität hängt davon ab, wie dieses konkrete Modell trainiert wurde. Tausende von Community-RVC-Stimmen existieren auf Hugging Face und laden direkt per Repo-ID.

## Entscheiden, welche man ausführt

**Schnelle Allzweck-Pipeline.** Beginnen Sie mit `facodec` oder `openvoice`. Beide erreichen 0 % gemessenen WER bei moderater Ähnlichkeit (0,44 und 0,37), und beide liefern eine INT8-quantisierte Variante ohne dokumentierte Qualitätsregression — übergeben Sie `quantized=True` für ein kleineres, schnelleres Modell.

**Maximale Sprecherähnlichkeit.** Verwenden Sie `focalcodec` (0,61 Ähnlichkeit, die höchste gemessene), wenn die 15–19 % WER für den Anwendungsfall akzeptabel sind, oder `chatterbox` (0,54 Ähnlichkeit, 4–8 % WER), wenn nicht. `chatterbox` läuft außerdem bei 24 kHz, der höchsten Ausgaberate für Beliebig-zu-beliebig-Konversion im Satz — `rvc` erreicht bis zu 48 kHz, aber nur im oben genannten Beliebig-zu-EINEM-Modus.

**Ressourcenarme Hardware.** `knnvc` in INT8 belegt etwa 123 MB auf der Festplatte, den kleinsten Fußabdruck im Satz, mit 0,49 Ähnlichkeit und 12–15 % WER — ein vernünftiger Kompromiss für beschränkten Speicher. Nicht jede Engine lässt sich sauber quantisieren: `focalcodec` und `cosyvoice` sind dokumentiert als in INT8 degradierend, also belassen Sie diese beiden bei fp32.

**Eine Sprache, mit der die Engine nicht trainiert wurde.** Der Inhaltsencoder von `cosyvoice` ist für sprachübergreifende Übertragung gebaut, was der dokumentierte Grund ist, zu ihr zu greifen statt zu einer für gleichsprachige Konversion abgestimmten Engine, auch wenn ihre gemessene Ähnlichkeit (0,21) die niedrigste der neun direkt vergleichbaren Engines ist.

**Stimmidentität über exakte Wortlautgenauigkeit.** `lscodec` gibt die stärkste Timbre-Übertragung unter den Codec-Familien-Engines (0,54, gleichauf mit `chatterbox`) auf Kosten des höchsten WER im vergleichbaren Satz (~35 %). Wählen Sie sie, wenn das Ziel „klingt das wie die Zielsprecherin oder der Zielsprecher" ist und gelegentliche Wortfehler in der Ausgabe tolerierbar sind.

**Eine einzige feste Community-Stimme statt eines beliebigen Clips.** `rvc`, unter Verwendung eines vortrainierten `.onnx`-Stimmmodells statt einer Referenzaufnahme.

**Nicht-kommerzielle Einschränkung zuerst prüfen.** Die Gewichte von `bicodec` sind unter CC BY-NC-SA 4.0 lizenziert. Die Gewichte jeder anderen Engine sind MIT, Apache-2.0 oder CC BY 4.0. Prüfen Sie die Lizenz des konkret eingesetzten Gewichts, bevor Sie es kommerziell ausliefern.

## Was es nicht gut kann, und bei wem es nicht verwendet werden sollte

Jede Zahl oben kommt mit demselben Vorbehalt: Die Zahlen beschreiben einen englischen Demosatz, konvertiert zwischen zwei bestimmten Referenzstimmen. Eine andere Sprache, eine verrauschtere Quellaufnahme, ein kürzerer oder minderwertigerer Referenzclip, oder eine Quellsprecherin oder ein Quellsprecher, deren Stimme weit von allem entfernt liegt, was in den Trainingsdaten einer Engine vorkommt, werden all diese Zahlen verschieben, meist zum Schlechteren. Keine dieser Engines ist ein universeller Fix für eine minderwertige Quellaufnahme — mehrere von ihnen konvertieren das Timbre munter, während sie Quellrauschen unverändert durchlassen, da Rauschen seine eigene akustische Signatur hat, die eine Inhalt/Timbre-Trennung nicht immer sauber auseinanderhält.

Voice Conversion wirft auch ein reales Risiko auf, über das seine nahe Verwandte, das Voice Cloning für TTS, dieses Team schon zum Nachdenken gezwungen hat: Eine Aufnahme so umzuwandeln, dass sie wie eine echte, identifizierbare Person klingt, ist eine zur Nachahmung fähige Technologie, unabhängig davon, ob das die Absicht war. Die Regel, die dieses Team allgemein auf synthetische Stimmen anwendet — ausdrückliche Erlaubnis einholen, bevor die Stimme einer echten Person als Spenderin oder Ziel verwendet wird, und auf gemeinfreie Aufnahmen oder eine bewusst originelle Stimme zurückgreifen, wenn Erlaubnis nicht möglich ist — gilt hier ohne Ausnahme. Ein Referenzclip einer echten Person unterscheidet sich, aus Sicht der Einwilligung, nicht von einem vollständigen Trainingsdatensatz ihrer Stimme; es braucht nur weit weniger davon, um ein brauchbares Ergebnis zu erzielen, was ein Grund für mehr Vorsicht ist, nicht weniger.

Nehmen Sie über [contact](/de/contact) Kontakt auf oder sehen Sie sich an, [was wir anbieten](/de/services), wenn Voice Conversion Teil einer Pipeline ist, die Sie aufbauen.
