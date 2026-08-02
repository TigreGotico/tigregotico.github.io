---
title: "Sprachqualität messen ohne Hörer-Panel"
description: "Ein praxisnaher Leitfaden zu speechonnxmetrics: was MOS, referenzlose MOS-Schätzer, intrusive Signalmetriken und ASR-basierte WER/CER tatsächlich messen, wann welche gilt, echte Werte von echtem Audio, und warum ein vorhergesagter MOS Beweis ist, nicht Wahrheit."
date: 2026-08-01
lang: de
author: "Casimiro Ferreira"
tags:
  - "speechonnxmetrics"
  - "TTS"
  - "ONNX"
  - "evaluation"
draft: false
---

Ein Entrauschungsmodell liefert einen neuen Checkpoint aus. Eine TTS-Stimme wird mit mehr Daten neu trainiert. Eine Voice-Cloning-Pipeline tauscht ihren Vocoder aus. In jedem Fall muss jemand beantworten: Ist die Ausgabe besser oder schlechter als vorher? "Für mich klingt es besser" skaliert nicht. Es bricht in dem Moment zusammen, in dem die Sprache keine ist, die Sie sprechen, in dem Moment, in dem es zwanzig statt zwei Checkpoints zu vergleichen gibt, oder in dem Moment, in dem die Änderung bei jedem Commit statt einmal von Hand geprüft werden muss.

Die rigorose Antwort auf "klingt es besser?" ist ein **Mean Opinion Score (MOS)**: das Audio einem Hörer-Panel vorspielen, jeden bitten, es von 1 bis 5 zu bewerten, und die Bewertungen mitteln. MOS ist die Standardmetrik für Sprachqualität genau deshalb, weil sie die Frage stellt, die zählt — würde ein Mensch das akzeptabel finden — statt einer Ersatzgröße dafür. Sie ist auch teuer. Ein Panel zu rekrutieren, es konsistent durchzuführen und es für jede Sprache, jede Aufnahmebedingung und jede Modellversion zu wiederholen, die ein kleines Team ausliefert, ist etwas, mit dem ein Hörer-Panel nicht Schritt halten kann.

