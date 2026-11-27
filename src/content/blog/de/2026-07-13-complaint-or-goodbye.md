---
title: "Dein Sentiment-Modell kann eine Beschwerde nicht von einem Abschied unterscheiden"
description: "Zwei wütend wirkende Support-Nachrichten. Ein Kunde will eskalieren; der andere geht einfach, ohne ein Wort. Kaum ein Emotionsmodell kann die beiden unterscheiden – weil allen dieselbe Achse fehlt. Einführung in emotion-algebra."
date: 2026-07-13
lang: de
updated: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "Affective Computing"
  - "Emotion"
  - "Machine Learning"
  - "LILACS"
  - "Open Source"
  - "Science"
draft: false
---

Zwei Nachrichten landen in deiner Support-Warteschlange.

> "Das ist das dritte Mal, dass eure App meine Arbeit gelöscht hat. Fixt das."

> "Ich weiß nicht, ob ich das richtig mache, und ich habe Angst, dass ich etwas kaputt gemacht habe."

Lauf sie durch irgendein Sentiment-Modell, das du willst. Beide kommen als dasselbe raus:
**negativ, hohe Aktivierung**. Wütend wirkend. Aufgebracht.

Also behandelst du sie gleich – und hast gerade einen Fehler gemacht, denn diese
zwei Menschen brauchen Gegenteiliges.

Der erste ist *wütend*, und wütende Menschen **engagieren sich**. Sie glauben,
dass sie eine Lösung erzwingen können, und sie werden weiterdrücken, bis sie eine
bekommen. Schick ihnen eine herzliche Entschuldigung und das Versprechen, dich
darum zu kümmern, und du wirst sie nur noch mehr auf die Palme bringen.

Die zweite ist *verängstigt*. Sie glaubt nicht, dass sie irgendetwas reparieren
kann. Ein einziges schlechtes Reply entfernt sie vom Tab schließen und nie
zurückkommen – leise, ohne je zu sagen, warum. Schick ihr eine Ticket-Nummer und
ein fünftägiges Remediation-Fenster, und du wirst sie verlieren.

Eine ist eine Beschwerde. Die andere ist ein Abschied. Und fast nichts im
Emotions-AI-Handwerkskasten kann dir sagen, welche davon welche ist.

Wir haben eine Weile gebraucht, um herauszufinden, warum. Die Antwort war
interessanter, als wir erwartet hatten, und sie endet damit, dass ein neuronales
Netz, trainiert auf einer Milliarde Tweets, einer Psychologie-Studie aus 1985
zustimmt, die es nie gelesen hat.

## Die fehlende Dimension

Das Ding ist: Wut und Angst sind **nahezu identisch, wenn man sie auf die übliche
Weise misst.**

Beides fühlt sich schlecht an. Beides ist hoch aktiviert – dein Herzschlag geht in
beiden Fällen nach oben. Diese zwei Eigenschaften, "wie gut fühlt es sich an" und
"wie aufgeregt bist du", sind die zwei Dimensionen, auf denen fast jedes
Emotionsmodell aufbaut. Man nennt sie normalerweise *Valenz* und *Arousal*.

Wut und Angst liegen in diesem Raum übereinander. Kein Modell, das nur auf diesen
zwei Zahlen aufbaut, kann sie trennen – egal wie komplex es ist, weil die
Information schlichtweg nicht da ist.

Was sie tatsächlich trennt, ist ein Drittes: **Fühlst du dich in der Lage, etwas
dagegen zu tun?**

Wut ist das, was du fühlst, wenn etwas falsch läuft *und du handeln kannst*. Angst
ist das, was du fühlst, wenn etwas falsch läuft *und du nicht kannst*. Dieses
Gefühl der Kontrolle – Psychologen nennen es *coping potential* oder *potency* –
macht den ganzen Unterschied. Und es verrät dir, ob jemand kämpfen oder fliehen,
eskalieren oder verschwinden wird.

Das ist keine Randidee. **Vier unabhängige Forschungsprogramme** sind über zwei
Jahrzehnte jeweils unabhängig darauf gekommen, und eines davon (Lerner & Keltner,
2001) hat es *kausal* bewiesen: Wütende Menschen treffen optimistische, risikotolerante
Urteile, während verängstigte Menschen pessimistische, risikoaverse treffen – und
der Effekt läuft über Kontrolle und Sicherheit, nicht darüber, wie schlecht sie
sich fühlen.

Ihr bemerkenswertester Fund ist es wert, innezuhalten. **Die Urteile wütender
Menschen sehen aus wie die Urteile glücklicher Menschen.** Nicht wie die
verängstigter. Wut und Glück haben entgegengesetzte Valenz, und das ist egal, weil
Valenz hier nicht die Arbeit macht.

Warum taucht diese Achse dann nicht in den Tools auf?

