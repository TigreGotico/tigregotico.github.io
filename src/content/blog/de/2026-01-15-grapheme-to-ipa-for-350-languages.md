---
title: "Graphem-zu-IPA für 820 Sprachen"
description: "orthography2ipa ist eine rein datenbasierte, linguistisch fundierte Ressource, die Schreibweise auf IPA abbildet und modelliert, wie Phoneme über 909 Sprachspezifikationen, 820 Sprachen und mehr als 20 Sprachfamilien hinweg als Allophone auftreten. Ein Kandidatengitter, dialektale Abstammung und ein schemavalidierter, mit der dialektologischen Literatur belegter Spezifikationssatz — keine trainierten Gewichte, vollständig selbst hostbar."
date: 2026-01-15
lang: de
updated: 2026-08-01
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

**[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** ist ein rein datenbasiertes Python-Paket: deklaratives JSON, dünne einsteckbare Logik, keine trainierten Gewichte. Es bildet Schreibweise auf IPA ab und modelliert, wie diese Phoneme im Kontext auftreten. Es liefert **909 Sprachspezifikationen, die 820 Sprachen abdecken** (plus 89 rein klassifikatorische Klade-Knoten) über **mehr als 20 Sprachfamilien** hinweg. Installieren Sie es, lesen Sie die Daten, forken Sie die Daten. Nichts ist in einem Checkpoint verborgen.

Es ist die Phonologie-Schicht unter allem Nachgelagerten. Das Kandidatengitter, das es erzeugt, speist mehrere Projekte: das arabische TTS-Frontend [arbtok](https://github.com/TigreGotico/arbtok), den portugiesischen Stacks [TugaPhone](https://github.com/TigreGotico/tugaphone) und [silabificador](https://github.com/TigreGotico/silabificador) (siehe **[klassisches NLP für portugiesische Silben und Phoneme](/de/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), dem [Barranquenho-Phonemizer](/de/blog/2025-12-12-barranquenho), dem Mirandesischen Phonemizer und der Phonem-Grundlage für **[TTS, das auf einer Kartoffel läuft](/de/blog/2026-05-10-tts-that-runs-on-a-potato)**.

## Zwei Abbildungen, nicht eine

Die entscheidende Unterscheidung: Eine **Graphem-Abbildung** sagt Ihnen, welche Phoneme eine Schreibweise darstellen *kann*. Eine **Allophon-Abbildung** sagt Ihnen, wie ein Phonem im Kontext *auftritt*. Beide zu vermengen ist der häufigste Fehlermodus in G2P-Systemen.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

Das englische ⟨th⟩ ist wirklich mehrdeutig zwischen /θ/ und /ð/. Das ist eine Schreibung-zu-Phonem-Tatsache. Das englische /t/ tritt als einfacher Verschlusslaut, aspirierter Verschlusslaut, Glottisverschluss oder Flap auf, je nachdem, wo es steht. Das ist eine Phonem-zu-Oberfläche-Tatsache. Die beiden getrennt zu halten bedeutet, dass Sie *Text → Phonemkandidaten* für die Transkription und *Phonem → Oberflächenrealisierung* für die Aussprachemodellierung durchführen können, ohne dass das eine das andere verfälscht. Für TTS ist das der Unterschied zwischen einem glaubwürdigen Akzent und einem roboterhaften. Für ASR ist es der Unterschied zwischen einem Lexikon, das dem entspricht, was Menschen tatsächlich sagen, und einem, das dem Wörterbuch entspricht.

## Was jede Sprache mit sich trägt

Jede Sprache ist eine eingefrorene `LanguageSpec`-Dataclass. Sie trägt weit mehr als nur eine Phonemliste: Grapheme (einschließlich Digraphen und Trigraphen), eine Allophon-Abbildung, positionale Grapheme für kontextsensitive Überschreibungen (wortinitial, intervokalisch, vor /i/), gewichtete Abstammung mit mehreren Vorfahren, wortübergreifende Sandhi-Regeln, ein optionales Toninventar und Herkunft. Herkunft bedeutet eine `QualityTier`, die von `stub → skeleton → research → production` reicht, einen `ScriptType` (Alphabet, Abjad, Abugida, …) und bibliografische Quellen mit Seitenverankerungen.

Die Aufnahmeregel ist streng: **Nur Abbildungen, die in der offiziellen Orthografie und einer dokumentierten Grammatik verankert sind, kommen hinein. Willkürliche Teilstring-Regeln sind ausgeschlossen.** Portugiesisch ⟨lh⟩, Deutsch ⟨sch⟩ und Englisch ⟨th⟩ sind enthalten, weil sie standardmäßige orthografische Einheiten sind. Bequeme, aber erfundene Heuristiken sind es nicht. Wenn eine Spezifikation Grapheme, aber keine explizite Allophon-Abbildung deklariert, wird eine grundlegende Identitätsabbildung abgeleitet: Jedes Phonem ist mindestens seine eigene Oberflächenrealisierung, sodass nichts stillschweigend verschwindet.

Regionale Varianten erhalten ihre eigenen Spezifikationen statt einer Kennzeichnung an einem übergeordneten Eintrag. Brasilianisches und europäisches Portugiesisch divergieren systematisch, daher sind sie eigenständige `LanguageSpec`-Objekte, die über die Abstammung verbunden sind:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

Dialektbäume bleiben pflegbar, weil JSON-Dateien die Vererbung `graphemes_base` / `allophones_base` unterstützen: Eine Variante deklariert nur das, was sich vom übergeordneten Eintrag unterscheidet. Die Abstammung ist gewichtet und hat mehrere Vorfahren (Elternteil, Substrat, Superstrat, Adstrat), was die ehrliche Art ist, Sprachen zu modellieren, die Kontaktprodukte statt reiner Abkömmlinge sind.

## Tief am Boden, nicht nur breit

Die Zahl 820 steht für Breite. Die Tiefe ist dort, wo die Arbeit liegt. Ein Lekt ist eine bestimmte Sprachvarietät, etwa ein Dialekt oder ein Standardregister. Die Spezifikationen gehen Lekt für Lekt so weit, wie es die dialektologische Literatur tut, und jede einzelne ist mit dieser Literatur samt Seitenverankerungen belegt, statt aus einer Phonemtabelle abgeleitet zu werden.

Die **iberische** Abdeckung ist das deutlichste Beispiel: **mehr als 100 Spezifikationen** für die Sprachen der Halbinsel. Das umfasst jede romanische Sprache Spaniens: Kastilisch, Katalanisch/Valencianisch, Galicisch (sowohl die RAG- als auch die reintegrationistische Norm), Asturisch, Aragonesisch und seine Talvarianten (Ansotano, Chistabín, Benasqués…) und Extremadurisch. Es umfasst außerdem Baskisch, die iberoromanischen Kreolsprachen und die historischen Schichten, die die meisten Ressourcen völlig überspringen: **Andalusisches Arabisch** und **Mozarabisch**. Die arabische Seite umfasst **34 Dialektlekte** (von Nadschdi und Hidschasi über Levantinisch, Maghrebinisch bis zu den Halbinselvarianten). Die lusophone Seite umfasst **46 Lekte des Portugiesischen und der Sprachen Portugals**, bis hinunter zu Rionoresisch, Guadramilesisch und den mirandesischen Subdialekten.

Nach unserem Kenntnisstand sind mehrere davon die **erste maschinenlesbare Phonologie**, die jemals für die betreffende Varietät veröffentlicht wurde: Rionoresisch und Guadramilesisch darunter. Eine maschinenlesbare Phonologie bedeutet eine strukturierte, schemavalidierte Graphem-/Allophon-Spezifikation, die ein Programm abfragen kann, im Gegensatz zu einem Phoneminventar, das in der dialektologischen Literatur nur in Prosa beschrieben wird. Die nachgelagerte Arbeit liefert die **ersten IPA-Wörterbücher** für **Barranquenho** und **Mirandesisch**.

## Ein Kandidatengitter, keine einzelne Vermutung

Schreibweise ist kein sauberes Segmentierungsproblem, daher ist die Vorzeigearchitektur ein **Kandidatengitter**. Der `PhonetokTokenizer` führt eine **Maximal-Munch**-Graphem-Tokenisierung durch, bevorzugt dabei gierig die längste passende orthografische Einheit, und erzeugt über die Graphemtabelle der Spezifikation ein positionsweises Gitter von nach Rang geordneten IPA-Kandidaten statt einer einzigen spröden Ausgabe:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

Das Gitter ist der Vertrag, auf dem die gesamte nachgelagerte Familie aufbaut. Eine sprachspezifische Engine konsumiert das gemeinsame Gitter und fügt nur die Phonologie hinzu, die eine statische Tabelle nicht ausdrücken kann, sodass jeder Konsument auf demselben fundierten Kern bleibt:

- **[arbtok](https://github.com/TigreGotico/arbtok)** baut die arabische TTS-Phonologie auf dem Gitter auf und ergänzt Sonnenbuchstaben-Assimilation, Elision des Hamzat al-Waṣl, Gemination und Ligaturbehandlung, plus eine neuartige **Rawi-Gitter-Fusion**, die die fehlenden Kurzvokale undiakritisierten dialektalen Textes wiederherstellt. Dazu bewertet sie die zeichenweise Verteilung eines Ensembles *unter der Lizenzierung des angeforderten Lekts*, statt einem freien Generator zu vertrauen.
- **[TugaPhone](https://github.com/TigreGotico/tugaphone)**, **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** (Mirandesisch) und **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** konsumieren allesamt denselben Lattice-Core für ihre lusophonen Varietäten.

## Distanz zwischen Sprachen messen

Da die Daten strukturiert sind statt in Gewichte eingebacken, können Sie Sprachen direkt vergleichen. Die Distanzmetriken umfassen die Dimensionen Inventar, Graphem, Allophon und Abstammung sowie eine separate Familie von Schrift-Distanzen:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.0515 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Auch Merkmalsvektoren werden bereitgestellt, sodass ein nahezu identisches Paar wie die beiden portugiesischen Standards bei 0,0515 landet, während wirklich weit entfernte Paare sich sauber trennen. Das ist gleichermaßen nützlich für Transfer-Learning-Entscheidungen, das Bootstrapping ressourcenarmer Sprachen und die Dialektometrie.

## Woher wir wissen, dass die Daten gut sind

Zuverlässiges G2P-„Gold“ existiert kaum. Die meisten öffentlichen Datensätze sind die eigene Ausgabe eines Phonemizers, die als Referenz wiederverwendet wird, sodass eine niedrige Fehlerrate dagegen „stimmt mit diesem Werkzeug überein“ bedeutet, nicht „korrekt“. Wir sind uns dessen ausdrücklich bewusst und haben eine Verifikationsmethodik darum herum aufgebaut, statt eine einzige schmeichelhafte Zahl zu berichten.

Für die Varietäten, die uns am meisten am Herzen liegen, ist Gold **verfasst, nicht abgegriffen**: ein engine-verankerter Satzsatz pro Lekt, beurteilt in **Blindpaaren**, arbitriert gegen **seitenverankerte Literatur** und über **Korrekturklassen** in eine Engine-Rückkopplungsschleife zurückgeführt. Eine Diskrepanz zwischen der Ausgabe der Engine und der korrigierten Form ist ein Hinweis auf einen tatsächlichen Spezifikationsfehler. Über das engine-verankerte TTS-Gold und die Primärquellenbelege hinweg gibt es **mehrere tausend verifizierte Zeilen**. Die Rahmung ist ehrlich in Bezug auf die Herkunft: synthetisch und literaturarbitriert, wo das alles ist, was existiert, und echtes menschliches Gold, wo es das gibt. Dieses menschliche Gold umfasst den muttersprachlichen mirandesischen `mirandese_g2p`-Satz, seitenverankerte Primärquellenbelege und muttersprachliche Beiträge. Genauigkeitsansprüche werden **nur** gegen menschliches Gold erhoben. Ein perfektes Ergebnis gegen den eigenen Entwurf der Engine würde nichts bedeuten.

Die Zahlen, gelesen als richtungsweisend und stets mit ihrer Quelle belegt ([`docs/scoreboard.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/scoreboard.md), [`docs/benchmarks.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/benchmarks.md) und die Benchmark-Dokumente der nachgelagerten Repos):

- **Arabische Dialekte, blanke undiakritisierte Eingabe**: der schwere, einsatzrealistische Fall. Auf arbtoks TTS-Gold mit blanker Eingabe (33 Lekte) erreicht die Rawi-Gitter-Fusion unter Dialektlizenzierung eine **mittlere PER (Phonemfehlerrate) von 0,189** und schlägt damit dasselbe Ensemble, das als freier Generator läuft (0,193), wobei sich der Vorsprung auf die Lekte konzentriert, die am stärksten vom Modernen Hocharabisch (MSA) abweichen. Bei den meisten Lekten schlägt arbtok espeak-ng bei der blanken Eingabe. Beim MSA selbst gewinnt espeak, das MSA-optimiert ist, immer noch (espeak 0,176 vs. arbtok 0,245).
- **Arabische Dialekte, diakritisierte Eingabe**: mit vorhandenen Zeichen liegt arbtoks PER bei **0,01–0,08** pro Lekt, deutlich unter espeaks einzelner MSA-Stimme (z. B. Nadschdi 0,009 vs. espeak 0,221, Ägyptisch 0,027 vs. espeak 0,287). espeak hat keine Dialektstimmen, dieser Vergleich ist also Äpfel gegen Birnen, aber der Abstand ist der Punkt.
- **Portugiesisch, gegen menschliches Expertengold**: das Lissabonner europäische Portugiesisch landet bei **PER 0,029** (88 % exakte Übereinstimmung) auf seitenverankerten Primärquellen und das muttersprachliche mirandesische Gold bei **0,146**.

Jede dieser Zahlen ist eine Ist-Zustands-Eigenschaft der Daten, querverwiesen auf ein Bootstrap-Konfidenzintervall, keine Ranglisten-Trophäe. Wo das Intervall breit oder die Stichprobe winzig ist, sagt das Scoreboard das.

## Die CLI

Alles Obige ist erreichbar, ohne Python zu schreiben. Das Konsolenskript `orthography2ipa` liefert `list`, `info`, `transcribe` und `distance`, und jeder Unterbefehl akzeptiert `--json`, um in eine Pipeline weitergeleitet zu werden.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Warum reine Daten wichtig sind

Der gesamte Spezifikationssatz ist schemavalidiert: eingefrorene Dataclasses im pydantic-Stil, überprüft durch eine Integritätstest-Suite, mit `SCHEMA.md`, das die Struktur dokumentiert. Wo eine statische Tabelle die Regeln wirklich nicht ausdrücken kann, steckt sprachspezifische Logik um die Daten herum. Silbentrenner registrieren sich über eine Entry-Point-Gruppe, und die schwereren Engines bauen nachgelagert auf dem gemeinsamen Gitter auf.

Es gibt kein undurchsichtiges Modell, das entscheidet, wie die Sprachen Ihrer Nutzer klingen. Die Abbildungen sind überprüfbar, die Quellen sind seitengenau zitiert, und eine Sprache hinzuzufügen bedeutet, eine validierte JSON-Datei zu schreiben. Beginnen Sie mit [`docs/adding_a_language.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/adding_a_language.md) und dem [Einstiegsleitfaden](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/getting_started.md). Für alle, die TTS, ASR oder phonetisches NLP entwickeln und sich weigern, ihre Phonologie an eine Blackbox auszulagern, und die sie auf ihrer eigenen Hardware laufen lassen möchten, ist das der Sinn der Sache. Es steht unter Apache 2.0, und es gehört Ihnen, es zu inspizieren, zu erweitern und selbst zu hosten.
</content>
</invoke>
