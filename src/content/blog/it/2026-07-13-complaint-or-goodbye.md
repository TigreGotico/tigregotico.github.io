---
title: "Il tuo modello di sentiment non sa distinguere un reclamo da un addio"
description: "Due messaggi di supporto che sembrano arrabbiati. Uno sta per scalare l'escalation; l'altro sta per andarsene senza una parola. Quasi nessun modello di emozioni riesce a distinguerli — perché a tutti manca lo stesso asse. Presentiamo emotion-algebra."
date: 2026-07-13
lang: it
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

Due messaggi arrivano nella tua coda di supporto.

> "Questa è la terza volta che la vostra app mi perde il lavoro. Risolvetelo."

> "Non so se lo sto facendo bene e ho paura di aver rotto qualcosa."

Passali attraverso qualsiasi modello di sentiment tu voglia. Entrambi tornano uguali:
**negativo, alto arousal**. Sembra rabbia. Stupore.

Quindi li tratti allo stesso modo — e appena hai fatto un errore, perché queste
due persone hanno bisogno di cose opposte.

Il primo è *furioso*, e le persone furiose sono **coinvolte**. Credono di poter
forzare una risoluzione, e continueranno a spingere finché non l'avranno. Manda
loro una calda scusa e una promessa di indagare, e li farai infuriare di più.

Il secondo è *spaventato*. Non pensa di poter risolvere nulla. È a una brutta
risposta dal chiudere il tab e non tornare mai più — in silenzio, senza mai
dirvi perché. Manda un numero di ticket e una finestra di risoluzione di cinque
giorni, e lo perderai.

Uno è un reclamo. L'altro è un addio. E quasi nulla nel toolbox dell'emo-AI può
dirvi qual è qual'.

Ci abbiamo messo un po' a capire perché. La risultata si è rivelata più
interessante di quanto ci aspettassimo, e finisce con una rete neurale addestrata
su un miliardo di tweet che è d'accordo con un paper di psicologia del 1985 che
non ha mai letto.

## La dimensione mancante

Ecco il fatto su rabbia e paura: **sono quasi identiche, misurate nel modo
consueto.**

Entrambe fanno stare male. Entrambe sono altamente attivate — il tuo battito
cardiaco sale in entrambi i casi. Queste due qualità, "quanto è bello" e "quanto
sei agitato", sono le due dimensioni su cui è costruito quasi ogni modello di
emozioni. Di solito si chiamano *valence* e *arousal*.

Rabbia e paura si sedono l'una sopra l'altra in quello spazio. Nessun modello
costruito su quei due numeri riesce a separarle, per quanto sia sofisticato,
perché l'informazione semplicemente non c'è.

Ciò che in realtà le separa è una terza cosa: **ti senti in grado di fare qualcosa?**

La rabbia è quello che provi quando qualcosa va storto *e puoi agire*. La paura è
quello che provi quando qualcosa va storto *e non puoi*. Quella sensazione di
controllo — i psicologi la chiamano *coping potential* o *potency* — è tutta la
differenza. È anche quello che ti dice se qualcuno combatterà o fuggirà, se
escalaterà o svanirà.

Non è un'idea marginale. **Quattro programmi di ricerca indipendenti** ci sono
arrivati separatamente nel corso di due decenni, e uno di loro (Lerner &
Keltner, 2001) lo ha dimostrato *causalmente*: le persone arrabbiate fanno
giudizi ottimisti e tolleranti al rischio, mentre le persone spaventate fanno
giudizi pessimisti e avversi al rischio — e l'effetto passa attraverso controllo
e certezza, non attraverso quanto si sentono male.

La loro scoperta più sorprendente vale la pena di essere meditata. **I giudizi
delle persone arrabbiate assomigliano ai giudizi delle persone felici.** Non a
quelli delle persone spaventate. Rabbia e felicità hanno valence opposta, e non
importa, perché la valence non è quella che fa il lavoro.

Allora perché questo asse non appare negli strumenti?

## Perché l'asse è sparito

