---
title: "Portare Codice con le Macchine, e la Domanda sulla Licenza a Cui Non Abbiamo Saputo Rispondere"
description: "Abbiamo riscritto diversi programmi in C, C++ e Java — il G2P di espeak-ng, Cotovia, AhoTTS, HermiT — come puro Python, con un'IA che leggeva il codice sorgente originale e un essere umano a orchestrare il lavoro. Nessuno di noi ha letto gli originali. Questo solleva due domande distinte: il risultato può essere posseduto da qualcuno, ed è un'opera derivata dell'originale? Abbiamo mantenuto le licenze originali perché era più economico che rispondere. Pensiamo ancora che la domanda resti aperta."
date: 2026-08-01
lang: it
author: "Casimiro Ferreira"
tags:
  - "FOSS"
  - "Licensing"
  - "Open Source"
  - "Python"
  - "G2P"
draft: false
---

Abbiamo riscritto in Python una manciata di programmi datati. Il front-end G2P
di [espeak-ng](https://github.com/espeak-ng/espeak-ng), le regole di
trascrizione galiziane e spagnole di
[Cotovia](https://gtm.uvigo.es/en/transfer/software/cotovia/), l'elaborazione
linguistica basca di [AhoTTS](https://github.com/aholab/AhoTTS), il ragionatore
N3 [EYE](https://github.com/eyereasoner/eye) e il ragionatore OWL 2 DL
[HermiT](http://www.hermit-reasoner.com/). C, C++ e Java, la maggior parte più
vecchi di un decennio, tutti ancora il meglio disponibile per ciò che fanno.

Il motivo era ordinario. Un programma in C che fonemizza il galiziano è
eccellente finché non lo si vuole dentro uno stack vocale Python su una scheda
ARM. A quel punto serve un compilatore, una toolchain, la cross-compilazione,
una strategia di packaging per piattaforma e un confine tra sottoprocessi
attraverso cui bisogna instradare il testo. Un ragionatore Java richiede una
JVM. Il puro Python richiede `pip install`. Si legge anche meglio: potete
aprire il file che decide dove va l'accento e modificarlo, senza sapere come
funziona il sistema di build originale.

I port sono stati realizzati in modo semi-autonomo. Un'IA leggeva il codice
sorgente originale e scriveva il Python; un essere umano dirigeva il lavoro e
verificava l'output rispetto al binario originale. Per parecchi di essi,
nessuno da parte nostra ha mai letto il codice sorgente originale. Il modello
lo ha letto. Noi abbiamo letto i diff e i test di parità.

Questo lascia aperta una domanda su cui abbiamo dovuto prendere una decisione,
senza saperle rispondere: **il risultato è un'opera derivata (derivative
work), e a chi appartiene?**

Siamo ingegneri. Nulla di quanto segue è consulenza legale, e non siamo
qualificati a fornirla. Questa è la descrizione di una decisione che abbiamo
preso e del ragionamento che ci sta dietro.

## Due domande che vengono continuamente confuse

Reimplementare un programma leggendone il codice sorgente non è una novità. Si
riscrive C in Python da quando esiste Python. Ciò che è nuovo è la
disposizione: chi legge è una macchina, chi implementa è la stessa macchina, e
gli esseri umani nel ciclo non hanno mai visto l'originale.

Ci sono due domande qui, e quasi ogni discussione su questo tema le riduce a
una sola. Sono indipendenti.

1. **Il risultato può essere posseduto da qualcuno?** Il diritto d'autore si
   applica a opere che hanno degli autori. Se un'opera in codice è stata
   prodotta da una macchina, chi ne è l'autore?
2. **Il risultato è un'opera derivata dell'input?** Chiunque ne sia l'autore —
   ammesso che ce ne sia uno — il risultato viola l'originale?

Potete rispondere sì a una e no all'altra, in entrambe le combinazioni.
Teniamole separate.

Un po' di vocabolario, perché il resto dipende da questo. Un'**opera derivata**
(derivative work) è un'opera basata su una preesistente — una traduzione,
un adattamento, un port. Il diritto di crearne una appartiene al titolare del
diritto d'autore sull'originale. Le licenze **copyleft** (la famiglia GPL)
permettono di usare e modificare il codice a condizione che ciò che
distribuite resti sotto gli stessi termini. Le licenze **permissive** (MIT,
Apache-2.0, BSD) permettono praticamente tutto, incluso spedire il risultato
dentro software proprietario. La **LGPL** sta nel mezzo: il copyleft si
applica alla libreria in sé, ma collegarla (linking) a un programma più grande
non obbliga quel programma a diventare open. Tutte si fondano sul diritto
d'autore. Hanno effetto solo se esiste un diritto d'autore da far valere.

## Prima domanda: esiste un autore?

Il diritto d'autore richiede un autore umano. L'US Copyright Office lo ha
sostenuto con coerenza, e in *Thaler v. Perlmutter* la Corte d'Appello del
Circuito del Distretto di Columbia (D.C. Circuit) ha concordato: il Copyright
Act "richiede che ogni opera ammissibile sia in prima istanza opera di un
essere umano" (No. 23-5233, D.C. Cir., 18 marzo 2025; la Corte Suprema ha
negato il certiorari nel marzo 2026). Lo standard europeo ha una forma diversa
ma approda a un esito simile — la protezione richiede la "creazione
intellettuale propria dell'autore" (author's own intellectual creation), il
che presuppone un autore che crea.

Nessuna delle due posizioni afferma che il lavoro assistito dall'IA sia
inammissibile a protezione. Entrambe affermano che ciò che la macchina ha
generato da sola lo è. Il confine attraversa l'opera, non le sta attorno, e
dove esattamente cade dipende da quanto un essere umano vi abbia contribuito.
Nei nostri port, il contributo umano è reale ma esiguo: scegliere l'obiettivo,
strutturare il pacchetto, valutare i fallimenti di parità. Non è ovvio che
questo ci renda gli autori delle regole di trascrizione.

Il che produce un oggetto scomodo. Una licenza è una concessione di permesso
da parte di un titolare di diritti. Se nessuno detiene diritti sull'output, il
file di licenza alla radice del repository è decorazione. Notate dove porta
questo argomento: divora per primo la vostra stessa licenza. Chiunque
sostenga che il codice generato da macchina non sia posseduto da nessuno sta
sostenendo che i propri termini di distribuzione non sono applicabili, ancor
prima di avvicinarsi a quelli dell'originale.

## Seconda domanda: è derivato?

Questa non dipende da chi sia l'autore. La violazione (infringement) dipende
dall'accesso all'originale unito a una somiglianza sostanziale con la sua
**espressione** protetta — il modo particolare in cui la cosa è stata
scritta, non ciò che fa.

Avevamo accesso. Il modello ha letto il codice sorgente. Questa metà non è in
discussione.

La metà relativa alla somiglianza è dove la faccenda si fa interessante, e
dove il cambio di linguaggio conta meno di quanto ci si aspetti. Tradurre un
romanzo in un'altra lingua produce un'opera derivata; è l'esempio da manuale.
Cambiare linguaggio smonta una tesi di copiatura letterale. Non smonta una
tesi sulla struttura — l'ordine delle trasformazioni, la scomposizione in
funzioni, la forma delle tabelle di regole, il modo in cui i casi limite sono
suddivisi.

Vale anche la pena dirlo chiaramente: uno strumento non ripulisce nulla. Se
dirigete una copia e distribuite il risultato, siete voi ad averla fatta. "È
stato il modello a scriverlo" non è una difesa più di quanto lo sarebbe "è
stato il compilatore a generarlo".

## L'argomento più forte dalla parte opposta

C'è una tesi seria secondo cui una reimplementazione cross-linguaggio è
lecita, e merita di essere esposta con cura invece che sventolata.

In *SAS Institute v World Programming* (CJUE, C-406/10, 2 maggio 2012), la
Corte ha stabilito che "né la funzionalità di un programma per elaboratore né
il linguaggio di programmazione e il formato dei file di dati utilizzati in
un programma per elaboratore al fine di sfruttare talune sue funzioni
costituiscono una forma di espressione di tale programma". Non sono quindi
protetti dal diritto d'autore. La Direttiva Software (2009/24/CE, articolo
1(2)) dice lo stesso a proposito delle idee e dei principi alla base di
qualsiasi elemento di un programma. La Corte ha anche stabilito che un
licenziatario può studiare e osservare il comportamento di un programma per
determinare le idee sottostanti, e reimplementarle.

Non è un tecnicismo. Significa che ciò che un phonemizer *fa* — questa
sequenza di grafemi, in questo contesto, diventa quel fonema — non è di
proprietà di nessuno. Le regole di accento del galiziano sono fatti relativi
al galiziano. La semantica diretta di OWL 2 è una specifica W3C pubblicata.
Secondo questa lettura, una reimplementazione che riproduce il comportamento
e non l'espressione è lecita, e una riscrittura tra linguaggi si trova molto
più lontana dalla violazione di quanto lo sia un copia-incolla.

Il divario tra questo argomento e la nostra situazione è la fonte. *SAS*
riguarda lo studio del comportamento. Il nostro modello ha letto il codice.

## Il precedente che già esiste, e fin dove arriva

L'argomento "l'output di una macchina non ha autore, quindi non sussiste
diritto d'autore" non è un esperimento mentale. È strutturale in produzione,
in tutto il settore. La distillazione di modelli e i dati sintetici di
addestramento si basano entrambi su di esso.

L'affermazione pubblica più chiara è quella di
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), un modello TTS
aperto molto usato. La sua scheda dichiara che è stato addestrato
esclusivamente su audio permissivo o non protetto da copyright, ed elenca tra
le fonti ammissibili:

