---
title: "Schriften und phonetische Notationen: Was scriptconv tatsächlich umwandelt"
description: "Eine Tiefenanalyse von scriptconv, der abhängigkeitsfreien Bibliothek, die Schriftsysteme erkennt und zwischen phonetischen Notationen umwandelt. Behandelt IPA, ARPABET und X-SAMPA; ISO-15924-Schrifterkennung; Buckwalter-Transliteration für Arabisch; Hangul-Zerlegung in Jamo; und Kana-Umwandlung, mit echten, ausgeführten Beispielen und ehrlichen Grenzen."
date: 2026-08-01
lang: de
author: "Casimiro Ferreira"
tags:
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "Linguistics"
  - "FOSS"
draft: false
---

Ein US-Ausspracheverzeichnis sagt, dass "cat" wie `K AE1 T` klingt. Das Internationale Phonetische Alphabet schreibt denselben Laut als `kæt`. Ein anderes, nur-ASCII-System schreibt ihn als `k"{t`. Alle drei beschreiben genau dieselben zwei Phoneme — ein "k"-Laut, gefolgt von einem kurzen "a", gefolgt von einem "t". Am Laut hat sich nichts geändert. Nur das Alphabet, mit dem er niedergeschrieben wurde, hat sich geändert.

Das passiert ständig jedem, der Ausspracheinformationen aus mehr als einer Quelle zusammenführt. Ein Sprachdatensatz, der aus einem US-Verzeichnis gebaut wurde, verwendet eine Notation. Ein europäisches Lexikon verwendet eine andere. Eine Text-zu-Sprache-Engine erwartet eine dritte. Bevor solche Daten zusammengeführt, durchsucht oder verglichen werden können, müssen sie von einem phonetischen Alphabet in ein anderes übersetzt werden — dieselbe Aufgabe, die ein Übersetzer zwischen menschlichen Sprachen erledigt, nur dass hier die "Sprachen" Arten sind, Klang zu schreiben, statt Arten, Wörter zu schreiben.

`scriptconv` ist eine kleine Python-Bibliothek, die genau diese Übersetzung leistet, plus eine verwandte Aufgabe eine Ebene darüber: herauszufinden, in welchem Schriftsystem ein Textstück überhaupt steht, bevor irgendetwas anderes damit geschehen kann. Sie hat keine Meinung zur Linguistik — sie rät nicht, wie ein Wort ausgesprochen wird. Sie verschiebt nur Symbole, die bereits bekannte Laute darstellen, von einer Notation in eine andere, und sie identifiziert Schriften anhand der Zeichen selbst.

## Ein paar Begriffe, schlicht definiert

- **Schrift**: ein Schriftsystem — die tatsächliche Zeichenmenge, wie Latein, Kyrillisch oder Hangul. Nicht dasselbe wie eine Sprache: Englisch, Französisch und Vietnamesisch verwenden alle die lateinische Schrift, und Serbisch kann sowohl in Kyrillisch als auch in Latein geschrieben werden.
- **Orthografie**: die konventionellen Schreibregeln für das Schreiben einer bestimmten Sprache in einer Schrift — Großschreibung, Akzentzeichen, Wortabstand.
- **Phonem**: eine unterscheidbare Lauteinheit einer Sprache, etwa der "k"-Laut in "cat".
- **IPA** (Internationales Phonetisches Alphabet): ein Standardalphabet, um Laute präzise niederzuschreiben, unabhängig von der normalen Schreibweise einer Sprache.
- **Transliteration**: die Umwandlung von Text von einer Schrift in eine andere durch Zeichenzuordnung, mit dem Ziel, die ursprüngliche Schreibweise exakt zu bewahren statt die Aussprache.
- **Romanisierung**: Transliteration speziell in die lateinische Schrift.

## Warum es überhaupt reine ASCII-Lautschriften gibt

IPA braucht Zeichen wie `ʃ`, `ʒ`, `ə` und `ˈ`, die nicht auf einer Standardtastatur liegen. Das war jahrzehntelang ein reales Problem der Datenverarbeitung, bevor Unicode universell war und bevor die meisten Schriftarten, Terminals und Dateiformate nicht-ASCII-Text zuverlässig unterstützten. Forscher bauten reine ASCII-Ersatzsysteme: ARPABET, entwickelt für die amerikanische Spracherkennungsarbeit, und X-SAMPA, eine ASCII-Kodierung des vollständigen IPA, entwickelt, um in E-Mails und auf alten Terminals sicher zu sein. Das sind keine historischen Kuriositäten. ARPABET ist nach wie vor die Notation, die von weitverbreiteten US-amerikanischen Ausspracheverzeichnissen und Sprachwerkzeugen verwendet wird, und X-SAMPA taucht immer noch in linguistischen Werkzeugen auf, die reinen Text brauchen. Alles, was diese Daten liest, muss dieses Alphabet lesen können.

`scriptconv` führt die tatsächliche Umwandlung aus. Dies ist ausgeführte Ausgabe, keine Beschreibung:

