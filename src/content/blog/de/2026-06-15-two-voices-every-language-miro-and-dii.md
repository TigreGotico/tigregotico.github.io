---
title: "Zwei Stimmen, jede Sprache: Miro & Dii"
description: "TigreGótico geht eine Partnerschaft mit OpenVoiceOS ein, um dem Assistenten zwei konsistente Stimmidentitäten zu verleihen, Miro und Dii, die in jeder Sprache gleich klingen, aufgebaut mit unserer Voice-Cloning-Technologie und dem phoonnx-Engine. Zwei TTS-Modelle für jede Sprache, die jemand anfragt, bedrohte Sprachen inbegriffen."
date: 2026-06-15
lang: de
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "OVOS"
  - "voice cloning"
  - "G2P"
  - "language inclusion"
draft: false
---

> **Hören Sie sie jetzt:** die [Voices Demo](../../demo) lässt Miro & Dii live in Ihrem
> Browser laufen. Wählen Sie eine Sprache, tippen Sie einen Satz und hören Sie zu. Keine Installation, kein Server.

Menschen erinnern sich an die Stimme eines Assistenten mehr als an seinen Namen. Deshalb ist die Kernfrage unserer Partnerschaft mit [OpenVoiceOS](https://www.openvoiceos.org/) eine praktische: Wem sollte der Assistent in jeder Sprache ähneln?

Die Antwort lautet **Miro** (männlich) und **Dii** (weiblich), zwei Stimmidentitäten, die sich durch jede von OpenVoiceOS unterstützte Sprache ziehen. Ein Nutzer, der den Assistenten in Lissabon einrichtet und später auf Deutsch umstellt, hört in beiden Fällen denselben vertrauten Sprecher.

## Eine Identität, viele Sprachen

Der übliche Weg, eine mehrsprachige Stimme zu erhalten, besteht darin, ein einziges Modell auf vielen Sprachen zugleich zu trainieren. Es funktioniert, aber es neigt dazu, das Ergebnis zu verwischen: Akzente laufen von einer Sprache in die andere über, und die Aussprache wird ungefähr.

Stattdessen bauen wir ein Modell pro Sprache, jedes nur auf dieser Sprache trainiert. Damit jedes dieser Modelle wie dieselbe Person klingt, klonen wir jedes einsprachige Miro-Modell von derselben Ursprungsidentität, und ebenso für Dii. So erhält eine Zuhörerschaft Aussprache in Muttersprachler-Qualität in jeder Sprache und erkennt trotzdem dieselbe Stimme über die Sprachen hinweg wieder.

Diese Modelle werden mit [**phoonnx**](https://github.com/TigreGotico/phoonnx), unserem offenen TTS-Framework, trainiert und bereitgestellt: aufgebaut auf VITS (einer neuronalen Text-to-Speech-Architektur), nach ONNX exportiert und bei der Inferenz ausschließlich auf der CPU laufend. Sie laufen vollständig offline, ohne Cloud, ohne API-Schlüssel und ohne dass Daten Ihre Hardware verlassen. Innerhalb von OpenVoiceOS kümmert sich das Plugin `ovos-tts-plugin-phoonnx` um das Abrufen und Laden. Die vollständige Geschichte zu Hardware und Architektur finden Sie unter [TTS, das auf einer Kartoffel läuft](/de/blog/2026-05-10-tts-that-runs-on-a-potato).

## Die G2P-Forschung, die es möglich macht

Eine Sprache gut zu sprechen erfordert mehr als eine Stimme. Es erfordert zu wissen, wie die Schrift klingen soll. Das ist die Aufgabe der Graphem-zu-Phonem-(G2P)-Umwandlung: geschriebenen Text in die Abfolge von Phonemen zu verwandeln, die das Modell ausspricht. Jede neue Sprache, die wir angehen, braucht zuerst ihre eigene G2P-Forschung, und diese Forschung ist der größte Teil der eigentlichen Arbeit.

phoonnx kann eine Bandbreite von Phonemizern ansteuern: eSpeak, Gruut, Epitran, das modellbasierte [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0) und sprachspezifische Werkzeuge dort, wo allgemeine Engines zu kurz greifen. Unsere [Orthografie-zu-IPA-Forschung](/de/blog/2026-01-15-grapheme-to-ipa-for-350-languages) und die [lusophonen Phonemizer](/de/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes), die wir für die portugiesische Sprachfamilie gebaut haben, dienen demselben Ziel: präzises IPA für Sprachen, die die großen TTS-Anbieter nie sorgfältig modelliert haben. Wenn eine Sprache keinen guten gebrauchsfertigen Phonemizer hat, ist diese Lücke das Projekt. Wir machen zuerst die Forschung von der Schreibweise zum Klang, und danach folgt die Stimme.


## Zwei Modelle für jede angefragte Sprache

Das Angebot im Herzen der Partnerschaft: Für jede Sprache, die jemand anfragt, bauen wir zwei TTS-Modelle, Miro und Dii. Das ist eine dauerhafte Zusage, keine Roadmap. Fragen Sie nach einer Sprache, und das Paar kommt zu ihr.

Wir meinen jede Sprache, nicht nur die mit den größten Sprecherzahlen. Bedrohte und Minderheitensprachen, die das Mainstream-TTS ignoriert, weil der Markt klein ist, sind genau das, was wir erreichen wollen: Gemeinschaften, die nie eine eigene synthetische Stimme hatten.

Zum Zeitpunkt dieses Beitrags listet die [phoonnx TTS models collection](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) auf Hugging Face 13 Sprachen mit mindestens einer verfügbaren Stimme. Für acht davon, Baskisch, Arabisch, europäisches Portugiesisch, Asturisch, Aragonesisch, Friesisch, Okzitanisch und kolumbianisches Spanisch, stehen bereits sowohl Miro als auch Dii zur Verfügung.

## Offen und selbst gehostet

Die Stimmen sind frei und quelloffen. Sie laufen offline und selbst gehostet, sodass nichts von dem, was Sie sagen, Ihre Hardware verlässt. Der gesamte Stack, Engine, Phonemizer, G2P-Forschung und trainierte Stimmen, ist offen, damit eine Gemeinschaft ihn übernehmen und behalten kann.

Wenn Ihre Sprache noch nicht auf der Liste steht, fragen Sie danach.
