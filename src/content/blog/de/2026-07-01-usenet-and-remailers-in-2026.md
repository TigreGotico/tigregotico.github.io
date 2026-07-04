---
title: "Usenet & Remailer im Jahr 2026: eine makellose Zeitkapsel und ein Datenschutznetzwerk, das sich weigert zu sterben"
description: "Usenet ist ein unberührtes Archiv des menschlichen Diskurses aus der Zeit vor der KI — LLM-freie Trainingsdaten aus Jahrzehnten der Internetgeschichte. Doch es ist nicht bloß Archäologie: Das Cypherpunk-Remailer-Netzwerk funktioniert im Jahr 2026 noch immer und bietet echte anonyme Nachrichtenübermittlung. Wir haben zwei kleine Werkzeuge gebaut, um Ihnen beides zu zeigen."
date: 2026-07-01
lang: de
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

Die meisten Korpora des offenen Webs sind kontaminiert — von LLM erzeugter Text hat sich in Reddit, Stack Overflow, GitHub und Blogs eingeschlichen. Usenet ist anders: Jahrzehnte an Flame Wars, technischen Fragen und Antworten und Newsgroup-Diskussionen, alles von Menschen geschrieben, nichts davon von Sprachmodellen berührt. Und während ich darin grub, fand ich noch etwas anderes, das immer noch läuft: **Das Cypherpunk-Remailer-Netzwerk ist im Jahr 2026 noch in Betrieb**, gepflegt von einer kleinen Gruppe von Kryptografie-Enthusiasten, die nie aufgehört haben.

Wir haben für beides zwei kleine Python-Werkzeuge gebaut.

-----

## Die Zeitkapsel: Usenet als Korpus aus der Zeit vor der KI

Usenet erhält täglich Tausende von Beiträgen in Hunderten aktiver Gruppen. Reichen Sie im Archiv bis in die 1980er-Jahre zurück, und Sie haben **Millionen von Artikeln** — jeder ein Signal dafür, was den Menschen tatsächlich am Herzen lag, worüber sie stritten, was sie wissen wollten — mit einer Herkunft, die sauber genug ist, um zitiert zu werden.

Wir haben ein Werkzeug namens **usenet** gebaut, das diese Ernte unkompliziert macht:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

Die meisten öffentlichen Server unterstützen `NEWNEWS` (Abfrage nach Datum) nicht mehr, weshalb **das gruppenbasierte Durchstöbern der Standardansatz ist.** Sie scrapen eine Gruppe nach der anderen — keine Hürde, nur die Realität des Protokolls.

Um eine Newsgroup in einen Trainingsdatensatz zu verwandeln, sammelt `dataset.py` Artikel in JSONL:

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

Ein Artikel pro Zeile. Schieben Sie ein paar Tausend davon zu Hugging Face, und Sie haben einen **öffentlich verfügbaren, von Menschen verfassten Datensatz mit sauberer Herkunft**, den Sie zitieren und weiterveröffentlichen können.

Repository: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Die Cypherpunks sind nie gegangen

Das Remailer-Netzwerk läuft noch immer.

**Typ-I-Remailer** (Cypherpunk-Remailer): senden eine Nachricht, die in verschachtelte PGP-Verschlüsselung gehüllt ist — jeder Sprung entschlüsselt eine Schicht und leitet an den nächsten weiter. Von außen betrachtet scheint die Nachricht vom Remailer zu kommen, nicht von Ihnen. Beim letzten Sprung ist der ursprüngliche Absender verloren.

**Typ-II-Remailer** (Mixmaster): fügen zufällige Auffüllung hinzu, entfernen Header, halten Nachrichten vor dem Weiterleiten zurück und verketten gleichzeitig über mehrere Remailer. Deutlich schwerer nachzuverfolgen.

Beide funktionieren noch. Es gibt im Jahr 2026 **etwa ein halbes Dutzend aktiver Remailer**. Das Pinger-Netzwerk veröffentlicht täglich Statistiken in `alt.privacy.anon-server.stats`, so wie es das seit Jahrzehnten tut. Stand Mai 2026:

- **frannie** (mix@franxial.com) — 100 % Uptime
- **frell** (godot@remailer.frell.eu.org) — 100 % Uptime
- **yeahno** (mix@yeahno.net) — 100 % Uptime
- **dizum** (remailer@dizum.com) — ~99 % Uptime
- **paranoia** (mixmaster@remailer.paranoici.org) — ~92 % Uptime

Die Bibliothek **remailers** entdeckt das aktive Netzwerk, indem sie diese täglichen Statistikbeiträge parst:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## Sie heute nutzen

### Usenet ohne Konto lesen

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

### Anonym veröffentlichen

Die meisten Server verlangen für das Veröffentlichen ein kostenloses Konto. **paganini.bofh.team** und **news.tcpreset.net** akzeptieren anonyme Beiträge, auch in `alt.anonymous.messages` — dem traditionellen Ablageort für anonyme Empfänger.

### Eine anonyme Nachricht über die Remailer-Kette senden

Die Remailer verwenden noch immer **DSA- + ElGamal-PGP-Schlüssel** aus den 1990er-Jahren — alte Kryptografie, für die moderne Python-PGP-Bibliotheken nicht verschlüsseln können. Wir greifen über die Shell auf **GnuPG** zurück (der alte Code ist tragend):

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

### Antworten finden: gehashte Betreffzeilen

Wenn Sie auf eine Antwort in `alt.anonymous.messages` warten, möchten Sie nicht, dass die Betreffzeile den Inhalt verrät. Das Remailer-Protokoll unterstützt **hSub**: Der Empfänger hasht die ursprüngliche Betreffzeile mit SHA-256 und veröffentlicht die Antwort mit dem Hash als Betreff. Nur wer die ursprüngliche Betreffzeile kennt, kann sie in der Flut identifizieren.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

Für mehr Privatsphäre verwenden manche Nachrichten **eSub** — verschlüsselte Betreffzeilen, die nur der Empfänger entschlüsseln kann.

-----

## Warum das noch immer wichtig ist

Das Remailer-Netzwerk ist langsam und wurde für eine andere Ära konzipiert. Doch es ist **dezentralisiert, herrenlos und nicht abschaltbar** — kein Unternehmen, das man vorladen könnte, kein Dienst, den man einstellen könnte. Dasselbe Cypherpunk-Design, das 1995 funktionierte, funktioniert noch immer.

Usenet ist der seltenere Preis: ein Archiv mit sauberer Herkunft von in großem Umfang von Menschen verfasstem Text. Ob Sie Modelle trainieren, Datensätze aufbauen oder den tatsächlichen Internetdiskurs studieren — Usenet ist da: sauber, unverfälscht, frei.

**Repositorys:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Ernten Sie Usenet in Trainingsdatensätze; lesen Sie öffentlich ohne Konto.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — Finden Sie aktive Remailer, bauen Sie anonyme Ketten und senden Sie via Cypherpunk Typ I.