> Synthetic audio generated by closed TTS models from large providers

con una nota a piè di pagina che rimanda alle
[linee guida sull'IA](https://copyright.gov/ai/ai_policy_guidance.pdf)
dell'US Copyright Office (in italiano: "audio sintetico generato da modelli
TTS chiusi di grandi fornitori"). La catena di ragionamento è quella sopra:
l'audio è stato generato da una macchina, l'output di macchina non ha un
autore umano, quindi non sussiste diritto d'autore su di esso, quindi non c'è
nulla da violare addestrandosi su di esso. Il modello è distribuito con
licenza Apache-2.0. La scheda traccia anche un confine — esclude l'audio
sintetico proveniente da modelli TTS *aperti* e da cloni vocali personalizzati
— segno che gli autori hanno individuato dove l'argomento si ferma invece di
applicarlo indiscriminatamente.

Ecco la parte rilevante per il porting. **Quel precedente risolve l'altra metà
del problema.**

L'argomento di Kokoro riguarda l'**input**. Ciò che hanno consumato era esso
stesso generato da macchina, quindi la tesi è che non portasse con sé alcun
diritto d'autore fin dall'inizio. Non protetto in entrata, quindi nulla da
ereditare.

La nostra situazione è l'immagine speculare. Ciò che abbiamo consumato — il C
di espeak-ng, il C++ di Cotovia, il Java di HermiT — è inequivocabilmente
scritto da esseri umani e protetto da copyright, da persone nominate, presso
università nominate, decenni fa. Ciò che ne è uscito è stato scritto da una
macchina. L'argomento del "nessun diritto d'autore sull'output dell'IA" ricade
sul nostro output, non sul nostro input. Non risale a monte. È, di nuovo,
l'argomento che mina la nostra licenza lasciando del tutto intatti i diritti
dell'originale.

Vale la pena notare un'ulteriore asimmetria. L'esposizione residua di Kokoro
non è realmente una questione di diritto d'autore — è **contrattuale**. I
termini di servizio dei fornitori chiusi vietano generalmente di usare il
loro output per addestrare modelli concorrenti, e una clausola che avete
accettato non svanisce perché l'output si è rivelato non protetto da
copyright. Il copyleft non funziona così. Nessuno clicca "accetto" sulla GPL.
È una concessione unilaterale di permesso, e vi vincola solo se avete bisogno
di quel permesso — vale a dire, solo se ciò che avete creato è un'opera
derivata.

Così l'intera questione ricade sull'unica domanda a cui nessuno ha risposto.
Se una reimplementazione cross-linguaggio, scritta da macchina, non è
un'opera derivata, la GPL non è mai entrata in gioco e nulla di essa si
applicava. Se lo è, la GPL si applicava fin dalla prima riga. Non c'è un
terzo stato, e nessuna quantità di discussioni sull'autorialità dell'IA
sposta quell'ago in particolare.

## Clean room, e se due modelli ne fanno una

La risposta classica a esattamente questo problema è il protocollo clean-room
(stanza pulita), e vale la pena descriverlo con precisione perché la sua
forma è ciò che conta.

Un team legge l'originale e scrive una specifica funzionale: ciò che il
programma fa, in termini comportamentali. Un secondo team, che non ha mai
visto l'originale, implementa solo a partire da quella specifica. L'output
del secondo team è dimostrabilmente non copiato da un'espressione che non ha
mai visto. È così che è stato reimplementato il BIOS dei PC, ed è per questo
che quella reimplementazione ha retto.

La mossa moderna ovvia è far leggere e descrivere a un modello, e far
implementare a un modello diverso con un contesto pulito. Strutturalmente, è
lo stesso protocollo. È una clean room?

Ha la forma giusta. Ma una clean room non è un costrutto tecnico — è un
costrutto **probatorio** (evidentiary). Il suo intero valore consiste nel
poter dimostrare a posteriori la separazione, a qualcuno che presume che
abbiate barato. Quindi la versione a due modelli significa qualcosa solo se
la disciplina regge fino in fondo:

- Le due parti non condividono davvero mai il contesto. Non "gli abbiamo
  detto di dimenticare" — esecuzioni separate, trascrizioni separate.
- La specifica porta con sé il comportamento e nient'altro. Nessuno
  pseudocodice che rispecchi il flusso di controllo dell'originale. Nessun
  nome di identificatore. Nessun ordine delle funzioni. Quelle sono
  espressione, e una specifica piena di questi elementi è l'originale
  travestito.
- I verbali di entrambe le parti vengono conservati, perché una clean room di
  cui non si può fornire prova è solo un racconto.

Se la parte che legge produce struttura, la contaminazione passa dritta
attraverso, e vi ritrovate con un'opera derivata con passaggi in più e una
bolletta di token più alta.

Noi non abbiamo fatto così. Il modello che implementava ha letto il codice
sorgente direttamente. È per questo che il README di pycotovia dice, nel
repository, pubblicamente:

> Because the implementing AI **read the GPL source**, this is **not a
> clean-room reimplementation** and we make no such claim. It is a
> source-derived port.

Preferiamo avere quella frase scritta nero su bianco piuttosto che doverla
rispondere in seguito.

## Cosa abbiamo fatto

Abbiamo mantenuto le licenze originali (upstream).

[espyak](https://github.com/TigreGotico/espyak) è GPL-3.0-or-later, in linea
con espeak-ng. Quello non è nemmeno un caso difficile: il pacchetto include
alla lettera i file di dati di espeak-ng — `dictsource`, `phsource`, `lang` —
e nessuna teoria sull'autorialità tocca file che abbiamo copiato immutati. I
dati dell'originale sono dentro il wheel, quindi la licenza dell'originale
viene con essi.

[pycotovia](https://github.com/TigreGotico/pycotovia) è GPL-3.0, in linea con
Cotovia (GPL-3.0+). [ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) e
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa)
sono GPL-3.0, in linea con AhoTTS, il cui file di licenza dichiara GPL-3.0+
per l'elaborazione linguistica. [pyeye](https://github.com/TigreGotico/pyeye)
è MIT, in linea con EYE. Copyleft in entrata, copyleft in uscita; permissivo
in entrata, permissivo in uscita.

Non lo abbiamo fatto perché abbiamo stabilito che fosse obbligatorio. Lo
abbiamo fatto perché l'asimmetria prendeva la decisione senza bisogno della
risposta.

Pubblichiamo comunque open source. Il copyleft ci costa quasi nulla — l'unico
costo reale è il caso in cui un cliente voglia il codice dentro qualcosa di
proprietario, e per queste librerie specifiche quel caso è raro. Quindi
essere copyleft quando non era strettamente necessario costa circa zero.

L'errore opposto non è simmetrico. Distribuire con licenza permissiva
qualcosa che avrebbe dovuto essere copyleft è un problema che si scopre
tardi, pubblicamente, grazie a qualcun altro, dopo che altre persone hanno
costruito su di esso secondo termini che non eravate autorizzati a offrire.
Disfare la cosa significa contattare ogni utente a valle.

Questa asimmetria è anche il motivo per cui vale la pena sorvegliare in
generale la mancata corrispondenza. Un port strutturale di un originale LGPL
non può semplicemente diventare Apache-2.0 solo perché riscritto in un altro
linguaggio — ed è esattamente il tipo di mancata corrispondenza facile da
creare e difficile da notare, perché nulla si lamenta. La build passa. I
test passano. L'intestazione di licenza è solo un file. HermiT è LGPL, quindi
la licenza del nostro port Python è uno dei casi che stiamo riesaminando —
che è l'esito banale e corretto: si verifica, e si corregge ciò che va
corretto.

Con un'asimmetria così sbilanciata, non serve risolvere la questione legale
per prendere la decisione. Si prende semplicemente il ramo in cui sbagliare è
sostenibile.

## La stessa domanda, rivolta nella direzione opposta

Tutto quanto sopra riguarda il codice che produciamo. La stessa identica
logica si applica al codice che riceviamo. Qualcuno apre una pull request
contro uno dei nostri repository. La patch è stata scritta da un modello. Cosa
ci stanno concedendo?

La maggior parte dei progetti gestisce la questione con il
[Developer Certificate of Origin](https://developercertificate.org/) — il
DCO, la riga `Signed-off-by:` in fondo al messaggio di commit. È una breve
dichiarazione a cui il contributore attesta quando firma: di aver creato il
contributo personalmente, oppure che proviene da una fonte con licenza
compatibile e di avere il diritto di sottoporlo secondo i termini del
progetto. È deliberatamente leggero. Nessun avvocato, nessuna pratica
burocratica, una riga per commit. È così che il kernel Linux e QEMU, tra
molti altri, stabiliscono la provenienza del proprio codice.

Per una patch scritta da una macchina, nessuna delle due condizioni è
banalmente vera. E la biforcazione si risolve allo stesso modo qualunque ramo
si prenda.

Se l'output generato da macchina non porta alcun diritto d'autore, il
contributore non detiene alcun diritto su di esso. Non c'è nulla da
concedervi in licenza.

Se invece viene considerato derivato dai suoi dati di addestramento, i
diritti — quali che siano — appartengono a chi ha scritto quei dati. Il
contributore continua a non detenere nulla, e continua a non avere nulla da
concedervi in licenza.

In entrambi i casi, non possono concedere ciò che non detengono. La firma non
è disonesta. Il contributore ha firmato in buona fede e ha svolto il lavoro.
È semplicemente vuota: un trasferimento di qualcosa che non era mai stato suo
da trasferire.

La conseguenza pratica è meno allarmante di quanto sembri, e i due rami
divergono nettamente.

Sul primo ramo, non serve affatto una concessione. Materiale che nessuno
possiede può essere usato da chiunque. Accettare la patch va bene e non
succede nulla di male. Ciò che cambia silenziosamente è la direzione opposta:
il copyleft si fonda sul diritto d'autore, e non può applicarsi a materiale
che non ne porta alcuno. Un progetto GPL che accumula patch scritte da
macchina accumula parti che la propria licenza potrebbe non raggiungere. La
licenza continua a governare l'opera come distribuita. Il nucleo applicabile
al suo interno si assottiglia, lentamente, senza che nessuno se ne accorga.

Il secondo ramo ha delle conseguenze concrete. Se un modello riproduce alla
lettera dati di addestramento memorizzati — cosa che accade, più con
idiomi comuni e implementazioni ben note che con logica inedita — allora
avete accettato codice protetto da copyright altrui, sulla base di una
garanzia data da un contributore che non aveva modo di verificarla. L'intero
valore del DCO sta nel fatto che chi lo firma è in grado di sapere. Qui non
lo è.

Debian sta affrontando la questione proprio ora. Una
[risoluzione generale sull'uso degli LLM](https://www.debian.org/vote/2026/vote_002)
è entrata nel suo periodo di discussione il 23 luglio 2026 con cinque
proposte sulla scheda. Coprono l'intero spettro: la Proposta A emenderebbe il
Contratto Sociale per vietare del tutto i contributi assistiti da LLM a
pacchetti, documentazione e risorse web; la Proposta C chiede ai
contributori di evitare gli LLM per quanto praticabile, richiede una
redazione solo umana per le comunicazioni del progetto e permette ai singoli
manutentori di imporre i propri divieti; le Proposte B, D ed E permettono il
lavoro assistito dall'IA a determinate condizioni, basate rispettivamente su
verifica della licenza, responsabilità del contributore, dichiarazione
esplicita e restrizioni sull'invio di materiale confidenziale a servizi
cloud. Al momento in cui scriviamo è in discussione e nulla è stato deciso.

È il secondo tentativo. Un
[precedente tentativo nel 2024](https://lwn.net/Articles/972331/) si è
concluso senza una risoluzione, e vale la pena ricordare il motivo dello
stop: l'obiezione ad agire non era che la preoccupazione fosse infondata, ma
che una regola che nessuno può far rispettare non vale la pena adottarla. Non
si può guardare un diff e capirlo.

Non è una preoccupazione marginale. Colpisce più duramente esattamente i
progetti con la provenienza più curata, perché l'intero modello di un
progetto basato sul DCO riguardo alla provenienza del proprio codice poggia
su quell'unica attestazione.

Non abbiamo risolto come gestiremo la questione, e siamo in una posizione
scomoda per essere severi. Distribuiamo port scritti da un modello. Un
progetto che pubblica codice scritto da macchina e rifiuta contributi scritti
da macchina sta sostenendo due posizioni incompatibili contemporaneamente, e
preferiremmo non farlo. Le opzioni oneste sono le stesse che Debian sta
valutando — dichiarazione esplicita, responsabilità del contributore, o una
regola che nessuno può verificare — e non ne abbiamo scelta una.

## L'altro asse lungo cui corre l'argomento

Il dibattito di Debian riguarda provenienza e licenze. Non è l'unico asse, e
il secondo non ha nulla a che fare con il diritto d'autore.

Codeberg, la forge FLOSS, ha adottato due mozioni approvate dai membri nel
luglio 2026 e ha
[esposto il proprio ragionamento](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
in termini che toccano appena le licenze. Le obiezioni riguardano costi e
sforzo: consumo di energia e hardware scaricato su tutti; traffico di
crawler che spinge le piccole forge verso difese che ostacolano anche gli
utenti comuni; progetti "vibe-coded" usa-e-getta pubblicati e mai mantenuti;
e il carico su chi effettua le revisioni:

> Maintainers are under an increased work-load due to people submitting
> (often well-meaning) low-effort, LLM-generated contributions that require
> substantial amounts of time to review.

(in italiano: i manutentori sono sottoposti a un carico di lavoro maggiore a
causa di persone che sottopongono contributi generati da LLM, spesso ben
intenzionati ma di scarso impegno, che richiedono quantità notevoli di tempo
per essere revisionati). I loro Termini di Utilizzo ora scoraggiano tali
progetti, applicati caso per caso dai moderatori piuttosto che con rimozioni
di massa.

Ci sono quindi due domande indipendenti in circolazione, e un progetto può
collocarsi ovunque sulla griglia: se il codice scritto da macchina possa
essere concesso in licenza, e se l'ecosistema possa assorbire il volume.
Debian sta votando sulla prima e non ha ancora concluso. Codeberg ha agito
sulla seconda. Nessuno dei due esiti risolve l'altro, e le risposte che un
progetto dà a ciascuna sono in gran parte non correlate.

## La parte che non fingeremo sia risolta

Forse non avevamo bisogno di fare nulla di tutto ciò.

Considerate insieme i tre argomenti. La funzionalità non è protetta — lo ha
detto direttamente la CGUE. L'output puramente generato da macchina potrebbe
non avere un autore umano, quindi potrebbe non esserci alcun nuovo diritto
d'autore di cui preoccuparsi e, scomodamente, nemmeno il nostro. E un
protocollo a due modelli eseguito con disciplina reale potrebbe essere una
vera clean room, nel qual caso il port non ha mai toccato espressione
protetta.

Se tutte e tre reggono, alcuni di questi port avrebbero potuto essere
concessi in licenza permissiva con coscienza pulita. Se nessuna regge, la
nostra scelta prudente era semplicemente corretta. Non sappiamo quale sia il
caso, e non lo abbiamo testato. Non abbiamo interesse a essere il caso che
lo stabilisce.

La domanda non scompare venendo ignorata. Questo tipo di porting sta
diventando ordinario — è economico ora, e c'è moltissimo C non mantenuto che
vale la pena spostare da qualche parte dove possa essere mantenuto. Ognuno di
quei port affronterà le stesse due domande, e la maggior parte risponderà
non ponendosele. Lo stesso farà ogni progetto che integra una patch che non
ha scritto, il che vuol dire tutti quanti. Le domande arrivano sia che
scriviate il codice sia che lo accettiate soltanto.
