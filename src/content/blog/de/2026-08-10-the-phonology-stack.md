---
title: "Wie der Phonologie-Stack zusammenpasst"
description: "Eine Architektur-Führung durch unseren Text-zu-Aussprache-Stack: scriptconv für Notation, orthography2ipa als sprachübergreifende Graphem-zu-IPA-Engine, sprachspezifische Frontends darauf aufbauend für Portugiesisch, Baskisch, Mirandesisch, Barranquenho und Arabisch, sowie phonematcher für klangbasierte Suche. Zeigt, warum die Ebenen existieren, was ein Kandidatengitter ist, und echte Dialekt-Ausgaben."
date: 2026-08-01
lang: de
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "Linguistics"
  - "FOSS"
draft: false
---

Nehmen Sie das englische Wort "read". Geschrieben verrät es nicht, wie man es
ausspricht. "I read the book yesterday" und "I read the book every day"
verwenden dieselben fünf Buchstaben für zwei unterschiedliche Laute — der eine
reimt sich auf "red", der andere auf "reed". Ein Screenreader, ein
Sprachassistent oder eine Suchbox, die nur auf die Schreibweise schaut, kann
das nicht richtig hinbekommen. Es muss über Aussprache nachdenken, nicht nur
über Text.

Dieses Denkproblem — geschriebene Wörter in die Laute zu verwandeln, die sie
darstellen — ist das, was unser Phonologie-Stack löst. Dieser Beitrag ist eine
Landkarte davon, wie seine Teile zusammenpassen, von der rohen Notation bis
hinauf zu sprachspezifischen Aussprache-Engines und klangbasierter Suche.

## Ein paar Begriffe, schlicht erklärt

Ein paar Wörter, die im Folgenden immer wieder auftauchen:

- **Graphem**: ein geschriebenes Symbol — ein Buchstabe oder eine
  Buchstabenkombination wie "ch".
- **Phonem**: eine unterscheidbare Lauteinheit einer Sprache, etwa der
  "k"-Laut in "cat".
- **IPA** (Internationales Phonetisches Alphabet): ein Standardalphabet, um
  Laute präzise niederzuschreiben, unabhängig von der Schreibweise einer
  Sprache. "Cat" wird im IPA als `kæt` geschrieben.
- **G2P** (Graphem-zu-Phonem): das allgemeine Problem, Schreibweise in Klang
  zu übersetzen.
- **Allophon**: eine kontextabhängige Realisierungsvariante desselben
  Phonems — das "t" in "top" und das "t" in "stop" sind im Englischen dasselbe
  Phonem, werden aber leicht unterschiedlich ausgesprochen.
- **Silbentrennung**: die Aufteilung eines Wortes in Silben, z. B.
  "extraordinário" in `ex-tra-or-di-ná-ri-o`.
- **Homograph**: zwei Wörter, die gleich geschrieben werden, aber
  unterschiedliche Bedeutungen haben; ein **heterophones Homograph** (oder
  Heterophon) ist ein Homograph, das je nach gemeinter Bedeutung
  unterschiedlich ausgesprochen wird, wie "read"/"read" oben.
- **Morphologie**: die innere Struktur von Wörtern — Präfixe, Wurzeln,
  Suffixe, Flexionen.
- **Part-of-Speech-(POS)-Tagging**: jedes Wort in einem Satz als Nomen, Verb,
  Adjektiv und so weiter zu kennzeichnen.

## Das Kernproblem

Schreibweise ist eine verlustbehaftete Kodierung von Klang. Drei getrennte
Dinge machen sie schwer umzukehren:

1. **Mehrdeutigkeit.** Dieselben Buchstaben können je nach Bedeutung,
   Grammatik oder schlichter Unregelmäßigkeit auf unterschiedliche Laute
   abbilden ("read" oben; das Englische ist voll davon).
2. **Dialekt.** Dasselbe Wort, in derselben Sprache, wird je nach Herkunft
   des Sprechers unterschiedlich ausgesprochen. Europäisches und
   brasilianisches Portugiesisch teilen die Schreibweise, aber nicht die
   Vokale.
3. **Abdeckung.** Die meisten Sprachen der Welt haben überhaupt kein
   professionell kuratiertes Ausspracheverzeichnis. Ein G2P-System, das nur
   über eine Nachschlagetabelle funktioniert, ist ein System, das nur für eine
   Handvoll Sprachen funktioniert.

