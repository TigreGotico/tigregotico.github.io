---
title: "Der erste Phonemizer für Barranquenho"
description: "g2p_barranquenho ist der erste offene Graphem-zu-Phonem-Konverter für Barranquenho, die iberoromanische Kontaktsprache von Barrancos, Portugal — die Regeln stammen aus der neu veröffentlichten orthografischen Konvention der Gemeinde und sind anhand der beigefügten Quellen überprüfbar."
date: 2025-12-12
lang: de
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) ist der erste offene Graphem-zu-Phonem-Konverter für [Barranquenho](https://en.wikipedia.org/wiki/Barranquenho), eine iberoromanische Kontaktsprache, die in Barrancos, Portugal, gesprochen wird — einer Gemeinde an der spanischen Grenze, in der Portugiesisch und das extremadurische/andalusische Spanisch seit Jahrhunderten koexistieren.

### Was Barranquenho phonologisch interessant macht

Barranquenho ist kein Dialekt des Portugiesischen oder Spanischen; es ist ein wirklich eigenständiges System. Der Gemeinderat von Barrancos hat kürzlich drei grundlegende Dokumente veröffentlicht — ein Wörterbuch, eine orthografische Konvention und eine Grundgrammatik —, die uns die benötigten Regeln lieferten. Die Ankündigung: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

Aus dieser orthografischen Konvention haben wir das Regelwerk abgeleitet — doch statt eines handgestrickten eigenen Durchgangs über den Text lebt es als Sprachspezifikation, `ext-PT-x-barrancos`, in der gemeinsam genutzten **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)**-Engine. Die Graphemtabelle, Allophon-Regeln, das Betonungsmodell und die wortübergreifende Sandhi dieser Spezifikation beschreiben jede Realisierung des Barranquenho: mehrbuchstabige Grapheme fassen sich so zusammen, wie es die Konvention dokumentiert (`tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/), nasale Diphthonge treten vor `m`/`n` auf, `v` wird immer auf /b/ abgebildet, und `h` erscheint als ausgesprochenes /h/ — anders als in beiden Ausgangssprachen.

`g2p_barranquenho` selbst ist ein schlanker aufruferseitiger Wrapper um `orthography2ipa.G2P`, gesteuert durch diese Spezifikation: Es übernimmt die Textnormalisierung (Groß-/Kleinschreibung, Tokenisierung in die von der Spezifikation erwarteten Formen), die Zahlenexpansion und eine stabile `phonemize`/`transcribe`-Schnittstelle, nicht aber die phonologischen Regeln — eine Regel zu verbessern bedeutet, die Spezifikation stromaufwärts zu bearbeiten, sodass jeder nachgelagerte Verbraucher von der Korrektur profitiert.

In der Praxis:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ˈũ eˈnɔɾmi ˈpas̺u ˈpaɾɐ ˈu bɐrɐ̃ˈkɛɲu ˈi ˈpaɾɐ ɐ kuˈltuɾɐ bɐrɐ̃ˈkɛɲɐ`

Die Quell-PDFs (Konvention, Wörterbuch, Grammatik) sind im Wurzelverzeichnis des Repositorys hinterlegt, sodass die Regeln anhand ihrer Quelle überprüfbar sind.

### Was als Nächstes kommt

Ein G2P-Konverter ist die Mindestvoraussetzung für TTS- und ASR-Arbeit. Ohne ihn hat ein auf Text trainiertes Modell keine prinzipielle phonetische Grundlage. Mit ihm folgt der Weg zu einem Barranquenho-Sprachmodell derselben hybriden Pipeline, die wir für Asturisch und Aragonesisch verwendet haben — der Engpass sind die Sprachdaten, nicht das Werkzeug.

**Wenn Sie über Aufnahmen von gesprochenem Barranquenho oder Zugang zu Sprechern verfügen, die bereit sind, unter einer offenen Lizenz beizutragen, nehmen Sie Kontakt mit uns auf.** Aufnahmen von Muttersprachlern, selbst nur wenige Stunden, würden ein TTS-Modell realisierbar machen.

→ [g2p_barranquenho auf GitHub](https://github.com/TigreGotico/g2p_barranquenho)
