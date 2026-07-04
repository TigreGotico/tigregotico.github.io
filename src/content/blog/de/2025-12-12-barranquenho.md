---
title: "Der erste Phonemizer für Barranquenho"
description: "g2p_barranquenho ist der erste offene Graphem-zu-Phonem-Konverter für Barranquenho, die iberoromanische Kontaktsprache von Barrancos, Portugal — die Regeln stammen aus der neu veröffentlichten orthografischen Konvention der Gemeinde und sind anhand der beigefügten Quellen überprüfbar."
date: 2025-12-12
lang: de
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

Aus dieser orthografischen Konvention haben wir das Regelwerk abgeleitet. Der Phonemizer durchläuft die kleingeschriebene Eingabe in zwei Durchgängen:

1. **Digraph-Durchgang** — fasst mehrbuchstabige Grapheme zusammen: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/, und `qu`/`gu` vor vorderen Vokalen → /k//g/.
2. **Graphem-Durchgang** — bildet die verbleibenden Zeichen mit kontextsensitiven Regeln auf IPA ab: nasale Diphthonge vor `m`/`n` (z. B. `an` → /ɐ͂/), wortfinales `e` → /ɨ/, `v` immer → /b/, `s` stimmhaft zu /z/ außer am Wortanfang, `r` gegenüber `rr` (Tap gegenüber Trill) und `h` als ausgesprochenes /h/ — anders als in beiden Ausgangssprachen.

Das Graphem `x` hat die komplexeste Logik und greift auf portugiesische kontextuelle Heuristiken zurück, wo die Barranquenho-Konvention schweigt.

In der Praxis:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ũ ẽjoɾmj pasu paɾɐ u bɐrɐ͂keɲu j paɾɐ ɐ kultuɾɐ bɐrɐ͂keɲɐ`

Die Bibliothek besteht aus einer einzigen Funktion, `phonemize(word: str) -> list[str]`, ohne Laufzeitabhängigkeiten — reines Python. Die Quell-PDFs (Konvention, Wörterbuch, Grammatik) sind im Wurzelverzeichnis des Repositorys hinterlegt, sodass die Regeln anhand ihrer Quelle überprüfbar sind.

### Was als Nächstes kommt

Ein G2P-Konverter ist die Mindestvoraussetzung für TTS- und ASR-Arbeit. Ohne ihn hat ein auf Text trainiertes Modell keine prinzipielle phonetische Grundlage. Mit ihm folgt der Weg zu einem Barranquenho-Sprachmodell derselben hybriden Pipeline, die wir für Asturisch und Aragonesisch verwendet haben — der Engpass sind die Sprachdaten, nicht das Werkzeug.

**Wenn Sie über Aufnahmen von gesprochenem Barranquenho oder Zugang zu Sprechern verfügen, die bereit sind, unter einer offenen Lizenz beizutragen, nehmen Sie Kontakt mit uns auf.** Aufnahmen von Muttersprachlern, selbst nur wenige Stunden, würden ein TTS-Modell realisierbar machen.

→ [g2p_barranquenho auf GitHub](https://github.com/TigreGotico/g2p_barranquenho)
