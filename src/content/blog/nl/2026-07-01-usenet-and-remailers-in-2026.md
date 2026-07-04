---
title: "Usenet & remailers in 2026: een schone tijdcapsule en een privacynetwerk dat weigert te sterven"
description: "Usenet is een ongerept archief van menselijke discussie van vóór de AI — LLM-vrije trainingsdata uit decennia internetgeschiedenis. Maar het is niet alleen archeologie: het cypherpunk-remailernetwerk werkt in 2026 nog steeds en biedt echt anoniem berichtenverkeer. We bouwden twee kleine tools om je beide te laten zien."
date: 2026-07-01
lang: nl
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

De meeste open-web-corpora zijn besmet — LLM-gegenereerde tekst is doorgelekt naar Reddit, Stack Overflow, GitHub, blogs. Usenet is anders: decennia aan flame wars, technische vraag-en-antwoord, en nieuwsgroepdiscussies, allemaal door mensen geschreven, niets ervan aangeraakt door taalmodellen. En terwijl ik erin groef, vond ik nog iets dat nog draait: **het cypherpunk-remailernetwerk werkt in 2026 nog steeds**, onderhouden door een kleine groep cryptografie-enthousiastelingen die nooit gestopt zijn.

We bouwden twee kleine Python-tools voor beide.

-----

## De tijdcapsule: Usenet als een corpus van vóór de AI

Usenet ontvangt duizenden posts per dag verspreid over honderden actieve groepen. Archiveer terug tot in de jaren 80 en je hebt **miljoenen artikelen** — elk een signaal van wat mensen werkelijk belangrijk vonden, waarover ze ruzieden, wat ze wilden weten — met een herkomst schoon genoeg om te citeren.

We bouwden een tool genaamd **usenet** die het oogsten hiervan eenvoudig maakt:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

De meeste publieke servers ondersteunen `NEWNEWS` (opvragen op datum) niet meer, dus **op groepen gebaseerd bladeren is de standaardaanpak.** Je scrapet één groep tegelijk — geen barrière, gewoon de realiteit van het protocol.

Om een nieuwsgroep in een trainingsdataset te veranderen, oogst `dataset.py` artikelen naar JSONL:

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

Eén artikel per regel. Duw er een paar duizend van naar Hugging Face en je hebt een **publiek beschikbare, door mensen geschreven dataset met een schone herkomst** die je kunt citeren en herpubliceren.

Repo: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## De cypherpunks zijn nooit weggegaan

Het remailernetwerk draait nog steeds.

**Type-I-remailers** (Cypherpunk-remailers): verstuur een bericht verpakt in geneste PGP-versleuteling — elke hop ontsleutelt één laag en stuurt door naar de volgende. Van buitenaf lijkt het bericht van de remailer te komen, niet van jou. Bij de laatste hop is de oorspronkelijke afzender verloren.

**Type-II-remailers** (Mixmaster): voegen willekeurige opvulling toe, strippen headers, houden berichten vast voor doorsturen, en ketenen tegelijk door meerdere remailers heen. Veel moeilijker te traceren.

Beide werken nog steeds. Er zijn **ruwweg een half dozijn actieve remailers** in 2026. Het pinger-netwerk plaatst dagelijks statistieken op `alt.privacy.anon-server.stats`, net zoals het al decennia doet. Per mei 2026:

- **frannie** (mix@franxial.com) — 100% uptime
- **frell** (godot@remailer.frell.eu.org) — 100% uptime
- **yeahno** (mix@yeahno.net) — 100% uptime
- **dizum** (remailer@dizum.com) — ~99% uptime
- **paranoia** (mixmaster@remailer.paranoici.org) — ~92% uptime

De bibliotheek **remailers** ontdekt het live netwerk door die dagelijkse statistiekenposts te parseren:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## Ze vandaag gebruiken

### Usenet lezen zonder account

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

### Anoniem posten

De meeste servers vereisen een gratis account om te posten. **paganini.bofh.team** en **news.tcpreset.net** accepteren anonieme posts, ook naar `alt.anonymous.messages` — de traditionele dropplek voor anonieme ontvangers.

### Een anoniem bericht versturen via de remailerketen

De remailers gebruiken nog steeds **DSA + ElGamal PGP-sleutels** uit de jaren 90 — oude crypto waarvoor moderne Python PGP-bibliotheken niet kunnen versleutelen. We schakelen uit naar **GnuPG** (de oude code is dragend):

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

### Antwoorden vinden: gehashte onderwerpen

Als je op een antwoord wacht op `alt.anonymous.messages`, wil je niet dat het onderwerp de inhoud verraadt. Het remailerprotocol ondersteunt **hSub**: de ontvanger hasht het oorspronkelijke onderwerp met SHA-256 en plaatst het antwoord met de hash als onderwerp. Alleen iemand die het oorspronkelijke onderwerp kent, kan het in de firehose identificeren.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

Voor meer privacy gebruiken sommige berichten **eSub** — versleutelde onderwerpen die alleen de ontvanger kan ontsleutelen.

-----

## Waarom dit nog steeds telt

Het remailernetwerk is traag en ontworpen voor een ander tijdperk. Maar het is **gedecentraliseerd, eigenaarloos en niet af te sluiten** — geen bedrijf om te dagvaarden, geen dienst om stop te zetten. Hetzelfde cypherpunk-ontwerp dat in 1995 werkte, werkt nog steeds.

Usenet is de zeldzamere prijs: een archief met schone herkomst van door mensen geschreven tekst op schaal. Of je nu modellen traint, datasets bouwt, of daadwerkelijk internetdiscours bestudeert, Usenet is er — schoon, onbesmet, gratis.

**Repositories:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Oogst Usenet naar trainingsdatasets; lees publiek zonder account.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — Vind live remailers, bouw anonieme ketens, verstuur via Cypherpunk Type-I.