Jeder ernsthafte Versuch bei Text-zu-Sprache, Trainingsdaten für
Spracherkennung oder phonetisch bewusster Suche muss sich mit allen dreien
auseinandersetzen.

## Warum der Stack in Schichten aufgebaut ist

Der Stack teilt das Problem in Schichten auf, die nichts voneinander wissen
müssen:

- **Notation** — Umwandlung zwischen phonetischen Alphabeten und Schriften.
  Das hat nichts mit der Phonologie einer bestimmten Sprache zu tun; es ist
  Symbolübersetzung.
- **Phonologie** — Abbildung von Schreibweise auf IPA für eine gegebene
  Sprache, mithilfe einer Spezifikation ihres Lautsystems.
- **Sprachspezifische Ausnahmebehandlung** — die unregelmäßigen Wörter,
  Dialekteigenheiten, Homographe und morphologischen Strukturen, die eine
  allgemeine Engine nicht allein aus Rechtschreibregeln ableiten kann.

Diese getrennt zu halten ist eine Designentscheidung, kein Zufall, und sie
hat einen direkten Gewinn: Eine neue Sprache hinzuzufügen bedeutet, eine
**Spezifikation** zu schreiben (Daten, die ihr Lautsystem beschreiben), nicht
ein neues Programm. Die Engine, die die Spezifikation konsumiert, die
Gittersuche, der Tokenizer, die Distanzmetriken — nichts davon wird neu
geschrieben. Die darunterliegende Notationsschicht wird von jeder Sprache
geteilt, auch von solchen, von denen die Phonologie-Engine noch nie gehört
hat.

### Die Notationsschicht: scriptconv