## Warum die Achse verschwunden ist

Die meisten Emotions-Tools gehen auf eine kleine Zahl theoretischer Modelle zurück.
Die einflussreichsten sind **Plutchiks Rad der Emotionen** (1980) und, darauf
aufgebaut, **Cambrias Sanduhr der Emotionen** (2012), das dem Modell hinter
SenticNet zugrunde liegt.

Plutchiks Rad ist ein schönes Objekt. Es hat die Form eines Farbrads und
überträgt dessen zentrale Idee: Emotionen kommen in **entgegengesetzten Paaren**.
Freude steht gegen Trauer. Vertrauen gegen Ekel. Und Wut gegen Angst.

Dieses letzte Paar ist das Problem, und wenn man es einmal sieht, kann man es nicht
mehr unsehen.

Wenn Wut und Angst entgegengesetzte Enden einer Achse sind, dann heben sie sich
auf. Nimm die intensivste Wut, die ein Mensch empfinden kann, mische sie mit dem
intensivsten Terror, und frag das Modell, was dabei herauskommt:

```
(rage + terror) / 2  ==  neutrality
```

**Ruhe.** Mische die zwei gewaltsamsten negativen Zustände, zu denen ein Mensch
fähig ist, und das Modell sagt, du fühlst überhaupt nichts.

Das ist kein Bug in einer Implementierung. Es ist eine direkte Konsequenz der
Geometrie – und das Modell hat genau die Quantität weggeworfen, die wir brauchten.
Indem Wut und Angst als *Entgegengesetzte* definiert werden, garantiert das Modell,
dass sie nie *unterscheidbar* sind.

Das Rad weiß das übrigens halb. Die Sanduhr hat eine Formel zur Berechnung von
Sentiment, und in dieser Formel ist die Wut-Angst-Achse in einen absoluten Wert
eingewickelt: **Beide Enden zählen als unangenehm.** Was stimmt! Wut und Angst sind
beide unangenehm. Aber es widerspricht still und leise der Geometrie, die sie
überhaupt an entgegengesetzte Pole gestellt hat. Die eigene Arithmetik des Modells
stimmt nicht mit seinem eigenen Diagramm überein.

## Was die Evidenz tatsächlich sagt

An diesem Punkt hörten wir auf zu programmieren und fingen an, die Literatur zu
lesen, und es waren kein angenehme Tage.

Plutchiks Struktur der Gegensatzpaare wurde getestet. 2009 ließen Smith &
Schneider sie durch mehr als zweitausend statistische Tests laufen und schlossen,
dass die Theorie des Emotionsrads "keine empirische Stütze" findet. Die
Gegensatzpaare sind eine Metapher aus der Farbtheorie. Sie sind keine
Erkenntnis über Menschen.

Die Dinge, die sich *tatsächlich* replizieren, Russells Valenz-Arousal-Komplex
und die Kontroll-Dimension, die Wut von Angst trennt, sind genau die Bausteine,
die es selten in funktionierende Software schaffen.

Es gibt hier ein Problem zweiter Ordnung, und das ist das, das uns tatsächlich
gestört hat. All diese Modelle sind *benutzbar*. Sie sind lebendig, sie lassen sich
lehren, sie passen auf eine Folie. Also werden sie wiederholt – und sobald ein
Modell oft genug wiederholt wurde, nachzuprüfen, woher es kommt, fühlt sich eher
wie Pedanterie an als wie Sorgfalt. So wird aus einer Metapher leise ein
Fundament.

## Auf dem bauen, was überlebt

