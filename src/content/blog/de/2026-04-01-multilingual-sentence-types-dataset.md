---
title: "Ein mehrsprachiger Satztypen-Datensatz: Fragen, Befehle, Aussagen"
description: "Wir haben sentence-types-multilingual veröffentlicht — fast 70.000 Sätze über sieben Sprachen, klassifiziert nach grammatischem Typ (Frage, Befehl, Aussage, Ausruf). Es ist das Trainingskorpus hinter der Routing-Bibliothek little_questions."
date: 2026-04-01
lang: de
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

Die Routing-Logik eines Sprachassistenten hängt davon ab, zu wissen, welche Art von Satz sie erhalten hat, bevor sie versucht, überhaupt etwas zu beantworten. Eine Frage braucht eine Antwort. Ein Befehl braucht eine Ausführung. Eine Aussage braucht vielleicht eine Bestätigung oder eine Speicherung. Diese Klassifizierung in jeder Sprache, die der Nutzer spricht, richtig hinzubekommen, ist die Voraussetzung für alles Weitere.

**[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** ist das Trainingskorpus hinter dieser Ebene: 69.300 gelabelte Sätze, 9.900 für jede der sieben Sprachen (Englisch, Spanisch, Französisch, Deutsch, Italienisch, Portugiesisch und Niederländisch).

## Was die Labels in der Praxis bedeuten

Der Datensatz verwendet eine flache Menge von sechs Labels: eine `label`-Spalte pro Zeile, ohne Aufteilung in Typ/Untertyp. Diese Labels bilden direkt darauf ab, wie `little_questions` (die Inferenzbibliothek, die diese Daten konsumiert) Äußerungen routet:

- **wh_question**: Fragen, die um ein Fragewort herum gebildet werden (was, wo, wer und so weiter).
- **polar_question**: Ja/Nein-Fragen. Die EAT-Taxonomie (Expected Answer Type) innerhalb von `little_questions` fügt zusätzlich zu den Frage-Labels 53 feingranulare Antworttyp-Labels hinzu (Person, Ort, Menge, Definition und so weiter), aber die Satztyp-Klassifizierung ist das erste Tor.
- **command**: Imperativformen. Befehle erwarten keine Antwort. Sie erwarten eine Aktion.
- **request**: höfliche oder indirekte Bitten um eine Handlung, unterschieden vom bloßen Imperativ.
- **statement**: deklarativ. Aussagen tragen in einem Dialogkontext oft eine Polarität, die nachgelagert von Bedeutung ist. Ein Ja/Nein/Vielleicht-Klassifikator läuft auf Aussagen, um Antworten auf vorherige Fragen zu interpretieren.
- **exclamation**: emotional markierte Äußerungen, die eine andere Behandlung erfordern als neutrale Deklarative.

```json
{
  "language": "en",
  "label": "wh_question",
  "text": "What time is it?"
}
```

## Warum sprachübergreifende Abdeckung nicht trivial ist

Dieselbe kommunikative Absicht tritt in verschiedenen Grammatiken unterschiedlich auf:

- Englisch markiert Fragen durch Umstellung der Wortstellung. Portugiesisch und Spanisch markieren sie oft allein durch Interpunktion und Intonation und lassen die Wortstellung unangetastet.
- Deutsch trennt Verben in Weise ans Satzende, die verschiebt, wo das klassifizierende Signal liegt.
- Romanische Sprachen verwenden für Befehle eine eigene Imperativmorphologie, die das Englische mit dem bloßen Verb ausdrückt.

Ein Modell, das nur auf Englisch trainiert wurde, macht dies überall sonst falsch. Parallel gelabelte Daten über die sieben Sprachen liefern das sprachübergreifende Signal, das sprachspezifische Klassifikatoren benötigen. Dieselbe Generierungs-Pipeline lässt sich auf weitere Sprachen erweitern, sobald sie hinzugefügt werden.

## Der nachgelagerte Stack

Die auf diesen Daten trainierten Modelle sind in **[little_questions](https://github.com/TigreGotico/little_questions)** enthalten, einer abhängigkeitsfreien Offline-Bibliothek (numpy + onnxruntime) mit sprachspezifischen ONNX-Klassifikatoren für den Satztyp und einem Ja/Nein-Polaritätsmodell für 43 Sprachen. Die Modelle sind für Englisch im Wheel gebündelt und werden für andere Sprachen bei Bedarf heruntergeladen. Die Satztyp-Klassifikatoren sind unter `TigreGotico/sentence-types` auf HuggingFace veröffentlicht. Die EAT-Antworttyp-Klassifikatoren werden intern trainiert und nicht öffentlich freigegeben.

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

`little_questions` ist die Routing-Ebene für natürliche Sprache für OVOS und LILACS: Zu klassifizieren, ob eine Äußerung eine Frage, ein Befehl oder eine Aussage ist, ist die erste Dispatch-Entscheidung, die eine Sprach-Pipeline trifft.

[**sentence-types-multilingual auf HuggingFace**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**little_questions auf GitHub**](https://github.com/TigreGotico/little_questions)
