---
title: "Wenn alle eine App veröffentlichen, veröffentlichen wir Stimme: Websites in Sprach-Apps verwandeln"
description: "Jede Website, die zählt, wurde in eine mobile App verpackt. Wir schlagen den umgekehrten Schritt für das Zeitalter der Stimme und der Kommandozeile vor: eine saubere API plus eine Sprach-Skill pro Website, damit das Web per Ohr und per Tastatur durchsuchbar wird. Eine Website nach der anderen ergibt in der Summe einen Sprach-Browser."
date: 2026-07-04
lang: de
author: "Casimiro Ferreira"
tags:
  - "Voice"
  - "Accessibility"
  - "OpenVoiceOS"
  - "Web Automation"
  - "CLI"
  - "FOSS"
draft: false
---

Irgendwann in den letzten fünfzehn Jahren hat das Web still und leise
entschieden, dass jede wichtige Website auch eine mobile App braucht. Nicht,
weil HTML aufgehört hätte zu funktionieren — sondern weil eine App eine
*kontrollierte Oberfläche* ist: eine kuratierte Auswahl an Aktionen, kein
Chrome, das Sie nicht selbst gewählt haben, eine Schnittstelle, die für genau
eine Art der Interaktion gebaut wurde.

Wir glauben, dass derselbe Schritt darauf wartet, für eine andere Gruppe von
Nutzern und eine andere Reihe von Schnittstellen vollzogen zu werden. Wenn alle
ihre Website in eine Android-App verwandeln, **können wir Websites in Sprach-Apps
verwandeln** — und in Kommandozeilen-Apps und in bildschirmleser-native Abläufe.
Dieselbe Idee, die entgegengesetzte Richtung: eine Website in eine Oberfläche
verpacken, die dafür gebaut ist, wie *Sie* mit ihr interagieren möchten — nur ist
die Oberfläche hier Ihre Stimme und Ihr Terminal statt eines Touchscreens.

## Das Web ist per Ohr kaum benutzbar

Für einen sehenden Nutzer mit einer Maus ist eine moderne Website in Ordnung.
Für jemanden, der per Stimme, über einen Bildschirmleser oder von einem Terminal
aus surft, ist der größte Teil des Webs eine feindliche Umgebung:
Endlos-Scroll-Wände, Cookie-Banner, Pop-ups, Menüs, die einen Zeiger erfordern,
Inhalte, die unter drei Schichten interaktivem Krempel begraben sind. Die
Information ist da drin. Sie freihändig herauszubekommen, ist eine Qual.

Die übliche Antwort lautet „Websites sollten barrierefreier sein", und das sollten
sie. Aber wir werden das gesamte Web nicht dadurch reparieren, dass wir freundlich
darum bitten. Was wir *tun können*, ist, uns die Websites vorzunehmen, die zählen,
und für jede eine saubere, gesprochene Schnittstelle zu bauen — so, wie es die
App-Stores für die Berührung taten, aber für Stimme und Kommandozeile, und offen.

## Zwei Schichten: eine saubere API, dann eine Sprach-Skill

Jede dieser Sprach-Apps besteht aus zwei aufeinandergestapelten Teilen, und wir
bauen bereits beide.

**Schicht eins — ein typisierter Client, der eine Website in eine API verwandelt.**
Das ist genau unsere
[Arbeit an Scraping und API-Reverse-Engineering](/de/blog/2026-04-20-music-database-scrapers):
in eine Website hineinreichen, die keine brauchbare öffentliche Schnittstelle hat,
und strukturierte, typisierte Objekte statt brüchigem HTML zurückgeben — Verben,
kein Scraping:

```python
from py_bandcamp import BandCamp

for release in BandCamp.search_albums("king gizzard"):
    artist = release.work.credits[0].entity.name if release.work.credits else ""
    print(release.work.title, artist, release.uri)
```

Die Aufklärungsarbeit und die
[Anti-Bot-Transport](/de/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)-Werkzeuge
darunter halten diesen Zugang funktionsfähig, während sich die Website verändert.
Dieser Client ist bereits für sich allein nützlich: für einen Terminal-Nutzer *ist*
die API die barrierefreie Version der Website — unser SoundCloud-Client bringt sogar
`nds` mit, eine Kommandozeilen-App zum Suchen und Abspielen von Musik, ganz ohne
Browser in Sicht. Sobald eine Website eine API ist, hört sie auf, ein visuelles
Artefakt zu sein, und wird zu etwas, das eine Maschine — oder eine Sprach-Pipeline —
steuern kann.

