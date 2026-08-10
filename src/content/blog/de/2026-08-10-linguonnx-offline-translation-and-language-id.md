---
title: "linguonnx: Offline-Übersetzung und Spracherkennung auf ONNX"
description: "linguonnx übersetzt Text und erkennt Sprachen auf der CPU, ohne torch und ohne Cloud. 184 int8-Übersetzungsmodelle und 5 Sprachidentifikationsmodelle, 586 erreichbare Sprachen, und ein Router, der kleine Modelle verkettet, wenn kein Modell ein Sprachpaar abdeckt."
date: 2026-08-10
lang: de
author: "Casimiro Ferreira"
tags:
  - "linguonnx"
  - "translation"
  - "language identification"
  - "ONNX"
  - "self-hosted"
  - "OVOS"
draft: false
---

[**linguonnx**](https://github.com/TigreGotico/linguonnx) ist eine
Python-Bibliothek für maschinelle Übersetzung und Sprachidentifikation. Sie läuft
auf `onnxruntime`, auf der CPU, offline. Sie benutzt zu keinem Zeitpunkt torch —
die Encoder-Decoder-Generierungsschleife samt Beam Search und KV-Cache ist direkt
gegen die ONNX-Graphen geschrieben.

```bash
pip install linguonnx
```

```python
from linguonnx import load_translator, load_detector

tx = load_translator()
print(tx.translate("bom dia, como estás?", src="pt", tgt="en"))
# 'Good morning, how are you?'   via opus-mt-pt-en-int8, 172 MB

det = load_detector()
print(det.detect("Egun on, zer moduz?"))    # 'eu'
```

Sie steht unter Apache-2.0 und lädt kein Modell herunter, das du nicht angefordert
hast.

## Was enthalten ist

Die Registry hält 369 Übersetzungseinträge — fp32 und int8 jedes Modells — und 10
Einträge zur Sprachidentifikation. `load_translator()` nutzt int8 als Vorgabe,
also routet eine Standardinstallation über 184 quantisierte Übersetzungsmodelle
und 5 quantisierte Klassifikatoren. Alle sind ONNX-Konvertierungen, veröffentlicht
unter [`TigreGotico/`](https://huggingface.co/TigreGotico) auf HuggingFace.

Über den Standardgraphen sind 586 Sprachen erreichbar. Diese Zahl ist in der
Testsuite festgeschrieben, also bleibt sie wahr, oder der Build sagt es.

Die Klassifikatoren sind ONNX-Exporte von vier fastText-Modellen: GlotLID, das
klassische `lid.176`, OpenLID und OpenLID-v2. GlotLID etikettiert 2102
*Varietäten*, also kommt umgangssprachliches Arabisch als Nadschdi (`ars`) zurück
und Chinesisch kann als Kantonesisch zurückkommen. Das ist Dialekterkennung, wenn
du sie willst, und `collapse_varieties=True`, wenn nicht.

## Ein Paar ohne Modell ist eine Kette von Modellen

Die meisten Sprachpaare haben kein bilinguales Modell. Der Router behandelt ein
Modell als Menge von Fähigkeiten und nicht als feste Kante, und verkettet Schritte,
wenn er muss:

```python
tx = load_translator(prefer="dedicated", max_model_mb=500, oversize_fallback=True)

route = tx.route("pt", "eu")
print(route.model_ids)   # ('opus-mt-pt-gl-int8', 'mt-hitz-gl-eu-int8')
print(route.pivots)      # ('gl',) — es ging über Galicisch
```

Unter dieser Politik geht Portugiesisch nach Baskisch über Galicisch, über zwei
Marian-Modelle mit 84 MB und 153 MB. Der Pivot ist nie stumm: die `Route` kommt
mit der Übersetzung zurück und sagt, welche Modelle sie benutzt hat und über
welche Sprachen sie ging.

Eine Route ist keine feste Tatsache über ein Sprachpaar. Sie ist das, was die
Vorgaben des Aufrufers aus der Registry machen: ändere das Größenbudget oder die
Vorliebe für Zwischenschritte, und dasselbe Paar geht über eine andere Sprache
oder schrumpft auf einen einzigen Schritt durch ein großes mehrsprachiges Modell.
Die `Route` sagt, welche es geworden ist.

Die Rangfolge bevorzugt die Institution, die die Sprache pflegt. HiTZ trainiert
Baskisch, Proxecto Nós Galicisch, Projecte AINA Katalanisch, AI4Bharat die
indischen Paare, Masakhane die westafrikanischen Paare, TartuNLP die
finno-ugrischen. Ein Modell der Spezialisten gewinnt den Gleichstand gegen ein
allgemeines mehrsprachiges Modell.

## Politik zur Laufzeit, nie beim Indexieren

Das ist das Gesetz der Registry: sie listet jedes veröffentlichte Modell, egal
welche Größe, welche Lizenz, welche Punktzahl. Filtern und Sortieren geschehen zur
Laufzeit, im Prozess des Aufrufers, nach dessen Regeln. Ein Modell, das der Index
weglässt, kann überhaupt nicht gewählt werden, also lässt der Index nichts weg.

Der Aufrufer setzt die Politik über `load_translator`: `max_model_mb`,
`oversize_fallback`, `count_cached_as_free`, `prefer`, `max_hops`, `precision`,
`model_cache_size`, `exclude_flagged` und `min_chrf`. Jede davon lässt sich auch
pro Aufruf überschreiben.

## Eine Größengrenze bevorzugt kleine Modelle, sie löscht keine Sprachen

Ein Größenbudget ist der naheliegende Regler für einen kleinen Rechner, und seine
naheliegende Umsetzung ist falsch. Als Filter benutzt, senkt `max_model_mb=500`
die 586 erreichbaren Sprachen auf 249, denn der lange Schwanz lebt in den großen
mehrsprachigen Modellen, und keine Kette kleiner Modelle ersetzt sie.

`oversize_fallback=True` macht aus dem Budget eine Präferenz:

```python
tx = load_translator(max_model_mb=500, oversize_fallback=True)

print(tx.route("en", "ca").model_ids)        # ('opus-mt-en-ca-int8',)    157 MB
print(tx.route("en", "cv").model_ids)        # ('madlad400-3b-mt-int8',) 4945 MB
print(tx.route("en", "cv").waived_size_cap)  # 500
print(len(tx.available_languages))           # 586, nicht 249
```

Englisch nach Katalanisch bleibt beim kleinen Modell, denn ein kleines Modell
existiert. Englisch nach Tschuwaschisch steigt auf MADLAD, denn MADLAD ist das
einzige Modell in der Registry mit Tschuwaschisch, und die Alternative ist keine
billigere Route, sondern keine Route. `waived_size_cap` sagt, welche Grenze die
Route überschreiten durfte, also erfährt ein Rechner mit 500 MB Budget, dass er
4945 MB geholt hat.

Vier Regeln halten das ehrlich. Die erweiterte Suche läuft nur für das Paar, das
leer zurückkam. Die Grenze steigt eine Modellgröße auf einmal, also bekommt ein
Paar, das NLLB-200 und MADLAD abdecken, NLLB-200. Die Grenze begrenzt ein Modell,
nicht eine Route, also findet die normale Suche eine Zwei-Schritt-Kette aus
237-MB-Modellen. Und die Eskalation geht nie über das Download-Budget hinaus.

## Erreichbar ist nicht benutzbar

`madlad400-3b-mt` deckt Tschuwaschisch ab. Frag es nach `en -> cv`, und es
antwortet auf Russisch: `"Good day, my friend."` kommt als
`"Добрый день, мой друг."` zurück. Das Routing ist korrekt — das
Tschuwaschisch-Tag ist ein eigenes SentencePiece-Stück — und das Modell schreibt
trotzdem die falsche Sprache.

Deshalb trägt ein Registry-Eintrag `language_flags`, eine Sprache nach der
anderen, mit der Beobachtung dahinter: Eingabe, Ausgabe, Urteil des Detektors
(`glotlid=ru`), Datum und Methode. Tschuwaschisch ist erreichbar und ist nicht
benutzbar, und die Registry sagt beides.

Die Qualität eines ganzen Modells wird genauso festgehalten. Ein Feld `quality`
trägt einen chrF-Wert gegen die **menschliche** FLORES-200-devtest-Referenz, mit
Korpus, Dekodiermodus und Stichprobengröße daneben, denn ein Wert ohne sichtbare
Stichprobengröße bedeutet nichts. Fehlt das Feld, heißt das ungemessen, was nicht
dasselbe ist wie schlecht, und nichts erfindet eine Zahl für ein ungemessenes
Modell. Zwei Prüfungen setzen eine Markierung: chrF unter 40 in einer der beiden
Präzisionen, und int8 mehr als 2 chrF hinter fp32.

Eine Markierung entfernt nichts aus der Registry. Sie gibt `exclude_flagged=True`
und `min_chrf=` etwas zum Handeln, und einem Menschen einen Grund zum Nachlesen:

```python
for reason in tx.quality_flag_reasons("opus-mt-az-en"):
    print(reason)
# chrF-vs-reference 25.9 is below the 40 floor (flores200-devtest, n=20)
```

Ein Durchlauf über die ganze Registry schickt einen echten Satz durch jedes
registrierte Modell und schlägt fehl bei leerer Ausgabe, Ausgabe nur aus
Leerzeichen, oder Ausgabe gleich der Eingabe. Die Beispielsätze sind pro
Quellsprache und von Hand geprüft; eine Sprache ohne Beispiel wird übersprungen
statt mit Text einer anderen Sprache getestet.

## Aus OpenVoiceOS heraus

[`ovos-plugin-linguonnx`](https://github.com/OpenVoiceOS/ovos-plugin-linguonnx)
verpackt die Bibliothek als zwei Plugins aus einer Installation: einen
Spracherkenner (`opm.lang.detect`, id `ovos-lang-detect-plugin-linguonnx`) und
einen Übersetzer (`opm.lang.translate`, id `ovos-translate-plugin-linguonnx`).
Beide laden Modelle beim ersten Gebrauch, und jedes Argument von `load_detector`
und `load_translator` ist aus `mycroft.conf` erreichbar.

Die Bibliothek dokumentiert den Rest: [routing](https://github.com/TigreGotico/linguonnx/blob/dev/docs/routing.md)
für die Politiken und das Größenbudget, [models](https://github.com/TigreGotico/linguonnx/blob/dev/docs/models.md)
für die Registry, und [licences](https://github.com/TigreGotico/linguonnx/blob/dev/docs/licences.md)
für die Lizenzstufen — GPL-3.0- und CC-BY-NC-4.0-Modelle stehen im Index und
müssen namentlich angefordert werden.
