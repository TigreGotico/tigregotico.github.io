---
title: "Graphem-zu-IPA für über 350 Sprachen"
description: "orthography2ipa ist eine rein datenbasierte, linguistisch fundierte Ressource, die Schreibweise auf IPA abbildet und modelliert, wie Phoneme über mehr als 350 Sprachcodes und über 20 Sprachfamilien als Allophone auftreten. Ein Maximal-Munch-Tokenizer, phonologische und Schrift-Distanzmetriken, dialektale Abstammung und ein schemavalidierter Spezifikationssatz — keine trainierten Gewichte, vollständig selbst hostbar."
date: 2026-01-15
lang: de
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** ist ein rein datenbasiertes Python-Paket — deklaratives JSON, dünne einsteckbare Logik, keine trainierten Gewichte —, das Schreibweise auf IPA abbildet und modelliert, wie diese Phoneme im Kontext über **394 Sprachspezifikationen und mehr als 20 Sprachfamilien** hinweg auftreten. Installieren Sie es, lesen Sie die Daten, forken Sie die Daten. Nichts ist in einem Checkpoint verborgen.

Es treibt alles Nachgelagerte an: die portugiesischspezifischen Stacks [silabificador](https://github.com/TigreGotico/silabificador) und [TugaPhone](https://github.com/TigreGotico/tugaphone) (siehe **[klassisches NLP für portugiesische Silben und Phoneme](/de/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), das Barranquenho-G2P und die Phonem-Grundlage für **[TTS, das auf einer Kartoffel läuft](/de/blog/2026-05-10-tts-that-runs-on-a-potato)**.

## Zwei Abbildungen, nicht eine

Die entscheidende Unterscheidung: Eine **Graphem-Abbildung** sagt Ihnen, welche Phoneme eine Schreibweise darstellen *kann*. Eine **Allophon-Abbildung** sagt Ihnen, wie ein Phonem im Kontext *auftritt*. Beide zu vermengen ist der häufigste Fehlermodus in G2P-Systemen.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

Das englische ⟨th⟩ ist wirklich mehrdeutig zwischen /θ/ und /ð/ — das ist eine Schreibung-zu-Phonem-Tatsache. Das englische /t/ tritt als einfacher Verschlusslaut, aspirierter Verschlusslaut, Glottisverschluss oder Flap auf, je nachdem, wo es steht — das ist eine Phonem-zu-Oberfläche-Tatsache. Die beiden getrennt zu halten bedeutet, dass Sie *Text → Phonemkandidaten* für die Transkription und *Phonem → Oberflächenrealisierung* für die Aussprachemodellierung durchführen können, ohne dass das eine das andere verfälscht. Für TTS ist das der Unterschied zwischen einem glaubwürdigen Akzent und einem roboterhaften; für ASR ist es der Unterschied zwischen einem Lexikon, das dem entspricht, was Menschen tatsächlich sagen, und einem, das dem Wörterbuch entspricht.

## Was jede Sprache mit sich trägt

Jede Sprache ist eine eingefrorene `LanguageSpec`-Dataclass, und sie trägt weit mehr als nur eine Phonemliste: Grapheme (einschließlich Digraphen und Trigraphen), eine Allophon-Abbildung, **positionale Grapheme** für kontextsensitive Überschreibungen (wortinitial, intervokalisch, vor /i/), gewichtete **Abstammung** mit mehreren Vorfahren, wortübergreifende **Sandhi-Regeln**, ein optionales **Toninventar** und Herkunft — eine `QualityTier`, die von `stub → skeleton → research → production` reicht, einen `ScriptType` (Alphabet, Abjad, Abugida, …) und bibliografische Quellen.

Die Aufnahmeregel ist streng und verdient es, klar ausgesprochen zu werden: **Nur Abbildungen, die in der offiziellen Orthografie und einer dokumentierten Grammatik verankert sind, kommen hinein. Willkürliche Teilstring-Regeln sind ausgeschlossen.** Portugiesisch ⟨lh⟩, Deutsch ⟨sch⟩ und Englisch ⟨th⟩ sind enthalten, weil sie standardmäßige orthografische Einheiten sind. Bequeme, aber erfundene Heuristiken sind es nicht. Wenn eine Spezifikation Grapheme, aber keine explizite Allophon-Abbildung deklariert, wird eine grundlegende Identitätsabbildung abgeleitet — jedes Phonem ist mindestens seine eigene Oberflächenrealisierung —, sodass nichts stillschweigend verschwindet.

Regionale Varianten erhalten ihre eigenen Spezifikationen statt einer Kennzeichnung an einem übergeordneten Eintrag. Brasilianisches und europäisches Portugiesisch divergieren systematisch, daher sind sie eigenständige `LanguageSpec`-Objekte, die über die Abstammung verbunden sind:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Dialektbäume bleiben pflegbar, weil JSON-Dateien die Vererbung `graphemes_base` / `allophones_base` unterstützen: Eine Variante deklariert nur das, was sich vom übergeordneten Eintrag unterscheidet. Die Abstammung ist gewichtet und hat mehrere Vorfahren — Elternteil, Substrat, Superstrat, Adstrat —, was die ehrliche Art ist, Sprachen zu modellieren, die Kontaktprodukte statt reiner Abkömmlinge sind.

## Ein Tokenizer, der Mehrdeutigkeit zulässt

Schreibweise ist kein sauberes Segmentierungsproblem, daher liefert das Paket `PhonetokTokenizer`, einen **Maximal-Munch**-Graphem-Tokenizer mit IPA-Expansion per Beam-Suche. Er bevorzugt gierig die längste passende orthografische Einheit und erkundet dann eine Rangfolge von Kandidaten-Transkriptionen, wenn eine Schreibweise mehrdeutig ist:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

Statt auf eine einzige Ausgabe zu setzen, erhalten Sie einen bewerteten Beam — genau die Eingabe, die ein nachgelagertes Lexikon, ein Gitter oder ein Aussprache-Reranker möchte.

## Distanz zwischen Sprachen messen

Da die Daten strukturiert sind statt in Gewichte eingebacken, können Sie Sprachen direkt vergleichen. Die Distanzmetriken umfassen die Dimensionen Inventar, Graphem, Allophon und Abstammung sowie eine separate Familie von Schrift-Distanzen:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Auch Merkmalsvektoren werden bereitgestellt, sodass ein nahezu identisches Paar wie die beiden portugiesischen Standards bei 0,04 landet, während wirklich weit entfernte Paare sich sauber trennen. Das ist gleichermaßen nützlich für Transfer-Learning-Entscheidungen, das Bootstrapping ressourcenarmer Sprachen und die Dialektometrie.

## Die CLI

Alles Obige ist erreichbar, ohne Python zu schreiben. Das Konsolenskript `orthography2ipa` liefert `list`, `info`, `transcribe` und `distance`, und jeder Unterbefehl akzeptiert `--json`, um in eine Pipeline weitergeleitet zu werden.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Warum reine Daten wichtig sind

Der gesamte Spezifikationssatz ist schemavalidiert — eingefrorene Dataclasses im pydantic-Stil, **394 Spezifikationen**, überprüft durch eine Integritätstest-Suite, mit `SCHEMA.md`, das die Struktur dokumentiert. Wo eine statische Tabelle die Regeln wirklich nicht ausdrücken kann, steckt sprachspezifische Logik um die Daten herum: Silbentrenner registrieren sich über eine Entry-Point-Gruppe, und schwerere algorithmische G2P (wie unser arabischer Tokenizer [arbtok](https://github.com/TigreGotico/arbtok), der Sonnenbuchstaben-Assimilation, die Elision des Hamzat al-Wasl und Tanwin-Formen behandelt) baut nachgelagert auf denselben Spezifikationen auf.

Es gibt kein undurchsichtiges Modell, das entscheidet, wie die Sprachen Ihrer Nutzer klingen. Die Abbildungen sind überprüfbar, die Quellen sind zitiert, und eine Sprache hinzuzufügen bedeutet, eine validierte JSON-Datei zu schreiben. Für alle, die TTS, ASR oder phonetisches NLP entwickeln und sich weigern, ihre Phonologie an eine Blackbox auszulagern — und die sie auf ihrer eigenen Hardware laufen lassen möchten —, ist das der Sinn der Sache. Es steht unter Apache 2.0, und es gehört Ihnen, es zu inspizieren, zu erweitern und selbst zu hosten.