Also bauten wir [**emotion-algebra**](https://github.com/TigreGotico/emotion-algebra)
und machten die fehlende Achse zum Kern.

Der Kern hat fünf Zahlen: wie gut es sich anfühlt, wie schlecht es sich anfühlt
(ja, getrennt – dazu kommen wir noch), wie sehr du dich unter Kontrolle fühlst,
wie aktiviert du bist, und wie unerwartet das ganze ist. Die stammen von Fontaine
und Kollegen (2007), die sie aus 144 gemessenen Merkmalen über Kulturen hinweg
ableiteten statt aus einem ansprechenden Diagramm.

Jetzt verhält sich die Mischung richtig:

```python
from emotion_algebra import prototype, dominant

dominant(prototype("anger").blend(prototype("fear"), 0.5))
# 'distress'
```

Nicht "Ruhe". **Distress** – zutiefst unangenehm, hoch aktiviert, mit dem Gefühl
der Kontrolle aufgehoben. Genau so sollte sich eine Mischung aus Wut und Terror
anfühlen.

Und die Support-Warteschlange funktioniert:

```python
from emotion_algebra import affect_from_texts

angry, afraid = affect_from_texts([
    "This is the third time your app has lost my work. Fix it.",
    "I don't know if I'm doing this right and I'm scared I've broken something.",
])

angry.valence,  angry.potency    # -0.43, +0.16   -> 'disgust'
afraid.valence, afraid.potency   # -0.47, -0.42   -> 'apprehension'
```

Schau dir die Zahlen an. **Die Valenz ist nahezu identisch** – beide Nachrichten
sind ungefähr gleich unangenehm, und genau deshalb sieht ein konventionelles
Sentiment-Modell nur eine Sache. Die *Potenz* ist gegensätzlich. Eine Person fühlt
sich in der Lage zu handeln; die andere nicht.

Das ist deine Beschwerde, und das ist dein Abschied.

## Der Test, der das Ganze hätte zerstören können

Das hat uns Sorgen gemacht. Alles oben basiert auf der psychologischen Literatur,
und diese Literatur basiert fast ausschließlich auf **Fragebögen** – Menschen, die
Wörter auf einer Skala von 1 bis 9 bewerten. Fragebögen haben eine unangenehme
Eigenschaft: Sie können leise eine Theorie *kodieren*, anstatt sie zu testen.
Wenn jeder, der Emotions-Fragebögen schreibt, aus demselben Lehrbuch gelernt hat,
werden die Fragebögen mit dem Lehrbuch übereinstimmen, und alle fühlen sich sehr
bestätigt.

Wir wollten einen Zeugen ohne jegliche theoretische Ausbildung.

**DeepMoji** ist ein neuronales Netz, das auf **1,2 Milliarden Tweets** trainiert
wurde, um zu erraten, mit welchem Emoji eine Nachricht endete. Das ist buchstäblich
alles, was es tut. Es hat nie von Plutchik gehört, oder von Appraisal-Theory, oder
von coping potential. Es hat überhaupt keine Meinung über Emotionen – es hat nur ein
extrem gut informiertes Gespür dafür, wie Menschen *tatsächlich schreiben*, wenn
sie etwas fühlen.

Also haben wir es mit der einzigen Frage konfrontiert, die zählte:

> Kannst du Wut von Angst unterscheiden? Und wenn ja – was benutzt du dafür?

**Kann es.** Bei realen menschlichen Kommentaren, die von realen Menschen beschriftet
wurden, trennt es Wut von Angst weit über Zufallsniveau. (Mischt man die
Beschriftungen, verschwindet die Fähigkeit komplett, also ist es kein Artefakt
unserer Methode.)

Dann haben wir uns angeschaut, *wie*. Wir haben die Richtung genommen, die DeepMoji
benutzt, um die beiden zu trennen, und gemessen, wie stark sie mit jeder unserer
fünfen Achsen übereinstimmt.

Sie stimmt mit **Potenz** überein – dreimal stärker als mit irgendetwas anderem.
Nicht Valenz. Nicht Arousal.

Ein Modell, das auf einer Milliarde Tweets trainiert wurde, das nie gehört hat, dass
Wut ein Gefühl der Kontrolle beinhaltet und Angst ihr Fehlen, greift genau diese
Unterscheidung an, wenn du es zur Wahl zwingst. Es hat die Achse von selbst
gefunden.

Das ist das überzeugendste, was wir haben, und wir wollen klar sagen, dass es auch
anders hätte ausgehen können. Hätte DeepMoji Wut und Angst anhand von Valenz
getrennt – oder gar nicht getrennt –, wäre unsere dritte Achse ein Artefakt der
psychologischen Literatur gewesen, und wir hätten das sagen müssen.

## Bittersüß, und andere Sachen, die eine einzelne Ziffer nicht halten kann

Noch eine Konsequenz, weil sie schön ist.

Wir tragen "wie gut es sich anfühlt" und "wie schlecht es sich anfühlt" als **zwei
getrennte Zahlen** statt als einen Wert, der von negativ bis positiv reicht. Das
klingt nach einer Kleinigkeit. Ist es nicht.

Menschen fühlen sich tatsächlich gleichzeitig gut und schlecht. Die klassische
Studie nutzt den Abschlusstag: Studenten berichten über echtes Glück und echte
Trauer *gleichzeitig*, nicht einen lauwarmen Durchschnitt davon. Ein einziger
Valenz-Score ist mathematisch nicht in der Lage, das abzubilden. Er muss berichten,
"leicht glücklich", was nicht das ist, was dort irgendjemand fühlt.

Zwei Kanäle können es halten. Das heißt, das Modell kann den unwilligen Sieg
darstellen, den Abschied mit Wehmut, die Kundin, die erleichtert *und* immer noch
wütend ist. Das sind die interessanten Emotionen, und die sind es, die eine
einzelne Ziffer plattmacht.

## Emotionen für die andere Seite

Alles bisherige dreht sich darum, einen Menschen zu lesen. Dieselbe Mechanik läuft
rückwärts, um einer Figur ein eigenes emotionales Leben zu geben.

Eine Emotion ist hier eine *Verschiebung* – du wurdest weggeschoben von dort, wo du
normalerweise sitzt, und mit der Zeit driftest du zurück. Der Ort, zu dem du
zurückdriftest, ist nicht null. Es gibt so etwas wie "keine Emotion" nicht; auch in
Ruhe irgendwo, und dieses irgendwo ist leicht angenehm, ruhig und leicht unter
Kontrolle. (Dieser leichte positive Schlenker ist der Grund, warum ein Wesen in
Ruhe etwas *erkundet* statt reglos dazusitzen. Es ist ein echter, gemessener
Effekt.)

Ein Wachposten, der gerade etwas Terrifies gesehen hat, springt also nicht auf
neutral zurück, wenn ein Timer abläuft. Er kommt langsam runter:

```
terror → fear → apprehension → pensiveness → acceptance
```

Angst, dann Vorsicht, dann eine Art leises Brüten, und irgendwann geht es ihm
wieder gut. Wir haben diese Abfolge nicht vorgegeben; sie ergibt sich aus der
Geometrie.

Und zwei Wachposten können sich dadurch unterscheiden, dass sie sich *unterschiedlichen*
Ruhepunkten nähern. Gib einem ein etwas niedrigeres Basisgefühl der Kontrolle und
die Angewohnheit, schlechte Nachrichten doppelt hinzunehmen, und er wird
erkennbar ängstlich – erschrickt schneller, erholt sich langsamer, brütet länger.
Das ist eine Figur, und es sind vier Zahlen statt eines Verhaltensbaums.

Dann der nützliche Teil: was *tut* er? Auch das kommt aus der Kontroll-Achse. Der
wütende Wachposten lädt dich an. Der verängstigte rennt weg. "Negative Emotion"
kann nicht zwischen den beiden wählen, und das konnte sie noch nie.

## Der Teil, in dem wir dir sagen, was falsch daran ist

Jedes Modell in der Bibliothek trägt eine **Einstufung** und eine Quellenangabe –
von `ESTABLISHED` (repliziert, cross-kulturell, Meta-Analyse) bis `METAPHOR`
(ein schönes Diagramm, das den Test nicht überstanden hat).

Plutchiks Rad ist dabei, eingestuft als `METAPHOR`, und es funktioniert noch genau
so, wie Plutchik es spezifizierte – `-anger` liefert immer noch `fear`, weil das
das ist, was sein Modell sagt. Seine Arithmetik ist treu implementiert, *und* sein
Modell ist nicht richtig über Menschen. Beides stimmt, und wir sagen dir lieber
beides, als eines auszuwählen.

Wir sind genauso ehrlich über unsere eigenen Lücken:

**Arousal aus Text zu lesen ist ungelöst.** Wir können Valenz, wir können Potenz –
wir könnenverlässlich nicht sagen, wie *aufgeputscht* jemand ist, anhand seiner
Wörter. Unsere beste Zahl ist schlecht. Wir liefern sie beschriftet als schlecht
aus, statt still und leise zu hoffen, dass du nicht nachprüfst.

**Eins unserer eigenen Ergebnisse ist vorläufig.** Das "Kontrollgefühl", das Wut
*verursacht*, und das "Kontrollgefühl", das Menschen *berichten, wenn sie wütend
sind*, heraus nicht dasselbe zu sein – du fühlst dich weniger im Griff, während du
wütend bist, als die Theorie vorhersagen würde. Wütend werden ist schließlich
*Kontrolle verlieren*. Wir denken, das ist wichtig. Wir denken auch, dass unsere
Evidenz dafür dünn ist, und wir haben es entsprechend markiert.

## Warum wir uns die Mühe gemacht haben

Eine Emotions-Bibliothek, die leise Dinge behauptet, der die Evidenz widerspricht,
ist schlechter als nutzlos. Sie ist *zuversichtlich* nutzlos – und alles, was
darauf aufgebaut wird, erbt den Fehler, still und leise, für immer.

Wir liefern etwas aus, das dir sagt, wie viel Vertrauen du in jeden einzelnen Teil
setzen sollst.

```bash
pip install emotion-algebra
```

Die [Dokumentation](https://github.com/TigreGotico/emotion-algebra) hat einen
Fünf-Minuten-Quickstart, eine Anleitung, wie man einem Agenten ein emotionales
Leben gibt, und die vollständige Evidenztabelle mit jeder Quellenangabe. Wenn du
denkst, dass eine unserer Einstufungen falsch ist, der Quellcode ist direkt da,
um zu streiten – und wir würden es tatsächlich gerne hören.

Inzwischen: irgendwo in deiner Support-Warteschlange sitzt jemand, der leise einen
Abschied formuliert. Es wäre gut zu wissen, welche Art von Mensch das ist.