[scriptconv](https://github.com/TigreGotico/scriptconv) ist ein
abhängigkeitsfreier Kern für phonetische Notation und Schriftbehandlung:
ISO-15924-Schrifterkennung, IPA-Umwandlungen zu und von ARPABET, X-SAMPA,
Lexique, Kirshenbaum, Cotovía und RFE-Notation, Buckwalter-Transliteration
für Arabisch, Hangul-Zerlegung in Jamo und Kana-Behandlung. Nichts davon
erfordert zu wissen, zu welcher Sprache ein Wort gehört — eine IPA-Phonemkette
wird unabhängig von der Ausgangssprache genauso in ARPABET umgewandelt:

```python
>>> import scriptconv as s
>>> s.ipa_to_arpa("kæt")
'K AE T'
>>> s.ipa_to_xsampa("kæt")
'k{t'
```

Jede Schicht darüber kann davon ausgehen, dass die Notationsumwandlung bereits
gelöst ist.

### Die Engine: orthography2ipa

[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) ist die
sprachübergreifende Engine. Sie nimmt eine Sprachspezifikation — eine
deklarative Beschreibung der Graphem-zu-Phonem-Regeln dieser Sprache — und ein
Stück Text und erzeugt IPA. Zum Zeitpunkt dieses Beitrags liefert sie
Spezifikationen für **807 Sprachen** aus (`available_codes()` am
installierten Paket gibt eine Liste dieser Länge zurück; betrachten Sie die
genaue Zahl als beweglich, da laufend Spezifikationen hinzugefügt werden).

```python
>>> import orthography2ipa as o
>>> len(o.available_codes())
807
```

Die Engine selbst enthält keinen fest eingebauten sprachspezifischen Code.
Eine neue Sprache ist eine neue Spezifikationsdatei, geprüft gegen dasselbe
Schema wie jede andere Spezifikation.

## Das Gitter: bewertete Kandidaten statt einer Vermutung

Angesichts des oben genannten Mehrdeutigkeitsproblems ist die Festlegung auf
eine einzige Ausgabe pro Wort oft falsch. orthography2ipa erzeugt stattdessen
ein **Gitter** — eine Menge bewerteter Kandidatenaussprachen — und überlässt
es höheren Schichten, diese mithilfe von Kontext einzugrenzen, den die Engine
selbst nicht hat (Bedeutung, Wortart, ein Lexikoneintrag).

Nehmen Sie noch einmal "read":

```python
>>> from orthography2ipa import G2P
>>> g = G2P("en")
>>> g.transcribe("read")
'ɹiːd'
>>> g.candidates("read")
[IPAPath('ɹiːd', score=0.0), IPAPath('ɹɛd', score=1.0)]
```

Ohne mehr Kontext gibt die Engine ihre beste Vermutung zurück (Präsens,
geringere Kosten), behält aber die Alternative (Vergangenheit) mit ihren
zugehörigen Kosten im Gitter. Eine nachgelagerte Komponente, die weiß, dass
der Satz in der Vergangenheit steht, kann statt der ersten die zweite
Kandidatin wählen. Das ist dieselbe Idee, die, in größerem Maßstab, bifonia
(unten) für portugiesische Heterophone verwendet: eine allgemeine
Gitter-Engine liefert Kandidaten, eine engere, besser informierte Schicht
wählt unter ihnen aus.

## Dialekte sind erstklassig

Zwei Sprecher derselben Sprache können denselben Satz unterschiedlich
aussprechen, und ein Phonologie-Stack, der "Portugiesisch" als ein einziges
festes Lautsystem behandelt, wird jeden Dialekt bis auf einen falsch
bekommen. orthography2ipa legt die Dialektbehandlung offen —
`available_profiles()` am installierten Paket listet Dialekt- und
Lekt-Profile wie `lisbon`, `porto`, `estremenho`, `galician` und andere auf —
und [tugaphone](https://github.com/TigreGotico/tugaphone), das darauf
aufbauende portugiesische Frontend, phonemisiert denselben Satz über
lusophone Varietäten hinweg. Hier ist ein Satz, durch alle fünf
unterstützten Dialekte geführt:

| Dialekt | Ausgabe |
|---|---|
| pt-PT (Portugal) | `ˈbõ ˈdiɐ ˈkomu eˈʃta vɔˈse` |
| pt-BR (Brasilien) | `ˈbõ ˈdʒiɐ ˈkɔ̃mʊ eˈsta voˈse` |
| pt-AO (Angola) | `ˈbõ ˈdiɐ ˈkomʊ eˈsta vɔˈse` |
| pt-MZ (Mosambik) | `ˈbõ ˈdiɐ ˈkomu eˈsta vɔˈse` |
| pt-TL (Timor-Leste) | `ˈbõ ˈdiə ˈkoɔmʊ eˈsta vɔˈse` |

("Bom dia, como está você?" — "Guten Morgen, wie geht es Ihnen?") Das
Konsonantengerüst bleibt über alle fünf hinweg erkennbar, aber zwei bekannte
Marker unterscheiden sie sofort. In "dia" verwandelt das brasilianische
Portugiesisch das `d` vor einem `i` in `dʒ`, den Laut am Anfang des
englischen "jam" — die anderen behalten ein einfaches `d`. In "está" spricht
das europäische Portugiesisch das `s` am Silbenende als `ʃ` aus, das "sch"
von "Schuh", während jede andere Varietät `s` behält. Ein aus den Regeln
eines Dialekts gebautes Ausspracheverzeichnis bekommt beides für die
Zuhörerschaft jedes anderen Dialekts falsch.

[euskaphone](https://github.com/TigreGotico/euskaphone) macht dasselbe für
baskische Dialekte, direkt auf dem orthography2ipa-Gitter aufgebaut statt auf
einer separaten Engine:

```python
>>> from euskaphone import EuskaPhonemizer
>>> EuskaPhonemizer().phonemize_sentence("Kaixo, zer moduz zaude?")
'kai̯ʃo s̻er modus̻ s̻au̯de'
```

## Die sprachspezifischen Frontends

Über der gemeinsamen Engine sitzen Frontends, die hinzufügen, was eine
allgemeine Spezifikation nicht kann: unregelmäßige Wörter, ein kuratiertes
Lexikon, Sandhi (Lautveränderungen an Wortgrenzen) und dialektspezifische
Überschreibungen.

- **[tugaphone](https://github.com/TigreGotico/tugaphone)** — Portugiesisch,
  über pt-PT, pt-BR, pt-AO, pt-MZ und pt-TL hinweg, das ein kuratiertes
  Lexikon mit regelbasiertem Rückgriff kombiniert (oben gezeigt).
- **[euskaphone](https://github.com/TigreGotico/euskaphone)** — Baskisch,
  dialektbewusst, auf demselben Gitter aufgebaut (oben gezeigt).
- **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** —
  Mirandesisch, die asturleonesische Sprache der Terra de Miranda, Portugal,
  mit wortübergreifender Sandhi, Allophonie und Betonung:

  ```python
  >>> from mwl_phonemizer import phonemize
  >>> phonemize("Falo la lhéngua mirandesa.")
  'ˈfalu lɐ ˈʎɛŋɡwa miɾɐˈndez̺ɐ.'
  ```

- **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** —
  das erste offene G2P für Barranquenho, die iberoromanische Kontaktsprache
  von Barrancos, an der Grenze zwischen Portugal und Spanien. Siehe
  **[Der erste Phonemizer für Barranquenho](/blog/2025-12-12-barranquenho)**
  dazu, wie seine Regeln aus der eigenen orthografischen Konvention der
  Gemeinde abgeleitet wurden.
- **[arbtok](https://github.com/TigreGotico/arbtok)** — Arabisch, aufgebaut
  auf dem Gitter von orthography2ipa, ergänzt um dialektbewusste
  Diakritisierung und deckt Hocharabisch, Klassisches Arabisch und eine
  Reihe regionaler Varietäten ab. Arabische Schrift lässt normalerweise die
  Kurzvokalzeichen weg, die ein Phonemizer braucht, sodass die Hauptaufgabe
  von arbtok darin besteht, sie wiederherzustellen, bevor das Ergebnis an
  die gemeinsame Engine übergeben wird. Es wird von jemandem gepflegt, der
  kein arabischer Muttersprachler ist, behandeln Sie es also als aktiv in
  Entwicklung statt als fertige, muttersprachlich geprüfte Referenz —
  nützlich, aber die Stelle, an der Sie die Ausgabe gegen einen
  Muttersprachler gegenprüfen sollten, bevor Sie es in etwas
  Nutzerorientiertes ausliefern.

Jedes dieser Frontends ist eine dünne Schicht sprachspezifischer Logik über
derselben gemeinsamen Gitter-Engine und derselben gemeinsamen
Notationsschicht darunter. Keines davon implementiert IPA-Umwandlung oder
Gittersuche neu.

## Unterstützende portugiesische Werkzeuge

Portugiesisch hat den tiefsten Stack, weil portugiesische Aussprache von mehr
als Rechtschreibregeln abhängt: von Silbenstruktur, Wortklasse und
manchmal schlicht Bedeutung.

- **[silabificador](https://github.com/TigreGotico/silabificador)** teilt
  Wörter mithilfe handgefertigter Regeln in Silben:

  ```python
  >>> from silabificador import syllabify
  >>> syllabify("extraordinário")
  ['ex', 'tra', 'or', 'di', 'ná', 'ri', 'o']
  ```

- **[tugalex](https://github.com/TigreGotico/tugalex)** ist das Lexikon
  hinter tugaphone: IPA-Transkriptionen, Silbendaten und orthografische
  Regeln für reale Wörter, sodass gebräuchliches und unregelmäßiges
  Vokabular nicht jedes Mal neu aus der Schreibweise abgeleitet werden muss.
- **[tugatagger](https://github.com/TigreGotico/tugatagger)** umschließt
  mehrere POS-Tagging-Backends (spaCy, Stanza, ein Brill-artiger Tagger, ein
  abhängigkeitsfreier heuristischer Rückgriff) hinter einer Schnittstelle,
  sodass andere Werkzeuge fragen können, „welche Wortart ist dieses Wort",
  ohne sich auf ein bestimmtes Backend festzulegen.
- **[tugamorph](https://github.com/TigreGotico/tugamorph)** ist ein
  regelbasierter morphologischer Analysator: Er segmentiert ein Wort in
  Präfix, Wurzel, Suffix, Flexion und Klitikon, unter ausschließlicher
  Verwendung der Python-Standardbibliothek, optional geschärft durch
  silabificador und tugatagger.
- **[bifonia](https://github.com/TigreGotico/bifonia)** löst europäische
  portugiesische heterophone Homographe auf — Wörter wie "sede" (Durst,
  `ˈsedɨ`, gegenüber Hauptsitz, `ˈsɛdɨ`), bei denen die richtige Aussprache
  von der Bedeutung abhängt, nicht von der Grammatik. Siehe
  **[Richtig ausgesprochen: Portugiesische Heterophone für TTS disambiguieren](/blog/2026-06-12-disambiguating-portuguese-heterographs-for-tts)**
  dazu, wie es gebaut und evaluiert wurde. Das ist der konkrete Fall hinter
  der Gitter-Idee oben: orthography2ipa kann beide Lesarten von "sede"
  liefern, aber nur eine bedeutungsbewusste Schicht wie bifonia kann
  zwischen ihnen wählen.

Mehr dazu, wie silabificador und tugaphone im Alltag zusammenarbeiten, finden
Sie unter
**[Klassisches NLP für Portugiesisch: Silbentrennung und Graphem-zu-Phonem](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**,
und für die breitere Engine, die all dem zugrunde liegt,
**[Graphem-zu-IPA für 807 Sprachen](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**.

## Klangbasierte Suche: phonematcher

Alles oben Genannte verwandelt Text in Klang.
[phonematcher](https://github.com/TigreGotico/phonematcher) arbeitet mit den
Klangdarstellungen selbst: Es berechnet phonetische Distanz zwischen
IPA-Symbolen und führt Fuzzy-Suche über Wortlisten aus, basierend darauf, wie
Wörter klingen, statt wie sie geschrieben werden.

```python
>>> from phonematcher.distance import phonetic_distance
>>> phonetic_distance('b', 'p')   # voiced vs. voiceless bilabial stop — very similar
0.043478260869565216
>>> phonetic_distance('p', 'k')   # bilabial vs. velar stop — less similar
0.34782608695652173
>>> phonetic_distance('a', 'k')   # vowel vs. consonant — maximally different
1.0
```

Diese Distanzmetrik ist in zwei konkreten Situationen nützlich: bei der Suche
in einem Katalog von Wörtern oder Namen danach, wie etwas klingt, statt nach
seiner exakten Schreibweise (nützlich für tippfehlertolerante
Sprachschnittstellen und für den Abgleich von Lehnwörtern über
Schriftsysteme hinweg), und beim Vergleich, wie phonologisch nah zwei
verwandte Lekte beieinanderliegen — dieselbe Art von Vergleich, die die
Dialekttabelle oben mit dem Auge anstellt, aber berechnet statt geschätzt.
phonematcher ist nicht auf PyPI; es installiert sich aus dem Quellcode
(`pip install -e .` gegen das GitHub-Checkout, plus `rapidfuzz`).

## Ehrliche Grenzen

Die Abdeckung über 807 Sprachspezifikationen ist konstruktionsbedingt
ungleichmäßig: Sprachen mit einer etablierten phonologischen Literatur und
einem Lexikon liefern bessere Ausgaben als Sprachen mit einer dünnen
Spezifikation, die größtenteils aus allgemeinen orthografischen Konventionen
abgeleitet wurde. Die Qualität ist durchgängig am besten, wo ein kuratiertes
Lexikon existiert — Portugiesisch, gestützt durch tugalex, ist der stärkste
Fall im Stack; Sprachen, die sich rein auf Spezifikationsregeln ohne Lexikon
verlassen, behandeln unregelmäßiges und entlehntes Vokabular falsch.

Einige Komponenten sind ausdrücklich keine fertigen, muttersprachlich
geprüften Referenzen: arbtok wird von einem nicht-arabischen Muttersprachler
gepflegt und sollte vor der Verwendung in etwas Nutzerorientiertem gegen
muttersprachliches Urteil geprüft werden. Frontends, die auf dünnen
Spezifikationen aufbauen, erben diese Dünnheit — ein Frontend ist nur so gut
wie die Spezifikation und das Lexikon darunter.

## Warum das wichtig ist, wenn Ihre Sprache keine Sprachwerkzeuge hat

Die meisten Sprachen der Welt haben keine kommerzielle TTS-Stimme, kein
kommerzielles STT-Modell und kein professionell gepflegtes
Ausspracheverzeichnis. Das oben beschriebene geschichtete Design bedeutet,
dass diese Lücke nicht erfordert, eine Phonologie-Engine von Grund auf zu
bauen: Es erfordert, eine Spezifikation für das Lautsystem der Zielsprache
zu schreiben und, wo möglich, ein Lexikon ihrer unregelmäßigen Wörter zu
erstellen. Die Gitter-Engine, die Notationsumwandlungen und die
Suchwerkzeuge sind bereits vorhanden. Wenn Ihre Sprache, Ihr Dialekt oder Ihr
Produkt Ausspracheunterstützung braucht, die es noch nicht gibt, ist das die
Art von Arbeit, die wir übernehmen — siehe
**[unsere Leistungen](/services)** oder
**[nehmen Sie Kontakt auf](/contact)**.
