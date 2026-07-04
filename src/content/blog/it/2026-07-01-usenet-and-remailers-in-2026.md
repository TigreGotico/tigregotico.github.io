---
title: "Usenet e Remailer nel 2026: una capsula del tempo incontaminata e una rete per la privacy che si rifiuta di morire"
description: "Usenet è un archivio incontaminato del discorso umano pre-IA — dati di addestramento privi di LLM da decenni di storia di internet. Ma non è solo archeologia: la rete di remailer cypherpunk funziona ancora nel 2026, offrendo vera messaggistica anonima. Abbiamo costruito due piccoli strumenti per mostrarveli entrambi."
date: 2026-07-01
lang: it
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

La maggior parte dei corpora del web aperto è contaminata — il testo generato da LLM è filtrato in Reddit, Stack Overflow, GitHub, blog. Usenet è diversa: decenni di flame war, Q&A tecnici e discussioni di newsgroup, tutti scritti da esseri umani, nessuno toccato dai modelli linguistici. E mentre ci scavavo dentro, ho trovato qualcos'altro ancora in funzione: **la rete di remailer cypherpunk opera ancora nel 2026**, mantenuta da un piccolo gruppo di appassionati di crittografia che non hanno mai smesso.

Abbiamo costruito due piccoli strumenti Python per entrambe.

-----

## La Capsula del Tempo: Usenet come Corpus Pre-IA

Usenet riceve migliaia di post al giorno su centinaia di gruppi attivi. Archiviate indietro fino agli anni '80 e avete **milioni di articoli** — ognuno un segnale di ciò a cui gli esseri umani tenevano davvero, su cui discutevano, che volevano sapere — con una provenienza abbastanza pulita da poter essere citata.

Abbiamo costruito uno strumento chiamato **usenet** che rende semplice la raccolta di tutto questo:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

La maggior parte dei server pubblici non supporta più `NEWNEWS` (interrogazione per data), quindi **la navigazione per gruppo è l'approccio standard.** Si fa scraping di un gruppo alla volta — non una barriera, solo la realtà del protocollo.

Per trasformare un newsgroup in un dataset di addestramento, `dataset.py` raccoglie gli articoli in JSONL:

```
{
  "group": "comp.lang.python",
  "message_id": "<12345@example.com>",
  "subject": "Best practices for list comprehensions",
  "author": "Alice",
  "date": "1999-03-15T10:22:00Z",
  "language": "en",
  "text": "In my experience, list comprehensions are most readable when...",
}
```

Un articolo per riga. Caricatene qualche migliaio su Hugging Face e avete un **dataset disponibile pubblicamente, scritto da esseri umani e con provenienza pulita** che potete citare e ripubblicare.

Repo: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## I Cypherpunk Non se Ne Sono Mai Andati

La rete di remailer è ancora in funzione.

**I remailer di Tipo I** (remailer Cypherpunk): inviano un messaggio avvolto in cifratura PGP annidata — ogni salto decifra uno strato e lo inoltra al successivo. Dall'esterno, il messaggio sembra provenire dal remailer, non da voi. Entro il salto finale, il mittente originale è perduto.

**I remailer di Tipo II** (Mixmaster): aggiungono padding casuale, rimuovono le intestazioni, trattengono i messaggi prima di inoltrarli e li concatenano attraverso più remailer simultaneamente. Molto più difficili da tracciare.

Entrambi funzionano ancora. Ci sono **all'incirca una mezza dozzina di remailer attivi** nel 2026. La rete di pinger pubblica statistiche quotidiane su `alt.privacy.anon-server.stats`, esattamente come fa da decenni. A maggio 2026:

- **frannie** (mix@franxial.com) — uptime del 100%
- **frell** (godot@remailer.frell.eu.org) — uptime del 100%
- **yeahno** (mix@yeahno.net) — uptime del 100%
- **dizum** (remailer@dizum.com) — uptime ~99%
- **paranoia** (mixmaster@remailer.paranoici.org) — uptime ~92%

La libreria **remailers** scopre la rete attiva analizzando quei post statistici quotidiani:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## Usarli Oggi

### Leggere Usenet senza Account

```python
from usenet import UsenetServer

servers = [
    "news.neodome.net",
    "news.samoylyk.net",
    "freenews.netfront.net"
]

for server in servers:
    try:
        with UsenetServer(server) as s:
            articles = s.get_articles("alt.test", limit=5)
            print(f"Success on {server}: {len(articles)} articles")
            break
    except OSError:
        continue
```

### Pubblicare in Modo Anonimo

La maggior parte dei server richiede un account gratuito per pubblicare. **paganini.bofh.team** e **news.tcpreset.net** accettano post anonimi, incluso su `alt.anonymous.messages` — il tradizionale punto di consegna per destinatari anonimi.

### Inviare un Messaggio Anonimo tramite la Catena di Remailer

I remailer usano ancora **chiavi PGP DSA + ElGamal** degli anni '90 — vecchia crittografia verso cui le moderne librerie PGP di Python non riescono a cifrare. Ci appoggiamo a **GnuPG** (il vecchio codice è portante):

```python
from remailers.network import fetch_live_remailers, fetch_keyring_blob
from remailers.gpg import GPGKeyring
from remailers.cypherpunk import build_chain

remailers = fetch_live_remailers()

# the published keyring is full of DSA/ElGamal keys -> use the GnuPG backend
with GPGKeyring(fetch_keyring_blob()) as gpg:
    have = set(gpg.recipients())
    chain = [r for r in remailers
             if r.is_cpunk and r.accepts_pgp and r.address in have][:3]

    # nest a PGP layer per hop; the exit posts to a newsgroup
    message, entry = build_chain(
        hops=[(r.address, r.address) for r in chain],
        anon_post_to="alt.anonymous.messages",
        body="Hello from the shadows",
        encrypt=gpg.encrypt,
    )

# `message` goes to `entry` over SMTP (remailers.cypherpunk.send_chain) —
# the one piece you bring yourself: an email sender.
```

### Trovare le Risposte: Subject con Hash

Se aspettate una risposta su `alt.anonymous.messages`, non volete che il subject riveli il contenuto. Il protocollo dei remailer supporta **hSub**: il destinatario applica l'hash SHA-256 al subject originale e pubblica la risposta con l'hash come subject. Solo chi conosce il subject originale può identificarlo nel flusso.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

Per una maggiore privacy, alcuni messaggi usano **eSub** — subject cifrati che solo il destinatario può decifrare.

-----

## Perché Questo Conta Ancora

La rete di remailer è lenta e progettata per un'altra epoca. Ma è **decentralizzata, senza proprietario e impossibile da chiudere** — nessuna azienda da citare in giudizio, nessun servizio da dismettere. Lo stesso design cypherpunk che funzionava nel 1995 funziona ancora.

Usenet è il premio più raro: un archivio con provenienza pulita di testo scritto da esseri umani su larga scala. Che stiate addestrando modelli, costruendo dataset o studiando il reale discorso di internet, Usenet è lì — pulita, incorrotta, libera.

**Repository:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Raccogliete Usenet in dataset di addestramento; leggete pubblicamente senza account.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — Trovate remailer attivi, costruite catene anonime, inviate via Cypherpunk Type-I.
