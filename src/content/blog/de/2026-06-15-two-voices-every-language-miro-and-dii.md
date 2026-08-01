---
title: "Zwei Stimmen, jede Sprache: Miro & Dii"
description: "TigreGótico geht eine Partnerschaft mit OpenVoiceOS ein, um dem Assistenten zwei konsistente Stimmidentitäten zu verleihen — Miro und Dii —, die in jeder Sprache gleich klingen, aufgebaut mit unserer Voice-Cloning-Technologie und dem phoonnx-Engine. Zwei TTS-Modelle für jede Sprache, die jemand anfragt, bedrohte Sprachen inbegriffen."
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
> Browser laufen — wählen Sie eine Sprache, tippen Sie einen Satz und hören Sie zu. Keine Installation, kein Server.

Menschen erinnern sich an die Stimme eines Assistenten mehr als an seinen Namen. Deshalb ist die Kernfrage unserer Partnerschaft mit [OpenVoiceOS](https://www.openvoiceos.org/) eine praktische: Wem sollte der Assistent in jeder Sprache ähneln?

Die Antwort lautet **Miro** (männlich) und **Dii** (weiblich) — zwei Stimmidentitäten, die sich durch jede von OpenVoiceOS unterstützte Sprache ziehen. Ein Nutzer, der den Assistenten in Lissabon einrichtet und später auf Deutsch umstellt, sollte denselben vertrauten Sprecher hören. Eine Markenstimme, jede Sprache, im Besitz der Gemeinschaft.

## Eine Identität, viele Sprachen

Der übliche Weg, eine mehrsprachige Stimme zu erhalten, besteht darin, ein einziges Modell auf vielen Sprachen zugleich zu trainieren. Es funktioniert, aber es neigt dazu, das Ergebnis zu verwischen: Akzente laufen von einer Sprache in die andere über, die Aussprache wird ungefähr, und die Stimme verliert die Klarheit eines Muttersprachlers.

Wir gehen den schwierigeren Weg. Für jede Sprache bauen wir ein **einsprachiges** Modell — ein Modell, eine Sprache, trainiert, um diese Sprache gut zu beherrschen. Der Kniff, der sie verbindet, ist das **Voice Cloning**: Jedes einsprachige Miro-Modell wird von derselben Ursprungsidentität geklont, und ebenso für Dii. Das Ergebnis ist eine Familie von Modellen pro Sprache, die jeweils wie ein Muttersprachler sprechen, aber alle dasselbe Timbre, denselben Charakter, dieselbe Miro-Haftigkeit oder Dii-Haftigkeit teilen. Sie erhalten Aussprache in Muttersprachler-Qualität *und* eine einzige wiedererkennbare Identität, statt das eine gegen das andere einzutauschen.

Diese Modelle werden mit [**phoonnx**](https://github.com/TigreGotico/phoonnx), unserem offenen TTS-Framework, trainiert und bereitgestellt — VITS-basiert, nach ONNX exportiert, ausschließlich auf der CPU. Die Stimmen laufen vollständig offline; keine Cloud, kein API-Schlüssel, keine Daten, die Ihre Hardware verlassen. Innerhalb von OpenVoiceOS kümmert sich das Plugin `ovos-tts-plugin-phoonnx` um das Abrufen und Laden. Die vollständige Geschichte zu Hardware und Architektur finden Sie unter [TTS, das auf einer Kartoffel läuft](/de/blog/2026-05-10-tts-that-runs-on-a-potato).

## Die G2P-Forschung, die es möglich macht

Eine Sprache gut zu sprechen, hat nicht nur mit der Stimme zu tun — es hat damit zu tun, zu wissen, wie die Schrift klingen *soll*. Das ist die Aufgabe der **Graphem-zu-Phonem-(G2P)**-Umwandlung: geschriebenen Text in die Abfolge von Phonemen zu verwandeln, die das Modell tatsächlich ausspricht. Jede neue Sprache, die wir angehen, bringt ihre eigene G2P-Forschung mit sich, und in dieser Forschung steckt ein großer Teil der eigentlichen Arbeit.

phoonnx ist hier bewusst flexibel. Es kann eine ganze Bandbreite von Phonemizern ansteuern — eSpeak, Gruut, Epitran, das modellbasierte [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0) und sprachspezifische Werkzeuge dort, wo allgemeine Engines zu kurz greifen. Das knüpft unmittelbar an unseren umfassenderen Phonetik-Stack an: unsere **[Orthografie-zu-IPA-Forschung](/de/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** und die **[lusophonen Phonemizer](/de/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, die wir für die portugiesische Sprachfamilie gebaut haben, dienen demselben Ziel — präzises IPA für Sprachen, die sich die großen TTS-Anbieter nie die Mühe gemacht haben, sorgfältig zu modellieren. Wenn eine Sprache keinen guten gebrauchsfertigen Phonemizer hat, *ist* diese Lücke das Projekt. Wir machen zuerst die Forschung von der Schreibweise zum Klang, und danach folgt die Stimme.


## Zwei Modelle für jede angefragte Sprache

Hier ist das konkrete Angebot, und es ist das Herzstück der Partnerschaft: **Für jede Sprache, die jemand anfragt, werden wir zwei TTS-Modelle bauen — Miro und Dii.** Keine Roadmap voller Irgendwann-Vielleicht; eine dauerhafte Zusage. Fragen Sie nach einer Sprache, und das universelle Paar kommt zu ihr.

Und wir meinen *jede* Sprache, nicht nur die bequemen, kommerziell naheliegenden. Die Stimmen, die der Welt fehlen, sind selten die mit hundert Millionen Sprechern — es sind die **bedrohten und Minderheitensprachen**, die das Mainstream-TTS stillschweigend ignoriert, weil der Markt zu klein ist, um sich damit zu befassen. Genau das sind die Sprachen, die wir erreichen wollen: Gemeinschaften, die nie eine hochwertige synthetische Stimme ihr Eigen nennen konnten und die keinen Grund haben zu erwarten, dass ein Anbieter aus dem Silicon Valley sie jemals bereitstellt.

Das ist kein Versprechen für später. Zum Zeitpunkt dieses Beitrags listet die [**phoonnx TTS models collection**](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) auf Hugging Face 13 Sprachen mit mindestens einer verfügbaren Stimme, und für 8 davon — Baskisch, Arabisch, europäisches Portugiesisch, **Asturisch**, **Aragonesisch**, **Friesisch**, Okzitanisch und kolumbianisches Spanisch — stehen bereits sowohl Miro als auch Dii zur Verfügung.

## Offen und selbst gehostet

Die Stimmen sind **kostenlos und quelloffen**, laufen **offline und selbst gehostet**, sodass nichts von dem, was Sie sagen, Ihre Hardware verlässt, und der gesamte Stack — Engine, Phonemizer, G2P-Forschung, trainierte Stimmen — ist offen, damit eine Gemeinschaft ihre Sprache übernehmen und behalten kann.

Wenn Ihre Sprache noch nicht auf der Liste steht, ist das keine verschlossene Tür — es ist eine Anfrage, die darauf wartet, gestellt zu werden.
