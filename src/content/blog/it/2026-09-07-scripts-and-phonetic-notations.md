---
title: "Scritture e Notazioni Fonetiche: Cosa Converte Davvero scriptconv"
description: "Un approfondimento su scriptconv, la libreria a dipendenza zero che rileva i sistemi di scrittura e converte tra notazioni fonetiche. Copre IPA, ARPABET e X-SAMPA; il rilevamento di scrittura ISO-15924; la traslitterazione Buckwalter per l'arabo; la scomposizione dell'Hangul in jamo; e la conversione kana, con esempi reali, eseguiti, e limiti onesti."
date: 2026-08-01
lang: it
author: "Casimiro Ferreira"
tags:
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "Linguistics"
  - "FOSS"
draft: false
---

Un dizionario di pronuncia statunitense dice che "cat" suona come `K AE1 T`.
L'Alfabeto Fonetico Internazionale scrive lo stesso suono come `kæt`. Un
diverso sistema solo ASCII lo scrive come `k"{t`. Tutti e tre descrivono
esattamente gli stessi due fonemi — un suono "k" seguito da una "a" breve
seguita da una "t". Nulla del suono è cambiato. È cambiato solo l'alfabeto
usato per scriverlo.

Questo accade continuamente a chiunque combini dati di pronuncia
provenienti da più di una fonte. Un dataset vocale costruito da un
dizionario statunitense usa una notazione. Un lessico europeo ne usa
un'altra. Un motore text-to-speech ne prevede una terza. Prima che
qualunque di questi dati possa essere unito, cercato o confrontato, deve
essere tradotto da un alfabeto fonetico all'altro — lo stesso lavoro che
fa un traduttore tra lingue umane, salvo che qui le "lingue" sono modi di
scrivere il suono invece che modi di scrivere le parole.

`scriptconv` è una piccola libreria Python che svolge questa traduzione,
più un compito correlato di un livello superiore: capire in quale sistema
di scrittura si trovi un pezzo di testo prima ancora che si possa fare
qualsiasi altra cosa con esso. Non ha alcuna opinione sulla linguistica —
non indovina come si pronuncia una parola. Sposta soltanto simboli che già
rappresentano suoni noti da una notazione all'altra, e identifica le
scritture a partire dai caratteri stessi.

## Alcuni termini, definiti in modo semplice

- **Scrittura (script)**: un sistema di scrittura — l'insieme effettivo di
  caratteri, come il latino, il cirillico o l'hangul. Non è lo stesso di
  una lingua: inglese, francese e vietnamita usano tutti la scrittura
  latina, e il serbo può essere scritto sia in cirillico sia in latino.
- **Ortografia**: le regole convenzionali di scrittura per una lingua
  specifica in una data scrittura — maiuscole, segni d'accento, spaziatura.
- **Fonema**: un'unità distinta di suono in una lingua, come il suono "k"
  in "cat".
- **IPA** (Alfabeto Fonetico Internazionale): un alfabeto standard per
  scrivere i suoni con precisione, indipendentemente dall'ortografia
  normale di qualsiasi lingua.
- **Traslitterazione**: convertire un testo da una scrittura a un'altra
  mappando i caratteri, mirando a preservare esattamente l'ortografia
  originale piuttosto che la pronuncia.
- **Romanizzazione**: traslitterazione specificamente nella scrittura
  latina.

## Perché esistono affatto gli alfabeti fonetici solo ASCII

L'IPA richiede caratteri come `ʃ`, `ʒ`, `ə` e `ˈ` che non si trovano su una
tastiera standard. Questo è stato un problema reale per decenni
dell'informatica, prima che Unicode diventasse universale e prima che la
maggior parte dei font, dei terminali e dei formati di file supportasse in
modo affidabile testo non-ASCII. I ricercatori hanno costruito sostituti
solo ASCII: ARPABET, sviluppato per il lavoro di riconoscimento vocale in
inglese americano, e X-SAMPA, una codifica ASCII dell'intero IPA sviluppata
per essere sicura via email e su vecchi terminali. Non sono curiosità
storiche. ARPABET è ancora la notazione usata da dizionari di pronuncia e
strumenti vocali dell'inglese statunitense ampiamente distribuiti, e
X-SAMPA compare ancora in strumenti linguistici che richiedono testo
semplice. Qualsiasi cosa legga quei dati deve poter leggere quell'alfabeto.

`scriptconv` esegue la conversione effettiva. Questo è output eseguito, non
una descrizione:

```python
from scriptconv import convert, arpa_to_ipa, ipa_to_arpa

convert("K AE1 T", "arpa", "ipa")
# 'kæt'

convert("HH AH0 L OW1", "arpa", "ipa")
# 'həloʊ'

convert("kˈæt", "ipa", "x-sampa")
# 'k"{t'

arpa_to_ipa("HH AH0 L OW1", stress=True)
# 'həlˈoʊ'

ipa_to_arpa("həlˈoʊ", stress=True)
# 'HH AH0 L OW1'
```

I marcatori di accento sopravvivono al viaggio andata e ritorno. ARPABET
segna l'accento con una cifra attaccata alla vocale (`OW1`); l'IPA lo segna
con un `ˈ` posto prima della sillaba accentata. `arpa_to_ipa(..., stress=True)`
trasporta quell'informazione da un sistema all'altro, e la conversione
inversa ricostruisce esattamente le cifre originali.

L'IPA sta al centro di tutto questo per progetto. `scriptconv` tratta ogni
notazione come un nodo in un grafo e ogni convertitore come un arco, e
instrada le conversioni attraverso l'IPA come hub invece di scrivere a mano
un convertitore per ogni coppia di notazioni:

```python
from scriptconv import DEFAULT_GRAPH

[f"{e.src}->{e.dst}" for e in DEFAULT_GRAPH.route("arpa", "x-sampa")]
# ['arpa->ipa', 'ipa->x-sampa']
```

In totale, nove notazioni transcodificano attraverso quell'hub: ARPABET,
X-SAMPA, Kirshenbaum, Lexique, Cotovía, RFE e mantoq, più Buckwalter,
trattato più avanti.

## Rilevare la scrittura prima di fare qualsiasi altra cosa

Prima che un software possa decidere come elaborare un pezzo di testo — in
quale direzione renderizzarlo, quale correttore ortografico eseguire,
quale font scegliere — deve sapere in quale scrittura si trova il testo.
È una domanda diversa da quale lingua sia. La scrittura identifica
l'insieme di caratteri; la lingua identifica il vocabolario e la
grammatica. Il serbo, di nuovo, può essere cirillico o latino. Anche
l'uzbeko può esserlo. `scriptconv` rileva la scrittura direttamente dai
caratteri, e separatamente mappa un codice lingua alla scrittura in cui è
convenzionalmente scritta:

```python
from scriptconv import detect_script, script_runs, lang_to_script, base_direction

detect_script("Здравствуйте")
# 'Cyrl'

detect_script("안녕하세요")
# 'Hang'

script_runs("привет hello")
# [('Cyrl', 'привет '), ('Latn', 'hello')]

base_direction("مرحبا hello")
# 'mixed'

lang_to_script("uzb_cyr")
# 'Cyrl'
```

`detect_script` restituisce un codice ISO 15924 — il registro standard di
etichette a quattro lettere per le scritture (`Cyrl` per il cirillico,
`Hang` per l'hangul, `Latn` per il latino, `Arab` per l'arabo).
`script_runs` divide il testo misto in tratti contigui per scrittura, che è
ciò di cui un renderer ha bisogno per decidere, frase per frase, quale font
e direzione del testo applicare. `base_direction` riporta se una stringa
mista si legge da sinistra a destra, da destra a sinistra, o entrambe.

## I casi difficili: Buckwalter, Hangul e kana

Tre conversioni tra sistemi di scrittura ricorrono abbastanza spesso nelle
pipeline reali che `scriptconv` gestisce ciascuna direttamente.

**Buckwalter**, per l'arabo, è uno schema di traslitterazione ASCII che
mappa ogni lettera e diacritico arabo a uno specifico carattere ASCII, uno
a uno, così che l'ortografia originale — comprese le vocali brevi che il
testo nativo il più delle volte omette — possa essere ricostruita
esattamente. Esiste perché la scrittura araba è scomoda da gestire in
pipeline e strumenti costruiti attorno all'ASCII: ordinamento, diffing,
espressioni regolari e formati di testo più datati diventano tutti più
semplici una volta che il testo è ASCII in alfabeto latino, a patto che la
mappatura sia esatta e reversibile.