Quasi tutto il tooling per le emozioni risale a un piccolo numero di modelli
teorici. I due più influenti sono la **Ruota delle Emozioni di Plutchik** (1980)
e, costruita sopra, la **Clessidra delle Emozioni di Cambria** (2012), che è il
modello dietro SenticNet.

La ruota di Plutchik è un oggetto bellissimo. Ha la forma di un cerchio
cromatico, e porta con sé l'idea centrale del cerchio cromatico: le emozioni
vengono in **coppie opposte**. La gioia si oppone alla tristezza. La fiducia si
oppone al disgusto. E la rabbia si oppone alla paura.

Questa ultima è il problema, e una volta che lo vedi non puoi più disvederlo.

Se rabbia e paura sono le estremità opposte di un asse, allora si cancellano.
Prendi la rabbia più intensa che una persona possa provare, mescolala con il
terrore più intenso, e chiedi al modello cosa ottieni:

```
(rage + terror) / 2  ==  neutrality
```

**Calma.** Mescola i due stati negativi più violenti di cui un essere umano è
capace, e il modello ti dice che non provi nulla.

Questo non è un bug in un'implementazione. È una diretta conseguenza della
geometria — e significa che il modello ha scartato esattamente la quantità di cui
avevamo bisogno. Facendo della rabbia e della paura degli *opposti*, garantisce
che non possano mai essere *distinguibili*.

La ruota lo sa a metà, per inciso. La Clessidra ha una formula per calcolare il
sentiment, e in quell'formula l'asse rabbia–paura è racchiuso in un valore
assoluto: **entrambe le estremità contano come spiacevoli.** Che è vero! Rabbia
e paura sono entrambe spiacevoli. Ma silenziosamente contraddice la geometria che
le ha messe ai poli opposti. L'aritmetica del modello non è d'accordo con il suo
stesso diagramma.

## Cosa dice davvero l'evidenza

A questo punto abbiamo smesso di scrivere codice e siamo andati a leggere la
letteratura, e non sono stati giorni confortanti.

La struttura a coppie opposte di Plutchik è stata testata. Nel 2009, Smith e
Schneider l'hanno sottoposta a più di duemila test statistici e hanno concluso che
la teoria della ruota delle emozioni "non riceve supporto empirico". Le coppie
opposte sono una metafora elegante presa in prestito dalla teoria del colore.
Non sono una scoperta sulle persone.

Nel frattempo le cose che *effettivamente* si replicano — il circumplex
valence–arousal di Russell, e la dimensione di controllo che separa la rabbia
dalla paura — sono esattamente quelle che raramente finiscono nel software
funzionante.

C'è un problema di secondo ordine qui, ed è quello che ci ha davvero dato fastidio.
Ognuno di questi modelli è *usabile*. Sono vividi, si possono insegnare, stanno
su una slide. Quindi vengono ripetuti — e una volta che un modello è stato
ripetuto abbastanza, controllare da dove viene inizia a sembrare pedanteria
piuttosto che diligenza. È così che una metafora diventa silenziosamente una
fondamenta.

## Costruire su quello che sopravvive

