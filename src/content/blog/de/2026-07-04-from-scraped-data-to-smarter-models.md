---
title: "Warum wir Daten horten: Von gescrapten Katalogen zu intelligenteren Sprach- und Sprachmodellen"
description: "Saubere, typisierte Daten mit guter Provenienz sind das Rohmaterial jedes Modells, das wir ausliefern. Wie die Kataloge, die unsere Scraper aufbauen, zu Biasing-Vokabularen für ASR, Intent-Klassifikatoren, synthetischen NER-Korpora, G2P-Lexika, TTS-Stimmen und zu ehrlichem Treibstoff für LLMs werden."
date: 2026-07-04
lang: de
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Data Collection"
  - "ASR"
  - "NLP"
  - "TTS"
  - "LLM"
  - "FOSS"
draft: false
---

Wir schreiben viel darüber, *wie* wir Daten extrahieren: das
**[Recon-Tooling](/de/blog/2026-03-01-robot-txt-sitemaps-ethical-web-scraping)**,
die **[Anti-Bot-Transporte](/de/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**,
die **[typisierten Clients für Musik-Metadaten](/de/blog/2026-04-20-music-database-scrapers)**.
Eine berechtigte Frage ist *warum*. Wir sind ein Unternehmen für Sprach-KI. Warum
pflegen wir Scraper für Musikenzyklopädien und Radioverzeichnisse?

Die Antwort lautet: **Daten stehen allem vorgelagert, was wir ausliefern.** Ein
Sprachassistent ist nur so gut wie die Wörter, die er zu hören erwartet, die
Entitäten, die er erkennen kann, und die Aussprachen, die er kennt. Nichts davon
stammt aus Architekturdiagrammen. Es stammt aus Daten, und die interessanten
Daten liegen selten in einem gebrauchsfertigen Datensatz bereit. Sie sind über das
öffentliche Web verstreut, in Katalogen, die Menschen über Jahrzehnte kuratiert
haben.

Hier ist, was mit diesen Daten geschieht, nachdem wir sie erhoben haben.

## Entitäten: das Vokabular, von dem ein Sprachassistent lebt

Sagen Sie einem Assistenten "spiele Sultans of Swing von Dire Straits". Bevor
irgendein Modell darauf reagieren kann, muss etwas wissen, dass *Sultans of Swing*
ein Track und *Dire Straits* ein Künstler ist. Multiplizieren Sie das mit jedem
Künstler, Album, Sender, Podcast und Genre, das ein Nutzer benennen könnte, und Sie
haben das tatsächliche Vokabular eines Medienassistenten: Hunderttausende
benannter Entitäten, von denen keine in einem herkömmlichen NLP-Trainingskorpus
auftaucht.

Unsere Medien-Clients geben genau dies aus: typisierte Datensätze mit kanonischen
IDs, normalisiert in das
**[mediavocab](https://github.com/TigreGotico/mediavocab)**-Schema.
Diese Entitätskataloge fließen direkt in Folgendes ein:

- **Schlüsselwortbasiertes Intent-Matching**: Entitätslisten werden zu Gazetteers
  (Nachschlagelisten bekannter Namen), die Medienabfragen in OpenVoiceOS verankern.
- **Intent-Klassifikatoren**: unsere Media-Intent-Datensätze kombinieren echte
  gescrapte Entitäten mit vorlagen- und LLM-gestützter Satzsynthese und erzeugen so
  Äußerungen, wie sie echte Nutzer machen, bestückt mit Entitäten, die tatsächlich
  existieren. So trainierte Modelle treffen die Entscheidung "ist dies eine
  Wiedergabeanfrage, und wofür?" in der Medien-Pipeline von OpenVoiceOS.
- **Synthetische NER-Korpora**: dasselbe Rezept lässt sich verallgemeinern. Nehmen
  Sie einen Katalog echter Entitäten, generieren Sie natürliche Sätze um sie herum,
  und Sie haben einen etikettierten Named-Entity-Datensatz für eine Domäne, die kein
  akademisches Korpus abdeckt. Die Entitäten sind echt, also ist die Verteilung
  ehrlich. Die Sätze sind synthetisch, also ist das Volumen so groß, wie Sie es
  brauchen.

## Spracherkennung auf die Wörter ausrichten, die zählen

Allzweck-ASR wird auf allgemeiner Sprache trainiert und transkribiert *Dire
Straits* daher als "dire straights" und verstümmelt jeden portugiesischen
Dorfnamen. Die Lösung besteht nicht darin, von Grund auf neu zu trainieren. Sie
heißt **Biasing**: dem Erkenner das Vokabular Ihrer Domäne geben.

Gescrapte Kataloge sind dieses Vokabular. Konkret:

- **Sprachmodell-Biasing**: n-Gramm- oder Shallow-Fusion-LMs (Sprachmodelle, die
  in den Decodierschritt des Erkenners eingebunden werden), die auf
  entitätenreichem Text trainiert werden, lenken den Decoder in Richtung
  domänenspezifischer Wörter. Das LM eines Medienassistenten sollte auf
  *Tracktiteln und Künstlernamen* trainiert werden, und unseres kann das, weil wir
  sie haben: typisiert, dedupliziert, mit sauberer Provenienz.
- **Prompt-konditionierte Erkennung**: neuere Architekturen akzeptieren zur
  Inferenzzeit einen Text-Prompt oder eine Kontextliste. Die tatsächliche
  Bibliothek des Nutzers (die Entitäten, die unsere Clients extrahiert haben) in
  den Kontext des Erkenners einzuspeisen, verwandelt einen "unerkennbaren
  Eigennamen" in ein "bekanntes Vokabularelement".
- **Fine-Tuning-Daten**: wo Biasing nicht ausreicht, erzeugen Entitätskataloge
  zusammen mit unseren [TTS-Stimmen](/de/blog/2026-05-10-tts-that-runs-on-a-potato)
  synthetische Sprache für genau die Phrasen, die ein Deployment nicht falsch
  verstehen darf. Dies ist der
  [Dienst zur Datensatzerstellung](/de/services), den wir kommerziell anbieten, und
  er baut auf derselben offenen Pipeline auf.

## Aussprache: von gecrawlten Wörterbüchern zu G2P und TTS

Einige unserer wertvollsten Crawls sind keine Entitätskataloge, sondern **Lexika**.
Das Crawlen des Infopédia-Wörterbuchs ergab
[infopedia-pt-ipa](https://huggingface.co/datasets/TigreGotico/infopedia-pt-ipa),
über 100.000 Wort→IPA-Paare des europäischen Portugiesisch (IPA ist das Internationale Phonetische Alphabet, eine Standardschreibweise für Aussprache). Dieser Datensatz:

- benchmarkt und optimiert unseren regelbasierten
  [G2P-Stack für Portugiesisch](/de/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes),
- verankert die Aussprache für [TTS-Stimmen](/de/blog/2026-06-15-two-voices-every-language-miro-and-dii),
  damit sie Wörter so sagen, wie Sprecher es tatsächlich tun,
- und dient als Ausgangspunkt für bedeutungsetikettierte Ressourcen wie unsere
  [Arbeit zu portugiesischen Heterophonen](https://github.com/TigreGotico/bifonia),
  bei der dieselbe Schreibweise je nach Bedeutung auf unterschiedliche Laute
  abbildet.

Schreibung-zu-Laut-Daten sind die am wenigsten glanzvolle Ecke der Sprachtechnologie,
und diejenige, die am meisten darüber entscheidet, ob eine Stimme muttersprachlich
klingt. Niemand reicht Ihnen diese Daten. Sie crawlen sie, säubern sie und
veröffentlichen sie, damit das nächste Team es nicht mehr tun muss.

## Ehrlicher Treibstoff für LLMs

Alles Obige gilt auch für große Sprachmodelle, mit einer zusätzlichen Wendung:
**Provenienz zählt inzwischen mehr als Volumen.** Das offene Web ist zunehmend mit
modellgeneriertem Text kontaminiert. Darauf zu trainieren oder zu evaluieren,
recycelt stillschweigend die Ausgaben der Modelle von gestern. Deshalb legen wir
Wert auf Quellen mit sauberer menschlicher Provenienz: Jahrzehnte an
[Usenet-Archiven](/de/blog/2026-07-01-usenet-and-remailers-in-2026), kuratierte
Enzyklopädien, offizielle Wörterbücher. Deshalb gibt jeder Datensatz, den wir
veröffentlichen, an, woher jeder Datensatzeintrag stammt.

Strukturierte Kataloge speisen LLMs auch zur *Inferenzzeit*. Ein typisierter,
deduplizierter Entitätsspeicher ist genau das, was eine Retrieval-Schicht oder die
Tool-API eines Agenten braucht, um ihre Antworten zu verankern. Saubere APIs über
unordentlichen Quellen sind mehr als eine Scraping-Bequemlichkeit. Sie sind die
Art und Weise, wie man ein Sprachmodell an Fakten gebunden hält.

## Die Pipeline, von Anfang bis Ende

Das Gesamtbild sieht also so aus:

```
recon → resilient extraction → typed clients → normalised catalogues
      → gazetteers & intent data     (NLP)
      → biasing LMs & fine-tune sets (ASR)
      → lexicons & phoneme labels    (G2P / TTS)
      → provenance-clean corpora     (LLMs, retrieval)
```

Jede Stufe ist Open Source, jeder Datensatz wird veröffentlicht, wo die Lizenzierung
es erlaubt, und dieselbe Pipeline, die den Bedarf unserer eigenen Modelle deckt,
steht [als Auftrag](/de/services) für Ihre zur Verfügung. Die Scraper sind keine
Nebenquest. Sie sind der Steinbruch, aus dem der gesamte Stack gebaut ist.
