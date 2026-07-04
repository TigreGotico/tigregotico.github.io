---
title: "Klassisches NLP für Portugiesisch: Silbentrennung und Graphem-zu-Phonem"
description: "Ein Blick auf unseren regelbasierten, vollständig offline arbeitenden portugiesischen NLP-Stack — silabificador für die Silbentrennung und TugaPhone für dialektbewusstes Graphem-zu-Phonem — und wie sie mit der breiteren orthography2ipa-Arbeit für lusophone Varietäten zusammenhängen. Keine Deep-Learning-Blackboxen: deterministisch, schnell und abhängigkeitsarm."
date: 2026-02-28
lang: de
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

Nicht jedes Sprachproblem braucht eine Milliarde Parameter. Ein großer Teil der portugiesischen Textverarbeitung wird von Regeln bestimmt, die Linguisten längst niederschrieben, bevor irgendjemand ein neuronales Netz trainierte — Regeln darüber, wo Silben brechen, wo die Betonung liegt und wie eine bestimmte Schreibweise auf einen Laut abgebildet wird. Wenn diese Regeln explizit sind, ist das richtige Werkzeug eine kleine, deterministische, vollständig offline arbeitende Bibliothek, die Sie lesen, prüfen und überall ausführen können. Das ist die Philosophie hinter unserem klassischen portugiesischen NLP-Stack: [silabificador](https://github.com/TigreGotico/silabificador) für die Silbentrennung und [TugaPhone](https://github.com/TigreGotico/tugaphone) für Graphem-zu-Phonem (G2P).

### Warum klassisch, und warum jetzt

Die Phonetik ist einer der Bereiche, in denen deterministische Regeln wirklich glänzen. Die Trennungsregeln der portugiesischen Silbentrennung und die Regelmäßigkeiten ihrer Orthografie sind gut dokumentiert, sodass eine handgefertigte Regel-Engine Transkriptionen erzeugt, die Sie Zeile für Zeile prüfen können. Keine GPU, kein Modell-Download, kein Netzwerkaufruf. Das ist wichtig für die Datensouveränität: Eine lusophone Sprach-Pipeline sollte ihren Text nicht an eine entfernte API schicken müssen, nur um herauszufinden, wie ein Wort auszusprechen ist. Es ist auch wichtig für Geschwindigkeit und Ressourcenbedarf — diese Bibliotheken sind abhängigkeitsarm und laufen mit gleicher Leichtigkeit auf einem Laptop, einem Server oder einem eingebetteten Gerät.

### silabificador: Silbengrenzen

`silabificador` ist ein leichtgewichtiger portugiesischer Silbentrenner, der vollständig aus handgefertigten Regeln aufgebaut ist, **ohne Abhängigkeiten**. Die Schnittstelle ist so klein, wie es klingt:

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

Er wurde anhand sauberer Daten aus dem [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org) abgestimmt und getestet sowie auf dem [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon) getestet — einem offenen Datensatz mit über 100.000 Einträgen aus derselben Quelle. Die Silbensegmentierung ist ein grundlegender Schritt für Betonungszuweisung, Silbentrennung und Phonemtranskription, daher zahlt es sich überall nachgelagert aus, sie richtig und schnell zu machen.

### TugaPhone: dialektbewusstes Graphem-zu-Phonem

`TugaPhone` wandelt beliebigen portugiesischen Text in IPA um, und das über die wichtigsten lusophonen Dialekte hinweg: europäisch (`pt-PT`), brasilianisch (`pt-BR`), angolanisch (`pt-AO`), mosambikanisch (`pt-MZ`) und timoresisch (`pt-TL`). Entscheidend ist, dass es dialektale Variation bewahrt, statt alles auf einen einzigen „Standard" zu verflachen. Derselbe Satz kommt je nachdem, wo er gesprochen wird, unterschiedlich heraus:

```
Choveu muito ontem à noite.
pt-PT → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈoj·tɨ
pt-BR → ʃo·ˈvew mwˈĩ·tʊ ˈõ·tẽ ˈa nˈoj·tʃɪ
pt-AO → ʃo·ˈvew mˈũjn·tʊ ˈõ·tẽ ˈa nˈoj·tɨ
pt-MZ → ʃu·ˈvew mˈũj·tu ˈõ·tẽ ˈa nˈɔj·tɨ
pt-TL → ʃo·ˈvew mˈuj·tʊ ˈõ·tẽ ˈa nˈojtʰ
```

Unter der Haube ist TugaPhone ein **Hybrid** aus zwei klassischen Techniken. Zuerst konsultiert es ein kuratiertes phonetisches Lexikon (dasselbe Portuguese Phonetic Lexicon von oben) für bekannte Wörter; für alles, was nicht im Lexikon steht — Namen, Neologismen, fremdsprachige Entlehnungen —, greift es auf eine regelbasierte G2P-Engine zurück. Die Pipeline ist in jeder Phase explizit: Textnormalisierung, optionales Part-of-Speech-Tagging, Lexikonsuche, regelbasierter Rückgriff, dann dialektspezifische Transformationen.

Zwei Details sind hervorzuheben. Die **Zahlennormalisierung** wandelt Ziffern in ihre gesprochenen portugiesischen Formen mit korrekter Genus- und Numerus-Kongruenz um:

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
normalize_numbers("1ª vez")                # primeira vez
```

Es respektiert sogar Skalenkonventionen — die lange Skala `biliões` für `pt-PT`, die kurze Skala `trilhões` für `pt-BR`. Die **Homograph-Disambiguierung** nutzt den Part-of-Speech-Kontext, sodass `para` als Präposition anders behandelt wird als `para` als Verb. TugaPhone kann einen spaCy- oder Brill-Tagger verwenden, wenn verfügbar, liefert aber auch einen abhängigkeitsfreien regelbasierten Rückgriff und bleibt so dem Offline-First-Prinzip treu.

Die Architektur ist eine saubere Hierarchie — Satz → Wort → Graphem → Zeichen — mit kontextsensitiven Regeln, die auf jeder Ebene angewendet werden: Vokalqualität und Konsonanten-Allophone auf Zeichenebene, Digraphen wie ⟨ch⟩ und ⟨nh⟩ und Diphthonge wie ⟨ai⟩ und ⟨ou⟩ auf Graphemebene, Betonung und Silbentrennung auf Wortebene. TugaPhone verwendet `silabificador` für die Silbenebene wieder, zusammen mit den Begleitbibliotheken **[Tugalex](https://github.com/TigreGotico/tugalex)** (Lexikon und Ausnahmen) und **[TugaTagger](https://github.com/TigreGotico/tugatagger)** (POS-Tagging). Kleine, kombinierbare Bausteine — jeder für sich nützlich.

TugaPhone ist ehrlich in Bezug auf seine Grenzen: Die Lexikonabdeckung ist für die afrikanischen und den timoresischen Dialekt spärlicher, die subregionalen Akzente (Porto, Minho, Braga und andere) sind experimentelle Annäherungen an dokumentierte Merkmale, und die Prosodie auf Satzebene ist vereinfacht. Das sind offen dokumentierte Einschränkungen, keine verborgenen Fehlermodi — genau die Art von Transparenz, die ein regelbasiertes System möglich macht.

### Das größere Bild: orthography2ipa

Portugiesisch ist eine Varietät unter vielen, und dasselbe Engineering-Muster lässt sich verallgemeinern. [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) ist ein rein datenbasiertes Python-Paket mit linguistisch motivierten Graphem→IPA- und Allophon-Abbildungen, das über 350 Sprachcodes über 20 Sprachfamilien hinweg umfasst. Es zieht eine scharfe Unterscheidung, die jedes ernsthafte G2P-System benötigt: Eine **Graphem-Abbildung** sagt, welche Phoneme eine Schreibweise darstellen *kann*, während eine **Allophon-Abbildung** sagt, wie ein Phonem in einem gegebenen Kontext tatsächlich *auftritt*. Regionale Varietäten werden als ihre eigenen Spezifikationen modelliert, die durch gewichtete Abstammung mit mehreren Vorfahren verknüpft sind, sodass Dialektbäume von ihren übergeordneten Einträgen erben, statt Daten zu duplizieren.

Das ist derselbe Instinkt hinter `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ` und `pt-TL` in TugaPhone: jede lusophone Varietät als vollwertiges Element mit eigenen Regeln behandeln, nicht als Abweichung von einem einzigen kanonischen Akzent. Die Daten sind deklarativ und die Logik ist dünn und einsteckbar — Sie können die Regeln lesen, ihre Quellen zitieren und der Ausgabe vertrauen.

### Probieren Sie es aus

Alles hier ist Open Source und heute installierbar:

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

Für die breiteren mehrsprachigen Abbildungen siehe [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Deterministisch, schnell, offline und für die gesamte Bandbreite der portugiesischsprachigen Welt gebaut.

Dieser portugiesische Phonetik-Stack baut auf unserer **[Graphem-zu-IPA-Arbeit für über 350 Sprachen](/de/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** auf und bildet das phonetische Rückgrat für **[TTS, das auf einer Kartoffel läuft](/de/blog/2026-05-10-tts-that-runs-on-a-potato)** und die **[mehrsprachigen Stimmen Miro & Dii](/de/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.
