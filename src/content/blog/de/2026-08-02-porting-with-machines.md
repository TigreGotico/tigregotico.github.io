---
title: "Portieren mit Maschinen, und die Lizenzfrage, die wir nicht beantworten konnten"
description: "Wir haben mehrere C-, C++- und Java-Programme — das G2P von espeak-ng, Cotovía, AhoTTS, HermiT — als reines Python neu geschrieben, mit einer KI als Leserin des Original-Quellcodes und einem Menschen als Dirigenten. Niemand auf unserer Seite hat die Originale gelesen. Das wirft zwei Fragen auf: Kann das Ergebnis überhaupt Eigentum sein, und ist es abgeleitet? Wir behielten die ursprünglichen Lizenzen, weil das billiger war als die Antwort. Wir halten die Frage für offen."
date: 2026-08-01
lang: de
author: "Casimiro Ferreira"
tags:
  - "FOSS"
  - "Licensing"
  - "Open Source"
  - "Python"
  - "G2P"
draft: false
---

Wir haben eine Handvoll alter Programme in Python neu geschrieben. Das
G2P-Frontend von [espeak-ng](https://github.com/espeak-ng/espeak-ng), die
galicischen und spanischen Transkriptionsregeln von
[Cotovía](https://gtm.uvigo.es/en/transfer/software/cotovia/), die baskische
linguistische Verarbeitung von [AhoTTS](https://github.com/aholab/AhoTTS), den
N3-Reasoner [EYE](https://github.com/eyereasoner/eye) und den
OWL-2-DL-Reasoner [HermiT](http://www.hermit-reasoner.com/). C, C++ und Java,
die meisten davon älter als ein Jahrzehnt, alle immer noch das Beste, was für
ihre jeweilige Aufgabe verfügbar ist.

Das Motiv war gewöhnlich. Ein C-Programm, das Galicisch phonemisiert, ist
hervorragend, bis man es innerhalb eines Python-Sprachstacks auf einer
ARM-Platine haben möchte. Dann braucht man einen Compiler, eine Toolchain,
Cross-Compilation, eine Verpackungsgeschichte pro Plattform und eine
Subprozessgrenze, über die man Text marshallen muss. Ein Java-Reasoner braucht
eine JVM. Reines Python braucht `pip install`. Es lässt sich auch lesen: Man
kann die Datei öffnen, die entscheidet, wo die Betonung liegt, und sie ändern,
ohne zu wissen, wie das ursprüngliche Build-System funktioniert.

Die Portierungen wurden halbautonom durchgeführt. Eine KI las den
Original-Quellcode und schrieb das Python; ein Mensch leitete die Arbeit und
prüfte die Ausgabe gegen die ursprüngliche Binärdatei. Bei mehreren davon hat
niemand auf unserer Seite jemals den Original-Quellcode gelesen. Das Modell
las ihn. Wir lasen die Diffs und die Paritätstests.

Das lässt eine Frage übrig, über die wir eine Entscheidung treffen mussten und
die wir nicht beantworten konnten: **Ist das Ergebnis ein abgeleitetes Werk,
und wem gehört es?**

Wir sind Ingenieure. Nichts hier ist Rechtsberatung, und wir sind nicht
qualifiziert, welche zu geben. Dies ist eine Beschreibung einer Entscheidung,
die wir getroffen haben, und der Überlegung dahinter.

## Zwei Fragen, die ständig vermischt werden

Ein Programm durch Lesen seines Quellcodes neu zu implementieren ist nicht
neu. Menschen schreiben C in Python um, seit es Python gibt. Neu ist die
Anordnung: Der Leser ist eine Maschine, der Implementierer ist dieselbe
Maschine, und die Menschen in der Schleife haben das Original nie gesehen.

Hier gibt es zwei Fragen, und fast jede Diskussion darüber vermischt sie zu
einer. Sie sind unabhängig voneinander.

1. **Kann das Ergebnis überhaupt jemandem gehören?** Urheberrecht knüpft an
   Werke mit Urhebern an. Wenn eine Maschine den Code produziert hat, wer ist
   dann der Urheber?
2. **Ist das Ergebnis ein abgeleitetes Werk der Eingabe?** Wer auch immer es
   verfasst hat — falls überhaupt jemand — verletzt das Ergebnis das Original?

Man kann bei der einen Ja und bei der anderen Nein sagen, in jeder
Kombination. Halten Sie sie auseinander.

Etwas Vokabular, da der Rest davon abhängt. Ein **abgeleitetes Werk** ist ein
Werk, das auf einem bereits bestehenden basiert — eine Übersetzung, eine
Bearbeitung, ein Port. Das Recht, eines herzustellen, gehört dem
Urheberrechtsinhaber des Originals. **Copyleft**-Lizenzen (die GPL-Familie)
lassen Sie den Code unter der Bedingung verwenden und verändern, dass das, was
Sie verteilen, unter denselben Bedingungen bleibt. **Permissive** Lizenzen
(MIT, Apache-2.0, BSD) lassen Sie im Wesentlichen alles tun, einschließlich
das Ergebnis innerhalb proprietärer Software auszuliefern. Die **LGPL** liegt
dazwischen: Copyleft gilt für die Bibliothek selbst, aber sie in ein größeres
Programm einzubinden, zwingt dieses Programm nicht zur Offenheit. Alle bauen
auf Urheberrecht auf. Sie greifen nur, wenn es ein Urheberrecht gibt, das
durchgesetzt werden kann.

## Frage eins: Gibt es einen Urheber?

Urheberrecht braucht einen menschlichen Urheber. Das US Copyright Office hat
das durchgängig so vertreten, und in *Thaler v. Perlmutter* stimmte der D.C.
Circuit zu: Das Urheberrechtsgesetz "verlangt, dass jedes berechtigte Werk in
erster Instanz von einem Menschen verfasst wird" (Nr. 23-5233, D.C. Cir., 18.
März 2025; der Oberste Gerichtshof lehnte die Zulassung der Revision im März
2026 ab). Der europäische Standard hat eine andere Form und landet an einem
ähnlichen Ort — Schutz erfordert die "eigene geistige Schöpfung des Urhebers",
was einen Urheber voraussetzt, der schafft.

Keine dieser Aussagen besagt, dass KI-unterstützte Arbeit nicht schützbar
wäre. Beide besagen, dass das, was die Maschine allein generiert hat, es ist.
Die Linie verläuft durch das Werk, nicht um es herum, und wo genau sie fällt,
hängt davon ab, wie viel ein Mensch beigetragen hat. Bei unseren Portierungen
ist der menschliche Beitrag real, aber dünn: das Ziel auswählen, das Paket
strukturieren, die Paritätsfehler beurteilen. Es ist nicht offensichtlich,
dass uns das zu den Urhebern der Transkriptionsregeln macht.

Das erzeugt ein unbequemes Objekt. Eine Lizenz ist eine Erlaubniserteilung
durch einen Rechteinhaber. Wenn niemand Rechte am Ergebnis hält, ist die
Lizenzdatei im Wurzelverzeichnis des Repositorys Dekoration. Man beachte,
wohin dieses Argument führt: Es frisst zuerst die eigene Lizenz. Wer
argumentiert, dass maschinengenerierter Code niemandem gehört, argumentiert,
dass die eigenen Vertriebsbedingungen nicht durchsetzbar sind, bevor er sich
überhaupt in die Nähe der Rechte des Ursprungsprojekts begibt.

## Frage zwei: Ist es abgeleitet?

Diese kümmert sich nicht darum, wer der Urheber ist. Rechtsverletzung dreht
sich um Zugang zum Original plus wesentliche Ähnlichkeit mit seiner
geschützten **Ausdrucksform** — die besondere Art, wie die Sache geschrieben
wurde, nicht was sie tut.

Wir hatten Zugang. Das Modell las den Quellcode. Diese Hälfte steht nicht zur
Debatte.

Die Ähnlichkeitshälfte ist, wo es interessant wird, und wo der
Sprachenwechsel weniger zählt, als man erwarten würde. Einen Roman in eine
andere Sprache zu übersetzen erzeugt ein abgeleitetes Werk; das ist das
Lehrbuchbeispiel. Die Sprache zu ändern entkräftet einen Vorwurf wörtlichen
Kopierens. Es entkräftet nicht einen Vorwurf bezüglich der Struktur — die
Reihenfolge der Transformationen, die Zerlegung in Funktionen, die Form der
Regeltabellen, die Art, wie die Grenzfälle aufgeteilt sind.

Es lohnt sich auch, klar zu sagen, dass ein Werkzeug nichts reinwäscht. Wenn
Sie eine Kopie anleiten und das Ergebnis ausliefern, sind Sie derjenige, der
es gemacht hat. "Das Modell hat es geschrieben" ist keine Verteidigung, ebenso
wenig wie "der Compiler hat es ausgegeben" eine wäre.

## Das stärkste Gegenargument

Es gibt einen ernstzunehmenden Fall dafür, dass eine sprachübergreifende
Neuimplementierung in Ordnung ist, und er verdient es, richtig dargestellt zu
werden, statt nur angedeutet zu werden.

In *SAS Institute v World Programming* (EuGH, C-406/10, 2. Mai 2012) urteilte
der Gerichtshof, dass "weder die Funktionalität eines Computerprogramms noch
die Programmiersprache und das Format der Datendateien, die in einem
Computerprogramm verwendet werden, um bestimmte seiner Funktionen zu nutzen,
eine Ausdrucksform dieses Programms darstellen". Sie sind daher nicht
urheberrechtlich geschützt. Die Softwarerichtlinie (2009/24/EG, Artikel 1(2))
sagt dasselbe über die Ideen und Grundsätze, die einem Element eines Programms
zugrunde liegen. Der Gerichtshof urteilte auch, dass ein Lizenznehmer die
Funktionsweise eines Programms studieren und beobachten darf, um die dahinter
stehenden Ideen zu ermitteln, und sie neu implementieren darf.

Das ist keine Formalität. Es bedeutet, dass das, was ein Phonemizer *tut* —
diese Graphemfolge wird in diesem Kontext zu jenem Phonem — niemandem gehört.
Die galicischen Betonungsregeln sind Fakten über das Galicische. Die direkte
Semantik von OWL 2 ist eine veröffentlichte W3C-Spezifikation. Unter dieser
Lesart ist eine Neuimplementierung, die Verhalten und nicht Ausdruck
reproduziert, rechtmäßig, und eine sprachübergreifende Neufassung liegt weit
weiter von einer Rechtsverletzung entfernt als ein Kopieren und Einfügen.

Die Lücke zwischen diesem Argument und unserer Situation ist die Quelle. *SAS*
handelt vom Studium des Verhaltens. Unser Modell las den Code.

## Der bereits existierende Präzedenzfall, und wie weit er reicht

Das Argument "maschinelle Ausgabe hat keinen Urheber, also greift kein
Urheberrecht" ist kein Gedankenexperiment. Es trägt in der Produktion,
branchenweit. Sowohl Modelldestillation als auch synthetische Trainingsdaten
ruhen darauf.

Die klarste öffentliche Aussage dazu ist
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), ein weit verbreitetes
offenes TTS-Modell. Seine Karte sagt, es wurde ausschließlich mit
permissivem oder nicht urheberrechtlich geschütztem Audio trainiert, und
listet unter den zulässigen Quellen auf:

> Synthetisches Audio, das von geschlossenen TTS-Modellen großer Anbieter
> generiert wurde

mit einer Fußnote, die auf die
[KI-Politik-Leitlinien](https://copyright.gov/ai/ai_policy_guidance.pdf) des
US Copyright Office verweist. Die Argumentationskette ist die obige: Das
Audio wurde von einer Maschine generiert, maschinelle Ausgabe hat keinen
menschlichen Urheber, also besteht kein Urheberrecht daran, also gibt es
nichts zu verletzen, wenn man damit trainiert. Das Modell wird unter
Apache-2.0 ausgeliefert. Die Karte zieht auch eine Grenze — sie schließt
synthetisches Audio von *offenen* TTS-Modellen und von benutzerdefinierten
Stimmklonen aus —, was ein Zeichen dafür ist, dass die Autoren ausgearbeitet
haben, wo das Argument aufhört, statt es auf alles anzuwenden.

Hier ist der Teil, der für das Portieren zählt. **Dieser Präzedenzfall löst
die andere Hälfte des Problems.**

Kokoros Argument betrifft die **Eingabe**. Was sie konsumierten, war selbst
maschinengeneriert, sodass der Anspruch lautet, es habe von vornherein kein
Urheberrecht getragen. Nicht urheberrechtsfähig hinein, also nichts zu erben.

Unsere Situation ist das Spiegelbild. Was wir konsumierten — das C von
espeak-ng, das C++ von Cotovía, das Java von HermiT — ist eindeutig von
Menschen geschrieben und urheberrechtlich geschützt, von namentlich genannten
Personen, an namentlich genannten Universitäten, vor Jahrzehnten. Was
*herauskam*, war maschinengeschrieben. Das Argument "kein Urheberrecht an
KI-Ausgabe" landet auf unserer Ausgabe, nicht auf unserer Eingabe. Es
wandert nicht stromaufwärts. Es ist, erneut, das Argument, das unsere eigene
Lizenz untergräbt, während es die Rechte des Ursprungsprojekts völlig
unberührt lässt.

Es gibt eine weitere Asymmetrie, die es wert ist, festgehalten zu werden.
Kokoros verbleibendes Risiko ist eigentlich gar kein Urheberrecht — es ist
**Vertrag**. Die Nutzungsbedingungen geschlossener Anbieter verbieten
üblicherweise, ihre Ausgabe zum Training konkurrierender Modelle zu verwenden,
und eine Bedingung, der man zugestimmt hat, verflüchtigt sich nicht dadurch,
dass sich die Ausgabe als nicht urheberrechtsfähig herausstellte. Copyleft
funktioniert nicht so. Niemand klickt auf "Ich stimme zu" bei der GPL. Es ist
eine einseitige Erlaubniserteilung, und sie bindet Sie nur, wenn Sie diese
Erlaubnis brauchen — das heißt, nur wenn das, was Sie gemacht haben, ein
abgeleitetes Werk ist.

Damit fällt die ganze Sache zurück auf die eine Frage, die niemand
beantwortet hat. Wenn eine sprachübergreifende, maschinengeschriebene
Neuimplementierung kein abgeleitetes Werk ist, griff die GPL nie und nichts
davon galt. Wenn es eines ist, galt die GPL ab der ersten Zeile. Es gibt
keinen dritten Zustand, und keine noch so große Diskussion über KI-Urheberschaft
bewegt diese bestimmte Nadel.

## Clean Rooms, und ob zwei Modelle eines ergeben

Die klassische Antwort auf genau dieses Problem ist das Clean-Room-Protokoll,
und es lohnt sich, es präzise zu beschreiben, weil seine Form wichtig ist.

Ein Team liest das Original und schreibt eine funktionale Spezifikation: was
das Programm tut, in Verhaltensbegriffen. Ein zweites Team, das das Original
nie gesehen hat, implementiert nur aus dieser Spezifikation. Die Ausgabe des
zweiten Teams ist nachweislich nicht aus Ausdruck kopiert, den es nie gesehen
hat. So wurde das PC-BIOS neu implementiert, und deshalb überlebte die
Neuimplementierung.

Der naheliegende moderne Schritt ist, ein Modell zum Lesen und Beschreiben und
ein anderes Modell mit frischem Kontext zum Implementieren auszuführen.
Strukturell ist das dasselbe Protokoll. Ist das ein Clean Room?

Es hat die richtige Form. Aber ein Clean Room ist kein technisches Konstrukt
— er ist ein **beweisrechtliches**. Sein gesamter Wert besteht darin, die
Trennung im Nachhinein jemandem gegenüber demonstrieren zu können, der
annimmt, man habe geschummelt. Die Zwei-Modell-Version bedeutet also nur
dann etwas, wenn die Disziplin durchgehend eingehalten wird:

- Die beiden Seiten teilen sich tatsächlich nie Kontext. Nicht "wir haben es
  gebeten zu vergessen" — getrennte Läufe, getrennte Transkripte.
- Die Spezifikation trägt Verhalten und nichts sonst. Kein Pseudocode, der
  den Kontrollfluss des Originals widerspiegelt. Keine Bezeichnernamen. Keine
  Funktionsreihenfolge. Das ist Ausdruck, und eine Spezifikation voll davon
  ist das Original in Verkleidung.
- Die Aufzeichnungen beider Seiten werden aufbewahrt, denn ein Clean Room, den
  man nicht belegen kann, ist eine Geschichte.

Wenn die lesende Seite Struktur ausgibt, geht die Kontamination direkt durch,
und man hat ein abgeleitetes Werk mit zusätzlichen Schritten und einer
höheren Token-Rechnung.

Wir haben das nicht getan. Das implementierende Modell las den Quellcode
direkt. Deshalb steht im README von pycotovia, im Repository, öffentlich:

> Weil die implementierende KI **den GPL-Quellcode gelesen hat**, ist dies
> **keine Clean-Room-Neuimplementierung**, und wir erheben keinen solchen
> Anspruch. Es ist ein aus der Quelle abgeleiteter Port.

Wir haben lieber diesen Satz niedergeschrieben, als ihn später beantworten zu
müssen.

## Was wir getan haben

Wir haben die ursprünglichen Lizenzen beibehalten.

[espyak](https://github.com/TigreGotico/espyak) ist GPL-3.0-or-later, passend
zu espeak-ng. Das ist nicht einmal ein schwieriger Fall: Das Paket bündelt die
eigenen Datendateien von espeak-ng unverändert — `dictsource`, `phsource`,
`lang` — und keine Urheberschaftstheorie berührt Dateien, die wir unverändert
kopiert haben. Die Daten des Ursprungsprojekts liegen innerhalb des Wheels,
also kommt die Lizenz des Ursprungsprojekts mit.

[pycotovia](https://github.com/TigreGotico/pycotovia) ist GPL-3.0, passend zu
Cotovía (GPL-3.0+). [ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p)
und
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa)
sind GPL-3.0, passend zu AhoTTS, dessen Lizenzdatei GPL-3.0+ für die
linguistische Verarbeitung angibt. [pyeye](https://github.com/TigreGotico/pyeye)
ist MIT, passend zu EYE. Copyleft rein, Copyleft raus; permissiv rein,
permissiv raus.

Wir haben das nicht getan, weil wir festgestellt hätten, dass es erforderlich
sei. Wir haben es getan, weil die Asymmetrie die Entscheidung traf, ohne die
Antwort zu brauchen.

Wir veröffentlichen ohnehin Open Source. Copyleft kostet uns fast nichts —
die einzigen realen Kosten liegen im Fall, dass ein Kunde den Code innerhalb
von etwas Proprietärem haben möchte, und für diese spezifischen Bibliotheken
ist dieser Fall selten. Copyleft zu sein, wenn wir es nicht strikt sein
mussten, kostet also annähernd nichts.

Der andere Fehler ist nicht symmetrisch. Eine permissive Lizenz auf etwas
auszuliefern, das Copyleft hätte sein sollen, ist ein Problem, das spät
entdeckt wird, öffentlich, von jemand anderem, nachdem andere Leute darauf
unter Bedingungen aufgebaut haben, die man nicht anbieten durfte. Das
rückgängig zu machen bedeutet, jeden nachgelagerten Nutzer zu kontaktieren.

Diese Asymmetrie ist auch, warum sich der Fehlabgleich generell zu beobachten
lohnt. Ein struktureller Port eines LGPL-Originals kann nicht einfach durch
Umschreiben in eine andere Sprache zu Apache-2.0 werden — und das ist genau
die Art von Fehlabgleich, die leicht zu erzeugen und schwer zu bemerken ist,
weil sich nichts beschwert. Der Build läuft durch. Die Tests laufen durch.
Der Lizenzkopf ist nur eine Datei. HermiT ist LGPL, also ist die Lizenzierung
unseres Python-Ports davon einer der Fälle, die wir überprüfen — was das
banale, korrekte Ergebnis ist: Man prüft, und man behebt, was zu beheben ist.

Bei einer so einseitigen Asymmetrie muss man die Rechtsfrage nicht lösen, um
die Entscheidung zu treffen. Man wählt einfach den Zweig, bei dem
Irren überlebbar ist.

## Dieselbe Frage, in die andere Richtung gerichtet

Alles oben Genannte betrifft Code, den wir produzieren. Dieselbe identische
Logik gilt für Code, den wir empfangen. Jemand öffnet eine Pull Request gegen
eines unserer Repositories. Der Patch wurde von einem Modell geschrieben. Was
gewähren sie uns?

Die meisten Projekte handhaben das mit dem
[Developer Certificate of Origin](https://developercertificate.org/) — dem
DCO, der `Signed-off-by:`-Zeile am Ende einer Commit-Nachricht. Es ist eine
kurze Erklärung, zu der sich der Beitragende beim Unterzeichnen bekennt: dass
er den Beitrag selbst erstellt hat, oder dass er aus einer Quelle unter einer
kompatiblen Lizenz stammt und er das Recht hat, ihn unter den Bedingungen des
Projekts einzureichen. Es ist absichtlich leichtgewichtig. Keine Anwälte,
keine Papiere, eine Zeile pro Commit. So stellen der Linux-Kernel und QEMU,
unter vielen anderen, fest, woher ihr Code stammt.

Bei einem maschinengeschriebenen Patch ist keiner der beiden Zweige eindeutig
wahr. Und die Gabelung löst sich gleich auf, welchen Zweig man auch nimmt.

Wenn maschinengenerierte Ausgabe kein Urheberrecht trägt, hält der
Beitragende keine Rechte daran. Es gibt nichts, was er Ihnen lizenzieren
könnte.

Wenn sie stattdessen als abgeleitet von ihren Trainingsdaten behandelt wird,
gehören die Rechte — was auch immer sie sind — demjenigen, der diese Daten
geschrieben hat. Der Beitragende hält immer noch nichts, und hat immer noch
nichts, was er Ihnen lizenzieren könnte.

So oder so können sie nicht gewähren, was sie nicht besitzen. Die Signatur
ist nicht unehrlich. Der Beitragende hat in gutem Glauben unterzeichnet und
die Arbeit geleistet. Sie ist einfach leer: eine Übertragung von etwas, das
nie ihm gehörte, um es zu übertragen.

Die praktische Konsequenz ist weniger alarmierend, als sich das anhört, und
die beiden Zweige unterscheiden sich stark.

Im ersten Zweig brauchen Sie überhaupt keine Erlaubniserteilung. Material,
das niemandem gehört, kann von jedem verwendet werden. Den Patch anzunehmen
ist in Ordnung, und nichts Schlimmes passiert. Was sich still ändert, ist die
andere Richtung: Copyleft baut auf Urheberrecht auf, und es kann nicht an
Material anknüpfen, das keins trägt. Ein GPL-Projekt, das maschinengeschriebene
Patches ansammelt, sammelt Teile an, die seine eigene Lizenz möglicherweise
nicht erreicht. Die Lizenz regelt weiterhin das Werk, wie es verteilt wird.
Der durchsetzbare Kern darin dünnt allmählich aus, ohne dass es jemand
bemerkt.

Der zweite Zweig hat Zähne. Wenn ein Modell auswendig gelernte Trainingsdaten
wortwörtlich reproduziert — was tatsächlich vorkommt, mehr bei gängigen
Idiomen und bekannten Implementierungen als bei neuartiger Logik — dann haben
Sie fremden urheberrechtlich geschützten Code akzeptiert, auf Zusicherung
eines Beitragenden, der keine Möglichkeit hatte, das zu prüfen. Der gesamte
Wert des DCO liegt darin, dass die unterzeichnende Person in der Lage war,
es zu wissen. Hier ist sie es nicht.

Debian arbeitet gerade daran. Eine
[Generalresolution zur LLM-Nutzung](https://www.debian.org/vote/2026/vote_002)
ging am 23. Juli 2026 mit fünf Vorschlägen auf dem Stimmzettel in ihre
Diskussionsphase. Sie decken die ganze Bandbreite ab: Vorschlag A würde den
Gesellschaftsvertrag ändern, um LLM-unterstützte Beiträge zu Paketen,
Dokumentation und Webressourcen rundweg zu verbieten; Vorschlag C bittet
Beitragende, LLMs so weit wie praktisch zu vermeiden, verlangt rein
menschliche Formulierung für Projektkommunikation, und erlaubt einzelnen
Maintainern, eigene Verbote durchzusetzen; die Vorschläge B, D und E erlauben
KI-unterstützte Arbeit unter Bedingungen, die jeweils auf Lizenzprüfung,
Verantwortlichkeit der Beitragenden, Offenlegung und Einschränkungen beim
Senden vertraulicher Materialien an Cloud-Dienste aufbauen. Zum Zeitpunkt des
Verfassens wird darüber diskutiert, und nichts ist entschieden.

Das ist die zweite Runde. Ein
[früherer Versuch im Jahr 2024](https://lwn.net/Articles/972331/) endete ohne
Entschließung, und die Begründung fürs Aufhören lohnt sich festzuhalten: Der
Einwand gegen das Handeln war nicht, dass das Anliegen unbegründet sei,
sondern dass eine Regel, die niemand durchsetzen kann, es nicht wert ist,
angenommen zu werden. Man kann sich einen Diff nicht anschauen und es
erkennen.

Das ist keine Randerscheinung. Es trifft ausgerechnet die Projekte mit der
sorgfältigsten Provenienz am härtesten, weil das gesamte Modell eines
DCO-basierten Projekts darüber, woher sein Code kommt, auf dieser einen
Erklärung ruht.

Wir haben nicht gelöst, wie wir damit umgehen werden, und wir sind in einer
schwachen Position, um streng zu sein. Wir liefern von einem Modell
geschriebene Ports aus. Ein Projekt, das maschinengeschriebenen Code
veröffentlicht und maschinengeschriebene Beiträge ablehnt, vertritt zwei
gleichzeitig unvereinbare Positionen, und das möchten wir lieber nicht. Die
ehrlichen Optionen sind dieselben, die Debian abwägt — Offenlegung,
Verantwortlichkeit der Beitragenden, oder eine Regel, die niemand
verifizieren kann — und wir haben uns nicht für eine entschieden.

## Die andere Achse, entlang derer das Argument verläuft

Debians Debatte handelt von Provenienz und Lizenzierung. Sie ist nicht die
einzige Achse, und die zweite hat nichts mit Urheberrecht zu tun.

Codeberg, die FLOSS-Schmiede, verabschiedete im Juli 2026 zwei von den
Mitgliedern genehmigte Anträge und
[legte ihre Begründung dar](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
in Begriffen, die Lizenzen kaum berühren. Die Einwände betreffen Kosten und
Aufwand: Energie- und Hardwareverbrauch, der auf alle abgewälzt wird;
Crawler-Traffic, der kleine Schmieden zu Verteidigungsmaßnahmen zwingt, die
auch normale Nutzer behindern; einmalig "vibe-codierte" Projekte, die
veröffentlicht und nie gepflegt werden; und die Last für die Menschen, die
prüfen:

> Maintainer stehen unter erhöhter Arbeitslast durch Personen, die (oft
> wohlmeinende) LLM-generierte Beiträge mit geringem Aufwand einreichen, die
> erhebliche Mengen an Zeit zur Prüfung erfordern.

Ihre Nutzungsbedingungen raten nun von solchen Projekten ab, angewendet von
Fall zu Fall durch Moderatoren statt durch Massenentfernung.

Es gibt also zwei unabhängige Fragen im Umlauf, und ein Projekt kann
irgendwo im Raster landen: ob maschinengeschriebener Code überhaupt
lizenziert werden kann, und ob das Ökosystem das Volumen aufnehmen kann.
Debian stimmt über die erste ab und hat nicht abgeschlossen. Codeberg hat
zur zweiten gehandelt. Kein Ergebnis klärt das andere, und die Antworten,
die ein Projekt auf jede gibt, sind weitgehend unkorreliert.

## Der Teil, von dem wir nicht so tun werden, als sei er geklärt

Vielleicht hätten wir das alles gar nicht tun müssen.

Betrachten Sie die drei Argumente zusammen. Funktionalität ist nicht
geschützt — der EuGH sagte das direkt. Rein maschinell generierte Ausgabe hat
möglicherweise keinen menschlichen Urheber, sodass es möglicherweise kein
neues Urheberrecht gibt, um das man sich sorgen müsste, und, unbequemerweise,
auch keins von uns. Und ein Zwei-Modell-Protokoll, das mit echter Disziplin
durchgeführt wird, könnte ein echter Clean Room sein, in welchem Fall der
Port nie geschützten Ausdruck berührte.

Wenn alle drei zutreffen, hätten einige dieser Ports mit gutem Gewissen
permissiv lizenziert werden können. Wenn keins davon zutrifft, war unsere
konservative Wahl schlicht richtig. Wir wissen nicht, welcher Fall zutrifft,
und wir haben es nicht getestet. Wir haben kein Interesse daran, der Fall zu
sein, der das klärt.

Die Frage verschwindet nicht dadurch, dass sie ignoriert wird. Diese Art des
Portierens wird alltäglich — sie ist inzwischen billig, und es gibt eine
enorme Menge ungepflegten C-Codes, den es wert ist, an einen Ort zu bewegen,
an dem er gepflegt werden kann. Jeder dieser Ports wird sich denselben beiden
Fragen stellen müssen, und die meisten werden antworten, indem sie nicht
fragen. Ebenso wie jedes Projekt, das einen Patch zusammenführt, den es nicht
selbst geschrieben hat, das heißt, alle. Die Fragen kommen, egal ob man den
Code schreibt oder ihn nur annimmt.