```python
from scriptconv import convert, arpa_to_ipa, ipa_to_arpa

convert("K AE1 T", "arpa", "ipa")
# 'kæt'

convert("HH AH0 L OW1", "arpa", "ipa")
# 'həloʊ'

convert("kˈæt", "ipa", "x-sampa")
# 'k"{t'

arpa_to_ipa("HH AH0 L OW1", stress=True)
# 'həlˈoʊ'

ipa_to_arpa("həlˈoʊ", stress=True)
# 'HH AH0 L OW1'
```

Betonungsmarker überleben die Hin- und Rückumwandlung. ARPABET markiert Betonung mit einer an den Vokal angehängten Ziffer (`OW1`); IPA markiert sie mit einem `ˈ` vor der betonten Silbe. `arpa_to_ipa(..., stress=True)` überträgt diese Information, und die Rückumwandlung rekonstruiert die ursprünglichen Ziffern exakt.

IPA sitzt bei alledem konstruktionsbedingt in der Mitte. `scriptconv` behandelt jede Notation als einen Knoten in einem Graphen und jeden Konverter als eine Kante und leitet Umwandlungen über IPA als Drehscheibe, statt für jedes Notationspaar einen eigenen Konverter von Hand zu schreiben:

```python
from scriptconv import DEFAULT_GRAPH

[f"{e.src}->{e.dst}" for e in DEFAULT_GRAPH.route("arpa", "x-sampa")]
# ['arpa->ipa', 'ipa->x-sampa']
```

Insgesamt werden neun Notationen über diese Drehscheibe transkodiert: ARPABET, X-SAMPA, Kirshenbaum, Lexique, Cotovía, RFE und mantoq, plus Buckwalter, das im Folgenden behandelt wird.

## Die Schrift erkennen, bevor irgendetwas anderes geschieht

Bevor Software entscheiden kann, wie sie ein Textstück verarbeitet — in welche Richtung gerendert wird, welche Rechtschreibprüfung läuft, welche Schriftart gewählt wird —, muss sie wissen, in welcher Schrift der Text steht. Das ist eine andere Frage als die, in welcher Sprache er steht. Die Schrift identifiziert die Zeichenmenge; die Sprache identifiziert Wortschatz und Grammatik. Serbisch kann, wie gesagt, kyrillisch oder lateinisch sein. Usbekisch ebenfalls. `scriptconv` erkennt die Schrift direkt anhand der Zeichen und ordnet separat einen Sprachcode der Schrift zu, in der er üblicherweise geschrieben wird:

```python
from scriptconv import detect_script, script_runs, lang_to_script, base_direction

detect_script("Здравствуйте")
# 'Cyrl'

detect_script("안녕하세요")
# 'Hang'

script_runs("привет hello")
# [('Cyrl', 'привет '), ('Latn', 'hello')]

base_direction("مرحبا hello")
# 'mixed'

lang_to_script("uzb_cyr")
# 'Cyrl'
```

`detect_script` gibt einen ISO-15924-Code zurück — das Standardregister vierbuchstabiger Kennzeichen für Schriften (`Cyrl` für Kyrillisch, `Hang` für Hangul, `Latn` für Latein, `Arab` für Arabisch). `script_runs` teilt gemischten Text in zusammenhängende Abschnitte nach Schrift auf, was ein Renderer braucht, um satzweise zu entscheiden, welche Schriftart und Textrichtung anzuwenden ist. `base_direction` meldet, ob eine gemischte Zeichenkette links-nach-rechts, rechts-nach-links oder beides liest.

## Die schwierigen Fälle: Buckwalter, Hangul und Kana

Drei Schriftsystem-Umwandlungen kommen in echten Pipelines so häufig vor, dass `scriptconv` jede davon direkt behandelt.

**Buckwalter**, für Arabisch, ist ein ASCII-Transliterationsschema, das jeden arabischen Buchstaben und jedes Diakritikum eins-zu-eins auf ein bestimmtes ASCII-Zeichen abbildet, sodass die ursprüngliche Schreibweise — einschließlich der Vokalzeichen, die die meisten muttersprachlichen Texte weglassen — exakt rekonstruiert werden kann. Es existiert, weil arabische Schrift in Pipelines und Werkzeugen, die um ASCII herum gebaut sind, unhandlich ist: Sortieren, Diffen, reguläre Ausdrücke und ältere Textformate werden alle einfacher, sobald der Text lateinisch-alphabetisches ASCII ist, sofern die Zuordnung exakt und umkehrbar ist.

```python
from scriptconv import buckwalter_to_arabic, arabic_to_buckwalter

buckwalter_to_arabic("mrHbA")
# 'مرحبا'

arabic_to_buckwalter("مرحبا")
# 'mrHbA'

arabic_to_buckwalter("رحمٰن")
# 'rHm`n'
```

Das letzte Beispiel enthält den Dolch-Alif, ein kleines hochgestelltes Diakritikum, das in einer Handvoll Wörtern verwendet wird (`رحمٰن`, *rahman*) — Buckwalter reserviert dafür ein bestimmtes ASCII-Zeichen (`` ` ``), das sich von einem regulären Alif unterscheidet, damit die Transliteration die beiden nicht vermischt.

