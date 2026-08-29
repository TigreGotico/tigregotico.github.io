---
title: "Portieren mit Maschinen, und die Lizenzfrage, die wir nicht beantworten konnten"
description: "Wir haben mehrere C-, C++- und Java-Programme (das G2P von espeak-ng, Cotovía, AhoTTS, HermiT) als reines Python neu geschrieben, mit einer KI als Leserin des Quellcodes und einem Menschen als Dirigenten. Niemand auf unserer Seite hat die Originale gelesen. Das wirft zwei Fragen auf: Kann das Ergebnis überhaupt Eigentum sein, und ist es ein abgeleitetes Werk? Wir behielten die ursprünglichen Lizenzen, weil das billiger war als die Antwort. Wir halten die Frage weiterhin für offen."
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

Wir haben eine Handvoll alter Programme in Python neu geschrieben. Das G2P-Frontend von [espeak-ng](https://github.com/espeak-ng/espeak-ng), die galicischen und spanischen Transkriptionsregeln von [Cotovía](https://gtm.uvigo.es/en/transfer/software/cotovia/), die baskische linguistische Verarbeitung von [AhoTTS](https://github.com/aholab/AhoTTS), den N3-Reasoner [EYE](https://github.com/eyereasoner/eye) und den OWL-2-DL-Reasoner [HermiT](http://www.hermit-reasoner.com/). C, C++ und Java, die meisten davon älter als ein Jahrzehnt.

Das Motiv war gewöhnlich. Ein C-Programm, das Galicisch phonemisiert, ist hervorragend, bis man es innerhalb eines Python-Sprachstacks auf einer ARM-Platine haben möchte: ein Compiler, eine Toolchain, Cross-Compilation, eine Subprozessgrenze, über die man Text marshallen muss. Ein Java-Reasoner braucht eine JVM; reines Python braucht `pip install`, und man kann die Datei öffnen, die entscheidet, wo die Betonung liegt, und sie ändern.

Die Portierungen wurden halbautonom durchgeführt: Eine KI las den Original-Quellcode und schrieb das Python, ein Mensch leitete die Arbeit und prüfte die Ausgabe gegen die ursprüngliche Binärdatei. Bei mehreren davon hat niemand auf unserer Seite jemals den Original-Quellcode gelesen. Das Modell tat es, und wir lasen die Diffs und die Paritätstests.

Das lässt eine Frage übrig, die wir nicht beantworten konnten: **Ist das Ergebnis ein abgeleitetes Werk, und wem gehört es?**

Wir sind Ingenieure. Nichts hier ist Rechtsberatung, und wir sind nicht qualifiziert, welche zu geben: Dies ist eine Beschreibung einer Entscheidung, die wir getroffen haben, und der Überlegung dahinter.

## Zwei Fragen, die ständig vermischt werden

Ein Programm durch Lesen seines Quellcodes neu zu implementieren ist nicht neu. Neu ist die Anordnung: Der Leser ist eine Maschine, der Implementierer ist dieselbe Maschine, und die Menschen in der Schleife haben das Original nie gesehen.

Es gibt hier zwei unabhängige Fragen, fast immer zu einer zusammengefasst, obwohl man die eine mit Ja und die andere mit Nein beantworten kann.

1. **Kann das Ergebnis überhaupt jemandem gehören?** Urheberrecht knüpft an Werke mit Urhebern an. Wenn eine Maschine den Code produziert hat, wer ist dann der Urheber?
2. **Ist das Ergebnis ein abgeleitetes Werk der Eingabe?** Wer auch immer es verfasst hat, falls überhaupt jemand, verletzt das Ergebnis das Original?

Ein **abgeleitetes Werk** ist ein Werk, das auf einem bereits bestehenden basiert, etwa eine Übersetzung oder ein Port. **Copyleft**-Lizenzen (die GPL-Familie) lassen Sie den Code unter der Bedingung verwenden und verändern, dass das, was Sie verteilen, unter denselben Bedingungen bleibt. **Permissive** Lizenzen (MIT, Apache-2.0, BSD) lassen Sie das Ergebnis innerhalb proprietärer Software ausliefern. Die **LGPL** liegt dazwischen.

## Frage eins: Gibt es einen Urheber?

Urheberrecht braucht einen menschlichen Urheber. Das US Copyright Office hat das durchgängig so vertreten, und in *Thaler v. Perlmutter* stimmte der D.C. Circuit zu: Das Urheberrechtsgesetz "verlangt, dass jedes berechtigte Werk in erster Instanz von einem Menschen verfasst wird" (Nr. 23-5233, D.C. Cir., 18. März 2025; der Oberste Gerichtshof lehnte die Zulassung der Revision im März 2026 ab). Der europäische Standard landet an einem ähnlichen Ort: Schutz erfordert die "eigene geistige Schöpfung des Urhebers", was einen Urheber voraussetzt, der schafft.

Keine dieser Aussagen besagt, dass KI-unterstützte Arbeit nicht schützbar wäre, nur dass das, was eine Maschine allein generiert, es nicht ist, und wo genau die Grenze fällt, hängt davon ab, wie viel ein Mensch beigetragen hat: In unseren Portierungen ist der Beitrag real, aber dünn, das Ziel auswählen, das Paket strukturieren, die Paritätsfehler beurteilen. Es ist nicht offensichtlich, dass uns das zu den Urhebern der Transkriptionsregeln macht.

Das erzeugt ein unbequemes Objekt: Eine Lizenz ist eine Erlaubniserteilung durch einen Rechteinhaber, wenn also niemand Rechte am Ergebnis hält, ist die Lizenzdatei im Wurzelverzeichnis des Repositorys Dekoration, und das Argument frisst seinen eigenen Schwanz. Wer argumentiert, dass maschinengenerierter Code niemandem gehört, argumentiert, dass die eigenen Vertriebsbedingungen nicht durchsetzbar sind, lange bevor er sich überhaupt in die Nähe der Rechte des Ursprungsprojekts begibt.

## Frage zwei: Ist es abgeleitet?

Diese kümmert sich nicht darum, wer der Urheber ist. Rechtsverletzung dreht sich um Zugang zum Original plus wesentliche Ähnlichkeit mit seiner geschützten **Ausdrucksform**, der besonderen Art, wie die Sache geschrieben wurde, nicht was sie tut, und wir hatten Zugang: Das Modell las den Quellcode, und diese Hälfte steht nicht zur Debatte.

Die Ähnlichkeitshälfte ist, wo der Sprachenwechsel weniger zählt, als man erwarten würde. Einen Roman zu übersetzen erzeugt ein abgeleitetes Werk; die Sprache zu ändern entkräftet einen Vorwurf wörtlichen Kopierens, aber nicht einen Vorwurf bezüglich der Struktur, der Reihenfolge der Transformationen, der Zerlegung in Funktionen, der Form der Regeltabellen.

Ein Werkzeug wäscht auch nichts rein: Wenn Sie eine Kopie anleiten und das Ergebnis ausliefern, haben Sie es gemacht, und "das Modell hat es geschrieben" ist keine Verteidigung, ebenso wenig wie "der Compiler hat es ausgegeben" eine wäre.

## Das stärkste Gegenargument

Es gibt einen ernstzunehmenden Fall dafür, dass eine sprachübergreifende Neuimplementierung in Ordnung ist. In *SAS Institute v World Programming* (EuGH, C-406/10, 2. Mai 2012) urteilte der Gerichtshof, dass "weder die Funktionalität eines Computerprogramms noch die Programmiersprache und das Format der Datendateien, die in einem Computerprogramm verwendet werden, um bestimmte seiner Funktionen zu nutzen, eine Ausdrucksform dieses Programms darstellen". Die Softwarerichtlinie (2009/24/EG, Artikel 1(2)) sagt dasselbe über die Ideen und Grundsätze, die einem Programm zugrunde liegen, und der Gerichtshof urteilte, dass ein Lizenznehmer die Funktionsweise eines Programms studieren darf, um die dahinterstehenden Ideen zu ermitteln, und sie neu implementieren darf.

Das bedeutet, dass das, was ein Phonemizer *tut*, diese Graphemfolge in jenes Phonem zu verwandeln, niemandem gehört: Die galicischen Betonungsregeln sind Fakten über das Galicische, und die direkte Semantik von OWL 2 ist eine veröffentlichte W3C-Spezifikation. Eine Neuimplementierung, die Verhalten statt Ausdruck reproduziert, ist rechtmäßig, und eine sprachübergreifende Neufassung liegt weit weiter von einer Rechtsverletzung entfernt als ein Kopieren und Einfügen.

Die Lücke zwischen diesem Argument und unserer Situation ist die Quelle: *SAS* handelt vom Studium des Verhaltens, und unser Modell las den Code.

## Der bereits existierende Präzedenzfall, und wie weit er reicht

Das Argument "maschinelle Ausgabe hat keinen Urheber, also greift kein Urheberrecht" ist kein Gedankenexperiment: Modelldestillation und synthetische Trainingsdaten ruhen beide darauf, branchenweit. Die klarste öffentliche Aussage dazu ist [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), ein weit verbreitetes offenes TTS-Modell, dessen Karte sagt, es wurde ausschließlich mit permissivem oder nicht urheberrechtlich geschütztem Audio trainiert, und listet unter den zulässigen Quellen auf:

> Synthetisches Audio, das von geschlossenen TTS-Modellen großer Anbieter generiert wurde

mit einer Fußnote zu den [KI-Politik-Leitlinien](https://copyright.gov/ai/ai_policy_guidance.pdf) des US Copyright Office: Maschinelle Ausgabe hat keinen menschlichen Urheber, also besteht nichts, das durch Training darauf verletzt werden könnte. Das Modell wird unter Apache-2.0 ausgeliefert, und die Karte schließt auch synthetisches Audio von *offenen* TTS-Modellen und von benutzerdefinierten Stimmklonen aus, ein Zeichen dafür, dass die Autoren ausgearbeitet haben, wo das Argument aufhört.

Dieser Präzedenzfall löst die andere Hälfte des Problems. Kokoros Argument betrifft die **Eingabe**: Was sie konsumierten, war selbst maschinengeneriert, sodass der Anspruch lautet, es habe von vornherein kein Urheberrecht getragen. Unsere Situation ist das Spiegelbild: Was wir konsumierten, das C von espeak-ng, das C++ von Cotovía und das Java von HermiT, ist von Menschen geschrieben und urheberrechtlich geschützt, von namentlich genannten Personen an namentlich genannten Universitäten, und was *herauskam*, war maschinengeschrieben. Das Argument landet also auf unserer Ausgabe, nicht auf unserer Eingabe, und wandert nicht stromaufwärts.

Es gibt eine weitere Asymmetrie: Kokoros verbleibendes Risiko ist, wenn überhaupt, vertraglicher und nicht urheberrechtlicher Natur, und diese Verpflichtung überlebt auch dort, wo das Urheberrecht es nicht tut. Copyleft funktioniert nicht so; niemand klickt auf "Ich stimme zu" bei der GPL, und sie bindet Sie nur, wenn das, was Sie gemacht haben, ein abgeleitetes Werk ist.

Damit fällt die Sache zurück auf die Frage, die niemand beantwortet hat. Wenn eine sprachübergreifende, maschinengeschriebene Neuimplementierung kein abgeleitetes Werk ist, griff die GPL nie. Wenn es eines ist, galt sie ab der ersten Zeile. Es gibt keinen dritten Zustand.

## Clean Rooms, und ob zwei Modelle eines ergeben

Die klassische Antwort auf dieses Problem ist das Clean-Room-Protokoll: Ein Team liest das Original und schreibt eine funktionale Spezifikation dessen, was das Programm tut, und ein zweites Team, das das Original nie gesehen hat, implementiert nur aus dieser Spezifikation. So wurde das PC-BIOS neu implementiert, und deshalb überlebte es.

Der naheliegende moderne Schritt lässt ein Modell lesen und beschreiben und ein anderes Modell mit frischem Kontext implementieren, strukturell dasselbe Protokoll. Es hat die richtige Form, aber ein Clean Room ist kein technisches Konstrukt, sondern ein **beweisrechtliches**, dessen gesamter Wert darin besteht, die Trennung jemandem gegenüber zu demonstrieren, der annimmt, man habe geschummelt. Die Zwei-Modell-Version bedeutet nur dann etwas, wenn die Disziplin durchgehend eingehalten wird:

- Die beiden Seiten teilen sich tatsächlich nie Kontext. Nicht "wir haben es gebeten zu vergessen", sondern getrennte Läufe, getrennte Transkripte.
- Die Spezifikation trägt Verhalten und nichts sonst. Kein Pseudocode, der den Kontrollfluss des Originals widerspiegelt. Keine Bezeichnernamen. Keine Funktionsreihenfolge. Das ist Ausdruck, und eine Spezifikation voll davon ist das Original in Verkleidung.
- Die Aufzeichnungen beider Seiten werden aufbewahrt, denn ein Clean Room, den man nicht belegen kann, ist eine Geschichte.

Wenn die lesende Seite Struktur ausgibt, geht die Kontamination direkt durch, und man hat ein abgeleitetes Werk mit zusätzlichen Schritten und einer höheren Token-Rechnung.

Wir haben das nicht getan: Das implementierende Modell las den Quellcode direkt, weshalb im README von pycotovia öffentlich steht:

> Weil die implementierende KI **den GPL-Quellcode gelesen hat**, ist dies **keine Clean-Room-Neuimplementierung**, und wir erheben keinen solchen Anspruch. Es ist ein aus der Quelle abgeleiteter Port.

Wir haben lieber diesen Satz niedergeschrieben, als ihn später beantworten zu müssen.

## Was wir getan haben

Wir haben die ursprünglichen Lizenzen beibehalten: Copyleft rein, Copyleft raus; permissiv rein, permissiv raus. [espyak](https://github.com/TigreGotico/espyak) ist GPL-3.0-or-later, passend zu espeak-ng; nicht einmal ein schwieriger Fall, da es die eigenen Datendateien von espeak-ng unverändert bündelt (`dictsource`, `phsource`, `lang`), und keine Urheberschaftstheorie berührt unverändert kopierte Dateien. [pycotovia](https://github.com/TigreGotico/pycotovia) ist GPL-3.0, passend zu Cotovía (GPL-3.0+). [ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) und [pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa) sind GPL-3.0, passend zu AhoTTS. [pyeye](https://github.com/TigreGotico/pyeye) ist MIT, passend zu EYE.

Wir haben das nicht getan, weil wir festgestellt hätten, dass es erforderlich sei, sondern weil die Asymmetrie die Entscheidung traf, ohne die Antwort zu brauchen: Copyleft kostet uns hier fast nichts, während eine permissive Lizenz auf etwas, das Copyleft hätte sein sollen, der schlimmere Fehler ist, spät entdeckt und öffentlich, nachdem andere Leute darauf unter Bedingungen aufgebaut haben, die man nicht anbieten durfte.

Diese Asymmetrie lohnt sich generell zu beobachten: Nichts beschwert sich, wenn ein struktureller Port eines LGPL-Originals in der Übersetzung leise zu Apache-2.0 wird. HermiT ist LGPL, und unser Python-Port trägt LGPL-3.0, passend dazu. Der Rest der Sammlung förderte zwei weitere, beide unspektakulär zutage: einen Wrapper, der Apache-2.0 deklariert, dessen Ursprungsprojekt aber MIT ist, und Repositorys, deren README eine Lizenz nannte, zu der keine passende Datei existierte. Man prüft, man behebt, was zu beheben ist, und die interessante Frage bleibt offen.

Man muss die Rechtsfrage nicht lösen, um diese Entscheidung zu treffen; man wählt den Zweig, bei dem Irren überlebbar ist.

## Dieselbe Frage, in die andere Richtung gerichtet

Dieselbe Logik gilt für Code, den wir empfangen: Jemand öffnet eine Pull Request, geschrieben von einem Modell, und die Frage ist, was er uns damit gewährt.

Die meisten Projekte handhaben das mit dem [Developer Certificate of Origin](https://developercertificate.org/): der `Signed-off-by:`-Zeile, die bestätigt, dass Sie den Beitrag selbst erstellt haben, oder dass er aus einer kompatiblen Quelle stammt, die Sie einreichen dürfen. So stellen der Linux-Kernel und QEMU fest, woher ihr Code stammt.

Bei einem maschinengeschriebenen Patch ist keiner der beiden Zweige einfach wahr: Wenn maschinelle Ausgabe kein Urheberrecht trägt, hält der Beitragende keine Rechte daran; wenn sie stattdessen von Trainingsdaten abgeleitet ist, gehören die Rechte demjenigen, der diese Daten geschrieben hat. So oder so können sie nicht gewähren, was sie nicht besitzen, und die Signatur überträgt, ohne unehrlich zu sein, etwas, das nie ihnen gehörte.

Die Konsequenzen unterscheiden sich stark. Im ersten Zweig kann Material, das niemandem gehört, von jedem verwendet werden, aber Copyleft kann nicht an Material anknüpfen, das keins trägt, sodass ein GPL-Projekt, das maschinengeschriebene Patches aufnimmt, still Teile ansammelt, die seine eigene Lizenz möglicherweise nicht erreicht. Der zweite hat Zähne: Wenn ein Modell auswendig gelernte Trainingsdaten wortwörtlich reproduziert, häufiger bei Idiomen als bei neuartiger Logik, haben Sie fremden urheberrechtlich geschützten Code akzeptiert, auf Zusicherung eines Beitragenden, der keine Möglichkeit hatte, das zu prüfen, und das trifft die Projekte mit der sorgfältigsten Provenienz am härtesten.

Debian arbeitet gerade daran. Eine [Generalresolution zur LLM-Nutzung](https://www.debian.org/vote/2026/vote_002) erreichte im Juli 2026 ihre Diskussionsphase, mit Vorschlägen, die von einem vollständigen Verbot LLM-unterstützter Beiträge bis zur Erlaubnis unter Offenlegung und Verantwortlichkeit reichen, und nichts ist entschieden. Ein [früherer Versuch im Jahr 2024](https://lwn.net/Articles/972331/) endete ebenfalls ohne Entschließung: Der Einwand war nicht, dass das Anliegen unbegründet sei, sondern dass eine Regel, die niemand durchsetzen kann, es nicht wert ist, angenommen zu werden.

Wir sind schlecht positioniert, um streng zu sein: Wir liefern von einem Modell geschriebene Ports aus, und ein Projekt, das maschinengeschriebenen Code veröffentlicht und maschinengeschriebene Beiträge zugleich ablehnt, vertritt zwei unvereinbare Positionen.

Lizenzierung ist nicht die einzige Achse, entlang derer dieses Argument verläuft, auch wenn es die ist, um die es in diesem Beitrag geht. Codeberg verabschiedete im Juli 2026 zwei von den Mitgliedern genehmigte Anträge und [legte seine Begründung dar](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html), fast ohne Lizenzen zu erwähnen: Energie- und Hardwarekosten, Crawler-Traffic, ungepflegte Einmal-Projekte und die Prüflast, die Beiträge mit geringem Aufwand den Maintainern auferlegen. Das ist getrennt von der Frage, ob der Code lizenziert werden kann. Debian stimmt über die erste Frage ab und hat nicht abgeschlossen; Codeberg hat zur zweiten gehandelt.

## Der Teil, von dem wir nicht so tun werden, als sei er geklärt

Vielleicht hätten wir das alles gar nicht tun müssen.

Betrachten Sie die drei Argumente zusammen. Funktionalität ist nicht geschützt, der EuGH sagte das direkt. Rein maschinell generierte Ausgabe hat möglicherweise keinen menschlichen Urheber, sodass es möglicherweise kein neues Urheberrecht gibt, um das man sich sorgen müsste, und, unbequemerweise, auch keins von uns. Und ein Zwei-Modell-Protokoll, das mit echter Disziplin durchgeführt wird, könnte ein echter Clean Room sein, in welchem Fall der Port nie geschützten Ausdruck berührte.

Wenn alle drei zutreffen, hätten einige dieser Ports mit gutem Gewissen permissiv lizenziert werden können. Wenn keins davon zutrifft, war unsere konservative Wahl schlicht richtig. Wir wissen nicht, welcher Fall zutrifft, wir haben es nicht getestet, und wir haben kein Interesse daran, der Fall zu sein, der das klärt.

Die Frage verschwindet nicht dadurch, dass sie ignoriert wird. Diese Art des Portierens wird alltäglich, und es gibt eine enorme Menge ungepflegten C-Codes, den es wert ist, an einen Ort zu bewegen, an dem er gepflegt werden kann. Jeder dieser Ports stellt sich denselben beiden Fragen, und die meisten werden antworten, indem sie nicht fragen. Ebenso wie jedes Projekt, das einen Patch zusammenführt, den es nicht selbst geschrieben hat, das heißt, alle.