Quindi abbiamo costruito [**emotion-algebra**](https://github.com/TigreGotico/emotion-algebra),
e abbiamo messo l'asse mancante al centro.

Il nucleo ha cinque numeri: quanto è bello, quanto è brutto (sì, separatamente —
ci torneremo), quanto ti senti in controllo, quanto sei attivato, e quanto è
inaspettato tutto questo. Questi vengono da Fontaine e colleghi (2007), che li
hanno derivati da 144 caratteristiche misurate attraverso le culture piuttosto
che da un diagramma attraente.

Ora il mix funziona come dovrebbe:

```python
from emotion_algebra import prototype, dominant

dominant(prototype("anger").blend(prototype("fear"), 0.5))
# 'distress'
```

Non "calmo". **Distress** — profondamente spiacevole, altamente attivato, con la
sensazione di controllo cancellata. Che è esattamente quello che un mix di rabbia
e terrore dovrebbe far provare.

E la coda di supporto funziona:

```python
from emotion_algebra import affect_from_texts

angry, afraid = affect_from_texts([
    "This is the third time your app has lost my work. Fix it.",
    "I don't know if I'm doing this right and I'm scared I've broken something.",
])

angry.valence,  angry.potency    # -0.43, +0.16   -> 'disgust'
afraid.valence, afraid.potency   # -0.47, -0.43   -> 'apprehension'
```

Guarda quei numeri. **La valence è quasi identica** — entrambi i messaggi sono
quasi ugualmente spiacevoli, ed è per questo che un modello di sentiment
convenzionale vede la stessa cosa. La *potency* è opposta. Una persona si sente
in grado di agire; l'altra no.

Questo è il tuo reclamo, e questo è il tuo addio.

## Il test che avrebbe potuto ucciderlo

Ecco cosa ci preoccupava. Tutto quello sopra si basa sulla letteratura di
psicologia, e quella letteratura è costruita quasi interamente su
**questionari** — persone che valutano parole su una scala da 1 a 9. I
questionari hanno una proprietà sgradevole: possono silenziosamente *codificare*
una teoria piuttosto che testarla. Se chi scrive i questionari sulle emozioni è
stato insegnato lo stesso manuale, i questionari saranno d'accordo con il manuale,
e tutti si sentiranno molto validati.

Volevamo un testimone senza alcuna formazione teorica.

**DeepMoji** è una rete neurale che è stata addestrata su **1,2 miliardi di
tweet** per indovinare con quale emoji un messaggio finiva. È genuinamente tutto
ciò che fa. Non ha mai sentito parlare di Plutchik, o della teoria del appraisal,
o del coping potential. Non ha alcuna opinione sulle emozioni — ha solo un senso
estremamente ben informato di come le persone *scrivono davvero* quando provano
qualcosa.

Quindi le abbiamo fatto l'unica domanda che contava:

> Riesci a distinguere la rabbia dalla paura? E se sì — cosa stai usando per
> farlo?

**Ci riesce.** Dati commenti umani reali etichettati da umani reali, separa la
rabbia dalla paura ben oltre il caso. (Mescola le etichette e la capacità sparisce
completamente, quindi non è un artefatto del nostro metodo.)

Poi abbiamo guardato *come*. Abbiamo preso la direzione che DeepMoji usa per
distinguerle, e abbiamo misurato quanto si allinea con ognuno dei nostri cinque assi.

Si allinea con la **potency** — tre volte più fortemente che con qualsiasi altra
cosa. Non la valence. Non l'arousal.

Un modello addestrato su un miliardo di tweet, che non è mai stato detto che la
rabbia comporta una sensazione di controllo e la paura comporta la sua assenza,
si afferra a esattamente quella distinzione quando lo fai scegliere. Ha trovato
l'asse da solo.

Questo è il singolo fatto più convincente che abbiamo, e vogliamo essere chiari sul
fatto che avrebbe potuto andare nell'altra direzione. Se DeepMoji avesse separato
rabbia e paura usando la valence, o non le avesse separate affatto, il nostro
terzo asse sarebbe stato un artefatto della letteratura di psicologia e avremmo
dovuto dirlo.

## Amaro-dolce, e altre cose che un singolo numero non può contenere

Un'altra conseguenza, perché è una bella cosa.

Portiamo "quanto è bello" e "quanto è brutto" come **due numeri separati**, piuttosto
che un punteggio che va da negativo a positivo. Sembra una questione tecnica. Non
lo è.

Le persone provano genuinamente bene e male contemporaneamente. Lo studio canonico
usa il giorno della laurea: gli studenti riportano vera felicità e vera tristezza
*simultaneamente*, non una media tiepida delle due. Un singolo punteggio di
valence è matematicamente incapace di rappresentare questo. Deve dire "felice
moderato", che non è ciò che chiunque sia lì sta provando.

Due canali possono contenerlo. Il che significa che il modello può rappresentare la
vittoria a malincuore, l'addio affettuoso, il cliente che è sollevato *e ancora
furioso*. Quelle sono le emozioni interessanti, e sono quelle che un singolo
numero appiattisce.

## Emozioni per l'altra parte

Tutto finora riguarda leggere un umano. Lo stesso meccanismo funziona al
contrario, per dare a un personaggio una vita emotiva propria.

Un'emozione, qui, è uno *spostamento* — sei stato spinto via da dove normalmente
stai, e col tempo torni indietro. Il luogo dove torni non è zero. Non esiste "nessuna
emozione"; anche a riposo sei da qualche parte, e quella qualche parte è
lievemente piacevole, calma, e lievemente sotto controllo. (Quella leggera
inclinação positiva è perché una creatura a riposo va ed *esplora* qualcosa
anziché stare inerte. È un effetto reale, misurato.)

Quindi una guardia che ha appena visto qualcosa di terrificante non torna
immediatamente a neutro quando un timer scade. Scende attraverso di esso:

```
terror → fear → apprehension → pensiveness → acceptance
```

Paura, poi diffidenza, poi una sorta di rimuginio silenzioso, e alla fine sta
bene. Quella sequenza non l'abbiamo scritta noi; viene fuori dalla geometria.

E due guardie possono differire perché si stabiliscono verso *diversi* luoghi a
riposo. Dai a una una leggermente più bassa sensazione di controllo di base e
l'abitudine di prendere le brutte notizie due volte peggio, e diventa
riconoscibilmente ansiosa — si spaventa di più, si riprende più lentamente, rimugina
più a lungo. Questo è un personaggio, e sono quattro numeri piuttosto che un
albero comportamentale.

Poi la parte utile: cosa *fa*? Anche quello viene dall'asse di controllo. La
guardia arrabbiata ti carica. La guardia spaventata scappa. "Emozione negativa"
non può scegliere tra quelle, e non l'ha mai potuto.

## La parte in cui ti diciamo cosa c'è che non va

Ogni modello nella libreria ha un **grado** e una citazione — da `ESTABLISHED`
(replicato, transculturale, meta-analitico) fino a `METAPHOR` (un bel diagramma
che non ha superato il test).

La ruota di Plutchik è lì, con grado `METAPHOR`, e funziona esattamente come
Plutchik ha specificato — `-anger` ti dà ancora `fear`, perché è quello che il
suo modello dice. La sua aritmetica è fedelmente implementata, *e* il suo modello
non è corretto sulle persone. Entrambe le cose sono vere, e preferiamo dirvi
entrambe piuttosto che sceglierne una.

Siamo altrettanto schietti sulle nostre lacune:

**L'arousal dal testo è irrisolto.** Riusciamo a ottenere la valence, riusciamo a
ottenere la potency — non riusciamo a dire in modo affidabile quanto è *agitato*
qualcuno dalle sue parole. Il nostro miglior numero è peggio. Lo consegniamo
etichettato come peggio piuttosto che sperare silenziosamente che non lo
controlliate.

**Una delle nostre scoperte è provvisoria.** La "sensazione di controllo" che
*causa* la rabbia e la "sensazione di controllo" che le persone *riportano mentre
sono arrabbiate* si rivelano non essere la stessa cosa — ti senti meno in controllo
nel mezzo della rabbia di quanto la teoria prevederebbe. Perdere la pazienza è,
dopo tutto, *perdere il controllo*. Pensiamo che sia importante. Pensiamo anche
che le nostre evidenze per questo siano deboli, e lo abbiamo segnalato di
conseguenza.

## Perché ci siamo dati la pena

Una libreria di emozioni che silenziosamente afferma cose che le evidenze
contraddicono è peggio che inutile. È *sicuramente* inutile — e tutto ciò che è
costruito sopra eredita l'errore, silenziosamente, per sempre.

Preferiamo consegnare qualcosa che vi dice quanto fidarvi di ciascuna delle sue
parti.

```bash
pip install emotion-algebra
```

La [documentazione](https://github.com/TigreGotico/emotion-algebra) ha un
quickstart di cinque minuti, una guida per dare a un agente una vita emotiva, e la
tabella completa delle evidenze con ogni citazione. Se pensate che uno dei nostri
gradi sia sbagliato, il sorgente è lì pronto per discutere — e ci farebbe davvero
piacere sentirne.

Nel frattempo: da qualche parte nella vostra coda di supporto, c'è qualcuno che
sta silenziosamente componendo un addio. Sarebbe bene sapere quale delle due sia.