**Hangul** sieht aus wie Silbenblöcke, aber jeder Block ist ein zusammengesetztes Cluster einzelner Buchstaben (Jamo), angeordnet in einem Raster — so wie sich "H", "A", "N" visuell zu einem Glyphen für "han" verbinden, statt links nach rechts geschrieben zu werden. Software, die die einzelnen Buchstaben braucht — für die Suche, für phonologische Analyse, um sie in ein anderes System einzuspeisen —, muss sie wieder auseinandernehmen:

```python
from scriptconv.translit import decompose_hangul

decompose_hangul("한국")
# 'ㅎㅏㄴㄱㅜㄱ'

decompose_hangul("국민")
# 'ㄱㅜㄱㅁㅣㄴ'
```

Das letzte Beispiel ist wichtig für das, was es *nicht* tut: 국민 (*gungmin*, "Bürger") wird mit Nasalassimilation ausgesprochen, `[ɡuŋmin]`, aber `decompose_hangul` gibt die Buchstaben so zurück, wie sie geschrieben sind — `ㄱㅜㄱㅁㅣㄴ`, unassimiliert —, weil die Zerlegung Arithmetik auf dem Unicode-Codepoint ist, keine phonologische Regel. Sie sagt Ihnen, was geschrieben wurde, nicht, wie es klingt.

**Kana-Umwandlung** bewegt sich zwischen den beiden Silbenschriften des Japanischen, Hiragana und Katakana, die dieselben Laute mit unterschiedlichen Zeichen bei einem festen Codepoint-Versatz darstellen:

```python
from scriptconv import hira_to_kana, kana_to_hira

hira_to_kana("こんにちは")
# 'コンニチハ'

kana_to_hira("カタカナ")
# 'かたかな'
```

## Warum das in einer eigenen Bibliothek lebt

Ein Phonemizer — ein Werkzeug, das errät, wie ein geschriebenes Wort ausgesprochen wird — braucht sprachliches Urteilsvermögen: Betonungsregeln, Ausnahmen, kontextabhängige Aussprache. `scriptconv` hat davon absichtlich nichts. Jede Funktion oben ist eine Tabellensuche oder eine Codepoint-Berechnung: gleiche Eingabe, gleiche Ausgabe, kein Raten, kein Sprachmodell, nichts, was falsch sein könnte in Bezug darauf, wie eine bestimmte Sprache tatsächlich klingt. Das ist es, was es sicher macht, sie zwischen allen Phonemizern zu teilen, die sie brauchen, statt dass jeder Phonemizer seine eigene ARPABET-Tabelle mit seinen eigenen Fehlern neu implementiert. Der Beitrag [Phonologie-Stack](/de/blog/2026-08-10-the-phonology-stack) behandelt, wie die eigentlichen ausspracheratenden Engines — die, die sprachliche Meinungen tragen — auf dieser Schicht aufgebaut sind, statt sie zu duplizieren.

## Wo die Zuordnung nicht exakt ist

Die Umwandlung zwischen Notationen ist nicht immer verlustfrei, und `scriptconv` erfasst das als abfragbare Daten, statt es als Überraschung zu belassen. Jede Notation hat zwei unabhängig erfasste Eigenschaften: ob die Umwandlung nach IPA und zurück die ursprünglichen Symbole exakt reproduziert, und ob IPA, in sie und zurück umgewandelt, jedes IPA-Symbol reproduziert.

ARPABET scheitert in beiden Richtungen: Es hat ein eingeschränktes, englischspezifisches Phoneminventar, sodass IPA → ARPABET → IPA Unterscheidungen verlieren kann, die IPA treffen kann und für die ARPABETs Tabelle kein Symbol hat. X-SAMPA und Lexique decken das vollständige IPA-Inventar getreu ab, sind aber nicht garantiert sauber hin- und rückumwandelbar, wenn man von ihrer eigenen Seite ausgeht. Kirshenbaum und Buckwalter wandeln sauber von ihrer eigenen Seite nach IPA um, aber nicht umgekehrt. Mantoq, das phonetische Alphabet des halabi-arabischen Phonemizers, wandelt nur in eine Richtung um, nach IPA — es gibt keinen Konverter zurück. Nichts davon ist irgendwo in einem Docstring vergraben; es sind Daten, die die Bibliothek offenlegt, damit jemand vor der Annahme, eine Hin- und Rückumwandlung sei sicher, prüfen kann.

---

Wenn Sie Ausspracheinformationen aus mehreren Quellen zusammenfügen, oder Schriften erkennen und Text normalisieren müssen, bevor er einen Phonemizer erreicht, [nehmen Sie Kontakt auf](/de/contact) oder sehen Sie, was wir sonst noch in diesem Bereich bauen, auf der [Leistungsseite](/de/services).