[`speechonnxmetrics`](https://github.com/TigreGotico/speechonnxmetrics) ist eine Bibliothek, um dieses Urteil ohne Panel anzunähern, bei jedem Build. Sie gruppiert ihre Metriken in drei Familien, und die richtige Familie für die jeweilige Situation zu wählen ist wichtiger als jede einzelne Zahl.

## Drei Familien, drei Fragen

**Referenzlose MOS-Schätzer** sind neuronale Netze, die trainiert wurden, vorherzusagen, was ein Hörer-Panel sagen würde, allein anhand des Audios. Sie brauchen kein sauberes Original — nur die Ausgabe, die Sie beurteilen wollen. Verwenden Sie diese Familie, wenn es keine Grundwahrheit zum Vergleich gibt: die Ausgabe eines TTS-Systems bewerten, oder eine echte, bereits degradierte Aufnahme nach der Entrauschung prüfen.

**Intrusive Metriken** brauchen eine passende saubere Referenz und messen den Abstand zwischen ihr und dem degradierten Signal. Verwenden Sie diese Familie, wenn Sie die Degradation selbst herbeigeführt haben und das saubere Original noch besitzen: Sie haben eine bekanntermaßen gute Aufnahme durch einen Codec, ein Bandbreitenerweiterungsmodell oder einen Voice-Converter geschickt und wollen wissen, wie weit die Ausgabe von der Quelle abgedriftet ist.

**ASR-basierte Textmetriken** transkribieren die Ausgabe mit einem Spracherkenner und vergleichen die Transkription mit dem erwarteten Text. Das erfasst etwas, das die anderen beiden Familien nicht können: Audio, das vollkommen natürlich und sauber klingt, aber die falschen Wörter sagt. Ein referenzloser MOS-Schätzer bewertet Natürlichkeit, nicht Korrektheit — eine flüssige Fehlaussprache bewertet gut. Eine intrusive Metrik braucht eine Referenz-Wellenform, keinen Referenzsatz. Nur der Textvergleich erfasst ein falsches Wort.

Die Bibliothek stellt dies über eine Funktion bereit:

```python
import speechonnxmetrics as s

# Referenzlos: nur die Ausgabe wird gebraucht, keine Grundwahrheit existiert
s.score("output.wav", ["utmos"])

# Intrusiv: braucht eine saubere Referenz, ref= ist erforderlich
s.score("degraded.wav", ["stoi", "mcd", "si_sdr"], ref="clean.wav")
```

Textmetriken leben in einem separaten Modul, `speechonnxmetrics.asr`, weil sie Zeichenketten vergleichen, kein Audio — `s.score()` leitet nur Metriken weiter, die eine Wellenform entgegennehmen.

## Referenzloses MOS: die Zahlen lesen

Vier MOS-Schätzer werden ausgeliefert, jeder gibt Werte auf einer Skala von 1 bis 5 zurück, wobei höher besser ist — dieselbe Skala, die ein menschliches Panel verwendet:

| Metrik | Dimensionen | trainiert auf | kommerzielle Nutzung |
|---|---|---|---|
| `utmos` | ein Natürlichkeitswert | synthetisierte Sprache (VoiceMOS Challenge) | ja |
| `dnsmos` | `sig` / `bak` / `ovrl` (Sprachqualität / Hintergrundrauschen / Gesamteindruck) | ITU-T P.835 | ja |
| `dnsmos_p808` | ein crowdsourcing-basierter Hör-MOS | ITU-T P.808 | ja |
| `sigmos` | 7 Dimensionen (`col`, `disc`, `loud`, `noise`, `reverb`, `sig`, `ovrl`) | ITU-T P.804 | ja |
| `nisqa` | `mos` plus `noi`/`dis`/`col`/`loud`-Aufschlüsselung | NISQA-v2 | **nein — CC BY-NC-SA 4.0** |

`nisqa` ist die einzige Metrik der gesamten Bibliothek mit nicht-kommerziellen Gewichten. Die anderen vier sind MIT-lizenziert. `speechonnxmetrics` filtert das nicht für Sie; es gibt die Lizenz an und überlässt die Wahl der aufrufenden Stelle.

Hier ist, was echtes Audio erzielt. Die eigenen mitgelieferten Fixtures der Bibliothek — eine saubere Aufnahme (`source.wav`) und eine Neuresynthese desselben Clips per neuronalem Codec (`facodec_aria.wav`) — durch UTMOS laufen lassen:

```python
>>> s.score("source.wav", ["utmos"])
{'utmos': 4.41}
>>> s.score("facodec_aria.wav", ["utmos"])
{'utmos': 3.21}
```

Die saubere Aufnahme liegt nahe am oberen Ende der Skala, wie es sein sollte — es ist echte menschliche Sprache, nicht synthetisiert. Die Codec-Resynthese fällt um mehr als einen vollen Punkt. Diese Lücke, mehr als jede der beiden Zahlen für sich, ist das nützliche Signal: Sie sagt Ihnen, dass der Codec eine hörbare Degradation einführt, und gibt Ihnen eine Zahl, die Sie verfolgen können, während der Codec abgestimmt wird.

DNSMOS auf derselben sauberen Aufnahme:

```python
>>> s.score("source.wav", ["dnsmos"])
{'dnsmos.sig': 3.45, 'dnsmos.bak': 3.60, 'dnsmos.ovrl': 2.93}
```

Drei Zahlen, nicht eine, und sie weichen voneinander ab — `ovrl` liegt merklich unter sowohl `sig` als auch `bak`. Diese Abweichung ist informativ, kein Fehler: `ovrl` ist P.835s Bewertung des gesamten Hörerlebnisses, und sie neigt dazu, eine Aufnahme härter zu bestrafen, als jede Einzelkomponente allein vermuten ließe, besonders bei einer realen Aufnahme statt einer Studioaufnahme. Wenn `bak` niedrig ist, suchen Sie nach Hintergrundgeräuschen. Wenn `sig` niedrig ist, suchen Sie nach Artefakten auf Stimmebene — Clipping, Aussetzer, roboterhaftes Timbre. Es lohnt sich, mehr als einen Prädiktor für denselben Clip zu berichten: Sie sind mit unterschiedlichen Daten trainiert und weichen auf informative Weise voneinander ab, und eine große Lücke zwischen zwei unabhängigen Prädiktoren beim selben Clip ist ein Hinweis, doch einmal hinzuhören.

## Intrusive Metriken: die Zahlen lesen

Elf referenzbasierte Metriken messen den Abstand von einem sauberen Original. Diese sollte man zuerst kennen:

| Metrik | Bereich | Richtung | misst |
|---|---|---|---|
| `stoi` / `estoi` | 0–1 | höher ist besser | Short-Time Objective Intelligibility — wie viel vom *Inhalt* überlebt, unabhängig davon, wie natürlich es klingt |
| `si_sdr` / `sdr` / `snr` | dB, unbegrenzt | höher ist besser | Signal-zu-Verzerrung-/Signal-zu-Rausch-Verhältnis |
| `mcd` | dB, unbegrenzt | niedriger ist besser | Mel-Cepstral-Distortion — Abstand der Spektralhülle, eine klassische TTS/VC-Qualitätsmetrik |
| `log_f0_rmse` | unbegrenzt | niedriger ist besser | Tonhöhenkontur-Fehler |
| `lsd` / `msd` | dB | niedriger ist besser | log-spektrale / mel-spektrale Distanz |

Beachten Sie, dass sich die Richtung umkehrt: STOI und die SDR-Familie steigen, wenn die Qualität besser wird; MCD, Tonhöhenfehler und spektrale Distanz sinken. Das beim Lesen einer Tabelle zu verwechseln, ist ein leichter Fehler.

Die gleiche Codec-Resynthese gegen ihre saubere Quelle bewerten:

```python
>>> s.score("facodec_aria.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav")
{'stoi': 0.662, 'mcd': 10.46, 'si_sdr': -26.94}
```

Ein STOI von 0,66 auf einer 0-bis-1-Skala, auf der 1,0 eine perfekte Übereinstimmung ist, besagt, dass die Verständlichkeit einen echten Treffer erlitten hat — das liegt deutlich unter dem, was eine nur leicht verarbeitete Aufnahme erzielen würde. Ein SI-SDR von etwa −27 dB bestätigt das: SI-SDR ist negativ, wann immer die Verzerrungsenergie die Signalenergie übersteigt, und eine große negative Zahl bedeutet eine starke strukturelle Veränderung, nicht nur hinzugefügtes Rauschen. Ein MCD von 10,46 dB ist hoch; veröffentlichte TTS-Systeme, die eindeutig synthetisch klingen, aber sprecherkonsistent bleiben, liegen typischerweise im einstelligen Bereich, sodass 10+ auf eine erhebliche Drift der Spektralhülle zwischen Resynthese und Original hinweist.

## ASR-basierte Metriken: die Zahlen lesen

Fünf Textmetriken stammen aus einer einzigen Levenshtein-Ausrichtung zwischen einer Referenztranskription und einer Hypothese (dem, was das Audio tatsächlich transkribiert wurde):

| Metrik | Bereich | Richtung | Bedeutung |
|---|---|---|---|
| `wer` | ≥ 0 (üblicherweise 0–1, kann 1 überschreiten) | niedriger ist besser | Word Error Rate: Ersetzungen + Auslassungen + Einfügungen, geteilt durch die Anzahl der Referenzwörter |
| `cer` | 0–1 | niedriger ist besser | dieselbe Idee auf Zeichenebene — nachsichtiger gegenüber kleinen Rechtschreib-/Tokenisierungsabweichungen |
| `mer` | 0–1 | niedriger ist besser | Match Error Rate |
| `wil` | 0–1 | niedriger ist besser | verlorene Wortinformation |
| `wip` | 0–1 | höher ist besser | erhaltene Wortinformation (`1 − wil`) |

Ein durchgerechnetes Beispiel: Referenz "the quick brown fox jumps over the lazy dog" gegen Hypothese "the quick brown fox jumped over a lazy dog" (eine Ersetzung, "jumps" → "jumped", eine Auslassung von "the"):

```python
>>> from speechonnxmetrics import asr
>>> from speechonnxmetrics.asr import BASIC
>>> asr.wer(reference, hypothesis, normalizer=BASIC)
0.222
>>> asr.cer(reference, hypothesis, normalizer=BASIC)
0.116
```

Ein WER von 0,22 bedeutet, dass etwa jedes fünfte Wort falsch ist — merklich, hörenswert. Der CER ist beim selben Paar niedriger, weil die Bewertung auf Zeichenebene eine einzelne Wortersetzung als eine Handvoll Zeicheneditierungen innerhalb einer viel längeren Zeichenkette behandelt, nicht als ganzes fehlendes Token; CER und WER beantworten unterschiedliche Fragen und sind nicht direkt miteinander vergleichbar. Ein WER über etwa 0,3–0,4 bei natürlicher Sprache bedeutet meist, dass das ASR-System oder das transkribierte Audio ein echtes Problem hat, keinen Rundungsfehler.

`speechonnxmetrics` normalisiert Text niemals von sich aus — ein Rohvergleich zählt Groß-/Kleinschreibung und Interpunktion als Fehler, was selten das ist, was Sie wollen, wenn Sie Aussprache statt exakter Transkriptionsformatierung bewerten. Übergeben Sie einen Normalizer explizit: `BASIC` wandelt in Kleinbuchstaben um und kollabiert Leerraum, `STRICT` erweitert zusätzlich Kontraktionen und entfernt Diakritika, Interpunktion und Füllwörter.

## Der wichtigste Vorbehalt

Jede referenzlose MOS-Zahl in dieser Bibliothek ist eine Vorhersage eines Modells, keine Messung einer Tatsache. UTMOS, DNSMOS, SIGMOS und NISQA wurden jeweils mit einem bestimmten Satz von Hörtestdaten trainiert, in bestimmten Sprachen und Aufnahmebedingungen. Ein Prädiktor, der überwiegend mit englischen Studioaufnahmen trainiert wurde, kann eine Sprache, die er im Training nie sah, einen Akzent, den sein Trainingspanel nie bewertete, oder eine Aufnahmebedingung — Telefonaudio, ein lauter Raum, ein ressourcenarmes Mikrofon — außerhalb seiner Trainingsverteilung falsch beurteilen. Das Modell lügt nicht; es extrapoliert, und Extrapolation aus unvertrauten Eingaben ist der Bereich, in dem neuronale Prädiktoren am wenigsten zuverlässig sind.

Behandeln Sie einen vorhergesagten MOS als Beweis, nicht als Grundwahrheit. Er ist vertrauenswürdig für das, worin er gut ist: das Erfassen großer Regressionen, das Ranking mehrerer Kandidaten gegeneinander, und das Kennzeichnen eines Durchlaufs, den ein Mensch tatsächlich anhören muss. Er ist kein Ersatz für ein echtes Hörer-Panel, wenn eine Entscheidung folgenreich ist, und sollte nicht das letzte Wort über eine Sprache oder Bedingung sein, für deren Beurteilung das zugrundeliegende Modell nicht trainiert wurde. Mehrere Prädiktoren gemeinsam zu berichten und Uneinigkeit zwischen ihnen als Aufforderung zum Hinhören statt als wegzumittelndes Rauschen zu behandeln, ist die praktische Abhilfe.

## Warum das einen Vergleich erst brauchbar macht

Nichts davon ist isoliert nützlich. Es wird nützlich in dem Moment, in dem mehrere Engines auf gleicher Grundlage verglichen werden müssen — welche TTS-Engine, welche STT-Engine, welches Verbesserungsmodell als Standard dienen soll. Die [reinen ONNX-Sprachbibliotheken](/de/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries), zu deren Bewertung `speechonnxmetrics` gebaut wurde — TTS, ASR, Entrauschung, Voice Cloning — veröffentlichen Vergleiche pro Engine, die genau mit den obigen Metriken erstellt wurden: referenzloses MOS für Systeme ohne Grundwahrheit, intrusive Metriken, wo eine saubere Referenz existiert, WER/CER, wo immer die Korrektheit der Transkription infrage steht. Das ist es, was aus "wir haben uns für diese Engine entschieden" eine Zahl macht, die jemand anderes überprüfen kann.

Wenn Ihr Projekt eine so bewertete Sprache, Engine oder Aufnahmebedingung braucht und sie noch nicht abgedeckt ist, [nehmen Sie Kontakt auf](/de/contact) oder sehen Sie sich [unsere Leistungen](/de/services) an.
