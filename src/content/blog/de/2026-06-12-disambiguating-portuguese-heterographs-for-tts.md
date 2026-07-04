---
title: "Richtig ausgesprochen: Portugiesische Heterophone für TTS disambiguieren"
description: "Viele europäisch-portugiesische Wörter werden gleich geschrieben, aber je nach Bedeutung unterschiedlich ausgesprochen — und ein falscher Vokal lässt eine TTS-Stimme das falsche Wort sagen. Wir haben bifonia-pt-homographs erstellt, einen offenen, nach Bedeutung annotierten Datensatz mit 56.891 Sätzen über 27 Wörter, sowie einen winzigen, abhängigkeitsfreien Resolver, der ≈94 % erreicht, wo schwergewichtige POS-Tagger bei ≈75 % stagnieren."
date: 2026-06-12
lang: de
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Portuguese"
  - "TTS"
  - "Grapheme-to-Phoneme"
  - "NLP"
  - "Accessibility"
  - "FOSS"
draft: true
---

## Richtig ausgesprochen: Portugiesische Heterophone für TTS disambiguieren

Wenn eine Sprachsynthese-Stimme "Tenho sede" vorliest, erwartet eine portugiesische Zuhörerschaft *Durst* zu hören. Aber genau dieselbe Schreibweise, `sede`, kann auch *Hauptsitz* bedeuten — und die beiden werden mit unterschiedlichen Vokalen ausgesprochen. Sagen Sie es mit dem falschen Vokal, und die Stimme klingt nicht nur seltsam; sie spricht ein anderes Wort laut aus. Für jemanden, der auf TTS angewiesen ist, um den Bildschirm vorgelesen zu bekommen, verläuft genau hier die Grenze zwischen verständlich und verwirrend.

Dies ist ein Front-End-Problem — die Graphem-zu-Phonem-Stufe, die entscheidet, *welche Laute* ein Wort abbildet, lange bevor irgendein neuronaler Vocoder diese Laute in Audio verwandelt. Keine noch so hohe Vocoder-Qualität behebt das. Wählt das Front-End die falsche Aussprache, artikuliert die Stimme das falsche Wort, und zwar klar und deutlich.

### Heterophone Homographe: gleiche Schreibweise, anderer Laut, andere Bedeutung

Das europäische Portugiesisch ist voll von Wörtern, die identisch geschrieben, aber mit einer unterschiedlichen Vokalqualität ausgesprochen werden — ein *offener* Vokal gegenüber einem *geschlossenen* —, wobei die korrekte Wahl von der **Bedeutung** abhängt, nicht nur von der Grammatik. Einige Beispiele:

- **`sede`** — *Durst* (geschlossenes e, `ˈsedɨ`) vs *Hauptsitz/Sitz* (offenes e, `ˈsɛdɨ`). Beides sind Substantive.
- **`forma`** — *Backform / Backblech* (geschlossenes o, `ˈfoɾmɐ`, geschrieben *fôrma*) vs *Form / Art und Weise* (offenes o, `ˈfɔɾmɐ`).
- **`molho`** — *Soße* (geschlossenes o) vs *Bündel* (offenes o).
- **`corte`** — *königlicher Hof* (geschlossenes o) vs *ein Schnitt* (offenes o).

Ein naives TTS-System legt sich auf eine einzige Aussprache pro Schreibweise fest. Also liest es *Durst* mit dem *Hauptsitz*-Vokal — jedes Mal — und die Zuhörerschaft hört das falsche Wort.

### Warum "einfach die Wortart taggen" nicht funktioniert

Die naheliegende Lösung besteht darin, einen Wortarten-Tagger (POS) über den Satz laufen zu lassen und die Aussprache anhand der Wortart auszuwählen. Das hilft bei einigen Paaren, scheitert aber *konstruktionsbedingt* immer dann, wenn sich zwei Bedeutungen dieselbe Wortart teilen.

Nehmen wir noch einmal `sede`. *Durst* und *Hauptsitz* sind **beide Substantive**. Ein POS-Tagger etikettiert sie identisch — es gibt kein grammatisches Signal, das sie unterscheidet — und kann daher nur die häufigere Lesart erraten. Genau das haben wir gemessen: In unserem Testset erzielen sowohl spaCy als auch Stanza **0 %** bei der Bedeutung *Durst* von `sede`. Sie wählen immer *Hauptsitz*. Dieselbe strukturelle Obergrenze zeigt sich bei `corte` (Schnitt vs Hof), `forma` (Backform vs Form) und `molho` (Soße vs Bündel): Wenn sich die Bedeutung innerhalb einer einzigen Wortart aufteilt, kann die Grammatik sie nicht erkennen.

### Der Datensatz: Bedeutung annotieren, nicht Grammatik