```python
from scriptconv import buckwalter_to_arabic, arabic_to_buckwalter

buckwalter_to_arabic("mrHbA")
# 'مرحبا'

arabic_to_buckwalter("مرحبا")
# 'mrHbA'

arabic_to_buckwalter("رحمٰن")
# 'rHm`n'
```

L'ultimo esempio include l'alef pugnale, un piccolo diacritico in apice
usato in una manciata di parole (`رحمٰن`, *rahman*) — Buckwalter ha un
carattere ASCII specifico riservato per esso (`` ` ``), distinto da un
normale alef, così che la traslitterazione non confonda i due.

**L'Hangul** appare come blocchi di sillabe, ma ogni blocco è un gruppo
composto di lettere individuali (jamo) disposte in una griglia — il modo
in cui "H", "A", "N" si combinano visivamente in un unico glifo per "han"
invece di essere scritte da sinistra a destra. Il software che ha bisogno
delle lettere individuali — per la ricerca, per l'analisi fonologica, per
alimentare un sistema diverso — deve separarle di nuovo:

```python
from scriptconv.translit import decompose_hangul

decompose_hangul("한국")
# 'ㅎㅏㄴㄱㅜㄱ'

decompose_hangul("국민")
# 'ㄱㅜㄱㅁㅣㄴ'
```

Quest'ultimo esempio conta per ciò che *non* fa: 국민 (*gungmin*,
"cittadino") si pronuncia con assimilazione nasale, `[ɡuŋmin]`, ma
`decompose_hangul` restituisce le lettere così come scritte —
`ㄱㅜㄱㅁㅣㄴ`, non assimilate — perché la scomposizione è aritmetica sul
codepoint Unicode, non una regola fonologica. Dice cosa è stato scritto,
non come suona.

**La conversione kana** si muove tra i due sillabari giapponesi, hiragana e
katakana, che rappresentano gli stessi suoni con caratteri diversi a un
offset di codepoint fisso:

```python
from scriptconv import hira_to_kana, kana_to_hira

hira_to_kana("こんにちは")
# 'コンニチハ'

kana_to_hira("カタカナ")
# 'かたかな'
```

## Perché questo vive nella propria libreria

Un phonemizer — uno strumento che indovina come si pronuncia una parola
scritta — richiede giudizio linguistico: regole d'accento, eccezioni,
pronuncia dipendente dal contesto. `scriptconv` non ha deliberatamente
nulla di tutto ciò. Ogni funzione qui sopra è una ricerca in tabella o un
calcolo su codepoint: stesso input, stesso output, nessuna congettura,
nessun modello linguistico, nulla che possa sbagliarsi su come suona
davvero una lingua specifica. È questo che lo rende sicuro da condividere
tra ogni phonemizer che ne ha bisogno, invece che ogni phonemizer
reimplementi la propria tabella ARPABET con i propri bug. Il post sullo
[stack di fonologia](/blog/2026-08-10-the-phonology-stack) copre come i
veri motori di previsione della pronuncia — quelli che portano opinioni
linguistiche — siano costruiti sopra questo strato invece di duplicarlo.

## Dove la mappatura non è esatta

Convertire tra notazioni non è sempre senza perdite, e `scriptconv`
registra questo come dato interrogabile piuttosto che lasciarlo come una
sorpresa. Ogni notazione ha due proprietà tracciate indipendentemente: se
convertirla in IPA e ritorno riproduce esattamente i simboli originali, e
se l'IPA convertito in essa e ritorno riproduce ogni simbolo IPA.

ARPABET fallisce in entrambe le direzioni: ha un inventario di fonemi
ristretto e specifico dell'inglese, quindi andare IPA → ARPABET → IPA può
perdere distinzioni che l'IPA può fare ma per cui la tabella di ARPABET non
ha alcun simbolo. X-SAMPA e Lexique coprono fedelmente l'intero inventario
IPA ma non è garantito che facciano un percorso di andata e ritorno pulito
partendo dal proprio lato. Kirshenbaum e Buckwalter fanno un percorso
pulito dal proprio lato verso l'IPA ma non il contrario. Mantoq, l'alfabeto
fonetico del fonetizzatore arabo halabi, converte solo in una direzione,
verso l'IPA — non esiste un convertitore di ritorno. Nulla di tutto ciò è
sepolto in una docstring da qualche parte; sono dati che la libreria espone
così che chi la usa possa verificare prima di dare per scontato che un
percorso di andata e ritorno sia sicuro.

---

Se state assemblando dati di pronuncia da più fonti, o avete bisogno di
rilevare le scritture e normalizzare il testo prima che raggiunga un
phonemizer, [mettetevi in contatto](/contact) o guardate cos'altro
costruiamo in questo ambito sulla [pagina servizi](/services).