**Schicht zwei — ein OVOS-Plugin, das diese API spricht.** Auf dem Client sitzt ein
[OpenVoiceOS](https://openvoiceos.org)-Plugin, das gesprochene Absichten auf
API-Aufrufe abbildet und die Ergebnisse mit unseren
[Offline-TTS-Stimmen](/de/blog/2026-06-15-two-voices-every-language-miro-and-dii)
vorträgt. Es ist bewusst *keine* maßgeschneiderte Skill pro Website — dieser Weg
führt zu Dutzenden von Einzel-Skills, die niemand pflegen kann. Für alles, was
Medien-Form hat, ist es ein
[OCP](https://openvoiceos.github.io/ovos-technical-manual/)-Anbieter-Plugin: ein
kleiner Adapter, der die Such-und-Abspiel-Oberfläche einer Website dem gesamten
Open-Common-Play-Framework zugänglich macht, sodass „suchen", „abspielen",
„weiter" und „fortsetzen" bereits genauso funktionieren wie für jede andere Quelle.
Die Website fügt sich in eine einheitliche Sprachschnittstelle ein, statt ihre
eigene zu erfinden.

Das Ergebnis: „Spiele den Kanal Groove Salad von SomaFM ab." „Suche auf Bandcamp
nach Creative-Commons-Ambient." Die Website, verwandelt in etwas, das Sie benutzen
können, ohne hinzusehen — und ohne für jede Website eine neue Grammatik lernen zu
müssen.

## Im Zeitalter der LLMs ist eine typisierte API eine natürlichsprachliche UI, die nur darauf wartet zu entstehen

Es gibt einen zweiten Grund, warum diese Form heute wichtiger ist, als sie es vor
fünf Jahren gewesen wäre. Ein sauberer, typisierter Client ist genau das, was ein
großes Sprachmodell braucht, um zu einem *natürlichsprachlichen Front-End* für eine
Website zu werden.

Geben Sie einem LLM eine dokumentierte Reihe von Funktionen — `search_albums`,
`get_recommendations`, `stream_url` — und es wird „finde mir etwas wie Naxatras,
aber härter" bereitwillig in die richtigen Aufrufe übersetzen, sie verketten und das
Ergebnis zurücksprechen. Die strukturierte API ist der schwierige Teil; die
konversationelle Schnittstelle obendrauf ist zunehmend etwas, das das Modell
schlicht *liefert*, solange die Werkzeuge, die man ihm in die Hand gibt, gut
typisiert und ehrlich darüber sind, was sie zurückgeben. Unordentliches HTML gibt
einem LLM nichts, woran es sich festhalten könnte. Ein typisierter Client gibt ihm
eine Kontrolloberfläche.

Deshalb bringen unsere Website-Clients eine **`SKILL.md`** mit — eine Beschreibung
in einfacher Sprache dessen, was die API tut, ihrer Verben, ihrer Rückgabetypen und
Beispielaufrufe, geschrieben, damit ein Agent sie liest. Richten Sie einen
LLM-gesteuerten Assistenten darauf, und der Client wird zu einem Werkzeug, das das
Modell sofort verwenden kann: kein Klebecode, keine maßgeschneiderte Integration,
nur „hier ist, was diese Website kann, in Worten." Ein Dokument verwandelt einen
Scraper in etwas, das ein Sprachmodell in Ihrem Auftrag bedienen kann.

Es sind dieselben strukturierten Daten, die drei Front-Ends zugleich bedienen: eine
**CLI** für Terminal-Nutzer, ein **OCP-/Sprach-Plugin** für die freihändige
Nutzung und ein **LLM-Werkzeug** für die Steuerung per natürlicher Sprache. Bauen
Sie die API einmal; tragen Sie sie auf drei Weisen.

## Warum das am meisten für Menschen zählt, die den Bildschirm nicht sehen können

Für blinde und sehbehinderte Nutzer ist dies keine Komfortfunktion — es ist der
Unterschied zwischen Zugang und Ausschluss. Ein Bildschirmleser kann nur das
vorlesen, was eine Seite sauber offenlegt, und die meisten Seiten tun das nicht.
Eine dedizierte Sprach-App überspringt die Seite vollständig: Sie geht zu den
strukturierten Daten und spricht *diese* aus, in einem Ablauf, der von der ersten
Codezeile an fürs Zuhören konzipiert ist.

Es ist dasselbe Prinzip, das hinter unseren
[Audio-first-Spielen](/de/games) steht — für die Ohren gebaut, nicht für die Augen,
mit blinden Spielern als Hauptzielgruppe statt als nachträglichem Gedanken.
Sprach-Apps für Websites weiten dieses Prinzip von den Spielen auf den Rest des Webs
aus.

## Eine Website nach der anderen — aber die Richtung ist ein Sprach-Browser

Hier der ehrliche Teil: Es gibt keine universelle Abkürzung. Man kann „das Web"
nicht in einem Rutsch sprachfähig machen, denn jede Website ist ihr eigenes
Gestrüpp. Es muss **pro Website** geschehen — ein Client, eine Skill, eine sorgfältig
zugeordnete Reihe von Absichten nach der anderen. Das klingt nach einer
Einschränkung, und kurzfristig ist es das auch.

Aber sehen Sie, worauf die Ansammlung hinausläuft. Jede Website, die wir verpacken,
ist eine weitere Ecke des Webs, die nun per Stimme und per Kommandozeile erreichbar
ist. Fügen Sie genug davon zusammen — ein gemeinsames Metadaten-Vokabular, eine
geteilte Sprachschicht, eine konsistente Reihe von Absichten „suchen / öffnen /
lesen / abspielen / weiter" — und Sie blicken nicht länger auf einen Haufen
separater Skills. Sie blicken auf die Anfänge eines **Sprach-Browsers**: eine Art,
sich sprechend durch das Web zu bewegen, wobei einzelne Websites bloß Ziele sind,
die bereits wissen, wie sie antworten.

Die Wette des mobilen Zeitalters war, dass eine Website, die es wert ist, benutzt zu
werden, eine App wert ist. Unsere ist, dass eine Website, die es wert ist, benutzt
zu werden, eine *Stimme* wert ist. Wir bauen sie eine nach der anderen, im Offenen,
und jede einzelne macht das Web ein wenig durchsuchbarer für die Menschen, die das
visuelle Web zurückgelassen hat.

Möchten Sie eine bestimmte Website in eine Sprach- oder Kommandozeilen-App verwandelt
haben — für die Barrierefreiheit, für Ihr Produkt oder einfach, weil es sie geben
sollte? [Sprechen wir darüber.](/de/services)