Deshalb haben wir einen offenen Datensatz erstellt, der genau das annotiert, worauf es wirklich ankommt — die Bedeutung. **`bifonia-pt-homographs`** besteht aus **56.891 europäisch-portugiesischen Sätzen**, die **27 heterophone Homographe** abdecken. Jeder Satz ist mit dem Wort, seiner **Bedeutung** (Sinn), seiner Wortart, seiner IPA-Aussprache und einer mit Diakritika wiederhergestellten Form (zum Beispiel *sêde* vs *séde*) annotiert, die die beabsichtigte Lesart auf dem Papier eindeutig macht.

Der Gruppierungsschlüssel ist die Bedeutung — das ist der ganze Sinn der Sache. Ein einzelner Datensatz sieht so aus:

```json
{
  "word": "sede",
  "sense": "thirst",
  "pos": "NOUN",
  "ipa": "ˈsedɨ",
  "sentence": "Depois da corrida tinha tanta sede que bebi um litro de água."
}
```

Die Aussprachen wurden gegen das Wörterbuch [infopédia](https://www.infopedia.pt) (Porto Editora) verifiziert und nicht geraten, und die Train/Test-Splits sind nach `(word, meaning)` stratifiziert, sodass ein nachgelagertes Modell — etwa ein BiLSTM — jede Bedeutung in beiden Hälften sieht. Er ist auf Hugging Face als [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs) veröffentlicht.

### Wie gut lässt es sich lösen?

Mit nach Bedeutung annotierten Daten konnten wir messen, wie gut verschiedene Ansätze bei der Wahl der korrekten Bedeutung — und damit der korrekten Aussprache — abschneiden:

| Ansatz | Genauigkeit |
| --- | --- |
| Immer die häufigste Bedeutung raten | ≈53 % |
| spaCy POS → Bedeutung | ≈66 % |
| Stanza POS → Bedeutung | ≈75 % |
| `bifonia`-Regel + Bedeutungs-Resolver | **≈94 %** |

Die POS-basierten Ansätze stagnieren genau dort, wo man es erwarten würde: Sie können nach Grammatik routen, aber niemals nach Bedeutung, sodass die Aufteilungen innerhalb der Substantivklasse außer Reichweite bleiben. Unser Resolver — die Bibliothek [`bifonia`](https://github.com/TigreGotico/bifonia), leichtgewichtig und **völlig abhängigkeitsfrei** — erreicht **≈94 %** und, was entscheidend ist, **100 %** im Fall `sede`/*Durst*, bei dem die POS-Tagger **0 %** erzielen.

Das Entscheidende ist nicht nur die Zahl. Es ist, dass eine kleine, schnelle, vollständig offene Komponente schwergewichtige neuronale POS-Tagger bei dieser Aufgabe schlägt — weil sie die *Bedeutung* auflöst, nicht nur die Grammatik. Keine GPU, kein Modell-Download, kein Netzwerkaufruf.

### Warum das wichtig ist

Die korrekte Aussprache ist grundlegend, nicht kosmetisch. Bildschirmleser und Sprachassistenten sind für blinde und ausschließlich auf Sprache angewiesene Nutzende die Art und Weise, wie sie die Welt lesen, und ein Front-End, das gängige Wörter falsch ausspricht, verschlechtert stillschweigend jeden Satz, den es berührt. Die Disambiguierung von Heterophonen an der Quelle zu beheben bedeutet, dass die Stimme sagt, was der Text meint.

Da der Datensatz offen und der Resolver winzig und forkbar ist, kann jede Person, die ein portugiesisches TTS-Front-End baut, dies ohne ein gigantisches Modell richtig hinbekommen — und derselbe Ansatz lässt sich sauber auf eine verwandte Sprache wie das Galicische übertragen, wo die Unterscheidung zwischen offenem und geschlossenem Vokal dieselbe Falle schafft. Die annotierten Daten erfüllen zudem einen doppelten Zweck: Sie sind genau das, was man braucht, um kompakte statistische Modelle zu trainieren, etwa einen Klassifikator pro Wort, für Teams, die über das Korpus verfügen und neben dem regelbasierten einen gelernten Resolver wünschen.

### Ausprobieren

Der Datensatz befindet sich auf Hugging Face unter [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs), und der Resolver liegt unter [`bifonia`](https://github.com/TigreGotico/bifonia). Er fügt sich in die umfassendere portugiesische Phonetik-Arbeit ein, die hinter **[Klassisches NLP für Portugiesisch](/de/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** und dem **[Graphem-zu-IPA-Stack für über 350 Sprachen](/de/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** steht — kleine, deterministische Bausteine, die eine Stimme eine Sprache so aussprechen lassen, wie ihre Sprechenden es tatsächlich tun.
